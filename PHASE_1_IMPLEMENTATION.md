# Phase 1: Predictions – Detailed Implementation Plan

## Overview
Phase 1 focuses on making predictions the core engagement & monetization feature by embedding them into match cards, creating a dedicated daily feed, and building a gamified accuracy leaderboard.

**Timeline:** 6–10 days  
**Team Size:** 1–2 engineers  
**Success Metrics:** Prediction card CTR, premium conversion rate, leaderboard engagement

---

## Phase 1.1 – Embed Predictions in Score Cards

### Objective
Display prediction badges (win probability, odds) directly on live match cards so users see predictions at a glance without navigating away.

### Scope
- Design & implement prediction badge UI
- Integrate prediction API data into `MatchCard` component
- Add tap-through to detailed prediction view
- Mobile & desktop responsive testing

### Current State
- **Match card component:** `src/app/components/MatchCard.tsx`
- **Live matches hook:** `src/app/hooks/useMatches.ts`
- **Prediction API:** `src/app/services/footballApi.ts` (RapidAPI predictions endpoint)
- **Issue:** Predictions are siloed in `/predictions` tab; not visible on match cards

### Implementation Steps

#### 1. Data Integration (1 day)
- [ ] Extend `useMatches.ts` to fetch & merge prediction data alongside match data
  - Current: fetches live matches from Supabase edge function
  - New: also fetch predictions from `footballApi.ts` for those match IDs
  - Transform: attach `prediction: { homeWinOdds, drawOdds, awayWinOdds, confidence }` to each match object

**File:** `src/app/hooks/useMatches.ts`  
**Pseudo-code:**
```ts
const matches = await fetchLiveMatches();
const predictions = await fetchPredictions(matches.map(m => m.id));
return matches.map(m => ({
  ...m,
  prediction: predictions[m.id] || null
}));
```

#### 2. UI Component (1.5 days)
- [ ] Create `PredictionBadge.tsx` component
  - Shows win probability (e.g., "Home 65%")
  - Color-coded (green = high confidence, orange = medium, gray = low)
  - Compact design to fit match card
  - Tap-through indicator (chevron/link icon)

**File:** `src/app/components/PredictionBadge.tsx`  
**Props:**
```ts
{
  homeWinOdds: number;
  drawOdds: number;
  awayWinOdds: number;
  confidence: number; // 0–100
  onTap?: () => void;
}
```

#### 3. MatchCard Integration (0.5 days)
- [ ] Add `PredictionBadge` to `MatchCard`
  - Position: top-right corner (below live/final badge)
  - Conditional render: only if `match.prediction` exists
  - On tap: trigger modal or navigate to `/predictions/[matchId]`

**File:** `src/app/components/MatchCard.tsx`  
**Change:**
```tsx
<MatchCard match={match} />
// Add:
{match.prediction && (
  <PredictionBadge
    {...match.prediction}
    onTap={() => handlePredictionTap(match.id)}
  />
)}
```

#### 4. Detailed Prediction View (1 day)
- [ ] Create modal or page `PredictionDetail.tsx`
  - Shows full prediction breakdown (odds, confidence, reasoning if available)
  - CTA: "Compare bets" or "Set alert" (for logged-in users)
  - Back link to match card / matches list

**File:** `src/app/components/PredictionDetail.tsx` (or modal)

#### 5. Testing & QA (0.5 days)
- [ ] Unit tests for `PredictionBadge` component
- [ ] Integration test: verify predictions load and display on match cards
- [ ] Mobile & desktop responsive testing
- [ ] Error handling: graceful fallback if prediction fetch fails
- [ ] Measure CTR on prediction badges (analytics event)

### Dependencies
- Prediction API must return data in real-time (or near-real-time)
- Match IDs must match between matches API and predictions API

### Success Criteria
- ✅ Prediction badge visible on 100% of matches with prediction data
- ✅ Tap-through CTR ≥ 5% in first week
- ✅ No performance regression (match card render time < 100ms)
- ✅ Mobile responsiveness verified

---

## Phase 1.2 – Daily Predictions Feed

### Objective
Create a dedicated page/feed where users discover curated predictions for upcoming & live matches, driving engagement and premium upsell.

### Scope
- Build predictions feed page/component
- Add filters (sport, league, confidence level)
- Implement pagination/infinite scroll
- Add bookmark/favorite predictions (logged-in only)
- Mobile-optimized

### Current State
- **Predictions tab exists:** `src/app/pages/PredictionsList.tsx`
- **Issue:** Uses mock data; not integrated with real match schedule or betting odds

### Implementation Steps

