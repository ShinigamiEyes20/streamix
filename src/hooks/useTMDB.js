import { useCallback, useMemo } from "react";
import { tmdbRequest } from "../lib/apiClient";
import { useFetch } from "./useFetch";

export const POSTER_URL = "https://image.tmdb.org/t/p/w500";
export const BACKDROP_URL = "https://image.tmdb.org/t/p/w1280";

export function useTMDB() {
  const { data: movieGenreData, error: movieGenreError, loading: movieGenresLoading } = useFetch("genre/movie/list", { language: "en-US" });
  const { data: tvGenreData, error: tvGenreError, loading: tvGenresLoading } = useFetch("genre/tv/list", { language: "en-US" });
  const movieGenres = useMemo(() => new Map((movieGenreData?.genres || []).map(({ id, name }) => [id, name])), [movieGenreData]);
  const tvGenres = useMemo(() => new Map((tvGenreData?.genres || []).map(({ id, name }) => [id, name])), [tvGenreData]);
  const apiStatus = movieGenreError || tvGenreError ? "error" : movieGenresLoading || tvGenresLoading ? "checking" : "working";

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
    fetchDiscoverTV, fetchMovieRecommendations, fetchTVRecommendations,
    fetchWatchProviders, fetchVideos, POSTER_URL, BACKDROP_URL,
  };
}
