"use client"

import { useUser } from '@clerk/nextjs'
import { useConvexAuth } from 'convex/react'
import { ChatInterface } from '@/components/chat/chat-interface'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function ChatPage() {
  const { user, isLoaded } = useUser()
  const { isAuthenticated, isLoading } = useConvexAuth()

  // Get user profile from Convex
  const userProfile = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  )

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
      <ChatInterface />
    </div>
  )
}