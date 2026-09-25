# First-order changes — what has to land before anything is built on top of it

**Started 16 September 2026, during stage 3 step 1. This document GROWS as the stage goes.**

> **Aaron, 16 September, and it is the framing this document exists to serve:**
> *"the thing we need to remember in all of this is that we are not building the game right now, we are
> building the technical design document. **We can change things.**"*

---

## 0. What this is, and the one test for getting into it

**A running register of changes that must happen BEFORE other work, because anything built on top of
them would have to be built twice.** *Written as the stage goes rather than reconstructed at the end,
which is how the three hundred loose ends came to exist.*

> **⚠ THE ADMISSION TEST, and it is strict on purpose:**
> **an item is first-order only if building something else on top of it would have to be REDONE.**
> *Not "important". Not "broken". Not "we should get to it." **Would have to be redone.*** *Everything
> that fails that test is an ordinary defect and belongs in `docs/deferred.md`, or an ordinary delta and
> belongs in `LEDGER.md`.*

**What this document is NOT, and the line is the same one that bound stage 2:**

- **It is not a build order.** *It says X must precede Y and why. It does not say when, how long, or
  what to cut — that is Aaron's and stage 4's.*
- **It does not rank.** *The sections below are grouped by what they block, not by importance.*
- **It is not a defect list.** *Several items here are not faults at all — they are designed changes
  that happen to be load-bearing. Where an item IS also a filed fault, its number is given rather than
  its text repeated.*

**How a row is read.** *WHAT is the change. **BLOCKS** is the specific work that cannot proceed
sensibly until it lands — and that column is the whole point of the document. **WHY REDONE** is the
admission test, answered.*

---

## 1. The substrate — nothing survives being built before these

### F1 · Convert the political board: six ideologies on two axes → ten positions on three

| | |
|---|---|
| **What** | The built model is **six symmetric ideologies on two axes** (`js/ideology.js`). The design is **three axes and ten positions** (D231, `GDD.md` §15.1). **Every formula in the game reads the built one.** |
| **Blocks** | **Coalitions, political drift, splinter direction, defection targets, civil-war severity, trade alignment, liberty satisfaction, AI diplomacy, and the price of changing your own politics** — the nine things the affinity function drives |
| **Why redone** | **Every threshold measured in political distance is a number tuned against a denominator that changes.** Tune anything downstream first and you tune it twice |
| **Carries with it** | **`MAX_DISTANCE` = 2√3 ≈ 3.4641** (D250) — *and the rule that comes with it, below* |
| **State** | Designed and ruled. **Not built.** `LEDGER.md` §1 marks it the largest single delta in the project |

### F2 · Declare, per threshold, which population it is tuned against

| | |
|---|---|
| **What** | The affinity function is one formula over two populations that behave nothing alike. **Position against position lands in 0.000–0.592 and has only five distinct values in the whole system. Nation against nation at turn 0 cannot fall below 0.423.** They overlap in a band 0.10 wide |
| **Blocks** | **Every tuned threshold that mentions affinity**, in any system |
| **Why redone** | *"Aligned means affinity above 0.6" can never be true of two positions and is true of almost every pair of nations.* **A threshold written without saying which population it means is a number that will be re-derived the first time somebody checks it against the other one** |
| **State** | **Found by measurement today**, D250. Not a defect — nobody had asked the question |

---

## 2. The turn — the new turn rules need machinery that does not exist

### F3 · Something has to end a nation's slot

| | |
|---|---|
| **What** | One action per turn was not a rule with a limit — **it WAS the turn.** *`turn-design.md`: there is no has-acted flag anywhere, because there does not need to be one.* D218 removed the budget, **so the thing that used to end a slot is gone and nothing replaces it** |
| **Blocks** | **The entire turn system, and therefore the AI**, which plays sixty-one slots per round |
| **Why redone** | *Every system that resolves "during your slot" needs a slot with an end. Specify them against a slot that never closes and each is re-specified* |
| **State** | Named by `turn-design.md` §9 as handed forward. **Not designed, not built** |

