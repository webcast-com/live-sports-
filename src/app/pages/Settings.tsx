import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../hooks/useFavorites';
import { achievementDefinitions, useAchievements } from '../hooks/useAchievements';
import { useReferral } from '../hooks/useReferral';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { format } from 'date-fns';
import { User, Mail, Globe, FileText, Bell, Shield, Crown, Edit3, Save, X, Lock, Heart, Gift, Award, Languages, TrendingUp, Settings as SettingsIcon } from 'lucide-react';
import PredictionAccuracyChart from '../components/PredictionAccuracyChart';
import SEO from '../components/SEO';

export function Settings() {
  const { user, updateProfile } = useAuth();
  const { language, setLanguage, languages } = useLanguage();
  const { favorites } = useFavorites();
  const { achievements, progress } = useAchievements();
  const { referralCode, stats, copyReferralLink } = useReferral();
  const { permission, isSupported, isSubscribed, requestPermission, canNotify } = usePushNotifications();

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', country: user?.country || '', bio: user?.bio || '' });
  const [notifs, setNotifs] = useState(user?.preferences || { email_notifications: true, push_notifications: true, sms_notifications: false, favorite_teams: [], favorite_leagues: [], dark_mode: false, language: 'en' });

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ ...form, preferences: { email_notifications: notifs.email_notifications, push_notifications: notifs.push_notifications, sms_notifications: notifs.sms_notifications, language } });
      setEditMode(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ name: user.name || '', country: user.country || '', bio: user.bio || '' });
    setNotifs(user.preferences || { email_notifications: true, push_notifications: true, sms_notifications: false, favorite_teams: [], favorite_leagues: [], dark_mode: false, language: 'en' });
    setEditMode(false);
  };

  const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 max-w-5xl">
      <SEO pageKey="settings" title="Settings - ScoreHub" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><SettingsIcon className="w-6 h-6 text-[#00d4ff]" /> Settings</h1>
          <p className="text-slate-400 mt-1">Manage your account and preferences - Phase 5 enhanced.</p>
        </div>
        {!editMode ? (
          <button onClick={() => setEditMode(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"><Edit3 className="w-4 h-4" /> Edit Profile</button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"><Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}</button>
            <button onClick={handleCancel} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium"><X className="w-4 h-4" /> Cancel</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-[#161b22] rounded-xl p-6 border border-white/10">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">{initials}</div>
              <h2 className="text-lg font-bold text-white">{user.name}</h2>
              <p className="text-sm text-slate-400 mb-3">{user.email}</p>
              {user.plan === 'premium' ? <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-400 text-sm font-medium rounded-full border border-amber-500/30"><Crown className="w-3.5 h-3.5" /> Premium Member</span> : <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-700 text-slate-300 text-sm font-medium rounded-full">Free Tier</span>}
              {user.plan_expires_at && <p className="text-xs text-slate-400 mt-3">Premium until {format(new Date(user.plan_expires_at), 'MMM d, yyyy')}</p>}
              <div className="mt-4 flex gap-2 text-xs">
                <span className="px-2 py-1 bg-white/5 rounded-full text-gray-400">{favorites.length} favorites</span>
                <span className="px-2 py-1 bg-white/5 rounded-full text-gray-400">{achievements.length} achievements</span>
              </div>
            </div>
          </div>

          <div className="bg-[#161b22] rounded-xl p-6 border border-white/10">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4"><Award className="w-5 h-5 text-amber-400" /> Achievements · {progress.percentage}%</h3>
            <div className="space-y-3">
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: `${progress.percentage}%` }} /></div>
              <p className="text-xs text-gray-500">{progress.unlocked}/{progress.total} unlocked · {progress.points} points</p>
              <div className="grid grid-cols-4 gap-2 mt-3">
                {Object.values(achievementDefinitions).slice(0, 8).map((def: any) => {
                  const unlocked = achievements.some(a => a.achievement_type === def.type);
                  return <div key={def.type} title={`${def.title}: ${def.description}`} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border ${unlocked ? 'bg-amber-500/20 border-amber-500/30' : 'bg-white/5 border-white/5 opacity-50'}`}>{def.icon}</div>;
                })}
              </div>
            </div>
          </div>

          <div className="bg-[#161b22] rounded-xl p-6 border border-white/10">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4"><Gift className="w-5 h-5 text-amber-400" /> Referral</h3>
            <p className="text-sm text-gray-400 mb-3">Your code: <span className="font-mono font-bold text-white">{referralCode?.code || '...'}</span></p>
            <p className="text-xs text-gray-500 mb-3">{stats?.completed_referrals || 0} referrals · {stats?.total_days_earned || 0} days earned</p>
            <button onClick={copyReferralLink} className="w-full py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-500/20">Copy Referral Link</button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#161b22] rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><User className="w-5 h-5 text-blue-400" /> Personal Information</h3>
            <div className="space-y-4">
              <div><label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Full Name</label>{editMode ? <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-slate-600 rounded-lg px-3 py-2 text-sm bg-slate-700 text-white" /> : <p className="text-white font-medium">{user.name}</p>}</div>
              <div><label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Email</label><div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-500" /><p className="text-slate-300 text-sm">{user.email}</p></div></div>
              <div><label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Country</label>{editMode ? <input type="text" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} className="w-full border border-slate-600 rounded-lg px-3 py-2 text-sm bg-slate-700 text-white" /> : <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-slate-500" /><p className="text-slate-300">{form.country || 'Not set'}</p></div>}</div>
              <div><label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Bio</label>{editMode ? <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} className="w-full border border-slate-600 rounded-lg px-3 py-2 text-sm bg-slate-700 text-white resize-none" /> : <p className="text-slate-300 text-sm flex items-start gap-2"><FileText className="w-4 h-4 mt-0.5 text-slate-500 shrink-0" />{form.bio || 'No bio set'}</p>}</div>
            </div>
          </div>

          <div className="bg-[#161b22] rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><Languages className="w-5 h-5 text-[#00d4ff]" /> Language · Phase 5 (5 langs)</h3>
            <div className="grid grid-cols-5 gap-2">
              {languages.map((lang) => (
                <button key={lang.code} onClick={() => setLanguage(lang.code as any)} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-colors ${language === lang.code ? 'bg-[#00d4ff]/10 border-[#00d4ff]/30 text-[#00d4ff]' : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-400'}`}>
                  <span className="text-xl">{lang.flag}</span><span className="text-[10px] font-bold">{lang.code.toUpperCase()}</span><span className="text-[10px]">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#161b22] rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><Bell className="w-5 h-5 text-blue-400" /> Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { key: 'email_notifications' as const, label: 'Email Alerts', desc: 'Get updates sent to your email.' },
                { key: 'push_notifications' as const, label: 'Push Notifications', desc: `Browser push for favorite team goals. Permission: ${permission} · Supported: ${isSupported ? 'Yes' : 'No'} · Subscribed: ${isSubscribed ? 'Yes' : 'No'}` },
                { key: 'sms_notifications' as const, label: 'SMS Alerts', desc: 'Receive urgent updates via SMS.' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div><p className="text-sm font-medium text-slate-200">{item.label}</p><p className="text-xs text-slate-400">{item.desc}</p></div>
                  <button disabled={!editMode} onClick={() => editMode && setNotifs(n => ({ ...n, [item.key]: !n[item.key] }))} className={`relative w-12 h-6 rounded-full transition-colors ${notifs[item.key] ? 'bg-blue-600' : 'bg-slate-600'} ${!editMode ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${notifs[item.key] ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
              {isSupported && permission !== 'granted' && (
                <button onClick={requestPermission} className="w-full mt-2 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/20">Enable Push Notifications · Phase 4+</button>
              )}
              {canNotify && <p className="text-xs text-green-400 flex items-center gap-1"><Bell className="w-3 h-3" /> Push notifications enabled for {favorites.length} favorites</p>}
            </div>
          </div>

          <div className="bg-[#161b22] rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><Heart className="w-5 h-5 text-red-400" /> Favorites ({favorites.length})</h3>
            {favorites.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {favorites.map((fav: any) => (
                  <div key={fav.id} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white flex items-center gap-1.5"><span>{fav.team_name}</span><span className="text-gray-500">· {fav.league}</span></div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No favorites yet. Add teams from Popular Leagues on dashboard.</p>
            )}
          </div>

          <div className="bg-[#161b22] rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><TrendingUp className="w-5 h-5 text-emerald-400" /> Prediction Accuracy · Phase 5 Chart</h3>
            <PredictionAccuracyChart type="area" showConfidence />
          </div>

          <div className="bg-[#161b22] rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><Shield className="w-5 h-5 text-blue-400" /> Security</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-white/5"><div><p className="text-sm font-medium text-slate-200">Password</p><p className="text-xs text-slate-400">Change your account password</p></div><button className="px-3 py-1.5 text-sm font-medium text-blue-400">Change</button></div>
              <div className="flex items-center justify-between py-3"><div><p className="text-sm font-medium text-slate-200">Two-Factor Authentication</p><p className="text-xs text-slate-400">Add extra security</p></div><button className="px-3 py-1.5 text-sm font-medium text-blue-400">Enable</button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
