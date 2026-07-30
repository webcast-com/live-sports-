import { useState, useEffect, useCallback, useRef } from 'react';
import { LiveMatch, liveMatches as fallbackMatches } from '@/data/sportsData';
import { supabase } from '@/lib/supabase';

const POLL_INTERVAL = 30000; // Poll every 30 seconds

export function useScoreSimulator() {
  const [matches, setMatches] = useState<LiveMatch[]>(fallbackMatches);
  const [source, setSource] = useState<string>('local');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLiveScores = useCallback(async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('live-scores', {
        body: {},
      });

      if (fnError) {
        throw new Error(fnError.message || 'Edge function error');
      }

      if (data?.success && Array.isArray(data.matches) && data.matches.length > 0) {
        // Map the edge function response to our LiveMatch type
        const mapped: LiveMatch[] = data.matches.map((m: any) => ({
          id: m.id,
          sport: m.sport as LiveMatch['sport'],
          league: m.league,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          time: m.time,
          status: m.status as LiveMatch['status'],
          homeColor: m.homeColor,
          awayColor: m.awayColor,
          homeAbbr: m.homeAbbr,
          awayAbbr: m.awayAbbr,
        }));

        setMatches(mapped);
        setSource(data.source || 'edge-function');
        setError(null);
      }
    } catch (err: any) {
      console.warn('Failed to fetch live scores from edge function:', err.message);
      setError(err.message);
      // Keep existing matches (either previous API data or fallback)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchLiveScores();

    // Set up polling
    intervalRef.current = setInterval(fetchLiveScores, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchLiveScores]);

  return { matches, source, loading, error };
}
