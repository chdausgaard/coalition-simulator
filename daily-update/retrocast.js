#!/usr/bin/env node
/**
 * retrocast.js — Recalculate historical timeline entries using the current engine.
 *
 * Architectural engine changes (three-state M orientation, opposition coordination,
 * majority gap penalty, blue LG model, opposition budget discipline) apply to ALL
 * dates uniformly — they are "the model was always wrong" fixes.
 *
 * Brief-driven changes (party parameters, seat counts, crossBlocBonus) are reverted
 * for dates before they occurred.
 *
 * Usage: node daily-update/retrocast.js
 */

const path = require("path");
const Sim5Parties = require("../sim5-parties.js");
const engine = require("../sim5-engine.js");
const PARTIES_MAP = Sim5Parties.PARTIES_MAP;

const N = 30000;

// ── Reversion blocks ─────────────────────────────────────────────────
// Brief-driven changes grouped by the date they were introduced.
// Earlier dates spread these to revert to the pre-change state.

// April 1: GL red shift + EL softening
const REVERT_APRIL_01 = {
  "EL.globalHarshness": { from: 0.50, to: 0.56 },
};
const NA_OVERRIDES_PRE_APRIL_01 = {
  "GL-IA": { pRed: 0.55, pFlexible: 0.40, pBlue: 0.05 },
  "GL-NAL": { pRed: 0.42, pFlexible: 0.48, pBlue: 0.10 }
};

// April 2: M hardening, M→SF cooling, blue-party pivot (40%), crossBlocBonus
const REVERT_APRIL_02 = {
  "M.globalHarshness": { from: 0.35, to: 0.32 },
  "M.relationships.SF.inGov": { from: 0.58, to: 0.62 },
  "M.relationships.SF.asSupport": { from: 0.72, to: 0.75 },
  // Full reversion of blue-party pivot (inGov + tolerateInGov only;
  // asSupport and asPM don't change — joining ≠ propping up from outside)
  "V.relationships.S.inGov": { from: 0.32, to: 0.08 },
  "V.relationships.S.tolerateInGov": { from: 0.35, to: 0.10 },
  "KF.relationships.S.inGov": { from: 0.52, to: 0.35 },
  "KF.relationships.S.tolerateInGov": { from: 0.82, to: 0.72 },
  "LA.relationships.S.inGov": { from: 0.08, to: 0.03 },
  "LA.relationships.S.tolerateInGov": { from: 0.15, to: 0.02 },
};

// April 4: BP toxicity increase (Schytte departure)
const REVERT_APRIL_04_BP = {
  "V.relationships.BP.inGov": { from: 0.10, to: 0.12 },
  "V.relationships.BP.asSupport": { from: 0.26, to: 0.30 },
  "V.relationships.BP.tolerateInGov": { from: 0.30, to: 0.35 },
  "KF.relationships.BP.inGov": { from: 0.18, to: 0.20 },
  "KF.relationships.BP.asSupport": { from: 0.30, to: 0.35 },
  "KF.relationships.BP.tolerateInGov": { from: 0.35, to: 0.40 },
  "LA.relationships.BP.inGov": { from: 0.28, to: 0.30 },
  "LA.relationships.BP.asSupport": { from: 0.40, to: 0.45 },
  "LA.relationships.BP.tolerateInGov": { from: 0.45, to: 0.50 },
  "M.relationships.BP.asSupport": { from: 0.08, to: 0.10 },
  "M.relationships.BP.tolerateInGov": { from: 0.10, to: 0.12 },
};

// April 6: V harshness + remaining 60% blue-party pivot
const REVERT_APRIL_06 = {
  "V.globalHarshness": { from: 0.75, to: 0.72 },
  // Partial reversion: from final values to April-2 intermediate values
  "V.relationships.S.inGov": { from: 0.32, to: 0.18 },
  "V.relationships.S.tolerateInGov": { from: 0.35, to: 0.20 },
  "KF.relationships.S.inGov": { from: 0.52, to: 0.42 },
  "KF.relationships.S.tolerateInGov": { from: 0.82, to: 0.76 },
  "LA.relationships.S.inGov": { from: 0.08, to: 0.05 },
  "LA.relationships.S.tolerateInGov": { from: 0.15, to: 0.07 },
};

