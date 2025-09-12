import { streamText, convertToCoreMessages } from 'ai'
import { openai } from '@ai-sdk/openai'
import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { memoryManager } from '@/lib/mem0'

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

RESPONSE STRUCTURE:
1. Brief acknowledgment/reassurance if needed
2. 3 specific opportunity recommendations when possible
3. Clear next steps for each opportunity
4. One follow-up question to refine suggestions (max 1 per response)

IMPORTANT DISCLAIMERS:
- Never mention deadlines or "last verified" dates
- Always say "confirm details on official pages"
- Don't promise outcomes or guarantee acceptance
- Clarify you're not an official Dartmouth resource

Remember: You're here to build confidence and provide clear guidance to help students take their next steps!`

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    
    // Get authenticated user
    const { userId } = await auth()
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Get or create user profile in Convex
    let user
    try {
      user = await convex.query(api.users.getCurrentUser, {})
    } catch (error) {
      // User doesn't exist yet, create them
      user = await convex.mutation(api.users.createUser, {
        clerkId: userId,
      })
    }

    // Get user's context for personalization from both Convex and Mem0
    const [userContext, memoryContext] = await Promise.all([
      convex.query(api.users.getUserContext, { userId: user._id }),
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
    const conversation = await convex.mutation(api.conversations.createOrUpdateConversation, {
      userId: user._id,
      message: messages[messages.length - 1]?.content || ''
    })

    // Stream AI response
    const result = await streamText({
      model: openai('gpt-4-turbo'),
      system: personalizedPrompt,
      messages: convertToCoreMessages(messages),
      temperature: 0.7,
      maxTokens: 1000,
      
      // Tool calls for fetching opportunities
      tools: {
        searchOpportunities: {
          description: 'Search for relevant opportunities based on user criteria',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search query' },
              category: { type: 'string', description: 'Category filter (research, internship, grant, program)' },
              year: { type: 'string', description: 'Student year filter' },
              department: { type: 'string', description: 'Department filter' },
              isPaid: { type: 'boolean', description: 'Filter for paid opportunities' },
              internationalEligible: { type: 'boolean', description: 'Filter for international student eligibility' }
            },
            required: ['query']
          },
          execute: async ({ query, category, year, department, isPaid, internationalEligible }) => {
            try {
              const opportunities = await convex.query(api.opportunities.searchOpportunities, {
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
        const userMessage = messages[messages.length - 1]?.content || ''
        
        // Store the conversation in Convex
        await convex.mutation(api.messages.createMessage, {
          conversationId: conversation._id,
          userId: user._id,
          role: 'assistant',
          content: text,
          model: 'gpt-4-turbo',
          tokensUsed: usage?.totalTokens,
          toolCalls: toolCalls?.map(tc => tc.toolName) || []
        })

        // Update user context based on conversation
        await convex.mutation(api.users.updateUserFromConversation, {
          userId: user._id,
          message: userMessage,
          aiResponse: text
        })

        // Extract insights for Mem0 (run in background)
        memoryManager.extractConversationInsights(userId, userMessage, text).catch(console.error)

        // Track analytics
        await convex.mutation(api.analytics.trackChatMessage, {
          userId: user._id,
          tokensUsed: usage?.totalTokens || 0,
          responseTime: Date.now() - startTime
        })
      }
    })

    const startTime = Date.now()
    
    return result.toTextStreamResponse()
    
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process message',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}