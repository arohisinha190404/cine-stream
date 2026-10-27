# AI Debugging / Pair-Programming Log

The assignment requires a record of AI-assisted debugging. Replace or extend the entries below with the actual prompts, errors, and changes from your own work. Do not claim you ran checks you have not run.

## Session 1 — Project architecture
**Prompt:** How should a React + Vite movie explorer be structured to separate TMDB API requests, movie cards, and app state?

**Summary:** Kept API requests in `src/api/tmdb.js`, reusable card UI in `src/components/MovieCard.jsx`, and route/state coordination in `src/App.jsx`.

## Session 2 — Debounced search
**Prompt:** How can a search input wait 500ms after typing stops and avoid stale responses?

**Summary:** The search effect uses a 500ms timeout and an `AbortController` cleanup. A request identifier prevents older responses from replacing newer results.

## Session 3 — Infinite scroll
**Prompt:** How can a native IntersectionObserver load another API page and append results?

**Summary:** An invisible sentinel is observed with a 300px root margin. Additional results are appended with a functional state update.

## Session 4 — Favorites persistence
**Prompt:** How can favorites persist after refresh without a backend?

**Summary:** Favorites initialize from `localStorage` and synchronize when state changes. A dedicated `/favorites` route displays the saved items.

## Session 5 — Error handling and missing posters
**Prompt:** How should missing TMDB posters and API failures be handled?

**Summary:** Missing posters render a fallback panel; API failures show a readable message and retry button.

## Before submission
- Add the actual date and any prompts you personally used.
- Record the real terminal/build errors you encountered and how you fixed them.
- Run `npm install` and `npm run build` yourself and record the outcome.
