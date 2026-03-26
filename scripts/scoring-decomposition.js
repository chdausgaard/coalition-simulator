// Scoring decomposition: compute every multiplicative component of scoreCoalition
// for the top coalitions, identify which terms differentiate rankings vs. which
// are decorative.
//
// Usage: node scripts/scoring-decomposition.js

const path = require("path");
const fs = require("fs");

const engine = require(path.join(__dirname, "..", "sim5-engine.js"));
const parties = require(path.join(__dirname, "..", "sim5-parties.js"));
const coalitions = require(path.join(__dirname, "..", "sim5-coalitions.js"));

const {
  PARTIES_LIST,
  PARTIES_MAP,
  DIMENSIONS,
  SCALE_MAX,
  NA_SEATS,
  isWithinRange,
  policyDistance
} = parties;

const {
  enumerateCoalitions,
  negotiatePlatform,
  computeConcessions,
  classifyGovType,
  getGovSide
} = coalitions;

const {
  computePpassage,
  scoreCoalition,
  governabilityProfile,
  confidenceCheck,
  blocBudgetVote
} = engine;

// ── Constants from engine (mirrored, not imported) ──────────────────────
const SIZE_PENALTIES = [1.0, 0.96, 0.90, 0.82];
const HISTORICAL_PRECEDENTS = {
  "S": 7, "S+RV": 5, "S+SF": 0, "RV+S+SF": 1, "V": 4, "KF+V": 5,
  "KF+LA+V": 1, "M+S+V": 2, "EL+RV+S+SF": 1, "M+S": 1, "M+S+SF": 0,
  "M+RV+S+SF": 0, "S+V": 1, "KF+M": 0, "DD+KF+LA+V": 0, "KF+S": 0,
  "LA+M": 0, "DD+V": 0, "DD+LA": 0, "KF+LA+M+V": 0, "M": 0, "LA": 0
};

// ── Configuration (default engine settings) ─────────────────────────────
const cfg = {
  flexibility: 0,
  viabilityThreshold: 0.70,
  blueViabilityThreshold: 0.10,
  minForVotes: 70,
  distPenalty: 1.5,
  precedentWeight: 0,
  mDemandGov: true,
  sDemandGov: true,
  formateurOverride: "red",
  redPreference: 0.5,
  maxFormationRounds: 1,
  flexIncrement: 0.05,
  formateurPull: 0.3,
  floorThreshold: 0.7,
  mistillidThreshold: 0.10
};

// ── Step 1: Run a simulation to find the top coalitions ─────────────────
console.log("Running simulation (N=5000) to identify top coalitions...");
const simResult = engine.simulate({}, 5000);
const topCoalitionNames = simResult.topCoalitions
  .slice(0, 8)
  .map(c => c.govt);

console.log("Top coalitions from simulation:");
for (const c of simResult.topCoalitions.slice(0, 8)) {
  console.log(`  ${c.pct.toFixed(1)}%  ${c.govt}  (avgPpass=${c.avgPPassage})`);
}

// ── Step 2: Build mandates and enumerate coalitions ─────────────────────
const mandates = {};
for (const party of PARTIES_LIST) {
  mandates[party.id] = party.mandates;
}
for (const seat of NA_SEATS) {
  mandates[seat.id] = seat.mandates;
}

const allCoalitions = enumerateCoalitions(PARTIES_LIST, mandates, cfg);

// ── Helper: avgPairwisePolicyDistance (mirrored from engine) ────────────
function avgPairwisePolicyDistance(government) {
  if (!government || government.length < 2) return 0;
  let total = 0;
  let pairCount = 0;
  for (let i = 0; i < government.length; i++) {
    for (let j = i + 1; j < government.length; j++) {
      const partyA = PARTIES_MAP[government[i]];
      const partyB = PARTIES_MAP[government[j]];
      if (!partyA || !partyB) continue;
      total += policyDistance(partyA, partyB);
      pairCount++;
    }
  }
  return pairCount ? total / pairCount : 0;
}

function coalitionConnected(government) {
  if (!government || government.length <= 1) return true;
  return avgPairwisePolicyDistance(government) < (cfg.connectedThreshold || 0.4);
}

