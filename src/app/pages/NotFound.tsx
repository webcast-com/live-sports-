import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Home, Search, TrendingUp, ArrowLeft } from 'lucide-react';
import Header from '@/app/components/sports/Header';
import Footer from '@/app/components/sports/Footer';
import type { Sport } from '@/app/data/sportsData';
import SEO from '@/app/components/SEO';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const [activeSport, setActiveSport] = useState<Sport>('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">
      <SEO pageKey="notFound" />
      <Header activeSport={activeSport} onSportChange={setActiveSport} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] mb-6 shadow-lg shadow-[#00d4ff]/20">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-6xl font-black text-white mb-2">404</h1>
          <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>
          <p className="text-gray-400 mb-8">Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back to the action.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate(-1)} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all">
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
            <button onClick={() => navigate('/')} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white font-semibold hover:shadow-lg hover:shadow-[#00d4ff]/25 transition-all">
              <Home className="w-4 h-4" /> Back to Home
            </button>
          </div>
          <div className="mt-12 p-4 bg-white/5 border border-white/10 rounded-xl text-left">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Search className="w-4 h-4 text-[#00d4ff]" /> Popular Pages</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { label: 'Live Scores', href: '/' },
                { label: 'Predictions', href: '/predictions' },
                { label: 'Results', href: '/results' },
                { label: 'Sure Bets', href: '/sure-bets' },
                { label: 'Premium', href: '/premium' },
                { label: 'About', href: '/about' },
              ].map((link) => (
                <button key={link.href} onClick={() => navigate(link.href)} className="text-left px-3 py-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-[#00d4ff] transition-colors">{link.label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer onNavigate={(href) => navigate(href)} />
    </div>
  );
};

export default NotFound;
