# Text Flip Extension

A browser extension that toggles alternating flipped text on any page. Even-numbered paragraphs are rotated 180°; odd-numbered paragraphs are right-aligned — creating an interleaved upside-down effect.

## Loading in Firefox

1. Open Firefox and navigate to `about:debugging`
2. Click **This Firefox** in the left sidebar
3. Click **Load Temporary Add-on…**
4. Browse to the extension folder and select `manifest.json`

The extension stays active until Firefox is closed. To make it permanent, the extension would need to be signed via [addons.mozilla.org](https://addons.mozilla.org).

## Loading in Chrome (or Edge)

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer mode** using the toggle in the top-right corner
3. Click **Load unpacked**
4. Select the extension folder (the one containing `manifest.json`)

The extension persists across browser restarts while Developer mode is on.

## Usage

Click the extension icon in the toolbar to open the popup, then toggle the switch to enable or disable the text flip effect on the current page. The state is remembered per-browser-session.
