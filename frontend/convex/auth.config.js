export default {
  providers: [
    {
      domain: process.env.CLERK_ISSUER_URL || "https://simple-kid-7.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};