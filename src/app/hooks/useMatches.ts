import { liveMatches } from '@/app/data/sportsData';

export function useMatches() {
  return { matches: liveMatches, loading: false, error: null };
}
