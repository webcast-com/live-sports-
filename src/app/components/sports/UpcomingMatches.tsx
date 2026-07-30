import { CheckCircle2, Clock3, Loader2, Radio, TrendingUp, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getBetigoloHistory, normalizeBetigoloResult } from '@/app/services/betigoloApi';

type HistoryPrediction = ReturnType<typeof normalizeBetigoloResult>;

const getTeamCode = (team: string) => team
  .split(' ')
  .map((word) => word[0])
  .join('')
  .slice(0, 3)
  .toUpperCase();

const formatMatchDate = (date: string) => {
  const matchDate = new Date(date);
  return Number.isNaN(matchDate.getTime())
    ? 'Recently completed'
    : matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const HistoryPredictions: React.FC = () => {
  const [predictions, setPredictions] = useState<HistoryPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    const loadHistory = async () => {
      const response = await getBetigoloHistory();

      if (response.data?.length) {
        setPredictions(response.data.map(normalizeBetigoloResult));
      } else {
        setError(response.error || 'No prediction history is available yet.');
      }

      setLoading(false);
    };

    loadHistory();
  }, []);

  const countries = Array.from(new Set(predictions.map((prediction) => prediction.country))).sort();
  const leagues = Array.from(new Set(predictions.map((prediction) => prediction.league))).sort();
  const filteredPredictions = predictions.filter((prediction) =>
    (selectedCountry === 'all' || prediction.country === selectedCountry) &&
    (selectedLeague === 'all' || prediction.league === selectedLeague)
  );
  const visiblePredictions = filteredPredictions.slice(0, visibleCount);
  const wins = filteredPredictions.filter((prediction) => prediction.outcome === 'win').length;
  const losses = filteredPredictions.filter((prediction) => prediction.outcome === 'loss').length;
  const totalReturn = filteredPredictions.reduce((total, prediction) => total + prediction.profitNum, 0);
  const averageOdds = filteredPredictions.length
    ? filteredPredictions.reduce((total, prediction) => total + (parseFloat(prediction.odds) || 0), 0) / filteredPredictions.length
    : 0;
  const firstLoss = filteredPredictions.findIndex((prediction) => prediction.outcome !== 'win');
  const profitStreak = firstLoss === -1 ? filteredPredictions.length : firstLoss;

  return (
    <section id="history-predictions" className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 font-[Times_New_Roman,serif] [text-shadow:1px_1px_3px_rgba(0,0,0,1)]">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Clock3 className="w-6 h-6 text-[#00d4ff]" />
              History Predictions
            </h2>
            <div className="flex items-center gap-2 text-xs">
              {loading ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading...
                </span>
              ) : error ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400">
                  <Radio className="w-3 h-3" />
                  History Unavailable
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-full text-[#00d4ff]">
                  <Radio className="w-3 h-3" />
                  History Data
                </span>
              )}
            </div>
          </div>
          <p className="text-[rgba(245,166,35,1)] text-sm">
            {loading ? 'Loading completed predictions' : `${filteredPredictions.length} of ${predictions.length} completed predictions`}
          </p>
          {!loading && predictions.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <select
                value={selectedCountry}
                onChange={(event) => {
                  setSelectedCountry(event.target.value);
                  setVisibleCount(20);
                }}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-[#00d4ff]/50 focus:outline-none"
                aria-label="Filter by country"
              >
                <option value="all">All countries</option>
                {countries.map((country) => <option key={country} value={country}>{country}</option>)}
              </select>
              <select
                value={selectedLeague}
                onChange={(event) => {
                  setSelectedLeague(event.target.value);
                  setVisibleCount(20);
                }}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-[#00d4ff]/50 focus:outline-none"
                aria-label="Filter by league"
              >
                <option value="all">All leagues</option>
                {leagues.map((league) => <option key={league} value={league}>{league}</option>)}
              </select>
            </div>
          )}
          {!loading && filteredPredictions.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                <p className="text-xs text-white uppercase tracking-wider">Wins</p>
                <p className="mt-1 text-lg font-bold text-emerald-400">{wins}</p>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                <p className="text-xs text-white uppercase tracking-wider">Losses</p>
                <p className="mt-1 text-lg font-bold text-red-400">{losses}</p>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                <p className="text-xs text-white uppercase tracking-wider">Profit streak</p>
                <p className="mt-1 text-lg font-bold text-[#00d4ff]">{profitStreak}</p>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                <p className="text-xs text-white uppercase tracking-wider">Average odds</p>
                <p className="mt-1 text-lg font-bold text-white">{averageOdds.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg">
                <p className="text-xs text-white uppercase tracking-wider">Total return</p>
                <p className={`mt-1 text-lg font-bold flex items-center gap-1 ${totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  <TrendingUp className="w-4 h-4" />
                  {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>

        {filteredPredictions.length > 0 ? (
          <div className="space-y-3">
            {visiblePredictions.map((prediction) => {
              const isWin = prediction.outcome === 'win';

              return (
                <div
                  key={prediction.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#161b22] border border-white/5 rounded-xl hover:border-white/20 hover:bg-[#1c2333] transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs text-[#50e3c2] uppercase tracking-wider">{prediction.country} • {prediction.league} • {formatMatchDate(prediction.date)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-white text-[10px] font-black flex-shrink-0">
                          {getTeamCode(prediction.homeTeam)}
                        </div>
                        <p className="text-white font-semibold text-sm">{prediction.homeTeam}</p>
                      </div>

                      <span className={`text-xs font-semibold ${prediction.homeScore > prediction.awayScore ? 'text-[#85f509]' : prediction.homeScore < prediction.awayScore ? 'text-[rgba(238,9,18,0.96)]' : 'text-gray-600'}`}>
                        {prediction.homeScore} - {prediction.awayScore}
                      </span>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-white text-[10px] font-black flex-shrink-0">
                          {getTeamCode(prediction.awayTeam)}
                        </div>
                        <p className="text-white font-semibold text-sm">{prediction.awayTeam}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right sm:text-right">
                    <p className="text-[#00d4ff] font-mono font-semibold text-sm">{prediction.prediction}</p>
                    <span className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg ${isWin ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {isWin ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {isWin ? `Won ${prediction.profit}` : 'Lost -1.00'}
                    </span>
                  </div>
                </div>
              );
            })}
            {visiblePredictions.length < filteredPredictions.length && (
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + 20)}
                className="w-full mt-5 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-[#50e3c2] hover:bg-white/10 transition-all"
              >
                Load more history
              </button>
            )}
          </div>
        ) : !loading ? (
          <div className="text-center py-12">
            <Clock3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">{error || (predictions.length > 0 ? 'No predictions match the selected filters' : 'No prediction history available')}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default HistoryPredictions;
