// background.js — Service worker that orchestrates extraction + Claude API analysis

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MAX_TOKENS = 4096;

// The analysis prompt sent to Claude
const SYSTEM_PROMPT = `You are an elite startup advisory board — a combined panel of a VC partner, a growth-stage operator, and a SaaS pricing expert. You are analyzing a live prototype/product based on its actual page content.

Your job: provide brutally honest, specific, actionable business analysis. No generic advice. Everything must be grounded in what you actually see on the page.

You MUST respond with valid JSON matching this exact schema (no markdown, no code fences, just raw JSON):

{
  "summary": {
    "platform": "string — hosting platform detected, or 'unknown'",
    "oneLiner": "string — one punchy sentence summarizing what this is and its potential",
    "vision": null
  },
  "overallScore": {
    "score": "number 0-100 — overall business readiness score",
    "label": "string — Strong/Promising/Early/Needs work/Not ready",
    "grade": "string — A/B+/B/C+/C/D+/D/F"
  },
  "prototypeDescription": {
    "title": "string — the product name or best title",
    "catchyPitch": "string — a compelling 1-line pitch for what this product does",
    "techStack": ["array of detected technologies"],
    "stats": {
      "pages": "number — estimated distinct pages/views",
      "features": "number — distinct feature sections",
      "interactiveElements": "number — forms, inputs, interactive components",
      "images": "number — images on the page"
    }
  },
  "revenue": {
    "scenarios": {
      "pessimistic": { "mrr": "number", "arr": "number", "label": "Conservative" },
      "realistic": { "mrr": "number", "arr": "number", "label": "Base case" },
      "optimistic": { "mrr": "number", "arr": "number", "label": "If it takes off" }
    },
    "timeToRamen": "string — estimated months to $3K MRR",
    "benchmarkContext": "string — relevant SaaS benchmark comparison"
  },
  "icp": {
    "profile": "string — specific ideal customer profile based on the product",
    "reasoning": "string — why this is the right ICP",
    "signals": ["array of 3 specific actionable signals for finding these customers"]
  },
  "marketSizing": {
    "tam": { "value": "string e.g. '$5B'", "label": "Total Addressable Market", "description": "string" },
    "sam": { "value": "string e.g. '$800M'", "label": "Serviceable Addressable Market", "description": "string" },
    "som": { "value": "string e.g. '$50M'", "label": "Serviceable Obtainable Market", "description": "string" },
    "narrative": "string — market opportunity narrative specific to this product"
  },
  "monetization": {
    "score": "number 0-100",
    "suggestedModel": "string — e.g. 'freemium + paid tiers'",
    "suggestedPrice": "string — e.g. '$29/mo'",
    "priceRange": "string — e.g. '$19-$79/mo'",
    "detectedPrices": ["array of prices found on the page, empty if none"],
    "signals": [{ "text": "string — specific observation", "positive": "boolean" }]
  },
  "competitive": {
    "score": "number 0-100 — higher means less competition / more opportunity",
    "saturation": "string — very_high/high/medium/low",
    "players": [{ "name": "string", "url": "string — competitor URL" }],
    "marketSize": "string — e.g. '$2.4B'",
    "avgPricing": "string — e.g. '$25-$99/mo'",
    "opportunity": "string — specific competitive opportunity",
    "signals": [{ "text": "string", "positive": "boolean" }]
  },
  "completeness": {
    "score": "number 0-100",
    "signals": [{ "text": "string — specific observation about product readiness", "positive": "boolean" }]
  },
  "recommendations": [
    {
      "priority": "high/medium/low",
      "area": "string — e.g. Monetization, Product, Positioning, Distribution, Launch",
      "action": "string — specific, actionable recommendation based on what you see",
      "reasoning": "string — why this matters"
    }
  ]
}

RULES:
- Base EVERYTHING on the actual page content provided. Do not make up features that aren't there.
- Be specific: name real competitors with real URLs, cite real market sizes, give real price suggestions.
- Revenue projections should be realistic for a startup at this stage.
- Recommendations must be actionable and prioritized — most impactful first.
- Include 3-5 signals per section.
- Include 3-6 competitors with real URLs.
- Include 4-6 recommendations sorted by priority.
- All numbers must be actual numbers (not strings), except where the schema says "string".
- Do NOT wrap the JSON in code fences or markdown. Return ONLY the raw JSON object.`;

