const setCurrentYear = () => {
  const yearSpan = document.querySelector('#year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
};

const getUserName = () => localStorage.getItem('userName') || '';

const setUserName = (name) => {
  if (!name || name.trim().length < 1) return;
  localStorage.setItem('userName', name.trim());
};

const applyGreeting = (selector = '#welcome') => {
  const el = document.querySelector(selector);
  if (el) {
    const name = getUserName();
    el.textContent = name ? `Välkommen, ${name}!` : 'Välkommen!';
  }
};

const clearUserName = () => localStorage.removeItem('userName');

const highlightActiveNav = () => {
  const links = document.querySelectorAll('nav a');
  links.forEach((link) => {
    if (link.href === window.location.href) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  setCurrentYear();
  highlightActiveNav();

  const resetBtn = document.getElementById('resetName');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      clearUserName();
      window.location.href = './index.html';
    });
  }
});

export { getUserName, setUserName, applyGreeting };
