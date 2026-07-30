# Phase 3 - DB & Realtime - Completed

**Date:** 2026-07-30
**Branch:** arena/019fa6a7-new-chat

## Overview
Phase 3 secures payments via webhook + realtime, adds favorites, activity tracking, Zod validation, edge caching, and realtime live scores.

---

### ✅ 1. Secure Payment Flow (Webhook + Realtime)

**Problem (Phase 1 audit):** `AuthContext.upgrade()` directly upserted `user_plans` to premium client-side - spoofable with fake Paystack reference.

**Solution:**
- **AuthContext.tsx rewritten:**
  - `upgrade(ref)` now validates ref via `PaystackRefSchema` (zod)
  - Inserts `payment_logs` with `status: 'pending'` (client can only insert pending, RLS prevents success)
  - Calls new edge function `verify-paystack` POST with auth header
  - Edge function verifies via Paystack API `https://api.paystack.co/transaction/verify/{ref}` using secret key, checks amount >= 10000 kobo
  - On success, edge function upserts `payment_logs` success + updates `user_plans` to premium (service role)
  - On pending, returns pending status - client polls + relies on `paystack-webhook` which verifies signature and also upgrades
  - Client then `loadPlan()` refreshes, or realtime subscription auto-updates

- **Realtime upgrade:** `AuthProvider` now subscribes to `user_plans` and `payment_logs` postgres_changes for current user. When webhook updates plan, UI instantly reflects premium via `setUser` without refresh. Logs `[Realtime] user_plans updated`.

- **PremiumUpgrade.tsx updated:**
  - Handles new return type `{ status: 'success'|'pending'|'failed', message, reference }`
  - Shows pending UI with "Paystack webhook will auto-upgrade via realtime" + pulsating Radio icon
  - Polls `refreshPlan()` every 3s when pending
  - Displays expires_at, secure indicator "Webhook Verified + Realtime"

- **Edge functions:**
  - `paystack-webhook.ts` already existed - good: verifies HMAC SHA-512 signature, idempotency check, upserts logs, updates plans, returns 200 to prevent retry
  - **New** `verify-paystack/index.ts`: verifies reference via Paystack API, handles simulated refs `FP_DAY_SIM_*` in dev mode when `PAYSTACK_SECRET_KEY` missing, adds `verified_at` column, updates plan
  - Added `verified_at` column to `payment_logs` in migration

**Security:** Client can no longer forge premium - only pending insert allowed, success requires server-side verification via secret key or webhook signature.

### ✅ 2. Favorites Table + Feature

**Migration:** `supabase/migrations/phase3_features.sql` includes:
```sql
create table favorites (id uuid, user_id uuid, team_name text, team_abbr, league, sport check(...), team_logo_url, created_at, unique(user_id, team_name, league))
RLS: read own, insert own, delete own
Indexes on user_id, team_name
```

- **Hook `useFavorites.ts`:**
  - Zod `FavoriteSchema` validation
  - `useQuery(['favorites', user.id])` with 5min stale, realtime subscription to `favorites` postgres_changes
  - `toggleFavorite` with optimistic update Set, rollback on error
  - Handles duplicate 23505 as success
  - Returns `favorites, isFavorite, toggleFavorite, addFavorite, removeFavorite, isAdding, isRemoving`

- **QuickLinks.tsx upgraded:**
  - Uses `useFavorites()` + `useActivityTracking()`
  - Shows favorites row with Heart icon and count badge if any favorites exist
  - Each league card has Heart button (appears on hover, red if favorited, Star badge)
  - Clicking league tracks `league_click`, favorite toggle tracks `favorite_toggle`
  - Phase 3 note: "Favorites now saved to Supabase with realtime sync + activity tracking"

### ✅ 3. Contact Messages + User Activity Tables

**Migration additions:**
- `contact_messages`: id, name, email, subject, message, user_id nullable, status (pending/read/replied/archived), created_at, updated_at, RLS insert anyone, select own, indexes
- `user_activity`: id, user_id nullable, action, metadata jsonb, ip_address, user_agent, created_at, RLS read own, insert anyone (for pre-login analytics), anon insert policy, indexes
- `user_favorites_summary` view: favorites_count, sports[], leagues[], last_favorite_at
- Enable realtime note for `user_plans`, `favorites`, `payment_logs` (commented SQL for dashboard)

**Contact email edge function:** `send-contact-email.ts` updated to:
- Validate with length checks (10-5000 chars)
- Save to `contact_messages` table via service role (if available) before sending email
- Handles missing RESEND_API_KEY gracefully - still saves to DB and returns success with `savedToDb: true`
- Includes user_id if logged in
- Returns emailError but success if DB saved

**Frontend:** `Contact.tsx` already wired in Phase 2 to call edge function, now also sends user_id, shows loader, handles error, shows "Phase 2: now wired to Supabase edge function" message.

### ✅ 4. Activity Tracking

