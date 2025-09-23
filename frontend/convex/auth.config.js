export default {
  providers: [
    {
      // Use standard Convex + Clerk environment variable name
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};