import React from 'react';
import { Sport } from '@/app/data/sportsData';
import { Star, Heart, TrendingUp } from 'lucide-react';
import { useFavorites } from '@/app/hooks/useFavorites';
import { useActivityTracking } from '@/app/hooks/useActivityTracking';
import { useAuth } from '@/app/context/AuthContext';

interface QuickLinksProps {
  onSportChange: (sport: Sport) => void;
}

const leagues = [
  { name: 'NFL', sport: 'football' as Sport, color: '#013369', accent: '#D50A0A', matches: 3, league: 'NFL' },
  { name: 'NBA', sport: 'basketball' as Sport, color: '#1D428A', accent: '#C8102E', matches: 4, league: 'NBA' },
  { name: 'Premier League', sport: 'soccer' as Sport, color: '#3D195B', accent: '#00FF87', matches: 2, league: 'Premier League' },
  { name: 'MLB', sport: 'baseball' as Sport, color: '#002D72', accent: '#E4002B', matches: 2, league: 'MLB' },
  { name: 'ATP Tour', sport: 'tennis' as Sport, color: '#00A651', accent: '#FFD700', matches: 2, league: 'ATP Tour' },
  { name: 'La Liga', sport: 'soccer' as Sport, color: '#FF4B44', accent: '#2A2A2A', matches: 1, league: 'La Liga' },
  { name: 'Serie A', sport: 'soccer' as Sport, color: '#024494', accent: '#008FD5', matches: 1, league: 'Serie A' },
  { name: 'Bundesliga', sport: 'soccer' as Sport, color: '#D20515', accent: '#FFFFFF', matches: 1, league: 'Bundesliga' },
];

const QuickLinks: React.FC<QuickLinksProps> = ({ onSportChange }) => {
  const { user } = useAuth();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { trackSportFilter, track } = useActivityTracking();

  const handleLeagueClick = (league: typeof leagues[0]) => {
    trackSportFilter(league.sport, undefined);
    track({ action: 'league_click', metadata: { league: league.name, sport: league.sport } });
    onSportChange(league.sport);
    document.getElementById('live-scores')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFavoriteToggle = async (e: React.MouseEvent, league: typeof leagues[0]) => {
    e.stopPropagation();
    if (!user) {
      alert('Please sign in to save favorites');
      return;
    }
    try {
      await toggleFavorite({ team_name: league.name, league: league.league, sport: league.sport, team_abbr: league.name.slice(0, 3).toUpperCase() });
      track({ action: 'favorite_toggle', metadata: { team: league.name, league: league.league, sport: league.sport, isFavorite: !isFavorite(league.name) } });
    } catch (err) {
      console.error('Favorite toggle failed', err);
    }
  };

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Popular Leagues
            {favorites.length > 0 && <span className="text-xs font-normal text-[#00d4ff] bg-[#00d4ff]/10 border border-[#00d4ff]/20 px-2 py-0.5 rounded-full">{favorites.length} favorites</span>}
          </h3>
          <button onClick={() => document.getElementById('live-scores')?.scrollIntoView({ behavior: 'smooth' })} className="text-[#00d4ff] text-sm font-medium hover:underline">View All</button>
        </div>

        {/* Favorites row if any */}
        {favorites.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-red-400" />
              <h4 className="text-sm font-semibold text-white">Your Favorites</h4>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {favorites.map((fav) => (
                <div key={fav.id} className="flex items-center gap-2 px-3 py-2 bg-[#1c2333] border border-[#00d4ff]/20 rounded-xl shrink-0">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center text-white text-[8px] font-black">{fav.team_abbr || fav.team_name.slice(0, 3)}</div>
                  <span className="text-white text-xs font-medium">{fav.team_name}</span>
                  <span className="text-gray-500 text-[10px]">{fav.league}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {leagues.map((league) => {
            const fav = isFavorite(league.name);
            return (
              <div key={league.name} className="relative group">
                <button onClick={() => handleLeagueClick(league)} className="w-full flex flex-col items-center gap-2 p-4 bg-[#161b22] border border-white/5 rounded-xl hover:border-white/20 hover:bg-[#1c2333] transition-all">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: league.color }}>{league.name.length > 4 ? league.name.slice(0, 3) : league.name}</div>
                  <span className="text-white text-xs font-medium text-center leading-tight">{league.name}</span>
                  <span className="text-gray-500 text-[10px]">{league.matches} live</span>
                </button>
                <button onClick={(e) => handleFavoriteToggle(e, league)} className={`absolute top-1 right-1 p-1 rounded-full transition-colors ${fav ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white opacity-0 group-hover:opacity-100'}`}>
                  <Heart className={`w-3 h-3 ${fav ? 'fill-red-400' : ''}`} />
                </button>
                {fav && <Star className="absolute -top-1 -right-1 w-3 h-3 text-amber-400 fill-amber-400" />}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-2 text-[11px] text-gray-500">
          <TrendingUp className="w-3 h-3" />
          <span>Phase 3: Favorites now saved to Supabase with realtime sync + activity tracking.</span>
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;
