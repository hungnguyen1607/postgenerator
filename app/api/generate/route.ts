/**
 * POST /api/generate
 *
 * Streaming endpoint that generates LinkedIn posts using Claude.
 * Uses Vercel AI SDK for streaming responses.
 */

import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { buildPrompt, buildSystemPrompt, TrendData } from '@/lib/ai/prompts'
import { generateVarietyConfig } from '@/lib/ai/variety'

// Use edge runtime for streaming
export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    // Generate fresh variety config for this request
    const varietyConfig = generateVarietyConfig()

    // Placeholder trends (Phase 3 will add real trend fetching)
    const trends: TrendData[] = [
      { title: 'Federal Reserve signals rate decision ahead of election', source: 'Evergreen' },
      { title: 'Oil prices volatile amid Middle East tensions', source: 'Evergreen' },
      { title: 'Dollar strength impacting emerging market flows', source: 'Evergreen' },
    ]

    // Build prompts
    const systemPrompt = buildSystemPrompt()
    const prompt = buildPrompt({ trends, varietyConfig })

    // Stream response from Claude
    const result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: systemPrompt,
      prompt: prompt,
      maxTokens: 1024,
      temperature: 0.8, // Higher = more creative
    })

    // Return as streaming response
    return result.toDataStreamResponse()

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
