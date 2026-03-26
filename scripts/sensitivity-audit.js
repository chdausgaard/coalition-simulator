#!/usr/bin/env node
// Sensitivity audit: systematically vary each scoring/threshold parameter
// and measure how much the output distribution changes.
//
// READ-ONLY diagnostic — does not modify the engine permanently.
// For hardcoded parameters, creates a temporary copy, patches it, and restores.
//
// Usage: node scripts/sensitivity-audit.js

const path = require("path");
const fs = require("fs");

const PROJECT = path.join(__dirname, "..");
const ENGINE_PATH = path.join(PROJECT, "sim5-engine.js");
const ENGINE_BAK = ENGINE_PATH + ".sensitivity-bak";
const N = 3000;

// ── Helpers ────────────────────────────────────────────────────────

function freshEngine() {
  // Purge cached modules so we get a fresh engine (important after patching)
  const toDelete = Object.keys(require.cache).filter(
    k => k.includes("sim5-engine") || k.includes("sim5-parties") || k.includes("sim5-coalitions")
  );
  for (const k of toDelete) delete require.cache[k];
  return require(ENGINE_PATH);
}

function getTop6(result) {
  // Returns top 6 coalitions as [{name, pct}]
  return result.topCoalitions.slice(0, 6).map(c => ({
    name: c.govt,
    pct: c.pct
  }));
}

function totalAbsDeviation(baseline, varied) {
  // Sum of |varied% - baseline%| across the union of top-6 names
  const baseMap = new Map(baseline.map(c => [c.name, c.pct]));
  const varMap = new Map(varied.map(c => [c.name, c.pct]));
  const allNames = new Set([...baseMap.keys(), ...varMap.keys()]);
  let sum = 0;
  for (const name of allNames) {
    sum += Math.abs((varMap.get(name) || 0) - (baseMap.get(name) || 0));
  }
  return +sum.toFixed(2);
}

function patchEngine(find, replace) {
  const src = fs.readFileSync(ENGINE_PATH, "utf-8");
  if (!src.includes(find)) {
    throw new Error(`Patch target not found in engine: "${find}"`);
  }
  fs.writeFileSync(ENGINE_PATH, src.replace(find, replace));
}

function restoreEngine() {
  fs.copyFileSync(ENGINE_BAK, ENGINE_PATH);
}

function runWithCfg(cfgOverrides) {
  const engine = freshEngine();
  return engine.simulate(cfgOverrides, N);
}

function runWithPatch(find, replace) {
  patchEngine(find, replace);
  try {
    const engine = freshEngine();
    return engine.simulate({}, N);
  } finally {
    restoreEngine();
  }
}

// ── Parameter definitions ──────────────────────────────────────────

// Each entry: { name, type: "cfg"|"patch", values: [...], default, ... }
// For "cfg" type: cfgKey is the key to override
// For "patch" type: find/replaceFn produce the sed-like replacement

