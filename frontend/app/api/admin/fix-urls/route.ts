import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'

export const runtime = 'nodejs'

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

interface FixResult {
  id: string
  title: string
  originalUrl: string
  status: 'fixed' | 'still_broken' | 'error'
  newUrl?: string
  reason?: string
}

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

    const { limit = 10 } = await req.json()

    // Get broken URLs to fix
    const brokenOpportunities = await authenticatedConvex.query(
      api.opportunities.adminGetOpportunitiesForUrlCheck,
      {}
    )

    const brokenUrls = brokenOpportunities.filter(opp =>
      opp.currentStatus === 'broken'
    ).slice(0, limit)

    if (brokenUrls.length === 0) {
      return NextResponse.json({
        message: 'No broken URLs to fix',
        results: []
      })
    }

    const results: FixResult[] = []

    // Process each broken URL
    for (const opportunity of brokenUrls) {
      try {
        console.log(`Attempting to fix URL for: ${opportunity.title}`)
        const fixResult = await attemptUrlFix(opportunity.url, opportunity.title)

        results.push({
          id: opportunity.id,
          title: opportunity.title,
          originalUrl: opportunity.url,
          ...fixResult
        })

        // Update database if we found a better URL
        if (fixResult.status === 'fixed' && fixResult.newUrl) {
          await authenticatedConvex.mutation(api.opportunities.adminUpdate, {
            id: opportunity.id,
            officialUrl: fixResult.newUrl
          })

          // Mark as working
          await authenticatedConvex.mutation(api.opportunities.adminUpdateUrlStatus, {
            id: opportunity.id,
            status: 'working'
          })
        }

      } catch (error) {
        console.error(`Error processing ${opportunity.title}:`, error)
        results.push({
          id: opportunity.id,
          title: opportunity.title,
          originalUrl: opportunity.url,
          status: 'error',
          reason: 'Processing failed'
        })
      }
    }

    const fixedCount = results.filter(r => r.status === 'fixed').length
    const stillBrokenCount = results.filter(r => r.status === 'still_broken').length

    return NextResponse.json({
      message: `Processed ${results.length} URLs: ${fixedCount} fixed, ${stillBrokenCount} still broken`,
      results,
      summary: {
        processed: results.length,
        fixed: fixedCount,
        stillBroken: stillBrokenCount,
        errors: results.filter(r => r.status === 'error').length
      }
    })

  } catch (error) {
    console.error('URL fix operation failed:', error)
    return NextResponse.json(
      { error: 'Failed to fix URLs' },
      { status: 500 }
    )
  }
}

async function attemptUrlFix(url: string, title: string): Promise<Pick<FixResult, 'status' | 'newUrl' | 'reason'>> {
  try {
    // First, try the original URL with basic fetch to see what happens
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Find-Your-Path-URL-Fixer/1.0'
      },
      redirect: 'follow' // Follow redirects
    })

    clearTimeout(timeoutId)

    // If we got a good response, check if URL changed due to redirects
    if (response.status >= 200 && response.status < 300) {
      const finalUrl = response.url

      if (finalUrl !== url) {
        // URL was redirected, use the final URL
        return {
          status: 'fixed',
          newUrl: finalUrl,
          reason: 'Followed redirect to working URL'
        }
      }

      // URL works as-is, but let's try to find student-specific content
      const html = await response.text()
      const betterUrl = await findStudentOpportunityUrl(html, finalUrl, title)

      if (betterUrl && betterUrl !== finalUrl) {
        return {
          status: 'fixed',
          newUrl: betterUrl,
          reason: 'Found student-specific opportunity section'
        }
      }

      // URL works but no better alternative found
      return {
        status: 'fixed',
        newUrl: finalUrl,
        reason: 'URL is working'
      }
    }

    // URL is truly broken
    return {
      status: 'still_broken',
      reason: `HTTP ${response.status}: ${response.statusText}`
    }

  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        status: 'still_broken',
        reason: 'Request timeout'
      }
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return {
        status: 'still_broken',
        reason: 'Domain not found or connection refused'
      }
    }

    return {
      status: 'still_broken',
      reason: error.message || 'Unknown error'
    }
  }
}

async function findStudentOpportunityUrl(html: string, baseUrl: string, title: string): Promise<string | null> {
  try {
    // Keywords that indicate student opportunities
    const opportunityKeywords = [
      'student funding', 'undergraduate research', 'student opportunities',
      'research opportunities', 'internship', 'fellowship', 'scholarship',
      'grants', 'student programs', 'undergraduate programs'
    ]

    // Look for links that might contain better student opportunity content
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*(?:<[^>]*>[^<]*)*)<\/a>/gi
    const links = []
    let match

    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1]
      const linkText = match[2].replace(/<[^>]*>/g, '').toLowerCase()

      // Check if link text contains opportunity keywords
      const hasOpportunityKeyword = opportunityKeywords.some(keyword =>
        linkText.includes(keyword.toLowerCase())
      )

      // Check if href looks like a student opportunity URL
      const hasOpportunityPath = /\b(student|undergraduate|research|opportunit|fellowship|grant|scholar|intern)\b/i.test(href)

      if (hasOpportunityKeyword || hasOpportunityPath) {
        // Convert relative URLs to absolute
        let fullUrl = href
        if (href.startsWith('/')) {
          const baseUrlObj = new URL(baseUrl)
          fullUrl = `${baseUrlObj.protocol}//${baseUrlObj.host}${href}`
        } else if (href.startsWith('./')) {
          fullUrl = new URL(href, baseUrl).toString()
        } else if (!href.startsWith('http')) {
          fullUrl = new URL(href, baseUrl).toString()
        }

        links.push({
          url: fullUrl,
          text: linkText,
          score: (hasOpportunityKeyword ? 2 : 0) + (hasOpportunityPath ? 1 : 0)
        })
      }
    }

    // Sort by relevance score and return the best match
    if (links.length > 0) {
      links.sort((a, b) => b.score - a.score)
      return links[0].url
    }

    // Also check for common student opportunity URL patterns in the current page
    const currentUrl = new URL(baseUrl)
    const commonPaths = [
      '/students',
      '/undergraduate',
      '/research',
      '/opportunities',
      '/funding',
      '/grants',
      '/fellowships',
      '/student-research'
    ]

    // Try common student opportunity paths on the same domain
    for (const path of commonPaths) {
      const testUrl = `${currentUrl.protocol}//${currentUrl.host}${path}`
      if (html.toLowerCase().includes(path.toLowerCase())) {
        return testUrl
      }
    }

    return null
  } catch (error) {
    console.error('Error parsing HTML for student opportunities:', error)
    return null
  }
}