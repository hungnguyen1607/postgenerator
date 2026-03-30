/**
 * Reddit Trend Fetcher
 *
 * Uses Reddit's public JSON API (no auth required)
 * to fetch hot posts from various subreddits.
 */

import { TrendData } from '@/lib/ai/prompts'

// Finance & Politics only
const SUBREDDITS = [
  // Finance & Markets
  'wallstreetbets',
  'investing',
  'stocks',
  'economics',
  'cryptocurrency',

  // Politics & Geopolitics
  'politics',
  'worldnews',
  'geopolitics',

  // Macro
  'energy',
]

// Keywords that boost relevance - finance & politics only
const BOOST_KEYWORDS = [
  // Politics
  'trump', 'biden', 'election', 'congress', 'senate', 'vote',
  'democrat', 'republican', 'president', 'governor', 'supreme court',

  // Geopolitics
  'war', 'sanctions', 'tariff', 'china', 'russia', 'ukraine',
  'israel', 'iran', 'nato', 'eu', 'border', 'military', 'missile',

  // Economy & Fed
  'fed', 'inflation', 'recession', 'rate', 'gdp', 'jobs',
  'unemployment', 'cpi', 'economy', 'treasury', 'deficit', 'debt',

  // Markets
  'stock', 'market', 'crash', 'rally', 'surge', 'plunge',
  'dow', 'nasdaq', 's&p', 'bond', 'yield',

  // Crypto
  'bitcoin', 'crypto', 'ethereum', 'btc',

  // Commodities
  'oil', 'gas', 'opec', 'gold', 'commodity',

  // Crisis
  'bankrupt', 'collapse', 'crisis', 'default',
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

function calculateRelevance(title: string, baseScore: number): number {
  const lowerTitle = title.toLowerCase()
  const keywordMatches = BOOST_KEYWORDS.filter(kw => lowerTitle.includes(kw)).length
  return baseScore * (1 + keywordMatches * 0.25)
}

async function fetchSubreddit(subreddit: string): Promise<TrendData[]> {
  try {
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=20`,
      {
        headers: { 'User-Agent': 'PostGenerator/1.0' },
        next: { revalidate: 900 }
      }
    )

    if (!response.ok) {
      console.warn(`Reddit fetch failed for r/${subreddit}: ${response.status}`)
      return []
    }

    const data: RedditResponse = await response.json()

    return data.data.children
      .filter(post => {
        const title = post.data.title.toLowerCase()
        return !title.includes('daily discussion') &&
               !title.includes('weekend discussion') &&
               !title.includes('megathread') &&
               !title.includes('weekly') &&
               post.data.score > 100
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

export async function fetchRedditTrends(limit: number = 15): Promise<TrendData[]> {
  try {
    const results = await Promise.all(
      SUBREDDITS.map(sub => fetchSubreddit(sub))
    )

    const allPosts = results.flat()
    const seen = new Set<string>()

    const uniquePosts = allPosts
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .filter(post => {
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
