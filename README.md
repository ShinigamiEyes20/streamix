# Streamix

Streamix is a modern movie and TV discovery app built with React and Vite. It pairs a polished streaming-style interface with TMDb-powered metadata to help users browse trending titles, discover new content, and jump into watch sessions quickly.

## Brand

- Name: Streamix
- Tagline: Your world of entertainment.

## Features

- Cinematic landing page with featured content
- Trending movie and TV browsing
- Search across titles and media types
- Responsive design for mobile and desktop
- TMDb-backed metadata and poster system
- Vercel-ready configuration for deployment

## Local development

1. Install dependencies

```bash
npm install
```

2. Copy the environment file and add your TMDb token

```bash
cp .env.example .env
```

3. Start the app

```bash
npm run dev
```

## Environment variables

```env
TMDB_READ_ACCESS_TOKEN=your_tmdb_read_access_token_here
```

Add this value in the Vercel project dashboard under Project Settings → Environment Variables.

## Vercel deployment

1. Import the repository into Vercel.
2. Set the framework to Vite and the build command to `npm run build`.
3. Set the output directory to `dist`.
4. Add the required environment variables from `.env.example`.
5. Deploy and verify that the TMDb proxy works properly in production.

## Attribution

This project uses TMDb API data for movie and TV metadata, artwork, and catalog information. Please follow TMDb API usage terms and licensing requirements in production deployments.
