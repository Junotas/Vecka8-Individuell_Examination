// js/images.js
import { applyGreeting } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
  // Hälsning från localStorage (visas i <h1 id="welcome">)
  applyGreeting('#welcome');

  // placeholder till vidare
  const grid = document.querySelector('#grid');
  grid.innerHTML = `
    <p>Skriv ett sökord ovan för att hämta bilder från NASA:s bildarkiv.</p>
  `;
});
