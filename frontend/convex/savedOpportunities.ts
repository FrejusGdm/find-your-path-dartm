import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { getCurrentUserOrThrow } from "./users"

// Save/bookmark an opportunity
export const saveOpportunity = mutation({
  args: {
    opportunityId: v.id("opportunities"),
    savedReason: v.optional(v.string()),
    savedFromConversation: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)
    const now = Date.now()

    // Check if already saved
    const existing = await ctx.db
      .query("savedOpportunities")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("opportunityId"), args.opportunityId))
      .first()

    if (existing) {
      throw new Error("Opportunity already saved")
    }

    // Get the opportunity to increment saveCount
    const opportunity = await ctx.db.get(args.opportunityId)
    if (!opportunity) {
      throw new Error("Opportunity not found")
    }

    // Create saved opportunity record
    const savedOpportunityId = await ctx.db.insert("savedOpportunities", {
      userId: user._id,
      opportunityId: args.opportunityId,
      status: "interested",
      savedFromConversation: args.savedFromConversation,
      savedReason: args.savedReason,
      createdAt: now,
      updatedAt: now,
    })

    // Increment saveCount on the opportunity
    await ctx.db.patch(args.opportunityId, {
      saveCount: opportunity.saveCount + 1,
      updatedAt: now,
    })

    // Track analytics
    await ctx.db.insert("userAnalytics", {
      userId: user._id,
      date: new Date().toISOString().split('T')[0],
      sessionsStarted: 0,
      opportunitiesSaved: 1,
      messagesExchanged: 0,
      opportunitiesViewed: 0,
      linksClicked: 0,
      averageSessionLength: 0,
      conversationDepth: 0,
      returnVisitor: false,
      aiResponseTime: 0,
      createdAt: now,
    })

    return await ctx.db.get(savedOpportunityId)
  },
})

// Unsave/unbookmark an opportunity
export const unsaveOpportunity = mutation({
  args: {
    opportunityId: v.id("opportunities"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)

    // Find the saved opportunity record
    const savedOpportunity = await ctx.db
      .query("savedOpportunities")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("opportunityId"), args.opportunityId))
      .first()

    if (!savedOpportunity) {
      throw new Error("Opportunity not saved")
    }

    // Get the opportunity to decrement saveCount
    const opportunity = await ctx.db.get(args.opportunityId)
    if (!opportunity) {
      throw new Error("Opportunity not found")
    }

    // Remove saved opportunity record
    await ctx.db.delete(savedOpportunity._id)

    // Decrement saveCount on the opportunity
    await ctx.db.patch(args.opportunityId, {
      saveCount: Math.max(0, opportunity.saveCount - 1),
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

// Get user's saved opportunities with full opportunity details
export const getUserSavedOpportunities = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)

    const savedOpportunities = await ctx.db
      .query("savedOpportunities")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit || 50)

    // Get full opportunity details for each saved opportunity
    const enrichedSavedOpportunities = await Promise.all(
      savedOpportunities.map(async (saved) => {
        const opportunity = await ctx.db.get(saved.opportunityId)
        return {
          ...saved,
          opportunity,
        }
      })
    )

    return enrichedSavedOpportunities.filter(item => item.opportunity) // Filter out deleted opportunities
  },
})


// Add or update notes for a saved opportunity
export const updateSavedOpportunityNotes = mutation({
  args: {
    opportunityId: v.id("opportunities"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)

    // Find the saved opportunity record
    const savedOpportunity = await ctx.db
      .query("savedOpportunities")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("opportunityId"), args.opportunityId))
      .first()

    if (!savedOpportunity) {
      throw new Error("Opportunity not saved")
    }

    // Update the notes
    await ctx.db.patch(savedOpportunity._id, {
      notes: args.notes,
      updatedAt: Date.now(),
    })

    return await ctx.db.get(savedOpportunity._id)
  },
})

// Check if an opportunity is saved by the current user
export const isOpportunitySaved = query({
  args: {
    opportunityId: v.id("opportunities"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)

    const savedOpportunity = await ctx.db
      .query("savedOpportunities")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("opportunityId"), args.opportunityId))
      .first()

    return !!savedOpportunity
  },
})

// Get saved status for multiple opportunities (for bulk checking)
export const getOpportunitiesSavedStatus = query({
  args: {
    opportunityIds: v.array(v.id("opportunities")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)

    const savedOpportunities = await ctx.db
      .query("savedOpportunities")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    const savedOpportunityIds = new Set(
      savedOpportunities.map(saved => saved.opportunityId)
    )

    const result: Record<string, boolean> = {}
    for (const opportunityId of args.opportunityIds) {
      result[opportunityId] = savedOpportunityIds.has(opportunityId)
    }

    return result
  },
})

// Get saved opportunity details with context
export const getSavedOpportunityDetails = query({
  args: {
    opportunityId: v.id("opportunities"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)

    const savedOpportunity = await ctx.db
      .query("savedOpportunities")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("opportunityId"), args.opportunityId))
      .first()

    if (!savedOpportunity) {
      return null
    }

    const opportunity = await ctx.db.get(savedOpportunity.opportunityId)

    return {
      ...savedOpportunity,
      opportunity,
    }
  },
})

// Get summary statistics of saved opportunities
export const getSavedOpportunitiesSummary = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx)

    const allSaved = await ctx.db
      .query("savedOpportunities")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    const summary = {
      total: allSaved.length,
      interested: allSaved.filter(s => s.status === "interested").length,
      applied: allSaved.filter(s => s.status === "applied").length,
      contacted: allSaved.filter(s => s.status === "contacted").length,
      archived: allSaved.filter(s => s.status === "archived").length,
    }

    return summary
  },
})