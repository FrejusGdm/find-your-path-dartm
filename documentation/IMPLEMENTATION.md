# Find Your Path - Implementation Documentation

## 🚀 Project Overview

Find Your Path is an AI-powered conversational platform that helps Dartmouth students discover academic opportunities like research positions, grants, internships, and programs. Built with modern technologies and a focus on personalization through memory.

## 🏗️ Architecture

### Frontend Stack
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **shadcn/ui** components
- **Clerk** for authentication
- **Vercel AI SDK** for chat interface
- **Convex React** for real-time data

### Backend Stack
- **Convex** as primary backend (real-time database + serverless functions)
- **Clerk** for user authentication
- **OpenAI GPT-4 Turbo** for AI responses
- **Mem0** for conversation memory and personalization

## 📁 Project Structure

```
frontend/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Main chat API endpoint
│   ├── chat/
│   │   └── page.tsx              # Main chat interface
│   ├── sign-in/
│   └── sign-up/                  # Authentication pages
├── components/
│   ├── chat/                     # Chat-related components
│   │   ├── chat-interface.tsx
│   │   ├── message-list.tsx
│   │   ├── user-message.tsx
│   │   ├── assistant-message.tsx
│   │   ├── welcome-message.tsx
│   │   └── opportunity-card.tsx
│   ├── onboarding/
│   │   └── onboarding-flow.tsx
│   └── ui/                       # Reusable UI components
├── convex/
│   ├── schema.ts                 # Database schema
│   ├── users.ts                  # User management functions
│   ├── conversations.ts          # Chat conversation functions
│   ├── messages.ts               # Message storage functions
│   ├── opportunities.ts          # Opportunity database functions
│   └── analytics.ts              # Usage analytics functions
├── lib/
│   ├── utils.ts                  # Utility functions
│   └── mem0.ts                   # Memory management integration
└── providers/
    └── convex-provider.tsx       # Convex React provider
```

## 🔑 Key Features Implemented

### 1. Authentication & Onboarding
- **Clerk Integration**: Email-based authentication with @dartmouth.edu validation
- **Beautiful Onboarding**: 5-step conversational profile building
- **Progressive Profiling**: Captures year, major, interests, goals, and status

### 2. AI-Powered Chat Interface
- **Vercel AI SDK**: Streaming responses with real-time updates
- **Smart System Prompts**: Context-aware AI with Dartmouth-specific knowledge
- **Tool Integration**: AI can search opportunities and provide structured responses
- **Memory Integration**: Conversations inform future interactions through Mem0

### 3. Opportunity Database
- **Comprehensive Schema**: Full opportunity metadata with eligibility, contacts, next steps
- **Smart Search**: Vector search with filtering by year, department, type, etc.
- **Seeded Data**: Initial opportunities (URAP, WISP, FYREE) already included
- **Analytics Tracking**: View counts, save rates, click-through tracking

### 4. Personalization with Mem0
- **Conversation Memory**: Remembers user profile, interests, and preferences
- **Context Building**: Enriches AI responses with past interaction insights
- **Smart Extraction**: Automatically extracts key information from conversations
- **Progressive Learning**: Gets smarter about each user over time

### 5. Real-time Data with Convex
- **Live Sync**: All data updates in real-time across clients
- **Type-Safe Queries**: Full TypeScript support for database operations
- **Serverless Functions**: Backend logic runs on Convex edge functions
- **Offline Support**: Built-in offline capabilities

## 🔧 Technical Implementation Details

### Database Schema
```typescript
// Key tables in Convex schema:
- users: User profiles and preferences
- opportunities: Program/research opportunity database
- conversations: Chat session management
- messages: Individual chat messages
- savedOpportunities: User bookmarks
- memoryEntries: Mem0 integration data
- userAnalytics: Usage tracking
```

### AI Integration
```typescript
// Chat API Flow:
1. User sends message via useChat hook
2. API builds personalized context (Convex + Mem0)
3. Streams response using Vercel AI SDK
4. Stores conversation in Convex
5. Extracts insights for Mem0 memory
6. Tracks analytics
```

### Memory Management
```typescript
// Mem0 Integration:
- Profile memories (year, major, status)
- Interest memories (subjects, career goals)
- Preference memories (communication style)
- Interaction memories (conversation patterns)
- Goal memories (explicit objectives)
```

