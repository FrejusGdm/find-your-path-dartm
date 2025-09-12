# Find Your Path — Final User Flow v3.0 (Mem0 + Simple Auth)

## Core Experience Flow

### 1. First-Time User Journey
```
Landing Page → Email Entry → Verification → Profile Chat → AI Recommendations → Browse/Save
```

### 2. Returning User Journey  
```
Auto-Login → Personalized Greeting → Context-Aware Chat → Memory-Enhanced Recommendations
```

## Detailed Flows

### Authentication (Simplified)
1. **Entry:** "Continue with Email" 
2. **Email:** User enters dartmouth.edu email
3. **Verification:** Clerk sends magic link/OTP
4. **Validation:** System checks @dartmouth.edu domain
5. **Access:** Grant access or show waitlist for non-Dartmouth

### First Conversation (Mem0 Learning)
```typescript
// Progressive profile building with memory capture
const firstChat = {
  greeting: "Hey! I'm here to help you discover opportunities at Dartmouth. What year are you?",
  
  capture: async (response) => {
    await mem0.add({
      messages: [{ role: 'user', content: response }],
      user_id: userId,
      category: 'profile'
    });
    
    // Extract structured data
    const year = extractYear(response);
    if (year) {
      await mem0.add({
        messages: [{ role: 'system', content: `User is a ${year}` }],
        user_id: userId,
        category: 'profile'
      });
    }
  },
  
  followUp: "Nice! What gets you excited? Could be academics, career goals, or just curiosity about something."
};
```

### Memory-Enhanced Conversations
```typescript
// Each interaction builds on previous context
const conversationFlow = {
  greeting: async (userId: string) => {
    const context = await mem0.get(userId);
    
    if (context.visits === 1) {
      return "Welcome back! Ready to dive deeper?";
    } else if (context.recentSaves?.length > 0) {
      return `Hey again! I see you saved ${context.recentSaves[0]} - found anything interesting there?`;
    } else {
      return `Good to see you! Last time you were exploring ${context.lastTopic} - want to continue or try something new?`;
    }
  },
  
  recommendations: async (query: string, userId: string) => {
    const memories = await mem0.search(userId, query);
    const personality = memories.find(m => m.category === 'personality');
    
    const cards = await generateCards(query, {
      userContext: memories,
      tone: personality?.preferred_style || 'friendly',
      experience_level: memories.find(m => m.category === 'experience')?.level || 'beginner'
    });
    
    return cards;
  }
};
```

## User Interface Patterns

### Chat Interface with Memory Indicators
```typescript
const ChatMessage = ({ message, memories }) => (
  <div className="message-container">
    <div className="message-content">{message.content}</div>
    
    {/* Show when AI uses personal context */}
    {message.usedMemories && (
      <div className="context-indicator">
        <Icon name="brain" size="sm" />
        <span>Remembered your interest in {message.usedMemories[0]}</span>
      </div>
    )}
  </div>
);
```

### Memory Dashboard (Optional)
```typescript
const MemoryDashboard = ({ userId }) => {
  const memories = useQuery(api.memories.getByUser, { userId });
  
  return (
    <div className="memory-dashboard">
      <h3>What I Remember About You</h3>
      
      <div className="memory-categories">
        <MemoryCard 
          title="Your Profile"
          items={memories.filter(m => m.category === 'profile')}
        />
        <MemoryCard 
          title="Your Interests" 
          items={memories.filter(m => m.category === 'interests')}
        />
        <MemoryCard 
          title="Your Journey"
          items={memories.filter(m => m.category === 'progress')}
        />
      </div>
      
      <button onClick={clearMemories}>Reset My Memory</button>
    </div>
  );
};
```

## Example Interactions

### Nervous First-Year
```
User: "im kinda scared to talk to professors about research"

AI Context: [Mem0 stores: nervous, first-year, interested in research]

Response: "Totally get that - most first-years feel the same way! Here's the thing though: professors LOVE when students show genuine interest. Want me to show you some low-pressure ways to start? I found 3 programs specifically designed for students in your situation."

[Mem0 stores: needs reassurance, prefers step-by-step guidance]
```

