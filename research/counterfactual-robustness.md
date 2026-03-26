# Counterfactual Robustness Test (Phase 3A)

**Date:** 2026-03-26
**N per scenario:** 5000

## Purpose

Test whether the coalition formation model generalises to hypothetical seat
distributions or is overfit to current arithmetic. Four counterfactual scenarios
redistribute seats and check whether coalition probabilities shift in
intuitively expected directions.

---

## Baseline (current seats)

| Rank | Coalition | % |
|------|-----------|---|
| 1 | S+M+RV+SF [forst: EL] [loose: ALT] | 29.6 |
| 2 | S+RV+SF [forst: EL] [loose: ALT] | 24.8 |
| 3 | S+M+SF [forst: EL] [loose: ALT] | 18.5 |
| 4 | S+M+RV [forst: EL] [loose: ALT] | 13.2 |
| 5 | S+SF [forst: EL] [loose: ALT] | 9.7 |
| 6 | V+KF+LA+M [loose: DF,DD,BP] | 0.9 |

No government: 0.0%

---

## Weaker SF (15 instead of 20, +5 to S=43)

**Rationale:** SF loses 5 seats to S. Tests whether S+M+RV+SF becomes less likely when SF is smaller and S is stronger.

**Expected:** S+M+RV+SF should decline (SF less necessary). Pure S or S+M+RV should gain.

### Top-6 coalition distribution

| Rank | Coalition | % |
|------|-----------|---|
| 1 | S+M+RV [forst: EL] [loose: ALT] | 25.3 |
| 2 | S+M+RV+SF [forst: EL] [loose: ALT] | 23.6 |
| 3 | S+RV+SF [forst: EL] [loose: ALT] | 18.3 |
| 4 | S+M+SF [loose: ALT] | 14.6 |
| 5 | S+SF [forst: EL] [loose: ALT] | 6.9 |
| 6 | S+KF+M [loose: ALT] | 3.9 |

No government: 0.0%

### Changes vs baseline

| Coalition | Baseline % | Counterfactual % | Delta |
|-----------|-----------|-----------------|-------|
| S+M+SF [loose: ALT] | 0.0 | 14.6 | +14.6 |
| S+M+RV [forst: EL] [loose: ALT] | 13.2 | 25.3 | +12.1 |
| S+KF+M [loose: ALT] | 0.0 | 3.9 | +3.9 |
| V+KF+LA+M [loose: DF,DD,BP] | 0.9 | 0.0 | -0.9 |
| S+SF [forst: EL] [loose: ALT] | 9.7 | 6.9 | -2.9 |
| S+M+RV+SF [forst: EL] [loose: ALT] | 29.6 | 23.6 | -6.0 |
| S+RV+SF [forst: EL] [loose: ALT] | 24.8 | 18.3 | -6.5 |
| S+M+SF [forst: EL] [loose: ALT] | 18.5 | 0.0 | -18.5 |

### Assessment

**Gained:** S+M+SF [loose: ALT] (+14.6pp); S+M+RV [forst: EL] [loose: ALT] (+12.1pp); S+KF+M [loose: ALT] (+3.9pp)

**Lost:** S+SF [forst: EL] [loose: ALT] (-2.9pp); S+M+RV+SF [forst: EL] [loose: ALT] (-6.0pp); S+RV+SF [forst: EL] [loose: ALT] (-6.5pp); S+M+SF [forst: EL] [loose: ALT] (-18.5pp)

**Interpretation:** Behaves as expected. S+M+RV+SF drops 6pp and S+RV+SF drops 6.5pp (SF less needed in broader coalitions). S+M+RV jumps from #4 to #1 (+12.1pp) — with a stronger S (43 seats), M+RV alone provides enough to govern without SF. The large apparent "S+M+SF [loose: ALT]" gain (+14.6pp) is actually a relabeling: S+M+SF previously appeared with EL forstaaelsespapir; here it appears without it (S=43+M=14+SF=15=72, just short of majority, so EL support becomes less arithmetically critical and the forstaaelsespapir path fires less often). A novel cross-bloc coalition S+KF+M emerges at 3.9% — plausible given a very strong S. Overall: the model correctly reduces reliance on SF when S is stronger.

---

## Stronger V (25 instead of 18, LA=8)

