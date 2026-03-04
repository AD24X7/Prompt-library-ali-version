# AI Cofounder — Roadmap

## Phased Delivery

### Phase 0: Foundation (Week 1)
**Goal:** Skeleton app with auth and the core scoring loop working end-to-end.

- [ ] Next.js project scaffold (App Router, Tailwind, shadcn/ui)
- [ ] Supabase project setup (auth, database, tables)
- [ ] Landing page with vision input form
- [ ] Claude API integration (single-call scoring — no personas yet)
- [ ] Basic score display (overall score + verdict)
- [ ] Deploy to Vercel (CI/CD from day one)

**Exit criteria:** A user can sign up, type an idea, get a score, and see it on screen.

---

### Phase 1: Scoring Engine V1 (Weeks 2-3)
**Goal:** The scoring engine is real — multi-persona, dynamic parameters, weighted.

- [ ] Vision parsing + classification (LLM call #1)
- [ ] Dynamic parameter selection + weighting logic
- [ ] Multi-persona research pipeline (parallel LLM calls)
- [ ] Score synthesis (final LLM call)
- [ ] Streaming UX — live research status updates
- [ ] Progressive detail disclosure (expand parameter details)
- [ ] Score storage (DB persistence)
- [ ] Score history on dashboard

**Exit criteria:** Scores feel insightful and unique per idea. Streaming makes the wait engaging.

---

### Phase 2: Iteration Engine (Week 4)
**Goal:** The "cofounder" part — AI suggests pivots and the user can iterate.

- [ ] Iteration suggestion generation (part of scoring synthesis)
- [ ] Tentative re-scoring (lightweight delta scoring)
- [ ] Accept/modify iteration flow
- [ ] Full re-score on accepted iterations
- [ ] Iteration history chain (parent-child scores)
- [ ] UI: side-by-side or stacked comparison view

**Exit criteria:** A user can go through 2-3 rounds of iteration and see scores improve.

---

### Phase 3: Build-Ready Output (Week 5)
**Goal:** The payoff — from validated idea to specs + first prompt.

- [ ] Build package generation pipeline
- [ ] File generation: PRODUCT_BRIEF, USER_STORIES, TECH_SPEC, MVP_SCOPE, GTM_PLAN
- [ ] First prompt generation (tailored to chosen stack)
- [ ] Business considerations (scaled to seriousness level)
- [ ] Download as .zip or export to GitHub
- [ ] Copy-to-clipboard for the first prompt

**Exit criteria:** A builder can paste the prompt into Cursor/Replit and start building immediately.

---

### Phase 4: Monetization (Week 6)
**Goal:** Freemium model live — free tier limits, Pro tier unlocked.

- [ ] Stripe integration (subscriptions)
- [ ] Free tier enforcement (3 scores/month, limited detail, 1 iteration)
- [ ] Pro tier unlock (unlimited scores, full detail, iterations, build packages)
- [ ] Usage tracking (scores this month, per user)
- [ ] Billing portal (manage subscription, invoices)
- [ ] Upgrade prompts (contextual, non-annoying)

**Exit criteria:** Revenue possible. Free users hit limits. Pro users get full value.

---

### Phase 5: Idea Discovery Feed (Weeks 7-8)
**Goal:** Curated, real-time feed of startup ideas from external sources.

- [ ] Crawling pipeline (Firecrawl / Browserbase)
  - YC Requests for Startups
  - Hacker News (front page + Show HN)
  - Product Hunt (trending)
  - Reddit (r/startups, r/SideProject, r/Entrepreneur)
- [ ] Feed item parsing + structuring
- [ ] Relevance scoring + deduplication
- [ ] Feed UI (browsable, filterable by tags)
- [ ] "Score This" button — pre-fills vision input from feed item
- [ ] Background job scheduling (daily/hourly refresh)

**Exit criteria:** Feed is live, updated daily, and users are clicking "Score This."

---

### Phase 6: Polish & Growth (Weeks 9-10)
**Goal:** The product feels complete and is ready for public launch.

- [ ] Onboarding flow (first-time user guidance)
- [ ] Email notifications (score ready, weekly digest of feed ideas)
- [ ] Social sharing (share your score card — OG image generation)
- [ ] SEO: landing pages for common idea categories
- [ ] Analytics dashboard (PostHog)
- [ ] Performance optimization (caching, model tiering)
- [ ] Error handling + edge cases
- [ ] Mobile responsiveness pass

**Exit criteria:** Ready for Product Hunt launch / Hacker News Show HN post.

---

## Future Considerations (Post-Launch)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Team Tier** | Shared workspace, collaborative iteration | High |
| **Comparison View** | Score 2-3 ideas side by side | High |
| **Idea Versioning** | Full history of an idea's evolution | Medium |
| **Community Scores** | Anonymized aggregate — "ideas like yours score X on average" | Medium |
| **Expert Reviews** | Optional human advisor review (marketplace?) | Low |
| **API Access** | Let other tools plug into the scoring engine | Low |
| **White Label** | Accelerators / incubators use it for applications | Future |

---

## Success Metrics

### North Star
**Number of ideas that reach "Build-Ready" status per week**

### Leading Indicators
| Metric | Target (Month 1) |
|--------|-------------------|
| Signups | 500+ |
| Ideas scored | 1,000+ |
| Iteration rounds per idea (avg) | ≥ 1.5 |
| Free → Pro conversion | ≥ 5% |
| Build packages generated | 100+ |

### Health Metrics
| Metric | Target |
|--------|--------|
| Score generation latency (p95) | < 20 seconds |
| LLM cost per score | < $0.15 |
| Monthly churn (Pro) | < 10% |
| NPS | ≥ 40 |

---

## Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| LLM costs spike | Margin erosion | Model tiering, caching, prompt optimization |
| Scores feel generic | Users don't trust/return | Invest in prompt engineering; A/B test scoring prompts |
| Low conversion free → pro | Revenue shortfall | Ensure free tier delivers enough value to hook, not enough to satisfy |
| Claude API rate limits | Scoring failures | Queue system, retry logic, fallback to secondary model |
| Feed crawling breaks | Stale content | Multiple sources, health monitoring, manual curation fallback |
| Someone copies the idea | Competition | Speed of execution + community + data moat over time |
