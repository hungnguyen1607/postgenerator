/**
 * GET /api/meme
 *
 * Fetches a meme related to a topic from Reddit
 */

import { fetchMeme } from '@/lib/trends/memes'
import { getAggregatedTrends } from '@/lib/trends/aggregator'

export async function GET() {
  try {
    // Get current trends to pick a topic
    const trends = await getAggregatedTrends()

    if (trends.length === 0) {
      return Response.json({ memeUrl: null })
    }

    // Pick a random trend as the topic
    const randomTrend = trends[Math.floor(Math.random() * trends.length)]
    const memeUrl = await fetchMeme(randomTrend.title)

    return Response.json({ memeUrl, topic: randomTrend.title })
  } catch (error) {
    console.error('Meme fetch error:', error)
    return Response.json({ memeUrl: null })
  }
}
