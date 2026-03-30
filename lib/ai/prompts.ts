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
    return 'No specific trends available - focus on evergreen geopolitical themes.'
  }

  return trends
    .slice(0, 5)
    .map((t, i) => `${i + 1}. "${t.title}" (${t.source})`)
    .join('\n')
}

export function buildSystemPrompt(): string {
  return `You write LinkedIn posts for finance professionals. You are not a content creator. You are not an expert sharing wisdom. You are one person who saw something and is still processing it.

Doubt is ok. Uncertainty is ok. Not having the answer is ok.`
}

export function buildPrompt(context: GenerationContext): string {
  const config = context.varietyConfig || generateVarietyConfig()

  return `Write a LinkedIn post about one of these current topics:
${formatTrends(context.trends)}

---

OPENING LINE RULES:
- Never start with a statistic you can't verify
- Never start with "X% of people..."
- Start with something that happened, a price, a date, a person, a decision
- The first line should make someone stop scrolling

STRUCTURE RULES:
- Maximum 2 sentences per paragraph
- Never use bullet points or dashes as list items
- Never use headers or bold text
- Never use "Firstly", "Secondly", "Finally"
- Never write more than 6 paragraphs

ENDING RULES:
- Never end with a question
- Never end with "What do you think?"
- Never end with a call to action
- End mid-thought, like something just occurred to you
- The last line should be slightly uncomfortable to sit with

TONE RULES:
- You are not teaching anyone
- You are not an expert sharing wisdom
- You are one person who saw something and is still processing it
- Doubt is ok. Uncertainty is ok. Not having the answer is ok.

BANNED WORDS (never use these):
thrilled, excited, journey, leverage, space, game-changer, pivotal, landscape, utilize, deep dive, unpack, caveat, "what's your read", "thoughts?", "key question", "downstream effects", "this reminds me of", "three signals"

---

VARIETY FOR THIS POST:
- Perspective: ${config.perspective}
- Tone: ${config.tone}
- Specificity: ${config.specificity}

---

Write the post now. Output ONLY the post content, nothing else.`
}
