export default async function handler(req, res) {
  const { method } = req;
  const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/^\/api\//, '/');
  const path = pathname.replace(/^\//, '');
  const queryString = url.search;
  const token = process.env.TMDB_READ_ACCESS_TOKEN;

  if (method !== 'GET' && method !== 'POST' && method !== 'OPTIONS') {
    return res.status(405).json({
      success: false,
      status_code: 405,
      status_message: 'Method not allowed.',
    });
  }

  if (method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      status_code: 401,
      status_message: 'TMDb access token not configured.',
    });
  }

  const upstreamUrl = `https://api.themoviedb.org/3/${path || 'configuration'}${queryString}`;

  try {
    const response = await fetch(upstreamUrl, {
      method,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    return res.status(response.status).setHeader('Cache-Control', 'public, max-age=3600').json(
      typeof data === 'string' ? { message: data } : data,
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      status_code: 500,
      status_message: `TMDb proxy error: ${error.message}`,
    });
  }
}
