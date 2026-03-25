(function() {
const S = {
  id: "S",
  name: "Socialdemokratiet",
  mandates: 38,
  bloc: "red",

  govEligible: true,
  pmEligible: true,
  pmDemand: true,

  participationPref: {
    government: 0.95,
    stoettepartiForst: 0.00,
    stoettepartiLoose: 0.00,
    opposition: 0.05
  },

  // One issue ultimatum (immigration) + one structural non-negotiable (PM); wealth tax, pension, and other issues explicitly flexible (S.md).
  globalHarshness: 0.45,

  positions: {
    wealthTax: { ideal: 2, floor: 4, ceiling: 2, weight: 0.35 },
    climateTgt: { ideal: 2, floor: 3, ceiling: 2, weight: 0.45 },
    natureLaw: { ideal: 1, floor: 2, ceiling: 1, weight: 0.20 },
    pesticideBan: { ideal: 1, floor: 1, ceiling: 1, weight: 0.90 },
    immigration: { ideal: 3, floor: 3, ceiling: 3, weight: 0.90 },
    pension: { ideal: 0, floor: 1, ceiling: 0, weight: 0.65 },
    fiscal: { ideal: 0, floor: 1, ceiling: 0, weight: 0.60 },
    nuclear: { ideal: 2, floor: 1, ceiling: 2, weight: 0.15 },
    // FIXED: opened range from 1/1/1 to 1/2/0. The brief makes S hawkish on defense, but not uniquely absolutist; the zero-flexibility coding was too rigid relative to other issues that were actually labeled ultimative (S.md).
    defense: { ideal: 1, floor: 2, ceiling: 0, weight: 0.70 },
    euConventions: { ideal: 2, floor: 1, ceiling: 2, weight: 0.55 },
    forstaaelsespapir: { ideal: 2, floor: 1, ceiling: 2, weight: 0.15 },
    storeBededag: { ideal: 1, floor: 0, ceiling: 2, weight: 0.25 }
  },

  concessionCurrency: ["wealthTax", "storeBededag", "natureLaw", "forstaaelsespapir"],
  demandCurrency: ["immigration", "pesticideBan", "pension", "fiscal"],

  relationships: {
    SF: {
      inGov: 0.90,
      asSupport: 0.95,
      tolerateInGov: 0.00,
      asPM: 0.00
    },
    M: {
      inGov: 0.80,
      asSupport: 0.95,
      tolerateInGov: 0.00,
      asPM: 0.00
    },
    V: {
      inGov: 0.25,
      asSupport: 0.60,
      tolerateInGov: 0.00,
      asPM: 0.00
    },
    // ADDED: S needs a view on EL as external support. S's brief says it has "not publicly vetoed any party from potential support arrangements," and EL's brief identifies the likeliest equilibrium as S+SF+M+RV with EL outside on a forståelsespapir (S.md; EL.md).
    EL: {
      inGov: 0.35,
      asSupport: 0.82,
      tolerateInGov: 0.00,
      asPM: 0.00
    },
    // ADDED: S needs a view on ALT as external support for the same reason. ALT's brief says it wants to "pull a red government in a green, green direction" and commentators place ALT as an external support party rather than a cabinet partner (ALT.md).
    ALT: {
      inGov: 0.45,
      asSupport: 0.88,
      tolerateInGov: 0.00,
      asPM: 0.00
    }
  }
};

const SF = {
  id: "SF",
  name: "Socialistisk Folkeparti",
  mandates: 20,
  bloc: "red",

  govEligible: true,
  pmEligible: false,
  pmDemand: false,

  participationPref: {
    government: 0.92,
    stoettepartiForst: 0.00,
    stoettepartiLoose: 0.00,
    opposition: 0.08
  },

  // FIXED: lowered from 0.68 to 0.59 because SF's brief combines a hard participation-format demand (government or opposition) with explicit issue-level flexibility: Dyhr says she does not believe in ultimatums and repeatedly opens the door to Moderaterne (SF.md).
  globalHarshness: 0.59,

  positions: {
    wealthTax: { ideal: 1, floor: 4, ceiling: 1, weight: 0.45 },
    climateTgt: { ideal: 1, floor: 2, ceiling: 1, weight: 0.75 },
    natureLaw: { ideal: 0, floor: 1, ceiling: 0, weight: 0.80 },
    pesticideBan: { ideal: 0, floor: 1, ceiling: 0, weight: 0.70 },
    immigration: { ideal: 1, floor: 2, ceiling: 1, weight: 0.45 },
    pension: { ideal: 1, floor: 2, ceiling: 1, weight: 0.20 },
    fiscal: { ideal: 0, floor: 1, ceiling: 0, weight: 0.80 },
    nuclear: { ideal: 2, floor: 1, ceiling: 2, weight: 0.45 },
    defense: { ideal: 1, floor: 2, ceiling: 1, weight: 0.45 },
    euConventions: { ideal: 1, floor: 1, ceiling: 0, weight: 0.25 },
    forstaaelsespapir: { ideal: 0, floor: 0, ceiling: 1, weight: 0.35 },
    storeBededag: { ideal: 0, floor: 2, ceiling: 0, weight: 0.55 }
  },

  concessionCurrency: ["wealthTax", "climateTgt", "storeBededag", "immigration"],
  demandCurrency: ["fiscal", "natureLaw", "pesticideBan"],

  relationships: {
    M: {
      inGov: 0.65,
      asSupport: 0.80,
      tolerateInGov: 0.00,
      asPM: 0.20
    },
    // FIXED: replaced hard zeros with tiny non-zero exploration values. The brief is categorical — "SF kommer ikke i regering med Venstre" — but the simulator prompt explicitly asked not to lock unlikely scenarios to literal zero unless the source really compels it (SF.md).
    V: {
      inGov: 0.02,
      asSupport: 0.02,
      tolerateInGov: 0.01,
      asPM: 0.01
    },
    // FIXED: same issue as SF→V. The brief says "SF kommer ikke i regering med ... De Konservative," but this was softened to tiny non-zero values to preserve simulator exploration (SF.md).
    KF: {
      inGov: 0.02,
      asSupport: 0.02,
      tolerateInGov: 0.01,
      asPM: 0.01
    },
    // SF→LA near-impossible. SF brief hard-vetoes V and KF by name; LA's identity-level veto on S makes any SF+LA configuration equally implausible in reverse. Near-zero for exploration.
    LA: {
      inGov: 0.02,
      asSupport: 0.03,
      tolerateInGov: 0.01,
      asPM: 0.00
    }
  }
};

const M = {
  id: "M",
  name: "Moderaterne",
  mandates: 14,
  bloc: "swing",

  govEligible: true,
  pmEligible: true,
  pmDemand: false,

  participationPref: {
    government: 0.85,
    stoettepartiForst: 0.03,
    stoettepartiLoose: 0.07,
    opposition: 0.05
  },

  // FIXED: lowered from 0.42 to 0.24. M's brief stresses "un-dogmatic and solution-oriented" centrism and explicitly says the party has no large grassroots base constraining Løkke; among all parties, M is the most flexible actor (M.md).
  globalHarshness: 0.24,

  positions: {
    // FIXED: corrected direction and level. The extraction had ideal 3 / floor 4 / ceiling 3, but M's brief says the party flatly rejects the wealth tax and that Løkke called it a "red line". Preferred outcome is no wealth tax, so ideal/ceiling belong at 4 and the compromise floor below that (M.md).
    wealthTax: { ideal: 4, floor: 3, ceiling: 4, weight: 0.85 },
    climateTgt: { ideal: 2, floor: 3, ceiling: 2, weight: 0.45 },
    natureLaw: { ideal: 1, floor: 2, ceiling: 1, weight: 0.25 },
    pesticideBan: { ideal: 1, floor: 2, ceiling: 1, weight: 0.20 },
    immigration: { ideal: 1, floor: 2, ceiling: 1, weight: 0.55 },
    pension: { ideal: 2, floor: 1, ceiling: 2, weight: 0.65 },
    fiscal: { ideal: 1, floor: 0, ceiling: 2, weight: 0.55 },
    nuclear: { ideal: 0, floor: 1, ceiling: 0, weight: 0.50 },
    defense: { ideal: 1, floor: 2, ceiling: 1, weight: 0.50 },
    euConventions: { ideal: 1, floor: 2, ceiling: 1, weight: 0.30 },
    forstaaelsespapir: { ideal: 3, floor: 2, ceiling: 3, weight: 0.20 },
    storeBededag: { ideal: 2, floor: 1, ceiling: 2, weight: 0.35 }
  },

  concessionCurrency: ["climateTgt", "natureLaw", "pesticideBan", "forstaaelsespapir"],
  demandCurrency: ["wealthTax", "pension", "immigration", "fiscal", "nuclear"],

  relationships: {
    S: {
      inGov: 0.80,
      asSupport: 0.90,
      tolerateInGov: 0.85,
      asPM: 0.75
    },
    SF: {
      inGov: 0.60,
      asSupport: 0.75,
      tolerateInGov: 0.80,
      asPM: 0.20
    },
    V: {
      inGov: 0.75,
      asSupport: 0.85,
      tolerateInGov: 0.85,
      asPM: 0.75
    },
    DF: {
      inGov: 0.00,
      asSupport: 0.00,
      tolerateInGov: 0.00,
      asPM: 0.00
    },
    // M's brief makes the "no far-left dependency" line explicit, but the consensus outcome (S+SF+M+RV with EL external support) requires exactly this. Experts treat the red line as a negotiating position, not binding (M.md).
    EL: {
      inGov: 0.00,
      asSupport: 0.42,
      tolerateInGov: 0.00,
      asPM: 0.00
    },
    // ALT is the milder of the two left-flank support parties. The consensus outcome places ALT outside supporting an M-containing government. Raised to reflect that experts treat this as likely (ALT.md; M.md).
    ALT: {
      inGov: 0.00,
      asSupport: 0.32,
      tolerateInGov: 0.00,
      asPM: 0.00
    },
    // ADDED: M needs an explicit view on RV. The brief calls them "natural allies in the centrist space" who both oppose the wealth tax, despite electoral competition (M.md; RV.md).
    RV: {
      inGov: 0.88,
      asSupport: 0.92,
      tolerateInGov: 0.90,
      asPM: 0.10
    },
    // ADDED: M needs an explicit view on KF. The brief calls this pair "relatively compatible" and notes KF's adults-in-the-room coalition style (M.md; KF.md).
    KF: {
      inGov: 0.86,
      asSupport: 0.90,
      tolerateInGov: 0.90,
      asPM: 0.10
    },
    // ADDED: M needs an explicit view on LA. The brief says there is a significant ideological gap, but also that LA was actively considering pointing to Løkke as formateur and courting him on election night (M.md; LA.md).
    LA: {
      inGov: 0.74,
      asSupport: 0.84,
      tolerateInGov: 0.84,
      asPM: 0.12
    },
    // ADDED: M needs an explicit view on DD. DD rejects Løkke as leader, but its own brief says it did not fully reject M's participation in government. That implies real friction, not a total bilateral shutdown (DD.md).
    DD: {
      inGov: 0.40,
      asSupport: 0.58,
      tolerateInGov: 0.55,
      asPM: 0.00
    }
  }
};

// VALIDATED: no data changes beyond syntax cleanup.
const EL = {
  id: "EL",
  name: "Enhedslisten",
  mandates: 11,
  bloc: "red",

  govEligible: false,
  pmEligible: false,
  pmDemand: false,

  participationPref: {
    government: 0.10,
    stoettepartiForst: 0.78,
    stoettepartiLoose: 0.00,
    opposition: 0.12
  },

  globalHarshness: 0.64,

  positions: {
    wealthTax: { ideal: 0, floor: 3, ceiling: 0, weight: 0.62 },
    climateTgt: { ideal: 1, floor: 2, ceiling: 0, weight: 0.56 },
    natureLaw: { ideal: 0, floor: 1, ceiling: 0, weight: 0.68 },
    pesticideBan: { ideal: 0, floor: 1, ceiling: 0, weight: 0.54 },
    immigration: { ideal: 0, floor: 2, ceiling: 0, weight: 0.78 },
    pension: { ideal: 0, floor: 1, ceiling: 0, weight: 0.34 },
    fiscal: { ideal: 0, floor: 1, ceiling: 0, weight: 0.67 },
    nuclear: { ideal: 2, floor: 1, ceiling: 2, weight: 0.18 },
    defense: { ideal: 2, floor: 1, ceiling: 2, weight: 0.28 },
    euConventions: { ideal: 0, floor: 1, ceiling: 0, weight: 0.72 },
    forstaaelsespapir: { ideal: 0, floor: 0, ceiling: 0, weight: 1.00 },
    storeBededag: { ideal: 0, floor: 1, ceiling: 0, weight: 0.30 }
  },

  concessionCurrency: ["wealthTax", "defense", "nuclear", "storeBededag"],
  demandCurrency: ["forstaaelsespapir", "immigration", "euConventions", "natureLaw", "fiscal"],

  relationships: {
    S: {
      asPM: 0.68
    },
    M: {
      inGov: 0.08,
      asSupport: 0.35,
      tolerateInGov: 0.62,
      asPM: 0.00
    }
  }
};

const ALT = {
  id: "ALT",
  name: "Alternativet",
  mandates: 5,
  bloc: "red",

  govEligible: false,
  pmEligible: false,
  pmDemand: false,

  participationPref: {
    government: 0.14,
    stoettepartiForst: 0.18,
    stoettepartiLoose: 0.48,
    opposition: 0.20
  },

  globalHarshness: 0.53,

  positions: {
    wealthTax: { ideal: 1, floor: 4, ceiling: 0, weight: 0.18 },
    climateTgt: { ideal: 0, floor: 1, ceiling: 0, weight: 0.76 },
    natureLaw: { ideal: 0, floor: 1, ceiling: 0, weight: 0.66 },
    pesticideBan: { ideal: 0, floor: 1, ceiling: 0, weight: 0.61 },
    immigration: { ideal: 0, floor: 2, ceiling: 0, weight: 0.34 },
    pension: { ideal: 1, floor: 2, ceiling: 0, weight: 0.10 },
    fiscal: { ideal: 0, floor: 1, ceiling: 0, weight: 0.38 },
    nuclear: { ideal: 2, floor: 1, ceiling: 2, weight: 0.20 },
    defense: { ideal: 2, floor: 1, ceiling: 2, weight: 0.18 },
    euConventions: { ideal: 1, floor: 2, ceiling: 0, weight: 0.40 },
    // FIXED: changed from 2/3/0 to 3/2/3. ALT's brief explicitly says "ALT has not made this a formal requirement" in contrast to EL's forståelsespapir demand, so the old coding leaned too far toward a paper requirement ALT does not actually have (ALT.md).
    forstaaelsespapir: { ideal: 3, floor: 2, ceiling: 3, weight: 0.12 },
    storeBededag: { ideal: 1, floor: 2, ceiling: 0, weight: 0.05 }
  },

  concessionCurrency: ["wealthTax", "forstaaelsespapir", "immigration", "defense", "storeBededag"],
  demandCurrency: ["climateTgt", "natureLaw", "pesticideBan"],

  relationships: {
    S: {
      asPM: 0.58
    },
    M: {
      inGov: 0.18,
      asSupport: 0.42,
      tolerateInGov: 0.64,
      asPM: 0.06
    }
  }
};

const RV = {
  id: "RV",
  name: "Radikale Venstre",
  mandates: 10,
  bloc: "red",

  govEligible: true,
  pmEligible: false,
  pmDemand: false,

  participationPref: {
    government: 0.78,
    stoettepartiForst: 0.02,
    stoettepartiLoose: 0.08,
    opposition: 0.12
  },

  globalHarshness: 0.33,

  positions: {
    wealthTax: { ideal: 4, floor: 3, ceiling: 4, weight: 0.74 },
    climateTgt: { ideal: 1, floor: 2, ceiling: 0, weight: 0.73 },
    natureLaw: { ideal: 0, floor: 1, ceiling: 0, weight: 0.56 },
    pesticideBan: { ideal: 0, floor: 1, ceiling: 0, weight: 0.49 },
    immigration: { ideal: 1, floor: 2, ceiling: 0, weight: 0.44 },
    pension: { ideal: 2, floor: 1, ceiling: 2, weight: 0.54 },
    fiscal: { ideal: 1, floor: 0, ceiling: 2, weight: 0.42 },
    nuclear: { ideal: 1, floor: 0, ceiling: 2, weight: 0.12 },
    defense: { ideal: 1, floor: 0, ceiling: 2, weight: 0.34 },
    euConventions: { ideal: 1, floor: 2, ceiling: 0, weight: 0.46 },
    // FIXED: changed from 2/3/1 to 3/2/3. RV's brief says the party wants to enter government and explicitly rejects ultimative demands; a written support-paper architecture is not a meaningful RV demand (RV.md).
    forstaaelsespapir: { ideal: 3, floor: 2, ceiling: 3, weight: 0.05 },
    storeBededag: { ideal: 2, floor: 1, ceiling: 2, weight: 0.35 }
  },

  concessionCurrency: ["immigration", "fiscal", "forstaaelsespapir", "defense"],
  demandCurrency: ["climateTgt", "wealthTax", "natureLaw", "pension"],

  relationships: {
    S: {
      asPM: 0.76
    },
    // ADDED: RV needs an explicit view on M. The brief calls M a pragmatically acceptable partner, notes mutual dependence between Lidegaard and Løkke, and places RV inside the consensus S+SF+M+RV formula (RV.md).
    M: {
      inGov: 0.84,
      asSupport: 0.88,
      tolerateInGov: 0.82,
      asPM: 0.30
    },
    V: {
      inGov: 0.22,
      asSupport: 0.36,
      tolerateInGov: 0.50,
      asPM: 0.18
    },
    EL: {
      inGov: 0.22,
      asSupport: 0.78,
      tolerateInGov: 0.84,
      asPM: 0.02
    }
  }
};

const V = {
  id: "V",
  name: "Venstre",
  mandates: 18,
  bloc: "blue",

  govEligible: true,
  pmEligible: true,
  pmDemand: false,

  participationPref: {
    government: 0.55,
    stoettepartiForst: 0.05,
    stoettepartiLoose: 0.05,
    opposition: 0.35
  },

  globalHarshness: 0.72,

  positions: {
    wealthTax: { ideal: 4, floor: 3, ceiling: 4, weight: 0.90 },
    climateTgt: { ideal: 2, floor: 1, ceiling: 3, weight: 0.45 },
    natureLaw: { ideal: 2, floor: 1, ceiling: 2, weight: 0.35 },
    pesticideBan: { ideal: 2, floor: 1, ceiling: 2, weight: 0.45 },
    immigration: { ideal: 3, floor: 2, ceiling: 4, weight: 0.75 },
    pension: { ideal: 1, floor: 0, ceiling: 1, weight: 0.40 },
    fiscal: { ideal: 2, floor: 1, ceiling: 2, weight: 0.75 },
    nuclear: { ideal: 1, floor: 2, ceiling: 0, weight: 0.55 },
    defense: { ideal: 1, floor: 2, ceiling: 0, weight: 0.80 },
    euConventions: { ideal: 2, floor: 1, ceiling: 2, weight: 0.70 },
    forstaaelsespapir: { ideal: 2, floor: 1, ceiling: 3, weight: 0.20 },
    storeBededag: { ideal: 2, floor: 1, ceiling: 2, weight: 0.45 }
  },

  concessionCurrency: ["climateTgt", "natureLaw", "pension", "forstaaelsespapir"],
  demandCurrency: ["wealthTax", "fiscal", "defense", "immigration"],

  relationships: {
    S: {
      inGov: 0.08,
      asSupport: 0.12,
      tolerateInGov: 0.10,
      asPM: 0.02
    },
    M: {
      inGov: 0.95,
      asSupport: 0.95,
      tolerateInGov: 1.00,
      asPM: 0.20
    },
    // ADDED: V's brief includes a soft veto on RV after the 2022 walkout, while RV's brief says a blue arrangement would require replacing DF and is only a contingency path. That warrants explicit bilateral friction rather than an implicit 1.0 (V.md; RV.md).
    RV: {
      inGov: 0.12,
      asSupport: 0.20,
      tolerateInGov: 0.25,
      asPM: 0.05
    }
  }
};

const LA = {
  id: "LA",
  name: "Liberal Alliance",
  mandates: 16,
  bloc: "blue",

  govEligible: true,
  pmEligible: false,
  pmDemand: false,

  participationPref: {
    government: 0.55,
    stoettepartiForst: 0.05,
    stoettepartiLoose: 0.15,
    opposition: 0.25
  },

  globalHarshness: 0.63,

  positions: {
    wealthTax: { ideal: 4, floor: 3, ceiling: 4, weight: 1.00 },
    climateTgt: { ideal: 3, floor: 2, ceiling: 3, weight: 0.50 },
    natureLaw: { ideal: 2, floor: 1, ceiling: 2, weight: 0.25 },
    pesticideBan: { ideal: 2, floor: 1, ceiling: 2, weight: 0.30 },
    immigration: { ideal: 3, floor: 2, ceiling: 4, weight: 0.80 },
    pension: { ideal: 1, floor: 0, ceiling: 2, weight: 0.35 },
    fiscal: { ideal: 2, floor: 1, ceiling: 2, weight: 1.00 },
    nuclear: { ideal: 0, floor: 1, ceiling: 0, weight: 0.85 },
    defense: { ideal: 0, floor: 1, ceiling: 0, weight: 0.80 },
    euConventions: { ideal: 2, floor: 1, ceiling: 2, weight: 0.75 },
    forstaaelsespapir: { ideal: 2, floor: 1, ceiling: 3, weight: 0.15 },
    storeBededag: { ideal: 0, floor: 1, ceiling: 0, weight: 0.65 }
  },

  concessionCurrency: ["climateTgt", "natureLaw", "pesticideBan", "pension", "forstaaelsespapir"],
  demandCurrency: ["wealthTax", "fiscal", "nuclear", "defense", "immigration", "storeBededag"],

  relationships: {
    // FIXED: replaced hard all-zero coding with tiny non-zero exploration values for cabinet/support configurations, while keeping asPM at 0.00 because LA explicitly maintained "no Social Democratic PM" on election night (LA.md).
    S: {
      inGov: 0.03,
      asSupport: 0.04,
      tolerateInGov: 0.02,
      asPM: 0.00
    },
    M: {
      inGov: 0.85,
      asSupport: 0.90,
      tolerateInGov: 0.95,
      asPM: 0.45
    }
  }
};

// VALIDATED: no data changes beyond syntax cleanup.
const KF = {
  id: "KF",
  name: "Det Konservative Folkeparti",
  mandates: 13,
  bloc: "blue",

  govEligible: true,
  pmEligible: false,
  pmDemand: false,

  participationPref: {
    government: 0.70,
    stoettepartiForst: 0.10,
    stoettepartiLoose: 0.10,
    opposition: 0.10
  },

  globalHarshness: 0.40,

  positions: {
    wealthTax: { ideal: 4, floor: 3, ceiling: 4, weight: 0.85 },
    climateTgt: { ideal: 1, floor: 2, ceiling: 0, weight: 0.65 },
    natureLaw: { ideal: 1, floor: 2, ceiling: 0, weight: 0.55 },
    pesticideBan: { ideal: 1, floor: 2, ceiling: 0, weight: 0.70 },
    // KF has "one of Denmark's strictest immigration profiles" but not DF-level maximalism; ideal at S-strict with ceiling toward DF (KF.md).
    immigration: { ideal: 3, floor: 2, ceiling: 4, weight: 0.80 },
    pension: { ideal: 2, floor: 1, ceiling: 2, weight: 0.70 },
    fiscal: { ideal: 2, floor: 1, ceiling: 2, weight: 0.80 },
    nuclear: { ideal: 0, floor: 1, ceiling: 0, weight: 0.70 },
    defense: { ideal: 0, floor: 1, ceiling: 0, weight: 0.90 },
    euConventions: { ideal: 2, floor: 1, ceiling: 2, weight: 0.75 },
    forstaaelsespapir: { ideal: 2, floor: 1, ceiling: 3, weight: 0.15 },
    storeBededag: { ideal: 1, floor: 0, ceiling: 2, weight: 0.05 }
  },

  concessionCurrency: ["climateTgt", "natureLaw", "forstaaelsespapir", "storeBededag"],
  demandCurrency: ["wealthTax", "immigration", "defense", "nuclear", "pesticideBan"],

  relationships: {
    S: {
      inGov: 0.38,
      asSupport: 0.60,
      tolerateInGov: 0.72,
      asPM: 0.22
    },
    M: {
      inGov: 0.92,
      asSupport: 0.95,
      tolerateInGov: 0.98,
      asPM: 0.60
    }
  }
};

// VALIDATED: no data changes beyond syntax cleanup.
const DF = {
  id: "DF",
  name: "Dansk Folkeparti",
  mandates: 16,
  bloc: "blue",

  govEligible: true,
  pmEligible: false,
  pmDemand: false,

  participationPref: {
    government: 0.40,
    stoettepartiForst: 0.35,
    stoettepartiLoose: 0.05,
    opposition: 0.20
  },

  globalHarshness: 0.86,

  positions: {
    wealthTax: { ideal: 4, floor: 3, ceiling: 4, weight: 0.45 },
    climateTgt: { ideal: 3, floor: 2, ceiling: 3, weight: 0.75 },
    natureLaw: { ideal: 2, floor: 1, ceiling: 2, weight: 0.35 },
    pesticideBan: { ideal: 2, floor: 1, ceiling: 2, weight: 0.25 },
    immigration: { ideal: 4, floor: 3, ceiling: 4, weight: 1.00 },
    pension: { ideal: 0, floor: 1, ceiling: 0, weight: 0.75 },
    fiscal: { ideal: 0, floor: 1, ceiling: 0, weight: 0.75 },
    nuclear: { ideal: 0, floor: 1, ceiling: 0, weight: 0.45 },
    defense: { ideal: 1, floor: 2, ceiling: 0, weight: 0.35 },
    euConventions: { ideal: 2, floor: 1, ceiling: 2, weight: 0.55 },
    forstaaelsespapir: { ideal: 1, floor: 2, ceiling: 0, weight: 0.30 },
    storeBededag: { ideal: 2, floor: 1, ceiling: 2, weight: 0.15 }
  },

  concessionCurrency: ["forstaaelsespapir", "nuclear", "defense", "natureLaw"],
  demandCurrency: ["immigration", "pension", "fiscal", "climateTgt"],

  relationships: {
    M: {
      inGov: 0.00,
      asSupport: 0.15,
      tolerateInGov: 0.10,
      asPM: 0.00
    },
    S: {
      inGov: 0.00,
      asSupport: 0.00,
      tolerateInGov: 0.00,
      asPM: 0.00
    }
  }
};

// VALIDATED: no data changes beyond syntax cleanup.
const DD = {
  id: "DD",
  name: "Danmarksdemokraterne",
  mandates: 10,
  bloc: "blue",

  govEligible: true,
  pmEligible: false,
  pmDemand: false,

  participationPref: {
    government: 0.42,
    stoettepartiForst: 0.33,
    stoettepartiLoose: 0.10,
    opposition: 0.15
  },

  globalHarshness: 0.58,

  positions: {
    wealthTax: { ideal: 4, floor: 3, ceiling: 4, weight: 0.55 },
    climateTgt: { ideal: 3, floor: 2, ceiling: 3, weight: 0.80 },
    natureLaw: { ideal: 2, floor: 1, ceiling: 2, weight: 0.50 },
    pesticideBan: { ideal: 2, floor: 1, ceiling: 2, weight: 0.35 },
    immigration: { ideal: 3, floor: 2, ceiling: 4, weight: 0.90 },
    pension: { ideal: 1, floor: 0, ceiling: 2, weight: 0.35 },
    fiscal: { ideal: 1, floor: 0, ceiling: 2, weight: 0.70 },
    nuclear: { ideal: 0, floor: 1, ceiling: 0, weight: 0.60 },
    defense: { ideal: 1, floor: 2, ceiling: 0, weight: 0.35 },
    euConventions: { ideal: 1, floor: 0, ceiling: 2, weight: 0.30 },
    forstaaelsespapir: { ideal: 1, floor: 2, ceiling: 0, weight: 0.25 },
    storeBededag: { ideal: 1, floor: 0, ceiling: 2, weight: 0.10 }
  },

  concessionCurrency: ["nuclear", "defense", "forstaaelsespapir", "pension"],
  demandCurrency: ["immigration", "climateTgt", "wealthTax", "fiscal"],

  relationships: {
    M: {
      inGov: 0.30,
      asSupport: 0.65,
      tolerateInGov: 0.50,
      asPM: 0.00
    },
    S: {
      inGov: 0.00,
      asSupport: 0.00,
      tolerateInGov: 0.00,
      asPM: 0.00
    }
  }
};

// VALIDATED: no data changes beyond syntax cleanup.
const BP = {
  id: "BP",
  name: "Borgernes Parti",
  mandates: 4,
  bloc: "blue",

  govEligible: false,
  pmEligible: false,
  pmDemand: false,

  participationPref: {
    government: 0.00,
    stoettepartiForst: 0.12,
    stoettepartiLoose: 0.58,
    opposition: 0.30
  },

  globalHarshness: 0.90,

  positions: {
    wealthTax: { ideal: 4, floor: 3, ceiling: 4, weight: 0.70 },
    climateTgt: { ideal: 3, floor: 2, ceiling: 3, weight: 0.80 },
    natureLaw: { ideal: 2, floor: 1, ceiling: 2, weight: 0.55 },
    pesticideBan: { ideal: 2, floor: 1, ceiling: 2, weight: 0.45 },
    immigration: { ideal: 4, floor: 3, ceiling: 4, weight: 1.00 },
    pension: { ideal: 2, floor: 1, ceiling: 2, weight: 0.55 },
    fiscal: { ideal: 2, floor: 1, ceiling: 2, weight: 0.95 },
    nuclear: { ideal: 0, floor: 1, ceiling: 0, weight: 0.75 },
    defense: { ideal: 0, floor: 1, ceiling: 0, weight: 0.80 },
    euConventions: { ideal: 2, floor: 1, ceiling: 2, weight: 0.55 },
    forstaaelsespapir: { ideal: 3, floor: 2, ceiling: 3, weight: 0.60 },
    storeBededag: { ideal: 2, floor: 1, ceiling: 2, weight: 0.15 }
  },

  concessionCurrency: ["forstaaelsespapir", "natureLaw", "pesticideBan", "storeBededag", "pension"],
  demandCurrency: ["immigration", "fiscal", "defense", "nuclear"],

  relationships: {
    M: {
      inGov: 0.35,
      asSupport: 0.55,
      tolerateInGov: 0.50,
      asPM: 0.10
    },
    S: {
      inGov: 0.00,
      asSupport: 0.00,
      tolerateInGov: 0.00,
      asPM: 0.00
    }
  }
};

// VALIDATED: no changes needed.
const NA_SEATS = [
  {
    id: "FO-JF",
    name: "Sjúrður Skaale (Javnaðarflokkurin)",
    mandates: 1,
    bloc: "na",
    pRed: 0.95,
    pFlexible: 0.05,
    pBlue: 0.00,
    notes: "Predictable Faroese red seat; Javnaðarflokkurin cooperates with Socialdemokratiet. Leverage is limited compared with Greenlandic seats."
  },
  {
    id: "FO-SB",
    name: "Anna Falkenberg (Sambandsflokkurin)",
    mandates: 1,
    bloc: "na",
    pRed: 0.00,
    pFlexible: 0.05,
    pBlue: 0.95,
    notes: "Predictable Faroese blue seat; Venstre sister-party link and unionist profile make this the stable blue North Atlantic mandate."
  },
  {
    id: "GL-NAL",
    name: "Qarsoq Høegh-Dam (Naleraq)",
    mandates: 1,
    bloc: "na",
    pRed: 0.50,
    pFlexible: 0.40,
    pBlue: 0.10,
    notes: "Formally neither red nor blue; wants major Danish investment under the Self-Government Act while fully preserving Greenland's right to independence. DF's proposal for a Danish referendum on Greenlandic independence is a near-absolute blocker."
  },
  {
    id: "GL-IA",
    name: "Naaja Hjelholt Nathanielsen (Inuit Ataqatigiit)",
    mandates: 1,
    bloc: "na",
    pRed: 0.65,
    pFlexible: 0.30,
    pBlue: 0.05,
    notes: "Historically red-leaning via IA/SF ties, but refused to pre-commit. Wants Self-Government Act revision, constitutional reinterpretation, and equal status inside the Realm; the same anti-DF structural constraint applies."
  }
];

/*
SUMMARY
- Total fixes applied: 12
- Total relationships added: 8
- Syntax cleanup completed: removed extraction-tool citation artifacts, removed stray markdown fences, and restored valid JavaScript structure.
- Unresolved concerns:
  1. ALT's only clearly ultimative demand in the brief is the Svinepagt on pig welfare, which is not represented anywhere in the simulator schema; its leverage is therefore only approximated through adjacent green/nature fields.
  2. A few low-probability asPM values for minor/non-PM parties remain modeling proxies rather than directly observed bargaining statements.
  3. North Atlantic seats were validated against the brief, but their behavior is inherently probabilistic and only partly reducible to bloc probabilities.
*/

const DIMENSIONS = [
  "wealthTax",
  "climateTgt",
  "natureLaw",
  "pesticideBan",
  "immigration",
  "pension",
  "fiscal",
  "nuclear",
  "defense",
  "euConventions",
  "forstaaelsespapir",
  "storeBededag"
];

const SCALE_MAX = {
  wealthTax: 4,
  climateTgt: 3,
  natureLaw: 2,
  pesticideBan: 2,
  immigration: 4,
  pension: 2,
  fiscal: 2,
  nuclear: 2,
  defense: 2,
  euConventions: 2,
  forstaaelsespapir: 3,
  storeBededag: 2
};

const PARTIES_MAP = { S, SF, M, EL, ALT, RV, V, LA, KF, DF, DD, BP };

const PARTIES_LIST = [S, SF, M, EL, ALT, RV, V, LA, KF, DF, DD, BP];

function isWithinRange(value, position) {
  const lower = Math.min(position.ideal, position.floor);
  const upper = Math.max(position.ideal, position.floor);

  return value >= lower && value <= upper;
}

function distancePastFloor(value, position, dimension) {
  const lower = Math.min(position.ideal, position.floor);
  const upper = Math.max(position.ideal, position.floor);

  if (isWithinRange(value, position)) {
    return 0;
  }

  const nearestEdge = value < lower ? lower : upper;
  return Math.abs(value - nearestEdge) / SCALE_MAX[dimension];
}

function policyDistance(partyA, partyB) {
  let weightedDistanceSum = 0;
  let weightSum = 0;

  for (const dimension of DIMENSIONS) {
    const positionA = partyA.positions[dimension];
    const positionB = partyB.positions[dimension];
    const avgWeight = (positionA.weight + positionB.weight) / 2;
    const dist = Math.abs(positionA.ideal - positionB.ideal) / SCALE_MAX[dimension];

    weightedDistanceSum += avgWeight * dist;
    weightSum += avgWeight;
  }

  return weightSum === 0 ? 0 : weightedDistanceSum / weightSum;
}

const exportedSim5Parties = {
  S,
  SF,
  M,
  EL,
  ALT,
  RV,
  V,
  LA,
  KF,
  DF,
  DD,
  BP,
  NA_SEATS,
  DIMENSIONS,
  SCALE_MAX,
  PARTIES_MAP,
  PARTIES_LIST,
  isWithinRange,
  distancePastFloor,
  policyDistance
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = exportedSim5Parties;
} else {
  globalThis.Sim5Parties = exportedSim5Parties;
}
})();
