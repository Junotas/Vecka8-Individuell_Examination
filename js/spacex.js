import { applyGreeting } from './app.js';
import { getLatestLaunch, getUpcomingLaunches, getPastLaunches } from './api.spacex.js';

const state = {
  mode: 'latest', // 'latest' | 'upcoming' | 'past'
  items: [],
  q: '',
  loading: false,
};

// Lightbox (återanvänd mönster från images/rovers)
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

const cardImage = (item) => {
  const img = item.images?.[0] || item.patch || '';
  return img ? `<img src="${img}" alt="${item.name}">` : '';
};

const successBadge = (s) => {
  if (s === true) return '<span class="badge ok">Lyckad</span>';
  if (s === false) return '<span class="badge fail">Misslyckad</span>';
  return '<span class="badge unk">Okänt</span>';
};

const render = (items) => {
  const grid = document.getElementById('sxGrid');
  const fmt = (d) => d ? new Date(d).toLocaleString() : '';

  // client-filter
  const q = state.q.trim().toLowerCase();
  const filtered = q
    ? items.filter(it => (it.name?.toLowerCase().includes(q) || it.details?.toLowerCase().includes(q)))
    : items;

  if (!filtered.length) {
    grid.innerHTML = '<p>Inga uppdrag matchade din filtrering.</p>';
    return;
  }

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

  // events
  grid.querySelectorAll('.launch-card img').forEach(img => {
    img.addEventListener('click', () => openFullscreen(img.src, img.alt));
  });
  grid.querySelectorAll('.toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.i);
      const p = grid.children[i].querySelector('.desc');
      p.hidden = !p.hidden;
    });
  });
};

const setLoading = (on) => {
  const grid = document.getElementById('sxGrid');
  grid.innerHTML = on ? '<p>Laddar…</p>' : '';
};

const load = async () => {
  if (state.loading) return;
  state.loading = true;
  setLoading(true);
  try {
    if (state.mode === 'latest') state.items = await getLatestLaunch();
    else if (state.mode === 'upcoming') state.items = await getUpcomingLaunches(12);
    else state.items = await getPastLaunches(12);
    render(state.items);
  } catch (e) {
    document.getElementById('sxGrid').innerHTML = `<p>Kunde inte hämta SpaceX-data.</p>`;
    console.error(e);
  } finally {
    state.loading = false;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  applyGreeting('h1');

  // mode-knappar
  document.querySelectorAll('.modebar .mode').forEach(btn => {
    btn.addEventListener('click', () => {
      state.mode = btn.dataset.mode;
      load();
    });
  });

  // enkel textfilter
  const form = document.getElementById('sxSearch');
  const input = document.getElementById('sxQ');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.q = input.value || '';
    render(state.items);
  });

  // första laddningen
  load();
});
