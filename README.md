# 7TV for Safari — Twitch only

Unofficial port of the [7TV browser extension](https://github.com/SevenTV/Extension) to **Safari on macOS**, limited to **twitch.tv**. It brings 7TV emotes, the emote menu, chat settings, highlights and layout options to Twitch chat in Safari, with a much smaller footprint than the stock build.

> Not affiliated with 7TV. All 7TV code belongs to its authors and is distributed under the Commons Clause license (see [`LICENSE-7TV.md`](LICENSE-7TV.md)). This repository must not be sold.

## What's included

| Folder | Description |
|---|---|
| `extension-official/` | Build of the official 7TV extension **v3.1.26** (upstream commit `69eaa09`), adapted for Safari. This is what you want. |
| `official-project/` | Xcode project that wraps `extension-official/` as a Safari app extension. |
| `extension-lite/` | Minimal from-scratch alternative (~10 KB): 7TV + BTTV + FFZ emotes only, no settings. |
| `ANALISIS.md` | Notes (in Spanish) on the structure of the official extension. |

## Differences from the official build

- **Twitch only** — YouTube and Kick permissions removed.
- **Lighter:** 14 MB → 2.4 MB. The ~8 MB of emoji SVG sprites that were injected into every page were removed; native Apple emoji are used instead. Onboarding images and source maps were dropped.
- Manifest adapted for Safari (`background.scripts`, no `persistent`, no `default_area`).

## Requirements

- macOS with **Safari 17 or later**
- **Xcode** (full app from the Mac App Store, not just Command Line Tools)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-user>/<this-repo>.git
   cd <this-repo>
   ```
2. **Open the project**
   ```bash
   open "official-project/7TV Safari/7TV Safari.xcodeproj"
   ```
3. **Set your signing identity.** In Xcode, select the project → each of the two targets (*7TV Safari* and *7TV Safari Extension*) → **Signing & Capabilities**:
   - Choose your **Team** (a free Apple ID works).
   - Change the **Bundle Identifier** from `com.example.sevntv` to something unique, e.g. `com.yourname.sevntv`. The extension's identifier must be the app's identifier plus `.Extension`.
   - Also update `extensionBundleIdentifier` in `7TV Safari/ViewController.swift` to match.
4. **Build and run** with **⌘R**. The host app opens; you can close it.
5. **Enable developer mode in Safari** (needed for unsigned/locally signed extensions):
   - Safari → **Settings → Advanced** → check *Show features for web developers*.
   - Menu bar **Develop → Allow Unsigned Extensions** (you'll need to repeat this each time Safari restarts).
6. **Turn the extension on:** Safari → **Settings → Extensions** → tick **7TV**.
7. **Grant website access:** in the same pane, click **Edit Websites…** (or the extension's permission prompt) and set `twitch.tv` to **Allow**. Also allow `7tv.io` if asked.
8. Open any channel on **twitch.tv** and reload. 7TV emotes should render in chat, and the 7TV settings/emote-menu buttons appear near the chat input.

To keep the extension without re-enabling unsigned extensions each launch, archive and sign it with a paid Apple Developer account (Product → Archive).

### Optional: regenerate the project from scratch

```bash
xcrun safari-web-extension-converter extension-official \
  --app-name "7TV Safari" --bundle-identifier com.yourname.sevntv --macos-only
```

## Troubleshooting

| Problem | Fix |
|---|---|
| Extension doesn't appear in Safari | Quit Safari (⌘Q), reopen it, and make sure the host app was run once from Xcode. |
| Appears twice | An old build copy is registered. Remove stale `.app` copies (e.g. in `DerivedData`) and restart Safari. |
| No emotes on Twitch | Check that `twitch.tv` is set to **Allow** and reload. Open Web Inspector (⌥⌘I) and look for errors. |
| "Embedded binary's bundle identifier is not prefixed…" | The extension ID must start with the app ID (`<app-id>.Extension`). |

## Building the official source yourself (optional)

```bash
git clone https://github.com/SevenTV/Extension.git && cd Extension
git checkout 69eaa09
yarn install
NODE_ENV=production yarn run-s build:section:app build:section:background build:section:content build:section:worker
```

Then apply the changes listed under *Differences from the official build*.

## License

7TV code: Commons Clause (see `LICENSE-7TV.md`). Files written for this port (`extension-lite/`, this README, the Xcode wrapper) are provided as-is for personal, non-commercial use.
