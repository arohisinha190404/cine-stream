import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Clapperboard, Search, Heart, Sparkles, Film, LoaderCircle, Popcorn } from 'lucide-react';
import { getPopularMovies, searchMovies } from './api/tmdb.js';
import MovieCard from './components/MovieCard.jsx';

const FAVORITES_KEY = 'cine-stream-favorites';

function readFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function App() {
  const [favorites, setFavorites] = useState(readFavorites);
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mood, setMood] = useState('');
  const [moodLoading, setMoodLoading] = useState(false);
  const [moodError, setMoodError] = useState('');
  const [moodMessage, setMoodMessage] = useState('');
  const sentinelRef = useRef(null);
  const requestId = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();
  const isFavoritesPage = location.pathname === '/favorites';

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const loadPage = useCallback(async ({ search = '', pageNumber = 1, append = false, signal } = {}) => {
    const id = ++requestId.current;
    setLoading(true);
    setError('');
    try {
      const data = search
        ? await searchMovies(search, pageNumber, signal)
        : await getPopularMovies(pageNumber, signal);
      if (id !== requestId.current) return;
      setMovies((previous) => append ? [...previous, ...(data.results || [])] : (data.results || []));
      setPage(data.page || pageNumber);
      setTotalPages(Math.min(data.total_pages || 1, 500));
    } catch (err) {
      if (err.name !== 'AbortError' && id === requestId.current) setError(err.message || 'Something went wrong.');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isFavoritesPage) return undefined;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const trimmed = query.trim();
      setActiveQuery(trimmed);
      setPage(1);
      loadPage({ search: trimmed, pageNumber: 1, signal: controller.signal });
    }, 500);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, isFavoritesPage, loadPage]);

  useEffect(() => {
    if (isFavoritesPage) return undefined;
    const node = sentinelRef.current;
    if (!node || loading || page >= totalPages) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !loading) {
        loadPage({ search: activeQuery, pageNumber: page + 1, append: true });
      }
    }, { rootMargin: '300px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [activeQuery, isFavoritesPage, loadPage, loading, page, totalPages]);

  const toggleFavorite = (movie) => {
    setFavorites((previous) => previous.some((item) => item.id === movie.id)
      ? previous.filter((item) => item.id !== movie.id)
      : [...previous, movie]);
  };

  const runMoodMatcher = async (event) => {
    event.preventDefault();
    if (!mood.trim()) return;
    setMoodLoading(true);
    setMoodError('');
    setMoodMessage('');
    try {
      const response = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: mood.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Mood Matcher is unavailable.');
      const title = String(data.title || '').trim();
      if (!title) throw new Error('No movie title was suggested. Try another mood.');
      setQuery(title);
      setMoodMessage(`Searching for: ${title}`);
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setMoodError(err.message || 'Mood Matcher works after deploying the included serverless API with GEMINI_API_KEY configured.');
    } finally {
      setMoodLoading(false);
    }
  };

  const shownMovies = isFavoritesPage ? favorites : movies;

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand" onClick={() => { setQuery(''); setMoodMessage(''); }}>
          <span className="brand-mark"><Clapperboard size={22} /></span>
          <span>CINE<span className="brand-accent">STREAM</span></span>
        </Link>
        <nav className="nav-links">
          <Link className={!isFavoritesPage ? 'nav-link selected' : 'nav-link'} to="/">Discover</Link>
          <Link className={isFavoritesPage ? 'nav-link selected' : 'nav-link'} to="/favorites">
            <Heart size={16} /> Favorites <span className="count">{favorites.length}</span>
          </Link>
        </nav>
      </header>

      {!isFavoritesPage && (
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT FAVORITE FILM</span>
            <h1>Find your next<br /><span>great story.</span></h1>
            <p>Explore popular movies, discover hidden gems, and build your personal watchlist.</p>
            <form className="search-bar" onSubmit={(event) => event.preventDefault()}>
              <Search size={20} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search movies..." aria-label="Search movies" />
              {query && <button type="button" className="clear-search" onClick={() => setQuery('')}>Clear</button>}
            </form>
            <form className="mood-form" onSubmit={runMoodMatcher}>
              <Sparkles size={18} />
              <input value={mood} onChange={(event) => setMood(event.target.value)} placeholder="Tell us your mood..." aria-label="Describe your mood" maxLength={500} />
              <button type="submit" disabled={moodLoading || !mood.trim()}>{moodLoading ? <LoaderCircle className="spin" size={16} /> : 'Match mood'}</button>
            </form>
            {moodMessage && <p className="inline-success">{moodMessage}</p>}
            {moodError && <p className="inline-error">{moodError}</p>}
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
            <div className="film-card film-card-back"><Film size={42} /></div>
            <div className="film-card film-card-front"><Popcorn size={50} /><span>NOW SHOWING</span><strong>YOUR NEXT<br />ADVENTURE</strong></div>
            <div className="floating-star star-one">✦</div><div className="floating-star star-two">✧</div>
          </div>
        </section>
      )}

      <main className="main-content">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{isFavoritesPage ? 'YOUR COLLECTION' : activeQuery ? 'SEARCH RESULTS' : 'CURATED FOR YOU'}</span>
            <h2>{isFavoritesPage ? 'My Favorites' : activeQuery ? `Results for “${activeQuery}”` : 'Popular right now'}</h2>
          </div>
          <span className="result-count">{shownMovies.length} {shownMovies.length === 1 ? 'movie' : 'movies'}</span>
        </div>

        {error && !isFavoritesPage && (
          <div className="error-panel"><strong>Couldn’t load movies</strong><p>{error}</p><button onClick={() => loadPage({ search: activeQuery, pageNumber: 1 })}>Try again</button></div>
        )}

        {isFavoritesPage && favorites.length === 0 ? (
          <div className="empty-state"><div className="empty-icon"><Heart size={28} /></div><h3>Your watchlist starts here</h3><p>Tap the heart on any movie to save it here. Your favorites stay saved after a reload.</p><Link to="/" className="primary-link">Explore movies</Link></div>
        ) : (
          <>
            <div className="movie-grid">
              {shownMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} isFavorite={favorites.some((item) => item.id === movie.id)} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
            {!isFavoritesPage && <div ref={sentinelRef} className="scroll-sentinel" aria-hidden="true" />}
            {!isFavoritesPage && loading && <div className="loading-state"><LoaderCircle className="spin" size={20} /> Loading movies...</div>}
            {!isFavoritesPage && !loading && !error && movies.length === 0 && activeQuery && <div className="empty-state compact"><h3>No movies found</h3><p>Try a different title or spelling.</p></div>}
            {isFavoritesPage && favorites.length > 0 && <p className="favorites-note">Saved on this device using localStorage.</p>}
            {!isFavoritesPage && !loading && page >= totalPages && movies.length > 0 && <p className="end-message">You’re all caught up. Enjoy the show.</p>}
          </>
        )}
      </main>
      <footer className="footer"><span className="footer-brand"><Clapperboard size={17} /> CINESTREAM</span><span>Movie data provided by TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.</span></footer>
    </div>
  );
}

export default App;
