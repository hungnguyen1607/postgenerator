/**
 * POST /api/generate
 *
 * Streaming endpoint that generates LinkedIn posts using Claude.
 */

import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { buildPrompt, buildSystemPrompt } from '@/lib/ai/prompts'
import { getAggregatedTrends } from '@/lib/trends/aggregator'

// Use edge runtime for streaming
export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    // Fetch real trends from HN + Reddit (with caching)
    const trends = await getAggregatedTrends()

    // Build prompts
    const systemPrompt = buildSystemPrompt()
    const prompt = buildPrompt({ trends })

    // Stream response from Claude
    const result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: systemPrompt,
      prompt: prompt,
      maxOutputTokens: 1024,
      temperature: 0.8,
    })

    // Return as streaming response
    return result.toTextStreamResponse()

  } catch (error) {
    console.error('Generation error:', error)

    return new Response(
      JSON.stringify({ error: 'Failed to generate post' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
