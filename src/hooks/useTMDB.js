import { useCallback, useEffect, useMemo, useState } from "react";
import { tmdbRequest } from "../lib/apiClient";

export const POSTER_URL = "https://image.tmdb.org/t/p/w500";
export const BACKDROP_URL = "https://image.tmdb.org/t/p/w1280";
export const PROFILE_URL = "https://image.tmdb.org/t/p/w185";

let genrePromise = null;
const genreCache = { movie: null, tv: null };

function useGenres() {
  const [movieGenreData, setMovieGenreData] = useState(genreCache.movie);
  const [tvGenreData, setTvGenreData] = useState(genreCache.tv);
  const [loading, setLoading] = useState(!genreCache.movie || !genreCache.tv);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!genrePromise) {
      genrePromise = Promise.allSettled([
        tmdbRequest("genre/movie/list", { language: "en-US" }),
        tmdbRequest("genre/tv/list", { language: "en-US" }),
      ]);
    }
    let active = true;
    genrePromise.then(([movieResult, tvResult]) => {
      if (!active) return;
      if (movieResult.status === "fulfilled") {
        genreCache.movie = movieResult.value;
        setMovieGenreData(movieResult.value);
      }
      if (tvResult.status === "fulfilled") {
        genreCache.tv = tvResult.value;
        setTvGenreData(tvResult.value);
      }
      const failures = [movieResult, tvResult].filter((result) => result.status === "rejected");
      if (failures.length) setError(failures[0].reason);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const movieGenres = useMemo(() => new Map((movieGenreData?.genres || []).map(({ id, name }) => [id, name])), [movieGenreData]);
  const tvGenres = useMemo(() => new Map((tvGenreData?.genres || []).map(({ id, name }) => [id, name])), [tvGenreData]);
  const apiStatus = error ? "error" : loading ? "checking" : "working";
  return { movieGenres, tvGenres, apiStatus };
}

export function useTMDB() {
  const { movieGenres, tvGenres, apiStatus } = useGenres();

  const request = useCallback((path, params, options) => tmdbRequest(path, params, options), []);
  const fetchNowPlaying = useCallback(async (options) => (await request("movie/now_playing", { language: "en-US", page: 1 }, options)).results || [], [request]);
  const fetchTrending = useCallback(async (type, timeWindow = "week", options) => (await request(`trending/${type}/${timeWindow}`, {}, options)).results || [], [request]);
  const fetchTrendingAnime = useCallback(async (options) => (await request("discover/tv", { with_genres: 16, with_keywords: 210024, sort_by: "popularity.desc" }, options)).results || [], [request]);
  const searchTMDB = useCallback(async (query, options) => {
    const term = query.trim();
    if (!term) return [];
    const data = await request("search/multi", { query: term, include_adult: false, language: "en-US" }, options);
    return (data.results || []).filter((item) => item.media_type === "movie" || item.media_type === "tv");
  }, [request]);
  const fetchCredits = useCallback(async (type, id, options) => {
    const data = await request(`${type}/${id}/credits`, {}, options);
    return (data.cast || []).slice(0, 10).map((person) => person.name);
  }, [request]);
  const fetchCreditsDetailed = useCallback(async (type, id, options) => {
    const data = await request(`${type}/${id}/credits`, {}, options);
    const cast = (data.cast || []).slice(0, 15).map(({ id: personId, name, character, profile_path }) => ({ id: personId, name, character, profile_path }));
    const seen = new Set();
    const directors = (data.crew || []).filter((person) => person.job === "Director").filter((person) => {
      if (seen.has(person.id)) return false;
      seen.add(person.id);
      return true;
    }).map(({ id: personId, name }) => ({ id: personId, name }));
    return { cast, directors };
  }, [request]);
  const fetchPerson = useCallback((id, options) => request(`person/${id}`, { language: "en-US" }, options), [request]);
  const fetchPersonCredits = useCallback(async (id, options) => {
    const data = await request(`person/${id}/combined_credits`, { language: "en-US" }, options);
    const seen = new Set();
    return (data.cast || []).filter((item) => item.media_type === "movie" || item.media_type === "tv").filter((item) => {
      const key = `${item.media_type}-${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 24);
  }, [request]);
  const fetchSeasonEpisodes = useCallback(async (id, season, options) => {
    const data = await request(`tv/${id}/season/${season}`, {}, options);
    return data.episodes || [];
  }, [request]);
  const fetchDetails = useCallback((type, id, options) => request(`${type}/${id}`, { language: "en-US" }, options), [request]);
  const fetchDiscoverMovies = useCallback(async (params = {}, options) => (await request("discover/movie", { sort_by: "popularity.desc", include_video: false, language: "en-US", page: 1, ...params, include_adult: false }, options)).results || [], [request]);
  const fetchDiscoverTV = useCallback(async (params = {}, options) => (await request("discover/tv", { sort_by: "popularity.desc", include_null_first_air_dates: false, language: "en-US", page: 1, ...params, include_adult: false }, options)).results || [], [request]);
  const fetchMovieRecommendations = useCallback(async (id, options) => (await request(`movie/${id}/recommendations`, {}, options)).results || [], [request]);
  const fetchTVRecommendations = useCallback(async (id, options) => (await request(`tv/${id}/recommendations`, {}, options)).results || [], [request]);
  const fetchWatchProviders = useCallback((type, id, options) => request(`${type}/${id}/watch/providers`, {}, options), [request]);
  const fetchVideos = useCallback(async (type, id, options) => (await request(`${type}/${id}/videos`, { language: "en-US" }, options)).results || [], [request]);

  return {
    movieGenres, tvGenres, apiStatus, request,
    fetchNowPlaying, fetchTrending, fetchTrendingAnime, searchTMDB, fetchCredits,
    fetchSeasonEpisodes, fetchDetails, fetchDiscoverMovies,
    fetchCreditsDetailed, fetchPerson, fetchPersonCredits, PROFILE_URL,
    fetchDiscoverTV, fetchMovieRecommendations, fetchTVRecommendations,
    fetchWatchProviders, fetchVideos, POSTER_URL, BACKDROP_URL,
  };
}
