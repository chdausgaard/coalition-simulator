// Phase 3A: Counterfactual robustness testing
// Tests whether the coalition model generalises or is overfit to current arithmetic.
// Usage: node scripts/counterfactual-robustness.js

const path = require("path");
const fs = require("fs");

const engine = require(path.join(__dirname, "..", "sim5-engine.js"));

const N = 5000;

// ── Scenario definitions ────────────────────────────────────────────
// Each scenario overrides specific party mandates. Seats redistributed
// are noted so totals stay constant (175 mainland + 4 NA = 179).

const scenarios = [
  {
    id: "baseline",
    label: "Baseline (current seats)",
    mandateOverrides: {},
    rationale: "Current seat distribution for comparison.",
    expected: null
  },
  {
    id: "weaker_sf",
    label: "Weaker SF (15 instead of 20, +5 to S=43)",
    mandateOverrides: { SF: 15, S: 43 },
    rationale: "SF loses 5 seats to S. Tests whether S+M+RV+SF becomes less likely when SF is smaller and S is stronger.",
    expected: "S+M+RV+SF should decline (SF less necessary). Pure S or S+M+RV should gain."
  },
  {
    id: "stronger_v",
    label: "Stronger V (25 instead of 18, LA=8)",
    mandateOverrides: { V: 25, LA: 8 },
    rationale: "V gains 7 seats from LA (which nearly vanishes). Tests whether blue bloc becomes more viable.",
    expected: "V+KF+LA+M should increase. Blue governments become more plausible."
  },
  {
    id: "weaker_m",
    label: "Weaker M (8 instead of 14, V=24)",
    mandateOverrides: { M: 8, V: 24 },
    rationale: "M loses 6 seats to V. Tests whether M's kingmaker status declines.",
    expected: "M-containing coalitions should decline. S+RV+SF (no M) should gain."
  },
  {
    id: "stronger_el",
    label: "Stronger EL (16 instead of 11, ALT=0)",
    mandateOverrides: { EL: 16, ALT: 0 },
    rationale: "EL gains 5 seats from ALT (eliminated). Tests EL leverage on forstaaelsespapir-dependent coalitions.",
    expected: "Coalitions with EL support should gain. S+RV+SF and S+SF should increase (EL gives them more seats)."
  }
];

// ── Run simulations ─────────────────────────────────────────────────

function formatCoalitionLabel(c) {
  let label = c.govt;
  if (c.support && c.support.length) label += ` [forst: ${c.support.join(",")}]`;
  if (c.looseSupport && c.looseSupport.length) label += ` [loose: ${c.looseSupport.join(",")}]`;
  return label;
}

const results = {};

for (const scenario of scenarios) {
  const t0 = Date.now();
  const result = engine.simulate({ mandateOverrides: scenario.mandateOverrides }, N);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  const top6 = result.topCoalitions.slice(0, 6).map(c => ({
    label: formatCoalitionLabel(c),
    pct: c.pct,
    govt: c.govt,
    support: c.support || [],
    looseSupport: c.looseSupport || []
  }));

  results[scenario.id] = {
    scenario,
    top6,
    noGovPct: result.noGovPct,
    elapsed
  };

  console.log(`${scenario.label}: done in ${elapsed}s`);
  for (const c of top6) {
    console.log(`  ${c.pct.toFixed(1)}%  ${c.label}`);
  }
  console.log(`  No government: ${result.noGovPct.toFixed(1)}%`);
  console.log();
}

// ── Compute deltas vs baseline ──────────────────────────────────────

function buildPctMap(top6) {
  const map = {};
  for (const c of top6) map[c.label] = c.pct;
  return map;
}

const baselineMap = buildPctMap(results.baseline.top6);

// For each counterfactual, compute which coalitions gained/lost
function computeDeltas(scenarioId) {
  const scenarioMap = buildPctMap(results[scenarioId].top6);
  // Union of all coalition labels
  const allLabels = new Set([...Object.keys(baselineMap), ...Object.keys(scenarioMap)]);
  const deltas = [];
  for (const label of allLabels) {
    const base = baselineMap[label] || 0;
    const curr = scenarioMap[label] || 0;
    const delta = curr - base;
    if (Math.abs(delta) >= 0.1 || curr > 0 || base > 0) {
      deltas.push({ label, base, curr, delta });
    }
  }
  deltas.sort((a, b) => b.delta - a.delta);
  return deltas;
}

// ── Generate markdown report ────────────────────────────────────────

let md = `# Counterfactual Robustness Test (Phase 3A)

**Date:** ${new Date().toISOString().slice(0, 10)}
**N per scenario:** ${N}

## Purpose

Test whether the coalition formation model generalises to hypothetical seat
distributions or is overfit to current arithmetic. Four counterfactual scenarios
redistribute seats and check whether coalition probabilities shift in
intuitively expected directions.

---

## Baseline (current seats)

| Rank | Coalition | % |
|------|-----------|---|
`;

for (let i = 0; i < results.baseline.top6.length; i++) {
  const c = results.baseline.top6[i];
  md += `| ${i + 1} | ${c.label} | ${c.pct.toFixed(1)} |\n`;
}
md += `\nNo government: ${results.baseline.noGovPct.toFixed(1)}%\n\n`;

// ── Counterfactual sections ─────────────────────────────────────────

const counterfactualIds = ["weaker_sf", "stronger_v", "weaker_m", "stronger_el"];

