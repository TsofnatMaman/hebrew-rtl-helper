# Hebrew RTL Helper

A small Chrome extension that improves Hebrew right-to-left rendering on web pages.

The extension detects Hebrew text in common content elements, applies `dir="rtl"` and `lang="he"` where needed, and improves Hebrew typography without changing code blocks or navigation areas.

## Features

- Detects Hebrew text automatically.
- Applies RTL direction only to relevant text containers.
- Preserves existing `dir` and `lang` attributes.
- Avoids inputs, editable fields, navigation, sidebars, scripts, styles, SVG, and code blocks.
- Improves Hebrew font fallback with Rubik, Heebo, Arial, Noto Sans Hebrew, Segoe UI, and system fonts.
- Can be enabled or disabled globally by clicking the extension icon.

## Install locally

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click **Load unpacked**.
4. Select this project folder.

## Testing

This extension is generic and can run on any web page. Dynamic pages with streamed or frequently updated Hebrew content are useful for validating RTL behavior.
