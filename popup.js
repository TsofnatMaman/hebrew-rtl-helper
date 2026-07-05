const SETTINGS_KEY = "hebrewRtlHelperSettings";
const LEGACY_ENABLED_KEY = "hebrewRtlHelperEnabled";

const DEFAULT_SETTINGS = {
  enabled: true,
  direction: true,
  markdown: true,
  font: true,
  spacing: true
};

const controls = {
  enabled: document.getElementById("enabled"),
  direction: document.getElementById("direction"),
  markdown: document.getElementById("markdown"),
  font: document.getElementById("font"),
  spacing: document.getElementById("spacing")
};

const applyButton = document.getElementById("apply");
const statusElement = document.getElementById("status");

function normalizeSettings(settings = {}) {
  return {
    ...DEFAULT_SETTINGS,
    ...settings
  };
}

function readControls() {
  return Object.fromEntries(
    Object.entries(controls).map(([key, input]) => {
      return [key, input.checked];
    })
  );
}

function writeControls(settings) {
  const normalizedSettings = normalizeSettings(settings);

  for (const [key, input] of Object.entries(controls)) {
    input.checked = Boolean(normalizedSettings[key]);
  }
}

function setStatus(text) {
  statusElement.textContent = text;

  if (!text) return;

  setTimeout(() => {
    if (statusElement.textContent === text) {
      statusElement.textContent = "";
    }
  }, 1600);
}

function saveSettings() {
  chrome.storage.local.set({
    [SETTINGS_KEY]: readControls()
  });
  chrome.storage.local.remove(LEGACY_ENABLED_KEY);
}

function loadSettings() {
  chrome.storage.local.get([SETTINGS_KEY], (result) => {
    writeControls(result[SETTINGS_KEY] || DEFAULT_SETTINGS);
  });
}

function applyToActiveTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab?.id) {
      setStatus("לא נמצא טאב פעיל");
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: "applyHebrewRtlSettings" }, () => {
      if (chrome.runtime.lastError) {
        setStatus("צריך לרענן את הדף");
        return;
      }

      setStatus("הוחל בדף הזה");
    });
  });
}

for (const input of Object.values(controls)) {
  input.addEventListener("change", saveSettings);
}

applyButton.addEventListener("click", applyToActiveTab);

loadSettings();

