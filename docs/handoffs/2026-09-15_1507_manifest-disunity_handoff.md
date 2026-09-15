# Manifest Disunity — handoff, 15 September 2026, 15:07

**Written at the end of Hog Wild run 2.** *The previous handoff (12:15) was the desk-clearing one
written before the run started; it is superseded by this.*

---

## Where things are, in one paragraph

**Stage 2, DESIGN, is finished except for one document.** Nineteen of the twenty exist — a master
`GDD.md` and eighteen satellites — and the twentieth, `presentation-design.md`, is **parked by name**
until `docs/design/TONE.md` exists, which needs Aaron to run an interview prompt that is already sitting
in `prompts/tone-interview.md`. **The Hog Wild run wrote fourteen of those documents, took one decision
in Aaron's place (D234, the logistics brake), found ten live code defects and corrected nine wrong
claims — five of them its own.** Everything is committed, pushed and tagged; **no game code, data or
tests were touched**, because a design round writes documents only. **The Control Board is republished
with four cards waiting on Aaron and two real blockers.**

---

## Read these first, in this order

1. **`docs/HOGWILD-LOG.md`** — the wind-down report at the top, then the two decision entries. **The
   "where I went most hog wild" section is the one to read if you read nothing else.**
2. **`docs/deferred.md` items 34–43** — **ten live code defects**, every one verified at source.
3. **`DECISIONS.md` D234–D237.**
4. **`docs/design/GDD.md` §13** — the document list, now with every satellite ticked and measured.

---

## What was done

| | |
|---|---|
| **Documents written** | **14** — economy, events, nation, diplomacy, trade, force, war, blocs, power, ai, opening-board, plus identity, population, movements and governing earlier in the run |
| **Total** | **9,436 lines across eighteen satellites**, plus the master. *Against 11,725 lines for the seven ideation documents — so a design stage converts an idea stage at about four fifths its size* |
| **Commits** | **23, all pushed** |
| **Stage tags** | **15 `stage/*-design` tags, all on the remote** |
| **Decisions taken in Aaron's place** | **1** — D234 |
| **Live code defects found** | **10** |
| **Wrong claims corrected** | **9** |

---

## ⚠ The ten defects, and the three that matter most

**All in `docs/deferred.md`. Every one verified by reading the source, not taken from a research agent.**

| | | |
|---|---|---|
| **34** | ❌ **The fall-apart pays the aggressor** | *A branch tests for an outcome string the war code never produces, so the fix has never run. **The defenders lose up to 40% of their ruling bloc and hand up to 20% of their GDP to the attacker whose offensive just disintegrated**, at the full score. The message on screen says the opposite. **In the playtest build too. No test covers it.*** |
| **39 / 40** | ❌ **Ten nations hold a port that reaches nothing** | *24 of 61 cannot reach the world market from their own ground; the published figure of 14 measures a different predicate. **Four are a data fault** — Philadelphia, Charleston, Hampton Roads and Providence are ocean ports flagged inland* |
| **41** | ⚠ **Two transit toll systems are live at once** | *They price the modes in opposite directions and neither design document describes the older one. **The "three unreconciled trade regimes" is five*** |

**The other seven:** 35 (a nation born in play has no government and cannot win on ideology) · 36 (only
one of five birth routes gives a nation a birth) · 37 (`aid.recognitionBoost` is a dead tunable
promising the game's only escape hatch) · 38 (a memory kind with no label leaks its raw key to the
player) · 42 (`mil.suppressLiberty` is dead, and a design document cited it as live) · 43 (the AI's
army-posture weights are literals, not tunables).

---

## What needs Aaron

**Four cards on the board, and two blockers.**

| | |
|---|---|
| **⛔ BLOCKER — the tone interview** | *Paste `prompts/tone-interview.md` into a Claude chat, answer it, drop the result in `docs/design/` as `TONE.md`.* **The twentieth document unblocks immediately** |
| **⛔ BLOCKER — what turn 1 should teach** | *He ruled the direction and named a video as the model.* **I cannot watch it.** *Three possible shapes, an order of magnitude apart in cost. One short answer settles it* |
| **CARD — does a mission reward lapse with its ground?** | *The one card from last time he has not answered, and the one I said I was least confident about* |
| **CARD — the four misclassified ports** | *Not a repair: the port count multiplies into every trade deal, so fixing it changes a figure every deal reads* |
| **CARD — which of the two toll systems the game means** | *Two designs, both deliberate. Picking is a judgement about feel* |

---

## ⚠ Four cards were answered MID-RUN and have been acted on

**Aaron answered at 19:58–19:59 UTC while the run was in flight.** *Recorded as D235–D237.*

- **Deseret's recognition exception extends to Riverside** — approved as recommended.
- **A mission tree's variance is accepted and said out loud in the game** — approved as recommended.
- **⚠ D236: for the alpha, a mission tree belongs to the PLAYER alone.** *This dissolves the
  race-versus-checklist question rather than answering it, and closes `missions-design.md` open question
  5.* **What it costs is recorded: the three shared trees were designed because the nations are rivals
  for one prize, and that rivalry is now unsimulated.**
- **⚠ D237: the first turn must TEACH, and my recommendation is superseded.** *I proposed something
  already in motion; he asked for the game to talk the player through how to play.* **In substance that
  is a tutorial, which he had never asked for before — the build order should see it rather than find
  it.**

---

## What was NOT done, and why

| | |
|---|---|
| **No code, no data, no tests touched** | *A design round writes documents only. **The ten defects are FILED, not fixed*** |
| **`docs/spec/` untouched** | *It may not be modified without permission. **Two of its sections are dead letters and its deal-pricing table is keyed to a menu that no longer exists** — both recorded as gaps* |
| **Nothing sent to playtesters** | *The `live` permission is separate and stays separate* |
| **`MAX_DISTANCE` not invented** | *The affinity denominator on the three-axis board is the architect's* |
| **The tone not invented** | *The parked document* |
| **The logistics brake's RATE not invented** | *The direction was decided; the number is the architect's* |
| **⚠ The shape of the taught first turn not invented** | *D237. The direction is ruled and the shape is not* |

---

## The state of the repository

- **Branch `master`, clean, everything pushed.** *`main` is the built playtest copy and is untouched —
  still 132 commits behind, still sent to nobody.*
- **Version `v0.6`.** *No version bump: no code changed.*
- **956 tests were green at the 14 September sign-off and have not been run since**, because nothing
  they cover has been touched. **Do not report them as green without running them.**
- **Control Board republished** — four decisions, two blockers, four new rows in the record.

---

## For the next session

**Stage 2 has one document left and it is blocked on Aaron.** *So the honest options are:*

1. **Wait for `TONE.md`** and write `presentation-design.md`, which finishes stage 2.
2. **Fix the ten defects** — *that is a programming session, not a design one, and defect 34 is the one
   to do first.*
3. **Begin stage 3, TECHNICAL DESIGN**, which is the architect's stage and which every one of these
   nineteen documents was written for. **⚠ It has never been scoped and nobody has said it starts.**

**Whichever it is, run `/resume` first.** *And read the wind-down report before believing any number in
this handoff — it says which figures are measured and which are carried forward.*
