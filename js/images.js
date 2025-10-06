import { applyGreeting } from './app.js';
import { searchNasaImages } from './api.nasa.images.js';

const state = {
  items: [],
  reactions: JSON.parse(localStorage.getItem('reactions') || '{}'), // { [id]: 'up' | 'down' }
  q: 'nebula',
  page: 1,
  loading: false,
};

const saveReactions = () =>
  localStorage.setItem('reactions', JSON.stringify(state.reactions));

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

  // Hantera reaktioner
  grid.querySelectorAll('.vote').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      const vote = btn.dataset.vote; // 'up' | 'down'
      const current = state.reactions[key] || null;

      if (current === vote) {
        delete state.reactions[key]; // samma knapp igen = ta bort röst
      } else {
        state.reactions[key] = vote;
      }

      saveReactions();
      render(state.items); // rendera om för att uppdatera UI
    });
  });

  // Visa/dölj beskrivning
  grid.querySelectorAll('.toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.i);
      const p = grid.children[i].querySelector('.desc');
      p.hidden = !p.hidden;
    });
  });
};

const setLoading = (on) => {
  const grid = document.querySelector('#grid');
  grid.innerHTML = on ? '<p>Laddar…</p>' : '';
};

const loadAndRender = async (q, page = 1) => {
  state.loading = true;
  setLoading(true);
  try {
    state.items = await searchNasaImages(q, page);
    render(state.items);
  } catch (e) {
    document.querySelector('#grid').innerHTML = `<p>Kunde inte hämta data. Försök igen.</p>`;
  } finally {
    state.loading = false;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  applyGreeting('#welcome');

  const form = document.querySelector('#searchForm');
  const input = document.querySelector('#q');

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = (input?.value || '').trim() || 'nebula';
    state.q = q;
    state.page = 1;
    loadAndRender(state.q, state.page);
  });

  loadAndRender(state.q, state.page);
});
