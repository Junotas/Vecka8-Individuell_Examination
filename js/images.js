import { applyGreeting } from './app.js';
import { searchNasaImages } from './api.nasa.images.js';

// Global state for current data, user reactions, query, etc.
const state = {
  items: [],
  reactions: JSON.parse(localStorage.getItem('reactions') || '{}'),
  q: 'nebula',
  page: 1,
  loading: false,
};

// Save reactions (thumbs up/down) to localStorage
const saveReactions = () =>
  localStorage.setItem('reactions', JSON.stringify(state.reactions));

// Open a fullscreen lightbox for clicked image
const openFullscreen = (src, alt) => {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.innerHTML = `
    <div class="lightbox-inner">
      <img src="${src}" alt="${alt}">
    </div>
    <button class="close-btn" aria-label="Stäng">✕</button>
  `;

  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  // Close the fullscreen view
  const close = () => {
    overlay.remove();
    document.body.style.overflow = prevOverflow;
    document.removeEventListener('keydown', onKey);
  };
  // Allow ESC key to close fullscreen
  const onKey = (e) => { if (e.key === 'Escape') close(); };

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.classList.contains('close-btn')) close();
  });
  document.addEventListener('keydown', onKey);

  document.body.appendChild(overlay);
};

// Render all image cards to the DOM
const render = (items) => {
  const grid = document.querySelector('#grid');
  grid.innerHTML = items.map((it, i) => {
    const r = state.reactions[it.id] || null;
    return `
      <article class="card">
        <img src="${it.thumb}" alt="${it.title}">
        <h3>${it.title}</h3>

        <div class="controls">
          <button class="vote up ${r === 'up' ? 'active' : ''}" data-key="${it.id}" data-vote="up" aria-pressed="${r === 'up'}">👍</button>
          <button class="vote down ${r === 'down' ? 'active' : ''}" data-key="${it.id}" data-vote="down" aria-pressed="${r === 'down'}">👎</button>
          <button class="toggle" data-i="${i}">Visa/dölj</button>
        </div>

        <p class="desc" hidden>${it.description}</p>
        <time datetime="${it.date}">${it.date ? new Date(it.date).toLocaleDateString() : ''}</time>
      </article>
    `;
  }).join('');

  // Enable fullscreen when clicking an image
  grid.querySelectorAll('img').forEach(img => {
    img.addEventListener('click', () => openFullscreen(img.src, img.alt));
  });

  // Enable like/dislike with tri-state toggle
  grid.querySelectorAll('.vote').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const vote = btn.dataset.vote;
      let current = state.reactions[key] || null;
      if (current === vote) delete state.reactions[key];
      else state.reactions[key] = vote;
      saveReactions();
      render(state.items);
    });
  });

  // Toggle description visibility
  grid.querySelectorAll('.toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.i);
      const p = grid.children[i].querySelector('.desc');
      p.hidden = !p.hidden;
    });
  });
};

// Show a loading message while waiting for data
const setLoading = (on) => {
  const grid = document.querySelector('#grid');
  grid.innerHTML = on ? '<p>Laddar…</p>' : '';
};

// Fetch data from NASA API and render it
const loadAndRender = async (q, page = 1) => {
  state.loading = true;
  setLoading(true);
  try {
    state.items = await searchNasaImages(q, page);
    render(state.items);
  } catch {
    document.querySelector('#grid').innerHTML = `<p>Kunde inte hämta data. Försök igen.</p>`;
  } finally {
    state.loading = false;
  }
};

// Run when the page is ready
document.addEventListener('DOMContentLoaded', () => {
  applyGreeting('#welcome');
  const form = document.querySelector('#searchForm');
  const input = document.querySelector('#q');

  // Handle search form submit
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = (input?.value || '').trim() || 'nebula';
    state.q = q;
    state.page = 1;
    loadAndRender(state.q, state.page);
  });

  // Initial load
  loadAndRender(state.q, state.page);
});
