import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, getEdgeFunctionUrl, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { PaystackRefSchema } from '@/app/services/validators';

export type Plan = 'free' | 'premium';

export interface UserPlan {
  plan: Plan;
  plan_expires_at: string | null;
}

export interface UserPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  favorite_teams: string[];
  favorite_leagues: string[];
  dark_mode: boolean;
  language: string;
}

export interface AuthUser extends User {
  plan: Plan;
  plan_expires_at: string | null;
  name?: string;
  country?: string;
  bio?: string;
  preferences?: UserPreferences;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  planLoading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (provider: 'google' | 'github' | 'facebook' | 'twitter') => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  upgrade: (paystackRef: string) => Promise<{ status: 'success' | 'pending' | 'failed'; message: string }>;
  refreshPlan: () => Promise<void>;
  updateProfile: (data: { name?: string; country?: string; bio?: string; preferences?: Partial<UserPreferences> }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Supabase helpers ──────────────────────────────────────────────────────────

async function fetchUserPlan(userId: string): Promise<UserPlan> {
  const { data, error } = await supabase
    .from('user_plans')
    .select('plan, plan_expires_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return { plan: 'free', plan_expires_at: null };

  // Auto-expire premium if past expiry
  if (data.plan === 'premium' && data.plan_expires_at) {
    if (new Date(data.plan_expires_at) < new Date()) {
      await supabase
        .from('user_plans')
        .update({ plan: 'free', plan_expires_at: null, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
      return { plan: 'free', plan_expires_at: null };
    }
  }

  return { plan: data.plan ?? 'free', plan_expires_at: data.plan_expires_at ?? null };
}

async function fetchUserPreferences(userId: string): Promise<UserPreferences | undefined> {
  const { data } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return data
    ? {
        email_notifications: data.email_notifications ?? true,
        push_notifications: data.push_notifications ?? true,
        sms_notifications: data.sms_notifications ?? false,
        favorite_teams: data.favorite_teams ?? [],
        favorite_leagues: data.favorite_leagues ?? [],
        dark_mode: data.dark_mode ?? false,
        language: data.language ?? 'en',
      }
    : undefined;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(false);
  const realtimeChannelRef = useRef<any>(null);

  const buildAuthUser = (u: User, planData: UserPlan, prefsData?: UserPreferences): AuthUser => ({
    ...u,
    plan: planData.plan,
    plan_expires_at: planData.plan_expires_at,
    name: u.user_metadata?.display_name || u.email?.split('@')[0],
    country: u.user_metadata?.country,
    bio: u.user_metadata?.bio,
    preferences: prefsData,
  });

  const loadPlan = useCallback(async (u: User) => {
    setPlanLoading(true);
    try {
      const [planData, prefsData] = await Promise.all([fetchUserPlan(u.id), fetchUserPreferences(u.id)]);
      setUser(buildAuthUser(u, planData, prefsData));
    } catch {
      setUser(buildAuthUser(u, { plan: 'free', plan_expires_at: null }));
    } finally {
      setPlanLoading(false);
    }
  }, []);

  // Realtime subscription for user_plans to auto-upgrade when webhook fires
  useEffect(() => {
    if (!user?.id) {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
      return;
    }

    // Subscribe to user_plans changes for this user
    const channel = supabase
      .channel(`user_plans-${user.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_plans', filter: `user_id=eq.${user.id}` }, async (payload) => {
        console.log('[Realtime] user_plans updated', payload.new);
        // Auto-refresh plan
        if (payload.new) {
          const newPlan = payload.new.plan as Plan;
          const expires = payload.new.plan_expires_at as string | null;
          setUser((prev) => (prev ? { ...prev, plan: newPlan, plan_expires_at: expires } : prev));
          // Also reload full plan to ensure consistency
          const freshUser = await supabase.auth.getUser().then(r => r.data.user);
          if (freshUser) await loadPlan(freshUser);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'payment_logs', filter: `user_id=eq.${user.id}` }, (payload) => {
        console.log('[Realtime] payment_logs updated', payload.new);
        if ((payload.new as any)?.status === 'success') {
          // Payment succeeded via webhook - refresh plan
          supabase.auth.getUser().then(({ data }) => {
            if (data.user) loadPlan(data.user);
          });
        }
      })
      .subscribe((status) => {
        if (import.meta.env.DEV) console.log(`[Realtime] user_plans channel status: ${status}`);
      });

    realtimeChannelRef.current = channel;

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [user?.id, loadPlan]);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          loadPlan(session.user).finally(() => setLoading(false));
        } else {
          setUser(null);
          setLoading(false);
        }
      })
      .catch(() => {
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        loadPlan(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadPlan]);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      return { error };
    } catch {
      return { error: { message: 'Unable to reach the authentication service. Please try again.' } as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch {
      return { error: { message: 'Unable to reach the authentication service. Please try again.' } as AuthError };
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'github' | 'facebook' | 'twitter') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: provider === 'google' ? 'consent' : undefined,
          },
        },
      });
      return { error };
    } catch {
      return { error: { message: `Unable to sign in with ${provider}. Please try again.` } as AuthError };
    }
  };

  const signInWithGoogle = async () => {
    return signInWithOAuth('google');
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      setSession(null);
      setUser(null);
    }
  };

  // Phase 3: Secure upgrade flow - pending + verify via edge function + webhook
  const upgrade = async (paystackRef: string): Promise<{ status: 'success' | 'pending' | 'failed'; message: string }> => {
    if (!user) throw new Error('Not authenticated');

    // Validate reference format
    const refValidation = PaystackRefSchema.safeParse(paystackRef);
    if (!refValidation.success) {
      throw new Error('Invalid payment reference format');
    }

    // Step 1: Insert pending payment log (client can only insert pending, not success)
    const pendingExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { error: insertError } = await supabase.from('payment_logs').insert({
      user_id: user.id,
      provider: 'paystack',
      reference: paystackRef,
      plan: 'premium',
      amount: 100,
      currency: 'KES',
      status: 'pending',
      expires_at: pendingExpiresAt,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      // If duplicate reference (already exists), continue to verification
      if (insertError.code !== '23505') {
        console.warn('Failed to insert pending payment log', insertError.message);
        // Don't throw, continue to verification - log may already exist
      }
    }

    // Step 2: Try to verify via edge function verify-paystack
    try {
      const verifyUrl = getEdgeFunctionUrl('verify-paystack');
      const verifyRes = await fetch(verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ reference: paystackRef }),
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.status === 'success') {
        // Verified - refresh plan from DB (should now be premium via webhook or direct update)
        await loadPlan(user);
        // Optimistic local update as fallback
        setUser((u) => (u ? { ...u, plan: 'premium', plan_expires_at: verifyData.expires_at || pendingExpiresAt } : null));
        return { status: 'success', message: verifyData.message || 'Payment verified and premium activated' };
      }

      if (verifyData.status === 'pending') {
        // Payment pending webhook - tell user we're waiting for Paystack webhook
        return { status: 'pending', message: 'Payment received, waiting for Paystack webhook verification. Premium will activate automatically within seconds.' };
      }

      if (verifyData.status === 'failed') {
        return { status: 'failed', message: verifyData.message || 'Payment verification failed' };
      }

      // Unknown status - treat as pending, rely on webhook
      return { status: 'pending', message: 'Payment submitted, awaiting verification via webhook' };
    } catch (err: any) {
      console.error('Verification edge function failed, falling back to webhook wait', err);
      // Edge function may not be deployed - fallback to optimistic pending, rely on paystack-webhook
      return { status: 'pending', message: 'Payment logged, premium will activate via Paystack webhook shortly. If not, contact support with reference: ' + paystackRef };
    }
  };

  const refreshPlan = async () => {
    if (!user) return;
    await loadPlan(user);
  };

  const updateProfile = async (data: { name?: string; country?: string; bio?: string; preferences?: Partial<UserPreferences> }) => {
    if (!user) throw new Error('Not authenticated');

    const updates: any = {};
    if (data.name !== undefined) updates.display_name = data.name;
    if (data.country !== undefined) updates.country = data.country;
    if (data.bio !== undefined) updates.bio = data.bio;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.auth.updateUser({ data: updates });
      if (error) throw error;
    }

    if (data.preferences) {
      const prefsToUpdate = {
        user_id: user.id,
        ...(data.preferences.email_notifications !== undefined && { email_notifications: data.preferences.email_notifications }),
        ...(data.preferences.push_notifications !== undefined && { push_notifications: data.preferences.push_notifications }),
        ...(data.preferences.sms_notifications !== undefined && { sms_notifications: data.preferences.sms_notifications }),
        ...(data.preferences.favorite_teams !== undefined && { favorite_teams: data.preferences.favorite_teams }),
        ...(data.preferences.favorite_leagues !== undefined && { favorite_leagues: data.preferences.favorite_leagues }),
        ...(data.preferences.dark_mode !== undefined && { dark_mode: data.preferences.dark_mode }),
        ...(data.preferences.language !== undefined && { language: data.preferences.language }),
      };

      const { error } = await supabase.from('user_preferences').upsert(prefsToUpdate as any, { onConflict: 'user_id' });
      if (error) throw error;
    }

    await loadPlan(user);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, planLoading, signUp, signIn, signInWithGoogle, signInWithOAuth, signOut, upgrade, refreshPlan, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
