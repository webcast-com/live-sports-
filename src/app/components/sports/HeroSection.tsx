import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Zap } from 'lucide-react';
import { LiveMatch } from '@/app/data/sportsData';

interface HeroProps {
  featuredMatches: LiveMatch[];
  onMatchClick: (match: LiveMatch) => void;
}

const HeroSection: React.FC<HeroProps> = ({ featuredMatches, onMatchClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const liveMatches = featuredMatches.filter(m => m.status === 'live');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.max(liveMatches.length, 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [liveMatches.length]);


  const currentMatch = liveMatches[currentSlide] || featuredMatches[0];

  return (
    <section className="relative overflow-hidden -mt-20 pt-20">
      {/* Background */}
      <div className="absolute inset-0 top-0">
        <img
          src="https://d64gsuwffb70l.cloudfront.net/69a9d92741a5bbac0cda4aca_1772738952946_74c79b62.png"
          alt="Sports action"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1117] via-[#0d1117]/90 to-[#0d1117]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12 [box-shadow:1px_1px_3px_0_rgba(252,121,9,1)]">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-full mb-6">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-xs font-semibold tracking-wider uppercase">Live Now</span>
              <span className="text-gray-400 text-xs">{liveMatches.length} matches</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
              Every Score.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#00ff88]">
                Every Moment.
              </span>
            </h2>
            <p className="text-white text-lg mb-8 max-w-lg [text-shadow:1px_1px_3px_rgba(0,0,0,1)]">
              Real-time scores, stats, and highlights from every major league. Never miss a play.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  document.getElementById('live-scores')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#00d4ff]/25 transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Live Scores
              </button>
              <button
                onClick={() => {
                  document.getElementById('upcoming')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-white/10 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Upcoming
              </button>
            </div>
          </div>

          {/* Right - Featured match card */}
          {currentMatch && (
            <div
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 cursor-pointer hover:border-[#00d4ff]/30 transition-all group opacity-100 [text-shadow:1px_1px_3px_rgba(0,0,0,1)] [box-shadow:1px_1px_3px_0_rgba(13,22,138,1)]"
              onClick={() => onMatchClick(currentMatch)}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  {currentMatch.leagueLogo && (
                    <img
                      src={currentMatch.leagueLogo}
                      alt={currentMatch.league}
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  {currentMatch.countryLogo && (
                    <img
                      src={currentMatch.countryLogo}
                      alt="Country"
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{currentMatch.league}</span>
                </div>
                <div className="flex items-center gap-2">
                  {currentMatch.status === 'live' && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 rounded-full">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-red-400 text-xs font-bold">LIVE</span>
                    </span>
                  )}
                  <span className="text-[#00d4ff] text-sm font-mono font-bold">{currentMatch.time}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                {/* Home team */}
                <div className="flex-1 text-center">
                  {currentMatch.homeLogo ? (
                    <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 mb-3 shadow-lg overflow-hidden">
                      <img
                        src={currentMatch.homeLogo}
                        alt={currentMatch.homeTeam}
                        className="w-14 h-14 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.style.backgroundColor = currentMatch.homeColor;
                            parent.innerHTML = `<span class="text-white font-black text-xl">${currentMatch.homeAbbr}</span>`;
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white font-black text-xl mb-3 shadow-lg"
                      style={{ backgroundColor: currentMatch.homeColor }}
                    >
                      {currentMatch.homeAbbr}
                    </div>
                  )}
                  <p className="text-white font-semibold text-sm">{currentMatch.homeTeam}</p>
                </div>

                {/* Score */}
                <div className="text-center px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl sm:text-5xl font-black text-white tabular-nums">{currentMatch.homeScore}</span>
                    <span className="text-2xl text-gray-600 font-light">-</span>
                    <span className="text-4xl sm:text-5xl font-black text-white tabular-nums">{currentMatch.awayScore}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-2 uppercase tracking-wider">{currentMatch.sport}</p>
                </div>

                {/* Away team */}
                <div className="flex-1 text-center">
                  {currentMatch.awayLogo ? (
                    <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 mb-3 shadow-lg overflow-hidden">
                      <img
                        src={currentMatch.awayLogo}
                        alt={currentMatch.awayTeam}
                        className="w-14 h-14 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.style.backgroundColor = currentMatch.awayColor;
                            parent.innerHTML = `<span class="text-white font-black text-xl">${currentMatch.awayAbbr}</span>`;
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white font-black text-xl mb-3 shadow-lg"
                      style={{ backgroundColor: currentMatch.awayColor }}
                    >
                      {currentMatch.awayAbbr}
                    </div>
                  )}
                  <p className="text-white font-semibold text-sm">{currentMatch.awayTeam}</p>
                </div>
              </div>

              {/* Slide indicators */}
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev - 1 + liveMatches.length) % liveMatches.length);
                  }}
                  className="p-1 text-gray-500 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {liveMatches.slice(0, 5).map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide(i);
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentSlide ? 'w-6 bg-[#00d4ff]' : 'w-1.5 bg-gray-600 hover:bg-gray-400'
                    }`}
                  />
                ))}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide((prev) => (prev + 1) % liveMatches.length);
                  }}
                  className="p-1 text-gray-500 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

interface LiveMatchTickerProps {
  matches: LiveMatch[];
  onMatchClick: (match: LiveMatch) => void;
}

export const LiveMatchTicker: React.FC<LiveMatchTickerProps> = ({ matches, onMatchClick }) => {
  const [tickerIndex, setTickerIndex] = useState(0);
  const tickerRef = React.useRef<HTMLDivElement>(null);
  const liveMatches = matches.filter((match) => match.status === 'live' || match.status === 'halftime');
  const tickerMatches = liveMatches.length > 0 ? liveMatches : matches;

  useEffect(() => {
    if (tickerMatches.length === 0) return;

    const interval = setInterval(() => {
      setTickerIndex((previousIndex) =>
        previousIndex === tickerMatches.length - 1 ? 0 : previousIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [tickerMatches.length]);

  useEffect(() => {
    if (!tickerRef.current || tickerMatches.length === 0) return;

    tickerRef.current.scrollTo({
      left: tickerIndex * 200,
      behavior: 'smooth',
    });
  }, [tickerIndex, tickerMatches.length]);

  if (tickerMatches.length === 0) return null;

  return (
    <div className="mt-10 overflow-hidden">
      <div ref={tickerRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {tickerMatches.map((match) => (
          <button
            key={match.id}
            onClick={() => onMatchClick(match)}
            className={`flex-shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all ${
              match.id === tickerMatches[tickerIndex]?.id
                ? 'bg-[#00d4ff]/10 border-[#00d4ff]/30'
                : 'bg-white/5 border-white/5 hover:border-white/20'
            }`}
          >
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-xs text-gray-400 font-medium">{match.homeAbbr}</span>
            <span className="text-sm font-bold text-white tabular-nums">{match.homeScore} - {match.awayScore}</span>
            <span className="text-xs text-gray-400 font-medium">{match.awayAbbr}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
