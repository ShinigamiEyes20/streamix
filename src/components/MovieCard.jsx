import React from "react";
import { useTMDB } from "../hooks/useTMDB";

const MovieCard = ({ item, onClick }) => {
  const { POSTER_URL } = useTMDB();

  const title = item.title || item.name || "Untitled";
  const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
  const year = item.release_date
    ? item.release_date.substring(0, 4)
    : item.first_air_date
      ? item.first_air_date.substring(0, 4)
      : "—";

  const posterSrc = item.poster_path
    ? `${POSTER_URL}${item.poster_path}`
    : null;
  const mediaType =
    item.media_type || item.type || (item.first_air_date ? "TV" : "Movie");

  return (
    <article
      className="movie-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="card-image-container">
        {posterSrc ? (
          <img src={posterSrc} alt={title} loading="lazy" />
        ) : (
          <div className="poster-placeholder">
            <span>{title}</span>
          </div>
        )}

        <div className="card-hover-overlay">
          <span className="play-hover-btn">
            <span className="play-icon">▶</span>
            Watch
          </span>
        </div>
      </div>

      <div className="card-content">
        <div className="card-header-row">
          <h3 className="card-title">{title}</h3>
          <span className="media-badge">
            {mediaType === "tv"
              ? "TV"
              : mediaType === "movie"
                ? "Movie"
                : mediaType}
          </span>
        </div>

        <div className="card-meta">
          <span className="rating">★ {rating}</span>
          <span className="year">{year}</span>
        </div>
      </div>
    </article>
  );
};

export default MovieCard;
