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
  return `You write LinkedIn posts. You sound like a real person, not a content creator.`
}

export function buildPrompt(context: GenerationContext): string {
  return `Write a LinkedIn post. Pick ONE of these styles:

---

STYLE 1 — Current event + human reaction
- Take a real event from the list below
- React to it like a human, not an analyst
- Include specific details (numbers, dates, names)
- Goal: reader thinks "this person actually experienced this"

Current events:
${formatTrends(context.trends)}

---

STYLE 2 — Dry honesty
- Admit you don't know what you're doing
- Show the gap between what you said and what you think
- Example: "My client asked if we're good. I said yes. I have no idea if we're good."

---

STYLE 3 — Misdirection
- Set up like a typical LinkedIn lesson post
- Pull the rug out
- Example: "Here's what meeting X taught me about sales: absolutely nothing. I just wanted to brag."

---

STYLE 4 — Punchy story
- Open with the outcome as a hook
- Backtrack to explain how it happened
- Specific details: names, ages, amounts, dates
- End on the emotional beat, not a lesson

---

RULES FOR ALL STYLES:
- Maximum 2 sentences per paragraph
- Maximum 6 paragraphs
- No bullet points, no headers, no bold
- No questions at the end
- No call to action
- Say "I" not "we"

BANNED WORDS:
thrilled, excited, journey, leverage, game-changer, landscape, deep dive, unpack, "thoughts?", "what's your take", "here's the thing", "let that sink in"

Write the post now. Only output the post.`
}
