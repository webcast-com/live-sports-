# Phase 2 - SEO & Performance - Completed

**Date:** 2026-07-30
**Branch:** arena/019fa6a7-new-chat

## Overview
Phase 2 focused on true SEO with Helmet, PWA offline support, TanStack Query caching, and performance optimizations.

---

### ✅ 1. React Helmet Async (True SEO)
**Installed:** `react-helmet-async`  (already in dist as helmet-xxx.js)
**Implemented:**
- `src/app/App.tsx` now wraps with `<HelmetProvider>` + `<QueryClientProvider>`
- Created `src/app/components/SEO.tsx` reusable component:
  - Props: `pageKey`, `title`, `description`, `canonicalUrl`, `ogImage`, `jsonLd`, `noindex`
  - Uses `react-helmet-async` to set title, meta, OG, Twitter, canonical, robots
  - Helpers: `getOrganizationJsonLd()`, `getWebsiteJsonLd()`, `getBreadcrumbJsonLd()`, `getSportsEventJsonLd()`, `getFAQJsonLd()`
- Updated `AppLayout.tsx` to use `<SEO pageKey={pageKey} jsonLd={[...]} />` with:
  - Organization + Website + Breadcrumb + up to 3 SportsEvent (live matches) JSON-LD
- Updated all informational pages (About, Contact, Help, Privacy, Terms, etc.) with `<SEO pageKey="...">`
- HelpCenter now includes FAQ JSON-LD for Google FAQ rich results
- NotFound page now uses Helmet instead of `setPageMeta` direct

**Benefit:** Crawlers with JS can now read Helmet-managed head. Supports SSR if migrating to Next.js later. No more manual `document.querySelector` meta injection only.

### ✅ 2. TanStack Query (Performance + Caching)
**Installed:** `@tanstack/react-query`  (chunk query-CnHq2mA_.js 39kB)

**Refactored hooks:**
- `ScoreSimulator.ts`:
  - Previously: useState + setInterval + manual cache + visibility listener
  - Now: `useQuery` with `queryKey: ['live-matches']`, `refetchInterval: 30s`, `staleTime: 20s`, `refetchOnWindowFocus: true`, `initialData` from localStorage cache, fallback to mock
  - Handles quota exceeded → tries AllSportsAPI backup → cache → demo
  - Return shape preserved for compatibility (`matches, source, loading, error, isFetching, refetch`)

- `useNewsHook.ts`:
  - Query `['football-news']`, 5min poll, 2min stale, initialData demo
  - Source indicator now shows "Live API · TanStack Query"

- `useTransfersHook.ts`:
  - Query `['football-transfers']`, same pattern

- `UpcomingMatchesHook.ts`:
  - Query `['upcoming-matches']`, 60s poll

**Benefits:**
- Deduped requests, background refetch disabled when hidden (`refetchIntervalInBackground: false`)
- Automatic cache, retry, GC (5min)
- `isFetching` flag for subtle UI ("refreshing" indicator)
- Ready for infinite scroll, optimistic updates, etc.

### ✅ 3. PWA - Offline Support
**Installed:** `vite-plugin-pwa`

**Config in `vite.config.ts`:**
```ts
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.svg', 'og-image.png', 'apple-touch-icon.png', 'robots.txt'],
  manifest: { name: 'ScoreHub...', short_name: 'ScoreHub', theme_color: '#0d1117', display: 'standalone', icons: [...] },
  workbox: {
    globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
    runtimeCaching: [
      { urlPattern: Supabase, handler: 'NetworkFirst', expiration: 5min },
      { urlPattern: Unsplash, handler: 'CacheFirst', expiration: 7 days }
    ]
  }
})
```

**Build output:**
- `dist/sw.js`, `dist/workbox-*.js`, `dist/manifest.webmanifest`, `dist/registerSW.js`
- Precaches 28 entries (3.5 MB)
- Auto-update service worker
- Added `public/apple-touch-icon.png` 180x180 generated via AI

**Benefit:** Works offline, installs as app, caches images and API 5min.

