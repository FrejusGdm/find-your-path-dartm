"use client"

import { SignUp, ClerkLoaded, ClerkLoading } from '@clerk/nextjs'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { LoadingScreen } from '@/components/ui/loading-screen'

export default function SignUpPage() {
  return (
    <>
      {/* Show loading screen while Clerk is loading */}
      <ClerkLoading>
        <LoadingScreen />
      </ClerkLoading>

      {/* Show sign-up page once Clerk is loaded */}
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
              Start finding your <span className="font-accent text-primary">Path</span>
            </h1>
            <p className="text-muted-foreground">
              Create your account to discover opportunities tailored just for you
            </p>
          </div>

          {/* Clerk Sign Up Component */}
          <div className="flex justify-center">
            <SignUp 
              routing="path"
              path="/sign-up"
              fallbackRedirectUrl="/onboarding"
              signInUrl="/sign-in"
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
              Already have an account?{' '}
              <Link 
                href="/sign-in" 
                className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Dartmouth Email Notice */}
          <div className="text-center p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="text-sm">
              <strong className="text-primary">📧 Dartmouth Students Only</strong>
              <br />
              <span className="text-muted-foreground">
                Please use your @dartmouth.edu email address. We verify student status during signup.
              </span>
            </p>
          </div>

          {/* Features Preview */}
          <div className="space-y-3">
            <p className="text-center text-sm font-medium text-foreground">What you'll get:</p>
            <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Personalized opportunity recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>AI assistant that remembers your interests</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Direct links to applications and contacts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      </ClerkLoaded>
    </>
  )
}