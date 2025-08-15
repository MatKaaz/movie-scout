import { useEffect, useState } from 'react'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount, queryTMDB } from './api.js';


const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('');

  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [trendingSearches, setTrendingSearches] = useState([]);
  const [movieListHeader, setMovieListHeader] = useState("Trending Today")

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');
    setMovieListHeader("Trending Today");

    try {
      const data = await queryTMDB(query);

      if(data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }

      if (query) {
        if (data.results.length > 0) {
          setMovieListHeader(`Results for "${query}"`);
          data.results.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
  
          updateSearchCount(query, data.results[0])
            .catch(err => console.error("Failed to update search count:", err));
        } else if (data.results.length === 0) {
          setMovieListHeader(`No Results for "${query}"`);
        }
      }

      setMovieList(data.results || []);
      
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingSearches(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern"/>

      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1>Discover and Search <span className="text-gradient">Movies</span> Quick and Easy</h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingSearches.length > 0 && (
          <section className="trending">
            <h2>Most Popular Searches this Month</h2>

            <ul>
              {trendingSearches.map((movie, index) => (
                <li key={movie.movie_id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.movie_title} title={movie.movie_title}/>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>{movieListHeader}</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
