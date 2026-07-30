-- Run this once in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → paste & run

-- ============================================================================
-- 1. User Profiles Table (stores account information)
-- ============================================================================
create table if not exists public.user_profiles (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  first_name    text,
  last_name     text,
  email         text not null,
  phone         text,
  country       text,
  timezone      text,
  profile_image_url text,
  account_status text not null default 'active' check (account_status in ('active', 'suspended', 'deleted', 'pending_verification')),
  email_verified boolean default false,
  phone_verified boolean default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "Users read own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "Users update own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

-- ============================================================================
-- 2. User Preferences Table (customizable settings)
-- ============================================================================
create table if not exists public.user_preferences (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  email_notifications  boolean default true,
  push_notifications   boolean default true,
  sms_notifications    boolean default false,
  favorite_teams       text[] default array[]::text[],
  favorite_leagues     text[] default array[]::text[],
  dark_mode            boolean default false,
  language             text default 'en',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "Users read own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

-- ============================================================================
-- 3. User Plans Table (subscription and billing)
-- ============================================================================
create table if not exists public.user_plans (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  plan          text not null default 'free' check (plan in ('free', 'premium', 'pro')),
  plan_name     text,
  billing_cycle text default 'monthly' check (billing_cycle in ('monthly', 'yearly', 'one-time')),
  plan_started_at timestamptz not null default now(),
  plan_expires_at timestamptz,
  auto_renew    boolean default true,
  is_active     boolean default true,
  updated_at    timestamptz not null default now()
);

alter table public.user_plans enable row level security;

create policy "Users read own plan"
  on public.user_plans for select
  using (auth.uid() = user_id);

create policy "Users update own plan"
  on public.user_plans for update
  using (auth.uid() = user_id);

-- ============================================================================
-- 4. Payment Logs Table (audit trail for transactions)
-- ============================================================================
create table if not exists public.payment_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  provider      text not null default 'paystack',
  reference     text not null unique,
  plan          text not null,
  amount        integer not null,
  currency      text not null default 'KES',
  status        text not null default 'pending' check (status in ('pending', 'success', 'failed', 'refunded')),
  expires_at    timestamptz,
  metadata      jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.payment_logs enable row level security;

create policy "Users read own payments"
  on public.payment_logs for select
  using (auth.uid() = user_id);

create policy "Users insert own payments"
  on public.payment_logs for insert
  with check (auth.uid() = user_id);

-- ============================================================================
-- 5. Usage Tracking Table (monitor premium feature usage)
-- ============================================================================
create table if not exists public.usage_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  feature       text not null,
  action        text not null,
  metadata      jsonb,
  created_at    timestamptz not null default now()
);

alter table public.usage_logs enable row level security;

create policy "Users read own usage"
  on public.usage_logs for select
  using (auth.uid() = user_id);

create policy "Users insert own usage"
  on public.usage_logs for insert
  with check (auth.uid() = user_id);

-- ============================================================================
-- 6. Account Verification Tokens (email/phone verification)
-- ============================================================================
create table if not exists public.verification_tokens (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  token         text not null unique,
  token_type    text not null check (token_type in ('email', 'phone', 'password_reset')),
  is_used       boolean default false,
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now()
);

alter table public.verification_tokens enable row level security;

create policy "Users read own verification tokens"
  on public.verification_tokens for select
  using (auth.uid() = user_id);

-- ============================================================================
-- 7. Indexes for Performance
-- ============================================================================
create index idx_user_profiles_email on public.user_profiles(email);
create index idx_user_profiles_account_status on public.user_profiles(account_status);
create index idx_user_plans_plan on public.user_plans(plan);
create index idx_user_plans_is_active on public.user_plans(is_active);
create index idx_payment_logs_user_id on public.payment_logs(user_id);
create index idx_payment_logs_status on public.payment_logs(status);
create index idx_payment_logs_reference on public.payment_logs(reference);
create index idx_usage_logs_user_id on public.usage_logs(user_id);
create index idx_usage_logs_feature on public.usage_logs(feature);
create index idx_usage_logs_created_at on public.usage_logs(created_at);
create index idx_verification_tokens_user_id on public.verification_tokens(user_id);
create index idx_verification_tokens_token on public.verification_tokens(token);

-- ============================================================================
-- 8. Functions and Triggers
-- ============================================================================

-- Auto-create user profile, preferences, and plan on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create user profile
  insert into public.user_profiles (user_id, email, account_status)
  values (new.id, new.email, 'pending_verification')
  on conflict (user_id) do nothing;
  
  -- Create user preferences
  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  
  -- Create user plan (free tier)
  insert into public.user_plans (user_id, plan, plan_name)
  values (new.id, 'free', 'Free Plan')
  on conflict (user_id) do nothing;
  
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update profile updated_at timestamp
create or replace function public.update_profile_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_user_profiles_updated on public.user_profiles;
create trigger on_user_profiles_updated
  before update on public.user_profiles
  for each row execute procedure public.update_profile_timestamp();

-- Auto-update preferences updated_at timestamp
create or replace function public.update_preferences_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_user_preferences_updated on public.user_preferences;
create trigger on_user_preferences_updated
  before update on public.user_preferences
  for each row execute procedure public.update_preferences_timestamp();

-- Auto-update plan updated_at timestamp
create or replace function public.update_plan_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_user_plans_updated on public.user_plans;
create trigger on_user_plans_updated
  before update on public.user_plans
  for each row execute procedure public.update_plan_timestamp();

-- Function to check if user plan is still active
create or replace function public.is_plan_active(user_id uuid)
returns boolean as $$
declare
  plan_record record;
begin
  select * into plan_record 
  from public.user_plans 
  where user_plans.user_id = $1;
  
  if plan_record is null then
    return false;
  end if;
  
  if plan_record.plan = 'free' then
    return true;
  end if;
  
  return plan_record.is_active 
    and (plan_record.plan_expires_at is null or plan_record.plan_expires_at > now());
end;
$$ language plpgsql security definer set search_path = public;

-- ============================================================================
-- 9. View for User Account Summary
-- ============================================================================
create or replace view public.user_account_summary as
select 
  p.user_id,
  p.email,
  p.first_name,
  p.last_name,
  p.account_status,
  p.email_verified,
  pl.plan,
  pl.plan_name,
  pl.plan_expires_at,
  pl.is_active,
  public.is_plan_active(p.user_id) as is_plan_current,
  p.created_at as account_created_at,
  p.updated_at as profile_updated_at
from public.user_profiles p
left join public.user_plans pl on p.user_id = pl.user_id;

alter view public.user_account_summary owner to postgres;

-- Grant public access to view
grant select on public.user_account_summary to anon, authenticated;

-- ============================================================================
-- Notes:
-- - All tables have RLS enabled for security
-- - Indexes created for common queries
-- - Triggers auto-update timestamps and handle new user setup
-- - is_plan_active() function checks premium subscription validity
-- - user_account_summary view provides convenient account overview
-- ============================================================================
