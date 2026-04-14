# Frame C — Phase 0 drift audit

Generated: 2026-04-13T14:22:16.040Z

Read-only audit. Compares:
- `sim5-parties.js` (live values)
- `daily-update/retrocast.js` (REVERT_* blocks + HISTORICAL_OVERRIDES)
- `index.html` (slider `value=` defaults + DEFAULTS block)
- `sim5-engine.js` (CI_DEFAULTS)

Tolerance: `|a − b| < 1e-9`.

## Critical interpretation — read before the tables

Verified at `daily-update/retrocast.js:430-433`: `applyOverride(key, spec.to)` never consults `spec.from`. The `from` field is pure documentation, not an assertion. This splits the findings below into two categories:

- **Functional drift (Checks D, E, F)** — real bugs that affect runtime behavior. Dashboard shows stale slider defaults; engine's `isUserSet` check misclassifies the live value. These are **Phase 6 targets**.
- **Documentation drift (Checks B, C)** — the `from` annotations in REVERT blocks use inconsistent conventions (sometimes "= live value," sometimes "= pre-this-change state," sometimes "= post-newer-reverts state"). Retrocast runtime is unaffected because `from` is never asserted. **Not a Phase 6 target** — obsoleted by Phase 1: snapshots materialize the `to` chain into full states, dropping the `from` convention entirely.

