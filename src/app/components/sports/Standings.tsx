import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Standing } from '@/app/data/sportsData';

interface StandingsProps {
  standings: Standing[];
}

const Standings: React.FC<StandingsProps> = ({ standings }) => {
  return (
    <section id="standings" className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
            <BarChart3 className="w-6 h-6 text-[#00d4ff]" />
            Standings
          </h2>
          <p className="text-gray-500 text-sm">League tables and rankings</p>
        </div>

        {/* Standings table */}
        <div className="bg-[#161b22] border border-white/5 rounded-xl overflow-hidden">
          {/* League header */}
          <div className="px-6 py-4 bg-white/5 border-b border-white/5">
            <h3 className="text-white font-bold text-lg">Premier League</h3>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/[2%]">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Pos</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">P</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">W</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">D</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">L</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">GF</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">GA</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">GD</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Pts</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Streak</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((standing) => {
                  const totalPlayed = standing.wins + standing.losses + (standing.draws || 0);
                  const goalDifference = standing.gf - standing.ga;

                  return (
                    <tr key={`${standing.rank}-${standing.team}`} className="border-b border-white/5 hover:bg-white/5 transition-all">
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#00d4ff]/20 text-[#00d4ff] font-bold text-xs">
                          {standing.rank}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: standing.color }}
                          />
                          <p className="text-white font-semibold text-sm">{standing.team}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center text-gray-400 text-sm">{totalPlayed}</td>
                      <td className="px-6 py-3 text-center text-gray-400 text-sm">{standing.wins}</td>
                      <td className="px-6 py-3 text-center text-gray-400 text-sm">{standing.draws || 0}</td>
                      <td className="px-6 py-3 text-center text-gray-400 text-sm">{standing.losses}</td>
                      <td className="px-6 py-3 text-center text-gray-400 text-sm">{standing.gf}</td>
                      <td className="px-6 py-3 text-center text-gray-400 text-sm">{standing.ga}</td>
                      <td className="px-6 py-3 text-center text-sm font-semibold">
                        <span className={goalDifference > 0 ? 'text-green-400' : goalDifference < 0 ? 'text-red-400' : 'text-gray-400'}>
                          {goalDifference > 0 ? '+' : ''}{goalDifference}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 bg-[#00d4ff]/20 text-[#00d4ff] font-bold rounded text-sm">
                          {standing.points}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className={`text-xs font-bold ${standing.streak.startsWith('W') ? 'text-green-400' : standing.streak.startsWith('L') ? 'text-red-400' : 'text-gray-400'}`}>
                          {standing.streak}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Standings;
