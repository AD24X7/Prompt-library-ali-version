# AI Cofounder — User Journeys

## Journey 1: First-Time Visitor → First Score

**Persona:** Raj, 31, Senior SWE at a mid-size tech company. Has been noodling on an idea for a "Notion for freelancers" during his commute. Heard about AI Cofounder from a Hacker News comment.

```
Landing Page
│
├─ Sees: Headline, 2-line explainer, single input box
│  "Share your idea in 2 lines. Meet your AI cofounder."
│
├─ Types: "A simplified project management tool specifically
│          for freelance designers — focused on client
│          communication and invoice tracking."
│
├─ Selects: [Software] [Side Hustle]
│
├─ Clicks: [Score My Idea]
│
├─ Loading State (8-15 seconds):
│  Shows research personas spinning up with live status
│  "Market Analyst is researching freelance tools market..."
│  "Competitive Scout is mapping existing players..."
│  "GTM Strategist is identifying distribution channels..."
│
├─ Score Arrives:
│  Overall: 68/100 | Confidence: Medium
│  Verdict: "Viable niche with clear demand, but crowded
│           adjacent space. Your wedge is designer-specific
│           workflows — lean into that."
│
├─ Scrolls parameter breakdown (ordered by weight)
│  Clicks into "Competitive Landscape" → sees Bonsai,
│  HoneyBook, AND CO as competitors, with gap analysis
│
├─ Sees iteration suggestions:
│  #1: "Niche to UX/UI designers only" → tent. 74 (+6)
│  #2: "Add portfolio showcase as wedge" → tent. 71 (+3)
│  #3: "Pivot to agency model" → tent. 58 (-10)
│
└─ Hits free tier limit after expanding 3 parameters
   Sees: "Unlock full details + iterations → Go Pro"
```

**Outcome:** Raj now has a real assessment. He bookmarks the page. That weekend, he upgrades to Pro to run iterations.

---

## Journey 2: Pro User → Full Iteration Cycle

**Persona:** Priya, 28, Product Manager at a FAANG. Has a Pro subscription. Exploring an idea for an AI-powered meal prep service for busy parents.

```
Dashboard
│
├─ Clicks [New Idea]
│
├─ Types: "An AI meal planning app for dual-income parents
│          that generates weekly meal preps optimized for
│          nutrition, kid-friendliness, and prep time."
│
├─ Selects: [Software] [Serious Venture]
│
├─ Score: 61/100 | Confidence: Medium
│  Verdict: "Real pain point, but extremely crowded consumer
│           space. Differentiation is thin — 'AI' alone isn't
│           a moat. Distribution will be expensive."
│
├─ Expands all parameters (Pro access)
│  - Market Size: 82 (large, growing)
│  - Competitive Landscape: 38 (very crowded — Mealime,
│    Eat This Much, Whisk, etc.)
│  - Differentiation: 41 (AI is table stakes now)
│  - GTM Ease: 45 (paid acquisition likely needed)
│  - Revenue Clarity: 72 (subscription model proven)
│
├─ Reviews iteration suggestions:
│  #1: "Focus on families with food allergies/restrictions"
│       → tent. 71 (+10)
│  #2: "Partner with grocery delivery (API integration)"
│       → tent. 67 (+6)
│  #3: "B2B: sell to corporate wellness programs"
│       → tent. 73 (+12)
│
├─ Accepts Iteration #1 (food allergies niche)
│  Full re-score triggers → 73/100
│  Competitive Landscape jumps to 62 (fewer competitors)
│  Differentiation jumps to 68 (clear niche authority)
│
├─ Runs one more iteration:
│  "What if I add a community for allergy-friendly recipes?"
│  → 76/100 — Priya feels good about this direction
│
├─ Clicks [Generate Build Package]
│
├─ Receives:
│  📄 PRODUCT_BRIEF.md
│  📄 USER_STORIES.md
│  📄 TECH_SPEC.md (recommends Next.js + Supabase + OpenAI)
│  📄 MVP_SCOPE.md (V1: allergy profiles, weekly plans, grocery list)
│  📄 GTM_PLAN.md (target allergy parent communities on Reddit/FB)
│
│  🔧 First Prompt for Cursor:
│  "Build a Next.js app with Supabase auth. The app helps
│   parents with children who have food allergies plan weekly
│   meals. Start with: user onboarding (allergy profiles),
│   AI meal plan generation, and grocery list export..."
│
│  📋 Business Considerations (Serious Venture):
│  - Consider LLC formation
│  - FDA compliance for nutritional claims
│  - Stripe integration for subscriptions
│  - Content marketing via allergy parent blogs
│
└─ Priya opens Cursor, pastes the prompt, starts building.
```

**Outcome:** Priya went from "vague app idea" to "validated, niche-focused concept with specs" in one sitting.

---

## Journey 3: Idea Discovery → Score It

**Persona:** Marcus, 34, DevOps engineer. Doesn't have a specific idea but is looking for inspiration.

