/**
 * Variety Injection System
 *
 * This module randomizes different aspects of post generation
 * so each output feels fresh and unique.
 */

// Different perspectives the post can take
const PERSPECTIVES = [
  'first-person singular (I observed, I think)',
  'first-person plural (we as an industry, we investors)',
  'analytical third-person (the data suggests, markets indicate)',
  'direct address (you might think, consider this)',
]

// Tone variations
const TONES = [
  'measured and analytical',
  'slightly provocative but backed by data',
  'cautiously optimistic with caveats',
  'warning but not alarmist',
  'curious and exploratory',
]

// How specific vs. thematic the post should be
const SPECIFICITY_LEVELS = [
  'high specificity - name specific assets, dates, numbers',
  'medium specificity - reference categories and ranges',
  'thematic - focus on broader patterns without specific figures',
]

// Different ways to open the post
const OPENING_STYLES = [
  'start with a surprising fact',
  'start with a contrarian take',
  'start with a recent observation',
  'start with a rhetorical question',
  'start with a pattern recognition',
]

// Post structure templates
const STRUCTURES = [
  {
    id: 'contrarian_insight',
    name: 'Contrarian Insight',
    format: 'Hook (bold claim) → Context (2 sentences) → Evidence (3 bullets) → Takeaway → Question',
  },
  {
    id: 'story_lesson',
    name: 'Story Lesson',
    format: 'Hook → Brief narrative (3 sentences) → Turning point → Lesson → Call to action',
  },
  {
    id: 'data_driven',
    name: 'Data Driven',
    format: 'Surprising statistic → Breakdown (3 numbered points) → Synthesis → Question',
  },
  {
    id: 'framework',
    name: 'Framework Share',
    format: 'Problem statement → Framework intro → Steps (3-5 numbered) → Example → Invitation',
  },
  {
    id: 'prediction',
    name: 'Prediction',
    format: 'Bold prediction → Current signals (3 bullets) → Historical parallel → What to watch',
  },
]

// Hook templates for opening lines
const HOOKS = [
  { id: 'contrarian', template: 'Most people think {X}. They\'re wrong.' },
  { id: 'statistic', template: '{X}% of {group} don\'t realize {insight}.' },
  { id: 'observation', template: 'I\'ve watched {X} for {timeframe}. Here\'s what nobody talks about:' },
  { id: 'prediction', template: 'In {timeframe}, we\'ll look back at {event} as the moment everything changed.' },
  { id: 'confession', template: 'I used to believe {X}. Then I saw {evidence}.' },
  { id: 'question', template: 'Why does everyone ignore {X} when analyzing {Y}?' },
  { id: 'pattern', template: 'Every time {trigger} happens, {outcome} follows.' },
  { id: 'warning', template: 'The {X} everyone is celebrating? It\'s hiding a bigger problem.' },
]

/**
 * Pick a random element from an array
 */
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * The variety configuration that gets injected into prompts
 */
export interface VarietyConfig {
  perspective: string
  tone: string
  specificity: string
  openingStyle: string
  structure: {
    id: string
    name: string
    format: string
  }
  hook: {
    id: string
    template: string
  }
}

/**
 * Generate a random variety configuration
 * Called fresh for each post generation
 */
export function generateVarietyConfig(): VarietyConfig {
  return {
    perspective: randomChoice(PERSPECTIVES),
    tone: randomChoice(TONES),
    specificity: randomChoice(SPECIFICITY_LEVELS),
    openingStyle: randomChoice(OPENING_STYLES),
    structure: randomChoice(STRUCTURES),
    hook: randomChoice(HOOKS),
  }
}
