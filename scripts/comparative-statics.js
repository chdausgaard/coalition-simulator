#!/usr/bin/env node
// Phase 3B: Comparative statics check
// Sweeps each dashboard slider across 5 values, reports top-5 coalition
// distribution at each value, and flags non-monotonic or counterintuitive
// responses.
//
// READ-ONLY diagnostic -- does not modify the engine.
// Usage: node scripts/comparative-statics.js

const path = require("path");
const fs = require("fs");

const PROJECT = path.join(__dirname, "..");
const ENGINE_PATH = path.join(PROJECT, "sim5-engine.js");
const N = 3000;

// ── Helpers ────────────────────────────────────────────────────────────

function freshEngine() {
  const toDelete = Object.keys(require.cache).filter(
    k => k.includes("sim5-engine") || k.includes("sim5-parties") || k.includes("sim5-coalitions")
  );
  for (const k of toDelete) delete require.cache[k];
  return require(ENGINE_PATH);
}

function runSim(cfgOverrides) {
  const engine = freshEngine();
  return engine.simulate(cfgOverrides, N);
}

function getTop5(result) {
  return result.topCoalitions.slice(0, 5).map(c => ({
    name: c.govt,
    pct: c.pct,
    avgP: c.avgPPassage
  }));
}

function pad(str, len) {
  str = String(str);
  return str.length >= len ? str : str + " ".repeat(len - str.length);
}

function padLeft(str, len) {
  str = String(str);
  return str.length >= len ? str : " ".repeat(len - str.length) + str;
}

// Markdown table row
function mdRow(cells, widths) {
  return "| " + cells.map((c, i) => pad(String(c), widths[i])).join(" | ") + " |";
}

function mdSep(widths) {
  return "| " + widths.map(w => "-".repeat(w)).join(" | ") + " |";
}

// Check if a specific coalition's share moves monotonically in the
// expected direction across sweep values.
// direction: "up" means share should increase, "down" means decrease.
// Returns { monotonic: bool, values: number[], direction }
function checkMonotonicity(sweepResults, coalitionName, direction) {
  const values = sweepResults.map(sr => {
    const found = sr.top5.find(c => c.name === coalitionName);
    return found ? found.pct : 0;
  });
  let monotonic = true;
  for (let i = 1; i < values.length; i++) {
    if (direction === "up" && values[i] < values[i - 1] - 1.5) monotonic = false;
    if (direction === "down" && values[i] > values[i - 1] + 1.5) monotonic = false;
  }
  return { monotonic, values, direction };
}

// ── Sweep definitions ──────────────────────────────────────────────────

const sweeps = [
  {
    name: "mElTolerate",
    description: "M's tolerance for EL as external support",
    values: [0.0, 0.15, 0.35, 0.50, 0.70],
    defaultIdx: 2,
    cfgKey: "mElTolerate",
    checks: [
      { coalition: "S+M+RV+SF", direction: "up", reason: "Higher M->EL tolerance makes forstaelsespapir more likely, benefiting S+M+RV+SF" },
      { coalition: "S+RV+SF", direction: "down", reason: "S+RV+SF (no M) should become less needed as M tolerates EL" }
    ]
  },
  {
    name: "viabilityThreshold",
    description: "Formateur's minimum acceptable P(passage)",
    values: [0.50, 0.60, 0.70, 0.80, 0.90],
    defaultIdx: 2,
    cfgKey: "viabilityThreshold",
    checks: [
      { coalition: null, direction: "concentrate", reason: "Higher threshold concentrates probability on fewer coalitions" }
    ]
  },
  {
    name: "redPreference",
    description: "Frederiksen's preference for red vs broad",
    values: [0.20, 0.35, 0.50, 0.65, 0.80],
    defaultIdx: 2,
    cfgKey: "redPreference",
    checks: [
      { coalition: "S+RV+SF", direction: "up", reason: "Higher red preference favors pure-red coalitions" },
      { coalition: "S+SF", direction: "up", reason: "Higher red preference favors pure-red coalitions" }
    ]
  },
  {
    name: "mDemandGov",
    description: "M demands government participation",
    values: [true, false],
    defaultIdx: 0,
    cfgKey: "mDemandGov",
    checks: []  // Binary comparison, not monotonicity
  },
  {
    name: "flexibility",
    description: "Base flexibility (dyad acceptance ease)",
    values: [-0.20, -0.10, 0, 0.10, 0.20],
    defaultIdx: 2,
    cfgKey: "flexibility",
    checks: [
      { coalition: null, direction: "broaden", reason: "Higher flexibility should allow broader coalitions to form" }
    ]
  }
];

// ── Run sweeps ─────────────────────────────────────────────────────────

const allResults = [];

