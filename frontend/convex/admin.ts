import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

// Get all feature flags (admin only)
export const getFeatureFlags = query({
  args: {},
  handler: async (ctx) => {
    const identity = await auth.getUserIdentity(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user?.isAdmin) {
      throw new Error("Admin access required");
    }

    const flags = await ctx.db
      .query("featureFlags")
      .order("desc")
      .collect();

    return flags;
  },
});

// Get a specific feature flag
export const getFeatureFlag = query({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const flag = await ctx.db
      .query("featureFlags")
      .withIndex("by_name", (q) => q.eq("name", name))
      .first();

    return flag;
  },
});

// Check if a feature is enabled for a user
export const isFeatureEnabled = query({
  args: {
    featureName: v.string(),
    userId: v.optional(v.string()) // Clerk ID
  },
  handler: async (ctx, { featureName, userId }) => {
    const flag = await ctx.db
      .query("featureFlags")
      .withIndex("by_name", (q) => q.eq("name", featureName))
      .first();

    if (!flag) {
      return false; // Feature doesn't exist = disabled
    }

    // If feature is globally disabled
    if (!flag.enabled) {
      return false;
    }

    // If no user ID provided, return global status
    if (!userId) {
      return flag.enabled;
    }

    // Check if user is admin and admins have access
    if (flag.enabledForAdmins) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
        .first();

      if (user?.isAdmin) {
        return true;
      }
    }

    // Check user-specific overrides
    if (flag.disabledUsers?.includes(userId)) {
      return false;
    }

    if (flag.enabledUsers?.includes(userId)) {
      return true;
    }

    // If no specific overrides, return global status
    return flag.enabled;
  },
});

