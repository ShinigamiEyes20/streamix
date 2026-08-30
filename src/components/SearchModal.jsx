import React, { useState, useRef, useEffect, useCallback } from "react";
import MovieCard from "./MovieCard";

const SearchModal = ({
  searchResults,
  onSearch,
  onClose,
  onItemClick,
  isSearching,
  initialQuery = "",
}) => {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    setQuery(initialQuery);
    if (initialQuery.trim()) {
      onSearch?.(initialQuery);
    }
  }, [initialQuery, onSearch]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const debouncedSearch = useCallback(
    (value) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        onSearch?.(value);
      }, 250);
    },
    [onSearch],
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  useEffect(
    () => () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    },
    [],
  );

  const handleItemSelect = (item) => {
    onItemClick?.(item);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  return (
    <div
      className="search-modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Search Streamix"
    >
      <div className="search-modal-content">
        <button
          className="search-close"
          onClick={handleClose}
          aria-label="Close search"
        >
          ×
        </button>

        <div className="search-input-container">
          <span className="search-input-icon">⌕</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search movies and TV shows..."
            value={query}
            onChange={handleInputChange}
            className="search-input"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              className="search-clear-button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        <div className="search-results">
          {isSearching ? (
            <div className="search-state-box">
              <div className="mini-spinner" />
              <p>Searching for titles...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="results-grid">
              {searchResults.map((item) => (
                <MovieCard
                  key={`${item.id}-${item.media_type}`}
                  item={item}
                  onClick={() => handleItemSelect(item)}
                />
              ))}
            </div>
          ) : query ? (
            <div className="search-state-box empty">
              <p>No results found for "{query}".</p>
            </div>
          ) : (
            <div className="search-state-box placeholder">
              <p>Start typing to explore movies and shows.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
