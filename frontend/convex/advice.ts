import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Get all approved advice posts with pagination
export const getAdvicePosts = query({
  args: {
    category: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20
    
    let query = ctx.db
      .query("advicePosts")
      .filter((q) => q.eq(q.field("isApproved"), true))
    
    // Apply category filter
    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category))
    }
    
    // Apply featured filter
    if (args.featured) {
      query = query.filter((q) => q.eq(q.field("featured"), true))
    }
    
    // Order by creation date (newest first)
    const posts = await query
      .order("desc")
      .take(limit)
    
    return posts
  },
})

// Get a single advice post by ID
export const getAdvicePost = query({
  args: { id: v.id("advicePosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id)
    
    if (!post || !post.isApproved) {
      return null
    }
    
    return post
  },
})

// Submit a new advice post
export const submitAdvicePost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    isAnonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Get user data
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first()

    if (!user) {
      throw new Error("User not found")
    }

    // Generate excerpt from content (first 150 characters)
    const excerpt = args.content.length > 150 
      ? args.content.substring(0, 150) + "..."
      : args.content

    // Format author display info
    const authorFirstName = args.isAnonymous ? "Anonymous" : (user.name?.split(' ')[0] || "Student")
    
    // Format year display (dynamic calculation based on current academic year)
    const formatYear = (year: string) => {
      const now = new Date()
      const currentYear = now.getFullYear()
      // Academic year starts in September, so if we're before September, we're still in the previous academic year
      const academicYear = now.getMonth() >= 8 ? currentYear : currentYear - 1 // September is month 8 (0-indexed)

      const yearMap = {
        "first-year": `Class of ${academicYear + 4}`,  // 4 years to graduate
        "sophomore": `Class of ${academicYear + 3}`,   // 3 years to graduate
        "junior": `Class of ${academicYear + 2}`,      // 2 years to graduate
        "senior": `Class of ${academicYear + 1}`,      // 1 year to graduate
        "graduate": "Graduate Student",
        "other": "Student"
      }
      return yearMap[year as keyof typeof yearMap] || "Student"
    }

    const now = Date.now()
    
    const postId = await ctx.db.insert("advicePosts", {
      title: args.title,
      content: args.content,
      excerpt,
      authorId: user._id,
      authorFirstName,
      authorYear: user.year ? formatYear(user.year) : undefined,
      authorMajor: user.major,
      isAnonymous: args.isAnonymous,
      category: args.category,
      tags: args.tags,
      isApproved: true, // Auto-approve for now
      featured: false,
      likes: 0,
      views: 0,
      bookmarks: 0,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    })

    return await ctx.db.get(postId)
  },
})

// Like/unlike an advice post
export const toggleLike = mutation({
  args: { postId: v.id("advicePosts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
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

    // Check if user already liked this post
    const existingLike = await ctx.db
      .query("adviceInteractions")
      .withIndex("by_user_post", (q) => 
        q.eq("userId", user._id).eq("postId", args.postId)
      )
      .filter((q) => q.eq(q.field("type"), "like"))
      .first()

    const post = await ctx.db.get(args.postId)
    if (!post) {
      throw new Error("Post not found")
    }

    if (existingLike) {
      // Unlike: remove interaction and decrement count
      await ctx.db.delete(existingLike._id)
      await ctx.db.patch(args.postId, {
        likes: Math.max(0, post.likes - 1),
        updatedAt: Date.now(),
      })
      return { liked: false, likes: Math.max(0, post.likes - 1) }
    } else {
      // Like: add interaction and increment count
      await ctx.db.insert("adviceInteractions", {
        userId: user._id,
        postId: args.postId,
        type: "like",
        createdAt: Date.now(),
      })
      await ctx.db.patch(args.postId, {
        likes: post.likes + 1,
        updatedAt: Date.now(),
      })
      return { liked: true, likes: post.likes + 1 }
    }
  },
})

// Bookmark/unbookmark an advice post
export const toggleBookmark = mutation({
  args: { postId: v.id("advicePosts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
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

    // Check if user already bookmarked this post
    const existingBookmark = await ctx.db
      .query("adviceInteractions")
      .withIndex("by_user_post", (q) => 
        q.eq("userId", user._id).eq("postId", args.postId)
      )
      .filter((q) => q.eq(q.field("type"), "bookmark"))
      .first()

    const post = await ctx.db.get(args.postId)
    if (!post) {
      throw new Error("Post not found")
    }

    if (existingBookmark) {
      // Remove bookmark
      await ctx.db.delete(existingBookmark._id)
      await ctx.db.patch(args.postId, {
        bookmarks: Math.max(0, post.bookmarks - 1),
        updatedAt: Date.now(),
      })
      return { bookmarked: false, bookmarks: Math.max(0, post.bookmarks - 1) }
    } else {
      // Add bookmark
      await ctx.db.insert("adviceInteractions", {
        userId: user._id,
        postId: args.postId,
        type: "bookmark",
        createdAt: Date.now(),
      })
      await ctx.db.patch(args.postId, {
        bookmarks: post.bookmarks + 1,
        updatedAt: Date.now(),
      })
      return { bookmarked: true, bookmarks: post.bookmarks + 1 }
    }
  },
})

// Increment view count when user views a post
export const incrementView = mutation({
  args: { postId: v.id("advicePosts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return // Don't require auth for views
    }

    const post = await ctx.db.get(args.postId)
    if (!post) {
      return
    }

    // Increment view count
    await ctx.db.patch(args.postId, {
      views: post.views + 1,
      updatedAt: Date.now(),
    })

    // Optionally track user view (for analytics)
    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .first()

      if (user) {
        // Check if user already viewed this post recently (within 24 hours)
        const recentView = await ctx.db
          .query("adviceInteractions")
          .withIndex("by_user_post", (q) => 
            q.eq("userId", user._id).eq("postId", args.postId)
          )
          .filter((q) => q.eq(q.field("type"), "view"))
          .filter((q) => q.gt(q.field("createdAt"), Date.now() - 24 * 60 * 60 * 1000))
          .first()

        if (!recentView) {
          await ctx.db.insert("adviceInteractions", {
            userId: user._id,
            postId: args.postId,
            type: "view",
            createdAt: Date.now(),
          })
        }
      }
    }
  },
})

// Get user's interactions with advice posts (likes, bookmarks)
export const getUserInteractions = query({
  args: { postIds: v.array(v.id("advicePosts")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return {}
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first()

    if (!user) {
      return {}
    }

    const interactions = await ctx.db
      .query("adviceInteractions")
      .withIndex("by_user_type", (q) => q.eq("userId", user._id))
      .collect()

    const result: Record<string, { liked: boolean; bookmarked: boolean }> = {}
    
    for (const postId of args.postIds) {
      const liked = interactions.some(i => i.postId === postId && i.type === "like")
      const bookmarked = interactions.some(i => i.postId === postId && i.type === "bookmark")
      result[postId] = { liked, bookmarked }
    }

    return result
  },
})
