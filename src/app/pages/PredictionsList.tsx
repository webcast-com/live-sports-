import { useEffect, useMemo, useState } from 'react';
import { MOCK_PREDICTIONS } from '../data/mockData';
import { PredictionCard } from '../components/predictions/PredictionCard';
import { PredictionFilters, PredictionFilterOptions } from '../components/PredictionFilters';
import { Button, Card, CardContent, Badge } from '../components/ui';
import { getPredictions, getFederations, getMarkets, normalizeApiPrediction } from '../services/footballApi';
import { RefreshCw, WifiOff, Wifi, Calendar, Globe2, Filter, Target, Code, Copy, Check, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSavedPredictions } from '../hooks/useSavedPredictions';

type PredictionT = typeof MOCK_PREDICTIONS[number] & { source?: 'mock' | 'live-api'; federation?: string; market?: string; status?: string };

export function PredictionsList({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { user } = useAuth();
  const { savedPredictions } = useSavedPredictions();
  const [filter, setFilter] = useState<'all' | 'free' | 'premium' | 'live'>('all');
  const [selectedFederation, setSelectedFederation] = useState<string>('');
  const [selectedMarket, setSelectedMarket] = useState<string>('classic');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterOptions, setFilterOptions] = useState<PredictionFilterOptions>({
    sport: 'all',
    confidence: 'all',
    timeRange: undefined,
    sortBy: 'confidence',
    savedOnly: false,
  });

  const [livePredictions, setLivePredictions] = useState<PredictionT[]>([]);
  const [federations, setFederations] = useState<{ key: string; name: string }[]>([]);
  const [markets, setMarkets] = useState<{ key: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiFailed, setApiFailed] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [liveCount, setLiveCount] = useState(0);

  const [showApiResponse, setShowApiResponse] = useState(false);
  const [lastRawResponse, setLastRawResponse] = useState<any>(null);
  const [lastApiMeta, setLastApiMeta] = useState<{endpoint: string, status?: number, proxy?: string} | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchLive = async () => {
    if (user?.plan !== 'premium') return;
    setLoading(true);
    setApiFailed(false);
    setApiError(null);
    try {
      const [predsRes, fedsRes, mrktsRes] = await Promise.all([
        getPredictions({ market: selectedMarket, iso_date: selectedDate, federation: selectedFederation || undefined }),
        getFederations(),
        getMarkets(),
      ]);

      if (predsRes.data && predsRes.data.length > 0) {
        const normalized = predsRes.data.map((p: any, i: number) => normalizeApiPrediction(p, i));
        setLivePredictions(normalized);
        setLiveCount(normalized.length);
      } else {
        setApiFailed(true);
        if (predsRes.error) setApiError(predsRes.error);
        setLivePredictions([]);
        setLiveCount(0);
      }

      if ((predsRes as any).rawResponse) {
        setLastRawResponse((predsRes as any).rawResponse);
        setLastApiMeta({
          endpoint: `predictions?market=${selectedMarket}&iso_date=${selectedDate}${selectedFederation ? `&federation=${selectedFederation}` : ''}`,
          proxy: 'cors-proxy'
        });
      }

      if (fedsRes.data) {
        setFederations(
          fedsRes.data
            .map((f: any) => ({
              key: f.federation || f.key || f.name || '',
              name: f.name || f.federation || f.key || '',
            }))
            .filter((f: any) => f.key)
        );
      }
      if (mrktsRes.data) {
        setMarkets(
          mrktsRes.data
            .map((m: any) => ({
              key: m.market || m.key || m.name || '',
              name: m.name || m.market || m.key || '',
            }))
            .filter((m: any) => m.key)
        );
      }
    } catch (e: any) {
      setApiFailed(true);
      setApiError(e?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.plan]);

  const mockPredictions: PredictionT[] = useMemo(
    () => MOCK_PREDICTIONS.map(p => ({ ...p, source: 'mock' as const })),
    []
  );

  const allPredictions = useMemo<PredictionT[]>(() => {
    let combined: PredictionT[] = [];

    if (filter === 'live') {
      combined = livePredictions;
    } else if (filter === 'premium') {
      combined = [
        ...livePredictions,
        ...mockPredictions.filter(p => p.isPremium),
      ];
    } else if (filter === 'free') {
      combined = mockPredictions.filter(p => !p.isPremium);
    } else {
      combined = [
        ...livePredictions,
        ...mockPredictions,
      ];
    }

    // Apply additional filters
    combined = combined.filter(pred => {
      // Sport filter
      if (filterOptions.sport && filterOptions.sport !== 'all') {
        const predSport = (pred as any).sport || 'football';
        if (predSport !== filterOptions.sport) return false;
      }

      // Confidence filter
      if (filterOptions.confidence && filterOptions.confidence !== 'all') {
        const confidence = pred.confidence || 0;
        if (filterOptions.confidence === 'high' && confidence < 70) return false;
        if (filterOptions.confidence === 'medium' && (confidence < 50 || confidence >= 70)) return false;
        if (filterOptions.confidence === 'low' && confidence >= 50) return false;
      }

      // Saved only filter
      if (filterOptions.savedOnly && !savedPredictions.includes(pred.id)) {
        return false;
      }

      return true;
    });

    // Apply sorting
    if (filterOptions.sortBy === 'confidence') {
      combined.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    } else if (filterOptions.sortBy === 'recent') {
      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (filterOptions.sortBy === 'odds') {
      combined.sort((a, b) => {
        const oddsA = parseFloat(String(a.odds)) || 0;
        const oddsB = parseFloat(String(b.odds)) || 0;
        return oddsA - oddsB;
      });
    }

    return combined;
  }, [filter, livePredictions, mockPredictions, filterOptions, savedPredictions]);

  const canSeeLive = user?.plan === 'premium';

  const copyResponse = () => {
    if (!lastRawResponse) return;
    navigator.clipboard.writeText(JSON.stringify(lastRawResponse, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6" style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 1)' }}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4" style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 1)' }}>
        <div>
          <h1 className="text-4xl font-black text-white">All Predictions</h1>
          <p className="mt-2" style={{ color: 'rgb(255, 255, 255)' }}>
            {canSeeLive
              ? `Browse our latest picks. ${liveCount} live API predictions loaded.`
              : 'Review completed results for free. Upgrade to Premium to reveal upcoming picks and live API predictions.'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchLive}
            disabled={loading || !canSeeLive}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'rgb(8, 46, 29)', borderColor: 'rgb(83, 230, 18)', color: 'rgb(83, 230, 18)', border: '1px solid' }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          {lastRawResponse && canSeeLive && (
            <button
              onClick={() => setShowApiResponse(s => !s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${showApiResponse ? 'bg-[#00d4ff] text-[#0d1117]' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400'}`}
            >
              <Code className="w-4 h-4" />
              {showApiResponse ? 'Hide JSON' : 'Show API JSON'}
            </button>
          )}
        </div>
      </div>

      {showApiResponse && lastRawResponse && (
        <div className="border border-[#00d4ff]/20 bg-[#161b22] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <Code className="w-4 h-4 text-[#00d4ff]" />
                Live Raw JSON – football-prediction-api.p.rapidapi.com
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-mono">
                GET /api/v2/predictions?market={selectedMarket}&iso_date={selectedDate}
                {selectedFederation && `&federation=${selectedFederation}`}
              </p>
              <div className="flex gap-2 mt-1.5">
                <span className="text-[11px] bg-[#00d4ff]/20 text-[#00d4ff] px-2 py-1 rounded">Live API</span>
                <span className="text-[11px] text-gray-500">{lastApiMeta?.proxy || 'cors-proxy'}</span>
              </div>
            </div>
            <button onClick={copyResponse} className="h-8 text-xs px-3 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 transition-all">
              {copied ? <><Check className="w-3.5 h-3.5 mr-1 text-emerald-500 inline" /> Copied</> : <><Copy className="w-3.5 h-3.5 mr-1 inline" /> Copy JSON</>}
            </button>
          </div>
          <div className="bg-slate-950 rounded-lg p-4 max-h-[420px] overflow-auto font-mono text-[11px] leading-relaxed text-emerald-400 shadow-inner">
            <pre className="whitespace-pre-wrap break-all">{JSON.stringify(lastRawResponse, null, 2)}</pre>
          </div>
          <p className="text-[11px] text-gray-500">
            Full unparsed RapidAPI response • {Array.isArray(lastRawResponse) ? lastRawResponse.length : Array.isArray(lastRawResponse?.data) ? lastRawResponse.data.length : 'object'} records
          </p>
        </div>
      )}

      {/* Advanced Filters */}
      <PredictionFilters
        options={filterOptions}
        onChange={setFilterOptions}
        showAdvanced={true}
      />

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="w-4 h-4 text-gray-500" />
        {[
          { id: 'all', label: 'All Picks', count: allPredictions.length },
          { id: 'free', label: 'Free', count: mockPredictions.filter(p => !p.isPremium).length },
          { id: 'premium', label: 'Premium', count: mockPredictions.filter(p => p.isPremium).length + liveCount },
          { id: 'live', label: 'Live API', count: liveCount, premiumOnly: true },
        ].map(f => {
          const isLocked = (f as any).premiumOnly && !canSeeLive;
          return (
            <button
              key={f.id}
              onClick={() => !isLocked && setFilter(f.id as any)}
              disabled={isLocked}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors inline-flex items-center gap-1.5 ${
                filter === f.id
                  ? 'bg-[#00d4ff] text-[#0d1117] shadow-lg shadow-[#00d4ff]/20'
                  : isLocked
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:text-gray-300'
              }`}
              style={!isLocked && filter !== f.id ? { color: 'rgb(74, 74, 74)', backgroundColor: 'rgba(74, 74, 74, 0.17)', textShadow: '1px 1px 3px rgba(0, 0, 0, 1)' } : { textShadow: '1px 1px 3px rgba(0, 0, 0, 1)' }}
            >
              {f.label}
              {!isLocked && <span className={filter === f.id ? 'text-[#0d1117]/80' : ''}>({f.count})</span>}
              {isLocked && <span className="ml-1 text-amber-500">🔒</span>}
            </button>
          );
        })}
      </div>

      {/* Advanced filters for live */}
      {(filter === 'live' || filter === 'all' || filter === 'premium') && canSeeLive && (
        <div className="border border-white/10 bg-white/5 rounded-2xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                <Calendar className="w-3.5 h-3.5" /> Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-[#00d4ff]/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                <Globe2 className="w-3.5 h-3.5" /> Federation
              </label>
              <select
                value={selectedFederation}
                onChange={(e) => setSelectedFederation(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-[#00d4ff]/50 focus:outline-none"
              >
                <option value="">All Federations</option>
                {federations.map(f => (
                  <option key={f.key} value={f.key}>{f.name || f.key}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                <Target className="w-3.5 h-3.5" /> Market
              </label>
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-[#00d4ff]/50 focus:outline-none"
              >
                {markets.length > 0 ? (
                  markets.map(m => (
                    <option key={m.key} value={m.key}>{m.name || m.key}</option>
                  ))
                ) : (
                  <>
                    <option value="classic">Classic</option>
                    <option value="over_25">Over 2.5 Goals</option>
                    <option value="over_35">Over 3.5 Goals</option>
                    <option value="btts">BTTS</option>
                    <option value="home_win">Home Win</option>
                    <option value="away_win">Away Win</option>
                  </>
                )}
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button onClick={fetchLive} disabled={loading} className="px-4 py-2 rounded-lg bg-[#00d4ff] text-[#0d1117] text-sm font-semibold hover:bg-[#00d4ff]/90 transition-all disabled:opacity-50">
              {loading ? 'Loading...' : 'Apply Filters'}
            </button>
          </div>
        </div>
      )}

      {/* API status banner */}
      {canSeeLive && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${apiFailed ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
          {apiFailed
            ? <><WifiOff className="w-4 h-4 shrink-0" /> Could not reach live API{apiError ? `: ${apiError}` : ''}. Showing cached/mock premium predictions below.</>
            : <><Wifi className="w-4 h-4 shrink-0" /> Connected to Football Prediction API · {liveCount} live predictions loaded for {selectedDate}.</>
          }
        </div>
      )}

      {/* Live locked banner for free users */}
      {!canSeeLive && filter === 'all' && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white shrink-0">
              <Wifi className="w-5 h-5" />
            </div>
            <div style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 1)' }}>
              <p className="font-semibold text-amber-200" style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 1)' }}>Live API Predictions Locked</p>
              <p className="text-sm text-amber-400" style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 1)' }}>Upgrade to Premium to unlock real-time predictions from our RapidAPI feed, plus federation and market filters.</p>
            </div>
          </div>
          <button onClick={() => setActiveTab('premium')} className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all whitespace-nowrap" style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 1)' }}>
            Unlock Premium
          </button>
        </div>
      )}

      {/* Predictions Grid */}
      {allPredictions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPredictions.map((pred, idx) => (
            <div key={`${pred.id}-${idx}`} className="relative">
              {pred.source === 'live-api' && (
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge variant="premium" className="shadow-lg">⚡ LIVE API</Badge>
                </div>
              )}
              <PredictionCard
                prediction={pred}
                forceLocked={!canSeeLive && new Date(pred.date).getTime() > Date.now()}
                onUpgrade={() => setActiveTab('premium')}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">No predictions found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {filter === 'live' && canSeeLive
                ? apiFailed
                  ? 'The live API is currently unreachable from this browser. Please try refreshing, or check your filters.'
                  : 'No live predictions match your selected filters. Try a different date or federation.'
                : 'Try adjusting your filters.'}
            </p>
            <Button size="sm" onClick={() => { setFilter('all'); setSelectedFederation(''); }}>Reset Filters</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
