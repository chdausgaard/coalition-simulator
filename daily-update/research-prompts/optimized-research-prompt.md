# Optimized Prompt: Daily Coalition Formation Research Brief

Date: **27 April 2026**

## Task

You are monitoring the Danish government formation process following the **24 March 2026 election**. Produce a research brief covering developments from **13 April 2026 (afternoon) through 26 April 2026 and the morning of 27 April 2026** — a fourteen-day window — that could affect which government forms.

This brief will be read by an AI agent that translates findings into model parameter changes. Do **not** propose numeric parameter updates. Focus on **evidence**: what happened, who said what, how other parties responded, and what that implies for coalition dynamics.

## Hard time-window constraint

This is a **strict publication filter**:

- Include **only** reporting, statements, interviews, liveblog entries, press appearances, social media posts, and wire copy published during **13 April (afternoon) – 26 April 2026** or the **morning of 27 April 2026**.
- Do **not** include articles published before the afternoon of 13 April 2026, even if they describe relevant background.
- Earlier developments up to **the morning of 13 April** are already covered elsewhere and must not be repeated except in one short background clause when absolutely necessary to explain a same-window development.
- If a source republishes or summarizes an older event during the valid window, include it **only if the new publication contains a new coalition-relevant quote, reaction, or framing from the valid window**.

## What counts as a relevant development

Prioritize developments that reveal **negotiation posture** or **coalition feasibility**. The most important unit of analysis is **the quote**, not the article.

A development is relevant if it contains any of the following:

- A party leader, MP, negotiator, spokesperson, minister, or central party figure saying something that changes or clarifies:
  - willingness to govern with another party
  - willingness to tolerate or support a government from outside
  - whether a coalition route is viable, dead, blocked, newly open, or becoming harder/easier
  - red lines, demands, concessions, or softened positions
- Bilateral or multilateral meetings between party leaders, including reported tone or outcome
- Signals that Moderaterne are leaning red or blue
- Signals about whether **SF and Moderaterne** can accept each other in government
- Signals about whether parties will accept controversial support parties as parliamentary basis
- Formateur or monarchy-process updates: mandate returned, new **kongerunde**, formal negotiation stage changes
- Coordinated signals from North Atlantic MPs if they affect coalition arithmetic or bargaining leverage
- Major commentator analysis **only when tied to a new same-window quote, reaction, or reported strategic implication**
- Public social media posts by relevant politicians, if they reveal coalition posture

## Sources

Search the following, prioritizing direct quotes and same-window reporting:

- **DR** (dr.dk) — live blog, Debatten, Genstart
- **TV 2** (nyheder.tv2.dk) — political analysis, interviews
- **Altinget** (altinget.dk) — insider reporting
- **Information**
- **Berlingske**
- **Politiken**
- **Ritzau**
- Party press conferences
- Politicians’ social media accounts

If an attached text file or source bundle is provided, treat it as **mandatory source material**, not optional supplementation. Missing a coalition-relevant quote from it counts as a major error.

## Required workflow

Follow this workflow before drafting the brief:

### Step 1: Build a quote ledger
Extract **all same-window direct quotes** from party actors or other politically relevant figures that bear on coalition formation.

For each quote, note:

- publication date and, if available, time
- outlet or source
- speaker
- party / institutional role
- exact quote
- what changed or was revealed
- whether other parties responded
- why the quote matters for coalition feasibility

### Step 2: Rank the quotes
Identify the **most consequential coalition signals** from the valid window.

In particular, check whether any actor explicitly said or clearly implied that:

- a bloc is **dead**
- a coalition route is **blocked**
- a government partner is **unacceptable**
- a parliamentary basis is **unusable**
- a coalition route is **newly possible**
- a party is more flexible or less flexible than before

Any such quote is presumptively high priority and should normally be included unless clearly redundant.

### Step 3: Build development clusters
Group related quotes and events into developments. A single development can include:

- the triggering event
- the key quote
- responses from other parties
- the coalition implication

Because this brief covers a **fourteen-day window**, organize developments **chronologically by day**. If a development spans multiple days (e.g., a statement on 16 April triggers responses on 17 April), group it under the day the triggering event occurred and note the follow-up dates. With a longer window, expect more developments — but do not pad: omit days with no coalition-relevant activity, and keep the focus on consequential signals rather than exhaustive coverage of every minor statement.

