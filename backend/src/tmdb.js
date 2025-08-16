const API_BASE_URL = 'https://api.themoviedb.org/3';

export async function tmdb_query(query, env) {
  if (!env || !env.TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY must be provided in the Worker env');
  }

  const headers = {
    accept: 'application/json',
    Authorization: `Bearer ${env.TMDB_API_KEY}`,
  };

  const endpoint = query
    ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
    : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

  const res = await fetch(endpoint, { method: 'GET', headers });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`TMDB error ${res.status}: ${txt}`);
  }
  return res.json();
}
