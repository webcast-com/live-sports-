import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Header from '@/app/components/sports/Header';
import Footer from '@/app/components/sports/Footer';
import type { Sport } from '@/app/data/sportsData';
import SEO, { getFAQJsonLd, getBreadcrumbJsonLd, getOrganizationJsonLd } from '@/app/components/SEO';

interface FAQItem {
  question: string;
  answer: string;
}

const HelpCenter: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [activeSport, setActiveSport] = useState<Sport>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const faqs: FAQItem[] = [
    {
      question: "How do I create an account?",
      answer: "To create an account, click the 'Sign Up' button in the header and fill in your email and password. You'll receive a confirmation email to verify your account."
    },
    {
      question: "How do I subscribe to score alerts?",
      answer: "Once logged in, navigate to your preferences and select your favorite teams and leagues. You'll receive notifications for live scores, match updates, and important events."
    },
    {
      question: "Is ScoreHub free to use?",
      answer: "ScoreHub offers a free tier with basic score tracking and statistics. Premium features are available through our subscription plans for advanced analytics and predictions."
    },
    {
      question: "How often are scores updated?",
      answer: "Live scores are updated in real-time during matches. We refresh data every few seconds to ensure you have the most current information."
    },
    {
      question: "Can I customize which sports I see?",
      answer: "Yes! In your settings, you can select your preferred sports and leagues. Your dashboard will display only the content you're interested in."
    },
    {
      question: "How do I reset my password?",
      answer: "Click 'Forgot Password' on the login page. Enter your email address, and we'll send you instructions to reset your password."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and other popular payment methods. Your payment information is encrypted and secure."
    },
    {
      question: "How can I cancel my subscription?",
      answer: "You can cancel your subscription anytime from your account settings under 'Subscription Management'. Your access will continue until the end of your billing period."
    },
    {
      question: "Why isn't my team showing in the app?",
      answer: "We cover hundreds of teams and leagues worldwide. If your team is missing, you can suggest it through our feedback form, and we'll work on adding it."
    },
    {
      question: "How do I report a technical issue?",
      answer: "If you encounter a bug or technical issue, please contact us at support@scorehub.com with details about what happened. We'll investigate and get back to you as soon as possible."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <SEO pageKey="help" jsonLd={[getOrganizationJsonLd(), getBreadcrumbJsonLd([{ label: 'Home', href: '/' }, { label: 'Help Center', href: '/help' }]), getFAQJsonLd(faqs)]} />
      <Header activeSport={activeSport} onSportChange={setActiveSport} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-4xl font-black text-white mb-4">Help Center</h1>
        <p className="text-gray-400 mb-8">Find answers to common questions about ScoreHub</p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-colors"
            >
              <button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="font-semibold text-white">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedIndex === index && (
                <div className="px-6 py-4 border-t border-white/10 bg-white/2.5">
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-[#00d4ff]/10 to-[#0066ff]/10 border border-[#00d4ff]/20 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Still need help?</h2>
          <p className="text-gray-400 mb-6">
            If you couldn't find the answer you're looking for, our support team is here to help. Reach out to us through any of these channels:
          </p>
          <div className="space-y-3">
            <p className="text-gray-300">
              <span className="font-semibold text-white">Email:</span> support@scorehub.com
            </p>
            <p className="text-gray-300">
              <span className="font-semibold text-white">Response Time:</span> We aim to respond within 24 business hours
            </p>
            <p className="text-gray-300">
              <span className="font-semibold text-white">Availability:</span> Monday to Friday, 9 AM - 6 PM EST
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HelpCenter;
