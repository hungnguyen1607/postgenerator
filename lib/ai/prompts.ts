/**
 * Prompt Assembly System
 */

import { VarietyConfig, generateVarietyConfig } from './variety'

export interface TrendData {
  title: string
  source: string
  score?: number
}

export interface GenerationContext {
  trends: TrendData[]
  varietyConfig?: VarietyConfig
}

function formatTrends(trends: TrendData[]): string {
  if (!trends.length) {
    return 'No specific trends available.'
  }

  return trends
    .slice(0, 5)
    .map((t, i) => `${i + 1}. "${t.title}" (${t.source})`)
    .join('\n')
}

export function buildSystemPrompt(): string {
  return `You write LinkedIn posts. You are a real person who just saw something and is still processing it. Not a content creator. Not an expert. Just someone who noticed something and can't stop thinking about it.`
}

export function buildPrompt(context: GenerationContext): string {
  return `Write a LinkedIn post using this formula:

THREE INGREDIENTS (all required):
1. A real current event — pick one from below
2. A human reaction — not analysis, not advice, just how you feel about it
3. Specific details — numbers, dates, names that make it feel lived-in

CURRENT EVENTS TO CHOOSE FROM:
${formatTrends(context.trends)}

THE GOAL:
Someone scrolling LinkedIn reads it and thinks "this person actually experienced this" — not "a bot summarized a news article."

RULES:
- Maximum 2 sentences per paragraph
- Maximum 6 paragraphs total
- No bullet points, no headers, no bold
- No questions at the end
- No call to action
- End mid-thought, like something just occurred to you
- The last line should sit uncomfortably

VOICE:
- You're not teaching anyone
- You're not giving advice
- You're one person who saw something and is still processing it
- Doubt is fine. Uncertainty is fine. Not having answers is fine.
- Say "I" not "we"

BANNED:
thrilled, excited, journey, leverage, game-changer, landscape, deep dive, unpack, "thoughts?", "what's your take", "here's the thing", "let that sink in"

Write the post now. Only output the post, nothing else.`
}
