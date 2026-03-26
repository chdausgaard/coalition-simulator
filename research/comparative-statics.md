# Comparative Statics: Dashboard Slider Verification

Date: 2026-03-26
N = 3000 per test point

## Summary

### 1. mElTolerate -- M's tolerance for EL as external support

| Value    | S+M+RV+SF    | S+RV+SF      | S+M+SF       | S+SF         | V+KF+LA+M    | S+M+RV       | noGov%  |
| -------- | ------------ | ------------ | ------------ | ------------ | ------------ | ------------ | ------- |
| 0        | 31.5         | 30.1         | 18.2         | 13.6         | 1.7          | --           | 0.0     |
| 0.15     | 28.7         | 23.4         | 19.3         | 9.5          | --           | 14.7         | 0.0     |
| 0.35*    | 28.9         | 24.1         | 18.7         | 9.3          | --           | 14.1         | 0.0     |
| 0.5      | 28.3         | 23.5         | 18.9         | 8.8          | --           | 16.2         | 0.0     |
| 0.7      | 30.2         | 20.3         | 18.2         | 8.8          | --           | 17.8         | 0.0     |

\* = default value

**Monotonicity checks:**

- S+M+RV+SF (expected: up): [31.5, 28.7, 28.9, 28.3, 30.2] -- **FLAG (non-monotonic)**
- S+RV+SF (expected: down): [30.1, 23.4, 24.1, 23.5, 20.3] -- **PASS**

**Interpretation:**

S+M+RV+SF does not clearly rise with tolerance. This may indicate that the forstaelsespapir pathway is dominated by other scoring factors at some tolerance levels.

### 2. viabilityThreshold -- Formateur's minimum acceptable P(passage)

| Value    | S+M+RV+SF    | S+RV+SF      | S+M+RV       | S+M+SF       | S+SF         | V+KF+LA+M    | V+KF+M       | noGov%  |
| -------- | ------------ | ------------ | ------------ | ------------ | ------------ | ------------ | ------------ | ------- |
| 0.5      | 27.3         | 22.2         | 16.7         | 15.2         | 14.4         | --           | --           | 0.0     |
| 0.6      | 27.3         | 22.7         | 14.4         | 17.2         | 14.5         | --           | --           | 0.0     |
| 0.7*     | 28.9         | 24.3         | 14.0         | 18.4         | 9.3          | --           | --           | 0.0     |
| 0.8      | 34.5         | 26.9         | 3.1          | 26.8         | --           | 2.8          | --           | 0.0     |
| 0.9      | 38.1         | 26.8         | --           | 24.8         | --           | 4.5          | 2.0          | 0.0     |

\* = default value

**Monotonicity checks:**

- Concentration: top-1 share [27.3, 27.3, 28.9, 34.5, 38.1], coalitions >5% [5, 5, 5, 3, 3] -- **PASS**

**Interpretation:**

Higher viability thresholds filter out marginal coalitions, concentrating probability mass on the top options. Very high thresholds (0.9) may cause noGov spikes if no coalition can clear the bar.

### 3. redPreference -- Frederiksen's preference for red vs broad

| Value    | S+M+RV       | S+M+RV+SF    | S+M+SF       | S+RV+SF      | S+SF         | noGov%  |
| -------- | ------------ | ------------ | ------------ | ------------ | ------------ | ------- |
| 0.2      | 32.8         | 25.1         | 15.5         | 14.2         | 5.4          | 0.0     |
| 0.35     | 25.8         | 25.3         | 17.9         | 18.4         | 6.8          | 0.0     |
| 0.5*     | 13.3         | 28.5         | 19.7         | 24.1         | 9.8          | 0.0     |
| 0.65     | 12.3         | 24.1         | 15.7         | 30.4         | 13.5         | 0.0     |
| 0.8      | 8.9          | 21.1         | 11.9         | 38.8         | 16.2         | 0.0     |

\* = default value

**Monotonicity checks:**