Check A (latest REVERT block's `from` vs. live) is all ✓ — the most recent block is cleanly documented and doubles as the brief's own `oldValue` record.

**Initial finding: 3 sliders + 2 DEFAULTS + 2 CI_DEFAULTS = 7 drift sites in dashboard/engine defaults.** All three trace to the same three bilaterals: `mSfInGov`, `mElTolerate`, `dfMTolerate`.

**Additional finding — un-captured edits in REVERT blocks (brief↔REVERT cross-check).** The initial Check B/C report above only tests `from` annotation chain consistency, which doesn't matter at runtime. The real test is whether each REVERT block covers all keys changed in the corresponding `briefs/<DATE>.json`. Running that cross-check:

- `REVERT_APRIL_13` ↔ `briefs/2026-04-13.json`: **clean** (9 common keys, 9/9 chain-valid).
- `REVERT_APRIL_09` ↔ `briefs/2026-04-09.json`: 7/7 chain-valid. `crossBlocBonus` 5→6 is in brief but handled via `HISTORICAL_OVERRIDES.cfgOverrides` for pre-April-9 dates. OK.
- `REVERT_APRIL_04_BP` ↔ `briefs/2026-04-04.json`: 11/11 chain-valid. `BP.mandates` 3→2 handled via `mandateOverrides`. OK.
- `REVERT_APRIL_06` ↔ `briefs/2026-04-06.json`: 7/7 chain-valid, **but 6 brief fields are NOT in REVERT**: `V→S.{asSupport, asPM}`, `KF→S.{asSupport, asPM}`, `LA→S.{asSupport, asPM}`. These are the "remaining 60% of blue pivot" for asSupport/asPM dimensions that REVERT captured only for `inGov` and `tolerateInGov`.
- `REVERT_APRIL_02` ↔ `briefs/2026-04-02.json`: 3/9 chain-valid. The 6 same asSupport/asPM fields missing as above (the 40% tranche). Also: `LG-LA.pFlexible` 0.32→0.40 is in brief but not captured anywhere. Also: `cfg.crossBlocBonus` 2→5 handled via `cfgOverrides` for pre-April-2 dates. OK for the cfg case.
- `REVERT_APRIL_01` ↔ `briefs/2026-04-01.json`: 1/1 chain-valid on EL.globalHarshness. **6 NA-seat probability changes (`GL-IA.{pRed, pFlexible, pBlue}`, `GL-NAL.{pRed, pFlexible, pBlue}`) are NOT captured in REVERT_APRIL_01.** These are partially handled via `naOverrides: NA_OVERRIDES_PRE_APRIL_01` attached to `HISTORICAL_OVERRIDES["2026-03-31"]`, but **not attached to earlier dates** `2026-03-24`, `2026-03-26`, `2026-03-28`, `2026-03-29`. Those earlier retrocasts use live (post-April-1) NA probs. Also `2026-03-30` uses `revertGLCorrelated` which sets different hardcoded values (pRed:0.65/0.30 for GL-IA, 0.50/0.40 for GL-NAL) that don't match the pre-April-1 values (0.55/0.40 for GL-IA, 0.42/0.48 for GL-NAL).

**Functional impact — these un-captured edits affect simulated coalition probabilities for dates before the un-captured change.** `V/KF/LA → S.asSupport` bilaterals directly shape blue-bloc-propping-centre-left coalition support scoring. `GL-NAL.pRed` etc. shape NA mandate draws for ~3 valgaften/early-forhandlinger dates.

**Total Phase 6 scope** after both audits:
- 7 dashboard/engine default drift sites (original finding).
- 6 un-captured fields in April-02 + April-06 REVERT blocks (blue-pivot asSupport/asPM).
- 1 un-captured field in April-02 (LG-LA.pFlexible).
- 4 dates missing naOverrides for pre-April-1 NA probs (2026-03-24, 03-26, 03-28, 03-29).
- 1 date (2026-03-30) with incorrect hardcoded GL probs via revertGLCorrelated.
- **Added by Phase 4 build.js validation (see Section G):** 2 more un-captured baseline fields — `SF.participationPref.government` (2026-03-24 snapshot, implicated by 03-26 brief) and `engineCfg.crossBlocBonus` (2026-04-01 snapshot, implicated by 04-02 brief).

These are all **corrective Phase 6 targets** — not things Phase 1 materialization should fix. Phase 1 reproduces the current (buggy) retrocast behavior faithfully so Phase 2's seed-pinned validation can confirm refactor correctness. Phase 6 then applies these corrections to snapshot files directly, with each commit's timeseries diff documenting what the bug was actually doing.

## Summary

| Check | Description | Mismatches |
|---|---|---|
| A | REVERT_APRIL_13 `from` vs. live `sim5-parties.js` | 0 / 9 |
| B | Chain consistency: newer `to` == older `from` | 15 / 19 |
| C | Ad-hoc 2026-03-24 overrides `from` vs. expected | 19 / 20 |
| D | `index.html` slider defaults vs. live | 3 / 3 |
| E | `index.html` DEFAULTS block vs. live | 2 / 2 |
| F | `sim5-engine.js` CI_DEFAULTS vs. live | 2 / 3 |

HISTORICAL_OVERRIDES dates monotonic: **yes**

---

## A. REVERT_APRIL_13.from vs. live

The newest REVERT block reverts today's change. Its `from` values should equal current live values in `sim5-parties.js`.

| Key | REVERT.from | live | match |
|---|---|---|---|
| `M.relationships.V.inGov` | 0.72 | 0.72 | ✓ |
| `M.relationships.SF.inGov` | 0.5 | 0.5 | ✓ |
| `V.participationPref.government` | 0.6 | 0.6 | ✓ |
| `V.participationPref.opposition` | 0.3 | 0.3 | ✓ |
| `V.relationships.S.inGov` | 0.35 | 0.35 | ✓ |
| `V.positions.fiscal.weight` | 0.85 | 0.85 | ✓ |
| `RV.relationships.V.inGov` | 0.3 | 0.3 | ✓ |
| `S.relationships.V.inGov` | 0.35 | 0.35 | ✓ |
| `S.relationships.KF.inGov` | 0.4 | 0.4 | ✓ |

## B. Chain consistency across REVERT_* blocks

When two REVERT blocks touch the same key, applying the newer revert should land on the older revert's `from` value. Formally: for each key K that appears in newer block Bn and older block Bo (with no intermediate block touching K), `Bn.to[K] == Bo.from[K]`.

| Key | newer block.to | older block.from | match |
|---|---|---|---|
| `M.relationships.SF.inGov` | REVERT_APRIL_13.to = 0.58 | REVERT_APRIL_02.from = 0.58 | ✓ |
| `V.relationships.S.inGov` | REVERT_APRIL_13.to = 0.32 | REVERT_APRIL_06.from = 0.32 | ✓ |
| `V.relationships.S.inGov` | REVERT_APRIL_06.to = 0.18 | REVERT_APRIL_02.from = 0.32 | **✗** |
| `EL.globalHarshness` | REVERT_APRIL_09.to = 0.5 | REVERT_APRIL_01.from = 0.5 | ✓ |
| `M.globalHarshness` | REVERT_APRIL_09.to = 0.35 | REVERT_APRIL_02.from = 0.35 | ✓ |
| `V.relationships.S.tolerateInGov` | REVERT_APRIL_06.to = 0.2 | REVERT_APRIL_02.from = 0.35 | **✗** |
| `KF.relationships.S.inGov` | REVERT_APRIL_06.to = 0.42 | REVERT_APRIL_02.from = 0.52 | **✗** |
| `KF.relationships.S.tolerateInGov` | REVERT_APRIL_06.to = 0.76 | REVERT_APRIL_02.from = 0.82 | **✗** |
| `LA.relationships.S.inGov` | REVERT_APRIL_06.to = 0.05 | REVERT_APRIL_02.from = 0.08 | **✗** |
| `LA.relationships.S.tolerateInGov` | REVERT_APRIL_06.to = 0.07 | REVERT_APRIL_02.from = 0.15 | **✗** |
| `V.relationships.BP.inGov` | REVERT_APRIL_04_BP.to = 0.12 | REVERT_PRE_MARCH_31_BP.from = 0.1 | **✗** |
| `V.relationships.BP.asSupport` | REVERT_APRIL_04_BP.to = 0.3 | REVERT_PRE_MARCH_31_BP.from = 0.26 | **✗** |
| `V.relationships.BP.tolerateInGov` | REVERT_APRIL_04_BP.to = 0.35 | REVERT_PRE_MARCH_31_BP.from = 0.3 | **✗** |
| `KF.relationships.BP.inGov` | REVERT_APRIL_04_BP.to = 0.2 | REVERT_PRE_MARCH_31_BP.from = 0.18 | **✗** |
| `KF.relationships.BP.asSupport` | REVERT_APRIL_04_BP.to = 0.35 | REVERT_PRE_MARCH_31_BP.from = 0.3 | **✗** |
| `KF.relationships.BP.tolerateInGov` | REVERT_APRIL_04_BP.to = 0.4 | REVERT_PRE_MARCH_31_BP.from = 0.35 | **✗** |
| `LA.relationships.BP.inGov` | REVERT_APRIL_04_BP.to = 0.3 | REVERT_PRE_MARCH_31_BP.from = 0.28 | **✗** |
| `LA.relationships.BP.asSupport` | REVERT_APRIL_04_BP.to = 0.45 | REVERT_PRE_MARCH_31_BP.from = 0.4 | **✗** |
| `LA.relationships.BP.tolerateInGov` | REVERT_APRIL_04_BP.to = 0.5 | REVERT_PRE_MARCH_31_BP.from = 0.45 | **✗** |

## C. Ad-hoc 2026-03-24 overrides

Keys in `HISTORICAL_OVERRIDES['2026-03-24'].overrides` that aren't already covered (or are overridden) by the spreaded `REVERT_*` blocks. Their `from` should equal the state reached after applying all newer REVERTs to live.

| Key | ad-hoc.from | expected (post-chain) | match | chain |
|---|---|---|---|---|
| `M.relationships.SF.inGov` | 0.58 | 0.62 | **✗** | REVERT_APRIL_13: 0.5→0.58; REVERT_APRIL_02: 0.58→0.62 |
| `V.relationships.S.inGov` | 0.32 | 0.08 | **✗** | REVERT_APRIL_13: 0.35→0.32; REVERT_APRIL_06: 0.32→0.18; REVERT_APRIL_02: 0.32→0.08 |
| `SF.globalHarshness` | 0.4 | 0.55 | **✗** | REVERT_APRIL_09: 0.4→0.55 |
| `EL.globalHarshness` | 0.38 | 0.56 | **✗** | REVERT_APRIL_09: 0.38→0.5; REVERT_APRIL_01: 0.5→0.56 |
| `M.globalHarshness` | 0.35 | 0.32 | **✗** | REVERT_APRIL_09: 0.4→0.35; REVERT_APRIL_02: 0.35→0.32 |
| `V.relationships.S.tolerateInGov` | 0.35 | 0.1 | **✗** | REVERT_APRIL_06: 0.35→0.2; REVERT_APRIL_02: 0.35→0.1 |
| `KF.relationships.S.inGov` | 0.52 | 0.35 | **✗** | REVERT_APRIL_06: 0.52→0.42; REVERT_APRIL_02: 0.52→0.35 |
| `KF.relationships.S.tolerateInGov` | 0.82 | 0.72 | **✗** | REVERT_APRIL_06: 0.82→0.76; REVERT_APRIL_02: 0.82→0.72 |
| `LA.relationships.S.inGov` | 0.08 | 0.03 | **✗** | REVERT_APRIL_06: 0.08→0.05; REVERT_APRIL_02: 0.08→0.03 |
| `LA.relationships.S.tolerateInGov` | 0.15 | 0.02 | **✗** | REVERT_APRIL_06: 0.15→0.07; REVERT_APRIL_02: 0.15→0.02 |
| `V.relationships.BP.inGov` | 0.1 | 0.2 | **✗** | REVERT_APRIL_04_BP: 0.1→0.12; REVERT_PRE_MARCH_31_BP: 0.1→0.2 |
| `V.relationships.BP.asSupport` | 0.26 | 0.4 | **✗** | REVERT_APRIL_04_BP: 0.26→0.3; REVERT_PRE_MARCH_31_BP: 0.26→0.4 |
| `V.relationships.BP.tolerateInGov` | 0.3 | 0.45 | **✗** | REVERT_APRIL_04_BP: 0.3→0.35; REVERT_PRE_MARCH_31_BP: 0.3→0.45 |
| `KF.relationships.BP.inGov` | 0.18 | 0.3 | **✗** | REVERT_APRIL_04_BP: 0.18→0.2; REVERT_PRE_MARCH_31_BP: 0.18→0.3 |
| `KF.relationships.BP.asSupport` | 0.3 | 0.45 | **✗** | REVERT_APRIL_04_BP: 0.3→0.35; REVERT_PRE_MARCH_31_BP: 0.3→0.45 |
| `KF.relationships.BP.tolerateInGov` | 0.35 | 0.5 | **✗** | REVERT_APRIL_04_BP: 0.35→0.4; REVERT_PRE_MARCH_31_BP: 0.35→0.5 |
| `LA.relationships.BP.inGov` | 0.28 | 0.4 | **✗** | REVERT_APRIL_04_BP: 0.28→0.3; REVERT_PRE_MARCH_31_BP: 0.28→0.4 |
| `LA.relationships.BP.asSupport` | 0.4 | 0.55 | **✗** | REVERT_APRIL_04_BP: 0.4→0.45; REVERT_PRE_MARCH_31_BP: 0.4→0.55 |
| `LA.relationships.BP.tolerateInGov` | 0.45 | 0.6 | **✗** | REVERT_APRIL_04_BP: 0.45→0.5; REVERT_PRE_MARCH_31_BP: 0.45→0.6 |
| `ALT.globalHarshness` | 0.48 | 0.48 | ✓ | (no REVERT blocks touch this key; `from` should equal live) |

## D. index.html slider defaults vs. live

Dashboard slider `value=` attributes. These are the values the dashboard shows on load and resets to; they should track the live bilateral relationships.

| Slider | HTML value | live path | live | match |
|---|---|---|---|---|
| `mSfInGov` | 0.62 | `M.relationships.SF.inGov` | 0.5 | **✗** |
| `mElTolerate` | 0.35 | `M.relationships.EL.tolerateInGov` | 0.1 | **✗** |
| `dfMTolerate` | 0.2 | `DF.relationships.M.tolerateInGov` | 0.05 | **✗** |

## E. index.html DEFAULTS block

The `const DEFAULTS = { ... }` block at the top of the dashboard script. These are the values the dashboard's reset-button reverts to.

| Field | HTML value | live path | live | match | note |
|---|---|---|---|---|---|
| `crossBlocBonus` | 6 | — | — | n/a | engine cfg default, no live counterpart |
| `mSfInGov` | 0.62 | `M.relationships.SF.inGov` | 0.5 | **✗** |  |
| `dfMTolerate` | 0.2 | `DF.relationships.M.tolerateInGov` | 0.05 | **✗** |  |

## F. sim5-engine.js CI_DEFAULTS

The engine's `CI_DEFAULTS` table determines which slider values are considered "user-set" (sigma-override skipped) vs. default (sigma-override applied). Drift here means the confidence-interval noise is applied even when the dashboard shows the live value as "default."

| Field | CI_DEFAULTS value | live path | live | match |
|---|---|---|---|---|
| `mElTolerate` | 0.1 | `M.relationships.EL.tolerateInGov` | 0.1 | ✓ |
| `mSfInGov` | 0.62 | `M.relationships.SF.inGov` | 0.5 | **✗** |
| `dfMTolerate` | 0.2 | `DF.relationships.M.tolerateInGov` | 0.05 | **✗** |

## Interpretation

- **Check A fails** → REVERT_APRIL_13 is stale relative to today's state (or today's sim5-parties.js was hand-edited inconsistently with the brief).
- **Check B fails** → historical retrocast has been silently applying a wrong pre-state to at least one date; the numeric timeseries is suspect for dates earlier than the break.
- **Check C fails** → 2026-03-24 valgaften baseline is built on an incorrect pre-chain assumption.
- **Check D/E fails** → dashboard shows stale slider defaults; users resetting to default get a different baseline than a fresh page load computes.
- **Check F fails** → compound with Check D/E. When the dashboard submits the slider default (e.g., `mSfInGov = 0.62`), the engine at `sim5-engine.js:1329-1330` overwrites the live `M.relationships.SF.inGov` (0.50) with cfg value (0.62). The per-iteration CI-noise skip guard at `sim5-engine.js:1390` checks `isUserSet("mSfInGov")`: `|cfg - CI_DEFAULT| = |0.62 - 0.62| = 0`, so `isUserSet = false` and CI noise IS applied. Net effect: simulation uses 0.62 ± noise where it should use 0.50 ± noise. Fixing CI_DEFAULTS alone wouldn't help (would flip the guard to `isUserSet = true`, skipping noise, but still using 0.62 as the base). Real fix requires both the slider-default and CI_DEFAULTS to track live.

