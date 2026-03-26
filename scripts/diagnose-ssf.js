// Diagnostic: why does S+SF (~58 seats, zero historical precedent) reach ~15%?
// Tests five variants to isolate the contribution of parsimony, cross-bloc rescue,
// and passageWeight CI variation.
//
// Usage: node scripts/diagnose-ssf.js

const path = require("path");
const fs = require("fs");

const ENGINE_SRC = path.join(__dirname, "..", "sim5-engine.js");
const DIAG_COPY = path.join(__dirname, "..", "sim5-engine-diag.js");
const N = 5000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function runVariant(label, enginePath, extraParams) {
  // Clear require cache so each variant gets a fresh module
  delete require.cache[require.resolve(enginePath)];
  // Also clear the parties and coalitions caches — the engine IIFE captures
  // them at load time, and we need a clean slate for each variant.
  const partiesPath = path.join(__dirname, "..", "sim5-parties.js");
  const coalitionsPath = path.join(__dirname, "..", "sim5-coalitions.js");
  delete require.cache[require.resolve(partiesPath)];
  delete require.cache[require.resolve(coalitionsPath)];

  const engine = require(enginePath);
  const t0 = Date.now();
  const result = engine.simulate(extraParams || {}, N);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  // Extract top-6 coalitions
  const top6 = result.topCoalitions.slice(0, 6).map(c => ({
    govt: c.govt,
    pct: c.pct,
    avgPPassage: c.avgPPassage,
    support: c.support,
    looseSupport: c.looseSupport
  }));

  // Find S+SF specifically
  const ssf = result.topCoalitions.find(c => c.govt === "S+SF");
  const ssfPct = ssf ? ssf.pct : 0;

  console.log(`\n${"=".repeat(70)}`);
  console.log(`VARIANT: ${label}  (N=${N}, ${elapsed}s)`);
  console.log("=".repeat(70));
  console.log("\nTop-6 coalitions:");
  for (const c of top6) {
    const sup = c.support.length ? `  [forst: ${c.support.join(",")}]` : "";
    const loose = c.looseSupport.length ? `  [loose: ${c.looseSupport.join(",")}]` : "";
    console.log(`  ${c.pct.toFixed(1).padStart(5)}%  ${c.govt}${sup}${loose}  (avgPpass=${c.avgPPassage})`);
  }
  console.log(`\n  S+SF specifically: ${ssfPct.toFixed(1)}%`);

  return { label, ssfPct, top6, elapsed };
}

function makeDiagCopy(transformFn) {
  let src = fs.readFileSync(ENGINE_SRC, "utf-8");
  src = transformFn(src);
  fs.writeFileSync(DIAG_COPY, src);
  return DIAG_COPY;
}

function cleanup() {
  try { fs.unlinkSync(DIAG_COPY); } catch (_) {}
}

// ---------------------------------------------------------------------------
// Variant 1: Current state (baseline)
// ---------------------------------------------------------------------------
const results = [];

console.log("Running S+SF diagnostic (N=" + N + " per variant)...\n");

results.push(runVariant("1. BASELINE (current engine)", ENGINE_SRC));

// ---------------------------------------------------------------------------
// Variant 2: Flat parsimony (all sizes = 1.0)
// ---------------------------------------------------------------------------
makeDiagCopy(src => {
  // Replace the parsimonyValues array so all sizes get 1.0
  return src.replace(
    "const parsimonyValues = [1.15, 1.10, 0.95, 0.85];",
    "const parsimonyValues = [1.0, 1.0, 1.0, 1.0];"
  );
});
results.push(runVariant("2. FLAT PARSIMONY (all 1.0)", DIAG_COPY));
cleanup();

// ---------------------------------------------------------------------------
// Variant 3: No cross-bloc rescue
// ---------------------------------------------------------------------------
makeDiagCopy(src => {
  // Disable rescue by setting the rescue probability to 0 for all candidates.
  // Replace the rescue probability line so it always yields 0.
  return src.replace(
    "rescueProbs[vp.id] = Math.min(0.40, Math.max(0.05, 0.25 * avgTol));",
    "rescueProbs[vp.id] = 0;"
  );
});
results.push(runVariant("3. NO CROSS-BLOC RESCUE", DIAG_COPY));
cleanup();

