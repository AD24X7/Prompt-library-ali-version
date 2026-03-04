# AI Cofounder — Scoring Engine

## Overview

The Viability Score is the core differentiator of AI Cofounder. Unlike generic AI tools that give qualitative feedback ("sounds interesting!"), the scoring engine produces a **quantitative, weighted, context-aware assessment** unique to each idea.

**Key principle:** No two ideas are scored the same way. The parameters _and their weights_ are dynamically determined based on the nature of the idea.

---

## How It Works

### Step 1: Vision Parsing

When a builder submits their 2-liner, the system first classifies the idea along several dimensions:

- **Category** — SaaS, Marketplace, E-commerce, Hardware, Content, Service, Dev Tool, Consumer App, etc.
- **Delivery model** — Digital, Physical, Hybrid
- **Revenue model** — Subscription, Transaction, Ad-supported, One-time, Freemium, etc.
- **Target market** — B2B, B2C, B2B2C, Prosumer
- **Stage signal** — What the builder needs to believe for this to work (e.g., "developers will pay for X", "SMBs need Y")

These classifications drive which parameters are selected and how they're weighted.

### Step 2: Parameter Selection & Weighting

From a master list of ~15-20 evaluation parameters, the engine selects the **8-12 most relevant** for this specific idea and assigns weights that sum to 100%.

**Why dynamic selection?**
- "Manufacturing complexity" matters for a hardware product but is irrelevant for a SaaS tool
- "Network effects" matter for a marketplace but barely for a consulting service
- "Regulatory risk" is critical for fintech/healthtech, ignorable for a productivity app

### Step 3: Multi-Persona Research

For each selected parameter, a specialized research persona investigates:

| Persona | Focus | Methods |
|---------|-------|---------|
| **Market Analyst** | Market size, growth trends, timing | Industry reports, funding data, trend analysis |
| **Competitive Scout** | Existing players, gaps, positioning | Product databases, review sites, feature comparison |
| **GTM Strategist** | Distribution, channels, acquisition cost | Channel analysis, community mapping, viral mechanics |
| **Business Modeler** | Unit economics, pricing, revenue potential | Comparable pricing, willingness-to-pay signals |
| **Technical Evaluator** | Build complexity, time-to-MVP, maintenance | Stack analysis, API availability, infrastructure needs |
| **Risk Assessor** | Regulatory, market, execution, and funding risks | Legal landscape, failure patterns, dependency analysis |

### Step 4: Scoring

Each parameter is scored on a **0-100 scale** with the following rubric:

| Score Range | Meaning |
|------------|---------|
| 80-100 | **Strong** — Clear evidence of strength; favorable conditions |
| 60-79 | **Promising** — More positive signals than negative; some unknowns |
| 40-59 | **Mixed** — Significant pros and cons; outcome uncertain |
| 20-39 | **Challenging** — More headwinds than tailwinds; requires strong execution |
| 0-19 | **Critical** — Major red flags; fundamental obstacles present |

**Overall Viability Score** = Σ (parameter_score × parameter_weight)

---

## Parameter Library

Below is the master list. For any given idea, 8-12 are selected.

### Market Parameters

| Parameter | Description | High Score Means |
|-----------|-------------|------------------|
| **Market Size** | TAM/SAM/SOM for this idea | Large addressable market with room to grow |
| **Market Timing** | Is the market ready? Too early? Too late? | Right timing — demand is emerging or growing |
| **Market Growth** | Is the space expanding or contracting? | Fast-growing market with tailwinds |

### Competitive Parameters

| Parameter | Description | High Score Means |
|-----------|-------------|------------------|
| **Competitive Landscape** | How crowded is the space? | Few direct competitors or clear gaps to exploit |
| **Differentiation / Moat** | What's defensible about this idea? | Clear moat — proprietary tech, data, network, brand |
| **Incumbent Vulnerability** | Are existing players slow, bloated, hated? | Incumbents are ripe for disruption |

### Business Model Parameters

| Parameter | Description | High Score Means |
|-----------|-------------|------------------|
| **Revenue Clarity** | How obvious is the path to money? | Clear monetization with proven willingness to pay |
| **Unit Economics** | Can this be profitable per customer? | Strong margins with manageable CAC and good LTV |
| **Scalability** | Can this grow without proportional cost? | High leverage — scales with minimal marginal cost |

### Go-to-Market Parameters