### F4 · A project needs an object, a slot in the turn, and a place in the save

| | |
|---|---|
| **What** | **Zero implementation** — 11 matches for "project" in the code and every one is "project force" or "this project". *`turn-design.md` §6.2: a project is new persistent state, `STATEFUL_MODULES` has no project module, and nothing says where in the turn's nineteen phases one resolves* |
| **Blocks** | **Almost everything the new design adds**, because under D218 nothing finishes in one turn and the things that do are a card you click |
| **Why redone** | **A system specified as "it happens immediately" and later made multi-turn is re-specified end to end** — its cost, its cancellation, its interruption, and what the player sees while it runs |
| **State** | Designed. **Not built.** `LEDGER.md` §4a |

---

## 3. The save — the registry protects only what it knows about

### F5 · Register the five new stateful objects before their systems are built

| | |
|---|---|
| **What** | **Five designed objects have nowhere to be written**: a project, mission progress, bloc membership / treasury / leader / toll, alliances and vassalage, and a ceasefire's tabled-but-unopened terms |
| **Blocks** | Missions, blocs, diplomacy's new half, war's ending, and projects |
| **Why redone** | **This exact failure already happened once at version 1: 2 of 8 stateful modules were persisted and the rest silently carried over from the previous session**, so a loaded game ran on the last game's market prices. *The registry rule was the fix — but it protects a REGISTERED module and cannot notice one nobody wrote* |
| **State** | The discipline is good and the entries are missing. `LEDGER.md` §4a |

---

## 4. Measurement — things that must be true before any number can be trusted

### F6 · The engine must reach turn 200

| | |
|---|---|
| **What** | **The game hangs part-way through a long run and never resumes** — turn 80 on one seed, 94 on another, four runs. *`docs/deferred.md` 46* |
| **Blocks** | **Three measurements this stage owes**: the cost of a turn under the new rules, the victory recalibration at 200 turns, and whether the economy's logistics spiral actually spirals |
| **Why redone** | **Not "redone" — NOT DONE AT ALL.** *No amount of paper substitutes for a number measured at game length, and every one of the three is a measurement rather than an opinion* |
| **⚠ Note** | **This is the one item where the honest answer is that it may not be first-order at all.** *It blocks measurements, not construction — steps 2 and 3 of this stage can be written without it. It is placed here because the numbers start at step 4 and it must be fixed by then* |

### F7 · The victory targets must be re-derived, not re-guessed

| | |
|---|---|
| **What** | Three targets state their calibration in their own doc lines — **3× to 5.5× what an eighty-turn world produces on its own.** *Measured today at the same eighty turns, they are **1.6× to 1.9×**.* And the seat term **peaks at turn 25 and falls**, which is the shape `js/victory.js` already identified and fixed once for a different condition |
| **Blocks** | **Any statement about how a game of this ends** — and missions, whose trees are smaller instances of the victory conditions |
| **Why redone** | *A mission tree authored against a victory target that then moves is a tree authored against the wrong finish line* |
| **Depends on** | **F6.** *A real recalibration needs a spread of seeds at 200 turns, which cannot be produced today* |
| **State** | D251. **One seed, and labelled as one seed** |

---

## 5. Data under the model — wrong inputs make every downstream number wrong

### F8 · Fix the port data before anything trade-shaped is tuned

*⚠ 24 September 2026 (D267): the fix is approved — Aaron, on the Control Board, 15 September. It lands in M5 (D264).*

| | |
|---|---|
| **What** | **Four real deep-water ocean ports are flagged inland** — Philadelphia, Charleston, Hampton Roads, Providence — and **ten nations hold a port they cannot export through.** *`docs/deferred.md` 39 and 40* |
| **Blocks** | **Every trade and economy number**, because port capacity multiplies into every deal a nation signs |
| **Why redone** | **Tune the trade model against a map where four ocean ports are inland and every one of those numbers is tuned against a world that does not exist** |
| **⚠ Note** | *Aaron has already flagged that correcting the map is a decision rather than a repair, because the port count multiplies into every deal. **The decision is his; the sequencing is what this row asserts*** |

