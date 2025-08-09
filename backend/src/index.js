import express from 'express';
import cors from 'cors';
import { updateSearchCount, getTrendingMovies } from './mysql.js';

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

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on port ${port}`));
