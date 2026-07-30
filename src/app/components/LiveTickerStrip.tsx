import { useEffect, useRef, useState } from 'react';
import { getPredictions, type ApiPrediction } from '../services/footballApi';
import { getBetigoloHistory, type BetigoloHistory } from '../services/betigoloApi';

interface TickerMatch {
  id: string;
  leagueId: string;
  homeCode: string;
  awayCode: string;
  homeScore: number;
  awayScore: number;
  time: string;
  homeColor: string;
  awayColor: string;
  source?: 'predictions' | 'betigolo';
}

export function LiveTickerStrip() {
  const [matches, setMatches] = useState<TickerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const tickerSliderRef = useRef<HTMLDivElement>(null);

  const generateDeterministicColor = (str: string): string => {
    const hashCode = (text: string) => {
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    };
    const hues = [0, 30, 60, 120, 240, 270, 300];
    return `hsl(${hues[hashCode(str) % hues.length]}, 70%, 50%)`;
  };

  const formatBetigoloMatch = (history: BetigoloHistory, index: number): TickerMatch => {
    const homeTeam = history.homeTeam || history.home || 'HOME';
    const awayTeam = history.awayTeam || history.away || 'AWAY';

    return {
      id: `betigolo-${history.id || index}`,
      leagueId: (history.league || 'TIPS').substring(0, 3).toUpperCase(),
      homeCode: homeTeam.substring(0, 3).toUpperCase(),
      awayCode: awayTeam.substring(0, 3).toUpperCase(),
      homeScore: Math.floor(Math.random() * 3),
      awayScore: Math.floor(Math.random() * 3),
      time: `${45 + Math.floor(Math.random() * 50)}'`,
      homeColor: generateDeterministicColor(homeTeam),
      awayColor: generateDeterministicColor(awayTeam),
      source: 'betigolo',
    };
  };

  const formatPredictionMatch = (match: ApiPrediction, index: number): TickerMatch => {
    const homeTeam = match.home_name || match.home_team || 'HOME';
    const awayTeam = match.away_name || match.away_team || 'AWAY';

    return {
      id: `ticker-${match.id || index}`,
      leagueId: (match.league || match.competition_name || 'LIVE').substring(0, 3).toUpperCase(),
      homeCode: homeTeam.substring(0, 3).toUpperCase(),
      awayCode: awayTeam.substring(0, 3).toUpperCase(),
      homeScore: Math.floor(Math.random() * 3),
      awayScore: Math.floor(Math.random() * 3),
      time: `${45 + Math.floor(Math.random() * 50)}'`,
      homeColor: generateDeterministicColor(homeTeam),
      awayColor: generateDeterministicColor(awayTeam),
      source: 'predictions',
    };
  };

  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        const [predictionsRes, historyRes] = await Promise.all([
          getPredictions({ market: 'classic' }),
          getBetigoloHistory(),
        ]);

        const tickerMatches: TickerMatch[] = [];

        if (historyRes && historyRes.data && historyRes.data.length > 0) {
          const betigoloMatches = historyRes.data.slice(0, 5).map(formatBetigoloMatch);
          tickerMatches.push(...betigoloMatches);
        }

        // Add predictions
        if (predictionsRes.data && predictionsRes.data.length > 0) {
          const predictionMatches = predictionsRes.data.slice(0, 10).map(formatPredictionMatch);
          tickerMatches.push(...predictionMatches);
        }

        // If we have data from either source, set it
        if (tickerMatches.length > 0) {
          setMatches(tickerMatches);
        }
      } catch (e) {
        console.error('Failed to load ticker data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchTickerData();
    const interval = setInterval(fetchTickerData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const slider = tickerSliderRef.current;
    if (!slider || matches.length === 0) return;

    // Clone cards for infinite scroll effect
    const cards = slider.querySelectorAll('.ticker-card');
    cards.forEach((card) => {
      const clone = card.cloneNode(true);
      slider.appendChild(clone);
    });

    // Start animation
    let scrollPos = 0;
    const speed = 1;
    let animationId: number;

    const animate = () => {
      scrollPos += speed;
      slider.style.transform = `translateX(-${scrollPos}px)`;

      if (scrollPos >= slider.offsetWidth / 2) {
        scrollPos = 0;
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [matches]);

  if (loading || matches.length === 0) {
    return null;
  }

  return (
    <section className="ticker-strip-container">
      <div className="ticker-strip-wrapper">
        <div className="ticker-content" ref={tickerSliderRef}>
          {matches.map((match) => (
            <div
              key={match.id}
              className="ticker-card"
              data-match-id={match.id}
            >
              <span className="ticker-league">{match.leagueId}</span>
              <div className="ticker-match">
                <span className="ticker-team">{match.homeCode}</span>
                <span className="ticker-score">
                  {match.homeScore} - {match.awayScore}
                </span>
                <span className="ticker-team">{match.awayCode}</span>
              </div>
              <span className="ticker-time">{match.time}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .ticker-strip-container {
          width: 100%;
          padding: 8px 0;
          background: linear-gradient(90deg, #0d1117 0%, #1a1f26 50%, #0d1117 100%);
          border-bottom: 1px solid rgba(74, 74, 74, 0.3);
          text-shadow: 1px 1px 3px rgba(0, 0, 0, 1);
          overflow: hidden;
        }

        .ticker-strip-wrapper {
          width: 100%;
          overflow: hidden;
        }

        .ticker-content {
          display: flex;
          gap: 16px;
          padding: 0 16px;
          will-change: transform;
        }

        .ticker-card {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: rgba(30, 30, 30, 0.8);
          border: 1px solid rgba(100, 100, 100, 0.2);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .ticker-card:hover {
          background: rgba(40, 40, 40, 0.95);
          border-color: rgba(100, 100, 100, 0.4);
        }

        .ticker-league {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #00d4ff;
          padding: 2px 6px;
          background: rgba(0, 212, 255, 0.15);
          border-radius: 3px;
        }

        .ticker-match {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: fit-content;
        }

        .ticker-team {
          font-size: 12px;
          font-weight: 600;
          color: #e1e8ed;
          min-width: 30px;
          text-align: center;
        }

        .ticker-score {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          padding: 0 6px;
          min-width: 35px;
          text-align: center;
        }

        .ticker-time {
          font-size: 11px;
          color: #888;
          font-weight: 500;
          min-width: 30px;
          text-align: right;
        }

        @media (max-width: 640px) {
          .ticker-card {
            padding: 6px 12px;
            gap: 8px;
          }

          .ticker-league {
            font-size: 10px;
            padding: 2px 4px;
          }

          .ticker-team {
            font-size: 11px;
            min-width: 25px;
          }

          .ticker-score {
            font-size: 12px;
            min-width: 30px;
          }

          .ticker-time {
            font-size: 10px;
            min-width: 25px;
          }
        }
      `}</style>
    </section>
  );
}
