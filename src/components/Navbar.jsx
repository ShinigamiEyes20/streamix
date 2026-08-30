import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Movies", to: "/movies" },
  { label: "TV Shows", to: "/tv-shows" },
  { label: "Popular", to: "/popular" },
  { label: "About", to: "/about" },
  { label: "Disclaimer", to: "/disclaimer" },
];

const Navbar = ({ onOpenSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen((open) => !open);
  const closeMenu = () => setIsMenuOpen(false);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    onOpenSearch?.(searchValue);
  };

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" aria-label="Streamix home page">
          <span className="brand-mark">S</span>
          <span className="brand-word">STREAMIX</span>
        </Link>

        <div className="navbar-links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="navbar-tools">
          <form className="navbar-search" onSubmit={handleSearchSubmit}>
            <span className="search-icon" aria-hidden="true">
              ⌕
            </span>
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search movies & TV shows..."
              aria-label="Search movies and TV shows"
            />
          </form>

          <button
            type="button"
            className="mobile-search-trigger"
            onClick={() => onOpenSearch?.(searchValue)}
            aria-label="Open search"
          >
            ⌕
          </button>

          <button
            className={`menu-toggle ${isMenuOpen ? "open" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div className={`side-menu ${isMenuOpen ? "open" : ""}`}>
          <div className="side-menu-header">
            <h3>Menu</h3>
          </div>
          <div className="side-menu-links">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
                onClick={closeMenu}
              >
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              className="nav-link nav-search-button"
              onClick={() => {
                closeMenu();
                onOpenSearch?.(searchValue);
              }}
            >
              Search
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div
            className={`menu-overlay ${isMenuOpen ? "active" : ""}`}
            onClick={closeMenu}
            aria-hidden="true"
          />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
