import { streamText, convertToCoreMessages } from 'ai'
import { openai } from '@ai-sdk/openai'
import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { memoryManager } from '@/lib/mem0'
import { z } from 'zod'

// Initialize Convex client for server-side operations
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are a friendly, knowledgeable assistant helping Dartmouth students discover academic opportunities like research positions, grants, internships, and programs.

PERSONALITY & TONE:
- Warm, encouraging, and peer-like (like a helpful upperclassman)
- Use light Gen-Z language when appropriate, but stay professional
- Always lead with reassurance for nervous/anxious students
- Maximum one light joke per conversation when the user is casual
- No emojis by default (only if user uses them first)

CORE MISSION:
- Help students discover opportunities they didn't know existed
- Provide concrete next steps, not just information
- Always include official links and contact information
- Explain how things work at Dartmouth specifically

KEY PRINCIPLES:
1. **Reassurance first** - If student sounds nervous/intimidated, offer encouragement before advice
2. **Concrete actions** - Always provide specific "what to do next" steps
3. **No assumptions** - Ask clarifying questions instead of assuming
4. **Official sources** - Point to official pages and verified contacts
5. **Dartmouth context** - Explain how things specifically work at this school

TOOL USAGE STRATEGY:
- ONLY search for opportunities when the student explicitly asks for specific recommendations or when they provide clear criteria (year, major, interests, etc.)
- Do NOT automatically search after every general question about opportunities
- First provide general guidance and encouragement, then ask if they want specific recommendations
- Batch your tool usage - if you need to search, do it once per conversation turn, not multiple times
- Prioritize conversational flow over showing off search capabilities

RESPONSE STRUCTURE:
1. Brief acknowledgment/reassurance if needed
2. Helpful context or general guidance first
3. Ask permission before searching: "Would you like me to look for specific opportunities that match your profile?"
4. If searching, provide 3-5 concrete recommendations with next steps
5. One follow-up question to continue the conversation

IMPORTANT DISCLAIMERS:
- Never mention deadlines or "last verified" dates
- Always say "confirm details on official pages"
- Don't promise outcomes or guarantee acceptance
- Clarify you're not an official Dartmouth resource

Remember: You're here to build confidence and provide clear guidance. Prioritize natural conversation flow over constantly searching for opportunities!`

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Get authenticated user and token for server-side Convex calls
    const { userId, getToken } = await auth()
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Get Clerk JWT token for Convex authentication
    const token = await getToken({ template: 'convex' })

    // Create authenticated Convex client for server-side calls
    const authenticatedConvex = new ConvexHttpClient(
      process.env.NEXT_PUBLIC_CONVEX_URL!,
      token ? { auth: token } : undefined
    )

    // Get or create user profile in Convex
    let user = await authenticatedConvex.query(api.users.getCurrentUser, {})

    if (!user) {
      // User doesn't exist yet, use getOrCreateUser mutation to create them
      user = await authenticatedConvex.mutation(api.users.getOrCreateUser, {})
    }

    // Get user's context for personalization from both Convex and Mem0
    const [userContext, memoryContext] = await Promise.all([
      user ? authenticatedConvex.query(api.users.getUserContext, { userId: user._id }) : Promise.resolve(null),
      memoryManager.buildPersonalizedContext(userId)
    ])

    // Build personalized system prompt with Mem0 insights
    let personalizedPrompt = SYSTEM_PROMPT

    if (userContext || memoryContext) {
      personalizedPrompt += `\n\nUSER CONTEXT:
- Year: ${userContext?.year || 'not specified'}
- Interests: ${userContext?.interests?.join(', ') || 'exploring'}
- Major: ${userContext?.major || 'undeclared'}
- Goals: ${userContext?.goals || 'discovering opportunities'}
- International student: ${userContext?.isInternational ? 'yes' : 'no'}
- Previous interactions: ${userContext?.previousTopics?.join(', ') || 'none'}

MEMORY INSIGHTS:
- Profile: ${memoryContext.profile.map(m => m.content).join(', ') || 'none'}
- Recent interests: ${memoryContext.recentInterests.map(m => m.content).join(', ') || 'none'}
- Goals mentioned: ${memoryContext.goals.map(m => m.content).join(', ') || 'none'}
- Communication preferences: ${memoryContext.preferences.map(m => m.content).join(', ') || 'none'}

Adjust your recommendations and tone based on this context. Reference past conversations naturally when relevant. If they're a first-year, focus on beginner-friendly opportunities. If they're international, highlight visa-friendly programs.`
    }

    // Create or update conversation
    const lastMessage = messages[messages.length - 1]
    const messageText = lastMessage?.parts?.filter(p => p.type === 'text').map(p => p.text).join('') || ''
    const conversation = await authenticatedConvex.mutation(api.conversations.createOrUpdateConversation, {
      userId: user!._id,
      message: messageText
    })

    // Stream AI response
    const startTime = Date.now()

    const result = streamText({
      model: openai('gpt-4-turbo'),
      system: personalizedPrompt,
      messages: convertToCoreMessages(messages),
      temperature: 0.7,
      
      // Tool calls for fetching opportunities
      tools: {
        searchOpportunities: {
          description: 'Search for relevant opportunities based on user criteria',
          inputSchema: z.object({
            query: z.string().describe('Search query'),
            category: z.string().optional().describe('Category filter (research, internship, grant, program)'),
            year: z.string().optional().describe('Student year filter'),
            department: z.string().optional().describe('Department filter'),
            isPaid: z.boolean().optional().describe('Filter for paid opportunities'),
            internationalEligible: z.boolean().optional().describe('Filter for international student eligibility')
          }),
          execute: async ({ query, category, year, department, isPaid, internationalEligible }) => {
            try {
              const opportunities = await authenticatedConvex.query(api.opportunities.searchOpportunities, {
                query,
                filters: {
                  category,
                  year,
                  department,
                  isPaid,
                  internationalEligible
                },
                limit: 5
              })
              return { opportunities }
            } catch (error) {
              console.error('Error searching opportunities:', error)
              return { opportunities: [], error: 'Failed to search opportunities' }
            }
          }
        }
      },

      onFinish: async ({ text, toolCalls, usage }) => {
        const userMessage = messageText
        
        // Store the conversation in Convex
        await authenticatedConvex.mutation(api.messages.createMessage, {
          conversationId: conversation!._id,
          userId: user!._id,
          role: 'assistant',
          content: text,
          model: 'gpt-4-turbo',
          tokensUsed: usage?.totalTokens,
          toolCalls: toolCalls?.map(tc => tc.toolName) || []
        })

        // Update user context based on conversation
        await authenticatedConvex.mutation(api.users.updateUserFromConversation, {
          userId: user!._id,
          message: userMessage,
          aiResponse: text
        })

        // Extract insights for Mem0 (run in background)
        memoryManager.extractConversationInsights(userId, userMessage).catch(console.error)

        // Track analytics
        await authenticatedConvex.mutation(api.analytics.trackChatMessage, {
          userId: user!._id,
          tokensUsed: usage?.totalTokens || 0,
          responseTime: Date.now() - startTime
        })
      }
    })

    return result.toUIMessageStreamResponse()
    
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to process message',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}