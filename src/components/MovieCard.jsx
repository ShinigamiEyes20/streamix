import React, { memo } from "react";
import { POSTER_URL } from "../hooks/useTMDB";

const MovieCard = memo(({ item, onClick, isSaved = false, onToggleSave }) => {

  const title = item.title || item.name || "Untitled";
  const ratingValue = Number(item.vote_average);
  const hasRating = item.vote_average !== null && item.vote_average !== undefined && item.vote_average !== "" && Number.isFinite(ratingValue);
  const ratingClass = !hasRating ? "rating--muted" : ratingValue >= 7 ? "rating--good" : ratingValue >= 5.5 ? "rating--average" : "rating--low";
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
    <article className="movie-card">
      <button type="button" className="card-main" onClick={onClick} aria-label={`View details for ${title}`}>
        <span className="card-image-container">
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
            <span className="poster-placeholder"><span>{title}</span></span>
          )}
          <span className="card-hover-overlay">
            <span className="play-hover-btn"><span className="play-icon">▶</span>Details</span>
          </span>
        </span>

        <span className="card-content">
          <span className="card-header-row">
            <span className="card-title">{title}</span>
            <span className="media-badge">
              {mediaType === "tv" ? "TV" : mediaType === "movie" ? "Movie" : mediaType}
            </span>
          </span>
          <span className="card-meta">
            <span className={`rating ${ratingClass}`}>{hasRating ? `★ ${ratingValue.toFixed(1)}` : "NR"}</span>
            <span className="year">{year}</span>
          </span>
        </span>
      </button>
      {onToggleSave && <button type="button" className="card-save-button" aria-pressed={isSaved} aria-label={isSaved ? "Remove from My List" : "Add to My List"} onClick={() => onToggleSave(item)}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.75h12a1 1 0 0 1 1 1v15l-7-4-7 4v-15a1 1 0 0 1 1-1Z" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
      </button>}
    </article>
  );
});

MovieCard.displayName = "MovieCard";

export default MovieCard;
