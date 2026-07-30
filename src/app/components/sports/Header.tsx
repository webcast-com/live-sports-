import React, { useState, useRef, useEffect } from 'react';
import { Search, Menu, X, Bell, User, TrendingUp, LogOut, ChevronDown, Crown, Globe, Shield, Heart, Settings, Zap, Gift, Languages } from 'lucide-react';
import { Sport } from '@/app/data/sportsData';
import { useAuth } from '@/app/context/AuthContext';
import { useLanguage } from '@/app/context/LanguageContext';
import { usePushNotifications } from '@/app/hooks/usePushNotifications';
import { useSearch, SearchResult } from '@/app/hooks/useSearch';
import { useFavorites } from '@/app/hooks/useFavorites';
import { useNavigate } from 'react-router';
import AuthModal from './AuthModal';

interface HeaderProps {
  activeSport: Sport;
  onSportChange: (sport: Sport) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const sports: { key: Sport; label: string; swLabel: string }[] = [
  { key: 'all', label: 'All Sports', swLabel: 'Michezo Yote' },
  { key: 'football', label: 'Football', swLabel: 'Soka' },
  { key: 'basketball', label: 'Basketball', swLabel: 'Kikapu' },
  { key: 'soccer', label: 'Soccer', swLabel: 'Soka' },
  { key: 'baseball', label: 'Baseball', swLabel: 'Baseball' },
  { key: 'tennis', label: 'Tennis', swLabel: 'Tennis' },
];

const Header: React.FC<HeaderProps> = ({ activeSport, onSportChange, searchQuery, onSearchChange }) => {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t, languages } = useLanguage();
  const { permission, isSupported, isSubscribed, requestPermission, canNotify } = usePushNotifications();
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const displayName = user?.name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();
  const isPremium = user?.plan === 'premium';
  const expiresLabel = isPremium && user?.plan_expires_at ? `Premium until ${new Date(user.plan_expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : null;

  const { results: searchResults, hasResults } = useSearch({ query: searchQuery, maxResults: 6 });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearchResults(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
  };

  const handleSearchSelect = (result: SearchResult) => {
    setShowSearchResults(false);
    if (result.type === 'match') onSearchChange(result.title.split(' vs ')[0] || '');
    else if (result.type === 'team') {
      onSearchChange(result.title);
      document.getElementById('live-scores')?.scrollIntoView({ behavior: 'smooth' });
    } else if (result.type === 'league') {
      const sport = (result.data.sport as Sport) || 'all';
      onSportChange(sport);
    }
    onSearchChange('');
  };

  const handleNotificationToggle = async () => {
    if (!isSupported) {
      alert('Notifications not supported');
      return;
    }
    if (permission !== 'granted') {
      try {
        await requestPermission();
      } catch {
        alert('Please allow notifications in browser settings');
      }
    }
  };

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0d1117]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-2">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="relative shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center shadow-lg shadow-[#00d4ff]/20">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#00ff88] rounded-full animate-pulse border-2 border-[#0d1117]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight whitespace-nowrap">Score<span className="text-[#00d4ff]">Hub</span></h1>
                <p className="hidden sm:block text-[10px] -mt-0.5 tracking-widest uppercase text-[rgb(141,197,255)]">Live Sports · Phase 5</p>
              </div>
            </div>

            <div className="hidden md:flex items-center flex-1 max-w-md mx-8" ref={searchRef}>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder={t('nav.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => { onSearchChange(e.target.value); setShowSearchResults(true); }}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]/50 focus:bg-white/10 transition-all"
                />
                {hasResults && showSearchResults && (
                  <div className="absolute top-full mt-2 w-full bg-[#161b22] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                    <div className="p-2 text-[11px] text-gray-500 uppercase tracking-wider flex items-center gap-1"><Zap className="w-3 h-3" /> Fuse.js Search · {searchResults.length} results · Phase 5</div>
                    {searchResults.map((result) => (
                      <button key={result.id} onClick={() => handleSearchSelect(result)} className="w-full text-left px-3 py-2.5 hover:bg-white/5 flex items-center gap-3 transition-colors">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${result.type === 'match' ? 'bg-green-500/20 text-green-400' : result.type === 'team' ? 'bg-blue-500/20 text-blue-400' : result.type === 'league' ? 'bg-amber-500/20 text-amber-400' : 'bg-purple-500/20 text-purple-400'}`}>
                          {result.type === 'match' ? '⚽' : result.type === 'team' ? result.title.slice(0, 2).toUpperCase() : result.type === 'league' ? '🏆' : '📰'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{result.title}</p>
                          <p className="text-gray-500 text-xs truncate">{result.subtitle}</p>
                        </div>
                        <span className="text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">{result.type}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
              <button onClick={() => setSearchOpen(!searchOpen)} className="md:hidden p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 sm:p-2.5">
                <Search className="w-5 h-5" />
              </button>

              {/* Language dropdown - Phase 5: 5 languages */}
              <div className="relative" ref={langRef}>
                <button onClick={() => setLangMenuOpen(!langMenuOpen)} className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1 sm:p-2.5">
                  <Globe className="w-4 h-4" />
                  <span className="text-xs">{currentLang.flag}</span>
                  <span className="text-[10px] font-bold hidden sm:inline">{currentLang.code.toUpperCase()}</span>
                </button>
                {langMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#161b22] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-2 text-[11px] text-gray-500 uppercase tracking-wider flex items-center gap-1"><Languages className="w-3 h-3" /> Languages · Phase 5</div>
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code as any); setLangMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-white/5 transition-colors ${language === lang.code ? 'bg-[#00d4ff]/10 text-[#00d4ff]' : 'text-gray-400'}`}
                      >
                        <span>{lang.flag}</span>
                        <span className="text-sm">{lang.label}</span>
                        {language === lang.code && <span className="ml-auto w-2 h-2 bg-[#00d4ff] rounded-full" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={handleNotificationToggle} className={`relative hidden p-2.5 rounded-xl transition-all sm:block ${canNotify ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`} title={canNotify ? 'Notifications ON - Phase 5' : 'Enable notifications'}>
                <Bell className="w-5 h-5" />
                {favorites.length > 0 && !canNotify && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                {canNotify && <span className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
              </button>

              <button onClick={() => navigate('/referral')} className="hidden sm:flex p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all" title="Referral Program - Phase 5">
                <Gift className="w-5 h-5" />
              </button>

              {user && favorites.length > 0 && (
                <button onClick={() => navigate('/settings')} className="hidden sm:flex p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 relative">
                  <Heart className="w-5 h-5 text-red-400" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{favorites.length}</span>
                </button>
              )}

              {user ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className={`flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/10 border transition-all ${isPremium ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10'}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white ${isPremium ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-[#00d4ff] to-[#0066ff]'}`}>
                      {isPremium ? <Crown className="w-3.5 h-3.5" /> : initials}
                    </div>
                    <span className="hidden sm:block text-sm text-white max-w-[100px] truncate">{displayName}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-64 bg-[#161b22] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20">
                        <div className="px-4 py-3 border-b border-white/5">
                          <p className="text-sm font-medium text-white truncate">{displayName}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          {isPremium ? <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 rounded-full text-[10px] font-semibold text-amber-400"><Crown className="w-3 h-3" /> Premium Active</span> : <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-500">Free Plan</span>}
                          {expiresLabel && <p className="text-[10px] text-amber-400/70 mt-0.5">{expiresLabel}</p>}
                          {favorites.length > 0 && <p className="text-[10px] text-[#00d4ff] mt-1">{favorites.length} favorites · Push {isSubscribed ? 'ON' : 'OFF'}</p>}
                        </div>
                        <div className="p-1 space-y-1">
                          <button onClick={() => { setUserMenuOpen(false); navigate('/settings'); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10"><Settings className="w-4 h-4" /> Settings</button>
                          <button onClick={() => { setUserMenuOpen(false); navigate('/referral'); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10"><Gift className="w-4 h-4" /> Refer & Earn · Phase 5</button>
                          <button onClick={() => { setUserMenuOpen(false); navigate('/admin'); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10"><Shield className="w-4 h-4" /> Admin Dashboard</button>
                          <button onClick={handleSignOut} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10"><LogOut className="w-4 h-4" /> Sign Out</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button onClick={() => setAuthOpen(true)} className="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition-all shadow-lg shadow-[#00d4ff]/20 sm:px-3">
                  <User className="w-4 h-4" /><span className="hidden sm:inline">{t('nav.signIn')}</span>
                </button>
              )}

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 sm:p-2.5">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="md:hidden px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" placeholder={t('nav.search.placeholder')} value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} autoFocus className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]/50" />
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className={`${mobileMenuOpen ? 'flex flex-col gap-1 py-2' : 'hidden lg:flex'} items-start lg:items-center lg:flex-row gap-0 lg:gap-1`}>
            {sports.map((sport) => (
              <button key={sport.key} onClick={() => { onSportChange(sport.key); setMobileMenuOpen(false); }} className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap w-full lg:w-auto text-left ${activeSport === sport.key ? 'text-[#00d4ff] bg-[#00d4ff]/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                {t(`sport.${sport.key}`) !== `sport.${sport.key}` ? t(`sport.${sport.key}`) : language === 'sw' ? sport.swLabel : sport.label}
              </button>
            ))}
          </div>
        </div>
      </header>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Header;
