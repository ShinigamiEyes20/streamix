import React from "react";
import { Link } from "react-router-dom";

const Disclaimer = () => {
  return (
    <div className="static-page">
      <div className="static-container">
        <p className="eyebrow">Disclaimer</p>
        <h1>Important information for Streamix users</h1>

        <div className="disclaimer-content">
          <section className="disclaimer-section">
            <h2>Third-party data and services</h2>
            <p>
              Streamix uses public metadata and media references from
              third-party sources, including The Movie Database (TMDb), to
              provide titles, posters, descriptions, genres, and release
              information. We do not claim ownership of any media, titles, or
              related content shown in the interface.
            </p>
          </section>

          <section className="disclaimer-section">
            <h2>Content sourcing</h2>
            <p>
              This project is a front-end experience and discovery interface. It
              does not operate as a licensed media host, and it does not claim
              to store or distribute copyrighted content directly. Availability
              of content may vary by service, region, or platform.
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
              This application uses The Movie Database (TMDb) API for media
              metadata and artwork. TMDb is a third-party service and remains
              the source of the catalog data used in the interface. Please refer
              to TMDb's terms for full usage details.
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
