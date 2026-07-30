import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreditCard, Send, CheckCircle, AlertCircle, Code } from 'lucide-react';

export function WebhookSimulator() {
  const { user, refreshPlan } = useAuth();
  const [reference, setReference] = useState(`paystack_${Date.now()}`);
  const [amount, setAmount] = useState('100');
  const [currency, setCurrency] = useState('KES');
  const [planName, setPlanName] = useState('Premium Plan');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!user) return null;

  const handleSimulateWebhook = async () => {
    setLoading(true);
    setResult(null);

    try {
      const webhookPayload = {
        event: 'charge.success',
        data: {
          id: Math.random(),
          reference,
          amount: Math.floor(parseFloat(amount) * 100),
          currency,
          status: 'success',
          metadata: {
            user_id: user.id,
            plan_name: planName,
          },
        },
      };

      const payloadStr = JSON.stringify(webhookPayload);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) throw new Error('Supabase URL not configured');

      const response = await fetch(
        `${supabaseUrl}/functions/v1/paystack-webhook`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-paystack-signature': 'test-signature',
          },
          body: payloadStr,
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        setResult({ success: true, message: 'Webhook processed successfully! Plan updated to premium for 24 hours.' });
        setTimeout(() => refreshPlan(), 1500);
      } else {
        setResult({ success: false, message: `Webhook failed: ${responseData.error || response.statusText}` });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Webhook Simulator</h1>
        <p className="text-slate-400 mt-1">Test the Paystack webhook integration with your account.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulator Form */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-blue-400" /> Payment Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Reference ID</label>
              <input
                type="text"
                value={reference}
                onChange={e => setReference(e.target.value)}
                className="w-full border border-slate-600 rounded-lg px-3 py-2 text-sm bg-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-xs"
              />
              <p className="text-xs text-slate-400 mt-1">Unique transaction reference</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full border border-slate-600 rounded-lg px-3 py-2 text-sm bg-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full border border-slate-600 rounded-lg px-3 py-2 text-sm bg-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option>KES</option>
                  <option>USD</option>
                  <option>GBP</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Plan Name</label>
              <input
                type="text"
                value={planName}
                onChange={e => setPlanName(e.target.value)}
                className="w-full border border-slate-600 rounded-lg px-3 py-2 text-sm bg-slate-700 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">Plan name for this transaction</p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSimulateWebhook}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" /> {loading ? 'Processing...' : 'Send Webhook'}
              </button>
            </div>
          </div>
        </div>

        {/* Current User & Status */}
        <div className="space-y-4">
          {/* User Info */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Current Account</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">User ID</p>
                <p className="text-white font-mono text-xs break-all">{user.id}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                <p className="text-white">{user.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Current Plan</p>
                <div className="flex items-center gap-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    user.plan === 'premium'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-slate-700 text-slate-300'
                  }`}>
                    {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                  </span>
                  {user.plan === 'premium' && user.plan_expires_at && (
                    <span className="text-xs text-slate-400">
                      Expires {new Date(user.plan_expires_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className={`rounded-lg p-4 border ${
              result.success
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className={`font-medium ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                    {result.success ? 'Success' : 'Error'}
                  </p>
                  <p className={`text-sm mt-1 ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                    {result.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* How it works */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-blue-400" /> How It Works
            </h3>
            <ol className="space-y-2 text-sm text-slate-300">
              <li>1. Enter payment details above</li>
              <li>2. Click "Send Webhook" to simulate a Paystack webhook</li>
              <li>3. The webhook verifies the signature and processes payment</li>
              <li>4. Your plan is upgraded to premium for 24 hours</li>
              <li>5. Payment is logged in the database</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
