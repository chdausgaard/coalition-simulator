#!/usr/bin/env bash
# sweep-v2.sh — Parallel parameter sweep for post-election simulator
# Usage: ./sweep-v2.sh [N_PARALLEL]
# Output: results/sweep-data-v2.jsonl (+ timestamped copy)

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUTFILE="results/sweep-v2-${TIMESTAMP}.jsonl"
TMPDIR="results/_tmp-v2-run"
PARALLEL=${1:-8}

mkdir -p results
rm -rf "$TMPDIR"
mkdir -p "$TMPDIR"

echo "=== Post-election sweep: $(date) ==="
echo "Output: $OUTFILE"

# Generate configs (tab-separated: label\tconfig_json\tN)
node generate-configs-v2.js > "$TMPDIR/configs.txt"
TOTAL=$(wc -l < "$TMPDIR/configs.txt" | tr -d ' ')
echo "Total configs: $TOTAL, parallel: $PARALLEL"

# Create runner script (parses tab-separated fields)
cat > "$TMPDIR/runner.sh" << 'RUNNER'
#!/bin/bash
set -euo pipefail
LINE="$1"
TMPDIR="$2"

# Tab-separated: LABEL\tCONFIG\tN
LABEL=$(printf '%s' "$LINE" | cut -f1)
CONFIG=$(printf '%s' "$LINE" | cut -f2)
N=$(printf '%s' "$LINE" | cut -f3)

# Safe filename from label
SAFENAME=$(echo "$LABEL" | tr '|/ ' '___' | tr -cd 'a-zA-Z0-9_+-.')

# Pipe sim output through node to assemble valid JSON (avoids shell argv limits)
node sim4.js "$CONFIG" "$N" 2>/dev/null | node -e "
  const fs = require('fs');
  const label = process.argv[1];
  const config = JSON.parse(process.argv[2]);
  const n = parseInt(process.argv[3]);
  let data = '';
  process.stdin.on('data', d => data += d);
  process.stdin.on('end', () => {
    try {
      const output = JSON.parse(data);
      fs.writeFileSync(process.argv[4], JSON.stringify({label, config, n, output}) + '\n');
      process.stderr.write('  ✓ ' + label + '\n');
    } catch(e) {
      process.stderr.write('  ✗ ' + label + ' (PARSE ERROR)\n');
    }
  });
" "$LABEL" "$CONFIG" "$N" "$TMPDIR/${SAFENAME}.json"
RUNNER
chmod +x "$TMPDIR/runner.sh"

START=$(date +%s)
echo "Starting parallel dispatch..."

# Dispatch in parallel
# xargs -I doesn't handle tabs well, so use a while loop with GNU parallel-style dispatch
# Dispatch in parallel using a job-slot approach compatible with both bash and zsh
PIDS=()
while IFS= read -r line; do
  bash "$TMPDIR/runner.sh" "$line" "$TMPDIR" &
  PIDS+=($!)
  # Throttle: if we've hit the parallel limit, wait for any one to finish
  while [ ${#PIDS[@]} -ge "$PARALLEL" ]; do
    NEWPIDS=()
    for pid in "${PIDS[@]}"; do
      if kill -0 "$pid" 2>/dev/null; then
        NEWPIDS+=("$pid")
      fi
    done
    PIDS=("${NEWPIDS[@]}")
    if [ ${#PIDS[@]} -ge "$PARALLEL" ]; then
      sleep 0.5
    fi
  done
done < "$TMPDIR/configs.txt"
# Wait for remaining
for pid in "${PIDS[@]}"; do
  wait "$pid" 2>/dev/null || true
done

# Concatenate results
echo ""
echo "Merging results..."
RESULT_COUNT=0
> "$OUTFILE"
for f in "$TMPDIR"/*.json; do
  [ -f "$f" ] || continue
  cat "$f" >> "$OUTFILE"
  echo "" >> "$OUTFILE"
  RESULT_COUNT=$((RESULT_COUNT + 1))
done

# Remove blank lines
sed -i '' '/^$/d' "$OUTFILE" 2>/dev/null || sed -i '/^$/d' "$OUTFILE" 2>/dev/null || true

# Copy to canonical path
cp "$OUTFILE" results/sweep-data-v2.jsonl

END=$(date +%s)
ELAPSED=$(( END - START ))
MINUTES=$(( ELAPSED / 60 ))
SECONDS_LEFT=$(( ELAPSED % 60 ))

echo ""
echo "=== Done ==="
echo "  Configs: $RESULT_COUNT / $TOTAL"
echo "  Output: $OUTFILE"
echo "  Canonical: results/sweep-data-v2.jsonl"
echo "  Time: ${MINUTES}m ${SECONDS_LEFT}s"

# Embed into dashboard if it exists
if [ -f "post-election.html" ]; then
  echo "Embedding into dashboard..."
  node embed-data-v2.js
  echo "Dashboard updated: post-election.html"
fi
