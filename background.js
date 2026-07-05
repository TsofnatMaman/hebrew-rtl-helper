const SETTINGS_KEY = "hebrewRtlHelperSettings";
const LEGACY_ENABLED_KEY = "hebrewRtlHelperEnabled";

const DEFAULT_SETTINGS = {
  enabled: true,
  direction: true,
  markdown: true,
  font: true,
  spacing: true
};

function normalizeSettings(settings = {}) {
  return {
    ...DEFAULT_SETTINGS,
    ...settings
  };
}

function getSettings(callback) {
  chrome.storage.local.get([SETTINGS_KEY, LEGACY_ENABLED_KEY], (result) => {
    const storedSettings = result[SETTINGS_KEY];
    const settings = normalizeSettings(storedSettings);

    if (storedSettings === undefined && result[LEGACY_ENABLED_KEY] !== undefined) {
      settings.enabled = Boolean(result[LEGACY_ENABLED_KEY]);
    }

    callback(settings);
  });
}

function updateActionState(settings) {
  const enabled = normalizeSettings(settings).enabled;

  chrome.action.setBadgeText({ text: enabled ? "" : "OFF" });
  chrome.action.setTitle({
    title: enabled ? "Hebrew RTL Helper is on" : "Hebrew RTL Helper is off"
  });

  if (!enabled) {
    chrome.action.setBadgeBackgroundColor({ color: "#666666" });
  }
}

function ensureDefaultSettings() {
  getSettings((settings) => {
    chrome.storage.local.set({
      [SETTINGS_KEY]: settings
    });
    updateActionState(settings);
  });
}

chrome.runtime.onInstalled.addListener(() => {
  ensureDefaultSettings();
});

chrome.runtime.onStartup.addListener(() => {
  getSettings(updateActionState);
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes[SETTINGS_KEY]) return;

  updateActionState(changes[SETTINGS_KEY].newValue);
});

