/**
 * Prompt Assembly System
 */

import { VarietyConfig } from './variety'

export interface TrendData {
  title: string
  source: string
  score?: number
}

export interface GenerationContext {
  trends: TrendData[]
  varietyConfig: VarietyConfig
}

function formatTrends(trends: TrendData[]): string {
  if (!trends.length) {
    return 'No specific trends available.'
  }

  return trends
    .slice(0, 8)
    .map((t, i) => `${i + 1}. "${t.title}" (${t.source})`)
    .join('\n')
}

export function buildSystemPrompt(): string {
  return `You are a finance professional writing LinkedIn posts about geopolitics and markets.`
}

export function buildPrompt(context: GenerationContext): string {
  const { angle, topic } = context.varietyConfig

  return `YOUR ANGLE FOR THIS POST: ${angle.name}
${angle.description}

Example of this angle:
"${angle.example}"

---

YOUR TOPIC FOR THIS POST: ${topic.name}
${topic.description}

You MUST write about something related to: ${topic.keywords.join(', ')}

---

CURRENT EVENTS (pick one that fits your topic above):
${formatTrends(context.trends)}

---

OPENING LINE RULES:
- Lead with the most interesting thing immediately
- Never open with "I told my team", "I want to talk about", "In 2026"
- Best hooks are: a shocking number, a contradiction, a specific action, a brutal admission, or an uncomfortable fact
- The first line must make someone stop scrolling

VOICE:
- Write like you're texting a smart friend, not presenting to a boardroom
- You are not teaching anyone
- You are one person who saw something and is still processing it
- Brutal honesty over professional polish
- The gap between what you say publicly and what you actually think is where every good post lives
- Dry humor and self-deprecating wit when it fits naturally
- Informal, conversational - contractions, short sentences, the way people actually talk
- A little sarcasm goes a long way - deadpan delivery of absurd realities

STRUCTURE:
- One sentence per paragraph
- Maximum 6 paragraphs
- No bullet points ever
- No numbered lists ever
- No bold text or headers
- 80-150 words total

ENDING RULES:
- Never end with a question
- Never end with a CTA
- Never wrap up with a lesson or moral
- End on the raw uncomfortable thought
- Leave the reader sitting with something unresolved

CREDIBILITY:
- Always include at least one specific number
- Specific dates, prices, percentages, names of institutions
- If you fabricate a detail make it plausible and realistic

BANNED WORDS AND PHRASES:
thrilled, excited, journey, leverage, game-changer, pivotal, landscape, utilize, deep dive, unpack, caveat, downstream, "what's your read", "thoughts?", "key question", "here's what I learned", "that's on me", "this reminded me of", "the truth is", "at the end of the day", "it's worth noting", "three signals", "strategic restructuring", "right-sizing"

---

Write a LinkedIn post now using the ${angle.name} angle about ${topic.name}. Only output the post, nothing else.`
}
