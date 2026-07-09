const SETTINGS_KEY = "hebrewRtlHelperSettings";
const SITE_SETTINGS_KEY = "hebrewRtlHelperSites";
const LEGACY_ENABLED_KEY = "hebrewRtlHelperEnabled";

const DEFAULT_SETTINGS = {
  direction: true,
  markdown: true,
  font: true,
  spacing: true
};

function ensureDefaultSettings() {
  chrome.storage.local.get([SETTINGS_KEY, SITE_SETTINGS_KEY], (result) => {
    const updates = {};

    if (!result[SETTINGS_KEY]) {
      updates[SETTINGS_KEY] = DEFAULT_SETTINGS;
    }

    if (!result[SITE_SETTINGS_KEY]) {
      updates[SITE_SETTINGS_KEY] = {};
    }

    if (Object.keys(updates).length > 0) {
      chrome.storage.local.set(updates);
    }

    chrome.storage.local.remove(LEGACY_ENABLED_KEY);
  });
}

function setDefaultActionState() {
  chrome.action.setBadgeText({ text: "OFF" });
  chrome.action.setBadgeBackgroundColor({ color: "#666666" });
  chrome.action.setTitle({ title: "Open Hebrew RTL Helper to choose where it runs" });
}

chrome.runtime.onInstalled.addListener(() => {
  ensureDefaultSettings();
  setDefaultActionState();
});

chrome.runtime.onStartup.addListener(() => {
  ensureDefaultSettings();
  setDefaultActionState();
});
