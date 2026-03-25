#!/bin/bash
# run-daily.sh — Full daily update pipeline
#
# 1. Run deep research agent to produce today's brief
# 2. Apply parameter changes
# 3. Re-run sweep
# 4. Commit changes
#
# Usage: bash daily-update/run-daily.sh

set -euo pipefail
cd "$(dirname "$0")/.."

DATE=$(date +%Y-%m-%d)
BRIEF_DIR="daily-update/briefs"
mkdir -p "$BRIEF_DIR"

echo "=== Coalition Simulator Daily Update: $DATE ==="

# Step 1: Research brief
# This step requires a Claude API call or manual input.
# The research prompt is in daily-update/research-prompt.md.
# For now, check if today's brief already exists.
BRIEF="$BRIEF_DIR/$DATE.json"
if [ ! -f "$BRIEF" ]; then
  echo ""
  echo "No brief found for $DATE."
  echo "Generate one by running the research prompt in daily-update/research-prompt.md"
  echo "through a deep research agent, then save the output as:"
  echo "  $BRIEF"
  echo ""
  echo "Alternatively, create a minimal brief:"
  echo '  {"date":"'$DATE'","summary":"No developments","parameterChanges":[],"formateurUpdate":{"appointed":false},"formationStage":"kongerunde"}'
  exit 1
fi

echo "Brief found: $BRIEF"

# Step 2: Apply parameter changes
echo ""
echo "Applying parameter changes..."
node daily-update/apply-update.js "$BRIEF"

# Step 3: Re-run sweep
echo ""
echo "Running sensitivity sweep..."
node sim5-sweep.js --n 150 --output sweep-results.json

# Step 4: Summary
echo ""
echo "=== Update complete for $DATE ==="
echo "Files updated:"
echo "  - sim5-parties.js (parameter changes)"
echo "  - sweep-results.json (fresh sweep)"
echo "  - daily-update/historical/timeseries.json (trendline data)"
echo ""
echo "To deploy: push to GitHub Pages"
