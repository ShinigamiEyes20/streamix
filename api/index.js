const ID = "\\d{1,10}";
const ENDPOINTS = [
  /^genre\/(?:movie|tv)\/list$/,
  /^trending\/(?:movie|tv)\/(?:day|week)$/,
  /^movie\/now_playing$/,
  /^discover\/(?:movie|tv)$/,
  /^search\/multi$/,
  new RegExp(`^(?:movie|tv)/${ID}(?:/(?:credits|recommendations|watch/providers|videos))?$`),
  new RegExp(`^tv/${ID}/season/\\d{1,3}$`),
];
const ALLOWED_QUERY_KEYS = new Set([
  "query", "include_adult", "include_video", "include_null_first_air_dates",
  "language", "page", "sort_by", "year", "primary_release_year",
  "first_air_date_year", "with_genres", "with_keywords", "vote_average.gte",
  "with_status", "region",
]);
const SORTS = new Set([
  "popularity.asc", "popularity.desc", "revenue.asc", "revenue.desc",
  "primary_release_date.asc", "primary_release_date.desc", "first_air_date.asc",
  "first_air_date.desc", "original_title.asc", "original_title.desc",
  "title.asc", "title.desc", "vote_average.asc", "vote_average.desc",
  "vote_count.asc", "vote_count.desc",
]);

function noStore(res) {
  res.setHeader("Cache-Control", "no-store");
}

function isAllowedEndpoint(path) {
  return ENDPOINTS.some((pattern) => pattern.test(path));
}

function validateParam(key, value) {
  if (!ALLOWED_QUERY_KEYS.has(key) || typeof value !== "string" || value.length > 200) return false;
  if (["include_adult", "include_video", "include_null_first_air_dates"].includes(key)) return /^(true|false)$/.test(value);
  if (key === "page") return /^\d{1,3}$/.test(value) && Number(value) >= 1 && Number(value) <= 500;
  if (key === "sort_by") return SORTS.has(value);
  if (key === "language") return /^[a-z]{2}(-[A-Z]{2})?$/.test(value);
  if (key === "region") return /^[A-Z]{2}$/.test(value);
  if (["year", "primary_release_year", "first_air_date_year"].includes(key)) return /^\d{4}$/.test(value);
  if (key === "vote_average.gte") return /^(?:10(?:\.0)?|[0-9](?:\.[0-9])?)$/.test(value);
  if (["with_genres", "with_keywords"].includes(key)) return /^\d{1,10}(?:,\d{1,10})*$/.test(value);
  if (key === "with_status") return /^[0-5]$/.test(value);
  if (key === "query") return value.trim().length > 0 && !/[<>]/.test(value);
  return false;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    noStore(res);
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let requestUrl;
  try {
    const host = req.headers?.host || "localhost";
    requestUrl = new URL(req.url || "/api", `https://${host}`);
  } catch {
    noStore(res);
    return res.status(400).json({ error: "Invalid request URL" });
  }

  const query = req.query || {};
  const queryPath = query.path;
  const path = (Array.isArray(queryPath) ? queryPath.join("/") : queryPath)
    || requestUrl.pathname.replace(/^\/api\/?/, "");

  if (!path || path.length > 120 || path.includes("..") || path.includes("%") || !isAllowedEndpoint(path)) {
    noStore(res);
    return res.status(404).json({ error: "TMDb endpoint is not allowed" });
  }

  const params = new URLSearchParams();
  for (const [key, raw] of Object.entries(query)) {
    if (key === "path") continue;
    const values = Array.isArray(raw) ? raw : [raw];
    if (values.length !== 1 || !validateParam(key, String(values[0]))) {
      noStore(res);
      return res.status(400).json({ error: `Invalid query parameter: ${key}` });
    }
    if (key !== "include_adult") params.set(key, String(values[0]).trim());
  }
  if (path === "search/multi" || path.startsWith("discover/")) {
    params.set("include_adult", "false");
  }

  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!token) {
    noStore(res);
    return res.status(503).json({ error: "TMDb service is not configured" });
  }

  const upstreamUrl = new URL(`https://api.themoviedb.org/3/${path}`);
  upstreamUrl.search = params.toString();

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(9000),
    });
    if (upstream.status === 429) {
      const retryAfter = upstream.headers.get("Retry-After");
      if (retryAfter) res.setHeader("Retry-After", retryAfter);
      noStore(res);
      return res.status(429).json({ error: "TMDb rate limit reached. Please retry shortly." });
    }
    if (upstream.status === 401 || upstream.status === 403) {
      noStore(res);
      return res.status(502).json({ error: "TMDb service is temporarily unavailable" });
    }
    if (!upstream.ok) {
      noStore(res);
      return res.status(upstream.status).json({ error: "TMDb request could not be completed" });
    }
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json(await upstream.json());
  } catch {
    noStore(res);
    return res.status(502).json({ error: "TMDb service is temporarily unavailable" });
  }
}
