# Live Score Dashboard – Product Roadmap

## Vision
Build a sports prediction platform with monetized premium features around prediction accuracy, expert insights, and real-time match alerts.

---

## Phase 1: Predictions (Core Monetization)

### Phase 1.1 – Embed Predictions in Score Cards
**Goal:** Show prediction badges/odds directly on live match cards  
**Effort:** 2–3 days  
**Impact:** High – immediate visibility, drives CTR  

**Tasks:**
- Design prediction badge UI (win probability, odds)
- Integrate prediction API data into match cards
- Add tap-through to prediction details
- Test on mobile & desktop

### Phase 1.2 – Daily Predictions Feed
**Goal:** Dedicated feed of curated predictions for upcoming matches  
**Effort:** 2–3 days  
**Impact:** High – engagement multiplier, premium upsell opportunity  

**Tasks:**
- Create predictions-feed page/component
- Add filter by sport/league
- Implement pagination or infinite scroll
- Add "bookmark" / "favorite" predictions (logged-in users only)

### Phase 1.3 – Prediction Accuracy Leaderboard
**Goal:** Rank predictions by accuracy; build gamification  
**Effort:** 3–4 days  
**Impact:** High – drives user retention & engagement  

**Tasks:**
- Track prediction accuracy (hits/misses)
- Build leaderboard UI (top 10, weekly, all-time)
- Add user profile pages with stats
- Premium feature: detailed accuracy breakdowns

---

## Phase 2: Personalization & Favorites

### Phase 2.1 – Favorite Teams
**Goal:** Let users follow teams and personalize their feed  
**Effort:** 1–2 days  
**Impact:** High – reduces friction, drives repeat visits  

**Tasks:**
- Add "favorite teams" selection UI (onboarding or settings)
- Filter matches by favorite teams
- Store preferences (Supabase)
- Show favorite teams first in feeds

### Phase 2.2 – Alerts System
**Goal:** Notify users of match starts, predictions, leaderboard changes  
**Effort:** 4–5 days  
**Impact:** Medium – engagement multiplier, retention boost  

**Tasks:**
- Implement push notification infrastructure (Firebase Cloud Messaging or similar)
- Set up backend jobs to trigger alerts
- Add user alert preferences (in-app settings)
- Test on mobile

### Phase 2.3 – Personalized Homepage
**Goal:** Tailor homepage to user interests (favorite teams, sports, predictions)  
**Effort:** 3–4 days  
**Impact:** Medium – reduces discovery friction  

**Tasks:**
- Refactor homepage to show personalized sections
- Prioritize favorite teams' matches
- Show trending predictions in user's favorite sports
- A/B test recommendation algorithms

---

## Phase 3: Monetization

### Phase 3.1 – Betting Integration
**Goal:** Partner with sportsbooks; embed odds, live betting  
**Effort:** 5–7 days + partnerships  
**Impact:** Very High – revenue driver  

**Tasks:**
- Identify betting partner(s) (Draftkings, DraftKings API, etc.)
- Integrate odds feed
- Build "bet slip" UI
- Implement affiliate tracking
- Legal: ensure compliance (terms, privacy)

### Phase 3.2 – Tiered Premium Tiers
**Goal:** Create free → basic → pro subscription model  
**Effort:** 3–4 days  
**Impact:** High – immediate revenue  

**Tiers:**
- **Free:** Daily predictions feed, leaderboard, favorites
- **Basic ($4.99/mo):** Early access to predictions, advanced filters
- **Pro ($9.99/mo):** Expert picks, detailed accuracy stats, betting alerts, no ads

**Tasks:**
- Design tier comparison table
- Implement paywall (Stripe integration)
- Gate features based on subscription level
- Build subscription management UI (Supabase)

---

## Phase 4: Engagement & Community

### Phase 4.1 – Highlight Clips & Playback
**Goal:** Embed short goal/highlight videos in match cards  
**Effort:** 2–3 days (if API available)  
**Impact:** Medium – stickiness, mobile engagement  

