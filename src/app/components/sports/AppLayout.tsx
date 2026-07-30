import React, { useEffect, useMemo, useState, Suspense, lazy } from 'react';
import { useNavigate, useLocation, useSearchParams, useParams } from 'react-router';
import { LiveMatch, standings, Sport } from '@/app/data/sportsData';
import Header from './Header';
import Breadcrumb from './Breadcrumb';
import TabNavigation from './TabNavigation';
import HeroSection, { LiveMatchTicker } from './HeroSection';
import StatsBar from './StatsBar';
import QuickLinks from './QuickLinks';
import LiveScores from './LiveScores';
import FeaturedMatch from './FeaturedMatch';
import UpcomingMatches from './UpcomingMatches';
import TopScorers from './TopScorers';
import Standings from './Standings';
import NewsFeed from './NewsFeed';
import TransfersFeed from './TransfersFeed';
import Footer from './Footer';
import BackToTop from './BackToTop';
import { useScoreSimulator } from './ScoreSimulator';
import { Wifi, WifiOff, Loader2, Database, Radio, Crown, Sparkles, ArrowRight, Check, X, Activity, Zap } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { RecentResultsSlider } from '../RecentResultsSlider';
import { MainTab } from './TabNavigation';
import SEO, { getOrganizationJsonLd, getWebsiteJsonLd, getBreadcrumbJsonLd, getSportsEventJsonLd } from '@/app/components/SEO';
import { useActivityTracking } from '@/app/hooks/useActivityTracking';
import { useRealtimeScores } from '@/app/hooks/useRealtimeScores';

const PredictionsList = lazy(() => import('@/app/pages/PredictionsList').then(m => ({ default: m.PredictionsList })));
const PremiumUpgrade = lazy(() => import('@/app/pages/PremiumUpgrade').then(m => ({ default: m.PremiumUpgrade })));
const Settings = lazy(() => import('@/app/pages/Settings').then(m => ({ default: m.Settings })));
const SubscriptionManagement = lazy(() => import('@/app/pages/SubscriptionManagement').then(m => ({ default: m.SubscriptionManagement })));
const WebhookSimulator = lazy(() => import('@/app/pages/WebhookSimulator').then(m => ({ default: m.WebhookSimulator })));
const SlideResults = lazy(() => import('../SlideResults').then(m => ({ default: m.SlideResults })));
const SureBets = lazy(() => import('./SureBets').then(m => ({ default: m.SureBets })));
const AdminDashboard = lazy(() => import('@/app/pages/AdminDashboard').then(m => ({ default: m.default })));
const LeaderboardPage = lazy(() => import('@/app/pages/LeaderboardPage').then(m => ({ default: m.default })));
const ReferralProgram = lazy(() => import('@/app/pages/ReferralProgram').then(m => ({ default: m.ReferralProgram })));

const tabPaths: Record<MainTab, string> = {
  dashboard: '/',
  predictions: '/predictions',
  results: '/results',
  leaderboard: '/leaderboard',
  'sure-bets': '/sure-bets',
  premium: '/premium',
  settings: '/settings',
  subscription: '/subscription',
  webhook: '/webhook',
  admin: '/admin',
  referral: '/referral',
};

const pathToTab: Record<string, MainTab> = Object.fromEntries(Object.entries(tabPaths).map(([k, v]) => [v, k as MainTab])) as Record<string, MainTab>;
const validSports: Sport[] = ['all', 'football', 'basketball', 'soccer', 'baseball', 'tennis'];

function parseSport(value: string | null): Sport {
  if (value && (validSports as string[]).includes(value)) return value as Sport;
  return 'all';
}

