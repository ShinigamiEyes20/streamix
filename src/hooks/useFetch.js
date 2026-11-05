import { useCallback, useEffect, useMemo, useState } from "react";
import { tmdbRequest } from "../lib/apiClient";

/** Fetch a TMDb endpoint with abort-on-change and shared response caching. */
export function useFetch(path, params = {}) {
  const paramsKey = JSON.stringify(params);
  const stableParams = useMemo(() => JSON.parse(paramsKey), [paramsKey]);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!path) return undefined;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    tmdbRequest(path, stableParams, { signal: controller.signal })
      .then((result) => { if (!controller.signal.aborted) setData(result); })
      .catch((requestError) => { if (!controller.signal.aborted) setError(requestError); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [path, refreshKey, stableParams]);

  const refetch = useCallback(() => setRefreshKey((key) => key + 1), []);
  return { data, error, loading, refetch };
}
