// background.js — Service worker that orchestrates extraction + analysis

importScripts("analysis-engine.js");

let benchmarksData = null;
let competitorsData = null;

// Load bundled data on startup
async function loadData() {
  if (!benchmarksData) {
    const resp1 = await fetch(chrome.runtime.getURL("data/benchmarks.json"));
    benchmarksData = await resp1.json();
  }
  if (!competitorsData) {
    const resp2 = await fetch(chrome.runtime.getURL("data/competitors.json"));
    competitorsData = await resp2.json();
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "analyze") {
    handleAnalyze(msg.tabId, msg.vision)
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ ok: false, error: err.message }));
    return true; // async
  }
});

async function handleAnalyze(tabId, vision) {
  await loadData();

  // First, try to inject content script if not already present
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"],
    });
  } catch (e) {
    // Content script may already be injected via manifest, that's fine
  }

  // Request extraction from content script
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { action: "extract" }, (response) => {
      if (chrome.runtime.lastError) {
        resolve({
          ok: false,
          error: "Could not connect to page. Make sure you're on a prototype URL (Lovable, Replit, Vercel, etc).",
        });
        return;
      }

      if (!response || !response.ok) {
        resolve({
          ok: false,
          error: response ? response.error : "No response from page.",
        });
        return;
      }

      try {
        const analysis = AnalysisEngine.analyze(
          response.data,
          benchmarksData,
          competitorsData,
          vision
        );
        resolve({ ok: true, analysis, rawData: response.data });
      } catch (err) {
        resolve({ ok: false, error: `Analysis failed: ${err.message}` });
      }
    });
  });
}
