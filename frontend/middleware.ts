import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
  '/api/webhooks(.*)',
  '/why',
  '/opportunities' // Allow public browsing of opportunities
])

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  const { userId, user } = await auth()

  // Redirect unauthenticated users to sign-in
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  // Validate @dartmouth.edu email for authenticated users
  if (user) {
    const primaryEmail = user.emailAddresses?.[0]?.emailAddress
    
    // For development, allow non-Dartmouth emails but log warning
    if (!primaryEmail?.endsWith('@dartmouth.edu')) {
      console.warn(`⚠️ Non-Dartmouth email detected: ${primaryEmail}`)
      
      // In production, uncomment this to enforce Dartmouth emails:
      /*
      const errorUrl = new URL('/auth-error', req.url)
      errorUrl.searchParams.set('error', 'invalid_email_domain')
      return NextResponse.redirect(errorUrl)
      */
    }
  }

  // Check if user has completed onboarding
  if (!isOnboardingRoute(req) && req.nextUrl.pathname !== '/chat') {
    // We'll implement user profile check later
    // For now, allow authenticated users through
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}