// Simple auth helper for Clerk integration
export const auth = {
  async getUserIdentity(ctx: any) {
    return ctx.auth.getUserIdentity()
  }
}