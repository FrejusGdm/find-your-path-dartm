import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User profiles and authentication
  users: defineTable({
    clerkId: v.string(), // Clerk user ID
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    
    // Profile information
    year: v.optional(v.union(
      v.literal("first-year"),
      v.literal("sophomore"), 
      v.literal("junior"),
      v.literal("senior"),
      v.literal("graduate"),
      v.literal("other")
    )),
    major: v.optional(v.string()),
    interests: v.array(v.string()),
    goals: v.optional(v.string()),
    
    // Status flags
    isInternational: v.optional(v.boolean()),
    isFirstGen: v.optional(v.boolean()),
    confidenceLevel: v.optional(v.number()), // 1-5 scale
    genzMode: v.optional(v.boolean()), // GenZ communication mode preference

    // Admin and permissions
    isAdmin: v.optional(v.boolean()), // Admin access for dashboard management

    // Privacy settings
    shareNameWithAI: v.optional(v.boolean()), // Whether to share name with AI assistant (default: true)
    
    // Onboarding state
    hasCompletedOnboarding: v.boolean(),
    onboardingStep: v.optional(v.number()),
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
    lastActiveAt: v.optional(v.number()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_year", ["year"])
    .index("by_last_active", ["lastActiveAt"]),

  // Opportunity database
  opportunities: defineTable({
    // Basic info
    title: v.string(),
    description: v.string(),
    department: v.string(),
    category: v.string(), // "research", "internship", "grant", "program"
    
    // Eligibility
    eligibleYears: v.array(v.string()),
    eligibleMajors: v.optional(v.array(v.string())),
    internationalEligible: v.boolean(),
    gpaRequirement: v.optional(v.number()),
    
    // Details
    isPaid: v.boolean(),
    estimatedHours: v.optional(v.string()), // "5-10 hours/week"
    timeCommitment: v.optional(v.string()), // "semester", "summer", "year-long"
    
    // Contact and links
    officialUrl: v.string(),
    applicationUrl: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactName: v.optional(v.string()),
    contactRole: v.optional(v.string()),
    
    // Next steps
    nextSteps: v.array(v.string()), // Action items for students
    
    // Tags for filtering
    tags: v.array(v.string()),
    
    // Popularity metrics
    viewCount: v.number(),
    saveCount: v.number(),
    clickCount: v.number(),
    
    // Content management
    isActive: v.boolean(),
    lastVerified: v.optional(v.number()), // Manual admin verification timestamp
    urlStatus: v.optional(v.string()), // "working", "broken", "unchecked", "redirect"
    lastUrlCheck: v.optional(v.number()), // Automated URL check timestamp
    submittedBy: v.optional(v.string()), // User ID who submitted
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_department", ["department"])
    .index("by_year_eligible", ["eligibleYears"])
    .index("by_international", ["internationalEligible"])
    .index("by_paid", ["isPaid"])
    .index("by_active", ["isActive"])
    .index("by_popularity", ["saveCount"])
    .searchIndex("search_opportunities", {
      searchField: "title",
      filterFields: ["category", "department", "eligibleYears", "isActive"]
    }),

  // User conversation history
  conversations: defineTable({
    userId: v.id("users"),
    sessionId: v.string(),
    
    // Conversation metadata
    title: v.optional(v.string()), // Auto-generated conversation title
    isActive: v.boolean(),
    
    // Context captured from conversation
    extractedProfile: v.optional(v.object({
      year: v.optional(v.string()),
      interests: v.optional(v.array(v.string())),
      goals: v.optional(v.string()),
      major: v.optional(v.string()),
    })),
    
    // Analytics
    messageCount: v.number(),
    opportunitiesRecommended: v.array(v.id("opportunities")),
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
    lastMessageAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"])
    .index("by_active", ["isActive"])
    .index("by_last_message", ["lastMessageAt"]),

  // Individual chat messages
  messages: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    
    // Message content
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    
    // AI response metadata
    model: v.optional(v.string()), // "gpt-4", "claude-3.5-sonnet"
    tokensUsed: v.optional(v.number()),
    responseTime: v.optional(v.number()), // milliseconds
    
    // Context used
    memoryUsed: v.optional(v.array(v.string())), // Mem0 memories referenced
    opportunitiesReferenced: v.optional(v.array(v.id("opportunities"))),
    
    // Metadata
    createdAt: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_user", ["userId"])
    .index("by_role", ["role"])
    .index("by_created", ["createdAt"]),

  // Saved opportunities (bookmarks)
  savedOpportunities: defineTable({
    userId: v.id("users"),
    opportunityId: v.id("opportunities"),
    
    // User notes and status
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("interested"),
      v.literal("applied"),
      v.literal("contacted"),
      v.literal("archived")
    ),
    
    // Context of when saved
    savedFromConversation: v.optional(v.id("conversations")),
    savedReason: v.optional(v.string()), // Why they saved it
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_opportunity", ["opportunityId"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  // Memory entries for Mem0 integration
  memoryEntries: defineTable({
    userId: v.id("users"),
    
    // Memory content
    content: v.string(),
    category: v.union(
      v.literal("profile"),
      v.literal("interests"), 
      v.literal("goals"),
      v.literal("preferences"),
      v.literal("interactions"),
      v.literal("progress")
    ),
    
    // Memory metadata
    mem0Id: v.optional(v.string()), // Mem0's internal ID
    confidence: v.number(), // 0-1 confidence score
    source: v.string(), // "conversation", "profile_update", "behavior"
    
    // Usage tracking
    retrievalCount: v.number(),
    lastUsed: v.optional(v.number()),
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
    expiresAt: v.optional(v.number()), // For temporary memories
  })
    .index("by_user", ["userId"])
    .index("by_category", ["category"])
    .index("by_confidence", ["confidence"])
    .index("by_last_used", ["lastUsed"])
    .index("by_expires", ["expiresAt"]),

  // Analytics and usage tracking
  userAnalytics: defineTable({
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD format
    
    // Daily activity
    sessionsStarted: v.number(),
    messagesExchanged: v.number(),
    opportunitiesViewed: v.number(),
    opportunitiesSaved: v.number(),
    linksClicked: v.number(),
    
    // Engagement quality
    averageSessionLength: v.number(), // minutes
    conversationDepth: v.number(), // messages per session
    returnVisitor: v.boolean(),
    
    // AI performance
    aiResponseTime: v.number(), // average milliseconds
    userSatisfaction: v.optional(v.number()), // 1-5 rating if provided
    
    // Metadata
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["date"])
    .index("by_user_date", ["userId", "date"]),

  // User feedback and ratings
  feedback: defineTable({
    userId: v.id("users"),

    // Feedback details
    type: v.union(
      v.literal("rating"),
      v.literal("suggestion"),
      v.literal("bug_report"),
      v.literal("feature_request")
    ),
    content: v.string(),
    rating: v.optional(v.number()), // 1-5 stars

    // Context
    conversationId: v.optional(v.id("conversations")),
    opportunityId: v.optional(v.id("opportunities")),

    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("resolved"),
      v.literal("dismissed")
    ),

    // Metadata
    createdAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  // Wall of Advice - Student advice posts
  advicePosts: defineTable({
    // Content
    title: v.string(),
    content: v.string(), // Rich text/markdown content
    excerpt: v.optional(v.string()), // Auto-generated summary for cards

    // Author info - First name + anonymous system
    authorId: v.id("users"), // Always store for moderation
    authorFirstName: v.string(), // First name or "Anonymous"
    authorYear: v.optional(v.string()), // "Class of 2025", "Graduate Student", etc.
    authorMajor: v.optional(v.string()),
    isAnonymous: v.boolean(), // User choice for anonymity

    // Categorization
    category: v.string(), // "research", "internships", "study-abroad", "general"
    tags: v.array(v.string()), // ["first-gen", "international", "STEM", etc.]

    // Moderation & Quality (auto-publish system)
    isApproved: v.boolean(), // Default true for auto-publish
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
    .index("by_created", ["createdAt"]),

  // User interactions with advice posts
  adviceInteractions: defineTable({
    userId: v.id("users"),
    postId: v.id("advicePosts"),
    type: v.union(v.literal("like"), v.literal("bookmark"), v.literal("view")),
    createdAt: v.number(),
  })
    .index("by_user_post", ["userId", "postId"])
    .index("by_post_type", ["postId", "type"])
    .index("by_user_type", ["userId", "type"]),
});