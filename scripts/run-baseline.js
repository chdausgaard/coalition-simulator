// Run the coalition simulator at high N and save the full result as a baseline.
// Usage: node scripts/run-baseline.js

const path = require("path");
const fs = require("fs");

const engine = require(path.join(__dirname, "..", "sim5-engine.js"));

const N = 10000;
console.log(`Running simulate({}, ${N}) ...`);

const t0 = Date.now();
const result = engine.simulate({}, N);
const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

console.log(`Done in ${elapsed}s.`);

const outPath = path.join(__dirname, "..", "results", "baseline-pre-overhaul.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + "\n");

console.log(`Wrote ${outPath}`);
console.log(`\nTop coalitions:`);
for (const c of result.topCoalitions) {
  const support = c.support.length ? ` (support: ${c.support.join(", ")})` : "";
  const loose = c.looseSupport.length ? ` (loose: ${c.looseSupport.join(", ")})` : "";
  console.log(`  ${c.pct.toFixed(1)}%  ${c.govt}${support}${loose}`);
}
console.log(`\nNo government: ${result.noGovPct.toFixed(1)}%`);
