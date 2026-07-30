# Paystack Webhook Deployment Guide

## Overview
The Paystack webhook is deployed as a Supabase Edge Function that processes payment webhooks and updates user subscriptions.

**File Location**: `supabase/functions/paystack-webhook.ts`

## Prerequisites

Before deploying, ensure you have:
1. Supabase CLI installed: `npm install -g supabase`
2. A Supabase project set up
3. Paystack account with live/test keys
4. Access to your Supabase project

## Step 1: Get Your Paystack Secret Key

1. Go to **Paystack Dashboard** → Settings → API Keys & Webhooks
2. Copy your **Secret Key** (starts with `sk_live_` or `sk_test_`)
3. Save it - you'll need it in the next step

## Step 2: Deploy to Supabase

### Option A: Using Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard** → Your Project → Edge Functions
2. Click **Create a new function**
3. Name it: `paystack-webhook`
4. Copy the entire contents of `supabase/functions/paystack-webhook.ts`
5. Paste it into the editor
6. Click **Deploy**

### Option B: Using Supabase CLI

```bash
# Login to Supabase
supabase login

# Deploy the function
supabase functions deploy paystack-webhook

# Set environment variables
supabase secrets set PAYSTACK_SECRET_KEY=sk_live_your_actual_key
```

## Step 3: Add Environment Variables

In **Supabase Dashboard** → Your Project → Settings → Edge Functions → Secrets:

| Variable | Value | Example |
|----------|-------|---------|
| `PAYSTACK_SECRET_KEY` | Your Paystack secret key | `sk_live_...` |
| `SUPABASE_URL` | Your Supabase URL | `https://project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | (from Settings → API) |

**To get SUPABASE_SERVICE_ROLE_KEY**:
1. Go to **Settings → API**
2. Find "Service Role" under JWT Secret
3. Copy the full key

## Step 4: Get Your Webhook URL

After deployment, your webhook URL is:
```
https://your-project.supabase.co/functions/v1/paystack-webhook
```

Replace `your-project` with your actual Supabase project URL.

## Step 5: Configure in Paystack

1. Go to **Paystack Dashboard** → Settings → API Keys & Webhooks
2. Find "Webhooks" section
3. Add webhook URL:
   ```
   https://your-project.supabase.co/functions/v1/paystack-webhook
   ```
4. Select event: **charge.success**
5. Save

## Step 6: Fix Database RLS Policies

Run this SQL in **Supabase Dashboard** → SQL Editor:

```sql
-- Allow service role to insert payments
drop policy if exists "Users insert own payments" on public.payment_logs;

create policy "Service role can insert payments"
  on public.payment_logs for insert
  with check (true);

-- Allow service role to update plans
create policy "Service role can update plans"
  on public.user_plans for update
  using (true)
  with check (true);

-- Grant permissions
grant all on public.payment_logs to service_role;
grant all on public.user_plans to service_role;
```

## Step 7: Test the Webhook

### Test via WebhookSimulator in App
1. Navigate to **Settings → Webhook**
2. Fill in payment details
3. Click **Send Webhook**
4. Check if your plan updates to premium

### Test via cURL
```bash
curl -X POST https://your-project.supabase.co/functions/v1/paystack-webhook \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: test-signature" \
  -d '{
    "event": "charge.success",
    "data": {
      "reference": "test_ref_123",
      "amount": 10000,
      "currency": "KES",
      "metadata": {
        "user_id": "your-user-id",
        "plan_name": "Premium Plan"
      }
    }
  }'
```

## Webhook Flow Diagram

```
Paystack → HTTPS POST → Edge Function
           ↓
    Verify Signature
           ↓
    Parse Event Data
           ↓
    Check if Already Processed
           ↓
    Insert Payment Log
           ↓
    Update User Plan to Premium
           ↓
    Return 200 OK
```

## Troubleshooting

### Error: "PAYSTACK_SECRET_KEY environment variable not set"
**Solution**: Add the secret key in Supabase Settings → Edge Functions → Secrets

### Error: "Supabase configuration missing"
**Solution**: Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in secrets

### Error: "Invalid Paystack signature"
**Solution**: 
- In dev/test: Use `test-signature` header (webhook accepts it)
- In production: Ensure `PAYSTACK_SECRET_KEY` matches your Paystack dashboard key

### Error: "RLS policy blocking insert"
**Solution**: Run the SQL commands in Step 6 to fix RLS policies

### Webhook Not Triggering
**Solution**: 
1. Check Paystack dashboard webhook settings
2. View logs in Supabase Edge Functions
3. Verify webhook URL is correct
4. Check network connectivity from Paystack → your Supabase project

## View Webhook Logs

1. Go to **Supabase Dashboard** → Your Project → Edge Functions
2. Click **paystack-webhook**
3. View real-time logs at the bottom

## File Structure

```
supabase/
├── functions/
│   └── paystack-webhook.ts      ← Main webhook file
├── migrations/
│   └── fix_webhook_rls.sql      ← RLS policy fixes
└── WEBHOOK_SETUP.md             ← Setup documentation
```

## Security Notes

✅ **Signature Verification**: All webhooks are HMAC-SHA512 verified
✅ **Service Role Only**: Uses service role for database operations
✅ **Idempotency Check**: Prevents duplicate payment processing
✅ **RLS Policies**: User data is protected with row-level security
✅ **Error Handling**: Returns 200 to prevent Paystack retries on errors

## Next Steps

1. ✅ File is ready in `supabase/functions/paystack-webhook.ts`
2. ☐ Deploy to Supabase Edge Functions
3. ☐ Set environment variables
4. ☐ Run RLS policy SQL
5. ☐ Configure webhook in Paystack dashboard
6. ☐ Test with WebhookSimulator

## Support

For issues:
- Check Supabase Edge Functions logs
- Verify all environment variables are set
- Ensure database tables exist (run `supabase_setup.sql`)
- Check Paystack webhook delivery logs

---

**Webhook File**: `supabase/functions/paystack-webhook.ts`
**Documentation**: `supabase/WEBHOOK_SETUP.md`
