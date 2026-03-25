# Prompt 5 — Validation and Cross-Party Consistency

You have been given extracted party data for a Danish coalition simulator. The data was coded by separate agents who each processed 2-4 parties from research briefs. Your job is to review ALL the data for internal consistency AND accuracy against the source briefs, fix errors, fill gaps, and output a single corrected dataset.

**You are receiving two types of files:**

1. **Party briefs** (`.md` files, 13 total): The original research documents — one per party plus one for the North Atlantic seats. These are the ground truth. File names match party abbreviations: `S.md`, `SF.md`, `M.md`, `EL.md`, `ALT.md`, `RV.md`, `V.md`, `LA.md`, `KF.md`, `DF.md`, `DD.md`, `BP.md`, `NA.md`.

2. **Extraction reports** (`.txt` files, 4 total): The JavaScript objects that were coded FROM the briefs by previous agents. These are what you are validating. Each file covers a batch of parties:
   - `S_SF_M.txt` → Socialdemokratiet, SF, Moderaterne
   - `EL_ALT_RV.txt` → Enhedslisten, Alternativet, Radikale Venstre
   - `V_LA_KF.txt` → Venstre, Liberal Alliance, Det Konservative Folkeparti
   - `DF_DD_BP_NA.txt` → Dansk Folkeparti, Danmarksdemokraterne, Borgernes Parti, North Atlantic seats

**Your workflow:** Read the extraction reports (`.txt`) to see what was coded. When a coding choice seems questionable — a weight that feels too high or low, a missing relationship, a floor/ceiling that could go either way — go back to the matching party brief (`.md`) and check. Cite the specific passage that supports your correction. Do not guess from symmetry or general political knowledge when the brief contains an answer.

---

## RELATIONSHIP FIELD DEFINITIONS

This is the most important section. Read it carefully before touching any relationship entry.

The `relationships` object on party A contains entries for other parties where there is friction. Each entry has four fields. **All four fields describe the world from A's perspective — A is the decision-maker.**

### `inGov` — "Would A share a cabinet table with B?"

A and B are both IN the government as ministers/coalition partners. This is A's willingness to accept that arrangement.

**Example:** `SF.relationships.M.inGov = 0.65` means: SF has a 65% chance of accepting M as a coalition partner in the same government where both hold ministerial posts.

### `asSupport` — "Would A accept B's external support?"

A is IN the government. B is OUTSIDE, supporting from parliament (as a støtteparti). This is A's willingness to accept B's votes propping up A's government.

