import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { auth } from "./auth"

// Get current authenticated user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await auth.getUserIdentity(ctx)
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first()

    if (!user) {
      // Create user if doesn't exist
      const now = Date.now()
      const newUser = await ctx.db.insert("users", {
        clerkId: identity.subject,
        email: identity.email || "",
        name: identity.name,
        imageUrl: identity.pictureUrl,
        interests: [],
        hasCompletedOnboarding: false,
        createdAt: now,
        updatedAt: now,
      })
      
      return await ctx.db.get(newUser)
    }

    return user
  },
})

// Create a new user
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email || "",
      name: args.name,
      imageUrl: args.imageUrl,
      interests: [],
      hasCompletedOnboarding: false,
      createdAt: now,
      updatedAt: now,
    })

    return await ctx.db.get(userId)
  },
})

// Update user profile
export const updateProfile = mutation({
  args: {
    year: v.optional(v.union(
      v.literal("first-year"),
      v.literal("sophomore"), 
      v.literal("junior"),
      v.literal("senior"),
      v.literal("graduate"),
      v.literal("other")
    )),
    major: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    goals: v.optional(v.string()),
    isInternational: v.optional(v.boolean()),
    isFirstGen: v.optional(v.boolean()),
    confidenceLevel: v.optional(v.number()),
    hasCompletedOnboarding: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await auth.getUserIdentity(ctx)
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    await ctx.db.patch(user._id, {
      ...args,
      updatedAt: Date.now(),
    })

    return await ctx.db.get(user._id)
  },
})

// Get user context for AI personalization
export const getUserContext = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      return null
    }

    // Get recent conversations to understand interests
    const recentConversations = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(3)

    // Extract topics from recent conversations
    const previousTopics = recentConversations
      .flatMap(conv => conv.extractedProfile?.interests || [])
      .filter((topic, index, arr) => arr.indexOf(topic) === index) // Deduplicate
      .slice(0, 5) // Limit to top 5

    return {
      year: user.year,
      major: user.major,
      interests: user.interests,
      goals: user.goals,
      isInternational: user.isInternational,
      isFirstGen: user.isFirstGen,
      confidenceLevel: user.confidenceLevel,
      previousTopics,
      lastActive: user.lastActiveAt,
    }
  },
})

// Update user profile based on conversation content
export const updateUserFromConversation = mutation({
  args: {
    userId: v.id("users"),
    message: v.string(),
    aiResponse: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error("User not found")
    }

    // Simple extraction of user info from conversation
    // In a real app, you'd use more sophisticated NLP or the AI to extract this
    const updates: any = {
      lastActiveAt: Date.now(),
      updatedAt: Date.now(),
    }

    // Extract year mentions
    const yearMatch = args.message.match(/(first.year|sophomore|junior|senior|grad|graduate)/i)
    if (yearMatch && !user.year) {
      const yearMap: Record<string, any> = {
        'first-year': 'first-year',
        'first year': 'first-year',
        'freshman': 'first-year',
        'sophomore': 'sophomore',
        'junior': 'junior',
        'senior': 'senior',
        'grad': 'graduate',
        'graduate': 'graduate'
      }
      updates.year = yearMap[yearMatch[1].toLowerCase()]
    }

    // Extract interest mentions
    const interests = user.interests || []
    const newInterests = []
    
    // Common academic interests
    const interestPatterns = [
      /biology|bio/i,
      /computer science|cs|programming/i,
      /psychology|psych/i,
      /neuroscience|neuro/i,
      /engineering/i,
      /research/i,
      /medicine|medical|pre.?med/i,
      /physics/i,
      /chemistry|chem/i,
      /mathematics|math/i,
      /history/i,
      /literature|english/i,
      /economics|econ/i,
      /political science|government/i,
    ]

    for (const pattern of interestPatterns) {
      if (pattern.test(args.message) && !interests.some(interest => 
        interest.toLowerCase().includes(pattern.source.split('|')[0].toLowerCase())
      )) {
        const match = args.message.match(pattern)
        if (match) {
          newInterests.push(match[0])
        }
      }
    }

    if (newInterests.length > 0) {
      updates.interests = [...interests, ...newInterests].slice(0, 10) // Limit to 10 interests
    }

    // Update user if we found new information
    if (Object.keys(updates).length > 2) { // More than just timestamps
      await ctx.db.patch(user._id, updates)
    } else {
      // Just update timestamps
      await ctx.db.patch(user._id, {
        lastActiveAt: Date.now(),
        updatedAt: Date.now(),
      })
    }

    return await ctx.db.get(user._id)
  },
})

// Complete onboarding
export const completeOnboarding = mutation({
  args: {
    year: v.union(
      v.literal("first-year"),
      v.literal("sophomore"), 
      v.literal("junior"),
      v.literal("senior"),
      v.literal("graduate"),
      v.literal("other")
    ),
    major: v.optional(v.string()),
    interests: v.array(v.string()),
    goals: v.optional(v.string()),
    isInternational: v.optional(v.boolean()),
    isFirstGen: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await auth.getUserIdentity(ctx)
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    await ctx.db.patch(user._id, {
      ...args,
      hasCompletedOnboarding: true,
      updatedAt: Date.now(),
    })

    return await ctx.db.get(user._id)
  },
})