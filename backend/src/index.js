import { getTrendingMovies, updateSearchCount, resetMetrics } from './mysql.js';
import { tmdb_query } from './tmdb.js';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://movie-scout.pages.dev',
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
        const rows = await getTrendingMovies(env, ctx);
        return new Response(JSON.stringify(rows), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        });
      }

      if (pathname === '/api/search-count' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const { query, topMovie } = body;
        await updateSearchCount(query, topMovie, env, ctx);
        return new Response(null, { status: 204, headers: corsHeaders() });
      }

      if (pathname === '/api/query-tmdb' && request.method === 'GET') {
        const q = url.searchParams.get('query') || '';
        const data = await tmdb_query(q, env);
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
      console.error('Worker fetch handler error:', err);
      return new Response(JSON.stringify({ error: err?.message || 'Internal error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },

  async scheduled(controller, env, ctx) {
    try {
      ctx.waitUntil(resetMetrics(env, ctx));
    } catch (err) {
      console.error('Worker scheduled handler error:', err?.message);
    }
  },
};
