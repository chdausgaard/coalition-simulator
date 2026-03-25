# Party Data Extraction Prompts

Sequential prompts for extracting structured party data from research briefs.
Feed each prompt to a chat agent with the relevant brief files attached.
Include the schema (Prompt 0) with every subsequent prompt.

---

## Prompt 0 — Schema (include with every prompt)

I'm building a coalition simulator for the 2026 Danish election. I need you to extract structured party data from research briefs into JavaScript objects following this exact schema. Output ONLY the JavaScript objects, no commentary outside of inline comments.

```javascript
const PARTY_TEMPLATE = {
  id: "XX",                    // Party abbreviation
  name: "Full Name",
  mandates: 0,
  bloc: "red|blue|swing",

  // Government participation
  govEligible: true|false,     // Can realistically enter government
  pmEligible: true|false,      // Can realistically be PM
  pmDemand: true|false,        // Demands PM post as condition

  // Participation format preferences (must sum to ~1.0 for applicable formats)
  participationPref: {
    government: 0.0,           // Wants cabinet seats
    stoettepartiForst: 0.0,    // External support WITH forståelsespapir
    stoettepartiLoose: 0.0,    // External support without written agreement
    opposition: 0.0            // Prefers opposition to bad deals
  },

  // Negotiation posture
  globalHarshness: 0.0,        // 0 = maximally flexible/pragmatic, 1 = maximally rigid

  // Policy positions: { ideal, floor, ceiling, weight }
  //   ideal: party's preferred outcome on this scale
  //   floor: WORST outcome they'd accept without walking away
  //   ceiling: BEST outcome they could realistically achieve
  //   weight: how much they care (0.0 = don't care, 1.0 = walk away over this)
  //
  // IMPORTANT on floor/ceiling direction:
  //   For a LEFT-leaning party whose ideal is low on the scale, floor = a HIGHER
  //   number (the rightward compromise they'd grudgingly accept).
  //   For a RIGHT-leaning party whose ideal is high, floor = a LOWER number
  //   (the leftward compromise they'd grudgingly accept).
  //   Ceiling is always on the opposite side from floor, toward the party's
  //   preferred direction (the best they could hope to get in negotiations).
  //
  // SCALES:
  //   wealthTax:    0=EL 1%/35M, 1=SF 0.5%/10M, 2=S 0.5%/25M, 3=substitute/restructure(M), 4=none
  //   climateTgt:   0=100% by 2035, 1=90% by 2035, 2=82% current law, 3=delay/weaken
  //   natureLaw:    0=binding 30%/10%, 1=voluntary targets, 2=no new law
  //   pesticideBan: 0=full ban, 1=partial, 2=none
  //   immigration:  0=humanitarian, 1=liberal, 2=status quo, 3=S strict, 4=DF maximalist
  //   pension:      0=slow increases(S), 1=status quo, 2=abolish Arne-pension
  //   fiscal:       0=expansive/welfare, 1=moderate, 2=tight/tax cuts
  //   nuclear:      0=strong support, 1=open, 2=oppose
  //   defense:      0=3.5%+ hawk, 1=3.5% consensus, 2=lower
  //   euConventions: 0=strengthen, 1=defend status quo, 2=weaken/withdraw
  //   forstaaelsespapir: 0=requires one, 1=prefers, 2=indifferent, 3=opposes
  //   storeBededag: 0=reinstate, 1=indifferent, 2=keep abolished
  positions: {
    wealthTax:    { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    climateTgt:   { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    natureLaw:    { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    pesticideBan: { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    immigration:  { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    pension:      { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    fiscal:       { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    nuclear:      { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    defense:      { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    euConventions: { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    forstaaelsespapir: { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    storeBededag: { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 }
  },

  // What this party trades away vs. fights for (lists of dimension names)
  concessionCurrency: [],      // Dimensions they'll give up in negotiations
  demandCurrency: [],          // Dimensions they'll fight hardest for

  // Directed relationships: this party's acceptance of each other party
  // Keys: other party IDs
  // Values: { inGov, asSupport, tolerateInGov, asPM } — all probabilities 0.0-1.0
  //   inGov: accept them as a coalition partner in the SAME government
  //   asSupport: accept them as an external støtteparti for a government this party is in
  //   tolerateInGov: won't govern WITH them, but can live with them being in the
  //                  government while this party supports from outside
  //   asPM: accept them as Prime Minister
  // Only include entries where there is friction (acceptance < 1.0).
  // Omitted pairs are assumed to be 1.0 (no friction).
  relationships: {}
};
```

