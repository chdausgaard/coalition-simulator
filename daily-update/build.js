#!/usr/bin/env node
/**
 * build.js — brief → snapshot + regenerate derived artifacts
 *
 * Inputs:
 *   - daily-update/briefs/<date>.json (authored diff)
 *   - most recent snapshots/*.json strictly dated < brief.date (parent state)
 *
 * Outputs (in --write mode):
 *   1. daily-update/snapshots/<date>.json
 *   2. sim5-parties.js (SNAPSHOT literal + NA_SEATS length assertion)
 *   3. daily-update/historical/timeseries.json (via seeded retrocast)
 *   4. index.html (TIMELINE_DATA, "Senest opdateret", DEFAULTS, slider defaults,
 *      controlDefaults.mElTolerate)
 *
 * Default mode is dry-run: only stages the candidate snapshot to a temp
 * path and diffs it against the committed snapshot (if present). Nothing
 * in the working tree is touched. Pass --write to materialize.
 *
 * Usage:
 *   node daily-update/build.js <brief.json>                 # dry-run
 *   node daily-update/build.js <brief.json> --write         # mutate repo
 *   node daily-update/build.js <brief.json> --out <path>    # stage elsewhere
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

// ── Paths ─────────────────────────────────────────────────────────────────
const REPO_ROOT = path.resolve(__dirname, "..");
const SNAP_DIR = path.join(REPO_ROOT, "daily-update", "snapshots");
const PARTIES_PATH = path.join(REPO_ROOT, "sim5-parties.js");
const INDEX_PATH = path.join(REPO_ROOT, "index.html");
const TIMESERIES_PATH = path.join(REPO_ROOT, "daily-update", "historical", "timeseries.json");
const RETROCAST_PATH = path.join(REPO_ROOT, "daily-update", "retrocast.js");

// ── Constants ─────────────────────────────────────────────────────────────
const ENGINE_VERSION = "sim5-v1";
const PARTY_IDS = new Set(["S", "SF", "M", "EL", "ALT", "RV", "V", "LA", "KF", "DF", "DD", "BP"]);
const NA_SEAT_IDS = new Set(["FO-JF", "FO-SB", "GL-NAL", "GL-IA", "LG-LA", "LG-BP", "LG-BP2"]);
const DANISH_MONTHS = [
  "januar", "februar", "marts", "april", "maj", "juni",
  "juli", "august", "september", "oktober", "november", "december"
];
const FLOAT_TOL = 1e-9;

// ── CLI ───────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const positional = [];
  const opts = { write: false, out: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--write") opts.write = true;
    else if (a === "--out") opts.out = argv[++i];
    else if (a === "--help" || a === "-h") { printUsage(); process.exit(0); }
    else if (a.startsWith("--")) throw new Error("Unknown flag: " + a);
    else positional.push(a);
  }
  if (positional.length !== 1) { printUsage(); process.exit(1); }
  opts.briefPath = path.resolve(positional[0]);
  return opts;
}

function printUsage() {
  console.error("Usage: node daily-update/build.js <brief.json> [--write] [--out <path>]");
}

// ── Parent-snapshot resolution ────────────────────────────────────────────
function loadParentSnapshot(briefDate) {
  const files = fs.readdirSync(SNAP_DIR)
    .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map(f => f.replace(".json", ""))
    .filter(d => d < briefDate)
    .sort();
  if (files.length === 0) throw new Error(`No parent snapshot dated before ${briefDate}`);
  const parentDate = files[files.length - 1];
  const parentData = JSON.parse(fs.readFileSync(path.join(SNAP_DIR, parentDate + ".json"), "utf8"));
  return { date: parentDate, data: parentData };
}

// ── Brief normalization ───────────────────────────────────────────────────
// Produces a flat list of changes + newEntities. Each change has a `kind`
// that dispatches its application. Unhandled shapes throw.
function normalizeBrief(brief) {
  const changes = [];
  for (const pc of brief.parameterChanges || []) {
    changes.push(...normalizeParamChange(pc));
  }
  const newEntities = brief.newEntities || [];
  return { changes, newEntities };
}

function normalizeParamChange(pc) {
  const { party, parameter, oldValue, newValue } = pc;

  // engineCfg: either {party: "cfg", parameter: "crossBlocBonus"} or
  // party absent with parameter === "crossBlocBonus".
  if (party === "cfg" || (party == null && parameter === "crossBlocBonus")) {
    return [{ kind: "engineCfg", key: parameter, old: oldValue, new: newValue }];
  }

  // NA seat probability change (GL-*, FO-*, LG-*)
  if (NA_SEAT_IDS.has(party)) {
    return [{ kind: "naSeat", seatId: party, prop: parameter, old: oldValue, new: newValue }];
  }

  // Arrow form: "V→S" with slash-packed parameter/value lists.
  if (typeof party === "string" && party.includes("→")) {
    const [fromId, toId] = party.split("→");
    if (!PARTY_IDS.has(fromId)) throw new Error("Arrow source unknown: " + party);
    if (!PARTY_IDS.has(toId)) throw new Error("Arrow target unknown: " + party);
    const params = String(parameter).split("/");
    const olds = String(oldValue).split("/");
    const news = String(newValue).split("/");
    if (params.length !== olds.length || params.length !== news.length) {
      throw new Error(`Arrow-form length mismatch for ${party} ${parameter}`);
    }
    return params.map((p, i) => ({
      kind: "partyField",
      partyId: fromId,
      path: `relationships.${toId}.${p}`,
      old: Number(olds[i]),
      new: Number(news[i])
    }));
  }

  // Party mandates (int)
  if (PARTY_IDS.has(party) && parameter === "mandates") {
    return [{ kind: "mandate", partyId: party, old: oldValue, new: newValue }];
  }

  // Generic dotted path under a party (globalHarshness, participationPref.*,
  // positions.*.weight, relationships.X.y, etc.)
  if (PARTY_IDS.has(party)) {
    return [{ kind: "partyField", partyId: party, path: parameter, old: oldValue, new: newValue }];
  }

  throw new Error(`Unhandled parameterChange: party=${party} parameter=${parameter}`);
}

// ── Path helpers ──────────────────────────────────────────────────────────
function getByPath(obj, dotted) {
  return dotted.split(".").reduce((o, k) => {
    if (o == null) throw new Error("Path hit null: " + dotted);
    return o[k];
  }, obj);
}

function setByPath(obj, dotted, val) {
  const keys = dotted.split(".");
  const last = keys.pop();
  const parent = keys.reduce((o, k) => o[k], obj);
  parent[last] = val;
}

function assertEqual(actual, expected, ctx) {
  if (typeof expected === "number" && typeof actual === "number") {
    if (Math.abs(actual - expected) > FLOAT_TOL) {
      throw new Error(`${ctx}: expected ${expected}, found ${actual} (stale brief?)`);
    }
  } else if (actual !== expected) {
    throw new Error(`${ctx}: expected ${JSON.stringify(expected)}, found ${JSON.stringify(actual)}`);
  }
}

// ── Snapshot construction ─────────────────────────────────────────────────
function buildSnapshot(brief, parent) {
  const snap = JSON.parse(JSON.stringify(parent.data));
  const { changes, newEntities } = normalizeBrief(brief);

  for (const c of changes) applyChange(snap, c);
  for (const e of newEntities) applyNewEntity(snap, e);

  snap._meta = constructMeta(brief, parent.date);

  // Reorder top-level keys canonically: _meta, parties, naSeats, engineCfg.
  // Inherited order from parent should already be this, but be defensive.
  const reordered = {
    _meta: snap._meta,
    parties: snap.parties,
    naSeats: snap.naSeats,
    engineCfg: snap.engineCfg
  };
  return reordered;
}

function applyChange(snap, c) {
  if (c.kind === "engineCfg") {
    const cur = snap.engineCfg[c.key];
    assertEqual(cur, c.old, `engineCfg.${c.key}`);
    snap.engineCfg[c.key] = c.new;
  } else if (c.kind === "partyField") {
    const p = snap.parties[c.partyId];
    if (!p) throw new Error("Unknown party: " + c.partyId);
    const cur = getByPath(p, c.path);
    assertEqual(cur, c.old, `parties.${c.partyId}.${c.path}`);
    setByPath(p, c.path, c.new);
  } else if (c.kind === "mandate") {
    const p = snap.parties[c.partyId];
    if (!p) throw new Error("Unknown party: " + c.partyId);
    assertEqual(p.mandates, c.old, `parties.${c.partyId}.mandates`);
    p.mandates = c.new;
  } else if (c.kind === "naSeat") {
    const seat = snap.naSeats.find(s => s.id === c.seatId);
    if (!seat) throw new Error("Unknown naSeat: " + c.seatId);
    assertEqual(seat[c.prop], c.old, `naSeats.${c.seatId}.${c.prop}`);
    seat[c.prop] = c.new;
  } else {
    throw new Error("Unknown change kind: " + c.kind);
  }
}

function applyNewEntity(snap, e) {
  if (e.type !== "løsgænger") {
    throw new Error("Unhandled newEntity type: " + e.type);
  }
  if (snap.naSeats.some(s => s.id === e.id)) {
    throw new Error("Duplicate naSeat id: " + e.id);
  }
  snap.naSeats.push({
    id: e.id,
    name: e.name,
    mandates: 1,
    bloc: "na",
    blocOrigin: e.blocOrigin,
    pRed: e.pRed,
    pFlexible: e.pFlexible,
    pBlue: e.pBlue,
    notes: e.notes
  });
}

function constructMeta(brief, parentDate) {
  if (!Array.isArray(brief.changelog)) {
    throw new Error("Brief missing changelog[] (schema extended in commit 1776352)");
  }
  return {
    snapshotDate: brief.date,
    engineVersion: ENGINE_VERSION,
    parentSnapshot: parentDate,
    briefRef: `briefs/${brief.date}.json`,
    formationStage: brief.formationStage,
    label: brief.formationStage,
    changelog: brief.changelog
  };
}

// ── sim5-parties.js regeneration ──────────────────────────────────────────
function regenerateSim5Parties(snap, currentText) {
  const snapshotBlock = "  const SNAPSHOT = " + JSON.stringify(snap, null, 2) + ";";
  const beginEnd = /(\/\/ BEGIN_SNAPSHOT\n)[\s\S]*?(\n  \/\/ END_SNAPSHOT)/;
  if (!beginEnd.test(currentText)) {
    throw new Error("BEGIN_SNAPSHOT/END_SNAPSHOT sentinels not found in sim5-parties.js");
  }
  let out = currentText.replace(beginEnd, `$1${snapshotBlock}$2`);

  const lengthAssert = /NA_SEATS\.length !== (\d+)/;
  const match = out.match(lengthAssert);
  if (!match) throw new Error("NA_SEATS.length assertion not found");
  out = out.replace(lengthAssert, `NA_SEATS.length !== ${snap.naSeats.length}`);

  // Also patch the error-message literal that echoes the expected count.
  const errMsg = /expected \d+, got/;
  out = out.replace(errMsg, `expected ${snap.naSeats.length}, got`);

  return out;
}

// ── Seeded retrocast ──────────────────────────────────────────────────────
function runSeededRetrocast() {
  execFileSync("node", [RETROCAST_PATH], {
    cwd: REPO_ROOT,
    env: { ...process.env, RETROCAST_SEED: "42" },
    stdio: "inherit"
  });
}

// ── index.html regeneration ───────────────────────────────────────────────
function formatDanishDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}. ${DANISH_MONTHS[m - 1]} ${y}`;
}

function regenerateIndexHtml(snap, timeseries, currentText) {
  let text = currentText;

  // 1. "Senest opdateret: <date> · ..."
  const dateStr = formatDanishDate(snap._meta.snapshotDate);
  const dateRe = /(Senest opdateret: )\d{1,2}\. [a-zæøå]+ \d{4}/;
  if (!dateRe.test(text)) throw new Error("'Senest opdateret' line not found");
  text = text.replace(dateRe, `$1${dateStr}`);

  // 2. DEFAULTS block — only the three data-sourced fields.
  const mSfInGov = snap.parties.M.relationships.SF.inGov;
  const dfMTolerate = snap.parties.DF.relationships.M.tolerateInGov;
  const mElTolerate = snap.parties.M.relationships.EL.tolerateInGov;
  const crossBlocBonus = snap.engineCfg.crossBlocBonus;

  text = replaceDefaultsField(text, "crossBlocBonus", formatNumber(crossBlocBonus, 1));
  text = replaceDefaultsField(text, "mSfInGov", formatNumber(mSfInGov, 2));
  text = replaceDefaultsField(text, "dfMTolerate", formatNumber(dfMTolerate, 2));

  // 3. Slider value= + pill text (three sliders).
  text = replaceSlider(text, "mSfInGov", mSfInGov);
  text = replaceSlider(text, "dfMTolerate", dfMTolerate);
  text = replaceSlider(text, "mElTolerate", mElTolerate);

  // 4. Second mElTolerate site: controlDefaults object.
  const ctrlDefRe = /(const controlDefaults = \{\s*\n\s*mElTolerate:\s*)[0-9.]+/;
  if (!ctrlDefRe.test(text)) throw new Error("controlDefaults.mElTolerate not found");
  text = text.replace(ctrlDefRe, `$1${formatNumber(mElTolerate, 2)}`);

  // 5. TIMELINE_DATA one-liner.
  const tlRe = /(const TIMELINE_DATA = )\[[\s\S]*?\];/;
  if (!tlRe.test(text)) throw new Error("TIMELINE_DATA literal not found");
  text = text.replace(tlRe, `$1${JSON.stringify(timeseries)};`);

  return text;
}

function replaceDefaultsField(text, field, value) {
  // Targets `<field>: <num>,` within the DEFAULTS block only. Using the
  // leading whitespace pattern from the existing file to keep replacement
  // local to DEFAULTS (PRESETS uses a different indent).
  const re = new RegExp(`(DEFAULTS = \\{[\\s\\S]*?\\b${field}: )[0-9.]+`);
  if (!re.test(text)) throw new Error(`DEFAULTS.${field} not found`);
  return text.replace(re, `$1${value}`);
}

function replaceSlider(text, id, value) {
  const pillStr = formatNumberDanishComma(value, 2);
  const attrStr = formatNumber(value, 2);
  const pillRe = new RegExp(`(id="control-${id}-value">)[0-9,.]+(</span>)`);
  if (!pillRe.test(text)) throw new Error(`Slider pill ${id} not found`);
  text = text.replace(pillRe, `$1${pillStr}$2`);
  const attrRe = new RegExp(`(id="control-${id}"[^>]*?\\bvalue=")[0-9.]+(")`);
  if (!attrRe.test(text)) throw new Error(`Slider attr ${id} not found`);
  return text.replace(attrRe, `$1${attrStr}$2`);
}

function formatNumber(n, minDecimals) {
  // Matches existing convention: integers written as-is (e.g. "6"),
  // floats with up to `minDecimals` trailing zeros stripped by JS ("0.5"
  // not "0.50"). For bit-exact match we defer to JS number-to-string.
  return Number.isInteger(n) ? String(n) : String(n);
}

function formatNumberDanishComma(n, _decimals) {
  // Dashboard pills currently show e.g. "0,62" (2dp) and "0,20" (2dp).
  // Match by padding to 2 decimals then swapping dot for comma.
  return n.toFixed(2).replace(".", ",");
}

// ── Summary helpers ───────────────────────────────────────────────────────
function fileSize(p) {
  try { return fs.statSync(p).size; } catch { return null; }
}

function diffReport(aPath, bPath) {
  const a = fs.readFileSync(aPath, "utf8");
  const b = fs.readFileSync(bPath, "utf8");
  if (a === b) return "BYTE-IDENTICAL";
  return `DIFFERS (built=${a.length} chars, committed=${b.length} chars)`;
}

// ── Main ──────────────────────────────────────────────────────────────────
function main() {
  const opts = parseArgs(process.argv.slice(2));
  const brief = JSON.parse(fs.readFileSync(opts.briefPath, "utf8"));
  if (!brief.date) throw new Error("Brief missing date");

  const parent = loadParentSnapshot(brief.date);
  console.log(`[build] brief=${brief.date}  parent=${parent.date}  write=${opts.write}`);

  const snap = buildSnapshot(brief, parent);
  const snapText = JSON.stringify(snap, null, 2);

  if (!opts.write) {
    const outPath = opts.out || path.join("/tmp", `build-staged-${brief.date}.json`);
    fs.writeFileSync(outPath, snapText);
    console.log(`[build] staged snapshot → ${outPath}  (${snapText.length} chars)`);
    const committedPath = path.join(SNAP_DIR, brief.date + ".json");
    if (fs.existsSync(committedPath)) {
      console.log(`[build] vs committed: ${diffReport(outPath, committedPath)}`);
    } else {
      console.log("[build] no committed snapshot for this date yet");
    }
    return;
  }

  // ── Write mode ──
  const touched = [];

  const snapPath = path.join(SNAP_DIR, brief.date + ".json");
  fs.writeFileSync(snapPath, snapText);
  touched.push(snapPath);

  const partiesBefore = fs.readFileSync(PARTIES_PATH, "utf8");
  const partiesAfter = regenerateSim5Parties(snap, partiesBefore);
  fs.writeFileSync(PARTIES_PATH, partiesAfter);
  touched.push(PARTIES_PATH);

  console.log("[build] running seeded retrocast (RETROCAST_SEED=42) …");
  runSeededRetrocast();
  touched.push(TIMESERIES_PATH);

  const timeseries = JSON.parse(fs.readFileSync(TIMESERIES_PATH, "utf8"));
  const htmlBefore = fs.readFileSync(INDEX_PATH, "utf8");
  const htmlAfter = regenerateIndexHtml(snap, timeseries, htmlBefore);
  fs.writeFileSync(INDEX_PATH, htmlAfter);
  touched.push(INDEX_PATH);

  console.log("\n[build] files touched:");
  for (const p of touched) {
    const rel = path.relative(REPO_ROOT, p);
    console.log(`  ${rel}  (${fileSize(p)} bytes)`);
  }
}

main();
