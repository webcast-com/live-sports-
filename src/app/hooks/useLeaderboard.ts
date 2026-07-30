import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/context/AuthContext';

export type LeaderboardFilter = 'global' | 'weekly' | 'monthly' | 'friends';

export interface LeaderboardEntry {
  user_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  accuracy_percent: number;
  total_predictions: number;
  correct_predictions: number;
  avg_confidence?: number;
}

type PredictionResult = {
  user_id: string | null;
  is_correct: boolean | null;
  confidence: number | null;
};

function aggregateResults(results: PredictionResult[]): Map<string, Omit<LeaderboardEntry, 'user_id'>> {
  const aggregates = new Map<string, { total: number; correct: number; confidenceTotal: number; confidenceCount: number }>();

  for (const result of results) {
    if (!result.user_id) continue;
    const aggregate = aggregates.get(result.user_id) || { total: 0, correct: 0, confidenceTotal: 0, confidenceCount: 0 };
    aggregate.total += 1;
    if (result.is_correct) aggregate.correct += 1;
    if (typeof result.confidence === 'number') {
      aggregate.confidenceTotal += result.confidence;
      aggregate.confidenceCount += 1;
    }
    aggregates.set(result.user_id, aggregate);
  }

  return new Map(
    [...aggregates.entries()].map(([userId, aggregate]) => [userId, {
      accuracy_percent: Number(((aggregate.correct / aggregate.total) * 100).toFixed(2)),
      total_predictions: aggregate.total,
      correct_predictions: aggregate.correct,
      avg_confidence: aggregate.confidenceCount ? Number((aggregate.confidenceTotal / aggregate.confidenceCount).toFixed(2)) : undefined,
    }]),
  );
}

export function useLeaderboard({ filter, limit }: { filter: LeaderboardFilter; limit: number }) {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadLeaderboard() {
      setLoading(true);

      if (filter === 'global') {
        const { data } = await supabase
          .from('leaderboard_view')
          .select('user_id, email, first_name, last_name, accuracy_percent, total_predictions, correct_predictions, avg_confidence')
          .order('accuracy_percent', { ascending: false })
          .order('total_predictions', { ascending: false })
          .limit(limit);

        if (active) {
          setLeaderboard((data || []) as LeaderboardEntry[]);
          setLoading(false);
        }
        return;
      }

      let resultsQuery = supabase
        .from('prediction_results')
        .select('user_id, is_correct, confidence, created_at')
        .not('user_id', 'is', null);

      if (filter === 'weekly' || filter === 'monthly') {
        const start = new Date();
        start.setDate(start.getDate() - (filter === 'weekly' ? 7 : 30));
        resultsQuery = resultsQuery.gte('created_at', start.toISOString());
      } else if (filter === 'friends') {
        if (!user) {
          if (active) {
            setLeaderboard([]);
            setLoading(false);
          }
          return;
        }

        const { data: friendships } = await supabase
          .from('friendships')
          .select('requester_id, addressee_id')
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
          .eq('status', 'accepted');
        const friendIds = (friendships || []).map((friendship) => friendship.requester_id === user.id ? friendship.addressee_id : friendship.requester_id);
        if (!friendIds.length) {
          if (active) {
            setLeaderboard([]);
            setLoading(false);
          }
          return;
        }
        resultsQuery = resultsQuery.in('user_id', friendIds);
      }

      const { data: results } = await resultsQuery;
      const aggregates = aggregateResults((results || []) as PredictionResult[]);
      const userIds = [...aggregates.keys()];
      if (!userIds.length) {
        if (active) {
          setLeaderboard([]);
          setLoading(false);
        }
        return;
      }

      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, email, first_name, last_name')
        .in('user_id', userIds);
      const profileById = new Map((profiles || []).map((profile) => [profile.user_id, profile]));
      const entries = userIds.map((userId) => ({ user_id: userId, ...profileById.get(userId), ...aggregates.get(userId)! }))
        .sort((a, b) => b.accuracy_percent - a.accuracy_percent || b.total_predictions - a.total_predictions)
        .slice(0, limit);

      if (active) {
        setLeaderboard(entries);
        setLoading(false);
      }
    }

    void loadLeaderboard();
    return () => {
      active = false;
    };
  }, [filter, limit, user]);

  const currentUserRank = user ? leaderboard.findIndex((entry) => entry.user_id === user.id) + 1 : 0;
  const currentUserEntry = currentUserRank ? leaderboard[currentUserRank - 1] : null;

  return { leaderboard, loading, currentUserRank: currentUserRank || null, currentUserEntry };
}
