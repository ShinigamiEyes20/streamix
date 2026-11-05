import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKDROP_URL } from "../hooks/useTMDB";

export default function BannerSlider({ movies = [], onItemClick }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const navigate = useNavigate();
  const currentMovie = movies[currentSlide % Math.max(movies.length, 1)];

  useEffect(() => {
    if (paused || movies.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const interval = window.setInterval(() => setCurrentSlide((current) => (current + 1) % movies.length), 6000);
    return () => window.clearInterval(interval);
  }, [movies.length, paused]);

  if (!currentMovie) return null;
  const title = currentMovie.title || currentMovie.name || "Featured title";
  const image = currentMovie.backdrop_path ? `${BACKDROP_URL}${currentMovie.backdrop_path}` : "";
  const imageSrcSet = currentMovie.backdrop_path
    ? ["w780", "w1280", "original"].map((size, index) => `${image.replace("w1280", size)} ${[780, 1280, 1920][index]}w`).join(", ")
    : undefined;
  const type = currentMovie.media_type === "tv" ? "tv" : "movie";

  return (
    <section className="banner-slider" aria-label="Featured titles" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
      <div className="banner-slide">
        {image && <img className="banner-backdrop" src={image} srcSet={imageSrcSet} sizes="100vw" alt="" width="1280" height="720" loading="eager" fetchPriority="high" />}
        <div className="banner-content">
          <div className="now-playing-overlay"><span className="now-playing-badge">Featured discovery</span></div>
          <h1 className="banner-title">{title}</h1>
          <div className="banner-meta"><span className="rating">★ {currentMovie.vote_average?.toFixed(1) || "—"}</span><span className="year">{(currentMovie.release_date || currentMovie.first_air_date || "").slice(0, 4)}</span></div>
          <p className="banner-description">{currentMovie.overview?.length > 180 ? `${currentMovie.overview.slice(0, 180).trim()}…` : currentMovie.overview}</p>
          <div className="banner-buttons">
            <button className="btn btn-primary" onClick={() => navigate(`/watch?type=${type}&id=${currentMovie.id}`)}>Where to watch</button>
            <button className="btn btn-secondary" onClick={() => onItemClick?.({ ...currentMovie, type })}>More Info</button>
          </div>
        </div>
      </div>
      {movies.length > 1 && <div className="banner-dots" role="group" aria-label="Choose featured title">{movies.slice(0, 10).map((movie, index) => <button key={movie.id} type="button" className={`banner-dot ${index === currentSlide ? "active" : ""}`} onClick={() => setCurrentSlide(index)} aria-label={`Show featured title ${index + 1}`} aria-pressed={index === currentSlide} />)}</div>}
    </section>
  );
}
