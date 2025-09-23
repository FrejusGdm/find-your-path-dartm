import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
  '/api/webhooks(.*)',
  '/why',
  '/opportunities' // Allow public browsing of opportunities
])

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes without auth check
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // For protected routes, check if user is authenticated
  // Convex will handle the actual auth validation via JWT
  const { userId } = await auth()
  if (!userId) {
    const url = new URL('/sign-in', req.url)
    url.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}