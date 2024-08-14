
import React, {useState, useEffect} from 'react';
import './App.css';

const API_KEY = process.env.REACT_APP_OMDB_API_KEY;
// console.log(API_KEY);
const API_URL = `http://www.omdbapi.com/?apikey=${API_KEY}&`;


function App() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // アプリが最初にロードされたときにお気に入りをローカルストレージから読み込む
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(savedFavorites);
  }, []);

  // お気に入りが更新されるたびにローカルストレージに保存する
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim() === '') return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}s=${query}`);
      const data = await response.json();

      if (data.Response === 'True') {
        setMovies(data.Search);
      } else {
        setMovies([]);
        setError('検索結果が見つかりませんでした。');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMovies([]);
      setError('データの取得中にエラーが発生しました。');
    }

    setLoading(false);
  };

  const fetchMovieDetails = async (id) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}i=${id}`);
      const data = await response.json();

      if (data.Response === 'True') {
        setSelectedMovie(data);
      } else {
        setSelectedMovie(null);
        setError('映画の詳細情報が取得できませんでした。');
      }
    } catch (error) {
      console.error('Error fetching movie details:', error);
      setSelectedMovie(null);
      setError('映画の詳細情報の取得中にエラーが発生しました。');
    }

    setLoading(false);
  };

  const addToFavorites = (movie) => {
    if (!favorites.some((fav) => fav.imdbID === movie.imdbID)) {
      setFavorites([...favorites, movie]);
    }
  };

  const removeFromFavorites = (id) => {
    setFavorites(favorites.filter((movie) => movie.imdbID !== id));
  };

  const handleMovieClick = (id) => {
    fetchMovieDetails(id);
  };

  return (
    <div className="App">
      <h1>映画検索アプリ</h1>
      <form onSubmit={handleSearch}>
        <input 
          type="text" 
          value={query} 
          onChange={handleInputChange} 
          placeholder="映画のタイトルを入力"
        />
        <button type="submit">検索</button>
      </form>
      <div>
        {loading ? (
          <p>検索中...</p>
        ) : error ? (
          <p>{error}</p>
        ) : selectedMovie ? (
          <div>
            <h2>{selectedMovie.Title} ({selectedMovie.Year})</h2>
            <img src={selectedMovie.Poster} alt={selectedMovie.Title} />
            <p>{selectedMovie.Plot}</p>
            <button onClick={() => addToFavorites(selectedMovie)}>お気に入りに追加</button>
            <button onClick={() => setSelectedMovie(null)}>戻る</button>
          </div>
        ) : (
          <div className="movie-grid">
            {movies.map((movie) => (
              <div className="movie-item" key={movie.imdbID} onClick={() => handleMovieClick(movie.imdbID)}>
                <h2>{movie.Title} ({movie.Year})</h2>
                <img src={movie.Poster} alt={movie.Title} />
                <button onClick={(e) => { e.stopPropagation(); addToFavorites(movie); }}>お気に入りに追加</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="favorites">
        <h2>お気に入りの映画</h2>
        <ul>
          {favorites.map((movie) => (
            <li key={movie.imdbID}>
              <h2>{movie.Title} ({movie.Year})</h2>
              <img src={movie.Poster} alt={movie.Title} />
              <button onClick={() => removeFromFavorites(movie.imdbID)}>お気に入りから削除</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
    
}

export default App;