// April 9: S/SF/EL softening, M hardening, crossBlocBonus 5→6
const REVERT_APRIL_09 = {
  "S.globalHarshness": { from: 0.35, to: 0.45 },
  "S.positions.pension.weight": { from: 0.35, to: 0.65 },
  "S.positions.fiscal.weight": { from: 0.35, to: 0.60 },
  "SF.globalHarshness": { from: 0.40, to: 0.55 },
  "SF.positions.wealthTax.weight": { from: 0.10, to: 0.45 },
  "EL.globalHarshness": { from: 0.38, to: 0.50 },
  "M.globalHarshness": { from: 0.40, to: 0.35 },
};

// Pre-March-31 BP toxicity (before Isaksen/Nawa/Harris)
const REVERT_PRE_MARCH_31_BP = {
  "V.relationships.BP.inGov": { from: 0.10, to: 0.20 },
  "V.relationships.BP.asSupport": { from: 0.26, to: 0.40 },
  "V.relationships.BP.tolerateInGov": { from: 0.30, to: 0.45 },
  "LA.relationships.BP.inGov": { from: 0.28, to: 0.40 },
  "LA.relationships.BP.asSupport": { from: 0.40, to: 0.55 },
  "LA.relationships.BP.tolerateInGov": { from: 0.45, to: 0.60 },
  "LA.relationships.BP.asPM": { from: 0.06, to: 0.08 },
  "KF.relationships.BP.inGov": { from: 0.18, to: 0.30 },
  "KF.relationships.BP.asSupport": { from: 0.30, to: 0.45 },
  "KF.relationships.BP.tolerateInGov": { from: 0.35, to: 0.50 },
  "KF.relationships.BP.asPM": { from: 0.03, to: 0.05 },
  "DF.relationships.BP.inGov": { from: 0.28, to: 0.35 },
  "DF.relationships.BP.asSupport": { from: 0.42, to: 0.50 },
  "DF.relationships.BP.tolerateInGov": { from: 0.48, to: 0.55 },
  "DF.relationships.BP.asPM": { from: 0.04, to: 0.05 },
  "DD.relationships.BP.inGov": { from: 0.22, to: 0.30 },
  "DD.relationships.BP.asSupport": { from: 0.38, to: 0.45 },
  "DD.relationships.BP.tolerateInGov": { from: 0.42, to: 0.50 },
  "DD.relationships.BP.asPM": { from: 0.04, to: 0.05 },
};

// ── Historical overrides ─────────────────────────────────────────────
// Architectural changes (three-state M orientation, opposition coordination,
// majority gap penalty, blue LG model) apply to ALL dates uniformly.
// Only info-driven changes are reverted per-date.

