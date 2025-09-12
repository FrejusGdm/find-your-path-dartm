# Find Your Path - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Git repository access
- Vercel account (for frontend hosting)
- Convex account (for backend)
- Clerk account (for authentication)
- OpenAI API key
- Mem0 API key

### Environment Variables Setup
Create `.env.local` in the frontend directory:

```bash
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database & Backend  
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-... # Optional fallback

# Memory Layer
MEM0_API_KEY=mem0_...

# Analytics
VERCEL_ANALYTICS_ID=prj_...

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

## 📋 Step-by-Step Deployment

### 1. Convex Backend Setup

#### Initialize Convex
```bash
cd frontend
npm install
npx convex dev
```

#### Deploy to Production
```bash
npx convex deploy --prod
# Copy the generated NEXT_PUBLIC_CONVEX_URL
```

#### Seed Initial Data
```bash
# Run in Convex dashboard or via CLI
npx convex run opportunities:seedOpportunities
```

### 2. Clerk Authentication Setup

#### Create Clerk Application
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create new application
3. Enable Email authentication
4. Configure OAuth settings (optional)

#### Configure Settings
```javascript
// In Clerk dashboard:
- Session settings: 1 week duration
- Password settings: Disabled (magic link only)
- Social providers: Optional (Google, GitHub)
- Webhook endpoints: /api/webhooks/clerk (optional)
```

#### Environment Variables
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### 3. AI Provider Setup

#### OpenAI Configuration
1. Create OpenAI API key at [OpenAI Platform](https://platform.openai.com)
2. Set usage limits and billing
3. Monitor usage in dashboard

#### Recommended Settings
```javascript
// Model configuration:
- Primary: gpt-4-turbo (for quality)
- Fallback: gpt-3.5-turbo (for cost efficiency)
- Temperature: 0.7 (conversational)
- Max tokens: 1000 (reasonable responses)
```

### 4. Mem0 Memory Setup

#### Create Mem0 Account
1. Sign up at [Mem0](https://mem0.ai)
2. Create API key
3. Configure memory retention policies

#### Memory Configuration
```javascript
// Recommended settings:
- Retention: Profile (permanent), Conversations (90 days)
- Vector storage: Convex integration
- Memory categories: 5 (profile, interests, goals, preferences, interactions)
```

### 5. Vercel Deployment

#### Connect Repository
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

#### Configure Environment Variables
In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all environment variables from `.env.local`
3. Set production domains

#### Custom Domain (Optional)
```bash
# Add custom domain
vercel domains add yourdomain.com
vercel alias your-deployment.vercel.app yourdomain.com
```

### 6. Final Configuration

#### Database Indexes
Ensure these indexes are created in Convex:
```typescript
// In schema.ts - these should be automatically created
- users: by_clerk_id, by_email, by_year, by_last_active  
- opportunities: by_category, by_department, search_opportunities
- conversations: by_user, by_session, by_active
- messages: by_conversation, by_user, by_created
```

#### Test Deployment
1. Visit your deployed URL
2. Test authentication flow
3. Complete onboarding
4. Send test chat message
5. Verify opportunity recommendations

## 🔧 Configuration Details

### Performance Optimizations

#### Next.js Configuration
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['convex']
  },
  images: {
    domains: ['img.clerk.com'],
    formats: ['image/webp', 'image/avif']
  },
  headers: async () => [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store' }
      ]
    }
  ]
}

export default nextConfig
```

#### Vercel Configuration
```json
// vercel.json
{
  "functions": {
    "app/api/chat/route.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### Security Configuration

#### Content Security Policy
```javascript
// In next.config.mjs
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://img.clerk.com;
  connect-src 'self' https://clerk.com https://api.openai.com https://api.mem0.ai;
  font-src 'self';
`;
```

#### Rate Limiting
```typescript
// Implement in middleware.ts
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later'
}
```

## 📊 Monitoring & Analytics

### Error Tracking
```bash
# Install Sentry (recommended)
npm install @sentry/nextjs

# Configure in sentry.client.config.ts
Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV
})
```

### Performance Monitoring
```javascript
// Vercel Analytics is automatically included
// Additional monitoring in pages/_app.tsx:
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
```

### Custom Metrics
```typescript
// Track custom events
import { track } from '@vercel/analytics'

// In your components:
track('opportunity_saved', { category: 'research', department: 'biology' })
track('chat_completed', { message_count: 5, duration: 120 })
```

## 🔄 CI/CD Pipeline

### GitHub Actions Setup
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: cd frontend && npm ci
        
      - name: Build project
        run: cd frontend && npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: frontend
```

### Automated Testing
```yaml
# Add to GitHub Actions
- name: Run tests
  run: |
    cd frontend
    npm run test
    npm run lint
    npm run type-check
```

## 📈 Scaling Considerations

### Horizontal Scaling
- **Convex**: Automatically scales based on usage
- **Vercel**: Edge functions scale automatically
- **Mem0**: Scales with API usage
- **OpenAI**: Rate limits based on tier

### Cost Optimization
```javascript
// Implement smart caching
const cacheStrategy = {
  opportunities: '1 hour',
  userProfile: '15 minutes', 
  memoryContext: '5 minutes',
  aiResponses: 'none' // Always fresh
}

// Monitor costs
const costThresholds = {
  openai: '$100/month',
  mem0: '$50/month',
  convex: '$25/month',
  vercel: '$20/month'
}
```

## 🚨 Troubleshooting

### Common Issues

#### Authentication Problems
```bash
# Check Clerk configuration
- Verify publishable key is correct
- Ensure domain matches in Clerk settings
- Check webhook endpoints if used
```

#### Chat Not Working
```bash
# Verify API keys
- Test OpenAI key in playground
- Check Convex deployment status
- Verify environment variables

# Debug API calls
curl -X POST https://yourapp.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "test"}]}'
```

#### Memory Issues
```bash
# Check Mem0 integration
- Verify API key is valid
- Check rate limits in dashboard
- Monitor error logs for memory calls
```

#### Performance Issues
```bash
# Analyze bundle size
npx @next/bundle-analyzer

# Check Core Web Vitals
# Use Chrome DevTools Lighthouse
# Monitor Vercel Analytics dashboard
```

### Health Check Endpoint
```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    convex: await checkConvexConnection(),
    openai: await checkOpenAIConnection(),
    mem0: await checkMem0Connection(),
    timestamp: new Date().toISOString()
  }
  
  return Response.json(checks)
}
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks
1. **Weekly**: Review error logs and performance metrics
2. **Monthly**: Update dependencies and security patches
3. **Quarterly**: Review and optimize costs
4. **Annually**: Security audit and penetration testing

### Backup Strategy
- **Convex**: Automatic backups included
- **User Data**: Export capabilities built-in
- **Configuration**: Store in version control
- **Environment Variables**: Document securely

### Monitoring Dashboard
Create alerts for:
- High error rates (>1%)
- Slow response times (>5s)
- API quota limits (>80%)
- User growth spikes
- Security incidents

---

**🎉 Your Find Your Path deployment is now ready to help Dartmouth students discover amazing opportunities!**