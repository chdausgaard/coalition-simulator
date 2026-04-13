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
| `daily-update/drift-audit-report.md` | Phase 0 findings; enumerates known data-drift sites that Phase 6 will fix. |
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
- **`apply-update.js`** — LEGACY, only handles `globalHarshness` regex-patching. To be deleted once `build.js` lands.
- **`build.js`** — NOT YET IMPLEMENTED. Planned: brief + parent snapshot → new snapshot + regenerated `sim5-parties.js` + regenerated `index.html` (TIMELINE_DATA, DEFAULTS, slider defaults) + run retrocast.

`sim5-parties.js` is a thin hydrator over `snapshots/2026-04-13.json` (the latest). The embedded region is delimited by `BEGIN_SNAPSHOT` / `END_SNAPSHOT` sentinel comments. `build.js` will regex-target that region.

### Timeline retrocast semantics

Retrocast runs all dates in a **single Node process** at N=30000. Per-date state comes from the corresponding `snapshots/<date>.json`; there's no longer a REVERT-chain to replay. Object identity of `PARTIES_MAP` entries and `NA_SEATS` is preserved across date iterations via in-place mutation, because the engine caches references to these at module load.

### Known drift (Phase 6 queue)

See `daily-update/drift-audit-report.md`. Summary:
- Dashboard slider defaults + `DEFAULTS` block + engine `CI_DEFAULTS` for `mSfInGov`, `mElTolerate`, `dfMTolerate` are stale against live bilateral values (7 sites).
- Un-captured `V/KF/LA → S.{asSupport, asPM}` in `REVERT_APRIL_02` / `REVERT_APRIL_06` snapshots may be deliberate modeling narrowing or silent un-application — requires brief-vs-live verification gate before fixing.
- Pre-April-1 GL probabilities missing from 4 early-date snapshots; 1 date (`2026-03-30`) has wrong hardcoded values via `revertGLCorrelated`.

## Dashboard tabs

- **Resultater**: top 10 coalitions with forståelsespapir split, platform, governability
- **Koalitionsbygger**: click parties to test custom coalitions
- **Tidslinje**: coalition probabilities over time (from daily updates)
- **Hvad påvirker resultatet?**: Sobol sensitivity analysis, response curves
- **Sådan virker modellen**: methodology documentation
