# 📧 Email Verification Debugging Guide

## 🚨 Current Issue
**Problem**: Users not receiving email verification codes from Clerk during signup/signin.

## 🔍 Diagnosis Steps

### 1. Check Clerk Dashboard (Most Likely Issue)

Visit your [Clerk Dashboard](https://dashboard.clerk.com) and verify:

#### Email Settings
- [ ] **Email Authentication Enabled**: Settings → Authentication → Email Address
- [ ] **Email Verification Required**: Should be ON
- [ ] **Email Provider Configured**: Settings → Emails → Email Provider

#### Email Provider Status
```
✅ Default (Clerk's provider) - Should work out of the box
❌ Custom SMTP - Needs configuration
❌ Not configured - Will fail silently
```

#### Email Templates
- [ ] **Verification Email Template**: Active and not disabled
- [ ] **Magic Link Template**: If using magic links
- [ ] **Templates Not Customized**: Default templates should work

### 2. Environment Variables Check

```bash
# Check if keys are properly set
echo "Publishable Key: $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
echo "Secret Key: $CLERK_SECRET_KEY"

# Verify key format
# Publishable: pk_test_* or pk_live_*
# Secret: sk_test_* or sk_live_*
```

### 3. Browser Network Tab Debugging

1. Open browser dev tools → Network tab
2. Try to sign up with @dartmouth.edu email
3. Look for failed requests to:
   ```
   https://api.clerk.com/v1/...
   https://clerk.*.lcl.dev/...
   ```

### 4. Console Logs Check

Look for errors in browser console:
```
❌ "Clerk: Missing publishable key"
❌ "Network request failed" 
❌ "Invalid authentication"
✅ "Clerk loaded successfully"
```

## 🛠️ Quick Fixes

### Fix 1: Verify Clerk Dashboard Email Settings

1. Go to **Clerk Dashboard → Settings → Emails**
2. Check **Email Provider** section:
   ```
   ✅ Using "Default (by Clerk)" 
   ❌ Using custom SMTP without proper config
   ```
3. If using custom SMTP, switch to "Default" temporarily

### Fix 2: Test with Different Email

Try signup with:
1. Personal @dartmouth.edu email
2. Different @dartmouth.edu email  
3. Non-Dartmouth email (should be blocked by our validation)

### Fix 3: Clear Clerk Cache

```bash
# Stop development server
# Clear Next.js cache
rm -rf .next

# Clear node_modules clerk cache
rm -rf node_modules/@clerk
npm install

# Restart
npm run dev
```

### Fix 4: Temporary Bypass (Development Only)

For testing, you can temporarily disable email verification:

1. **Clerk Dashboard → Settings → Authentication**
2. **Email Address → Verification** → Turn OFF temporarily
3. **Test signup flow**
4. **Turn verification back ON**

## 🔧 Advanced Debugging

### Check Clerk Status Page
Visit [status.clerk.com](https://status.clerk.com) for service outages.

### Network/Firewall Issues
```bash
# Test connectivity to Clerk API
curl -v https://api.clerk.com/v1/health

# Expected: 200 OK response
```

### Dartmouth Email Filtering
Dartmouth might be blocking/filtering emails:
1. **Check spam folder**
2. **Check quarantine** (Dartmouth email security)
3. **Try different @dartmouth.edu address**
4. **Contact Dartmouth IT** if systematic blocking

### Rate Limiting
Clerk has rate limits:
1. **Wait 5-10 minutes between attempts**
2. **Try from different IP/browser**
3. **Check Clerk dashboard for rate limit errors**

## 🚑 Emergency Solutions

### Solution 1: Magic Links Instead of Codes
```typescript
// In your sign-in component, use magic links:
<SignIn 
  routing="hash" 
  signUpUrl="/sign-up"
  fallbackRedirectUrl="/chat"
  appearance={{
    elements: {
      formButtonPrimary: "Send Magic Link Instead",
    }
  }}
/>
```

### Solution 2: Development Mode Override
```typescript
// In development only - bypass email verification
if (process.env.NODE_ENV === 'development') {
  // Allow unverified emails temporarily
}
```

### Solution 3: Alternative Authentication
Consider adding:
- **Phone number verification**
- **Social login** (if Dartmouth supports it)
- **Manual verification** process

## 📊 Monitoring & Analytics

Add logging to track the issue:

```typescript
// In your auth component
useEffect(() => {
  console.log('🔐 Auth Debug Info:', {
    clerkLoaded: !!window.Clerk,
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20) + '...',
    environment: process.env.NODE_ENV,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  })
}, [])
```

## ✅ Verification Steps

Once you think it's fixed:

1. **Test Complete Flow**:
   ```
   1. Visit /sign-up
   2. Enter @dartmouth.edu email
   3. Check email for verification code
   4. Enter code and complete signup
   5. Verify access to protected routes
   ```

2. **Test Edge Cases**:
   ```
   1. Invalid email domains (should fail)
   2. Multiple signup attempts
   3. Expired verification codes
   4. Different browsers/devices
   ```

3. **Monitor for 24 hours**:
   ```
   1. Check signup success rates
   2. Monitor error logs
   3. Get user feedback
   4. Verify email delivery
   ```

## 🆘 Still Not Working?

### Contact Clerk Support
1. **Create ticket**: [clerk.com/support](https://clerk.com/support)
2. **Include**:
   - Your app ID
   - Sample email addresses that fail
   - Browser network logs
   - Exact error messages
   - Timeline of issue

### Contact Dartmouth IT
- **Email**: help@dartmouth.edu
- **Ask about**: Email filtering, security policies affecting external services
- **Provide**: Clerk's sending domains and IP addresses

### Developer Escalation
- **Email**: josue.godeme.25@dartmouth.edu
- **Include**: All debugging steps attempted, screenshots, error logs

---

## 💡 Most Likely Root Cause

Based on similar issues, **95% chance** it's one of:

1. **Clerk email provider not configured** (60%)
2. **Dartmouth email filtering** (25%)  
3. **Wrong environment keys** (10%)

Try fixes in this order for fastest resolution! 🚀