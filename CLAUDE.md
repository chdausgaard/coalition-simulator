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

## Current output (~N=5000, post 2026-03-28 update)

S+M+RV+SF ~24%, S+M+SF ~20%, S+RV+SF ~11%, V+KF+LA+M ~10%, V+KF+M ~7%.

DemandGov-aware confidence check eliminates sub-90 coalitions through model mechanics. Equal viability thresholds for red and blue (0.75). M orientation 50/50. Two løsgængere (pBlue=0.60) make S+RV+SF viable when both draw non-blue (~16% of iterations).

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
