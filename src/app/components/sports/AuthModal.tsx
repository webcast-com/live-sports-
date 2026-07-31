import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, TrendingUp, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { GoogleIcon } from './BrandIcons';
import { useAuth } from '@/app/context/AuthContext';

type Mode = 'signin' | 'signup' | 'forgot';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

function friendlyError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Incorrect email or password.';
  if (msg.includes('Email not confirmed')) return 'Please confirm your email before signing in. Check your inbox.';
  if (msg.includes('User already registered')) return 'An account with this email already exists. Try signing in.';
  if (msg.includes('Password should be')) return 'Password must be at least 6 characters.';
  if (msg.includes('Unable to validate email')) return 'Please enter a valid email address.';
  if (msg.includes('rate limit')) return 'Too many attempts. Please wait a moment and try again.';
  if (msg.includes('OAuth') || msg.includes('provider')) return 'Social login is not configured. Please use email/password or enable Google OAuth in Supabase dashboard.';
  return msg;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!open) return null;

  const reset = (nextMode?: Mode) => {
    setError(null);
    setSuccess(null);
    setLoading(false);
    setOauthLoading(null);
    if (nextMode) setMode(nextMode);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setOauthLoading('google');
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(friendlyError(error.message));
        setOauthLoading(null);
      }
      // On success, user will be redirected via OAuth, so no need to close modal - Supabase handles redirect
    } catch {
      setError('Unable to sign in with Google. Please try email/password.');
      setOauthLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signup') {
      const { error } = await signUp(email, password, displayName);
      setLoading(false);
      if (error) setError(friendlyError(error.message));
      else setSuccess('signup');
    } else if (mode === 'signin') {
      const { error } = await signIn(email, password);
      setLoading(false);
      if (error) setError(friendlyError(error.message));
      else {
        reset();
        onClose();
      }
    } else if (mode === 'forgot') {
      try {
        const { supabase: sb } = await import('@/lib/supabase');
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (error) setError(friendlyError(error.message));
        else setSuccess('forgot');
      } catch {
        setError('Unable to reach the authentication service. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (success === 'signup') {
    return (
      <ModalShell onClose={onClose}>
        <div className="text-center py-4">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Check your email</h3>
          <p className="text-sm text-gray-400 mb-6">
            We sent a confirmation link to <span className="text-[#00d4ff]">{email}</span>.<br />Click it to activate your account, then sign in.
          </p>
          <button onClick={() => reset('signin')} className="w-full py-2.5 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] text-sm font-medium hover:bg-[#00d4ff]/20 transition-all">Go to Sign In</button>
        </div>
      </ModalShell>
    );
  }

  if (success === 'forgot') {
    return (
      <ModalShell onClose={onClose}>
        <div className="text-center py-4">
          <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Reset link sent</h3>
          <p className="text-sm text-gray-400 mb-6">Check <span className="text-[#00d4ff]">{email}</span> for a password reset link.</p>
          <button onClick={() => reset('signin')} className="w-full py-2.5 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] text-sm font-medium hover:bg-[#00d4ff]/20 transition-all">Back to Sign In</button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      {mode !== 'forgot' && (
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-6">
          {(['signin', 'signup'] as const).map((m) => (
            <button key={m} onClick={() => reset(m)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? 'bg-[#00d4ff] text-[#0d1117]' : 'text-gray-400 hover:text-white'}`}>
              {m === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>
      )}

      {mode === 'forgot' && (
        <div className="mb-6">
          <button onClick={() => reset('signin')} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"><ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In</button>
          <h3 className="text-lg font-semibold text-white mt-3">Reset your password</h3>
          <p className="text-sm text-gray-400 mt-1">Enter your email and we'll send a reset link.</p>
        </div>
      )}

      {mode !== 'forgot' && (
        <>
          <button onClick={handleGoogleSignIn} disabled={!!oauthLoading} className="w-full py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-gray-100 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-4 border border-white/10">
            {oauthLoading === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon className="w-4 h-4" />}
            Continue with Google
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-xs"><span className="px-2 bg-[#161b22] text-gray-500">Or continue with email</span></div>
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <Field label="Display Name">
            <FieldIcon><User className="w-4 h-4 text-gray-500" /></FieldIcon>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className={inputCls} />
          </Field>
        )}

        <Field label="Email">
          <FieldIcon><Mail className="w-4 h-4 text-gray-500" /></FieldIcon>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className={inputCls} />
        </Field>

        {mode !== 'forgot' && (
          <Field label="Password">
            <FieldIcon><Lock className="w-4 h-4 text-gray-500" /></FieldIcon>
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'} required minLength={mode === 'signup' ? 6 : undefined} className={`${inputCls} pr-10`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </Field>
        )}

        {error && <div className="px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">{error}</div>}

        <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#00d4ff]/20 mt-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{mode === 'signin' ? 'Signing in…' : mode === 'signup' ? 'Creating account…' : 'Sending link…'}</> : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
        </button>
      </form>

      <div className="mt-5 space-y-2 text-center text-xs text-gray-500">
        {mode === 'signin' && (
          <>
            <p>Don't have an account? <button onClick={() => reset('signup')} className="text-[#00d4ff] hover:underline font-medium">Sign up</button></p>
            <p><button onClick={() => reset('forgot')} className="text-gray-400 hover:text-white hover:underline">Forgot password?</button></p>
            <p className="pt-3 text-[11px] text-gray-600">Phase 5: Google OAuth enabled - configure Google provider in Supabase Dashboard → Authentication → Providers → Google. Add authorized redirect URL.</p>
          </>
        )}
        {mode === 'signup' && <p>Already have an account? <button onClick={() => reset('signin')} className="text-[#00d4ff] hover:underline font-medium">Sign in</button></p>}
      </div>
    </ModalShell>
  );
}

const inputCls = 'w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]/50 focus:bg-white/8 transition-all';

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#161b22] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="h-1 w-full bg-gradient-to-r from-[#00d4ff] via-[#0066ff] to-[#00ff88]" />
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"><X className="w-4 h-4" /></button>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center shadow-lg shadow-[#00d4ff]/20"><TrendingUp className="w-5 h-5 text-white" /></div>
            <div><h1 className="text-xl font-bold text-white tracking-tight">Score<span className="text-[#00d4ff]">Hub</span></h1><p className="text-[10px] text-gray-500 -mt-0.5 tracking-widest uppercase">Live Sports · OAuth Ready</p></div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label><div className="relative">{children}</div></div>;
}
function FieldIcon({ children }: { children: React.ReactNode }) {
  return <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">{children}</span>;
}