All failures are data bugs to be fixed in **Phase 6 (separate commits)**, after the refactor preserves current behavior through Phases 1–5.

---

## G. build.js validation findings (Phase 4)

Phase 4's `daily-update/build.js` asserts each brief's `oldValue` against the parent snapshot's actual value before applying the `newValue`. Running build.js in dry-run mode against all 7 authored briefs produces:

| Brief | Parent | Status |
|---|---|---|
| 2026-03-26 | 2026-03-24 | ✗ assertion failure (1 field) |
| 2026-04-01 | 2026-03-31 | ✓ bit-identical |
| 2026-04-02 | 2026-04-01 | ✗ assertion failure (1 field) |
| 2026-04-04 | 2026-04-03 | ✓ bit-identical |
| 2026-04-06 | 2026-04-05 | ✗ assertion failure (6 fields) |
| 2026-04-09 | 2026-04-06 | ✓ bit-identical |
| 2026-04-13 | 2026-04-09 | ✓ bit-identical |

**Current pass rate: 4 / 7.**

### The unifying pattern

All three failures are instances of a single structural issue, not three independent bugs:

> A brief authored on date `D` claims a pre-state for some field, but the snapshot dated strictly before `D` never materialized that pre-state — it carries either the live (post-brief) value or a value set by a non-brief override path. Phase 1 materialized snapshots by walking the REVERT chain backward from live, and the REVERT blocks captured only the fields their authors remembered to include, not the full set the briefs touched. So fields touched by briefs but missing from REVERTs inherit live values into "historical" snapshots.

