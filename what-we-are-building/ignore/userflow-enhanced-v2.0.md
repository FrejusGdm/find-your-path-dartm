# Find Your Path — Enhanced User Flow & AI Interaction Spec v2.0

## 1. System Architecture Overview

### Core Components
* **Frontend:** Next.js 14 with Vercel AI SDK's useChat hook
* **Backend:** Convex for real-time data sync and persistence
* **AI Layer:** Vercel AI SDK Core with multi-provider support
* **Memory:** Mem0 for conversation persistence and personalization
* **Auth:** Clerk with Dartmouth SSO integration

## 2. User Onboarding Flow

### 2.1 Initial Landing Experience
```typescript
// Landing page with dynamic content based on time of day
interface LandingState {
  greeting: "Good morning" | "Good afternoon" | "Good evening";
  ctaText: "Discover Your Path at Dartmouth";
  socialProof: "Join 500+ students finding opportunities";
}
```

### 2.2 Authentication Flow
1. **Entry Point:** "Continue with Dartmouth Email" button
2. **Clerk OAuth:** Redirect to Dartmouth SSO
3. **Profile Check:** 
   - New user → Conversational onboarding
   - Returning user → Load context from Mem0
4. **Session Creation:** JWT with 24hr expiry

### 2.3 Conversational Onboarding (New Users)

#### Implementation with Vercel AI SDK
```typescript
// Progressive profile building through conversation
const onboardingFlow = {
  messages: [
    {
      role: 'assistant',
      content: "Hey! Welcome to Find Your Path 🎉 I'm here to help you discover amazing opportunities at Dartmouth. First up - what year are you?"
    },
    // User responds...
    {
      role: 'assistant', 
      content: "Nice! [Year] is a great time to explore. What gets you excited academically? Could be a subject, a career path, or just something you're curious about."
    },
    // Continue building profile naturally...
  ]
};
```

#### Profile Slots to Capture
* **Required:** Year, Primary interest area
* **Optional:** Major/intended major, Career goals, Research experience
* **Sensitive (with consent):** International status, First-gen status
* **Inferred:** Confidence level, Communication style preference

### 2.4 Beautiful Onboarding UI

#### Visual Design Elements
* **Progress Indicator:** Subtle dots showing conversation progress
* **Dynamic Backgrounds:** Gradient transitions based on responses
* **Micro-animations:** Smooth message appearances with Framer Motion
* **Skip Option:** "I'll explore on my own" always visible

#### Asset Generation Strategy
* **Hero Images:** Commission Dartmouth-specific illustrations
* **Category Icons:** Custom icon set for each department/area
* **Success Stories:** Student testimonial cards with avatars
* **No AI-generated images:** Maintain authenticity and avoid uncanny valley

## 3. Core Conversation Flows

### 3.1 AI Agent Configuration

#### System Prompt Structure
```typescript
const systemPrompt = `
You are a friendly Dartmouth upperclassman helping students discover opportunities.

CONTEXT:
- User is a ${user.year} interested in ${user.interests}
- Previous interactions: ${mem0.getContext(userId)}
- Available opportunities: ${opportunities.length} programs

PERSONALITY:
- Warm and encouraging, especially with nervous students
- Light Gen-Z language when user is casual
- Never use emojis unless user does first
- Maximum one joke per conversation

CONSTRAINTS:
- Always provide exactly 3 recommendations (unless fewer exist)
- Ask maximum 1 clarifying question before giving value
- Include concrete next steps for each recommendation
- Never mention deadlines or promise outcomes
`;
```

### 3.2 Intent Detection & Routing

#### Primary Intent Patterns
```typescript
interface IntentRouter {
  'explore.general': /tell me about|what opportunities|what can I do/i,
  'explore.research': /research|lab|professor|publication/i,
  'explore.paid': /money|paid|funding|grant|stipend/i,
  'explore.international': /international|visa|foreign student/i,
  'anxiety.professor': /nervous|scared|intimidated.*professor/i,
  'browse.request': /show me all|browse|list|database/i,
  'save.manage': /saved|bookmarks|my list/i
}
```

