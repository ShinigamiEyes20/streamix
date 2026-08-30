export default async function handler(req, res) {
  const requestUrl = new URL(req.url, `https://${req.headers.host || "localhost"}`);
  const requestedPath = requestUrl.searchParams.get("path") || "configuration";
  const path = requestedPath.replace(/^\/+/, "");
  const queryString = new URLSearchParams(requestUrl.searchParams);
  queryString.delete("path");
  const token = process.env.TMDB_READ_ACCESS_TOKEN;

  if (req.method !== "GET" && req.method !== "POST" && req.method !== "OPTIONS") {
    return res.status(405).json({
      success: false,
      status_code: 405,
      status_message: "Method not allowed.",
    });
  }

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(204).end();
  }

  if (!token) {
    return res.status(500).json({
      error: "TMDB API token is not configured",
    });
  }

  const query = queryString.toString();
  const upstreamUrl = `https://api.themoviedb.org/3/${path}${query ? `?${query}` : ""}`;

  try {
    const response = await fetch(upstreamUrl, {
      method: req.method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    res.setHeader("Cache-Control", "public, max-age=3600");
    return res
      .status(response.status)
      .json(typeof data === "string" ? { message: data } : data);
  } catch (error) {
    console.error("TMDB proxy request failed:", error.message);
    return res.status(500).json({
      error: "TMDB proxy request failed",
    });
  }
}
