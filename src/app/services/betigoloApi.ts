// Betigolo Predictions API - Previous Results endpoint
// Routed through CORS proxy for browser compatibility

import { fetchSupabaseApi } from './supabaseApi';


export interface BetigoloResult {
  id?: string | number;
  home_team?: string;
  away_team?: string;
  home_team_name?: string;
  away_team_name?: string;
  home?: string;
  away?: string;
  home_score?: number;
  away_score?: number;
  score_home?: number;
  score_away?: number;
  result?: string;
  prediction?: string;
  pick?: string;
  tip?: string;
  date?: string;
  match_date?: string;
  match_dat?: string;
  league?: string;
  competition?: string;
  country?: string;
  country_name?: string;
  nation?: string;
  odds?: number | string;
  tip_odd?: number | string;
  fair_odd?: number | string;
  confidence?: number | string;
  tip_successful?: boolean;
  tip_profit?: number;
  status?: string;
  [key: string]: any;
}

const demoHistory: BetigoloResult[] = [
  { id: 'demo-1', home_team: 'Manchester City', away_team: 'Liverpool', home_score: 2, away_score: 1, prediction: 'Home Win', result: 'home', league: 'Premier League', country: 'England', odds: '1.72', date: '2026-03-18' },
  { id: 'demo-2', home_team: 'Arsenal', away_team: 'Chelsea', home_score: 2, away_score: 0, prediction: 'Home Win', result: 'home', league: 'Premier League', country: 'England', odds: '1.65', date: '2026-03-17' },
  { id: 'demo-3', home_team: 'Barcelona', away_team: 'Atletico Madrid', home_score: 1, away_score: 1, prediction: 'Draw', result: 'draw', league: 'La Liga', country: 'Spain', odds: '3.20', date: '2026-03-16' },
  { id: 'demo-4', home_team: 'Bayern Munich', away_team: 'Dortmund', home_score: 3, away_score: 1, prediction: 'Home Win', result: 'home', league: 'Bundesliga', country: 'Germany', odds: '1.58', date: '2026-03-15' },
  { id: 'demo-5', home_team: 'Inter Milan', away_team: 'AC Milan', home_score: 0, away_score: 1, prediction: 'Away Win', result: 'away', league: 'Serie A', country: 'Italy', odds: '2.35', date: '2026-03-14' },
  { id: 'demo-6', home_team: 'PSG', away_team: 'Marseille', home_score: 2, away_score: 0, prediction: 'Home Win', result: 'home', league: 'Ligue 1', country: 'France', odds: '1.45', date: '2026-03-13' },
];

/**
 * Fetches history/tips from Betigolo history endpoint
 * For use in LiveTickerStrip and other components
 */
