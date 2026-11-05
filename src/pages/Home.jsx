import { useCallback, useEffect, useState } from "react";
import BannerSlider from "../components/BannerSlider";
import MovieRow from "../components/MovieRow";
import Modal from "../components/Modal";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { usePageMeta } from "../hooks/usePageMeta";
import { useTMDB } from "../hooks/useTMDB";
import "./Home.css";

export default function Home() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeWindow, setTimeWindow] = useState("week");
  const [retryKey, setRetryKey] = useState(0);
  const { movieGenres, tvGenres, fetchTrending, fetchTrendingAnime, fetchNowPlaying, fetchCredits } = useTMDB();
  const [myList] = useLocalStorage("streamix:my-list", []);
  const [continueItems] = useLocalStorage("streamix:continue", []);
  usePageMeta({ title: "Discover movies and TV", description: "Discover trending movies, TV series, official trailers, and where to watch through licensed providers." });

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [movies, shows, anime, nowPlaying] = await Promise.all([
          fetchTrending("movie", timeWindow, options),
          fetchTrending("tv", timeWindow, options),
          fetchTrendingAnime(options),
          fetchNowPlaying(options),
        ]);
        if (controller.signal.aborted) return;
        setTrendingMovies(movies);
        setTrendingTV(shows);
        setTrendingAnime(anime);
        setNowPlayingMovies(nowPlaying);
      } catch (requestError) {
        if (!controller.signal.aborted) setError(requestError.message || "Unable to load titles right now.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [fetchNowPlaying, fetchTrending, fetchTrendingAnime, retryKey, timeWindow]);

  const handleItemClick = useCallback(async (item) => {
    const type = item.media_type === "movie" || item.release_date || item.type === "movie" ? "movie" : "tv";
    const genreMap = type === "movie" ? movieGenres : tvGenres;
    const genres = item.genre_ids?.map((genreId) => genreMap.get(genreId)).filter(Boolean) || [];
    const cast = await fetchCredits(type, item.id).catch(() => []);
    setSelectedItem({ ...item, type, genres, cast: cast.join(", ") || "N/A" });
  }, [fetchCredits, movieGenres, tvGenres]);

  if (loading) return <div className="home-page"><div className="hero-skeleton" aria-label="Loading featured titles"><span /><span /></div><div className="content-rows"><div className="row-skeleton" /><div className="row-skeleton" /></div></div>;
  if (error) return <div className="error-page"><div className="error-content"><h1>Unable to load titles</h1><p>{error}</p><button className="back-home-btn" onClick={() => setRetryKey((value) => value + 1)}>Try again</button></div></div>;

  return <div className="home-page">
    {nowPlayingMovies.length > 0 && <BannerSlider movies={nowPlayingMovies.slice(0, 10)} onItemClick={handleItemClick} />}
    <div className="time-window-toggle-container"><div className="time-window-toggle"><span className={timeWindow === "week" ? "toggle-label active" : "toggle-label"}>This Week</span><button type="button" className={`toggle-switch ${timeWindow}`} onClick={() => setTimeWindow((value) => value === "week" ? "day" : "week")} aria-label={`Switch to ${timeWindow === "week" ? "today" : "this week"} trending`} aria-pressed={timeWindow === "day"}><span className="toggle-slider" /></button><span className={timeWindow === "day" ? "toggle-label active" : "toggle-label"}>Today</span></div></div>
    <div className="content-rows">
      {continueItems.length > 0 && <MovieRow title="Continue exploring" items={continueItems} onItemClick={handleItemClick} />}
      {myList.length > 0 && <MovieRow title="My List" items={myList} onItemClick={handleItemClick} />}
      {nowPlayingMovies.length > 0 && <MovieRow title="Now Playing" items={nowPlayingMovies.slice(0, 12)} onItemClick={handleItemClick} rowType="movie" />}
      {trendingMovies.length > 0 && <MovieRow title={`Trending Movies ${timeWindow === "day" ? "Today" : "This Week"}`} items={trendingMovies.slice(0, 18)} onItemClick={handleItemClick} rowType="movie" />}
      {trendingTV.length > 0 && <MovieRow title={`Trending TV ${timeWindow === "day" ? "Today" : "This Week"}`} items={trendingTV.slice(0, 18)} onItemClick={handleItemClick} rowType="tv" />}
      {trendingAnime.length > 0 && <MovieRow title="Trending Anime" items={trendingAnime.slice(0, 12)} onItemClick={handleItemClick} />}
    </div>
    {selectedItem && <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />}
  </div>;
}
