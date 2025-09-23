import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

export const runtime = 'nodejs'

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const { userId, getToken } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Clerk JWT token for Convex authentication
    const token = await getToken({ template: 'convex' })

    // Create authenticated Convex client
    const authenticatedConvex = new ConvexHttpClient(
      process.env.NEXT_PUBLIC_CONVEX_URL!,
      token ? { auth: token } : undefined
    )

    // Check if user is admin
    const isAdmin = await authenticatedConvex.query(api.users.isCurrentUserAdmin)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Check the URL
    let status = 'broken'
    let statusCode = 0
    let redirectUrl = null
    let error = null

    try {
      // Set timeout for URL checking
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(url, {
        method: 'HEAD', // Use HEAD to avoid downloading content
        signal: controller.signal,
        headers: {
          'User-Agent': 'Find-Your-Path-URL-Checker/1.0'
        }
      })

      clearTimeout(timeoutId)
      statusCode = response.status

      if (response.status >= 200 && response.status < 300) {
        status = 'working'
      } else if (response.status >= 300 && response.status < 400) {
        status = 'redirect'
        redirectUrl = response.headers.get('location')
      } else {
        status = 'broken'
      }

    } catch (err: any) {
      if (err.name === 'AbortError') {
        error = 'Request timeout'
        status = 'broken'
      } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
        error = 'Domain not found or connection refused'
        status = 'broken'
      } else {
        error = err.message || 'Unknown error'
        status = 'broken'
      }
    }

    return NextResponse.json({
      url,
      status,
      statusCode,
      redirectUrl,
      error,
      checkedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('URL check failed:', error)
    return NextResponse.json(
      { error: 'Failed to check URL' },
      { status: 500 }
    )
  }
}