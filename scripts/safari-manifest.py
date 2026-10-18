#!/usr/bin/env python3
"""Adapt the upstream 7TV build output (dist/) for Safari and trim it down.

Usage: safari-manifest.py <dir>
"""
import json
import shutil
import sys
from pathlib import Path

root = Path(sys.argv[1])

# Weight: onboarding images and the emoji sprite sheets (no longer injected).
shutil.rmtree(root / "src", ignore_errors=True)
shutil.rmtree(root / "assets" / "picture", ignore_errors=True)
for sprite in (root / "assets" / "emoji").glob("emojis*.svg"):
    sprite.unlink()
for nightly in (root / "icon").glob("nightly-*"):
    nightly.unlink()

path = root / "manifest.json"
m = json.loads(path.read_text())
m["background"] = {"scripts": ["background.js"]}  # Safari: event page instead of service worker
m["action"].pop("default_area", None)
m["host_permissions"] = [
    "*://*.twitch.tv/*",
    "https://7tv.io/*",
    "https://*.7tv.io/*",
    "https://cdn.7tv.app/*",
    "https://api.betterttv.net/*",
    "https://cdn.betterttv.net/*",
]
m["optional_permissions"] = []
m["optional_host_permissions"] = ["*://*.7tv.app/*", "*://*.7tv.io/*"]  # no YouTube / Kick
for entry in m["web_accessible_resources"]:
    entry["resources"] = [r for r in entry["resources"] if not r.endswith(".map")]
    entry["matches"] = ["*://*.twitch.tv/*"]
path.write_text(json.dumps(m, indent=2) + "\n")
