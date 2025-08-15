import './config.js'
import express from 'express';
import cors from 'cors';
import { updateSearchCount, getTrendingMovies } from './mysql.js';
import { tmdb_query } from './tmdb.js';

const app = express();
app.use(cors(), express.json());

app.get('/api/trending-movies', async (req, res) => {
  try {
    const movies = await getTrendingMovies();
    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load trending movies' });
  }
});

app.post('/api/search-count', async (req, res) => {
  try {
    const { query, topMovie } = req.body;
    await updateSearchCount(query, topMovie);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update search count' });
  }
});

app.get('/api/query-tmdb', async (req, res) => {
  try {
    const { query } = req.query;
    const movies = await tmdb_query(query);
    res.json(movies);
  } catch (err) {
    console.error("Failed to fetch movies from TMDB: ", err);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

app.get('/health', (req,res) => res.json({ok:true}));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on port ${port}`));
