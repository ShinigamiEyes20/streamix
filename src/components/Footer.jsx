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

        <nav className="footer-links" aria-label="Footer">
          <div className="footer-column" aria-labelledby="footer-quick-links">
            <h2 id="footer-quick-links">Quick Links</h2>
            <Link to="/">Home</Link>
            <Link to="/movies">Movies</Link>
            <Link to="/tv-shows">TV Shows</Link>
            <Link to="/popular">Popular</Link>
            <Link to="/my-list">My List</Link>
          </div>

          <div className="footer-column" aria-labelledby="footer-information">
            <h2 id="footer-information">Information</h2>
            <Link to="/about">About</Link>
            <Link to="/disclaimer">Disclaimer</Link>
          </div>

          <div className="footer-column" aria-labelledby="footer-connect">
            <h2 id="footer-connect">Connect</h2>
            <a href="https://github.com/ShinigamiEyes20/streamix" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://github.com/ShinigamiEyes20/streamix/issues" target="_blank" rel="noopener noreferrer">Report an issue</a>
            <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDb</a>
          </div>
        </nav>

        <div className="footer-meta">
          <p>© {currentYear} Streamix. Streamix hosts no media.</p>
          <p>Metadata and artwork are provided by TMDb. This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
          <a className="tmdb-attribution" href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" aria-label="The Movie Database (TMDb), opens in a new tab">
            <img src="https://www.themoviedb.org/assets/2/v4/logos/att/green.svg" alt="The Movie Database (TMDb)" width="120" height="24" loading="lazy" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
