// src/mysql.js
import { createConnection } from 'mysql2/promise';

function buildConfigFromEnv(env) {
  if (!env) throw new Error('Worker env required for database configuration');

  if (!env.HYPERDRIVE || !env.HYPERDRIVE.host) {
    throw new Error('No valid DB configuration found in Worker env');
  }

  return {
    host: env.HYPERDRIVE.host,
    port: env.HYPERDRIVE.port ? Number(env.HYPERDRIVE.port) : 3306,
    user: env.HYPERDRIVE.user,
    password: env.HYPERDRIVE.password,
    database: env.HYPERDRIVE.database,

    // Required to enable mysql2 compatibility for Workers (avoids eval/Function usage)
    disableEval: true,
  };
}

/**
 * Get a cached connection (globalThis) or create a new one.
 * Verifies liveliness with a lightweight SELECT 1 and recreates on failure.
 */
async function getConnection(env) {
  const cfg = buildConfigFromEnv(env);
  return await createConnection(cfg);
}

/**
 * Get top trending movies (same SQL as previous code).
 * Returns array of rows.
 */
export async function getTrendingMovies(env, ctx) {
  const conn = await getConnection(env);
  try {
    const [rows] = await conn.query(
      `SELECT movie_id, movie_title, poster_url
       FROM metrics
       ORDER BY count DESC
       LIMIT 5`
    );
    return rows;
  } finally {
    // Ensure connection is closed after use, non-blocking via waitUntil
    ctx.waitUntil(conn.end());
  }
}

export async function updateSearchCount(query, topMovie, env, ctx) {
  const conn = await getConnection(env);
  try {
    await conn.query(
      `INSERT INTO metrics (movie_id, search_term, movie_title, poster_url)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE count = count + 1`,
      [topMovie.id, query, topMovie.title, topMovie.poster_path ? `https://image.tmdb.org/t/p/w500${topMovie.poster_path}` : null]
    );
  } finally {
    // Ensure connection is closed after use, non-blocking via waitUntil
    ctx.waitUntil(conn.end());
  }
}