function coalitionMinimumWinningLike(government) {
  const seats = government.reduce((sum, id) => sum + (mandates[id] || 0), 0);
  if (seats >= 90) {
    for (const id of government) {
      if (seats - (mandates[id] || 0) >= 90) return false;
    }
    return true;
  }
  const threshold = seats * 0.08;
  for (const id of government) {
    if ((mandates[id] || 0) < threshold) return false;
  }
  return true;
}

function mwccBonusCalc(government) {
  const connected = coalitionConnected(government);
  const minimumWinning = coalitionMinimumWinningLike(government);
  const fullBonus = cfg.mwccFullBonus != null ? cfg.mwccFullBonus : 1.15;
  if (connected && minimumWinning) return fullBonus;
  if (connected) return 1.08;
  if (minimumWinning) return 1.05;
  return 1.0;
}

function historicalPrecedentBonus(government) {
  const key = government.slice().sort().join("+");
  const score = HISTORICAL_PRECEDENTS[key] || 0;
  const weight = cfg.precedentWeight != null ? cfg.precedentWeight : 0;
  return 1 + score * weight;
}

// ── Helper: frederiksenBonus deterministic component ────────────────────
function frederiksenBonusDeterministic(govMembers, redPreference) {
  const members = new Set(govMembers);
  const hasBlueOrSwingPartner = members.has("M") || members.has("V") || members.has("KF");
  const hasLeftParty = members.has("SF") || members.has("EL") || members.has("ALT");
  const midterBase = (1 - redPreference) * 0.3;
  const centristEdge = Math.max(0, 0.5 - redPreference);

  if (!hasBlueOrSwingPartner) {
    return 1.0 + redPreference * 0.3;
  }
  if (!hasLeftParty) {
    return 1.0 + midterBase + centristEdge * 0.6;
  }
  return 1.0 + midterBase - centristEdge * 0.4;
}

// ── Helper: blueBonus deterministic component ───────────────────────────
function blueBonusDeterministic(coalition) {
  const bluePM = (mandates.LA || 0) > (mandates.V || 0) ? "LA" : "V";
  return coalition.leader === bluePM ? 1.15 : 1.0;
}

// ── Step 3: For each top coalition, compute all scoring components ──────
console.log("\nComputing scoring components...");

// We need multiple P(passage) samples to get stable averages
const PPASS_SAMPLES = 50;

const decompositions = [];

