# Scoring Function Decomposition

Generated: 2026-03-26

## Method

For each of the top 8 coalitions (by simulation frequency at N=5000),
we compute every multiplicative component of `scoreCoalition` plus
the external leader bonus (`frederiksenBonus` / `blueBonus`).

The final score is: `passageScore * ideoFit * sizePenalty * mwcc * flexBonus * crossBloc * precedent * govEase * leaderBonus`

P(passage) is averaged over 50 Monte Carlo draws per coalition (each draw
itself uses 800 internal MC samples). The leader bonus uses its
deterministic component (noise term E[exp(0.15*Z)] = 1.0 in expectation).

## Component definitions

| Component | Formula | What it rewards |
|-----------|---------|-----------------|
| passageScore | P(passage)^2 | Parliamentary viability (squared to amplify gap) |
| ideoFit | max(0.3, 1 - avgDist * 1.5) | Ideological coherence of coalition partners |
| sizePenalty | [1.0, 0.96, 0.90, 0.82] by nGov | Fewer government parties |
| mwcc | 1.0-1.15 | Minimum winning connected coalition bonus |
| flexBonus | 1.12/1.0/0.90 for minority govts | Small minority coalitions (flexibility) |
| crossBloc | 0.65 or 1.0 | Penalizes cross-bloc minority coalitions |
| precedent | 1 + count * weight (weight=0) | Historical precedent (currently disabled) |
| govEase | 0.7 + 0.6 * avgFeasibility | Ability to find legislative majorities per issue |
| leaderBonus | frederiksen/blue/M bonus | Formateur-specific preference (applied externally) |

## Scoring components for top 8 coalitions

| Coalition | Sim% | Seats | P(pass) | pass^2 | ideoFit | sizePen | mwcc | flex | xBloc | govEase | ldrBonus | rawScore | total |
|-----------|------|-------|---------|--------|---------|---------|------|------|-------|---------|----------|----------|-------|
| S+M+RV+SF | 30.2 | 82 | 0.993 | 0.987 | 0.452 | 0.82 | 1.15 | 0.90 | 1.00 | 1.202 | 1.150F | 0.4544 | 0.5226 |
| S+RV+SF | 28.0 | 68 | 0.892 | 0.795 | 0.434 | 0.90 | 1.15 | 1.00 | 1.00 | 1.097 | 1.150F | 0.3920 | 0.4509 |
| S+M+SF | 11.8 | 72 | 0.951 | 0.904 | 0.366 | 0.90 | 1.05 | 1.00 | 1.00 | 1.183 | 1.150F | 0.3699 | 0.4254 |
| S+M+RV | 15.3 | 62 | 0.734 | 0.539 | 0.479 | 0.90 | 1.15 | 1.00 | 1.00 | 1.241 | 1.150F | 0.3316 | 0.3813 |
| S+SF | 13.3 | 58 | 0.708 | 0.501 | 0.485 | 0.96 | 1.15 | 1.12 | 1.00 | 1.076 | 1.150F | 0.3234 | 0.3719 |
| V+KF+LA+M | 0.7 | 61 | 0.234 | 0.055 | 0.606 | 0.82 | 1.15 | 0.90 | 1.00 | 1.046 | 1.150B | 0.0295 | 0.0339 |
| V+LA+M | 0.1 | 48 | 0.160 | 0.026 | 0.549 | 0.90 | 1.15 | 1.00 | 1.00 | 1.115 | 1.150B | 0.0163 | 0.0187 |
| V+KF+M | 0.1 | 45 | 0.142 | 0.020 | 0.597 | 0.90 | 1.15 | 1.00 | 1.00 | 1.111 | 1.150B | 0.0139 | 0.0160 |

### MWCC details

| Coalition | Connected? | MinWinning? | MWCC bonus |
|-----------|-----------|-------------|------------|
| S+M+RV+SF | yes | yes | 1.15 |
| S+RV+SF | yes | yes | 1.15 |
| S+M+SF | no | yes | 1.05 |
| S+M+RV | yes | yes | 1.15 |
| S+SF | yes | yes | 1.15 |
| V+KF+LA+M | yes | yes | 1.15 |
| V+LA+M | yes | yes | 1.15 |
| V+KF+M | yes | yes | 1.15 |

### Forstaelsespapir rates

| Coalition | EL forst rate (avg) | Gov side |
|-----------|-------------------|----------|
| S+M+RV+SF | 0.70 | red |
| S+RV+SF | 0.80 | red |
| S+M+SF | 0.62 | red |
| S+M+RV | 0.62 | red |
| S+SF | 0.74 | red |
| V+KF+LA+M | 0.00 | blue |
| V+LA+M | 0.00 | blue |
| V+KF+M | 0.00 | blue |

