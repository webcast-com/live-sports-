import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { getBetigoloHistory, normalizeBetigoloResult, type BetigoloResult } from '../services/betigoloApi';

interface ResultCard {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  prediction: string;
  outcome: 'win' | 'loss' | 'push';
  league: string;
}

export function RecentResultsSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [results, setResults] = useState<ResultCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await getBetigoloHistory();
        if (res.data && res.data.length > 0) {
          const normalized = res.data.map((r: BetigoloResult, i: number) => {
            const n = normalizeBetigoloResult(r, i);
            return {
              id: n.id,
              homeTeam: n.homeTeam,
              awayTeam: n.awayTeam,
              homeScore: n.homeScore,
              awayScore: n.awayScore,
              prediction: n.prediction,
              outcome: n.outcome,
              league: n.league,
            };
          });
          setResults(normalized);
        }
      } catch (e) {
        console.error('Failed to load recent results:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (trackRef.current) {
      const scrollAmount = 210 * 2;
      trackRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || results.length === 0 || !autoScroll || track.scrollWidth <= track.clientWidth) return;

    let animationFrame = 0;
    let previousTimestamp = 0;

    const animate = (timestamp: number) => {
      if (previousTimestamp === 0) previousTimestamp = timestamp;
      const elapsed = timestamp - previousTimestamp;
      previousTimestamp = timestamp;
      track.scrollLeft += elapsed * 0.03;

      if (track.scrollLeft + track.clientWidth >= track.scrollWidth) {
        track.scrollLeft = 0;
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [results.length, autoScroll]);

  const handleMouseEnter = () => setAutoScroll(false);
  const handleMouseLeave = () => setAutoScroll(true);

  if (loading || results.length === 0) {
    return null;
  }

  return (
    <div
      className="w-full py-3 px-4 overflow-hidden relative group -mt-20 pt-20 z-10"
      style={{ backgroundColor: 'rgba(74, 74, 74, 0)', borderBottomColor: 'rgba(74, 74, 74, 0)', borderBottomWidth: '1px', borderBottomStyle: 'solid', textShadow: '1px 1px 3px rgba(0, 0, 0, 1)' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header and Controls */}
      <div className="max-w-7xl mx-auto flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-white">
          Recent Results & Picks
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="p-1.5 rounded bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 text-slate-400 hover:text-white dark:hover:text-slate-200 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="p-1.5 rounded bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 text-slate-400 hover:text-white dark:hover:text-slate-200 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sliding Track */}
      <div
        ref={trackRef}
        className="max-w-7xl mx-auto flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory"
      >
        {results.map((result) => (
          <div
            key={result.id}
            className="flex-shrink-0 w-48 bg-slate-900 dark:bg-slate-900 border border-slate-800/80 dark:border-slate-700/80 rounded-lg p-3 snap-start hover:border-slate-700 dark:hover:border-slate-600 transition-colors cursor-pointer group"
          >
            <div className="space-y-2">
              {/* Match Score */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span className="font-bold text-slate-200 dark:text-white text-sm">
                    {result.homeTeam.slice(0, 3).toUpperCase()}
                  </span>
                  <span className={`text-sm font-semibold ${result.outcome === 'win' ? 'text-emerald-400' : result.outcome === 'loss' ? 'text-red-400' : 'text-white'}`}>
                    {result.homeScore} - {result.awayScore}
                  </span>
                  <span className="font-bold text-slate-400 dark:text-slate-500 text-sm">
                    {result.awayTeam.slice(0, 3).toUpperCase()}
                  </span>
                </div>
                <span
                  className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    result.outcome === 'win'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border border-red-500/30 text-red-400'
                  }`}
                >
                  {result.outcome === 'win' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                </span>
              </div>

              {/* Prediction */}
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Pick:{' '}
                  <span className="text-cyan-400 dark:text-cyan-400 font-medium">
                    {result.prediction}
                  </span>
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {result.league}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scrollbar Hide Styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