for (const coalName of topCoalitionNames) {
  const govMembers = coalName.split("+");

  // Find matching coalition from enumeration
  const match = allCoalitions.find(c => {
    const ordered = [c.leader, ...c.government.filter(id => id !== c.leader)];
    return ordered.join("+") === coalName;
  });

  if (!match) {
    console.log(`  WARNING: Could not find enumerated coalition for ${coalName}`);
    continue;
  }

  const orderedGov = [match.leader, ...match.government.filter(id => id !== match.leader)];
  const coalition = { ...match, government: orderedGov };

  // Determine support (forstaelsespapir) -- run multiple times for stable average
  // For decomposition, we run with and without support to see both states
  const outsideParties = PARTIES_LIST
    .map(p => p.id)
    .filter(id => !orderedGov.includes(id));

  // Compute average P(passage) over many draws (since it's Monte Carlo)
  let pPassSum = 0;
  let forstCount = 0;
  for (let i = 0; i < PPASS_SAMPLES; i++) {
    // Simulate forstaelsespapir probabilistically
    const support = [];
    for (const partyId of outsideParties) {
      const party = PARTIES_MAP[partyId];
      if (!party) continue;
      const pos = party.positions.forstaaelsespapir;
      if (!(pos.weight >= 0.95 && pos.ideal === 0)) continue;
      let vetoed = false;
      let tolerateSum = 0;
      for (const govId of orderedGov) {
        const govParty = PARTIES_MAP[govId];
        const rel = govParty && govParty.relationships && govParty.relationships[partyId];
        const t = rel ? (rel.tolerateInGov != null ? rel.tolerateInGov : 0) : 0;
        if (t < 0.05) { vetoed = true; break; }
        tolerateSum += t;
      }
      if (vetoed) continue;
      const avgTolerate = orderedGov.length > 0 ? tolerateSum / orderedGov.length : 0;
      if (avgTolerate >= 0.20 && Math.random() < avgTolerate) {
        support.push({ party: partyId, type: "forstaaelsespapir" });
        forstCount++;
      }
    }
    coalition.support = support;
    const pPass = computePpassage(coalition, coalition.platform, mandates, cfg);
    pPassSum += pPass;
  }

  const avgPPass = pPassSum / PPASS_SAMPLES;

  // Compute each scoring component
  const nGov = orderedGov.length;
  const seats = orderedGov.reduce((sum, id) => sum + (mandates[id] || 0), 0);
  const avgDist = avgPairwisePolicyDistance(orderedGov);
  const passageExp = cfg.passageExponent != null ? cfg.passageExponent : 2.0;

  const passageScore = Math.pow(avgPPass, passageExp);
  const ideoFit = Math.max(0.3, 1 - avgDist * (cfg.distPenalty || 1.5));
  const sizePenalty = SIZE_PENALTIES[Math.max(0, Math.min(nGov, SIZE_PENALTIES.length) - 1)] || SIZE_PENALTIES[SIZE_PENALTIES.length - 1];
  const mwcc = mwccBonusCalc(orderedGov);

  let flexBonus = 1.0;
  if (seats < 90) {
    if (nGov <= 2) flexBonus = 1.12;
    else if (nGov === 3) flexBonus = 1.0;
    else flexBonus = 0.90;
  }

  let hasRed = false;
  let hasBlue = false;
  for (const id of orderedGov) {
    const bloc = PARTIES_MAP[id] ? PARTIES_MAP[id].bloc : null;
    if (bloc === "red") hasRed = true;
    if (bloc === "blue") hasBlue = true;
  }
  const crossBloc = hasRed && hasBlue && seats < 90 ? 0.65 : 1.0;

  const precedent = historicalPrecedentBonus(orderedGov);

  // govEase
  let govEase = 1.0;
  if (coalition.platform) {
    const profile = governabilityProfile(coalition, coalition.platform, mandates);
    const dims = Object.keys(profile);
    if (dims.length > 0) {
      const avgFeasibility = dims.reduce((sum, d) => sum + profile[d].feasibility, 0) / dims.length;
      govEase = 0.7 + 0.6 * avgFeasibility;
    }
  }

  // External bonuses (leader-specific, deterministic component)
  const leader = match.leader;
  let leaderBonus;
  let leaderBonusLabel;
  if (leader === "S") {
    leaderBonus = frederiksenBonusDeterministic(orderedGov, cfg.redPreference);
    leaderBonusLabel = "fredBonus";
  } else if (leader === "V" || leader === "LA") {
    leaderBonus = blueBonusDeterministic(coalition);
    leaderBonusLabel = "blueBonus";
  } else if (leader === "M") {
    leaderBonus = 1.0; // M-led bonus is pure noise
    leaderBonusLabel = "mBonus";
  } else {
    leaderBonus = 1.0;
    leaderBonusLabel = "none";
  }

  const rawScore = passageScore * ideoFit * sizePenalty * mwcc * flexBonus * crossBloc * precedent * govEase;
  const totalScore = rawScore * leaderBonus;

  // Per-party vote probabilities (for reference)
  const govSide = getGovSide(coalition);

  decompositions.push({
    coalition: coalName,
    leader,
    seats,
    nGov,
    govSide,
    avgPPass,
    passageScore,
    ideoFit,
    avgDist,
    sizePenalty,
    mwcc,
    mwccDetails: {
      connected: coalitionConnected(orderedGov),
      minimumWinning: coalitionMinimumWinningLike(orderedGov)
    },
    flexBonus,
    crossBloc,
    precedent,
    govEase,
    leaderBonus,
    leaderBonusLabel,
    rawScore,
    totalScore,
    forstRate: forstCount / PPASS_SAMPLES,
    simPct: simResult.topCoalitions.find(c => c.govt === coalName)?.pct || 0
  });
}

// Sort by totalScore descending
decompositions.sort((a, b) => b.totalScore - a.totalScore);

// ── Step 4: Variance contribution analysis ──────────────────────────────
console.log("\nComputing variance contributions...");

const termNames = [
  "passageScore", "ideoFit", "sizePenalty", "mwcc",
  "flexBonus", "crossBloc", "precedent", "govEase", "leaderBonus"
];