## Variance contribution analysis

Since the score is a product of terms, we work in log-space:
`log(score) = sum(log(term_i))`. For each term, we compute
`Cov(log(term_i), log(score)) / Var(log(score))` -- the fraction
of total score variance attributable to that term.

| Term | Range [min, max] | Term variance | Cov w/ log(score) | % of variance |
|------|-----------------|---------------|-------------------|---------------|
| passageScore | [0.020, 0.987] | 2.451851 | 2.277103 | 106.8% |
| ideoFit | [0.366, 0.606] | 0.025561 | -0.195716 | -9.2% |
| govEase | [1.046, 1.241] | 0.003035 | 0.039455 | 1.9% |
| flexBonus | [0.900, 1.120] | 0.004232 | 0.015129 | 0.7% |
| mwcc | [1.050, 1.150] | 0.000905 | -0.012668 | -0.6% |
| sizePenalty | [0.820, 0.960] | 0.002456 | 0.009009 | 0.4% |
| crossBloc | [1.000, 1.000] | 0.000000 | 0.000000 | 0.0% |
| precedent | [1.000, 1.000] | 0.000000 | 0.000000 | 0.0% |
| leaderBonus | [1.150, 1.150] | 0.000000 | 0.000000 | 0.0% |

Total log-score variance: 2.132312

### Classification

**High-impact terms** (>=10% of variance): passageScore

**Moderate-impact terms** (2-10%): ideoFit

**Negligible terms** (<2%): govEase, flexBonus, mwcc, sizePenalty, crossBloc, precedent, leaderBonus

## Ranking preservation analysis

For each term, we recompute scores with that term removed (set to 1.0)
and check whether the top-5 ordering is preserved.

| Term removed | Top-5 order preserved? | Top-5 set preserved? | Rank inversions | New top 5 |
|-------------|----------------------|---------------------|-----------------|----------|
| passageScore | NO | NO | 23 | V+KF+M, S+SF, V+LA+M, S+M+RV, V+KF+LA+M |
| ideoFit | NO | YES | 2 | S+M+SF, S+M+RV+SF, S+RV+SF, S+M+RV, S+SF |
| govEase | NO | YES | 1 | S+M+RV+SF, S+RV+SF, S+M+SF, S+SF, S+M+RV |
| flexBonus | YES | YES | 0 | S+M+RV+SF, S+RV+SF, S+M+SF, S+M+RV, S+SF |
| mwcc | NO | YES | 1 | S+M+RV+SF, S+M+SF, S+RV+SF, S+M+RV, S+SF |
| sizePenalty | YES | YES | 0 | S+M+RV+SF, S+RV+SF, S+M+SF, S+M+RV, S+SF |
| crossBloc | YES | YES | 0 | S+M+RV+SF, S+RV+SF, S+M+SF, S+M+RV, S+SF |
| precedent | YES | YES | 0 | S+M+RV+SF, S+RV+SF, S+M+SF, S+M+RV, S+SF |
| leaderBonus | YES | YES | 0 | S+M+RV+SF, S+RV+SF, S+M+SF, S+M+RV, S+SF |

## Constant or near-constant terms

Terms that take the same value (or nearly so) across all top coalitions
cannot differentiate rankings by definition.

- **passageScore**: range [0.020, 0.987], ratio 48.66x.
- **ideoFit**: range [0.366, 0.606], ratio 1.66x.
- **sizePenalty**: range [0.820, 0.960], ratio 1.17x.
- **mwcc**: range [1.050, 1.150], ratio 1.10x.
- **flexBonus**: range [0.900, 1.120], ratio 1.24x.
- **crossBloc**: constant at 1.000 across all top coalitions. Purely decorative for ranking.
- **precedent**: constant at 1.000 across all top coalitions. Purely decorative for ranking.
- **govEase**: range [1.046, 1.241], ratio 1.19x.
- **leaderBonus**: constant at 1.150 across all top coalitions. Purely decorative for ranking.

## Key findings

### 1. passageScore dominates everything

`passageScore` (= P(passage)^2) explains **107% of score variance** -- more
than 100% because it actively suppresses other terms via negative covariance
(coalitions with high passage probability tend to have _worse_ ideoFit, since
broad coalitions pass budgets easily but have more internal policy distance).

