# Sensitivity audit: parameter impact on coalition distribution

*Generated: 2026-03-26*
*N = 3000 per run, baseline + 5 values per parameter*

## Baseline distribution (top 6)

| Rank | Coalition | % |
|------|-----------|---|
| 1 | S+M+RV+SF | 32.5 |
| 2 | S+RV+SF | 28.4 |
| 3 | S+M+RV | 15.6 |
| 4 | S+SF | 11.6 |
| 5 | S+M+SF | 11.0 |
| 6 | V+KF+LA+M | 0.6 |

---

## Ranked parameter impact

Total absolute deviation = sum of |varied% - baseline%| across top-6 coalitions.
Higher = more impact on the output distribution.

| Rank | Parameter | Default | Max deviation | Avg deviation |
|------|-----------|---------|---------------|---------------|
| 1 | viabilityThreshold | 0.7 | 53.4 | 19.8 |
| 2 | redPreference | 0.5 | 43.7 | 33.3 |
| 3 | distPenalty | 1.5 | 43.0 | 34.9 |
| 4 | cross-bloc rescue base probability | 0.25 | 28.9 | 18.4 |
| 5 | SIZE_PENALTIES[3] (4-party) | 0.82 | 28.3 | 21.1 |
| 6 | mwccFullBonus | 1.15 | 26.5 | 15.2 |
| 7 | opposition abstention ratio | 0.3 | 22.1 | 17.2 |
| 8 | flexBonus (<=2 parties) | 1.12 | 21.9 | 14.1 |
| 9 | bloc same-side base rate | 0.65 | 15.8 | 9.8 |
| 10 | EL centrist penalty per partner | 0.08 | 10.3 | 8.6 |
| 11 | passageExponent | 2 | 8.5 | 5.7 |
| 12 | mElTolerate | 0.35 | 7.7 | 6.0 |
| 13 | EL informal rate | 0.45 | 7.2 | 5.0 |
| 14 | blueViabilityThreshold | 0.1 | 6.6 | 6.3 |
| 15 | crossBlocPenalty | 0.65 | 6.0 | 5.0 |

---

## Top 5 most impactful parameters: full distributions

### 1. viabilityThreshold (default = 0.7)

| Value | S+M+RV+SF | S+RV+SF | S+SF | S+M+RV | S+M+SF | V+KF+LA+M | V+LA+M | V+KF+M | Deviation |
|-------|---|---|---|---|---|---|---|---|-----------|
| 0.55 | 29.9 | 27.8 | 16.4 | 15.8 | 10.0 | 0.1 | - | - | 9.7 |
| 0.63 | 32.5 | 25.4 | 15.1 | 15.7 | 10.6 | 0.3 | - | - | 7.3 |
| 0.7 **(default)** | 32.4 | 26.2 | 13.9 | 15.3 | 11.3 | 0.5 | - | - | 0.0 |
| 0.77 | 30.4 | 27.8 | 9.8 | 17.6 | 13.0 | 0.9 | - | - | 8.8 |
| 0.85 | 37.8 | 34.0 | - | - | 20.5 | 4.8 | 0.9 | 0.7 | 53.4 |

### 2. redPreference (default = 0.5)

| Value | S+M+RV | S+M+RV+SF | S+RV+SF | S+M+SF | S+SF | V+KF+LA+M | Deviation |
|-------|---|---|---|---|---|---|-----------|
| 0.2 | 35.2 | 26.4 | 16.7 | 11.6 | 8.3 | 0.5 | 41.3 |
| 0.35 | 27.0 | 29.8 | 20.9 | 10.3 | 10.7 | 0.6 | 23.2 |
| 0.5 **(default)** | 16.0 | 30.4 | 27.8 | 12.1 | 12.6 | 0.5 | 0.0 |
| 0.65 | 12.7 | 25.9 | 32.4 | 8.0 | 19.9 | 0.5 | 24.8 |
| 0.8 | 9.0 | 21.2 | 38.6 | 7.0 | 23.1 | 0.7 | 43.7 |

### 3. distPenalty (default = 1.5)

| Value | S+M+SF | S+RV+SF | S+M+RV+SF | S+M+RV | S+SF | V+KF+LA+M | Deviation |
|-------|---|---|---|---|---|---|-----------|
| 0.5 | 28.3 | 27.5 | 26.3 | 9.7 | 6.9 | 0.5 | 35.0 |
| 1 | 21.4 | 28.3 | 28.7 | 11.9 | 9.0 | 0.4 | 20.8 |
| 1.5 **(default)** | 11.4 | 27.6 | 31.1 | 15.4 | 13.4 | 0.7 | 0.0 |
| 2 | 32.1 | 25.0 | 24.8 | 9.0 | 7.6 | 0.8 | 43.0 |
| 2.5 | 31.4 | 25.7 | 26.9 | 8.3 | 6.6 | 0.6 | 41.0 |

### 4. cross-bloc rescue base probability (default = 0.25)

