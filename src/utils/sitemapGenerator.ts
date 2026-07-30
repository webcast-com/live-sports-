// Sitemap configuration - Phase 4 enhanced
const SITE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SITE_URL) || 'https://livescoresgames.netlify.app';
const LAST_MOD = new Date().toISOString().split('T')[0];

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

const routes: SitemapEntry[] = [
  { url: '/', lastmod: LAST_MOD, changefreq: 'hourly', priority: 1.0 },
  { url: '/predictions', lastmod: LAST_MOD, changefreq: 'hourly', priority: 0.9 },
  { url: '/results', lastmod: LAST_MOD, changefreq: 'hourly', priority: 0.8 },
  { url: '/leaderboard', lastmod: LAST_MOD, changefreq: 'daily', priority: 0.85 },
  { url: '/sure-bets', lastmod: LAST_MOD, changefreq: 'daily', priority: 0.8 },
  { url: '/premium', lastmod: LAST_MOD, changefreq: 'weekly', priority: 0.7 },
  // Informational SEO pages
  { url: '/about', lastmod: LAST_MOD, changefreq: 'monthly', priority: 0.6 },
  { url: '/contact', lastmod: LAST_MOD, changefreq: 'monthly', priority: 0.5 },
  { url: '/help', lastmod: LAST_MOD, changefreq: 'monthly', priority: 0.5 },
  { url: '/careers', lastmod: LAST_MOD, changefreq: 'monthly', priority: 0.4 },
  { url: '/press', lastmod: LAST_MOD, changefreq: 'monthly', priority: 0.4 },
  { url: '/advertise', lastmod: LAST_MOD, changefreq: 'monthly', priority: 0.4 },
  { url: '/partners', lastmod: LAST_MOD, changefreq: 'monthly', priority: 0.4 },
  { url: '/terms', lastmod: LAST_MOD, changefreq: 'yearly', priority: 0.3 },
  { url: '/privacy', lastmod: LAST_MOD, changefreq: 'yearly', priority: 0.3 },
  { url: '/cookies', lastmod: LAST_MOD, changefreq: 'yearly', priority: 0.2 },
  { url: '/referral', lastmod: LAST_MOD, changefreq: 'monthly', priority: 0.6 },
  { url: '/accessibility', lastmod: LAST_MOD, changefreq: 'yearly', priority: 0.2 },
];

const sports = ['football', 'basketball', 'soccer', 'baseball', 'tennis'];

sports.forEach((sport) => {
  routes.push({
    url: `/sport/${sport}`,
    lastmod: LAST_MOD,
    changefreq: 'hourly',
    priority: 0.8,
  });
});

export function generateSitemap(): string {
  const entries = routes
    .map(
      (entry) => `  <url>
    <loc>${SITE_URL}${entry.url}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
    ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

export default generateSitemap;
