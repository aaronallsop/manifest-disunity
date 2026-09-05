# Phase 1 answer key — computed 5 September 2026, before any prediction was received

**What this is.** The Phase 1 model, computed by hand against the real board before Phase 1 exists.
The git commit timestamp is the proof of ordering.

**What it is NOT.** A prediction. It runs the brief's own formulas over the game's own data, so when
Phase 1 is built and agrees with it, nothing is learned — that is the same arithmetic done twice. Its
value is entirely in *disagreeing* with an independent prediction: where a human who knows American
economic geography says one thing and this says another, the data is probably wrong.

**Contamination note.** This calculation was run in a working session, so its results are in that
session's transcript. Any prediction that is to be checked against it must come from somewhere that
has not seen it — the co-creative, or a session with no access to this folder.

---

## Three findings that matter more than the key

### 1. The demand formulas cannot be computed as written — the units do not match

Spec v2 §3.4 gives `foodDemand = population × 1.0`. Population is people; food supply is agricultural
output in millions of dollars. Their ratio is not a number that means anything. Every one of the six
formulas has this problem — they mix headcount, dollars and capacity with coefficients that assume
some unstated conversion.

The spec says every number in it is a placeholder, so this is a gap rather than an error, but **it has
to be closed before Phase 1 is built**, and it is not a tuning question — it is a units question, and
somebody has to decide what a unit of food *is*.

For this key I closed it the way a tuning pass would: calibrate each resource so the **country as a
whole is exactly self-sufficient** (aggregate ratio = 1.000), then look at the spread across nations.
The calibration constants that produced are recorded at the bottom.

### 2. Three demand terms reference things that do not exist yet

| Term | Status | What I substituted |
|---|---|---|
| `debtService` | No debt exists | zero |
| `infrastructureUpkeep` | No such concept | the nation's per-Area maintenance |
| `totalVolumeMoved` | No trade until Phase 2 | national output as a proxy for internal distribution |
| `qolModifier` | Exists, but pre-economy | zero |

Each substitution is a judgement I made to get a number at all. **Phase 1 must decide these
properly**, and the Logistics one is the most consequential: with no trade, "volume moved" is entirely
internal, and whatever stands in for it determines whether Logistics binds on anybody.

### 3. Calibrating on the average puts most of the map in deficit

With the aggregate pinned at 1.000, the distribution is badly skewed:

| Resource | Crisis | Deficit | Met | Surplus | Glut |
|---|---|---|---|---|---|
| Food | 4 | 28 | 5 | 9 | 15 |
| Extraction | 0 | 28 | 9 | 11 | 13 |
| Manufacturing | 0 | 26 | 19 | 12 | 4 |
| Logistics | 0 | 38 | 9 | 9 | 5 |
| Finance | 9 | 29 | 13 | 7 | 3 |
| IT | 15 | 24 | 10 | 5 | 7 |

A handful of enormous producers pull the mean above the median, so the typical nation sits below 1.0
even though the country balances. **Tuning should calibrate on the median, not the mean**, or half the
continent starts in Deficit for a reason that is an artefact of arithmetic rather than a fact about
the map.

Two things this does confirm, both Phase 1 acceptance criteria, before a line is written:

- **Every band is reachable** and populated.
- **Nobody is comfortable in everything.** The stop condition — "a map where everyone is comfortable
  is a failed Phase 1" — is not at risk.

---

## What the invented industry data costs, made concrete

This is the most useful thing the exercise produced. Some results track reality closely, which is
reassuring. Others are visibly the hand-written templates showing through.

**Tracks reality** — the model and the map agree:

| Nation | Result | Reality |
|---|---|---|
| Iowa | Food Glut, 2.77 | Correct — a major agricultural exporter |
| Wyoming | Extraction Glut, 4.98 | Correct — coal and gas |
| West Virginia | Extraction Glut, 3.44 | Correct — coal |
| Bay Area | IT Glut, 3.41 | Correct |
| Massachusetts | IT Glut, 2.22 | Correct |
| Montana, Kansas, Nebraska, South Dakota | Food Glut | Correct — plains agriculture |

**Does not track reality** — and the pattern is diagnostic:

| Nation | Result | Reality |
|---|---|---|
| Vermont | Extraction Glut, 3.13 | Vermont has almost no extractive industry |
| New Hampshire | Extraction Glut, 2.34 | Nor does New Hampshire |
| Rhode Island | Extraction Glut, 2.07 | Nor does Rhode Island |
| Maine | Extraction Glut, 2.06 | Marginal at best |

**Why**: the template assignment falls back to a population ladder, and counties under 200,000 people
get the *Resource Extraction* profile. Small New England states are therefore modelled as mining
economies. That is not a small blemish — it is four nations whose entire economic character is an
artefact of a population threshold.

So the honest summary: **the model shape is sound and the data underneath it is half-real.** Where a
place is large and distinctive the map gets it right. Where a place is small, the map invents a mining
industry for it. That is exactly what Phase 0.5 exists to fix, and it is the concrete argument for
doing it before anyone is asked to predict anything.

---

## The key itself

Calibration constants used (supply-unit per demand-unit, chosen so each resource balances nationally):

```
food 0.008057   extraction 0.066089   manufacturing 0.052174
logistics 0.221451   finance 12.212329   it 0.332390
```

Per-nation ratios and bands for all 61 nations: `docs/data/phase1-answer-key.json`, written by the
same calculation and committed alongside this document.

**Read that file only after an independent prediction has been recorded.**