// Log-decomposition: since score = product of terms, log(score) = sum of log(terms)
// Variance of log(score) can be decomposed into contributions from each log(term)
const logTermValues = {};
for (const term of termNames) {
  logTermValues[term] = decompositions.map(d => Math.log(d[term]));
}

const n = decompositions.length;

function mean(arr) {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function variance(arr) {
  const m = mean(arr);
  return arr.reduce((s, v) => s + (v - m) * (v - m), 0) / arr.length;
}

function covariance(arr1, arr2) {
  const m1 = mean(arr1);
  const m2 = mean(arr2);
  return arr1.reduce((s, v, i) => s + (v - m1) * (arr2[i] - m2), 0) / arr1.length;
}

// Total variance of log(totalScore)
const logScores = decompositions.map(d => Math.log(d.totalScore));
const totalVariance = variance(logScores);

// Contribution of each term: Cov(log(term_i), log(score)) / Var(log(score))
// This gives the fraction of total variance attributable to each term
// (sum of contributions = 1 when there are no interaction effects)
const varianceContributions = {};
for (const term of termNames) {
  const cov = covariance(logTermValues[term], logScores);
  varianceContributions[term] = {
    covariance: cov,
    contribution: totalVariance > 0 ? cov / totalVariance : 0,
    termVariance: variance(logTermValues[term]),
    range: [
      Math.min(...decompositions.map(d => d[term])),
      Math.max(...decompositions.map(d => d[term]))
    ]
  };
}

// ── Step 5: Ranking preservation analysis ───────────────────────────────
console.log("Analyzing ranking preservation...");

const baseRanking = decompositions.map(d => d.coalition);
const top5 = baseRanking.slice(0, 5);

function computeRanking(excludeTerm) {
  const scores = decompositions.map(d => {
    let score = 1.0;
    for (const term of termNames) {
      if (term === excludeTerm) continue;
      score *= d[term];
    }
    return { coalition: d.coalition, score };
  });
  scores.sort((a, b) => b.score - a.score);
  return scores.map(s => s.coalition);
}

const rankingAnalysis = {};
for (const term of termNames) {
  const newRanking = computeRanking(term);
  const newTop5 = newRanking.slice(0, 5);

  // Check if top-5 ordering is preserved
  let top5Preserved = true;
  for (let i = 0; i < 5; i++) {
    if (top5[i] !== newTop5[i]) {
      top5Preserved = false;
      break;
    }
  }

  // Check if top-5 SET is preserved (same coalitions, possibly different order)
  const top5SetPreserved = top5.every(c => newTop5.includes(c));

  // Kendall tau distance for full ranking
  let inversions = 0;
  for (let i = 0; i < baseRanking.length; i++) {
    for (let j = i + 1; j < baseRanking.length; j++) {
      const newI = newRanking.indexOf(baseRanking[i]);
      const newJ = newRanking.indexOf(baseRanking[j]);
      if (newI > newJ) inversions++;
    }
  }

  rankingAnalysis[term] = {
    top5OrderPreserved: top5Preserved,
    top5SetPreserved,
    inversions,
    newTop5
  };
}

// ── Step 6: Generate markdown report ────────────────────────────────────
console.log("\nGenerating report...");

let md = `# Scoring Function Decomposition

Generated: ${new Date().toISOString().slice(0, 10)}

## Method

For each of the top 8 coalitions (by simulation frequency at N=5000),
we compute every multiplicative component of \`scoreCoalition\` plus
the external leader bonus (\`frederiksenBonus\` / \`blueBonus\`).

The final score is: \`passageScore * ideoFit * sizePenalty * mwcc * flexBonus * crossBloc * precedent * govEase * leaderBonus\`

P(passage) is averaged over ${PPASS_SAMPLES} Monte Carlo draws per coalition (each draw
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

`;

// Table header
md += `| Coalition | Sim% | Seats | P(pass) | pass^2 | ideoFit | sizePen | mwcc | flex | xBloc | govEase | ldrBonus | rawScore | total |\n`;
md += `|-----------|------|-------|---------|--------|---------|---------|------|------|-------|---------|----------|----------|-------|\n`;

for (const d of decompositions) {
  md += `| ${d.coalition} | ${d.simPct.toFixed(1)} | ${d.seats} | ${d.avgPPass.toFixed(3)} | ${d.passageScore.toFixed(3)} | ${d.ideoFit.toFixed(3)} | ${d.sizePenalty.toFixed(2)} | ${d.mwcc.toFixed(2)} | ${d.flexBonus.toFixed(2)} | ${d.crossBloc.toFixed(2)} | ${d.govEase.toFixed(3)} | ${d.leaderBonus.toFixed(3)}${d.leaderBonusLabel === "fredBonus" ? "F" : d.leaderBonusLabel === "blueBonus" ? "B" : ""} | ${d.rawScore.toFixed(4)} | ${d.totalScore.toFixed(4)} |\n`;
}

// Additional details
md += `\n### MWCC details\n\n`;
md += `| Coalition | Connected? | MinWinning? | MWCC bonus |\n`;
md += `|-----------|-----------|-------------|------------|\n`;
for (const d of decompositions) {
  md += `| ${d.coalition} | ${d.mwccDetails.connected ? "yes" : "no"} | ${d.mwccDetails.minimumWinning ? "yes" : "no"} | ${d.mwcc.toFixed(2)} |\n`;
}

md += `\n### Forstaelsespapir rates\n\n`;
md += `| Coalition | EL forst rate (avg) | Gov side |\n`;
md += `|-----------|-------------------|----------|\n`;
for (const d of decompositions) {
  md += `| ${d.coalition} | ${d.forstRate.toFixed(2)} | ${d.govSide} |\n`;
}

// ── Variance contribution table ─────────────────────────────────────────
md += `\n## Variance contribution analysis

Since the score is a product of terms, we work in log-space:
\`log(score) = sum(log(term_i))\`. For each term, we compute
\`Cov(log(term_i), log(score)) / Var(log(score))\` -- the fraction
of total score variance attributable to that term.

| Term | Range [min, max] | Term variance | Cov w/ log(score) | % of variance |\n`;
md += `|------|-----------------|---------------|-------------------|---------------|\n`;

const sortedTerms = termNames.slice().sort(
  (a, b) => Math.abs(varianceContributions[b].contribution) - Math.abs(varianceContributions[a].contribution)
);

for (const term of sortedTerms) {
  const vc = varianceContributions[term];
  md += `| ${term} | [${vc.range[0].toFixed(3)}, ${vc.range[1].toFixed(3)}] | ${vc.termVariance.toFixed(6)} | ${vc.covariance.toFixed(6)} | ${(vc.contribution * 100).toFixed(1)}% |\n`;
}

md += `\nTotal log-score variance: ${totalVariance.toFixed(6)}\n`;

// Classify terms
const highContrib = sortedTerms.filter(t => Math.abs(varianceContributions[t].contribution) >= 0.10);
const lowContrib = sortedTerms.filter(t => Math.abs(varianceContributions[t].contribution) < 0.10 && Math.abs(varianceContributions[t].contribution) >= 0.02);
const negligible = sortedTerms.filter(t => Math.abs(varianceContributions[t].contribution) < 0.02);

md += `\n### Classification\n\n`;
md += `**High-impact terms** (>=10% of variance): ${highContrib.join(", ") || "none"}\n\n`;
md += `**Moderate-impact terms** (2-10%): ${lowContrib.join(", ") || "none"}\n\n`;
md += `**Negligible terms** (<2%): ${negligible.join(", ") || "none"}\n\n`;

// ── Ranking preservation ────────────────────────────────────────────────
md += `## Ranking preservation analysis

For each term, we recompute scores with that term removed (set to 1.0)
and check whether the top-5 ordering is preserved.

| Term removed | Top-5 order preserved? | Top-5 set preserved? | Rank inversions | New top 5 |\n`;
md += `|-------------|----------------------|---------------------|-----------------|----------|\n`;

for (const term of sortedTerms) {
  const ra = rankingAnalysis[term];
  md += `| ${term} | ${ra.top5OrderPreserved ? "YES" : "NO"} | ${ra.top5SetPreserved ? "YES" : "NO"} | ${ra.inversions} | ${ra.newTop5.join(", ")} |\n`;
}

// ── Constant terms analysis ─────────────────────────────────────────────
md += `\n## Constant or near-constant terms

Terms that take the same value (or nearly so) across all top coalitions
cannot differentiate rankings by definition.

`;

for (const term of termNames) {
  const values = decompositions.map(d => d[term]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const allSame = (max - min) < 0.001;
  if (allSame) {
    md += `- **${term}**: constant at ${min.toFixed(3)} across all top coalitions. Purely decorative for ranking.\n`;
  } else {
    const ratio = max / min;
    md += `- **${term}**: range [${min.toFixed(3)}, ${max.toFixed(3)}], ratio ${ratio.toFixed(2)}x.\n`;
  }
}

// ── Recommendations ─────────────────────────────────────────────────────
md += `\n## Recommendations for simplification

`;

// Build recommendations based on data
const recs = [];

if (negligible.includes("precedent")) {
  recs.push({
    term: "precedent",
    rec: "**Remove `precedentBonus`**: weight is hard-coded to 0, so the term is always 1.0. It exists as dead code. If historical precedent is desired in the future, it should be re-implemented with a non-zero weight, but currently it is pure clutter."
  });
}

// Check if crossBloc is always the same
const crossBlocValues = new Set(decompositions.map(d => d.crossBloc));
if (crossBlocValues.size === 1) {
  recs.push({
    term: "crossBloc",
    rec: "**`crossBlocPenalty` is constant across top coalitions**: all top coalitions are either same-bloc or majority, so the 0.65 penalty never fires for the competitive set. It only affects coalitions that are already non-viable. Could be folded into the P(passage) mechanism where cross-bloc minority support is already penalized via bloc vote probabilities."
  });
}

// Check flexBonus
const flexValues = new Set(decompositions.map(d => d.flexBonus));
if (flexValues.size === 1) {
  recs.push({
    term: "flexBonus",
    rec: "**`flexBonus` is constant across top coalitions**: all competitive coalitions are minority with the same party count, so flexBonus takes a single value. The term differentiates only hypothetical 4-party minority coalitions (flexBonus=0.90) which rarely appear in top results."
  });
}

// General structural observations
recs.push({
  term: "structure",
  rec: "**Score is over-factored**: the multiplicative structure means several terms overlap in what they reward. `sizePenalty`, `flexBonus`, and `mwcc` all reward smaller coalitions. `passageScore`, `crossBloc`, and `govEase` all reward parliamentary viability. Collapsing these clusters would make the scoring function more interpretable without losing discriminatory power."
});

for (const r of recs) {
  md += `${recs.indexOf(r) + 1}. ${r.rec}\n\n`;
}

// Add raw data dump for reference
md += `## Raw data\n\n`;
md += "```json\n";
md += JSON.stringify(decompositions.map(d => ({
  coalition: d.coalition,
  leader: d.leader,
  seats: d.seats,
  nGov: d.nGov,
  govSide: d.govSide,
  avgPPass: +d.avgPPass.toFixed(4),
  passageScore: +d.passageScore.toFixed(4),
  ideoFit: +d.ideoFit.toFixed(4),
  avgDist: +d.avgDist.toFixed(4),
  sizePenalty: +d.sizePenalty.toFixed(4),
  mwcc: +d.mwcc.toFixed(4),
  flexBonus: +d.flexBonus.toFixed(4),
  crossBloc: +d.crossBloc.toFixed(4),
  govEase: +d.govEase.toFixed(4),
  precedent: +d.precedent.toFixed(4),
  leaderBonus: +d.leaderBonus.toFixed(4),
  leaderBonusLabel: d.leaderBonusLabel,
  rawScore: +d.rawScore.toFixed(4),
  totalScore: +d.totalScore.toFixed(4)
})), null, 2);
md += "\n```\n";

// Write report
const outPath = path.join(__dirname, "..", "research", "scoring-decomposition.md");
fs.writeFileSync(outPath, md);
console.log(`\nWrote report to ${outPath}`);

// Also print summary to console
console.log("\n=== SUMMARY ===");
console.log(`\nVariance contributions (sorted):`);
for (const term of sortedTerms) {
  const vc = varianceContributions[term];
  console.log(`  ${term.padEnd(15)} ${(vc.contribution * 100).toFixed(1).padStart(6)}%  range=[${vc.range[0].toFixed(3)}, ${vc.range[1].toFixed(3)}]`);
}
console.log(`\nHigh-impact: ${highContrib.join(", ")}`);
console.log(`Moderate: ${lowContrib.join(", ")}`);
console.log(`Negligible: ${negligible.join(", ")}`);
