# Supabase Edge Function Secret Checklist

Use this checklist when moving each RapidAPI integration behind a dedicated Supabase Edge Function. Keep RapidAPI secrets server-side and preserve the response shapes and fallbacks currently expected by the client.

## Function and secret mapping

- [ ] `supabase/functions/football-predictions/index.ts`
  - Upstream: `football-prediction-api.p.rapidapi.com`
  - Secret: `RAPIDAPI_FOOTBALL_PREDICTION_KEY`
  - Replace shared `rapidapi` prediction, market, and federation routing.
  - Preserve prediction parsing for arrays and `{ data | predictions | results }`.
  - Preserve mock prediction fallback.

- [ ] `supabase/functions/betigolo-sample/index.ts`
  - Upstream: `betigolo-predictions.p.rapidapi.com`
  - Secret: `RAPIDAPI_BETIGOLO_PREDICTIONS_KEY`
  - Replace the shared `rapidapi` sample route.
  - Preserve API inspector and sample response behavior.

- [ ] `supabase/functions/betigolo-history/index.ts`
  - Upstream: `betigolo-tips.p.rapidapi.com`
  - Secret: `RAPIDAPI_BETIGOLO_TIPS_KEY`
  - Replace `server/routes/betigolo-history.ts` and `server/src/routes/betigolo-history.ts` callers.
  - Preserve `demoHistory` and `{ data | history | predictions | results | matches | sample }` parsing.

- [ ] `supabase/functions/sure-bets/index.ts`
  - Upstream: `today-football-prediction.p.rapidapi.com`
  - Secret: `RAPIDAPI_TODAY_FOOTBALL_PREDICTION_KEY`
  - Replace shared sure-bets league and prediction routing.
  - Preserve local-storage caching, unavailable-provider handling, and `{ pagination, matches }` responses.

- [ ] `supabase/functions/live-matches-backup/index.ts`
  - Upstream: `allsportsapi2.p.rapidapi.com`
  - Secret: `RAPIDAPI_ALLSPORTS_KEY`
  - Replace browser-side RapidAPI access in `src/app/services/allSportsApi.ts`.
  - Preserve quota detection, cached matches, and backup match fallback.

- [ ] `supabase/functions/live-matches/index.ts`
  - Upstream: `football-highlights-api.p.rapidapi.com`
  - Secret: `RAPIDAPI_FOOTBALL_HIGHLIGHTS_KEY`
  - Replace live and upcoming match routes from `supabase/functions/server/index.tsx`.
  - Preserve `mockMatches`, cached data, and `live` / `events` / array response support.

- [ ] `supabase/functions/live-stream/index.ts`
  - Upstream: `football-live-stream-api.p.rapidapi.com`
  - Secret: `RAPIDAPI_FOOTBALL_LIVE_STREAM_KEY`
  - Replace `/stream/:matchSlug` callers.
  - Preserve `{ success, streamData, matchSlug }` and `DemoStreamPlayer` fallback behavior.

- [ ] `supabase/functions/match-highlights/index.ts`
  - Upstream: `live-football-streaming-api.p.rapidapi.com`
  - Secret: `RAPIDAPI_LIVE_FOOTBALL_STREAMING_KEY`
  - Replace per-match `/highlights/:matchId` callers.
  - Preserve `{ success, highlights, matchId }`.

- [ ] `supabase/functions/highlights-list/index.ts`
  - Upstream: `free-football-api-data.p.rapidapi.com`
  - Secret: `RAPIDAPI_FREE_FOOTBALL_API_DATA_HIGHLIGHTS_KEY`
  - Replace general highlights-list requests.
  - Preserve the friendly unavailable-highlights UI fallback.

- [ ] `supabase/functions/event-detail/index.ts`
  - Upstream: choose one event provider before implementation.
  - Suggested secrets:
    - `RAPIDAPI_FREE_FOOTBALL_API_DATA_EVENT_KEY`
    - or `RAPIDAPI_FREE_API_LIVE_FOOTBALL_DATA_EVENT_KEY`
  - Preserve `{ success, event, eventId }`.
  - Do not create two functions with the same `event-detail` name. Split the function name if both providers remain, for example `event-detail-free-football` and `event-detail-live-football`.

- [ ] `supabase/functions/standings/index.ts`
  - Upstream: `free-api-live-football-data.p.rapidapi.com`
  - Secret: `RAPIDAPI_FREE_API_LIVE_FOOTBALL_DATA_STANDINGS_KEY`
  - Replace standings requests from the shared server function.
  - Preserve `premierLeagueStandings` and `standing` / `standings` / `data` parsing.

- [ ] `supabase/functions/news-feed/index.ts`
  - Upstream: `football-news11.p.rapidapi.com`
  - Secret: `RAPIDAPI_FOOTBALL_NEWS_KEY`
  - Replace or rename `supabase/functions/football-news/index.ts`.
  - Update `src/app/components/sports/useNewsHook.ts`.
  - Preserve `fallbackNews`, demo/live mode, and `news` / `data` / `articles` parsing.

- [ ] `supabase/functions/transfers/index.ts`
  - Upstream: `free-api-live-football-data.p.rapidapi.com`
  - Secret: `RAPIDAPI_FOOTBALL_TRANSFERS_KEY`
  - Replace or rename `supabase/functions/football-transfers/index.ts`.
  - Update `src/app/components/sports/useTransfersHook.ts`.
  - Preserve `fallbackTransfers` and `data` / `transfers` / `results` parsing.

## Client migration checklist

- [ ] Update `src/app/services/supabaseApi.ts` to invoke dedicated function names instead of shared `rapidapi` routing.
- [ ] Update `src/app/services/footballApi.ts` callers.
- [ ] Update `src/app/services/betigoloApi.ts` callers.
- [ ] Update `src/app/services/allSportsApi.ts` to remove direct browser-side RapidAPI requests.
- [ ] Update `src/app/hooks/useMatches.ts` and `src/app/hooks/useStandings.ts`.
- [ ] Update `src/app/components/sports/ScoreSimulator.ts` and `UpcomingMatchesHook.ts`.
- [ ] Update `LiveStreamViewer.tsx`, `HighlightViewer.tsx`, `SureBets.tsx`, and `PredictionsList.tsx`.
- [ ] Update `useNewsHook.ts` and `useTransfersHook.ts` if function names change.
- [ ] Keep Supabase project configuration and anon-key usage unchanged.

## Secret deployment checklist

- [ ] Add each secret to Supabase Edge Function secrets using the exact names above.
- [ ] Remove old shared RapidAPI secrets only after all functions are deployed and verified.
- [ ] Confirm no RapidAPI secret is exposed through `VITE_*` variables or client bundles.
- [ ] Confirm every function returns the response envelope expected by its existing callers.
- [ ] Test primary failure, quota-exceeded, empty-response, and cached/demo fallback paths.
- [ ] Deploy functions before switching client callers.
- [ ] Remove obsolete shared routes only after client migration and fallback verification.
