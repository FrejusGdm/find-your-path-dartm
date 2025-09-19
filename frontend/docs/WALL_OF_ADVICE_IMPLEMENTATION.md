# Wall of Advice - Implementation Plan

## 🎯 Overview
Pinterest-style advice sharing platform where Dartmouth students share experiences, tips, and insights about discovering opportunities on campus.

## 🗄️ Backend Implementation

### 1. Database Schema (Convex)

```typescript
// Add to frontend/convex/schema.ts
advicePosts: defineTable({
  // Content
  title: v.string(),
  content: v.string(), // Rich text/markdown
  excerpt: v.optional(v.string()), // Auto-generated summary for cards
  
  // Author info - FIRST NAME + ANONYMOUS SYSTEM
  authorId: v.id("users"), // Always store for moderation
  authorFirstName: v.string(), // First name or "Anonymous"
  authorYear: v.optional(v.string()), // "Class of 2025", "Graduate Student", etc.
  authorMajor: v.optional(v.string()),
  isAnonymous: v.boolean(), // User choice for anonymity
  
  // Categorization
  category: v.string(), // "research", "internships", "study-abroad", "general"
  tags: v.array(v.string()), // ["first-gen", "international", "STEM", etc.]
  
  // Moderation & Quality
  isApproved: v.boolean(),
  featured: v.boolean(),
  moderatorNotes: v.optional(v.string()),
  
  // Engagement
  likes: v.number(),
  views: v.number(),
  bookmarks: v.number(),
  
  // Metadata
  createdAt: v.number(),
  updatedAt: v.number(),
  publishedAt: v.optional(v.number()),
})
.index("by_category", ["category"])
.index("by_approved", ["isApproved"])
.index("by_featured", ["featured"])
.index("by_author", ["authorId"])
.index("by_published", ["publishedAt"])

// User interactions with advice posts
adviceInteractions: defineTable({
  userId: v.id("users"),
  postId: v.id("advicePosts"),
  type: v.union(v.literal("like"), v.literal("bookmark"), v.literal("view")),
  createdAt: v.number(),
})
.index("by_user_post", ["userId", "postId"])
.index("by_post_type", ["postId", "type"])
```

### 2. Convex Functions

```typescript
// frontend/convex/advice.ts
export const getAdvicePosts = query({
  args: {
    category: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Implementation for paginated, filtered advice posts
  }
})

export const submitAdvicePost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    isAnonymous: v.boolean(),
    authorYear: v.optional(v.string()),
    authorMajor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create new advice post (pending approval)
  }
})

export const likeAdvicePost = mutation({
  args: { postId: v.id("advicePosts") },
  handler: async (ctx, args) => {
    // Toggle like on advice post
  }
})
```

## 🎨 Frontend Implementation

### 1. Route Structure
```
app/advice/
├── page.tsx                 # Main wall of advice
├── submit/page.tsx          # Submission form
├── [id]/page.tsx           # Individual post detail
└── loading.tsx             # Loading state
```

### 2. Component Architecture
```
components/advice/
├── AdviceCard.tsx           # Pinterest-style card
├── AdviceGrid.tsx           # Masonry layout
├── AdviceFilters.tsx        # Category/tag filtering
├── AdviceSubmissionForm.tsx # Community contribution
├── AdviceDetail.tsx         # Full post view
├── AuthorDisplay.tsx        # Smart author display component
└── types.ts                 # TypeScript definitions
```

### 3. Author Display Strategy 🎭

**The Big Question: How do we handle user identity display?**

#### Option A: User Choice System (RECOMMENDED)
```typescript
interface AuthorDisplayProps {
  post: AdvicePost
  variant?: 'card' | 'detail' | 'compact'
}

// Smart component that respects user privacy choices
const AuthorDisplay = ({ post, variant = 'card' }: AuthorDisplayProps) => {
  if (post.isAnonymous) {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="w-8 h-8">
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">Anonymous Student</p>
          {post.authorYear && (
            <p className="text-sm text-muted-foreground">{post.authorYear}</p>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-2">
      <Avatar className="w-8 h-8">
        <AvatarFallback>{post.authorName[0]}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{post.authorName}</p>
        <p className="text-sm text-muted-foreground">
          {[post.authorYear, post.authorMajor].filter(Boolean).join(' • ')}
        </p>
      </div>
    </div>
  )
}
```

#### Privacy Levels:
1. **Full Anonymous**: "Anonymous Student, Class of 2025"
2. **Semi-Anonymous**: "Sarah M., Class of 2025, Computer Science"
3. **Full Name**: "Sarah Mitchell, Class of 2025, Computer Science"

### 4. Key Components

#### AdviceCard.tsx
```typescript
interface AdviceCardProps {
  post: AdvicePost
  onLike?: (postId: string) => void
  onBookmark?: (postId: string) => void
}

// Pinterest-style card with hover effects
// Variable height based on content
// Like/bookmark interactions
// Category badges
// Author display with privacy respect
```

