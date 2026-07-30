import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LiveMatch, liveMatches as fallbackMatches } from '@/app/data/sportsData';
import { getAllSportsLiveMatches } from '@/app/services/allSportsApi';
import { getEdgeFunctionUrl, SUPABASE_ANON_KEY } from '@/lib/supabase';

const POLL_INTERVAL = 30000;
const CACHE_KEY = 'scorehub_matches_cache';
const CACHE_DURATION = 5 * 60 * 1000;
const LIVE_SPORTS_API_ENABLED = import.meta.env.VITE_ENABLE_LIVE_SPORTS_API !== 'false';

function getCachedMatches(): LiveMatch[] | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCacheMatches(matches: LiveMatch[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: matches, timestamp: Date.now() }));
  } catch {}
}

function mapSupabaseMatchToLiveMatch(dbMatch: any): LiveMatch | null {
  try {
    let homeTeam = 'Home Team';
    if (typeof dbMatch.homeTeam === 'object' && dbMatch.homeTeam !== null) homeTeam = dbMatch.homeTeam.name || 'Home Team';
    else if (typeof dbMatch.home === 'object' && dbMatch.home !== null) homeTeam = dbMatch.home.name || dbMatch.home.longName || 'Home Team';
    else homeTeam = dbMatch.homeTeam || dbMatch.home || dbMatch.home_team || dbMatch.localteam_name || dbMatch.localTeamName || 'Home Team';

    let awayTeam = 'Away Team';
    if (typeof dbMatch.awayTeam === 'object' && dbMatch.awayTeam !== null) awayTeam = dbMatch.awayTeam.name || 'Away Team';
    else if (typeof dbMatch.away === 'object' && dbMatch.away !== null) awayTeam = dbMatch.away.name || dbMatch.away.longName || 'Away Team';
    else awayTeam = dbMatch.awayTeam || dbMatch.away || dbMatch.away_team || dbMatch.visitorteam_name || dbMatch.visitorTeamName || 'Away Team';

    let league = 'Unknown League';
    if (typeof dbMatch.league === 'object' && dbMatch.league !== null) league = dbMatch.league.name || 'Unknown League';
    else if (typeof dbMatch.league === 'string') league = dbMatch.league;
    else league = dbMatch.tournament || dbMatch.competition || dbMatch.league_name || dbMatch.tournament_name || 'Unknown League';

    let sport: 'football' | 'basketball' | 'soccer' | 'baseball' | 'tennis' = 'soccer';
    const leagueLower = String(league).toLowerCase();
    if (leagueLower.includes('nfl')) sport = 'football';
    else if (leagueLower.includes('nba') || leagueLower.includes('basketball')) sport = 'basketball';
    else if (leagueLower.includes('mlb') || leagueLower.includes('baseball')) sport = 'baseball';
    else if (leagueLower.includes('atp') || leagueLower.includes('tennis') || leagueLower.includes('wta')) sport = 'tennis';
    else sport = 'soccer';

    const homeAbbr = String(homeTeam).slice(0, 3).toUpperCase();
    const awayAbbr = String(awayTeam).slice(0, 3).toUpperCase();

    let homeScore = 0;
    let awayScore = 0;
    if (dbMatch.state?.score?.current && typeof dbMatch.state.score.current === 'string') {
      const scoreParts = dbMatch.state.score.current.split('-').map((s: string) => s.trim());
      homeScore = parseInt(scoreParts[0]) || 0;
      awayScore = parseInt(scoreParts[1]) || 0;
    } else if (typeof dbMatch.home === 'object' && dbMatch.home?.score !== undefined) {
      homeScore = parseInt(dbMatch.home.score) || 0;
      awayScore = typeof dbMatch.away === 'object' && dbMatch.away?.score !== undefined ? parseInt(dbMatch.away.score) || 0 : 0;
    } else {
      homeScore = parseInt(dbMatch.home_score || dbMatch.homeScore || dbMatch.localteam_score || dbMatch.score?.home || '0') || 0;
      awayScore = parseInt(dbMatch.away_score || dbMatch.awayScore || dbMatch.visitorteam_score || dbMatch.score?.away || '0') || 0;
    }

    let statusRaw = '';
    if (dbMatch.state?.description) statusRaw = dbMatch.state.description.toLowerCase();
    else if (dbMatch.status && typeof dbMatch.status === 'object') {
      if (dbMatch.status.finished) statusRaw = 'finished';
      else if (dbMatch.status.ongoing) statusRaw = 'live';
      else if (dbMatch.status.started) statusRaw = 'live';
      else statusRaw = 'live';
    } else statusRaw = String(dbMatch.status || dbMatch.match_status || dbMatch.state || 'live').toLowerCase();

    let mappedStatus: 'live' | 'halftime' | 'final' = 'live';
    if (statusRaw.includes('finished') || statusRaw.includes('final') || statusRaw.includes('ft')) mappedStatus = 'final';
    else if (statusRaw.includes('half time') || statusRaw.includes('halftime') || statusRaw.includes('ht')) mappedStatus = 'halftime';

    let time = 'LIVE';
    if (dbMatch.state?.clock) time = dbMatch.state.clock + "'";
    else if (statusRaw.includes('not started')) time = 'Upcoming';
    else if (statusRaw.includes('finished') || statusRaw.includes('final')) time = 'FT';
    else if (dbMatch.status?.liveTime?.short) time = dbMatch.status.liveTime.short;
    else if (dbMatch.status?.liveTime?.long) time = dbMatch.status.liveTime.long.split(':')[0] + "'";
    else time = dbMatch.time || dbMatch.match_time || dbMatch.minute || dbMatch.elapsed || 'LIVE';

    let homeLogo: string | undefined;
    let awayLogo: string | undefined;
    let leagueLogo: string | undefined;
    let countryLogo: string | undefined;
    if (typeof dbMatch.homeTeam === 'object' && dbMatch.homeTeam?.logo) homeLogo = dbMatch.homeTeam.logo;
    if (typeof dbMatch.awayTeam === 'object' && dbMatch.awayTeam?.logo) awayLogo = dbMatch.awayTeam.logo;
    if (typeof dbMatch.league === 'object' && dbMatch.league?.logo) leagueLogo = dbMatch.league.logo;
    if (typeof dbMatch.country === 'object' && dbMatch.country?.logo) countryLogo = dbMatch.country.logo;

    return {
      id: dbMatch.id || dbMatch.match_id || Math.floor(Math.random() * 1000000),
      sport,
      league,
      homeTeam: String(homeTeam),
      awayTeam: String(awayTeam),
      homeScore,
      awayScore,
      time: String(time),
      status: mappedStatus,
      homeColor: dbMatch.home_color || dbMatch.homeColor || generateColorForTeam(String(homeTeam)),
      awayColor: dbMatch.away_color || dbMatch.awayColor || generateColorForTeam(String(awayTeam)),
      homeAbbr,
      awayAbbr,
      homeLogo,
      awayLogo,
      leagueLogo,
      countryLogo,
    };
  } catch {
    return null;
  }
}

