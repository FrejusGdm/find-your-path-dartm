import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Get current authenticated user (read-only)
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .first()

    return user // Returns null if user doesn't exist
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

// Get or create user based on current authentication
export const getOrCreateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .first()

    if (existingUser) {
      return existingUser
    }

    // Create new user if doesn't exist
    const now = Date.now()
    const newUserId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: identity.email || "",
      name: identity.name,
      imageUrl: identity.pictureUrl,
      interests: [],
      hasCompletedOnboarding: false,
      createdAt: now,
      updatedAt: now,
    })

    return await ctx.db.get(newUserId)
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
    genzMode: v.optional(v.boolean()),
    shareNameWithAI: v.optional(v.boolean()),
    hasCompletedOnboarding: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
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
      genzMode: user.genzMode,
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
    shareNameWithAI: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
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

// Admin functions
export const isCurrentUserAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return false
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .first()

    return user?.isAdmin ?? false
  },
})

export const makeUserAdmin = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Check if current user is admin
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .first()

    if (!currentUser?.isAdmin) {
      throw new Error("Only admins can make other users admin")
    }

    // Find user by email and make them admin
    const userToUpdate = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first()

    if (!userToUpdate) {
      throw new Error("User not found")
    }

    await ctx.db.patch(userToUpdate._id, {
      isAdmin: true,
      updatedAt: Date.now(),
    })

    return await ctx.db.get(userToUpdate._id)
  },
})

export const requireAdmin = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error("Not authenticated")
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .first()

  if (!user?.isAdmin) {
    throw new Error("Admin access required")
  }

  return user
}

// One-time bootstrap function to create the first admin
// This only works if no admins exist in the system
export const bootstrapFirstAdmin = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if any admins already exist
    const existingAdmins = await ctx.db
      .query("users")
      .collect()

    const hasAdmin = existingAdmins.some(user => user.isAdmin === true)

    if (hasAdmin) {
      throw new Error("Admin already exists in the system. Use makeUserAdmin function instead.")
    }

    // Find the user by email
    const userToMakeAdmin = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first()

    if (!userToMakeAdmin) {
      throw new Error(`User with email ${args.email} not found. Please ensure the user has signed up first.`)
    }

    // Make them admin
    await ctx.db.patch(userToMakeAdmin._id, {
      isAdmin: true,
      updatedAt: Date.now(),
    })

    return {
      success: true,
      message: `Successfully made ${args.email} an admin`,
      userId: userToMakeAdmin._id,
    }
  },
})