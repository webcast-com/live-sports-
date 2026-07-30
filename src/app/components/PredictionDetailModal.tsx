import { X, TrendingUp } from 'lucide-react';
import { Match } from '../data/mockData';

interface PredictionDetailModalProps {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
}

export function PredictionDetailModal({ match, isOpen, onClose }: PredictionDetailModalProps) {
  if (!isOpen || !match.prediction) return null;

  const { homeWinOdds, drawOdds, awayWinOdds, confidence } = match.prediction;

  const getConfidenceColor = () => {
    if (confidence >= 75) return 'text-green-400 bg-green-500/10 border-green-500/30';
    if (confidence >= 50) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
  };

  const getOddsColor = (odds: number) => {
    if (odds < 2) return 'text-green-400';
    if (odds < 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-white/10 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#00d4ff]" />
            <h2 className="text-xl font-bold text-white">Prediction Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Match Info */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{match.league}</span>
                <span className="text-xs bg-[#00d4ff]/20 text-[#00d4ff] px-2 py-1 rounded">
                  {match.sport.toUpperCase()}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">{match.homeTeam}</span>
                  <span className="text-sm text-gray-400">vs</span>
                  <span className="text-white font-semibold">{match.awayTeam}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Confidence Badge */}
          <div className={`p-4 rounded-lg border ${getConfidenceColor()}`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">Prediction Confidence</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black">{confidence}%</span>
              <span className="text-xs opacity-75">Likelihood</span>
            </div>
            <div className="mt-3 w-full bg-black/30 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                style={{ width: `${confidence}%` }}
              />
            </div>
          </div>

          {/* Odds Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Match Odds</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="text-xs text-gray-400 mb-1">Home Win</div>
                <div className={`text-lg font-black ${getOddsColor(homeWinOdds)}`}>
                  {homeWinOdds.toFixed(2)}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="text-xs text-gray-400 mb-1">Draw</div>
                <div className={`text-lg font-black ${getOddsColor(drawOdds)}`}>
                  {drawOdds.toFixed(2)}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="text-xs text-gray-400 mb-1">Away Win</div>
                <div className={`text-lg font-black ${getOddsColor(awayWinOdds)}`}>
                  {awayWinOdds.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-200">
            <p className="font-semibold mb-1">💡 About This Prediction</p>
            <p>
              This prediction is based on historical match data, team performance metrics, and live odds from major bookmakers.
              Confidence scores range from 50% to 100%.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-6 border-t border-white/5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-semibold"
          >
            Close
          </button>
          <button className="flex-1 px-4 py-2 bg-[#00d4ff] hover:bg-[#00d4ff]/90 text-black rounded-lg transition-colors font-semibold">
            Set Alert
          </button>
        </div>
      </div>
    </div>
  );
}
