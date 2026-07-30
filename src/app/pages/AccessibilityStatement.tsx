import React, { useState } from 'react';
import Header from '@/app/components/sports/Header';
import Footer from '@/app/components/sports/Footer';
import type { Sport } from '@/app/data/sportsData';
import SEO from '@/app/components/SEO';

const AccessibilityStatement: React.FC = () => {
  const [activeSport, setActiveSport] = useState<Sport>('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <SEO pageKey="accessibility" />
      <Header activeSport={activeSport} onSportChange={setActiveSport} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-4xl font-black text-white mb-8">Accessibility Statement</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: January 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Our Commitment</h2>
            <p className="text-gray-300 leading-relaxed">
              ScoreHub is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Accessibility Features</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Our website includes the following accessibility features:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Keyboard navigation support</li>
              <li>Screen reader compatibility</li>
              <li>High contrast mode support</li>
              <li>Text resizing capabilities</li>
              <li>Skip navigation links</li>
              <li>Semantic HTML structure</li>
              <li>ARIA labels and landmarks</li>
              <li>Alternative text for images</li>
              <li>Captions for video content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Accessibility Standards</h2>
            <p className="text-gray-300 leading-relaxed">
              We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. These guidelines explain how to make web content more accessible to people with disabilities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Browser and Assistive Technology Support</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Our website is compatible with the following assistive technologies:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>NVDA (NonVisual Desktop Access)</li>
              <li>JAWS (Job Access With Speech)</li>
              <li>VoiceOver (for macOS and iOS)</li>
              <li>TalkBack (for Android)</li>
              <li>Windows Narrator</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Known Accessibility Issues</h2>
            <p className="text-gray-300 leading-relaxed">
              While we strive for full accessibility, some third-party content or embedded media may not be fully accessible. We are working to improve these areas continuously.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Keyboard Navigation</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              You can navigate our website using the following keyboard shortcuts:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><span className="font-semibold">Tab</span> - Move to the next focusable element</li>
              <li><span className="font-semibold">Shift + Tab</span> - Move to the previous focusable element</li>
              <li><span className="font-semibold">Enter</span> - Activate a link or button</li>
              <li><span className="font-semibold">Space</span> - Toggle checkboxes or buttons</li>
              <li><span className="font-semibold">Arrow Keys</span> - Navigate within menus or lists</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Feedback and Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              We welcome your feedback on the accessibility of ScoreHub. If you encounter any accessibility barriers or have suggestions for improvement, please contact us at accessibility@scorehub.com. We will respond to accessibility-related inquiries within 5 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Links</h2>
            <p className="text-gray-300 leading-relaxed">
              External websites and resources linked from our site may not follow the same accessibility standards. We are not responsible for the accessibility of third-party content, but we encourage you to contact those organizations if you encounter accessibility issues.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AccessibilityStatement;
