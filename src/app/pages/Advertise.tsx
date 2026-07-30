import React, { useState } from 'react';
import { BarChart3, Users, TrendingUp, Zap } from 'lucide-react';
import Header from '@/app/components/sports/Header';
import Breadcrumb from '@/app/components/sports/Breadcrumb';
import Footer from '@/app/components/sports/Footer';
import type { Sport } from '@/app/data/sportsData';
import SEO from '@/app/components/SEO';

const Advertise: React.FC = () => {
  const [activeSport, setActiveSport] = useState<Sport>('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <SEO pageKey="advertise" />
      <Header activeSport={activeSport} onSportChange={setActiveSport} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Breadcrumb activeTab="dashboard" activeSport={activeSport} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-4xl font-black text-white mb-4">Advertise With ScoreHub</h1>
        <p className="text-gray-400 mb-12">Reach millions of passionate sports fans with targeted advertising.</p>

        {/* Key Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <Users className="w-8 h-8 text-[#00d4ff] mb-3" />
            <h3 className="text-2xl font-bold text-white">10M+</h3>
            <p className="text-gray-400 text-sm mt-1">Monthly Active Users</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <TrendingUp className="w-8 h-8 text-[#00d4ff] mb-3" />
            <h3 className="text-2xl font-bold text-white">50M+</h3>
            <p className="text-gray-400 text-sm mt-1">Monthly Page Views</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <BarChart3 className="w-8 h-8 text-[#00d4ff] mb-3" />
            <h3 className="text-2xl font-bold text-white">95%</h3>
            <p className="text-gray-400 text-sm mt-1">User Engagement Rate</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <Zap className="w-8 h-8 text-[#00d4ff] mb-3" />
            <h3 className="text-2xl font-bold text-white">50+</h3>
            <p className="text-gray-400 text-sm mt-1">Countries Covered</p>
          </div>
        </div>

        {/* Advertising Options */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Advertising Options</h2>
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors">
              <h3 className="text-xl font-semibold text-white mb-2">Sponsored Highlights</h3>
              <p className="text-gray-400 mb-4">
                Feature your brand in prominent positions across match highlights and featured content.
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-1 text-sm ml-2">
                <li>Prime placement in feature sections</li>
                <li>Reach engaged sports fans</li>
                <li>Custom creative options</li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors">
              <h3 className="text-xl font-semibold text-white mb-2">Display Advertising</h3>
              <p className="text-gray-400 mb-4">
                Strategic ad placements across our platform including homepage, scorecards, and league pages.
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-1 text-sm ml-2">
                <li>High-traffic placements</li>
                <li>Responsive banner ads</li>
                <li>Performance tracking</li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors">
              <h3 className="text-xl font-semibold text-white mb-2">Native Advertising</h3>
              <p className="text-gray-400 mb-4">
                Seamlessly integrate your message with our content for authentic engagement.
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-1 text-sm ml-2">
                <li>Branded content partnerships</li>
                <li>Custom article sponsorships</li>
                <li>Editorial collaboration</li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors">
              <h3 className="text-xl font-semibold text-white mb-2">Mobile App Advertising</h3>
              <p className="text-gray-400 mb-4">
                Reach users on their mobile devices with our dedicated iOS and Android apps.
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-1 text-sm ml-2">
                <li>App exclusive placements</li>
                <li>Push notification campaigns</li>
                <li>In-app engagement tracking</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Target Audience */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Our Audience</h2>
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-white font-semibold mb-4">Demographics</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>• Age: 18-65 years old</li>
                  <li>• Gender: 65% male, 35% female</li>
                  <li>• Income: Primarily middle to upper-middle class</li>
                  <li>• Locations: Global, with strong presence in NA & EU</li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">Interests</h3>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li>• Passionate sports fans</li>
                  <li>• Tech-savvy and mobile-first</li>
                  <li>• Engaged with live sports content</li>
                  <li>• Active on social media</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-[#00d4ff]/10 to-[#0066ff]/10 border border-[#00d4ff]/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Reach Millions?</h2>
          <p className="text-gray-400 mb-6">
            Connect with our advertising team to discuss custom packages and opportunities tailored to your brand.
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[#00d4ff]/25 transition-all">
            Get In Touch
          </button>
          <p className="text-gray-500 text-sm mt-4">Email: partnerships@scorehub.com</p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Advertise;