---

## Prompt 1 — Socialdemokratiet, SF, Moderaterne

I'm building a coalition simulator for the 2026 Danish election. I need you to extract structured party data from research briefs into JavaScript objects following this exact schema. Output ONLY the JavaScript objects, no commentary outside of inline comments.

```javascript
const PARTY_TEMPLATE = {
  id: "XX",                    // Party abbreviation
  name: "Full Name",
  mandates: 0,
  bloc: "red|blue|swing",

  // Government participation
  govEligible: true|false,     // Can realistically enter government
  pmEligible: true|false,      // Can realistically be PM
  pmDemand: true|false,        // Demands PM post as condition

  // Participation format preferences (must sum to ~1.0 for applicable formats)
  participationPref: {
    government: 0.0,           // Wants cabinet seats
    stoettepartiForst: 0.0,    // External support WITH forståelsespapir
    stoettepartiLoose: 0.0,    // External support without written agreement
    opposition: 0.0            // Prefers opposition to bad deals
  },

  // Negotiation posture
  globalHarshness: 0.0,        // 0 = maximally flexible/pragmatic, 1 = maximally rigid

  // Policy positions: { ideal, floor, ceiling, weight }
  //   ideal: party's preferred outcome on this scale
  //   floor: WORST outcome they'd accept without walking away
  //   ceiling: BEST outcome they could realistically achieve
  //   weight: how much they care (0.0 = don't care, 1.0 = walk away over this)
  //
  // IMPORTANT on floor/ceiling direction:
  //   For a LEFT-leaning party whose ideal is low on the scale, floor = a HIGHER
  //   number (the rightward compromise they'd grudgingly accept).
  //   For a RIGHT-leaning party whose ideal is high, floor = a LOWER number
  //   (the leftward compromise they'd grudgingly accept).
  //   Ceiling is always on the opposite side from floor, toward the party's
  //   preferred direction (the best they could hope to get in negotiations).
  //
  // SCALES:
  //   wealthTax:    0=EL 1%/35M, 1=SF 0.5%/10M, 2=S 0.5%/25M, 3=substitute/restructure(M), 4=none
  //   climateTgt:   0=100% by 2035, 1=90% by 2035, 2=82% current law, 3=delay/weaken
  //   natureLaw:    0=binding 30%/10%, 1=voluntary targets, 2=no new law
  //   pesticideBan: 0=full ban, 1=partial, 2=none
  //   immigration:  0=humanitarian, 1=liberal, 2=status quo, 3=S strict, 4=DF maximalist
  //   pension:      0=slow increases(S), 1=status quo, 2=abolish Arne-pension
  //   fiscal:       0=expansive/welfare, 1=moderate, 2=tight/tax cuts
  //   nuclear:      0=strong support, 1=open, 2=oppose
  //   defense:      0=3.5%+ hawk, 1=3.5% consensus, 2=lower
  //   euConventions: 0=strengthen, 1=defend status quo, 2=weaken/withdraw
  //   forstaaelsespapir: 0=requires one, 1=prefers, 2=indifferent, 3=opposes
  //   storeBededag: 0=reinstate, 1=indifferent, 2=keep abolished
  positions: {
    wealthTax:    { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    climateTgt:   { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    natureLaw:    { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    pesticideBan: { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    immigration:  { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    pension:      { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    fiscal:       { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    nuclear:      { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    defense:      { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    euConventions: { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    forstaaelsespapir: { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    storeBededag: { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 }
  },

  // What this party trades away vs. fights for (lists of dimension names)
  concessionCurrency: [],      // Dimensions they'll give up in negotiations
  demandCurrency: [],          // Dimensions they'll fight hardest for

  // Directed relationships: this party's acceptance of each other party
  // Keys: other party IDs
  // Values: { inGov, asSupport, tolerateInGov, asPM } — all probabilities 0.0-1.0
  //   inGov: accept them as a coalition partner in the SAME government
  //   asSupport: accept them as an external støtteparti for a government this party is in
  //   tolerateInGov: won't govern WITH them, but can live with them being in the
  //                  government while this party supports from outside
  //   asPM: accept them as Prime Minister
  // Only include entries where there is friction (acceptance < 1.0).
  // Omitted pairs are assumed to be 1.0 (no friction).
  relationships: {}
};
```
Now extract structured data for these 3 parties. I'm attaching the research briefs for each.

