#!/bin/sh
set -e

if [ -f yarn.lock ]; then
    echo "Installing dependencies with Yarn..."
    yarn --frozen-lockfile
elif [ -f package-lock.json ]; then
    echo "Installing dependencies with NPM..."
    npm ci
elif [ -f pnpm-lock.yaml ]; then
    echo "Installing dependencies with PNPM..."
    pnpm i --frozen-lockfile
else
    echo "Lockfile not found."
    exit 1
fi

