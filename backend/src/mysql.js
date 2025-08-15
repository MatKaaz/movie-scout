import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


if (process.env.NODE_ENV !== 'production') {
  dotenv.config({
    path: path.resolve(__dirname, '../.env.local'),
  });
}


export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 5,
});

// schedule: check for reset every hour (ms)
const MS = 60 * 60 * 1000;
setInterval(resetMetricsMonthly, MS);
resetMetricsMonthly();

async function resetMetricsMonthly() {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [rows] = await pool.execute(
        'SELECT last_reset_date FROM metrics_reset_log WHERE id = 1'
    );

    if (rows.length === 0) {
        console.log('No reset log found. Creating initial entry...');
        await pool.execute(
            'INSERT INTO metrics_reset_log (id, last_reset_date) VALUES (1, ?)',
            [now]
        );
        return;
    }
    
    const lastResetDate = new Date(rows[0].last_reset_date);

    const lastResetYear = lastResetDate.getFullYear();
    const lastResetMonth = lastResetDate.getMonth() + 1;

    if (currentYear > lastResetYear || lastResetMonth > currentMonth) {
        console.log(`Metrics table reset: ${lastResetMonth} → ${currentMonth}`);
        await pool.execute(
            'UPDATE metrics_reset_log SET last_reset_date = ? WHERE id = 1',
            [now]
        );

    } else {
        console.log(`Metrics table already reset for month ${currentMonth + 1}`);
    }
  } catch (error) {
    console.log(error)
  }
}

export async function updateSearchCount(query, topMovie) {
  await pool.execute(
    `INSERT INTO metrics (movie_id, search_term, movie_title, poster_url)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE count = count + 1`,
    [topMovie.id, query, topMovie.title, `https://image.tmdb.org/t/p/w500${topMovie.poster_path}` || null]
  );
}

export async function getTrendingMovies() {
  const [rows] = await pool.execute(
    `SELECT
       movie_id,
       movie_title,
       poster_url
     FROM metrics
     ORDER BY count DESC
     LIMIT 5`
  );
  return rows;
}
