/**
 * Prompt Assembly System
 *
 * Combines industry config + variety injection + trends
 * into the final prompt sent to Claude.
 */

import industryConfig from '@/data/industries/finance-geopolitics.json'
import { VarietyConfig, generateVarietyConfig } from './variety'

// Trend data structure (will come from HN/Reddit later)
export interface TrendData {
  title: string
  source: string
  score?: number
}

// Everything needed to build a prompt
export interface GenerationContext {
  trends: TrendData[]
  varietyConfig?: VarietyConfig
}

/**
 * Format trends for the prompt
 */
function formatTrends(trends: TrendData[]): string {
  if (!trends.length) {
    return 'No specific trends available - focus on evergreen geopolitical themes.'
  }

  return trends
    .slice(0, 5)
    .map((t, i) => `${i + 1}. "${t.title}" (${t.source})`)
    .join('\n')
}

/**
 * Format banned phrases as a list
 */
function formatBannedPhrases(): string {
  return industryConfig.banned_phrases.map(p => `- "${p}"`).join('\n')
}

/**
 * Format vocabulary examples
 */
function formatVocabulary(): string {
  const { technical, geopolitical, markets } = industryConfig.vocabulary
  return `
Technical: ${technical.slice(0, 8).join(', ')}
Geopolitical: ${geopolitical.slice(0, 8).join(', ')}
Markets: ${markets.slice(0, 8).join(', ')}
  `.trim()
}

/**
 * Build the system prompt (defines Claude's role)
 */
export function buildSystemPrompt(): string {
  return `You are an expert LinkedIn ghostwriter for senior financial services professionals. You write posts that sound like they come from experienced portfolio managers and analysts, not marketers or AI.

Your posts are:
- Analytical and substantive
- Grounded in real market dynamics
- Conversational but professional
- Free of corporate jargon and AI-typical phrases

Write like a portfolio manager sharing insights at a conference, not a content creator chasing engagement.`
}

/**
 * Build the main prompt (the actual instruction)
 */
export function buildPrompt(context: GenerationContext): string {
  // Use provided config or generate fresh one
  const config = context.varietyConfig || generateVarietyConfig()

  return `Write a LinkedIn post for a financial services professional about geopolitical market impacts.

---

CURRENT TRENDING TOPICS (anchor your post to one of these):
${formatTrends(context.trends)}

---

STRUCTURE TO USE: ${config.structure.name}
Description: ${config.structure.description}
Format: ${config.structure.format}

HOOK STYLE: ${config.hook.name}
Template: "${config.hook.template}"
Example: "${config.hook.example}"

---

VARIETY INSTRUCTIONS (follow these for this specific post):
- Perspective: ${config.perspective}
- Tone: ${config.tone}
- Specificity: ${config.specificity}
- Opening: ${config.openingStyle}

---

VOICE REQUIREMENTS:
- Tone: ${industryConfig.voice.tone.join(', ')}
- Avoid: ${industryConfig.voice.avoid.join(', ')}

VOCABULARY TO USE NATURALLY:
${formatVocabulary()}

---

BANNED PHRASES (never use these):
${formatBannedPhrases()}

---

FORMAT RULES:
- Length: ${industryConfig.preferred_length.min_chars}-${industryConfig.preferred_length.max_chars} characters
- Emojis: Maximum ${industryConfig.max_emojis}, only if it adds value
- Use line breaks liberally for LinkedIn readability
- End with a thought-provoking question
- No hashtags in the body

---

Write the post now. Output ONLY the post content, nothing else.`
}
