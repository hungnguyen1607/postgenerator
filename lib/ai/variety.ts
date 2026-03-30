/**
 * Variety Injection System
 *
 * This module randomizes different aspects of post generation
 * so each output feels fresh and unique.
 *
 * Loads patterns from JSON files in data/patterns/
 */

import hooksData from '@/data/patterns/hooks.json'
import structuresData from '@/data/patterns/structures.json'

// Types for pattern data
export interface HookPattern {
  id: string
  name: string
  template: string
  example: string
}

export interface StructurePattern {
  id: string
  name: string
  description: string
  format: string
  example_outline: string[]
}

// Load patterns from JSON
const HOOKS: HookPattern[] = hooksData.hooks
const STRUCTURES: StructurePattern[] = structuresData.structures

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
  'confident but humble',
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
  'start with a personal anecdote',
]

/**
 * Pick a random element from an array
 */
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Pick N random elements from an array (no duplicates)
 */
function randomSample<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
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
    description: string
  }
  hook: {
    id: string
    name: string
    template: string
    example: string
  }
}

/**
 * Generate a random variety configuration
 * Called fresh for each post generation
 */
export function generateVarietyConfig(): VarietyConfig {
  const structure = randomChoice(STRUCTURES)
  const hook = randomChoice(HOOKS)

  return {
    perspective: randomChoice(PERSPECTIVES),
    tone: randomChoice(TONES),
    specificity: randomChoice(SPECIFICITY_LEVELS),
    openingStyle: randomChoice(OPENING_STYLES),
    structure: {
      id: structure.id,
      name: structure.name,
      format: structure.format,
      description: structure.description,
    },
    hook: {
      id: hook.id,
      name: hook.name,
      template: hook.template,
      example: hook.example,
    },
  }
}

/**
 * Get all available hooks (for UI display or debugging)
 */
export function getAllHooks(): HookPattern[] {
  return HOOKS
}

/**
 * Get all available structures (for UI display or debugging)
 */
export function getAllStructures(): StructurePattern[] {
  return STRUCTURES
}

/**
 * Get a specific hook by ID
 */
export function getHookById(id: string): HookPattern | undefined {
  return HOOKS.find(h => h.id === id)
}

/**
 * Get a specific structure by ID
 */
export function getStructureById(id: string): StructurePattern | undefined {
  return STRUCTURES.find(s => s.id === id)
}

/**
 * Generate a variety config with specific hook and structure
 * Useful when user wants to control the format
 */
export function generateVarietyConfigWithPatterns(
  hookId?: string,
  structureId?: string
): VarietyConfig {
  const structure = structureId
    ? getStructureById(structureId) || randomChoice(STRUCTURES)
    : randomChoice(STRUCTURES)

  const hook = hookId
    ? getHookById(hookId) || randomChoice(HOOKS)
    : randomChoice(HOOKS)

  return {
    perspective: randomChoice(PERSPECTIVES),
    tone: randomChoice(TONES),
    specificity: randomChoice(SPECIFICITY_LEVELS),
    openingStyle: randomChoice(OPENING_STYLES),
    structure: {
      id: structure.id,
      name: structure.name,
      format: structure.format,
      description: structure.description,
    },
    hook: {
      id: hook.id,
      name: hook.name,
      template: hook.template,
      example: hook.example,
    },
  }
}
