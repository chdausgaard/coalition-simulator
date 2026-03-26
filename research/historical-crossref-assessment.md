# Historical cross-reference assessment — sim5 model vs. Danish formation record (1973-2026)

*Assessment date: 2026-03-26*
*Sources: `research/model-spec.md`, `research/historical-formations-report.md`, sim5 engine code*

---

## Executive summary

The sim5 model's architecture is structurally sound: bloc voting, stochastic parameter draws, two-stage formateur protocol, forståelsespapir mechanism, and dyad acceptance gates all map to real institutional features of Danish government formation. The issues identified below are about missing mechanisms and parameter calibration within an otherwise correct structure, not about rebuilding the engine.

Six findings would change the output distribution. Their net effect would compress probability mass away from the dominant S+M+RV+SF (~47%) toward multiple viable configurations with different support arrangements — closer to what the historical record shows about Danish formation outcomes.

---

## Findings

### 1. No cross-bloc budget pivot mechanism (large impact)

**Historical pattern.** When a government's natural støtteparti defects, the government pivots to the other bloc. This is a core feature of Danish minority governance:

- Thorning FL 2014: EL refused the budget; the government negotiated with V and KF instead.
- Nyrup's efterløn reform (1998): negotiated with the blue bloc, bypassing SF and EL entirely.
- Schlüter era (1982-1993): compartmentalized policy areas — RV supported economic policy while opposing security policy simultaneously.
- The historical synthesis: "No sitting government has simply failed to pass a budget... a government will always find someone to pass a budget with."

**What the model does.** `computePpassage` simulates a single up-or-down budget vote where each party independently draws FOR/ABSTAIN/AGAINST. If EL draws AGAINST, those 11 mandates count against the government. There is no mechanism for the formateur to pivot right and negotiate budget components with blue parties when left support collapses.

**Directional effect.** Systematically understates the viability of governments without rock-solid EL support. S+M+SF (~20%, avg P(passage)=0.930 conditional on forståelsespapir success), S+M+RV (~3%, avg P(passage)=0.675), and S+RV+SF (~17%, avg P(passage)=0.758) are probably more viable than the model suggests, because the historical norm is that determined governments survive through *vekslende flertal* (changing majorities per issue).

This is the single largest gap between the model and the historical record.

---

### 2. EL's 93% FOR with forståelsespapir is calibrated on the wrong government type (medium impact)

**Historical pattern.** The 93% calibration comes from Frederiksen I (2019-2022), where EL voted for all three finanslove. But Frederiksen I was a *pure S minority government* with no centrist or right-wing coalition partners. Under Thorning (2011-2015) — a three-party government including the centrist RV — EL's support was unreliable:

| Year | EL vote | Notes |
|------|---------|-------|
| FL 2012 | FOR | First time ever; EL hovedbestyrelse approved 15-9 |
| FL 2013 | FOR | "Nødtvungent" (reluctantly) |
| FL 2014 | AGAINST | Government pivoted to V and KF |
| FL 2015 | FOR | |

The pattern: EL's support degrades when the government includes centrist partners who pull policy rightward. With M in government (pulling further right than RV did under Thorning), internal EL politics would be even more contested.

**What the model does.** EL gets 93% FOR with forståelsespapir regardless of government composition. The same probability applies to S+SF (pure red) and S+M+RV+SF (broad center including M).

**Directional effect.** P(passage) for S+M+RV+SF is probably overstated. A realistic EL FOR rate with forståelsespapir might be 75-85% when M is a coalition partner, reflecting the Thorning-era pattern. This would narrow the gap between S+M+RV+SF and its competitors.

---

### 3. NoGov at ~4% contradicts 50 years of outcomes (small-medium impact)

**Historical pattern.** The formation process has never failed to produce a government. When the primary formateur fails, the process restarts:

- 1975: four dronningerunder over 35 days
- 1988: four rounds, resulting in the unexpected KVR coalition
- 2015: two rounds (Løkke failed at majority government, succeeded with 34-seat solo V)
- The report: "the formation process is messy, slow, and often produces unexpected results — but it has never failed to produce a government"

**What the model does.** S formateur tries (controlled by `maxFormationRounds`), then a blue fallback with low threshold (0.10). If both fail, the result is NoGov. The model doesn't capture the iterative kongerunde process where the mandate gets modified, thresholds keep dropping, and configurations nobody predicted become viable.

**Directional effect.** The ~4% allocated to NoGov should be redistributed to marginal formations. Historically, these iterations produce desperate governments (Hartling's 22 seats, Løkke's 34 seats) or unexpected configurations. The model's two-stage protocol (S then blue) is too rigid — more fallback stages or a recursive process would better match the historical pattern.

---

### 4. Opposition abstention norm is missing from the budget model (medium impact, primarily for blue governments)

**Historical pattern.** There is a strong norm that the main opposition party abstains rather than votes against budgets:

- 1989: S abstained on the KVR finanslov, allowing passage with only 63 FOR votes — the first time a budget passed without a proper majority.
- AJ's decision to vote against in 1983 was "considered a break with tradition."
- The general norm: "the main opposition party would rather abstain than actively topple a government via budget rejection."

**What the model does.** For opposite-bloc parties, the base rate is 0.05 FOR. After the final conversion (70/30 against-to-abstain split), an opposite-bloc party votes:

- FOR: ~5%
- AGAINST: ~67%
- ABSTAIN: ~29%

The model has the main opposition voting AGAINST two-thirds of the time. The historical norm points toward abstention as the dominant response.

**Directional effect.** This primarily affects blue government viability. If S (38 seats) abstains rather than votes against a V-led government, 38 mandates shift from the AGAINST column to ABSTAIN. V+KF+LA+M currently gets ~8% with P(passage)=0.132. With a proper abstention norm for the largest opposition party, P(passage) would be substantially higher. The against:abstain ratio for the main opposition should be closer to 30:70, not 70:30.

---

### 5. No informal EL support tier between forståelsespapir and nothing (medium impact)

**Historical pattern.** The forståelsespapir is a post-2019 innovation:

