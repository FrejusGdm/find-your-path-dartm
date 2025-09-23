import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Helper function to generate consistent message IDs
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Create a new message
export const createMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    model: v.optional(v.string()),
    tokensUsed: v.optional(v.number()),
    responseTime: v.optional(v.number()),
    toolCalls: v.optional(v.array(v.string())),
    opportunitiesReferenced: v.optional(v.array(v.id("opportunities"))),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      userId: args.userId,
      role: args.role,
      content: args.content,
      model: args.model,
      tokensUsed: args.tokensUsed,
      responseTime: args.responseTime,
      opportunitiesReferenced: args.opportunitiesReferenced,
      createdAt: Date.now(),
    })

    // Update conversation's last message time and message count
    const conversation = await ctx.db.get(args.conversationId)
    if (conversation) {
      await ctx.db.patch(args.conversationId, {
        lastMessageAt: Date.now(),
        messageCount: conversation.messageCount + 1,
        updatedAt: Date.now(),
      })
    }

    return await ctx.db.get(messageId)
  },
})

// Get messages for a conversation
export const getConversationMessages = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc") // Oldest first for chat display
      .take(args.limit || 100)
  },
})

// Get recent messages for a user across all conversations
export const getUserRecentMessages = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc") // Newest first
      .take(args.limit || 50)
  },
})

// Get conversation messages formatted for AI SDK UI
export const getConversationUIMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect()

    // Format messages for UI consumption
    return messages.map(msg => ({
      id: msg._id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt,
      model: msg.model,
      tokensUsed: msg.tokensUsed,
    }))
  },
})