const HISTORICAL_OVERRIDES = {
  "2026-03-24": {
    label: "valgaften",
    formationStage: "valgaften",
    changelog: ["Udgangspunkt: kalibrering fra valgaften, før forhandlingssignaler"],
    removeLG: true,
    removeLGBP2: true,
    mandateOverrides: { LA: 16, BP: 4 },
    cfgOverrides: { crossBlocBonus: 1.0 },
    overrides: {
      ...REVERT_APRIL_09,
      ...REVERT_APRIL_06,
      ...REVERT_APRIL_04_BP,
      ...REVERT_APRIL_02,
      ...REVERT_APRIL_01,
      ...REVERT_PRE_MARCH_31_BP,
      "SF.globalHarshness": { from: 0.40, to: 0.59 },
      "KF.relationships.S.inGov": { from: 0.52, to: 0.30 },
      "EL.globalHarshness": { from: 0.38, to: 0.64 },
      "ALT.globalHarshness": { from: 0.48, to: 0.53 },
    }
  },
  "2026-03-26": {
    label: "forhandlinger",
    formationStage: "forhandlinger",
    changelog: [
      "SF truer med mistillidsvotum mod enhver regering uden SF",
      "Konservative (Mona Juul) åbner døren til samarbejde med S"
    ],
    removeLG: true,
    removeLGBP2: true,
    mandateOverrides: { LA: 16, BP: 4 },
    cfgOverrides: { crossBlocBonus: 1.0 },
    overrides: {
      ...REVERT_APRIL_09,
      ...REVERT_APRIL_06,
      ...REVERT_APRIL_04_BP,
      ...REVERT_APRIL_02,
      ...REVERT_APRIL_01,
      ...REVERT_PRE_MARCH_31_BP,
      "EL.globalHarshness": { from: 0.38, to: 0.64 },
      "ALT.globalHarshness": { from: 0.48, to: 0.53 },
    }
  },
  "2026-03-28": {
    label: "forhandlinger",
    formationStage: "forhandlinger",
    changelog: [
      "EL bløder op: Dragsted signalerer fleksibilitet, ét krav (ulighed), folketingsgruppen forhandler",
      "ALT reducerer til ét ultimatum: svinepagten",
      "SF (Dyhr) styrer forventninger ned internt om kommende kompromiser"
    ],
    removeLG: true,
    removeLGBP2: true,
    mandateOverrides: { LA: 16, BP: 4 },
    cfgOverrides: { crossBlocBonus: 1.0 },
    overrides: {
      ...REVERT_APRIL_09,
      ...REVERT_APRIL_06,
      ...REVERT_APRIL_04_BP,
      ...REVERT_APRIL_02,
      ...REVERT_APRIL_01,
      ...REVERT_PRE_MARCH_31_BP,
    }
  },
  "2026-03-29": {
    label: "forhandlinger",
    formationStage: "forhandlinger",
    changelog: [
      "LA ekskluderer Cecilie Liv Hansen → løsgænger (LA 16→15, 1 uafhængigt mandat)",
      "BP ekskluderer Jacob Harris → løsgænger (BP 4→3, 1 uafhængigt mandat)",
      "Forhandlingspause: weekend bruges til uformelle bilaterale sonderinger"
    ],
    removeLG: false,
    removeLGBP2: true,
    mandateOverrides: { BP: 3 },
    cfgOverrides: { crossBlocBonus: 1.0 },
    overrides: {
      ...REVERT_APRIL_09,
      ...REVERT_APRIL_06,
      ...REVERT_APRIL_04_BP,
      ...REVERT_APRIL_02,
      ...REVERT_APRIL_01,
      ...REVERT_PRE_MARCH_31_BP,
    }
  },
  "2026-03-30": {
    label: "forhandlinger",
    formationStage: "forhandlinger",
    changelog: [
      "Ingen nye politiske signaler (weekendpause, uformelle bilaterale sonderinger)"
    ],
    removeLG: false,
    removeLGBP2: true,
    mandateOverrides: { BP: 3 },
    cfgOverrides: { crossBlocBonus: 1.0 },
    revertMBP: true,
    revertGLCorrelated: true,
    overrides: {
      ...REVERT_APRIL_09,
      ...REVERT_APRIL_06,
      ...REVERT_APRIL_04_BP,
      ...REVERT_APRIL_02,
      ...REVERT_APRIL_01,
      ...REVERT_PRE_MARCH_31_BP,
    }
  },
  "2026-03-31": {
    label: "forhandlinger",
    formationStage: "forhandlinger",
    changelog: [
      "BP-toksicitet stiger: Isaksen/Nawa-kontrovers, Harris-efterdønninger fortsætter",
      "Rona (M) erklærer blå blok 'helt finito' efter BP-uro",
      "Grønlandske mandater (Høegh-Dam, Nathanielsen) ankommer koordineret før Marienborg-møde"
    ],
    removeLG: false,
    removeLGBP2: true,
    mandateOverrides: { BP: 3 },
    cfgOverrides: { crossBlocBonus: 1.0 },
    overrides: {
      ...REVERT_APRIL_09,
      ...REVERT_APRIL_06,
      ...REVERT_APRIL_04_BP,
      ...REVERT_APRIL_02,
      ...REVERT_APRIL_01,
    },
    naOverrides: NA_OVERRIDES_PRE_APRIL_01
  },
  "2026-04-01": {
    label: "forhandlinger",
    formationStage: "forhandlinger",
    changelog: [
      "Nathanielsen (IA) hælder 'selvfølgelig rødt', svært at se blå konstellation",
      "Skaale peger på Frederiksen ved ankomst til Marienborg",
      "Dragsted (EL) signalerer ingen ultimatummer, alle skal bøje sig"
    ],
    removeLG: false,
    removeLGBP2: true,
    mandateOverrides: { BP: 3 },
    cfgOverrides: { crossBlocBonus: 1.0 },
    overrides: {
      ...REVERT_APRIL_09,
      ...REVERT_APRIL_06,
      ...REVERT_APRIL_04_BP,
      ...REVERT_APRIL_02,
    }
  },
  "2026-04-02": {
    label: "forhandlinger",
    formationStage: "forhandlinger",
    changelog: [
      "Løkke presser eksplicit for tværblok-løsning ('koste hvad det vil')",
      "M-forhandlingshårdhed stiger; SF↔M bilateral svækkes",
      "Blå partier begynder pivot mod centristisk arrangement (40% skift)",
      "Cecilie Liv Hansen bekræfter hun bliver som løsgænger"
    ],
    removeLG: false,
    removeLGBP2: true,
    mandateOverrides: { BP: 3 },
    cfgOverrides: { crossBlocBonus: 5.0 },  // crossBlocBonus was 5.0 from April 2–8
    overrides: {
      ...REVERT_APRIL_09,
      ...REVERT_APRIL_06,
      ...REVERT_APRIL_04_BP,
    }
  },
  "2026-04-03": {
    label: "forhandlinger",
    formationStage: "forhandlinger",
    changelog: [
      "Ingen nye politiske signaler; to genoptællingsanmodninger modtaget (afgøres 10-14 april)"
    ],
    removeLG: false,
    removeLGBP2: true,
    mandateOverrides: { BP: 3 },
    cfgOverrides: { crossBlocBonus: 5.0 },
    overrides: {
      ...REVERT_APRIL_09,
      ...REVERT_APRIL_06,
      ...REVERT_APRIL_04_BP,
    }
  },
  "2026-04-04": {
    label: "forhandlinger",
    formationStage: "forhandlinger",
    changelog: [
      "Emilie Schytte forlader BP pga. retorik → BP 3→2 mandater, ny løsgænger",
      "BP-toksicitet stiger yderligere"
    ],
    removeLG: false,
    removeLGBP2: false,
    cfgOverrides: { crossBlocBonus: 5.0 },
    overrides: {
      ...REVERT_APRIL_09,
      ...REVERT_APRIL_06,
    }
  },
  "2026-04-05": {
    label: "forhandlinger",
    formationStage: "forhandlinger",
    changelog: [
      "Megafon-måling: 42% ønsker tværblok-regering (op fra 35%); intet nyt partisignal"
    ],
    removeLG: false,
    removeLGBP2: false,
    cfgOverrides: { crossBlocBonus: 5.0 },
    overrides: {
      ...REVERT_APRIL_09,
      ...REVERT_APRIL_06,
    }
  },
  "2026-04-06": {
    label: "forhandlinger",
    formationStage: "forhandlinger",
    changelog: [
      "Forhandlinger genoptages efter påske ved Marienborg",
      "Troels Lund Poulsen ude 7-10 dage efter øjenoperation → V-hårdhed stiger",
      "Resterende blå-parti pivot mod centristisk arrangement (fuld effekt)"
    ],
    removeLG: false,
    removeLGBP2: false,
    cfgOverrides: { crossBlocBonus: 5.0 },
    overrides: {
      ...REVERT_APRIL_09,
    }
  }
};