const PARAMS = [
  // --- Scoring parameters (cfg-overridable) ---
  {
    name: "passageExponent",
    type: "cfg",
    cfgKey: "passageExponent",
    values: [1.0, 1.5, 2.0, 2.5, 3.0],
    default: 2.0
  },
  {
    name: "distPenalty",
    type: "cfg",
    cfgKey: "distPenalty",
    values: [0.5, 1.0, 1.5, 2.0, 2.5],
    default: 1.5
  },
  {
    name: "mwccFullBonus",
    type: "cfg",
    cfgKey: "mwccFullBonus",
    values: [1.0, 1.08, 1.15, 1.22, 1.30],
    default: 1.15
  },
  // --- Scoring parameters (hardcoded, need patch) ---
  {
    name: "SIZE_PENALTIES[3] (4-party)",
    type: "patch",
    find: "const SIZE_PENALTIES = [1.0, 0.96, 0.90, 0.82];",
    replaceFn: v => `const SIZE_PENALTIES = [1.0, 0.96, 0.90, ${v}];`,
    values: [0.72, 0.78, 0.82, 0.88, 0.95],
    default: 0.82
  },
  {
    name: "flexBonus (<=2 parties)",
    type: "patch",
    find: "if (nGov <= 2) flexBonus = 1.12;",
    replaceFn: v => `if (nGov <= 2) flexBonus = ${v};`,
    values: [1.0, 1.06, 1.12, 1.18, 1.24],
    default: 1.12
  },
  {
    name: "crossBlocPenalty",
    type: "patch",
    find: "const crossBloc = hasRed && hasBlue && seats < 90 ? 0.65 : 1.0;",
    replaceFn: v => `const crossBloc = hasRed && hasBlue && seats < 90 ? ${v} : 1.0;`,
    values: [0.45, 0.55, 0.65, 0.75, 0.85],
    default: 0.65
  },
  // --- Budget vote parameters (hardcoded, need patch) ---
  {
    name: "bloc same-side base rate",
    type: "patch",
    find: "    base = 0.65;\n  } else if (party.bloc === \"swing\" || govSide === \"center\") {\n    base = 0.35;\n  } else {\n    base = 0.05;",
    replaceFn: v => {
      const swing = +(v - 0.30).toFixed(2);
      const opp = +(1.0 - v).toFixed(2);
      return `    base = ${v};\n  } else if (party.bloc === "swing" || govSide === "center") {\n    base = ${swing};\n  } else {\n    base = ${opp}`;
    },
    values: [0.55, 0.60, 0.65, 0.70, 0.75],
    default: 0.65
  },
  {
    name: "EL informal rate",
    type: "patch",
    find: "const informalRate = Math.max(0.15, 0.45 - centristCount * 0.08);",
    replaceFn: v => `const informalRate = Math.max(0.15, ${v} - centristCount * 0.08);`,
    values: [0.30, 0.38, 0.45, 0.52, 0.60],
    default: 0.45
  },
  {
    name: "EL centrist penalty per partner",
    type: "patch-multi",
    patches: [
      {
        find: "const elForstRate = Math.max(0.50, 0.93 - centristCount * 0.08);",
        replaceFn: v => `const elForstRate = Math.max(0.50, 0.93 - centristCount * ${v});`
      },
      {
        find: "const informalRate = Math.max(0.15, 0.45 - centristCount * 0.08);",
        replaceFn: v => `const informalRate = Math.max(0.15, 0.45 - centristCount * ${v});`
      }
    ],
    values: [0.04, 0.06, 0.08, 0.10, 0.12],
    default: 0.08
  },
  {
    name: "opposition abstention ratio",
    type: "patch",
    // The against share for main opposition: 0.3 means 30:70 against:abstain
    find: "const againstShare = isMainOpposition ? 0.3 : 0.7;",
    replaceFn: v => `const againstShare = isMainOpposition ? ${v} : 0.7;`,
    // 50:50 → 0.5, 40:60 → 0.4, 30:70 → 0.3, 20:80 → 0.2, 10:90 → 0.1
    values: [0.50, 0.40, 0.30, 0.20, 0.10],
    default: 0.30
  },
  {
    name: "cross-bloc rescue base probability",
    type: "patch",
    find: "rescueProbs[vp.id] = Math.min(0.40, Math.max(0.05, 0.25 * avgTol));",
    replaceFn: v => `rescueProbs[vp.id] = Math.min(0.40, Math.max(0.05, ${v} * avgTol));`,
    values: [0.10, 0.18, 0.25, 0.32, 0.40],
    default: 0.25
  },
  // --- Formation parameters (cfg-overridable) ---
  {
    name: "viabilityThreshold",
    type: "cfg",
    cfgKey: "viabilityThreshold",
    values: [0.55, 0.63, 0.70, 0.77, 0.85],
    default: 0.70
  },
  {
    name: "blueViabilityThreshold",
    type: "cfg",
    cfgKey: "blueViabilityThreshold",
    values: [0.05, 0.08, 0.10, 0.15, 0.20],
    default: 0.10
  },
  // --- Dashboard-exposed parameters ---
  {
    name: "mElTolerate",
    type: "cfg",
    cfgKey: "mElTolerate",
    values: [0.10, 0.23, 0.35, 0.47, 0.60],
    default: 0.35
  },
  {
    name: "redPreference",
    type: "cfg",
    cfgKey: "redPreference",
    values: [0.20, 0.35, 0.50, 0.65, 0.80],
    default: 0.50
  }
];

// ── Main ───────────────────────────────────────────────────────────

