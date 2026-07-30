interface SEOMeta {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  twitterCard?: string;
}

const DEFAULT_OG_IMAGE = 'https://livescoresgames.netlify.app/og-image.png';
const DOMAIN = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SITE_URL) || 'https://livescoresgames.netlify.app';

export const seoMetaData: Record<string, SEOMeta> = {
  home: {
    title: 'ScoreHub - Live Sports Scores, Highlights & Standings | NFL, NBA, Soccer, MLB',
    description: 'Get instant live scores, match highlights, league standings, and real-time updates for all major sports leagues worldwide.',
    keywords: 'live scores, sports scores, NFL, NBA, soccer, baseball, tennis, Premier League, La Liga, Bundesliga',
    ogType: 'website',
    canonicalUrl: DOMAIN,
    twitterCard: 'summary_large_image',
  },
  dashboard: {
    title: 'ScoreHub - Live Sports Scores, Highlights & Standings | NFL, NBA, Soccer, MLB',
    description: 'Get instant live scores, match highlights, league standings, and real-time updates for all major sports leagues worldwide.',
    keywords: 'live scores, sports scores, NFL, NBA, soccer, baseball, tennis',
    ogType: 'website',
    canonicalUrl: DOMAIN,
    twitterCard: 'summary_large_image',
  },
  liveScores: {
    title: 'Live Scores - Real-time Sports Updates | ScoreHub',
    description: 'Follow live match scores across NFL, NBA, Premier League, MLB, and tennis. Get instant updates and detailed statistics.',
    keywords: 'live scores, match updates, sports scores, real-time, leagues',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/`,
    twitterCard: 'summary_large_image',
  },
  predictions: {
    title: 'Sports Predictions & Analysis - Expert Picks | ScoreHub',
    description: 'Get accurate sports predictions, expert picks, and detailed analysis for upcoming matches across all major leagues.',
    keywords: 'predictions, sports predictions, expert picks, match analysis, odds',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/predictions`,
    twitterCard: 'summary_large_image',
  },
  leaderboard: {
    title: 'Prediction Leaderboard - Top Predictors | ScoreHub',
    description: 'View the global leaderboard of top sports predictors. Track accuracy stats and performance rankings.',
    keywords: 'leaderboard, rankings, predictions accuracy, top predictors',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/leaderboard`,
    twitterCard: 'summary_large_image',
  },
  premium: {
    title: 'Premium Membership - ScoreHub Pro & Basic Tiers',
    description: 'Unlock premium features: expert picks, advanced filters, detailed stats, and ad-free experience. Choose Basic ($4.99/mo) or Pro ($9.99/mo).',
    keywords: 'premium, subscription, expert picks, advanced filters, betting alerts',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/premium`,
    twitterCard: 'summary_large_image',
  },
  results: {
    title: 'Recent Sports Results - Match Results & Picks | ScoreHub',
    description: 'Review recent sports results, completed matches, and prediction picks across major leagues.',
    keywords: 'sports results, match results, completed matches, sports picks',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/results`,
    twitterCard: 'summary_large_image',
  },
  sureBets: {
    title: 'Sure Bets & Sports Picks - ScoreHub',
    description: 'Explore curated sports picks and high-confidence match insights from ScoreHub.',
    keywords: 'sure bets, sports picks, match insights, betting tips',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/sure-bets`,
    twitterCard: 'summary_large_image',
  },
  'sure-bets': {
    title: 'Sure Bets & Sports Picks - ScoreHub',
    description: 'Explore curated sports picks and high-confidence match insights from ScoreHub.',
    keywords: 'sure bets, sports picks, match insights, betting tips',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/sure-bets`,
    twitterCard: 'summary_large_image',
  },
  settings: {
    title: 'Account Settings - ScoreHub',
    description: 'Manage your ScoreHub account preferences and notification settings.',
    keywords: 'account settings, profile, notifications, ScoreHub',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/settings`,
    twitterCard: 'summary_large_image',
  },
  subscription: {
    title: 'Subscription Management - ScoreHub',
    description: 'Manage your ScoreHub subscription and premium sports features.',
    keywords: 'subscription management, ScoreHub premium, account billing',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/subscription`,
    twitterCard: 'summary_large_image',
  },
  webhook: {
    title: 'Webhook Simulator - ScoreHub',
    description: 'Test sports data webhook events and review live integration updates in ScoreHub.',
    keywords: 'webhook simulator, sports data integration, API testing',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/webhook`,
    twitterCard: 'summary_large_image',
  },
  about: {
    title: 'About ScoreHub - Live Sports Scores & Insights',
    description: 'Learn more about ScoreHub and our mission to make live sports information easier to follow.',
    keywords: 'about ScoreHub, live sports platform, sports scores',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/about`,
    twitterCard: 'summary_large_image',
  },
  careers: {
    title: 'Careers at ScoreHub',
    description: 'Explore career opportunities and join the team building better live sports experiences.',
    keywords: 'ScoreHub careers, sports technology jobs, open roles',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/careers`,
    twitterCard: 'summary_large_image',
  },
  press: {
    title: 'ScoreHub Press & Media',
    description: 'Find ScoreHub press resources, company news, and media information.',
    keywords: 'ScoreHub press, sports media, company news',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/press`,
    twitterCard: 'summary_large_image',
  },
  contact: {
    title: 'Contact ScoreHub',
    description: 'Get in touch with the ScoreHub team for support, partnerships, and general enquiries.',
    keywords: 'contact ScoreHub, sports support, partnerships',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/contact`,
    twitterCard: 'summary_large_image',
  },
  advertise: {
    title: 'Advertise with ScoreHub',
    description: 'Reach sports fans with advertising opportunities across the ScoreHub platform.',
    keywords: 'advertise on ScoreHub, sports advertising, digital sports audience',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/advertise`,
    twitterCard: 'summary_large_image',
  },
  partners: {
    title: 'ScoreHub Partners',
    description: 'Discover partnership opportunities with ScoreHub for sports, media, and technology brands.',
    keywords: 'ScoreHub partners, sports partnerships, technology partners',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/partners`,
    twitterCard: 'summary_large_image',
  },
  help: {
    title: 'Help Center - ScoreHub',
    description: 'Find answers and support for using ScoreHub live scores, predictions, and account features.',
    keywords: 'ScoreHub help, sports scores support, account help',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/help`,
    twitterCard: 'summary_large_image',
  },
  terms: {
    title: 'Terms of Service - ScoreHub',
    description: 'Read the terms and conditions governing use of the ScoreHub platform.',
    keywords: 'ScoreHub terms of service, platform terms',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/terms`,
    twitterCard: 'summary_large_image',
  },
  privacy: {
    title: 'Privacy Policy - ScoreHub',
    description: 'Read how ScoreHub collects, uses, and protects information on the platform.',
    keywords: 'ScoreHub privacy policy, data protection, privacy',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/privacy`,
    twitterCard: 'summary_large_image',
  },
  cookies: {
    title: 'Cookie Policy - ScoreHub',
    description: 'Learn how ScoreHub uses cookies and similar technologies across the platform.',
    keywords: 'ScoreHub cookie policy, cookies, tracking technologies',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/cookies`,
    twitterCard: 'summary_large_image',
  },
  accessibility: {
    title: 'Accessibility Statement - ScoreHub',
    description: 'Learn about ScoreHub accessibility efforts and how to request assistance.',
    keywords: 'ScoreHub accessibility, accessible sports platform',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/accessibility`,
    twitterCard: 'summary_large_image',
  },
  notFound: {
    title: '404 - Page Not Found | ScoreHub',
    description: 'The page you are looking for does not exist. Return to ScoreHub live scores.',
    keywords: '404, not found, ScoreHub',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/404`,
    twitterCard: 'summary_large_image',
  },
  // Sport-specific SEO
  football: {
    title: 'Football Live Scores - NFL & NCAA | ScoreHub',
    description: 'Follow live American football scores, NFL standings, and match highlights.',
    keywords: 'football live scores, NFL, NCAA, football standings',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/sport/football`,
    twitterCard: 'summary_large_image',
  },
  basketball: {
    title: 'Basketball Live Scores - NBA | ScoreHub',
    description: 'Get NBA live scores, standings, and breaking basketball news.',
    keywords: 'basketball live scores, NBA, basketball standings',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/sport/basketball`,
    twitterCard: 'summary_large_image',
  },
  soccer: {
    title: 'Soccer Live Scores - Premier League, La Liga | ScoreHub',
    description: 'Follow Premier League, La Liga, Serie A, Bundesliga live soccer scores.',
    keywords: 'soccer live scores, Premier League, La Liga, football scores',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/sport/soccer`,
    twitterCard: 'summary_large_image',
  },
  baseball: {
    title: 'Baseball Live Scores - MLB | ScoreHub',
    description: 'MLB live scores, standings, and baseball highlights.',
    keywords: 'baseball live scores, MLB, baseball standings',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/sport/baseball`,
    twitterCard: 'summary_large_image',
  },
  admin: {
    title: 'Admin Dashboard - ScoreHub',
    description: 'Admin dashboard for ScoreHub - manage contacts, payments, activity, favorites with Phase 4 features.',
    keywords: 'admin dashboard, ScoreHub admin, contact messages, payments',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/admin`,
    twitterCard: 'summary_large_image',
  },
  tennis: {
    title: 'Tennis Live Scores - ATP, WTA | ScoreHub',
    description: 'Follow ATP and WTA tennis live scores and tournament updates.',
    keywords: 'tennis live scores, ATP, WTA, tennis scores',
    ogType: 'website',
    canonicalUrl: `${DOMAIN}/sport/tennis`,
    twitterCard: 'summary_large_image',
  },
};

export function setPageMeta(pageKey: keyof typeof seoMetaData | string) {
  const key = pageKey as keyof typeof seoMetaData;
  const meta = (seoMetaData[key] || seoMetaData[key.replace('-', '') as keyof typeof seoMetaData] || seoMetaData.home) as SEOMeta;

  document.title = meta.title;

  const updateMeta = (name: string, content: string) => {
    let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('name', name);
      document.head.appendChild(element);
    }
    element.content = content;
  };

  const updateProperty = (property: string, content: string) => {
    let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('property', property);
      document.head.appendChild(element);
    }
    element.content = content;
  };

  updateMeta('description', meta.description);
  if (meta.keywords) updateMeta('keywords', meta.keywords);

  updateProperty('og:title', meta.title);
  updateProperty('og:description', meta.description);
  updateProperty('og:image', meta.ogImage || DEFAULT_OG_IMAGE);
  if (meta.ogType) updateProperty('og:type', meta.ogType);
  if (meta.canonicalUrl) updateProperty('og:url', meta.canonicalUrl);

  if (meta.twitterCard) updateMeta('twitter:card', meta.twitterCard);
  updateMeta('twitter:title', meta.title);
  updateMeta('twitter:description', meta.description);
  updateMeta('twitter:image', meta.ogImage || DEFAULT_OG_IMAGE);

  if (meta.canonicalUrl) {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = meta.canonicalUrl;
  }
}

export default seoMetaData;
