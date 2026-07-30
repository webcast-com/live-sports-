import React from 'react';
import { Star } from 'lucide-react';
import { LiveMatch } from '@/app/data/sportsData';

interface LiveScoreCardProps {
  match: LiveMatch;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  onClick: (match: LiveMatch) => void;
}

const LiveScoreCard: React.FC<LiveScoreCardProps> = ({ match, isFavorite, onToggleFavorite, onClick }) => {
  const statusBadge = () => {
    switch (match.status) {
      case 'live':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/20 rounded-full">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-[10px] font-bold uppercase">Live</span>
          </span>
        );
      case 'halftime':
        return (
          <span className="px-2 py-0.5 bg-yellow-500/20 rounded-full text-yellow-400 text-[10px] font-bold uppercase">
            HT
          </span>
        );
      case 'final':
        return (
          <span className="px-2 py-0.5 bg-gray-500/20 rounded-full text-gray-400 text-[10px] font-bold uppercase">
            Final
          </span>
        );
    }
  };

  return (
    <div
      className="group relative bg-[#161b22] rounded-2xl p-5 hover:bg-[#1c2333] transition-all cursor-pointer"
      onClick={() => onClick(match)}
      style={{ border: 'none', textShadow: '1px 1px 3px rgba(0, 0, 0, 1)' }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {match.leagueLogo && (
            <img
              src={match.leagueLogo}
              alt={match.league}
              className="w-4 h-4 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          {match.countryLogo && (
            <img
              src={match.countryLogo}
              alt="Country"
              className="w-4 h-4 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{match.league}</span>
          <span className="text-gray-700">|</span>
          <span className="text-[10px] text-gray-500 capitalize">{match.sport}</span>
        </div>
        <div className="flex items-center gap-2">
          {statusBadge()}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(match.id);
            }}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Star
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 hover:text-gray-400'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Teams and scores */}
      <div className="space-y-3">
        {/* Home team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {match.homeLogo ? (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 shadow-md overflow-hidden flex-shrink-0">
                <img
                  src={match.homeLogo}
                  alt={match.homeTeam}
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.style.backgroundColor = match.homeColor;
                      parent.innerHTML = `<span class="text-white text-[10px] font-black">${match.homeAbbr}</span>`;
                    }
                  }}
                />
              </div>
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-black shadow-md flex-shrink-0"
                style={{ backgroundColor: match.homeColor }}
              >
                {match.homeAbbr}
              </div>
            )}
            <span className="text-white font-medium text-sm truncate">{match.homeTeam}</span>
          </div>
          <span className={`text-2xl font-black tabular-nums ml-2 flex-shrink-0 ${
            match.homeScore > match.awayScore ? 'text-white' : 'text-gray-500'
          }`}>
            {match.homeScore}
          </span>
        </div>

        {/* Away team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {match.awayLogo ? (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 shadow-md overflow-hidden flex-shrink-0">
                <img
                  src={match.awayLogo}
                  alt={match.awayTeam}
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.style.backgroundColor = match.awayColor;
                      parent.innerHTML = `<span class="text-white text-[10px] font-black">${match.awayAbbr}</span>`;
                    }
                  }}
                />
              </div>
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-black shadow-md flex-shrink-0"
                style={{ backgroundColor: match.awayColor }}
              >
                {match.awayAbbr}
              </div>
            )}
            <span className="text-white font-medium text-sm truncate">{match.awayTeam}</span>
          </div>
          <span className={`text-2xl font-black tabular-nums ml-2 flex-shrink-0 ${
            match.awayScore > match.homeScore ? 'text-white' : 'text-gray-500'
          }`}>
            {match.awayScore}
          </span>
        </div>
      </div>

      {/* Time bar */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[#00d4ff] text-xs font-mono font-semibold">{match.time}</span>
        <span className="text-gray-600 text-xs group-hover:text-[#00d4ff] transition-colors">View Details →</span>
      </div>

      {/* Glow effect on hover */}
      {match.status === 'live' && (
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="absolute inset-0 rounded-2xl shadow-[0_0_30px_rgba(0,212,255,0.1)]" />
        </div>
      )}
    </div>
  );
};

export default LiveScoreCard;