export async function getBetigoloHistory(): Promise<{
  data: BetigoloResult[] | null;
  error: string | null;
  rawResponse: any;
}> {
  try {
    const response = await fetchSupabaseApi<any>('betigoloHistory');
    const res = { data: response, error: null as string | null };

    let historyData: BetigoloResult[] = [];
    if (Array.isArray(res.data)) {
      historyData = res.data;
    } else if (Array.isArray(res.data.data)) {
      historyData = res.data.data;
    } else if (Array.isArray(res.data.history)) {
      historyData = res.data.history;
    } else if (Array.isArray(res.data.predictions)) {
      historyData = res.data.predictions;
    }

    return {
      data: historyData.length > 0 ? historyData : demoHistory,
      error: historyData.length > 0 ? null : 'No prediction history found; showing demo history.',
      rawResponse: res.data,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return { data: demoHistory, error: errorMsg, rawResponse: null };
  }
}

/**
 * Fetches previous results from Betigolo sample endpoint
 * Returns raw response body for debugging / inspection UI
 */
export async function getPreviousResults(): Promise<{
  data: BetigoloResult[] | null;
  rawResponse: any;
  rawText?: string;
  usedProxy?: string;
  error: string | null;
  status?: number;
  endpoint: string;
  debug?: any;
}> {
  const endpoint = 'supabase://rapidapi?service=betigoloSample';
  let response: any;
  try {
    response = await fetchSupabaseApi<any>('betigoloSample');
  } catch (error) {
    return {
      data: demoHistory,
      rawResponse: null,
      error: error instanceof Error ? error.message : 'Supabase API request failed',
      endpoint,
      usedProxy: 'supabase',
    };
  }

  const res = { data: response, proxy: 'supabase' as const, error: null as string | null };

  const rawText = undefined;
  const debug = { proxy: res.proxy };

  if (!res.data) {
    return { 
      data: null, 
      rawResponse: rawText || null,
      rawText,
      usedProxy: res.proxy,
      error: res.error || 'No data received',
      status: undefined,
      endpoint,
      debug
    };
  }

  // Try multiple shapes - be very permissive
  let arr: BetigoloResult[] = [];
  if (Array.isArray(res.data)) arr = res.data;
  else if (Array.isArray(res.data?.data)) arr = res.data.data;
  else if (Array.isArray(res.data?.results)) arr = res.data.results;
  else if (Array.isArray(res.data?.matches)) arr = res.data.matches;
  else if (Array.isArray(res.data?.sample)) arr = res.data.sample;
  else if (Array.isArray(res.data?.predictions)) arr = res.data.predictions;
  else if (typeof res.data === 'object') {
    const firstArray = Object.values(res.data).find(v => Array.isArray(v));
    if (firstArray) arr = firstArray as BetigoloResult[];
  }

  return { 
    data: arr, 
    rawResponse: res.data,
    rawText,
    usedProxy: res.proxy,
    error: arr.length === 0 ? 'API returned valid JSON but no prediction array was found. Showing raw response instead.' : null,
    status: undefined,
    endpoint,
    debug,
  };
}

export function normalizeBetigoloResult(r: BetigoloResult, index: number) {
  const homeTeam = r.home_team_name || r.home_team || r.home || 'Home Team';
  const awayTeam = r.away_team_name || r.away_team || r.away || 'Away Team';

  const scoreMatch = typeof r.result === 'string'
    ? r.result.match(/^(\d+)\s*-\s*(\d+)/)
    : null;
  const homeScore = Number(r.home_score ?? r.score_home ?? scoreMatch?.[1] ?? 0);
  const awayScore = Number(r.away_score ?? r.score_away ?? scoreMatch?.[2] ?? 0);

  const prediction = r.prediction || r.pick || r.tip || 'Match Result';
  const odds = String(r.odds ?? r.tip_odd ?? '1.80');
  const confidence = typeof r.confidence === 'number'
    ? r.confidence
    : Math.round(70 + (index % 5) * 3);

  let outcome: 'win' | 'loss' | 'push' = 'push';
  const rawResult = (r.result || '').toString().toLowerCase();

  if (r.tip_successful === true || (typeof r.tip_profit === 'number' && r.tip_profit > 0) || rawResult.includes('win') || rawResult === '1' || rawResult === 'home') {
    outcome = 'win';
  } else if (r.tip_successful === false || (typeof r.tip_profit === 'number' && r.tip_profit < 0) || rawResult.includes('loss') || rawResult === '2' || rawResult === 'away') {
    outcome = 'loss';
  } else if (homeScore > awayScore && (prediction.toLowerCase().includes('home') || prediction.toLowerCase().includes('win'))) {
    outcome = 'win';
  } else if (awayScore > homeScore && (prediction.toLowerCase().includes('away') || prediction.toLowerCase().includes('win'))) {
    outcome = 'win';
  } else if (homeScore === awayScore && prediction.toLowerCase().includes('draw')) {
    outcome = 'win';
  } else {
    outcome = homeScore >= awayScore ? 'win' : 'loss';
  }

  const profit = outcome === 'win'
    ? `+${(parseFloat(odds) - 1).toFixed(2)}`
    : '-1.00';

  const country = r.country || r.country_name || r.nation || 'International';
  const league = r.league || r.competition || 'Previous Matches';
  const date = r.date || r.match_date || r.match_dat || new Date(Date.now() - (index + 1) * 86400000 * 2).toISOString();

  const goalDiff = homeScore - awayScore;
  const goalDiffStr = goalDiff > 0 ? `+${goalDiff}` : String(goalDiff);

  let resultType: 'H' | 'D' | 'A' = 'D';
  if (homeScore > awayScore) resultType = 'H';
  else if (awayScore > homeScore) resultType = 'A';

  const profitNum = outcome === 'win'
    ? parseFloat((parseFloat(odds) - 1).toFixed(2))
    : -1.00;

  return {
    id: `betigolo-${r.id || index}`,
    homeTeam,
    awayTeam,
    homeLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(homeTeam)}&bold=true&background=334155&color=fff&size=64`,
    awayLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(awayTeam)}&bold=true&background=475569&color=fff&size=64`,
    country,
    league,
    date,
    prediction,
    odds,
    confidence: Math.max(55, Math.min(95, confidence)),
    isPremium: true,
    homeScore,
    awayScore,
    outcome,
    profit,
    goalDiff,
    goalDiffStr,
    resultType,
    profitNum,
    source: 'betigolo-api' as const,
  };
}
