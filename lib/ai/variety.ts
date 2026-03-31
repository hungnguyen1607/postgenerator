/**
 * Variety System
 *
 * Rotates between 5 distinct angles AND 5 topic categories
 * to ensure each post feels completely different.
 */

// The 5 topic categories - each post focuses on one
const TOPICS = [
  {
    id: 'energy',
    name: 'OIL/ENERGY',
    description: 'Focus on oil prices, OPEC, natural gas, energy markets, or energy policy',
    keywords: ['oil', 'gas', 'opec', 'energy', 'crude', 'barrel', 'pipeline'],
  },
  {
    id: 'fed',
    name: 'INFLATION/FED',
    description: 'Focus on Federal Reserve, interest rates, inflation data, CPI, or monetary policy',
    keywords: ['fed', 'inflation', 'rate', 'cpi', 'powell', 'treasury', 'yield'],
  },
  {
    id: 'geopolitics',
    name: 'COUNTRY/CONFLICT',
    description: 'Focus on a specific country, trade war, sanctions, military conflict, or diplomatic tension',
    keywords: ['china', 'russia', 'ukraine', 'israel', 'iran', 'nato', 'sanctions', 'tariff', 'war'],
  },
  {
    id: 'markets',
    name: 'MARKET REACTION',
    description: 'Focus on stock market moves, gold, crypto, or specific asset price action',
    keywords: ['stock', 'nasdaq', 'dow', 's&p', 'bitcoin', 'gold', 'rally', 'crash', 'surge'],
  },
  {
    id: 'portfolio',
    name: 'PORTFOLIO DECISION',
    description: 'Focus on a personal investment decision, position change, or allocation shift you made',
    keywords: ['bought', 'sold', 'position', 'allocation', 'portfolio', 'hedge'],
  },
]

// The 5 angles - each post must use exactly one
const ANGLES = [
  {
    id: 'personal_failure',
    name: 'PERSONAL FAILURE',
    description: 'You were wrong about something, here\'s the specific moment you found out',
    example: 'I told everyone oil wouldn\'t break $80. Then I watched it hit $92 while pretending to take notes in a meeting.',
  },
  {
    id: 'client_moment',
    name: 'CLIENT MOMENT',
    description: 'A real conversation with a client that revealed something uncomfortable',
    example: 'My client asked why we didn\'t sell in March. I gave them three strategic reasons. The real reason: I didn\'t think it would drop that fast.',
  },
  {
    id: 'small_observation',
    name: 'SMALL OBSERVATION',
    description: 'One tiny specific thing you noticed that everyone else missed',
    example: 'Everyone\'s talking about the rate decision. Nobody noticed the bond auction went 3x oversubscribed yesterday.',
  },
  {
    id: 'contradiction',
    name: 'CONTRADICTION',
    description: 'Two things that are both true and shouldn\'t be',
    example: 'Unemployment is at historic lows. Half my clients are quietly cutting headcount. Both are true.',
  },
  {
    id: 'admission',
    name: 'ADMISSION',
    description: 'Something you said professionally that wasn\'t what you actually thought',
    example: 'I wrote "cautiously optimistic" in the quarterly report. I meant "I have no idea what happens next."',
  },
]

export interface VarietyConfig {
  angle: {
    id: string
    name: string
    description: string
    example: string
  }
  topic: {
    id: string
    name: string
    description: string
    keywords: string[]
  }
}

/**
 * Pick a random angle AND topic for this generation
 */
export function generateVarietyConfig(): VarietyConfig {
  const angle = ANGLES[Math.floor(Math.random() * ANGLES.length)]
  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)]
  return { angle, topic }
}

/**
 * Get all angles (for debugging)
 */
export function getAllAngles() {
  return ANGLES
}

/**
 * Get all topics (for debugging)
 */
export function getAllTopics() {
  return TOPICS
}
