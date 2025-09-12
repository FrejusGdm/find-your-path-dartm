Product Brief: Find Your Path - Dartmouth Opportunity Discovery Platform
Core Mission: An AI-powered conversational interface that helps Dartmouth students discover campus opportunities (research, fellowships, grants, programs) they didn't know existed, with personalized guidance on next steps.
Target User: Primarily first-gen and underclassmen who lack social capital/insider knowledge about campus opportunities. Built by a senior who experienced this gap firsthand.
User Experience Flow:

Onboarding: Dartmouth email verification + casual profile building (year, interests, major intentions, confidence level, research experience). Users can say "I don't know" to anything.
Conversational Discovery: Free-form ChatGPT-style interface where students drive the conversation. AI uses Gen Z casual tone with jokes, always leads with reassurance before practical advice.
Persistent Memory: Full conversation history, returns to previous context when users come back.
Action-Oriented Results: Direct links to official pages, specific contacts, clear next steps. Save/bookmark functionality.

AI Personality:

Supportive upperclassman friend, not formal advisor
Gen Z slang and humor ("making bank" jokes for money questions)
Always reassurance first, then diagnostic questions to narrow focus
Explains Dartmouth-specific context (what research actually looks like here)

Technical Architecture:

Next.js frontend, Convex backend
Opportunity database (Airtable initially) populated via Firecrawl scraping + manual curation
Memory system (considering Mem0 or SuperMemory)
User-submitted additions via forms
Future: "Wall of Advice" from upperclassmen

Key Differentiator: Not just a search tool - it's educational and confidence-building for students who don't know what they don't know.