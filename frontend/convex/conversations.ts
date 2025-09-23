import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { auth } from "./auth"

// Create a new conversation
export const createConversation = mutation({
  args: {
    userId: v.id("users"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const sessionId = `session_${now}_${Math.random().toString(36).substr(2, 9)}`

    const conversationId = await ctx.db.insert("conversations", {
      userId: args.userId,
      sessionId,
      title: args.title,
      isActive: true,
      messageCount: 0,
      opportunitiesRecommended: [],
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
    })

    return await ctx.db.get(conversationId)
  },
})

// Get conversation by ID
export const getConversationById = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId)
  },
})

// Update conversation title
export const updateConversationTitle = mutation({
  args: {
    conversationId: v.id("conversations"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      title: args.title,
      updatedAt: Date.now(),
    })
    return await ctx.db.get(args.conversationId)
  },
})

// Create or update conversation
export const createOrUpdateConversation = mutation({
  args: {
    userId: v.id("users"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    
    // Get the most recent active conversation for this user
    const activeConversation = await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .first()

    if (activeConversation && (now - activeConversation.lastMessageAt) < 30 * 60 * 1000) {
      // Continue existing conversation if last message was within 30 minutes
      await ctx.db.patch(activeConversation._id, {
        messageCount: activeConversation.messageCount + 1,
        lastMessageAt: now,
        updatedAt: now,
      })
      
      return activeConversation
    } else {
      // Create new conversation
      const sessionId = `session_${now}_${Math.random().toString(36).substr(2, 9)}`
      
      // Close any existing active conversations
      if (activeConversation) {
        await ctx.db.patch(activeConversation._id, { isActive: false })
      }
      
      const conversationId = await ctx.db.insert("conversations", {
        userId: args.userId,
        sessionId,
        isActive: true,
        messageCount: 1,
        opportunitiesRecommended: [],
        createdAt: now,
        updatedAt: now,
        lastMessageAt: now,
      })
      
      return await ctx.db.get(conversationId)
    }
  },
})

// Get conversation history for a user
export const getUserConversations = query({
  args: {
    userId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.userId) return []

    const userId = args.userId
    return await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit || 10)
  },
})

// Get active conversation for user
export const getActiveConversation = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .first()
  },
})

// Update conversation with extracted profile info
export const updateConversationProfile = mutation({
  args: {
    conversationId: v.id("conversations"),
    extractedProfile: v.object({
      year: v.optional(v.string()),
      interests: v.optional(v.array(v.string())),
      goals: v.optional(v.string()),
      major: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      extractedProfile: args.extractedProfile,
      updatedAt: Date.now(),
    })
  },
})