import { useCallback } from 'react';

const storageKey = 'scorehub-activity';

function record(action: string, metadata?: unknown) {
  try {
    const activity = JSON.parse(localStorage.getItem(storageKey) || '[]');
    activity.unshift({ action, metadata, timestamp: new Date().toISOString() });
    localStorage.setItem(storageKey, JSON.stringify(activity.slice(0, 100)));
  } catch {}
}

export function useActivityTracking() {
  const track = useCallback(({ action, metadata }: { action: string; metadata?: unknown }) => record(action, metadata), []);
  const trackPageView = useCallback((path: string, metadata?: unknown) => record('page_view', { path, ...metadata as object }), []);
  const trackTabSwitch = useCallback((previous: string, next: string) => record('tab_switch', { previous, next }), []);
  const trackSportFilter = useCallback((sport: string, previous?: string) => record('sport_filter', { sport, previous }), []);
  const trackMatchView = useCallback((id: number, homeTeam: string, awayTeam: string) => record('match_view', { id, homeTeam, awayTeam }), []);
  return { track, trackPageView, trackTabSwitch, trackSportFilter, trackMatchView };
}
