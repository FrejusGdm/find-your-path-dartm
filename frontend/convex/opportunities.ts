import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Get all opportunities (for public browsing)
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("opportunities")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect()
  },
})

// Search opportunities with filters
export const searchOpportunities = query({
  args: {
    query: v.string(),
    filters: v.optional(v.object({
      category: v.optional(v.string()),
      year: v.optional(v.string()),
      department: v.optional(v.string()),
      isPaid: v.optional(v.boolean()),
      internationalEligible: v.optional(v.boolean()),
    })),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let results = ctx.db.query("opportunities")
      .withSearchIndex("search_opportunities", (q) => 
        q.search("title", args.query)
      )

    // Apply filters
    if (args.filters?.category) {
      results = results.filter((q) => q.eq(q.field("category"), args.filters.category))
    }
    
    if (args.filters?.department) {
      results = results.filter((q) => q.eq(q.field("department"), args.filters.department))
    }
    
    if (args.filters?.isPaid !== undefined) {
      results = results.filter((q) => q.eq(q.field("isPaid"), args.filters.isPaid))
    }
    
    if (args.filters?.internationalEligible !== undefined) {
      results = results.filter((q) => q.eq(q.field("internationalEligible"), args.filters.internationalEligible))
    }

    if (args.filters?.year) {
      results = results.filter((q) => 
        q.or(
          q.eq(q.field("eligibleYears"), [args.filters!.year!]),
          q.eq(q.field("eligibleYears"), [])  // Empty array means all years eligible
        )
      )
    }

    // Only active opportunities
    results = results.filter((q) => q.eq(q.field("isActive"), true))

    const opportunities = await results.take(args.limit || 10)

    // Increment view count for returned opportunities
    for (const opp of opportunities) {
      await ctx.db.patch(opp._id, {
        viewCount: opp.viewCount + 1,
        updatedAt: Date.now(),
      })
    }

    return opportunities
  },
})

// Get opportunities by category
export const getByCategory = query({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("opportunities")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .take(args.limit || 20)
  },
})

// Get popular opportunities
export const getPopular = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("opportunities")
      .withIndex("by_popularity", (q) => q.gte("saveCount", 1))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .take(args.limit || 10)
  },
})

// Get single opportunity
export const getById = query({
  args: {
    id: v.id("opportunities"),
  },
  handler: async (ctx, args) => {
    const opportunity = await ctx.db.get(args.id)
    
    if (opportunity && opportunity.isActive) {
      // Increment view count
      await ctx.db.patch(args.id, {
        viewCount: opportunity.viewCount + 1,
        updatedAt: Date.now(),
      })
    }
    
    return opportunity
  },
})

// Create opportunity (admin function)
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    department: v.string(),
    category: v.string(),
    eligibleYears: v.array(v.string()),
    eligibleMajors: v.optional(v.array(v.string())),
    internationalEligible: v.boolean(),
    gpaRequirement: v.optional(v.number()),
    isPaid: v.boolean(),
    estimatedHours: v.optional(v.string()),
    timeCommitment: v.optional(v.string()),
    officialUrl: v.string(),
    applicationUrl: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactName: v.optional(v.string()),
    contactRole: v.optional(v.string()),
    nextSteps: v.array(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    
    const opportunityId = await ctx.db.insert("opportunities", {
      ...args,
      viewCount: 0,
      saveCount: 0,
      clickCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })

    return await ctx.db.get(opportunityId)
  },
})

