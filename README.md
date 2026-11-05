# Streamix

Streamix is a responsive movie and TV discovery app built with React and Vite. It uses TMDb metadata to help people explore titles, official trailers, and regional availability from licensed services. Streamix does not host or play media.

## Features

- Featured titles and trending movie/TV discovery
- Search with recent queries and keyboard-accessible results
- Movie and TV discovery filters
- Title detail pages with cast, seasons, episodes, similar titles, and official trailers
- Regional “Where to watch” availability from TMDb, with region selection and PH/US fallback
- Local My List and recently explored titles
- Responsive cinematic UI, reduced-motion support, keyboard navigation, and screen-reader labels
- Route-level code splitting, short-lived metadata caching, offline shell, and installable PWA
- Vercel serverless TMDb proxy with endpoint allowlisting and server-side credentials

## Screenshots

Add project screenshots here when available:

- `docs/screenshots/home.png` — Home and featured titles
- `docs/screenshots/details.png` — Title details and provider availability
- `docs/screenshots/mobile.png` — Mobile layout

## Tech stack

- React 19, React Router, Vite 7
- Vercel serverless functions
- TMDb API
- vite-plugin-pwa and vite-plugin-sitemap

## Local setup

Requirements: Node.js 20.19+ or 22.12+, npm, and a TMDb API Read Access Token.

1. Install packages: `npm install`
2. Copy `.env.example` to `.env` and set `TMDB_READ_ACCESS_TOKEN`.
3. Start the frontend and local TMDb development proxy: `npm run dev`
4. Verify the hardened serverless proxy contract: `npm run check:api`
5. Verify quality/build: `npm run lint` and `npm run build`

The Vite development proxy forwards `/api` to TMDb and adds the token in Node-side Vite config. To run the exact Vercel serverless handler locally instead, use `vercel dev` with the Vercel CLI and the same environment variable. The token must not use a `VITE_` prefix and must never be placed in client code.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `TMDB_READ_ACCESS_TOKEN` | Yes | TMDb bearer token used only by the serverless proxy and local Vite proxy |

Only configure this secret on the server. Do not commit `.env` files.

## Deploy to Vercel

1. Import this repository into Vercel with the Vite preset.
2. Use `npm run build` and `dist` as the output directory.
3. Add `TMDB_READ_ACCESS_TOKEN` in Project Settings → Environment Variables for the required deployment environments.
4. Deploy. Verify `/api/movie/now_playing`, a title detail URL, and the security headers in the browser Network panel.
5. If using a custom domain, set `VITE_SITE_URL` in the Vercel build environment and update the static `robots.txt` and `sitemap.xml` hosts.

Vercel rewrites `/api/*` to the serverless proxy and other application routes to the SPA. The proxy accepts only the endpoints the UI needs; it does not forward arbitrary TMDb paths.

## Legal and attribution

Streamix hosts no media and does not embed third-party streaming players. Metadata and artwork are provided by The Movie Database (TMDb); where-to-watch data is regional and may change. Official trailer embeds use YouTube’s privacy-enhanced domain and are loaded only after the user opens a trailer.

**This product uses the TMDB API but is not endorsed or certified by TMDB.** The required TMDb logo attribution is displayed in the site footer. Use of TMDb data and artwork must follow the [TMDb terms](https://www.themoviedb.org/terms-of-use) and [API terms](https://www.themoviedb.org/documentation/api/terms-of-use). Provider availability should be confirmed with the provider.

## Project structure

```text
api/                 Vercel serverless TMDb proxy
public/              Icons, manifest, robots and sitemap
src/components/      Shared navigation, cards, rows and dialogs
src/hooks/           TMDb, metadata and local-storage hooks
src/lib/              API client and isolated official trailer embed policy
src/pages/            Route-level pages
src/styles/           Global, component, page and responsive styles
```

## Roadmap

- Add automated unit and accessibility tests
- Expand static prerendering for shareable title pages
- Add user-controlled export/import for locally saved titles
- Continue performance and accessibility audits on real mobile devices
