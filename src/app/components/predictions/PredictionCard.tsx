import { Prediction } from '../../data/mockData';
import { format } from 'date-fns';
import { Lock, LockOpen, Info, Bookmark } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSavedPredictions } from '../../hooks/useSavedPredictions';

interface PredictionCardProps {
  prediction: Prediction;
  onUpgrade: () => void;
  forceLocked?: boolean;
  onSaveToggle?: (predictionId: string, isSaved: boolean) => void;
}

export function PredictionCard({ prediction, onUpgrade, forceLocked = false, onSaveToggle }: PredictionCardProps) {
  const { user } = useAuth();
  const { isSaved, toggleSaved } = useSavedPredictions();
  const isLocked = forceLocked || (prediction.isPremium && user?.plan !== 'premium');
  const saved = isSaved(prediction.id);

  const handleBookmarkClick = async () => {
    if (!user) {
      onUpgrade();
      return;
    }
    await toggleSaved(prediction.id);
    onSaveToggle?.(prediction.id, !saved);
  };

  return (
    <div className="bg-[#161b22] border border-white/5 rounded-2xl overflow-hidden transition-all duration-200 hover:border-[#00d4ff]/20 hover:shadow-lg hover:shadow-[#00d4ff]/10">
      <div className="p-5 flex flex-col h-full">
        {/* Header: League & Date */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              {prediction.league}
            </span>
            <div className="text-sm text-gray-400 mt-0.5">
              {format(new Date(prediction.date), 'MMM d, HH:mm')}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={handleBookmarkClick}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Bookmark
                  className={`w-4 h-4 ${
                    saved
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-gray-600 hover:text-gray-400'
                  }`}
                />
              </button>
            )}
            {isLocked || prediction.isPremium ? (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-semibold">
                <Lock className="w-3 h-3" /> Premium
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <LockOpen className="w-3 h-3" /> Free
              </span>
            )}
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col items-center flex-1">
            <img src={prediction.homeLogo} alt={prediction.homeTeam} className="w-12 h-12 object-contain mb-2" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/48?text=' + prediction.homeTeam[0]; }} />
            <span className="text-sm font-semibold text-center leading-tight text-white">{prediction.homeTeam}</span>
          </div>
          <div className="px-4 text-gray-600 font-medium text-sm">VS</div>
          <div className="flex flex-col items-center flex-1">
            <img src={prediction.awayLogo} alt={prediction.awayTeam} className="w-12 h-12 object-contain mb-2" onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/48?text=' + prediction.awayTeam[0]; }} />
            <span className="text-sm font-semibold text-center leading-tight text-white">{prediction.awayTeam}</span>
          </div>
        </div>

        {/* Prediction Data */}
        <div className="mt-auto pt-4 border-t border-white/5">
          {isLocked ? (
            <div className="bg-white/5 rounded-lg p-4 text-center border border-dashed border-white/10">
              <Lock className="w-6 h-6 mx-auto text-amber-500 mb-2" />
              <p className="text-sm text-gray-400 mb-3">
                {forceLocked ? 'Upcoming picks are available to Premium members' : 'Unlock this high-confidence prediction'}
              </p>
              <button onClick={onUpgrade} className="w-full px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors">
                Upgrade to Premium
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-[#00d4ff]/10 px-3 py-2 rounded-md border border-[#00d4ff]/20">
                <span className="text-sm font-medium text-gray-400">Pick:</span>
                <span className="text-sm font-bold text-[#00d4ff]">{prediction.prediction}</span>
              </div>
              <div className="flex justify-between items-center px-1">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Odds</span>
                  <span className="text-sm font-semibold text-white">{prediction.odds}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500">Confidence</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-emerald-400">{prediction.confidence}%</span>
                  </div>
                </div>
              </div>
              {prediction.rationale && (
                <div className="text-xs text-gray-400 bg-white/5 border border-white/5 p-2 rounded flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#00d4ff]" />
                  <p>{prediction.rationale}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
