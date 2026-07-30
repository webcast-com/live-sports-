import { useQuery } from '@tanstack/react-query';
import { NewsArticle, newsArticles as fallbackNews } from '@/app/data/sportsData';
import { getEdgeFunctionUrl, SUPABASE_ANON_KEY } from '@/lib/supabase';

const POLL_INTERVAL = 5 * 60 * 1000;
const LIVE_SPORTS_API_ENABLED = import.meta.env.VITE_ENABLE_LIVE_SPORTS_API !== 'false';

function mapApiNewsToArticle(apiNews: any, index: number): NewsArticle | null {
  try {
    let timeStr = 'Just now';
    const rawDate = apiNews.publishedAt || apiNews.published_at || apiNews.date || apiNews.published || apiNews.news_date;
    if (rawDate) {
      const date = new Date(rawDate);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      if (diffHours < 1) timeStr = 'Just now';
      else if (diffHours < 24) timeStr = `${diffHours}h ago`;
      else if (diffDays < 7) timeStr = `${diffDays}d ago`;
      else timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return {
      id: index + 1,
      title: apiNews.title || apiNews.headline || apiNews.news_title || 'No title',
      excerpt: apiNews.description || apiNews.summary || apiNews.excerpt || apiNews.content || apiNews.news_description || 'Read more...',
      time: timeStr,
      author: apiNews.author || apiNews.source || apiNews.publisher || 'Football News',
      category: apiNews.category || apiNews.league_name || 'Premier League',
      image: apiNews.image || apiNews.image_url || apiNews.thumbnail || apiNews.imageUrl || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
      readTime: '5 min read',
    };
  } catch {
    return null;
  }
}

async function fetchNewsFromAPI(): Promise<{ articles: NewsArticle[]; source: string }> {
  if (!LIVE_SPORTS_API_ENABLED) return { articles: fallbackNews, source: 'fallback-demo' };
  const url = getEdgeFunctionUrl('football-news');
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    mode: 'cors',
    credentials: 'omit',
  }).catch(() => null);
  if (!response || !response.ok) throw new Error('News unavailable');
  const data = await response.json();
  let apiNews: any[] = [];
  if (data.success && Array.isArray(data.news)) apiNews = data.news;
  else if (Array.isArray(data.news)) apiNews = data.news;
  else if (Array.isArray(data)) apiNews = data;
  else if (Array.isArray(data.data)) apiNews = data.data;
  else if (Array.isArray(data.articles)) apiNews = data.articles;

  if (apiNews.length > 0) {
    const mapped = apiNews.map(mapApiNewsToArticle).filter((n): n is NewsArticle => n !== null).slice(0, 20);
    if (mapped.length > 0) return { articles: mapped, source: 'api-live' };
  }
  return { articles: fallbackNews, source: 'fallback-demo' };
}

export function useNews() {
  const query = useQuery({
    queryKey: ['football-news'],
    queryFn: fetchNewsFromAPI,
    refetchInterval: POLL_INTERVAL,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    initialData: { articles: fallbackNews, source: 'fallback-demo' as const },
  });

  return {
    articles: (query.data as any)?.articles || fallbackNews,
    source: (query.data as any)?.source || 'loading',
    loading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}

// Legacy export for compatibility
export const useNewsHook = useNews;
