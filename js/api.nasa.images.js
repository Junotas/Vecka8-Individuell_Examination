const BASE = 'https://images-api.nasa.gov';

export const searchNasaImages = async (q, page = 1) => {
  const res = await fetch(`${BASE}/search?media_type=image&q=${encodeURIComponent(q)}&page=${page}`);
  if (!res.ok) throw new Error(`NASA ${res.status}`);
  const { collection } = await res.json();
  return (collection?.items ?? [])
    .map(({ data, links }) => {
      const d = data?.[0] ?? {};
      const thumb = links?.[0]?.href ?? '';
      return {
        id: d.nasa_id || thumb,
        title: d.title || 'Untitled',
        description: d.description || '',
        date: d.date_created || '',
        thumb
      };
    })
    .filter(it => it.thumb);
};
