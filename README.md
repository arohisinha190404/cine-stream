# Cine-Stream — Sprint 08

A React + Vite movie discovery SPA using TMDB. Includes popular movies, debounced search, IntersectionObserver infinite scroll, favorites persisted in localStorage, native lazy-loaded posters, and an optional Gemini-powered Mood Matcher serverless endpoint.

## Requirements
- Node.js 18+ (Node 20 LTS recommended)
- A free TMDB account and API Read Access Token
- Optional: Gemini API key for Mood Matcher on Vercel

## Run locally
1. Extract the ZIP and open a terminal in the `cine-stream` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`.
4. Put your TMDB **API Read Access Token** after `VITE_TMDB_TOKEN=` in `.env`. Do not include `Bearer`; the app adds it.
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open the local URL Vite prints, usually `http://localhost:5173`.

## Features
- Popular movies from TMDB with poster, title, release year and rating.
- Search is debounced by 500ms and aborts stale in-flight search requests.
- Infinite scroll uses the browser's native `IntersectionObserver` and appends subsequent pages.
- Favorites are stored in `localStorage` and shown at `/favorites`.
- Movie posters use `loading="lazy"` and missing posters get a placeholder.
- Optional Mood Matcher: deployed `/api/mood` serverless function calls Gemini and then searches TMDB for its suggested title.

## Build check
```bash
npm run build
npm run preview
```

## Deploy to Vercel
1. Push this project to a GitHub repository.
2. Import the repository in Vercel. Framework should be detected as Vite.
3. Add `VITE_TMDB_TOKEN` in Project Settings → Environment Variables.
4. Optional Mood Matcher: add `GEMINI_API_KEY` (server-side only; do **not** use a `VITE_` prefix for secrets).
5. Deploy/redeploy. Test `/` and `/favorites`.

For Netlify, the Vite frontend can be deployed with build command `npm run build` and publish directory `dist`. The included `/api/mood` function uses Vercel's serverless format; use Vercel for the complete optional Mood Matcher unless you adapt it to a Netlify Function.

## QA demo checklist
1. Show popular movies and posters.
2. Type a title and pause; in browser DevTools → Network, show that the search request waits until typing stops.
3. Scroll to the bottom and show the next page being requested and appended.
4. Favorite a movie, open Favorites, refresh the page, and show it remains.
5. Optional: show Mood Matcher after setting `GEMINI_API_KEY` on Vercel.

## Notes
- The TMDB token is used by the browser because TMDB is a client-facing REST API for this assignment. Restrict/rotate credentials as appropriate and never commit `.env`.
- TMDB API usage requires attribution. This product uses the TMDB API but is not endorsed or certified by TMDB.
- Read `Prompts.md` and update it with your own AI debugging sessions before submission.
