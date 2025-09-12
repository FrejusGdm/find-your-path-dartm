# Find Your Path — Cost-Optimized PRD v1.1

## 1. Executive Summary

**Problem:** Many Dartmouth students (especially first-gen/international) don't know what opportunities exist or how to start.

**Solution:** An AI-powered conversational discovery platform that suggests programs based on year/interests/goals, explains how research works at Dartmouth, and provides concrete next steps.

**Cost Philosophy:** Start lean with session-based memory, add advanced features as user base grows.

## 2. Authentication Strategy (Simplified)

### 2.1 Email-Based Auth with Clerk
```typescript
// Simple email verification flow
const authFlow = {
  step1: "User enters email",
  step2: "Clerk sends magic link or OTP",
  step3: "User verifies email",
  step4: "Check if email ends with @dartmouth.edu",
  step5: "Grant access or show waitlist"
};

// Email validation
function validateDartmouthEmail(email: string): boolean {
  const domain = email.split('@')[1];
  return domain === 'dartmouth.edu';
}

// Non-Dartmouth handling
const waitlistFlow = {
  message: "This is currently for Dartmouth students only",
  action: "Join waitlist for other schools",
  futureExpansion: ["@yale.edu", "@harvard.edu", "@princeton.edu"]
};
```

### 2.2 Benefits of This Approach
- **No SSO complexity:** Faster implementation
- **Lower cost:** Clerk's free tier supports 10K users
- **Flexible:** Easy to add other schools later
- **User-friendly:** Magic links are familiar

## 3. Cost-Optimized Technical Stack

### 3.1 Infrastructure Costs (Monthly Estimates)

| Service | Free Tier | Paid Tier (1K users) | Notes |
|---------|-----------|---------------------|--------|
| **Vercel** | $0 | $20 | Hobby plan sufficient initially |
| **Convex** | $0 | $25 | 1M function calls free |
| **Clerk** | $0 | $25 | 10K MAU free, then $0.02/MAU |
| **OpenAI** | $0-50 | $100-200 | GPT-3.5-turbo initially |
| **Airtable** | $0 | $20 | 50K records free |
| **Total** | **$0-50** | **$190-290** | Scale with usage |

### 3.2 AI Model Cost Optimization

```typescript
// Start with cheaper models, upgrade based on quality needs
const modelStrategy = {
  development: {
    model: 'gpt-3.5-turbo',
    costPer1K: '$0.002',
    quality: 'Good for 80% of queries'
  },
  production: {
    primary: 'gpt-3.5-turbo',
    fallback: 'gpt-4-turbo',
    upgrade: 'Use GPT-4 only for complex/ambiguous queries'
  },
  future: {
    model: 'gpt-4-turbo or Claude-3.5',
    when: 'After 1K active users or $500 MRR'
  }
};
```

## 4. Memory & Persistence (Cost-Effective Approach)

### 4.1 Phase 1: Session-Based Memory (Current)
```typescript
// Store conversation in Convex for session duration
interface SessionMemory {
  userId: string;
  sessionId: string;
  messages: Message[];
  profile: {
    year?: string;
    interests?: string[];
    major?: string;
  };
  expiresAt: Date; // 24 hours
}

// Simple session persistence
const sessionStore = {
  create: async (userId: string) => {
    return await convex.mutation(api.sessions.create, {
      userId,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });
  },
  
  update: async (sessionId: string, message: Message) => {
    return await convex.mutation(api.sessions.addMessage, {
      sessionId,
      message
    });
  },
  
  getRecent: async (userId: string) => {
    // Get last 24hr session if exists
    return await convex.query(api.sessions.getRecent, { userId });
  }
};
```

### 4.2 Phase 2: Basic Persistence (After Launch)
```typescript
// Store key user preferences in Convex
interface UserProfile {
  userId: string;
  email: string;
  createdAt: Date;
  preferences: {
    year?: string;
    major?: string;
    interests: string[];
    savedOpportunities: string[];
  };
  stats: {
    totalSessions: number;
    lastActive: Date;
    cardsClicked: number;
  };
}
```

### 4.3 Phase 3: Advanced Memory (Future - When Profitable)
```typescript
// Migration path to Mem0 or custom solution
interface FutureMemoryUpgrade {
  when: "1K paying users or $5K MRR",
  options: [
    {
      solution: "Mem0",
      cost: "$500-1000/month",
      benefits: "26% accuracy boost, 90% token savings"
    },
    {
      solution: "Custom vector DB",
      cost: "$100-300/month",
      benefits: "Full control, Pinecone/Weaviate"
    }
  ]
}
```

## 5. Core Features (MVP - Cost Conscious)

### 5.1 Conversational Interface
- **Simple chat UI** with Vercel AI SDK
- **Session-based context** (last 10 messages)
- **No long-term memory** initially
- **Profile captured in conversation** stored for session

### 5.2 Opportunity Database
- **Airtable free tier** (50K records)
- **Manual curation** of top 100 programs
- **Weekly manual updates** (no automated scraping initially)
- **User submissions** via Google Form

