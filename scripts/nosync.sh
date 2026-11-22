#!/bin/sh
# Keeps node_modules out of iCloud Drive (this repo lives in iCloud Drive).
# npm replaces a symlinked node_modules with a real folder, so run this after `npm install`:
#   npm run nosync
# iCloud ignores any file or folder whose name ends in ".nosync".
if [ -d node_modules ] && [ ! -L node_modules ]; then
  rm -rf node_modules.nosync
  mv node_modules node_modules.nosync
  ln -s node_modules.nosync node_modules
  echo "node_modules moved to node_modules.nosync and linked."
else
  echo "node_modules is already linked (or missing)."
fi
