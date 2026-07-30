# Contact Form Deployment Checklist

## Quick Setup Guide

### ✅ Step 1: Get Resend API Key
- [ ] Go to https://resend.com
- [ ] Sign up or login
- [ ] Create API Key
- [ ] Copy key (starts with `re_`)

### ✅ Step 2: Deploy Function to Supabase

**Via Dashboard:**
1. [ ] Go to Your Project → Edge Functions
2. [ ] Click "Create a new function"
3. [ ] Name: `send-contact-email`
4. [ ] Copy entire `supabase/functions/send-contact-email.ts`
5. [ ] Paste into editor
6. [ ] Click Deploy

**Via CLI:**
```bash
supabase functions deploy send-contact-email
```
- [ ] Deployed successfully

### ✅ Step 3: Add API Key to Secrets

Go to **Settings → Edge Functions → Secrets**:
- [ ] Add `RESEND_API_KEY` with your Resend key value
- [ ] Save

### ✅ Step 4: Configure Email Addresses

Edit `supabase/functions/send-contact-email.ts`:

**Line 85:**
```typescript
const supportEmail = "your-support-email@domain.com";
```
- [ ] Updated support email

**Line 106:**
```typescript
from: "noreply@yourdomain.com",
```
- [ ] Updated sender email

### ✅ Step 5: Test the Form

1. [ ] Open app and go to Contact page
2. [ ] Fill in test form:
   - Name: Test User
   - Email: test@example.com
   - Subject: Test Subject
   - Message: Test message
3. [ ] Click "Send Message"
4. [ ] See success message
5. [ ] Check email for confirmation

### ✅ Step 6: Verify Emails Work

- [ ] Check support inbox for submission email
- [ ] Check user email for confirmation
- [ ] Review email formatting
- [ ] Verify no spam folder issues

## What Was Added

### Frontend (ContactPage.tsx)
- ✅ Form submission to backend
- ✅ Loading state with spinner
- ✅ Error message display
- ✅ Success confirmation message

### Backend (send-contact-email.ts)
- ✅ Form validation
- ✅ Email format checking
- ✅ Resend API integration
- ✅ Support email sending
- ✅ User confirmation email
- ✅ Error handling

## Features

✅ Form validation (required fields, email format)
✅ HTML-formatted emails
✅ Support email with details
✅ Confirmation email to user
✅ Error messages
✅ Loading states
✅ Success feedback

## Function Details

**Endpoint**: `https://your-project.supabase.co/functions/v1/send-contact-email`
**Method**: POST
**Auth**: Public (CORS enabled)
**Rate Limit**: Supabase default limits

## Email Addresses to Update

| Type | Location | Current | Update To |
|------|----------|---------|-----------|
| Support | Line 85 | support@footypredict.ai | Your support email |
| Sender | Line 106 | noreply@footypredict.ai | Your noreply email |

## Troubleshooting

**Problem**: "Email service not configured"
- [ ] Check RESEND_API_KEY is set in secrets
- [ ] Verify key is correct (starts with re_)

**Problem**: Email not received
- [ ] Check spam folder
- [ ] Verify sender email in Resend dashboard
- [ ] Check function logs in Supabase

**Problem**: Form won't submit
- [ ] Check all fields are filled
- [ ] Verify email format is valid
- [ ] Check browser console for errors
- [ ] View Supabase function logs

## Testing Command

```bash
# Test with curl
curl -X POST https://your-project.supabase.co/functions/v1/send-contact-email \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test",
    "message": "Test message"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

## Checklist Summary

- [ ] Resend account created
- [ ] API key obtained
- [ ] Function deployed
- [ ] Secrets configured
- [ ] Email addresses updated
- [ ] Form tested
- [ ] Emails verified
- [ ] Errors handled

## Files Modified

| File | Changes |
|------|---------|
| ContactPage.tsx | Added submission, loading, errors |
| send-contact-email.ts | New backend function |

## Status

**Frontend**: ✅ Ready
**Backend**: ✅ Ready for deployment
**Email Service**: ⏳ Awaiting Resend setup

---

**Deployment Status**: Ready when Resend API key added
