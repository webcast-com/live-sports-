import { useMemo } from 'react';
import { LiveMatch } from '@/app/data/sportsData';

export function useRealtimeScores(matches: LiveMatch[] = []): {
  matches: LiveMatch[];
  isConnected: boolean;
  lastUpdate: Date | null;
} {
  const stableMatches = useMemo(() => matches, [matches]);
  return { matches: stableMatches, isConnected: false, lastUpdate: null };
}
