/**
 * Google News RSS Fetcher
 *
 * Fetches finance and politics news from Google News RSS feeds.
 * No API key required.
 */

import { TrendData } from '@/lib/ai/prompts'

// Google News RSS URLs for different topics
const NEWS_FEEDS = [
  { url: 'https://news.google.com/rss/search?q=stock+market&hl=en-US&gl=US&ceid=US:en', topic: 'Markets' },
  { url: 'https://news.google.com/rss/search?q=federal+reserve&hl=en-US&gl=US&ceid=US:en', topic: 'Fed' },
  { url: 'https://news.google.com/rss/search?q=geopolitics&hl=en-US&gl=US&ceid=US:en', topic: 'Geopolitics' },
  { url: 'https://news.google.com/rss/search?q=economy+inflation&hl=en-US&gl=US&ceid=US:en', topic: 'Economy' },
  { url: 'https://news.google.com/rss/search?q=wall+street&hl=en-US&gl=US&ceid=US:en', topic: 'Wall Street' },
  { url: 'https://news.google.com/rss/search?q=oil+prices&hl=en-US&gl=US&ceid=US:en', topic: 'Commodities' },
  { url: 'https://news.google.com/rss/search?q=china+trade&hl=en-US&gl=US&ceid=US:en', topic: 'Trade' },
  { url: 'https://news.google.com/rss/search?q=treasury+bonds&hl=en-US&gl=US&ceid=US:en', topic: 'Bonds' },
]

interface RSSItem {
  title: string
  pubDate: string
  source: string
}

function parseRSSItems(xml: string): RSSItem[] {
  const items: RSSItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]

    const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)
    const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)
    const sourceMatch = itemXml.match(/<source[^>]*>(.*?)<\/source>/)

    if (titleMatch) {
      items.push({
        title: (titleMatch[1] || titleMatch[2] || '').trim(),
        pubDate: pubDateMatch ? pubDateMatch[1] : '',
        source: sourceMatch ? sourceMatch[1] : 'Google News',
      })
    }
  }

  return items
}

async function fetchFeed(feedUrl: string, topic: string): Promise<TrendData[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: { 'User-Agent': 'PostGenerator/1.0' },
      next: { revalidate: 900 }
    })

    if (!response.ok) {
      console.warn(`Google News fetch failed for ${topic}: ${response.status}`)
      return []
    }

    const xml = await response.text()
    const items = parseRSSItems(xml)

    return items.slice(0, 5).map((item, index) => ({
      title: item.title,
      source: `Google News (${topic})`,
      score: 100 - index * 10, // Higher score for earlier items
    }))
  } catch (error) {
    console.error(`Error fetching Google News for ${topic}:`, error)
    return []
  }
}

export async function fetchGoogleNewsTrends(limit: number = 15): Promise<TrendData[]> {
  try {
    // Randomly select 3 feeds to fetch (to get variety)
    const shuffledFeeds = [...NEWS_FEEDS].sort(() => Math.random() - 0.5).slice(0, 3)

    const results = await Promise.all(
      shuffledFeeds.map(feed => fetchFeed(feed.url, feed.topic))
    )

    const allItems = results.flat()

    // Dedupe by similar titles
    const seen = new Set<string>()
    const unique = allItems.filter(item => {
      const key = item.title.toLowerCase().slice(0, 40)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    return unique.slice(0, limit)
  } catch (error) {
    console.error('Error fetching Google News trends:', error)
    return []
  }
}
