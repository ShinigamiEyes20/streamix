export default async function handler(req, res) {
  const method = req.method || "GET";
  const pathParam = req.query?.path;
  const requestedPath = Array.isArray(pathParam)
    ? pathParam.join("/")
    : pathParam || "";
  const normalizedPath = requestedPath
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment))
    .join("/");
  const token = process.env.TMDB_READ_ACCESS_TOKEN;

  if (method !== "GET" && method !== "OPTIONS") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  if (method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (!normalizedPath) {
    return res.status(400).json({
      error: "TMDB API path is required",
    });
  }

  if (!token) {
    return res.status(500).json({
      error: "TMDB API token is not configured",
    });
  }

  const upstreamUrl = new URL(
    `https://api.themoviedb.org/3/${normalizedPath}`,
  );
  Object.entries(req.query || {}).forEach(([key, value]) => {
    if (key === "path") return;
    const values = Array.isArray(value) ? value : [value];
    values.forEach((item) => upstreamUrl.searchParams.append(key, item));
  });

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("TMDB proxy request failed:", error.message);
    return res.status(500).json({
      error: "TMDB proxy request failed",
    });
  }
}