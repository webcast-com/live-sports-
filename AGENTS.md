# Base44 Setup Notes

## Stack
- **Frontend**: Vite 8 + React 19, Tailwind CSS 4, React Router 8, TanStack Query, Supabase JS. Dev server on port 5173 (mapped to host 3000).
- **Backend**: Express 5 API proxy in `server/` (port 3001, mapped to host 8000). Calls RapidAPI's betigolo-tips endpoint. The frontend primarily uses Supabase Edge Functions, not this local backend.
- **Node**: >= 22.12 (Vite 8 requirement). Use `node:22` base image.

## Running
```
docker compose -f docker-compose.base44.yml up -d --build
```
- Frontend: `http://localhost:3000` (Vite dev, live reload)
- Backend:  `http://localhost:8000/health`

## Environment
- `.env.base44-defaults` — placeholder defaults so the app boots without credentials. Supabase public anon key is included (safe for frontend).
- `/run/base44/app.env` — real secrets delivered by platform; overrides defaults.
- The repo's `.env` had a malformed first line (missing `#`); fixed it so docker compose can parse it.

## Secrets
- `VITE_RAPIDAPI_KEY` — RapidAPI key for live sports data (betigolo-tips, allsports, today-football-prediction). Without it the app shows demo data. Not required at boot.
- `VITE_PAYSTACK_PUBLIC_KEY` — Paystack public key for payments. Placeholder is fine for browsing.

## Quirks
- `vite.config.ts` imports `./src/utils/sitemapGenerator` without a file extension — Vite 8 warns but still works.
- Live APIs are disabled by default in `.env.base44-defaults` (`VITE_ENABLE_LIVE_SPORTS_API=false`) so the app shows demo data without API keys.
- Vite `server.host: true` is set in config; `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` is passed via compose env for the preview origin.