#### AdviceGrid.tsx
```typescript
// Masonry layout using react-masonry-css
// Responsive breakpoints
// Infinite scroll/pagination
// Loading states
```

#### AdviceSubmissionForm.tsx
```typescript
// Rich text editor (TipTap)
// Category selection
// Tag input
// Privacy toggle (anonymous vs named)
// Preview mode
// Draft saving
```

### 5. Integration Points

#### Chat AI Enhancement
```typescript
// Add to existing chat tools
searchAdvicePosts: {
  description: 'Find relevant advice posts for user questions',
  inputSchema: z.object({
    query: z.string(),
    category: z.string().optional(),
  }),
  execute: async ({ query, category }) => {
    // Search advice posts and return relevant ones
    // Include in AI responses: "Other students have shared similar experiences..."
  }
}
```

#### Opportunities Cross-linking
- Link advice posts to related opportunities
- Show "Student Experiences" section on opportunity pages
- Suggest relevant advice when browsing opportunities

## 🚀 Implementation Phases

### Phase 1: Core Infrastructure
- [ ] Database schema
- [ ] Basic CRUD operations
- [ ] Simple card layout

### Phase 2: User Experience
- [ ] Masonry grid layout
- [ ] Filtering system
- [ ] Submission form

### Phase 3: Community Features
- [ ] Like/bookmark system
- [ ] Moderation interface
- [ ] Featured posts

### Phase 4: AI Integration
- [ ] Chat AI references advice posts
- [ ] Smart content suggestions
- [ ] Cross-linking with opportunities

## 🎨 Design Consistency

### Following Existing Patterns
- Use existing shadcn/ui components
- Match current color scheme (Dartmouth green, stone grays)
- Consistent typography and spacing
- Mobile-first responsive design
- Same card hover effects as OpportunityCard

### New Design Elements
- Masonry grid layout
- Rich text rendering
- Anonymous user avatars
- Category color coding
- Engagement indicators (likes, views)

## 🎭 Updated Privacy Strategy

### **Two Privacy Levels (No Full Names)**

1. **Anonymous**: "Anonymous Student, Class of 2025, Computer Science"
   - For sensitive topics (mental health, academic struggles, etc.)
   - Protects student identity completely

2. **First Name**: "Sarah, Class of 2025, Computer Science"
   - Provides accountability while maintaining privacy
   - Builds trust without full exposure
   - **Default option** - encourages quality content

### **Content Moderation - Auto-Publish + Reactive**
- **Posts go live immediately** (less admin work)
- You can delete/hide problematic content later
- Clear content guidelines (no political content)
- Report button for community flagging
- First names create natural accountability

## 📝 Current Onboarding Data Analysis

### **What We Already Collect:**
✅ **firstName** (from Clerk) - Perfect for advice posts!
✅ **year** - "first-year", "sophomore", "junior", "senior", "graduate", "other"
✅ **major** - Free text field (e.g., "Computer Science", "Undeclared")
✅ **interests** - Array of strings
✅ **goals** - Free text
✅ **isInternational** - Boolean (optional)
✅ **isFirstGen** - Boolean (optional)

### **For Wall of Advice, We Have Everything We Need!**

**Author Display Logic:**
```typescript
// We can build display names from existing data:
const getAuthorDisplay = (user: User, isAnonymous: boolean) => {
  if (isAnonymous) {
    return {
      name: "Anonymous Student",
      year: user.year ? formatYear(user.year) : undefined,
      major: user.major
    }
  }

  return {
    name: user.firstName, // From Clerk
    year: user.year ? formatYear(user.year) : undefined,
    major: user.major
  }
}

const formatYear = (year: string) => {
  const yearMap = {
    "first-year": "Class of 2028",
    "sophomore": "Class of 2027",
    "junior": "Class of 2026",
    "senior": "Class of 2025",
    "graduate": "Graduate Student",
    "other": "Student"
  }
  return yearMap[year] || "Student"
}
```

### **No Onboarding Changes Needed!**
Our current onboarding already collects:
- First name (from Clerk signup)
- Year/class standing
- Major (including "Undeclared")
- Interests and goals

This is perfect for advice post attribution without needing additional data collection.

## 🔒 Privacy & Moderation

### Content Guidelines
```
✅ Share experiences, tips, honest advice about academics, opportunities, relationships
✅ Be respectful and constructive
✅ Use first name for accountability (or go anonymous for sensitive topics)

❌ No political content or controversial social issues
❌ No personal attacks or identifying others without permission
❌ No spam or promotional content
```

### Moderation System
- **Auto-publish**: Posts go live immediately
- **Reactive moderation**: Admin can delete/hide problematic posts
- **Community reporting**: Report button for flagging issues
- **Natural accountability**: First names discourage bad behavior

---

**Next Steps**: Start with Phase 1 - database schema and basic components, then iterate based on user feedback and engagement patterns.

**Key Decision**: No onboarding changes needed - we already have all the data required for great advice post attribution!
