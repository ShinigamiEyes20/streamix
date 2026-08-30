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
          <Link to="/">Home</Link>
          <Link to="/movies">Movies</Link>
          <Link to="/tv-shows">TV Shows</Link>
          <Link to="/popular">Popular</Link>
          <Link to="/about">About</Link>
          <Link to="/disclaimer">Disclaimer</Link>
        </div>

        <div className="footer-meta">
          <p>© {currentYear} Streamix. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
