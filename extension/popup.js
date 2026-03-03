// popup.js — Renders the advisory board analysis in the popup

const $ = (sel) => document.querySelector(sel);
const content = $("#content");

let currentTabId = null;
let currentAnalysis = null;
let currentVision = "";

// ── Boot ──────────────────────────────────────────────────────────────
async function init() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      showError("No active tab found", "Open a prototype URL and try again.");
      return;
    }

    currentTabId = tab.id;
    requestAnalysis();
  } catch (err) {
    showError("Unexpected error", err.message);
  }
}

function requestAnalysis(vision) {
  content.innerHTML = `
    <div class="loading" id="loading">
      <div class="spinner"></div>
      <div class="loading-text">${vision ? "Recalculating with your vision..." : "Analyzing prototype..."}</div>
    </div>
  `;

  chrome.runtime.sendMessage(
    { action: "analyze", tabId: currentTabId, vision: vision || undefined },
    (result) => {
      if (chrome.runtime.lastError) {
        showError("Connection error", chrome.runtime.lastError.message);
        return;
      }
      if (!result || !result.ok) {
        showError(
          "Analysis unavailable",
          result ? result.error : "No response from analyzer.",
          true
        );
        return;
      }
      currentAnalysis = result.analysis;
      currentVision = vision || "";
      render(result.analysis);
    }
  );
}

// ── Error state ───────────────────────────────────────────────────────
function showError(title, msg, showHint) {
  content.innerHTML = `
    <div class="error-state">
      <div class="error-icon">&#9888;</div>
      <div class="error-title">${esc(title)}</div>
      <div class="error-msg">${esc(msg)}</div>
      ${showHint ? `
        <div class="error-hint">
          <strong>Supported platforms:</strong> Lovable, Replit, Vercel, Netlify, Railway, Render, Fly.io, StackBlitz, CodeSandbox, GitHub Pages, Cloudflare Pages, Surge
        </div>
      ` : ""}
    </div>
  `;
}

// ── Main render ───────────────────────────────────────────────────────
function render(a) {
  content.innerHTML = "";

  // Overall score
  content.appendChild(renderScoreSection(a));

  // Prototype description
  content.appendChild(renderPrototypeDescription(a.prototypeDescription));

  // Vision editor
  content.appendChild(renderVisionEditor(a.summary.vision));

  // Revenue projection
  content.appendChild(renderRevenue(a.revenue));

  // ICP — Who is the customer?
  content.appendChild(renderICP(a.icp));

  // Market sizing
  content.appendChild(renderMarketSizing(a.marketSizing));

  // Monetization
  content.appendChild(renderMonetization(a.monetization));

  // Competitive landscape
  content.appendChild(renderCompetitive(a.competitive));

  // Product completeness
  content.appendChild(renderCompleteness(a.completeness));

  // Recommendations
  content.appendChild(renderRecommendations(a.recommendations));

  // Footer
  content.appendChild(renderFooter());
}

// ── Score section ─────────────────────────────────────────────────────
function renderScoreSection(a) {
  const s = a.overallScore;
  const circumference = 2 * Math.PI * 26;
  const offset = circumference - (s.score / 100) * circumference;
  const color = scoreColor(s.score);

  const el = div("score-section");
  el.innerHTML = `
    <div class="score-ring">
      <svg viewBox="0 0 64 64">
        <circle class="score-ring-bg" cx="32" cy="32" r="26"/>
        <circle class="score-ring-fill" cx="32" cy="32" r="26"
          stroke="${color}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}"/>
      </svg>
      <div class="score-ring-text">
        <span class="score-number" style="color:${color}">${s.score}</span>
        <span class="score-grade">${s.grade}</span>
      </div>
    </div>
    <div class="score-details">
      ${a.summary.platform !== "unknown" ? `
        <div class="platform-badge">
          <span class="platform-dot"></span>
          ${esc(a.summary.platform)}
        </div>
      ` : ""}
      <div class="score-label">${esc(s.label)}</div>
      <div class="score-oneliner">${esc(a.summary.oneLiner)}</div>
    </div>
  `;
  return el;
}

// ── Prototype description ─────────────────────────────────────────────
function renderPrototypeDescription(proto) {
  const el = section("What We Found", null);
  let html = `
    <div class="proto-card">
      <div class="proto-title">${esc(proto.title)}</div>
      <div class="proto-pitch">${esc(proto.catchyPitch)}</div>
  `;

  if (proto.techStack.length > 0) {
    html += `<div class="proto-tech">`;
    html += proto.techStack.map((t) => `<span class="tech-pill">${esc(t)}</span>`).join("");
    html += `</div>`;
  }

  html += `
      <div class="proto-stats">
        <span class="proto-stat">${proto.stats.pages} pages</span>
        <span class="proto-stat-sep">&middot;</span>
        <span class="proto-stat">${proto.stats.features} sections</span>
        <span class="proto-stat-sep">&middot;</span>
        <span class="proto-stat">${proto.stats.interactiveElements} inputs</span>
        <span class="proto-stat-sep">&middot;</span>
        <span class="proto-stat">${proto.stats.images} images</span>
      </div>
    </div>
  `;

  el.querySelector(".section-body").innerHTML = html;
  return el;
}

