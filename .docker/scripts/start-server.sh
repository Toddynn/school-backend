#!/bin/sh
set -e

if [ ! -f dist/main.js ]; then
  echo "Error: The file 'dist/main.js' was not found in $(pwd)."
  echo "Check if the 'runner' stage of the Dockerfile copied the files correctly."
  ls -la dist/ 2>/dev/null || ls -la
  exit 1
fi

echo "🚀 Starting application..."

exec node dist/main.js