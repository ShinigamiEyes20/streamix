import React from "react";
import { Link } from "react-router-dom";

const About = () => {
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
              trending titles, find something new, and jump into a watch session
              quickly.
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
                <h3>Smart search</h3>
                <p>
                  Search across movies and TV shows with a fast, easy interface.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h3>Responsive design</h3>
                <p>
                  Enjoy the same polished experience across desktop and mobile
                  screens.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Fast browsing</h3>
                <p>Built for a clean, lightweight streaming discovery flow.</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Respecting creators</h2>
            <p>
              Streamix is designed to make exploring entertainment easier and
              more enjoyable. The app does not claim to own, host, or license
              any titles it surfaces. Where content is available via third-party
              services or through the TMDb metadata platform, all rights and
              responsibilities remain with their respective owners.
            </p>
            <p>
              We encourage users to support creators and official streaming
              services whenever possible.
            </p>
          </section>

          <section className="about-section">
            <h2>TMDb attribution</h2>
            <p>
              This project uses The Movie Database (TMDb) API for movie and TV
              metadata, artwork, and catalog information. Streamix is not
              affiliated with or sponsored by TMDb, but it relies on TMDb data
              under the applicable service terms.
            </p>
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
