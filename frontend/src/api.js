const BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export function getTrendingMovies() {
  return fetch(`${BASE}/api/trending-movies`)
    .then(res => res.json());
}

export function updateSearchCount(query, topMovie) {
  return fetch(`${BASE}/api/search-count`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, topMovie })
  });
}