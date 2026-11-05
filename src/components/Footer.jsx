import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-branding">
          <div className="footer-logo">STREAMIX</div>
          <p className="footer-tagline">Your world of entertainment.</p>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/movies">Movies</Link>
            <Link to="/tv-shows">TV Shows</Link>
            <Link to="/popular">Popular</Link>
            <Link to="/my-list">My List</Link>
          </div>

          <div className="footer-column">
            <h4>Information</h4>
            <Link to="/about">About</Link>
            <Link to="/disclaimer">Disclaimer</Link>
          </div>

          <div className="footer-column">
            <h4>Connect</h4>
            <span>Explore more titles</span>
            <span>Streamix updates</span>
          </div>
        </div>

        <div className="footer-meta">
          <p>© {currentYear} Streamix. Streamix hosts no media. Metadata and artwork are provided by TMDb. This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
          <a className="tmdb-attribution" href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" aria-label="The Movie Database (TMDb), opens in a new tab">
            <img src="https://www.themoviedb.org/assets/2/v4/logos/att/green.svg" alt="The Movie Database (TMDb)" width="120" height="24" loading="lazy" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
