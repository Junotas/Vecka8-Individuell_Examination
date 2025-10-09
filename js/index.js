import { getUserName, setUserName } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
  const existingName = getUserName();

  if (existingName) {
    window.location.href = './images.html';
    return;
  }

  const form = document.querySelector('#nameForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.querySelector('#name');
    const name = nameInput.value.trim();

    if (name.length < 2) {
      alert('');
      return;
    }

    setUserName(name);
    alert(`Namnet "${name}" har sparats!`);
    window.location.href = './images.html';
  });
});
