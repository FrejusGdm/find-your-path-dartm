"use client"

import { SignIn, ClerkLoaded, ClerkLoading } from '@clerk/nextjs'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { LoadingScreen } from '@/components/ui/loading-screen'

export default function SignInPage() {
  return (
    <>
      {/* Show loading screen while Clerk is loading */}
      <ClerkLoading>
        <LoadingScreen />
      </ClerkLoading>

      {/* Show sign-in page once Clerk is loaded */}
      <ClerkLoaded>
        <div className="min-h-screen bg-gradient-to-b from-stone-25 to-transparent flex flex-col">
          {/* Header */}
          <div className="p-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md space-y-8">
              {/* Header */}
              <div className="text-center space-y-4">
                <h1 className="font-display text-3xl font-semibold">
                  Welcome back to Find your <span className="font-accent text-primary">Path</span>
                </h1>
                <p className="text-muted-foreground">
                  Sign in with your Dartmouth email to continue discovering opportunities
                </p>
              </div>

              {/* Clerk Sign In Component */}
              <div className="flex justify-center">
                <SignIn
                  routing="path"
                  path="/sign-in"
                  fallbackRedirectUrl="/chat"
                  signUpUrl="/sign-up"
                  appearance={{
                    elements: {
                      card: "shadow-lg border-border",
                      headerTitle: "hidden", // Hide default title since we have our own
                      headerSubtitle: "hidden",
                    }
                  }}
                />
              </div>

              {/* Footer Message */}
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  New to Find your Path?{' '}
                  <Link
                    href="/sign-up"
                    className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline"
                  >
                    Create an account
                  </Link>
                </p>
              </div>

              {/* Dartmouth Email Notice */}
              <div className="text-center p-4 bg-muted rounded-xl">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> You need a @dartmouth.edu email address to access this platform.
                  <br />
                  Other schools coming soon!
                </p>
              </div>
            </div>
          </div>
        </div>
      </ClerkLoaded>
    </>
  )
}