### 3.3 Streaming Response Pattern

#### Implementation with Vercel AI SDK
```typescript
// Real-time streaming with status indicators
export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // Retrieve user context from Mem0
  const context = await mem0.get(userId);
  
  // Stream response with Vercel AI SDK
  const result = await streamText({
    model: anthropic('claude-3-5-sonnet'),
    messages: [...context, ...messages],
    tools: {
      getOpportunities: {
        description: 'Fetch relevant opportunities',
        parameters: z.object({
          filters: z.object({
            year: z.string().optional(),
            area: z.string().optional(),
            type: z.string().optional()
          })
        }),
        execute: async ({ filters }) => {
          return await convex.query(api.opportunities.search, filters);
        }
      }
    },
    onFinish: async ({ text, usage }) => {
      // Store in Mem0 for future context
      await mem0.add({ 
        messages: [...messages, { role: 'assistant', content: text }],
        metadata: { usage, timestamp: Date.now() }
      }, userId);
    }
  });
  
  return result.toTextStreamResponse();
}
```

## 4. Recommendation Card System

### 4.1 Card Generation Pipeline

```typescript
interface OpportunityCard {
  // Core Information
  id: string;
  title: string;
  department: string;
  
  // Smart Eligibility Display
  eligibilityBadges: Badge[]; // "First-years", "International OK", etc.
  
  // Personalized Next Steps
  nextSteps: NextStep[]; // Tailored based on user profile
  
  // Trust Signals
  popularityIndicator?: "🔥 Popular" | "✨ Hidden Gem";
  successStories?: number; // "12 students from your year"
  
  // Actions
  primaryAction: "Visit Page" | "Email Contact" | "Save for Later";
  secondaryActions: Action[];
}

interface NextStep {
  icon: IconType;
  text: string;
  difficulty: "Easy" | "Medium" | "Advanced";
  timeEstimate?: string; // "5 min", "1 hour"
}
```

### 4.2 Smart Card Ranking

```typescript
// Ranking algorithm with personalization
function rankOpportunities(opportunities: Opportunity[], user: UserProfile): RankedOpportunity[] {
  return opportunities
    .map(opp => ({
      ...opp,
      score: calculateScore(opp, user)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function calculateScore(opp: Opportunity, user: UserProfile): number {
  let score = 0;
  
  // Profile match (40%)
  score += profileMatchScore(opp, user) * 0.4;
  
  // Mem0 historical preference (20%)
  score += mem0.getPreferenceScore(opp.category, user.id) * 0.2;
  
  // Popularity among similar users (20%)
  score += similarUserScore(opp, user) * 0.2;
  
  // Diversity bonus (20%) - avoid showing 3 similar programs
  score += diversityScore(opp, selectedOpps) * 0.2;
  
  return score;
}
```

## 5. Memory & Personalization System

### 5.1 Mem0 Integration Architecture

```typescript
// Memory layer configuration
const mem0Config = {
  vectorStore: 'convex', // Use Convex for vector storage
  llm: 'gpt-4-turbo',
  memoryTypes: {
    semantic: true,    // Concept understanding
    episodic: true,    // Specific conversations
    profile: true,     // User preferences
    behavioral: true   // Interaction patterns
  },
  retentionPolicy: {
    semantic: 'permanent',
    episodic: '90_days',
    profile: 'permanent',
    behavioral: '30_days'
  }
};
```

### 5.2 Context Building

```typescript
// Build rich context for each interaction
async function buildUserContext(userId: string): Promise<Context> {
  const memories = await mem0.search(userId, {
    limit: 10,
    relevanceThreshold: 0.7
  });
  
  return {
    profile: memories.profile,
    recentInterests: memories.episodic.slice(0, 3),
    preferences: memories.behavioral,
    lastSession: memories.lastSession,
    savedOpportunities: await convex.query(api.saved.getByUser, { userId })
  };
}
```

## 6. Browse & Filter Experience

### 6.1 Real-time Filtering with Convex

