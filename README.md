# 🎯 Find Your Path - Dartmouth
### AI-powered platform helping Dartmouth students discover campus opportunities

<div align="center">

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Contributors Welcome](https://img.shields.io/badge/contributors-welcome-brightgreen.svg?style=flat)](CONTRIBUTING.md)
[![Made with ❤️ by Dartmouth Students](https://img.shields.io/badge/Made%20with%20❤️%20by-Dartmouth%20Students-green.svg)](https://dartmouth.edu)

[🚀 Live Demo](https://find-your-path-dartmouth.vercel.app) • [📖 Documentation](./documentation) • [🐛 Report Bug](https://github.com/FrejusGdm/find-your-path-dartm/issues) • [✨ Request Feature](https://github.com/FrejusGdm/find-your-path-dartm/issues)

</div>

---

## 🤔 Why Find Your Path?

**The Problem:** When I started my Dartmouth journey, I didn't know about so many opportunities and I wanted to make it easier for other Dartmouth students to find opportunities that could change their career trajectory. 

**Our Solution:** An AI companion that learns about each student and provides personalized, actionable guidance - like having a knowledgeable upperclassman available 24/7.

**The Impact:** Students discover opportunities that they didn't know about.

---

## 🚀 Overview
Find Your Path is a modern, full-stack web application that leverages AI, real-time data, and memory to help Dartmouth students discover opportunities at Dartmouth based on their interests and goals. The platform features a chat-based interface (chatGpt style), smart onboarding, and a comprehensive, searchable database of opportunities.

---

## ✨ Key Features
- **Conversational AI Assistant:** Natural language chat, Dartmouth-specific knowledge (ishhhh), warm and helpful personality and a GenZ mode!!.
- **Real-time Streaming Responses:** Fast, interactive chat powered by Vercel AI SDK.
- **Persistent Memory:** Remembers user profile, interests, and past conversations for personalized recommendations.
- **Secure Authentication:** Clerk integration with @dartmouth.edu email validation and magic link login.
- **Opportunity Discovery Engine:** Rich, filterable database of research, internships, grants, and more.
- **Modern UI/UX:** Responsive, accessible, and inspired by Notion/Linear aesthetics.

---

## 🏗️ Tech Stack & Architecture
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Clerk, Vercel AI SDK, Convex React
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

## 📸 Screenshots

<details>
<summary>🎬 See the app in action</summary>

### Chat Interface
*Coming soon - Beautiful AI chat interface with streaming responses*

### Onboarding Flow
*Coming soon - 5-step mobile-optimized onboarding*

### Opportunity Discovery
*Coming soon - Personalized opportunity recommendations*

</details>

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- A Clerk account (free tier available)
- OpenAI API key
- Convex account (free tier available)

### 1. Clone & Install
```bash
git clone https://github.com/FrejusGdm/find-your-path-dartm.git
cd find-your-path-dartmouth/frontend
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

## 🗺️ Roadmap

### 🚀 Phase 1: Core Platform (Current)
- [x] AI chat interface with memory
- [x] Secure authentication
- [x] Opportunity database

### 🎯 Phase 2: TBD

---

## 🤝 Contributing
1. Fork and branch from `main`
2. Follow code style (TypeScript, ESLint, Prettier)
3. Add/Update tests for new features
4. Submit PR with clear description and screenshots (if UI)
5. Ensure CI passes (lint, build, test)

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 🏆 Hall of Fame Contributors
<!-- This will be populated as people contribute -->
Thanks to these amazing people who've made Find Your Path better:

<a href="https://github.com/FrejusGdm/find-your-path-dartm/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=FrejusGdm/find-your-path-dartm" />
</a>

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


