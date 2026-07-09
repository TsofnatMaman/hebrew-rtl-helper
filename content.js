(() => {
  const SETTINGS_KEY = "hebrewRtlHelperSettings";
  const SITE_SETTINGS_KEY = "hebrewRtlHelperSites";
  const HEBREW_RE = /[\u0590-\u05FF]/;
  const LRM = "\u200e";

  const DEFAULT_SETTINGS = {
    enabled: false,
    direction: true,
    markdown: true,
    font: true,
    spacing: true
  };

  const TARGET_SELECTOR = [
    "article",
    "section",
    "blockquote",
    "p",
    "li",
    "dd",
    "dt",
    "figcaption",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "div"
  ].join(",");

  const INLINE_CODE_SELECTOR = "code:not(pre code), kbd:not(pre kbd), samp:not(pre samp)";

  const IGNORE_SELECTOR = [
    "aside",
    "nav",
    "[role='navigation']",
    "[data-testid*='sidebar' i]",
    "[class*='sidebar' i]",
    "textarea",
    "input",
    "[contenteditable='true']",
    "pre",
    "code",
    "kbd",
    "samp",
    "script",
    "style",
    "noscript",
    "svg"
  ].join(",");

  let settings = { ...DEFAULT_SETTINGS };

  function normalizeStoredSettings(nextSettings = {}, enabled = false) {
    const { enabled: _ignoredEnabled, ...featureSettings } = nextSettings || {};

    return {
      ...DEFAULT_SETTINGS,
      ...featureSettings,
      enabled: Boolean(enabled)
    };
  }

  function normalizeRuntimeSettings(nextSettings = {}) {
    return {
      ...DEFAULT_SETTINGS,
      ...nextSettings
    };
  }

  function getSiteKey() {
    if (window.location.protocol === "file:") return "file://";
    if (window.location.hostname === "localhost") return window.location.host;
    if (window.location.hostname) return window.location.hostname;

    return null;
  }

  function hasEnabledFeature() {
    return settings.direction || settings.markdown || settings.font || settings.spacing;
  }

  function shouldRun() {
    return settings.enabled && hasEnabledFeature();
  }

  function setRootFlag(name, value) {
    const attributeName = `data-hebrew-rtl-helper-${name}`;

    if (value) {
      document.documentElement.setAttribute(attributeName, "true");
    } else {
      document.documentElement.removeAttribute(attributeName);
    }
  }

  function applyRootSettings() {
    setRootFlag("enabled", settings.enabled);
    setRootFlag("direction", settings.enabled && settings.direction);
    setRootFlag("markdown", settings.enabled && settings.markdown);
    setRootFlag("font", settings.enabled && settings.font);
    setRootFlag("spacing", settings.enabled && settings.spacing);
  }

  function isIgnored(element) {
    return Boolean(element?.closest?.(IGNORE_SELECTOR));
  }

  function hasHebrew(text) {
    return HEBREW_RE.test(text || "");
  }

  function hasDirectHebrewText(element) {
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE && hasHebrew(node.nodeValue)) {
        return true;
      }
    }

    return false;
  }

  function hasHebrewInText(element) {
    return hasHebrew(element.textContent || "");
  }

  function hasNestedTargetWithHebrew(element) {
    return Array.from(element.querySelectorAll?.(TARGET_SELECTOR) || []).some((child) => {
      return child !== element && hasHebrewInText(child);
    });
  }

  function shouldFixElement(element) {
    if (!(element instanceof HTMLElement)) return false;
    if (isIgnored(element)) return false;
    if (!hasHebrewInText(element)) return false;

    if (hasDirectHebrewText(element)) return true;

    if (hasNestedTargetWithHebrew(element)) return false;

    return true;
  }

  function saveOriginalAttributes(element) {
    if (element.dataset.hebrewRtlOriginalDir === undefined) {
      element.dataset.hebrewRtlOriginalDir = element.getAttribute("dir") || "";
    }

    if (element.dataset.hebrewRtlOriginalLang === undefined) {
      element.dataset.hebrewRtlOriginalLang = element.getAttribute("lang") || "";
    }
  }

  function restoreDirectionAttributes(element) {
    const originalDir = element.dataset.hebrewRtlOriginalDir;
    const originalLang = element.dataset.hebrewRtlOriginalLang;

    if (originalDir) {
      element.setAttribute("dir", originalDir);
    } else {
      element.removeAttribute("dir");
    }

    if (originalLang) {
      element.setAttribute("lang", originalLang);
    } else {
      element.removeAttribute("lang");
    }
  }

  function clearElementFix(element) {
    if (
      element.dataset.hebrewRtlOriginalDir !== undefined ||
      element.dataset.hebrewRtlOriginalLang !== undefined
    ) {
      restoreDirectionAttributes(element);
    }
    delete element.dataset.hebrewRtlFixed;
    delete element.dataset.hebrewRtlOriginalDir;
    delete element.dataset.hebrewRtlOriginalLang;
  }

  function saveInlineCodeAttributes(element) {
    if (element.dataset.hebrewRtlInlineOriginalDir === undefined) {
      element.dataset.hebrewRtlInlineOriginalDir = element.getAttribute("dir") || "";
    }

    if (element.dataset.hebrewRtlInlineOriginalLang === undefined) {
      element.dataset.hebrewRtlInlineOriginalLang = element.getAttribute("lang") || "";
    }
  }

  function restoreInlineCodeAttributes(element) {
    const originalDir = element.dataset.hebrewRtlInlineOriginalDir;
    const originalLang = element.dataset.hebrewRtlInlineOriginalLang;

    if (originalDir) {
      element.setAttribute("dir", originalDir);
    } else {
      element.removeAttribute("dir");
    }

    if (originalLang) {
      element.setAttribute("lang", originalLang);
    } else {
      element.removeAttribute("lang");
    }

    delete element.dataset.hebrewRtlInlineCodeFixed;
    delete element.dataset.hebrewRtlInlineOriginalDir;
    delete element.dataset.hebrewRtlInlineOriginalLang;
  }

  function isLrmMarker(node) {
    return node instanceof HTMLElement && node.dataset.hebrewRtlLrmMarker === "true";
  }

  function createLrmMarker() {
    const marker = document.createElement("span");
    marker.textContent = LRM;
    marker.setAttribute("aria-hidden", "true");
    marker.dataset.hebrewRtlLrmMarker = "true";

    return marker;
  }

  function ensureLrmMarkers(element) {
    if (!isLrmMarker(element.previousSibling)) {
      element.before(createLrmMarker());
    }

    if (!isLrmMarker(element.nextSibling)) {
      element.after(createLrmMarker());
    }
  }

  function fixInlineCode(root) {
    const inlineCodeElements = root.querySelectorAll?.(INLINE_CODE_SELECTOR) || [];

    for (const element of inlineCodeElements) {
      saveInlineCodeAttributes(element);
      element.setAttribute("dir", "ltr");
      element.setAttribute("lang", "en");
      element.dataset.hebrewRtlInlineCodeFixed = "true";
      ensureLrmMarkers(element);
    }
  }

  function fixElement(element) {
    if (!shouldRun() || !shouldFixElement(element)) {
      if (element?.dataset?.hebrewRtlFixed === "true") {
        clearElementFix(element);
      }
      return;
    }

    element.dataset.hebrewRtlFixed = "true";

    if (settings.direction) {
      saveOriginalAttributes(element);
      element.setAttribute("dir", "rtl");
      element.setAttribute("lang", "he");
    }

    if (settings.markdown) {
      fixInlineCode(element);
    }
  }

  function getElementRoot(node) {
    if (node instanceof HTMLElement || node instanceof DocumentFragment) {
      if (node.matches?.(INLINE_CODE_SELECTOR)) {
        return node.parentElement || document.body;
      }

      return node;
    }

    if (node instanceof Document) {
      return node.body;
    }

    return node?.parentElement || document.body;
  }

  function scan(root = document.body) {
    if (!root) return;

    if (root instanceof HTMLElement && root.matches(TARGET_SELECTOR)) {
      fixElement(root);
    }

    if (root instanceof HTMLElement || root instanceof DocumentFragment) {
      const elements = root.querySelectorAll?.(TARGET_SELECTOR) || [];
      for (const element of elements) {
        fixElement(element);
      }
    }
  }

  const pendingRoots = new Set();
  let scheduled = false;

  function scheduleScan(root = document.body) {
    if (!shouldRun()) return;

    if (root) {
      pendingRoots.add(root);
    }

    if (scheduled) return;

    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;
      const roots = Array.from(pendingRoots);
      pendingRoots.clear();

      for (const root of roots) {
        scan(root);
      }
    });
  }

  function restoreFixedElements() {
    const markers = document.querySelectorAll("[data-hebrew-rtl-lrm-marker='true']");
    for (const marker of markers) {
      marker.remove();
    }

    const inlineCodeElements = document.querySelectorAll("[data-hebrew-rtl-inline-code-fixed='true']");
    for (const element of inlineCodeElements) {
      restoreInlineCodeAttributes(element);
    }

    const elements = document.querySelectorAll("[data-hebrew-rtl-fixed='true']");
    for (const element of elements) {
      clearElementFix(element);
    }
  }

  function applySettings(nextSettings) {
    settings = normalizeRuntimeSettings(nextSettings);
    applyRootSettings();
    pendingRoots.clear();
    restoreFixedElements();

    if (shouldRun()) {
      scheduleScan(document.body);
    }
  }

  function loadSettings() {
    chrome.storage.local.get([SETTINGS_KEY, SITE_SETTINGS_KEY], (result) => {
      const siteKey = getSiteKey();
      const siteSettings = result[SITE_SETTINGS_KEY] || {};
      const siteEnabled = Boolean(siteKey && siteSettings[siteKey]);
      const nextSettings = normalizeStoredSettings(result[SETTINGS_KEY], siteEnabled);

      applySettings(nextSettings);
    });
  }

  if (!document.body) return;

  loadSettings();

  const observer = new MutationObserver((mutations) => {
    if (!shouldRun()) return;

    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        scheduleScan(getElementRoot(mutation.target.parentElement));
        continue;
      }

      for (const node of mutation.addedNodes) {
        scheduleScan(getElementRoot(node));
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;
    if (!changes[SETTINGS_KEY] && !changes[SITE_SETTINGS_KEY]) return;

    loadSettings();
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "applyHebrewRtlSettings") return false;

    loadSettings();
    sendResponse({ ok: true });
    return false;
  });
})();
