import React, { useState } from 'react';
import { TrendingUp, Send, CheckCircle, Twitter, Youtube, Instagram, Facebook } from 'lucide-react';

interface FooterProps {
  onNavigate?: (href: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setEmailError('Please enter your email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email');
      return;
    }
    setEmailError('');
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  const links = {
    sports: ['Football', 'Basketball', 'Soccer', 'Baseball', 'Tennis', 'Hockey', 'Golf', 'MMA'],
    leagues: ['NFL', 'NBA', 'Premier League', 'MLB', 'La Liga', 'Serie A', 'Bundesliga', 'ATP Tour'],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Contact', href: '/contact' },
      { label: 'Advertise', href: '/advertise' },
      { label: 'Partners', href: '/partners' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Accessibility', href: '/accessibility' },
    ],
  };

  const socialLinks = {
    twitter: 'https://twitter.com',
    youtube: 'https://youtube.com',
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNavigation = (href: string) => {
    window.location.href = href;
  };

  return (
    <footer className="bg-[#0a0d12] border-t border-white/5">
      {/* Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-gradient-to-r from-[#00d4ff]/10 to-[#0066ff]/10 border border-[#00d4ff]/20 rounded-2xl p-6 sm:p-8 mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Never Miss a Score</h3>
              <p className="text-gray-400 text-sm">Get live score alerts and breaking sports news delivered to your inbox.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                  className={`w-full sm:w-64 px-4 py-3 bg-white/5 border rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none transition-all ${
                    emailError ? 'border-red-500/50' : 'border-white/10 focus:border-[#00d4ff]/50'
                  }`}
                />
                {emailError && <p className="text-red-400 text-xs mt-1 absolute">{emailError}</p>}
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#00d4ff]/25 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {subscribed ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Subscribed!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Subscribe
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Score<span className="text-[#00d4ff]">Hub</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Your ultimate destination for live sports scores, stats, and breaking news.
            </p>
            <div className="flex gap-2">
              {[
                { Icon: Twitter, url: socialLinks.twitter },
                { Icon: Youtube, url: socialLinks.youtube },
                { Icon: Instagram, url: socialLinks.instagram },
                { Icon: Facebook, url: socialLinks.facebook },
              ].map(({ Icon, url }, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                  aria-label={Icon.displayName || 'Social'}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Sports */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Sports</h4>
            <ul className="space-y-2.5">
              {links.sports.map((link) => (
                <li key={link}>
                  <button
                    onClick={() => scrollToSection('live-scores')}
                    className="text-gray-500 text-sm hover:text-[#00d4ff] transition-colors"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Leagues */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Leagues</h4>
            <ul className="space-y-2.5">
              {links.leagues.map((link) => (
                <li key={link}>
                  <button
                    onClick={() => scrollToSection('standings')}
                    className="text-gray-500 text-sm hover:text-[#00d4ff] transition-colors"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2.5">
              {links.company.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => onNavigate ? onNavigate(item.href) : handleNavigation(item.href)}
                    className="text-gray-500 text-sm hover:text-[#00d4ff] transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Support</h4>
            <ul className="space-y-2.5">
              {links.support.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => onNavigate ? onNavigate(item.href) : handleNavigation(item.href)}
                    className="text-gray-500 text-sm hover:text-[#00d4ff] transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            &copy; 2026 ScoreHub. All rights reserved. Scores are provided for informational purposes only.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-xs">Made with passion for sports fans worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
