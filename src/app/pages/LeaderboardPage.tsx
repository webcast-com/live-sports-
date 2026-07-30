import React, { useState } from 'react';
import { Trophy, Crown, TrendingUp, Users, Calendar, Star, Medal, Target, BarChart3 } from 'lucide-react';
import { useLeaderboard, LeaderboardFilter } from '@/app/hooks/useLeaderboard';
import { useAuth } from '@/app/context/AuthContext';
import SEO from '@/app/components/SEO';

const LeaderboardPage: React.FC = () => {
  const [filter, setFilter] = useState<LeaderboardFilter>('global');
  const { leaderboard, loading, currentUserRank, currentUserEntry } = useLeaderboard({ filter, limit: 50 });
  const { user } = useAuth();

  const filters: { key: LeaderboardFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'global', label: 'Global', icon: <Trophy className="w-4 h-4" /> },
    { key: 'weekly', label: 'Weekly', icon: <Calendar className="w-4 h-4" /> },
    { key: 'monthly', label: 'Monthly', icon: <BarChart3 className="w-4 h-4" /> },
    { key: 'friends', label: 'Friends', icon: <Users className="w-4 h-4" /> },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="text-gray-500 font-mono text-sm">#{rank}</span>;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 75) return 'text-emerald-400';
    if (accuracy >= 65) return 'text-yellow-400';
    return 'text-gray-400';
  };

  return (
    <div className="space-y-6">
      <SEO pageKey="leaderboard" title="Leaderboard - Top Predictors | ScoreHub" description="Global leaderboard of top sports predictors - accuracy, rankings, weekly champions" />

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400" />
            Leaderboard
          </h1>
          <p className="text-gray-400 mt-2">Top predictors ranked by accuracy - Phase 4 enhanced with global, weekly, monthly, friends filters</p>
        </div>
        {currentUserRank && (
          <div className="bg-gradient-to-r from-[#00d4ff]/10 to-[#0066ff]/10 border border-[#00d4ff]/20 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Your Rank</p>
            <p className="text-2xl font-black text-[#00d4ff]">#{currentUserRank}</p>
            <p className="text-xs text-gray-500">{currentUserEntry?.accuracy_percent}% accuracy · {currentUserEntry?.total_predictions} picks</p>
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filter === f.key ? 'bg-[#00d4ff] text-[#0d1117] shadow-lg shadow-[#00d4ff]/20' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400'}`}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {currentUserEntry && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">{user?.email?.[0]?.toUpperCase() || 'Y'}</div>
            <div>
              <p className="text-white font-semibold">You · Rank #{currentUserRank}</p>
              <p className="text-amber-300 text-sm">{currentUserEntry.accuracy_percent}% accuracy · {currentUserEntry.total_predictions} total · {currentUserEntry.correct_predictions} correct</p>
            </div>
          </div>
          <TrendingUp className="w-5 h-5 text-amber-400" />
        </div>
      )}

      <div className="bg-[#161b22] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2"><Star className="w-4 h-4 text-amber-400" /> Top Predictors - {filter.charAt(0).toUpperCase() + filter.slice(1)}</h3>
          <span className="text-xs text-gray-500">{leaderboard.length} users</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading leaderboard...</div>
        ) : (
          <div className="divide-y divide-white/5">
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.user_id === user?.id;
              return (
                <div key={entry.user_id} className={`p-4 flex items-center gap-4 hover:bg-white/5 transition-colors ${isCurrentUser ? 'bg-[#00d4ff]/5 border-l-2 border-l-[#00d4ff]' : ''}`}>
                  <div className="w-10 flex items-center justify-center">{getRankIcon(rank)}</div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {(entry.first_name?.[0] || entry.email?.[0] || 'U').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate flex items-center gap-2">
                      {entry.first_name ? `${entry.first_name} ${entry.last_name || ''}`.trim() : entry.email?.split('@')[0] || 'Anonymous'}
                      {rank <= 3 && <Crown className="w-3 h-3 text-amber-400" />}
                      {isCurrentUser && <span className="text-[10px] bg-[#00d4ff]/20 text-[#00d4ff] px-1.5 py-0.5 rounded">You</span>}
                    </p>
                    <p className="text-gray-500 text-xs truncate">{entry.email || 'No email'} · {entry.total_predictions} picks</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getAccuracyColor(entry.accuracy_percent)}`}>{entry.accuracy_percent}%</p>
                    <p className="text-gray-600 text-xs flex items-center gap-1"><Target className="w-3 h-3" /> {entry.correct_predictions}/{entry.total_predictions}</p>
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-gray-400 text-xs">Avg conf</p>
                    <p className="text-white text-sm">{entry.avg_confidence ? `${Math.round(entry.avg_confidence)}%` : '-'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="p-4 bg-white/5 border-t border-white/5 text-[11px] text-gray-500 flex items-center gap-2">
          <TrendingUp className="w-3 h-3" />
          Phase 4: Leaderboard now uses Supabase view + TanStack Query + friends filter + realtime + accuracy charts ready.
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
