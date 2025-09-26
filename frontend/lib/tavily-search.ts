import { tavily } from '@tavily/core'

// Initialize Tavily client
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY || '' })

// Official Dartmouth domains to prioritize in search results
const DARTMOUTH_DOMAINS = [
  'students.dartmouth.edu',
  'dartmouth.edu',
  'admissions.dartmouth.edu',
  'engineering.dartmouth.edu',
  'dali.dartmouth.edu',
  'dickey.dartmouth.edu',
  'rockefeller.dartmouth.edu',
  'hop.dartmouth.edu',
  'wisp.dartmouth.edu',
  'ugar.dartmouth.edu',
  'tucker.dartmouth.edu'
]

export interface SearchResult {
  title: string
  url: string
  content: string
  score: number
  published_date?: string
  source_domain: string
  is_official_dartmouth: boolean
}

export interface DartmouthSearchOptions {
  include_answer?: boolean
  max_results?: number
  search_depth?: 'basic' | 'advanced'
  include_raw_content?: boolean
  exclude_domains?: string[]
}

/**
 * Search for Dartmouth-specific information with domain prioritization
 */
export async function searchDartmouthInfo(
  query: string,
  options: DartmouthSearchOptions = {}
): Promise<{
  results: SearchResult[]
  answer?: string
  query: string
  confidence: number
}> {
  const {
    include_answer = true,
    max_results = 5,
    search_depth = 'basic',
    include_raw_content = false,
    exclude_domains = []
  } = options

  if (!process.env.TAVILY_API_KEY) {
    throw new Error('Tavily API key not configured')
  }

  // Enhance query with Dartmouth context
  const enhancedQuery = `${query} site:dartmouth.edu OR site:students.dartmouth.edu`

  try {
    console.log(`🔍 [Tavily Search] Starting search with query: "${enhancedQuery}"`)
    console.log(`🔍 [Tavily Search] API Key configured: ${!!process.env.TAVILY_API_KEY}`)

    const searchResponse = await tvly.search(enhancedQuery, {
      include_answer,
      max_results,
      search_depth,
      include_raw_content,
      exclude_domains: [...exclude_domains, 'reddit.com', 'facebook.com', 'instagram.com', 'twitter.com']
    })

    console.log(`🔍 [Tavily Search] Response received:`, {
      resultsCount: searchResponse?.results?.length || 0,
      hasAnswer: !!searchResponse?.answer,
      responseKeys: Object.keys(searchResponse || {})
    })

    // Process and score results based on domain authority
    const processedResults: SearchResult[] = searchResponse.results.map((result: any) => {
      let domain = ''
      try {
        const url = new URL(result.url)
        domain = url.hostname.toLowerCase()
      } catch (error) {
        console.warn(`[Tavily Search] Invalid URL: ${result.url}`, error)
        // Fallback domain extraction
        domain = result.url.replace(/^https?:\/\//, '').split('/')[0].toLowerCase()
      }

      const isDartmouthOfficial = DARTMOUTH_DOMAINS.some(dartmouthDomain =>
        domain === dartmouthDomain || domain.endsWith('.' + dartmouthDomain)
      )

      // Boost score for official Dartmouth sources
      let adjustedScore = result.score || 0
      if (isDartmouthOfficial) {
        adjustedScore *= 1.5 // 50% boost for official sources
      }

      return {
        title: result.title,
        url: result.url,
        content: result.content,
        score: Math.min(adjustedScore, 1.0), // Cap at 1.0
        published_date: result.published_date,
        source_domain: domain,
        is_official_dartmouth: isDartmouthOfficial
      }
    })

    // Sort by adjusted score (official sources prioritized)
    processedResults.sort((a, b) => b.score - a.score)

    // Calculate overall confidence based on official sources
    const officialResults = processedResults.filter(r => r.is_official_dartmouth)
    const confidence = officialResults.length > 0 ?
      Math.min(0.9, 0.6 + (officialResults.length * 0.1)) :
      Math.min(0.5, processedResults.length > 0 ? processedResults[0].score : 0)

    return {
      results: processedResults.slice(0, max_results),
      answer: searchResponse.answer,
      query: enhancedQuery,
      confidence
    }
  } catch (error) {
    console.error('🚨 [Tavily Search] Error occurred:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      query: enhancedQuery,
      apiKeyPresent: !!process.env.TAVILY_API_KEY
    })
    throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Search specifically for opportunity information
 */
export async function searchOpportunityInfo(
  opportunityName: string,
  additionalContext?: string
): Promise<{
  results: SearchResult[]
  answer?: string
  confidence: number
}> {
  const query = additionalContext
    ? `"${opportunityName}" ${additionalContext} opportunities funding application`
    : `"${opportunityName}" Dartmouth opportunities funding application deadlines`

  return await searchDartmouthInfo(query, {
    max_results: 3,
    search_depth: 'advanced',
    include_answer: true
  })
}

/**
 * Search for current application deadlines
 */
export async function searchCurrentDeadlines(
  programName: string
): Promise<{
  results: SearchResult[]
  answer?: string
  confidence: number
}> {
  const currentYear = new Date().getFullYear()
  const query = `"${programName}" Dartmouth application deadline ${currentYear} ${currentYear + 1}`

  return await searchDartmouthInfo(query, {
    max_results: 3,
    include_answer: true,
    search_depth: 'advanced'
  })
}

/**
 * Search for faculty or contact information
 */
export async function searchContactInfo(
  programOrDepartment: string
): Promise<{
  results: SearchResult[]
  answer?: string
  confidence: number
}> {
  const query = `${programOrDepartment} Dartmouth contact information email faculty staff coordinator`

  return await searchDartmouthInfo(query, {
    max_results: 3,
    include_answer: true
  })
}

/**
 * Check if Tavily is properly configured
 */
export function isTavilyConfigured(): boolean {
  return Boolean(process.env.TAVILY_API_KEY && process.env.TAVILY_API_KEY !== 'tvly-YOUR_TAVILY_API_KEY_HERE')
}