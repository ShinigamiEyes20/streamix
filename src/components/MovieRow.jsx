import React from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "./MovieCard";

const MovieRow = ({ title, items, onItemClick, rowType }) => {
  const displayItems = items.slice(0, 24);
  const navigate = useNavigate();

  if (displayItems.length === 0) {
    return null;
  }

  const handleViewAll = () => {
    if (rowType === "movie") {
      navigate("/movies");
    } else if (rowType === "tv") {
      navigate("/tv-shows");
    } else if (rowType === "popular") {
      navigate("/popular");
    }
  };

  return (
    <div className="row">
      <div className="row-header">
        <h2>{title}</h2>
        {(rowType === "movie" || rowType === "tv" || rowType === "popular") && (
          <button
            type="button"
            className="view-all-link"
            onClick={handleViewAll}
            aria-label={`View all ${title}`}
          >
            View All <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
      <div className="row-track">
        {displayItems.map((item) => (
          <MovieCard
            key={item.id}
            item={item}
            onClick={() => onItemClick(item)}
          />
        ))}
      </div>
    </div>
  );
};

export default MovieRow;
