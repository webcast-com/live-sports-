# Paystack Webhook Deployment Checklist

## Quick Deploy Guide

### ✅ Pre-Deployment
- [ ] Have Paystack account with secret key (starts with `sk_live_` or `sk_test_`)
- [ ] Have Supabase project ready
- [ ] Have access to Supabase dashboard
- [ ] Database tables created (run `supabase_setup.sql` if not done)

### ✅ Deploy to Supabase

**Via Supabase Dashboard:**
1. [ ] Go to Your Project → Edge Functions
2. [ ] Click "Create a new function"
3. [ ] Name: `paystack-webhook`
4. [ ] Copy entire `supabase/functions/paystack-webhook.ts` content
5. [ ] Paste into editor
6. [ ] Click Deploy

**Via CLI (Optional):**
```bash
supabase functions deploy paystack-webhook
```

### ✅ Set Environment Variables

Go to **Settings → Edge Functions → Secrets** and add:

```
PAYSTACK_SECRET_KEY = sk_live_... (your actual key)
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY = (from Settings → API)
```

- [ ] `PAYSTACK_SECRET_KEY` added
- [ ] `SUPABASE_URL` added
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added

### ✅ Fix Database RLS Policies

Run this in **Supabase Dashboard → SQL Editor**:

```sql
drop policy if exists "Users insert own payments" on public.payment_logs;

create policy "Service role can insert payments"
  on public.payment_logs for insert
  with check (true);

create policy "Service role can update plans"
  on public.user_plans for update
  using (true)
  with check (true);

grant all on public.payment_logs to service_role;
grant all on public.user_plans to service_role;
```

- [ ] SQL executed successfully

### ✅ Configure Webhook in Paystack

1. [ ] Go to Paystack Dashboard → Settings → API Keys & Webhooks
2. [ ] Add webhook URL:
   ```
   https://your-project.supabase.co/functions/v1/paystack-webhook
   ```
3. [ ] Select event: **charge.success**
4. [ ] Save webhook

### ✅ Test Webhook

**Option 1: Test Simulator in App**
1. [ ] Open app and login
2. [ ] Go to Settings → Webhook tab
3. [ ] Fill in test payment details
4. [ ] Click "Send Webhook"
5. [ ] Verify plan updates to premium

**Option 2: Test via cURL**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/paystack-webhook \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: test-signature" \
  -d '{"event":"charge.success","data":{"reference":"test_123","amount":10000,"currency":"KES","metadata":{"user_id":"your-user-id","plan_name":"Premium"}}}'
```
- [ ] Test executed successfully
- [ ] Returns 200 status
- [ ] Plan updated in database

### ✅ Monitor in Production

- [ ] Check logs in Supabase Edge Functions
- [ ] Set up alerts for failed webhooks
- [ ] Monitor payment_logs table
- [ ] Verify user_plans updates correctly

### ✅ Documentation

Files created:
- [ ] `supabase/functions/paystack-webhook.ts` - Main webhook
- [ ] `supabase/migrations/fix_webhook_rls.sql` - RLS fixes
- [ ] `supabase/WEBHOOK_SETUP.md` - Setup guide
- [ ] `PAYSTACK_DEPLOYMENT_GUIDE.md` - Full deployment guide
- [ ] `PAYSTACK_WEBHOOK_CHECKLIST.md` - This checklist

---

## Webhook Details

**File**: `supabase/functions/paystack-webhook.ts`
**Type**: Supabase Edge Function (TypeScript)
**Endpoint**: `/functions/v1/paystack-webhook`
**Method**: POST
**Auth**: HMAC-SHA512 signature verification

## Your Webhook URL

```
https://your-project.supabase.co/functions/v1/paystack-webhook
```

Replace `your-project` with your actual Supabase project name.

## Quick Reference

| Task | File |
|------|------|
| Deploy webhook | `supabase/functions/paystack-webhook.ts` |
| Fix RLS | `supabase/migrations/fix_webhook_rls.sql` |
| Full guide | `PAYSTACK_DEPLOYMENT_GUIDE.md` |

---

**Status**: Ready to deploy ✅
**Date**: 2024
