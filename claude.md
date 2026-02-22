# Advisory Board Extension — Project Guidelines

## Project Overview
A Chrome browser extension that acts as an **AI-powered advisory board** for solopreneurs. It detects prototypes hosted on Lovable, Replit, and similar platforms, scrapes visible UI/content, and delivers a structured business analysis: revenue prediction, business model fit, pricing strategy, and competitive landscape.

## Architecture

```
extension/
├── manifest.json          # Chrome MV3 manifest
├── popup.html             # Main advisory board UI
├── popup.js               # Popup logic and rendering
├── content.js             # Page scraper — extracts prototype signals
├── background.js          # Service worker — orchestrates analysis
├── analysis-engine.js     # Pure-function business analysis logic
├── data/
│   ├── benchmarks.json    # SaaS/app benchmark data (ARR, churn, pricing)
│   └── competitors.json   # Known competitor database by category
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── styles/
    └── popup.css          # All styling
```

## Key Design Decisions

### 1. Offline-first analysis
The MVP runs entirely client-side with no API calls. All benchmark data is bundled in `data/`. This keeps the extension fast, free, and privacy-respecting. A future version could call Claude API for deeper analysis.

### 2. Detection heuristics over AI parsing
We detect prototype platforms via URL patterns and DOM signatures, not LLM parsing. This is faster and deterministic. The content script extracts: page title, meta description, visible headings, CTAs, pricing mentions, feature lists, and tech stack signals.

### 3. Scoring model
Revenue/viability scores use a weighted factor model based on real SaaS benchmarks:
- **Market signal strength** (30%) — keyword density for known high-value categories
- **Monetization readiness** (25%) — presence of pricing, payment CTAs, tiers
- **Product completeness** (20%) — navigation depth, feature breadth, polish signals
- **Differentiation** (15%) — unique value prop detection vs known competitors
- **Distribution potential** (10%) — viral loops, integrations, SEO signals

### 4. UI philosophy
The popup is a single-page dashboard. No tabs, no settings, no onboarding. Open it, get your analysis. Think: a smart investor glancing at your prototype and giving you the real talk.

## Code Style
- Vanilla JS only — no frameworks, no build step
- ES modules where Chrome MV3 allows
- Functions are small and pure where possible
- All data transformations happen in `analysis-engine.js`
- DOM manipulation only in `popup.js`
- No external dependencies

## Extending the Competitor Database
Edit `data/competitors.json`. Each entry:
```json
{
  "category": "project-management",
  "players": ["Asana", "Linear", "Monday", "ClickUp"],
  "avgPricing": "$10-25/user/mo",
  "marketSize": "$7.1B",
  "saturation": "high"
}
```

## Extending Benchmarks
Edit `data/benchmarks.json`. Sourced from public data (OpenView, KeyBanc, ProfitWell).

## Testing
Load as unpacked extension in `chrome://extensions`. Navigate to any Lovable/Replit/Vercel preview URL. Click the extension icon. Verify all 5 analysis sections render with non-empty data.

## Future Roadmap
- Claude API integration for free-form competitive analysis
- Export report as PDF
- "Ask Your Board" — freeform Q&A about the prototype
- Historical tracking — save analyses and compare over time
