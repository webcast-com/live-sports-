import React, { useState, useEffect } from 'react';
import { Cookie, Shield, X, Settings, Check } from 'lucide-react';

type ConsentStatus = 'pending' | 'accepted' | 'rejected' | 'custom';

interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const defaultPreferences: ConsentPreferences = {
  necessary: true, // Always true
  analytics: false,
  marketing: false,
  preferences: false,
};

export const CookieConsent: React.FC = () => {
  const [status, setStatus] = useState<ConsentStatus>('pending');
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>(defaultPreferences);

  useEffect(() => {
    const savedConsent = localStorage.getItem('scorehub_cookie_consent');
    const savedPrefs = localStorage.getItem('scorehub_cookie_preferences');

    if (!savedConsent) {
      // Show banner after 1 second delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setStatus(savedConsent as ConsentStatus);
      if (savedPrefs) {
        try {
          setPreferences(JSON.parse(savedPrefs));
        } catch {}
      }
      // Initialize analytics based on consent
      if (savedConsent === 'accepted') {
        initializeAnalytics(true);
      }
    }
  }, []);

  const initializeAnalytics = (enabled: boolean) => {
    if (!enabled) return;

    // Initialize gtag / GTM only if consent given
    // For demo, we just log and set a flag
    if (typeof window !== 'undefined') {
      (window as any).analyticsConsent = true;
      console.log('[CookieConsent] Analytics enabled - would initialize gtag/GTM here');
      
      // Example GTM initialization (would be real in prod):
      // if (!document.querySelector('script[src*="googletagmanager"]')) {
      //   const script = document.createElement('script');
      //   script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXX';
      //   script.async = true;
      //   document.head.appendChild(script);
      // }
    }
  };

  const handleAcceptAll = () => {
    const allAccepted: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    localStorage.setItem('scorehub_cookie_consent', 'accepted');
    localStorage.setItem('scorehub_cookie_preferences', JSON.stringify(allAccepted));
    localStorage.setItem('scorehub_cookie_date', new Date().toISOString());
    setPreferences(allAccepted);
    setStatus('accepted');
    setShowBanner(false);
    initializeAnalytics(true);

    // Track consent
    if (typeof window !== 'undefined' && (window as any).supabase) {
      // Could track via user_activity table
    }
  };

  const handleRejectAll = () => {
    const rejected: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    localStorage.setItem('scorehub_cookie_consent', 'rejected');
    localStorage.setItem('scorehub_cookie_preferences', JSON.stringify(rejected));
    localStorage.setItem('scorehub_cookie_date', new Date().toISOString());
    setPreferences(rejected);
    setStatus('rejected');
    setShowBanner(false);
  };

  const handleSaveCustom = () => {
    const hasAny = preferences.analytics || preferences.marketing || preferences.preferences;
    localStorage.setItem('scorehub_cookie_consent', hasAny ? 'custom' : 'rejected');
    localStorage.setItem('scorehub_cookie_preferences', JSON.stringify(preferences));
    localStorage.setItem('scorehub_cookie_date', new Date().toISOString());
    setStatus(hasAny ? 'custom' : 'rejected');
    setShowBanner(false);
    setShowSettings(false);
    initializeAnalytics(preferences.analytics);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-4">
      <div className="max-w-4xl mx-auto bg-[#161b22] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
        {!showSettings ? (
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center shrink-0">
                <Cookie className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  We use cookies <span className="text-[10px] font-normal bg-white/10 px-2 py-0.5 rounded-full">Phase 5 GDPR</span>
                </h3>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  ScoreHub uses cookies to enhance your experience, analyze traffic, and personalize content. We respect your privacy and comply with GDPR.
                  Essential cookies are always enabled to ensure the site functions properly. You can manage your preferences.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <a href="/cookies" className="text-xs text-[#00d4ff] hover:underline">Cookie Policy</a>
                  <span className="text-gray-600">•</span>
                  <a href="/privacy" className="text-xs text-[#00d4ff] hover:underline">Privacy Policy</a>
                </div>
              </div>
              <button onClick={() => setShowBanner(false)} className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button onClick={handleRejectAll} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors">
                Reject All
              </button>
              <button onClick={() => setShowSettings(true)} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" /> Customize
              </button>
              <button onClick={handleAcceptAll} className="flex-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#00d4ff]/20 transition-all flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Accept All
              </button>
            </div>

            <p className="text-[11px] text-gray-600 mt-4 flex items-center gap-1.5">
              <Shield className="w-3 h-3" /> Your consent is stored locally and can be changed anytime in Settings. Essential cookies always active.
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold flex items-center gap-2"><Settings className="w-5 h-5 text-[#00d4ff]" /> Cookie Preferences</h3>
              <button onClick={() => setShowSettings(false)} className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {[
                { key: 'necessary' as const, title: 'Necessary', desc: 'Essential for site functionality. Always enabled.', required: true },
                { key: 'analytics' as const, title: 'Analytics', desc: 'Helps us understand how you use the site (e.g., gtag, page views, activity tracking).', required: false },
                { key: 'preferences' as const, title: 'Preferences', desc: 'Remembers your settings like language, favorite teams, dark mode.', required: false },
                { key: 'marketing' as const, title: 'Marketing', desc: 'Used for personalized ads and referral tracking.', required: false },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium flex items-center gap-2">
                      {item.title} {item.required && <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">Required</span>}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                  </div>
                  <button
                    disabled={item.required}
                    onClick={() => !item.required && setPreferences(p => ({ ...p, [item.key]: !p[item.key] }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${preferences[item.key] ? 'bg-[#00d4ff]' : 'bg-white/10'} ${item.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${preferences[item.key] ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowSettings(false)} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 flex-1">
                Back
              </button>
              <button onClick={handleSaveCustom} className="flex-1 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#00d4ff]/20">
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;
