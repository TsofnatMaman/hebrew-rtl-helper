<p align="center">
  <img src="icons/icon.png" alt="Hebrew RTL Helper" width="160">
</p>

# Hebrew RTL Helper

[עברית](README.he.md)

A small Chrome extension that improves Hebrew right-to-left rendering on web pages.

The extension detects Hebrew text in common content elements, applies RTL direction when enabled, and can improve Hebrew typography, spacing, and mixed Hebrew-English/code readability.

## Features

- Detects Hebrew text automatically.
- Applies RTL direction only to relevant text containers.
- Preserves existing `dir` and `lang` attributes.
- Avoids inputs, editable fields, navigation, sidebars, scripts, styles, SVG, and code blocks.
- Improves Hebrew font fallback with Segoe UI, Noto Sans Hebrew, Noto Sans, Arial, and system fonts.
- Improves mixed Hebrew-English/code readability with inline-code bidi isolation.
- Opens a branded settings popup from the extension icon.
- Saves user choices with `chrome.storage`.
- Can re-apply fixes to the current page after dynamic page changes or page translation.

## Settings

All options are enabled by default:

- Enabled
- RTL direction
- Markdown/code alignment
- Font override
- Spacing/readability

Tip: after translating a page with Google Translate, click **Apply to this page** again.

## Install locally

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click **Load unpacked**.
4. Select this project folder.

## Testing

This extension is generic and can run on any web page. Dynamic pages with streamed or frequently updated Hebrew content are useful for validating RTL behavior.
