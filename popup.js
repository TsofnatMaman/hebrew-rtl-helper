const SETTINGS_KEY = "hebrewRtlHelperSettings";
const SITE_SETTINGS_KEY = "hebrewRtlHelperSites";
const LEGACY_ENABLED_KEY = "hebrewRtlHelperEnabled";

const DEFAULT_SETTINGS = {
  enabled: false,
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

let activeTabId = null;
let activeSiteKey = null;

function normalizeStoredSettings(settings = {}, enabled = false) {
  const { enabled: _ignoredEnabled, ...featureSettings } = settings || {};

  return {
    ...DEFAULT_SETTINGS,
    ...featureSettings,
    enabled: Boolean(enabled)
  };
}

function getSiteKeyFromUrl(url) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol === "file:") return "file://";
    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return parsedUrl.hostname === "localhost" ? parsedUrl.host : parsedUrl.hostname;
    }
  } catch (_error) {
    return null;
  }

  return null;
}

function readControls() {
  return Object.fromEntries(
    Object.entries(controls).map(([key, input]) => {
      return [key, input.checked];
    })
  );
}

function writeControls(settings) {
  for (const [key, input] of Object.entries(controls)) {
    input.checked = Boolean(settings[key]);
  }
}

function setControlsDisabled(disabled) {
  for (const input of Object.values(controls)) {
    input.disabled = disabled;
  }

  applyButton.disabled = disabled;
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

function updateActionState(enabled) {
  if (!activeTabId) return;

  chrome.action.setBadgeText({ tabId: activeTabId, text: enabled ? "" : "OFF" });
  chrome.action.setTitle({
    tabId: activeTabId,
    title: enabled
      ? "Hebrew RTL Helper is on for this site"
      : "Open Hebrew RTL Helper to use it here"
  });

  if (!enabled) {
    chrome.action.setBadgeBackgroundColor({ tabId: activeTabId, color: "#666666" });
  }
}

function saveSettings() {
  if (!activeSiteKey) {
    setStatus("לא זמין בדף הזה");
    return;
  }

  const { enabled, ...featureSettings } = readControls();

  chrome.storage.local.get([SITE_SETTINGS_KEY], (result) => {
    const siteSettings = { ...(result[SITE_SETTINGS_KEY] || {}) };

    if (enabled) {
      siteSettings[activeSiteKey] = true;
    } else {
      delete siteSettings[activeSiteKey];
    }

    chrome.storage.local.set(
      {
        [SETTINGS_KEY]: featureSettings,
        [SITE_SETTINGS_KEY]: siteSettings
      },
      () => {
        chrome.storage.local.remove(LEGACY_ENABLED_KEY);
        updateActionState(enabled);
      }
    );
  });
}

function loadSettings() {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    activeTabId = tab?.id || null;
    activeSiteKey = getSiteKeyFromUrl(tab?.url || "");

    if (!activeSiteKey) {
      writeControls(DEFAULT_SETTINGS);
      setControlsDisabled(true);
      updateActionState(false);
      setStatus("לא זמין בדף הזה");
      return;
    }

    chrome.storage.local.get([SETTINGS_KEY, SITE_SETTINGS_KEY], (result) => {
      const siteSettings = result[SITE_SETTINGS_KEY] || {};
      const enabled = Boolean(siteSettings[activeSiteKey]);
      const settings = normalizeStoredSettings(result[SETTINGS_KEY], enabled);

      setControlsDisabled(false);
      writeControls(settings);
      updateActionState(enabled);
    });
  });
}

function applyToActiveTab() {
  if (!activeTabId) {
    setStatus("לא נמצא טאב פעיל");
    return;
  }

  if (!controls.enabled.checked) {
    setStatus("התוסף כבוי באתר הזה");
    return;
  }

  chrome.tabs.sendMessage(activeTabId, { type: "applyHebrewRtlSettings" }, () => {
    if (chrome.runtime.lastError) {
      setStatus("צריך לרענן את הדף");
      return;
    }

    setStatus("הוחל בדף הזה");
  });
}

for (const input of Object.values(controls)) {
  input.addEventListener("change", saveSettings);
}

applyButton.addEventListener("click", applyToActiveTab);

loadSettings();