// ── Override application ─────────────────────────────────────────────

function applyOverride(key, value) {
  const parts = key.split(".");
  const partyId = parts[0];
  const party = PARTIES_MAP[partyId];
  if (!party) { console.warn("Unknown party:", partyId); return null; }

  if (parts[1] === "globalHarshness") {
    const old = party.globalHarshness;
    party.globalHarshness = value;
    return old;
  }
  if (parts[1] === "participationPref") {
    const old = party.participationPref[parts[2]];
    party.participationPref[parts[2]] = value;
    return old;
  }
  if (parts[1] === "positions") {
    const posId = parts[2];
    const field = parts[3];
    if (!party.positions[posId]) { console.warn("No position:", key); return null; }
    const old = party.positions[posId][field];
    party.positions[posId][field] = value;
    return old;
  }
  if (parts[1] === "relationships") {
    const otherId = parts[2];
    const field = parts[3];
    if (!party.relationships[otherId]) { console.warn("No relationship:", key); return null; }
    const old = party.relationships[otherId][field];
    party.relationships[otherId][field] = value;
    return old;
  }
  console.warn("Unknown override path:", key);
  return null;
}

function runRetrocast(date, config) {
  console.log(`\n=== Retrocasting ${date} (${config.label}) ===`);

  // Apply overrides
  const saved = {};
  for (const [key, spec] of Object.entries(config.overrides || {})) {
    saved[key] = applyOverride(key, spec.to);
    console.log(`  ${key}: ${spec.from} → ${spec.to}`);
  }

  // Mandate overrides
  const savedMandates = {};
  for (const [partyId, seats] of Object.entries(config.mandateOverrides || {})) {
    const party = PARTIES_MAP[partyId];
    if (party) {
      savedMandates[partyId] = party.mandates;
      party.mandates = seats;
      console.log(`  ${partyId}.mandates: ${savedMandates[partyId]} → ${seats}`);
    }
  }

  // Remove LG seats if pre-expulsion
  const removedLG = [];
  if (config.removeLG) {
    for (let i = Sim5Parties.NA_SEATS.length - 1; i >= 0; i--) {
      if (Sim5Parties.NA_SEATS[i].id.startsWith("LG-")) {
        removedLG.push({ index: i, seat: Sim5Parties.NA_SEATS[i] });
        Sim5Parties.NA_SEATS.splice(i, 1);
      }
    }
    if (removedLG.length) console.log(`  Removed ${removedLG.length} LG seats`);
  }

  // Remove LG-BP2 (Schytte) if pre-departure
  const removedLGBP2 = [];
  if (!config.removeLG && config.removeLGBP2) {
    for (let i = Sim5Parties.NA_SEATS.length - 1; i >= 0; i--) {
      if (Sim5Parties.NA_SEATS[i].id === "LG-BP2") {
        removedLGBP2.push({ index: i, seat: Sim5Parties.NA_SEATS[i] });
        Sim5Parties.NA_SEATS.splice(i, 1);
      }
    }
    if (removedLGBP2.length) console.log(`  Removed LG-BP2`);
  }

  // Remove M→BP if pre-existence
  let savedMBP = null;
  if (config.revertMBP) {
    const mParty = PARTIES_MAP.M;
    if (mParty && mParty.relationships.BP) {
      savedMBP = mParty.relationships.BP;
      delete mParty.relationships.BP;
      console.log("  Removed M→BP relationship");
    }
  }

  // Revert GL correlated draws if pre-coordination
  const savedGL = [];
  if (config.revertGLCorrelated) {
    for (const seat of Sim5Parties.NA_SEATS) {
      if (seat.glCorrelated) {
        savedGL.push({
          seat, glCorrelated: seat.glCorrelated,
          pRed: seat.pRed, pFlexible: seat.pFlexible, pBlue: seat.pBlue
        });
        delete seat.glCorrelated;
        if (seat.id === "GL-NAL") { seat.pRed = 0.50; seat.pFlexible = 0.40; }
        if (seat.id === "GL-IA") { seat.pRed = 0.65; seat.pFlexible = 0.30; }
        console.log(`  ${seat.id}: reverted to independent draw`);
      }
    }
  }

  // NA seat probability overrides
  const savedNA = [];
  if (config.naOverrides) {
    for (const seat of Sim5Parties.NA_SEATS) {
      if (config.naOverrides[seat.id]) {
        const ov = config.naOverrides[seat.id];
        savedNA.push({ seat, pRed: seat.pRed, pFlexible: seat.pFlexible, pBlue: seat.pBlue });
        seat.pRed = ov.pRed;
        seat.pFlexible = ov.pFlexible;
        seat.pBlue = ov.pBlue;
        console.log(`  ${seat.id}: pRed=${ov.pRed}, pFlex=${ov.pFlexible}, pBlue=${ov.pBlue}`);
      }
    }
  }

  // Run simulation with cfg overrides
  const simCfg = config.cfgOverrides || {};
  const result = engine.simulate(simCfg, N);

  // Collect top coalitions
  const coalitions = {};
  for (const c of result.topCoalitions.slice(0, 10)) {
    coalitions[c.govt] = (coalitions[c.govt] || 0) + c.pct;
  }
  for (const key of Object.keys(coalitions)) {
    coalitions[key] = +coalitions[key].toFixed(1);
  }
  console.log("  Results:", JSON.stringify(coalitions));

  // ── Restore ────────────────────────────────────────────────────────
  for (const [key, oldVal] of Object.entries(saved)) {
    if (oldVal != null) applyOverride(key, oldVal);
  }
  for (const [partyId, oldMandates] of Object.entries(savedMandates)) {
    const party = PARTIES_MAP[partyId];
    if (party) party.mandates = oldMandates;
  }
  for (const { index, seat } of removedLG.reverse()) {
    Sim5Parties.NA_SEATS.splice(index, 0, seat);
  }
  for (const { index, seat } of removedLGBP2.reverse()) {
    Sim5Parties.NA_SEATS.splice(index, 0, seat);
  }
  if (savedMBP) PARTIES_MAP.M.relationships.BP = savedMBP;
  for (const { seat, glCorrelated, pRed, pFlexible, pBlue } of savedGL) {
    seat.glCorrelated = glCorrelated;
    seat.pRed = pRed; seat.pFlexible = pFlexible;
    if (pBlue !== undefined) seat.pBlue = pBlue;
  }
  for (const { seat, pRed, pFlexible, pBlue } of savedNA) {
    seat.pRed = pRed; seat.pFlexible = pFlexible; seat.pBlue = pBlue;
  }

  return {
    date, coalitions,
    noGov: result.noGovPct,
    formationStage: config.formationStage,
    changelog: config.changelog
  };
}

