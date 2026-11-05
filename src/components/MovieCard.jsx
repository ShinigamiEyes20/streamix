import React, { memo } from "react";
import { POSTER_URL } from "../hooks/useTMDB";

const MovieCard = memo(({ item, onClick }) => {

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
      aria-label={`View details for ${title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="card-image-container">
        {posterSrc ? (
          <img
            src={posterSrc}
            srcSet={`${posterSrc.replace("w500", "w185")} 185w, ${posterSrc.replace("w500", "w342")} 342w, ${posterSrc} 500w`}
            sizes="(max-width: 480px) 42vw, (max-width: 900px) 22vw, 180px"
            alt={`${title} poster`}
            width="342"
            height="513"
            loading="lazy"
            fetchPriority="low"
          />
        ) : (
          <div className="poster-placeholder">
            <span>{title}</span>
          </div>
        )}

        <div className="card-hover-overlay">
          <span className="play-hover-btn">
            <span className="play-icon">▶</span>
            Details
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
});

MovieCard.displayName = "MovieCard";

export default MovieCard;
