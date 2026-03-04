# AI Cofounder — Architecture

## Design Principles

1. **Ship fast, refactor later** — Use managed services; minimize self-hosted infra
2. **AI-native** — LLM calls are the core product, not a bolt-on
3. **Streaming-first** — Research and scoring should feel live, not like waiting for a spinner
4. **Cost-aware** — LLM calls are expensive; cache aggressively, batch intelligently
5. **Solo-dev friendly** — The stack should be operable by one person

---

## Tech Stack (Recommended)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 14+ (App Router) | SSR, streaming, React Server Components |
| **Styling** | Tailwind CSS + shadcn/ui | Fast to build, consistent, accessible |
| **Auth** | Supabase Auth (or Clerk) | Social login, magic links, JWT out of the box |
| **Database** | Supabase (PostgreSQL) | Auth + DB + Realtime in one; generous free tier |
| **AI / LLM** | Anthropic Claude API (primary) | Best reasoning for analysis; structured outputs |
| **AI Orchestration** | Vercel AI SDK | Streaming, multi-step, tool use |
| **Payments** | Stripe | Subscriptions, usage-based billing, webhooks |
| **Hosting** | Vercel | Zero-config deploys, edge functions, analytics |
| **Background Jobs** | Inngest (or Vercel Cron) | Idea feed crawling, async scoring |
| **Search / Crawling** | Firecrawl or Browserbase | For Idea Discovery Feed sourcing |
| **Analytics** | PostHog (or Plausible) | Privacy-friendly, self-hostable |
| **Email** | Resend | Transactional emails (welcome, score ready, etc.) |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                            │
│                    (Next.js App)                          │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Landing  │  │  Scoring │  │ Iteration│  │  Feed   │ │
│  │  Page    │  │   View   │  │   View   │  │  View   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS / WebSocket (streaming)
                      ▼
┌─────────────────────────────────────────────────────────┐
│                     API LAYER                            │
│              (Next.js API Routes / Server Actions)        │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ /api/score   │  │ /api/iterate │  │ /api/generate │  │
│  │              │  │              │  │   (build pkg) │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                 │                   │          │
│  ┌──────┴─────────────────┴───────────────────┴───────┐  │
│  │              SCORING ORCHESTRATOR                   │  │
│  │  (Manages multi-persona research pipeline)          │  │
│  └──────────────────────┬──────────────────────────────┘  │
└─────────────────────────┼────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
   │   Claude    │ │  Supabase   │ │   Stripe    │
   │    API      │ │  (DB/Auth)  │ │ (Payments)  │
   └─────────────┘ └─────────────┘ └─────────────┘
```

---

## Data Model

### Core Tables

```sql
-- Users (managed by Supabase Auth, extended here)
users
  id              UUID (PK, from Supabase Auth)
  email           TEXT
  display_name    TEXT
  plan            ENUM('free', 'pro', 'team')
  stripe_customer_id  TEXT
  ideas_scored_this_month  INT (default 0)
  created_at      TIMESTAMP
  updated_at      TIMESTAMP

-- Ideas (each submitted vision)
ideas
  id              UUID (PK)
  user_id         UUID (FK → users)
  vision_text     TEXT
  category        TEXT          -- software, hardware, etc.
  seriousness     TEXT          -- exploring, weekend, side_hustle, serious
  status          ENUM('scoring', 'scored', 'iterating', 'build_ready')
  created_at      TIMESTAMP
  updated_at      TIMESTAMP

-- Scores (each scoring run, including re-scores after iterations)
scores
  id              UUID (PK)
  idea_id         UUID (FK → ideas)
  parent_score_id UUID (FK → scores, nullable — links iteration chain)
  overall_score   INT (0-100)
  confidence      ENUM('low', 'medium', 'high')
  verdict         TEXT
  iteration_note  TEXT (nullable — what changed from parent)
  parameters      JSONB
  -- parameters shape:
  -- [
  --   {
  --     "name": "Market Size",
  --     "score": 82,
  --     "weight": 0.12,
  --     "summary": "...",
  --     "findings": ["...", "..."],
  --     "risks": ["..."],
  --     "opportunities": ["..."]
  --   },
  --   ...
  -- ]
  raw_research    JSONB (full research output, for debugging/audit)
  created_at      TIMESTAMP

-- Iterations (suggested pivots)
iterations
  id              UUID (PK)
  score_id        UUID (FK → scores — the score that spawned this)
  type            TEXT          -- niche_down, sharpen_icp, tweak_offering, etc.
  modified_vision TEXT
  tentative_score INT (0-100)
  tentative_delta INT
  rationale       TEXT
  accepted        BOOLEAN (default false)
  created_at      TIMESTAMP

