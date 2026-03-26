// Test script: two-factor scoring restructuring experiment
// Compares current multiplicative scoring against passage^w * quality^(1-w)
// Usage: node scripts/test-passage-weight.js

const path = require("path");

// Use the modified engine copy (with two-factor scoreCoalition)
const engine = require(path.join(__dirname, "..", "sim5-engine-test.js"));

const N = 5000;
const TOP_K = 6;

function runAndReport(label, params) {
  const t0 = Date.now();
  const result = engine.simulate(params, N);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  console.log(`\n=== ${label} ===  (${elapsed}s)`);

  const top = result.topCoalitions.slice(0, TOP_K);
  for (const c of top) {
    const support = c.support.length ? ` [forst: ${c.support.join(",")}]` : "";
    console.log(`  ${c.pct.toFixed(1).padStart(5)}%  ${c.govt}${support}`);
  }

  const noGov = result.noGovPct;
  if (noGov > 0) {
    console.log(`  ${noGov.toFixed(1).padStart(5)}%  (no government)`);
  }
}

// --- 1. Current scoring (no passageWeight set -> falls through to original) ---
runAndReport("Current scoring (P(pass)^2 * multiplicative)", {});

// --- 2. Fixed w values ---
const wValues = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

for (const w of wValues) {
  const qualityNote = w === 1.0 ? " (passage only)" : w === 0.5 ? " (quality dominates)" : "";
  runAndReport(`w=${w.toFixed(1)}${qualityNote}`, { passageWeight: w });
}

// --- 3. CI-varied w ~ N(0.85, 0.08) clamped [0.5, 1.0] ---
runAndReport("w=CI-varied N(0.85, 0.08)", {
  passageWeight: 0.85,
  passageWeightSD: 0.08
});