// ── Run all retrocasts ───────────────────────────────────────────────
const timeline = [];
for (const [date, config] of Object.entries(HISTORICAL_OVERRIDES)) {
  timeline.push(runRetrocast(date, config));
}

// Current date (2026-04-09): no overrides needed
console.log("\n=== Current: 2026-04-09 ===");
const current = engine.simulate({}, N);
const currentCoalitions = {};
for (const c of current.topCoalitions.slice(0, 10)) {
  currentCoalitions[c.govt] = (currentCoalitions[c.govt] || 0) + c.pct;
}
for (const key of Object.keys(currentCoalitions)) {
  currentCoalitions[key] = +currentCoalitions[key].toFixed(1);
}
console.log("  Results:", JSON.stringify(currentCoalitions));

timeline.push({
  date: "2026-04-09",
  coalitions: currentCoalitions,
  noGov: current.noGovPct,
  formationStage: "forhandlinger",
  changelog: [
    "SF dropper formueskat som krav; S indsnævrer til 2 røde linjer (udlændinge, sprøjteforbud)",
    "EL (Dragsted) roser Løkke, kun ét bredt krav (ulighed)",
    "Løkke fastholder skepsis efter 4 timer: 'ser stadigvæk tungt ud'",
    "crossBlocBonus 5→6: Løkke gentager tværblok-præference efter lang forhandling"
  ]
});

// Output
console.log("\n=== Final timeline ===");
console.log(JSON.stringify(timeline, null, 2));
