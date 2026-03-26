// Diagnostic: what govEase value does V+KF+LA+M get?
const engine = require("../sim5-engine.js");
const parties = require("../sim5-parties.js");
const coalitions = require("../sim5-coalitions.js");

const { PARTIES_MAP, PARTIES_LIST, DIMENSIONS, SCALE_MAX, isWithinRange } = parties;

// Compute governabilityProfile for key coalitions
function govProfile(govIds, platform, mandates) {
  const govSet = new Set(govIds);
  const policyDims = DIMENSIONS.filter(d => d !== "forstaaelsespapir");
  const profile = {};
  for (const dim of policyDims) {
    let support = 0, opposition = 0;
    for (const party of PARTIES_LIST) {
      if (govSet.has(party.id)) continue;
      const pos = party.positions[dim];
      const dist = Math.abs((platform[dim] || 0) - pos.ideal) / SCALE_MAX[dim];
      const seats = mandates[party.id] || 0;
      if (isWithinRange(platform[dim], pos)) {
        support += seats * pos.weight * (1 - dist);
      } else {
        opposition += seats * pos.weight;
      }
    }
    const total = support + opposition;
    profile[dim] = { feasibility: total > 0 ? support / total : 0.5 };
  }
  return profile;
}

// Build default mandates
const mandates = {};
for (const p of PARTIES_LIST) mandates[p.id] = p.mandates;

// Negotiate platforms for key coalitions
const testCoalitions = [
  ["S", "M", "RV", "SF"],
  ["S", "RV", "SF"],
  ["S", "M", "SF"],
  ["V", "KF", "LA", "M"],
  ["S", "M", "RV"],
];

for (const gov of testCoalitions) {
  const platform = coalitions.negotiatePlatform(gov, {});
  if (!platform) { console.log(`${gov.join("+")}: platform negotiation FAILED`); continue; }
  const profile = govProfile(gov, platform, mandates);
  const dims = Object.keys(profile);
  const avgFeas = dims.reduce((s, d) => s + profile[d].feasibility, 0) / dims.length;
  const govEase = 0.7 + 0.6 * avgFeas;
  console.log(`${gov.join("+").padEnd(15)} avgFeasibility=${avgFeas.toFixed(3)}  govEase=${govEase.toFixed(3)}`);
  for (const d of dims) {
    console.log(`  ${d.padEnd(20)} ${profile[d].feasibility.toFixed(3)}`);
  }
  console.log("");
}
