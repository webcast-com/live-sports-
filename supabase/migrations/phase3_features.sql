-- Phase 3 Features Migration
-- Favorites, Contact Messages, User Activity, improved RLS

-- ============================================================================
-- 1. Favorites Table (user's favorite teams)
-- ============================================================================
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_name text not null,
  team_abbr text,
  league text,
  sport text not null default 'soccer' check (sport in ('all', 'football', 'basketball', 'soccer', 'baseball', 'tennis')),
  team_logo_url text,
  created_at timestamptz not null default now(),
  unique(user_id, team_name, league)
);

alter table public.favorites enable row level security;

drop policy if exists "Users read own favorites" on public.favorites;
create policy "Users read own favorites"
  on public.favorites for select using (auth.uid() = user_id);

drop policy if exists "Users insert own favorites" on public.favorites;
create policy "Users insert own favorites"
  on public.favorites for insert with check (auth.uid() = user_id);

drop policy if exists "Users delete own favorites" on public.favorites;
create policy "Users delete own favorites"
  on public.favorites for delete using (auth.uid() = user_id);

create index if not exists idx_favorites_user_id on public.favorites(user_id);
create index if not exists idx_favorites_team_name on public.favorites(team_name);

-- ============================================================================
-- 2. Contact Messages Table
-- ============================================================================
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "Anyone can insert contact messages" on public.contact_messages;
create policy "Anyone can insert contact messages"
  on public.contact_messages for insert with check (true);

drop policy if exists "Users read own contact messages" on public.contact_messages;
create policy "Users read own contact messages"
  on public.contact_messages for select using (auth.uid() = user_id or auth.uid() is null);

-- Service role can read all (for admin dashboard)
-- No additional policy needed for service role (bypasses RLS)

create index if not exists idx_contact_messages_email on public.contact_messages(email);
create index if not exists idx_contact_messages_status on public.contact_messages(status);
create index if not exists idx_contact_messages_created_at on public.contact_messages(created_at desc);

-- ============================================================================
-- 3. User Activity Tracking Table
-- ============================================================================
create table if not exists public.user_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  metadata jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.user_activity enable row level security;

drop policy if exists "Users read own activity" on public.user_activity;
create policy "Users read own activity"
  on public.user_activity for select using (auth.uid() = user_id);

drop policy if exists "Users insert own activity" on public.user_activity;
create policy "Users insert own activity"
  on public.user_activity for insert with check (auth.uid() = user_id or auth.uid() is null);

-- Allow anon to insert for page views before login (for analytics)
drop policy if exists "Anon can insert activity" on public.user_activity;
create policy "Anon can insert activity"
  on public.user_activity for insert with check (true);

create index if not exists idx_user_activity_user_id on public.user_activity(user_id);
create index if not exists idx_user_activity_action on public.user_activity(action);
create index if not exists idx_user_activity_created_at on public.user_activity(created_at desc);

-- ============================================================================
-- 4. Improve payment_logs status handling for Phase 3 secure flow
-- ============================================================================
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='payment_logs' and column_name='verified_at') then
    alter table public.payment_logs add column verified_at timestamptz;
  end if;
end $$;

-- ============================================================================
-- 5. Function to handle contact message timestamp update
-- ============================================================================
create or replace function public.update_contact_message_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_contact_messages_updated on public.contact_messages;
create trigger on_contact_messages_updated
  before update on public.contact_messages
  for each row execute procedure public.update_contact_message_timestamp();

-- ============================================================================
-- 6. Enable Realtime for relevant tables
-- ============================================================================
-- Note: Run these in Supabase dashboard if not already enabled
-- alter publication supabase_realtime add table public.user_plans;
-- alter publication supabase_realtime add table public.favorites;
-- alter publication supabase_realtime add table public.payment_logs;

-- ============================================================================
-- 7. View for user favorites summary (for quick access)
-- ============================================================================
create or replace view public.user_favorites_summary as
select
  f.user_id,
  count(*) as favorites_count,
  array_agg(distinct f.sport) as sports,
  array_agg(distinct f.league) as leagues,
  max(f.created_at) as last_favorite_at
from public.favorites f
group by f.user_id;

grant select on public.user_favorites_summary to anon, authenticated;

-- ============================================================================
-- Notes:
-- - Favorites: used for QuickLinks personalization and push notifications
-- - Contact_messages: Phase 2 frontend already wired to edge function, now persists
-- - User_activity: track tab switches, sport filters, match views for analytics
-- - Realtime: enable for user_plans to instantly reflect premium upgrades via webhook
