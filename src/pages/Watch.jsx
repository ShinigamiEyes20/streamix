import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import Toast from "../components/Toast";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { usePageMeta } from "../hooks/usePageMeta";
import { useTMDB, BACKDROP_URL, POSTER_URL, PROFILE_URL } from "../hooks/useTMDB";
import { getOfficialTrailerEmbedUrl, TRAILER_IFRAME_POLICY } from "../lib/players";
import { toListItem } from "../lib/listItems";

const validId = (value) => /^\d{1,10}$/.test(value || "");
const mediaTitle = (item) => item?.title || item?.name || "Untitled";

export default function Watch() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const type = params.get("type");
  const id = params.get("id");
  const validRoute = ["movie", "tv"].includes(type) && validId(id);
  const {
    fetchDetails, fetchCreditsDetailed, fetchMovieRecommendations, fetchTVRecommendations,
    fetchWatchProviders, fetchVideos, fetchSeasonEpisodes,
  } = useTMDB();
  const [detail, setDetail] = useState(null);
  const [cast, setCast] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [providers, setProviders] = useState(null);
  const [providerRegion, setProviderRegion] = useLocalStorage("streamix:region", "PH");
  const [trailer, setTrailer] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [activeSeason, setActiveSeason] = useState("");
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const trailerCloseRef = useRef(null);
  const seasonControllerRef = useRef(null);
  const [myList, setMyList] = useLocalStorage("streamix:my-list", []);
  const [, setContinue] = useLocalStorage("streamix:continue", []);

  const title = mediaTitle(detail);
  const isSaved = myList.some((item) => item.id === Number(id) && item.type === type);
  const backdrop = detail?.backdrop_path ? `${BACKDROP_URL}${detail.backdrop_path}` : "";
  usePageMeta({ title: detail ? title : "Title details", description: detail?.overview || "Explore movie and TV details, official trailers, and regional availability on Streamix.", image: backdrop });

  const loadData = useCallback(async (signal) => {
    if (!validRoute) {
      setError("A valid movie or TV title was not specified.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    const detailsPromise = fetchDetails(type, id, { signal });
    detailsPromise.then((data) => {
      if (signal?.aborted) return;
      setDetail(data);
      setLoading(false);
      if (type === "tv") {
        const firstSeason = (data.seasons || []).find((season) => season.episode_count > 0);
        if (firstSeason) {
          setActiveSeason(String(firstSeason.season_number));
          fetchSeasonEpisodes(id, firstSeason.season_number, { signal }).then((seasonEpisodes) => {
            if (!signal?.aborted) setEpisodes(seasonEpisodes);
          }).catch((requestError) => {
            if (requestError.name !== "AbortError") setEpisodes([]);
          });
        }
      }
    }).catch((requestError) => {
      if (signal?.aborted) return;
      setError(requestError?.message || "Unable to load title details.");
      setLoading(false);
    });

    const [, creditsResult, recommendationsResult, providerResult, videosResult] = await Promise.allSettled([
      detailsPromise,
      fetchCreditsDetailed(type, id, { signal }),
      type === "movie" ? fetchMovieRecommendations(id, { signal }) : fetchTVRecommendations(id, { signal }),
      fetchWatchProviders(type, id, { signal }),
      fetchVideos(type, id, { signal }),
    ]);
    if (signal?.aborted) return;
    if (creditsResult.status === "fulfilled") {
      setCast(creditsResult.value.cast || []);
      setDirectors(creditsResult.value.directors || []);
    } else {
      setCast([]);
      setDirectors([]);
    }
    setSimilar(recommendationsResult.status === "fulfilled" ? recommendationsResult.value.slice(0, 12) : []);
    const regions = providerResult.status === "fulfilled" ? providerResult.value.results || {} : {};
    setProviders(regions);
    const videos = videosResult.status === "fulfilled" ? videosResult.value : [];
    setTrailer(videos.find((video) => video.site === "YouTube" && video.type === "Trailer" && video.official) || videos.find((video) => video.site === "YouTube" && video.type === "Trailer") || null);
    setLoading(false);
  }, [fetchCreditsDetailed, fetchDetails, fetchMovieRecommendations, fetchSeasonEpisodes, fetchTVRecommendations, fetchVideos, fetchWatchProviders, id, type, validRoute]);

  useEffect(() => {
    const controller = new AbortController();
    setDetail(null);
    setCast([]);
    setSimilar([]);
    setProviders(null);
    setEpisodes([]);
    seasonControllerRef.current?.abort();
    loadData(controller.signal);
    return () => {
      controller.abort();
      seasonControllerRef.current?.abort();
    };
  }, [loadData]);

  useEffect(() => {
    if (!detail || !validRoute) return;
    const entry = toListItem(detail, type);
    setContinue((items) => [entry, ...items.filter((item) => !(item.id === entry.id && item.type === entry.type))].slice(0, 20));
  }, [detail, id, setContinue, type, validRoute]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.key]);

  const changeSeason = async (season) => {
    seasonControllerRef.current?.abort();
    const controller = new AbortController();
    seasonControllerRef.current = controller;
    setActiveSeason(season);
    setEpisodes([]);
    try {
      const results = await fetchSeasonEpisodes(id, season, { signal: controller.signal });
      if (!controller.signal.aborted) setEpisodes(results);
    } catch (requestError) {
      if (requestError.name !== "AbortError" && !controller.signal.aborted) setEpisodes([]);
    }
  };

  useEffect(() => () => seasonControllerRef.current?.abort(), []);

  const toggleMyList = () => {
    const item = toListItem(detail, type);
    setMyList((items) => isSaved ? items.filter((saved) => !(saved.id === item.id && saved.type === item.type)) : [item, ...items]);
    setToast(isSaved ? "Removed from My List" : "Added to My List");
  };

  useEffect(() => {
    if (!showTrailer) return undefined;
    const previousFocus = document.activeElement;
    trailerCloseRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") setShowTrailer(false);
      if (event.key === "Tab") {
        const focusable = document.querySelectorAll(".trailer-dialog button, .trailer-dialog iframe");
        if (!focusable.length) return;
        if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable[focusable.length - 1].focus(); }
        else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) { event.preventDefault(); focusable[0].focus(); }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("keydown", onKeyDown); previousFocus?.focus?.(); };
  }, [showTrailer]);

  if (loading) return <div className="details-page"><div className="details-skeleton" aria-label="Loading title details"><span /><span /><span /></div></div>;
  if (error || !detail) return <div className="error-page"><div className="error-content"><h1>Title unavailable</h1><p>{error || "This title could not be found."}</p><button className="back-home-btn" onClick={() => loadData()}>Try again</button><Link to="/">Back to browse</Link></div></div>;

  const providerAvailabilityRegion = [providerRegion, "PH", "US"].find((region) => providers?.[region]) || providerRegion;
  const selectedProviders = providers?.[providerAvailabilityRegion];
  const availableProviders = ["flatrate", "rent", "buy"].flatMap((category) => (selectedProviders?.[category] || []).map((provider) => ({ ...provider, category })));
  const providerLink = (() => {
    try {
      const candidate = new URL(selectedProviders?.link);
      return candidate.hostname === "themoviedb.org" || candidate.hostname.endsWith(".themoviedb.org") ? candidate.href : `https://www.themoviedb.org/${type}/${id}/watch?locale=${providerAvailabilityRegion}`;
    } catch {
      return `https://www.themoviedb.org/${type}/${id}/watch?locale=${providerAvailabilityRegion}`;
    }
  })();
  const releaseYear = (detail.release_date || detail.first_air_date || "").slice(0, 4);
  const genres = detail.genres || [];

  return (
    <div className="details-page">
      <section className="details-hero" style={backdrop ? { backgroundImage: `linear-gradient(90deg, rgba(5,8,22,.96), rgba(5,8,22,.62) 55%, rgba(5,8,22,.3)), linear-gradient(0deg, #050816, transparent 70%), url(${backdrop})` } : undefined}>
        <div className="details-hero-inner">
          <img className="details-poster" src={detail.poster_path ? `${POSTER_URL}${detail.poster_path}` : "/logo/streamix-s.png"} alt={`${title} poster`} width="342" height="513" />
          <div className="details-copy">
            <p className="eyebrow">{type === "movie" ? "Movie" : "TV series"}{releaseYear ? ` · ${releaseYear}` : ""}</p>
            <h1>{title}</h1>
            {detail.tagline && <p className="details-tagline">“{detail.tagline}”</p>}
            <p className="details-overview">{detail.overview || "No overview is available for this title."}</p>
            <div className="details-facts" aria-label="Title information">
              {detail.vote_average > 0 && <span>★ {detail.vote_average.toFixed(1)} / 10</span>}
              {detail.runtime && <span>{detail.runtime} min</span>}
              {detail.number_of_seasons && <span>{detail.number_of_seasons} seasons</span>}
              {detail.status && <span>{detail.status}</span>}
            </div>
            <div className="details-genres">{genres.map((genre) => <span key={genre.id}>{genre.name}</span>)}</div>
            {type === "movie" && directors.length > 0 && <p className="details-credit-line"><strong>Directed by</strong> {directors.map((director) => director.name).join(", ")}</p>}
            {type === "tv" && detail.created_by?.length > 0 && <p className="details-credit-line"><strong>Created by</strong> {detail.created_by.map((creator) => creator.name).join(", ")}</p>}
            <div className="details-actions">
              {trailer && <button className="btn btn-primary" onClick={() => setShowTrailer(true)}>▶ Official trailer</button>}
              <a className="btn btn-secondary" href="#where-to-watch">Where to watch</a>
              <button className="btn btn-secondary" onClick={toggleMyList} aria-pressed={isSaved}>{isSaved ? "✓ In My List" : "+ My List"}</button>
            </div>
          </div>
        </div>
      </section>

      <div className="details-content">
        <section id="where-to-watch" className="details-section" aria-labelledby="providers-heading">
          <div className="section-heading"><div><p className="eyebrow">Legal availability</p><h2 id="providers-heading">Where to watch</h2></div>
            <label className="region-picker">Region <select value={providerRegion} onChange={(event) => setProviderRegion(event.target.value)} aria-label="Select provider region">{["PH", "US"].map((region) => <option key={region} value={region}>{region}</option>)}</select></label>
          </div>
          {availableProviders.length ? <div className="provider-list">{availableProviders.map((provider, index) => <a className="provider-chip" key={`${provider.provider_id}-${provider.category}-${index}`} href={providerLink} target="_blank" rel="noopener noreferrer" aria-label={`${provider.provider_name}, ${provider.category}. View on TMDb`}>
            {provider.logo_path && <img src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`} alt="" width="46" height="46" loading="lazy" />}
            <span>{provider.provider_name}<small>{provider.category}</small></span>
          </a>)}</div> : <p className="muted-copy">No streaming, rental, or purchase providers are listed for {providerRegion}. Check TMDb for updated regional availability.</p>}
          <a className="text-link" href={providerLink} target="_blank" rel="noopener noreferrer">View full availability on TMDb ↗</a>
          <p className="muted-copy">Availability varies by country and may change. Provider information is supplied by TMDb; confirm details with the service.</p>
        </section>

        {type === "tv" && detail.seasons?.length > 0 && <section className="details-section" aria-labelledby="seasons-heading"><div className="section-heading"><div><p className="eyebrow">Series guide</p><h2 id="seasons-heading">Seasons & episodes</h2></div><label className="region-picker">Season<select value={activeSeason} onChange={(event) => changeSeason(event.target.value)} aria-label="Select season">{detail.seasons.map((season) => <option key={season.id} value={season.season_number}>{season.name}</option>)}</select></label></div>
          {episodes.length ? <ol className="episode-list">{episodes.map((episode) => <li key={episode.id}><span className="episode-number">{String(episode.episode_number).padStart(2, "0")}</span><div><h3>{episode.name}</h3><p>{episode.air_date || "Release date unavailable"}{episode.runtime ? ` · ${episode.runtime} min` : ""}</p></div></li>)}</ol> : <p className="muted-copy">Episode details are not available for this season.</p>}
        </section>}

        <section className="details-section" aria-labelledby="cast-heading"><p className="eyebrow">Credits</p><h2 id="cast-heading">Cast</h2>{cast.length ? <div className="cast-row" tabIndex="0" aria-label="Cast">{cast.map((person) => <Link className="cast-card" key={person.id} to={`/person?id=${person.id}`}><span className="cast-photo">{person.profile_path ? <img src={`${PROFILE_URL}${person.profile_path}`} alt="" width="96" height="96" loading="lazy" /> : <span aria-hidden="true">{person.name?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>}</span><strong>{person.name}</strong><small>{person.character || "Role unavailable"}</small></Link>)}</div> : <p className="cast-list">Cast information is not available.</p>}</section>
        {similar.length > 0 && <section className="details-section"><div className="section-heading"><div><p className="eyebrow">More like this</p><h2>Similar titles</h2></div></div><div className="similar-grid">{similar.map((item) => <MovieCard key={item.id} item={{ ...item, media_type: type }} onClick={() => navigate(`/watch?type=${type}&id=${item.id}`)} />)}</div></section>}
      </div>

      <Toast message={toast} onDismiss={() => setToast("")} />
      {showTrailer && trailer && <div className="trailer-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setShowTrailer(false); }}><section className="trailer-dialog" role="dialog" aria-modal="true" aria-label={`${title} official trailer`}><button ref={trailerCloseRef} className="trailer-close" onClick={() => setShowTrailer(false)} aria-label="Close trailer">×</button><iframe title={`${title} official trailer on YouTube`} src={getOfficialTrailerEmbedUrl(trailer.key)} {...TRAILER_IFRAME_POLICY} /></section></div>}
    </div>
  );
}
