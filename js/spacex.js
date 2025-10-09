import { applyGreeting } from './app.js';
import { getLatestLaunch, getUpcomingLaunches, getPastLaunches } from './api.spacex.js';

// Global state for mode, items, filter query, etc.
const state = {
  mode: 'latest', // latest | upcoming | past | failed
  items: [],
  q: '',
  loading: false,
};

// Open fullscreen lightbox for clicked image
const openFullscreen = (src, alt) => {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.innerHTML = `
    <div class="lightbox-inner"><img src="${src}" alt="${alt}"></div>
    <button class="close-btn" aria-label="Stäng">✕</button>
  `;
  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  const close = () => {
    overlay.remove();
    document.body.style.overflow = prevOverflow;
    document.removeEventListener('keydown', onKey);
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.classList.contains('close-btn')) close();
  });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(overlay);
};

// Get image URL for launch card
const cardImage = (item) => {
  const img = item.images?.[0] || item.patch || '';
  return img ? `<img src="${img}" alt="${item.name}">` : '';
};

// Render success/failure badge
const successBadge = (s) => {
  if (s === true) return '<span class="badge ok">Lyckad</span>';
  if (s === false) return '<span class="badge fail">Misslyckad</span>';
  return '<span class="badge unk">Okänt</span>';
};

// Render all launch cards
const render = (items) => {
  const grid = document.getElementById('sxGrid');
  const fmt = (d) => d ? new Date(d).toLocaleString() : '';
  const q = state.q.trim().toLowerCase();

  // Filter launches by search query
  const filtered = q
    ? items.filter(it =>
        (it.name?.toLowerCase().includes(q) ||
         it.details?.toLowerCase().includes(q)))
    : items;

  // If no results, show message
  if (!filtered.length) {
    grid.innerHTML = '<p>Inga uppdrag matchade din filtrering.</p>';
    return;
  }

  // Build HTML for launch cards
  grid.innerHTML = filtered.map((it, i) => `
    <article class="card launch-card">
      ${cardImage(it)}
      <h3>${it.name}</h3>
      <div class="meta">
        <time datetime="${it.dateUtc}">${fmt(it.dateUtc)}</time>
        ${successBadge(it.success)}
      </div>

      <div class="controls">
        ${it.webcast ? `<a href="${it.webcast}" target="_blank" rel="noopener" class="button sm">YouTube</a>` : ''}
        ${it.article ? `<a href="${it.article}" target="_blank" rel="noopener" class="button sm ghost">Artikel</a>` : ''}
        <button class="toggle" data-i="${i}">Visa/dölj</button>
      </div>

      <p class="desc" hidden>${it.details || 'Ingen beskrivning tillgänglig.'}</p>
    </article>
  `).join('');

  // Enable fullscreen image view
  grid.querySelectorAll('.launch-card img').forEach(img => {
    img.addEventListener('click', () => openFullscreen(img.src, img.alt));
  });

  // Enable toggle for description visibility
  grid.querySelectorAll('.toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.i);
      const p = grid.children[i].querySelector('.desc');
      p.hidden = !p.hidden;
    });
  });
};

// Show loading state while fetching
const setLoading = (on) => {
  const grid = document.getElementById('sxGrid');
  grid.innerHTML = on ? '<p>Laddar…</p>' : '';
};

// Fetch SpaceX data based on mode (latest, upcoming, past, failed)
const load = async () => {
  if (state.loading) return;
  state.loading = true;
  setLoading(true);
  try {
    if (state.mode === 'latest') state.items = await getLatestLaunch();
    else if (state.mode === 'upcoming') state.items = await getUpcomingLaunches(12);
    else if (state.mode === 'failed') {
      const all = await getPastLaunches(150);
      state.items = all.filter(x => x.success === false);
    } else {
      state.items = await getPastLaunches(12);
    }
    render(state.items);
  } catch (e) {
    document.getElementById('sxGrid').innerHTML = `<p>Kunde inte hämta SpaceX-data.</p>`;
    console.error(e);
  } finally {
    state.loading = false;
  }
};

// Initialize page: greeting, event listeners, initial load
document.addEventListener('DOMContentLoaded', () => {
  applyGreeting('h1');

  // Change mode (latest, upcoming, past, failed)
  document.querySelectorAll('.modebar .mode').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modebar .mode').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.mode = btn.dataset.mode;
      load();
    });
  });

  // Search launches
  const form = document.getElementById('sxSearch');
  const input = document.getElementById('sxQ');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.q = input.value || '';
    render(state.items);
  });

  // Load latest launches on startup
  document.querySelector('.modebar .mode[data-mode="latest"]').classList.add('active');
  load();
});
