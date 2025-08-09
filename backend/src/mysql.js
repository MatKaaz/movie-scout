import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, '../.env.local'),
});


const connection = await mysql.createConnection({
  host:     process.env.MYSQL_HOST,
  port:     process.env.MYSQL_PORT,
  user:     process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});



export async function updateSearchCount(searchTerm, movie) {
  const [rows] = await connection.execute(
    `SELECT count FROM metrics WHERE search_term = ?`,
    [searchTerm]
  );

  if (rows.length > 0) {
    await connection.execute(
      `UPDATE metrics
         SET count = count + 1
       WHERE search_term = ?`,
      [searchTerm]
    );
  } else {
    await connection.execute(
      `INSERT INTO metrics
         (search_term, movie_id, poster_url)
       VALUES (?, ?, ?)`,
      [
        searchTerm,
        movie.id,
        `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      ]
    );
  }
}

export async function getTrendingMovies() {
  const [rows] = await connection.execute(
    `SELECT
       search_term,
       movie_id,
       poster_url,
       count
     FROM metrics
     ORDER BY count DESC
     LIMIT 5`
  );
  return rows;
}
