/**
 * Meme Fetcher
 *
 * Searches Reddit for memes related to a topic
 */

const MEME_SUBREDDITS = [
  'memes',
  'dankmemes',
  'wallstreetbets',
  'ProgrammerHumor',
  'financememes',
  'economicmemes',
]

interface RedditPost {
  data: {
    title: string
    url: string
    post_hint?: string
    is_video: boolean
    over_18: boolean
    score: number
  }
}

interface RedditResponse {
  data: {
    children: RedditPost[]
  }
}

/**
 * Check if URL is a direct image link
 */
function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url) ||
    url.includes('i.redd.it') ||
    url.includes('i.imgur.com')
}

/**
 * Search a subreddit for memes matching keywords
 */
async function searchSubreddit(subreddit: string, query: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=top&t=month&limit=10`,
      {
        headers: { 'User-Agent': 'PostGenerator/1.0' },
      }
    )

    if (!response.ok) return null

    const data: RedditResponse = await response.json()

    // Find first valid image post
    for (const post of data.data.children) {
      const { url, is_video, over_18, post_hint } = post.data

      if (over_18 || is_video) continue
      if (post_hint === 'image' || isImageUrl(url)) {
        return url
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Get hot memes from a subreddit (fallback when search fails)
 */
async function getHotMemes(subreddit: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=25`,
      {
        headers: { 'User-Agent': 'PostGenerator/1.0' },
      }
    )

    if (!response.ok) return null

    const data: RedditResponse = await response.json()

    // Get random image from hot posts
    const imagePosts = data.data.children.filter(post => {
      const { url, is_video, over_18, post_hint } = post.data
      return !over_18 && !is_video && (post_hint === 'image' || isImageUrl(url))
    })

    if (imagePosts.length === 0) return null

    const randomPost = imagePosts[Math.floor(Math.random() * imagePosts.length)]
    return randomPost.data.url
  } catch {
    return null
  }
}

/**
 * Extract keywords from a topic string
 */
function extractKeywords(topic: string): string[] {
  const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'in', 'on', 'at', 'to', 'of', 'with', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same', 'than', 'too', 'very', 'just', 'also']

  return topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 3)
}

/**
 * Fetch a meme related to the given topic
 */
export async function fetchMeme(topic: string): Promise<string | null> {
  const keywords = extractKeywords(topic)
  const query = keywords.join(' ')

  // Try searching each meme subreddit
  for (const subreddit of MEME_SUBREDDITS) {
    const memeUrl = await searchSubreddit(subreddit, query)
    if (memeUrl) return memeUrl
  }

  // Fallback: get a random hot meme from wallstreetbets or memes
  const fallbackSubs = ['wallstreetbets', 'memes']
  for (const sub of fallbackSubs) {
    const memeUrl = await getHotMemes(sub)
    if (memeUrl) return memeUrl
  }

  return null
}
