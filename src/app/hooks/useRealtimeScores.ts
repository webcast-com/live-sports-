import { useMemo } from 'react';
import { LiveMatch } from '@/app/data/sportsData';

export function useRealtimeScores(matches: LiveMatch[] = []) {
  const stableMatches = useMemo(() => matches, [matches]);
  return { matches: stableMatches, isConnected: false, lastUpdate: null };
}
