import { corsFetch } from './apiClient';

const API_HOST = import.meta.env.VITE_ALLSPORTS_API_HOST || 'allsportsapi2.p.rapidapi.com';
const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const LIVE_MATCHES_URL = 'https://allsportsapi2.p.rapidapi.com/api/matches/live';

export async function getAllSportsLiveMatches(): Promise<{
  data: unknown[] | null;
  error: string | null;
}> {
  if (!API_KEY || import.meta.env.VITE_ENABLE_ALLSPORTS_API !== 'true') {
    return { data: null, error: 'Live AllSports API is disabled; showing demo data.' };
  }

  const response = await corsFetch<unknown>(LIVE_MATCHES_URL, {
    headers: {
      'x-rapidapi-key': API_KEY,
      'x-rapidapi-host': API_HOST,
      'Content-Type': 'application/json',
    },
  });

  if (!response.data) {
    return { data: null, error: response.error || 'AllSports live matches request failed' };
  }

  const payload = response.data as Record<string, unknown>;
  const matches = Array.isArray(response.data)
    ? response.data
    : Array.isArray(payload.matches)
      ? payload.matches
      : Array.isArray(payload.response)
        ? payload.response
        : Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload.result)
            ? payload.result
            : null;

  return {
    data: matches,
    error: matches ? null : 'AllSports live matches response had an unsupported format',
  };
}
