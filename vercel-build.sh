#!/bin/bash
# Vercel build hook - runs before build
# Forces cache invalidation by updating timestamp files

echo "🔄 Vercel build hook - clearing caches..."
date > /tmp/build-timestamp.txt

# Make sure we're using the freshest code
git fetch --all
git reset --hard origin/main

echo "✅ Build hook complete"
