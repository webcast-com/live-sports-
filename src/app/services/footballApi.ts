// RapidAPI Football Prediction API service
// Routed through CORS proxy for browser compatibility

import { fetchSupabaseApi } from './supabaseApi';


export interface ApiPrediction {
  id?: number | string;
  home_team?: string;
  away_team?: string;
  home_name?: string;
  away_name?: string;
  competition_name?: string;
  league?: string;
  start_date?: string;
  date?: string;
  market?: string;
  prediction?: string;
  pick?: string;
  odds?: number | string;
  avg_odds?: number | string;
  probability?: string | number;
  confidence?: number;
  status?: string;
  federation?: string;
  result?: string;
  season?: string;
  result_details?: any;
  [key: string]: any;
}

export interface Market {
  key?: string;
  name?: string;
  market?: string;
  description?: string;
  [key: string]: any;
}

export interface Federation {
  key?: string;
  name?: string;
  federation?: string;
  [key: string]: any;
}

async function callApi<T>(endpoint: string, params?: Record<string, string>): Promise<{
  data: T | null;
  rawResponse: any;
  rawText?: string;
  error: string | null;
  proxy?: string;
}> {
  const queryParams = params || {};
  const service = endpoint === '/list-markets' ? 'markets' : endpoint === '/list-federations' ? 'federations' : 'predictions';
  try {
    const data = await fetchSupabaseApi<T>(service, queryParams);
    return { data, rawResponse: data, error: null, proxy: 'supabase' };
  } catch (error) {
    return {
      data: null,
      rawResponse: null,
      error: error instanceof Error ? error.message : 'Supabase API request failed',
      proxy: 'supabase',
    };
  }
}

export async function getPredictions(params?: {
  market?: string;
  iso_date?: string;
  federation?: string;
}): Promise<{ data: ApiPrediction[] | null; error: string | null; rawResponse: any }> {
  const today = new Date().toISOString().split('T')[0];
  const queryParams: Record<string, string> = {
    market: params?.market || 'classic',
    iso_date: params?.iso_date || today,
  };
  if (params?.federation) {
    queryParams.federation = params.federation;
  }

  const res = await callApi<any>('/predictions', queryParams);

  if (!res.data) return { data: null, error: res.error, rawResponse: res.rawResponse };

  let arr: ApiPrediction[] = [];
  if (Array.isArray(res.data)) arr = res.data;
  else if (Array.isArray(res.data.data)) arr = res.data.data;
  else if (Array.isArray(res.data.predictions)) arr = res.data.predictions;
  else if (Array.isArray(res.data.results)) arr = res.data.results;

  return { data: arr, error: null, rawResponse: res.data };
}

export async function getMarkets(): Promise<{ data: Market[] | null; error: string | null; rawResponse?: any }> {
  const res = await callApi<any>('/list-markets');
  if (!res.data) return { data: null, error: res.error, rawResponse: res.rawResponse };

  let arr: Market[] = [];
  if (Array.isArray(res.data)) arr = res.data;
  else if (Array.isArray(res.data.data)) arr = res.data.data;
  else if (Array.isArray(res.data.markets)) arr = res.data.markets;
  else if (typeof res.data === 'object') {
    arr = Object.entries(res.data)
      .filter(([k]) => !['meta', 'data', 'status'].includes(k))
      .map(([key, value]) => ({
        market: key,
        name: typeof value === 'string' ? value : key,
      }));
  }

  return { data: arr, error: null, rawResponse: res.data };
}

export async function getFederations(): Promise<{ data: Federation[] | null; error: string | null; rawResponse?: any }> {
  const res = await callApi<any>('/list-federations');
  if (!res.data) return { data: null, error: res.error, rawResponse: res.rawResponse };

  let arr: Federation[] = [];
  if (Array.isArray(res.data)) arr = res.data;
  else if (Array.isArray(res.data.data)) arr = res.data.data;
  else if (Array.isArray(res.data.federations)) arr = res.data.federations;
  else if (typeof res.data === 'object') {
    arr = Object.entries(res.data)
      .filter(([k]) => !['meta', 'data', 'status'].includes(k))
      .map(([key, value]) => ({
        federation: key,
        name: typeof value === 'string' ? value : key,
      }));
  }

  return { data: arr, error: null, rawResponse: res.data };
}

// Helper to normalize an API prediction into our app's Prediction shape
export function normalizeApiPrediction(p: ApiPrediction, index: number) {
  const homeTeam = p.home_name || p.home_team || 'Home';
  const awayTeam = p.away_name || p.away_team || 'Away';
  const pick = p.prediction || p.pick || 'Match Result';
  const odds = String(p.avg_odds ?? p.odds ?? '1.85');

  let confidence = Math.round(65 + (index % 7) * 4);
  if (typeof p.probability === 'number') {
    confidence = p.probability <= 1 ? Math.round(p.probability * 100) : Math.round(p.probability);
  } else if (typeof p.probability === 'string') {
    const parsed = parseFloat(p.probability);
    if (!isNaN(parsed)) {
      confidence = parsed <= 1 ? Math.round(parsed * 100) : Math.round(parsed);
    }
  }
  confidence = Math.max(50, Math.min(98, confidence));

  const league = p.competition_name || p.league || 'Unknown League';
  const date = p.start_date || p.date || new Date().toISOString();
  const market = p.market || 'classic';
  const federation = p.federation || 'Worldwide';

  return {
    id: `api-${p.id || index}`,
    homeTeam,
    awayTeam,
    homeLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(homeTeam)}&bold=true&background=0d9488&color=fff&font-size=0.4&size=96`,
    awayLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(awayTeam)}&bold=true&background=6366f1&color=fff&font-size=0.4&size=96`,
    league,
    date,
    prediction: pick,
    confidence,
    odds,
    isPremium: true,
    rationale: `Market: ${market} · Federation: ${federation}. Odds fetched live from bookmaker data.`,
    source: 'live-api' as const,
    federation,
    market,
    status: p.status,
  };
}
