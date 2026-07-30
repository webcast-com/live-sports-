import React from 'react';
import { Activity, TrendingUp, Users, Zap } from 'lucide-react';

const StatsBar: React.FC = () => {
  const stats = [
    { icon: Activity, label: 'Active Matches', value: '12', color: '#00d4ff', bgColor: '#0d2d4c' },
    { icon: TrendingUp, label: 'Trending', value: 'Arsenal', color: '#72cc11', bgColor: '#712d9d' },
    { icon: Users, label: 'Fans Online', value: '2.5M', color: '#72cc11', bgColor: '#1443c4' },
    { icon: Zap, label: 'Updates/min', value: '1,240', color: '#ff1919', bgColor: '#417505' },
  ];

  return (
    <section className="py-6 bg-[#161b22]/50 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                <div className="p-2 rounded-lg" style={{ backgroundColor: stat.bgColor }}>
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs truncate">{stat.label}</p>
                  <p className="text-white font-semibold text-sm truncate">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
