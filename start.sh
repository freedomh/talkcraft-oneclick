#!/usr/bin/env sh
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
if ! command -v node >/dev/null 2>&1; then
  echo 'Install Node.js 22+ from https://nodejs.org/ then run this file again.'
  exit 1
fi
exec node scripts/oneclick.mjs "$@"