**Example:** `M.relationships.EL.asSupport = 0.10` means: M is in government, EL is an external support party. M is only 10% willing to accept this dependency on EL. (Note: this is the "no far-left dependency" red line from M's brief.)

### `tolerateInGov` — "Would A support a government that includes B?"

A is OUTSIDE the government (as støtteparti or budget-voter). B is INSIDE the government. This is A's willingness to lend support to a government that contains B.

**Example:** `EL.relationships.M.tolerateInGov = 0.62` means: EL is an external support party, M is in the government. EL has a 62% chance of supporting this government despite M's presence. (This captures EL's post-election shift: won't govern WITH M, but can tolerate M being there.)

### `asPM` — "Would A accept B as Prime Minister?"

Self-explanatory. A's willingness to accept B holding the PM post, regardless of A's own role.

**Example:** `DF.relationships.M.asPM = 0.00` means: DF will never accept Løkke as PM.

### Key principle: `tolerateInGov` ≥ `asSupport` is NOT required

These fields describe different configurations. It's possible for a party to be more willing to accept external support from B (asSupport) than to tolerate B inside the government (tolerateInGov), or vice versa. Code each based on the evidence.

### When to omit a relationship

Only include entries where acceptance < 1.0 (there is friction). If party A has no documented friction with party B, omit the entry — the simulator defaults to 1.0.

---

## FLOOR/CEILING DIRECTION RULES

For every policy dimension, the scale runs from 0 (left/green/ambitious) to N (right/restrictive/none).

**Floor** = the worst outcome the party would accept without walking away.
**Ceiling** = the best outcome the party could realistically achieve.

The direction depends on which side of the scale the party's ideal sits:

### Left-leaning party (low ideal)
- **Floor is HIGHER than ideal** (rightward compromise they'd grudgingly accept)
- **Ceiling is AT or BELOW ideal** (leftward extreme they might achieve)
- Example: EL wealthTax ideal=0, floor=3 (could accept substitute as worst case), ceiling=0 (best case is their own 1%/35M proposal)

### Right-leaning party (high ideal)
- **Floor is LOWER than ideal** (leftward compromise they'd grudgingly accept)
- **Ceiling is AT or ABOVE ideal** (rightward extreme they might achieve)
- Example: V wealthTax ideal=4, floor=3 (could stomach M's substitute as worst case), ceiling=4 (best case is no wealth tax)

### Centre/swing party
- **Floor can be in EITHER direction** — use the direction that represents the more likely compromise pressure in government formation
- **OR** use floor for the worse direction and ceiling for the better direction, creating an asymmetric range around ideal
- Example: M fiscal ideal=1 (moderate). In S-led government, pushed toward 0 (expansive). In blue government, pushed toward 2 (tight). Floor=0 (worst: pushed left), ceiling=2 (best: pushed right).

### Validation test
For every entry: `floor` should be on the COMPROMISE side of `ideal`, and `ceiling` should be on the PREFERRED side. If floor is on the same side as ceiling (both above or both below ideal), one of them is almost certainly wrong.

---

## CHECKS TO PERFORM

### 0. Syntax cleanup
- Remove all `:contentReference[oaicite:XX]{index=XX}` tags — these are citation artifacts from the extraction tool
- Remove any stray markdown code fences (` ``` `) that appear inside JavaScript objects
- Ensure all objects are valid JavaScript (properly closed braces, no dangling commas after last properties)

### 1. Floor/ceiling direction
Apply the rules above to EVERY position for EVERY party. Pay special attention to:
- **Moderaterne (M)**: As a swing party, M's floor/ceiling coding may have systematic direction errors. Check every dimension.
- **Any entry where floor is on the SAME side as ceiling relative to ideal** — this is likely wrong.
- **Any entry where floor = ceiling = ideal** — this means zero flexibility, which should only occur for genuinely non-negotiable positions (weight should be very high).

### 2. Reciprocal relationships
For every directional relationship A→B that exists in the data, check whether B→A exists or should. Key gaps to look for:
- If S→M exists, does M→S exist? (It should — they're the core axis.)
- If SF→M exists, does M→SF exist?
- If V→S exists, does S→V exist?
- RV→M: RV is expected to govern with M — is there a relationship entry? (There should be, even if friction is low, to capture asPM tension.)
- S→EL: S needs EL's external support — does S have a view on EL?
- M→RV, M→KF, M→LA, M→DD: M interacts with everyone — are these coded?

For each missing reciprocal, add it with a `// ADDED:` comment explaining the evidence basis.

### 3. Relationship value plausibility
Check specific entries against the political logic:
- **M→EL asSupport**: M's "no far-left dependency" is a stated red line, but the consensus scenario (S+SF+M+RV government with EL external support) requires M to accept this. Is the coded value consistent with the brief's prediction that Løkke will "swallow the camel"?
- **LA→S inGov=0.00**: The prompt asked for non-zero values to allow exploration. Is a hard 0.00 appropriate, or should it be 0.02-0.05?
- **SF→V and SF→KF**: Are these all 0.00 across the board? The prompt asked for non-zero values to allow simulator exploration of unlikely scenarios.

### 4. Weight calibration
List every party's top 3 positions by weight. Flag any case where:
- A dimension marked "ultimativt" in the brief has weight < 0.80
- A dimension described as "negotiable" or "not a goal in itself" has weight > 0.60
- A party's immigration weight seems inconsistent with its brief characterization

### 5. Harshness ordering
Rank all parties by globalHarshness from lowest to highest. The expected approximate ordering based on the briefs (most flexible to most rigid):

M (maximum flexibility, negligible grassroots) → RV (no ultimatums, pragmatic) → KF (deliberate ambiguity, deal-maker) → S → SF → ALT → DD → LA → EL → V → DF → BP

Flag any party that seems more than 2 positions away from where the briefs would place it, and explain why.

### 6. Participation preference sums
Verify that participationPref values sum to approximately 1.0 (±0.05) for each party.

### 7. govEligible / pmEligible coherence
- govEligible=false parties should not have high government participation preferences
- pmEligible=false parties must have pmDemand=false
- Check: should any govEligible assignment change based on the briefs? (E.g., is DF govEligible=true correct given DF's desire to enter government for the first time?)

---

## OUTPUT FORMAT

Output the COMPLETE corrected dataset as clean JavaScript. For every change you make:
- Add a `// FIXED:` comment explaining what changed and why
- For added relationship entries, use `// ADDED:` instead

If a party requires no changes, include it unchanged with a `// VALIDATED: no changes needed` comment at the top.

Group the output as:
1. All party `const` declarations (S, SF, M, EL, ALT, RV, V, LA, KF, DF, DD, BP)
2. The NA_SEATS array
3. A summary section (as a JS comment block) listing: total fixes applied, total relationships added, any unresolved concerns