**Hook `useActivityTracking.ts`:**
- Zod `ActivitySchema`
- Actions: page_view, tab_switch, sport_filter, match_view, search, favorite_toggle, prediction_view, premium_view, contact_submit, league_click
- Debounce 2s identical actions
- Fire-and-forget insert to `user_activity` table, logs in dev
- Methods: `track()`, `trackPageView()`, `trackTabSwitch()`, `trackSportFilter()`, `trackMatchView()`

**Integration in `AppLayout.tsx`:**
- `trackPageView(pathname, {sport, tab})` on location change
- `trackSportFilter(sport, prev)` on sport change
- `trackTabSwitch(from, to)` on tab change
- `trackMatchView(id, home, away)` on match click
- `QuickLinks` tracks league_click and favorite_toggle

### ✅ 5. Realtime Live Scores

**Hook `useRealtimeScores.ts`:**
- Takes base matches from polling (TanStack Query)
- Subscribes to Supabase channel `live-scores-realtime` broadcast `score_update` event
- Also listens to `postgres_changes` on `live_matches` table (if exists)
- Updates matches state immutably, sets `lastUpdate` timestamp
- Returns `isConnected` boolean, `lastUpdate`

**AppLayout integration:**
- `baseMatches` from `useScoreSimulator` (polling via TanStack Query)
- `simulatedMatches` now comes from `useRealtimeScores(baseMatches)` - realtime layer on top
- UI shows:
  - Premium banner: "Realtime" badge with pulsing Radio if connected, last update time
  - Data source indicator: "Realtime ON" with Zap icon when connected
  - Footer note: "TanStack Query + Zod + Realtime"

### ✅ 6. Zod Validation

**Installed:** `zod`

**File `src/app/services/validators.ts`:**
- `LiveMatchApiSchema`, `LiveMatchesResponseSchema` (handles multiple provider formats)
- `PredictionApiSchema`
- `ContactFormSchema` (name min 2, email, subject min 1, message 10-5000)
- `PaystackRefSchema` (min 5 max 100 regex)
- `UserPlanSchema`
- Helpers: `validateLiveMatches()`, `validateContactForm()`

**Usage:**
- `AuthContext.upgrade()` validates ref via `PaystackRefSchema.safeParse`
- `Contact` form validated via edge function + frontend zod could be added
- `useFavorites` validates via `FavoriteSchema.parse`
- `useActivityTracking` validates via `ActivitySchema`

### ✅ 7. Edge Caching (Cache-Control)

**Updated `supabase/functions/server/index.tsx`:**
- Added middleware after CORS:
  - `/matches/*` → `Cache-Control: public, max-age=30, s-maxage=30, stale-while-revalidate=60` + `CDN-Cache-Control: public, max-age=60`
  - `/standings/*` → 300s cache
  - `/highlights*` → 600s cache
- Health endpoint now returns `{status: ok, phase: 3, features: [...]}`

**Benefit:** Supabase Edge CDN caches live data 30s, reduces RapidAPI quota usage.

### ✅ 8. Build & Verification

```bash
vite build
✓ 2557 modules transformed
✅ sitemap 21 urls
dist/sw.js + workbox
PWA precache 28 entries (3637 KiB)
✓ built in 5.74s
```

Chunks: vendor 75kB, supabase 55kB, query 12kB, helmet 6kB, etc. Now includes `PremiumUpgrade-UAEW6MEN.js` 15kB (secure flow), `index-BilnhVUa.js` 272kB.

---

## Files Added/Modified (Phase 3)

- `supabase/migrations/phase3_features.sql` (favorites, contact_messages, user_activity, verified_at)
- `supabase/functions/verify-paystack/index.ts` (new, verifies via Paystack API)
- `supabase/functions/send-contact-email.ts` (save to DB + email)
- `supabase/functions/server/index.tsx` (cache-control headers)
- `src/app/context/AuthContext.tsx` (secure upgrade, realtime subscription)
- `src/app/pages/PremiumUpgrade.tsx` (pending UI, polling, realtime)
- `src/app/hooks/useFavorites.ts` (new, zod, realtime)
- `src/app/hooks/useActivityTracking.ts` (new, zod)
- `src/app/hooks/useRealtimeScores.ts` (new, realtime)
- `src/app/services/validators.ts` (new, zod schemas)
- `src/app/components/sports/QuickLinks.tsx` (favorites UI + tracking)
- `src/app/components/sports/AppLayout.tsx` (activity tracking, realtime layer)

---

## Next Phase 4 Ideas
- Push notifications via OneSignal for favorite team goals (using favorites + realtime)
- Live chat / comments per match (Supabase realtime broadcast)
- AI predictions history chart + leaderboard aggregation
- Search with Fuse.js + Algolia
- i18n English/Swahili for Kenya market
- Admin dashboard for contact_messages, payment_logs, user_activity

Phase 3 complete, secure, realtime, personalized.