### Step 4: Draft only after the audit is complete
Do **not** start drafting once you merely have “enough.” Draft only after you have checked that:

- all required sources were scanned sufficiently for the valid window
- all attached material was reviewed if present
- all high-salience coalition quotes were considered
- the final brief includes the day’s most consequential quote(s), even if they came from a columnist article quoting a politician or from a politician’s social media comment

## What to cover for each development

For each significant development, report:

1. **What happened** — the event, statement, meeting, appearance, post, or reaction
2. **Direct quote** — verbatim quote with source attribution
3. **Responses** — how other parties or relevant actors responded, if they did
4. **Coalition impact** — which coalitions become more or less likely, and why

Be concrete. Use evidence, not vibes.

## Party and coalition reference

**Parties (12 + 6 North Atlantic seats = 179 total, 90 for majority):**

| Party | ID | Seats | Bloc | Key person |
|-------|----|-------|------|------------|
| Socialdemokratiet | S | 38 | Red | Mette Frederiksen |
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

Two independents sit as **løsgængere**:
- **Cecilie Liv Hansen** (ex-LA, 1 seat)
- **Jacob Harris** (ex-BP, 1 seat)

Both currently lean blue but are unpredictable.

### Coalition reference set

| Coalition | ~Pct | Seats | Key dependency |
|-----------|------|-------|----------------|
| S+M+RV+SF | ~42% | 82 | SF-M mutual acceptance |
| S+M+SF | ~23% | 72 | SF-M acceptance, EL support |
| S+KF+M+RV | ~7% | 75 | Cross-bloc, KF joins S-led govt |
| S+KF+M+V | ~7% | 83 | Cross-bloc, V+KF join S-led govt |
| S+M+V | ~6% | 70 | Cross-bloc, V joins S-led govt |
| V+KF+LA+M | ~3% | 60 | DF/DD abstention, M pursues blue |

## Key model variables

The analyst will translate the brief into model changes. Do **not** provide numbers. Instead, provide evidence relevant to these variables:

- **Løkkes orientering** — whether Moderaterne seem more attracted to red or blue options
- **SF↔M bilateral** — whether SF and Moderaterne appear more or less willing to govern together
- **Party harshness** — whether parties appear more rigid or more flexible
- **Policy positions** — concessions, hardening, new conditions, softened red lines
- **Bilateral relationships** — willingness to govern with, tolerate, or accept another party as PM
- **Løsgænger orientation** — whether independents appear more or less available to one side

## Do not do the following

- Do **not** speculate beyond what sources support
- Do **not** include earlier articles just because they provide better background
- Do **not** mistake article importance for quote importance
- Do **not** omit a crucial coalition signal just because it appeared in a commentary article, social media post, or secondary writeup rather than a formal press conference
- Do **not** rely on one outlet if multiple outlets in the valid window provide distinct quotes or reactions

## Output structure

Use this structure exactly:

```markdown
# Research Brief: 13–27 April 2026

## Summary
One paragraph overview of the fourteen-day window.

## Developments

### 13 April (afternoon)

#### 1. [Title of development]
**What:** ...
**Quote:** "..." — Source, date
**Responses:** ...
**Coalition impact:** ...

### 14 April

#### 2. [Title of development]
**What:** ...
**Quote:** "..." — Source, date
**Responses:** ...
**Coalition impact:** ...

[Continue with 15 April, 16 April, 17 April, 18 April, 19 April, 20 April,
21 April, 22 April, 23 April, 24 April, 25 April, 26 April, and 27 April
(morning) as needed. Omit days with no coalition-relevant developments.]

## Formation stage
Current stage: kongerunde / sættemøder / forhandlinger / aftaleudkast

## Key signals to watch
What should the analyst monitor next?
```

## Final pre-submission checklist

Before finalizing, verify all of the following:

- [ ] Every cited item was published during **13 April (afternoon) – 26 April 2026** or the **morning of 27 April 2026**
- [ ] All attached source material was reviewed, if present
- [ ] A quote ledger was built before drafting
- [ ] The final brief includes the most consequential same-window coalition quote(s)
- [ ] Each development includes any relevant party responses found in the valid window
- [ ] Coalition impact is evidence-based and does not go beyond the sources
