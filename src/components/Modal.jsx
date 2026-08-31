import React, { useCallback, memo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTMDB } from "../hooks/useTMDB";

const Modal = memo(({ item, onClose }) => {
  const navigate = useNavigate();
  const { POSTER_URL } = useTMDB();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const playButtonClick = useCallback(() => {
    navigate(`/watch?type=${item.type}&id=${item.id}`);
  }, [item.type, item.id, navigate]);
  const title = item.title || item.name || "Untitled";
  const year = item.release_date
    ? item.release_date.substring(0, 4)
    : item.first_air_date
      ? item.first_air_date.substring(0, 4)
      : "—";

  return (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="modal-content">
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close details"
        >
          ×
        </button>

        <div className="modal-body">
          <div className="modal-poster-wrap">
            <img
              src={
                item.poster_path
                  ? `${POSTER_URL}${item.poster_path}`
                  : "/logo/streamix-s.png"
              }
              alt={title}
              className="modal-poster"
              loading="lazy"
            />
          </div>

          <div className="modal-details">
            <div className="modal-topline">
              <span className="modal-type">
                {item.type === "tv" ? "TV Series" : "Movie"}
              </span>
              <span className="modal-year">{year}</span>
              <span className="modal-rating">
                ★ {item.vote_average?.toFixed(1) || "N/A"}
              </span>
            </div>

            <h2 className="modal-title">{title}</h2>

            <p className="modal-description">
              {item.overview || "No description available for this title yet."}
            </p>

            <div className="modal-extra-info">
              <div className="info-row">
                <strong>Genres:</strong>
                <span>{item.genres?.join(", ") || "N/A"}</span>
              </div>
              <div className="info-row">
                <strong>Cast:</strong>
                <span>{item.cast || "N/A"}</span>
              </div>
              <div className="info-row">
                <strong>Runtime:</strong>
                <span>
                  {item.runtime
                    ? `${item.runtime} min`
                    : item.episode_run_time?.[0]
                      ? `${item.episode_run_time[0]} min`
                      : "N/A"}
                </span>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={playButtonClick} className="watch-btn primary">
                <span className="play-icon">▶</span>
                Watch Now
              </button>
              <button onClick={onClose} className="watch-btn secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Modal.displayName = "Modal";
export default Modal;