| Parameter | Description | High Score Means |
|-----------|-------------|------------------|
| **GTM Ease** | How hard is it to reach the first 100 users? | Clear, accessible channels; organic/viral potential |
| **Community / Distribution** | Are there existing communities to tap? | Strong existing communities aligned with the product |
| **Ability to Bring to Market** | Solo-builder feasibility for distribution | Can be distributed effectively by a small team or solo |

### Execution Parameters

| Parameter | Description | High Score Means |
|-----------|-------------|------------------|
| **Build Complexity** | How hard is the MVP to build? | Achievable MVP in days/weeks, not months |
| **Technical Risk** | Are there unsolved technical challenges? | Known, solved problems; proven tech stack available |
| **Regulatory / Legal Risk** | Compliance, licensing, legal exposure | Low regulatory burden; clear legal landscape |

### Exit / Growth Parameters

| Parameter | Description | High Score Means |
|-----------|-------------|------------------|
| **Fundraise Potential** | Would investors back this? | Fits current investor interest; clear pitch narrative |
| **Acquisition Interest** | Would a larger company want to buy this? | Strategic fit for known acquirers |
| **Exit Optionality** | Multiple paths to a good outcome? | Can bootstrap profitably OR raise OR get acquired |

---

## Dynamic Weighting Logic

Weights are determined by the idea's classification. Examples:

### Example: B2B SaaS Tool
| Parameter | Weight |
|-----------|--------|
| Market Size | 12% |
| Competitive Landscape | 15% |
| Differentiation / Moat | 12% |
| Revenue Clarity | 10% |
| Unit Economics | 8% |
| GTM Ease | 15% |
| Build Complexity | 10% |
| Community / Distribution | 8% |
| Exit Optionality | 10% |

### Example: Hardware Product (DTC)
| Parameter | Weight |
|-----------|--------|
| Market Size | 10% |
| Market Timing | 8% |
| Competitive Landscape | 10% |
| Revenue Clarity | 8% |
| Unit Economics | 15% |
| Ability to Bring to Market | 15% |
| Build Complexity | 12% |
| Regulatory / Legal Risk | 8% |
| Scalability | 7% |
| GTM Ease | 7% |

### Example: Weekend/Fun Project
For ideas marked as `Weekend Project` or `Just Exploring`, weights shift heavily toward:
- Build Complexity (higher weight — needs to be achievable)
- GTM Ease (can you share it and get users easily?)
- Fun / Learning factor (qualitative — acknowledged in the verdict)

And de-emphasize:
- Fundraise Potential, Acquisition Interest, Unit Economics

---

## Confidence Level

Every score comes with a **confidence indicator** (Low / Medium / High):

- **High** — The idea is in a well-understood space with ample data (e.g., "a CRM for X")
- **Medium** — Some novelty but comparable products/markets exist
- **Low** — Highly novel; few reference points; score is more directional than definitive

When confidence is low, the system flags this explicitly and explains what additional research could increase confidence.

---

## Score Presentation

```
┌─────────────────────────────────────────────────────┐
│  VIABILITY SCORE                                     │
│                                                      │
│         ████████████████████░░░░░  72 / 100          │
│                                                      │
│  Confidence: Medium                                  │
│                                                      │
│  "Strong niche play with clear GTM path.             │
│   Main risk: crowded adjacent space.                 │
│   Differentiation is your biggest lever."            │
│                                                      │
├─────────────────────────────────────────────────────┤
│  BREAKDOWN (by weight)                               │
│                                                      │
│  GTM Ease              ██████████████░░  78  (15%)   │
│  Competitive Landscape ██████████░░░░░░  65  (15%)   │
│  Market Size           ████████████████  85  (12%)   │
│  Differentiation       ██████████░░░░░░  60  (12%)   │
│  Build Complexity      ████████████████  82  (10%)   │
│  Revenue Clarity       ██████████████░░  75  (10%)   │
│  Exit Optionality      ██████████░░░░░░  68  (10%)   │
│  Unit Economics        ██████████████░░  74  (8%)    │
│  Community             ██████████░░░░░░  62  (8%)    │
│                                                      │
│  ▸ Click any parameter to expand details             │
└─────────────────────────────────────────────────────┘
```

---

## Iteration Scoring

When the Iteration Engine suggests a modified vision, it runs a **lightweight re-score** (not full research) to produce tentative deltas:

```
Original Vision:  72 / 100
Iteration #1 (Niche to freelancers):  78 / 100  (+6)
Iteration #2 (Pivot to marketplace):  64 / 100  (-8)
Iteration #3 (Start B2B, expand):     75 / 100  (+3)
```

If the builder accepts an iteration, a **full re-score** is triggered with complete research.
