// Content script — runs on prototype hosting platforms
// Extracts structured signals from the visible page for business analysis

(function () {
  "use strict";

  const PLATFORM_PATTERNS = {
    lovable: /lovable\.(app|dev)/i,
    replit: /repl(it\.app|\.co)/i,
    vercel: /vercel\.app/i,
    netlify: /netlify\.app/i,
    railway: /railway\.app/i,
    render: /render\.com/i,
    fly: /fly\.dev/i,
    stackblitz: /stackblitz\.io/i,
    codesandbox: /codesandbox\.io/i,
    github_pages: /github\.io/i,
    cloudflare: /pages\.dev/i,
    surge: /surge\.sh/i,
  };

  function detectPlatform() {
    const host = window.location.hostname;
    for (const [name, pattern] of Object.entries(PLATFORM_PATTERNS)) {
      if (pattern.test(host)) return name;
    }
    return "unknown";
  }

  function extractTextContent(selector, limit) {
    const els = document.querySelectorAll(selector);
    const texts = [];
    for (let i = 0; i < Math.min(els.length, limit || 20); i++) {
      const t = els[i].textContent.trim();
      if (t && t.length > 1 && t.length < 500) texts.push(t);
    }
    return texts;
  }

  function extractMeta() {
    const getMeta = (name) => {
      const el =
        document.querySelector(`meta[name="${name}"]`) ||
        document.querySelector(`meta[property="og:${name}"]`);
      return el ? el.getAttribute("content") : "";
    };
    return {
      title: document.title || "",
      description: getMeta("description"),
      ogTitle: getMeta("title"),
      ogDescription: getMeta("description"),
      ogImage: getMeta("image"),
      keywords: getMeta("keywords"),
    };
  }

  function extractPricingSignals() {
    const body = document.body.innerText.toLowerCase();
    const signals = {
      hasPricing: false,
      hasFreeTrialMention: false,
      hasPaymentCTA: false,
      priceMentions: [],
      tierCount: 0,
    };

    // Price patterns: $X, $X/mo, $X/month, $X/year
    const priceRegex = /\$\d+(?:\.\d{2})?(?:\s*\/\s*(?:mo|month|year|yr|user|seat))?/gi;
    const matches = body.match(priceRegex);
    if (matches) {
      signals.hasPricing = true;
      signals.priceMentions = [...new Set(matches)].slice(0, 10);
    }

    signals.hasFreeTrialMention =
      /free trial|try free|start free|free plan|free tier|freemium/i.test(body);
    signals.hasPaymentCTA =
      /buy now|subscribe|upgrade|get started|start trial|sign up|checkout|add to cart|purchase/i.test(body);

    // Count pricing tiers
    const tierKeywords = ["basic", "starter", "pro", "premium", "enterprise", "business", "team", "free"];
    signals.tierCount = tierKeywords.filter((kw) => body.includes(kw)).length;

    return signals;
  }

  function extractFeatureSignals() {
    const headings = extractTextContent("h1, h2, h3", 30);
    const ctas = extractTextContent(
      'button, [role="button"], a.btn, a.button, .cta, [class*="cta"], [class*="btn"]',
      20
    );
    const navItems = extractTextContent('nav a, nav button, [role="navigation"] a', 15);
    const listItems = extractTextContent("ul li, ol li", 40);

    return {
      headings,
      ctas,
      navItems,
      navDepth: navItems.length,
      listItems: listItems.slice(0, 20),
      featureCount: headings.filter(
        (h) => /feature|benefit|why|how it works|what you get/i.test(h)
      ).length,
    };
  }

  function extractTechSignals() {
    const scripts = Array.from(document.querySelectorAll("script[src]")).map(
      (s) => s.src
    );
    const links = Array.from(document.querySelectorAll("link[href]")).map(
      (l) => l.href
    );
    const all = [...scripts, ...links].join(" ").toLowerCase();

    return {
      hasReact: all.includes("react") || !!document.querySelector("[data-reactroot], #__next"),
      hasVue: all.includes("vue") || !!document.querySelector("[data-v-]"),
      hasSvelte: all.includes("svelte"),
      hasAngular: all.includes("angular"),
      hasTailwind: all.includes("tailwind") || document.querySelector('[class*="tw-"], [class*="bg-"], [class*="flex "]') !== null,
      hasStripe: all.includes("stripe"),
      hasAuth: all.includes("auth0") || all.includes("clerk") || all.includes("supabase") || all.includes("firebase"),
      hasAnalytics: all.includes("analytics") || all.includes("gtag") || all.includes("mixpanel") || all.includes("posthog") || all.includes("segment"),
      hasDatabase: all.includes("supabase") || all.includes("firebase") || all.includes("prisma") || all.includes("mongodb"),
    };
  }

  function extractCategorySignals() {
    const text = (document.body.innerText || "").toLowerCase();
    const title = (document.title || "").toLowerCase();
    const combined = title + " " + text.slice(0, 5000);

    const categoryKeywords = {
      "project-management": ["task", "project", "kanban", "board", "sprint", "backlog", "workflow", "assign"],
      "crm": ["contact", "deal", "pipeline", "lead", "sales", "customer relationship", "prospect"],
      "analytics": ["analytics", "dashboard", "metrics", "tracking", "data visualization", "report", "insight"],
      "ai-writing": ["ai writer", "generate content", "copywriting", "ai assistant", "writing tool", "blog generator"],
      "ecommerce": ["shop", "cart", "product", "store", "checkout", "buy", "order", "inventory"],
      "scheduling": ["schedule", "booking", "appointment", "calendar", "availability", "time slot"],
      "form-builder": ["form", "survey", "questionnaire", "input field", "submission", "response"],
      "email-marketing": ["email campaign", "newsletter", "subscriber", "mailing list", "drip", "broadcast"],
      "no-code-builder": ["no-code", "drag and drop", "builder", "template", "visual editor", "widget"],
      "social-media-tool": ["social media", "post scheduler", "content calendar", "twitter", "linkedin", "instagram"],
      "developer-tool": ["api", "sdk", "deploy", "infrastructure", "git", "ci/cd", "developer", "cli"],
      "design-tool": ["design", "canvas", "prototype", "mockup", "wireframe", "ui kit", "template"],
      "fintech": ["payment", "invoice", "wallet", "banking", "transaction", "transfer", "fintech"],
      "education": ["course", "lesson", "learning", "student", "curriculum", "quiz", "certification"],
      "health-wellness": ["health", "wellness", "fitness", "meditation", "nutrition", "workout", "mental health"],
    };

    const scores = {};
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      scores[category] = keywords.reduce(
        (sum, kw) => sum + (combined.includes(kw) ? 1 : 0),
        0
      );
    }

    const sorted = Object.entries(scores)
      .filter(([, s]) => s > 0)
      .sort((a, b) => b[1] - a[1]);

    return {
      primaryCategory: sorted[0] ? sorted[0][0] : "unknown",
      secondaryCategory: sorted[1] ? sorted[1][0] : null,
      categoryScores: Object.fromEntries(sorted.slice(0, 5)),
    };
  }

  function extractAll() {
    return {
      url: window.location.href,
      platform: detectPlatform(),
      timestamp: Date.now(),
      meta: extractMeta(),
      pricing: extractPricingSignals(),
      features: extractFeatureSignals(),
      tech: extractTechSignals(),
      category: extractCategorySignals(),
      wordCount: (document.body.innerText || "").split(/\s+/).length,
      linkCount: document.querySelectorAll("a[href]").length,
      imageCount: document.querySelectorAll("img").length,
      inputCount: document.querySelectorAll("input, textarea, select").length,
    };
  }

  // Listen for extraction requests from popup/background
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.action === "extract") {
      try {
        const data = extractAll();
        sendResponse({ ok: true, data });
      } catch (err) {
        sendResponse({ ok: false, error: err.message });
      }
    }
    return true; // async response
  });
})();
