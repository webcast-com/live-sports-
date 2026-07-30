import React, { useState } from 'react';
import Header from '@/app/components/sports/Header';
import Footer from '@/app/components/sports/Footer';
import type { Sport } from '@/app/data/sportsData';
import SEO from '@/app/components/SEO';

const CookiePolicy: React.FC = () => {
  const [activeSport, setActiveSport] = useState<Sport>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const cookies = [
    { name: 'auth_token', purpose: 'User authentication and session management', duration: 'Session', type: 'Essential' },
    { name: 'scorehub_preferences', purpose: 'Stores your sport preferences and language settings', duration: '1 year', type: 'Functional' },
    { name: 'notification_consent', purpose: 'Remembers your notification preferences', duration: '6 months', type: 'Functional' },
    { name: 'analytics_session', purpose: 'Tracks page views and user interactions for analytics', duration: 'Session', type: 'Analytics' },
    { name: 'scorehub_user_id', purpose: 'Anonymous user identification for analytics', duration: '2 years', type: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <SEO pageKey="cookies" />
      <Header activeSport={activeSport} onSportChange={setActiveSport} searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-4xl font-black text-white mb-2">Cookie Policy</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: January 2026</p>

        <div className="space-y-8">
          <section className="bg-white/5 border border-white/10 rounded-lg p-6">
            <p className="text-gray-300 leading-relaxed">
              At ScoreHub, we use cookies to enhance your browsing experience, provide personalized content, and understand how users interact with our platform. This policy explains what cookies are, the types we use, and how you can manage them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-300 leading-relaxed">
              Cookies are small text files stored on your browser or device that contain information about your interactions with our website. They serve essential functions like maintaining your login status, saving your preferences, and helping us analyze how visitors use ScoreHub. Cookies can be set by us (first-party) or by third parties (such as analytics providers).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[#00d4ff] mb-2">Essential Cookies</h3>
                <p className="text-gray-300 mb-2">
                  These cookies are necessary for the website to function properly. Without them, you cannot log in, navigate between pages, or submit forms.
                </p>
                <ul className="list-disc list-inside text-gray-400 text-sm ml-2 space-y-1">
                  <li><code className="bg-white/5 px-2 py-1 rounded">auth_token</code> - Maintains your login session</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#00d4ff] mb-2">Functional Cookies</h3>
                <p className="text-gray-300 mb-2">
                  These cookies remember your choices and personalize your experience on ScoreHub.
                </p>
                <ul className="list-disc list-inside text-gray-400 text-sm ml-2 space-y-1">
                  <li><code className="bg-white/5 px-2 py-1 rounded">scorehub_preferences</code> - Saves your sport preferences and language</li>
                  <li><code className="bg-white/5 px-2 py-1 rounded">notification_consent</code> - Stores your notification settings</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#00d4ff] mb-2">Analytics Cookies</h3>
                <p className="text-gray-300 mb-2">
                  These cookies help us understand how you use our website. They track page views, features accessed, and user interactions to improve ScoreHub.
                </p>
                <ul className="list-disc list-inside text-gray-400 text-sm ml-2 space-y-1">
                  <li><code className="bg-white/5 px-2 py-1 rounded">analytics_session</code> - Tracks current session activity</li>
                  <li><code className="bg-white/5 px-2 py-1 rounded">scorehub_user_id</code> - Anonymous user identification</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Cookie Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-3 text-[#00d4ff] font-semibold">Cookie Name</th>
                    <th className="text-left py-3 px-3 text-[#00d4ff] font-semibold">Purpose</th>
                    <th className="text-left py-3 px-3 text-[#00d4ff] font-semibold">Duration</th>
                    <th className="text-left py-3 px-3 text-[#00d4ff] font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {cookies.map((cookie) => (
                    <tr key={cookie.name} className="border-b border-white/5">
                      <td className="py-3 px-3 text-gray-300"><code className="bg-white/5 px-2 py-1 rounded text-xs">{cookie.name}</code></td>
                      <td className="py-3 px-3 text-gray-400">{cookie.purpose}</td>
                      <td className="py-3 px-3 text-gray-400">{cookie.duration}</td>
                      <td className="py-3 px-3"><span className={`px-2 py-1 rounded text-xs font-medium ${
                        cookie.type === 'Essential' ? 'bg-red-500/20 text-red-300' :
                        cookie.type === 'Functional' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>{cookie.type}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Managing Your Cookies</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You have the right to control which cookies we store on your device. Here are your options:
            </p>
            <div className="space-y-3 ml-4">
              <div>
                <h4 className="text-white font-semibold mb-1">Browser Settings</h4>
                <p className="text-gray-400 text-sm">
                  Most browsers allow you to manage cookies through settings. You can view, delete, or block cookies. Visit your browser's help page for instructions for Chrome, Firefox, Safari, or Edge.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Cookie Preferences</h4>
                <p className="text-gray-400 text-sm">
                  You can manage your preferences for analytics and functional cookies on this site. Essential cookies cannot be disabled as they are required for the website to function.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Opt-Out</h4>
                <p className="text-gray-400 text-sm">
                  You can opt out of analytics tracking by adjusting your browser's Do Not Track (DNT) settings or by contacting us directly.
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-4 italic">
              ⚠️ Note: Disabling essential cookies may affect the functionality of the website and you may not be able to access certain features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Cookies and Services</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              ScoreHub may use third-party services that set their own cookies:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong>Analytics:</strong> We may use analytics tools to understand usage patterns and improve our services</li>
              <li><strong>Payment Processing:</strong> Third-party payment providers (if applicable) may set cookies for secure transactions</li>
              <li><strong>Advertising:</strong> Partners may set cookies to deliver targeted content (where applicable)</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              We are not responsible for the cookies set by third parties. Please review their privacy policies for more information about how they use cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Legal Basis for Cookies</h2>
            <p className="text-gray-300 leading-relaxed">
              We use cookies based on the following legal grounds:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-3">
              <li><strong>Consent:</strong> You have provided explicit consent to store certain cookies (analytics, functional)</li>
              <li><strong>Legitimate Interest:</strong> We use essential cookies to provide you with the services you have requested</li>
              <li><strong>Legal Obligation:</strong> Some cookies may be required for regulatory compliance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Changes to This Cookie Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              ScoreHub may update this Cookie Policy periodically to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will notify you by updating the "Last updated" date and, if necessary, by placing a notice on our website. Your continued use of our website after such modifications indicates your acceptance of the updated Cookie Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              If you have questions about this Cookie Policy or wish to withdraw your consent to certain cookies, please contact us:
            </p>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 ml-4">
              <p className="text-gray-300"><strong>Email:</strong> <a href="mailto:support@scorehub.com" className="text-[#00d4ff] hover:text-[#00d4ff]/80 transition-colors">support@scorehub.com</a></p>
              <p className="text-gray-300 mt-2"><strong>Address:</strong> ScoreHub Support Team</p>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CookiePolicy;