GUIDELINES:
- Base ALL values on evidence from the briefs. For every non-obvious coding choice, add a brief inline `//` comment quoting or citing the specific passage that justifies it.
- For floor/ceiling: floor = the WORST outcome they'd accept without walking out. Ceiling = the best they could realistically achieve in negotiations. These are NOT symmetric around the ideal.
- For weight: 0.0 = don't care, 1.0 = walk away from negotiations over this. Use the brief's own language as your guide. Phrases like "ultimativt krav" suggest 0.85+. Phrases like "not a goal in itself" or explicit concession signals suggest 0.2-0.4. Map the strength of language to the scale using your own judgment.
- For relationships: only include party pairs where the brief documents friction or notable acceptance/reluctance. Distinguish carefully between:
  - "won't govern WITH them" (low `inGov`)
  - "can't tolerate them being in the government at all" (low `tolerateInGov`)
  - "won't accept them as PM" (low `asPM`)
  These are meaningfully different stances — the briefs often distinguish them.
- For participation preferences: a party demanding cabinet seats as a non-negotiable condition should have government near 0.95. A party that explicitly only wants a forståelsespapir role should have stoettepartiForst as the dominant value.
- globalHarshness should reflect the party's OVERALL negotiation posture across all issues, not any single dimension. A party described as "maximally flexible" or having "negligible grassroots constraints" should be low. A party with multiple "ultimativt" demands and rigid public commitments should be high.

Process each party fully before moving to the next. Be thorough — this data drives the entire simulator.

**Attach: S.md, SF.md, M.md**

---

## Prompt 2 — Enhedslisten, Alternativet, Radikale Venstre

I'm building a coalition simulator for the 2026 Danish election. I need you to extract structured party data from research briefs into JavaScript objects following this exact schema. Output ONLY the JavaScript objects, no commentary outside of inline comments.

```javascript
const PARTY_TEMPLATE = {
  id: "XX",                    // Party abbreviation
  name: "Full Name",
  mandates: 0,
  bloc: "red|blue|swing",

  // Government participation
  govEligible: true|false,     // Can realistically enter government
  pmEligible: true|false,      // Can realistically be PM
  pmDemand: true|false,        // Demands PM post as condition

  // Participation format preferences (must sum to ~1.0 for applicable formats)
  participationPref: {
    government: 0.0,           // Wants cabinet seats
    stoettepartiForst: 0.0,    // External support WITH forståelsespapir
    stoettepartiLoose: 0.0,    // External support without written agreement
    opposition: 0.0            // Prefers opposition to bad deals
  },

  // Negotiation posture
  globalHarshness: 0.0,        // 0 = maximally flexible/pragmatic, 1 = maximally rigid

  // Policy positions: { ideal, floor, ceiling, weight }
  //   ideal: party's preferred outcome on this scale
  //   floor: WORST outcome they'd accept without walking away
  //   ceiling: BEST outcome they could realistically achieve
  //   weight: how much they care (0.0 = don't care, 1.0 = walk away over this)
  //
  // IMPORTANT on floor/ceiling direction:
  //   For a LEFT-leaning party whose ideal is low on the scale, floor = a HIGHER
  //   number (the rightward compromise they'd grudgingly accept).
  //   For a RIGHT-leaning party whose ideal is high, floor = a LOWER number
  //   (the leftward compromise they'd grudgingly accept).
  //   Ceiling is always on the opposite side from floor, toward the party's
  //   preferred direction (the best they could hope to get in negotiations).
  //
  // SCALES:
  //   wealthTax:    0=EL 1%/35M, 1=SF 0.5%/10M, 2=S 0.5%/25M, 3=substitute/restructure(M), 4=none
  //   climateTgt:   0=100% by 2035, 1=90% by 2035, 2=82% current law, 3=delay/weaken
  //   natureLaw:    0=binding 30%/10%, 1=voluntary targets, 2=no new law
  //   pesticideBan: 0=full ban, 1=partial, 2=none
  //   immigration:  0=humanitarian, 1=liberal, 2=status quo, 3=S strict, 4=DF maximalist
  //   pension:      0=slow increases(S), 1=status quo, 2=abolish Arne-pension
  //   fiscal:       0=expansive/welfare, 1=moderate, 2=tight/tax cuts
  //   nuclear:      0=strong support, 1=open, 2=oppose
  //   defense:      0=3.5%+ hawk, 1=3.5% consensus, 2=lower
  //   euConventions: 0=strengthen, 1=defend status quo, 2=weaken/withdraw
  //   forstaaelsespapir: 0=requires one, 1=prefers, 2=indifferent, 3=opposes
  //   storeBededag: 0=reinstate, 1=indifferent, 2=keep abolished
  positions: {
    wealthTax:    { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    climateTgt:   { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    natureLaw:    { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    pesticideBan: { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    immigration:  { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    pension:      { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    fiscal:       { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    nuclear:      { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    defense:      { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    euConventions: { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    forstaaelsespapir: { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    storeBededag: { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 }
  },

  // What this party trades away vs. fights for (lists of dimension names)
  concessionCurrency: [],      // Dimensions they'll give up in negotiations
  demandCurrency: [],          // Dimensions they'll fight hardest for

  // Directed relationships: this party's acceptance of each other party
  // Keys: other party IDs
  // Values: { inGov, asSupport, tolerateInGov, asPM } — all probabilities 0.0-1.0
  //   inGov: accept them as a coalition partner in the SAME government
  //   asSupport: accept them as an external støtteparti for a government this party is in
  //   tolerateInGov: won't govern WITH them, but can live with them being in the
  //                  government while this party supports from outside
  //   asPM: accept them as Prime Minister
  // Only include entries where there is friction (acceptance < 1.0).
  // Omitted pairs are assumed to be 1.0 (no friction).
  relationships: {}
};
```
Extract structured data for these 3 parties. Same guidelines as before — base everything on the briefs, cite evidence in inline comments, use your independent judgment on all numerical values.

