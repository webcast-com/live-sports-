import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { LiveMatch } from '@/app/data/sportsData';
import { getEdgeFunctionUrl, SUPABASE_ANON_KEY } from '@/lib/supabase';
import Header from '@/app/components/sports/Header';
import Footer from '@/app/components/sports/Footer';
import type { Sport } from '@/app/data/sportsData';
import { setPageMeta } from '@/utils/seoMeta';

export const MatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeSport, setActiveSport] = useState<Sport>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [match, setMatch] = useState<LiveMatch | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const url = getEdgeFunctionUrl(`make-server-ed1dd9fb/match/${id}`);
        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        });
        const data = await res.json();
        if (data.match) {
          setDetails(data.match);
          if (data.match.homeTeam && data.match.awayTeam) {
            document.title = `${data.match.homeTeam?.name || data.match.homeTeam} vs ${data.match.awayTeam?.name || data.match.awayTeam} Live | ScoreHub`;
          }
        } else {
          setError('Match details not available');
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  useEffect(() => {
    setPageMeta('home');
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Header activeSport={activeSport} onSportChange={setActiveSport} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading match details...
          </div>
        ) : error ? (
          <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            <h1 className="text-3xl font-black">Match #{id}</h1>
            {details ? (
              <pre className="bg-[#161b22] border border-white/10 rounded-xl p-4 overflow-auto text-sm text-gray-300">
                {JSON.stringify(details, null, 2)}
              </pre>
            ) : (
              <p className="text-gray-400">No additional data.</p>
            )}
          </div>
        )}
      </div>
      <Footer onNavigate={(href) => navigate(href)} />
    </div>
  );
};

export default MatchDetail;