> "Before 2019, all støtteparti arrangements were informal, based on case-by-case negotiations. Frederiksen I's 18-page forståelsespapir was the first formalized written agreement between a government and its external supporters."

EL voted for budgets without any forståelsespapir:
- FL 2012 (Thorning): voted FOR based on informal negotiations
- FL 2013 (Thorning): voted FOR reluctantly
- FL 2015 (Thorning): voted FOR

DF supported every VK budget for a decade (2001-2011) with no written compact. Informal arrangements are the historical norm; the forståelsespapir is the exception.

**What the model does.** EL's behavior is binary: 93% FOR with forståelsespapir, 3% FOR without. There is no intermediate "informal arrangement" state.

**Directional effect.** The 3% without forståelsespapir is too low. EL voted FOR under Thorning without any forståelsespapir. A realistic "informal arrangement" rate might be 40-60% FOR — much lower than the 93% with a formal agreement, but much higher than 3%. This would make iterations where the forståelsespapir negotiation fails less catastrophic, particularly for S+M+RV+SF when M vetoes the EL deal.

---

### 6. Four-party government frequency vs. historical base rate (contextual)

**Historical pattern.** The empirical distribution of government sizes (1973-2026):

| Parties | Count | Share |
|---------|-------|-------|
| 1 | ~9 | ~43% |
| 2 | ~5 | ~24% |
| 3 | ~4 | ~19% |
| 4 | ~3 | ~14% |

Four-party governments existed (firkløver 1982-88, Nyrup I 1993-94) but were fragile. The firkløver ended when Schlüter "brutally fired" CD and KrF once their participation became unnecessary.

**What the model does.** S+M+RV+SF (4 parties) gets ~47% of outcomes. SIZE_PENALTIES = [1.0, 0.96, 0.90, 0.82] combined with the MWCC and flex bonuses produce a net effect of:

| Size | Size penalty | Bonus | Net |
|------|-------------|-------|-----|
| 1 party | 1.00 | 1.12 flex | 1.12 |
| 2 party | 0.96 | 1.12 flex | 1.08 |
| 3 party | 0.90 | 1.00 | 0.90 |
| 4 party | 0.82 | 0.90 flex | 0.74 |

The 4-party penalty is substantial but is dominated by S+M+RV+SF's high P(passage) when the EL forståelsespapir succeeds.

**Directional effect.** The ~47% probability for a 4-party government is driven by P(passage) dominance, not by insufficient size penalties. If the other findings are addressed (EL calibration conditional on government type, informal support tier, cross-bloc pivot), S+M+RV+SF's P(passage) advantage would shrink, and the size penalty would have more bite. This finding is downstream of the others rather than independent.

---

## Additional observations

### Unused `flexibility` parameter in dyad acceptance

`checkDyadAcceptance(members, flexibility)` accepts a flexibility argument but never references it in the function body. The model spec states that each formation round applies "+0.05 per attempt" in increasing flexibility, and this value enters `roundCfg`, but `checkDyadAcceptance` uses only the raw relationship values. Multiple formation rounds therefore give independent re-rolls at identical odds rather than modeling the "progressively more willing to compromise" dynamic described in the spec. Likely an oversight from a refactor.

### Compartmentalized majorities as routine governance

Finding #1 describes the pivot-when-defected dynamic. A sharper version: the Schlüter era showed governments *routinely* building different majorities for different policy areas as a planned governance strategy, not just as a fallback. Nyrup passed the efterløn reform with blue parties while passing welfare legislation with EL. Danish budgets are composite deals where different sections can have different supporting coalitions. The single-shot P(passage) framing is systematically too pessimistic for flexible formateurs.

---

## Structural assessment

The model's architecture is sound:

- **Bloc voting** correctly models Danish party discipline (replaced the per-mandate DP model that made minority government impossible).
- **Stochastic parameter draws** with per-iteration CI variation capture genuine uncertainty about SF-M relations, M-EL tolerance, and formateur risk appetite.
- **Two-stage formateur protocol** reflects the actual 2026 formation process (Frederiksen appointed kongelig undersøger, blue fallback if she fails).
- **Forståelsespapir mechanism** captures the single most important institutional innovation in recent Danish coalition politics.
- **Dyad acceptance gates** correctly model that parties decide on the coalition as a package, gated by their hardest bilateral relationship.
- **Scoring function** combines the right factors (passage probability, ideological fit, size, connectedness, cross-bloc penalty) in a reasonable way.

The findings above are about missing mechanisms and parameter calibration within this structure, not about fundamental design flaws. They can be addressed incrementally.

---

## Recommended extension: governing viability as a scoring input

The model already computes `governabilityProfile` (per-dimension feasibility for each coalition) but uses it only for dashboard display. This computation could be promoted to a scoring input:

**Rationale.** The formateur doesn't just ask "can I survive the budget vote?" — she asks "can I govern?" A coalition where she can find majorities on 9 of 11 policy dimensions is preferable to one where she can find majorities on 4 of 11, even if both pass the budget. The per-dimension profile captures the *vekslende flertal* dynamic: S+M+SF might have lower single-shot P(budget) than S+M+RV+SF, but if it can build per-issue majorities across more dimensions (going left on some, right on others), the formateur might prefer it.

**Implementation.** A new term in `scoreCoalition`:

```
govEase = weightedAvg(governabilityProfile[dimension].feasibility)
score = P(passage)^exp * ideoFit * sizePenalty * ... * govEase
```

This uses existing computation, adds one multiplier to the scoring function, and naturally captures the insight that Danish minority governments survive by building different majorities for different issues — without requiring a full redesign of the budget passage model.

**Design principle.** Keep the budget vote as the hard institutional gate (it IS the thing that can mechanically kill a government). Add governing viability as a soft strategic consideration that affects the formateur's preferences. Hard gate first, then strategic preference — respecting the distinction between institutional fact and political judgment.

---

## Model health: calibration, overfitting, and transparency

### What's principled vs. what's ad hoc

The model has three distinct layers with different epistemic status:

