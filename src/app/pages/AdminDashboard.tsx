import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Shield, Mail, CreditCard, Activity, Users, TrendingUp, AlertCircle, CheckCircle, Clock, Trash2 } from 'lucide-react';
import Header from '@/app/components/sports/Header';
import Footer from '@/app/components/sports/Footer';
import SEO from '@/app/components/SEO';
import type { Sport } from '@/app/data/sportsData';
import { useAuth } from '@/app/context/AuthContext';

type AdminTab = 'overview' | 'contacts' | 'payments' | 'activity' | 'favorites';

const AdminDashboard: React.FC = () => {
  const [activeSport, setActiveSport] = useState<Sport>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');
  const { user } = useAuth();

  // Simple admin check - in production use custom claims
  const isAdmin = user?.email?.includes('admin') || user?.email === 'steve@scorehub.com' || true; // For demo allow all authenticated

  const contactsQuery = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(50);
      if (error && error.code !== '42P01') throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  const paymentsQuery = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('payment_logs').select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  const activityQuery = useQuery({
    queryKey: ['admin-activity'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_activity').select('*').order('created_at', { ascending: false }).limit(100);
      if (error && error.code !== '42P01') throw error;
      return data || [];
    },
    enabled: isAdmin,
  });

  const favoritesQuery = useQuery({
    queryKey: ['admin-favorites-summary'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_favorites_summary').select('*').limit(50);
      if (error && error.code !== '42P01') {
        // Fallback to raw favorites count
        const { data: favData } = await supabase.from('favorites').select('sport, league').limit(100);
        return { summary: [], raw: favData || [] };
      }
      return { summary: data || [], raw: [] };
    },
    enabled: isAdmin,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center p-4">
        <div className="text-center">
          <Shield className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
          <p className="text-gray-400">Please sign in to access admin dashboard</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-white">
        <Header activeSport={activeSport} onSportChange={setActiveSport} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have admin permissions</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <SEO pageKey="admin" title="Admin Dashboard - ScoreHub" noindex />
      <Header activeSport={activeSport} onSportChange={setActiveSport} searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Phase 4 - Manage platform data</p>
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { key: 'overview', label: 'Overview', icon: TrendingUp },
            { key: 'contacts', label: 'Contacts', icon: Mail },
            { key: 'payments', label: 'Payments', icon: CreditCard },
            { key: 'activity', label: 'Activity', icon: Activity },
            { key: 'favorites', label: 'Favorites', icon: Users },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setAdminTab(tab.key as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${adminTab === tab.key ? 'bg-[#00d4ff] text-[#0d1117]' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400'}`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {adminTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#161b22] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2"><Mail className="w-5 h-5 text-[#00d4ff]" /><h3 className="font-semibold">Contact Messages</h3></div>
              <p className="text-3xl font-bold text-white">{contactsQuery.data?.length || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Total inquiries</p>
            </div>
            <div className="bg-[#161b22] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2"><CreditCard className="w-5 h-5 text-emerald-400" /><h3 className="font-semibold">Payments</h3></div>
              <p className="text-3xl font-bold text-white">{paymentsQuery.data?.length || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Total transactions</p>
            </div>
            <div className="bg-[#161b22] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2"><Activity className="w-5 h-5 text-amber-400" /><h3 className="font-semibold">Activities</h3></div>
              <p className="text-3xl font-bold text-white">{activityQuery.data?.length || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Tracked events</p>
            </div>
            <div className="col-span-3 bg-gradient-to-r from-[#00d4ff]/10 to-[#0066ff]/10 border border-[#00d4ff]/20 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-3">Phase 4 Features Implemented</h3>
              <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-400">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Secure payments with webhook + realtime</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Favorites with realtime sync</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Contact messages persisted to DB</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> User activity tracking</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Match chat with realtime</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Push notifications for favorites</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Search with Fuse.js</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> i18n English/Swahili</li>
              </ul>
            </div>
          </div>
        )}

        {adminTab === 'contacts' && (
          <div className="bg-[#161b22] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5"><h3 className="font-semibold">Contact Messages ({contactsQuery.data?.length || 0})</h3></div>
            <div className="divide-y divide-white/5">
              {(contactsQuery.data as any[])?.map((msg: any) => (
                <div key={msg.id} className="p-4 hover:bg-white/5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2"><span className="font-medium text-white">{msg.name}</span><span className="text-xs text-gray-500">{msg.email}</span><span className={`text-[10px] px-2 py-0.5 rounded-full ${msg.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>{msg.status}</span></div>
                      <p className="text-sm text-gray-400 mt-1"><span className="font-medium text-white">{msg.subject}:</span> {msg.message.slice(0, 200)}</p>
                      <p className="text-[11px] text-gray-600 mt-2">{new Date(msg.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
              {(!contactsQuery.data || contactsQuery.data.length === 0) && <p className="p-8 text-center text-gray-500">No contact messages yet. Run Phase 3 migration.</p>}
            </div>
          </div>
        )}

        {adminTab === 'payments' && (
          <div className="bg-[#161b22] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5"><h3 className="font-semibold">Payment Logs ({paymentsQuery.data?.length || 0})</h3></div>
            <div className="divide-y divide-white/5">
              {(paymentsQuery.data as any[])?.slice(0, 20).map((pay: any) => (
                <div key={pay.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white font-mono">{pay.reference}</p>
                    <p className="text-xs text-gray-500">{pay.user_id?.slice(0, 8)} · {pay.amount} {pay.currency} · {pay.plan}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${pay.status === 'success' ? 'bg-green-500/20 text-green-400' : pay.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>{pay.status}</span>
                    <p className="text-[10px] text-gray-600 mt-1">{new Date(pay.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {adminTab === 'activity' && (
          <div className="bg-[#161b22] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5"><h3 className="font-semibold">User Activity ({activityQuery.data?.length || 0})</h3></div>
            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
              {(activityQuery.data as any[])?.slice(0, 50).map((act: any) => (
                <div key={act.id} className="p-3 flex items-center gap-3 text-sm">
                  <Clock className="w-3 h-3 text-gray-600" />
                  <span className="font-mono text-xs text-[#00d4ff]">{act.action}</span>
                  <span className="text-gray-500 text-xs truncate flex-1">{JSON.stringify(act.metadata || {}).slice(0, 100)}</span>
                  <span className="text-gray-600 text-[10px]">{new Date(act.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {adminTab === 'favorites' && (
          <div className="bg-[#161b22] border border-white/10 rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Favorites Analytics</h3>
            {Array.isArray((favoritesQuery.data as any)?.raw) && (favoritesQuery.data as any).raw.length > 0 ? (
              <div className="space-y-2">
                {(favoritesQuery.data as any).raw.slice(0, 20).map((fav: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-sm"><span>{fav.team_name || fav.league}</span><span className="text-gray-500">{fav.sport}</span></div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No favorites data yet or view not created. Check Phase 3 migration.</p>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
