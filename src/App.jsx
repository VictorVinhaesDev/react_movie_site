import { useState, useEffect } from "react"
import Search from "./components/Search"
import Spinner from "./components/Spinner"
import MovieCard  from "./components/MovieCard"

// "debounce" é para quando vc escrever algo no "search" para procurar os filmes, ele n fazer uma chamada para API em cada letra
import { useDebounce } from "react-use"

// serve para armazenar as preferencias de busca do nosso site para exibir nos mais procurados
import { getTrendingMovies, updateSearchCount } from "./app.write"

const API_BASE_URL = "https://api.themoviedb.org/3"
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}


function App() {
  // Nunca atribua um valor a states tipo "batata = searchTerm"
  const [searchTerm, setSearchTerm] = useState("")
  const [errorMessage, setErrorMessage] = useState('');

  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  const [trendingMovies, setTrendingMovies] = useState([]);


  // Debounce the search term to prevent making too many API requests
  // by waiting for the user to stop typing for 700ms
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 700, [searchTerm])


  async function fetchMovies(query = '') {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS)
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }
      const data = await response.json();

      if (data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }
      setMovieList(data.results || []);
      if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }

    } catch (error) {
      console.log(`Erro fetch movies ${error}`);
    }
    finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    fetchMovies(debouncedSearchTerm)
  }, [debouncedSearchTerm])



  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect(() => {
    loadTrendingMovies();
  }, []);
  return (
    <main>
      <div className="pattern" /> {/*olha uma self close tag para dar cor  */}
      <div className="wrapper">
        <header>
          {/* o import pode ser direto pois o react ja acha ele como se estivesse na pasta */}
          <img src="/hero.png" alt="hero" />
          <h1>
            Find <span className="text-gradient">Movies</span> You gonna love it
          </h1>
          {/* o setSearchTerm vc passa sem os "()" pois se não ele sera chamado assim que a page for renderizada */}
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}


        <section className="all-movies">
          <h2>All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                 <MovieCard key={movie.id} movie ={movie}/>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
export default App