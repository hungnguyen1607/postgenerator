/**
 * POST /api/meme
 *
 * Generates a meme based on the post content
 */

import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { generateMemeFromCaptions } from '@/lib/trends/memes'

export async function POST(req: Request) {
  try {
    const { post } = await req.json()

    if (!post) {
      return Response.json({ memeUrl: null })
    }

    // Have Claude generate meme captions based on the post
    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      maxOutputTokens: 200,
      temperature: 0.9,
      prompt: `Based on this LinkedIn post, generate captions for a meme.

POST:
${post}

Pick the best meme format for this content from: Drake, Distracted Boyfriend, Two Buttons, UNO Draw 25, Expanding Brain, Woman Yelling at Cat, Always Has Been, One Does Not Simply, Change My Mind, This Is Fine.

Output ONLY in this exact format (no other text):
TEMPLATE: [template name]
TOP: [top text, max 8 words]
BOTTOM: [bottom text, max 8 words]

The meme should capture the humor, irony, or main tension in the post. Be funny and relatable.`,
    })

    // Parse the response
    const templateMatch = text.match(/TEMPLATE:\s*(.+)/i)
    const topMatch = text.match(/TOP:\s*(.+)/i)
    const bottomMatch = text.match(/BOTTOM:\s*(.+)/i)

    if (!templateMatch || !topMatch || !bottomMatch) {
      console.error('Failed to parse meme captions:', text)
      return Response.json({ memeUrl: null })
    }

    const template = templateMatch[1].trim()
    const topText = topMatch[1].trim()
    const bottomText = bottomMatch[1].trim()

    // Generate the meme
    const memeUrl = await generateMemeFromCaptions(template, topText, bottomText)

    return Response.json({ memeUrl, template, topText, bottomText })
  } catch (error) {
    console.error('Meme generation error:', error)
    return Response.json({ memeUrl: null })
  }
}
