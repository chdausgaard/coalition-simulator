// Test different cross-bloc rescue base probabilities.
// Creates temporary copies of sim5-engine.js with modified rescue parameters.
// Usage: node scripts/test-rescue-calibration.js

const path = require("path");
const fs = require("fs");
const os = require("os");

const ROOT = path.join(__dirname, "..");
const ENGINE_SRC = fs.readFileSync(path.join(ROOT, "sim5-engine.js"), "utf8");
const N = 5000;

// ── Helpers ──────────────────────────────────────────────────────────

function makeTempEngine(source) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "rescue-cal-"));
  // Copy dependency files so require() works from the temp dir
  fs.copyFileSync(path.join(ROOT, "sim5-parties.js"), path.join(tmpDir, "sim5-parties.js"));
  fs.copyFileSync(path.join(ROOT, "sim5-coalitions.js"), path.join(tmpDir, "sim5-coalitions.js"));
  const enginePath = path.join(tmpDir, "sim5-engine.js");
  fs.writeFileSync(enginePath, source);
  // Clear require cache so each temp copy loads fresh
  delete require.cache[require.resolve(path.join(ROOT, "sim5-parties.js"))];
  delete require.cache[require.resolve(path.join(ROOT, "sim5-coalitions.js"))];
  // Also clear any cached temp paths
  for (const key of Object.keys(require.cache)) {
    if (key.startsWith(tmpDir)) delete require.cache[key];
  }
  return { tmpDir, enginePath };
}

function loadEngine(enginePath) {
  // Clear cache for this specific path
  delete require.cache[require.resolve(enginePath)];
  return require(enginePath);
}

function cleanupTemp(tmpDir) {
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (_) { /* ignore */ }
}

function extractResults(result) {
  // Top-8 coalitions
  const top8 = result.topCoalitions.slice(0, 8).map(c => ({
    coalition: c.govt,
    pct: c.pct
  }));

  // Find S+SF and S+M+RV+SF specifically
  const allCoalitions = result.topCoalitions;
  const sSF = allCoalitions.find(c => c.govt === "S+SF");
  const sMRVSF = allCoalitions.find(c => c.govt === "S+M+RV+SF" || c.govt === "S+M+SF+RV");

  return {
    top8,
    sSF_pct: sSF ? sSF.pct : 0,
    sMRVSF_pct: sMRVSF ? sMRVSF.pct : 0
  };
}

// ── Fixed-value variants ─────────────────────────────────────────────

function makeFixedSource(rescueBase) {
  // Replace the hardcoded 0.25 in the rescue probability line
  return ENGINE_SRC.replace(
    /rescueProbs\[vp\.id\] = Math\.min\(0\.40, Math\.max\(0\.05, 0\.25 \* avgTol\)\);/,
    `rescueProbs[vp.id] = Math.min(0.40, Math.max(0.05, ${rescueBase} * avgTol));`
  );
}

// ── CI-varied variant ────────────────────────────────────────────────
// Two changes:
//   (a) rescue line reads from cfg.rescueBase || 0.25
//   (b) simulate loop draws rescueBase per iteration and passes via iterCfg

function makeCIVariedSource() {
  let src = ENGINE_SRC;

  // (a) Replace hardcoded 0.25 with cfg.rescueBase || 0.25
  src = src.replace(
    /rescueProbs\[vp\.id\] = Math\.min\(0\.40, Math\.max\(0\.05, 0\.25 \* avgTol\)\);/,
    `rescueProbs[vp.id] = Math.min(0.40, Math.max(0.05, (cfg.rescueBase || 0.25) * avgTol));`
  );

  // (b) In the simulate loop, draw rescueBase per iteration and add to iterCfg.
  // Find the iterCfg line and add rescueBase to it.
  // The line is: const iterCfg = { ...cfg, viabilityThreshold: _iterViability, passageWeight: _iterPassageWeight };
  // We insert a rescueBase draw just before it and include it in iterCfg.
  src = src.replace(
    /const iterCfg = \{ \.\.\.cfg, viabilityThreshold: _iterViability, passageWeight: _iterPassageWeight \};/,
    `const _iterRescueBase = (cfg._rescueMean != null)
        ? Math.min(0.35, Math.max(0.05, normDraw(cfg._rescueMean, cfg._rescueSigma || 0.05)))
        : undefined;
      const iterCfg = { ...cfg, viabilityThreshold: _iterViability, passageWeight: _iterPassageWeight${
        ""
      }${
        ""
      }, ..._iterRescueBase != null ? { rescueBase: _iterRescueBase } : {} };`
  );

  return src;
}

