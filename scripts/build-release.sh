#!/usr/bin/env bash
# Builds a universal (arm64 + x86_64), ad-hoc signed 7TV Safari.app and zips it.
# Requires full Xcode. Output: dist/7TV-for-Safari-<version>-macOS.zip (+ SHA256.txt)
set -euo pipefail

VERSION="${1:-$(sed -n 's/.*MARKETING_VERSION = \(.*\);/\1/p' \
  "$(dirname "$0")/../official-project/7TV Safari/7TV Safari.xcodeproj/project.pbxproj" | head -1)}"

HERE="$(cd "$(dirname "$0")/.." && pwd)"
# Build from a neutral path so no local path ends up inside the binaries.
WORK="/private/tmp/sevntv-build"
rm -rf "$WORK" && mkdir -p "$WORK"
cp -R "$HERE/official-project" "$HERE/extension-official" "$WORK/"

cd "$WORK/official-project/7TV Safari"
xcodebuild -project "7TV Safari.xcodeproj" -scheme "7TV Safari" -configuration Release \
  -derivedDataPath "$WORK/DD" ARCHS="arm64 x86_64" ONLY_ACTIVE_ARCH=NO \
  CODE_SIGN_IDENTITY="-" CODE_SIGNING_REQUIRED=NO DEBUG_INFORMATION_FORMAT=dwarf \
  OTHER_SWIFT_FLAGS="-file-prefix-map $WORK=." build

APP="$WORK/DD/Build/Products/Release/7TV Safari.app"
codesign --verify --deep --strict "$APP"

# Fail if the user name or build path leaked into the binaries.
if LC_ALL=C grep -rlaF -e "/Users/$USER" -e "$WORK" "$APP"; then
  echo "error: local path found in build output" >&2; exit 1
fi

OUT="$HERE/dist"; mkdir -p "$OUT"
ZIP="$OUT/7TV-for-Safari-v$VERSION-macOS.zip"
rm -f "$ZIP"
ditto -c -k --sequesterRsrc --keepParent "$APP" "$ZIP"
(cd "$OUT" && shasum -a 256 "$(basename "$ZIP")" | tee SHA256.txt)
echo "built $ZIP"
