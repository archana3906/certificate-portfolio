const localStorageKey = "certificates";

// Modal elements
const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("openModalBtn");
const modalClose = document.getElementById("modalClose");
const modalTitle = document.getElementById("modalTitle");

const uploadForm = document.getElementById("uploadForm");
const titleInput = document.getElementById("title");
const organizedByInput = document.getElementById("organizedBy");
const statusSelect = document.getElementById("status");
const imageInput = document.getElementById("image");
const submitBtn = document.getElementById("submitBtn");

// Certificate containers
const participatedContainer = document.getElementById("participatedContainer");
const wonContainer = document.getElementById("wonContainer");

// Clear button
const clearCertificatesBtn = document.getElementById("clearCertificatesBtn");

// Scroll button
const scrollTopBtn = document.getElementById("scrollTopBtn");

let editingIndex = null; // Track certificate index when editing

// Show modal
function showModal(editing = false, data = null) {
  modal.style.display = "block";
  modal.setAttribute("aria-hidden", "false");
  if (editing) {
    modalTitle.textContent = "Update Certificate";
    submitBtn.textContent = "Update";
    // Fill inputs with existing data
    titleInput.value = data.title;
    organizedByInput.value = data.organizedBy;
    statusSelect.value = data.status;
    imageInput.value = ""; // Reset file input
  } else {
    modalTitle.textContent = "Upload Certificate";
    submitBtn.textContent = "Upload";
    uploadForm.reset();
  }
  submitBtn.disabled = false;
  editingIndex = editing ? data.index : null;
  titleInput.focus();
}

// Hide modal
function hideModal() {
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  uploadForm.reset();
  submitBtn.disabled = false;
  editingIndex = null;
}

// Get certificates from localStorage safely
function getCertificates() {
  try {
    return JSON.parse(localStorage.getItem(localStorageKey)) || [];
  } catch (e) {
    console.error("Error parsing certificates from localStorage", e);
    return [];
  }
}

// Save certificates array to localStorage
function saveCertificates(certs) {
  localStorage.setItem(localStorageKey, JSON.stringify(certs));
}

// Render certificates into containers
function renderCertificates() {
  const certs = getCertificates();

  participatedContainer.innerHTML = "";
  wonContainer.innerHTML = "";

  if (certs.length === 0) {
    participatedContainer.innerHTML = '<p class="text-muted">No certificates uploaded yet.</p>';
    wonContainer.innerHTML = '<p class="text-muted">No certificates uploaded yet.</p>';
    return;
  }

  certs.forEach((cert, index) => {
    const card = document.createElement("div");
    card.className = "certificate-card";
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Edit certificate: ${cert.title}`);

    card.innerHTML = `
      <img src="${cert.image}" alt="Certificate: ${cert.title}" />
      <div class="certificate-title">${cert.title}</div>
      <div class="certificate-organizedBy">Organized by: ${cert.organizedBy}</div>
    `;

    // On click, open modal for editing
    card.addEventListener("click", () => {
      showModal(true, { ...cert, index });
    });
    card.addEventListener("keypress", e => {
      if (e.key === "Enter" || e.key === " ") {
        showModal(true, { ...cert, index });
        e.preventDefault();
      }
    });

    if (cert.status === "participated") {
      participatedContainer.appendChild(card);
    } else if (cert.status === "won") {
      wonContainer.appendChild(card);
    }
  });
}

// Convert image file to base64 string for storage
function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// Handle form submit
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;

  const title = titleInput.value.trim();
  const organizedBy = organizedByInput.value.trim();
  const status = statusSelect.value;
  let imageData = null;

  try {
    if (imageInput.files.length > 0) {
      imageData = await readImageFile(imageInput.files[0]);
    } else if (editingIndex !== null) {
      const certs = getCertificates();
      imageData = certs[editingIndex].image;
    } else {
      alert("Please select an image.");
      submitBtn.disabled = false;
      return;
    }
  } catch (err) {
    alert("Error reading image file.");
    submitBtn.disabled = false;
    return;
  }

  let certificates = getCertificates();

  if (editingIndex !== null) {
    certificates[editingIndex] = { title, organizedBy, status, image: imageData };
  } else {
    certificates.push({ title, organizedBy, status, image: imageData });
  }

  saveCertificates(certificates);
  renderCertificates();
  hideModal();
});

// Open modal button click
openModalBtn.addEventListener("click", () => showModal(false));

// Close modal button click
modalClose.addEventListener("click", hideModal);

// Close modal on outside click
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    hideModal();
  }
});

// Clear all certificates button
clearCertificatesBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all certificates?")) {
    localStorage.removeItem(localStorageKey);
    renderCertificates();
  }
});

// Scroll to top button logic
window.addEventListener("scroll", () => {
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    scrollTopBtn.style.display = "flex";
  } else {
    scrollTopBtn.style.display = "none";
  }
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Initial render on page load
renderCertificates();
