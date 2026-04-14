#!/bin/bash
# run-daily.sh — Daily update pipeline (Frame C)
#
# Given a brief JSON at daily-update/briefs/<date>.json, runs build.js
# in --write mode. That regenerates the per-date snapshot, rewrites
# the embedded SNAPSHOT block in sim5-parties.js, runs the seeded
# retrocast to refresh historical/timeseries.json, and updates five
# regions of index.html (TIMELINE_DATA, the "Senest opdateret" date,
# the three data-sourced DEFAULTS, the sliders, and
# controlDefaults.mElTolerate). PRESETS in index.html are untouched.
#
# Usage:
#   bash daily-update/run-daily.sh              # uses today's date
#   bash daily-update/run-daily.sh 2026-04-14   # specific date
#
# Prerequisite: the brief for the target date must already exist at
# daily-update/briefs/<date>.json. Generate one by running a prompt
# from daily-update/research-prompts/ through a deep research agent.

set -euo pipefail
cd "$(dirname "$0")/.."

DATE="${1:-$(date +%Y-%m-%d)}"
BRIEF="daily-update/briefs/$DATE.json"

echo "=== Coalition Simulator Daily Update: $DATE ==="

if [ ! -f "$BRIEF" ]; then
  echo ""
  echo "Brief not found: $BRIEF"
  echo ""
  echo "Generate one by running a prompt from daily-update/research-prompts/"
  echo "through a deep research agent, then save the output as:"
  echo "  $BRIEF"
  exit 1
fi

echo "Brief: $BRIEF"
echo ""

node daily-update/build.js "$BRIEF" --write

echo ""
echo "=== Update complete for $DATE ==="
echo "Review changes with: git diff"
echo "Deploy with: git commit && git push"
