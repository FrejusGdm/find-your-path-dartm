# Find Your Path - Dartmouth

**AI-powered platform to help Dartmouth students discover research, internship, and academic opportunities through a personalized conversational assistant.**

---

## 🚀 Overview
Find Your Path is a modern, full-stack web application that leverages AI, real-time data, and memory to guide Dartmouth students toward the best opportunities for their academic and career growth. The platform features a chat-based interface, smart onboarding, and a comprehensive, searchable database of opportunities.

---

## ✨ Key Features
- **Conversational AI Assistant:** Natural language chat, Dartmouth-specific knowledge, warm and helpful personality.
- **Real-time Streaming Responses:** Fast, interactive chat powered by Vercel AI SDK.
- **Persistent Memory:** Remembers user profile, interests, and past conversations for personalized recommendations.
- **Secure Authentication:** Clerk integration with @dartmouth.edu email validation and magic link login.
- **Beautiful Onboarding:** 5-step, mobile-optimized onboarding flow.
- **Opportunity Discovery Engine:** Rich, filterable database of research, internships, grants, and more.
- **Personalized Recommendations:** Smart matching based on user profile and interests.
- **Advanced Analytics:** Engagement, discovery, and conversion tracking with privacy-first design.
- **Modern UI/UX:** Responsive, accessible, and inspired by Notion/Linear aesthetics.

---

## 🏗️ Tech Stack & Architecture
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Clerk, Vercel AI SDK, Convex React
- **Backend:** Convex (real-time DB + serverless functions), Clerk, OpenAI GPT-4 Turbo, Mem0 (memory layer)
- **Dev Tools:** ESLint, Prettier, Vitest, Playwright, GitHub Actions, Vercel

---

## 📁 Project Structure
```
frontend/    # Next.js app, UI, Convex functions, onboarding, chat
backend/     # (Optional) Express server for legacy or extra APIs
scripts/     # Data scrapers and importers
documentation/ # Specs, implementation, deployment docs
```

---

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/your-org/find-your-path-dartmouth.git
cd frontend
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` in `frontend/` and fill in:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
OPENAI_API_KEY=sk-...
MEM0_API_KEY=mem0_...
VERCEL_ANALYTICS_ID=prj_...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Run Locally
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Development
- **Frontend dev:** `cd frontend && npm run dev`
- **Backend dev:** `cd backend && npm run dev:hot` (if using backend)
- **Lint:** `npm run lint`
- **Type-check:** `npm run type-check`
- **Test:** `npm test` (backend)

---

## 🚀 Deployment
- **Vercel:** Deploy frontend with Vercel (recommended)
- **Convex:** Deploy backend with `npx convex deploy --prod`
- **Clerk:** Configure app and webhooks in Clerk dashboard
- **Mem0:** Set up API key and retention policies

See `documentation/DEPLOYMENT.md` for full details.

---

## 🤝 Contributing
1. Fork and branch from `main`
2. Follow code style (TypeScript, ESLint, Prettier)
3. Add/Update tests for new features
4. Submit PR with clear description and screenshots (if UI)
5. Ensure CI passes (lint, build, test)

---

## 📚 Documentation
- **Features:** `documentation/FEATURES.md`
- **Implementation:** `documentation/IMPLEMENTATION.md`
- **Deployment:** `documentation/DEPLOYMENT.md`

---

## 🛡️ Security & Privacy
- No secrets committed to repo
- All sensitive data encrypted at rest
- GDPR-compliant data handling
- Users can view and delete their data

---

## ❤️ Built for Dartmouth students, by Dartmouth students.


