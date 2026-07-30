# Contact Form Backend Setup Guide

## Overview

The contact form is now fully connected with email sending via Supabase Edge Functions and Resend email service.

**Files**:
- `supabase/functions/send-contact-email.ts` - Email backend
- `ContactPage.tsx` - Updated with form submission

## Prerequisites

1. Supabase project set up
2. Resend account (free tier available at https://resend.com)
3. Domain configured in Resend (or use default Resend domain)

## Step 1: Get Resend API Key

1. Go to https://resend.com
2. Sign up or login
3. Go to **API Keys** or **Dashboard**
4. Create a new API key
5. Copy the key (starts with `re_`)

## Step 2: Deploy Edge Function

### Option A: Using Supabase Dashboard

1. Go to **Your Project → Edge Functions**
2. Click **Create a new function**
3. Name: `send-contact-email`
4. Copy the entire `supabase/functions/send-contact-email.ts` content
5. Paste into editor
6. Click **Deploy**

### Option B: Using Supabase CLI

```bash
supabase functions deploy send-contact-email
```

## Step 3: Add Environment Variable

In **Supabase Dashboard → Settings → Edge Functions → Secrets**:

| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | Your Resend API key (re_...) |

## Step 4: Configure Email Addresses

Update these in `supabase/functions/send-contact-email.ts` (lines 85-86):

```typescript
const supportEmail = "support@footypredict.ai";  // Change to your support email
```

Also update the sender email (line 106):
```typescript
from: "noreply@footypredict.ai",  // Change to your Resend domain
```

**Note**: The `from` email must be from your verified domain or use `onboarding@resend.dev` for testing.

## Step 5: Test the Connection

### Test in ContactPage.tsx

1. Open the app and navigate to **Contact** page
2. Fill in the form with test data:
   - Name: John Doe
   - Email: your-email@example.com
   - Subject: General Inquiry
   - Message: This is a test message
3. Click **Send Message**
4. You should see success message
5. Check your email for confirmation

### Test via cURL

```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-contact-email \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Subject",
    "message": "Test message content"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

## Email Flow

```
User Submits Form
       ↓
Frontend POST to Edge Function
       ↓
Validate Form Data
       ↓
Send Support Email (via Resend)
       ↓
Send Confirmation Email to User
       ↓
Return Success Response
       ↓
Show Success Message
```

## Features

✅ **Form Validation**
- Required field checking
- Email format validation

✅ **Support Email**
- Formatted HTML email
- User details included
- Easy to read layout

✅ **Confirmation Email**
- Sent to user's email
- Confirms receipt
- Provides support info

✅ **Error Handling**
- User-friendly error messages
- Logs for debugging
- Graceful failure handling

✅ **Loading State**
- Button shows "Sending..." during submission
- Disabled while processing
- Prevents duplicate submissions

## Frontend Changes

**ContactPage.tsx Updates**:
- `loading` state - tracks submission status
- `error` state - displays error messages
- `handleSubmit` - now async, calls Edge Function
- Error alert UI - shows validation/submission errors
- Loading button state - shows spinner during submission

## Troubleshooting

### Error: "Email service not configured"
**Solution**: Add `RESEND_API_KEY` to Supabase secrets

### Error: "Invalid email format"
**Solution**: Ensure email field contains valid email address

### Error: "Missing required fields"
**Solution**: Fill in all form fields before submitting

### Email not received
1. Check spam folder
2. Verify Resend account has daily quota remaining
3. Check Resend dashboard for delivery logs
4. Verify sender email is configured correctly

### Function logs
View in **Supabase Dashboard → Edge Functions → send-contact-email → Logs**

## Email Templates

### Support Email (received at support@footypredict.ai)
- Shows user name, email, subject
- Displays full message
- Reply-To: user's email address
- Professional HTML formatting

### Confirmation Email (sent to user)
- Confirms receipt of message
- Shows submitted subject
- Provides support information
- Professional branding

## Customization

### Change Support Email Address
File: `supabase/functions/send-contact-email.ts` (line 85)
```typescript
const supportEmail = "your-support@yourdomain.com";
```

### Change Sender Email
File: `supabase/functions/send-contact-email.ts` (line 106)
```typescript
from: "your-noreply@yourdomain.com",
```

### Update Email Templates
Modify the HTML templates in lines 67-105 and 110-142

## Security

✅ **Input Validation**: All fields validated before processing
✅ **Email Validation**: RFC-compliant email checking
✅ **CORS**: Properly configured for your domain
✅ **API Key**: Stored securely in Supabase secrets
✅ **Rate Limiting**: Implement via Supabase function limits

## Next Steps

1. ✅ Deploy `send-contact-email` function
2. ✅ Add `RESEND_API_KEY` to secrets
3. ✅ Update email addresses in function code
4. ✅ Test form submission
5. ✅ Monitor Supabase logs

## Support

- Resend Docs: https://resend.com/docs
- Supabase Functions: https://supabase.com/docs/guides/functions
- Check function logs for detailed error messages

---

**Status**: Ready to deploy ✅
**Function**: `supabase/functions/send-contact-email.ts`
**Frontend**: `ContactPage.tsx`
