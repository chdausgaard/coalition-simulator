#!/usr/bin/env node
// generate-configs-v2.js — Configuration generator for post-election sweep
// Outputs lines of: label\tconfig_json\tN  (tab-separated)
// Usage: node generate-configs-v2.js > configs.txt

const MANDATES = require("./sim4-parties.js").MANDATES;
const N = 3000;

function emit(label, cfg, n) {
  console.log(`${label}\t${JSON.stringify(cfg)}\t${n || N}`);
}

// ============================================================================
// CORE BEHAVIORAL GRID
// ============================================================================
// 5 dimensions: M behavior × M orientation × pressure × Frederiksen pref × SF blocking
// mDemandPM only combined with mPmPref="M" (other orientations are irrelevant)
// Total: (2×3 + 1×1) × 3 × 3 × 3 = 189 cells

const M_BEHAVIORS = [
  { label: "demandGov", cfg: { mDemandGov: true, mDemandPM: false } },
  { label: "standard",  cfg: { mDemandGov: false, mDemandPM: false } },
  { label: "demandPM",  cfg: { mDemandGov: false, mDemandPM: true } },
];

const M_ORIENTATIONS = [
  { label: "leans_S",    cfg: { mPmPref: "S" } },
  { label: "leans_V",    cfg: { mPmPref: "V" } },
  { label: "wants_self", cfg: { mPmPref: "M" } },
];

const PRESSURES = [
  { label: "rigid",    cfg: { flexibility: -0.1 } },
  { label: "baseline", cfg: { flexibility: 0 } },
  { label: "pressure", cfg: { flexibility: 0.2 } },
];

const RED_PREFS = [
  { label: "red",     cfg: { redPreference: 0.8 } },
  { label: "neutral", cfg: { redPreference: 0.5 } },
  { label: "broad",   cfg: { redPreference: 0.2 } },
];

const SF_BLOCKING = [
  { label: "strong",  sweep: { sfAcceptM_lo: 0.10, sfAcceptM_hi: 0.30 } },
  { label: "neutral", sweep: { sfAcceptM_lo: 0.30, sfAcceptM_hi: 0.70 } },
  { label: "weak",    sweep: { sfAcceptM_lo: 0.70, sfAcceptM_hi: 0.95 } },
];

// Full grid
for (const mb of M_BEHAVIORS) {
  const orientations = mb.label === "demandPM" ? [M_ORIENTATIONS[2]] : M_ORIENTATIONS;
  for (const mo of orientations) {
    for (const pr of PRESSURES) {
      for (const rp of RED_PREFS) {
        for (const sf of SF_BLOCKING) {
          const label = `grid|${mb.label}|${mo.label}|${pr.label}|${rp.label}|sf${sf.label}`;
          emit(label, { cfg: { ...mb.cfg, ...mo.cfg, ...pr.cfg, ...rp.cfg }, sweep: sf.sweep });
        }
      }
    }
  }
}

// ============================================================================
// sRelaxPM VARIANTS (M orientation × pressure = 9 cells)
// ============================================================================
for (const mo of M_ORIENTATIONS) {
  for (const pr of PRESSURES) {
    const label = `sRelaxPM|${mo.label}|${pr.label}`;
    emit(label, { cfg: { mDemandGov: true, sRelaxPM: true, ...mo.cfg, ...pr.cfg } });
  }
}

// ============================================================================
// PARAMETRIC SWEEPS
// ============================================================================

// Pressure sweep: flexibility from -0.20 to +0.40
for (let f = -0.20; f <= 0.401; f += 0.05) {
  const flex = +f.toFixed(2);
  emit(`sweep|pressure|${flex}`, { cfg: { mDemandGov: true, mPmPref: "S", flexibility: flex } });
}

// pBlueFormateur sweep: 0.0 to 1.0
for (let p = 0; p <= 1.01; p += 0.1) {
  const pbf = +p.toFixed(1);
  emit(`sweep|pbf|${pbf}`, { cfg: { mDemandGov: true, mPmPref: "S", pBlueFormateur: pbf } });
}

// Formation rounds sweep
for (const rounds of [1, 2, 3, 4, 5]) {
  emit(`sweep|rounds|${rounds}`, { cfg: { mDemandGov: true, mPmPref: "S", maxFormationRounds: rounds } });
}

