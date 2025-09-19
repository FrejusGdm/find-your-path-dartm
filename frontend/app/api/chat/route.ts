import { streamText, convertToCoreMessages } from 'ai'
import { openai } from '@ai-sdk/openai'
import { auth, currentUser } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { memoryManager } from '@/lib/mem0'
import { classifyMessage, shouldSkipMemoryProcessing } from '@/lib/message-classifier'
import { z } from 'zod'

// Initialize Convex client for server-side operations
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are a friendly, knowledgeable assistant helping Dartmouth students discover academic opportunities like research positions, grants, internships, and programs.

PERSONALITY & TONE:
- Warm, encouraging, and peer-like (like a helpful upperclassman)
- Use light Gen-Z language when appropriate, but stay professional
- Always lead with reassurance for nervous/anxious students
- No emojis by default (only if user uses them first)

CORE MISSION:
- Help students discover opportunities they didn't know existed
- Share real student experiences and advice from the Wall of Advice when relevant
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
- Use searchAdvicePosts when students ask about experiences, tips, or "what's it like" questions - real student stories are incredibly valuable
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

// GenZ mode prompt addition
const GENZ_MODE_PROMPT = `

🔥 GENZ MODE ACTIVATED 🔥

ENHANCED PERSONALITY & COMMUNICATION:
- Use authentic Gen-Z language naturally (not forced or trying too hard)
- Be more energetic and enthusiastic in responses
- Use expressions like "bestie", "fam", "no cap", "fr fr", "bet", "say less", "periodt"
- Include phrases like "not me...", "the way I...", "this is sending me", "it's giving..."
- Use "slay" for achievements, "periodt" for emphasis, "bestie" for friendly address
- More casual sentence structure with occasional caps for EMPHASIS
- Keep the helpful, supportive energy but with modern slang

TONE ADJUSTMENTS:
- Start responses with casual greetings like "Yooo bestie!" or "Hey fam!"
- Use "no cap" instead of "honestly" or "truly"
- Say "bet" instead of "sure" or "okay"
- Use "fr fr" for "for real" emphasis
- End advice with encouraging slang like "you got this bestie!" or "go off!"

IMPORTANT:
- Still maintain all core functionality and helpfulness
- Keep official information accurate and professional when needed
- Use slang naturally, not every sentence
- Don't sacrifice clarity for coolness - understanding comes first`

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Get authenticated user and token for server-side Convex calls
    const { userId, getToken } = await auth()
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Fetch Clerk user data for immediate personalization
    const clerkUser = await currentUser()

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

    // Get the last message for classification
    const lastMessage = messages[messages.length - 1]
    const messageText = lastMessage?.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') || ''

    // Classify the message to determine processing strategy
    const messageClassification = classifyMessage(messageText)
    const skipMemoryProcessing = shouldSkipMemoryProcessing(messageClassification)

    console.log(`[Memory Classification] Message: "${messageText.substring(0, 50)}..." | Type: ${messageClassification.type} | Skip Memory: ${skipMemoryProcessing} | Reason: ${messageClassification.reasoning}`)

    // Get user's context for personalization - optimize based on message type
    const [userContext, memoryContext] = await Promise.all([
      user ? authenticatedConvex.query(api.users.getUserContext, { userId: user._id }) : Promise.resolve(null),
      skipMemoryProcessing ?
        Promise.resolve({ profile: [], recentInterests: [], goals: [], preferences: [] }) :
        memoryManager.buildPersonalizedContext(userId)
    ])

    // Build personalized system prompt with immediate Clerk personalization
    let personalizedPrompt = SYSTEM_PROMPT

    // Add immediate personalization from Clerk user data
    if (clerkUser) {
      try {
        const firstName = clerkUser.firstName || 'there'
        const lastName = clerkUser.lastName || ''
        const fullName = `${firstName}${lastName ? ' ' + lastName : ''}`
        const email = clerkUser.emailAddresses?.[0]?.emailAddress || ''
        const isDartmouthEmail = email.includes('@dartmouth.edu')
        const createdAt = clerkUser.createdAt
        const accountAge = createdAt ? Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24)) : 0
        const isNewUser = accountAge < 7 // Less than a week old
        const isFirstConversation = messages.length <= 1

        console.log(`[Immediate Personalization] Applied for ${fullName} | Dartmouth: ${isDartmouthEmail} | New: ${isNewUser} | First chat: ${isFirstConversation}`)

        personalizedPrompt += `\n\nIMMEDIATE CONTEXT:
- Student name: ${fullName}
- Email verification: ${isDartmouthEmail ? 'Confirmed Dartmouth student (@dartmouth.edu)' : 'Email verified'}
- Account status: ${isNewUser ? `New user (${accountAge} days old)` : `Returning user (${accountAge} days)`}
- Session type: ${isFirstConversation ? 'First conversation' : 'Continuing conversation'}

Use their name naturally in responses. ${isNewUser ? 'Welcome them warmly as a new user.' : 'Greet them as a returning student.'} ${isDartmouthEmail ? 'Reference their confirmed Dartmouth status when relevant.' : ''}`
      } catch (error) {
        console.error('[Immediate Personalization] Error processing Clerk user data:', error)
        // Continue without immediate personalization if Clerk data is unavailable
      }
    } else {
      console.log('[Immediate Personalization] No Clerk user data available')
    }

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

    // Add GenZ mode if enabled
    if (userContext?.genzMode) {
      personalizedPrompt += GENZ_MODE_PROMPT
      console.log('[GenZ Mode] Activated for user')
    }

    // Create or update conversation
    const conversation = await authenticatedConvex.mutation(api.conversations.createOrUpdateConversation, {
      userId: user!._id,
      message: messageText
    })

    // Stream AI response
    const startTime = Date.now()
    const memoryTime = Date.now()
    console.log(`[Performance] Memory processing took: ${memoryTime - startTime}ms | Skip: ${skipMemoryProcessing}`)

    const result = streamText({
      model: openai('gpt-4-turbo'),
      system: personalizedPrompt,
      messages: convertToCoreMessages(messages),
      temperature: 0.7,
      
      // Tool calls for fetching opportunities and advice
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
        },
        searchAdvicePosts: {
          description: 'Find relevant advice posts from other Dartmouth students based on user questions or topics',
          inputSchema: z.object({
            category: z.string().optional().describe('Category filter (research, internships, study-abroad, academics, career, life, general)'),
            featured: z.boolean().optional().describe('Only show featured posts'),
            limit: z.number().optional().describe('Number of posts to return (default 3)')
          }),
          execute: async ({ category, featured, limit = 3 }) => {
            try {
              const advicePosts = await authenticatedConvex.query(api.advice.getAdvicePosts, {
                category,
                featured,
                limit
              })
              return {
                advicePosts: advicePosts.map(post => ({
                  id: post._id,
                  title: post.title,
                  excerpt: post.excerpt || post.content.substring(0, 150) + '...',
                  authorName: post.authorFirstName,
                  authorYear: post.authorYear,
                  category: post.category,
                  tags: post.tags,
                  likes: post.likes,
                  isAnonymous: post.isAnonymous
                }))
              }
            } catch (error) {
              console.error('Error searching advice posts:', error)
              return { advicePosts: [], error: 'Failed to search advice posts' }
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

        // Extract insights for Mem0 (run in background) - only for substantive messages
        if (!skipMemoryProcessing) {
          console.log(`[Memory Processing] Extracting insights from: "${userMessage.substring(0, 50)}..."`)
          memoryManager.extractConversationInsights(userId, userMessage).catch(console.error)
        } else {
          console.log(`[Memory Processing] Skipping memory extraction for: "${userMessage.substring(0, 50)}..." (${messageClassification.type})`)
        }

        // Track analytics
        const totalResponseTime = Date.now() - startTime
        console.log(`[Performance] Total response time: ${totalResponseTime}ms | Classification: ${messageClassification.type}`)

        await authenticatedConvex.mutation(api.analytics.trackChatMessage, {
          userId: user!._id,
          tokensUsed: usage?.totalTokens || 0,
          responseTime: totalResponseTime
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