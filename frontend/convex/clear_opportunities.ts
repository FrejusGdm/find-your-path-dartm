import { mutation } from "./_generated/server";

// Clear all opportunities - ADMIN USE ONLY
export const clearAllOpportunities = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🗑️  Starting to clear all opportunities...");

    // Get all opportunities
    const opportunities = await ctx.db.query("opportunities").collect();

    console.log(`Found ${opportunities.length} opportunities to delete`);

    let deletedCount = 0;

    // Delete each opportunity
    for (const opportunity of opportunities) {
      await ctx.db.delete(opportunity._id);
      deletedCount++;
    }

    console.log(`✅ Successfully deleted ${deletedCount} opportunities`);

    return {
      message: `Successfully cleared ${deletedCount} opportunities`,
      deletedCount
    };
  },
});