```
Dashboard → Idea Discovery Feed
│
├─ Browsing curated ideas:
│
│  ┌──────────────────────────────────────────────┐
│  │ 🔥 From: YC Request for Startups (2025 Q4)  │
│  │ "Tools for small manufacturers to sell DTC"   │
│  │ Tags: #e-commerce #hardware #B2B             │
│  │ [Score This]                                  │
│  ├──────────────────────────────────────────────┤
│  │ 📈 Trending on HN (3 days ago)               │
│  │ "Developers are building personal CRMs"       │
│  │ Tags: #dev-tools #productivity #SaaS         │
│  │ [Score This]                                  │
│  ├──────────────────────────────────────────────┤
│  │ 💡 Market Gap Detected                        │
│  │ "No good inventory tool for Etsy sellers      │
│  │  with 50-500 SKUs"                            │
│  │ Tags: #e-commerce #SMB #SaaS                 │
│  │ [Score This]                                  │
│  └──────────────────────────────────────────────┘
│
├─ Marcus clicks [Score This] on the Etsy inventory idea
│
├─ Pre-fills vision input:
│  "An inventory management tool for mid-size Etsy sellers
│   (50-500 SKUs) that syncs with Etsy's API and handles
│   multi-channel stock tracking."
│
├─ Marcus tweaks it slightly, adds his own spin
│
├─ Runs the score → 74/100
│  "Clear pain point with an underserved segment. Etsy API
│   access makes this buildable. Risk: Etsy could build this."
│
└─ Marcus saves it to his dashboard for later.
```

**Outcome:** Marcus found an idea he wouldn't have thought of, validated it in seconds, and saved it for his next weekend build session.

---

## Journey 4: Hardware / Physical Product Evaluation

**Persona:** Lisa, 30, mechanical engineer at a robotics startup. Wants to explore selling a physical product — custom ergonomic keyboard kits.

```
├─ Types: "Custom ergonomic split keyboard kits targeting
│          developers and writers with RSI issues. Sold as
│          DIY kits with premium pre-built options."
│
├─ Selects: [Hardware] [Side Hustle]
│
├─ Score: 64/100 | Confidence: Medium
│
│  Note: Because [Hardware] was selected, the engine
│  activates parameters that don't appear for pure software:
│
│  - Unit Economics: 58 (BOM + shipping cuts into margins)
│  - Ability to Bring to Market: 52 (manufacturing, fulfillment)
│  - Regulatory / Legal Risk: 71 (low for keyboards)
│  - Build Complexity: 45 (hardware prototyping is slow)
│  - Market Size: 69 (niche but passionate community)
│  - Community / Distribution: 78 (r/mechanicalkeyboards,
│    Geekhack — very strong communities)
│  - Scalability: 42 (physical = harder to scale)
│
│  Verdict: "Passionate niche with strong community
│           distribution. The challenge is unit economics
│           and scaling beyond hobbyist volumes."
│
├─ Iteration suggestions account for hardware realities:
│  #1: "Start with 3D-printed kits, not injection mold"
│       → tent. 70 (+6) — improves build complexity
│  #2: "Sell the design files as digital product first"
│       → tent. 76 (+12) — removes hardware complexity
│  #3: "Partner with an existing keycap manufacturer"
│       → tent. 68 (+4) — improves unit economics
│
└─ Lisa explores the digital-first iteration...
```

**Outcome:** The scoring engine treated a hardware idea fundamentally differently than software — surfacing the right parameters and the right iterations.

---

## Journey 5: "Just for Fun" Builder

**Persona:** Sam, 27, frontend dev. Wants to build a browser extension that adds sound effects to GitHub PRs. Not trying to make money — just thinks it'd be funny and good for learning.

```
├─ Types: "A Chrome extension that plays dramatic sound
│          effects when PRs are approved, rejected, or
│          have merge conflicts."
│
├─ Selects: [Software] [Just Exploring]
│
├─ Score: 55/100 | Confidence: High
│
│  Note: Because [Just Exploring], the engine adjusts:
│  - Drops: Fundraise Potential, Acquisition Interest,
│    Unit Economics
│  - Adds: Fun Factor (qualitative), Shareability,
│    Learning Value
│  - Reweights: Build Complexity (high weight),
│    GTM Ease (high weight — can it go viral?)
│
│  Verdict: "Very buildable weekend project with real
│           viral potential. The GitHub/dev community loves
│           this kind of thing. Ship it and post to HN."
│
│  Build Complexity: 91 — "A few hours with Chrome
│   extension APIs and Howler.js"
│  GTM Ease: 82 — "Post to r/programming, dev Twitter"
│  Shareability: 88 — "Inherently funny, demo-able in a GIF"
│
└─ Generates a lightweight spec + prompt (no business
   considerations — this is just for fun).
```

**Outcome:** AI Cofounder didn't try to make this into a startup. It respected the intent, scored it appropriately, and helped Sam build it fast.

---

## State Diagram: Overall User Flow

```
┌─────────┐     ┌───────────┐     ┌─────────────┐
│ Landing  │────▸│  Vision   │────▸│  Viability  │
│  Page    │     │  Input    │     │   Score     │
└─────────┘     └───────────┘     └──────┬──────┘
                                         │
                              ┌──────────┼──────────┐
                              ▼          ▼          ▼
                        ┌──────────┐ ┌────────┐ ┌────────┐
                        │ Expand   │ │Iterate │ │ Save / │
                        │ Details  │ │ Ideas  │ │ Later  │
                        └──────────┘ └───┬────┘ └────────┘
                                         │
                                    ┌────┴────┐
                                    ▼         ▼
                              ┌──────────┐ ┌──────────┐
                              │ Accept & │ │ Modify & │
                              │ Re-score │ │ Re-score │
                              └────┬─────┘ └────┬─────┘
                                   │             │
                                   └──────┬──────┘
                                          ▼
                                   ┌─────────────┐
                                   │  Confident?  │
                                   └──────┬──────┘
                                    Yes   │   No
                                   ┌──────┴──────┐
                                   ▼              ▼
                            ┌─────────────┐  (back to
                            │ Build-Ready │   iterate)
                            │  Output     │
                            └─────────────┘
```
