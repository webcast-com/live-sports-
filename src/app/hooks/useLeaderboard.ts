import { useMemo } from 'react';
import { useAuth } from '@/app/context/AuthContext';

export type LeaderboardFilter = 'global' | 'weekly' | 'monthly' | 'friends';

interface LeaderboardEntry {
  user_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  accuracy_percent: number;
  total_predictions: number;
  correct_predictions: number;
  avg_confidence?: number;
}

const leaderboard: LeaderboardEntry[] = [
  { user_id: '1', first_name: 'Alex', last_name: 'Morgan', email: 'alex@example.com', accuracy_percent: 78, total_predictions: 124, correct_predictions: 97, avg_confidence: 81 },
  { user_id: '2', first_name: 'Jordan', last_name: 'Lee', email: 'jordan@example.com', accuracy_percent: 74, total_predictions: 112, correct_predictions: 83, avg_confidence: 76 },
  { user_id: '3', first_name: 'Sam', last_name: 'Taylor', email: 'sam@example.com', accuracy_percent: 71, total_predictions: 98, correct_predictions: 70, avg_confidence: 74 },
];

export function useLeaderboard({ limit }: { filter: LeaderboardFilter; limit: number }) {
  const { user } = useAuth();
  const entries = useMemo(() => leaderboard.slice(0, limit), [limit]);
  const currentUserRank = user ? entries.findIndex((entry) => entry.user_id === user.id) + 1 : 0;
  const currentUserEntry = currentUserRank ? entries[currentUserRank - 1] : null;
  return { leaderboard: entries, loading: false, currentUserRank: currentUserRank || null, currentUserEntry };
}