```typescript
// Reactive filtering with Convex subscriptions
const BrowseView = () => {
  const [filters, setFilters] = useState<Filters>({});
  
  // Real-time subscription to filtered results
  const opportunities = useQuery(
    api.opportunities.filtered,
    filters
  );
  
  // Pre-populate from conversation context
  useEffect(() => {
    const contextFilters = extractFiltersFromChat(messages);
    setFilters(contextFilters);
  }, [messages]);
  
  return (
    <div className="grid gap-4">
      <FilterBar 
        filters={filters} 
        onChange={setFilters}
        suggestions={getSmartSuggestions(userProfile)}
      />
      <OpportunityGrid 
        items={opportunities}
        loading={opportunities === undefined}
      />
    </div>
  );
};
```

### 6.2 Smart Filter Suggestions

```typescript
// Suggest filters based on user profile and behavior
function getSmartSuggestions(user: UserProfile): FilterSuggestion[] {
  const suggestions = [];
  
  if (user.year === 'First-year') {
    suggestions.push({
      label: 'First-year Friendly',
      filters: { yearEligible: 'first-year', difficulty: 'beginner' }
    });
  }
  
  if (user.international) {
    suggestions.push({
      label: 'International Student Eligible',
      filters: { internationalEligible: true, visaSponsorship: true }
    });
  }
  
  // Based on saved items
  const savedCategories = analyzeSavedItems(user.savedItems);
  savedCategories.forEach(cat => {
    suggestions.push({
      label: `More ${cat} opportunities`,
      filters: { category: cat }
    });
  });
  
  return suggestions;
}
```

## 7. Error Handling & Fallbacks

### 7.1 Graceful Degradation

```typescript
// Multi-level fallback strategy
const aiProviders = [
  { provider: 'anthropic', model: 'claude-3-5-sonnet', priority: 1 },
  { provider: 'openai', model: 'gpt-4-turbo', priority: 2 },
  { provider: 'openai', model: 'gpt-3.5-turbo', priority: 3 },
  { provider: 'static', model: 'curated-responses', priority: 4 } // Pre-written fallbacks
];

async function getAIResponse(prompt: string): Promise<Response> {
  for (const provider of aiProviders) {
    try {
      return await callProvider(provider, prompt);
    } catch (error) {
      logError(error, provider);
      continue;
    }
  }
  return getFallbackResponse(prompt);
}
```

### 7.2 User-Facing Error Messages

```typescript
const errorMessages = {
  aiUnavailable: "I'm having a quick coffee break ☕ Let me show you some popular opportunities instead!",
  searchFailed: "Hmm, my search skills need work. Try browsing all opportunities?",
  saveError: "Couldn't save that one - but I've copied the link for you!",
  authExpired: "Quick check - let's make sure you're still signed in."
};
```

## 8. Analytics & Learning

### 8.1 Interaction Tracking

```typescript
// Privacy-conscious analytics
interface InteractionEvent {
  type: 'message' | 'card_click' | 'save' | 'filter' | 'share';
  context: {
    sessionId: string;
    timestamp: number;
    userSegment: string; // Anonymized: "first-year-stem"
  };
  metadata: Record<string, any>;
}

// Track without PII
function trackInteraction(event: InteractionEvent) {
  // Convex analytics table
  convex.mutation(api.analytics.track, event);
  
  // Vercel Analytics for aggregates
  vercelAnalytics.track(event.type, event.metadata);
  
  // Update Mem0 behavioral memory
  mem0.updateBehavior(event.context.sessionId, event);
}
```

### 8.2 Model Performance Monitoring

```typescript
// Track AI quality metrics
interface QualityMetrics {
  responseRelevance: number; // 0-1 score
  cardClickRate: number;     // % cards clicked
  saveRate: number;           // % cards saved
  sessionContinuation: number; // % users who continue conversation
  feedbackScore?: number;     // Optional user rating
}

async function evaluateResponse(response: AIResponse, outcome: UserAction): Promise<QualityMetrics> {
  const metrics = calculateMetrics(response, outcome);
  
  // Store for model improvement
  await convex.mutation(api.ml.storeMetrics, {
    responseId: response.id,
    metrics,
    modelVersion: response.model
  });
  
  // Alert if quality drops
  if (metrics.responseRelevance < 0.7) {
    alertTeam('Low relevance score detected', { response, metrics });
  }
  
  return metrics;
}
```

