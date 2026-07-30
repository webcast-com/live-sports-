import React, { useState, useMemo } from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';
import { LiveMatch, Sport } from '@/app/data/sportsData';
import LiveScoreCard from './LiveScoreCard';
import { useMatches } from "@/app/hooks/useMatches";

interface LiveScoresProps {
  matches: LiveMatch[];
  activeSport: Sport;
  searchQuery: string;
  onMatchClick: (match: LiveMatch) => void;
}

type SortOption = 'default' | 'league' | 'status';
type StatusFilter = 'all' | 'live' | 'halftime' | 'final';

const LiveScores: React.FC<LiveScoresProps> = ({ matches, activeSport, searchQuery, onMatchClick }) => {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredMatches = useMemo(() => {
    let result = [...matches];

    // Sport filter
    if (activeSport !== 'all') {
      result = result.filter((m) => m.sport === activeSport);
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.homeTeam.toLowerCase().includes(q) ||
          m.awayTeam.toLowerCase().includes(q) ||
          m.league.toLowerCase().includes(q) ||
          m.sport.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((m) => m.status === statusFilter);
    }

    // Favorites filter
    if (showFavoritesOnly) {
      result = result.filter((m) => favorites.has(m.id));
    }

    // Sort
    if (sortBy === 'league') {
      result.sort((a, b) => a.league.localeCompare(b.league));
    } else if (sortBy === 'status') {
      const order = { live: 0, halftime: 1, final: 2 };
      result.sort((a, b) => order[a.status] - order[b.status]);
    }

    return result;
  }, [matches, activeSport, searchQuery, statusFilter, showFavoritesOnly, sortBy, favorites]);

  return (
    <section id="live-scores" className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3" style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 1)' }}>
              <span className="w-1.5 h-8 bg-gradient-to-b from-[#00d4ff] to-[#0066ff] rounded-full" />
              Live Scores
            </h2>
            <p className="text-white text-sm mt-1">{filteredMatches.length} matches found</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-white [font-family:Times_New_Roman,serif] [text-shadow:1px_1px_3px_rgba(0,0,0,1)]">
            {/* Status filters */}
            {(['all', 'live', 'halftime', 'final'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${
                  statusFilter === status
                    ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30'
                    : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
                }`}
              >
                {status === 'all' ? 'All' : status === 'halftime' ? 'HT' : status}
              </button>
            ))}

            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Favorites toggle */}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                showFavoritesOnly
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
              }`}
            >
              <Filter className="w-3 h-3" />
              Favorites
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#161b22] text-gray-400 border border-white/10 focus:outline-none focus:border-[#00d4ff]/30 cursor-pointer"
              style={{ colorScheme: 'dark' }}
            >
              <option value="default">Default</option>
              <option value="league">By League</option>
              <option value="status">By Status</option>
            </select>

          </div>
        </div>

        {/* Grid */}
        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches.map((match) => (
              <LiveScoreCard
                key={match.id}
                match={match}
                isFavorite={favorites.has(match.id)}
                onToggleFavorite={toggleFavorite}
                onClick={onMatchClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <ArrowUpDown className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No matches found</p>
            <p className="text-gray-600 text-sm mt-1">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default LiveScores;
