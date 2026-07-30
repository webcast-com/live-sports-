import React, { useState } from 'react';
import Header from '@/app/components/sports/Header';
import Breadcrumb from '@/app/components/sports/Breadcrumb';
import Footer from '@/app/components/sports/Footer';
import type { Sport } from '@/app/data/sportsData';
import SEO from '@/app/components/SEO';

const About: React.FC = () => {
  const [activeSport, setActiveSport] = useState<Sport>('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <SEO pageKey="about" />
      <Header activeSport={activeSport} onSportChange={setActiveSport} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Breadcrumb activeTab="dashboard" activeSport={activeSport} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-4xl font-black text-white mb-8">About ScoreHub</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              ScoreHub is dedicated to bringing you real-time sports scores, statistics, and insights from every major league around the world. Our mission is to empower sports fans with instant access to the information they care about most.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">What We Do</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We provide comprehensive coverage of multiple sports including Football, Basketball, Soccer, Baseball, Tennis, and more. Whether you're a casual fan or a serious sports enthusiast, ScoreHub offers the tools and data you need to stay informed.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Live Scores</h3>
                <p className="text-gray-400 text-sm">Real-time score updates as matches happen, with instant notifications for key events.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Advanced Stats</h3>
                <p className="text-gray-400 text-sm">Detailed statistics and analytics for teams, players, and matches.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Predictions</h3>
                <p className="text-gray-400 text-sm">AI-powered predictions and expert analysis for upcoming matches.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Personalization</h3>
                <p className="text-gray-400 text-sm">Customize your experience with favorite teams and leagues.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Our Team</h2>
            <p className="text-gray-300 leading-relaxed">
              ScoreHub is built by a passionate team of sports enthusiasts and technology experts who are committed to delivering the best sports information platform. We work tirelessly to ensure you have access to accurate, up-to-date information whenever and wherever you need it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Our Values</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-[#00d4ff] font-bold mt-1">✓</span>
                <div>
                  <h3 className="text-white font-semibold">Accuracy</h3>
                  <p className="text-gray-400 text-sm">We're committed to providing accurate, real-time sports data.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00d4ff] font-bold mt-1">✓</span>
                <div>
                  <h3 className="text-white font-semibold">Reliability</h3>
                  <p className="text-gray-400 text-sm">Count on ScoreHub for consistent, dependable service.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00d4ff] font-bold mt-1">✓</span>
                <div>
                  <h3 className="text-white font-semibold">Innovation</h3>
                  <p className="text-gray-400 text-sm">We continuously improve and add new features for our users.</p>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