### 5.3 Browse & Filter
- **Static filters** from Convex queries
- **No AI-powered search** initially
- **Simple category/year/type filters**
- **Pagination** with 20 items per page

### 5.4 Save/Bookmark
- **Local storage** + Convex backup
- **No complex syncing** initially
- **Export to CSV** option

## 6. Development Phases

### Phase 0: Prototype (Week 1-2) - $0
- Basic Next.js + Convex setup
- Clerk email auth
- GPT-3.5-turbo integration
- 20 manually curated opportunities
- Deploy on Vercel hobby

### Phase 1: Beta (Week 3-4) - $0-50
- 100 opportunities in Airtable
- Email verification for @dartmouth.edu
- Basic browse/filter
- Session persistence
- 50 beta users

### Phase 2: Launch (Month 2) - $50-100
- Polish UI/UX
- Add saved items
- Basic analytics
- Marketing to 500 users
- Monitor costs closely

### Phase 3: Growth (Month 3+) - $200+
- Upgrade to GPT-4 selectively
- Add more schools
- Implement basic memory
- Consider Mem0 if profitable

## 7. Cost Monitoring & Optimization

### 7.1 Key Metrics to Track
```typescript
interface CostMetrics {
  dailyActiveUsers: number;
  avgMessagesPerUser: number;
  totalTokensUsed: number;
  costPerUser: number;
  convexFunctionCalls: number;
  vercelBandwidth: number;
}

// Alert thresholds
const costAlerts = {
  dailySpend: 10,      // Alert if > $10/day
  userCost: 0.50,      // Alert if > $0.50/user/month
  tokenUsage: 1000000  // Alert if > 1M tokens/day
};
```

### 7.2 Cost Optimization Strategies
1. **Cache common queries** in Convex
2. **Limit message length** to 500 tokens
3. **Rate limit** users to 50 messages/day
4. **Use GPT-3.5** for 90% of queries
5. **Static responses** for common questions
6. **Batch database operations**

## 8. Revenue Model (Future)

### 8.1 Potential Monetization
```typescript
const revenueOptions = {
  freemium: {
    free: "10 conversations/month",
    pro: "$4.99/month unlimited",
    target: "20% conversion = $1K MRR at 1K users"
  },
  institutional: {
    model: "Sell to Dartmouth directly",
    price: "$10K-50K/year",
    includes: "Support, analytics, custom features"
  },
  expansion: {
    model: "License to other schools",
    price: "$5K-20K/school/year",
    potential: "10 schools = $100K ARR"
  }
};
```

## 9. Migration Path to Advanced Features

### When to Add Memory (Mem0 or Alternative)
1. **Trigger Points:**
   - 1,000+ active users
   - $500+ MRR
   - User retention < 30%
   - Support requests about "remembering me"

2. **Cost-Benefit Analysis:**
   - Mem0 cost: ~$500-1000/month
   - Expected benefit: 30% retention increase
   - Break-even: 200 paying users at $5/month

### Implementation Strategy
```typescript
// Gradual rollout
const memoryRollout = {
  phase1: "Test with 10% of power users",
  phase2: "Enable for paying users only",
  phase3: "Roll out to all users",
  fallback: "Always maintain session-only mode"
};
```

## 10. Technical Debt Acceptance

### What We're Consciously Skipping (For Now)
1. **No real-time collaboration** features
2. **No mobile app** (responsive web only)
3. **No advanced analytics** (basic Vercel Analytics)
4. **No A/B testing** framework
5. **No microservices** (monolithic Next.js)
6. **No CDN for assets** (Vercel's included CDN only)
7. **No background job queue** (use Convex scheduled functions)

### Why This is OK
- **Speed to market** is critical
- **User feedback** will guide investment
- **Technical debt** can be paid when profitable
- **Simple architecture** = fewer bugs

## 11. Success Metrics (Realistic)

### Month 1 Goals
- 100 users signed up
- 500 conversations
- < $50 total spend
- 4.0+ user satisfaction

### Month 3 Goals
- 500 active users
- 5,000 conversations
- < $200 total spend
- 30% weekly retention
- 10 paying users ($50 MRR)

### Month 6 Goals
- 2,000 users
- Consider memory layer
- $500 MRR
- Institutional discussion

## 12. Appendix: Detailed Cost Breakdown

### Per-User Economics
```typescript
const perUserCost = {
  // Assuming 10 messages/user/month
  ai: {
    tokens: 5000,           // ~10 conversations
    cost: '$0.01',          // GPT-3.5-turbo
  },
  infrastructure: {
    convex: '$0.002',       // Database + functions
    vercel: '$0.001',       // Hosting
    clerk: '$0',            // Free tier
  },
  total: '$0.013/user/month',
  
  // At scale (1K users)
  atScale: '$0.05/user/month',
  
  // Break-even price point
  minPrice: '$0.10/user/month',
  suggestedPrice: '$4.99/user/month'
};
```

This cost-optimized approach allows you to launch with minimal expenses while maintaining a clear upgrade path as the platform grows.