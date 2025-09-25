"use client"

import { useUser } from '@clerk/nextjs'
import { useConvexAuth } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const { isAuthenticated, isLoading } = useConvexAuth()
  const router = useRouter()
  const [loadingMessage, setLoadingMessage] = useState("Setting up your personalized experience...")

  // Get user profile from Convex
  const userProfile = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  )

  // Mutations
  const getOrCreateUser = useMutation(api.users.getOrCreateUser)

  // Create user in Convex if authenticated but no profile exists
  const [userCreationAttempts, setUserCreationAttempts] = useState(0)
  const [isCreatingUser, setIsCreatingUser] = useState(false)

  useEffect(() => {
    async function ensureUserExists() {
      // Only attempt if authenticated, no profile exists, and we haven't exceeded attempts
      if (isAuthenticated && userProfile === null && userCreationAttempts < 3 && !isCreatingUser) {
        setIsCreatingUser(true)

        // Update loading message based on attempts
        if (userCreationAttempts === 0) {
          setLoadingMessage("Creating your profile...")
        } else if (userCreationAttempts === 1) {
          setLoadingMessage("Almost ready...")
        } else {
          setLoadingMessage("Just a moment more...")
        }

        try {
          // Add a small delay to ensure Clerk has fully synced
          await new Promise(resolve => setTimeout(resolve, 1000))

          const result = await getOrCreateUser()
          if (result) {
            console.log('User created successfully:', result)
            setUserCreationAttempts(0) // Reset attempts on success
            setLoadingMessage("Welcome to Find your Path!")
          }
        } catch (error) {
          console.error(`Failed to create user (attempt ${userCreationAttempts + 1}/3):`, error)
          setUserCreationAttempts(prev => prev + 1)

          if (userCreationAttempts >= 2) {
            // After 3 attempts, redirect to home with error
            router.push('/?error=setup')
          }
        } finally {
          setIsCreatingUser(false)
        }
      }
    }
    ensureUserExists()
  }, [isAuthenticated, userProfile, getOrCreateUser, userCreationAttempts, isCreatingUser, router])

  // Check authentication status
  useEffect(() => {
    if (isLoaded && !user) {
      // Not logged in, redirect to sign-up
      router.push('/sign-up')
    }
  }, [isLoaded, user, router])

  // Check if onboarding is already complete
  useEffect(() => {
    if (userProfile?.hasCompletedOnboarding) {
      // Already completed onboarding, redirect to chat
      router.push('/chat')
    }
  }, [userProfile, router])

  // Show loading state while checking authentication or creating user
  if (!isLoaded || isLoading || isCreatingUser || (isAuthenticated && userProfile === null)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-25 to-transparent flex items-center justify-center">
        <div className="text-center space-y-4">
          {/* Logo/Brand */}
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-semibold text-foreground">
              Find your <span className="font-accent text-primary">Path</span>
            </h1>
            <p className="text-muted-foreground text-sm animate-pulse">
              {loadingMessage}
            </p>
          </div>

          {/* Loading Animation */}
          <div className="flex justify-center py-8">
            <div className="relative">
              {/* Main spinner */}
              <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />

              {/* Pulsing background */}
              <div className="absolute inset-0 w-12 h-12 bg-primary/10 rounded-full animate-pulse" />
            </div>
          </div>

          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="w-48 h-2 bg-muted rounded-full mx-auto overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: userCreationAttempts === 0 ? '30%' :
                         userCreationAttempts === 1 ? '60%' :
                         userCreationAttempts === 2 ? '90%' : '100%'
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {userCreationAttempts > 0 && "This is taking a bit longer than usual..."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show onboarding flow if user exists but hasn't completed onboarding
  if (userProfile && !userProfile.hasCompletedOnboarding) {
    return <OnboardingFlow />
  }

  // Default loading (shouldn't usually reach here)
  return <LoadingScreen />
}