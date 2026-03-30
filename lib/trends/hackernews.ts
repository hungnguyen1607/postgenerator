/**
 * HackerNews Trend Fetcher
 *
 * Uses the free Firebase HN API to fetch top stories
 * and filter for relevant topics.
 */

import { TrendData } from '@/lib/ai/prompts'

const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0'

// Broader keywords for politics, finance, tech, geopolitics
const RELEVANCE_KEYWORDS = [
  // Politics & Government
  'trump', 'biden', 'election', 'congress', 'senate', 'supreme court',
  'legislation', 'policy', 'vote', 'democrat', 'republican', 'governor',
  'president', 'administration', 'executive order', 'regulation',

  // Geopolitics & International
  'china', 'russia', 'ukraine', 'israel', 'iran', 'nato', 'eu', 'brexit',
  'sanctions', 'tariff', 'trade war', 'diplomacy', 'treaty', 'military',
  'war', 'invasion', 'conflict', 'nuclear', 'missile', 'border',
  'immigration', 'refugee', 'embassy', 'un', 'g7', 'g20', 'brics',

  // Economy & Finance
  'fed', 'federal reserve', 'interest rate', 'inflation', 'recession',
  'gdp', 'unemployment', 'jobs report', 'cpi', 'economic', 'economy',
  'bank', 'banking', 'credit', 'debt', 'deficit', 'treasury',
  'stock', 'market', 'nasdaq', 'dow', 's&p', 'nyse', 'ipo', 'earnings',
  'hedge fund', 'private equity', 'venture capital', 'investment',

  // Crypto & Digital Assets
  'bitcoin', 'crypto', 'ethereum', 'blockchain', 'defi', 'nft',
  'stablecoin', 'binance', 'coinbase', 'sec crypto',

  // Commodities & Energy
  'oil', 'opec', 'gas', 'energy', 'commodity', 'gold', 'silver',
  'copper', 'lithium', 'uranium', 'solar', 'ev', 'tesla',

  // Tech & Regulation
  'antitrust', 'monopoly', 'big tech', 'apple', 'google', 'meta',
  'amazon', 'microsoft', 'ai regulation', 'data privacy', 'tiktok ban',
  'section 230', 'ftc', 'doj',

  // Major Events
  'layoff', 'bankrupt', 'merger', 'acquisition', 'scandal', 'fraud',
  'collapse', 'crisis', 'crash', 'rally', 'surge', 'plunge',
]

interface HNItem {
  id: number
  title: string
  score: number
  url?: string
  type: string
}

function isRelevant(title: string): boolean {
  const lowerTitle = title.toLowerCase()
  return RELEVANCE_KEYWORDS.some(keyword => lowerTitle.includes(keyword))
}

async function fetchItem(id: number): Promise<HNItem | null> {
  try {
    const response = await fetch(`${HN_API_BASE}/item/${id}.json`, {
      next: { revalidate: 900 }
    })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

async function fetchTopStoryIds(): Promise<number[]> {
  try {
    const response = await fetch(`${HN_API_BASE}/topstories.json`, {
      next: { revalidate: 900 }
    })
    if (!response.ok) return []
    return await response.json()
  } catch {
    return []
  }
}

export async function fetchHackerNewsTrends(limit: number = 15): Promise<TrendData[]> {
  try {
    const storyIds = await fetchTopStoryIds()
    const topIds = storyIds.slice(0, 150) // Check more stories

    const stories = await Promise.all(
      topIds.map(id => fetchItem(id))
    )

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
