import React, { useState } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import Header from '@/app/components/sports/Header';
import Breadcrumb from '@/app/components/sports/Breadcrumb';
import Footer from '@/app/components/sports/Footer';
import type { Sport } from '@/app/data/sportsData';
import SEO from '@/app/components/SEO';

interface PressRelease {
  id: string;
  title: string;
  date: string;
  summary: string;
  category: string;
}

const Press: React.FC = () => {
  const [activeSport, setActiveSport] = useState<Sport>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const releases: PressRelease[] = [
    {
      id: '1',
      title: 'ScoreHub Reaches 10 Million Active Users',
      date: 'January 15, 2026',
      summary: 'Major milestone achieved as ScoreHub\'s user base continues to grow globally.',
      category: 'Company'
    },
    {
      id: '2',
      title: 'Introducing AI-Powered Match Predictions',
      date: 'January 10, 2026',
      summary: 'New prediction feature powered by advanced machine learning models now available to premium users.',
      category: 'Product'
    },
    {
      id: '3',
      title: 'Partnership with Major Sports Leagues Announced',
      date: 'January 5, 2026',
      summary: 'ScoreHub partners with leading sports organizations for real-time data access.',
      category: 'Partnership'
    },
    {
      id: '4',
      title: 'Series B Funding Round Closes Successfully',
      date: 'December 28, 2025',
      summary: '$50 million funding round led by top-tier venture capital firms to accelerate growth.',
      category: 'Funding'
    },
    {
      id: '5',
      title: 'Mobile App Hits 5 Million Downloads',
      date: 'December 20, 2025',
      summary: 'ScoreHub mobile application surpasses 5 million downloads across iOS and Android.',
      category: 'Company'
    },
    {
      id: '6',
      title: 'ScoreHub Expands Coverage to 100+ Leagues',
      date: 'December 15, 2025',
      summary: 'Expanded coverage now includes leagues from 50+ countries worldwide.',
      category: 'Product'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <SEO pageKey="press" />
      <Header activeSport={activeSport} onSportChange={setActiveSport} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Breadcrumb activeTab="dashboard" activeSport={activeSport} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-4xl font-black text-white mb-4">Press & News</h1>
        <p className="text-gray-400 mb-12">Latest news, announcements, and press releases from ScoreHub.</p>

        <div className="mb-12">
          <div className="flex flex-wrap gap-2 mb-8">
            {['All', 'Company', 'Product', 'Partnership', 'Funding'].map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  category === 'All'
                    ? 'bg-[#00d4ff] text-[#0d1117]'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {releases.map((release) => (
              <article
                key={release.id}
                className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#00d4ff]" />
                    <span className="text-sm text-gray-400">{release.date}</span>
                  </div>
                  <span className="px-3 py-1 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-full text-xs text-[#00d4ff] font-semibold">
                    {release.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00d4ff] transition-colors">
                  {release.title}
                </h3>
                <p className="text-gray-400 mb-4">{release.summary}</p>
                <div className="flex items-center gap-2 text-[#00d4ff] font-semibold text-sm group-hover:gap-3 transition-all">
                  Read More <ArrowRight className="w-4 h-4" />
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#00d4ff]/10 to-[#0066ff]/10 border border-[#00d4ff]/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Media Kit</h2>
          <p className="text-gray-400 mb-6">
            Download our media kit for logos, screenshots, and company information.
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[#00d4ff]/25 transition-all">
            Download Media Kit
          </button>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Press Inquiries</h2>
          <p className="text-gray-400 mb-6">
            For press inquiries, interviews, or partnership opportunities, please contact us at press@scorehub.com
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Press;