The 48x range in passageScore (0.02 to 0.99) dwarfs every other term. The
next-largest range is ideoFit at 1.66x. In practice, **the scoring function
is a P(passage) ranking with decorative adjustments**.

### 2. ideoFit works against the score

ideoFit has a **-9.2% variance contribution** -- it is negatively correlated
with the final score. Coalitions that score well on P(passage) (broad,
inclusive) tend to score worse on ideoFit (more policy distance). The
distPenalty=1.5 coefficient is too weak to counteract the passage dominance:
ideoFit ranges only from 0.37 to 0.61 while passageScore ranges from 0.02
to 0.99.

### 3. Seven terms are decorative for ranking

Removing any of these terms preserves the top-5 coalition ordering:
`flexBonus`, `sizePenalty`, `crossBloc`, `precedent`, `leaderBonus`.

Three terms are literally constant across all top coalitions:
- `crossBloc`: always 1.0 (no cross-bloc minority coalitions in the top set)
- `precedent`: always 1.0 (weight hard-coded to 0)
- `leaderBonus`: always 1.15 (all S-led get the same frederiksenBonus at
  redPreference=0.5; all blue get the same 1.15 leader bonus for V)

### 4. The "coalition quality" cluster is collectively weak

`sizePenalty`, `mwcc`, `flexBonus`, and `govEase` together represent
coalition-theoretic properties (parsimony, minimum winning, flexibility,
legislative ease). Combined, they explain about 2.4% of variance. Their
collective effect is swamped by a single P(passage) decimal point.

### 5. The red-blue gap is entirely passage-driven

S-led coalitions score 0.37-0.52; blue coalitions score 0.02-0.03. This
15-to-1 gap is almost entirely passageScore (0.50-0.99 vs 0.02-0.05).
Blue coalitions actually have _better_ ideoFit (0.55-0.61 vs 0.37-0.49)
and comparable govEase. The scoring function does not produce an
independent assessment of coalition desirability -- it is a passage
probability ranking.

## Recommendations for simplification

1. **Remove `precedentBonus`**: weight is hard-coded to 0, so the term is always 1.0. It is dead code.

2. **Remove `crossBlocPenalty`**: never fires for competitive coalitions. Cross-bloc minority coalitions are already killed by low P(passage) through the bloc vote model. The 0.65 multiplier is redundant with the passage mechanism.

3. **Remove `leaderBonus` from scoreCoalition path**: the leader bonus (frederiksenBonus/blueBonus) is constant within each formateur group (all S-led coalitions get the same deterministic component). Since `selectGovernment` evaluates S-led and blue-led coalitions _separately_ via `tryGroup`, the leaderBonus cannot affect within-group ranking. It only affects the between-group comparison, which is already handled by the formateur ordering logic (S goes first).

4. **Collapse the parsimony cluster**: `sizePenalty`, `flexBonus`, and `mwcc` all reward smaller/more efficient coalitions. Replace with a single "coalition efficiency" term that can be calibrated to have meaningful weight. Currently they collectively contribute ~2.4% of variance, meaning the formateur is approximately indifferent between a tight 2-party coalition and a sprawling 4-party one.

5. **Reconsider the passage exponent**: The exponent of 2.0 is the primary reason passageScore dominates. At exponent=1, a coalition with P(passage)=0.90 scores only 90% as well as one with P(passage)=1.0. At exponent=2, it scores 81%. The squaring creates a cliff that makes P(passage) the only term that matters. If the intent is for coalition-theoretic factors (parsimony, ideological fit) to influence the ranking, the exponent needs to come down -- or those factors need much larger coefficients.

6. **Consider log-linear scoring**: The current multiplicative structure makes it hard to reason about trade-offs because every term interacts with every other. A log-linear model (`score = w1*log(passage) + w2*log(ideoFit) + ...`) would make weights directly comparable and prevent a single dominant term from suppressing all others.

## Raw data