## 🎨 Design System

### Color Palette
- **Primary**: Dartmouth Green (#00693e)
- **Background**: Stone-25 (#f7f7f7)
- **Text**: Rich Black (#0b0f0e)
- **Muted**: Stone tones for secondary text

### Typography
- **Display**: Ancizar Serif (headings)
- **Body**: Inter (primary text)
- **Accent**: Rouge Script (brand elements)

### Component Library
- Built on **Radix UI** primitives
- **shadcn/ui** component system
- **Tailwind CSS** for styling
- **Linear/Notion** aesthetic inspiration

## 🔐 Security & Privacy

### Authentication
- Clerk handles all auth flows
- No passwords stored locally
- JWT tokens with expiration
- Dartmouth email domain validation

### Data Protection
- No sensitive personal data collection
- Encrypted data at rest (Convex)
- GDPR-compliant data handling
- User can delete all data

### Rate Limiting
- 100 messages per user per day
- API request throttling
- Abuse prevention measures

## 📊 Analytics & Monitoring

### User Analytics
```typescript
// Tracked metrics:
- Daily/monthly active users
- Messages per session
- Opportunity views and saves
- Link click-through rates
- User retention rates
```

### Performance Monitoring
- Response time tracking
- Token usage monitoring
- Error rate tracking
- System performance metrics

## 🚀 Deployment

### Environment Variables Required
```bash
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# AI Provider
OPENAI_API_KEY=sk-...

# Memory Layer
MEM0_API_KEY=mem0_...

# Analytics
VERCEL_ANALYTICS_ID=prj_...
```

### Deployment Steps
1. **Convex Setup**: 
   ```bash
   cd frontend
   npx convex dev
   npx convex deploy
   ```

2. **Clerk Configuration**:
   - Create Clerk application
   - Configure OAuth settings
   - Set up webhooks (optional)

3. **Vercel Deployment**:
   ```bash
   vercel --prod
   ```

4. **Environment Configuration**:
   - Set all required environment variables
   - Configure custom domains
   - Set up monitoring

## 🧪 Testing

### Unit Tests
- Component testing with Vitest
- API endpoint testing
- Utility function testing

### Integration Tests
- E2E chat flow testing
- Authentication flow testing
- Database operation testing

### Performance Tests
- Load testing with multiple users
- Response time benchmarking
- Memory usage profiling

## 📈 Scaling Considerations

### Current Capacity
- **Users**: 10K+ concurrent users
- **Messages**: 100K+ per day
- **Storage**: Unlimited (Convex scaling)

### Optimization Strategies
- Convex query optimization
- AI response caching
- CDN for static assets
- Image optimization

## 🔮 Future Enhancements

### Phase 2 Features
- Browse page for opportunity discovery
- Saved items dashboard
- Advanced filtering and search
- Email notifications

### Phase 3 Features
- Professor matching algorithm
- Peer mentorship connections
- Success story showcases
- Mobile app (React Native)

### Advanced Features
- Multi-language support
- Voice interface
- Integration with Dartmouth systems
- Advanced analytics dashboard

## 📚 API Reference

### Chat API
```typescript
POST /api/chat
{
  messages: Message[]
}

Response: Streaming text with tool calls
```

### Convex Functions
```typescript
// User management
api.users.getCurrentUser()
api.users.updateProfile(data)
api.users.completeOnboarding(data)

// Opportunities
api.opportunities.searchOpportunities(query, filters)
api.opportunities.getById(id)

// Analytics
api.analytics.trackChatMessage(data)
api.analytics.trackOpportunityView(data)
```

## 🤝 Contributing

### Code Style
- TypeScript strict mode
- ESLint + Prettier configuration
- Consistent naming conventions
- Comprehensive error handling

### Development Workflow
1. Feature branch creation
2. Implementation with tests
3. Code review process
4. Deployment to staging
5. Production deployment

## 📞 Support

### Troubleshooting
- Check environment variables
- Verify Convex deployment status
- Monitor error logs
- Check API rate limits

### Common Issues
- Authentication failures → Check Clerk configuration
- AI not responding → Verify OpenAI API key
- Real-time updates failing → Check Convex connection
- Memory not working → Verify Mem0 API key

---

**Built with ❤️ for Dartmouth students**