const TabFallback: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 flex items-center justify-center">
    <div className="flex items-center gap-3 text-gray-400">
      <Loader2 className="w-5 h-5 animate-spin text-[#00d4ff]" /> Loading...
    </div>
  </div>
);

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const routeParams = useParams<{ sport?: string }>();
  const routeSport = routeParams.sport ? parseSport(routeParams.sport) : null;
  const sportFromQuery = parseSport(searchParams.get('sport'));
  const activeSport: Sport = routeSport || sportFromQuery;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<LiveMatch | null>(null);
  const [showPricingPopup, setShowPricingPopup] = useState(false);

  const activeTab: MainTab = useMemo(() => {
    if (location.pathname.startsWith('/sport/')) return 'dashboard';
    return pathToTab[location.pathname] || 'dashboard';
  }, [location.pathname]);

  // Phase 3: Activity tracking
  const { trackPageView, trackTabSwitch, trackSportFilter, trackMatchView } = useActivityTracking();

  useEffect(() => {
    trackPageView(location.pathname, { sport: activeSport, tab: activeTab });
  }, [location.pathname, activeSport, activeTab, trackPageView]);

  const setActiveSport = (sport: Sport) => {
    const prev = activeSport;
    const newParams = new URLSearchParams(searchParams);
    if (sport === 'all') {
      newParams.delete('sport');
      if (location.pathname.startsWith('/sport/')) {
        navigate({ pathname: '/', search: newParams.toString() ? `?${newParams.toString()}` : '' });
        trackSportFilter(sport, prev);
        return;
      }
    } else {
      newParams.set('sport', sport);
      if (sport !== 'all' && location.pathname === '/') {
        navigate({ pathname: `/sport/${sport}`, search: '' });
        trackSportFilter(sport, prev);
        return;
      }
    }
    setSearchParams(newParams, { replace: false });
    trackSportFilter(sport, prev);
  };

  const handleTabChange = (tab: MainTab) => {
    const prev = activeTab;
    const newParams = new URLSearchParams(searchParams);
    const targetPath = tabPaths[tab];
    navigate({ pathname: targetPath, search: newParams.toString() ? `?${newParams.toString()}` : '' });
    trackTabSwitch(prev, tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPage = (href: string) => {
    navigate(href);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMatchClick = (match: LiveMatch) => {
    setSelectedMatch(match);
    trackMatchView(match.id, match.homeTeam, match.awayTeam);
  };

  const { user, loading: authLoading } = useAuth();
  const { matches: baseMatches, source, loading, error, isFetching } = useScoreSimulator() as any;

  // Phase 3: Realtime layer on top of polling
  const { matches: simulatedMatches, isConnected: realtimeConnected, lastUpdate: realtimeLastUpdate } = useRealtimeScores(baseMatches);

  useEffect(() => {
    if (authLoading || user?.plan === 'premium') return;
    const popupTimer = window.setTimeout(() => setShowPricingPopup(true), 2000);
    return () => window.clearTimeout(popupTimer);
  }, [authLoading, user?.plan]);

  const breadcrumbItems = useMemo(() => {
    const base = [{ label: 'Home', href: '/' }];
    if (activeTab === 'dashboard') {
      base.push({ label: 'Dashboard', href: '/' });
      if (activeSport !== 'all') base.push({ label: activeSport.charAt(0).toUpperCase() + activeSport.slice(1), href: `/sport/${activeSport}` });
    } else {
      const labelMap: Record<MainTab, string> = {
        dashboard: 'Dashboard',
        predictions: 'Predictions',
        results: 'Results',
        leaderboard: 'Leaderboard',
        'sure-bets': 'Sure Bets',
        premium: 'Premium',
        settings: 'Settings',
        subscription: 'Subscription',
        webhook: 'Webhook',
        admin: 'Admin',
        referral: 'Referral',
      };
      base.push({ label: labelMap[activeTab], href: tabPaths[activeTab] });
    }
    return base;
  }, [activeTab, activeSport]);

  const jsonLd = useMemo(() => {
    const arr: any[] = [getOrganizationJsonLd(), getWebsiteJsonLd(), getBreadcrumbJsonLd(breadcrumbItems)];
    if (simulatedMatches && simulatedMatches.length > 0) {
      const events = simulatedMatches.slice(0, 3).map((m: LiveMatch) => getSportsEventJsonLd({ homeTeam: m.homeTeam, awayTeam: m.awayTeam, league: m.league, homeScore: m.homeScore, awayScore: m.awayScore, status: m.status }));
      arr.push(...events);
    }
    return arr;
  }, [breadcrumbItems, simulatedMatches]);

  const pageKey = activeTab === 'dashboard' ? (activeSport !== 'all' ? activeSport : 'home') : activeTab === 'sure-bets' ? 'sureBets' : activeTab;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <SEO pageKey={pageKey as any} jsonLd={jsonLd} />

      <Header activeSport={activeSport} onSportChange={setActiveSport} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Breadcrumb activeTab={activeTab} activeSport={activeSport} onNavigate={navigateToPage} />
      <TabNavigation activeTab={activeTab} onChange={handleTabChange} />

      {activeTab !== 'premium' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-2" aria-label="Premium predictions promotion">
          <div className="relative overflow-hidden rounded-2xl border border-[#00d4ff]/20 bg-gradient-to-r from-[#00d4ff]/10 via-[#161b22] to-[#00ff88]/10 px-5 py-4 sm:px-7 sm:py-5 shadow-lg shadow-[#00d4ff]/5">
            <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[#00ff88]/10 blur-3xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#00ff88] text-[#0d1117] shadow-lg shadow-[#00d4ff]/20">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <h2 className="text-base font-bold text-white sm:text-lg">Premium Predictions</h2>
                    <Sparkles className="h-4 w-4 text-[#00ff88]" />
                    {realtimeConnected && <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-[10px]"><Radio className="w-2.5 h-2.5 animate-pulse" /> Realtime</span>}
                  </div>
                  <p className="max-w-2xl text-sm text-gray-400">
                    Get expert picks, live API-powered predictions, and deeper match insights for just KSh 100.
                    {activeSport !== 'all' && <span className="text-[#00d4ff]"> · {activeSport} filtered</span>}
                    {realtimeLastUpdate && <span className="text-gray-500"> · Realtime last: {realtimeLastUpdate.toLocaleTimeString()}</span>}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => handleTabChange('premium')} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#00ff88] px-4 py-2.5 text-sm font-bold text-[#0d1117] shadow-lg shadow-[#00d4ff]/20 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                Unlock Premium <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      <Suspense fallback={<TabFallback />}>
        {activeTab === 'dashboard' && (
          <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
              <div className="flex items-center gap-2 text-xs flex-wrap">
                {loading ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400">
                    <Loader2 className="w-3 h-3 animate-spin" /> Fetching live data...
                  </span>
                ) : source === 'supabase-edge' ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400">
                    <Database className="w-3 h-3" /> Supabase Edge Function + Cache-Control 30s
                  </span>
                ) : source === 'api-live' ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400">
                    <Wifi className="w-3 h-3" /> Live API ({simulatedMatches.length}) {isFetching && '· fetching'} {realtimeConnected && <><Zap className="w-3 h-3 ml-1 text-green-300" /> Realtime ON</>}
                  </span>
                ) : source === 'fallback-demo' ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-full text-[#00d4ff]">
                    <Radio className="w-3 h-3" /> Demo Data ({simulatedMatches.length})
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400">
                    <Database className="w-3 h-3" /> {source}
                  </span>
                )}
                {error && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400">
                    <WifiOff className="w-3 h-3" /> {String(error).split(':')[0]}
                  </span>
                )}
                <span className="ml-auto flex items-center gap-2 text-gray-500">
                  <Activity className="w-3 h-3" /> TanStack Query + Zod + Realtime · Sport: {activeSport}
                </span>
              </div>
            </div>

            <RecentResultsSlider />
            <LiveMatchTicker matches={simulatedMatches} onMatchClick={handleMatchClick} />
            <HeroSection featuredMatches={simulatedMatches} onMatchClick={handleMatchClick} />
            <StatsBar />
            <QuickLinks onSportChange={setActiveSport} />
            <LiveScores matches={simulatedMatches} activeSport={activeSport} searchQuery={searchQuery} onMatchClick={handleMatchClick} />
            <UpcomingMatches />
            <TopScorers />
            <Standings standings={standings} />
            <TransfersFeed />
            <NewsFeed />
          </>
        )}

        {activeTab === 'predictions' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <PredictionsList setActiveTab={(t) => handleTabChange(t as MainTab)} />
          </div>
        )}
        {activeTab === 'results' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <SlideResults setActiveTab={(t) => handleTabChange(t as MainTab)} />
          </div>
        )}
        {activeTab === 'sure-bets' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <SureBets onUpgrade={() => handleTabChange('premium')} />
          </div>
        )}
        {activeTab === 'premium' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <PremiumUpgrade setActiveTab={(t) => handleTabChange(t as MainTab)} />
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <Settings />
          </div>
        )}
        {activeTab === 'subscription' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <SubscriptionManagement setActiveTab={(t) => handleTabChange(t as MainTab)} />
          </div>
        )}
        {activeTab === 'webhook' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <WebhookSimulator />
          </div>
        )}
        {activeTab === 'leaderboard' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <LeaderboardPage />
          </div>
        )}
        {activeTab === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <AdminDashboard />
          </div>
        )}
        {activeTab === 'referral' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <ReferralProgram />
          </div>
        )}
      </Suspense>

      <FeaturedMatch match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      <Footer onNavigate={navigateToPage} />
      <BackToTop />

      {showPricingPopup && user?.plan !== 'premium' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="pricing-popup-title">
          <div className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-gray-800 shadow-[0_24px_40px_-12px_rgba(139,92,246,0.25)] transition-transform duration-300 hover:-translate-y-2">
            <button type="button" onClick={() => setShowPricingPopup(false)} aria-label="Close premium offer" className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
            <span className="inline-block rounded-full bg-gradient-to-br from-violet-500 to-pink-500 px-2.5 py-1 text-[10px] font-bold tracking-widest text-white">PRO</span>
            <h2 id="pricing-popup-title" className="mt-3 text-4xl font-extrabold leading-none text-gray-900">
              KSh 100<span className="ml-1 text-sm font-medium text-gray-500">/ unlimited predictions</span>
            </h2>
            <p className="mt-3 text-sm text-gray-500">Unlock the insight you need before the match starts.</p>
            <ul className="my-5 space-y-2 text-sm text-gray-600">
              {['Unlimited predictions', 'Live API-powered picks', 'Priority support'].map((feature) => (
                <li key={feature} className="flex items-center gap-2"><Check className="h-4 w-4 shrink-0 font-bold text-emerald-500" />{feature}</li>
              ))}
            </ul>
            <button type="button" onClick={() => { setShowPricingPopup(false); handleTabChange('premium'); }} className="w-full rounded-lg bg-gray-800 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gradient-to-br hover:from-violet-500 hover:to-pink-500">Choose Pro</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