#### 1. Refactor PredictionsList Page (1 day)
- [ ] Extend `PredictionsList.tsx` to fetch real prediction data
  - Input: upcoming matches (next 48h)
  - Query predictions for those matches
  - Rank by confidence + recency

**File:** `src/app/pages/PredictionsList.tsx`  
**Changes:**
```ts
const { data: upcomingMatches } = useMatches({ upcoming: true, hours: 48 });
const { data: predictions } = usePredictions(upcomingMatches.map(m => m.id));
const sorted = predictions.sort((a, b) => b.confidence - a.confidence);
```

#### 2. Prediction Card Component (0.5 days)
- [ ] Create `PredictionCard.tsx` for feed display
  - Show: match (home vs. away), sport/league, predicted outcome, odds, confidence %
  - Action buttons: "View details", "Bookmark" (if logged in), "Set alert"
  - Color-coded confidence (high/med/low)

**File:** `src/app/components/PredictionCard.tsx`

#### 3. Filters & Sorting (1 day)
- [ ] Add filter sidebar:
  - Sport (football, basketball, tennis, etc.)
  - Confidence level (high: 70+%, medium: 50–70%, low: <50%)
  - Time range (today, tomorrow, this week)
- [ ] Sorting: confidence (default), time, latest added
- [ ] Persist filters to URL params or local state

**File:** `src/app/components/PredictionFilters.tsx`

#### 4. Pagination/Infinite Scroll (0.5 days)
- [ ] Implement pagination (10 predictions per page)
- [ ] Or: infinite scroll with "Load more" button
- [ ] Skeleton loaders while fetching

#### 5. Bookmark/Favorite System (1 day)
- [ ] Add `useSavedPredictions.ts` hook
  - Store in Supabase (`user_saved_predictions` table)
  - Toggle bookmark state on card
  - Show "Saved" indicator

**File:** `src/app/hooks/useSavedPredictions.ts`  
**Table schema:**
```sql
CREATE TABLE user_saved_predictions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  prediction_id uuid,
  created_at timestamp,
  UNIQUE(user_id, prediction_id)
);
```

#### 6. Testing & Analytics (0.5 days)
- [ ] Unit tests for filters, sorting, bookmark toggle
- [ ] Integration test: verify predictions load, filter, and persist
- [ ] Analytics events: "Filter applied", "Prediction bookmarked", "CTR to details"
- [ ] Mobile responsive testing

### Dependencies
- Real prediction API must support bulk queries (batch by match IDs)
- Supabase schema for `user_saved_predictions` must be created
- Match schedule (upcoming matches) must be available

### Success Criteria
- ✅ Feed loads with real predictions in < 2s
- ✅ Filters work correctly (at least 3 filter types)
- ✅ Bookmark toggle works for logged-in users
- ✅ Mobile responsiveness verified
- ✅ CTR to prediction details ≥ 10%

---

## Phase 1.3 – Prediction Accuracy Leaderboard

### Objective
Rank predictions by accuracy; build gamification and trust in prediction quality. Drive retention and premium upsell ("Pro: detailed accuracy breakdowns").

### Scope
- Track prediction accuracy (hits/misses)
- Build leaderboard UI (top 10, weekly, all-time)
- User profile pages with prediction stats
- Premium feature: detailed accuracy filters
- Real-time leaderboard updates

### Current State
- **No accuracy tracking:** predictions are consumed but not measured against match outcomes
- **No user profiles:** no concept of a "prediction predictor" profile

### Implementation Steps

#### 1. Accuracy Tracking Schema (1 day)
- [ ] Create Supabase tables:

**Tables:**
```sql
CREATE TABLE predictions (
  id uuid PRIMARY KEY,
  match_id uuid,
  sport TEXT,
  home_team TEXT,
  away_team TEXT,
  prediction_type TEXT, -- 'home_win', 'draw', 'away_win'
  odds NUMERIC,
  confidence INT (0-100),
  created_at timestamp,
  match_start_at timestamp
);

CREATE TABLE prediction_outcomes (
  id uuid PRIMARY KEY,
  prediction_id uuid REFERENCES predictions,
  actual_result TEXT, -- 'home_win', 'draw', 'away_win'
  is_correct BOOLEAN,
  updated_at timestamp
);

CREATE TABLE prediction_stats (
  user_id uuid PRIMARY KEY,
  total_predictions INT,
  correct_predictions INT,
  accuracy NUMERIC, -- correct / total
  weekly_rank INT,
  all_time_rank INT,
  last_updated timestamp
);
```

