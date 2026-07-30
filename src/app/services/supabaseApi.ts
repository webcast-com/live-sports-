import { getEdgeFunctionUrl, SUPABASE_ANON_KEY } from '@/lib/supabase';

export async function fetchSupabaseApi<T>(service: string, params: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams({ service, ...params });
  const response = await fetch(`${getEdgeFunctionUrl(`rapidapi?${query}`)}`, {
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    credentials: 'omit',
  });

  const body = await response.text();
  let data: unknown;
  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    throw new Error('Supabase API returned an invalid response');
  }

  if (!response.ok) {
    const message = data && typeof data === 'object' && 'error' in (data as any) ? String((data as any).error) : `Supabase API returned ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}