// ── Run all variants ─────────────────────────────────────────────────

const variants = [
  { label: "rescue=0.10 (conservative)", type: "fixed", value: 0.10 },
  { label: "rescue=0.12", type: "fixed", value: 0.12 },
  { label: "rescue=0.15", type: "fixed", value: 0.15 },
  { label: "rescue=0.18", type: "fixed", value: 0.18 },
  { label: "rescue=0.20", type: "fixed", value: 0.20 },
  { label: "rescue=0.25 (current default)", type: "fixed", value: 0.25 },
  { label: "CI-varied N(0.15, 0.05) [0.05,0.35]", type: "ci", mean: 0.15, sigma: 0.05 },
  { label: "CI-varied N(0.18, 0.06) [0.05,0.35]", type: "ci", mean: 0.18, sigma: 0.06 },
];

const allResults = [];

for (const variant of variants) {
  process.stdout.write(`Running: ${variant.label} (N=${N}) ... `);
  const t0 = Date.now();

  let src, cfgOverrides;
  if (variant.type === "fixed") {
    src = makeFixedSource(variant.value);
    cfgOverrides = {};
  } else {
    src = makeCIVariedSource();
    cfgOverrides = { cfg: { _rescueMean: variant.mean, _rescueSigma: variant.sigma } };
  }

  const { tmpDir, enginePath } = makeTempEngine(src);
  try {
    const engine = loadEngine(enginePath);
    const result = engine.simulate(cfgOverrides, N);
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`done in ${elapsed}s`);
    allResults.push({ variant: variant.label, ...extractResults(result) });
  } finally {
    cleanupTemp(tmpDir);
  }
}

// ── Output comparison table ──────────────────────────────────────────

console.log("\n" + "=".repeat(100));
console.log("RESCUE CALIBRATION COMPARISON TABLE");
console.log("=".repeat(100));

// Header: variant names
const colWidth = 14;
const labelWidth = 42;
const header = "Variant".padEnd(labelWidth) + allResults.map(r => r.variant.slice(0, colWidth).padStart(colWidth)).join("");
console.log("\n--- Top-8 Coalition Distribution ---\n");

// Collect all unique coalitions across all runs, ordered by max frequency
const coalitionSet = new Map();
for (const r of allResults) {
  for (const c of r.top8) {
    if (!coalitionSet.has(c.coalition)) coalitionSet.set(c.coalition, 0);
    coalitionSet.set(c.coalition, Math.max(coalitionSet.get(c.coalition), c.pct));
  }
}
const orderedCoalitions = [...coalitionSet.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0]);

// Print table with variant columns
const varLabels = allResults.map(r => {
  // Shorten labels for column headers
  if (r.variant.includes("CI-varied N(0.15")) return "CI .15/.05";
  if (r.variant.includes("CI-varied N(0.18")) return "CI .18/.06";
  const m = r.variant.match(/rescue=([\d.]+)/);
  return m ? `base=${m[1]}` : r.variant.slice(0, colWidth);
});

console.log("Coalition".padEnd(labelWidth) + varLabels.map(l => l.padStart(colWidth)).join(""));
console.log("-".repeat(labelWidth + colWidth * varLabels.length));

for (const coal of orderedCoalitions) {
  const row = coal.padEnd(labelWidth) + allResults.map(r => {
    const entry = r.top8.find(c => c.coalition === coal);
    return entry ? (entry.pct.toFixed(1) + "%").padStart(colWidth) : "-".padStart(colWidth);
  }).join("");
  console.log(row);
}

// Highlighted rows
console.log("\n--- Highlighted Coalitions ---\n");
console.log("Coalition".padEnd(labelWidth) + varLabels.map(l => l.padStart(colWidth)).join(""));
console.log("-".repeat(labelWidth + colWidth * varLabels.length));

const highlightRow = (label, key) => {
  const row = label.padEnd(labelWidth) + allResults.map(r => {
    const val = r[key];
    return (val.toFixed(1) + "%").padStart(colWidth);
  }).join("");
  console.log(row);
};

highlightRow("S+SF", "sSF_pct");
highlightRow("S+M+RV+SF", "sMRVSF_pct");

console.log("\n" + "=".repeat(100));
