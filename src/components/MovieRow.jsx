import { memo, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "./MovieCard";

const MovieRow = memo(function MovieRow({ title, items = [], onItemClick, rowType, maxItems = 24 }) {
  const trackRef = useRef(null);
  const navigate = useNavigate();
  const displayItems = useMemo(() => items.slice(0, maxItems), [items, maxItems]);
  if (!displayItems.length) return null;

  const scroll = (direction) => trackRef.current?.scrollBy({ left: direction * Math.max(trackRef.current.clientWidth * 0.8, 320), behavior: "smooth" });
  const handleViewAll = () => navigate(rowType === "tv" ? "/tv-shows" : rowType === "popular" ? "/popular" : "/movies");
  return <section className="row" aria-label={title}>
    <div className="row-header"><h2>{title}</h2><div className="row-controls">
      <button type="button" className="row-arrow" onClick={() => scroll(-1)} aria-label={`Scroll ${title} left`}>‹</button>
      <button type="button" className="row-arrow" onClick={() => scroll(1)} aria-label={`Scroll ${title} right`}>›</button>
      {rowType && <button type="button" className="view-all-link" onClick={handleViewAll} aria-label={`View all ${title}`}>View All <span aria-hidden="true">→</span></button>}
    </div></div>
    <div className="row-track" ref={trackRef} tabIndex={0} aria-label={`${title} titles`} onKeyDown={(event) => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); scroll(event.key === "ArrowLeft" ? -1 : 1); } }}>
      {displayItems.map((item) => <MovieCard key={`${item.media_type || item.type || rowType || "title"}-${item.id}`} item={item} onClick={() => onItemClick?.(item)} />)}
    </div>
  </section>;
});

export default MovieRow;
