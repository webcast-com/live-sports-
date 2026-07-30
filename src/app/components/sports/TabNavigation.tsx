import React from 'react';
import { Radio, Target, Crown, Settings, Webhook, CreditCard, BarChart3, Zap, Trophy, Shield, Gift } from 'lucide-react';

export type MainTab = 'dashboard' | 'predictions' | 'results' | 'sure-bets' | 'premium' | 'settings' | 'subscription' | 'webhook' | 'leaderboard' | 'admin' | 'referral';

interface Tab {
  key: MainTab;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { key: 'dashboard', label: 'Live Scores', icon: <Radio className="w-4 h-4" /> },
  { key: 'predictions', label: 'Predictions', icon: <Target className="w-4 h-4" /> },
  { key: 'results', label: 'Results', icon: <BarChart3 className="w-4 h-4" /> },
  { key: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
  { key: 'sure-bets', label: 'Sure Bets', icon: <Zap className="w-4 h-4" /> },
  { key: 'premium', label: 'Premium', icon: <Crown className="w-4 h-4" /> },
  { key: 'referral', label: 'Refer & Earn', icon: <Gift className="w-4 h-4" /> },
  { key: 'subscription', label: 'Subscription', icon: <CreditCard className="w-4 h-4" /> },
  { key: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  { key: 'admin', label: 'Admin', icon: <Shield className="w-4 h-4" /> },
  { key: 'webhook', label: 'Webhook', icon: <Webhook className="w-4 h-4" /> },
];

interface TabNavigationProps {
  activeTab: MainTab;
  onChange: (tab: MainTab) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onChange }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex gap-2 p-1.5 border border-white/10 rounded-2xl w-full overflow-x-auto backdrop-blur-sm self-stretch scrollbar-thin" style={{ backgroundColor: 'rgba(158, 86, 16, 0.2)', textShadow: '1px 1px 3px rgba(0, 0, 0, 1)' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-[#00d4ff] to-[#00ff88] text-[#0d1117] shadow-lg shadow-[#00d4ff]/30'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;
