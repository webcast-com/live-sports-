# Paystack Popup Not Working - Troubleshooting Guide

## Quick Diagnostics

### Issue 1: "Loading Gateway..." Button Won't Proceed
**Cause**: Paystack script is blocked or not loading
**Solutions**:

1. **Check Ad Blocker**
   - Disable any ad blockers (uBlock, Adblock Plus, etc.)
   - Paystack CDN gets blocked by many ad blockers
   - Refresh page after disabling

2. **Check Browser Console**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for error messages
   - Take screenshot of errors

3. **Check Network Tab**
   - Open DevTools → Network tab
   - Reload page
   - Look for `https://js.paystack.co/v1/inline.js`
   - Check if it:
     - ✅ Shows status 200 (success)
     - ❌ Shows 403/404 (blocked/not found)
     - ❌ Shows red X (failed to load)

### Issue 2: Button Enabled But Popup Doesn't Open
**Cause**: Paystack script loaded but popup initialization fails

**Check**:
1. Look at browser console for errors
2. Verify Paystack key is valid
3. Check if key matches environment

**Test**:
```javascript
// In browser console, paste:
console.log('PaystackPop:', window.PaystackPop ? '✓ Available' : '✗ Not available');
console.log('Key:', 'pk_live_...' || 'pk_test_...');
```

### Issue 3: Popup Opens But Can't Complete Payment
**Cause**: Network issue or backend problem

**Check**:
1. Mobile signal is strong
2. Not on VPN (some VPNs block Paystack)
3. Email is valid format
4. Amount and currency are correct

## Solutions by Symptom

### Symptom: Amber Warning Box Shows
**Message**: "⚠️ Gateway Issue: Paystack script failed to load..."

**Fix**:
1. ✅ Disable ad blockers
2. ✅ Disable browser extensions
3. ✅ Try different browser (Chrome, Safari, Firefox)
4. ✅ Clear browser cache (Ctrl+Shift+Delete / Cmd+Shift+Delete)
5. ✅ Try incognito/private mode
6. ✅ Check internet connection

### Symptom: Button Says "Loading Gateway..." (spinning)
**Fix**:
1. ✅ Wait 5-10 seconds (script may be loading slow)
2. ✅ Check internet speed
3. ✅ Refresh page (F5)
4. ✅ Check browser console for errors
5. ✅ Try different browser

### Symptom: Button Says "Unlock Premium Now" but click doesn't work
**Fix**:
1. Check browser console (F12)
2. Open DevTools → Console
3. Paste: `window.PaystackPop` - should show an object, not undefined
4. If undefined, ad blocker is likely blocking it

### Symptom: Popup opens then closes immediately
**Possible Causes**:
- Invalid public key
- Expired session
- Network issue mid-transaction

**Fix**:
1. Refresh page
2. Try again
3. Check browser console for specific error
4. Try test button below (uses simulated payment)

## Development Debugging

### Enable Verbose Logging
The code now includes console logs. Check for:
```
✓ Paystack script loaded successfully
✓ Initializing Paystack with key: pk_live_...
✓ Opening Paystack iframe...
✓ Payment successful, reference: ...
```

### Common Console Errors

**Error**: `PaystackPop is not defined`
- **Cause**: Script didn't load
- **Fix**: Disable ad blockers, refresh

**Error**: `handler.openIframe is not a function`
- **Cause**: PaystackPop.setup() failed
- **Fix**: Check Paystack key validity

**Error**: `CORS error` or blocked by CORS policy
- **Cause**: Browser security restriction
- **Fix**: Usually resolves with proper key, contact Paystack support if persists

**Error**: Network timeout
- **Cause**: Slow internet or Paystack server down
- **Fix**: Check server status at https://status.paystack.com

## Testing Without Real Payment

### Option 1: Use Test Button
Click "Simulate Success for Testing" button to test flow without payment.

### Option 2: Use Paystack Test Keys
Switch to test mode in Paystack dashboard:
1. Go to Settings → API Keys & Webhooks
2. Copy **Test Public Key** (starts with `pk_test_`)
3. Use for development/testing

### Option 3: Webhook Simulator
Go to Settings → Webhook tab to test webhook integration.

## Browser-Specific Issues

### Chrome
✅ Most reliable
- Try: Disable extensions → Settings → Extensions
- Try: Clear cache & reload

### Safari (Mac/iOS)
⚠️ May have issues with Paystack on iOS
- Try: Enable "Allow Cross-Site Tracking" in Privacy settings
- Try: Try desktop Safari first

### Firefox
✅ Usually works fine
- Try: Private window (Ctrl+Shift+P)
- Try: Disable ad blockers specifically for site

## Network Issues

**Test network connectivity**:
```bash
# Can you reach Paystack?
ping js.paystack.co

# Or in browser console:
fetch('https://js.paystack.co/v1/inline.js')
  .then(r => console.log('✓ Reachable'))
  .catch(e => console.log('✗ Not reachable:', e))
```

## Paystack Server Status

Check if Paystack is down:
- **Status Page**: https://status.paystack.com
- **Status Page Monitoring**: Paystack publishes incident reports here
- **Twitter**: @paystack for updates

## Contact Support

If issue persists:
1. **Screenshot console errors**
2. **Note your:**
   - Browser & version
   - Device type (mobile/desktop)
   - Country/region
   - Whether ad blockers are disabled
3. **Contact**: support@footypredict.ai

**Or contact Paystack**:
- **Status**: https://status.paystack.com
- **Support**: support@paystack.com
- **Docs**: https://paystack.com/docs

## Checklist

Before requesting support, verify:

- [ ] Ad blockers are disabled
- [ ] Browser cache cleared
- [ ] Tried different browser
- [ ] Tried incognito/private mode
- [ ] Internet connection is stable
- [ ] Public key is valid (starts with pk_live_ or pk_test_)
- [ ] Checked browser console for errors
- [ ] Checked DevTools Network tab for script loading
- [ ] Waited 10+ seconds for script to load
- [ ] Tried "Simulate Success" button to test backend

## Code Improvements Added

Recent updates to `PremiumUpgrade.tsx` include:
- ✅ Better error messages
- ✅ Script load error detection
- ✅ Console logging for debugging
- ✅ Fallback messaging
- ✅ Button state indicators
- ✅ Warning alerts for script failures
- ✅ Better error handling

## Quick Test Commands

**In browser console (F12)**:

```javascript
// Check if Paystack is loaded
window.PaystackPop ? console.log('✓ Ready') : console.log('✗ Not loaded');

// Check environment
import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ? console.log('✓ Key exists') : console.log('✗ No key');

// Simulate Paystack call
console.log(window.PaystackPop?.setup ? '✓ Setup available' : '✗ Setup not available');
```

---

**Last Updated**: 2024
**Status**: Enhanced with better error handling
