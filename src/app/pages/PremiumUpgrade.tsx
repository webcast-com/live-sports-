import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Card, CardContent } from '../components/ui';
import { Check, Crown, Zap, ShieldCheck, CreditCard, ExternalLink, RefreshCw, Lock, Clock, Loader2, Star, Sparkles, TrendingUp, AlertCircle, Radio } from 'lucide-react';
import SEO from '@/app/components/SEO';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_live_d4e12fc3d689e19440973a66eaa985fcfdf1a7cc';
const PLAN = { code: 'KES', symbol: 'KSh', amount: 100, amountInKobo: 10000 };

export function PremiumUpgrade({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { user, upgrade, planLoading, refreshPlan } = useAuth();
  const [loadingPaystack, setLoadingPaystack] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<{ status: 'success' | 'pending' | 'failed' | null; reference?: string; message?: string }>({ status: null });
  const [customPhone, setCustomPhone] = useState('+254701234567');

  useEffect(() => {
    if (window.PaystackPop) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      if (window.PaystackPop) setScriptLoaded(true);
      else setScriptError('PaystackPop not available after script load');
    };
    script.onerror = () => setScriptError('Paystack script failed to load. Check ad blocker/network.');
    document.head.appendChild(script);
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  // Poll for plan upgrade when pending (realtime should also trigger, but polling as fallback)
  useEffect(() => {
    if (paymentStatus.status !== 'pending') return;
    const interval = setInterval(() => {
      refreshPlan();
    }, 3000);
    return () => clearInterval(interval);
  }, [paymentStatus.status, refreshPlan]);

  if (planLoading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Checking your plan...</span>
      </div>
    );
  }

  if (user?.plan === 'premium') {
    return (
      <div className="max-w-3xl mx-auto text-center py-12 space-y-6">
        <SEO pageKey="premium" />
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
          <Crown className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Premium Active! 🎉</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">Your daily pass is live for the next 24 hours. Enjoy unlimited access to all premium predictions, live API feeds, expert picks, and global leagues.</p>

        {paymentStatus.reference && (
          <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-left max-w-lg mx-auto">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-base">
                <ShieldCheck className="w-5 h-5" /> <span>Paystack Payment Verified Successfully</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 font-mono bg-white dark:bg-slate-900 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                <div><span className="font-semibold text-slate-500">Reference:</span> {paymentStatus.reference}</div>
                <div><span className="font-semibold text-slate-500">Status:</span> {paymentStatus.status || 'success'}</div>
                <div><span className="font-semibold text-slate-500">Amount Paid:</span> KSh 100</div>
                <div><span className="font-semibold text-slate-500">Access:</span> 24 Hours</div>
                <div><span className="font-semibold text-slate-500">Account:</span> {user?.email}</div>
                {user?.plan_expires_at && <div><span className="font-semibold text-slate-500">Expires:</span> {new Date(user.plan_expires_at).toLocaleString()}</div>}
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">A receipt has been sent to your email. Secured via webhook verification + realtime.</p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={() => setActiveTab('predictions')} size="lg" className="shadow-lg">View Live Premium Picks</Button>
        </div>
      </div>
    );
  }

  const handlePaystackCheckout = () => {
    if (!window.PaystackPop) {
      alert(`Payment gateway unavailable: ${scriptError || 'not loaded'}\nDisable ad blockers and try again.`);
      return;
    }
    if (!PAYSTACK_KEY || (!PAYSTACK_KEY.includes('pk_test') && !PAYSTACK_KEY.includes('pk_live'))) {
      alert('Payment gateway not properly configured.');
      return;
    }
    setLoadingPaystack(true);
    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: user?.email || 'customer@footypredict.ai',
        amount: PLAN.amountInKobo,
        currency: PLAN.code,
        ref: 'FP_DAY_' + Math.floor(Math.random() * 1000000000 + 1),
        metadata: {
          custom_fields: [
            { display_name: 'Member Name', variable_name: 'member_name', value: user?.name || 'ScoreHub Member' },
            { display_name: 'Mobile Number', variable_name: 'mobile_number', value: customPhone },
            { display_name: 'Plan', variable_name: 'plan', value: 'Daily Premium Pass' },
          ],
          user_id: user?.id,
          plan_name: 'Premium Plan',
        },
        callback: async (response: any) => {
          console.log('✓ Payment callback reference:', response.reference);
          setLoadingPaystack(true);
          try {
            const result = await upgrade(response.reference || response.ref || 'paystack-unknown');
            setPaymentStatus({ status: result.status as any, reference: response.reference, message: result.message });
            if (result.status === 'success') {
              setLoadingPaystack(false);
            } else if (result.status === 'pending') {
              // Keep loading false but show pending UI, polling will upgrade via realtime
              setLoadingPaystack(false);
            } else {
              setLoadingPaystack(false);
            }
          } catch (err: any) {
            console.error('Upgrade failed', err);
            setPaymentStatus({ status: 'failed', reference: response.reference, message: err.message });
            setLoadingPaystack(false);
          }
        },
        onClose: () => setLoadingPaystack(false),
      });
      if (!handler?.openIframe) throw new Error('Paystack handler init failed');
      handler.openIframe();
    } catch (err) {
      console.error('Paystack init error', err);
      setLoadingPaystack(false);
      alert(`Payment error: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  const simulateSuccess = async () => {
    const mockRef = 'FP_DAY_SIM_' + Math.floor(Math.random() * 1000000000 + 1);
    setLoadingPaystack(true);
    try {
      const result = await upgrade(mockRef);
      setPaymentStatus({ status: result.status as any, reference: mockRef, message: result.message });
    } catch (err: any) {
      setPaymentStatus({ status: 'failed', reference: mockRef, message: err.message });
    } finally {
      setLoadingPaystack(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-12">
      <SEO pageKey="premium" />
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-4 py-1.5 rounded-full text-sm font-semibold">
          <ShieldCheck className="w-4 h-4" /> Official Paystack Gateway — Kenya · Phase 3 Secure (Webhook + Realtime)
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Unlock Premium Access</h1>
          <p className="text-xl text-white max-w-2xl mx-auto leading-relaxed">Get instant access to unlimited expert predictions for just <span className="font-bold" style={{ color: 'rgb(35, 223, 57)' }}>KSh 100</span>.</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-medium"><Star className="w-4 h-4 text-amber-300 fill-amber-300" /><span className="text-amber-300">Trusted by 500+ users</span></div>
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5 text-xs font-medium"><TrendingUp className="w-4 h-4 text-lime-400" /><span className="text-lime-400">24-hour access</span></div>
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5 text-xs font-medium"><Lock className="w-4 h-4 text-cyan-400" /><span className="text-white">100% Secure · Webhook Verified</span></div>
        </div>
      </div>

      {paymentStatus.status && (
        <Card className={`max-w-4xl mx-auto border ${paymentStatus.status === 'success' ? 'bg-emerald-50 border-emerald-200' : paymentStatus.status === 'pending' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
          <CardContent className="p-4 flex items-start gap-3">
            {paymentStatus.status === 'success' ? <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" /> : paymentStatus.status === 'pending' ? <Clock className="w-5 h-5 text-amber-600 mt-0.5 animate-pulse" /> : <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />}
            <div className="flex-1">
              <p className={`font-semibold text-sm ${paymentStatus.status === 'success' ? 'text-emerald-800' : paymentStatus.status === 'pending' ? 'text-amber-800' : 'text-red-800'}`}>
                {paymentStatus.status === 'success' ? 'Payment Verified!' : paymentStatus.status === 'pending' ? 'Payment Pending Verification...' : 'Payment Failed'}
              </p>
              <p className="text-xs text-slate-600 mt-1">{paymentStatus.message}</p>
              {paymentStatus.reference && <p className="text-xs font-mono mt-1">Ref: {paymentStatus.reference}</p>}
              {paymentStatus.status === 'pending' && (
                <p className="text-xs text-amber-700 mt-2 flex items-center gap-1.5"><Radio className="w-3 h-3 animate-pulse" /> Paystack webhook will auto-upgrade via realtime. If not upgraded in 30s, refresh page or contact support.</p>
              )}
            </div>
            {paymentStatus.status === 'pending' && (
              <Button size="sm" variant="outline" onClick={refreshPlan} className="shrink-0">
                <RefreshCw className="w-3 h-3 mr-1" /> Refresh
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="flex flex-col opacity-80 hover:opacity-100 transition-opacity">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Free Tier</h3>
            <div className="mt-4"><span className="text-4xl font-extrabold text-slate-900 dark:text-white">KSh 0</span></div>
            <p className="mt-2 text-sm">Limited daily picks.</p>
          </div>
          <CardContent className="flex-1 flex flex-col justify-between pt-6">
            <ul className="space-y-4 mb-8">
              {['2 Basic Predictions daily', 'Standard Leagues only', 'Basic odds display', 'Community forum access', 'Historical results view'].map((f, i) => (
                <li key={i} className="flex items-start text-sm"><Check className="w-4 h-4 text-slate-400 shrink-0 mr-3 mt-0.5" /><span className="text-slate-600 dark:text-slate-300">{f}</span></li>
              ))}
            </ul>
            <Button variant="outline" className="w-full h-11 font-semibold" disabled>Your Current Plan</Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col border-emerald-500/50 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-black px-4 py-1 rounded-bl-lg uppercase tracking-wider shadow">🔥 Best Value</div>
          <div className="p-6 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/10 dark:to-teal-900/10 border-b border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 mb-1"><Crown className="w-5 h-5" /><h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-400">Premium Daily Pass</h3></div>
            <div className="mt-2 flex items-baseline gap-2"><span className="text-4xl font-black text-slate-900 dark:text-white">KSh {PLAN.amount}</span><span className="text-slate-500 font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> / 24 hours</span></div>
            <p className="text-xs text-slate-500 mt-1">One-time payment. No subscription. Expires after 24h. Secured via Paystack webhook + Supabase Realtime (Phase 3).</p>
          </div>
          <CardContent className="flex-1 flex flex-col pt-6 space-y-6">
            <div className="space-y-4 flex-1">
              <div className="grid grid-cols-1 gap-3">
                {['Unlimited Live RapidAPI Feed Picks', 'All Global Leagues & Federations', 'Advanced Market Filtering (BTTS, Over/Under)', 'Detailed Expert Rationale per Pick', 'Live Alerts & Priority SMS Updates', 'Access to Exclusive Leaderboard Rankings'].map((text, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-800/30">
                    <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" /><span className="text-sm font-medium">{text}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-emerald-200/50 rounded-lg p-4 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm"><Sparkles className="w-4 h-4" /><span>Valid for 24 Hours • No Auto-Renewal • Realtime Upgrade</span></div>
              </div>
            </div>

            <div className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-700 border-b pb-2"><span className="flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-emerald-600" /> Paystack Checkout</span><span className="text-emerald-600 flex items-center gap-1"><Lock className="w-3 h-3" /> Secure 256-bit SSL</span></div>
              <div className="space-y-3 pt-1">
                <div><label className="block text-[11px] font-semibold uppercase mb-1">Account Email</label><input type="text" disabled value={user?.email || 'customer@footypredict.ai'} className="w-full rounded-lg border bg-slate-100 px-3 py-1.5 text-slate-600 text-xs cursor-not-allowed" /></div>
                <div><label className="block text-[11px] font-semibold uppercase mb-1">Mobile Phone (For Alerts)</label><input type="text" value={customPhone} onChange={(e) => setCustomPhone(e.target.value)} className="w-full rounded-lg border bg-white px-3 py-1.5 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-xs" placeholder="+254 701 234 567" /></div>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-between gap-1 text-[11px] font-medium"><span>Accepted:</span><span className="font-semibold">💳 Card · 🏦 Transfer · 📱 M-Pesa</span></div>
            </div>

            <div className="space-y-3 pt-2">
              {scriptError && <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg"><p className="text-xs text-amber-800"><span className="font-semibold">⚠️ Gateway Issue:</span> {scriptError}</p></div>}
              <Button variant="premium" className="w-full text-base h-13 flex items-center justify-center gap-2 shadow-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50" onClick={handlePaystackCheckout} disabled={loadingPaystack}>
                {loadingPaystack ? <><RefreshCw className="w-5 h-5 animate-spin" /> Processing...</> : !scriptLoaded && !scriptError ? <><RefreshCw className="w-5 h-5 animate-spin" /> Loading Gateway...</> : <><Sparkles className="w-5 h-5" /> Unlock Premium Now <ExternalLink className="w-4 h-4 ml-1 opacity-80" /></>}
              </Button>
              <div className="relative py-3"><div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div><div className="relative flex justify-center text-[11px]"><span className="px-2 bg-white dark:bg-slate-800 text-slate-500">Testing Only</span></div></div>
              <Button variant="outline" className="w-full text-xs h-10 text-emerald-600 border-emerald-500/50" onClick={simulateSuccess}><Sparkles className="w-4 h-4 mr-1.5 text-amber-500" /> Simulate Success for Testing (Phase 3 secure)</Button>
              <p className="text-[11px] text-center font-medium">💳 Secure payment via Paystack • Realtime verified • No client spoof</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
