/**
 * Reddit Trend Fetcher
 *
 * Uses Reddit's public JSON API (no auth required)
 * to fetch hot posts from finance/geopolitics subreddits.
 */

import { TrendData } from '@/lib/ai/prompts'

// Subreddits relevant to finance and geopolitics
const SUBREDDITS = [
  'wallstreetbets',
  'investing',
  'stocks',
  'geopolitics',
  'economics',
  'finance',
]

// Keywords that boost relevance scoring
const BOOST_KEYWORDS = [
  'war', 'sanctions', 'tariff', 'election', 'fed', 'rate',
  'inflation', 'recession', 'china', 'russia', 'oil', 'gold',
  'dollar', 'market', 'crash', 'rally', 'volatility',
]

interface RedditPost {
  data: {
    title: string
    score: number
    subreddit: string
    num_comments: number
    created_utc: number
  }
}

interface RedditResponse {
  data: {
    children: RedditPost[]
  }
}

/**
 * Calculate relevance score based on keywords
 */
function calculateRelevance(title: string, baseScore: number): number {
  const lowerTitle = title.toLowerCase()
  const keywordMatches = BOOST_KEYWORDS.filter(kw => lowerTitle.includes(kw)).length
  // Boost score by 20% per keyword match
  return baseScore * (1 + keywordMatches * 0.2)
}

/**
 * Fetch hot posts from a single subreddit
 */
async function fetchSubreddit(subreddit: string): Promise<TrendData[]> {
  try {
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=25`,
      {
        headers: {
          // Reddit requires a user agent
          'User-Agent': 'PostGenerator/1.0',
        },
        next: { revalidate: 900 } // Cache for 15 minutes
      }
    )

    if (!response.ok) {
      console.warn(`Reddit fetch failed for r/${subreddit}: ${response.status}`)
      return []
    }

    const data: RedditResponse = await response.json()

    return data.data.children
      .filter(post => {
        // Filter out stickied/meta posts
        const title = post.data.title.toLowerCase()
        return !title.includes('daily discussion') &&
               !title.includes('weekend discussion') &&
               !title.includes('megathread') &&
               post.data.score > 50 // Minimum engagement threshold
      })
      .map(post => ({
        title: post.data.title,
        source: `r/${post.data.subreddit}`,
        score: calculateRelevance(post.data.title, post.data.score),
      }))
  } catch (error) {
    console.error(`Error fetching r/${subreddit}:`, error)
    return []
  }
}

/**
 * Fetch trends from all configured subreddits
 * Returns combined and sorted results
 */
export async function fetchRedditTrends(limit: number = 10): Promise<TrendData[]> {
  try {
    // Fetch all subreddits in parallel
    const results = await Promise.all(
      SUBREDDITS.map(sub => fetchSubreddit(sub))
    )

    // Flatten, sort by relevance-adjusted score, and dedupe
    const allPosts = results.flat()
    const seen = new Set<string>()

    const uniquePosts = allPosts
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .filter(post => {
        // Simple deduplication by title similarity
        const normalizedTitle = post.title.toLowerCase().slice(0, 50)
        if (seen.has(normalizedTitle)) return false
        seen.add(normalizedTitle)
        return true
      })
      .slice(0, limit)

    return uniquePosts
  } catch (error) {
    console.error('Error fetching Reddit trends:', error)
    return []
  }
}