// Add sample test opportunities
export const addTestOpportunities = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    
    const testOpportunities = [
      {
        title: "Test Opportunity 1",
        description: "This is a sample test opportunity for development and testing purposes. It includes basic information about research opportunities.",
        department: "Test Department A",
        category: "research",
        eligibleYears: ["first-year", "sophomore"],
        internationalEligible: true,
        isPaid: true,
        estimatedHours: "5-10 hours/week",
        timeCommitment: "semester",
        officialUrl: "https://example.com/test1",
        nextSteps: [
          "Contact the test coordinator",
          "Submit test application",
          "Attend test orientation"
        ],
        tags: ["test", "sample", "development"],
        viewCount: 0,
        saveCount: 0,
        clickCount: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Test Opportunity 2",
        description: "Another sample opportunity for testing the internship category and filtering functionality.",
        department: "Test Department B",
        category: "internship",
        eligibleYears: ["junior", "senior"],
        internationalEligible: false,
        isPaid: true,
        estimatedHours: "20 hours/week",
        timeCommitment: "summer",
        officialUrl: "https://example.com/test2",
        nextSteps: [
          "Complete test prerequisites",
          "Schedule test interview",
          "Submit test portfolio"
        ],
        tags: ["test", "internship", "summer"],
        viewCount: 0,
        saveCount: 0,
        clickCount: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Test Program 3",
        description: "Sample program opportunity for testing program category and various features of the opportunities system.",
        department: "Test Department C",
        category: "program",
        eligibleYears: ["first-year", "sophomore", "junior", "senior"],
        internationalEligible: true,
        isPaid: false,
        estimatedHours: "Flexible",
        timeCommitment: "academic year",
        officialUrl: "https://example.com/test3",
        nextSteps: [
          "Attend test information session",
          "Complete test enrollment form",
          "Begin test program activities"
        ],
        tags: ["test", "program", "flexible", "academic-year"],
        viewCount: 0,
        saveCount: 0,
        clickCount: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Test Grant 4",
        description: "Testing grant opportunity to validate grant category functionality and search capabilities.",
        department: "Test Financial Aid",
        category: "grant",
        eligibleYears: ["sophomore", "junior"],
        internationalEligible: true,
        isPaid: true,
        estimatedHours: "Not applicable",
        timeCommitment: "varies",
        officialUrl: "https://example.com/test4",
        nextSteps: [
          "Review test eligibility criteria",
          "Prepare test application materials",
          "Submit test grant proposal"
        ],
        tags: ["test", "grant", "funding", "proposal"],
        viewCount: 0,
        saveCount: 0,
        clickCount: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Test Fellowship 5",
        description: "Final test opportunity to complete the sample dataset for development and testing purposes.",
        department: "Test Department D",
        category: "fellowship",
        eligibleYears: ["senior"],
        internationalEligible: false,
        isPaid: true,
        estimatedHours: "Full-time",
        timeCommitment: "1 year",
        officialUrl: "https://example.com/test5",
        nextSteps: [
          "Meet test requirements",
          "Submit test fellowship application",
          "Complete test interview process"
        ],
        tags: ["test", "fellowship", "full-time", "senior-year"],
        viewCount: 0,
        saveCount: 0,
        clickCount: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]

    const results = []
    for (const opp of testOpportunities) {
      const id = await ctx.db.insert("opportunities", opp)
      results.push(await ctx.db.get(id))
    }

    return results
  },
})

// Seed initial opportunities
export const seedOpportunities = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    
    const opportunities = [
      {
        title: "Undergraduate Research Assistantship Program (URAP)",
        description: "Work directly with faculty on research projects across all departments. Perfect for getting hands-on research experience.",
        department: "Cross-departmental",
        category: "research",
        eligibleYears: ["first-year", "sophomore", "junior", "senior"],
        internationalEligible: true,
        isPaid: true,
        estimatedHours: "8-10 hours/week",
        timeCommitment: "semester",
        officialUrl: "https://students.dartmouth.edu/ugar/",
        nextSteps: [
          "Browse available positions on the UGAR website",
          "Contact faculty members directly about their research",
          "Submit application with resume and interest statement"
        ],
        tags: ["research", "faculty-mentored", "paid", "flexible"],
        viewCount: 0,
        saveCount: 0,
        clickCount: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "Women in Science Program (WISP) Internships",
        description: "Paid research internships specifically designed to support women in STEM fields with mentorship and community.",
        department: "STEM Departments",
        category: "internship",
        eligibleYears: ["first-year", "sophomore"],
        internationalEligible: true,
        isPaid: true,
        estimatedHours: "20 hours/week",
        timeCommitment: "summer",
        officialUrl: "https://students.dartmouth.edu/wisp/",
        nextSteps: [
          "Attend WISP information sessions",
          "Connect with current WISP participants",
          "Submit application by February deadline"
        ],
        tags: ["women-in-stem", "mentorship", "paid", "summer"],
        viewCount: 0,
        saveCount: 0,
        clickCount: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: "First-Year Research Experience in Engineering (FYREE)",
        description: "Hands-on engineering research experience designed specifically for first-year students interested in engineering.",
        department: "Thayer School of Engineering",
        category: "program",
        eligibleYears: ["first-year"],
        internationalEligible: true,
        isPaid: false,
        estimatedHours: "6-8 hours/week",
        timeCommitment: "semester",
        officialUrl: "https://engineering.dartmouth.edu/community/student-groups/fyree/",
        nextSteps: [
          "Visit Thayer School advising",
          "Attend FYREE information sessions",
          "Apply during fall term"
        ],
        tags: ["engineering", "first-year", "introduction"],
        viewCount: 0,
        saveCount: 0,
        clickCount: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]

    const results = []
    for (const opp of opportunities) {
      const id = await ctx.db.insert("opportunities", opp)
      results.push(await ctx.db.get(id))
    }

    return results
  },
})

// Increment click count when user clicks on opportunity link
export const incrementClick = mutation({
  args: {
    opportunityId: v.id("opportunities"),
  },
  handler: async (ctx, args) => {
    const opportunity = await ctx.db.get(args.opportunityId)
    if (opportunity) {
      await ctx.db.patch(args.opportunityId, {
        clickCount: opportunity.clickCount + 1,
        updatedAt: Date.now(),
      })
    }
  },
})