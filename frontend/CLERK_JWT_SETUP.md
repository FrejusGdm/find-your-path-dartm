# 🔑 Clerk JWT Template Setup for Convex

## 🚨 Error Fixed
**Error**: "No JWT template exists with name: convex"  
**Solution**: Create a JWT template in Clerk Dashboard

## 📋 Step-by-Step Setup

### 1. Access Clerk Dashboard
1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Select your application: "Find Your Path Dartmouth"
3. Look for **"JWT Templates"** in the left sidebar

### 2. Create New Template
1. Click **"+ New template"** or **"Create template"**
2. Fill in the template details:

**Template Configuration:**
```
Template Name: convex
Signing Algorithm: RS256
Token Lifetime: 60 minutes (default)
```

### 3. Configure Claims
Add these claims to the template:

```json
{
  "aud": "convex",
  "iss": "https://your-domain.clerk.accounts.dev",
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "name": "{{user.full_name}}",
  "iat": {{date.now}},
  "exp": {{date.now_plus_1_hour}}
}
```

**Replace `your-domain` with your actual Clerk domain!**

### 4. Advanced Claims (Optional)
For better Convex integration, you can add:

```json
{
  "aud": "convex",
  "iss": "https://your-domain.clerk.accounts.dev", 
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "email_verified": "{{user.primary_email_address_verified}}",
  "name": "{{user.full_name}}",
  "given_name": "{{user.first_name}}",
  "family_name": "{{user.last_name}}",
  "picture": "{{user.image_url}}",
  "iat": {{date.now}},
  "exp": {{date.now_plus_1_hour}},
  "custom": {
    "role": "student",
    "organization": "dartmouth"
  }
}
```

### 5. Save and Test
1. Click **"Save"** or **"Create template"**
2. Restart your development server:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

## 🔄 Re-enable Convex Integration

After creating the JWT template, update the provider:

```typescript
// In providers/convex-provider.tsx
// Change back from ConvexProvider to ConvexProviderWithClerk:

<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
  {children}
</ConvexProviderWithClerk>
```

## 🧪 Test the Integration

1. **Visit your app**: http://localhost:3001
2. **Sign up/Sign in**: Authentication should work
3. **Check console**: No JWT errors
4. **Test protected features**: Opportunities submission, etc.

## 🚨 Troubleshooting

### Template Name Must Be Exact
- ✅ Correct: `convex` (lowercase)
- ❌ Wrong: `Convex`, `CONVEX`, `convex-jwt`

### Common Issues

**Issue 1: "Template not found"**
```
Solution: Double-check the template name is exactly "convex"
```

**Issue 2: "Invalid claims"**
```
Solution: Make sure all {{ }} brackets are correct
```

**Issue 3: "Domain mismatch"**
```
Solution: Replace "your-domain" with your actual Clerk domain
```

### Find Your Clerk Domain
1. In Clerk Dashboard → Settings → General
2. Look for **"Application ID"** 
3. Your domain is usually: `[app-id].clerk.accounts.dev`

## 🎯 Current Status

**Temporary Fix Applied**: 
- Using regular `ConvexProvider` instead of `ConvexProviderWithClerk`
- This allows the app to work without JWT template
- User authentication works through Clerk directly

**Final Setup Needed**:
- Create JWT template as described above  
- Switch back to `ConvexProviderWithClerk`
- Full Convex-Clerk integration enabled

## 📞 Need Help?

If you're still having issues:
1. **Check Clerk Status**: [status.clerk.com](https://status.clerk.com)
2. **Clerk Support**: [clerk.com/support](https://clerk.com/support)
3. **Convex Docs**: [docs.convex.dev/auth/clerk](https://docs.convex.dev/auth/clerk)

---

**The app should now work without the JWT error! 🎉**