**Tasks:**
- Integrate highlight API (e.g., ESPN, RapidAPI highlight provider)
- Design video player UI
- Stream/download optimization for mobile

### Phase 4.2 – Match Commentary & Live Chat
**Goal:** Show live commentary, user predictions chat  
**Effort:** 4–5 days  
**Impact:** Medium – community engagement  

**Tasks:**
- Integrate WebSocket for live updates
- Build comment/chat UI (rate-limit for free users)
- Moderation rules

### Phase 4.3 – Expert Follow System
**Goal:** Users can follow expert predictors; see their picks  
**Effort:** 4–5 days  
**Impact:** Medium – trust building, retention  

**Tasks:**
- Tag/curate "expert" predictions
- Build expert profiles
- Show expert's latest picks & leaderboard position
- Premium feature: expert alerts

---

## Phase 5: Infrastructure & Quality

### Phase 5.1 – App Architecture Cleanup
**Goal:** Decide on single router approach; merge features  
**Effort:** 3–5 days  
**Impact:** High – unblocks stream/highlights, cleaner codebase  

**Tasks:**
- Audit current layouts (tabbed vs. route-based)
- Choose primary routing strategy
- Refactor to single approach
- Update navigation components

### Phase 5.2 – Improve API Reliability
**Goal:** Reduce demo fallbacks; add caching, real-time updates  
**Effort:** 3–5 days  
**Impact:** High – stability, monetization prerequisite  

**Tasks:**
- Audit API quota usage & uptime
- Implement caching layer (Redis or Supabase)
- Add fallback data sources
- Replace `ScoreSimulator` with WebSocket or polling
- Optimize Supabase edge functions

### Phase 5.3 – Secure Client-Side Secrets
**Goal:** Move RapidAPI key to backend  
**Effort:** 1–2 days  
**Impact:** High – security, prevent rate-limit abuse  

**Tasks:**
- Create Supabase edge function proxy for RapidAPI calls
- Remove key from frontend `.env`
- Route API calls through proxy
- Test & monitor rate limits

---

## Implementation Priorities by Impact vs. Effort

### Quick Wins (Start Here)
1. **Embed predictions in score cards** (Phase 1.1) — 2–3 days
2. **Create Daily Predictions feed** (Phase 1.2) — 2–3 days
3. **Add favorite teams** (Phase 2.1) — 1–2 days

### High-Impact Medium Effort
4. **Prediction accuracy leaderboard** (Phase 1.3) — 3–4 days
5. **Tiered premium tiers** (Phase 3.2) — 3–4 days
6. **Personalized homepage** (Phase 2.3) — 3–4 days

### Strategic / Longer Term
7. **Betting integration** (Phase 3.1) — 5–7 days + partnerships
8. **Alerts system** (Phase 2.2) — 4–5 days
9. **Expert follow system** (Phase 4.3) — 4–5 days
10. **App architecture cleanup** (Phase 5.1) — 3–5 days

---

## Suggested First Sprint

Based on monetization goal and isolated-predictions pain point:

**Week 1–2:** Embed predictions in live score cards + daily predictions feed (quick wins + biggest engagement lift)  
**Week 3:** Add favorite teams + personalized homepage  
**Week 4:** Prediction leaderboard + launch tiered premium (revenue multiplier)  

This gives a **2-month path to meaningfully higher ARPU and conversion** without requiring betting partnerships or major refactoring upfront.

---

## Success Metrics to Track

- **Prediction card CTR** — % of users who tap a prediction
- **Premium conversion rate** — free → paid
- **Free-to-paid prediction views ratio**
- **Daily active users** — especially mobile
- **Feature adoption** — favorites, alerts, leaderboard engagement
- **API uptime & latency** — stability metrics
- **Prediction accuracy** — track & highlight top performers

---

## Notes

- **Architecture:** Consolidating layouts is a prerequisite for stream/highlights and route-based sport filters.
- **API Reliability:** Heavy reliance on demo fallbacks suggests quota/uptime issues; prioritize Supabase caching and edge functions.
- **Security:** Moving RapidAPI key to backend prevents key abuse and protects against rate-limiting.