-- Build Packages (generated spec files)
build_packages
  id              UUID (PK)
  idea_id         UUID (FK → ideas)
  score_id        UUID (FK → scores — the final score used)
  files           JSONB
  -- files shape:
  -- {
  --   "PRODUCT_BRIEF.md": "...",
  --   "USER_STORIES.md": "...",
  --   "TECH_SPEC.md": "...",
  --   "MVP_SCOPE.md": "...",
  --   "GTM_PLAN.md": "...",
  --   "FIRST_PROMPT.md": "..."
  -- }
  business_considerations  JSONB (nullable)
  created_at      TIMESTAMP

-- Idea Feed (crawled/curated ideas)
feed_items
  id              UUID (PK)
  source          TEXT          -- yc, hackernews, producthunt, etc.
  source_url      TEXT
  title           TEXT
  summary         TEXT
  tags            TEXT[]
  relevance_score FLOAT
  published_at    TIMESTAMP
  crawled_at      TIMESTAMP
  expires_at      TIMESTAMP
```

---

## Key Flows

### Scoring Flow (the critical path)

```
User submits vision
       │
       ▼
[1] Vision Parsing (Claude call #1)
    - Classify: category, delivery, revenue model, target market
    - Extract: core assumptions, key risks
    - Select: relevant parameters + weights
       │
       ▼
[2] Multi-Persona Research (Claude calls #2-4, parallelized)
    - Each persona gets: vision, classification, their assigned parameters
    - Each returns: structured findings per parameter
    - Stream progress to client as each persona completes
       │
       ▼
[3] Score Synthesis (Claude call #5)
    - Input: all persona findings
    - Output: parameter scores, overall score, confidence, verdict
    - Also generates: iteration suggestions (2-3)
       │
       ▼
[4] Store & Return
    - Save to DB (scores table + iterations table)
    - Stream final result to client
```

**Estimated LLM calls per full score: 4-6**
**Estimated latency: 10-20 seconds** (with parallel persona calls)
**Estimated cost per score: ~$0.08-0.15** (Claude Sonnet for research, Opus for synthesis — to be optimized)

### Iteration Flow

```
User accepts/modifies an iteration
       │
       ▼
[1] If tentative only → Lightweight re-score (1-2 Claude calls)
    - Delta-based: only re-evaluate parameters likely affected
    - Return tentative score + delta

[2] If accepted → Full re-score (same as Scoring Flow)
    - New score record linked to parent via parent_score_id
    - Full parameter research with updated vision
```

### Build Package Generation

```
User clicks "Generate Build Package"
       │
       ▼
[1] Gather context:
    - Final vision text
    - Final score + all parameter details
    - Seriousness level
    - Iteration history (what was tried, what worked)
       │
       ▼
[2] Generate files (Claude call, structured output):
    - PRODUCT_BRIEF.md
    - USER_STORIES.md
    - TECH_SPEC.md
    - MVP_SCOPE.md
    - GTM_PLAN.md
       │
       ▼
[3] Generate first prompt (Claude call):
    - Tailored to recommended stack from TECH_SPEC
    - References the generated files
       │
       ▼
[4] Business considerations (if seriousness > exploring):
    - Legal, payment, marketing, hiring recommendations
       │
       ▼
[5] Store & present as downloadable package
```

---

## Streaming UX

Scoring takes 10-20 seconds. This must **not** feel like waiting.

**Approach:** Server-Sent Events (SSE) via Vercel AI SDK streaming.

What the user sees during scoring:
1. "Analyzing your vision..." (classification step)
2. "Market Analyst is researching market size..." (persona 1 starts)
3. "Competitive Scout is mapping the landscape..." (persona 2 starts, parallel)
4. "GTM Strategist is evaluating channels..." (persona 3 starts, parallel)
5. Results stream in as each persona completes — parameters appear one by one
6. Overall score + verdict appear last (synthesis step)

This makes 15 seconds feel interactive rather than dead.

---

## Cost Management

LLM costs are the primary variable cost. Strategies:

| Strategy | Impact |
|----------|--------|
| **Model tiering** | Use Haiku for classification, Sonnet for research, Opus for synthesis |
| **Caching** | Cache classification + parameter selection for similar ideas |
| **Iteration deltas** | Only re-research changed parameters, not all |
| **Feed pre-scoring** | Pre-score popular feed items; cache results |
| **Rate limiting** | Free tier: 3/month; Pro: reasonable daily cap |
| **Prompt optimization** | Minimize tokens via structured prompts + examples |

**Target unit economics:**
- Cost per full score: ~$0.10
- Free tier cost per user per month: ~$0.30 (3 scores)
- Pro pricing should be ≥ 10x expected cost per user