NOTES SPECIFIC TO THESE PARTIES:

**EL:** The brief documents a BINARY budget-vote pattern — WITH forståelsespapir they vote FOR every budget, WITHOUT they vote AGAINST every budget. This is a structural feature, not a preference. Code it through the forstaaelsespapir position: this should have the highest weight of any position for any party in the dataset, and a floor that allows essentially zero flexibility.

Also note: EL's relationship with M is nuanced. They pre-election ruled out governing WITH M, but post-election language shifted. They won't sit in cabinet with M but might *tolerate* M being in a government they support from outside. Capture this distinction in the relationship entry using the `inGov` vs `tolerateInGov` fields.

**ALT:** The Svinepagt (Pig Pact) is ALT's single ultimative demand. There's no dimension in the schema that maps to it directly. Note it in a comment — we'll handle it as a special gate in the engine. Don't try to shoehorn it into an existing dimension.

**RV:** RV explicitly opposes the wealth tax despite being a red-bloc party. This is a cross-cutting position — make sure the coding reflects it.

**Attach: EL.md, ALT.md, RV.md**

---

## Prompt 3 — Venstre, Liberal Alliance, Det Konservative Folkeparti

I'm building a coalition simulator for the 2026 Danish election. I need you to extract structured party data from research briefs into JavaScript objects following this exact schema. Output ONLY the JavaScript objects, no commentary outside of inline comments.