### F9 · Reconcile the two live toll systems

| | |
|---|---|
| **What** | **Two toll systems are live in the build at once and they price the modes in opposite directions** — one makes rail the cheapest crossing, the other makes a port the dearest. *`docs/deferred.md` 41* |
| **Blocks** | The economy and trade technical documents |
| **Why redone** | *A player learns a pricing instinct on one screen and it is wrong on the other; and two of the tuning dials move only one of the two* |
| **State** | **⏸ Aaron has scheduled the CHOICE for the economy work and asked that it not be raised before then.** *The row is here because the sequencing is a fact even while the choice waits — it is not a re-raise* |

---

## 6. Faults that are load-bearing rather than cosmetic

*Ordinary defects live in `docs/deferred.md`. These three are listed here because other work sits on
top of them.*

| | What | Blocks | Why redone |
|---|---|---|---|
| **F10** | **A failed invasion charges the DEFENDER and pays the attacker.** The branch meant to charge a failed aggressor tests for an outcome the war code has never produced, so it has never run. `deferred.md` 34 | **The war technical document, and any tuning of conquest pacing** | *It reverses the sign of the sharpest brake the game has on a runaway conqueror. Tune conquest against it and the tuning is compensating for a backwards term* |
| **F11** | **A nation reads its own founding movement as maximum internal strain.** Three call sites take the largest movement share with no check on whose it is. `deferred.md` 14 | **The AI's posture, the pressure map, and occupation upkeep** | *Deseret plays permanently defensive in its own heartland. Any AI tuning done first is tuning around a false input* |
| **F12** | **The AI's five army-allocation weights are literals in code.** `deferred.md` 43 | **Any tuning of force or AI posture** | *Against this project's oldest standing rule. Every number the model uses is a named tunable — a value that cannot be changed without a rebuild cannot be tuned at all* |

---

## 7. Process — one item, and it undermines everything else if left

### F13 · The test runner that cannot fail

| | |
|---|---|
| **What** | **`node --test` reports every suite green without running a single check.** *`docs/deferred.md` 45* |
| **Blocks** | **Trusting any test result produced by that route** |
| **Why redone** | **Work verified by a runner that cannot fail is work that has not been verified**, and would have to be verified again |
| **State** | *The route is withdrawn from the README and carries a warning at the command. **The harness's own false comment is still there.*** The browser is the only route that runs the tests |

---

## 8. What is NOT in here, and why that matters

**The register is short on purpose.** *Thirteen items out of a ledger of nineteen system deltas, thirty
-nine filed faults and three hundred open design items.* **Everything else failed the admission test:
it can be built in any order without being redone.**

**Three things that were considered and left out, so the reasoning is visible:**

| | Why it is not first-order |
|---|---|
| **The five systems with no code at all** — blocs, missions, alliances, the peace treaty | *They are large, but nothing is built ON them yet. **Building them late costs nothing; building them early costs nothing either.** They are build-order questions, and the build order is Aaron's* |
| **Nothing has a length or a coordinate** (`board-design.md`'s standing gap) | *A real limitation and an honest one, but every existing number was tuned in a world without distance. **Adding it later re-tunes; it does not re-specify*** |
| **The economy model being structurally wrong** | *Known, deliberate, and kept on purpose by Addendum A. **It is scheduled, not blocking*** |

---

## 9. How this document is kept

- **Every step of stage 3 adds to it**, at the moment the finding is made rather than at the end.
- **A row leaves only when the change lands**, and leaves with the date and what closed it.
- **A row that fails the admission test on review is moved out**, to `deferred.md` or the ledger, with
  a line saying why — *not deleted.*
- **The numbering is permanent.** F1 stays F1.