// ============================================================================
// MANDATE PERTURBATION (±2 seats for key parties)
// ============================================================================
const perturbParties = ["S", "M", "V", "SF", "DF", "RV"];
for (const pid of perturbParties) {
  for (const delta of [-2, +2]) {
    const mandates = { ...MANDATES };
    mandates[pid] += delta;
    // Compensate: adjust the "other side's" largest party to keep sum at 175
    const compensate = ["S", "SF", "EL", "ALT", "RV"].includes(pid) ? "V" : "S";
    mandates[compensate] -= delta;
    const sign = delta > 0 ? "+" : "";
    emit(`perturb|${pid}|${sign}${delta}`, { mandates, cfg: { mDemandGov: true, mPmPref: "S" } });
  }
}

// ALT and BP threshold: in parliament vs. out
for (const pid of ["ALT", "BP"]) {
  const mandates = { ...MANDATES };
  const seats = mandates[pid];
  mandates[pid] = 0;
  mandates["S"] += seats; // redistribute to S (largest party)
  emit(`perturb|${pid}|out`, { mandates, cfg: { mDemandGov: true, mPmPref: "S" } });
}

// ============================================================================
// ARCHETYPE SCENARIOS
// ============================================================================
const archetypes = [
  { label: "lokke_kingmaker_baseline",
    cfg: { mDemandGov: true, mPmPref: "S", flexibility: 0, redPreference: 0.5 } },
  { label: "lokke_kingmaker_pressure",
    cfg: { mDemandGov: true, mPmPref: "S", flexibility: 0.2, redPreference: 0.5 } },
  { label: "lokke_goes_blue",
    cfg: { mDemandGov: true, mPmPref: "V", flexibility: 0, redPreference: 0.5 } },
  { label: "lokke_wants_pm",
    cfg: { mDemandPM: true, mPmPref: "M", flexibility: 0.1, sRelaxPM: true } },
  { label: "lokke_passive",
    cfg: { mDemandGov: false, mPmPref: "S", flexibility: 0 } },
  { label: "red_locked",
    cfg: { mDemandGov: true, mPmPref: "S", flexibility: -0.1, redPreference: 0.8 },
    sweep: { sfAcceptM_lo: 0.10, sfAcceptM_hi: 0.30 } },
  { label: "blue_locked",
    cfg: { mDemandGov: true, mPmPref: "V", flexibility: 0.2, redPreference: 0.2 },
    sweep: { sfAcceptM_lo: 0.70, sfAcceptM_hi: 0.95 } },
  { label: "grand_coalition",
    cfg: { mDemandGov: false, mPmPref: "S", flexibility: 0.3, sRelaxPM: true, redPreference: 0.3 } },
  { label: "sf_blocks_m",
    cfg: { mDemandGov: true, mPmPref: "S", flexibility: -0.1 },
    sweep: { sfAcceptM_lo: 0.00, sfAcceptM_hi: 0.10 } },
  { label: "maximum_pressure",
    cfg: { mDemandGov: true, mPmPref: "S", flexibility: 0.4, maxFormationRounds: 5 } },
  { label: "df_in_government",
    cfg: { mDemandGov: true, mPmPref: "V", flexibility: 0.1, stretchedEligibility: ["DF"] } },
  { label: "sv_redux",
    cfg: { mDemandGov: false, mPmPref: "S", flexibility: 0.2 } },
  { label: "svm_nostalgia",
    cfg: { mDemandGov: true, mPmPref: "S", flexibility: 0, redPreference: 0.3 },
    sweep: { sfAcceptM_lo: 0.10, sfAcceptM_hi: 0.30 } },
  { label: "frederiksen_goes_red",
    cfg: { mDemandGov: true, mPmPref: "S", flexibility: 0, redPreference: 0.9 } },
  { label: "broad_midten",
    cfg: { mDemandGov: true, mPmPref: "S", flexibility: 0.15, redPreference: 0.2 },
    sweep: { sfAcceptM_lo: 0.50, sfAcceptM_hi: 0.90 } },
];

for (const a of archetypes) {
  emit(`archetype|${a.label}`, { cfg: a.cfg, sweep: a.sweep || {} });
}