// ---------------------------------------------------------------------------
// Variant 4: Fixed passageWeight = 0.65 (no CI variation on w)
// ---------------------------------------------------------------------------
// The engine respects cfg.passageWeight when explicitly set, but the simulate()
// loop overrides it with a normDraw per iteration. We need to pass it so the
// CI draw is overridden. Looking at the code:
//   const _iterPassageWeight = Math.max(0.50, Math.min(0.90, normDraw(0.65, 0.08)));
//   const iterCfg = { ...cfg, passageWeight: _iterPassageWeight };
// This always overrides. So we need to patch the engine to skip the CI draw
// when passageWeight is explicitly set by the user.
// Actually, looking more carefully: the CI draw ALWAYS runs (line 937) and
// always overwrites (line 941). So passing passageWeight: 0.65 in userParams
// won't help — the CI draw replaces it. We need a patched engine.
makeDiagCopy(src => {
  // Replace the CI draw line for passageWeight to be a fixed 0.65
  return src.replace(
    "const _iterPassageWeight = Math.max(0.50, Math.min(0.90, normDraw(0.65, 0.08)));",
    "const _iterPassageWeight = 0.65;"
  );
});
results.push(runVariant("4. FIXED passageWeight=0.65 (no CI)", DIAG_COPY));
cleanup();

// ---------------------------------------------------------------------------
// Variant 5: Flat parsimony AND no rescue (both disabled)
// ---------------------------------------------------------------------------
makeDiagCopy(src => {
  src = src.replace(
    "const parsimonyValues = [1.15, 1.10, 0.95, 0.85];",
    "const parsimonyValues = [1.0, 1.0, 1.0, 1.0];"
  );
  src = src.replace(
    "rescueProbs[vp.id] = Math.min(0.40, Math.max(0.05, 0.25 * avgTol));",
    "rescueProbs[vp.id] = 0;"
  );
  return src;
});
results.push(runVariant("5. FLAT PARSIMONY + NO RESCUE", DIAG_COPY));
cleanup();

// ---------------------------------------------------------------------------
// Summary table
// ---------------------------------------------------------------------------
const baseline = results[0].ssfPct;

console.log(`\n${"=".repeat(70)}`);
console.log("SUMMARY: S+SF percentage across variants");
console.log("=".repeat(70));
console.log(`  Baseline S+SF: ${baseline.toFixed(1)}%\n`);

for (let i = 1; i < results.length; i++) {
  const r = results[i];
  const delta = r.ssfPct - baseline;
  const sign = delta >= 0 ? "+" : "";
  console.log(`  ${r.label}`);
  console.log(`    S+SF = ${r.ssfPct.toFixed(1)}%  (${sign}${delta.toFixed(1)}pp from baseline)\n`);
}

// Identify largest single-factor effect
const singleFactors = results.slice(1, 4); // variants 2-4
const deltas = singleFactors.map(r => ({
  label: r.label,
  delta: baseline - r.ssfPct // positive = this factor was inflating S+SF
}));
deltas.sort((a, b) => b.delta - a.delta);

console.log("Single-factor decomposition (pp reduction from baseline):");
for (const d of deltas) {
  console.log(`  ${d.delta.toFixed(1).padStart(5)}pp  ${d.label}`);
}

const combinedDelta = baseline - results[4].ssfPct;
const additivity = deltas[0].delta + deltas[1].delta + deltas[2].delta;
console.log(`\nCombined (parsimony+rescue): ${combinedDelta.toFixed(1)}pp reduction`);
console.log(`Sum of individual factors:   ${additivity.toFixed(1)}pp`);
console.log(`Interaction effect:          ${(combinedDelta - (deltas.find(d => d.label.includes("PARSIMONY") && !d.label.includes("RESCUE")).delta + deltas.find(d => d.label.includes("RESCUE")).delta)).toFixed(1)}pp`);
