import React from 'react';
import { Target } from 'lucide-react';
import { topScorers } from '@/app/data/sportsData';

const TopScorers: React.FC = () => {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-[#00d4ff]" />
            Top Scorers
          </h2>
          <p className="text-gray-500 text-sm">Leading goal scorers across all leagues</p>
        </div>

        {/* Leaderboard */}
        <div className="bg-[#161b22] border border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">League</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Goals</th>
                </tr>
              </thead>
              <tbody>
                {topScorers.map((scorer, i) => (
                  <tr key={scorer.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#00d4ff]/20 text-[#00d4ff] font-bold text-sm">
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-semibold">{scorer.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-400 text-sm">{scorer.team}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-400 text-sm">{scorer.league}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 bg-green-500/20 text-green-400 font-bold rounded-lg text-sm">
                        {scorer.goals}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopScorers;
