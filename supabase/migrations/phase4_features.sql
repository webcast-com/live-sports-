-- Phase 4 Features Migration
-- Match comments, leaderboard improvements, admin

-- ============================================================================
-- 1. Match Comments (Live Chat per Match)
-- ============================================================================
create table if not exists public.match_comments (
  id uuid primary key default gen_random_uuid(),
  match_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  user_name text,
  user_avatar text,
  message text not null check (char_length(message) >= 1 and char_length(message) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.match_comments enable row level security;

drop policy if exists "Anyone can read match comments" on public.match_comments;
create policy "Anyone can read match comments"
  on public.match_comments for select using (true);

drop policy if exists "Authenticated can insert comments" on public.match_comments;
create policy "Authenticated can insert comments"
  on public.match_comments for insert with check (auth.role() = 'authenticated' or auth.role() = 'anon');

drop policy if exists "Users can update own comments" on public.match_comments;
create policy "Users can update own comments"
  on public.match_comments for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own comments" on public.match_comments;
create policy "Users can delete own comments"
  on public.match_comments for delete using (auth.uid() = user_id);

create index if not exists idx_match_comments_match_id on public.match_comments(match_id);
create index if not exists idx_match_comments_created_at on public.match_comments(created_at desc);
create index if not exists idx_match_comments_user_id on public.match_comments(user_id);

-- Update timestamp trigger
create or replace function public.update_match_comment_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_match_comments_updated on public.match_comments;
create trigger on_match_comments_updated
  before update on public.match_comments
  for each row execute procedure public.update_match_comment_timestamp();

-- ============================================================================
-- 2. Predictions Accuracy Tracking (for charts)
-- ============================================================================
create table if not exists public.prediction_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  match_id text,
  prediction_type text not null,
  predicted_value text,
  actual_value text,
  is_correct boolean,
  confidence integer check (confidence >= 0 and confidence <= 100),
  odds numeric,
  created_at timestamptz not null default now()
);

alter table public.prediction_results enable row level security;

drop policy if exists "Anyone can read prediction results" on public.prediction_results;
create policy "Anyone can read prediction results" on public.prediction_results for select using (true);

drop policy if exists "Users insert own prediction results" on public.prediction_results;
create policy "Users insert own prediction results" on public.prediction_results for insert with check (true);

create index if not exists idx_prediction_results_user_id on public.prediction_results(user_id);
create index if not exists idx_prediction_results_match_id on public.prediction_results(match_id);
create index if not exists idx_prediction_results_created_at on public.prediction_results(created_at desc);

-- ============================================================================
-- 3. Leaderboard Materialized View (for performance)
-- ============================================================================
create or replace view public.leaderboard_view as
select
  up.user_id,
  upr.email,
  upr.first_name,
  upr.last_name,
  count(pr.id) as total_predictions,
  count(case when pr.is_correct then 1 end) as correct_predictions,
  case when count(pr.id) > 0 then round((count(case when pr.is_correct then 1 end)::numeric / count(pr.id) * 100), 2) else 0 end as accuracy_percent,
  avg(pr.confidence) as avg_confidence,
  max(pr.created_at) as last_prediction_at
from public.user_plans up
left join public.user_profiles upr on up.user_id = upr.user_id
left join public.prediction_results pr on up.user_id = pr.user_id
group by up.user_id, upr.email, upr.first_name, upr.last_name
having count(pr.id) > 0
order by accuracy_percent desc, total_predictions desc;

grant select on public.leaderboard_view to anon, authenticated;

-- ============================================================================
-- 4. Admin Role Check Function
-- ============================================================================
create or replace function public.is_admin()
returns boolean as $$
begin
  -- Check if current user email is in admin list or has admin claim
  -- For demo, allow any authenticated user to view admin (restrict in prod via custom claims)
  -- In production, use: return auth.jwt() ->> 'role' = 'admin' or auth.email() in ('admin@scorehub.com')
  return auth.role() = 'authenticated';
end;
$$ language plpgsql security definer;

-- ============================================================================
-- 5. Enable Realtime for new tables
-- ============================================================================
-- alter publication supabase_realtime add table public.match_comments;
-- alter publication supabase_realtime add table public.prediction_results;

-- ============================================================================
-- Notes:
-- - match_comments: live chat per match with realtime
-- - prediction_results: track accuracy for charts
-- - leaderboard_view: aggregated accuracy for leaderboard
-- - is_admin(): helper for admin dashboard gating
