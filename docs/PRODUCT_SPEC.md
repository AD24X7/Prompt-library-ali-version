# AI Cofounder — Product Spec

## Product Overview

**Format:** Web application (responsive, mobile-friendly)
**Model:** Freemium
**URL:** TBD (e.g., aicofounder.com)

---

## Core Features

### 1. Vision Input ("The 2-Liner")

The entry point. The builder shares their idea in natural language — kept intentionally short to force clarity.

**Input:**
- **Vision statement** — 2-3 sentences max. What are you building and for whom?
- **Optional context tags** — select from: `Software`, `Hardware`, `Marketplace`, `Content/Media`, `Service`, `E-commerce/DTC`, `Other`
- **Seriousness level** — `Just Exploring`, `Weekend Project`, `Side Hustle`, `Serious Venture`

**Why constrain to 2 lines?**
If you can't articulate the idea in 2 lines, you haven't thought about it enough. The constraint is the feature.

---

### 2. Viability Score (The Secret Sauce)

→ *See [SCORING_ENGINE.md](./SCORING_ENGINE.md) for full details*

After the builder submits their vision, AI Cofounder spins up multiple research personas to evaluate the idea across dynamically selected parameters. The output is:

- **Overall Viability Score** (0-100) — a weighted composite
- **Parameter Breakdown** — each scored individually with its weight
- **Confidence Level** — how much data/signal the AI had to work with
- **One-line Verdict** — e.g., "Strong niche play with clear GTM, but crowded space — differentiation is key."

**Key design principle:** Parameters and weights are _not_ fixed. They are dynamically selected and weighted based on the specific idea. A hardware product gets evaluated differently than a SaaS tool.

---

### 3. Progressive Detail Disclosure

The score is the hook. The detail is the value.

Each parameter in the breakdown can be expanded to reveal:
- **Assessment summary** (2-3 sentences)
- **Key findings** — data points, competitor examples, market signals
- **Risk flags** — specific concerns for this parameter
- **Opportunity signals** — where the idea has an edge

Parameters are presented **ordered by weight** (most impactful first), so the builder focuses on what matters most.

---

### 4. Iteration Engine ("What If...")

This is where AI Cofounder earns its name. After the initial score, it recommends 2-3 iterations:

- **Niche Down** — "What if you focused specifically on [segment]?"
- **Sharpen ICP** — "What if your target was [more specific persona]?"
- **Tweak the Offering** — "What if you started with [smaller scope] and expanded?"
- **Pivot the Model** — "What if this was [marketplace/subscription/one-time] instead?"
- **Change the Wedge** — "What if your GTM started with [different channel]?"

Each iteration shows:
- The modified vision statement
- A **tentative viability score** with delta from original
- A brief rationale for why this iteration scores differently

The builder can:
- Accept an iteration (replaces their vision, triggers full re-score)
- Modify an iteration (edit the suggestion, then re-score)
- Continue iterating (multiple rounds until confident)
- Branch — explore two directions in parallel

---

### 5. Build-Ready Output

When the builder is confident in their idea (after 0 or more iterations), AI Cofounder generates:

**The Spec Package:**
- `PRODUCT_BRIEF.md` — What you're building, for whom, and why
- `USER_STORIES.md` — Core user journeys and acceptance criteria
- `TECH_SPEC.md` — Recommended stack, architecture, key decisions
- `MVP_SCOPE.md` — What's in V1 and what's deferred
- `GTM_PLAN.md` — How to get your first 100 users

**The First Prompt:**
- A ready-to-paste prompt for the builder's vibe-coding tool of choice (Cursor, Replit Agent, Claude, etc.)
- Tailored to the chosen tech stack
- References the generated `.md` files

**Business Considerations** (based on seriousness level):
- `Just Exploring` → skip this section
- `Weekend Project` → lightweight: domain, hosting, basic analytics
- `Side Hustle` → moderate: legal basics (LLC?), payment processing, marketing channels
- `Serious Venture` → full: incorporation, fundraising landscape, IP considerations, hiring roadmap

---

### 6. Idea Discovery Feed

A curated, real-time feed of startup ideas and opportunities sourced from:

- **YC Requests for Startups** — parsed and structured
- **Emerging trends** — from Product Hunt, Hacker News, Reddit, Twitter/X
- **Market gaps** — identified through AI analysis of recent funding, acquisitions, and shutdowns
- **Problem statements** — from forums, communities, and complaint aggregators

Each idea in the feed includes:
- Source and date
- One-line summary
- Relevance tags
- A "Score This" button — one click to run it through the Viability Score engine

---

## Freemium Model

### Free Tier
- **3 idea evaluations** per month
- Basic viability score (overall score + top 3 parameters)
- 1 iteration round per idea
- No build-ready output
- Access to Idea Discovery Feed (read-only, limited)

### Pro Tier ($X/month — pricing TBD)
- **Unlimited** idea evaluations
- Full viability score (all parameters with deep detail)
- Unlimited iteration rounds
- Full build-ready output (`.md` files + first prompt)
- Business considerations package
- Full Idea Discovery Feed with "Score This"
- Save and revisit past evaluations
- Export to Notion / GitHub / local

### Future: Team Tier
- Shared workspace for co-evaluating ideas
- Collaborative iteration sessions
- Comparison view (score ideas side by side)

---

## Key UX Principles

1. **Speed to value** — From landing page to first score in under 60 seconds
2. **Progressive disclosure** — Don't overwhelm. Score first, detail on demand
3. **Honest, not harsh** — The AI is direct but constructive. "This is hard because X" not "This won't work"
4. **Conversational, not clinical** — Feels like talking to a smart cofounder, not reading a McKinsey deck
5. **Actionable over analytical** — Every insight should lead to a next step
6. **Respect the spectrum** — A weekend project gets evaluated as a weekend project, not compared to a Series A startup
