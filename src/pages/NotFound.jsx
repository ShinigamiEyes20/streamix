import { Link } from "react-router-dom";
import { usePageMeta } from "../hooks/usePageMeta";

export default function NotFound() {
  usePageMeta({ title: "Page not found", description: "The Streamix page you requested could not be found." });
  return (
    <section className="not-found-page" aria-labelledby="not-found-heading">
      <p className="eyebrow">404 · Page not found</p>
      <h1 id="not-found-heading">This title is off the map.</h1>
      <p>The page may have moved, or the address may be incorrect.</p>
      <Link className="btn btn-primary" to="/">Back to Streamix</Link>
    </section>
  );
}
