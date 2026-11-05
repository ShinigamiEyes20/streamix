import React from "react";
import { Link } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta";

const Disclaimer = () => {
  usePageMeta({ title: "Disclaimer", description: "Streamix hosts no media. Review information about TMDb metadata, official providers, and third-party services." });
  return (
    <div className="static-page">
      <div className="static-container">
        <p className="eyebrow">Disclaimer</p>
        <h1>Important information for Streamix users</h1>

        <div className="disclaimer-content">
          <section className="disclaimer-section">
            <h2>Third-party data and services</h2>
            <p>
              Streamix hosts no media. It uses metadata and artwork from
              The Movie Database (TMDb) to
              provide titles, posters, descriptions, genres, and release
              information. We do not claim ownership of any media, titles, or
              related content shown in the interface.
            </p>
          </section>

          <section className="disclaimer-section">
            <h2>Content sourcing</h2>
            <p>
              This project is a metadata and availability discovery interface.
              It does not store, host, or distribute movie or television media.
              Links direct users to third-party services; availability varies
              by service and region.
            </p>
          </section>

          <section className="disclaimer-section">
            <h2>Legal responsibility</h2>
            <p>
              Users are responsible for ensuring their use of any content or
              sources complies with the laws and regulations of their
              jurisdiction. Streamix does not provide legal advice and cannot
              guarantee that any external source is lawful or regionally
              available to every user.
            </p>
          </section>

          <section className="disclaimer-section">
            <h2>Support official services</h2>
            <p>
              We encourage users to support creators and entertainment providers
              through official services where applicable, including licensed
              streaming platforms and content marketplaces.
            </p>
            <div className="platform-list">
              <a
                href="https://www.netflix.com"
                target="_blank"
                rel="noreferrer"
                className="platform-link"
              >
                Netflix
              </a>
              <a
                href="https://www.disneyplus.com"
                target="_blank"
                rel="noreferrer"
                className="platform-link"
              >
                Disney+
              </a>
              <a
                href="https://www.hbomax.com"
                target="_blank"
                rel="noreferrer"
                className="platform-link"
              >
                HBO Max
              </a>
              <a
                href="https://www.primevideo.com"
                target="_blank"
                rel="noreferrer"
                className="platform-link"
              >
                Prime Video
              </a>
            </div>
          </section>

          <section className="disclaimer-section">
            <h2>TMDb notice</h2>
            <p>
              This product uses the TMDB API but is not endorsed or certified
              by TMDB. Metadata and artwork are provided by TMDb. The TMDb logo
              is displayed in the site footer. Please refer to TMDb's terms for
              full usage details.
            </p>
          </section>
        </div>

        <div className="static-links">
          <Link to="/about" className="static-link">
            About Streamix
          </Link>
          <Link to="/" className="static-link">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
