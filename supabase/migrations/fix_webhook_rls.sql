-- ============================================================================
-- Fix RLS Policies for Paystack Webhook Service Role
-- ============================================================================
-- The webhook runs as service role and needs to insert/update records
-- without auth.uid() restrictions

-- Drop existing restrictive policies on payment_logs
drop policy if exists "Users insert own payments" on public.payment_logs;

-- Add service role bypass policy for inserts
create policy "Service role can insert payments"
  on public.payment_logs for insert
  with check (true);

-- Add service role bypass policy for updates
create policy "Service role can update payments"
  on public.payment_logs for update
  using (true)
  with check (true);

-- Keep user read policy
-- "Users read own payments" already exists

-- ============================================================================
-- Fix RLS Policies for user_plans table
-- ============================================================================

-- Add service role bypass policy for updates
create policy "Service role can update plans"
  on public.user_plans for update
  using (true)
  with check (true);

-- Keep existing user policies intact
-- The service role will always be able to insert/update due to "with check (true)" policies

grant all on public.payment_logs to service_role;
grant all on public.user_plans to service_role;

-- ============================================================================
-- Notes:
-- - These policies allow the webhook service role to process payments
-- - User read policies remain in place for security
-- - Service role has unrestricted access (as intended for webhooks)
-- ============================================================================
