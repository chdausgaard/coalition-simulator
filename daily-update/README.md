# Daily Research Sweep Pipeline

Automated daily updates to the coalition simulator based on overnight
research agent reports.

## Pipeline

1. `research-prompt.md` — prompt template for the deep research agent
2. `apply-update.js` — script that reads a research brief and applies
   parameter changes to sim5-parties.js
3. `run-daily.sh` — orchestrator that runs the research agent, applies
   updates, runs baseline simulation, and appends to the historical
   time series
4. `historical/` — dated simulation results for trendline display

## Changelog convention

Each entry in `historical/timeseries.json` has a `changelog` array. This
must describe **only event-driven changes**: what happened in the real world
and which parameters were adjusted in response. Never reference engine
architecture, structural refactors, or calibration changes — those are
applied uniformly to all dates via the retrocast and are invisible in
the timeline by design. If a date had no political developments, the
changelog should say so (e.g. "Ingen nye politiske signaler").

## Usage

```bash
# Manual: apply a research brief and re-run
node daily-update/apply-update.js daily-update/briefs/2026-03-26.json
node sim5-sweep.js --n 200 --output sweep-results.json

# Automated: full pipeline
bash daily-update/run-daily.sh
```