```javascript
const PARTY_TEMPLATE = {
  id: "XX",                    // Party abbreviation
  name: "Full Name",
  mandates: 0,
  bloc: "red|blue|swing",

  // Government participation
  govEligible: true|false,     // Can realistically enter government
  pmEligible: true|false,      // Can realistically be PM
  pmDemand: true|false,        // Demands PM post as condition

  // Participation format preferences (must sum to ~1.0 for applicable formats)
  participationPref: {
    government: 0.0,           // Wants cabinet seats
    stoettepartiForst: 0.0,    // External support WITH forståelsespapir
    stoettepartiLoose: 0.0,    // External support without written agreement
    opposition: 0.0            // Prefers opposition to bad deals
  },

  // Negotiation posture
  globalHarshness: 0.0,        // 0 = maximally flexible/pragmatic, 1 = maximally rigid

  // Policy positions: { ideal, floor, ceiling, weight }
  //   ideal: party's preferred outcome on this scale
  //   floor: WORST outcome they'd accept without walking away
  //   ceiling: BEST outcome they could realistically achieve
  //   weight: how much they care (0.0 = don't care, 1.0 = walk away over this)
  //
  // IMPORTANT on floor/ceiling direction:
  //   For a LEFT-leaning party whose ideal is low on the scale, floor = a HIGHER
  //   number (the rightward compromise they'd grudgingly accept).
  //   For a RIGHT-leaning party whose ideal is high, floor = a LOWER number
  //   (the leftward compromise they'd grudgingly accept).
  //   Ceiling is always on the opposite side from floor, toward the party's
  //   preferred direction (the best they could hope to get in negotiations).
  //
  // SCALES:
  //   wealthTax:    0=EL 1%/35M, 1=SF 0.5%/10M, 2=S 0.5%/25M, 3=substitute/restructure(M), 4=none
  //   climateTgt:   0=100% by 2035, 1=90% by 2035, 2=82% current law, 3=delay/weaken
  //   natureLaw:    0=binding 30%/10%, 1=voluntary targets, 2=no new law
  //   pesticideBan: 0=full ban, 1=partial, 2=none
  //   immigration:  0=humanitarian, 1=liberal, 2=status quo, 3=S strict, 4=DF maximalist
  //   pension:      0=slow increases(S), 1=status quo, 2=abolish Arne-pension
  //   fiscal:       0=expansive/welfare, 1=moderate, 2=tight/tax cuts
  //   nuclear:      0=strong support, 1=open, 2=oppose
  //   defense:      0=3.5%+ hawk, 1=3.5% consensus, 2=lower
  //   euConventions: 0=strengthen, 1=defend status quo, 2=weaken/withdraw
  //   forstaaelsespapir: 0=requires one, 1=prefers, 2=indifferent, 3=opposes
  //   storeBededag: 0=reinstate, 1=indifferent, 2=keep abolished
  positions: {
    wealthTax:    { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    climateTgt:   { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    natureLaw:    { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    pesticideBan: { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    immigration:  { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    pension:      { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    fiscal:       { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    nuclear:      { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    defense:      { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    euConventions: { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    forstaaelsespapir: { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    storeBededag: { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 }
  },

  // What this party trades away vs. fights for (lists of dimension names)
  concessionCurrency: [],      // Dimensions they'll give up in negotiations
  demandCurrency: [],          // Dimensions they'll fight hardest for

  // Directed relationships: this party's acceptance of each other party
  // Keys: other party IDs
  // Values: { inGov, asSupport, tolerateInGov, asPM } — all probabilities 0.0-1.0
  //   inGov: accept them as a coalition partner in the SAME government
  //   asSupport: accept them as an external støtteparti for a government this party is in
  //   tolerateInGov: won't govern WITH them, but can live with them being in the
  //                  government while this party supports from outside
  //   asPM: accept them as Prime Minister
  // Only include entries where there is friction (acceptance < 1.0).
  // Omitted pairs are assumed to be 1.0 (no friction).
  relationships: {}
};
```
Extract structured data for these 3 parties. Same guidelines — base everything on the briefs, cite evidence, use your independent judgment.

NOTES SPECIFIC TO THESE PARTIES:

**V:** The election-night ultimatum ("blå midterregering or opposition") makes V's rejection of governing with S very firm. But don't code it as a hard 0.00 — the simulator should allow users to explore "what if V softens?" Code it as a very low but non-zero probability (the brief should guide you on how categorical the language is).

**KF:** KF is noteworthy as the ONLY blue-bloc party that maintains deliberate ambiguity about governing with S. The brief should contain quotes showing this openness. Make sure KF's acceptance of S is notably higher than V's or LA's — the distinction matters for the simulator.

**LA:** The brief should reveal a contrast between a hard identity-level veto on governing with S (rigid on *who*) and pragmatic flexibility on policy substance (flexible on *what*). Capture this: the relationship entries should be very restrictive while the policy positions may show more room for compromise than the rhetoric suggests.

**Attach: V.md, LA.md, KF.md**

---

## Prompt 4 — Dansk Folkeparti, Danmarksdemokraterne, Borgernes Parti, North Atlantic

I'm building a coalition simulator for the 2026 Danish election. I need you to extract structured party data from research briefs into JavaScript objects following this exact schema. Output ONLY the JavaScript objects, no commentary outside of inline comments.

