# Coalition Simulator

Danish government formation model for the 2026 election. Bloc voting, two-round formateur protocol, Monte Carlo simulation.

## Key files

| File | What |
|------|------|
| `research/model-spec.md` | **Start here.** Full architecture, every design decision, all parameters. |
| `sim5-engine.js` | Simulation engine (bloc voting, scoring, formateur protocol) |
| `sim5-parties.js` | Thin hydrator over `daily-update/snapshots/2026-04-13.json` (latest). **Do not edit by hand** — regenerate from the snapshot. See Frame C notes below. |
| `sim5-coalitions.js` | Coalition enumeration and platform negotiation |
| `index.html` | Interactive dashboard (self-contained HTML). Embeds `TIMELINE_DATA`, `DEFAULTS`, and slider `value=` attributes that are regeneration targets. |
| `daily-update/snapshots/*.json` | Per-date full state snapshots (parties + naSeats + engineCfg + meta). Canonical source of truth for historical state. |
| `daily-update/drift-audit-report.md` | Phase 0 findings + Phase 6 resolution (Section H). |
| `research/calibration.md` | Empirical voting records anchoring P(FOR) values |
| `research/party_briefs/*.md` | Per-party research briefs (13 parties + NA seats) |

## Running

```bash
node -e "const e = require('./sim5-engine.js'); console.log(JSON.stringify(e.simulate({}, 500), null, 2))"
```

### `simulate()` return shape

`simulate(overrides, N)` returns `{ N, pm, govType, topCoalitions, formationRounds, formateurOrder, noGovPct }`.

- `topCoalitions` is an array of objects: `{ govt, pct, avgPPassage, platform, govProfile, support, looseSupport, naSupport }`. Key fields: `govt` (string, e.g. `"S+M+RV+SF"`), `pct` (number, percentage). Multiple entries can share the same `govt` (different support configurations); aggregate by `govt` to get total probability.
- Party data (`sim5-parties.js`) uses `mandates` (not `seats`) and is accessed via named exports (e.g. `p.S`, `p.V`) or `p.PARTIES_LIST` / `p.PARTIES_MAP`.

## Model architecture

Three-state M orientation (center-left / cross-bloc / blue) with cross-bloc fallback. Opposition coordination prevents independence-artifact inflation of thin-coalition passage rates. Two-part majority gap penalty. Blue-origin løsgængere never support red/center-red governments. See `sim5-engine.js` for current parameter defaults and `sim5-parties.js` for calibration values.

## Daily update pipeline

`daily-update/` is the parameter update pipeline. Architecture as of the Frame C refactor:

- **`briefs/<date>.json`** — authored JSON diffs (the research agent's output). Format has evolved: later briefs use full-path parameter keys (`"relationships.V.inGov"`); earlier briefs pack multiple fields into compact arrow form (`"V→S"` with `"inGov/asSupport/tolerateInGov/asPM"`).
- **`snapshots/<date>.json`** — per-date full state. Immutable once written. Schema: `{ _meta, parties, naSeats, engineCfg }`. `_meta` carries `snapshotDate`, `engineVersion`, `parentSnapshot`, `briefRef`, `formationStage`, `label`, `changelog`.
- **`retrocast.js`** — reads `snapshots/` in date order, swaps each into `Sim5Parties.PARTIES_MAP` / `NA_SEATS` in place (preserving object identity — the engine holds cached refs), runs `simulate()` under `snap.engineCfg`, writes `historical/timeseries.json`.
- **`build.js`** — canonical write path. `node build.js <brief> --out <path>` reads brief + parent snapshot, asserts each `oldValue` against the parent, applies `newValue`s, and writes a staged snapshot (read-only against the repo). `--write` instead writes `snapshots/<date>.json`, regenerates `sim5-parties.js` (SNAPSHOT block + NA_SEATS.length), runs full retrocast (~30–35 min at N=30000), and regenerates `index.html` (TIMELINE_DATA + DEFAULTS + slider defaults + controlDefaults). **Only run `--write` on the latest brief** — older briefs would embed an older date's snapshot into `sim5-parties.js`. Bit-identity between `build.js --out` and the committed snapshot is the durable correctness invariant; see `/tmp/validate-phase4.js`-style harnesses.

`sim5-parties.js` is a thin hydrator over `snapshots/2026-04-13.json` (the latest). The embedded region is delimited by `BEGIN_SNAPSHOT` / `END_SNAPSHOT` sentinel comments; `build.js` regex-targets that region.

### Timeline retrocast semantics

Retrocast runs all dates in a **single Node process** at N=30000. Per-date state comes from the corresponding `snapshots/<date>.json`; there's no longer a REVERT-chain to replay. Object identity of `PARTIES_MAP` entries and `NA_SEATS` is preserved across date iterations via in-place mutation, because the engine caches references to these at module load.

### Phase 6 (complete)

Drift audit's open queue is empty. See `daily-update/drift-audit-report.md` Section H for the commit-by-commit resolution. The bit-identity invariant — `build.js --out <brief>` matches `snapshots/<date>.json` byte-for-byte — now holds for all 7 authored briefs and is the gate for any future snapshot edits.

Sections B/C of the audit (REVERT chain `from` documentation drift) are intentionally unaddressed: runtime-irrelevant, obsoleted by Phase 1's snapshot materialization.

## Dashboard tabs

- **Resultater**: top 10 coalitions with forståelsespapir split, platform, governability
- **Koalitionsbygger**: click parties to test custom coalitions
- **Tidslinje**: coalition probabilities over time (from daily updates)
- **Hvad påvirker resultatet?**: Sobol sensitivity analysis, response curves
- **Sådan virker modellen**: methodology documentation
