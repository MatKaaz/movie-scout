const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = process.env.TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

export async function tmdb_query (query) {
    const endpoint = query
    ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
    : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

    try {
        const r = await fetch(endpoint, API_OPTIONS);
        
        if (!r.ok) {
            throw new Error(`HTTP error! Status: ${r.status}`);
        }

        const data = await r.json();
        return data;
    } catch (error) {
        throw error;
    }
}