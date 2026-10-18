# 7TV Lite (Safari)

A minimal, from-scratch Safari Web Extension (about 6 KB of code, no build step) that replaces text with emotes in Twitch chat.

- Sources: 7TV (global + channel), BetterTTV and FrankerFaceZ (global + channel).
- Priority when names collide: 7TV channel > BTTV channel > FFZ channel > 7TV global > BTTV global > FFZ global.
- Zero-width emotes are stacked on the previous emote.
- No settings UI. For settings, use the official build in `../extension-official`.

Files: `background.js` (message handler), `loader.js` (API loading, shared by background and content script), `content.js` (DOM replacement), `manifest.json`.

To package it, run `xcrun safari-web-extension-converter extension-lite --macos-only` and sign the resulting project as described in the main README.
