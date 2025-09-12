import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Track chat message for analytics
export const trackChatMessage = mutation({
  args: {
    userId: v.id("users"),
    tokensUsed: v.number(),
    responseTime: v.number(),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    
    // Get existing analytics for today
    const existing = await ctx.db
      .query("userAnalytics")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).eq("date", today)
      )
      .first()

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        messagesExchanged: existing.messagesExchanged + 1,
        aiResponseTime: (existing.aiResponseTime + args.responseTime) / 2, // Running average
      })
    } else {
      // Create new analytics record
      await ctx.db.insert("userAnalytics", {
        userId: args.userId,
        date: today,
        sessionsStarted: 1, // Will be updated by session tracking
        messagesExchanged: 1,
        opportunitiesViewed: 0,
        opportunitiesSaved: 0,
        linksClicked: 0,
        averageSessionLength: 0,
        conversationDepth: 1,
        returnVisitor: false, // Will be determined by checking previous dates
        aiResponseTime: args.responseTime,
        createdAt: Date.now(),
      })
    }
  },
})

// Track opportunity view
export const trackOpportunityView = mutation({
  args: {
    userId: v.id("users"),
    opportunityId: v.id("opportunities"),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0]
    
    const existing = await ctx.db
      .query("userAnalytics")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).eq("date", today)
      )
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        opportunitiesViewed: existing.opportunitiesViewed + 1,
      })
    }
  },
})

// Track opportunity save
export const trackOpportunitySave = mutation({
  args: {
    userId: v.id("users"),
    opportunityId: v.id("opportunities"),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0]
    
    const existing = await ctx.db
      .query("userAnalytics")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).eq("date", today)
      )
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        opportunitiesSaved: existing.opportunitiesSaved + 1,
      })
    }
  },
})

// Track link click
export const trackLinkClick = mutation({
  args: {
    userId: v.id("users"),
    opportunityId: v.optional(v.id("opportunities")),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0]
    
    const existing = await ctx.db
      .query("userAnalytics")
      .withIndex("by_user_date", (q) => 
        q.eq("userId", args.userId).eq("date", today)
      )
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        linksClicked: existing.linksClicked + 1,
      })
    }

    // Also increment opportunity click count if provided
    if (args.opportunityId) {
      const opportunity = await ctx.db.get(args.opportunityId)
      if (opportunity) {
        await ctx.db.patch(args.opportunityId, {
          clickCount: opportunity.clickCount + 1,
        })
      }
    }
  },
})

// Get analytics for a user
export const getUserAnalytics = query({
  args: {
    userId: v.id("users"),
    days: v.optional(v.number()), // Number of days to look back
  },
  handler: async (ctx, args) => {
    const days = args.days || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split('T')[0]

    return await ctx.db
      .query("userAnalytics")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("date"), startDateStr))
      .order("desc")
      .collect()
  },
})

// Get platform-wide analytics (admin only)
export const getPlatformAnalytics = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 7
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split('T')[0]

    const analytics = await ctx.db
      .query("userAnalytics")
      .withIndex("by_date", (q) => q.gte("date", startDateStr))
      .collect()

    // Aggregate metrics
    const totals = analytics.reduce(
      (acc, record) => ({
        totalUsers: acc.totalUsers + 1,
        totalMessages: acc.totalMessages + record.messagesExchanged,
        totalOpportunitiesViewed: acc.totalOpportunitiesViewed + record.opportunitiesViewed,
        totalOpportunitiesSaved: acc.totalOpportunitiesSaved + record.opportunitiesSaved,
        totalLinksClicked: acc.totalLinksClicked + record.linksClicked,
        averageResponseTime: (acc.averageResponseTime + record.aiResponseTime) / 2,
      }),
      {
        totalUsers: 0,
        totalMessages: 0,
        totalOpportunitiesViewed: 0,
        totalOpportunitiesSaved: 0,
        totalLinksClicked: 0,
        averageResponseTime: 0,
      }
    )

    return {
      ...totals,
      dailyBreakdown: analytics,
    }
  },
})