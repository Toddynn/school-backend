#!/bin/sh
set -e

if [ -f yarn.lock ]; then
    echo "Building with Yarn..."
    yarn run build
elif [ -f package-lock.json ]; then
    echo "Building with NPM..."
    npm run build
elif [ -f pnpm-lock.yaml ]; then
    echo "Building with PNPM..."
    pnpm run build
else
    echo "Lockfile not found."
    exit 1
fi