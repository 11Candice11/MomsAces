#!/bin/sh
# Keeps big generated folders out of iCloud Drive (this repo lives in iCloud Drive).
# iCloud ignores any file or folder whose name ends in ".nosync", so each folder below becomes a
# symlink to "<name>.nosync". npm replaces a symlinked node_modules with a real folder, and
# `expo prebuild --clean` recreates android/, so run this after `npm install` and after prebuild:
#   npm run nosync
set -e

link_nosync() {
  dir="$1"
  if [ -L "$dir" ]; then
    return 0
  fi
  if [ -d "$dir" ]; then
    rm -rf "$dir.nosync"
    mv "$dir" "$dir.nosync"
  else
    mkdir -p "$dir.nosync"
  fi
  ln -s "$(basename "$dir").nosync" "$dir"
  echo "linked $dir -> $dir.nosync"
}

link_nosync node_modules
if [ -d android ]; then
  link_nosync android/.gradle
  link_nosync android/build
  link_nosync android/app/build
  link_nosync android/app/.cxx
fi
