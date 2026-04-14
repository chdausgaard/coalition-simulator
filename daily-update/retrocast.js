#!/usr/bin/env node
/**
 * retrocast.js — snapshot-based retrocast.
 *
 * Loads per-date snapshots from snapshots/, swaps them into the shared
 * PARTIES_MAP / NA_SEATS in place (preserving object identity so references
 * held elsewhere remain valid), runs simulate() at N=30000 under the
 * snapshot's engineCfg, and writes the timeline to historical/timeseries.json.
 *
 * Replaces the HISTORICAL_OVERRIDES / REVERT_* approach from the previous
 * version of this file.
 *
 * Usage: node daily-update/retrocast.js
 */

const fs = require("fs");
const path = require("path");

// Optional deterministic seed. When RETROCAST_SEED is set, override the
// global Math.random with a mulberry32 stream so the Monte Carlo output
// is reproducible byte-for-byte. build.js sets RETROCAST_SEED=42 so its
// regenerated historical/timeseries.json (and the TIMELINE_DATA it feeds
// into index.html) is idempotent under re-run. Standalone invocation
// leaves Math.random untouched; each run produces a fresh draw as before.
if (process.env.RETROCAST_SEED) {
  const seed = Number(process.env.RETROCAST_SEED);
  if (!Number.isFinite(seed)) {
    throw new Error("RETROCAST_SEED must be numeric; got: " + process.env.RETROCAST_SEED);
  }
  let s = seed >>> 0;
  Math.random = function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  console.log(`[retrocast] seeded Math.random with mulberry32(${seed})`);
}

const Sim5Parties = require("../sim5-parties.js");
const engine = require("../sim5-engine.js");

const N = 30000;
const SNAP_DIR = path.join(__dirname, "snapshots");

function loadAllSnapshots() {
  const files = fs.readdirSync(SNAP_DIR)
    .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort();
  return files.map(f => ({
    date: f.replace(".json", ""),
    data: JSON.parse(fs.readFileSync(path.join(SNAP_DIR, f), "utf8"))
  }));
}

function swapToSnapshot(snap) {
  // Mutate each party object in place — preserves identity for any code
  // holding refs (notably PARTIES_LIST elements).
  for (const partyId of Object.keys(Sim5Parties.PARTIES_MAP)) {
    const live = Sim5Parties.PARTIES_MAP[partyId];
    const snapParty = snap.parties[partyId];
    if (!snapParty) throw new Error(`Snapshot missing party: ${partyId}`);
    for (const k of Object.keys(live)) delete live[k];
    Object.assign(live, JSON.parse(JSON.stringify(snapParty)));
  }
  // Replace NA_SEATS contents (array reference preserved).
  Sim5Parties.NA_SEATS.length = 0;
  for (const s of snap.naSeats) {
    Sim5Parties.NA_SEATS.push(JSON.parse(JSON.stringify(s)));
  }
}

const snapshots = loadAllSnapshots();
const timeline = [];

for (const { date, data } of snapshots) {
  console.log(`\n=== Retrocasting ${date} (${data._meta.label}) ===`);
  swapToSnapshot(data);

  const result = engine.simulate(data.engineCfg || {}, N);

  const coalitions = {};
  for (const c of result.topCoalitions.slice(0, 10)) {
    coalitions[c.govt] = (coalitions[c.govt] || 0) + c.pct;
  }
  for (const key of Object.keys(coalitions)) {
    coalitions[key] = +coalitions[key].toFixed(1);
  }
  console.log("  Results:", JSON.stringify(coalitions));

  timeline.push({
    date,
    coalitions,
    noGov: result.noGovPct,
    formationStage: data._meta.formationStage,
    changelog: data._meta.changelog || []
  });
}

const histPath = path.join(__dirname, "historical", "timeseries.json");
fs.writeFileSync(histPath, JSON.stringify(timeline, null, 2));
console.log(`\nWrote ${timeline.length} entries to ${histPath}`);
