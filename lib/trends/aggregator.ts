/**
 * Trend Aggregator
 *
 * Combines trends from multiple sources (HN, Reddit)
 * with caching to avoid excessive API calls.
 *
 * Uses Vercel KV when available, falls back to in-memory cache.
 */

import { TrendData } from '@/lib/ai/prompts'
import { fetchHackerNewsTrends } from './hackernews'
import { fetchRedditTrends } from './reddit'

// Cache configuration
const CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutes
const CACHE_KEY = 'aggregated_trends'

// In-memory cache fallback (for local dev or when KV unavailable)
interface CacheEntry {
  data: TrendData[]
  timestamp: number
}

let memoryCache: CacheEntry | null = null

/**
 * Check if we have Vercel KV configured
 */
function hasVercelKV(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

/**
 * Get cached trends from Vercel KV
 */
async function getFromKV(): Promise<TrendData[] | null> {
  if (!hasVercelKV()) return null

  try {
    // Dynamic import to avoid errors when KV isn't configured
    const { kv } = await import('@vercel/kv')
    const cached = await kv.get<CacheEntry>(CACHE_KEY)

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data
    }
    return null
  } catch (error) {
    console.warn('KV cache read failed:', error)
    return null
  }
}

/**
 * Save trends to Vercel KV
 */
async function saveToKV(trends: TrendData[]): Promise<void> {
  if (!hasVercelKV()) return

  try {
    const { kv } = await import('@vercel/kv')
    await kv.set(CACHE_KEY, {
      data: trends,
      timestamp: Date.now(),
    }, { ex: Math.ceil(CACHE_TTL_MS / 1000) })
  } catch (error) {
    console.warn('KV cache write failed:', error)
  }
}

/**
 * Get cached trends from memory
 */
function getFromMemory(): TrendData[] | null {
  if (memoryCache && Date.now() - memoryCache.timestamp < CACHE_TTL_MS) {
    return memoryCache.data
  }
  return null
}

/**
 * Save trends to memory cache
 */
function saveToMemory(trends: TrendData[]): void {
  memoryCache = {
    data: trends,
    timestamp: Date.now(),
  }
}

/**
 * Normalize scores across different sources for fair comparison
 */
function normalizeScores(trends: TrendData[]): TrendData[] {
  if (trends.length === 0) return trends

  const maxScore = Math.max(...trends.map(t => t.score || 1))

  return trends.map(t => ({
    ...t,
    score: ((t.score || 1) / maxScore) * 100, // Normalize to 0-100
  }))
}

/**
 * Fetch fresh trends from all sources
 */
async function fetchFreshTrends(): Promise<TrendData[]> {
  // Fetch from all sources in parallel
  const [hnTrends, redditTrends] = await Promise.all([
    fetchHackerNewsTrends(10),
    fetchRedditTrends(10),
  ])

  // Combine and normalize
  const allTrends = [...hnTrends, ...redditTrends]
  const normalized = normalizeScores(allTrends)

  // Sort by normalized score and take top results
  return normalized
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 15)
}

/**
 * Get aggregated trends with caching
 *
 * Tries caches first, fetches fresh data if needed.
 * Returns fallback evergreen topics if all sources fail.
 */
export async function getAggregatedTrends(): Promise<TrendData[]> {
  // Try KV cache first
  const kvCached = await getFromKV()
  if (kvCached && kvCached.length > 0) {
    return kvCached
  }

  // Try memory cache
  const memoryCached = getFromMemory()
  if (memoryCached && memoryCached.length > 0) {
    return memoryCached
  }

  // Fetch fresh trends
  try {
    const freshTrends = await fetchFreshTrends()

    if (freshTrends.length > 0) {
      // Cache the results
      saveToMemory(freshTrends)
      await saveToKV(freshTrends)
      return freshTrends
    }
  } catch (error) {
    console.error('Error fetching fresh trends:', error)
  }

  // Fallback to evergreen topics if all sources fail
  return getEvergreenTrends()
}

/**
 * Evergreen fallback topics when APIs are unavailable
 */
function getEvergreenTrends(): TrendData[] {
  return [
    { title: 'Federal Reserve interest rate decision impacts on markets', source: 'Evergreen', score: 100 },
    { title: 'China-US trade relations and tariff implications', source: 'Evergreen', score: 95 },
    { title: 'Oil price volatility amid geopolitical tensions', source: 'Evergreen', score: 90 },
    { title: 'Central bank policy divergence and currency movements', source: 'Evergreen', score: 85 },
    { title: 'Emerging market risks and capital flows', source: 'Evergreen', score: 80 },
  ]
}

/**
 * Force refresh trends (bypasses cache)
 * Useful for debugging or manual refresh
 */
export async function refreshTrends(): Promise<TrendData[]> {
  const freshTrends = await fetchFreshTrends()

  if (freshTrends.length > 0) {
    saveToMemory(freshTrends)
    await saveToKV(freshTrends)
    return freshTrends
  }

  return getEvergreenTrends()
}
