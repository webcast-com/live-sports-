import { TrendingUp, ChevronRight } from 'lucide-react';

export interface PredictionBadgeProps {
  homeWinOdds: number;
  drawOdds: number;
  awayWinOdds: number;
  confidence: number;
  onTap?: () => void;
}

export function PredictionBadge({
  homeWinOdds,
  drawOdds,
  awayWinOdds,
  confidence,
  onTap
}: PredictionBadgeProps) {
  const getConfidenceColor = () => {
    if (confidence >= 75) return 'bg-green-500/20 text-green-400';
    if (confidence >= 50) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-gray-500/20 text-gray-400';
  };

  const getConfidenceBgGlow = () => {
    if (confidence >= 75) return 'hover:bg-green-500/30';
    if (confidence >= 50) return 'hover:bg-yellow-500/30';
    return 'hover:bg-gray-500/30';
  };

  const getHighestOdds = () => {
    const odds = [
      { label: 'Home', value: homeWinOdds },
      { label: 'Draw', value: drawOdds },
      { label: 'Away', value: awayWinOdds }
    ];
    return odds.reduce((max, curr) => curr.value > max.value ? curr : max);
  };

  const topPick = getHighestOdds();

  return (
    <button
      onClick={onTap}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${getConfidenceColor()} ${getConfidenceBgGlow()} border border-current/20 hover:border-current/40 text-xs font-semibold`}
    >
      <div className="flex items-center gap-1">
        <TrendingUp className="w-3 h-3" />
        <span>{topPick.label}</span>
      </div>
      <span className="text-[10px] opacity-75">{confidence}%</span>
      <ChevronRight className="w-3 h-3 opacity-50" />
    </button>
  );
}
