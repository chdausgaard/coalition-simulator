# Daily Coalition Formation Research Brief

Date: {DATE}

## Task

You are monitoring the Danish government formation process following the
24 March 2026 election. Produce a structured research brief covering
developments in the last 24 hours.

## Sources

Focus on direct quotes and official statements from:
- DR (dr.dk) — live blog, Debatten, Genstart
- TV2 (nyheder.tv2.dk) — political analysis
- Altinget (altinget.dk) — insider reporting
- Information, Berlingske, Politiken — commentary
- Party press conferences and social media

## Output format

Return a JSON object with this exact structure:

```json
{
  "date": "2026-03-26",
  "summary": "One-paragraph summary of the day's developments",
  "developments": [
    {
      "description": "What happened",
      "source": "Source and quote",
      "impact": "Which parameter(s) this affects and in which direction"
    }
  ],
  "parameterChanges": [
    {
      "party": "SF",
      "parameter": "positions.immigration.ideal",
      "oldValue": 1,
      "newValue": 2,
      "justification": "SF signaled acceptance of stricter immigration in exchange for nature law (DR, 26/3)"
    },
    {
      "party": "M",
      "parameter": "globalHarshness",
      "oldValue": 0.24,
      "newValue": 0.20,
      "justification": "Løkke described as 'remarkably accommodating' in first round of talks (Altinget)"
    },
    {
      "party": "SF",
      "parameter": "relationships.M.inGov",
      "oldValue": 0.65,
      "newValue": 0.72,
      "justification": "Dyhr and Løkke had 'constructive' bilateral meeting (TV2)"
    }
  ],
  "formateurUpdate": {
    "appointed": false,
    "formateurParty": null,
    "notes": "Kongerunde continues. King Frederik expected to appoint formateur by Friday."
  },
  "formationStage": "kongerunde",
  "confidenceAssessment": "How confident are you in these parameter changes? (low/medium/high)"
}
```

## Parameter reference

The simulator uses these parameters per party:
- `globalHarshness` (0-1): overall negotiation rigidity
- `positions.{dimension}.ideal` (0-N): preferred policy position
- `positions.{dimension}.floor` (0-N): worst acceptable position
- `positions.{dimension}.weight` (0-1): how much the party cares
- `relationships.{otherParty}.inGov` (0-1): acceptance of governing together
- `relationships.{otherParty}.tolerateInGov` (0-1): toleration from outside
- `relationships.{otherParty}.asPM` (0-1): acceptance as PM

Dimensions: wealthTax, climateTgt, natureLaw, pesticideBan, immigration,
pension, fiscal, nuclear, defense, euConventions, storeBededag

Global parameters:
- `mDemandGov` (true/false): does M insist on being in government?
- `sDemandGov` (true/false): does S insist on being in government?
- `mPmPref` (S/neutral/V/M): Løkke's preferred PM
- `formateurOverride` (endogenous/red/blue): who gets first formateur attempt

## Important

- Only propose parameter changes supported by direct evidence
- Include the source and quote for each change
- If nothing changed, say so — don't invent developments
- Be conservative: small parameter adjustments (±0.05-0.10) unless
  there's a dramatic shift
- Flag uncertainty: "low confidence" changes should be noted
