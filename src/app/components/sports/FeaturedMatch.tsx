import React, { useState, useEffect } from 'react';
import { X, MapPin, User, Cloud, Activity, TrendingUp, Loader2 } from 'lucide-react';
import { LiveMatch } from '@/app/data/sportsData';
import { getEdgeFunctionUrl, SUPABASE_ANON_KEY } from '@/lib/supabase';
import MatchChat from './MatchChat';

interface FeaturedMatchProps {
  match: LiveMatch | null;
  onClose: () => void;
}

interface MatchDetails {
  venue?: { name?: string; city?: string };
  referee?: { name?: string };
  forecast?: { temperature?: string; status?: string };
  events?: Array<{ time: string; type: string; player?: string; team?: { name?: string } }>;
  predictions?: { prematch?: Array<{ probabilities?: { home?: string; draw?: string; away?: string } }> };
}

const FeaturedMatch: React.FC<FeaturedMatchProps> = ({ match, onClose }) => {
  const [details, setDetails] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!match) return;
    const fetchMatchDetails = async () => {
      setLoading(true);
      try {
        const url = getEdgeFunctionUrl(`make-server-ed1dd9fb/match/${match.id}`);
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
          mode: 'cors',
          credentials: 'omit',
        });
        if (!response.ok) return;
        const data = await response.json();
        if (data.success && data.match) setDetails(data.match);
        else setDetails(null);
      } catch {
        setDetails(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMatchDetails();
  }, [match?.id]);

  if (!match) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#161b22] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            {match.leagueLogo && <img src={match.leagueLogo} alt={match.league} className="w-6 h-6 object-contain" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />}
            {match.countryLogo && <img src={match.countryLogo} alt="Country" className="w-6 h-6 object-contain" onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />}
            <h2 className="text-xl font-bold text-white">{match.league}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" style={{ color: 'rgba(155, 155, 155, 1)' }} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="mb-2">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex-1 text-center">
                {match.homeLogo ? (
                  <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 mb-3 shadow-lg overflow-hidden">
                    <img src={match.homeLogo} alt={match.homeTeam} className="w-16 h-16 object-contain" onError={(e) => { const img = e.currentTarget as HTMLImageElement; img.style.display = 'none'; const parent = img.parentElement; if (parent) { parent.style.backgroundColor = match.homeColor; parent.innerHTML = `<span class="text-white font-black text-2xl">${match.homeAbbr}</span>`; } }} />
                  </div>
                ) : (
                  <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-3 shadow-lg" style={{ backgroundColor: match.homeColor }}>{match.homeAbbr}</div>
                )}
                <p className="text-white font-semibold">{match.homeTeam}</p>
              </div>

              <div className="text-center">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-5xl font-black text-white tabular-nums">{match.homeScore}</span>
                  <span className="text-3xl text-gray-600 font-light">-</span>
                  <span className="text-5xl font-black text-white tabular-nums">{match.awayScore}</span>
                </div>
                {match.status === 'live' && (
                  <span className="flex items-center justify-center gap-1.5 px-3 py-1 bg-red-500/20 rounded-full w-fit mx-auto">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-400 text-xs font-bold">LIVE - {match.time}</span>
                  </span>
                )}
              </div>

              <div className="flex-1 text-center">
                {match.awayLogo ? (
                  <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 mb-3 shadow-lg overflow-hidden">
                    <img src={match.awayLogo} alt={match.awayTeam} className="w-16 h-16 object-contain" onError={(e) => { const img = e.currentTarget as HTMLImageElement; img.style.display = 'none'; const parent = img.parentElement; if (parent) { parent.style.backgroundColor = match.awayColor; parent.innerHTML = `<span class="text-white font-black text-2xl">${match.awayAbbr}</span>`; } }} />
                  </div>
                ) : (
                  <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-3 shadow-lg" style={{ backgroundColor: match.awayColor }}>{match.awayAbbr}</div>
                )}
                <p className="text-white font-semibold">{match.awayTeam}</p>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-[#00d4ff] animate-spin" />
              <span className="ml-2 text-gray-400 text-sm">Loading match details...</span>
            </div>
          )}

          {details && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {details.venue && (details.venue.name || details.venue.city) && (
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2"><MapPin className="w-4 h-4 text-[#00d4ff]" /><span className="text-gray-400 text-xs uppercase font-semibold">Venue</span></div>
                    <p className="text-white text-sm font-medium">{details.venue.name || 'Unknown'}</p>
                    {details.venue.city && <p className="text-gray-500 text-xs mt-1">{details.venue.city}</p>}
                  </div>
                )}
                {details.referee?.name && (
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2"><User className="w-4 h-4 text-[#00d4ff]" /><span className="text-gray-400 text-xs uppercase font-semibold">Referee</span></div>
                    <p className="text-white text-sm font-medium">{details.referee.name}</p>
                  </div>
                )}
                {details.forecast && (details.forecast.temperature || details.forecast.status) && (
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2"><Cloud className="w-4 h-4 text-[#00d4ff]" /><span className="text-gray-400 text-xs uppercase font-semibold">Weather</span></div>
                    <p className="text-white text-sm font-medium">{details.forecast.temperature}{details.forecast.status && `, ${details.forecast.status}`}</p>
                  </div>
                )}
              </div>

              {details.predictions?.prematch?.[0]?.probabilities && (
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-[#00d4ff]" /><span className="text-gray-400 text-xs uppercase font-semibold">Match Predictions</span></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center"><p className="text-gray-400 text-xs mb-1">Home</p><p className="text-white text-lg font-bold">{details.predictions.prematch[0].probabilities.home || 'N/A'}</p></div>
                    <div className="text-center"><p className="text-gray-400 text-xs mb-1">Draw</p><p className="text-white text-lg font-bold">{details.predictions.prematch[0].probabilities.draw || 'N/A'}</p></div>
                    <div className="text-center"><p className="text-gray-400 text-xs mb-1">Away</p><p className="text-white text-lg font-bold">{details.predictions.prematch[0].probabilities.away || 'N/A'}</p></div>
                  </div>
                </div>
              )}

              {details.events && details.events.length > 0 && (
                <div className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-3"><Activity className="w-4 h-4 text-[#00d4ff]" /><span className="text-gray-400 text-xs uppercase font-semibold">Match Events</span></div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {details.events.map((event, index) => (
                      <div key={index} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                        <span className="text-[#00d4ff] text-xs font-mono font-bold min-w-[35px]">{event.time}'</span>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium capitalize">{event.type}</p>
                          {event.player && <p className="text-gray-400 text-xs mt-0.5">{event.player}{event.team?.name && ` (${event.team.name})`}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3 p-4 bg-white/5 rounded-lg">
            <div className="flex justify-between items-center"><span className="text-gray-400 text-sm">Match Time</span><span className="text-white font-semibold">{match.time}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400 text-sm">Status</span><span className="text-white font-semibold capitalize">{match.status}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400 text-sm">Sport</span><span className="text-white font-semibold capitalize">{match.sport}</span></div>
          </div>

          {/* Phase 4: Live Chat per Match with Realtime */}
          <MatchChat matchId={match.id} homeTeam={match.homeTeam} awayTeam={match.awayTeam} />
        </div>
      </div>
    </div>
  );
};

export default FeaturedMatch;
