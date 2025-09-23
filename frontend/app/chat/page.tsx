"use client"

import { useUser } from '@clerk/nextjs'
import { useConvexAuth } from 'convex/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { ChatInterface } from '@/components/chat/chat-interface'
import { ConversationSidebar } from '@/components/chat/conversation-sidebar'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

function ChatPageContent() {
  const { user, isLoaded } = useUser()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [initialMessage, setInitialMessage] = useState<string | null>(null)
  const [activeConversationId, setActiveConversationId] = useState<Id<"conversations"> | null>(null)

  // Get user profile from Convex
  const userProfile = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  )

  // Mutations
  const getOrCreateUser = useMutation(api.users.getOrCreateUser)
  const createConversation = useMutation(api.conversations.createConversation)

  // Handle URL parameters and conversation ID
  useEffect(() => {
    if (isLoaded && user) {
      // Check for conversation ID in URL
      const conversationIdParam = searchParams.get('id')
      if (conversationIdParam) {
        setActiveConversationId(conversationIdParam as Id<"conversations">)
      }

      // Check URL parameter for initial query
      const urlQuery = searchParams.get('q')
      if (urlQuery) {
        setInitialMessage(urlQuery)
        return
      }

      // Check sessionStorage for pending query after login
      const pendingQuery = sessionStorage.getItem('pendingChatQuery')
      if (pendingQuery) {
        setInitialMessage(pendingQuery)
        sessionStorage.removeItem('pendingChatQuery')
      }
    }
  }, [isLoaded, user, searchParams])

  // Create user in Convex if authenticated but no profile exists
  useEffect(() => {
    async function ensureUserExists() {
      if (isAuthenticated && userProfile === null) {
        try {
          await getOrCreateUser()
        } catch (error) {
          console.error('Failed to create user:', error)
        }
      }
    }
    ensureUserExists()
  }, [isAuthenticated, userProfile, getOrCreateUser])

  // Show loading state
  if (!isLoaded || isLoading) {
    return <LoadingScreen />
  }

  // Show onboarding if user hasn't completed it
  if (userProfile && !userProfile.hasCompletedOnboarding) {
    return <OnboardingFlow />
  }

  // Handle conversation selection
  const handleSelectConversation = (conversationId: Id<"conversations"> | null) => {
    setActiveConversationId(conversationId)
    if (conversationId) {
      router.push(`/chat?id=${conversationId}`)
    } else {
      router.push('/chat')
    }
  }

  // Handle new conversation
  const handleNewConversation = async () => {
    if (!userProfile) return

    const newConversation = await createConversation({
      userId: userProfile._id,
    })

    if (newConversation) {
      handleSelectConversation(newConversation._id)
    }
  }

  // Auto-create conversation if none exists and user starts chatting
  const handleAutoCreateConversation = async () => {
    if (!userProfile || activeConversationId) return null

    const newConversation = await createConversation({
      userId: userProfile._id,
    })

    if (newConversation) {
      setActiveConversationId(newConversation._id)
      router.push(`/chat?id=${newConversation._id}`)
      return newConversation._id
    }
    return null
  }

  // Main chat interface with sidebar
  return (
    <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] bg-background flex overflow-hidden touch-manipulation">
      {/* Desktop Sidebar */}
      {userProfile && (
        <ConversationSidebar
          userId={userProfile._id}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          className="w-80 flex-shrink-0 hidden md:flex"
        />
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Mobile Menu */}
        <div className="md:hidden flex items-center p-4 border-b flex-shrink-0 bg-background/95 backdrop-blur">
          {userProfile && (
            <ConversationSidebar
              userId={userProfile._id}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
              isMobile
            />
          )}
          <span className="ml-4 font-semibold">Find your Path</span>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 min-h-0 flex flex-col">
          <ChatInterface
            initialMessage={initialMessage}
            conversationId={activeConversationId}
            userId={userProfile?._id}
            onAutoCreateConversation={handleAutoCreateConversation}
          />
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ChatPageContent />
    </Suspense>
  )
}