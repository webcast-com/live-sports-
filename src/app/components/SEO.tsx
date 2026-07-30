import React from 'react';
import { Helmet } from 'react-helmet-async';
import { seoMetaData } from '@/utils/seoMeta';

interface SEOProps {
  pageKey?: keyof typeof seoMetaData | string;
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
  noindex?: boolean;
}

const DEFAULT_OG_IMAGE = 'https://livescoresgames.netlify.app/og-image.png';
const DOMAIN = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SITE_URL) || 'https://livescoresgames.netlify.app';

export const SEO: React.FC<SEOProps> = ({
  pageKey,
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  jsonLd,
  noindex = false,
}) => {
  const metaFromKey = pageKey ? (seoMetaData[pageKey as keyof typeof seoMetaData] || seoMetaData[pageKey.replace(/-/g, '') as keyof typeof seoMetaData]) : null;

  const finalTitle = title || metaFromKey?.title || seoMetaData.home.title;
  const finalDescription = description || metaFromKey?.description || seoMetaData.home.description;
  const finalKeywords = keywords || metaFromKey?.keywords;
  const finalCanonical = canonicalUrl || metaFromKey?.canonicalUrl || DOMAIN;
  const finalOgImage = ogImage || metaFromKey?.ogImage || DEFAULT_OG_IMAGE;
  const finalOgType = ogType || metaFromKey?.ogType || 'website';
  const finalTwitterCard = twitterCard || metaFromKey?.twitterCard || 'summary_large_image';

  // Build JSON-LD array
  const jsonLdArray: Record<string, any>[] = [];
  if (jsonLd) {
    if (Array.isArray(jsonLd)) jsonLdArray.push(...jsonLd);
    else jsonLdArray.push(jsonLd);
  }

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {finalKeywords && <meta name="keywords" content={finalKeywords} />}
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />}

      {/* Canonical */}
      <link rel="canonical" href={finalCanonical} />

      {/* Open Graph */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content={finalOgType} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:site_name" content="ScoreHub" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content={finalTwitterCard} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalOgImage} />

      {/* JSON-LD */}
      {jsonLdArray.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;

// Helper to generate Organization JSON-LD
export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: 'ScoreHub',
    url: DOMAIN,
    logo: `${DOMAIN}/favicon.svg`,
    description: 'Your ultimate destination for live sports scores, stats, and breaking news.',
    sameAs: ['https://twitter.com/', 'https://youtube.com/', 'https://instagram.com/', 'https://facebook.com/'],
  };
}

export function getWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ScoreHub',
    url: DOMAIN,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${DOMAIN}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getBreadcrumbJsonLd(items: Array<{ label: string; href?: string }>, origin = DOMAIN) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((b, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: b.label,
      item: b.href ? origin + b.href : undefined,
    })),
  };
}

export function getSportsEventJsonLd(match: { homeTeam: string; awayTeam: string; league: string; date?: string; homeScore?: number; awayScore?: number; status?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${match.homeTeam} vs ${match.awayTeam}`,
    sport: 'Soccer',
    homeTeam: { '@type': 'SportsTeam', name: match.homeTeam },
    awayTeam: { '@type': 'SportsTeam', name: match.awayTeam },
    location: { '@type': 'Place', name: match.league },
    startDate: match.date || new Date().toISOString(),
    eventStatus: match.status === 'live' ? 'https://schema.org/EventLive' : match.status === 'final' ? 'https://schema.org/EventCompleted' : 'https://schema.org/EventScheduled',
  };
}

export function getFAQJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}
