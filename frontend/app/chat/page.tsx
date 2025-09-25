"use client"

import { useUser } from '@clerk/nextjs'
import { useConvexAuth } from 'convex/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { ChatInterface } from '@/components/chat/chat-interface'
import { ConversationSidebar } from '@/components/chat/conversation-sidebar'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { Button } from '@/components/ui/button'
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
  const [userCreationAttempts, setUserCreationAttempts] = useState(0)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [userCreationError, setUserCreationError] = useState<string | null>(null)

  useEffect(() => {
    async function ensureUserExists() {
      // Only attempt if authenticated, no profile exists, and we haven't exceeded attempts
      if (isAuthenticated && userProfile === null && userCreationAttempts < 3 && !isCreatingUser) {
        setIsCreatingUser(true)
        setUserCreationError(null)

        try {
          // Add a small delay to ensure Clerk has fully synced
          await new Promise(resolve => setTimeout(resolve, 1000))

          const result = await getOrCreateUser()
          if (result) {
            console.log('User created successfully:', result)
            setUserCreationAttempts(0) // Reset attempts on success
          }
        } catch (error) {
          console.error(`Failed to create user (attempt ${userCreationAttempts + 1}/3):`, error)
          setUserCreationAttempts(prev => prev + 1)

          // Set user-friendly error message
          if (userCreationAttempts >= 2) {
            setUserCreationError('Having trouble setting up your account. Please refresh the page or try again later.')
          }
        } finally {
          setIsCreatingUser(false)
        }
      }
    }
    ensureUserExists()
  }, [isAuthenticated, userProfile, getOrCreateUser, userCreationAttempts, isCreatingUser])

  // Show loading state
  if (!isLoaded || isLoading) {
    return <LoadingScreen />
  }

  // Show user creation loading state
  if (isAuthenticated && userProfile === null && !userCreationError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Setting up your account...
            </h2>
            <p className="text-muted-foreground">
              We're creating your profile. This will just take a moment.
            </p>
          </div>
          {userCreationAttempts > 1 && (
            <p className="text-sm text-amber-600">
              Taking a bit longer than expected. Please wait...
            </p>
          )}
        </div>
      </div>
    )
  }

  // Show error state if user creation failed after all attempts
  if (userCreationError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Setup Issue
            </h2>
            <p className="text-muted-foreground">
              {userCreationError}
            </p>
          </div>
          <Button
            onClick={() => {
              setUserCreationError(null)
              setUserCreationAttempts(0)
              window.location.reload()
            }}
            className="bg-primary hover:bg-primary/90"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
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