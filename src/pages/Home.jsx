import React, { useState, useEffect } from "react";
import BannerSlider from "../components/BannerSlider";
import MovieRow from "../components/MovieRow";
import Modal from "../components/Modal";
import { useTMDB } from "../hooks/useTMDB";
import "./Home.css";

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeWindow, setTimeWindow] = useState("week");

  const {
    movieGenres,
    tvGenres,
    fetchTrending,
    fetchTrendingAnime,
    fetchNowPlaying,
    searchTMDB,
    fetchCredits,
  } = useTMDB();

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (!loading) {
      updateTrendingData();
    }
  }, [timeWindow]);

  const initializeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [movies, tvShows, anime, nowPlaying] = await Promise.all([
        fetchTrending("movie", timeWindow),
        fetchTrending("tv", timeWindow),
        fetchTrendingAnime(),
        fetchNowPlaying(),
      ]);

      setTrendingMovies(movies);
      setTrendingTV(tvShows);
      setTrendingAnime(anime);
      setNowPlayingMovies(nowPlaying);
    } catch (err) {
      console.error("Failed to initialize data:", err);
      setError(
        err?.message ||
          "Unable to load Streamix content right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateTrendingData = async () => {
    try {
      const [movies, tvShows] = await Promise.all([
        fetchTrending("movie", timeWindow),
        fetchTrending("tv", timeWindow),
      ]);

      setTrendingMovies(movies);
      setTrendingTV(tvShows);
    } catch (error) {
      console.error("Failed to update trending data:", error);
    }
  };

  const handleTimeWindowToggle = () => {
    setTimeWindow((prev) => (prev === "week" ? "day" : "week"));
  };

  const handleItemClick = async (item) => {
    const type =
      item.media_type === "movie" || item.release_date ? "movie" : "tv";
    const genreMap = type === "movie" ? movieGenres : tvGenres;
    const genreNames =
      item.genre_ids?.map((id) => genreMap.get(id)).filter(Boolean) || [];

    const cast = await fetchCredits(type, item.id);

    setSelectedItem({
      ...item,
      type,
      genres: genreNames,
      cast: cast.join(", ") || "N/A",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };



  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading Streamix...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-page">
        <div className="error-content">
          <h1>Unable to load content</h1>
          <p>{error}</p>
          <button className="back-home-btn" onClick={initializeData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {nowPlayingMovies.length > 0 && (
        <BannerSlider
          movies={nowPlayingMovies.slice(0, 10)}
          onItemClick={handleItemClick}
        />
      )}

      <div className="time-window-toggle-container">
        <div className="time-window-toggle">
          <span
            className={`toggle-label ${timeWindow === "week" ? "active" : ""}`}
          >
            This Week
          </span>
          <button
            className={`toggle-switch ${timeWindow === "day" ? "day" : "week"}`}
            onClick={handleTimeWindowToggle}
            aria-label={`Switch to ${timeWindow === "week" ? "today" : "this week"} trending`}
          >
            <div className="toggle-slider" />
          </button>
          <span
            className={`toggle-label ${timeWindow === "day" ? "active" : ""}`}
          >
            Today
          </span>
        </div>
      </div>

      <div className="content-rows">
        {nowPlayingMovies.length > 0 && (
          <MovieRow
            title="Now Playing"
            items={nowPlayingMovies.slice(0, 12)}
            onItemClick={handleItemClick}
            rowType="movie"
          />
        )}

        <div className="trending-side-by-side">
          {trendingMovies.length > 0 && (
            <div className="trending-column">
              <MovieRow
                title={`Trending Movies ${timeWindow === "day" ? "Today" : "This Week"}`}
                items={trendingMovies.slice(0, 15)}
                onItemClick={handleItemClick}
                rowType="movie"
              />
            </div>
          )}

          {trendingTV.length > 0 && (
            <div className="trending-column">
              <MovieRow
                title={`Trending TV Shows ${timeWindow === "day" ? "Today" : "This Week"}`}
                items={trendingTV.slice(0, 15)}
                onItemClick={handleItemClick}
                rowType="tv"
              />
            </div>
          )}
        </div>

        {trendingAnime.length > 0 && (
          <MovieRow
            title="Trending Anime"
            items={trendingAnime.slice(0, 12)}
            onItemClick={handleItemClick}
          />
        )}
      </div>

      {isModalOpen && selectedItem && (
        <Modal item={selectedItem} onClose={closeModal} />
      )}
    </div>
  );
};

export default Home;
