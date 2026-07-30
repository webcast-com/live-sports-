import { useQuery } from '@tanstack/react-query';
import { getEdgeFunctionUrl, SUPABASE_ANON_KEY } from '@/lib/supabase';

export interface Transfer {
  id: string;
  player: string;
  from: string;
  to: string;
  fee: string;
  date: string;
}

const POLL_INTERVAL = 5 * 60 * 1000;
const LIVE_TRANSFERS_API_ENABLED = import.meta.env.VITE_ENABLE_LIVE_TRANSFERS_API !== 'false';
const fallbackTransfers: Transfer[] = [
  { id: 'demo-1', player: 'Recent transfer updates', from: 'Transfer window', to: 'Live feed', fee: 'Check back soon', date: 'Demo data' },
  { id: 'demo-2', player: 'Football transfer news', from: 'Clubs and leagues', to: 'Worldwide', fee: 'Latest moves', date: 'Demo data' },
];

function readValue(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return readValue(record.name ?? record.displayName ?? record.title ?? record.shortName);
  }
  return '';
}

function mapTransfer(item: Record<string, unknown>, index: number): Transfer | null {
  const player = readValue(item.player ?? item.player_name ?? item.name ?? item.athlete);
  if (!player) return null;
  const from = readValue(item.from ?? item.from_team ?? item.old_team ?? item.previous_team ?? item.source) || 'Free agent';
  const to = readValue(item.to ?? item.to_team ?? item.new_team ?? item.current_team ?? item.destination) || 'Undisclosed';
  const fee = readValue(item.fee ?? item.transfer_fee ?? item.price ?? item.amount) || 'Undisclosed';
  const date = readValue(item.date ?? item.transfer_date ?? item.created_at) || 'Recent';
  return { id: readValue(item.id) || `${player}-${index}`, player, from, to, fee, date };
}

function getTransferList(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'));
  if (!data || typeof data !== 'object') return [];
  const record = data as Record<string, unknown>;
  for (const key of ['response', 'data', 'transfers', 'results']) {
    if (Array.isArray(record[key])) return getTransferList(record[key]);
  }
  return [];
}

async function fetchTransfersFromAPI(): Promise<{ transfers: Transfer[]; source: 'api-live' | 'fallback-demo' }> {
  if (!LIVE_TRANSFERS_API_ENABLED) return { transfers: fallbackTransfers, source: 'fallback-demo' };
  const response = await fetch(getEdgeFunctionUrl('football-transfers'), {
    headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
    credentials: 'omit',
  });
  if (!response.ok) throw new Error(`Transfer API returned ${response.status}`);
  const mapped = getTransferList(await response.json())
    .map(mapTransfer)
    .filter((t): t is Transfer => t !== null)
    .slice(0, 8);
  if (mapped.length > 0) return { transfers: mapped, source: 'api-live' };
  return { transfers: fallbackTransfers, source: 'fallback-demo' };
}

export function useTransfers() {
  const query = useQuery({
    queryKey: ['football-transfers'],
    queryFn: fetchTransfersFromAPI,
    refetchInterval: POLL_INTERVAL,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    initialData: { transfers: fallbackTransfers, source: 'fallback-demo' as const },
  });

  return {
    transfers: (query.data as any)?.transfers || fallbackTransfers,
    source: (query.data as any)?.source || 'loading',
    loading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
