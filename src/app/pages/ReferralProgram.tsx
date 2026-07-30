import React, { useState } from 'react';
import { Gift, Share2, Copy, Users, Crown, Check, Trophy, Star, Clock, TrendingUp, Link2, Mail, MessageCircle } from 'lucide-react';
import { useReferral } from '@/app/hooks/useReferral';
import { useAuth } from '@/app/context/AuthContext';
import { Button, Card, CardContent } from '@/app/components/ui';
import SEO from '@/app/components/SEO';

export function ReferralProgram() {
  const { user } = useAuth();
  const { referralCode, stats, referrals, loading, copied, copyReferralLink, shareReferral, applyReferral, isApplying } = useReferral();
  const [manualCode, setManualCode] = useState('');
  const [applyStatus, setApplyStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const handleApplyCode = async () => {
    if (!manualCode.trim()) return;
    try {
      const result = await applyReferral(manualCode.trim().toUpperCase());
      setApplyStatus({ type: 'success', message: 'Referral code applied! You earned 3 days premium.' });
      setManualCode('');
    } catch (err: any) {
      setApplyStatus({ type: 'error', message: err.message || 'Failed to apply referral code' });
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <Gift className="w-16 h-16 text-amber-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Referral Program</h1>
        <p className="text-gray-400">Please sign in to access your referral code and earn rewards</p>
      </div>
    );
  }

  const referralLink = referralCode ? `${window.location.origin}/?ref=${referralCode.code}` : '';

  return (
    <div className="w-full max-w-5xl min-w-0 mx-auto space-y-8">
      <SEO pageKey="referral" title="Referral Program - Earn Premium Days | ScoreHub" description="Refer friends to ScoreHub and earn 3 days premium for each friend who joins. Share your referral code and grow the community." />

      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-sm font-semibold">
          <Gift className="w-4 h-4" /> Phase 5 - Referral Program
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Invite Friends, Earn Premium</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">Share ScoreHub with friends. For each friend who signs up using your link, you both get <span className="text-amber-400 font-bold">3 days of premium free</span>!</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-500">Loading referral data...</div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2"><Users className="w-5 h-5 text-amber-400" /><span className="text-sm text-gray-400 uppercase">Total Referrals</span></div>
                <p className="text-3xl font-black text-white">{stats?.total_referrals || 0}</p>
                <p className="text-xs text-gray-500 mt-1">{stats?.completed_referrals || 0} completed</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2"><Clock className="w-5 h-5 text-emerald-400" /><span className="text-sm text-gray-400 uppercase">Days Earned</span></div>
                <p className="text-3xl font-black text-white">{stats?.total_days_earned || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Premium days from referrals</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#00d4ff]/10 to-[#0066ff]/10 border-[#00d4ff]/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2"><Trophy className="w-5 h-5 text-[#00d4ff]" /><span className="text-sm text-gray-400 uppercase">Your Code</span></div>
                <p className="text-2xl font-black text-white font-mono">{referralCode?.code || 'Loading...'}</p>
                <p className="text-xs text-gray-500 mt-1">Share this code</p>
              </CardContent>
            </Card>
          </div>

          {/* Referral Link */}
          <Card className="border-[#00d4ff]/20">
            <CardContent className="p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Link2 className="w-5 h-5 text-[#00d4ff]" /> Your Referral Link</h3>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input type="text" value={referralLink} readOnly className="w-full min-w-0 flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none" />
                <Button onClick={copyReferralLink} variant={copied ? 'default' : 'outline'} className="w-full shrink-0 sm:w-auto">
                  {copied ? <><Check className="w-4 h-4 mr-1" /> Copied</> : <><Copy className="w-4 h-4 mr-1" /> Copy</>}
                </Button>
                <Button onClick={shareReferral} variant="premium" className="w-full shrink-0 sm:w-auto">
                  <Share2 className="w-4 h-4 mr-1" /> Share
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 mt-6 sm:grid-cols-3">
                <button onClick={() => { if (referralCode) window.open(`https://wa.me/?text=${encodeURIComponent(`Join me on ScoreHub! Use my code ${referralCode.code} ${referralLink}`)}`, '_blank'); }} className="flex flex-col items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-colors">
                  <MessageCircle className="w-6 h-6 text-green-400" /><span className="text-xs font-medium text-green-400">WhatsApp</span>
                </button>
                <button onClick={() => { if (referralCode) window.open(`mailto:?subject=Join me on ScoreHub&body=${encodeURIComponent(`Use my referral code ${referralCode.code}: ${referralLink}`)}`, '_blank'); }} className="flex flex-col items-center gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-colors">
                  <Mail className="w-6 h-6 text-blue-400" /><span className="text-xs font-medium text-blue-400">Email</span>
                </button>
                <button onClick={shareReferral} className="flex flex-col items-center gap-2 p-4 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-xl hover:bg-[#00d4ff]/20 transition-colors">
                  <Share2 className="w-6 h-6 text-[#00d4ff]" /><span className="text-xs font-medium text-[#00d4ff]">More</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* How it Works */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2"><Star className="w-5 h-5 text-amber-400" /> How it Works</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center mx-auto"><Share2 className="w-6 h-6 text-[#00d4ff]" /></div>
                  <h4 className="font-semibold text-white">1. Share Your Link</h4>
                  <p className="text-sm text-gray-500">Copy your referral link and share it with friends via WhatsApp, Email, or social media</p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto"><Users className="w-6 h-6 text-emerald-400" /></div>
                  <h4 className="font-semibold text-white">2. Friend Signs Up</h4>
                  <p className="text-sm text-gray-500">Your friend creates an account using your referral link or code</p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto"><Crown className="w-6 h-6 text-amber-400" /></div>
                  <h4 className="font-semibold text-white">3. Both Get Premium</h4>
                  <p className="text-sm text-gray-500">You both receive 3 days of premium access absolutely free!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Apply Referral Code */}
          <Card className="border-amber-500/20">
            <CardContent className="p-6">
              <h3 className="font-bold text-white mb-4">Have a Referral Code?</h3>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input type="text" value={manualCode} onChange={(e) => setManualCode(e.target.value.toUpperCase())} placeholder="Enter code e.g. SCORE-ABC123" className="w-full min-w-0 flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 font-mono" />
                <Button onClick={handleApplyCode} disabled={!manualCode.trim() || isApplying} variant="premium" className="w-full sm:w-auto">
                  {isApplying ? 'Applying...' : 'Apply Code'}
                </Button>
              </div>
              {applyStatus.type && (
                <div className={`mt-3 p-3 rounded-xl text-sm ${applyStatus.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                  {applyStatus.message}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referral History */}
          {referrals.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[#00d4ff]" /> Your Referrals ({referrals.length})</h3>
                <div className="space-y-3">
                  {referrals.map((ref: any) => (
                    <div key={ref.id} className="flex flex-col gap-3 p-3 bg-white/5 rounded-xl border border-white/5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-white text-sm font-medium font-mono">{ref.referral_code}</p>
                        <p className="text-gray-500 text-xs">{new Date(ref.created_at).toLocaleDateString()} · {ref.status}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-400 text-sm font-bold">+{ref.reward_days} days</p>
                        <p className={`text-[10px] px-2 py-0.5 rounded-full ${ref.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>{ref.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default ReferralProgram;
