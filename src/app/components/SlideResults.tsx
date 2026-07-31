import { useState, useEffect, useCallback } from 'react';
import { getPreviousResults, normalizeBetigoloResult, type BetigoloResult } from '../services/betigoloApi';
import { useAuth } from '../context/AuthContext';
import { Button, Card, CardContent, Badge } from './ui';
import {
  TrendingUp, CheckCircle2, XCircle, BarChart3, Filter,
  ChevronLeft, ChevronRight, RefreshCw, Wifi, WifiOff,
  Copy, Check, Server, Globe, Database, FileJson, AlertTriangle,
  ShieldCheck, Target, Clock
} from 'lucide-react';

interface ResultDisplay {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  date: string;
  homeScore: number;
  awayScore: number;
  prediction: string;
  odds: string;
  outcome: 'win' | 'loss' | 'push';
  profit: string;
  profitNum: number;
  goalDiff: number;
  goalDiffStr: string;
  resultType: 'H' | 'D' | 'A';
  confidence: number;
  isPremium: boolean;
  source: 'mock' | 'betigolo-api';
}

const EMPTY: ResultDisplay[] = [];

export function SlideResults({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { user } = useAuth();
  const [slide, setSlide] = useState(0);
  const [filter, setFilter] = useState<'all' | 'win' | 'loss'>('all');
  const [activeSection, setActiveSection] = useState<'slideshow' | 'table' | 'raw_api'>('slideshow');

  const [results, setResults] = useState<ResultDisplay[]>(EMPTY);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [debug, setDebug] = useState<any>(null);

  const doFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPreviousResults();
      setRawResponse(res.rawResponse);
      setDebug(res.debug);

      if (res.data && res.data.length > 0) {
          const normalized = res.data.map((r: BetigoloResult, i: number) => {
            const n = normalizeBetigoloResult(r, i);
            return {
              id: n.id,
              homeTeam: n.homeTeam,
              awayTeam: n.awayTeam,
              league: n.league,
              date: n.date,
              homeScore: n.homeScore,
              awayScore: n.awayScore,
              prediction: n.prediction,
              odds: n.odds,
              outcome: n.outcome,
              profit: n.profit,
              profitNum: (n as any).profitNum ?? (n.outcome === 'win' ? parseFloat((parseFloat(n.odds) - 1).toFixed(2)) : -1),
              goalDiff: (n as any).goalDiff ?? n.homeScore - n.awayScore,
              goalDiffStr: (n as any).goalDiffStr ?? String(n.homeScore - n.awayScore),
              resultType: (n as any).resultType ?? (n.homeScore > n.awayScore ? 'H' : n.awayScore > n.homeScore ? 'A' : 'D'),
              confidence: n.confidence,
              isPremium: n.isPremium,
              source: 'betigolo-api' as const,
            };
          });
        setResults(normalized);
      } else {
        setError(res.error || 'No data returned from API');
      }
      setFetched(true);
    } catch (e: any) {
      setError(e?.message || 'Unknown error');
      setFetched(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!fetched) doFetch();
  }, [doFetch]);

  const filteredResults = results.filter(r => {
    if (filter === 'win') return r.outcome === 'win';
    if (filter === 'loss') return r.outcome === 'loss';
    return true;
  });

  const totalWins = results.filter(r => r.outcome === 'win').length;
  const totalLosses = results.filter(r => r.outcome === 'loss').length;
  const winRate = results.length > 0 ? Math.round((totalWins / results.length) * 100) : 0;
  const totalProfit = results.reduce((s, r) => {
    const val = parseFloat(r.profit);
    return s + (isNaN(val) ? 0 : val);
  }, 0);

  const current = filteredResults[slide] || filteredResults[0];

  const prev = () => setSlide(s => (s - 1 + filteredResults.length) % filteredResults.length);
  const next = () => setSlide(s => (s + 1) % filteredResults.length);

  useEffect(() => {
    if (activeSection !== 'slideshow') return;
    const timer = setInterval(() => {
      setSlide(s => (s + 1) % Math.max(filteredResults.length, 1));
    }, 3800);
    return () => clearInterval(timer);
  }, [filteredResults.length, activeSection]);

  const copyJson = () => {
    if (!rawResponse) return;
    navigator.clipboard.writeText(JSON.stringify(rawResponse, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const jsonSize = rawResponse ? new Blob([JSON.stringify(rawResponse)]).size : 0;
  const jsonSizeKb = jsonSize ? (jsonSize / 1024).toFixed(1) : '0';
  const isConnected = fetched && !error && results.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'rgba(7, 238, 107, 1)' }}>Results & Performance</h1>
          <p className="mt-1" style={{ color: 'rgba(255, 255, 255, 1)' }}>
            {isConnected
              ? `Showing ${results.length} ${results.length === 1 ? 'result' : 'results'} from ${results[0]?.source === 'betigolo-api' ? 'BetiGolo API' : 'prediction data'}`
              : 'Match results from prediction data'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(() => {
            const tabs: Array<{ id: 'slideshow' | 'table' | 'raw_api'; label: string; icon?: any }> = [
              { id: 'slideshow', label: 'Slideshow' },
              { id: 'table', label: 'Full Table' },
              { id: 'raw_api', label: 'API Response', icon: FileJson },
            ];
            return tabs.map(tab => (
              <Button
                key={tab.id}
                variant={activeSection === tab.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveSection(tab.id)}
                className="flex items-center gap-1.5"
              >
                {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                {tab.label}
              </Button>
            ));
          })()}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <Button
          variant="premium"
          size="sm"
          onClick={doFetch}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? `Fetching ${results[0]?.source === 'betigolo-api' ? 'BetiGolo' : 'API'}...` : `Fetch from ${results[0]?.source === 'betigolo-api' ? 'BetiGolo API' : 'API'}`}
        </Button>

        {isConnected && (
          <div className="flex items-center gap-2 text-sm bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <Wifi className="w-4 h-4" />
            {`Connected — ${results.length} ${results.length === 1 ? 'result' : 'results'} · ${winRate}% win rate`}
          </div>
        )}

        {fetched && !isConnected && !loading && (
          <div className="flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">
            <WifiOff className="w-4 h-4" />
            {error || 'No results found'}
          </div>
        )}
      </div>

      {/* Stats Row */}
      {activeSection !== 'raw_api' && results.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(() => {
            const stats = [
              { label: 'Win Rate', value: `${winRate}%`, icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Total Wins', value: String(totalWins), icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'Total Losses', value: String(totalLosses), icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
              { label: 'Total P/L', value: `${totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}u`, icon: TrendingUp, color: totalProfit >= 0 ? 'text-emerald-500' : 'text-red-500', bg: totalProfit >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20' },
            ];
            return stats.map(stat => (
              <Card key={stat.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ));
          })()}
        </div>
      )}

      {fetched && !loading && results.length === 0 && (
        <Card className="border-dashed border-slate-300 dark:border-slate-700">
          <CardContent className="p-10 text-center space-y-3">
            <Server className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="font-semibold text-slate-600 dark:text-slate-400">
              {error || 'No results loaded from API'}
            </p>
            <Button variant="premium" size="sm" onClick={doFetch}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Fetch
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ─── SLIDESHOW ─── */}
      {activeSection === 'slideshow' && results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            {(() => {
              const filterOptions: Array<{ id: 'all' | 'win' | 'loss'; label: string }> = [
                { id: 'all', label: 'All Results' },
                { id: 'win', label: '✅ Wins' },
                { id: 'loss', label: '❌ Losses' },
              ];
              return filterOptions.map(f => (
                <button
                  key={f.id}
                  onClick={() => { setFilter(f.id); setSlide(0); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                    filter === f.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ));
            })()}
          </div>

          {current && (
            <div className="relative">
              <Card className={`overflow-hidden border-2 transition-all duration-300 ${
                current.outcome === 'win'
                  ? 'border-green-300 dark:border-green-700'
                  : 'border-red-300 dark:border-red-700'
              }`} style={{ backgroundColor: 'rgba(139, 87, 42, 1)', color: 'rgba(248, 231, 28, 1)', boxShadow: '1px 1px 3px 0 rgba(126, 211, 33, 1)', textShadow: '1px 1px 3px rgba(0, 0, 0, 1)' }}>
                <div className="px-6 py-3 text-sm font-semibold flex items-center gap-2" style={{ backgroundColor: 'rgba(170, 84, 26, 1)', color: 'rgba(255, 255, 255, 1)' }}>
                  {current.outcome === 'win' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {`${current.outcome.toUpperCase()} — ${current.league}`}
                  <Badge variant="premium" className="ml-2">{current.source.toUpperCase()}</Badge>
                  <span className="ml-auto font-normal text-xs" style={{ color: 'rgba(255, 255, 255, 1)' }}>
                    {current.date}
                  </span>
                </div>

                <CardContent className="p-6">
                  {/* Teams & Score */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-2xl font-black text-slate-600 dark:text-slate-300">
                        {current.homeTeam.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-center text-sm">{current.homeTeam}</span>
                    </div>

                    <div className="px-6 text-center">
                      <div className="text-4xl font-black text-slate-900 dark:text-white">
                        <span className={current.outcome === 'win' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {current.homeScore}
                        </span>
                        <span className="text-slate-400 mx-2">—</span>
                        <span>{current.awayScore}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 1)', textShadow: '1px 1px 3px rgba(0, 0, 0, 1)' }}>{`${current.homeTeam} vs ${current.awayTeam}`}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-2xl font-black text-slate-600 dark:text-slate-300">
                        {current.awayTeam.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-center text-sm">{current.awayTeam}</span>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <div className="text-center">
                      <p className="text-xs mb-1" style={{ color: 'rgba(192, 243, 23, 1)', textShadow: '1px 1px 3px rgba(101, 96, 3, 1)' }}>{`${current.source === 'betigolo-api' ? 'BetiGolo' : 'AI'} Pick`}</p>
                      <p className="font-semibold text-sm" style={{ borderWidth: '1px', borderColor: 'rgba(139, 87, 42, 1)', color: 'rgba(255, 255, 255, 1)' }}>{current.prediction}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs mb-1" style={{ color: 'rgba(8, 255, 156, 1)', textShadow: '1px 1px 3px rgba(0, 0, 0, 1)', borderWidth: '1px', borderColor: 'rgba(139, 87, 42, 1)' }}>Odds</p>
                      <p className="font-semibold text-sm">{current.odds}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1">P/L</p>
                      <p className={`font-bold text-sm ${current.outcome === 'win' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {`${current.profit} U`}
                      </p>
                    </div>
                  </div>

                  {/* Navigation dots */}
                  <div className="flex items-center justify-center mt-4 gap-2">
                    {filteredResults.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSlide(i)}
                        className={`rounded-full transition-all ${i === slide ? 'w-6 h-2 bg-blue-600' : 'w-2 h-2 bg-slate-300 dark:bg-slate-600'}`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── TABLE VIEW ─── */}
      {activeSection === 'table' && (
        <>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            {(() => {
              const tableFilterOptions: Array<{ id: 'all' | 'win' | 'loss'; label: string }> = [
                { id: 'all', label: 'All Results' },
                { id: 'win', label: '✅ Wins Only' },
                { id: 'loss', label: '❌ Losses Only' },
              ];
              return tableFilterOptions.map(f => (
                <button
                  key={f.id}
                  onClick={() => { setFilter(f.id); setSlide(0); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                    filter === f.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ));
            })()}
            {filter !== 'all' && (
              <span className="text-xs text-slate-400 ml-2">
                {`${filteredResults.length} match${filteredResults.length !== 1 ? 'es' : ''} found`}
              </span>
            )}
          </div>
        <Card style={{ backgroundColor: 'rgba(245, 166, 35, 1)', color: 'rgba(0, 0, 0, 1)', borderColor: 'rgba(0, 0, 0, 1)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Match</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">League</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Pick</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Score</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">GD</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">H/A</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Odds</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">P/L</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                      {loading ? 'Loading...' : results.length === 0 ? 'No results loaded. Click "Fetch from API".' : 'No matches match the current filter.'}
                    </td>
                  </tr>
                ) : (
                  filteredResults.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${r.outcome === 'win' ? 'text-slate-800 dark:text-slate-200' : 'text-red-600 dark:text-red-400'}`}>{r.homeTeam}</span>
                          <span className="text-slate-400">vs</span>
                          <span className={`font-semibold ${r.outcome === 'win' ? 'text-slate-800 dark:text-slate-200' : 'text-slate-800 dark:text-slate-200'}`}>{r.awayTeam}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{r.date}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.league}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{r.prediction}</span>
                        <Badge variant="premium" className="ml-2 text-[10px]">{r.source.toUpperCase()}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-900 dark:text-white">
                        {r.homeScore} — {r.awayScore}
                      </td>
                      <td className={`px-4 py-3 text-center font-bold text-sm ${
                        r.goalDiff > 0 ? 'text-green-600 dark:text-green-400' :
                        r.goalDiff < 0 ? 'text-red-600 dark:text-red-400' :
                        'text-slate-500 dark:text-slate-400'
                      }`}>
                        {r.goalDiffStr}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-6 rounded-md text-xs font-black ${
                          r.resultType === 'H'
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                            : r.resultType === 'A'
                            ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          {r.resultType === 'H' ? 'H' : r.resultType === 'A' ? 'A' : 'D'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300">{r.odds}</td>
                      <td className={`px-4 py-3 text-center font-semibold ${r.outcome === 'win' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        <span className="font-bold">{`${r.profit} U`}</span>
                        <div className="text-[10px] opacity-60">
                          {r.outcome === 'win'
                            ? `+${((parseFloat(r.odds) - 1) * 1).toFixed(2)}u`
                            : `-${r.profitNum >= 0 ? r.profitNum.toFixed(2) : '1.00'}u staked`}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.outcome === 'win'
                          ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-300 dark:border-green-700"><CheckCircle2 className="w-3 h-3" /> {r.outcome.charAt(0).toUpperCase()}</span>
                          : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-300 dark:border-red-700"><XCircle className="w-3 h-3" /> {r.outcome.charAt(0).toUpperCase()}</span>
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {results.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
              <span>
                {`${filteredResults.length} of ${results.length} shown · ${totalWins}W / ${totalLosses}L · ${winRate}% win rate`}
                {filter !== 'all' && (
                  <span className="ml-2 text-blue-500">
                    {`(filtered: ${filter === 'win' ? 'wins only' : 'losses only'})`}
                  </span>
                )}
              </span>
              <span>
                {`Avg profit per match: `}
                <span className={`font-bold ${totalProfit / results.length >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {`${totalProfit / results.length >= 0 ? '+' : ''}${(totalProfit / results.length).toFixed(2)}u`}
                </span>
                {' · '}Net P/L:{' '}
                <span className={`font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {`${totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}u`}
                </span>
              </span>
            </div>
          )}
        </Card>
        </>
      )}

      {/* ─── RAW API RESPONSE ─── */}
      {activeSection === 'raw_api' && (
        <Card className="border-2 border-blue-200 dark:border-blue-900 bg-gradient-to-br from-slate-50 to-blue-50/50 dark:from-slate-900 dark:to-blue-950/30">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow">
                  <FileJson className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">BetiGolo API – Response Inspector</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    GET https://betigolo-predictions.p.rapidapi.com/sample
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {rawResponse && (
                  <Button size="sm" variant="outline" onClick={copyJson} className="h-8 text-xs">
                    {copied ? <><Check className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />Copied</> : <><Copy className="w-3.5 h-3.5 mr-1.5" />Copy JSON</>}
                  </Button>
                )}
                <Button size="sm" onClick={doFetch} disabled={loading}>
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Fetching…' : 'Re-fetch'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-[11px]">
              {(() => {
                const metadata = [
                  { label: 'Host', icon: Globe, value: 'betigolo-predictions.p.rapidapi.com' },
                  { label: 'Endpoint', icon: Server, value: '/sample' },
                  { label: 'Method', icon: Database, value: 'GET' },
                  { label: 'Auth', icon: ShieldCheck, value: 'x-rapidapi-key' },
                ];
                return metadata.map(m => (
                  <div key={m.label} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
                    <div className="text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1">{<m.icon className="w-3 h-3" />}{m.label}</div>
                    <div className="text-slate-700 dark:text-slate-300 font-mono mt-0.5 truncate">{m.value}</div>
                  </div>
                ));
              })()}
            </div>

            {loading && (
              <div className="text-center py-14 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Fetching from BetiGolo API…</p>
              </div>
            )}

            {!loading && rawResponse && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold ${
                    results.length > 0
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  }`}>
                    {results.length > 0 ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {results.length > 0 ? 'OK' : 'Partial'}
                  </span>
                  <span className="text-slate-500">Size: {jsonSizeKb} KB</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-500">
                    {Array.isArray(rawResponse)
                      ? `${rawResponse.length} items`
                      : typeof rawResponse === 'object'
                      ? 'Object'
                      : 'response'
                    }
                  </span>
                  {debug?.proxy && (
                    <><span className="text-slate-500">·</span><span className="text-slate-500">via {debug.proxy}</span></>
                  )}
                </div>

                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0b1220] shadow-2xl">
                  <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-blue-400" />
                      response.json
                    </span>
                    <span className="text-slate-500">UTF-8</span>
                  </div>
                  <div className="max-h-[560px] overflow-auto p-4 text-[11.5px] leading-relaxed">
                    <pre className="text-emerald-300 font-mono whitespace-pre-wrap break-words">
                      {JSON.stringify(rawResponse, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {!loading && !rawResponse && !fetched && (
              <div className="bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-10 text-center space-y-3">
                <Server className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">Click "Fetch from BetiGolo API"</p>
              </div>
            )}

            {!loading && !rawResponse && fetched && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-5 text-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-amber-900 dark:text-amber-300">Could not reach BetiGolo API</p>
                    <p className="text-amber-800 dark:text-amber-400 text-xs mt-1">
                      RapidAPI blocks CORS requests from browsers. Try using the terminal cURL command instead:
                    </p>
                    <pre className="bg-slate-900 text-emerald-300 rounded-md p-3 mt-2 overflow-x-auto text-[11px]">{`curl --request GET \\
  --url https://betigolo-predictions.p.rapidapi.com/sample \\
  --header 'x-rapidapi-host: betigolo-predictions.p.rapidapi.com' \\
  --header 'x-rapidapi-key: b9c6883414msh11dde2eba098703p1a13fdjsne11249e78db1'`}</pre>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          {/* Normalized results preview */}
          {results.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-700 p-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                Parsed Results ({results.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {results.slice(0, 12).map(r => (
                  <div key={r.id} className={`text-[11px] p-2.5 rounded-lg border ${
                    r.outcome === 'win'
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                  }`}>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{`${r.homeTeam} vs ${r.awayTeam}`}</div>
                    <div className="text-slate-500 mt-0.5">{`${r.homeScore}—${r.awayScore} · ${r.prediction}`}</div>
                    <div className={`text-xs font-bold mt-0.5 ${r.outcome === 'win' ? 'text-green-600' : 'text-red-600'}`}>
                      {`${r.outcome === 'win' ? '✓ WIN' : '✕ LOSS'} ${r.profit}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {user?.plan !== 'premium' && activeSection !== 'raw_api' && (
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 border-none text-white" style={{ boxShadow: '1px 1px 3px 0px rgba(0, 0, 0, 1)', textShadow: '1px 1px 3px rgba(0, 0, 0, 1)' }}>
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg mb-1">Unlock Premium Features</h3>
              <p className="text-blue-100 text-sm">{`Get full access to ${results[0]?.source === 'betigolo-api' ? 'BetiGolo API' : 'prediction'} data, live predictions, and advanced analytics.`}</p>
            </div>
            <Button variant="default" onClick={() => setActiveTab('premium')} className="shrink-0">
              {`Upgrade for KSh ${100}`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
