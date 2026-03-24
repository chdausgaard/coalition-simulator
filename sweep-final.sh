#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

WORKERS=${1:-6}
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TMPDIR="results/sweep-tmp-${TIMESTAMP}"
CONFIGFILE="$TMPDIR/configs.txt"
OUT="results/sweep-${TIMESTAMP}.jsonl"

mkdir -p "$TMPDIR"

echo "Sweep final: workers=$WORKERS, $(date)"
echo "Temp dir: $TMPDIR"

node generate-configs.js > "$CONFIGFILE"
TOTAL=$(wc -l < "$CONFIGFILE" | tr -d ' ')

echo "Total configurations: $TOTAL"
echo ""

cat > "$TMPDIR/_runner.js" << 'RUNNER_EOF'
const { execSync } = require("child_process");
const fs = require("fs");

const lineNum = parseInt(process.argv[2], 10);
const configFile = process.argv[3];
const tmpdir = process.argv[4];

const allLines = fs.readFileSync(configFile, "utf8").split(/\r?\n/).filter(Boolean);
const line = allLines[lineNum - 1];
if (!line) {
  process.stderr.write(`  SKIP: line ${lineNum} not found\n`);
  process.exit(0);
}

const firstSep = line.indexOf("|");
const secondSep = line.indexOf("|", firstSep + 1);
if (firstSep < 0 || secondSep < 0) {
  process.stderr.write(`  FAILED: malformed config line ${lineNum}\n`);
  process.exit(1);
}

const label = line.substring(0, firstSep);
const config = line.substring(firstSep + 1, secondSep);
const nField = line.substring(secondSep + 1);
const N = parseInt(nField, 10);
if (!Number.isFinite(N)) {
  process.stderr.write(`  FAILED: invalid N for ${label}: ${nField}\n`);
  process.exit(1);
}

const safeLabel = label.replace(/[/:+= ]/g, "_");
const outfile = `${tmpdir}/${safeLabel}.json`;

try {
  const result = execSync(`node sim3.js '${config}' ${N}`, {
    encoding: "utf8",
    timeout: 600000,
  });
  const parsed = JSON.parse(result);
  fs.writeFileSync(
    outfile,
    JSON.stringify({ label, config: JSON.parse(config), n: N, output: parsed }) + "\n",
  );
  process.stderr.write(`  Done: ${label} (N=${N})\n`);
} catch (e) {
  fs.writeFileSync(
    outfile,
    JSON.stringify({
      label,
      config: JSON.parse(config),
      n: N,
      output: null,
      error: e.message,
    }) + "\n",
  );
  process.stderr.write(`  FAILED: ${label}: ${e.message}\n`);
}
RUNNER_EOF

echo "Starting $TOTAL runs with $WORKERS parallel workers..."
START=$(date +%s)

seq 1 "$TOTAL" | xargs -P "$WORKERS" -I {} node "$TMPDIR/_runner.js" {} "$CONFIGFILE" "$TMPDIR"

END=$(date +%s)
ELAPSED=$(( END - START ))

echo ""
echo "All runs complete in ${ELAPSED}s ($(( ELAPSED / 60 ))m $(( ELAPSED % 60 ))s)"

echo "Merging results..."
cat "$TMPDIR"/*.json > "$OUT"
LINES=$(wc -l < "$OUT" | tr -d ' ')
echo "Output: $OUT ($LINES runs, $(du -h "$OUT" | cut -f1))"

rm -rf "$TMPDIR"

echo ""
echo "=== SWEEP COMPLETE ==="
echo "Analyze with: node analyze.js $OUT"