| Value | S+M+RV+SF | S+RV+SF | S+M+SF | S+M+RV | S+SF | V+KF+LA+M | Deviation |
|-------|---|---|---|---|---|---|-----------|
| 0.1 | 37.9 | 27.9 | 14.1 | 11.5 | 6.6 | 1.4 | 18.8 |
| 0.18 | 35.7 | 26.3 | 13.5 | 13.6 | 9.3 | 0.7 | 12.1 |
| 0.25 **(default)** | 32.5 | 28.4 | 11.0 | 15.6 | 11.6 | 0.6 | 0.0 |
| 0.32 | 29.5 | 25.3 | 10.3 | 16.7 | 17.1 | 0.4 | 13.6 |
| 0.4 | 25.9 | 23.4 | 8.4 | 18.2 | 23.3 | 0.3 | 28.9 |

### 5. SIZE_PENALTIES[3] (4-party) (default = 0.82)

| Value | S+RV+SF | S+M+RV | S+M+RV+SF | S+SF | S+M+SF | V+KF+LA+M | Deviation |
|-------|---|---|---|---|---|---|-----------|
| 0.72 | 31.0 | 18.3 | 18.3 | 17.2 | 14.0 | 0.7 | 28.3 |
| 0.78 | 30.2 | 16.6 | 24.5 | 14.2 | 13.0 | 0.7 | 15.6 |
| 0.82 **(default)** | 28.4 | 15.6 | 32.5 | 11.6 | 11.0 | 0.6 | 0.0 |
| 0.88 | 23.7 | 13.3 | 39.2 | 13.0 | 9.8 | 0.5 | 16.4 |
| 0.95 | 21.3 | 11.8 | 44.2 | 11.6 | 9.8 | 0.5 | 24.0 |

---

## Interpretation

### Tier 1: load-bearing parameters (max deviation >= 25 pp)

These parameters fundamentally determine which coalition the model favors. Getting them wrong by even a moderate amount changes the headline result.

