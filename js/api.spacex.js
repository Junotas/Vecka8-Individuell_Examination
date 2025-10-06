const BASE = 'https://api.spacexdata.com/v5';

const mapLaunch = (l) => ({
  id: l.id,
  name: l.name || 'Untitled',
  dateUtc: l.date_utc,
  success: l.success, // true|false|null
  details: l.details || '',
  patch: l.links?.patch?.large || l.links?.patch?.small || '',
  images: Array.isArray(l.links?.flickr?.original) ? l.links.flickr.original : [],
  webcast: l.links?.webcast || '',
  article: l.links?.article || '',
});

export const getLatestLaunch = async () => {
  const res = await fetch(`${BASE}/launches/latest`);
  if (!res.ok) throw new Error(`SpaceX ${res.status}`);
  const l = await res.json();
  return [mapLaunch(l)]; // normalisera som lista
};

export const getUpcomingLaunches = async (limit = 12) => {
  const res = await fetch(`${BASE}/launches/upcoming`);
  if (!res.ok) throw new Error(`SpaceX ${res.status}`);
  const arr = await res.json();
  arr.sort((a, b) => new Date(a.date_utc) - new Date(b.date_utc)); // närmast först
  return arr.slice(0, limit).map(mapLaunch);
};

export const getPastLaunches = async (limit = 12) => {
  const res = await fetch(`${BASE}/launches/past`);
  if (!res.ok) throw new Error(`SpaceX ${res.status}`);
  const arr = await res.json();
  arr.sort((a, b) => new Date(b.date_utc) - new Date(a.date_utc)); // senaste först
  return arr.slice(0, limit).map(mapLaunch);
};