function generateColorForTeam(teamName: string): string {
  const colors = ['#E31837', '#00338D', '#003594', '#004687', '#AA0000', '#203731', '#552583', '#007A33', '#98002E', '#1D428A', '#0E2240', '#1D1160', '#C60C30', '#0851BA', '#6CABDE', '#EF0107', '#C8102E', '#0051BA', '#0C2C56', '#BD3039', '#005A9C', '#FD5000', '#001F3F', '#FF4136'];
  let hash = 0;
  for (let i = 0; i < teamName.length; i++) hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

async function fetchLiveScoresFromAPI(): Promise<{ matches: LiveMatch[]; source: string }> {
  if (!LIVE_SPORTS_API_ENABLED) {
    return { matches: getCachedMatches() || fallbackMatches, source: getCachedMatches() ? 'cache' : 'fallback-demo' };
  }

  const url = getEdgeFunctionUrl('make-server-ed1dd9fb/matches/live');
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    mode: 'cors',
    credentials: 'omit',
  }).catch(() => null);

  if (!response) throw new Error('Live score service unavailable');
  if (!response.ok) {
    const errorData = await response.text();
    let msg = 'API error';
    if (response.status === 503 || errorData.includes('usage_exceeded')) msg = 'API usage limit exceeded';
    else if (response.status === 429) msg = 'API rate limit exceeded';
    throw Object.assign(new Error(msg), { quotaExceeded: true, raw: errorData, status: response.status });
  }

  const data = await response.json();
  let apiMatches: any[] = [];
  if (Array.isArray(data)) apiMatches = data;
  else if (data.response?.live && Array.isArray(data.response.live)) apiMatches = data.response.live;
  else if (Array.isArray(data.response)) apiMatches = data.response;
  else if (Array.isArray(data.matches)) apiMatches = data.matches;
  else if (Array.isArray(data.data)) apiMatches = data.data;
  else if (Array.isArray(data.result)) apiMatches = data.result;

  if (apiMatches.length > 0) {
    const mapped = apiMatches.map(mapSupabaseMatchToLiveMatch).filter((m): m is LiveMatch => m !== null);
    if (mapped.length > 0) {
      setCacheMatches(mapped);
      return { matches: mapped, source: 'api-live' };
    }
  }
  return { matches: fallbackMatches, source: 'fallback-demo' };
}

// Phase 2: TanStack Query version with smart refetch and fallback handling
export function useScoreSimulator() {
  const query = useQuery({
    queryKey: ['live-matches'],
    queryFn: async () => {
      try {
        return await fetchLiveScoresFromAPI();
      } catch (err: any) {
        if (err?.quotaExceeded) {
          try {
            const backup = await getAllSportsLiveMatches();
            if (backup.data && backup.data.length > 0) {
              const mapped = backup.data.map(mapSupabaseMatchToLiveMatch).filter((m): m is LiveMatch => m !== null);
              if (mapped.length > 0) {
                setCacheMatches(mapped);
                return { matches: mapped, source: 'allsports-api' as const, error: 'Primary API quota exceeded, using AllSportsAPI' };
              }
            }
          } catch {}
        }
        const cached = getCachedMatches();
        if (cached && cached.length > 0) {
          return { matches: cached, source: 'cache' as const, error: 'Using cached data' };
        }
        return { matches: fallbackMatches, source: 'fallback-demo' as const, error: err?.message || null };
      }
    },
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 20 * 1000,
    gcTime: 5 * 60 * 1000,
    initialData: () => {
      const cached = getCachedMatches();
      if (cached) return { matches: cached, source: 'cache' as const };
      return { matches: fallbackMatches, source: 'fallback-demo' as const };
    },
  });

  // Normalize return shape to previous API for compatibility
  const result = useMemo(() => {
    const data = query.data as any;
    return {
      matches: data?.matches || fallbackMatches,
      source: data?.source || 'loading',
      loading: query.isLoading,
      error: data?.error || query.error?.message || null,
      isFetching: query.isFetching,
      refetch: query.refetch,
    };
  }, [query.data, query.isLoading, query.error, query.isFetching, query.refetch]);

  return result;
}

// Also export raw query hook for advanced usage
export function useLiveMatchesQuery() {
  return useQuery({
    queryKey: ['live-matches'],
    queryFn: fetchLiveScoresFromAPI,
    refetchInterval: POLL_INTERVAL,
    staleTime: 20 * 1000,
  });
}
