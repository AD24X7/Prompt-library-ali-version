// Content script — extracts full page content for AI-powered analysis
// Injected programmatically by the background service worker

(function () {
  "use strict";

  function extractAll() {
    const body = document.body;
    if (!body) return { error: "No page body found" };

    // Full visible text (truncated to keep API costs reasonable)
    const fullText = (body.innerText || "").slice(0, 20000);

    // All headings with hierarchy
    const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4"))
      .slice(0, 50)
      .map((el) => ({ level: el.tagName, text: el.textContent.trim().slice(0, 200) }))
      .filter((h) => h.text.length > 0);

    // Meta tags
    const getMeta = (name) => {
      const el =
        document.querySelector(`meta[name="${name}"]`) ||
        document.querySelector(`meta[property="og:${name}"]`);
      return el ? el.getAttribute("content") || "" : "";
    };

    // Navigation structure
    const navLinks = Array.from(document.querySelectorAll("nav a, nav button, [role='navigation'] a"))
      .slice(0, 30)
      .map((el) => el.textContent.trim())
      .filter((t) => t.length > 0 && t.length < 100);

    // CTAs / buttons
    const buttons = Array.from(
      document.querySelectorAll('button, [role="button"], a.btn, a.button, [class*="cta"], [class*="btn"], input[type="submit"]')
    )
      .slice(0, 30)
      .map((el) => el.textContent.trim())
      .filter((t) => t.length > 0 && t.length < 100);

    // Links (external)
    const links = Array.from(document.querySelectorAll("a[href]"))
      .slice(0, 50)
      .map((a) => ({ text: a.textContent.trim().slice(0, 100), href: a.href }))
      .filter((l) => l.text.length > 0);

    // Images with alt text
    const images = Array.from(document.querySelectorAll("img"))
      .slice(0, 30)
      .map((img) => ({ alt: img.alt || "", src: img.src }))
      .filter((i) => i.alt.length > 0);

    // Forms
    const formCount = Array.from(document.querySelectorAll("form")).length;
    const inputs = Array.from(document.querySelectorAll("input, textarea, select"))
      .slice(0, 30)
      .map((el) => ({
        type: el.type || el.tagName.toLowerCase(),
        placeholder: el.placeholder || "",
        name: el.name || "",
      }));

    // Price mentions
    const priceRegex = /\$\d+(?:\.\d{2})?(?:\s*\/\s*(?:mo|month|year|yr|user|seat))?/gi;
    const priceMatches = fullText.match(priceRegex);
    const prices = priceMatches ? [...new Set(priceMatches)].slice(0, 10) : [];

    // Script/tech hints
    const scripts = Array.from(document.querySelectorAll("script[src]"))
      .map((s) => s.src)
      .join(" ")
      .toLowerCase();
    const stylesheets = Array.from(document.querySelectorAll("link[rel='stylesheet']"))
      .map((l) => l.href)
      .join(" ")
      .toLowerCase();
    const techHints = scripts + " " + stylesheets;

    const tech = [];
    if (techHints.includes("react") || document.querySelector("[data-reactroot], #__next")) tech.push("React");
    if (techHints.includes("vue") || document.querySelector("[data-v-]")) tech.push("Vue");
    if (techHints.includes("svelte")) tech.push("Svelte");
    if (techHints.includes("angular")) tech.push("Angular");
    if (techHints.includes("tailwind")) tech.push("Tailwind");
    if (techHints.includes("stripe")) tech.push("Stripe");
    if (techHints.includes("supabase")) tech.push("Supabase");
    if (techHints.includes("firebase")) tech.push("Firebase");
    if (techHints.includes("clerk")) tech.push("Clerk");
    if (techHints.includes("auth0")) tech.push("Auth0");

    // Detect platform from hostname
    const host = window.location.hostname;
    const platformPatterns = {
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
    let platform = "unknown";
    for (const [name, pattern] of Object.entries(platformPatterns)) {
      if (pattern.test(host)) { platform = name; break; }
    }

    return {
      url: window.location.href,
      platform,
      title: document.title || "",
      metaDescription: getMeta("description"),
      ogTitle: getMeta("title"),
      ogDescription: getMeta("description"),
      ogImage: getMeta("image"),
      fullText,
      headings,
      navLinks,
      buttons,
      links,
      images,
      formCount,
      inputs,
      prices,
      tech,
      stats: {
        wordCount: fullText.split(/\s+/).length,
        linkCount: document.querySelectorAll("a[href]").length,
        imageCount: document.querySelectorAll("img").length,
        inputCount: document.querySelectorAll("input, textarea, select").length,
        headingCount: headings.length,
        buttonCount: buttons.length,
      },
    };
  }

  // Listen for extraction requests
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.action === "extract") {
      try {
        const data = extractAll();
        if (data.error) {
          sendResponse({ ok: false, error: data.error });
        } else {
          sendResponse({ ok: true, data });
        }
      } catch (err) {
        sendResponse({ ok: false, error: err.message });
      }
    }
    return true;
  });
})();
