import { useQuery } from '@tanstack/react-query';
import { UpcomingMatch, upcomingMatches as fallbackMatches } from '@/app/data/sportsData';
import { getEdgeFunctionUrl, SUPABASE_ANON_KEY } from '@/lib/supabase';

const POLL_INTERVAL = 60 * 1000;

function mapApiMatchToUpcomingMatch(dbMatch: any): UpcomingMatch | null {
  try {
    const statusRaw = dbMatch.state?.description?.toLowerCase() || '';
    if (!statusRaw.includes('not started') && !statusRaw.includes('upcoming')) return null;

    let homeTeam = 'Home Team';
    if (typeof dbMatch.homeTeam === 'object' && dbMatch.homeTeam !== null) homeTeam = dbMatch.homeTeam.name || 'Home Team';
    else homeTeam = dbMatch.homeTeam || dbMatch.home || 'Home Team';

    let awayTeam = 'Away Team';
    if (typeof dbMatch.awayTeam === 'object' && dbMatch.awayTeam !== null) awayTeam = dbMatch.awayTeam.name || 'Away Team';
    else awayTeam = dbMatch.awayTeam || dbMatch.away || 'Away Team';

    let league = 'Unknown League';
    if (typeof dbMatch.league === 'object' && dbMatch.league !== null) league = dbMatch.league.name || 'Unknown League';
    else league = dbMatch.league || 'Unknown League';

    let sport: 'football' | 'basketball' | 'soccer' | 'baseball' | 'tennis' = 'soccer';
    const leagueLower = String(league).toLowerCase();
    if (leagueLower.includes('nfl')) sport = 'football';
    else if (leagueLower.includes('nba') || leagueLower.includes('basketball')) sport = 'basketball';
    else if (leagueLower.includes('mlb') || leagueLower.includes('baseball')) sport = 'baseball';
    else if (leagueLower.includes('atp') || leagueLower.includes('tennis')) sport = 'tennis';

    const homeAbbr = String(homeTeam).slice(0, 3).toUpperCase();
    const awayAbbr = String(awayTeam).slice(0, 3).toUpperCase();

    let homeLogo: string | undefined;
    let awayLogo: string | undefined;
    let leagueLogo: string | undefined;
    let countryLogo: string | undefined;
    if (typeof dbMatch.homeTeam === 'object' && dbMatch.homeTeam?.logo) homeLogo = dbMatch.homeTeam.logo;
    if (typeof dbMatch.awayTeam === 'object' && dbMatch.awayTeam?.logo) awayLogo = dbMatch.awayTeam.logo;
    if (typeof dbMatch.league === 'object' && dbMatch.league?.logo) leagueLogo = dbMatch.league.logo;
    if (typeof dbMatch.country === 'object' && dbMatch.country?.logo) countryLogo = dbMatch.country.logo;

    const matchDate = new Date(dbMatch.date);
    const dateStr = matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = matchDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const scheduledTime = `${dateStr} at ${timeStr}`;

    return {
      id: dbMatch.id || Math.floor(Math.random() * 1000000),
      sport,
      league,
      homeTeam: String(homeTeam),
      awayTeam: String(awayTeam),
      date: dateStr,
      time: timeStr,
      scheduledTime,
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

async function fetchUpcomingFromAPI(): Promise<{ matches: UpcomingMatch[]; source: string }> {
  const url = getEdgeFunctionUrl('make-server-ed1dd9fb/matches/upcoming');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      mode: 'cors',
      credentials: 'omit',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) return { matches: fallbackMatches, source: 'fallback-demo' };
    const data = await response.json();
    let apiMatches: any[] = [];
    if (Array.isArray(data)) apiMatches = data;
    else if (Array.isArray(data.data)) apiMatches = data.data;
    else if (Array.isArray(data.matches)) apiMatches = data.matches;

    if (apiMatches.length > 0) {
      const mapped = apiMatches.map(mapApiMatchToUpcomingMatch).filter((m): m is UpcomingMatch => m !== null);
      if (mapped.length > 0) return { matches: mapped, source: 'api-upcoming' };
    }
    return { matches: fallbackMatches, source: 'fallback-demo' };
  } catch {
    return { matches: fallbackMatches, source: 'fallback-demo' };
  }
}

export function useUpcomingMatches() {
  const query = useQuery({
    queryKey: ['upcoming-matches'],
    queryFn: fetchUpcomingFromAPI,
    refetchInterval: POLL_INTERVAL,
    staleTime: 45 * 1000,
    gcTime: 5 * 60 * 1000,
    initialData: { matches: fallbackMatches, source: 'fallback-demo' as const },
  });

  return {
    matches: (query.data as any)?.matches || fallbackMatches,
    source: (query.data as any)?.source || 'loading',
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