**Principled (clearly justified by institutional facts):**
- Bloc voting vs. per-mandate (Danish party discipline is near-absolute)
- S-first formateur protocol (Frederiksen appointed kongelig undersøger)
- EL forståelsespapir binary at 93%/3% (calibrated from EL's complete voting record)
- Confidence check (negative parliamentarism: need to avoid 90+ against)
- Dyad acceptance based on worst bilateral relationship
- NA voting norms (strong norm against opposing governments)

**Judgment-based but transparent (relationship values):**
- All inGov, tolerateInGov, asPM values — coded from party statements, historical behavior, and expert assessment. The audit trail in the model spec documents what changed and why.
- CI variation parameters — which parameters are uncertain and their rough magnitude.
- The forståelsespapir veto mechanism and its probabilistic structure.

**Ad hoc / calibrated to fit desired outputs:**
- SIZE_PENALTIES values — the spec documents that 0.72 was softened to 0.82 "because the 0.72 was structurally preventing the expert-consensus S+M+RV+SF from emerging as the top outcome." This is adjusting the model until it produces the expected answer.
- The specific scoring formula (why multiply these particular seven terms?)
- Bloc base rates (0.65/0.35/0.05 — reasonable but why not 0.60/0.30/0.10?)
- sqrt-softening on relationship modifiers (why sqrt and not linear or cube root?)
- The 0.88 policy violation multiplier, the 70/30 against/abstain split, passageExponent = 2.0, flexBonus values, MWCC bonus magnitude, cross-bloc penalty, various thresholds

Each ad hoc choice is individually defensible. The concern is their interaction: roughly 15-20 free parameters in the scoring/voting pipeline, calibrated against a target of "produce outputs experts find reasonable." With that many knobs, you can fit almost anything.

### Why it's probably not fundamentally overfit

Most parameters aren't actually free — the relationship values are constrained by observable evidence, the structural mechanisms by institutional rules, and the CI parameters by genuine political uncertainty. The real degrees of freedom are mainly in the scoring weights, and those matter less than the structural gates (dyad acceptance, confidence check, forståelsespapir veto). A coalition that fails dyad acceptance gets zero probability regardless of how the scoring terms are weighted. The gates do most of the work; the scoring ranks what survives.

The existing per-iteration CI variation was implemented partly to address this concern — drawing uncertain parameters from distributions rather than using point estimates. This is the right instinct: it lets the output reflect genuine uncertainty in unobservable quantities rather than committing to a single calibrated value. But the CI variation currently covers only 3-4 parameters (SF-M relationship, M-EL tolerance, M-DF relaxation, viability threshold). The scoring weights and structural thresholds are still point estimates.

### Recommendations

**1. Sensitivity audit.** Vary each scoring parameter independently and measure how much the output distribution moves. Hypothesis: 3-4 parameters are load-bearing (M-EL tolerance, viability threshold, EL forståelsespapir probabilities, SF-M relationship strength) and the rest barely move the needle. Parameters with large effects need good justification. Parameters with negligible effects should be simplified or absorbed into other terms. This extends the CI variation logic: if a parameter matters, it should either be well-justified or have uncertainty propagated through it.

**2. Simplify redundant scoring terms.** The scoring function has seven multiplicative factors. If flexBonus and sizePenalty correlate highly (both penalize larger coalitions), one could absorb the other. Fewer terms means easier to explain, harder to overfit, and more transparent about what's actually driving the results.

**3. Separate "the model" from "the calibration."** The model is the architecture (bloc voting, formateur protocol, gates, forståelsespapir). The calibration is the specific parameter values. Present them separately. The model is principled and explainable. The calibration is judgment-based and approximate — own that explicitly rather than presenting calibrated parameters as derived quantities.

**4. Counterfactual robustness test.** Give the model a hypothetical seat distribution (SF at 15 instead of 20, V at 25 instead of 18) and check whether the outputs are sensible. If the model produces reasonable comparative statics under counterfactual inputs, it's capturing structure. If it produces weird results, the calibration is too specific to the current arithmetic. This is the strongest test of whether the model generalizes or merely fits.

### The transparency standard

The model's value proposition should be: "a structured way of thinking through formation dynamics, with explicit assumptions you can adjust" — not "a prediction that S+M+RV+SF has a 47.3% probability." The absolute probabilities are artifacts of specific calibration choices. The comparative statics ("what happens when M-EL tolerance shifts?") and the structural insights ("EL's forståelsespapir is the decisive variable") are robust to reasonable parameter variation.

The Twitter thread test: the core logic passes easily. The institutional mechanisms can each be explained in a sentence. The key unknowns (M-EL tolerance, SF-M willingness, EL's internal politics) are genuinely interesting and worth highlighting. The thread should focus on the logic and the key unknowns, not on defending specific parameter values. If someone asks "why is the size penalty 0.82 for four-party coalitions?", the honest answer is "it's calibrated to produce historically plausible frequencies, and the model is more sensitive to the forståelsespapir mechanism than to this particular number." That's a defensible position for a scenario exploration tool.

---

## Implementation plan

### Ordering rationale

The structural mechanism changes (the six historical findings) come first because they are the substantive findings — missing institutional dynamics that the historical cross-reference identified. A sensitivity audit of existing parameters can't evaluate the impact of mechanisms that don't yet exist. And the sensitivity landscape of the current scoring parameters will change after structural modifications, so auditing them beforehand means auditing a model that's about to be replaced. The sensitivity audit and simplification pass belong after the structural work, operating on the model that will actually ship.

### Phase 0: Baseline snapshot

Before changing anything, lock down the current output distribution as a reference point. Run the simulator at high N (10,000) with default parameters and save the full results to `results/`. Every subsequent change gets compared against this baseline.

One agent, minutes. Write target: `results/baseline-pre-overhaul.json`.

### Phase 1: Structural mechanism changes

Ordered by expected impact and implementation complexity. Items within each tier are independent and can be parallelized in worktree agents.

**Tier 1 — contained changes to `blocBudgetVote` (parallel):**

- **1A. Opposition abstention norm.** Change the against/abstain ratio for the main opposition party (largest excluded opposite-bloc party). The current 70:30 against:abstain split for opposite-bloc parties should be closer to 30:70 for the largest opposition party, reflecting the historical norm that you don't topple governments via budget rejection. Adjusts the final conversion step in `blocBudgetVote`.
  - Write target: `sim5-engine.js` (blocBudgetVote function)

- **1B. Informal EL support tier.** Add an intermediate state between forståelsespapir (93%) and nothing (3%). When no forståelsespapir exists but EL is same-bloc with a red government, compute an "informal arrangement" probability (~40-60% FOR, reflecting the Thorning-era pattern where EL voted for budgets without a formal agreement). Changes the EL branch in `blocBudgetVote`.
  - Write target: `sim5-engine.js` (EL path in blocBudgetVote)

- **1C. EL rate conditional on government composition.** Modulate the 93% FOR downward when the government includes centrist/right partners (M, V). The calibration data comes from a pure S minority; with M in government, EL's internal politics are harder. Could be as simple as: `pFor = 0.93 - 0.08 * countCentristPartners`. Changes the EL forståelsespapir path in `blocBudgetVote`.
  - Write target: `sim5-engine.js` (EL forståelsespapir path in blocBudgetVote)

Note: 1B and 1C both touch the EL branch — they should be handled by the same agent or carefully sequenced.

**Tier 2 — changes to scoring and formation protocol (parallel with Tier 1):**

- **1D. Governing viability as scoring input.** Wire the existing `governabilityProfile` computation into `scoreCoalition` as a `govEase` multiplier. Uses existing per-dimension feasibility data that's currently display-only.
  - Write target: `sim5-engine.js` (scoreCoalition function)

- **1E. Fix unused `flexibility` parameter in dyad acceptance.** `checkDyadAcceptance` accepts flexibility but ignores it. Wire it through so that later formation rounds genuinely increase acceptance probability.
  - Write target: `sim5-engine.js` (checkDyadAcceptance function)

- **1F. NoGov reduction.** Add a third fallback stage to the formation protocol: when both S and blue formateurs fail, continue with progressively lower viability thresholds (reflecting the historical pattern of 3-4 dronningerunder with modified mandates). The historical record says a government always forms eventually.
  - Write target: `sim5-engine.js` (selectGovernment function)

**Tier 3 — complex mechanism requiring careful calibration (after Tiers 1-2):**

- **1G. Cross-bloc budget pivot.** When the standard budget vote fails in a Monte Carlo draw, allow a "rescue" path where the government seeks support from parties it wouldn't normally negotiate with (opposite-bloc parties get an elevated pFor for that draw, reflecting the Thorning FL 2014 dynamic). This is the most impactful finding but also the most complex to implement correctly. It changes `computePpassage` and interacts with the opposition abstention norm (1A) and the EL tiers (1B/1C).
  - Write target: `sim5-engine.js` (computePpassage function)
  - Depends on: 1A, 1B, 1C (the budget vote behavior these modify feeds into the pivot logic)

### Phase 2: Sensitivity audit and simplification

Now operating on the structurally modified engine.

**2A. Parameter sensitivity audit.** Vary each scoring/threshold parameter independently and measure how much the output distribution moves. Covers: passageExponent, distPenalty, SIZE_PENALTIES, mwccBonus, flexBonus, crossBlocPenalty, bloc base rates, forst minimum threshold, policy violation multiplier, and the new govEase weight. Deliverable: ranked list of parameters by impact.
  - Write target: `research/sensitivity-audit.md`

**2B. Scoring term decomposition.** For the top 5-6 coalitions, decompose scores into multiplicative components. Identify which terms actually differentiate coalitions vs. which are decorative. Deliverable: table showing per-term contribution to score variance.
  - Write target: `research/sensitivity-audit.md` (same report)

**2C. Simplification pass.** Based on 2A and 2B, merge or remove redundant scoring terms. Extend CI variation to any newly identified load-bearing parameters that are currently point estimates.
  - Write target: `sim5-engine.js` (scoreCoalition and simulate functions)

2A and 2B are parallel and read-only. 2C depends on both.

### Phase 3: Validation

**3A. Counterfactual robustness test.** Run the modified model with 3-4 hypothetical seat distributions:
  - SF at 15 instead of 20 (weaker 4-party coalition)
  - V at 25 instead of 18 (stronger blue bloc)
  - M at 8 instead of 14 (M less pivotal)
  - EL at 16 instead of 11 (EL has more leverage)

Check whether outputs shift in intuitive directions. Flag anything that looks wrong.
  - Write target: `research/counterfactual-robustness.md`

**3B. Comparative statics check.** Verify that the M-EL slider, viability threshold, and other dashboard controls still produce intuitive gradients. The structural changes should not break the interactive scenario exploration that gives the simulator its value.

**3C. Baseline comparison.** Compare the full output distribution against the Phase 0 baseline. Document what changed, why, and whether the changes are in the directions the historical cross-reference predicted.
  - Write target: `research/overhaul-changelog.md`

**3D. Update model spec and documentation.** Rewrite `research/model-spec.md` to reflect all changes, with explicit separation between the model architecture and the calibration values as recommended in the model health section.
  - Write target: `research/model-spec.md`

### Dependency graph

```
Phase 0 (baseline snapshot)
  │
  ├─ Phase 1, Tier 1: 1A, 1B+1C (parallel, blocBudgetVote changes)
  │
  ├─ Phase 1, Tier 2: 1D, 1E, 1F (parallel with Tier 1, other engine changes)
  │
  └─ Phase 1, Tier 3: 1G (after Tiers 1-2, cross-bloc pivot)
       │
       ├─ Phase 2A, 2B (parallel, read-only diagnostic)
       │    │
       │    └─ Phase 2C (simplification, depends on 2A+2B)
       │
       └─ Phase 3A, 3B (parallel, validation)
            │
            └─ Phase 3C, 3D (documentation, after validation)
```

### Agent count estimate

| Phase | Agents | Concurrent max | Mode |
|-------|--------|---------------|------|
| 0 | 1 | 1 | Foreground |
| 1 Tier 1 | 2 (1A solo + 1B/1C combined) | 2 | Worktree |
| 1 Tier 2 | 3 (1D, 1E, 1F) | 3 | Worktree |
| 1 Tier 3 | 1 (1G) | 1 | Foreground |
| 2A+2B | 2 | 2 | Foreground |
| 2C | 1 | 1 | Foreground |
| 3 | 2-3 | 2 | Foreground |

Total: ~12-14 agent invocations, never more than 5 concurrent.

---

## Implementation log

### Phase 0 — Baseline snapshot (completed)

Baseline captured at N=10,000 with default parameters. Saved to `results/baseline-pre-overhaul.json`.

| Coalition | Baseline % | P(passage) |
|-----------|-----------|------------|
| S+M+RV+SF | 47.0 | 0.968 |
| S+M+SF | 20.6 | 0.930 |
| S+RV+SF | 16.6 | 0.758 |
| V+KF+LA+M | 8.1 | 0.132 |
| S+M+RV | 2.7 | 0.675 |
| NoGov | 4.4 | — |

### Phase 1, Tiers 1+2 — Structural mechanism changes (completed)

Implemented in two parallel worktree agents, merged cleanly into main.

**Tier 1 (branch `phase1-tier1-blocbudgetvote-historical-norms`):**
- 1A: Opposition abstention norm — largest opposite-bloc party gets 30:70 against:abstain (was 70:30)
- 1B: Informal EL support tier — ~45% FOR without forståelsespapir when government is red-side (was 3%)
- 1C: EL rate conditional on government composition — -0.08 per non-red partner (93% → 85% with M)

**Tier 2 (branch `tier2-govease-flex-desperation`):**
- 1D: govEase multiplier wired into scoreCoalition (0.7-1.3 range from governabilityProfile)
- 1E: Flexibility parameter now functional in checkDyadAcceptance (flex * 0.5 added to effective tolerance)
- 1F: Desperation fallback added to selectGovernment (threshold 0.05, both code paths)

**Post-merge results (N=10,000):**

| Coalition | Baseline | After T1+T2 | Delta |
|-----------|----------|-------------|-------|
| S+M+RV+SF | 47.0% | 43.8% | -3.2 |
| S+RV+SF | 16.6% | 26.5% | +9.9 |
| S+M+SF | 20.6% | 19.2% | -1.4 |
| S+M+RV | 2.7% | 7.0% | +4.3 |
| V+KF+LA+M | 8.1% | 2.3% | -5.8 |
| S+SF | — | 0.7% | new |
| NoGov | 4.4% | 0.0% | -4.4 |

**Assessment of changes:**
- Distribution compressed as predicted: S+M+RV+SF declined, alternatives rose. Multiple viable configurations now visible.
- NoGov eliminated by desperation fallback — matches historical pattern.
- S+RV+SF is the biggest mover (+9.9). Without M in the coalition, EL faces no centrist penalty and the forståelsespapir negotiation is easier (no M veto risk). The model now clearly shows the cost M imposes on EL cooperation.
- S+M+RV rose substantially (+4.3), reflecting the informal EL support tier making non-forståelsespapir viability real.

**Open concern: V+KF+LA+M dropped sharply (8.1% → 2.3%).** Investigated immediately. Diagnosis: govEase is NOT the cause. V+KF+LA+M gets govEase=1.046 (a slight bonus, not a penalty). The govEase differential with S+M+RV+SF (1.202) affects relative ranking within a formateur stage but not whether the blue formateur gets a turn. The entire drop is structural: the informal EL tier at ~45% makes S-led coalitions viable in iterations that previously fell through to the blue stage. This is a legitimate consequence — with 53 government seats and weak support arithmetic, 2.3% may be realistic for the 2026 scenario. **Resolved: no action needed.**

Per-coalition govEase values for reference:

| Coalition | avgFeasibility | govEase |
|-----------|---------------|---------|
| S+M+RV | 0.901 | 1.241 |
| S+M+RV+SF | 0.836 | 1.202 |
| S+M+SF | 0.805 | 1.183 |
| S+RV+SF | 0.662 | 1.097 |
| V+KF+LA+M | 0.577 | 1.046 |

### Phase 1, Tier 3 — Cross-bloc budget pivot

Implemented cross-bloc budget pivot in `computePpassage`. When the initial MC budget vote fails for a minority government, a rescue attempt simulates the government pivoting to opposite-bloc or swing parties. Rescue probability per party: `min(0.40, max(0.05, 0.25 * avgTolerateInGov))` — moderate base reflecting costly cross-bloc negotiation, modulated by the party's tolerance toward government members, floored at 0.05 so even hostile parties are recruitable (matching historical record).

**Post-pivot results (N=10,000):**

| Coalition | After T1+T2 | After Pivot | Delta |
|-----------|-------------|-------------|-------|
| S+M+RV+SF | 43.8% | 31.7% | -12.1 |
| S+RV+SF | 26.5% | 25.9% | -0.6 |
| S+M+RV | 7.0% | 15.7% | +8.7 |
| S+SF | 0.7% | 13.8% | +13.1 |
| S+M+SF | 19.2% | 11.5% | -7.7 |
| V+KF+LA+M | 2.3% | 0.8% | -1.5 |
| NoGov | 0.0% | 0.0% | 0.0 |

**Assessment:** The pivot mechanism substantially compresses the distribution, as predicted. P(passage) rises across the board (S+RV+SF: 0.758→0.925; S+M+RV: 0.675→0.821) because failed budget votes now have a rescue path. The biggest movers are S+SF (+13.1) and S+M+RV (+8.7) — coalitions that previously had marginal P(passage) but now survive through cross-bloc recruitment. S+M+RV+SF drops (-12.1) because its P(passage) advantage over alternatives is eroded. The distribution now shows five coalitions above 10% — closer to the historical pattern of multiple viable configurations.

**Cumulative Phase 1 deltas against original baseline:**

| Coalition | Baseline | Post-Phase 1 | Delta |
|-----------|----------|--------------|-------|
| S+M+RV+SF | 47.0% | 31.7% | -15.3 |
| S+RV+SF | 16.6% | 25.9% | +9.3 |
| S+M+RV | 2.7% | 15.7% | +13.0 |
| S+SF | ~0% | 13.8% | +13.8 |
| S+M+SF | 20.6% | 11.5% | -9.1 |
| V+KF+LA+M | 8.1% | 0.8% | -7.3 |
| NoGov | 4.4% | 0.0% | -4.4 |

**Open concerns entering Phase 2:**

1. **S+SF at 13.8% is likely too high.** S(38)+SF(20) = 58 seats with zero historical precedent. The cross-bloc pivot makes it arithmetically survivable, but the combination of the pivot raising P(passage) and the size/flex bonus (1.12 for ≤2 parties) may be over-rewarding very small coalitions. The formateur would need a strong reason to choose 58 seats over alternatives with 70-80+ seats. This points to the rescue mechanism being too generous for very marginal coalitions, or the flex bonus interacting badly with the pivot. **Candidate for recalibration in Phase 2.**

2. **S+M+RV+SF at 31.7% may be too low** given expert consensus and strongest arithmetic. The cumulative effect of three EL-related changes (centrist penalty -0.08 per non-red partner, informal tier at 45%, cross-bloc pivot eroding the P(passage) gap) has substantially reduced its advantage. Each change is individually justified but their compounding may be too aggressive. **Phase 2 sensitivity audit should test which of the three EL-related mechanisms is most load-bearing.**

3. **V+KF+LA+M at 0.8%** is very low but probably realistic for 2026 arithmetic (53 government seats, no clear support path). Should be verified in Phase 3 counterfactual testing with stronger blue-bloc seat distributions.

### Phase 2: Sensitivity audit and simplification

**Phase 2A — Parameter sensitivity audit (completed).** Full results in `research/sensitivity-audit.md`. Key findings:
- viabilityThreshold is the most sensitive parameter (53.4 pp max deviation)
- distPenalty has a non-monotonic U-shaped response (both low and high values boost S+M+SF)
- Cross-bloc rescue probability is #4 (28.9 pp) — confirms the pivot mechanism is load-bearing
- mElTolerate has surprisingly low impact (7.7 pp) relative to its UI prominence
- passageExponent was rank 11 (8.5 pp) — the exponent choice was second-order, not the big architectural decision it appeared to be

**Phase 2B — Scoring term decomposition (completed).** Full results in `research/scoring-decomposition.md`. Key findings:
- P(passage)^2 explained 107% of log-score variance — the scoring function was a passage calculator with decorative multipliers
- Seven of nine terms were decorative for ranking (removing them preserved top-5 ordering)
- Three terms were literally constant across all top coalitions (crossBloc, precedent, leaderBonus)
- The coalition-theoretic cluster (size, mwcc, flex, govEase) collectively explained only 2.4% of variance
- ideoFit had -9.2% variance contribution (worked AGAINST the score direction)

**Two spar sessions** explored the architectural implications:
- Spar 1: Concluded the passage exponent was the wrong parameter to focus on. The real decision was how to represent structural uncertainty about how formateurs weigh passage vs. coalition quality. Recommended: two-factor scoring with CI-varied weight, not a fixed exponent.
- Spar 2 (on experimental results): Identified that the quality bundle triple-counted smallness via sizePenalty + flexBonus + ideoFit. S+SF had a 40% quality advantage over S+M+RV+SF entirely from size proxies. Recommended: merge parsimony terms, widen govEase, CI-vary w behind the scenes (not as a user slider).

**Phase 2C — Scoring restructure (completed).** Changes to `sim5-engine.js`:
1. Removed dead code: `HISTORICAL_PRECEDENTS`, `SIZE_PENALTIES`, `historicalPrecedentBonus`, `crossBloc` computation, `precedentWeight`
2. Merged sizePenalty + flexBonus → single `parsimony` term [1.15, 1.10, 0.95, 0.85] for 1-4 party minorities
3. Widened govEase: `0.5 + 1.0 * avgFeasibility` (range 0.5-1.5, was 0.7-1.3)
4. Restructured scoreCoalition: `passage^w * quality^(1-w)` where quality = ideoFit * parsimony * mwcc * govEase
5. CI-varied passageWeight per iteration: N(0.65, 0.08) clamped [0.50, 0.90]

**Cumulative results — full overhaul (N=10,000):**

| Coalition | Original baseline | Post-Phase 1 | Post-Phase 2C |
|-----------|------------------|--------------|---------------|
| S+M+RV+SF | 47.0% | 31.7% | 25.2% |
| S+RV+SF | 16.6% | 25.9% | 23.0% |
| S+M+SF | 20.6% | 11.5% | 16.6% |
| S+M+RV | 2.7% | 15.7% | 15.9% |
| S+SF | ~0% | 13.8% | 14.9% |
| V+KF+LA+M | 8.1% | 0.8% | ~1% |
| NoGov | 4.4% | 0.0% | 0.0% |

**Assessment:** The distribution compressed from one dominant coalition (47%) to five viable configurations spanning 25%-15%. S+M+RV+SF remains the top outcome but isn't dominant. The scoring function is now a genuine two-factor model where passage feasibility and coalition quality both contribute, with the tradeoff weight CI-varied to express structural uncertainty.

**Remaining concern: S+SF at 14.9%.** Addressed in post-Phase 2C calibration (see below).

### Post-Phase 2C: Rescue probability calibration

**Problem:** S+SF at ~15% was too high for a 58-seat, zero-precedent coalition. Diagnostic isolated the cause: cross-bloc rescue (base=0.25) was responsible for 13.7 of the 15.3 percentage points. Parsimony contributed 5.1pp (secondary). passageWeight CI variation was negligible (0.2pp).

**CI-variation ruled out.** Testing showed CI-varying the rescue base (e.g., N(0.15, 0.05)) actually *inflated* S+SF due to convexity (Jensen's inequality): the S-shaped relationship between rescue probability and S+SF viability means high draws help S+SF more than low draws hurt it. CI N(0.15, 0.05) produced S+SF=15.1%, higher than even fixed 0.25 (14.4%). The rescue base should be a fixed parameter, not CI-varied.

**Historical grounding for base=0.10.** Commissioned a sub-agent review of the historical formations report against the rescue probability parameter. Findings:
- Only ~2-3 genuine cross-bloc budget pivots across ~50 budget cycles (Thorning FL 2014, Nyrup efterløn, some Schlüter-era deals)
- 1 case where rescue was NOT attempted — Schlüter chose dissolution over cross-bloc rescue in 1984
- Historical pivots were **package deals** (government negotiates with V and KF together), not independent per-party draws. The model's per-party independence assumption already inflates compound rescue probability.
- At base=0.10 with typical tolerances (0.3-0.6), per-party rescue rates are 0.05-0.06. With 3 opposite-bloc parties, compound P(at least one switches) ≈ 14-17%. This is consistent with "rare but not impossible" — roughly the right historical frequency.
- The cap was also reduced from 0.40 to 0.30 to reflect that even high-tolerance parties face substantial costs in cross-bloc deals.

**Decision: rescue base = 0.10 (fixed).** The evidence was too thin to distinguish 0.10 from 0.15 precisely, but 0.10 compensates for the structural inflation from independent draws and better matches the historical pattern of rescue as rare and costly.

**Post-calibration results (N=10,000):**

| Coalition | Original baseline | Post-Phase 2C (0.25) | Final (0.10) |
|-----------|------------------|---------------------|--------------|
| S+M+RV+SF | 47.0% | 25.2% | 29.3% |
| S+RV+SF | 16.6% | 23.0% | 24.1% |
| S+M+SF | 20.6% | 16.6% | 18.0% |
| S+M+RV | 2.7% | 15.9% | 14.4% |
| S+SF | ~0% | 14.9% | 9.6% |
| V+KF+LA+M | 8.1% | ~1% | 0.9% |
| NoGov | 4.4% | 0.0% | 0.0% |

S+SF dropped from 14.9% to 9.6%. S+M+RV+SF rose from 25.2% to 29.3%. Five viable coalitions spanning 29%-10% with a clear but non-dominant leader.

### Decision log — key choices made during the overhaul

| Decision | Rationale | Evidence |
|----------|-----------|----------|
| Scoring restructure: `passage^w * quality^(1-w)` | Old P(passage)^2 explained 107% of variance; other terms decorative. Two-factor form lets both dimensions contribute. | Scoring decomposition (Phase 2B) |
| CI-vary passageWeight N(0.65, 0.08) | Structural uncertainty about how formateurs weigh passage vs quality. No empirical calibration target. Varying expresses this honestly. | Spar session 1: Frame 2/3 synthesis |
| passageWeight NOT user-facing | Users lack intuition for "passage weight." Substantive sliders (M-EL tolerance) are where user judgment belongs. | Spar session 2, round 3 |
| Merge sizePenalty + flexBonus → parsimony | Triple-counting smallness: flex (1.12), size (0.96), and ideoFit mechanically favored fewer parties. Combined 1.45x advantage for 2-party over 4-party. | Spar session 2, round 2: quality bundle decomposition |
| Widen govEase: 0.5+1.0*feasibility (was 0.7+0.6) | Needed to counterbalance parsimony. 58-seat governments face real difficulty building legislative majorities. | Same spar: govEase too narrow to offset parsimony cluster |
| Remove dead terms (precedent, crossBloc, leaderBonus) | precedent weight=0 always. crossBloc never fired for competitive coalitions. leaderBonus constant within formateur groups. | Scoring decomposition: zero variance contribution |
| Rescue base = 0.10 (fixed, not CI-varied) | Historical evidence: ~2-3 pivots in 50 years. Per-party independence inflates compound probability. CI-varying worsens S+SF via convexity. | Historical grounding sub-agent + diagnostic |
| Opposition abstention: 30:70 for main opposition | Strong historical norm: S abstained on KVR FL 1989. AJ voting against in 1983 was "a break with tradition." | Historical formations report, Section VII |
| EL informal tier: 45% FOR without forståelsespapir | EL voted for Thorning budgets (2012, 2013, 2015) without formal agreement. 3% was too low. | Historical formations report, EL voting record |
| EL centrist penalty: -0.08 per non-red partner | 93% calibrated on Frederiksen I (pure S). Under Thorning (with RV), EL support was unreliable. | Historical formations report, Section V |
| Desperation fallback: threshold 0.05 | Historical record: government always forms. 1975: four rounds. Hartling: 22 seats. | Historical formations report, Section VII |
| Flexibility wired into dyad acceptance | Was unused parameter (likely refactor oversight). Later rounds should genuinely increase willingness. | Code inspection |
| EL informal rate CI-varied: N(0.45, 0.08) | Genuine uncertainty, ~linear effect on red-bloc viability. | CI variation audit spar |
| EL centrist penalty CI-varied: N(0.08, 0.02) | Genuine uncertainty, ~linear over small integers (1-3 partners). | CI variation audit spar |
| Opposition abstention kept fixed | Threshold nonlinearity with ambiguous Jensen bias direction. | CI variation audit spar |
| Rescue base kept fixed | Convex relationship inflates marginal coalitions via Jensen's inequality. | Diagnostic + CI variation audit spar |
| distPenalty/parsimony kept fixed | Structural modeling choices, not empirical uncertainty. CI-varying would conflate preference instability with parameter uncertainty. | CI variation audit spar |

### Phase 3: Validation (completed)

**3A. Counterfactual robustness — PASS.** Full results in `research/counterfactual-robustness.md`. Four hypothetical seat distributions all produced sensible directional shifts:
- Weaker SF (15→S gets 43): S+M+RV+SF declined -6pp, S+M+RV gained +12pp
- Stronger V (25, LA=8): S+M+V emerged at 1.5%, blue stayed low (correct: red formateur first)
- Weaker M (8, V=24): M-containing coalitions collapsed -13pp, S+RV+SF and S+SF gained
- Stronger EL (16, ALT=0): S+SF gained +9pp, novel S+M coalition appeared

Three minor flags: coalition labeling artifact on S+M+SF, blue insensitive to V strength (structural: red formateur goes first), NoGov=0% everywhere (desperation fallback by design).

**3B. Comparative statics — 6/7 PASS.** Full results in `research/comparative-statics.md`. All five dashboard sliders produce intuitive gradients:
- mElTolerate: S+RV+SF drops monotonically as tolerance rises (30.1%→20.3%)
- viabilityThreshold: clear concentration gradient (top-1 share 27%→38%)
- redPreference: textbook monotonic (S+RV+SF: 14%→39%, S+M+RV: 33%→9%)
- mDemandGov: M-less coalitions gain +7.4pp when M doesn't demand government
- flexibility: average coalition size rises monotonically (3.10→3.28 parties)

One mild non-monotonicity on S+M+RV+SF vs mElTolerate (composition effect, not a bug).

**3D. Model spec rewrite — completed.** `research/model-spec.md` fully rewritten with three-part structure: Architecture (principled institutional mechanisms), Calibration (judgment-based values + decision log), Dashboard (user-facing controls). Includes the "about this model" paragraph. Flags vestigial UI controls (passageExponent, precedentWeight) that no longer map to engine parameters.

---

## Overhaul complete

**Final output distribution (N=10,000):**

| Coalition | Pct | Support |
|-----------|-----|---------|
| S+M+RV+SF | 29.3% | [EL] forst, ALT loose |
| S+RV+SF | 24.1% | [EL] forst, ALT loose |
| S+M+SF | 18.0% | [EL] forst, ALT loose |
| S+M+RV | 14.4% | [EL] forst, ALT loose |
| S+SF | 9.6% | [EL] forst, ALT loose |
| V+KF+LA+M | 0.9% | DF, DD, BP loose |
| NoGov | 0.0% | — |

**Change from original baseline:**

| Coalition | Original | Final | Delta |
|-----------|----------|-------|-------|
| S+M+RV+SF | 47.0% | 29.3% | -17.7 |
| S+RV+SF | 16.6% | 24.1% | +7.5 |
| S+M+SF | 20.6% | 18.0% | -2.6 |
| S+M+RV | 2.7% | 14.4% | +11.7 |
| S+SF | ~0% | 9.6% | +9.6 |
| V+KF+LA+M | 8.1% | 0.9% | -7.2 |
| NoGov | 4.4% | 0.0% | -4.4 |

**Summary of changes to model behavior:**
1. Distribution compressed from one dominant coalition (47%) to five viable configurations (29%–10%).
2. S+M+RV+SF remains the most likely outcome but is no longer dominant — reflecting genuine formation uncertainty.
3. S+RV+SF and S+M+RV gained substantially — the model now captures that M-less and SF-less alternatives are historically plausible.
4. NoGov eliminated — matching the historical record that a government always forms.
5. Blue government probability reduced — realistic given 2026 arithmetic (53 government seats, no clear support path).
6. The scoring function is now a genuine two-factor model (passage feasibility vs coalition quality) with CI-varied weight, replacing the old P(passage)^2 calculator with decorative multipliers.

### Post-Phase 3: CI variation audit

Spar session assessed which parameters should be CI-varied vs fixed. Principled criterion: CI-vary when (a) genuine uncertainty exists AND (b) the effect is approximately linear, or Jensen distortion is small. Fix when nonlinearity produces directional bias.

**Two parameters added to CI variation:**
- EL informal support rate: N(0.45, 0.08), clamped [0.20, 0.70] — genuine uncertainty, ~linear effect
- EL centrist penalty: N(0.08, 0.02), clamped [0.02, 0.16] — genuine uncertainty, ~linear over small integers

**Confirmed fixed:** rescue base (Jensen inflation), opposition abstention (threshold nonlinearity), EL forståelsespapir rate (empirically calibrated), distPenalty/parsimony (structural choices, not empirical uncertainty).

**Relabeling:** M-DF relaxation converted from discrete 12% switch to continuous N(0.12, 0.04) draw.

**Full CI-width framework adopted.** Following the principle that everything has uncertainty and the question is how much, ALL model parameters are now CI-varied per iteration with widths encoding confidence. 13 parameters drawn per iteration:

| Parameter | Mean | σ | Clamp | Type |
|-----------|------|---|-------|------|
| SF→M inGov | 0.72 | 0.06 | [0, 1] | Relationship |
| M→SF inGov | 0.68 | 0.06 | [0, 1] | Relationship |
| M→EL tolerance | 0.35 | 0.10 | [0, 1] | Relationship |
| M-DF cooperation | 0.12 | 0.04 | [0, 0.30] | Scenario |
| Viability threshold | 0.70 | 0.06 | [0.50, 0.85] | Formateur |
| passageWeight | 0.65 | 0.08 | [0.50, 0.90] | Structural |
| EL informal rate | 0.45 | 0.08 | [0.20, 0.70] | Behavioral |
| EL centrist penalty | 0.08 | 0.02 | [0.02, 0.16] | Behavioral |
| EL forst base | 0.93 | 0.03 | [0.80, 0.98] | Empirical |
| Rescue base | 0.10 | 0.03 | [0.03, 0.25] | Historical |
| Opposition abstention | 0.30 | 0.05 | [0.10, 0.60] | Normative |
| distPenalty | 1.50 | 0.15 | [0.50, 2.50] | Structural |
| Parsimony spread | 1.00 | 0.15 | [0.30, 1.50] | Structural |

Validation: N=10,000 run confirmed distribution stable (28.4%, 24.2%, 19.0%, 14.4%, 9.4%). Comparative statics spot-checks passed (mElTolerate and redPreference both monotonic in expected direction).

**Remaining items for future work:**
- Clean up vestigial UI controls in `index.html` (passageExponent slider, precedentWeight)
- The coalition labeling artifact flagged in counterfactual testing (S+M+SF appearing under different keys depending on forståelsespapir outcome)
- Consider replacing per-party independent rescue draws with a single package-deal draw (better matches historical pattern, noted by the grounding sub-agent)