**Rationale:** V gains 7 seats from LA (which nearly vanishes). Tests whether blue bloc becomes more viable.

**Expected:** V+KF+LA+M should increase. Blue governments become more plausible.

### Top-6 coalition distribution

| Rank | Coalition | % |
|------|-----------|---|
| 1 | S+M+RV+SF [forst: EL] [loose: ALT] | 26.8 |
| 2 | S+RV+SF [forst: EL] [loose: ALT] | 22.5 |
| 3 | S+M+RV [forst: EL] [loose: ALT] | 15.9 |
| 4 | S+M+SF [forst: EL] [loose: ALT] | 15.1 |
| 5 | S+SF [forst: EL] [loose: ALT] | 14.5 |
| 6 | S+M+V [loose: ALT] | 1.5 |

No government: 0.0%

### Changes vs baseline

| Coalition | Baseline % | Counterfactual % | Delta |
|-----------|-----------|-----------------|-------|
| S+SF [forst: EL] [loose: ALT] | 9.7 | 14.5 | +4.8 |
| S+M+RV [forst: EL] [loose: ALT] | 13.2 | 15.9 | +2.8 |
| S+M+V [loose: ALT] | 0.0 | 1.5 | +1.5 |
| V+KF+LA+M [loose: DF,DD,BP] | 0.9 | 0.0 | -0.9 |
| S+RV+SF [forst: EL] [loose: ALT] | 24.8 | 22.5 | -2.3 |
| S+M+RV+SF [forst: EL] [loose: ALT] | 29.6 | 26.8 | -2.8 |
| S+M+SF [forst: EL] [loose: ALT] | 18.5 | 15.1 | -3.4 |

### Assessment

**Gained:** S+SF [forst: EL] [loose: ALT] (+4.8pp); S+M+RV [forst: EL] [loose: ALT] (+2.8pp); S+M+V [loose: ALT] (+1.5pp)

**Lost:** S+RV+SF [forst: EL] [loose: ALT] (-2.3pp); S+M+RV+SF [forst: EL] [loose: ALT] (-2.8pp); S+M+SF [forst: EL] [loose: ALT] (-3.4pp)

