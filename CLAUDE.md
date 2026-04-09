# Coalition Simulator

Danish government formation model for the 2026 election. Bloc voting, two-round formateur protocol, Monte Carlo simulation.

## Key files

| File | What |
|------|------|
| `research/model-spec.md` | **Start here.** Full architecture, every design decision, all parameters. |
| `sim5-engine.js` | Simulation engine (bloc voting, scoring, formateur protocol) |
| `sim5-parties.js` | Party data (positions, relationships, harshness) |
| `sim5-coalitions.js` | Coalition enumeration and platform negotiation |
| `index.html` | Interactive dashboard (self-contained HTML) |
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

`daily-update/` contains the parameter update pipeline: research prompt, apply script, timeseries.
See `daily-update/historical/timeseries.json` for the coalition probability timeline.

### Timeline retrocast without noise

Timeline entries must be generated in a **single Node process** at N≥30000 to avoid inter-process MC variance. The retrocast script (`daily-update/retrocast.js`) handles this: it runs all dates sequentially, temporarily reverting brief-driven parameter changes and mandate counts for earlier dates. When adding a new date, run the full retrocast rather than generating the new entry separately — otherwise the numbers won't be comparable across dates.

## Dashboard tabs

- **Resultater**: top 10 coalitions with forståelsespapir split, platform, governability
- **Koalitionsbygger**: click parties to test custom coalitions
- **Tidslinje**: coalition probabilities over time (from daily updates)
- **Hvad påvirker resultatet?**: Sobol sensitivity analysis, response curves
- **Sådan virker modellen**: methodology documentation