```json
[
  {
    "coalition": "S+M+RV+SF",
    "leader": "S",
    "seats": 82,
    "nGov": 4,
    "govSide": "red",
    "avgPPass": 0.9933,
    "passageScore": 0.9867,
    "ideoFit": 0.4515,
    "avgDist": 0.3656,
    "sizePenalty": 0.82,
    "mwcc": 1.15,
    "flexBonus": 0.9,
    "crossBloc": 1,
    "govEase": 1.2018,
    "precedent": 1,
    "leaderBonus": 1.15,
    "leaderBonusLabel": "fredBonus",
    "rawScore": 0.4544,
    "totalScore": 0.5226
  },
  {
    "coalition": "S+RV+SF",
    "leader": "S",
    "seats": 68,
    "nGov": 3,
    "govSide": "red",
    "avgPPass": 0.8915,
    "passageScore": 0.7948,
    "ideoFit": 0.4344,
    "avgDist": 0.3771,
    "sizePenalty": 0.9,
    "mwcc": 1.15,
    "flexBonus": 1,
    "crossBloc": 1,
    "govEase": 1.0972,
    "precedent": 1,
    "leaderBonus": 1.15,
    "leaderBonusLabel": "fredBonus",
    "rawScore": 0.392,
    "totalScore": 0.4509
  },
  {
    "coalition": "S+M+SF",
    "leader": "S",
    "seats": 72,
    "nGov": 3,
    "govSide": "red",
    "avgPPass": 0.9511,
    "passageScore": 0.9045,
    "ideoFit": 0.3658,
    "avgDist": 0.4228,
    "sizePenalty": 0.9,
    "mwcc": 1.05,
    "flexBonus": 1,
    "crossBloc": 1,
    "govEase": 1.183,
    "precedent": 1,
    "leaderBonus": 1.15,
    "leaderBonusLabel": "fredBonus",
    "rawScore": 0.3699,
    "totalScore": 0.4254
  },
  {
    "coalition": "S+M+RV",
    "leader": "S",
    "seats": 62,
    "nGov": 3,
    "govSide": "red",
    "avgPPass": 0.7342,
    "passageScore": 0.5391,
    "ideoFit": 0.4789,
    "avgDist": 0.3474,
    "sizePenalty": 0.9,
    "mwcc": 1.15,
    "flexBonus": 1,
    "crossBloc": 1,
    "govEase": 1.2407,
    "precedent": 1,
    "leaderBonus": 1.15,
    "leaderBonusLabel": "fredBonus",
    "rawScore": 0.3316,
    "totalScore": 0.3813
  },
  {
    "coalition": "S+SF",
    "leader": "S",
    "seats": 58,
    "nGov": 2,
    "govSide": "red",
    "avgPPass": 0.7076,
    "passageScore": 0.5007,
    "ideoFit": 0.4855,
    "avgDist": 0.343,
    "sizePenalty": 0.96,
    "mwcc": 1.15,
    "flexBonus": 1.12,
    "crossBloc": 1,
    "govEase": 1.0759,
    "precedent": 1,
    "leaderBonus": 1.15,
    "leaderBonusLabel": "fredBonus",
    "rawScore": 0.3234,
    "totalScore": 0.3719
  },
  {
    "coalition": "V+KF+LA+M",
    "leader": "V",
    "seats": 61,
    "nGov": 4,
    "govSide": "blue",
    "avgPPass": 0.2342,
    "passageScore": 0.0549,
    "ideoFit": 0.6056,
    "avgDist": 0.2629,
    "sizePenalty": 0.82,
    "mwcc": 1.15,
    "flexBonus": 0.9,
    "crossBloc": 1,
    "govEase": 1.0461,
    "precedent": 1,
    "leaderBonus": 1.15,
    "leaderBonusLabel": "blueBonus",
    "rawScore": 0.0295,
    "totalScore": 0.0339
  },
  {
    "coalition": "V+LA+M",
    "leader": "V",
    "seats": 48,
    "nGov": 3,
    "govSide": "blue",
    "avgPPass": 0.1601,
    "passageScore": 0.0256,
    "ideoFit": 0.5495,
    "avgDist": 0.3004,
    "sizePenalty": 0.9,
    "mwcc": 1.15,
    "flexBonus": 1,
    "crossBloc": 1,
    "govEase": 1.1151,
    "precedent": 1,
    "leaderBonus": 1.15,
    "leaderBonusLabel": "blueBonus",
    "rawScore": 0.0163,
    "totalScore": 0.0187
  },
  {
    "coalition": "V+KF+M",
    "leader": "V",
    "seats": 45,
    "nGov": 3,
    "govSide": "blue",
    "avgPPass": 0.1424,
    "passageScore": 0.0203,
    "ideoFit": 0.5973,
    "avgDist": 0.2684,
    "sizePenalty": 0.9,
    "mwcc": 1.15,
    "flexBonus": 1,
    "crossBloc": 1,
    "govEase": 1.1113,
    "precedent": 1,
    "leaderBonus": 1.15,
    "leaderBonusLabel": "blueBonus",
    "rawScore": 0.0139,
    "totalScore": 0.016
  }
]
```
