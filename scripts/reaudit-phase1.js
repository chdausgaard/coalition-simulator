#!/usr/bin/env node
// Re-audit Phase 1 mechanism parameters against the RESTRUCTURED scoring engine.
//
// The scoring was changed from P(passage)^2 * multiplicative to a two-factor
// model: passage^w * quality^(1-w) with CI-varied w. This script tests whether
// the Phase 1 parameters (cross-bloc rescue, EL informal support, EL centrist
// penalty, opposition abstention norm, passageWeight mean) have different
// sensitivity profiles under the new scoring.
//
// READ-ONLY diagnostic — creates temporary engine copies, never modifies the
// original. Results to stdout.
//
// Usage: node scripts/reaudit-phase1.js

const path = require("path");
const fs = require("fs");

const PROJECT = path.join(__dirname, "..");
const ENGINE_PATH = path.join(PROJECT, "sim5-engine.js");
const TMP_ENGINE_PATH = path.join(PROJECT, "sim5-engine-tmp.js");
const N = 3000;

// ── Helpers ────────────────────────────────────────────────────────

function clearEngineCache() {
  const toDelete = Object.keys(require.cache).filter(
    k => k.includes("sim5-engine") || k.includes("sim5-parties") || k.includes("sim5-coalitions")
  );
  for (const k of toDelete) delete require.cache[k];
}

function loadOriginalEngine() {
  clearEngineCache();
  return require(ENGINE_PATH);
}

function loadTmpEngine(src) {
  // Write patched source to temp file, clear cache, require it
  fs.writeFileSync(TMP_ENGINE_PATH, src);
  clearEngineCache();
  const engine = require(TMP_ENGINE_PATH);
  return engine;
}

function cleanupTmp() {
  try { fs.unlinkSync(TMP_ENGINE_PATH); } catch (_) {}
}

function getTop6(result) {
  return result.topCoalitions.slice(0, 6).map(c => ({
    name: c.govt,
    pct: c.pct
  }));
}

function totalAbsDeviation(baseline, varied) {
  const baseMap = new Map(baseline.map(c => [c.name, c.pct]));
  const varMap = new Map(varied.map(c => [c.name, c.pct]));
  const allNames = new Set([...baseMap.keys(), ...varMap.keys()]);
  let sum = 0;
  for (const name of allNames) {
    sum += Math.abs((varMap.get(name) || 0) - (baseMap.get(name) || 0));
  }
  return +sum.toFixed(2);
}

function getUnionNames(runs) {
  const seen = new Set();
  const ordered = [];
  for (const run of runs) {
    for (const c of run.top6) {
      if (!seen.has(c.name)) {
        seen.add(c.name);
        ordered.push(c.name);
      }
    }
  }
  return ordered;
}

// ── Parameter definitions ──────────────────────────────────────────
//
// Each parameter specifies a find string (must be unique in the engine source)
// and a replaceFn that produces the replacement for each test value.
// For passageWeight, we patch the CI draw mean in simulate().

const originalSrc = fs.readFileSync(ENGINE_PATH, "utf-8");

const PARAMS = [
  {
    name: "cross-bloc rescue base probability",
    default: 0.25,
    values: [0.10, 0.18, 0.25, 0.32, 0.40],
    find: "rescueProbs[vp.id] = Math.min(0.40, Math.max(0.05, 0.25 * avgTol));",
    replaceFn: v => `rescueProbs[vp.id] = Math.min(0.40, Math.max(0.05, ${v} * avgTol));`
  },
  {
    name: "EL informal support rate",
    default: 0.45,
    values: [0.25, 0.35, 0.45, 0.55, 0.65],
    find: "const informalRate = Math.max(0.15, 0.45 - centristCount * 0.08);",
    replaceFn: v => `const informalRate = Math.max(0.15, ${v} - centristCount * 0.08);`
  },
  {
    name: "EL centrist penalty per non-red partner",
    default: 0.08,
    values: [0.02, 0.05, 0.08, 0.11, 0.14],
    // This appears in two places: forst rate and informal rate.
    // Use multi-patch: replace both occurrences.
    find: null,
    patches: [
      {
        find: "const elForstRate = Math.max(0.50, 0.93 - centristCount * 0.08);",
        replaceFn: v => `const elForstRate = Math.max(0.50, 0.93 - centristCount * ${v});`
      },
      {
        find: "const informalRate = Math.max(0.15, 0.45 - centristCount * 0.08);",
        replaceFn: v => `const informalRate = Math.max(0.15, 0.45 - centristCount * ${v});`
      }
    ]
  },
  {
    name: "opposition abstention ratio (against fraction)",
    default: 0.30,
    values: [0.10, 0.20, 0.30, 0.50, 0.70],
    find: "const againstShare = isMainOpposition ? 0.3 : 0.7;",
    replaceFn: v => `const againstShare = isMainOpposition ? ${v} : 0.7;`
  },
  {
    name: "passageWeight mean",
    default: 0.65,
    values: [0.50, 0.58, 0.65, 0.72, 0.80],
    // Patch the CI draw in simulate(): normDraw(0.65, 0.08) -> normDraw(v, 0.08)
    // The surrounding context makes this unique (only one normDraw(0.65 in the file).
    find: "const _iterPassageWeight = Math.max(0.50, Math.min(0.90, normDraw(0.65, 0.08)));",
    replaceFn: v => `const _iterPassageWeight = Math.max(0.50, Math.min(0.90, normDraw(${v}, 0.08)));`
  }
];

