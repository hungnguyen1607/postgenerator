/**
 * HackerNews Trend Fetcher
 *
 * Uses the free Firebase HN API to fetch top stories
 * and filter for geopolitics/finance relevant topics.
 */

import { TrendData } from '@/lib/ai/prompts'

const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0'

// Keywords that indicate geopolitics/finance relevance
const RELEVANCE_KEYWORDS = [
  // Geopolitical
  'war', 'sanctions', 'tariff', 'election', 'trump', 'biden', 'china', 'russia',
  'ukraine', 'israel', 'iran', 'nato', 'military', 'nuclear', 'treaty',
  'diplomacy', 'embargo', 'conflict', 'invasion', 'coup',
  // Finance/Markets
  'fed', 'federal reserve', 'interest rate', 'inflation', 'recession',
  'bank', 'market', 'stock', 'bond', 'treasury', 'dollar', 'currency',
  'oil', 'commodity', 'gold', 'crypto', 'bitcoin', 'volatility', 'vix',
  'hedge fund', 'wall street', 'nasdaq', 's&p', 'dow', 'trade',
  // Central banks
  'ecb', 'boj', 'pboc', 'central bank', 'monetary', 'fiscal',
]

interface HNItem {
  id: number
  title: string
  score: number
  url?: string
  type: string
}

/**
 * Check if a title is relevant to our focus areas
 */
function isRelevant(title: string): boolean {
  const lowerTitle = title.toLowerCase()
  return RELEVANCE_KEYWORDS.some(keyword => lowerTitle.includes(keyword))
}

/**
 * Fetch a single HN item by ID
 */
async function fetchItem(id: number): Promise<HNItem | null> {
  try {
    const response = await fetch(`${HN_API_BASE}/item/${id}.json`, {
      next: { revalidate: 900 } // Cache for 15 minutes
    })
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

/**
 * Fetch top story IDs from HN
 */
async function fetchTopStoryIds(): Promise<number[]> {
  try {
    const response = await fetch(`${HN_API_BASE}/topstories.json`, {
      next: { revalidate: 900 } // Cache for 15 minutes
    })
    if (!response.ok) return []
    return response.json()
  } catch {
    return []
  }
}

/**
 * Fetch and filter HN trends for geopolitics/finance
 * Returns top relevant stories sorted by score
 */
export async function fetchHackerNewsTrends(limit: number = 10): Promise<TrendData[]> {
  try {
    // Get top 100 story IDs (we'll filter down)
    const storyIds = await fetchTopStoryIds()
    const topIds = storyIds.slice(0, 100)

    // Fetch stories in parallel (batched)
    const stories = await Promise.all(
      topIds.map(id => fetchItem(id))
    )

    // Filter for relevant stories and format
    const relevantStories = stories
      .filter((story): story is HNItem =>
        story !== null &&
        story.type === 'story' &&
        isRelevant(story.title)
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(story => ({
        title: story.title,
        source: 'HackerNews',
        score: story.score,
      }))

    return relevantStories
  } catch (error) {
    console.error('Error fetching HN trends:', error)
    return []
  }
}