Equivalent restatement: snapshots are supposed to be derived from briefs, but for un-captured fields the direction silently inverted in Phase 1 — live `sim5-parties.js` values leaked backward into historical snapshots, and any brief that tried to start from a different assumed baseline now asserts false when build.js runs it against that snapshot.

### Instances

| Date | Field(s) | Parent has | Committed child has | Brief claims | Sub-pattern |
|---|---|---|---|---|---|
| 2026-03-26 | `SF.participationPref.government` | 0.96 | 0.96 | 0.92 → 0.96 | No-op: brief claims a change that the snapshot chain was already past |
| 2026-04-02 | `engineCfg.crossBlocBonus` | 1 | 5 | 2 → 5 | Mis-baselined: `cfgOverrides` set pre-April-2 to 1, but the brief author assumed 2 |
| 2026-04-06 | `V→S.{asSupport, asPM}`, `KF→S.{asSupport, asPM}`, `LA→S.{asSupport, asPM}` (6 fields) | 0.12 / 0.02 / 0.6 / 0.12 / 0.05 / 0.1 | same as parent | brief's `new` values (0.40 / 0.18 / 0.74 / 0.22 / 0.18 / 0.02) | Dropped: REVERT_APRIL_06 captured only inGov + tolerateInGov; asSupport + asPM never reached the snapshot chain |

