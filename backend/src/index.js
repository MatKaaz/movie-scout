import { getTrendingMovies, updateSearchCount } from './mysql.js';
import { tmdb_query } from './tmdb.js';

// CORS helper — restrict origin in production
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders() });
      }

      if (pathname === '/api/trending-movies' && request.method === 'GET') {
        const rows = await getTrendingMovies(env, ctx);     // env required
        return new Response(JSON.stringify(rows), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      if (pathname === '/api/search-count' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const { query, topMovie } = body;
        await updateSearchCount(query, topMovie, env, ctx); // env required
        return new Response(null, { status: 204, headers: corsHeaders() });
      }

      if (pathname === '/api/query-tmdb' && request.method === 'GET') {
        const q = url.searchParams.get('query') || '';
        const data = await tmdb_query(q, env); // env required
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      if (pathname === '/health' && request.method === 'GET') {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
      
    } catch (err) {
      console.error('Worker handler error:', err);
      return new Response(JSON.stringify({ error: err?.message || 'Internal error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
