#!/usr/bin/env node
/**
 * Audit script: negotiated platforms and governability profiles
 * for 5 key coalitions. Deterministic (no random draws needed).
 */

const sim5Parties = require("../sim5-parties.js");
const sim5Coalitions = require("../sim5-coalitions.js");
const sim5Engine = require("../sim5-engine.js");

const { DIMENSIONS, SCALE_MAX, PARTIES_MAP } = sim5Parties;
const { negotiatePlatform } = sim5Coalitions;

// governabilityProfile is on the engine module
const { governabilityProfile } = sim5Engine;

// Build default mandates from party objects
const mandates = {};
for (const id of Object.keys(PARTIES_MAP)) {
  mandates[id] = PARTIES_MAP[id].mandates;
}

// The 5 coalitions to audit (first member is formateur/leader)
const COALITIONS = [
  { label: "S+M+RV+SF", members: ["S", "M", "RV", "SF"] },
  { label: "S+RV+SF",   members: ["S", "RV", "SF"] },
  { label: "S+M+SF",    members: ["S", "M", "SF"] },
  { label: "S+M+RV",    members: ["S", "M", "RV"] },
  { label: "S+SF",      members: ["S", "SF"] },
];

const cfg = {
  formateurPull: 0.3,
  floorThreshold: 0.7,
};

// Dimension labels for nicer printing
const DIM_LABELS = {
  wealthTax: "Wealth tax",
  climateTgt: "Climate target",
  natureLaw: "Nature law",
  pesticideBan: "Pesticide ban",
  immigration: "Immigration",
  pension: "Pension",
  fiscal: "Fiscal policy",
  nuclear: "Nuclear",
  defense: "Defense",
  euConventions: "EU conventions",
  forstaaelsespapir: "Forstaaelsespapir",
  storeBededag: "Store Bededag",
};

for (const coal of COALITIONS) {
  console.log("=".repeat(80));
  console.log(`COALITION: ${coal.label}`);
  console.log(`Members: ${coal.members.join(", ")}  |  Leader (formateur): ${coal.members[0]}`);
  const totalSeats = coal.members.reduce((s, id) => s + (mandates[id] || 0), 0);
  console.log(`Total seats: ${totalSeats} (${totalSeats >= 90 ? "majority" : "minority"})`);
  console.log("-".repeat(80));

  const platform = negotiatePlatform(coal.members, cfg);
  if (!platform) {
    console.log("*** PLATFORM NEGOTIATION FAILED (floor conflict) ***\n");
    continue;
  }

  // Build a coalition object for governabilityProfile
  const coalObj = {
    government: coal.members,
    leader: coal.members[0],
    platform: platform,
  };

  const profile = governabilityProfile(coalObj, platform, mandates);

  // Header
  const partyHeaders = coal.members.map(id => id.padStart(6)).join(" ");
  console.log(
    "Dimension".padEnd(20) +
    "Scale" +
    " Platform" +
    " " + partyHeaders +
    "   Feasib."
  );
  console.log("-".repeat(20 + 6 + 9 + coal.members.length * 7 + 10));

  for (const dim of DIMENSIONS) {
    const label = (DIM_LABELS[dim] || dim).padEnd(20);
    const scale = `0-${SCALE_MAX[dim]}`.padStart(5);
    const platVal = String(platform[dim]).padStart(5);

    const partyVals = coal.members.map(id => {
      const pos = PARTIES_MAP[id].positions[dim];
      const ideal = String(pos.ideal).padStart(2);
      const w = pos.weight.toFixed(1);
      return `${ideal}(${w})`;
    }).join(" ");

    const feas = profile[dim]
      ? profile[dim].feasibility.toFixed(3).padStart(8)
      : "   n/a  ";

    console.log(`${label}${scale}   ${platVal}   ${partyVals}   ${feas}`);
  }

  // Summary: which dimensions have feasibility < 0.30?
  const hardDims = [];
  for (const dim of DIMENSIONS) {
    if (profile[dim] && profile[dim].feasibility < 0.30) {
      hardDims.push(`${DIM_LABELS[dim] || dim} (${profile[dim].feasibility.toFixed(2)})`);
    }
  }
  if (hardDims.length > 0) {
    console.log(`\n  LOW FEASIBILITY (<0.30): ${hardDims.join(", ")}`);
  }

  // Check floor violations: for each member, is the platform outside their [ideal..floor] range?
  const violations = [];
  for (const id of coal.members) {
    const party = PARTIES_MAP[id];
    for (const dim of DIMENSIONS) {
      const pos = party.positions[dim];
      const lower = Math.min(pos.ideal, pos.floor);
      const upper = Math.max(pos.ideal, pos.floor);
      const val = platform[dim];
      if (val < lower || val > upper) {
        violations.push(`${id}/${DIM_LABELS[dim] || dim}: platform=${val}, range=[${lower},${upper}], weight=${pos.weight}`);
      }
    }
  }
  if (violations.length > 0) {
    console.log(`\n  FLOOR VIOLATIONS (platform outside party's [ideal..floor]):`);
    for (const v of violations) {
      console.log(`    - ${v}`);
    }
  } else {
    console.log(`\n  No floor violations.`);
  }

  console.log("");
}
