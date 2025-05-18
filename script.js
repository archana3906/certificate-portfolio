// This script loads 10 certificate images from the assets/certificates folder
const container = document.querySelector('.grid-container');

for (let i = 1; i <= 10; i++) {
  const img = document.createElement('img');
  img.src = `assets/certificates/cert${i}.jpg`; // you can change cert#.jpg to match your image names
  img.alt = `Certificate ${i}`;
  container.appendChild(img);
}
