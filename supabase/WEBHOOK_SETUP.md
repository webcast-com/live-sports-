# Paystack Webhook Setup Guide

## Issues Fixed

### 1. **RLS Policy Blocking Webhook**
**Problem**: The webhook couldn't insert/update records due to Row Level Security (RLS) policies that restrict access to `auth.uid()`.

**Solution**: Run the migration file to add service role bypass policies:
```bash
supabase/migrations/fix_webhook_rls.sql
```

This allows the webhook (service role) to:
- Insert payments into `payment_logs`
- Update user plans in `user_plans`
- While preserving user read restrictions

### 2. **Test Signature in Development**
**Problem**: The WebhookSimulator sends `test-signature` which fails HMAC verification.

**Solution**: The webhook now accepts `test-signature` in development mode.

## Environment Variables Required

Add these to your Supabase project:

```env
PAYSTACK_SECRET_KEY=pk_live_your_paystack_secret_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Set in**: Supabase Dashboard → Project Settings → Edge Functions

## Webhook Flow

1. **Receive Webhook** - Paystack sends `charge.success` event
2. **Verify Signature** - HMAC-SHA512 verification (skipped for test-signature)
3. **Parse Event** - Extract reference, amount, user_id, plan_name
4. **Validate Data** - Ensure all required fields present
5. **Check Idempotency** - Skip if already processed
6. **Log Payment** - Insert into `payment_logs` table
7. **Update Plan** - Upgrade `user_plans` to premium (24-hour expiry)
8. **Return 200** - Acknowledge receipt (prevents Paystack retries)

## Testing

1. **Via WebhookSimulator**:
   - Navigate to Settings → Webhook tab
   - Fill in payment details
   - Click "Send Webhook"
   - Check if plan upgrades to premium

2. **Live Testing**:
   - Set `PAYSTACK_SECRET_KEY` to your actual key
   - Real Paystack webhooks will verify properly

## Debugging

Check Supabase function logs:
```
Supabase Dashboard → Edge Functions → paystack-webhook → Logs
```

Common errors:
- `401 Unauthorized` - Invalid/missing signature
- `400 Invalid webhook data` - Missing user_id or reference
- `500 Configuration error` - Missing environment variables

## Database Schema

**payment_logs table**:
```sql
id (UUID)
user_id (UUID) - references auth.users
provider (text) - 'paystack'
reference (text unique)
plan (text)
amount (integer)
currency (text) - 'KES', 'USD', etc
status (text) - 'pending', 'success', 'failed', 'refunded'
expires_at (timestamptz)
metadata (jsonb)
created_at, updated_at (timestamptz)
```

**user_plans table**:
```sql
user_id (UUID primary key)
plan (text) - 'free', 'premium', 'pro'
plan_name (text)
plan_expires_at (timestamptz)
is_active (boolean)
updated_at (timestamptz)
```