## 9. Accessibility & Inclusivity

### 9.1 Accessibility Features

```typescript
// WCAG 2.1 AA Compliance
const accessibilityFeatures = {
  // Keyboard navigation
  keyboardShortcuts: {
    'Ctrl+K': 'Open search',
    'Ctrl+S': 'Save current card',
    'Ctrl+Enter': 'Send message',
    'Escape': 'Close modal'
  },
  
  // Screen reader support
  ariaLabels: {
    cards: 'Opportunity recommendation',
    chat: 'Conversation with AI assistant',
    filters: 'Browse filters'
  },
  
  // Visual accommodations
  themes: {
    default: 'Light mode',
    dark: 'Dark mode',
    highContrast: 'High contrast mode'
  },
  
  // Reduced motion option
  animations: {
    reduced: localStorage.getItem('prefers-reduced-motion') === 'true'
  }
};
```

### 9.2 Inclusive Language

```typescript
// Inclusive communication patterns
const inclusivePatterns = {
  // Avoid assumptions
  never: [
    "You must be excited about...",
    "Everyone knows that...",
    "It's easy to..."
  ],
  
  // Use inclusive alternatives
  replacements: {
    "guys": "everyone",
    "freshman": "first-year",
    "normal": "typical",
    "foreign": "international"
  },
  
  // Acknowledge different paths
  validations: [
    "That's a great question",
    "There's no wrong answer",
    "Everyone's path is different"
  ]
};
```

## 10. Mobile Experience

### 10.1 Responsive Design

```typescript
// Mobile-first responsive implementation
const MobileChatInterface = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  return (
    <div 
      className="flex flex-col h-screen"
      style={{ paddingBottom: keyboardHeight }}
    >
      <Header className="shrink-0" />
      <MessageList className="flex-1 overflow-y-auto" />
      <InputArea className="shrink-0 safe-area-inset-bottom" />
    </div>
  );
};
```

### 10.2 Touch Optimizations

```typescript
// Touch-friendly interactions
const touchOptimizations = {
  // Larger tap targets (min 44x44px)
  buttonSize: 'min-h-11 min-w-11',
  
  // Swipe gestures
  gestures: {
    swipeLeft: 'Show next card',
    swipeRight: 'Show previous card',
    swipeUp: 'Save opportunity',
    pullToRefresh: 'Refresh recommendations'
  },
  
  // Haptic feedback
  haptics: {
    save: 'light',
    send: 'medium',
    error: 'heavy'
  }
};
```

## 11. Performance Optimizations

### 11.1 Frontend Optimizations

```typescript
// Next.js performance features
const performanceConfig = {
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    sizes: [640, 828, 1200, 1920],
    loader: 'vercel'
  },
  
  // Code splitting
  dynamicImports: {
    Browse: dynamic(() => import('./Browse')),
    Profile: dynamic(() => import('./Profile')),
    Admin: dynamic(() => import('./Admin'))
  },
  
  // Prefetching
  prefetch: {
    opportunities: true,
    userProfile: true,
    savedItems: true
  }
};
```

### 11.2 Backend Optimizations

```typescript
// Convex query optimizations
const optimizedQueries = {
  // Indexed queries
  searchOpportunities: {
    index: 'by_year_and_category',
    cache: 300 // 5 minutes
  },
  
  // Batch operations
  batchSave: async (items: string[]) => {
    return ctx.db.batch(items.map(id => 
      ctx.db.insert('saved', { userId, opportunityId: id })
    ));
  },
  
  // Pagination
  paginatedBrowse: {
    pageSize: 20,
    cursor: 'createdAt'
  }
};
```

## 12. Example User Journeys

### 12.1 Nervous First-Year

```
User: "im kinda interested in research but idk where to start and professors seem scary"