import React from "react";
import { Link } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta";

const About = () => {
  usePageMeta({ title: "About Streamix", description: "Learn about Streamix, a TMDb-powered movie and TV discovery app that does not host media." });
  return (
    <div className="static-page">
      <div className="static-container">
        <p className="eyebrow">About Streamix</p>
        <h1>Streamix brings entertainment together.</h1>

        <div className="about-content">
          <section className="about-section">
            <h2>What Streamix is</h2>
            <p>
              Streamix is a modern movie and TV discovery experience designed
              for people who want a polished, distraction-free way to browse
              trending titles, find something new, and check official viewing
              options in their region.
            </p>
          </section>

          <section className="about-section">
            <h2>How it works</h2>
            <p>
              The app uses the TMDb API to bring in up-to-date movie and TV
              metadata, including posters, ratings, descriptions, genres, and
              release information. This lets the interface stay rich and current
              without needing to hardcode a large media library into the app
              itself.
            </p>
          </section>

          <section className="about-section">
            <h2>Built for discovery</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Trending picks</h3>
                <p>
                  Browse today’s and this week’s most watched entertainment.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3>Search with keyboard shortcuts</h3>
                <p>Open search with “/” or Ctrl+K and find movies and TV shows.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📺</div>
                <h3>Where to watch</h3>
                <p>Check legal availability by region using provider data from TMDb.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">▶</div>
                <h3>Official trailers</h3>
                <p>Find official trailers for titles when they are available.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">♡</div>
                <h3>My List and Recently viewed</h3>
                <p>These are saved in your browser; nothing from these lists leaves your device.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🎭</div>
                <h3>Cast and actor pages</h3>
                <p>Explore cast details and the movies and shows associated with actors.</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Respecting creators</h2>
            <p>
              Streamix is designed to make exploring entertainment easier and
              more enjoyable. The app does not claim to own, host, or license
              any titles it surfaces. Streamix hosts no media and does not embed
              unlicensed streaming sources. Provider availability is presented
              as discovery information; confirm terms with each official service.
            </p>
            <p>
              We encourage users to support creators and official streaming
              services whenever possible.
            </p>
          </section>

          <section className="about-section">
            <h2>TMDb attribution</h2>
            <p>Movie and TV metadata and artwork are provided by TMDb. See the footer for the full TMDb attribution.</p>
          </section>
        </div>

        <div className="static-links">
          <Link to="/disclaimer" className="static-link">
            View Disclaimer
          </Link>
          <Link to="/" className="static-link">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