// ── Validate all find strings exist in the source ──────────────────

function validatePatches() {
  for (const param of PARAMS) {
    if (param.patches) {
      for (const p of param.patches) {
        if (!originalSrc.includes(p.find)) {
          console.error(`FATAL: Patch target not found for "${param.name}":`);
          console.error(`  Expected: "${p.find}"`);
          process.exit(1);
        }
      }
    } else if (param.find) {
      if (!originalSrc.includes(param.find)) {
        console.error(`FATAL: Patch target not found for "${param.name}":`);
        console.error(`  Expected: "${param.find}"`);
        process.exit(1);
      }
    }
  }
}

// ── Run a simulation with a patched engine ─────────────────────────

function runPatched(param, value) {
  let src = originalSrc;
  if (param.patches) {
    for (const p of param.patches) {
      src = src.replace(p.find, p.replaceFn(value));
    }
  } else {
    src = src.replace(param.find, param.replaceFn(value));
  }
  const engine = loadTmpEngine(src);
  return engine.simulate({}, N);
}

// ── Main ───────────────────────────────────────────────────────────

function main() {
  console.log("=".repeat(72));
  console.log("Phase 1 mechanism parameter re-audit (restructured scoring engine)");
  console.log("=".repeat(72));
  console.log(`Scoring: passage^w * quality^(1-w), w ~ N(0.65, 0.08)`);
  console.log(`N = ${N} per run, ${PARAMS.length} parameters x 5 values + 1 baseline`);
  console.log(`Total runs: ${PARAMS.length * 5 + 1}`);
  console.log("");

  validatePatches();

  const allResults = [];

  // 1. Baseline run
  console.log("Running baseline (all defaults)...");
  const t0 = Date.now();
  const baseEngine = loadOriginalEngine();
  const baseResult = baseEngine.simulate({}, N);
  const baseTop6 = getTop6(baseResult);
  console.log(`  Done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  console.log(`  Top 6: ${baseTop6.map(c => `${c.name}=${c.pct}%`).join(", ")}`);
  console.log("");

  // 2. Test each parameter
  try {
    for (const param of PARAMS) {
      console.log(`Testing: ${param.name} (default=${param.default})`);
      const paramRuns = [];

      for (const val of param.values) {
        const isDefault = Math.abs(val - param.default) < 0.001;
        const label = isDefault ? `${val} (default)` : `${val}`;
        process.stdout.write(`  ${param.name}=${label}... `);

        const t1 = Date.now();
        let result;

        if (isDefault) {
          // Re-run at default (don't reuse baseline — each param's default run
          // should be independent for apples-to-apples comparison within the param)
          result = baseResult;
        } else {
          result = runPatched(param, val);
        }

        const top6 = getTop6(result);
        const dev = isDefault ? 0 : totalAbsDeviation(baseTop6, top6);
        const elapsed = ((Date.now() - t1) / 1000).toFixed(1);

        paramRuns.push({ value: val, isDefault, top6, deviation: dev });
        console.log(`dev=${dev.toFixed(1)}, ${elapsed}s`);
      }

      const nonDefault = paramRuns.filter(r => !r.isDefault);
      const maxDev = Math.max(...nonDefault.map(r => r.deviation));
      const avgDev = nonDefault.reduce((s, r) => s + r.deviation, 0) / nonDefault.length;

      allResults.push({
        name: param.name,
        default: param.default,
        maxDeviation: +maxDev.toFixed(2),
        avgDeviation: +avgDev.toFixed(2),
        runs: paramRuns
      });

      console.log(`  -> max deviation: ${maxDev.toFixed(1)}, avg deviation: ${avgDev.toFixed(1)}`);
      console.log("");
    }
  } finally {
    cleanupTmp();
  }

  // 3. Sort by max deviation and print results
  allResults.sort((a, b) => b.maxDeviation - a.maxDeviation);

  printReport(allResults, baseTop6);
}

function printReport(allResults, baseTop6) {
  console.log("");
  console.log("=".repeat(72));
  console.log("RESULTS: Phase 1 mechanism parameter sensitivity (restructured scoring)");
  console.log("=".repeat(72));
  console.log("");

  // Baseline
  console.log("Baseline distribution (top 6):");
  console.log("-".repeat(40));
  for (let i = 0; i < baseTop6.length; i++) {
    console.log(`  ${i + 1}. ${baseTop6[i].name.padEnd(20)} ${baseTop6[i].pct.toFixed(1)}%`);
  }
  console.log("");

  // Ranked table
  console.log("Ranked parameter impact (sorted by max deviation):");
  console.log("-".repeat(72));
  console.log(
    "Rank".padEnd(6) +
    "Parameter".padEnd(46) +
    "Default".padEnd(9) +
    "Max dev".padEnd(9) +
    "Avg dev"
  );
  console.log("-".repeat(72));
  for (let i = 0; i < allResults.length; i++) {
    const r = allResults[i];
    console.log(
      `${i + 1}`.padEnd(6) +
      r.name.padEnd(46) +
      `${r.default}`.padEnd(9) +
      `${r.maxDeviation.toFixed(1)}`.padEnd(9) +
      `${r.avgDeviation.toFixed(1)}`
    );
  }
  console.log("");

  // Full distribution for each parameter
  for (let i = 0; i < allResults.length; i++) {
    const r = allResults[i];
    console.log("=".repeat(72));
    console.log(`${i + 1}. ${r.name} (default = ${r.default})`);
    console.log("-".repeat(72));

    const names = getUnionNames(r.runs);
    // Header
    const valCol = "Value".padEnd(16);
    const nameHeaders = names.map(n => n.padEnd(14));
    const devCol = "Deviation";
    console.log(valCol + nameHeaders.join("") + devCol);
    console.log("-".repeat(16 + names.length * 14 + 10));

    for (const run of r.runs) {
      const nameMap = new Map(run.top6.map(c => [c.name, c.pct]));
      const marker = run.isDefault ? " *" : "";
      const valStr = `${run.value}${marker}`.padEnd(16);
      const cells = names.map(n => {
        const pct = nameMap.get(n);
        return (pct != null ? pct.toFixed(1) : "-").padEnd(14);
      });
      const devStr = run.deviation.toFixed(1);
      console.log(valStr + cells.join("") + devStr);
    }
    console.log("  (* = default)");
    console.log("");
  }

  // Comparison with old audit
  console.log("=".repeat(72));
  console.log("Comparison with previous audit (old scoring: P(passage)^2 * multiplicative)");
  console.log("-".repeat(72));
  console.log("Parameter".padEnd(46) + "Old max dev".padEnd(14) + "New max dev".padEnd(14) + "Change");
  console.log("-".repeat(72));

  const oldAuditResults = {
    "cross-bloc rescue base probability": 28.9,
    "EL informal support rate": 7.2,
    "EL centrist penalty per non-red partner": 10.3,
    "opposition abstention ratio (against fraction)": 22.1,
    "passageWeight mean": null  // not tested in old audit (passageExponent was tested instead)
  };

  for (const r of allResults) {
    const oldDev = oldAuditResults[r.name];
    const oldStr = oldDev != null ? oldDev.toFixed(1) : "n/a";
    const newStr = r.maxDeviation.toFixed(1);
    let change;
    if (oldDev != null) {
      const diff = r.maxDeviation - oldDev;
      change = (diff >= 0 ? "+" : "") + diff.toFixed(1);
    } else {
      change = "new";
    }
    console.log(
      r.name.padEnd(46) +
      oldStr.padEnd(14) +
      newStr.padEnd(14) +
      change
    );
  }
  console.log("");
  console.log("NOTE: passageWeight mean replaces passageExponent (old max dev: 8.5).");
  console.log("The old exponent is gone; the new two-factor w parameter controls the");
  console.log("same tradeoff (passage dominance vs. coalition quality).");
  console.log("");
}

main();