// ── Vision editor ─────────────────────────────────────────────────────
function renderVisionEditor(currentVisionText) {
  const el = section("Your Vision", null);
  const val = currentVisionText || currentVision || "";

  let html = `
    <div class="vision-editor">
      <div class="vision-hint">Describe your product vision — we'll factor it into the score.</div>
      <textarea class="vision-input" id="visionInput" placeholder="e.g. &quot;The Calendly for pet groomers — simple booking for small animal care businesses&quot;" rows="3">${esc(val)}</textarea>
      <button class="vision-btn" id="visionBtn">
        <span class="vision-btn-icon">&#x21BB;</span> Recalculate with vision
      </button>
    </div>
  `;

  el.querySelector(".section-body").innerHTML = html;

  // Attach event after rendering
  setTimeout(() => {
    const btn = document.getElementById("visionBtn");
    const input = document.getElementById("visionInput");
    if (btn && input) {
      btn.addEventListener("click", () => {
        const v = input.value.trim();
        if (v) {
          currentVision = v;
          requestAnalysis(v);
        }
      });
    }
  }, 0);

  return el;
}

// ── Revenue ───────────────────────────────────────────────────────────
function renderRevenue(rev) {
  const el = section("Revenue Projection", null);

  let scenariosHtml = `<div class="revenue-scenarios">`;
  for (const [key, s] of Object.entries(rev.scenarios)) {
    const highlight = key === "realistic" ? " highlight" : "";
    scenariosHtml += `
      <div class="revenue-card${highlight}">
        <div class="revenue-label">${esc(s.label)}</div>
        <div class="revenue-mrr">$${s.mrr.toLocaleString()}</div>
        <div class="revenue-arr">$${s.arr.toLocaleString()}/yr</div>
      </div>
    `;
  }
  scenariosHtml += `</div>`;

  scenariosHtml += `
    <div class="revenue-meta">${esc(rev.timeToRamen)}</div>
    <div class="revenue-meta" style="color:var(--text-muted);margin-top:2px">${esc(rev.benchmarkContext)}</div>
  `;

  el.querySelector(".section-body").innerHTML = scenariosHtml;
  return el;
}

// ── ICP section ───────────────────────────────────────────────────────
function renderICP(icp) {
  const el = section("Ideal Customer Profile", null);
  let html = `
    <div class="icp-card">
      <div class="icp-label">Who should you sell to?</div>
      <div class="icp-profile">${esc(icp.profile)}</div>
      <div class="icp-why-label">Why this ICP?</div>
      <div class="icp-why">${esc(icp.reasoning)}</div>
    </div>
    <div class="icp-signals">
  `;

  for (const signal of icp.signals) {
    html += `
      <div class="signal">
        <span class="signal-dot positive"></span>
        <span>${esc(signal)}</span>
      </div>
    `;
  }

  html += `</div>`;
  el.querySelector(".section-body").innerHTML = html;
  return el;
}

// ── Market sizing ─────────────────────────────────────────────────────
function renderMarketSizing(ms) {
  const el = section("Market Sizing", null);
  let html = `
    <div class="market-sizing-grid">
      <div class="market-size-card tam">
        <div class="ms-label">${esc(ms.tam.label)}</div>
        <div class="ms-value">${esc(ms.tam.value)}</div>
        <div class="ms-desc">${esc(ms.tam.description)}</div>
      </div>
      <div class="market-size-card sam">
        <div class="ms-label">${esc(ms.sam.label)}</div>
        <div class="ms-value">${esc(ms.sam.value)}</div>
        <div class="ms-desc">${esc(ms.sam.description)}</div>
      </div>
      <div class="market-size-card som">
        <div class="ms-label">${esc(ms.som.label)}</div>
        <div class="ms-value">${esc(ms.som.value)}</div>
        <div class="ms-desc">${esc(ms.som.description)}</div>
      </div>
    </div>
    <div class="market-narrative">${esc(ms.narrative)}</div>
  `;

  el.querySelector(".section-body").innerHTML = html;
  return el;
}