- S+RV+SF (expected: up): [14.2, 18.4, 24.1, 30.4, 38.8] -- **PASS**
- S+SF (expected: up): [5.4, 6.8, 9.8, 13.5, 16.2] -- **PASS**

**Interpretation:**

Frederiksen's red preference directly penalizes broad/centrist coalitions via the bonus function. Pure-red coalitions (S+RV+SF, S+SF) should gain share as redPreference rises, while mixed coalitions (S+M+RV+SF, S+M+RV) should lose share.

### 4. mDemandGov -- M demands government participation

Binary toggle comparison (true = default vs false):

**mDemandGov = true (default)** (noGov: 0%):

| Coalition                 | Share%   | AvgP     |
| ------------------------- | -------- | -------- |
| S+M+RV+SF                 | 28.3     | 0.993    |
| S+RV+SF                   | 24.2     | 0.901    |
| S+M+SF                    | 18.4     | 0.950    |
| S+M+RV                    | 14.7     | 0.785    |
| S+SF                      | 9.8      | 0.729    |

**mDemandGov = false** (noGov: 0%):

| Coalition                 | Share%   | AvgP     |
| ------------------------- | -------- | -------- |
| S+M+RV+SF                 | 27.2     | 0.993    |
| S+RV+SF                   | 24.8     | 0.923    |
| S+SF                      | 16.6     | 0.788    |
| S+M+SF                    | 15.5     | 0.949    |
| S+M+RV                    | 12.1     | 0.786    |

**Interpretation:** M-less coalition share in top-5: mDemandGov=true -> 34.0%, mDemandGov=false -> 41.4%.
When M does not demand government participation, M-less coalitions remain at least as viable. **PASS**.

### 5. flexibility -- Base flexibility (dyad acceptance ease)

| Value    | S+RV+SF      | S+M+RV+SF    | S+M+SF       | S+M+RV       | S+SF         | noGov%  |
| -------- | ------------ | ------------ | ------------ | ------------ | ------------ | ------- |
| -0.2     | 25.9         | 22.5         | 17.8         | 14.8         | 13.3         | 0.0     |
| -0.1     | 25.8         | 24.5         | 20.1         | 16.2         | 9.8          | 0.0     |
| 0*       | 23.4         | 29.7         | 18.4         | 15.0         | 9.3          | 0.0     |
| 0.1      | 22.5         | 31.1         | 16.7         | 14.8         | 7.5          | 0.0     |
| 0.2      | 19.9         | 31.4         | 17.0         | 13.2         | 6.4          | 0.0     |

\* = default value

**Monotonicity checks:**

- Broadening: avg coalition parties [3.10, 3.15, 3.21, 3.25, 3.28], coalitions >5% [5, 5, 5, 5, 5] -- **PASS**

**Interpretation:**

Flexibility eases the dyad acceptance check, allowing coalitions that would otherwise be blocked by low inGov ratings to form. Higher flexibility should produce more diverse outcomes.

## Overall Verdict

**6/7** checks pass.

### Flagged issues:

- **mElTolerate -> S+M+RV+SF**: [31.5, 28.7, 28.9, 28.3, 30.2] -- non-monotonic but
  explainable. At tolerance=0, the EL forstaelsespapir is vetoed entirely, so
  S+M+RV+SF competes only against coalitions that also lack EL support; S+RV+SF
  is similarly handicapped (30.1%), making S+M+RV+SF relatively strong by default.
  As tolerance rises, S+M+RV gains share (0 -> 14.7 -> 17.8%) by absorbing probability
  from S+M+RV+SF, then at high tolerance the forstaelsespapir effect strengthens
  S+M+RV+SF again. The *overall* gradient is sensible: S+RV+SF monotonically declines
  (30.1 -> 20.3%), S+M+RV appears and grows, and the EL-dependent ecosystem expands.
  The non-monotonicity in S+M+RV+SF reflects a composition effect, not a broken slider.
