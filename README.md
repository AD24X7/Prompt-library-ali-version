# AI Advisory Board

Chrome extension that gives you an **AI-powered startup advisory board** for any website. Point it at a live prototype or product, and it analyzes the page using Claude to deliver real business insights — not heuristics, not templates, actual AI analysis of what's on the page.

## What it does

Click the extension on any web page and get:

- **Overall business readiness score** (0-100)
- **What We Found** — product description, tech stack, page stats
- **Revenue Projection** — conservative, base case, and optimistic MRR/ARR scenarios
- **Ideal Customer Profile** — who to sell to and why
- **Market Sizing** — TAM/SAM/SOM with narrative
- **Monetization** — pricing model suggestions based on what's on the page
- **Competitive Landscape** — real competitors with links
- **Product Readiness** — how complete the product is
- **Board Recommendations** — prioritized, actionable next steps
- **Vision Editor** — describe your vision and Claude recalculates everything

## Setup

### 1. Install the extension

1. Clone this repo
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked**
5. Select this repo's folder

### 2. Add your API key

1. Click the extension icon — you'll see "Set up your API key"
2. Click **Open Settings**
3. Paste your [Anthropic API key](https://console.anthropic.com/settings/keys)
4. Choose your model (Sonnet recommended, Haiku for speed)
5. Save

### 3. Use it

1. Navigate to any website (a prototype, a competitor, a landing page)
2. Click the Advisory Board extension icon
3. Wait a few seconds for Claude to analyze the page
4. Read the analysis

## File structure

```
ai-advisory-board/
├── manifest.json       # Chrome extension manifest (v3)
├── background.js       # Service worker — calls Claude API
├── content.js          # Content script — extracts page data
├── popup.html          # Extension popup layout
├── popup.js            # Popup rendering and UI logic
├── options.html        # Settings page layout
├── options.js          # Settings page logic (API key, model)
├── styles/
│   ├── popup.css       # Popup styles (dark theme)
│   └── options.css     # Settings page styles
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## How it works

1. **content.js** is injected into the active tab and extracts the full page text (up to 20K chars), headings, buttons, links, prices, tech stack signals, and page statistics
2. **background.js** takes that data, builds a structured prompt, and sends it to the Claude API (Anthropic) for analysis
3. Claude returns a JSON object with scores, recommendations, market data, and competitive analysis — all based on the actual page content
4. **popup.js** renders the results in a clean, dark-themed UI

## Requirements

- Chrome browser (Manifest v3)
- [Anthropic API key](https://console.anthropic.com/settings/keys)

## Cost

Each analysis uses one Claude API call. At typical page lengths:
- **Sonnet**: ~$0.01-0.03 per analysis
- **Haiku**: ~$0.001-0.005 per analysis
