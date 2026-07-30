import React, { useState } from 'react';
import { Briefcase, MapPin, Clock } from 'lucide-react';
import Header from '@/app/components/sports/Header';
import Breadcrumb from '@/app/components/sports/Breadcrumb';
import Footer from '@/app/components/sports/Footer';
import type { Sport } from '@/app/data/sportsData';
import SEO from '@/app/components/SEO';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  description: string;
}

const Careers: React.FC = () => {
  const [activeSport, setActiveSport] = useState<Sport>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const jobs: Job[] = [
    {
      id: '1',
      title: 'Senior Full Stack Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Build and maintain our core platform serving millions of sports fans worldwide.'
    },
    {
      id: '2',
      title: 'Data Analyst',
      department: 'Analytics',
      location: 'New York, NY',
      type: 'Full-time',
      description: 'Analyze sports data to create insights and predictive models for our platform.'
    },
    {
      id: '3',
      title: 'Product Manager',
      department: 'Product',
      location: 'San Francisco, CA',
      type: 'Full-time',
      description: 'Lead product strategy and roadmap for ScoreHub\'s core features.'
    },
    {
      id: '4',
      title: 'Content Writer - Sports',
      department: 'Content',
      location: 'Remote',
      type: 'Part-time',
      description: 'Create engaging sports content and match analysis for our platform.'
    },
    {
      id: '5',
      title: 'DevOps Engineer',
      department: 'Infrastructure',
      location: 'Remote',
      type: 'Full-time',
      description: 'Maintain and scale our cloud infrastructure to support growing user base.'
    },
    {
      id: '6',
      title: 'UI/UX Designer',
      department: 'Design',
      location: 'Los Angeles, CA',
      type: 'Full-time',
      description: 'Design beautiful and intuitive interfaces for sports fans.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <SEO pageKey="careers" />
      <Header activeSport={activeSport} onSportChange={setActiveSport} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Breadcrumb activeTab="dashboard" activeSport={activeSport} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-4xl font-black text-white mb-4">Careers at ScoreHub</h1>
        <p className="text-gray-400 mb-12">Join our team and help us build the future of sports information.</p>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Why Work With Us?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Passionate Team</h3>
              <p className="text-gray-400 text-sm">Work with people who love sports and technology.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Growth Opportunities</h3>
              <p className="text-gray-400 text-sm">Learn and grow with a fast-growing startup.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Great Benefits</h3>
              <p className="text-gray-400 text-sm">Competitive salary, health insurance, and more.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Open Positions</h2>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                    <p className="text-sm text-[#00d4ff]">{job.department}</p>
                  </div>
                  <span className="px-3 py-1 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-full text-xs text-[#00d4ff] font-semibold">
                    {job.type}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-4">{job.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    {job.department}
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-[#00d4ff]/25 transition-all">
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-[#00d4ff]/10 to-[#0066ff]/10 border border-[#00d4ff]/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Don't see a fit?</h2>
          <p className="text-gray-400 mb-6">
            We're always looking for talented individuals. Send us your resume and let us know how you can contribute to ScoreHub.
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[#00d4ff]/25 transition-all">
            Send Your Resume
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Careers;
