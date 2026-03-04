// options.js — Settings page for Advisory Board

const $ = (sel) => document.querySelector(sel);

async function loadSettings() {
  const data = await chrome.storage.local.get(["apiKey", "model"]);
  if (data.apiKey) $("#apiKey").value = data.apiKey;
  if (data.model) $("#model").value = data.model;
}

function showStatus(msg, isError) {
  const el = $("#status");
  el.textContent = msg;
  el.className = "status " + (isError ? "error" : "success");
  setTimeout(() => { el.textContent = ""; el.className = "status"; }, 3000);
}

$("#save").addEventListener("click", async () => {
  const apiKey = $("#apiKey").value.trim();
  const model = $("#model").value;

  if (!apiKey) {
    showStatus("API key is required.", true);
    return;
  }

  if (!apiKey.startsWith("sk-ant-")) {
    showStatus("That doesn't look like a valid Anthropic API key.", true);
    return;
  }

  await chrome.storage.local.set({ apiKey, model });
  showStatus("Settings saved!");
});

$("#toggleKey").addEventListener("click", () => {
  const input = $("#apiKey");
  const btn = $("#toggleKey");
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "Hide";
  } else {
    input.type = "password";
    btn.textContent = "Show";
  }
});

loadSettings();
