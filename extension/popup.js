// popup.js — Renders the advisory board analysis in the popup

const $ = (sel) => document.querySelector(sel);
const content = $("#content");

// ── Boot ──────────────────────────────────────────────────────────────
async function init() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      showError("No active tab found", "Open a prototype URL and try again.");
      return;
    }

    chrome.runtime.sendMessage({ action: "analyze", tabId: tab.id }, (result) => {
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
      render(result.analysis);
    });
  } catch (err) {
    showError("Unexpected error", err.message);
  }
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

  // Revenue projection
  content.appendChild(renderRevenue(a.revenue));

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
    html += c.players.map((p) => `<span class="competitor-pill">${esc(p)}</span>`).join("");
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
  const el = div("footer");
  el.innerHTML = `Analysis based on public SaaS benchmarks (OpenView, KeyBanc, ProfitWell). Not financial advice.`;
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