for (const id of counterfactualIds) {
  const r = results[id];
  const s = r.scenario;
  const deltas = computeDeltas(id);

  md += `---\n\n## ${s.label}\n\n`;
  md += `**Rationale:** ${s.rationale}\n\n`;
  md += `**Expected:** ${s.expected}\n\n`;

  md += `### Top-6 coalition distribution\n\n`;
  md += `| Rank | Coalition | % |\n`;
  md += `|------|-----------|---|\n`;
  for (let i = 0; i < r.top6.length; i++) {
    const c = r.top6[i];
    md += `| ${i + 1} | ${c.label} | ${c.pct.toFixed(1)} |\n`;
  }
  md += `\nNo government: ${r.noGovPct.toFixed(1)}%\n\n`;

  md += `### Changes vs baseline\n\n`;
  md += `| Coalition | Baseline % | Counterfactual % | Delta |\n`;
  md += `|-----------|-----------|-----------------|-------|\n`;
  for (const d of deltas) {
    const sign = d.delta > 0 ? "+" : "";
    md += `| ${d.label} | ${d.base.toFixed(1)} | ${d.curr.toFixed(1)} | ${sign}${d.delta.toFixed(1)} |\n`;
  }

  // Assessment
  md += `\n### Assessment\n\n`;

  // We'll generate a brief programmatic assessment based on delta patterns
  const gainers = deltas.filter(d => d.delta >= 1.0).map(d => `${d.label} (${d.delta > 0 ? "+" : ""}${d.delta.toFixed(1)}pp)`);
  const losers = deltas.filter(d => d.delta <= -1.0).map(d => `${d.label} (${d.delta.toFixed(1)}pp)`);

  if (gainers.length) {
    md += `**Gained:** ${gainers.join("; ")}\n\n`;
  } else {
    md += `**Gained:** No coalition gained more than 1pp.\n\n`;
  }
  if (losers.length) {
    md += `**Lost:** ${losers.join("; ")}\n\n`;
  } else {
    md += `**Lost:** No coalition lost more than 1pp.\n\n`;
  }

  md += `**Interpretation:** _[see below]_\n\n`;
}

// ── Summary section ─────────────────────────────────────────────────

md += `---\n\n## Summary and interpretation\n\n`;

// Generate per-scenario interpretations by examining actual results
for (const id of counterfactualIds) {
  const r = results[id];
  const s = r.scenario;
  const deltas = computeDeltas(id);

  md += `### ${s.label}\n\n`;
  md += `**Expected:** ${s.expected}\n\n`;

  // Check if expectations were met
  const topGainers = deltas.filter(d => d.delta >= 1.0);
  const topLosers = deltas.filter(d => d.delta <= -1.0);

  md += `**Top gainers (>1pp):** `;
  if (topGainers.length) {
    md += topGainers.map(d => `${d.label} (${d.delta > 0 ? "+" : ""}${d.delta.toFixed(1)}pp)`).join("; ");
  } else {
    md += "None";
  }
  md += "\n\n";

  md += `**Top losers (>1pp):** `;
  if (topLosers.length) {
    md += topLosers.map(d => `${d.label} (${d.delta.toFixed(1)}pp)`).join("; ");
  } else {
    md += "None";
  }
  md += "\n\n";

  // Flag if total shifts are very small (possible insensitivity)
  const maxAbsDelta = Math.max(...deltas.map(d => Math.abs(d.delta)));
  if (maxAbsDelta < 1.0) {
    md += `**FLAG:** Maximum absolute delta is only ${maxAbsDelta.toFixed(1)}pp. The model may be insensitive to this seat redistribution.\n\n`;
  }

  md += "\n";
}

// ── Flags ───────────────────────────────────────────────────────────

md += `## Flags and concerns\n\n`;
md += `_Automatically generated flags based on delta analysis._\n\n`;

let flagCount = 0;
for (const id of counterfactualIds) {
  const r = results[id];
  const deltas = computeDeltas(id);
  const maxAbsDelta = Math.max(...deltas.map(d => Math.abs(d.delta)));

  if (maxAbsDelta < 2.0) {
    flagCount++;
    md += `- **${r.scenario.label}:** Very small response (max delta ${maxAbsDelta.toFixed(1)}pp). Possible model insensitivity.\n`;
  }

  // Check for counterintuitive results: e.g., a coalition gaining when its
  // constituent party lost seats
  if (id === "weaker_sf") {
    // Check if any SF-containing coalition actually gained
    const sfGainers = deltas.filter(d => d.label.includes("SF") && d.delta > 2.0);
    for (const g of sfGainers) {
      flagCount++;
      md += `- **Counterintuitive (${r.scenario.label}):** ${g.label} gained ${g.delta.toFixed(1)}pp despite SF losing seats.\n`;
    }
  }

  if (id === "weaker_m") {
    // Check if M-containing coalitions actually gained
    const mGainers = deltas.filter(d => (d.label.includes("+M+") || d.label.startsWith("M+") || d.label.endsWith("+M")) && d.delta > 2.0);
    for (const g of mGainers) {
      flagCount++;
      md += `- **Counterintuitive (${r.scenario.label}):** ${g.label} gained ${g.delta.toFixed(1)}pp despite M losing seats.\n`;
    }
  }

  if (id === "stronger_v") {
    // Check if blue coalitions actually declined
    const blueVLosers = deltas.filter(d => d.label.includes("V") && d.delta < -2.0);
    for (const l of blueVLosers) {
      flagCount++;
      md += `- **Counterintuitive (${r.scenario.label}):** ${l.label} lost ${Math.abs(l.delta).toFixed(1)}pp despite V gaining seats.\n`;
    }
  }
}

if (flagCount === 0) {
  md += `No flags raised. All scenarios responded in plausible directions.\n`;
}

md += `\n---\n\n_Generated by scripts/counterfactual-robustness.js_\n`;

// ── Write output ────────────────────────────────────────────────────

const outPath = path.join(__dirname, "..", "research", "counterfactual-robustness.md");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, md);
console.log(`\nReport written to ${outPath}`);
