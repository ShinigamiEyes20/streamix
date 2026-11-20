import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { usePageMeta } from "../hooks/usePageMeta";
import { useTMDB, PROFILE_URL } from "../hooks/useTMDB";

const validId = (value) => /^\d{1,10}$/.test(value || "");

export default function Person() {
  const location = useLocation();
  const navigate = useNavigate();
  const id = useMemo(() => new URLSearchParams(location.search).get("id"), [location.search]);
  const { fetchPerson, fetchPersonCredits } = useTMDB();
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!validId(id)) {
      setError("A valid person was not specified.");
      setLoading(false);
      return undefined;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setPerson(null);
    setCredits([]);
    Promise.allSettled([
      fetchPerson(id, { signal: controller.signal }),
      fetchPersonCredits(id, { signal: controller.signal }),
    ]).then(([personResult, creditsResult]) => {
      if (controller.signal.aborted) return;
      if (personResult.status === "fulfilled") setPerson(personResult.value);
      if (creditsResult.status === "fulfilled") setCredits(creditsResult.value);
      if (personResult.status === "rejected" && creditsResult.status === "rejected") {
        const reason = personResult.reason;
        setError(reason?.message || "Unable to load this person.");
      }
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [fetchPerson, fetchPersonCredits, id]);

  usePageMeta({
    title: person?.name || "Person",
    description: person?.biography?.slice(0, 160) || "Explore the work and credits of this person.",
    image: person?.profile_path ? `${PROFILE_URL}${person.profile_path}` : "",
  });

  if (loading) return <div className="details-page"><div className="details-skeleton" aria-label="Loading person details"><span /><span /><span /></div></div>;
  if (error || !person) return <div className="error-page"><div className="error-content"><h1>Person unavailable</h1><p>{error || "This person could not be found."}</p></div></div>;

  const biography = person.biography || "Biography information is not available.";

  return (
    <div className="person-page">
      <section className="person-header">
        {person.profile_path
          ? <img src={`${PROFILE_URL}${person.profile_path}`} alt={person.name} width="185" height="278" />
          : <div className="person-avatar-fallback" aria-label={person.name}>{person.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>}
        <div className="person-copy">
          <p className="eyebrow">{person.known_for_department || "Person"}</p>
          <h1>{person.name}</h1>
          {(person.birthday || person.place_of_birth) && <p className="person-facts">
            {person.birthday && <span>Born {person.birthday}</span>}
            {person.place_of_birth && <span>{person.place_of_birth}</span>}
          </p>}
          <p className={`person-biography${expanded ? " expanded" : ""}`}>{biography}</p>
          {biography.length > 360 && <button type="button" className="text-button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>{expanded ? "Read less" : "Read more"}</button>}
        </div>
      </section>
      <section className="person-known-for">
        <h2>Known for</h2>
        {credits.length > 0
          ? <div className="saved-grid">{credits.map((item) => <MovieCard key={`${item.media_type}-${item.id}`} item={{ ...item, type: item.media_type }} onClick={() => navigate(`/watch?type=${item.media_type}&id=${item.id}`)} />)}</div>
          : <p className="muted-copy">No known movie or TV credits were found.</p>}
      </section>
    </div>
  );
}