function main() {
  console.log(`Sensitivity Audit — N=${N} per run`);
  console.log(`Parameters to test: ${PARAMS.length}`);
  console.log(`Total runs: ${PARAMS.length * 5 + 1} (baseline + 5 values each)\n`);

  // Back up the engine
  fs.copyFileSync(ENGINE_PATH, ENGINE_BAK);

  const allResults = [];
  let baseTop6 = [];

  try {
    // 1. Baseline run
    console.log("Running baseline...");
    const t0 = Date.now();
    const baseResult = runWithCfg({});
    baseTop6 = getTop6(baseResult);
    console.log(`  Baseline done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    console.log(`  Top 6: ${baseTop6.map(c => `${c.name}=${c.pct}%`).join(", ")}\n`);

    // 2. For each parameter, run at each value
    for (const param of PARAMS) {
      console.log(`Testing: ${param.name} (default=${param.default})`);
      const paramResults = [];

      for (const val of param.values) {
        const isDefault = Math.abs(val - param.default) < 0.001;
        const label = isDefault ? `${val} (default)` : `${val}`;
        process.stdout.write(`  ${param.name}=${label}... `);

        const t1 = Date.now();
        let result;

        if (param.type === "cfg") {
          result = runWithCfg({ [param.cfgKey]: val });
        } else if (param.type === "patch") {
          if (isDefault) {
            // Use baseline for default value to avoid unnecessary patch
            result = baseResult;
          } else {
            result = runWithPatch(param.find, param.replaceFn(val));
          }
        } else if (param.type === "patch-multi") {
          if (isDefault) {
            result = baseResult;
          } else {
            // Apply all patches
            for (const p of param.patches) {
              patchEngine(p.find, p.replaceFn(val));
            }
            try {
              const engine = freshEngine();
              result = engine.simulate({}, N);
            } finally {
              restoreEngine();
            }
          }
        }

        const top6 = getTop6(result);
        const dev = isDefault ? 0 : totalAbsDeviation(baseTop6, top6);
        const elapsed = ((Date.now() - t1) / 1000).toFixed(1);

        paramResults.push({ value: val, isDefault, top6, deviation: dev });
        console.log(`dev=${dev.toFixed(1)}, ${elapsed}s`);
      }

      // Max deviation across non-default values
      const maxDev = Math.max(...paramResults.filter(r => !r.isDefault).map(r => r.deviation));
      const avgDev = paramResults.filter(r => !r.isDefault).reduce((s, r) => s + r.deviation, 0)
        / paramResults.filter(r => !r.isDefault).length;

      allResults.push({
        name: param.name,
        default: param.default,
        maxDeviation: +maxDev.toFixed(2),
        avgDeviation: +avgDev.toFixed(2),
        runs: paramResults
      });

      console.log(`  → max deviation: ${maxDev.toFixed(2)}, avg deviation: ${avgDev.toFixed(2)}\n`);
    }
  } finally {
    // Always restore the engine
    restoreEngine();
    // Clean up backup
    if (fs.existsSync(ENGINE_BAK)) fs.unlinkSync(ENGINE_BAK);
  }

  // 3. Sort by max deviation
  allResults.sort((a, b) => b.maxDeviation - a.maxDeviation);

  // 4. Write markdown report
  writeReport(allResults, baseTop6);

  // 5. Also save raw JSON
  const jsonPath = path.join(PROJECT, "research", "sensitivity-audit-data.json");
  fs.writeFileSync(jsonPath, JSON.stringify({ N, baseline: baseTop6, parameters: allResults }, null, 2) + "\n");
  console.log(`\nRaw data: ${jsonPath}`);
}

function writeReport(allResults, baseTop6) {
  const lines = [];
  const ln = s => lines.push(s);

  ln("# Sensitivity audit: parameter impact on coalition distribution");
  ln("");
  ln(`*Generated: ${new Date().toISOString().slice(0, 10)}*`);
  ln(`*N = ${N} per run, baseline + 5 values per parameter*`);
  ln("");
  ln("## Baseline distribution (top 6)");
  ln("");
  ln("| Rank | Coalition | % |");
  ln("|------|-----------|---|");
  for (let i = 0; i < baseTop6.length; i++) {
    ln(`| ${i + 1} | ${baseTop6[i].name} | ${baseTop6[i].pct.toFixed(1)} |`);
  }
  ln("");

  ln("---");
  ln("");
  ln("## Ranked parameter impact");
  ln("");
  ln("Total absolute deviation = sum of |varied% - baseline%| across top-6 coalitions.");
  ln("Higher = more impact on the output distribution.");
  ln("");
  ln("| Rank | Parameter | Default | Max deviation | Avg deviation |");
  ln("|------|-----------|---------|---------------|---------------|");
  for (let i = 0; i < allResults.length; i++) {
    const r = allResults[i];
    ln(`| ${i + 1} | ${r.name} | ${r.default} | ${r.maxDeviation.toFixed(1)} | ${r.avgDeviation.toFixed(1)} |`);
  }
  ln("");

  ln("---");
  ln("");
  ln("## Top 5 most impactful parameters: full distributions");
  ln("");

  for (let i = 0; i < Math.min(5, allResults.length); i++) {
    const r = allResults[i];
    ln(`### ${i + 1}. ${r.name} (default = ${r.default})`);
    ln("");
    ln("| Value | " + getUnionNames(r.runs).map(n => n).join(" | ") + " | Deviation |");
    ln("|-------|" + getUnionNames(r.runs).map(() => "---").join("|") + "|-----------|");

    for (const run of r.runs) {
      const nameMap = new Map(run.top6.map(c => [c.name, c.pct]));
      const cells = getUnionNames(r.runs).map(n => {
        const pct = nameMap.get(n);
        return pct != null ? pct.toFixed(1) : "-";
      });
      const marker = run.isDefault ? " **(default)**" : "";
      ln(`| ${run.value}${marker} | ${cells.join(" | ")} | ${run.deviation.toFixed(1)} |`);
    }
    ln("");
  }

  ln("---");
  ln("");
  ln("## Interpretation");
  ln("");

  // Classify parameters
  const loadBearing = allResults.filter(r => r.maxDeviation >= 15);
  const moderate = allResults.filter(r => r.maxDeviation >= 5 && r.maxDeviation < 15);
  const decorative = allResults.filter(r => r.maxDeviation < 5);

  ln("### Load-bearing parameters (max deviation >= 15 pp)");
  ln("");
  if (loadBearing.length === 0) {
    ln("None.");
  } else {
    for (const r of loadBearing) {
      ln(`- **${r.name}** (max dev: ${r.maxDeviation.toFixed(1)}): Substantially reshapes the coalition distribution. Changes here shift which coalition dominates.`);
    }
  }
  ln("");

  ln("### Moderate-impact parameters (5-15 pp)");
  ln("");
  if (moderate.length === 0) {
    ln("None.");
  } else {
    for (const r of moderate) {
      ln(`- **${r.name}** (max dev: ${r.maxDeviation.toFixed(1)}): Meaningful impact. Rebalances relative probabilities among top coalitions.`);
    }
  }
  ln("");

  ln("### Decorative parameters (max deviation < 5 pp)");
  ln("");
  if (decorative.length === 0) {
    ln("None.");
  } else {
    for (const r of decorative) {
      ln(`- **${r.name}** (max dev: ${r.maxDeviation.toFixed(1)}): Minimal impact on output. Could potentially be simplified or removed.`);
    }
  }
  ln("");

  ln("---");
  ln("");
  ln("## Recommendations");
  ln("");
  ln("### Parameters that could be simplified or removed");
  ln("");
  for (const r of decorative) {
    ln(`- **${r.name}**: Max deviation of ${r.maxDeviation.toFixed(1)} pp across the tested range suggests this parameter has negligible effect on coalition probabilities. Could be hardcoded to its default or removed entirely.`);
  }
  ln("");
  ln("### Parameters requiring careful calibration");
  ln("");
  for (const r of loadBearing) {
    ln(`- **${r.name}**: With max deviation of ${r.maxDeviation.toFixed(1)} pp, small miscalibrations here will significantly bias the output. Calibration against historical data is essential.`);
  }
  ln("");

  const outPath = path.join(PROJECT, "research", "sensitivity-audit.md");
  fs.writeFileSync(outPath, lines.join("\n") + "\n");
  console.log(`\nReport written to: ${outPath}`);
}

function getUnionNames(runs) {
  // Union of all coalition names across all runs, ordered by baseline rank
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

main();