These sit on a continuum:
- 03-26 pattern (no-op): brief can be made consistent by back-filling the pre-state into the 03-24 snapshot (SF.participationPref.government 0.96 → 0.92). Numeric output of the retrocast for 03-24 will shift; subsequent dates pick up the brief's newValue.
- 04-02 pattern (mis-baselined): back-fill `crossBlocBonus` in pre-04-02 snapshots to match brief's implied baseline (2 instead of 1). Note this compounds with the existing `HISTORICAL_OVERRIDES.cfgOverrides` which encoded 1; that override needs to migrate into the snapshot meta.
- 04-06 pattern (dropped): back-fill the missing asSupport/asPM values into 04-06 *and subsequent* snapshots, so the brief's newValues are reflected in all forward-looking state. This is the most impactful fix — it alters V/KF/LA scoring in all post-04-06 coalitions.

### Phase 6 gate proposal

Use build.js validation as the progress metric for Phase 6's un-captured-field sweep:

```
node /tmp/validate-phase4.js   # or equivalent harness
```

Target: pass rate moves from 4 / 7 → 7 / 7. When all 7 briefs produce bit-identical snapshots from their parents, the snapshot chain is internally consistent with the brief record. That becomes the durable correctness invariant for the pipeline: **every committed snapshot is exactly what build.js would produce from the corresponding brief + its parent.**

Per-fix commit shape:
1. Identify target brief whose assertion fails (start with the smallest-scope case: 03-26).
2. Back-fill the pre-state field into all snapshots dated strictly before that brief's date.
3. Re-run retrocast (unseeded is fine here — the diff that matters is the snapshot change, not the Monte Carlo draw).
4. Re-run build.js validator; confirm the target brief now passes.
5. Commit with the new pass-rate in the message (e.g., "Phase 6: back-fill SF.participationPref.government for 03-24; build.js 4/7 → 5/7").

Open question to revisit during Phase 6: for the 04-06 dropped pattern, back-filling the missing asSupport/asPM values into 04-06+ changes simulated coalition behavior from 04-06 onward. That's a real model update, not just data cleanup. Decide whether the brief's authored values are what we want the model to reflect (i.e., trust the brief author's judgment) or whether they need re-adjudication against the underlying narrative before landing. The handoff's default posture — "brief is authored truth" — argues for the former.