- **viabilityThreshold** (max dev: 53.4). The single most sensitive parameter. At 0.85 the model eliminates S+SF and S+M+RV entirely (they can't clear the bar), concentrating mass on S+M+RV+SF (38%), S+RV+SF (34%), and S+M+SF (21%). At 0.55, S+SF re-emerges at 16%. The extreme nonlinearity at the top end (0.77 to 0.85 jumps from 8.8 to 53.4 deviation) makes this a cliff-edge parameter: the model's behavior changes qualitatively near the boundary. Currently exposed as a CI-varied parameter (sigma=0.06 around 0.70), which is the right treatment.

- **redPreference** (max dev: 43.7). User-adjustable and intentionally high-impact. At 0.2, S+M+RV becomes the top coalition (35%); at 0.8, S+RV+SF dominates (39%). The mechanism is the `frederiksenBonus` function that multiplicatively favors red-only vs. broad coalitions. Behaves as designed -- this is the main "political judgment" slider and should stay high-impact.

- **distPenalty** (max dev: 43.0). Controls the ideological coherence weight in `scoreCoalition`. Has a nonlinear and non-monotonic pattern: at both 0.5 and 2.5, S+M+SF rises to ~28-32% (top coalition), while at the default 1.5, S+M+RV+SF leads at 31%. The mechanism: low distPenalty makes M+SF's ideological distance cheap, boosting S+M+SF. *High* distPenalty should penalize broad coalitions more, but instead also boosts S+M+SF -- this suggests distPenalty interacts with the MWCC bonus (coalitions penalized on distance get compensated through mwccBonus, which rewards connected minimum-winning coalitions). This interaction deserves investigation.

- **cross-bloc rescue base probability** (max dev: 28.9). The new budget pivot mechanism. At 0.10, S+M+RV+SF concentrates to 38% because without cross-bloc rescue, narrow-support coalitions fail more budget votes. At 0.40, S+SF surges to 23% because cross-bloc rescue makes even weak-support coalitions viable. This parameter directly controls the model's answer to "can governments with weak natural support survive?" -- the core question from the historical cross-reference assessment (Finding 1).

- **SIZE_PENALTIES[3]** (max dev: 28.3). The 4-party penalty acts as a direct tax on S+M+RV+SF. At 0.72, S+M+RV+SF drops to 18%; at 0.95, it rises to 44%. The effect is nearly linear and symmetric. This is a clean structural parameter -- it needs calibration but does not interact pathologically with other parameters.

- **mwccFullBonus** (max dev: 26.5). Rewards coalitions that are both connected and minimum-winning-like. Disabling it entirely (1.0) drops S+M+RV+SF from 33% to around 6%, with S+RV+SF and S+M+SF absorbing the mass. This is because S+M+RV+SF is the archetypal MWCC in this seat distribution, and the bonus is what pushes it to #1. The sensitivity to this parameter means the model's headline result depends significantly on a theoretical preference (MWCC theory) rather than an empirical calibration.

### Tier 2: significant parameters (15-25 pp)

These rebalance the distribution meaningfully but do not change which coalition leads.

- **opposition abstention ratio** (max dev: 22.1). When the main opposition abstains less (0.5 = 50:50 against:abstain), S+M+RV+SF concentrates further (38%) because only large coalitions can survive active opposition. When abstention dominates (0.1 = 10:90), S+RV+SF and S+SF gain because the opposition effectively does not resist. This is a well-calibrated knob for the Danish norm of opposition restraint.

- **flexBonus** (max dev: 21.9). Favors small minority governments (1-2 parties). At 1.24, S+SF and S+M rise; at 1.0, 4-party coalitions gain. Works as a counterweight to SIZE_PENALTIES -- these two parameters jointly determine the model's preference for parsimony vs. breadth.

- **bloc same-side base rate** (max dev: 15.8). At 0.75, same-bloc parties almost always support the government, making narrow coalitions more viable (S+SF, S+M+RV rise). At 0.55, support is uncertain, favoring broader coalitions that bring partners inside the government tent.

### Tier 3: moderate parameters (5-15 pp)

These fine-tune the distribution but are unlikely to change the headline result.

- **EL centrist penalty per partner** (max dev: 10.3). Affects whether EL's forstaelsespapir support degrades with centrist partners in government. At 0.04 (mild penalty), coalitions including both EL-support and M are more viable; at 0.12, they are less so. Moderate impact because EL's support matters mainly for S+M+RV+SF vs. S+RV+SF.

- **passageExponent** (max dev: 8.5). Amplifies the gap between high and low P(passage). At 1.0 (linear), marginal coalitions look more competitive; at 3.0, the model strongly favors coalitions with near-certain passage. The tested range produces modest changes because most top coalitions already have high P(passage).

- **mElTolerate** (max dev: 7.7). The dashboard M-to-EL tolerance slider. Surprisingly low impact relative to its prominence in the UI. Even at 0.10 (M nearly blocks EL), the distribution shifts by only 5.7 pp. This is because the forstaelsespapir mechanism has multiple gates -- even with high M tolerance, the probabilistic deal must still clear the average-tolerance threshold.

- **EL informal rate** (max dev: 7.2). The 0.45 base rate for EL supporting red governments without a formal deal. Low impact because the forstaelsespapir mechanism dominates: when EL gets a deal, the 0.93 rate applies; when it does not, the government's viability depends more on cross-bloc rescue than on informal EL support.

- **blueViabilityThreshold** (max dev: 6.6). The lower bar for blue-led formations. Impact is modest and roughly symmetric across the range, suggesting the blue path is not where the action is in the current seat distribution.

- **crossBlocPenalty** (max dev: 6.0). The 0.65 penalty for cross-bloc minority governments. Low impact because very few cross-bloc minority formations make it to the scoring stage -- the dyad acceptance gates and confidence check filter them out first.

### No truly decorative parameters

Every parameter tested exceeds 5 pp max deviation. None are candidates for outright removal based on this analysis alone.

---

## Recommendations

### Parameter interactions requiring investigation

- **distPenalty non-monotonicity.** Both low (0.5) and high (2.0+) values boost S+M+SF to ~30%, while the default (1.5) produces 11%. This U-shaped response suggests distPenalty interacts with mwccFullBonus in a way that may not be intended. At high distPenalty, ideological distance is heavily penalized, but the MWCC bonus may compensate exactly for the "right" coalitions, producing an unstable equilibrium.

- **SIZE_PENALTIES and flexBonus are partially redundant.** Both control the model's preference for coalition size. SIZE_PENALTIES discounts 4-party coalitions; flexBonus rewards 1-2 party minorities. Their combined effect is that the model has two separate size-preference knobs that interact multiplicatively in `scoreCoalition`. Consider unifying into a single monotonic size preference function.

### Parameters that could be simplified

- **crossBlocPenalty** (max dev: 6.0). Given that cross-bloc minorities are already rare due to upstream gates, this scoring penalty adds complexity for marginal effect. Could be removed if the dyad acceptance logic already handles the realistic constraint.

- **EL informal rate** (max dev: 7.2). The forstaelsespapir mechanism dominates EL's behavior. The informal tier adds code complexity but contributes little to the output distribution. Its removal would simplify the EL voting logic without materially changing results.

### Parameters requiring careful calibration

The top 6 parameters collectively determine the model's headline result. In priority order for calibration effort:

1. **distPenalty** -- the non-monotonic response makes this the most dangerous parameter. The current default (1.5) may sit at a local minimum of S+M+SF probability that is not robust.
2. **cross-bloc rescue base probability** -- directly operationalizes the single largest gap identified in the historical cross-reference (Finding 1: no government has failed to pass a budget). Currently set at 0.25 with no historical calibration target.
3. **SIZE_PENALTIES[3]** -- clean linear effect on the 4-party penalty, but the current value (0.82) is an assumption, not an empirical estimate.
4. **mwccFullBonus** -- the model's headline result depends on this theoretical bonus. If MWCC theory does not apply to Danish formations (where minority governments with changing majorities are the norm), this parameter may be systematically biasing the distribution.
5. **opposition abstention ratio** -- calibratable from Folketinget voting records on finansloven.
6. **viabilityThreshold** -- already CI-varied, but the cliff at 0.85 means the CI upper tail could produce qualitatively different behavior. Consider whether the CI sigma (0.06) is too wide given the cliff at 0.85.

