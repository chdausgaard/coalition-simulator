# Daily Coalition Formation Research Brief

Date: 31 March

## Task

You are monitoring the Danish government formation process following the
24 March 2026 election. Produce a research brief covering developments
**in the last 24 hours** (during **March 30** or the morning of **March 31**) that could affect which government forms. 
Make sure no earlier articles are included; it is a hard constraint. All earlier developments up until March 29 are covered.
Include only articles writte during March 30 or the morning og March 31.

This brief will be read by an AI agent that translates findings into
model parameter changes. You do NOT need to propose specific numeric
values — focus on what happened, who said what, and what it means for
coalition dynamics.

## Sources

Search for direct quotes and official statements from:
- DR (dr.dk) — live blog, Debatten, Genstart
- TV2 (nyheder.tv2.dk) — political analysis
- Altinget (altinget.dk) — insider reporting
- Information, Berlingske, Politiken — commentary
- Party press conferences and social media
- Ritzau wire service

## What to cover

For each significant development, report:

1. **What happened** — the event, statement, or meeting
2. **Direct quote** — verbatim quote with source attribution
3. **Coalition impact** — which coalitions become more or less likely, and why

Focus on:
- **Any statements by party leaders or members** relevant to
  negotiations — media interviews, social media posts, press
  scrums, TV appearances. Most days the signal is not a formal
  event but a party leader saying something slightly new to a
  journalist that reveals their negotiation posture.
- Bilateral meetings between party leaders and their tone/outcome
- Policy concessions or hardened red lines
- Signals about which parties are willing to govern together
- Shifts in negotiation posture (more/less flexible)
- Commentator analysis of what the signals mean
- Any formateur updates (mandate returned, new kongerunde, etc.)

## Party and coalition reference

**Parties (12 + 6 NA seats = 179 total, 90 for majority):**

| Party | ID | Seats | Bloc | Key person |
|-------|-----|-------|------|------------|
| Socialdemokratiet | S | 38 | Red | Mette Frederiksen (formateur) |
| SF | SF | 20 | Red | Pia Olsen Dyhr |
| Venstre | V | 18 | Blue | Troels Lund Poulsen |
| Dansk Folkeparti | DF | 16 | Blue | Morten Messerschmidt |
| Liberal Alliance | LA | 15 | Blue | Alex Vanopslagh |
| Moderaterne | M | 14 | Swing | Lars Løkke Rasmussen |
| Konservative | KF | 13 | Blue | Mona Juul |
| Enhedslisten | EL | 11 | Red | Pelle Dragsted |
| Danmarksdemokraterne | DD | 10 | Blue | Inger Støjberg |
| Radikale Venstre | RV | 10 | Red | Martin Lidegaard |
| Alternativet | ALT | 5 | Red | Franciska Rosenkilde |
| Borgernes Parti | BP | 3 | Blue | Lars Boje Mathiesen |

Two løsgængere (expelled from blue parties Mar 28-29) sit as
independents: Cecilie Liv Hansen (ex-LA, 1 seat) and Jacob Harris
(ex-BP, 1 seat). Both lean blue (~60%) but are unpredictable.

| Coalition | ~Pct | Seats | Key dependency |
|-----------|------|-------|----------------|
| S+M+RV+SF | ~32% | 82 | SF-M mutual acceptance |
| S+M+SF | ~19% | 72 | SF-M acceptance, EL support |
| V+KF+LA+M | ~11% | 60 | DF/DD abstention, M pursues blue |
| V+KF+M | ~11% | 45 | Broad blue support needed |
| S+RV+SF | ~7% | 68 | EL external support, M not blocking |
| V+LA+M | ~7% | 47 | Broad blue support needed |

**Key model variables (what the analyst will be calibrating):**

- **Løkkes orientering**: M orientation is now endogenous — the model
  computes M's expected utility from each side's best coalition and
  draws orientation probabilistically (~50/50 under current parameters).
  Signals that shift M's perceived utility from either side change this.
- **SF↔M bilateral** (0-1): will SF and M accept each other in
  government? Currently SF→M=0.85, M→SF=0.62. Gates whether S+M+RV+SF
  can form.
- **Party harshness** (0-1): overall negotiation rigidity per party.
  Higher = harder to reach deals.
- **Policy positions**: each party has ideal/floor/weight on 11
  dimensions (wealth tax, climate, immigration, pension, EU conventions,
  etc.). Changes when parties signal concessions or hardened demands.
- **Bilateral relationships**: each party has acceptance values toward
  every other party for governing together, tolerating from outside,
  and accepting as PM.
- **Løsgænger orientation** (pBlue 0-1): how the two independents vote.
  Currently 0.60 blue for both. Matters for S+RV+SF viability.
- Do NOT speculate beyond what sources report.
- Do NOT propose specific numeric parameter changes — that's the
  analyst's job.
- Focus on EVIDENCE: quotes, actions, meetings. Not vibes.

## Output structure

Use this structure:

```
# Research Brief: {DATE}

## Summary
One paragraph overview of the day.

## Developments

### 1. [Title of development]
**What:** ...
**Quote:** "..." — Source, date
**Coalition impact:** ...

### 2. [Title of development]
...

## Formation stage
Current stage: kongerunde / sættemøder / forhandlinger / aftaleudkast

## Key signals to watch
What should the analyst monitor next?
```
