# AGENTS.md — Base44 dev environment notes

## Stack
- **Frontend**: Vite 8 + React 19 + Tailwind CSS 4, dev server on port 5173 (mapped to host 3000)
- **Backend**: Express 5 server in `server/` on port 3001 — NOT wired into the frontend; the frontend calls Supabase Edge Functions (cloud) instead. Backend is optional for the preview.
- **Data**: Cloud Supabase (public anon key, safe to expose). App has demo-data fallbacks when RapidAPI keys are absent.

## Running
```bash
docker compose -f docker-compose.base44.yml up -d
```
- Node 22 base image, source bind-mounted at `/app`, `npm install` + `npx vite --host 0.0.0.0` on startup.
- Vite `server.host: true` in `vite.config.ts` allows all hosts; `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` passed via compose env.
- `.env.base44-defaults` provides VITE_ vars; `/run/base44/app.env` overrides if present.

## Quirks
- `.env` first line was un-commented text ("Frontend environment variables...") — Docker Compose auto-reads `.env` for substitution and fails on it. Fixed by prefixing with `#`.
- `node_modules` is a named volume (`web_node_modules`) so host/node version mismatch doesn't break installs.
- No external secrets required to boot — Supabase anon key is public and committed; RapidAPI/Paystack keys are placeholders with demo-data fallbacks.

## Verify
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → 200
- Dev server serves transformed source at `/src/main.tsx` (not a prebuilt bundle).
