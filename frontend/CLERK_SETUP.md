# Clerk Authentication Setup

## Get Your Clerk Keys

1. **Visit Clerk Dashboard**: Go to [dashboard.clerk.com](https://dashboard.clerk.com/)

2. **Create or Select App**: 
   - Create a new application or select your existing one
   - Choose "Next.js" as your framework

3. **Copy Your Keys**:
   - **Publishable Key**: Starts with `pk_test_...` or `pk_live_...`
   - **Secret Key**: Starts with `sk_test_...` or `sk_live_...`

4. **Update `.env.local`**:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   CLERK_SECRET_KEY=sk_test_your_actual_secret_key_here
   ```

5. **Restart Development Server**: 
   ```bash
   npm run dev
   ```

## Security Notes

✅ **Safe for Frontend (Publishable Key)**:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - This is designed to be public
- Used by React components for authentication UI
- Automatically included in the browser bundle

🔒 **Server-Only (Secret Key)**:
- `CLERK_SECRET_KEY` - Never sent to browser
- Used by middleware and API routes
- Has admin privileges - keep it secret!

## Quick Test

Once configured, you should be able to:
- Visit `/opportunities/submit` and get redirected to sign-in
- Complete authentication flow
- Access the submission form after login
- See user info in the navbar

## Troubleshooting

If you still see "keyless mode" warnings:
1. Double-check your keys are copied correctly
2. Restart the dev server
3. Clear browser cache if needed