```javascript
const PARTY_TEMPLATE = {
  id: "XX",                    // Party abbreviation
  name: "Full Name",
  mandates: 0,
  bloc: "red|blue|swing",

  // Government participation
  govEligible: true|false,     // Can realistically enter government
  pmEligible: true|false,      // Can realistically be PM
  pmDemand: true|false,        // Demands PM post as condition

  // Participation format preferences (must sum to ~1.0 for applicable formats)
  participationPref: {
    government: 0.0,           // Wants cabinet seats
    stoettepartiForst: 0.0,    // External support WITH forståelsespapir
    stoettepartiLoose: 0.0,    // External support without written agreement
    opposition: 0.0            // Prefers opposition to bad deals
  },

  // Negotiation posture
  globalHarshness: 0.0,        // 0 = maximally flexible/pragmatic, 1 = maximally rigid

  // Policy positions: { ideal, floor, ceiling, weight }
  //   ideal: party's preferred outcome on this scale
  //   floor: WORST outcome they'd accept without walking away
  //   ceiling: BEST outcome they could realistically achieve
  //   weight: how much they care (0.0 = don't care, 1.0 = walk away over this)
  //
  // IMPORTANT on floor/ceiling direction:
  //   For a LEFT-leaning party whose ideal is low on the scale, floor = a HIGHER
  //   number (the rightward compromise they'd grudgingly accept).
  //   For a RIGHT-leaning party whose ideal is high, floor = a LOWER number
  //   (the leftward compromise they'd grudgingly accept).
  //   Ceiling is always on the opposite side from floor, toward the party's
  //   preferred direction (the best they could hope to get in negotiations).
  //
  // SCALES:
  //   wealthTax:    0=EL 1%/35M, 1=SF 0.5%/10M, 2=S 0.5%/25M, 3=substitute/restructure(M), 4=none
  //   climateTgt:   0=100% by 2035, 1=90% by 2035, 2=82% current law, 3=delay/weaken
  //   natureLaw:    0=binding 30%/10%, 1=voluntary targets, 2=no new law
  //   pesticideBan: 0=full ban, 1=partial, 2=none
  //   immigration:  0=humanitarian, 1=liberal, 2=status quo, 3=S strict, 4=DF maximalist
  //   pension:      0=slow increases(S), 1=status quo, 2=abolish Arne-pension
  //   fiscal:       0=expansive/welfare, 1=moderate, 2=tight/tax cuts
  //   nuclear:      0=strong support, 1=open, 2=oppose
  //   defense:      0=3.5%+ hawk, 1=3.5% consensus, 2=lower
  //   euConventions: 0=strengthen, 1=defend status quo, 2=weaken/withdraw
  //   forstaaelsespapir: 0=requires one, 1=prefers, 2=indifferent, 3=opposes
  //   storeBededag: 0=reinstate, 1=indifferent, 2=keep abolished
  positions: {
    wealthTax:    { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    climateTgt:   { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    natureLaw:    { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    pesticideBan: { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    immigration:  { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    pension:      { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    fiscal:       { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    nuclear:      { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    defense:      { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    euConventions: { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    forstaaelsespapir: { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 },
    storeBededag: { ideal: 0, floor: 0, ceiling: 0, weight: 0.0 }
  },

  // What this party trades away vs. fights for (lists of dimension names)
  concessionCurrency: [],      // Dimensions they'll give up in negotiations
  demandCurrency: [],          // Dimensions they'll fight hardest for

  // Directed relationships: this party's acceptance of each other party
  // Keys: other party IDs
  // Values: { inGov, asSupport, tolerateInGov, asPM } — all probabilities 0.0-1.0
  //   inGov: accept them as a coalition partner in the SAME government
  //   asSupport: accept them as an external støtteparti for a government this party is in
  //   tolerateInGov: won't govern WITH them, but can live with them being in the
  //                  government while this party supports from outside
  //   asPM: accept them as Prime Minister
  // Only include entries where there is friction (acceptance < 1.0).
  // Omitted pairs are assumed to be 1.0 (no friction).
  relationships: {}
};
```
Extract structured data for these 4 entities. Same guidelines.

NOTES SPECIFIC TO THESE PARTIES:

