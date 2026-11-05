import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { usePageMeta } from "../hooks/usePageMeta";
import { useTMDB, BACKDROP_URL, POSTER_URL } from "../hooks/useTMDB";
import { getOfficialTrailerEmbedUrl, TRAILER_IFRAME_POLICY } from "../lib/players";

const validId = (value) => /^\d{1,10}$/.test(value || "");
const mediaTitle = (item) => item?.title || item?.name || "Untitled";
const getRegion = () => {
  const localeRegion = navigator.language?.split("-").at(-1)?.toUpperCase();
  return /^[A-Z]{2}$/.test(localeRegion || "") ? localeRegion : "US";
};

export default function Watch() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const type = params.get("type");
  const id = params.get("id");
  const validRoute = ["movie", "tv"].includes(type) && validId(id);
  const {
    fetchDetails, fetchCredits, fetchMovieRecommendations, fetchTVRecommendations,
    fetchWatchProviders, fetchVideos, fetchSeasonEpisodes,
  } = useTMDB();
  const [detail, setDetail] = useState(null);
  const [cast, setCast] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [providers, setProviders] = useState(null);
  const [providerRegion, setProviderRegion] = useState(getRegion);
  const [trailer, setTrailer] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [activeSeason, setActiveSeason] = useState("");
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    try {
      const data = await fetchDetails(type, id, { signal });
      if (signal?.aborted) return;
      setDetail(data);
      const [creditsResult, recommendationsResult, providerResult, videosResult] = await Promise.allSettled([
        fetchCredits(type, id, { signal }),
        type === "movie" ? fetchMovieRecommendations(id, { signal }) : fetchTVRecommendations(id, { signal }),
        fetchWatchProviders(type, id, { signal }),
        fetchVideos(type, id, { signal }),
      ]);
      if (signal?.aborted) return;
      setCast(creditsResult.status === "fulfilled" ? creditsResult.value : []);
      setSimilar(recommendationsResult.status === "fulfilled" ? recommendationsResult.value.slice(0, 12) : []);

      const region = getRegion();
      if (signal?.aborted) return;
      const regions = providerResult.status === "fulfilled" ? providerResult.value.results || {} : {};
      const availableRegion = [region, "PH", "US"].find((candidate) => regions[candidate]);
      setProviderRegion(availableRegion || region);
      setProviders(regions);
      const videos = videosResult.status === "fulfilled" ? videosResult.value : [];
      setTrailer(videos.find((video) => video.site === "YouTube" && video.type === "Trailer" && video.official) || videos.find((video) => video.site === "YouTube" && video.type === "Trailer") || null);

      if (type === "tv") {
        const firstSeason = (data.seasons || []).find((season) => season.episode_count > 0);
        if (firstSeason) {
          setActiveSeason(String(firstSeason.season_number));
          const seasonEpisodes = await fetchSeasonEpisodes(id, firstSeason.season_number, { signal });
          if (signal?.aborted) return;
          setEpisodes(seasonEpisodes);
        }
      }
    } catch (requestError) {
      if (requestError.name !== "AbortError") setError(requestError.message || "Unable to load title details.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [fetchCredits, fetchDetails, fetchMovieRecommendations, fetchSeasonEpisodes, fetchTVRecommendations, fetchVideos, fetchWatchProviders, id, type, validRoute]);

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
    const entry = {
      id: Number(id), type,
      title: detail.title, name: detail.name,
      poster_path: detail.poster_path,
      backdrop_path: detail.backdrop_path,
      vote_average: detail.vote_average,
      release_date: detail.release_date,
      first_air_date: detail.first_air_date,
      media_type: type,
    };
    setContinue((items) => [entry, ...items.filter((item) => !(item.id === entry.id && item.type === entry.type))].slice(0, 20));
  }, [detail, id, setContinue, type, validRoute]);

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
    const item = { id: Number(id), type, title: detail.title, name: detail.name, poster_path: detail.poster_path, vote_average: detail.vote_average, release_date: detail.release_date, first_air_date: detail.first_air_date, media_type: type };
    setMyList((items) => isSaved ? items.filter((saved) => !(saved.id === item.id && saved.type === item.type)) : [item, ...items]);
  };

  useEffect(() => {
    if (!showTrailer) return undefined;
    trailerCloseRef.current?.focus();
    const previousFocus = document.activeElement;
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

  const selectedProviders = providers?.[providerRegion];
  const availableProviders = ["flatrate", "rent", "buy"].flatMap((category) => (selectedProviders?.[category] || []).map((provider) => ({ ...provider, category })));
  const providerLink = (() => {
    try {
      const candidate = new URL(selectedProviders?.link);
      return candidate.hostname === "themoviedb.org" || candidate.hostname.endsWith(".themoviedb.org") ? candidate.href : `https://www.themoviedb.org/${type}/${id}/watch?locale=${providerRegion}`;
    } catch {
      return `https://www.themoviedb.org/${type}/${id}/watch?locale=${providerRegion}`;
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
            <p className="details-overview">{detail.overview || "No overview is available for this title."}</p>
            <div className="details-facts" aria-label="Title information">
              {detail.vote_average > 0 && <span>★ {detail.vote_average.toFixed(1)} / 10</span>}
              {detail.runtime && <span>{detail.runtime} min</span>}
              {detail.number_of_seasons && <span>{detail.number_of_seasons} seasons</span>}
              {detail.status && <span>{detail.status}</span>}
            </div>
            <div className="details-genres">{genres.map((genre) => <span key={genre.id}>{genre.name}</span>)}</div>
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
            <label className="region-picker">Region <select value={providerRegion} onChange={(event) => setProviderRegion(event.target.value)} aria-label="Select provider region">{[...new Set([getRegion(), "PH", "US"])].map((region) => <option key={region} value={region}>{region}{region === getRegion() ? " · Your region" : ""}</option>)}</select></label>
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

        <section className="details-section"><p className="eyebrow">Credits</p><h2>Cast</h2><p className="cast-list">{cast.length ? cast.join(" · ") : "Cast information is not available."}</p></section>
        {similar.length > 0 && <section className="details-section"><div className="section-heading"><div><p className="eyebrow">More like this</p><h2>Similar titles</h2></div></div><div className="similar-grid">{similar.map((item) => <MovieCard key={item.id} item={{ ...item, media_type: type }} onClick={() => navigate(`/watch?type=${type}&id=${item.id}`)} />)}</div></section>}
      </div>

      {showTrailer && trailer && <div className="trailer-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setShowTrailer(false); }}><section className="trailer-dialog" role="dialog" aria-modal="true" aria-label={`${title} official trailer`}><button ref={trailerCloseRef} className="trailer-close" onClick={() => setShowTrailer(false)} aria-label="Close trailer">×</button><iframe title={`${title} official trailer on YouTube`} src={getOfficialTrailerEmbedUrl(trailer.key)} {...TRAILER_IFRAME_POLICY} /></section></div>}
    </div>
  );
}
