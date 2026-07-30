import { Handshake, Globe2, BarChart3, ShieldCheck } from 'lucide-react';
import Header from '@/app/components/sports/Header';
import Breadcrumb from '@/app/components/sports/Breadcrumb';
import Footer from '@/app/components/sports/Footer';
import type { Sport } from '@/app/data/sportsData';
import SEO from '@/app/components/SEO';

const Partners: React.FC = () => {
  const [activeSport, setActiveSport] = useState<Sport>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const benefits = [
    {
      icon: Globe2,
      title: 'Global Reach',
      description: 'Connect your organization with a worldwide community of engaged sports fans.',
    },
    {
      icon: BarChart3,
      title: 'Actionable Insights',
      description: 'Use rich audience and performance data to make smarter partnership decisions.',
    },
    {
      icon: ShieldCheck,
      title: 'Trusted Platform',
      description: 'Build lasting relationships through a reliable, fan-first sports experience.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <SEO pageKey="partners" />
      <Header activeSport={activeSport} onSportChange={setActiveSport} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Breadcrumb activeTab="dashboard" activeSport={activeSport} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
            <Handshake className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white">Partner With ScoreHub</h1>
            <p className="text-gray-400 mt-2">Build better experiences for sports fans together.</p>
          </div>
        </div>

        <section className="mb-12">
          <p className="text-gray-300 leading-relaxed">
            ScoreHub works with leagues, teams, media organizations, data providers, and technology companies to make sports information more useful and accessible. Our partners help us bring fans closer to the games they love.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mb-12">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-white/5 border border-white/10 rounded-lg p-6">
              <Icon className="w-8 h-8 text-[#00d4ff] mb-4" />
              <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </section>

        <section className="bg-gradient-to-r from-[#00d4ff]/10 to-[#0066ff]/10 border border-[#00d4ff]/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Let’s explore a partnership</h2>
          <p className="text-gray-400 mb-6">
            Tell us about your organization and what you want to build for sports fans. Our partnerships team will be in touch.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[#00d4ff]/25 transition-all"
          >
            Contact Partnerships
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Partners;
