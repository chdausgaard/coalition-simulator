#!/bin/bash
# Run priority configs for live site update (exit-poll baseline)
# Usage: ./run-priority.sh [N_ITERATIONS] [WORKERS]
set -euo pipefail
cd "$(dirname "$0")"

N=${1:-500}
WORKERS=${2:-6}
OUT="results/priority-$(date +%Y%m%d-%H%M%S).jsonl"
TMPDIR="results/_tmp-priority-$$"
mkdir -p "$TMPDIR"

echo "Priority run: N=$N, workers=$WORKERS, output=$OUT"

# Generate all configs, filter to priority labels
node generate-configs.js 2>/dev/null | grep -E "^(baseline|archetype:|red-majority|mDemandGov\+current-polls|M-demands-PM|M->V|M->self|sRelaxPM\+baseline|midten:baseline|baseline\+M->|sf-abstain-sm=|sigmaBloc=[468]|redPref=0\.[258]|naRedShift=|mDemandGov\+redPref|mDemandGov\+sf-abstain|mDemandGov\+blue-surge|mDemandGov\+M->|mDemandGov\+mDemandPM|grid:current-(demandGov|standard|demandPM)-(S|V|self)-r50-s50)" > "$TMPDIR/configs.txt"

# Also add the grid configs that aliases point to
node generate-configs.js 2>/dev/null | grep -E "^grid:(current|red|blue)-(demandGov|standard|demandPM)-(S|V|self)-r(50|80|20)-s50\|" >> "$TMPDIR/configs.txt" || true

# Deduplicate by label
sort -t'|' -k1,1 -u "$TMPDIR/configs.txt" > "$TMPDIR/configs-dedup.txt"
mv "$TMPDIR/configs-dedup.txt" "$TMPDIR/configs.txt"

TOTAL=$(wc -l < "$TMPDIR/configs.txt" | tr -d ' ')
echo "Configs to run: $TOTAL"

# Runner script
cat > "$TMPDIR/_runner.js" << 'RUNNER_EOF'
const { execSync } = require("child_process");
const fs = require("fs");
const lineNum = parseInt(process.argv[2], 10);
const configFile = process.argv[3];
const tmpdir = process.argv[4];
const N = parseInt(process.argv[5], 10) || 500;

const lines = fs.readFileSync(configFile, "utf8").trim().split("\n");
if (lineNum >= lines.length) process.exit(0);
const line = lines[lineNum];
const [label, configJson] = line.split("|");
const config = JSON.parse(configJson);

try {
  const arg = JSON.stringify(config).replace(/'/g, "'\\''");
  const cmd = `node sim3.js '${arg}' ${N}`;
  const result = execSync(cmd, { cwd: process.cwd(), timeout: 120000 }).toString();
  const output = JSON.parse(result);
  const record = { label, config, n: N, output };
  fs.writeFileSync(`${tmpdir}/${lineNum}.jsonl`, JSON.stringify(record) + "\n");
  process.stderr.write(`✓ ${label}\n`);
} catch (e) {
  process.stderr.write(`✗ ${label}: ${e.message}\n`);
}
RUNNER_EOF

# Run in parallel
echo "Running $TOTAL configs with $WORKERS workers..."
seq 0 $((TOTAL - 1)) | xargs -P "$WORKERS" -I{} node "$TMPDIR/_runner.js" {} "$TMPDIR/configs.txt" "$TMPDIR" "$N"

# Concatenate results
cat "$TMPDIR"/*.jsonl > "$OUT" 2>/dev/null || true
DONE=$(wc -l < "$OUT" | tr -d ' ')
echo "Done: $DONE results written to $OUT"

# Merge into sweep-data.jsonl (replace matching labels, keep non-matching)
if [ -f results/sweep-data.jsonl ]; then
  echo "Merging into sweep-data.jsonl..."
  node -e "
    const fs = require('fs');
    const newLines = fs.readFileSync('$OUT','utf8').trim().split('\n');
    const newByLabel = new Map();
    for (const line of newLines) {
      const d = JSON.parse(line);
      newByLabel.set(d.label, line);
    }
    const oldLines = fs.readFileSync('results/sweep-data.jsonl','utf8').trim().split('\n');
    const out = [];
    let replaced = 0;
    for (const line of oldLines) {
      const d = JSON.parse(line);
      if (newByLabel.has(d.label)) {
        out.push(newByLabel.get(d.label));
        newByLabel.delete(d.label);
        replaced++;
      } else {
        out.push(line);
      }
    }
    // Append any new labels not in old data
    for (const line of newByLabel.values()) { out.push(line); }
    fs.writeFileSync('results/sweep-data.jsonl', out.join('\n') + '\n');
    console.log('Replaced ' + replaced + ' entries, added ' + newByLabel.size + ' new');
  "
fi

# Re-embed into HTML
if [ -f embed-data.js ]; then
  echo "Re-embedding data into index.html..."
  node embed-data.js
fi

rm -rf "$TMPDIR"
echo "All done."