#### 2. Accuracy Calculation Engine (1 day)
- [ ] Create Supabase edge function: `calculate_accuracy`
  - Triggered when match outcome is finalized
  - Queries `predictions` for that match
  - Compares predicted outcome vs. actual result
  - Updates `prediction_outcomes` and `prediction_stats`
  - Triggers leaderboard recalculation

**File:** `src/supabase/functions/calculate_accuracy/index.ts`

#### 3. Leaderboard Component (1.5 days)
- [ ] Create `LeaderboardPage.tsx` with:
  - **Tabs:** All-time, Weekly, Monthly
  - **Columns:** Rank, Predictor name, Accuracy %, Predictions count, Streak
  - **Row action:** Tap to view predictor profile
  - **Real-time updates:** WebSocket or polling every 5 min

**File:** `src/app/pages/LeaderboardPage.tsx`

- [ ] Create `PredictorProfile.tsx`
  - Shows predictor's stats, recent predictions, accuracy over time
  - Chart: accuracy trend (7-day, 30-day, all-time)
  - CTA for logged-in users: "Follow" or "Copy predictions"

**File:** `src/app/pages/PredictorProfile.tsx`

#### 4. UI Enhancements (1 day)
- [ ] Design leaderboard table (Radix Table or similar)
  - Responsive on mobile (collapse columns, show rank + name + accuracy)
- [ ] Design predictor profile card
- [ ] Add leaderboard link to nav (bottom tab or sidebar)

#### 5. Premium Features (0.5 days)
- [ ] Gate advanced filters behind premium:
  - Filter by sport, confidence, accuracy threshold
  - Download predictions CSV
  - Email accuracy digest
- [ ] Show "Unlock with Premium" CTA for free users

#### 6. Testing & Analytics (0.5 days)
- [ ] Unit tests: accuracy calculation logic
- [ ] Integration test: verify leaderboard rank updates correctly
- [ ] Analytics events: "Leaderboard viewed", "Predictor followed", "Profile viewed"
- [ ] Mobile responsive testing
- [ ] Performance: leaderboard load < 1.5s

### Dependencies
- Match outcome data must be pushed to Supabase in real-time (from match API)
- Supabase edge functions & real-time subscriptions
- User authentication must be working

### Success Criteria
- ✅ Accuracy tracked for 100% of predictions
- ✅ Leaderboard updates within 5 min of match completion
- ✅ Leaderboard loads in < 1.5s
- ✅ Premium gate functions (show "unlock" for free users)
- ✅ Mobile responsiveness verified
- ✅ Leaderboard engagement ≥ 15% of DAU

---

## Summary: Phase 1 Implementation Timeline

| Task | Duration | Owner | Status |
|------|----------|-------|--------|
| 1.1: Predictions Badge | 2–3 days | Engineer 1 | Pending |
| 1.2: Daily Feed | 2–3 days | Engineer 1 | Pending |
| 1.3: Leaderboard | 3–4 days | Engineer 1 + 2 | Pending |
| Integration & QA | 1–2 days | Engineer 2 | Pending |
| **Total** | **6–10 days** | — | — |

---

## Architecture Notes

### Data Flow
1. **Match data** (live/upcoming) → `useMatches()` hook
2. **Prediction data** → `footballApi.ts` or Supabase edge function
3. **Merge** → match + prediction in feed/cards
4. **Outcome data** → pushed to Supabase when match concludes
5. **Accuracy calculation** → Supabase edge function triggers
6. **Leaderboard** → recalculates from `prediction_stats` table

### State Management
- **Matches & Predictions:** Local React state + React Query for caching
- **Saved predictions:** Supabase (auth-gated)
- **Leaderboard & stats:** Supabase (real-time subscription or polling)

### API/Third-Party Integrations
- **Predictions API:** RapidAPI (football predictions endpoint)
- **Match outcomes:** Current API or manual data entry
- **Supabase:** Real-time database + edge functions
- **Analytics:** Segment or Amplitude for CTR, engagement tracking

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Prediction API quota exhaustion | High | Implement caching, batch queries, consider fallback API |
| Match outcome data delay | Medium | Set SLA for outcome data; use scheduled backfill |
| Leaderboard real-time latency | Medium | Use polling + debounce; or WebSocket if available |
| Mobile performance (leaderboard table) | Medium | Virtualize long lists; collapse columns on mobile |
| User authentication missing | High | Ensure auth is fully wired before 1.2 & 1.3 |

---

## Next Steps

1. **Validate prediction API:** Ensure it can return bulk predictions and real-time data
2. **Finalize schema:** Review Supabase tables with stakeholders
3. **Design phase:** Get sign-off on badge, card, and leaderboard UI
4. **Parallel work:** Start 1.1 while design is finalized for 1.2 & 1.3