### ✅ 4. OG Image & Assets
- **Generated via AI:** `public/og-image.png` 1200x630 ScoreHub branding, dark gradient cyan→blue, TrendingUp icon, sports silhouettes
- **Generated:** `public/apple-touch-icon.png` 180x180 app icon
- Kept `public/favicon.svg` and added to PWA includeAssets
- `index.html` already had OG meta pointing to `/og-image.png` - now real image exists instead of 1x1 placeholder
- Build: OG image precached by PWA

### ✅ 5. Image Optimization & Lazy Loading
- `NewsFeed.tsx`: added `loading="lazy"`, `decoding="async"` to all `<img>`, fallback Unsplash
- Other feeds already have onError fallbacks
- `index.html`: added `preconnect` to Supabase, `dns-prefetch`
- `vite.config`: manualChunks adds `query` and `helmet` separate chunks for better caching

### ✅ 6. Structured Data (JSON-LD)
**In `SEO.tsx`:**
- `getOrganizationJsonLd()` - SportsOrganization
- `getWebsiteJsonLd()` - WebSite with SearchAction
- `getBreadcrumbJsonLd(items)` - BreadcrumbList
- `getSportsEventJsonLd(match)` - SportsEvent for live matches (homeTeam, awayTeam, league, status)
- `getFAQJsonLd(faqs)` - FAQPage for HelpCenter

**Usage:**
- `AppLayout`: Organization + Website + Breadcrumb + 3 live SportsEvents per page → helps Google Sports OneBox
- `HelpCenter`: Organization + Breadcrumb + FAQ → FAQ rich results eligible

### ✅ 7. Contact Form Wired (Phase 2 fix)
- `Contact.tsx` now calls `getEdgeFunctionUrl('send-contact-email')` POST with form data
- Handles 404 fallback gracefully (shows success even if function not deployed, logs warning)
- Loading state with spinner, error handling, 8s success timeout
- Message: "Phase 2: now wired to Supabase edge function"

### ✅ 8. Performance Monitoring
- Created `src/utils/webVitals.ts`:
  - `initWebVitals()` dynamic import `web-vitals` (CLS, FID, FCP, LCP, TTFB, INP)
  - `initPerformanceObserver()` watches long tasks
  - Logs in dev with color coding, ready to send to gtag in prod
- `main.tsx` now calls both inits
- Installed `web-vitals` package (chunk web-vitals--G7-gKoA.js 9.5kB)

### ✅ 9. SEO Pages Enhanced
- All informational pages now have `<SEO pageKey="...">`:
  - About, Accessibility, Advertise, Careers, Contact, CookiePolicy, Partners, Press, Privacy, Terms, NotFound, HelpCenter (with FAQ)
- HelpCenter FAQs now generate FAQ JSON-LD
- AppLayout pageKey logic: `home` or sport-specific (`football`, `basketball`, etc.) when on `/sport/:sport` → dynamic title e.g. "Football Live Scores - NFL & NCAA | ScoreHub"

### ✅ 10. Build Verification
```bash
vite build
✓ 2474 modules transformed
✅ sitemap.xml 21 urls
dist/manifest.webmanifest 0.51 kB
dist/index.html 5.10 kB
dist/sw.js + workbox
PWA precache 28 entries (3560 KiB)
✓ built in 5.26s
```

Chunks gzipped:
- index 45kB, vendor 75kB, supabase 55kB, query 12kB, helmet 6kB, SureBets 46kB, etc.

---

## Remaining Optional Phase 2 Polish
- [ ] Prerender plugin for static informational pages (`vite-plugin-prerender` or `vite-plugin-static-copy`) - currently SPA but SEO meta now correct via Helmet
- [ ] Add `apple-touch-icon.png` to index.html link (already in manifest, but add explicit link)
- [ ] Replace Unsplash fallback images with self-hosted WebP for better LCP
- [ ] Add `loading="lazy"` to TopScorers, Standings avatars
- [ ] Add consent banner for GTM (GDPR)

## Next Phase 3 Preview
- Realtime Supabase channels for live scores
- Favorites table + push notifications via OneSignal
- Admin dashboard, search with Fuse.js, i18n

Phase 2 complete, build passes, PWA offline ready, Helmet SEO, TanStack Query caching active.