**DF:** The mutual Løkke veto is the blue bloc's defining obstacle. DF's brief should contain the precise formulation — something like "Løkke will not become a minister on my mandates." Parse this carefully:
- `inGov` for M: essentially zero (won't make him a minister)
- `tolerateInGov` for M: potentially slightly higher (hasn't fully ruled out M as støtteparti in a government DF also supports from outside)
- Also model the RECIPROCAL in M's data if you haven't already — Løkke called DF "unfit to sit in government"

**DD:** Similar structure to DF on M, but the brief should show more institutional pragmatism. DD's cross-party agreement track record (defense, kontanthjælp, psychiatry, elderly care) suggests rhetoric overstates actual rigidity. Let the evidence guide you on how much softer DD is than DF.

**BP:** The brief should make clear that BP is effectively excluded from government by other parties ("Inviting Lars Boje into government is not going to happen"). Set govEligible=false. BP matters only as a potential budget vote — its leverage is purely through the relationship/support channel.

**NA (North Atlantic seats):** These 4 seats use a different schema. Code them as:

```javascript
const NA_SEATS = [
  {
    id: "XX",
    name: "...",
    mandates: 1,
    bloc: "na",
    pRed: 0.0,        // Probability of voting with red bloc
    pFlexible: 0.0,   // Probability of being flexible/swing
    pBlue: 0.0,       // Probability of voting with blue bloc
    notes: "..."       // Key leverage demands, anti-DF constraint, etc.
  }
];
```

The brief should document the Faroese predictable split and the Greenlandic unknowns. For the two Greenlandic seats, capture the anti-DF structural constraint (DF's proposal that Greenlandic independence require a Danish referendum is unacceptable to both Greenlandic MPs).

**Attach: DF.md, DD.md, BP.md, NA.md**

---

## Prompt 5 — Validation and cross-party consistency

[Paste the COMPLETE output from Prompts 1-4 — all party objects together]

Review ALL the extracted party data for internal consistency. You are looking for errors, gaps, and miscalibrations. Check each of the following systematically:

### 1. Reciprocal relationships
For every directional relationship A→B, check whether B→A also exists (or should). Examples:
- If SF→M inGov is coded, is M→SF coded? What does the M brief say about SF?
- If DF→M is coded, is M→DF coded?
Fill any gaps with appropriate values and cite your reasoning.

### 2. Scale consistency
Are all parties using the same scales the same way? Spot-check:
- Are the leftmost parties (EL, ALT) consistently at the low end of each scale?
- Are the rightmost parties (LA, DF, BP) consistently at the high end?
- Do the orderings within scales match what the briefs describe?

### 3. Floor/ceiling logic
Verify for every party and every dimension:
- No party has floor beyond ideal in the wrong direction (floor should be toward the compromise direction, not past ideal toward the party's preferred extreme)
- Ceiling should be toward the party's preferred extreme, not past ideal toward compromise
- A weight of 0.8+ should correspond to a narrow floor-ideal gap (rigid parties don't accept much movement)
- A weight of 0.2 should correspond to a wide floor-ideal gap (flexible parties accept a lot of movement)

### 4. Weight calibration
List every party's top 3 demands by weight value. Do the rankings match what the briefs describe as each party's priorities? Flag any cases where a dimension coded with high weight is described as "negotiable" in the brief, or where a dimension coded with low weight is described as "ultimativt."

### 5. Harshness ordering
Rank all parties from lowest to highest globalHarshness. Sanity-check this ordering against the briefs:
- Parties described as "maximally flexible," "pragmatic," or having "negligible grassroots constraints" should cluster at the low end
- Parties with multiple "ultimativt" demands, rigid public commitments, or identity-defining red lines should cluster at the high end
- Flag any party whose rank in this ordering seems inconsistent with how the brief characterizes their negotiation posture, and explain why

### 6. Missing relationships
Check every pair of parties that could plausibly have friction. At minimum:
- All blue-bloc parties should have relationship entries with S (they're the likely PM party)
- All red-bloc parties should have entries with V and LA (if they've expressed friction)
- M should have entries for both directions with nearly every party (M is the kingmaker)
- DF should have entries for both S and M (categorical vetoes documented)

### 7. Participation preference coherence
- Verify preferences sum to approximately 1.0 for each party
- Check that govEligible=false parties don't have high government participation preferences
- Check that pmEligible=false parties have pmDemand=false

Output the COMPLETE corrected dataset with all fixes applied. Mark every change with `// FIXED: [what changed and why]`. If no changes are needed for a party, state that explicitly.
