import { streamText, convertToCoreMessages } from 'ai'
import { openai } from '@ai-sdk/openai'
import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { memoryManager } from '@/lib/mem0'
import { classifyMessage, shouldSkipMemoryProcessing } from '@/lib/message-classifier'
import { z } from 'zod'

// Force this route to use Node.js runtime instead of Edge runtime
// This prevents "TypeError: immutable" errors with AI SDK and other dependencies
export const runtime = 'nodejs'

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
- NEVER use tools for greetings ("hi", "hello", "yo", "hey"), acknowledgments ("ok", "thanks", "cool"), or casual conversation
- ONLY search for opportunities when the student explicitly asks for specific recommendations or when they provide clear criteria (year, major, interests, etc.)
- Use searchAdvicePosts when students ask about experiences, tips, or "what's it like" questions - real student stories are incredibly valuable
- Do NOT automatically search after every general question about opportunities
- First provide general guidance and encouragement, then ask if they want specific recommendations
- Batch your tool usage - if you need to search, do it once per conversation turn, not multiple times
- Prioritize conversational flow over showing off search capabilities
- Simple greetings and acknowledgments should receive warm, conversational responses WITHOUT any tool usage

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
    const { messages, conversationId, userId: requestUserId } = await req.json()

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

    // Get the last message for classification
    const lastMessage = messages[messages.length - 1]
    const messageText = lastMessage?.content || ''

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
    let personalizedPrompt = ""

    // Add GenZ mode FIRST if enabled (so it takes priority)
    if (userContext?.genzMode) {
      personalizedPrompt = GENZ_MODE_PROMPT + "\n\n"
      console.log('[GenZ Mode] Activated for user')
    }

    // Then add the main system prompt
    personalizedPrompt += SYSTEM_PROMPT

    // Add immediate personalization from Convex user data (respecting privacy settings)
    if (user) {
      try {
        const shareNameWithAI = user.shareNameWithAI !== false // Default to true if not set
        const userName = shareNameWithAI ? (user.name || 'there') : 'there'
        const fullName = shareNameWithAI ? userName : 'there'
        const email = user.email || ''
        const isDartmouthEmail = email.includes('@dartmouth.edu')
        const createdAt = user._creationTime || Date.now()
        const accountAge = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24))
        const isNewUser = accountAge < 7 // Less than a week old
        const isFirstConversation = messages.length <= 1

        console.log(`[Immediate Personalization] Applied for ${shareNameWithAI ? fullName : 'anonymous user'} | Name sharing: ${shareNameWithAI} | Dartmouth: ${isDartmouthEmail} | New: ${isNewUser} | First chat: ${isFirstConversation}`)

        personalizedPrompt += `\n\nIMMEDIATE CONTEXT:
- Student name: ${shareNameWithAI ? fullName : 'Student (name not shared)'}
- Email verification: ${isDartmouthEmail ? 'Confirmed Dartmouth student (@dartmouth.edu)' : 'Email verified'}
- Account status: ${isNewUser ? `New user (${accountAge} days old)` : `Returning user (${accountAge} days)`}
- Session type: ${isFirstConversation ? 'First conversation' : 'Continuing conversation'}

${shareNameWithAI ? `Use their name naturally in responses. ${isNewUser ? 'Welcome them warmly as a new user.' : 'Greet them as a returning student.'}` : 'Address them respectfully without using their name.'} ${isDartmouthEmail ? 'Reference their confirmed Dartmouth status when relevant.' : ''}`
      } catch (error) {
        console.error('[Immediate Personalization] Error processing user data:', error)
        // Continue without immediate personalization if user data is unavailable
      }
    } else {
      console.log('[Immediate Personalization] No user data available')
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


    // Handle conversation management
    let conversation: any = null
    if (conversationId) {
      // Use existing conversation
      conversation = await authenticatedConvex.query(api.conversations.getConversationById, {
        conversationId
      })

      // Update last message time
      if (conversation) {
        await authenticatedConvex.mutation(api.conversations.updateConversationTitle, {
          conversationId: conversation._id,
          title: conversation.title || messageText.substring(0, 50) + (messageText.length > 50 ? '...' : '')
        })
      }
    } else if (user) {
      // Only create new conversation if we have a user and no conversationId
      // The frontend will handle passing conversationId once created
      conversation = await authenticatedConvex.mutation(api.conversations.createConversation, {
        userId: user._id,
        title: messageText.substring(0, 50) + (messageText.length > 50 ? '...' : '')
      })
    }

    // Store user message in database
    if (conversation) {
      await authenticatedConvex.mutation(api.messages.createMessage, {
        conversationId: conversation._id,
        userId: user!._id,
        role: 'user',
        content: messageText
      })
    }

    // Stream AI response
    const startTime = Date.now()
    const memoryTime = Date.now()
    console.log(`[Performance] Memory processing took: ${memoryTime - startTime}ms | Skip: ${skipMemoryProcessing}`)

    // Determine if tools should be available based on message classification
    const shouldProvideTools = !['SIMPLE_GREETING', 'ACKNOWLEDGMENT'].includes(messageClassification.type)
    console.log(`[Tool Availability] Message type: ${messageClassification.type} | Tools enabled: ${shouldProvideTools}`)

    // Configure tools based on message classification
    const toolsConfig = shouldProvideTools ? {
      searchOpportunities: {
        description: 'ONLY use when user explicitly asks for specific opportunities, recommendations, or provides clear search criteria (major, year, interests). DO NOT use for greetings, casual conversation, or general questions.',
        inputSchema: z.object({
          query: z.string().describe('Search query'),
          category: z.string().optional().describe('Category filter (research, internship, grant, program)'),
          year: z.string().optional().describe('Student year filter'),
          department: z.string().optional().describe('Department filter'),
          isPaid: z.boolean().optional().describe('Filter for paid opportunities'),
          internationalEligible: z.boolean().optional().describe('Filter for international student eligibility')
        }),
        execute: async ({ query, category, year, department, isPaid, internationalEligible }: any) => {
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
        description: 'ONLY use when user asks for experiences, tips, or "what\'s it like" questions about specific topics. DO NOT use for greetings, acknowledgments, or casual conversation.',
        inputSchema: z.object({
          category: z.string().optional().describe('Category filter (research, internships, study-abroad, academics, career, life, general)'),
          featured: z.boolean().optional().describe('Only show featured posts'),
          limit: z.number().optional().describe('Number of posts to return (default 3)')
        }),
        execute: async ({ category, featured, limit = 3 }: any) => {
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
    } : undefined

    const result = streamText({
      model: openai('gpt-4-turbo'),
      system: personalizedPrompt,
      messages: convertToCoreMessages(messages),
      temperature: 0.7,
      tools: toolsConfig,

      onFinish: async ({ text, toolCalls, usage }) => {
        const userMessage = messageText

        // Store the assistant response in Convex
        if (conversation) {
          await authenticatedConvex.mutation(api.messages.createMessage, {
            conversationId: conversation._id,
            userId: user!._id,
            role: 'assistant',
            content: text,
            model: 'gpt-4-turbo',
            tokensUsed: usage?.totalTokens,
            toolCalls: toolCalls?.map(tc => tc.toolName) || []
          })
        }

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