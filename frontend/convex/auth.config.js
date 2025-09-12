export default {
  providers: [
    {
      domain: process.env.CLERK_ISSUER_URL || "https://your-clerk-domain.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};