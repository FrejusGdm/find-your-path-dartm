# Find Your Path - Frontend

AI-powered conversational interface helping Dartmouth students discover campus opportunities through personalized guidance.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Auth**: Clerk with @dartmouth.edu email validation
- **Database**: Convex (real-time + serverless functions)
- **AI**: OpenAI GPT-4 Turbo with Vercel AI SDK
- **Memory**: Mem0 for conversation context
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Language**: TypeScript

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Key Features

### 🧠 Smart Message Classification
Automatically categorizes user messages to optimize performance:
- Simple greetings ("hi", "yo") → Fast responses (~2s)
- Substantive messages → Full memory processing with rich personalization

### ⚡ Immediate Personalization
Uses Clerk authentication data for instant recognition:
- Name-based greetings from message #1
- Dartmouth email verification
- New vs returning user detection
- First conversation awareness

### 💾 Dual-Layer Memory System
1. **Immediate**: Clerk user data (instant)
2. **Contextual**: Mem0 + Convex (builds over time)

## Development

### Commands
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run start         # Run production build
npm run lint          # Run Next.js linting
npx convex dev        # Start Convex development backend
npx convex deploy     # Deploy Convex backend
```

### Debugging Features

**Message Classification Logs**:
```bash
[Memory Classification] Message: "yo..." | Type: acknowledgment | Skip Memory: true
[Performance] Total response time: 1750ms | Classification: acknowledgment
```

**Immediate Personalization Logs**:
```bash
[Immediate Personalization] Applied for Sarah Johnson | Dartmouth: true | New: false | First chat: true
```

### Key Files
- `/app/api/chat/route.ts` - Main chat API with classification and personalization
- `/lib/message-classifier.ts` - Message categorization logic
- `/components/chat/` - Chat interface components
- `/convex/` - Database schema and functions

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
