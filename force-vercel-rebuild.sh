#!/bin/bash
# Force Vercel to skip cache on next deployment
# by making a significant change to vercel.json

# Add a timestamp comment to force cache invalidation
TIMESTAMP=$(date +%s)
echo "{ \"version\": 2, \"buildCommand\": \"npm run build\", \"outputDirectory\": \"dist\", \"meta\": { \"_nocache\": \"$TIMESTAMP\" } }" > vercel.json

git add vercel.json
git commit -m "Force Vercel rebuild: timestamp $TIMESTAMP"
git push