// Create or update a feature flag (admin only)
export const upsertFeatureFlag = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    enabled: v.boolean(),
    enabledForAdmins: v.boolean(),
    enabledUsers: v.optional(v.array(v.string())),
    disabledUsers: v.optional(v.array(v.string())),
    rolloutPercentage: v.optional(v.number()),
    config: v.optional(v.object({
      maxUsagePerDay: v.optional(v.number()),
      requiresVerification: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await auth.getUserIdentity(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user?.isAdmin) {
      throw new Error("Admin access required");
    }

    // Check if flag exists
    const existingFlag = await ctx.db
      .query("featureFlags")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    const now = Date.now();

    if (existingFlag) {
      // Update existing flag
      await ctx.db.patch(existingFlag._id, {
        ...args,
        updatedAt: now,
      });
      return existingFlag._id;
    } else {
      // Create new flag
      return await ctx.db.insert("featureFlags", {
        ...args,
        createdBy: identity.subject,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Quick toggle for enabling/disabling a feature (admin only)
export const toggleFeature = mutation({
  args: {
    name: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, { name, enabled }) => {
    const identity = await auth.getUserIdentity(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user?.isAdmin) {
      throw new Error("Admin access required");
    }

    const flag = await ctx.db
      .query("featureFlags")
      .withIndex("by_name", (q) => q.eq("name", name))
      .first();

    if (!flag) {
      throw new Error("Feature flag not found");
    }

    await ctx.db.patch(flag._id, {
      enabled,
      updatedAt: Date.now(),
    });

    return flag._id;
  },
});

// Add user to feature enable/disable list (admin only)
export const updateUserFeatureAccess = mutation({
  args: {
    featureName: v.string(),
    userId: v.string(), // Clerk ID
    access: v.union(v.literal("enable"), v.literal("disable"), v.literal("remove")),
  },
  handler: async (ctx, { featureName, userId, access }) => {
    const identity = await auth.getUserIdentity(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user?.isAdmin) {
      throw new Error("Admin access required");
    }

    const flag = await ctx.db
      .query("featureFlags")
      .withIndex("by_name", (q) => q.eq("name", featureName))
      .first();

    if (!flag) {
      throw new Error("Feature flag not found");
    }

    let enabledUsers = flag.enabledUsers || [];
    let disabledUsers = flag.disabledUsers || [];

    // Remove user from both lists first
    enabledUsers = enabledUsers.filter(id => id !== userId);
    disabledUsers = disabledUsers.filter(id => id !== userId);

    // Add to appropriate list based on access
    if (access === "enable") {
      enabledUsers.push(userId);
    } else if (access === "disable") {
      disabledUsers.push(userId);
    }
    // If "remove", user is already removed from both lists

    await ctx.db.patch(flag._id, {
      enabledUsers,
      disabledUsers,
      updatedAt: Date.now(),
    });

    return flag._id;
  },
});

// Track feature usage
export const trackFeatureUsage = mutation({
  args: {
    featureName: v.string(),
    userId: v.string(),
    action: v.string(),
    metadata: v.optional(v.object({
      query: v.optional(v.string()),
      results: v.optional(v.number()),
      success: v.optional(v.boolean()),
      errorMessage: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Update last used timestamp on feature flag
    const flag = await ctx.db
      .query("featureFlags")
      .withIndex("by_name", (q) => q.eq("name", args.featureName))
      .first();

    if (flag) {
      await ctx.db.patch(flag._id, {
        lastUsed: Date.now(),
      });
    }

    // Record usage
    return await ctx.db.insert("featureUsage", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Get feature usage analytics (admin only)
export const getFeatureUsageStats = query({
  args: {
    featureName: v.string(),
    days: v.optional(v.number()), // Last N days, default 30
  },
  handler: async (ctx, { featureName, days = 30 }) => {
    const identity = await auth.getUserIdentity(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user?.isAdmin) {
      throw new Error("Admin access required");
    }

    const startTime = Date.now() - (days * 24 * 60 * 60 * 1000);

    const usage = await ctx.db
      .query("featureUsage")
      .withIndex("by_feature", (q) => q.eq("featureName", featureName))
      .filter((q) => q.gte(q.field("createdAt"), startTime))
      .collect();

    // Calculate stats
    const totalUsage = usage.length;
    const uniqueUsers = new Set(usage.map(u => u.userId)).size;
    const successfulUsage = usage.filter(u => u.metadata?.success !== false).length;
    const successRate = totalUsage > 0 ? (successfulUsage / totalUsage) * 100 : 0;

    return {
      totalUsage,
      uniqueUsers,
      successfulUsage,
      successRate,
      usage: usage.slice(-100), // Return last 100 usage records
    };
  },
});

// Initialize default feature flags (run once)
export const initializeDefaultFeatures = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await auth.getUserIdentity(ctx);
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user?.isAdmin) {
      throw new Error("Admin access required");
    }

    const now = Date.now();
    const defaultFeatures = [
      {
        name: "search_enabled",
        description: "Enable Tavily search functionality for finding current Dartmouth information",
        enabled: false, // Start disabled for all users
        enabledForAdmins: true, // Admins get access
        config: {
          maxUsagePerDay: 20,
          requiresVerification: false,
        },
      },
      {
        name: "advanced_ai_mode",
        description: "Enable advanced AI features like multi-step reasoning and extended context",
        enabled: true,
        enabledForAdmins: true,
      },
      {
        name: "beta_features",
        description: "Access to experimental and beta features",
        enabled: false,
        enabledForAdmins: true,
      },
    ];

    const results = [];
    for (const feature of defaultFeatures) {
      // Check if already exists
      const existing = await ctx.db
        .query("featureFlags")
        .withIndex("by_name", (q) => q.eq("name", feature.name))
        .first();

      if (!existing) {
        const id = await ctx.db.insert("featureFlags", {
          ...feature,
          createdBy: identity.subject,
          createdAt: now,
          updatedAt: now,
        });
        results.push({ name: feature.name, id, created: true });
      } else {
        results.push({ name: feature.name, id: existing._id, created: false });
      }
    }

    return results;
  },
});