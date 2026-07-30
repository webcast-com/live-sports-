import { useMemo } from 'react';
import { liveMatches, Sport } from '@/app/data/sportsData';

export interface SearchResult {
  id: string;
  type: 'match' | 'team' | 'league';
  title: string;
  subtitle: string;
  data: { sport?: Sport };
}

export function useSearch({ query, maxResults }: { query: string; maxResults: number }) {
  const results = useMemo<SearchResult[]>(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];
    const seenTeams = new Set<string>();
    const seenLeagues = new Set<string>();
    const matches: SearchResult[] = [];

    for (const match of liveMatches) {
      if (`${match.homeTeam} ${match.awayTeam} ${match.league}`.toLowerCase().includes(normalizedQuery)) {
        matches.push({ id: `match-${match.id}`, type: 'match', title: `${match.homeTeam} vs ${match.awayTeam}`, subtitle: `${match.league} · ${match.status}`, data: { sport: match.sport } });
      }
      for (const team of [match.homeTeam, match.awayTeam]) {
        if (!seenTeams.has(team) && team.toLowerCase().includes(normalizedQuery)) {
          seenTeams.add(team);
          matches.push({ id: `team-${team}`, type: 'team', title: team, subtitle: match.league, data: { sport: match.sport } });
        }
      }
      if (!seenLeagues.has(match.league) && match.league.toLowerCase().includes(normalizedQuery)) {
        seenLeagues.add(match.league);
        matches.push({ id: `league-${match.league}`, type: 'league', title: match.league, subtitle: match.sport, data: { sport: match.sport } });
      }
    }
    return matches.slice(0, maxResults);
  }, [maxResults, query]);

  return { results, hasResults: results.length > 0 };
}