### Returning User Evolution
```
Visit 1: "I don't know what I want to do"
→ Mem0: Stores uncertainty, provides broad exploration

Visit 3: "I think I like neuroscience" 
→ Mem0: Updates interests, narrows recommendations

Visit 6: "Tell me about advanced neuro research"
→ Mem0: Notes progression, suggests challenging opportunities

Visit 10: "I want to apply to grad school"
→ Mem0: Celebrates journey, provides advanced pathways
```

### International Student Flow
```
User: "Are these opportunities open to international students?"

AI: [Mem0 checks if international status was mentioned before]
- New user: "Great question! Let me make sure to filter for international-friendly programs. Are you an international student?"
- Returning: "Yep, I remember you mentioned visa considerations. All these options welcome international students!"

[Mem0 stores: international status, visa concerns]
```

## Memory-Driven Features

### Smart Notifications
```typescript
// Personalized re-engagement based on memory
const smartNotifications = {
  deadlineReminders: "Remember that UGAR program you saved? Applications open next week!",
  newOpportunities: "Found a new CS research position - seems perfect based on your interests!",
  journeyMilestones: "You've explored 5 different areas this month - you're really finding your path!",
  encouragement: "Remember when you were nervous about emailing professors? Look how far you've come!"
};
```

### Contextual Browse Filtering
```typescript
// Pre-populate filters based on memory
const smartFilters = async (userId: string) => {
  const context = await mem0.get(userId);
  
  return {
    year: context.year,
    interests: context.interests?.slice(0, 3), // Top 3 interests
    internationalFriendly: context.international || false,
    preferredTypes: context.preferredOpportunityTypes || [],
    excludeSeen: context.viewedOpportunities || []
  };
};
```

### Progressive Complexity
```typescript
// Adjust recommendations based on user growth
const adaptiveRecommendations = {
  beginner: "Here are some beginner-friendly research opportunities",
  intermediate: "Ready for something more challenging? These need some background",
  advanced: "Based on your progress, you might be ready for these competitive programs"
};

// Memory determines user level
const getUserLevel = async (userId: string) => {
  const memories = await mem0.get(userId);
  const interactions = memories.filter(m => m.category === 'interactions').length;
  const savedItems = memories.filter(m => m.category === 'saved').length;
  const complexity = memories.find(m => m.category === 'complexity')?.level;
  
  if (interactions < 5) return 'beginner';
  if (savedItems > 10 || complexity === 'advanced') return 'advanced';
  return 'intermediate';
};
```

## Privacy & Transparency

### Memory Transparency
```typescript
const memoryTransparency = {
  // What users can see
  viewable: [
    "Your profile information",
    "Topics you've explored", 
    "Programs you've saved",
    "Conversation patterns I've learned"
  ],
  
  // What users can control
  controllable: [
    "Delete specific memories",
    "Pause memory collection temporarily",
    "Export all data",
    "Reset and start fresh"
  ],
  
  // Clear disclosure
  messaging: "I use memory to personalize your experience. You're always in control of your data."
};
```

## Technical Implementation Notes

### Mem0 Integration Points
1. **After each message:** Store valuable context
2. **Before each response:** Retrieve relevant memories  
3. **Profile updates:** Update structured memories
4. **Session end:** Summarize session insights
5. **Weekly:** Clean up outdated memories

### Performance Optimization
```typescript
const memoryOptimization = {
  // Batch memory operations
  batch: true,
  
  // Cache recent memories locally
  cacheRecent: 24 * 60 * 60 * 1000, // 24 hours
  
  // Lazy load memory dashboard
  loadMemoryDashboard: 'on-demand',
  
  // Compress old memories
  compression: {
    after: 30, // days
    strategy: 'summarize'
  }
};
```

This enhanced user flow creates a truly personalized experience where every interaction makes the system smarter and more helpful for each individual student.