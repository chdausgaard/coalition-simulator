#!/usr/bin/env node
/**
 * sim5-sweep.js — Phase transition / sensitivity analysis
 *
 * Runs 1D sweeps and 2D heatmaps across the parameter space at low N,
 * outputting JSON results for embedding in the dashboard.
 *
 * Usage: node sim5-sweep.js [--n 100] [--output sweep-results.json]
 */

const { simulate } = require("./sim5-engine.js");

const N = parseInt(process.argv.find((_, i, a) => a[i-1] === "--n") || "100", 10);
const outputPath = process.argv.find((_, i, a) => a[i-1] === "--output") || "sweep-results.json";

function linspace(lo, hi, steps) {
  const arr = [];
  for (let i = 0; i < steps; i++) {
    arr.push(+(lo + (hi - lo) * i / (steps - 1)).toFixed(4));
  }
  return arr;
}

function extractTopline(result) {
  const top = result.topCoalitions[0];
  return {
    pmS: result.pm.S || 0,
    pmV: result.pm.V || 0,
    noGov: result.noGovPct,
    topCoalition: top ? top.govt : "none",
    topCoalitionPct: top ? top.pct : 0,
    mInGov: result.topCoalitions
      .filter(c => c.govt.includes("M"))
      .reduce((s, c) => s + c.pct, 0),
    fourPartyPct: result.topCoalitions
      .filter(c => c.govt.split("+").length >= 4)
      .reduce((s, c) => s + c.pct, 0),
    avgRounds: result.formationRounds.avg,
    topFive: result.topCoalitions.slice(0, 5).map(c => ({
      govt: c.govt,
      pct: +c.pct.toFixed(1),
      pPassage: +(c.avgPPassage || 0).toFixed(3)
    }))
  };
}

function runPoint(overrides) {
  const result = simulate(overrides, N);
  return extractTopline(result);
}

// ============================================================
// 1D SWEEPS
// ============================================================

const sweeps1D = {};

console.log("Running 1D sweeps...");

// Flexibility
const flexValues = linspace(-0.3, 0.5, 17);
console.log("  flexibility:", flexValues.length, "points");
sweeps1D.flexibility = flexValues.map(v => ({
  value: v,
  ...runPoint({ flexibility: v })
}));

// Red preference
const redPrefValues = linspace(0, 1, 21);
console.log("  redPreference:", redPrefValues.length, "points");
sweeps1D.redPreference = redPrefValues.map(v => ({
  value: v,
  ...runPoint({ redPreference: v })
}));

// Viability threshold
const viabValues = linspace(0.4, 0.95, 12);
console.log("  viabilityThreshold:", viabValues.length, "points");
sweeps1D.viabilityThreshold = viabValues.map(v => ({
  value: v,
  ...runPoint({ viabilityThreshold: v })
}));

// Vote sensitivity (sigmoid steepness)
const sensValues = linspace(1, 8, 15);
console.log("  voteSensitivity:", sensValues.length, "points");
sweeps1D.voteSensitivity = sensValues.map(v => ({
  value: v,
  ...runPoint({ voteSensitivity: v })
}));

// Passage exponent
const passExpValues = linspace(1, 3, 11);
console.log("  passageExponent:", passExpValues.length, "points");
sweeps1D.passageExponent = passExpValues.map(v => ({
  value: v,
  ...runPoint({ passageExponent: v })
}));

// ============================================================
// DISCRETE SWEEPS (mPmPref, mDemandGov, formateurOverride)
// ============================================================

console.log("Running discrete sweeps...");

sweeps1D.mPmPref = ["S", "neutral", "V", "M"].map(v => ({
  value: v,
  ...runPoint({ mPmPref: v })
}));

sweeps1D.mDemandGov = [true, false].map(v => ({
  value: v,
  ...runPoint({ mDemandGov: v })
}));

sweeps1D.formateurOverride = ["endogenous", "red", "blue"].map(v => ({
  value: v,
  ...runPoint({ formateurOverride: v })
}));

// ============================================================
// 2D HEATMAPS
// ============================================================

const sweeps2D = {};

console.log("Running 2D heatmaps...");

// Flexibility × redPreference (the core landscape)
const flex2D = linspace(-0.2, 0.4, 13);
const red2D = linspace(0, 1, 11);
console.log("  flexibility × redPreference:", flex2D.length * red2D.length, "points");
sweeps2D.flexibility_x_redPreference = {
  xParam: "flexibility", xValues: flex2D,
  yParam: "redPreference", yValues: red2D,
  data: flex2D.map(f => red2D.map(r => runPoint({ flexibility: f, redPreference: r })))
};

// Flexibility × mPmPref
const mPmValues = ["S", "neutral", "V", "M"];
console.log("  flexibility × mPmPref:", flex2D.length * mPmValues.length, "points");
sweeps2D.flexibility_x_mPmPref = {
  xParam: "flexibility", xValues: flex2D,
  yParam: "mPmPref", yValues: mPmValues,
  data: flex2D.map(f => mPmValues.map(m => runPoint({ flexibility: f, mPmPref: m })))
};

// Flexibility × viabilityThreshold
const viab2D = linspace(0.5, 0.9, 9);
console.log("  flexibility × viabilityThreshold:", flex2D.length * viab2D.length, "points");
sweeps2D.flexibility_x_viabilityThreshold = {
  xParam: "flexibility", xValues: flex2D,
  yParam: "viabilityThreshold", yValues: viab2D,
  data: flex2D.map(f => viab2D.map(v => runPoint({ flexibility: f, viabilityThreshold: v })))
};

// ============================================================
// OUTPUT
// ============================================================

const output = {
  meta: {
    generatedAt: new Date().toISOString(),
    N,
    sweepCount1D: Object.values(sweeps1D).reduce((s, arr) => s + arr.length, 0),
    sweepCount2D: Object.values(sweeps2D).reduce((s, o) => s + o.xValues.length * o.yValues.length, 0)
  },
  sweeps1D,
  sweeps2D
};

const totalPoints = output.meta.sweepCount1D + output.meta.sweepCount2D;
console.log(`\nDone. ${totalPoints} total simulation points.`);

const fs = require("fs");
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`Results written to ${outputPath}`);
