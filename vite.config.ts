import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import { generateSitemap } from './src/utils/sitemapGenerator'
import { VitePWA } from 'vite-plugin-pwa'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

function sitemapGenerator() {
  return {
    name: 'sitemap-generator',
    writeBundle() {
      try {
        const sitemap = generateSitemap()
        fs.mkdirSync(path.resolve(__dirname, 'dist'), { recursive: true })
        fs.writeFileSync(path.resolve(__dirname, 'dist', 'sitemap.xml'), sitemap)
        console.log('✅ sitemap.xml generated with', (sitemap.match(/<url>/g) || []).length, 'urls')
      } catch (e) {
        console.warn('Sitemap generation failed', e)
      }
    },
  }
}

// Phase 5 Optional - Prerender static pages for SEO (100% completion)
function prerenderStatic() {
  return {
    name: 'prerender-static',
    writeBundle() {
      try {
        const distDir = path.resolve(__dirname, 'dist')
        const templatePath = path.join(distDir, 'index.html')
        if (!fs.existsSync(templatePath)) {
          console.warn('Prerender: dist/index.html not found, skipping')
          return
        }
        const template = fs.readFileSync(templatePath, 'utf-8')

        // SEO meta for prerender - mirrors src/utils/seoMeta.ts
        const DOMAIN = process.env.VITE_SITE_URL || 'https://livescoresgames.netlify.app'
        const seoMap: Record<string, { title: string; desc: string; canonical: string }> = {
          '/': { title: 'ScoreHub - Live Sports Scores, Highlights & Standings | NFL, NBA, Soccer, MLB', desc: 'Get instant live scores, match highlights, league standings, and real-time updates for all major sports leagues worldwide.', canonical: DOMAIN },
          '/predictions': { title: 'Sports Predictions & Analysis - Expert Picks | ScoreHub', desc: 'Get accurate sports predictions, expert picks, and detailed analysis for upcoming matches across all major leagues.', canonical: `${DOMAIN}/predictions` },
          '/results': { title: 'Recent Sports Results - Match Results & Picks | ScoreHub', desc: 'Review recent sports results, completed matches, and prediction picks across major leagues.', canonical: `${DOMAIN}/results` },
          '/leaderboard': { title: 'Prediction Leaderboard - Top Predictors | ScoreHub', desc: 'View the global leaderboard of top sports predictors. Track accuracy stats and performance rankings.', canonical: `${DOMAIN}/leaderboard` },
          '/sure-bets': { title: 'Sure Bets & Sports Picks - ScoreHub', desc: 'Explore curated sports picks and high-confidence match insights from ScoreHub.', canonical: `${DOMAIN}/sure-bets` },
          '/premium': { title: 'Premium Membership - ScoreHub Pro & Basic Tiers', desc: 'Unlock premium features: expert picks, advanced filters, detailed stats, and ad-free experience. Choose Basic ($4.99/mo) or Pro ($9.99/mo).', canonical: `${DOMAIN}/premium` },
          '/referral': { title: 'Referral Program - Earn Premium Days | ScoreHub', desc: 'Refer friends to ScoreHub and earn 3 days premium for each friend who joins. Share your referral code and grow the community.', canonical: `${DOMAIN}/referral` },
          '/about': { title: 'About ScoreHub - Live Sports Scores & Insights', desc: 'Learn more about ScoreHub and our mission to make live sports information easier to follow.', canonical: `${DOMAIN}/about` },
          '/careers': { title: 'Careers at ScoreHub', desc: 'Explore career opportunities and join the team building better live sports experiences.', canonical: `${DOMAIN}/careers` },
          '/press': { title: 'ScoreHub Press & Media', desc: 'Find ScoreHub press resources, company news, and media information.', canonical: `${DOMAIN}/press` },
          '/contact': { title: 'Contact ScoreHub', desc: 'Get in touch with the ScoreHub team for support, partnerships, and general enquiries.', canonical: `${DOMAIN}/contact` },
          '/advertise': { title: 'Advertise with ScoreHub', desc: 'Reach sports fans with advertising opportunities across the ScoreHub platform.', canonical: `${DOMAIN}/advertise` },
          '/partners': { title: 'ScoreHub Partners', desc: 'Discover partnership opportunities with ScoreHub for sports, media, and technology brands.', canonical: `${DOMAIN}/partners` },
          '/help': { title: 'Help Center - ScoreHub', desc: 'Find answers and support for using ScoreHub live scores, predictions, and account features.', canonical: `${DOMAIN}/help` },
          '/terms': { title: 'Terms of Service - ScoreHub', desc: 'Read the terms and conditions governing use of the ScoreHub platform.', canonical: `${DOMAIN}/terms` },
          '/privacy': { title: 'Privacy Policy - ScoreHub', desc: 'Read how ScoreHub collects, uses, and protects information on the platform.', canonical: `${DOMAIN}/privacy` },
          '/cookies': { title: 'Cookie Policy - ScoreHub', desc: 'Learn how ScoreHub uses cookies and similar technologies across the platform.', canonical: `${DOMAIN}/cookies` },
          '/accessibility': { title: 'Accessibility Statement - ScoreHub', desc: 'Learn about ScoreHub accessibility efforts and how to request assistance.', canonical: `${DOMAIN}/accessibility` },
          '/sport/football': { title: 'Football Live Scores - NFL & NCAA | ScoreHub', desc: 'Follow live American football scores, NFL standings, and match highlights.', canonical: `${DOMAIN}/sport/football` },
          '/sport/basketball': { title: 'Basketball Live Scores - NBA | ScoreHub', desc: 'Get NBA live scores, standings, and breaking basketball news.', canonical: `${DOMAIN}/sport/basketball` },
          '/sport/soccer': { title: 'Soccer Live Scores - Premier League, La Liga | ScoreHub', desc: 'Follow Premier League, La Liga, Serie A, Bundesliga live soccer scores.', canonical: `${DOMAIN}/sport/soccer` },
          '/sport/baseball': { title: 'Baseball Live Scores - MLB | ScoreHub', desc: 'MLB live scores, standings, and baseball highlights.', canonical: `${DOMAIN}/sport/baseball` },
          '/sport/tennis': { title: 'Tennis Live Scores - ATP, WTA | ScoreHub', desc: 'Follow ATP and WTA tennis live scores and tournament updates.', canonical: `${DOMAIN}/sport/tennis` },
        }

        const ogImage = `${DOMAIN}/og-image.png`
        let count = 0
        for (const [route, meta] of Object.entries(seoMap)) {
          if (route === '/') continue // root already exists
          const routePath = route.replace(/^\//, '')
          const outDir = path.join(distDir, routePath)
          const outFile = path.join(outDir, 'index.html')
          fs.mkdirSync(outDir, { recursive: true })

          let html = template
          // Replace title
          html = html.replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`)
          // Replace meta title
          html = html.replace(/<meta name="title" content=".*?" \/>/, `<meta name="title" content="${meta.title}" />`)
          // Replace meta description
          html = html.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${meta.desc}" />`)
          // Replace canonical
          html = html.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${meta.canonical}" />`)
          // Replace OG url, title, description
          html = html.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${meta.canonical}" />`)
          html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${meta.title}" />`)
          html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${meta.desc}" />`)
          // Twitter
          html = html.replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${meta.title}" />`)
          html = html.replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${meta.desc}" />`)
          html = html.replace(/<meta name="twitter:url" content=".*?" \/>/, `<meta name="twitter:url" content="${meta.canonical}" />`)
          // Ensure OG image
          if (!html.includes('og-image.png')) {
            html = html.replace('</head>', `  <meta property="og:image" content="${ogImage}" />\n  </head>`)
          }

          fs.writeFileSync(outFile, html)
          count++
        }

        console.log(`✅ Prerendered ${count} static pages for SEO (Phase 5 optional)`)
      } catch (e) {
        console.warn('Prerender failed', e)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    sitemapGenerator(),
    prerenderStatic(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'og-image.png', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'ScoreHub - Live Sports Scores',
        short_name: 'ScoreHub',
        description: 'Live sports scores, highlights, standings, predictions',
        theme_color: '#0d1117',
        background_color: '#0d1117',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/og-image.png',
            sizes: '1200x630',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 }
            }
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '/utils': path.resolve(__dirname, './utils'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react'],
          query: ['@tanstack/react-query'],
          helmet: ['react-helmet-async']
        }
      }
    }
  }
})
