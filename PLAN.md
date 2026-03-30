❯ Implement the following plan:

  # LinkedIn Post Generator - Implementation Plan

  ## Overview
  Build a deployed web app that generates high-quality B2B LinkedIn posts by learning from top performers
  and tracking real-time trends.

  **Industry Focus:** Financial Services (portfolio managers, analysts, traders, wealth advisors)
  **Topic Focus:** Geopolitical impacts on markets - wars, elections, trade policies, sanctions, central
  bank decisions

  ---

  ## Tech Stack
  | Layer | Technology | Rationale |
  |-------|------------|-----------|
  | Framework | Next.js 14 (App Router) | Serverless, streaming, easy Vercel deploy |
  | Styling | Tailwind CSS + shadcn/ui | Fast prototyping |
  | AI | Claude 3.5 Sonnet via Vercel AI SDK | High-quality writing, streaming support |
  | Caching | Vercel KV (Redis) | Fast trend data caching |
  | Deployment | Vercel | Free tier, zero-config |

  ---

  ## Architecture

  ```
  ┌─────────────────────────────────────────────────────────────┐
  │  UI: Industry Selector → [Generate] Button → Post Preview   │
  └─────────────────────────────────────────────────────────────┘
  │
  ▼
  ┌─────────────────────────────────────────────────────────────┐
  │  /api/generate (POST)                                        │
  │  1. Fetch cached trends                                      │
  │  2. Select random structure + hook pattern                   │
  │  3. Assemble prompt with variety injection                   │
  │  4. Stream response via Vercel AI SDK                        │
  └─────────────────────────────────────────────────────────────┘
  │
  ┌───────────────────┼───────────────────┐
  ▼                   ▼                   ▼
  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
  │ Trend Engine│    │Pattern Store│    │ AI Generator│
  │ HN + Reddit │    │Hooks/Structs│    │Claude Sonnet│
  └─────────────┘    └─────────────┘    └─────────────┘
  ```

  ---

  ## File Structure

  ```
  postgenerator/
  ├── app/
  │   ├── layout.tsx
  │   ├── page.tsx                    # Main UI
  │   ├── globals.css
  │   └── api/
  │       └── generate/route.ts       # Core generation endpoint
  ├── lib/
  │   ├── ai/
  │   │   ├── prompts.ts              # Prompt assembly
  │   │   └── variety.ts              # Randomization logic
  │   └── trends/
  │       ├── hackernews.ts           # HN API fetcher
  │       ├── reddit.ts               # Reddit fetcher
  │       └── aggregator.ts           # Caching + scoring
  ├── data/
  │   ├── patterns/
  │   │   ├── hooks.json              # Hook templates
  │   │   └── structures.json         # Post structures
  │   └── industries/
  │       └── finance-geopolitics.json  # Industry config
  ├── .env.local
  ├── package.json
  └── vercel.json
  ```

  ---

  ## Prompt Engineering Strategy

  ### Anti-Slop Framework

  1. **Banned Phrase Filter** - Reject: "in today's fast-paced", "game-changer", "synergy", excessive
  emojis
  2. **Structure Randomization** - Rotate between 5+ templates per generation
  3. **Variety Injection** - Randomize: hook style, perspective, tone, specificity level
  4. **Trend Anchoring** - Every post tied to real current topic

  ### Post Structure Templates

  | Template | Format |
  |----------|--------|
  | Contrarian Insight | Hook (bold claim) → Context → Evidence (bullets) → Takeaway → Question |
  | Story Lesson | Hook → Brief narrative → Turning point → Lesson → CTA |
  | Data Driven | Surprising stat → Breakdown (numbered) → Synthesis → Question |

  ### Industry Voice (Finance + Geopolitics)
  - **Tone:** Analytical, risk-aware, macro-focused, informed
  - **Vocabulary:** alpha, downside protection, risk-off, safe haven, volatility, sanctions, tariffs,
  central bank policy
  - **Topics:** War impacts on commodities, election cycles and markets, trade policy shifts, currency
  movements, sector rotation during geopolitical stress

  ---

  ## Data Sources for Trends

  | Source | Method | Refresh |
  |--------|--------|---------|
  | HackerNews | Firebase API (free, no auth) | 15 min |
  | Reddit | Public JSON (/r/wallstreetbets, /r/investing, /r/geopolitics) | 15 min |
  | Financial RSS | Reuters, Bloomberg feeds (public summaries) | 15 min |

  **Geopolitics Keywords to Track:** war, sanctions, tariffs, election, Fed, central bank, oil,
  commodities, volatility, VIX, risk-off

  ---

  ## Implementation Steps

  ### Phase 1: Project Setup
  - [ ] Initialize Next.js 14 with TypeScript
  - [ ] Install dependencies: `@ai-sdk/anthropic`, `ai`, `tailwindcss`, `@vercel/kv`
  - [ ] Configure Tailwind + shadcn/ui
  - [ ] Set up environment variables (ANTHROPIC_API_KEY)

  ### Phase 2: Core Generation
  - [ ] Create `/api/generate/route.ts` with streaming
  - [ ] Build `lib/ai/prompts.ts` with template system
  - [ ] Implement variety injection in `lib/ai/variety.ts`
  - [ ] Add industry config in `data/industries/finance-geopolitics.json`

  ### Phase 3: Trend Integration
  - [ ] Create `lib/trends/hackernews.ts` (HN API integration)
  - [ ] Create `lib/trends/reddit.ts` (public JSON endpoints)
  - [ ] Build `lib/trends/aggregator.ts` with KV caching
  - [ ] Integrate trends into prompt assembly

  ### Phase 4: Pattern System
  - [ ] Curate `data/patterns/hooks.json` (10+ hook patterns)
  - [ ] Curate `data/patterns/structures.json` (5+ structures)
  - [ ] Build pattern selection with randomization

  ### Phase 5: UI & Polish
  - [ ] Build main page with Generate button
  - [ ] Add industry dropdown selector
  - [ ] Implement PostPreview with copy-to-clipboard
  - [ ] Add character count display
  - [ ] Style with Tailwind

  ### Phase 6: Deploy
  - [ ] Push to GitHub
  - [ ] Deploy to Vercel
  - [ ] Configure environment variables in Vercel
  - [ ] Test end-to-end

  ---

  ## Verification Plan

  1. **Generate button works** - Click produces streaming response
  2. **Fresh output each time** - Multiple clicks yield different posts
  3. **No AI slop** - Posts avoid banned phrases, feel human-written
  4. **Trend integration** - Posts reference current topics from HN/Reddit
  5. **Industry voice** - Posts use appropriate vocabulary/tone
  6. **Copy works** - Can copy post to clipboard
  7. **Deployed URL accessible** - Works without local installation

  ---

  ## Critical Files to Create

  1. `app/page.tsx` - Main UI with Generate button
  2. `app/api/generate/route.ts` - Streaming generation endpoint
  3. `lib/ai/prompts.ts` - Prompt assembly with anti-slop measures
  4. `lib/trends/aggregator.ts` - Trend fetching and caching
  5. `data/patterns/hooks.json` - Curated hook patterns

  ---

  ## Environment Variables Needed

  ```
  ANTHROPIC_API_KEY=sk-ant-...
  KV_REST_API_URL=https://...  (optional, for caching)
  KV_REST_API_TOKEN=...        (optional, for caching)
  ```


  If you need specific details from before exiting plan mode (like exact code snippets, error messages, or
  content you generated), read the full transcript at: C:\Users\arnay\.claude\projects\C--Users-arnay-downl
  oads-diddy-postgenerator\7fb8d4b9-7f0f-446a-88e6-7ef2d2ea3f0c.jsonl