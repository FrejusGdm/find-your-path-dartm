"use client"

import { useUser } from '@clerk/nextjs'
import { useConvexAuth } from 'convex/react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { ChatInterface } from '@/components/chat/chat-interface'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

function ChatPageContent() {
  const { user, isLoaded } = useUser()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const searchParams = useSearchParams()
  const [initialMessage, setInitialMessage] = useState<string | null>(null)

  // Get user profile from Convex
  const userProfile = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  )

  // Mutation to create user if needed
  const getOrCreateUser = useMutation(api.users.getOrCreateUser)

  // Handle URL query parameter or sessionStorage for initial message
  useEffect(() => {
    if (isLoaded && user) {
      // Check URL parameter first
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

  // Main chat interface
  return (
    <div className="min-h-screen bg-background">
      <ChatInterface initialMessage={initialMessage} />
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