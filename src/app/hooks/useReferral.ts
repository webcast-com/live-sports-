import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';

interface ReferralCode { code: string }
interface Referral { id: string; referral_code: string; created_at: string; status: string; reward_days: number }

export function useReferral() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const referralCode: ReferralCode | undefined = user ? { code: `SCORE-${user.id.slice(0, 6).toUpperCase()}` } : undefined;
  const stats = { total_referrals: referrals.length, completed_referrals: referrals.filter((referral) => referral.status === 'completed').length, total_days_earned: referrals.filter((referral) => referral.status === 'completed').reduce((total, referral) => total + referral.reward_days, 0) };

  useEffect(() => {
    setCopied(false);
    setReferrals([]);
  }, [user?.id]);

  const copyReferralLink = useCallback(async () => {
    if (!referralCode) return;
    await navigator.clipboard.writeText(`${window.location.origin}/?ref=${referralCode.code}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [referralCode]);

  const shareReferral = useCallback(async () => {
    if (!referralCode) return;
    const url = `${window.location.origin}/?ref=${referralCode.code}`;
    if (navigator.share) await navigator.share({ title: 'Join ScoreHub', text: `Use my code ${referralCode.code}`, url });
    else await navigator.clipboard.writeText(url);
  }, [referralCode]);

  const applyReferral = useCallback(async (code: string) => {
    if (!code || code === referralCode?.code) throw new Error('Enter a valid referral code');
    setIsApplying(true);
    try {
      setReferrals((current) => [...current, { id: crypto.randomUUID(), referral_code: code, created_at: new Date().toISOString(), status: 'completed', reward_days: 3 }]);
    } finally {
      setIsApplying(false);
    }
  }, [referralCode]);

  return { referralCode, stats, referrals, loading: false, copied, copyReferralLink, shareReferral, applyReferral, isApplying };
}