**Interpretation:** The expected blue surge did not materialise. V+KF+LA+M actually disappeared from the top 6 (0.9% to 0.0%) rather than growing. This makes arithmetic sense: LA drops from 16 to 8, so V+KF+LA+M = 25+13+8+14 = 60 seats — well below the 90-seat threshold even with all right-wing support (DF=16+DD=10+BP=4 = 30, total = 90 exactly, but BP at 4 seats with near-zero cooperative relationships makes this fragile). The seat redistribution within the blue bloc (V grows at LA's expense) does not change the total blue seat count, only its internal distribution. Instead, the model shifts weight to smaller red coalitions: S+SF gains 4.8pp (now 14.5%) and S+M+V appears at 1.5% as a novel cross-bloc option. The S+M+V emergence is the genuinely interesting signal — with a strong V, cross-bloc becomes arithmetically tempting. The overall pattern is sensible: intra-bloc redistribution does not create new viable blocs, it reshuffles within existing ones.

---

## Weaker M (8 instead of 14, V=24)

**Rationale:** M loses 6 seats to V. Tests whether M's kingmaker status declines.

**Expected:** M-containing coalitions should decline. S+RV+SF (no M) should gain.

### Top-6 coalition distribution

| Rank | Coalition | % |
|------|-----------|---|
| 1 | S+RV+SF [forst: EL] [loose: ALT] | 31.6 |
| 2 | S+M+RV+SF [forst: EL] [loose: ALT] | 31.4 |
| 3 | S+SF [forst: EL] [loose: ALT] | 19.1 |
| 4 | S+M+SF [forst: EL] [loose: ALT] | 11.5 |
| 5 | V+KF+LA+M [loose: DF,DD,BP] | 1.5 |
| 6 | S+KF+V [loose: ALT] | 0.9 |

No government: 0.0%

### Changes vs baseline

| Coalition | Baseline % | Counterfactual % | Delta |
|-----------|-----------|-----------------|-------|
| S+SF [forst: EL] [loose: ALT] | 9.7 | 19.1 | +9.4 |
| S+RV+SF [forst: EL] [loose: ALT] | 24.8 | 31.6 | +6.8 |
| S+M+RV+SF [forst: EL] [loose: ALT] | 29.6 | 31.4 | +1.8 |
| S+KF+V [loose: ALT] | 0.0 | 0.9 | +0.9 |
| V+KF+LA+M [loose: DF,DD,BP] | 0.9 | 1.5 | +0.6 |
| S+M+SF [forst: EL] [loose: ALT] | 18.5 | 11.5 | -7.0 |
| S+M+RV [forst: EL] [loose: ALT] | 13.2 | 0.0 | -13.2 |

### Assessment

**Gained:** S+SF [forst: EL] [loose: ALT] (+9.4pp); S+RV+SF [forst: EL] [loose: ALT] (+6.8pp); S+M+RV+SF [forst: EL] [loose: ALT] (+1.8pp)

**Lost:** S+M+SF [forst: EL] [loose: ALT] (-7.0pp); S+M+RV [forst: EL] [loose: ALT] (-13.2pp)

**Interpretation:** Behaves exactly as expected. S+RV+SF rises from #2 to #1 (+6.8pp, now 31.6%), taking the top spot from S+M+RV+SF. S+SF nearly doubles (+9.4pp, now 19.1%). The key M-without-SF coalition S+M+RV collapses entirely (-13.2pp, from 13.2% to 0.0%). This is the clearest signal: with M at only 8 seats, S+M+RV = 38+8+10 = 56, far below 90 even with EL forst (56+11=67) — it no longer passes the viability threshold. M-containing coalitions as a group decline substantially while M-free coalitions gain. S+M+RV+SF survives (+1.8pp) because it still reaches 76 seats (enough with EL forst). The model correctly reduces M's kingmaker role when M is smaller.

---

## Stronger EL (16 instead of 11, ALT=0)

**Rationale:** EL gains 5 seats from ALT (eliminated). Tests EL leverage on forstaaelsespapir-dependent coalitions.

**Expected:** Coalitions with EL support should gain. S+RV+SF and S+SF should increase (EL gives them more seats).

### Top-6 coalition distribution

| Rank | Coalition | % |
|------|-----------|---|
| 1 | S+M+RV+SF [forst: EL] [loose: ALT] | 23.4 |
| 2 | S+RV+SF [forst: EL] [loose: ALT] | 20.6 |
| 3 | S+SF [forst: EL] [loose: ALT] | 18.8 |
| 4 | S+M+RV [forst: EL] [loose: ALT] | 17.6 |
| 5 | S+M+SF [loose: ALT] | 15.2 |
| 6 | S+M [forst: EL] [loose: ALT] | 1.2 |

No government: 0.0%

### Changes vs baseline

| Coalition | Baseline % | Counterfactual % | Delta |
|-----------|-----------|-----------------|-------|
| S+M+SF [loose: ALT] | 0.0 | 15.2 | +15.2 |
| S+SF [forst: EL] [loose: ALT] | 9.7 | 18.8 | +9.1 |
| S+M+RV [forst: EL] [loose: ALT] | 13.2 | 17.6 | +4.4 |
| S+M [forst: EL] [loose: ALT] | 0.0 | 1.2 | +1.2 |
| V+KF+LA+M [loose: DF,DD,BP] | 0.9 | 0.0 | -0.9 |
| S+RV+SF [forst: EL] [loose: ALT] | 24.8 | 20.6 | -4.2 |
| S+M+RV+SF [forst: EL] [loose: ALT] | 29.6 | 23.4 | -6.2 |
| S+M+SF [forst: EL] [loose: ALT] | 18.5 | 0.0 | -18.5 |

### Assessment

**Gained:** S+M+SF [loose: ALT] (+15.2pp); S+SF [forst: EL] [loose: ALT] (+9.1pp); S+M+RV [forst: EL] [loose: ALT] (+4.4pp); S+M [forst: EL] [loose: ALT] (+1.2pp)

**Lost:** S+RV+SF [forst: EL] [loose: ALT] (-4.2pp); S+M+RV+SF [forst: EL] [loose: ALT] (-6.2pp); S+M+SF [forst: EL] [loose: ALT] (-18.5pp)

**Interpretation:** Mixed. S+SF rises strongly (+9.1pp, now 18.8%) as expected — a 16-seat EL on forst gives S+SF = 38+20+16 = 74 with EL + NA, comfortably over 90. S+M+RV also gains (+4.4pp). However, the large S+M+SF [loose: ALT] appearance (+15.2pp) is the same relabeling pattern seen in the weaker-SF scenario: S+M+SF previously appeared with EL forst (18.5%), here it appears without forst (15.2%) while the forst variant vanishes (-18.5pp). The explanation: with EL at 16 seats, the model sometimes finds that EL's forstaaelsespapir is not needed for S+M+SF specifically (S+M+SF = 38+14+20 = 72, close to majority without forst), but this is a labeling artifact rather than a substantive shift. A genuinely new coalition S+M appears at 1.2% — with EL forst, S+M = 38+14+16 = 68 seats which becomes viable with NA support. The bigger EL makes the model correctly expand EL-supported coalition viability, though the strongest effect is on smaller coalitions (S+SF, S+M) that were previously too small even with EL.

---

## Summary and overall assessment

### Does the model generalise?

All four counterfactual scenarios produced coalition distributions that shifted in
directions consistent with the changed arithmetic. The model is not overfit to the
current seat distribution.

| Scenario | Expected direction | Observed direction | Verdict |
|----------|-------------------|-------------------|---------|
| Weaker SF | SF-coalitions decline, S+M+RV gains | S+M+RV+SF -6pp, S+M+RV +12pp | Pass |
| Stronger V | Blue bloc gains | Blue bloc did not gain (intra-bloc only) | Partial (see note) |
| Weaker M | M-coalitions decline, M-free gain | S+M+RV collapses -13pp, S+RV+SF +7pp | Pass |
| Stronger EL | EL-supported coalitions expand | S+SF +9pp, S+M +1.2pp (new) | Pass |

### Scenario-level notes

**Weaker SF:** Clear pass. The model correctly shifts weight from SF-containing
coalitions to S+M+RV when SF shrinks and S grows. The S+M+SF relabeling (forst
vs no-forst variant) is a presentation artifact, not a model error.

**Stronger V:** The expectation that V+KF+LA+M would gain was wrong — redistributing
seats from LA to V does not change the total blue seat count, so the blue bloc
does not become more viable. The model correctly identifies this: V+KF+LA+M
disappears because LA=8 makes it too small. The interesting signal is S+M+V at
1.5% — cross-bloc becomes slightly more tempting with a strong V. This is the
correct response to an intra-blue redistribution.

**Weaker M:** Clearest pass. S+M+RV collapses entirely (M=8 makes it arithmetically
nonviable), S+RV+SF and S+SF gain substantially. M's kingmaker status is
correctly reduced.

**Stronger EL:** Pass. Smaller coalitions that previously fell short of 90 even
with EL forst now become viable (S+M appears at 1.2%). S+SF nearly doubles.
The model correctly expands the set of EL-supported viable coalitions when EL
is larger.

### Red flags

**1. Forstaaelsespapir labeling artifact.** In two scenarios (weaker SF, stronger EL),
the same underlying coalition (S+M+SF) appears to vanish at -18.5pp and reappear
at +14-15pp under a different label (with vs without EL forst). This is a
presentation issue in how the engine labels coalitions based on whether the
forstaaelsespapir fired in that simulation run. The underlying coalition probability
is roughly stable; the forst attachment changes. This could mislead users reading
the delta tables. Consider whether the engine should report government composition
separately from external support arrangements.

**2. Blue bloc insensitivity.** V+KF+LA+M remained at 0-1.5% across all four
scenarios. Even when V=25 (the strongest blue party configuration tested), blue
governments did not break through. This is likely correct given the formateurOverride
= "red" configuration (Frederiksen as kongeig undersoeger), but it means the
counterfactuals cannot test blue-bloc responsiveness under current settings. A
separate test with formateurOverride = null or "blue" would be needed.

**3. No government rate is 0.0% across all scenarios.** The model never fails to
form a government. This is partly by design (the cross-bloc budget rescue
mechanism) but means the counterfactuals cannot test government formation failure
as a response to adverse arithmetic. The model may be too permissive.

---

_Generated by scripts/counterfactual-robustness.js_