for (const sweep of sweeps) {
  console.log(`\n=== ${sweep.name}: ${sweep.description} ===`);
  const sweepData = { name: sweep.name, description: sweep.description, runs: [] };

  for (const val of sweep.values) {
    const label = String(val);
    const isDefault = sweep.values.indexOf(val) === sweep.defaultIdx;
    const cfg = { [sweep.cfgKey]: val };
    process.stdout.write(`  ${sweep.cfgKey}=${label}${isDefault ? " (default)" : ""} ... `);

    const result = runSim(cfg);
    const top5 = getTop5(result);
    const noGov = result.noGovPct;

    console.log(`done (noGov=${noGov}%)`);
    sweepData.runs.push({ value: val, label, isDefault, top5, noGov, result });
  }

  allResults.push(sweepData);
}

// ── Analysis & markdown output ─────────────────────────────────────────

const lines = [];
lines.push("# Comparative Statics: Dashboard Slider Verification");
lines.push("");
lines.push(`Date: ${new Date().toISOString().split("T")[0]}`);
lines.push(`N = ${N} per test point`);
lines.push("");
lines.push("## Summary");
lines.push("");

const verdicts = [];

for (let si = 0; si < sweeps.length; si++) {
  const sweep = sweeps[si];
  const data = allResults[si];

  lines.push(`### ${si + 1}. ${sweep.name} -- ${sweep.description}`);
  lines.push("");

  if (sweep.name === "mDemandGov") {
    // Binary comparison
    lines.push("Binary toggle comparison (true = default vs false):");
    lines.push("");

    for (const run of data.runs) {
      lines.push(`**${sweep.cfgKey} = ${run.label}${run.isDefault ? " (default)" : ""}** (noGov: ${run.noGov}%):`);
      lines.push("");
      const colW = [25, 8, 8];
      lines.push(mdRow(["Coalition", "Share%", "AvgP"], colW));
      lines.push(mdSep(colW));
      for (const c of run.top5) {
        lines.push(mdRow([c.name, c.pct.toFixed(1), c.avgP.toFixed(3)], colW));
      }
      lines.push("");
    }

    // Compare: does mDemandGov=false unlock M-less coalitions?
    const trueRun = data.runs.find(r => r.value === true);
    const falseRun = data.runs.find(r => r.value === false);
    const mLessTrue = trueRun.top5.filter(c => !c.name.includes("M")).reduce((s, c) => s + c.pct, 0);
    const mLessFalse = falseRun.top5.filter(c => !c.name.includes("M")).reduce((s, c) => s + c.pct, 0);

    const mDemandOK = mLessFalse >= mLessTrue - 2;  // M-less should be at least as common
    const verdict = mDemandOK ? "PASS" : "FLAG";
    verdicts.push({ name: sweep.name, verdict, detail: `M-less share: true=${mLessTrue.toFixed(1)}%, false=${mLessFalse.toFixed(1)}%` });

    lines.push(`**Interpretation:** M-less coalition share in top-5: mDemandGov=true -> ${mLessTrue.toFixed(1)}%, mDemandGov=false -> ${mLessFalse.toFixed(1)}%.`);
    if (mDemandOK) {
      lines.push("When M does not demand government participation, M-less coalitions remain at least as viable. **PASS**.");
    } else {
      lines.push("**FLAG**: M-less coalitions unexpectedly decreased when mDemandGov=false.");
    }
    lines.push("");
    continue;
  }

  // Standard sweep: produce a table across values
  // Collect all coalition names that appear in any top-5
  const allNames = new Set();
  for (const run of data.runs) {
    for (const c of run.top5) allNames.add(c.name);
  }
  const nameList = [...allNames];

  // Table: rows = values, columns = coalition shares
  const nameColW = Math.max(12, ...nameList.map(n => n.length + 1));
  const valColW = 8;
  const headerCols = ["Value", ...nameList, "noGov%"];
  const widths = [valColW, ...nameList.map(() => nameColW), 7];

  lines.push(mdRow(headerCols, widths));
  lines.push(mdSep(widths));

  for (const run of data.runs) {
    const valLabel = run.isDefault ? `${run.label}*` : run.label;
    const shares = nameList.map(name => {
      const found = run.top5.find(c => c.name === name);
      return found ? found.pct.toFixed(1) : "--";
    });
    lines.push(mdRow([valLabel, ...shares, run.noGov.toFixed(1)], widths));
  }
  lines.push("");
  lines.push("\\* = default value");
  lines.push("");

  // Monotonicity checks
  if (sweep.checks.length > 0) {
    lines.push("**Monotonicity checks:**");
    lines.push("");
    for (const check of sweep.checks) {
      if (check.coalition) {
        const mono = checkMonotonicity(
          data.runs.map(r => ({ top5: r.top5 })),
          check.coalition,
          check.direction
        );
        const status = mono.monotonic ? "PASS" : "FLAG (non-monotonic)";
        lines.push(`- ${check.coalition} (expected: ${check.direction}): [${mono.values.map(v => v.toFixed(1)).join(", ")}] -- **${status}**`);
        verdicts.push({ name: `${sweep.name} -> ${check.coalition}`, verdict: mono.monotonic ? "PASS" : "FLAG", detail: mono.values.map(v => v.toFixed(1)).join(", ") });
      } else if (check.direction === "concentrate") {
        // Check: top-1 share should increase
        const top1Shares = data.runs.map(r => r.top5.length > 0 ? r.top5[0].pct : 0);
        let concentrating = true;
        for (let i = 1; i < top1Shares.length; i++) {
          if (top1Shares[i] < top1Shares[i - 1] - 3) concentrating = false;
        }
        // Also check: number of distinct coalitions with >5% should decrease
        const countAbove5 = data.runs.map(r => r.top5.filter(c => c.pct > 5).length);
        let narrowing = true;
        for (let i = 1; i < countAbove5.length; i++) {
          if (countAbove5[i] > countAbove5[i - 1] + 1) narrowing = false;
        }
        const concOK = concentrating || narrowing;
        const status = concOK ? "PASS" : "FLAG";
        lines.push(`- Concentration: top-1 share [${top1Shares.map(v => v.toFixed(1)).join(", ")}], coalitions >5% [${countAbove5.join(", ")}] -- **${status}**`);
        verdicts.push({ name: `${sweep.name} -> concentration`, verdict: status, detail: `top1=[${top1Shares.map(v => v.toFixed(1)).join(", ")}]` });
      } else if (check.direction === "broaden") {
        // Check: average coalition size (number of parties in top-1) should increase
        // or: number of distinct coalitions with >5% should increase
        const countAbove5 = data.runs.map(r => r.top5.filter(c => c.pct > 5).length);
        const avgParties = data.runs.map(r => {
          if (r.top5.length === 0) return 0;
          return r.top5.reduce((s, c) => s + c.name.split("+").length * c.pct, 0) / r.top5.reduce((s, c) => s + c.pct, 0);
        });
        // Broad check: no strong narrowing at higher flexibility
        let broadening = true;
        for (let i = 1; i < avgParties.length; i++) {
          if (avgParties[i] < avgParties[0] - 0.5) broadening = false;
        }
        const status = broadening ? "PASS" : "FLAG";
        lines.push(`- Broadening: avg coalition parties [${avgParties.map(v => v.toFixed(2)).join(", ")}], coalitions >5% [${countAbove5.join(", ")}] -- **${status}**`);
        verdicts.push({ name: `${sweep.name} -> broadening`, verdict: status, detail: `avgParties=[${avgParties.map(v => v.toFixed(2)).join(", ")}]` });
      }
    }
    lines.push("");
  }

  // Brief interpretation
  lines.push("**Interpretation:**");
  lines.push("");
  if (sweep.name === "mElTolerate") {
    const smsf = data.runs.map(r => {
      const c = r.top5.find(x => x.name === "S+M+RV+SF");
      return c ? c.pct : 0;
    });
    const rising = smsf[smsf.length - 1] > smsf[0];
    lines.push(rising
      ? "S+M+RV+SF share rises with M's EL tolerance as expected: higher tolerance makes the EL forstaelsespapir more likely, which is needed to make this coalition's budget arithmetic work."
      : "S+M+RV+SF does not clearly rise with tolerance. This may indicate that the forstaelsespapir pathway is dominated by other scoring factors at some tolerance levels.");
  } else if (sweep.name === "viabilityThreshold") {
    lines.push("Higher viability thresholds filter out marginal coalitions, concentrating probability mass on the top options. Very high thresholds (0.9) may cause noGov spikes if no coalition can clear the bar.");
  } else if (sweep.name === "redPreference") {
    lines.push("Frederiksen's red preference directly penalizes broad/centrist coalitions via the bonus function. Pure-red coalitions (S+RV+SF, S+SF) should gain share as redPreference rises, while mixed coalitions (S+M+RV+SF, S+M+RV) should lose share.");
  } else if (sweep.name === "flexibility") {
    lines.push("Flexibility eases the dyad acceptance check, allowing coalitions that would otherwise be blocked by low inGov ratings to form. Higher flexibility should produce more diverse outcomes.");
  }
  lines.push("");
}

// ── Final summary ──────────────────────────────────────────────────────

lines.push("## Overall Verdict");
lines.push("");

const passing = verdicts.filter(v => v.verdict === "PASS");
const flagged = verdicts.filter(v => v.verdict === "FLAG");

lines.push(`**${passing.length}/${verdicts.length}** checks pass.`);
lines.push("");

if (flagged.length > 0) {
  lines.push("### Flagged issues:");
  lines.push("");
  for (const f of flagged) {
    lines.push(`- **${f.name}**: ${f.detail}`);
  }
} else {
  lines.push("All dashboard sliders produce sensible, monotonic gradients in the expected direction. No flags.");
}
lines.push("");

const outPath = path.join(PROJECT, "research", "comparative-statics.md");
fs.writeFileSync(outPath, lines.join("\n"));
console.log(`\nResults written to ${outPath}`);
console.log(`\nVerdict: ${passing.length}/${verdicts.length} PASS, ${flagged.length} FLAG`);