function buildUserPrompt(pageData, vision) {
  let prompt = `Analyze this live product/prototype:

URL: ${pageData.url}
Title: ${pageData.title}
Platform: ${pageData.platform}
Meta Description: ${pageData.metaDescription || "None"}

--- DETECTED TECHNOLOGIES ---
${pageData.tech.length > 0 ? pageData.tech.join(", ") : "None detected"}

--- PAGE STATISTICS ---
Words: ${pageData.stats.wordCount}
Links: ${pageData.stats.linkCount}
Images: ${pageData.stats.imageCount}
Inputs/Forms: ${pageData.stats.inputCount} inputs, ${pageData.formCount} forms
Headings: ${pageData.stats.headingCount}
Buttons/CTAs: ${pageData.stats.buttonCount}

--- HEADINGS ---
${pageData.headings.map((h) => `${h.level}: ${h.text}`).join("\n")}

--- NAVIGATION ---
${pageData.navLinks.length > 0 ? pageData.navLinks.join(", ") : "None detected"}

--- BUTTONS / CTAs ---
${pageData.buttons.length > 0 ? pageData.buttons.join(", ") : "None detected"}

--- PRICES FOUND ---
${pageData.prices.length > 0 ? pageData.prices.join(", ") : "No prices detected"}

--- FULL PAGE TEXT ---
${pageData.fullText}`;

  if (vision) {
    prompt += `\n\n--- FOUNDER'S VISION ---\n${vision}\n\nFactor this vision into your analysis. Adjust ICP, market sizing, and recommendations to align with where the founder wants to take this product.`;
  }

  return prompt;
}

// Get settings from storage
async function getSettings() {
  const data = await chrome.storage.local.get(["apiKey", "model"]);
  return {
    apiKey: data.apiKey || null,
    model: data.model || "claude-sonnet-4-6",
  };
}

// Call Claude API
async function callClaude(apiKey, model, pageData, vision) {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: buildUserPrompt(pageData, vision),
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 401) {
      throw new Error("Invalid API key. Check your settings.");
    }
    if (response.status === 429) {
      throw new Error("Rate limited. Wait a moment and try again.");
    }
    throw new Error(`API error (${response.status}): ${err.slice(0, 200)}`);
  }

  const result = await response.json();
  const text = result.content[0].text;

  // Parse JSON — handle cases where Claude wraps in code fences
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Failed to parse AI response. Try again.");
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "analyze") {
    handleAnalyze(msg.tabId, msg.vision)
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ ok: false, error: err.message }));
    return true;
  }

  if (msg.action === "checkApiKey") {
    getSettings().then((s) => sendResponse({ hasKey: !!s.apiKey }));
    return true;
  }
});

async function handleAnalyze(tabId, vision) {
  // Check for API key
  const settings = await getSettings();
  if (!settings.apiKey) {
    return { ok: false, error: "NO_API_KEY" };
  }

  // Inject content script
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"],
    });
  } catch (e) {
    // May already be injected
  }

  // Extract page data
  const pageData = await new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { action: "extract" }, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: "Could not connect to page. Make sure you're on a web page (not chrome:// or extension pages)." });
        return;
      }
      resolve(response);
    });
  });

  if (!pageData || !pageData.ok) {
    return {
      ok: false,
      error: pageData ? pageData.error : "No response from page.",
    };
  }

  // Call Claude API for real analysis
  try {
    const analysis = await callClaude(settings.apiKey, settings.model, pageData.data, vision);

    // Inject vision if provided
    if (vision && analysis.summary) {
      analysis.summary.vision = vision;
    }

    return { ok: true, analysis };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
