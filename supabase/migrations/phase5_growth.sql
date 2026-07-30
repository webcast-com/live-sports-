-- Phase 5 Growth Migration
-- Referral system, enhanced analytics, push subscriptions

-- ============================================================================
-- 1. Referral Codes Table
-- ============================================================================
create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  is_active boolean not null default true
);

alter table public.referral_codes enable row level security;

drop policy if exists "Users read own referral codes" on public.referral_codes;
create policy "Users read own referral codes" on public.referral_codes for select using (auth.uid() = user_id);

drop policy if exists "Users insert own referral codes" on public.referral_codes;
create policy "Users insert own referral codes" on public.referral_codes for insert with check (auth.uid() = user_id);

drop policy if exists "Anyone can read active referral codes for validation" on public.referral_codes;
create policy "Anyone can read active referral codes for validation" on public.referral_codes for select using (is_active = true);

create index if not exists idx_referral_codes_user_id on public.referral_codes(user_id);
create index if not exists idx_referral_codes_code on public.referral_codes(code);

-- ============================================================================
-- 2. Referrals Table (tracks who referred whom)
-- ============================================================================
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references auth.users(id) on delete cascade,
  referred_id uuid not null references auth.users(id) on delete cascade,
  referral_code text not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'rewarded')),
  reward_days integer not null default 3,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(referred_id)
);

alter table public.referrals enable row level security;

drop policy if exists "Users read own referrals" on public.referrals;
create policy "Users read own referrals" on public.referrals for select using (auth.uid() = referrer_id or auth.uid() = referred_id);

drop policy if exists "Users insert referrals" on public.referrals;
create policy "Users insert referrals" on public.referrals for insert with check (auth.uid() = referred_id or auth.uid() = referrer_id or auth.uid() is null);

create index if not exists idx_referrals_referrer_id on public.referrals(referrer_id);
create index if not exists idx_referrals_referred_id on public.referrals(referred_id);
create index if not exists idx_referrals_code on public.referrals(referral_code);

-- ============================================================================
-- 3. Referral Earnings / Premium Days Tracking
-- ============================================================================
create table if not exists public.referral_earnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  referral_id uuid not null references public.referrals(id) on delete cascade,
  days_earned integer not null,
  created_at timestamptz not null default now()
);

alter table public.referral_earnings enable row level security;

drop policy if exists "Users read own earnings" on public.referral_earnings;
create policy "Users read own earnings" on public.referral_earnings for select using (auth.uid() = user_id);

create index if not exists idx_referral_earnings_user_id on public.referral_earnings(user_id);

-- ============================================================================
-- 4. Push Subscriptions Table (for background push via Web Push API / OneSignal)
-- ============================================================================
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh_key text not null,
  auth_key text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  is_active boolean not null default true,
  unique(user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Users manage own push subscriptions" on public.push_subscriptions;
create policy "Users manage own push subscriptions" on public.push_subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists idx_push_subscriptions_user_id on public.push_subscriptions(user_id);

-- ============================================================================
-- 5. User Achievements / Gamification
-- ============================================================================
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_type text not null check (achievement_type in ('first_prediction', 'accuracy_70', 'accuracy_80', 'streak_5', 'referral_3', 'favorites_5', 'chat_10', 'premium_first')),
  earned_at timestamptz not null default now(),
  metadata jsonb,
  unique(user_id, achievement_type)
);

alter table public.user_achievements enable row level security;

drop policy if exists "Users read own achievements" on public.user_achievements;
create policy "Users read own achievements" on public.user_achievements for select using (auth.uid() = user_id);

drop policy if exists "Users insert own achievements" on public.user_achievements;
create policy "Users insert own achievements" on public.user_achievements for insert with check (auth.uid() = user_id);

create index if not exists idx_user_achievements_user_id on public.user_achievements(user_id);

-- ============================================================================
-- 6. Enhance contact_messages with admin actions fields
-- ============================================================================
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='contact_messages' and column_name='replied_at') then
    alter table public.contact_messages add column replied_at timestamptz;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='contact_messages' and column_name='replied_by') then
    alter table public.contact_messages add column replied_by uuid references auth.users(id);
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='contact_messages' and column_name='admin_notes') then
    alter table public.contact_messages add column admin_notes text;
  end if;
end $$;

-- ============================================================================
-- 7. Function to generate/retrieve referral code for user
-- ============================================================================
create or replace function public.get_or_create_referral_code(p_user_id uuid)
returns text as $$
declare
  v_code text;
begin
  select code into v_code from public.referral_codes where user_id = p_user_id and is_active = true limit 1;
  if v_code is not null then
    return v_code;
  end if;

  -- Generate new code: SCORE-XXXXXX
  v_code := 'SCORE-' || upper(substr(md5(random()::text), 1, 6));

  -- Ensure uniqueness (retry if collision)
  while exists (select 1 from public.referral_codes where code = v_code) loop
    v_code := 'SCORE-' || upper(substr(md5(random()::text), 1, 6));
  end loop;

  insert into public.referral_codes (user_id, code) values (p_user_id, v_code);
  return v_code;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- 8. Function to handle referral completion and reward
-- ============================================================================
create or replace function public.complete_referral(p_referral_code text, p_referred_id uuid)
returns jsonb as $$
declare
  v_referrer_id uuid;
  v_referral_id uuid;
  v_existing record;
begin
  -- Check if referred user already has a referral
  select * into v_existing from public.referrals where referred_id = p_referred_id;
  if v_existing is not null then
    return jsonb_build_object('success', false, 'message', 'User already referred');
  end if;

  -- Find referrer by code
  select user_id into v_referrer_id from public.referral_codes where code = p_referral_code and is_active = true;
  if v_referrer_id is null then
    return jsonb_build_object('success', false, 'message', 'Invalid referral code');
  end if;

  if v_referrer_id = p_referred_id then
    return jsonb_build_object('success', false, 'message', 'Cannot refer yourself');
  end if;

  -- Create referral
  insert into public.referrals (referrer_id, referred_id, referral_code, status, reward_days)
  values (v_referrer_id, p_referred_id, p_referral_code, 'completed', 3)
  returning id into v_referral_id;

  -- Reward referrer with premium days (add to referral_earnings)
  insert into public.referral_earnings (user_id, referral_id, days_earned)
  values (v_referrer_id, v_referral_id, 3);

  -- Extend referrer's premium if they are premium, or give them 3 days
  -- This logic would extend plan_expires_at, but for simplicity we just record earning
  -- Actual extension can be done via edge function or trigger

  return jsonb_build_object('success', true, 'message', 'Referral completed, 3 days premium earned', 'referrer_id', v_referrer_id, 'referral_id', v_referral_id);
end;
$$ language plpgsql security definer;

-- ============================================================================
-- 9. View for referral stats
-- ============================================================================
create or replace view public.referral_stats as
select
  rc.user_id,
  rc.code,
  count(r.id) as total_referrals,
  count(case when r.status = 'completed' then 1 end) as completed_referrals,
  coalesce(sum(re.days_earned), 0) as total_days_earned,
  max(r.created_at) as last_referral_at
from public.referral_codes rc
left join public.referrals r on rc.user_id = r.referrer_id
left join public.referral_earnings re on rc.user_id = re.user_id
group by rc.user_id, rc.code;

grant select on public.referral_stats to anon, authenticated;
