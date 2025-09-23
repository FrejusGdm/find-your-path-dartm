import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

// Force Node.js runtime for consistency
export const runtime = 'nodejs'

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

// Convert Convex messages to AI SDK v5 UIMessage format with parts
function convertToUIMessages(convexMessages: any[]) {
  return convexMessages.map(msg => ({
    id: msg._id,
    role: msg.role as 'user' | 'assistant' | 'system',
    parts: [
      {
        type: 'text' as const,
        text: msg.content
      }
    ],
    createdAt: new Date(msg.createdAt),
  }))
}

export async function GET(
  req: Request,
  context: { params: Promise<{ conversationId: string }> }
) {
  try {
    // Await the params
    const params = await context.params
    const conversationId = params.conversationId as Id<"conversations">

    // Get authenticated user
    const { userId, getToken } = await auth()
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Get Clerk JWT token for Convex authentication
    const token = await getToken({ template: 'convex' })

    // Create authenticated Convex client
    const authenticatedConvex = new ConvexHttpClient(
      process.env.NEXT_PUBLIC_CONVEX_URL!,
      token ? { auth: token } : undefined
    )

    // Get conversation to verify ownership
    const conversation = await authenticatedConvex.query(
      api.conversations.getConversationById,
      { conversationId }
    )

    if (!conversation) {
      return new Response('Conversation not found', { status: 404 })
    }

    // Get messages for the conversation
    const messages = await authenticatedConvex.query(
      api.messages.getConversationMessages,
      { conversationId }
    )

    // Convert to UI message format
    const uiMessages = convertToUIMessages(messages)

    return new Response(JSON.stringify({ messages: uiMessages }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error loading conversation messages:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to load messages',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}