// ── Monetization ──────────────────────────────────────────────────────
function renderMonetization(m) {
  const el = section("Monetization", m.score);

  let html = `
    <div class="pricing-box">
      <div class="pricing-row">
        <span class="pricing-key">Suggested model</span>
        <span class="pricing-val">${esc(m.suggestedModel)}</span>
      </div>
      <div class="pricing-row">
        <span class="pricing-key">Sweet spot</span>
        <span class="pricing-val">${esc(m.suggestedPrice)}</span>
      </div>
      <div class="pricing-row">
        <span class="pricing-key">Market range</span>
        <span class="pricing-val">${esc(m.priceRange)}</span>
      </div>
    </div>
  `;

  if (m.detectedPrices && m.detectedPrices.length > 0) {
    html += `<div class="detected-prices">`;
    html += m.detectedPrices.map((p) => `<span class="detected-price">${esc(p)}</span>`).join("");
    html += `</div>`;
  }

  html += renderSignals(m.signals);
  el.querySelector(".section-body").innerHTML = html;
  return el;
}

// ── Competitive ───────────────────────────────────────────────────────
function renderCompetitive(c) {
  const el = section("Competitive Landscape", c.score);
  let html = "";

  if (c.players && c.players.length > 0) {
    html += `<div class="competitor-pills">`;
    html += c.players.map((p) => {
      if (typeof p === "object" && p.url) {
        return `<a class="competitor-pill competitor-link" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.name)}</a>`;
      }
      const name = typeof p === "object" ? p.name : p;
      return `<span class="competitor-pill">${esc(name)}</span>`;
    }).join("");
    html += `</div>`;
  }

  if (c.marketSize !== "N/A") {
    html += `
      <div class="market-info">
        <div class="market-stat"><span>Market: </span><strong>${esc(c.marketSize)}</strong></div>
        <div class="market-stat"><span>Avg pricing: </span><strong>${esc(c.avgPricing || "N/A")}</strong></div>
        <div class="market-stat"><span>Saturation: </span><strong>${esc(c.saturation)}</strong></div>
      </div>
    `;
  }

  if (c.opportunity) {
    html += `<div class="revenue-meta" style="margin-bottom:8px">${esc(c.opportunity)}</div>`;
  }

  html += renderSignals(c.signals);
  el.querySelector(".section-body").innerHTML = html;
  return el;
}

// ── Completeness ──────────────────────────────────────────────────────
function renderCompleteness(c) {
  const el = section("Product Readiness", c.score);
  el.querySelector(".section-body").innerHTML = renderSignals(c.signals);
  return el;
}

// ── Recommendations ───────────────────────────────────────────────────
function renderRecommendations(recs) {
  const el = section("Board Recommendations", null);
  let html = `<div class="recs">`;
  for (const rec of recs) {
    html += `
      <div class="rec priority-${rec.priority}">
        <div class="rec-header">
          <span class="rec-priority">${esc(rec.priority)}</span>
          <span class="rec-area">${esc(rec.area)}</span>
        </div>
        <div class="rec-action">${esc(rec.action)}</div>
        <div class="rec-reasoning">${esc(rec.reasoning)}</div>
      </div>
    `;
  }
  html += `</div>`;
  el.querySelector(".section-body").innerHTML = html;
  return el;
}

// ── Footer ────────────────────────────────────────────────────────────
function renderFooter() {
  const ver = chrome.runtime.getManifest().version;
  const el = div("footer");
  el.innerHTML = `Analysis based on public SaaS benchmarks (OpenView, KeyBanc, ProfitWell). Not financial advice.<br><span class="footer-version">v${ver}</span>`;
  return el;
}

// ── Helpers ───────────────────────────────────────────────────────────
function section(title, score) {
  const el = div("section");
  const scoreBadge = score !== null ? `<span class="section-score ${scoreClass(score)}">${score}/100</span>` : "";
  el.innerHTML = `
    <div class="section-header">
      <span class="section-title">${esc(title)}</span>
      ${scoreBadge}
    </div>
    <div class="section-body"></div>
  `;
  return el;
}

function renderSignals(signals) {
  if (!signals || signals.length === 0) return "";
  let html = `<div class="signals">`;
  for (const s of signals) {
    html += `
      <div class="signal">
        <span class="signal-dot ${s.positive ? "positive" : "negative"}"></span>
        <span>${esc(s.text)}</span>
      </div>
    `;
  }
  html += `</div>`;
  return html;
}

function div(cls) {
  const el = document.createElement("div");
  el.className = cls;
  return el;
}

function scoreColor(score) {
  if (score >= 70) return "var(--accent-green)";
  if (score >= 50) return "var(--accent-blue)";
  if (score >= 30) return "var(--accent-yellow)";
  return "var(--accent-red)";
}

function scoreClass(score) {
  if (score >= 70) return "score-strong";
  if (score >= 50) return "score-promising";
  if (score >= 30) return "score-early";
  return "score-weak";
}

function esc(str) {
  if (!str) return "";
  const d = document.createElement("div");
  d.textContent = String(str);
  return d.innerHTML;
}

// ── Go ────────────────────────────────────────────────────────────────
init();
