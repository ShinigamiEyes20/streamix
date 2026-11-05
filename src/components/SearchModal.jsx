import { useCallback, useEffect, useRef, useState } from "react";
import MovieCard from "./MovieCard";
import { useDebounce } from "../hooks/useDebounce";

const RECENT_KEY = "streamix:recent-searches:v1";
function readRecent() {
  try {
    const value = JSON.parse(localStorage.getItem(RECENT_KEY));
    return Array.isArray(value) ? value.filter((item) => typeof item === "string").slice(0, 5) : [];
  } catch { return []; }
}

export default function SearchModal({ searchResults = [], onSearch, onClose, onItemClick, isSearching, initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const [recent, setRecent] = useState(readRecent);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const initialFocus = useRef(document.activeElement);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const returnFocus = initialFocus.current;
    inputRef.current?.focus();
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = oldOverflow;
      returnFocus?.focus?.();
    };
  }, []);

  const remember = useCallback((value) => {
    const term = value.trim();
    if (term.length < 2) return;
    const next = [term, ...readRecent().filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(0, 5);
    setRecent(next);
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { /* Optional personalization. */ }
  }, []);

  useEffect(() => {
    const term = debouncedQuery.trim();
    if (term.length >= 2) {
      onSearch?.(term);
      remember(term);
    } else onSearch?.("");
  }, [debouncedQuery, onSearch, remember]);

  const handleKeyDown = (event) => {
    if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const cards = [...(dialogRef.current?.querySelectorAll(".results-grid .movie-card") || [])];
      if (!cards.length) return;
      event.preventDefault();
      const index = cards.indexOf(document.activeElement);
      const next = event.key === "ArrowDown" ? (index + 1) % cards.length : (index <= 0 ? cards.length - 1 : index - 1);
      cards[next].focus();
      return;
    }
    if (event.key === "Tab") {
      const focusable = [...(dialogRef.current?.querySelectorAll("button:not([disabled]), input, [tabindex='0']") || [])];
      if (!focusable.length) return;
      if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0].focus(); }
    }
  };

  const close = () => onClose();
  return (
    <div className="search-modal-overlay" onClick={(event) => { if (event.target === event.currentTarget) close(); }} onKeyDown={handleKeyDown} role="presentation">
      <section ref={dialogRef} className="search-modal-content" role="dialog" aria-modal="true" aria-label="Search Streamix">
        <div className="search-modal-header">
          <div className="search-input-container"><span className="search-input-icon" aria-hidden="true">⌕</span><input ref={inputRef} type="search" placeholder="Search movies and TV shows..." value={query} onChange={(event) => setQuery(event.target.value)} className="search-input" autoComplete="off" aria-label="Search titles" aria-controls="search-results" /><button type="button" className="search-close" onClick={close} aria-label="Close search">×</button></div>
        </div>
        <div id="search-results" className="search-results" aria-live="polite" aria-busy={isSearching}>
          {!query && recent.length > 0 && <div className="recent-searches"><span>Recent searches</span>{recent.map((term) => <button key={term} type="button" onClick={() => setQuery(term)}>{term}</button>)}</div>}
          {searchResults.length > 0 ? <div className="results-grid-wrapper"><div className="results-grid">{searchResults.map((item) => <MovieCard key={`${item.id}-${item.media_type}`} item={item} onClick={() => { onItemClick?.(item); close(); }} />)}</div>{isSearching && <p className="search-progress" role="status">Updating results…</p>}</div>
            : isSearching ? <div className="search-state-box" role="status">Searching titles…</div>
            : query.trim().length >= 2 ? <div className="search-state-box empty">No results found for “{query}”.</div>
            : <div className="search-state-box placeholder">Type at least two characters to find movies and TV shows.</div>}
        </div>
      </section>
    </div>
  );
}
