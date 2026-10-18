#!/usr/bin/env bash
# Rebuilds extension-official/ from the upstream 7TV source.
# Requires: git, node (>=18), yarn 1.x, python3.
set -euo pipefail

UPSTREAM="https://github.com/SevenTV/Extension.git"
COMMIT="69eaa09"   # v3.1.26

HERE="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

git clone --quiet "$UPSTREAM" "$WORK/src"
cd "$WORK/src"
git checkout --quiet "$COMMIT"
git apply "$HERE"/patches/*.patch

yarn install --frozen-lockfile --ignore-engines
NODE_ENV=production yarn run-s \
  build:section:app build:section:background build:section:content build:section:worker

python3 "$HERE/scripts/safari-manifest.py" dist

rm -rf "$HERE/extension-official"
cp -R dist "$HERE/extension-official"
echo "extension-official/ rebuilt from $COMMIT ($(du -sh "$HERE/extension-official" | cut -f1))"
