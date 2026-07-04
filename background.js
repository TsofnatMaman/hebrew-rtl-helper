const SETTINGS = {
  enabledKey: "hebrewRtlHelperEnabled"
};

function getEnabled(callback) {
  chrome.storage.local.get({ [SETTINGS.enabledKey]: true }, (result) => {
    callback(Boolean(result[SETTINGS.enabledKey]));
  });
}

function updateActionState(enabled) {
  chrome.action.setBadgeText({ text: enabled ? "" : "OFF" });
  chrome.action.setTitle({
    title: enabled ? "Hebrew RTL Helper is on" : "Hebrew RTL Helper is off"
  });

  if (!enabled) {
    chrome.action.setBadgeBackgroundColor({ color: "#666666" });
  }
}

chrome.runtime.onInstalled.addListener(() => {
  getEnabled(updateActionState);
});

chrome.runtime.onStartup.addListener(() => {
  getEnabled(updateActionState);
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes[SETTINGS.enabledKey]) return;

  updateActionState(Boolean(changes[SETTINGS.enabledKey].newValue));
});

chrome.action.onClicked.addListener(() => {
  getEnabled((enabled) => {
    chrome.storage.local.set({ [SETTINGS.enabledKey]: !enabled });
  });
});
