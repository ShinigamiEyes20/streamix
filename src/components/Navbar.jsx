import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";

const desktopNavItems = [
  { label: "Home", to: "/" },
  { label: "Movies", to: "/movies" },
  { label: "TV Shows", to: "/tv-shows" },
  { label: "Popular", to: "/popular" },
  { label: "My List", to: "/my-list" },
];

const sideNavItems = [
  ...desktopNavItems,
  { label: "About", to: "/about" },
  { label: "Disclaimer", to: "/disclaimer" },
];

const Navbar = ({ onOpenSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuToggleRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const menuToggle = menuToggleRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      menuToggle?.focus();
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((open) => !open);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`} aria-label="Primary navigation">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" aria-label="Streamix home page">
          <span className="brand-mark">S</span>
          <span className="brand-word">STREAMIX</span>
        </Link>

        <div className="navbar-links">
          {desktopNavItems.map((item) => (
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
          <button type="button" className="navbar-search" onClick={() => onOpenSearch?.("")} aria-label="Search movies and TV shows">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <span>Search movies &amp; TV shows…</span>
            <kbd aria-hidden="true">/</kbd>
          </button>

          <button
            type="button"
            className="mobile-search-trigger"
            onClick={() => onOpenSearch?.("")}
            aria-label="Open search"
          >
            ⌕
          </button>

          <button
            ref={menuToggleRef}
            className={`menu-toggle ${isMenuOpen ? "open" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="navbar-side-menu"
            type="button"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div id="navbar-side-menu" className={`side-menu ${isMenuOpen ? "open" : ""}`} inert={!isMenuOpen} aria-hidden={!isMenuOpen}>
          <div className="side-menu-header">
            <h3>Menu</h3>
          </div>
          <div className="side-menu-links">
            {sideNavItems.map((item) => (
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
                menuToggleRef.current?.focus();
                closeMenu();
                onOpenSearch?.("");
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
