#!/usr/bin/env node
/**
 * apply-update.js — Apply a daily research brief to sim5-parties.js
 *
 * Reads a JSON research brief (from the deep research agent), applies
 * parameter changes to the party data file, runs a baseline simulation,
 * and appends results to the historical time series.
 *
 * Usage: node daily-update/apply-update.js <brief.json>
 */

const fs = require("fs");
const path = require("path");

const briefPath = process.argv[2];
if (!briefPath) {
  console.error("Usage: node apply-update.js <brief.json>");
  process.exit(1);
}

const brief = JSON.parse(fs.readFileSync(briefPath, "utf8"));
console.log(`Applying brief for ${brief.date}: ${brief.summary}`);

// Read current sim5-parties.js
const partiesPath = path.join(__dirname, "..", "sim5-parties.js");
let partiesSource = fs.readFileSync(partiesPath, "utf8");

// Track changes
const changelog = [];

for (const change of (brief.parameterChanges || [])) {
  const { party, parameter, oldValue, newValue, justification } = change;

  if (parameter === "globalHarshness") {
    // Simple top-level property
    const regex = new RegExp(
      `(const ${party} = \\{[\\s\\S]*?globalHarshness:\\s*)${escapeRegex(String(oldValue))}`,
      "m"
    );
    if (regex.test(partiesSource)) {
      partiesSource = partiesSource.replace(regex, `$1${newValue}`);
      changelog.push(`${party}.${parameter}: ${oldValue} → ${newValue} (${justification})`);
    } else {
      console.warn(`  WARN: Could not find ${party}.${parameter} = ${oldValue}`);
    }
  } else if (parameter.startsWith("positions.")) {
    // e.g., positions.immigration.ideal
    const parts = parameter.split(".");
    const dim = parts[1];
    const prop = parts[2]; // ideal, floor, weight
    // This is harder to regex-replace reliably. Log for manual review.
    changelog.push(`${party}.${parameter}: ${oldValue} → ${newValue} (${justification}) [MANUAL REVIEW NEEDED]`);
    console.warn(`  NOTE: Position changes require manual review: ${party}.${parameter}`);
  } else if (parameter.startsWith("relationships.")) {
    // e.g., relationships.M.inGov
    const parts = parameter.split(".");
    const otherParty = parts[1];
    const field = parts[2];
    changelog.push(`${party}.${parameter}: ${oldValue} → ${newValue} (${justification}) [MANUAL REVIEW NEEDED]`);
    console.warn(`  NOTE: Relationship changes require manual review: ${party}.${parameter}`);
  }
}

// Write updated parties file
fs.writeFileSync(partiesPath, partiesSource);
console.log(`\nApplied ${changelog.length} changes.`);

// Run baseline simulation
console.log("\nRunning baseline simulation...");
const { simulate } = require("../sim5-engine.js");
const result = simulate({}, 500);

// Extract topline
const topline = {
  date: brief.date,
  pmS: result.pm.S || 0,
  pmV: result.pm.V || 0,
  noGov: result.noGovPct,
  topCoalition: result.topCoalitions[0]?.govt || "none",
  topCoalitionPct: result.topCoalitions[0]?.pct || 0,
  mInGov: result.topCoalitions
    .filter(c => c.govt.includes("M"))
    .reduce((s, c) => s + c.pct, 0),
  topFive: result.topCoalitions.slice(0, 5).map(c => ({
    govt: c.govt,
    pct: +c.pct.toFixed(1)
  })),
  formationStage: brief.formationStage || "unknown",
  changelog
};

// Append to historical time series
const histDir = path.join(__dirname, "historical");
if (!fs.existsSync(histDir)) fs.mkdirSync(histDir, { recursive: true });

const histPath = path.join(histDir, "timeseries.json");
let timeseries = [];
if (fs.existsSync(histPath)) {
  timeseries = JSON.parse(fs.readFileSync(histPath, "utf8"));
}

// Replace existing entry for same date or append
const existingIdx = timeseries.findIndex(e => e.date === brief.date);
if (existingIdx >= 0) {
  timeseries[existingIdx] = topline;
} else {
  timeseries.push(topline);
}
timeseries.sort((a, b) => a.date.localeCompare(b.date));

fs.writeFileSync(histPath, JSON.stringify(timeseries, null, 2));
console.log(`\nHistorical data updated: ${timeseries.length} entries.`);
console.log("Topline:", JSON.stringify(topline, null, 2));

// Save dated brief
const briefCopy = path.join(histDir, `brief-${brief.date}.json`);
fs.writeFileSync(briefCopy, JSON.stringify(brief, null, 2));

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
