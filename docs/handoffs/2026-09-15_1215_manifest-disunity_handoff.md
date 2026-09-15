# Handoff — 15 September 2026, 12:15

**Written to clear the desk before a possible Hog Wild run.** *This is step 2 of the Hog Wild
protocol: everything durable is on disk, so compacting or restarting costs nothing.* **Hog Wild is
OFF on the board as of this writing.**

---

## 1. The state

**Everything is committed and pushed. Working tree clean. Nothing failed. Nothing is unverified.**

**No code, data or tests were touched.** `DESIGN.md` was edited twice, both times under the
permission D232 granted, both times as marked corrections of fact with dates.

**The test suite has NOT been run since the 14 September sign-off** — 956 tests, 51 files, 212.71
seconds. *Quoted with its date, not claimed as a fresh run.*

**Five cards are waiting on Aaron.** All five came out of tracing, none existed this morning.

---

## 2. What this session did

**It opened as a record-straightening job and turned into four documents.**

| | |
|---|---|
| **Straightened the record** | The previous session made nine commits and **never wrote a handoff**. `CLAUDE.md` was telling every session that stage 2 did not exist, on the night stage 2 started. Reconstructed as `2026-09-15_0207_..._handoff.md`, and logged as the **third** occurrence of programmer rule 10 |
| **`GDD.md`** | The master. Pitch layer, system map, cross-cutting concepts. **D229** |
| **`board-design.md`** | Geography as a graph with costs. 478 lines before scenarios |
| **Traced all four documents** | 19 scenarios. **D232 reinstated the practice and it paid immediately** |
| **Four decisions banked** | **D229–D232** |

---

## 3. What Aaron decided today, and one of them corrected me

**D230 — the split is nineteen satellites, and it is a FLOOR not a ceiling.** His reason binds
everything after it: *a GDD is a living document and is never finished, so a fat document now becomes
an obese one later.* **When a satellite outgrows its seam it splits again.** `GDD.md` §13.1 names the
first one that will need it (`missions-design.md`, at the system/trees seam) and the trigger (the
fourth tree).

**D231 — politics is three axes and ten positions.** His politics round's rulings stand; **the built
two-axis model is what changes.** `GDD.md` §15.1 is the authority, §15.1a is what exists and what
converting it costs.

**D232 — five cards at once.** `DESIGN.md` may be corrected (facts only, marked in place). Audio:
*"Not yet."* Traced scenarios reinstated. Tone became a piece of work rather than a decision.

**⚠ And the audience answer CORRECTED a draft rather than confirming it.** I had written that the
audience was the player driven off by the genre's opacity, with the Why record as the hook. **He plays
EU4 and went a thousand hours without knowing estates existed, having fun throughout.** So:

> **The game must be playable, and fun, by somebody who does not understand the economy, or transit,
> or the political board. Understanding a layer is a REWARD for coming back, not a toll on the way
> in.**

**And tracing turned that into something a screen can be tested against** — `GDD.md` §3.2:

> **A layer the player has not learned yet must be either INVISIBLE or SELF-EXPLAINING. It must never
> be VISIBLE AND WRONG.**

---

## 4. ⚠ The five cards waiting on him

*All five are on the board with recommendations, evidence and costs. All five came from tracing.*

1. **A mission is permanent; is its REWARD?** Two different questions and the ruling only answered one.
2. **Two countries share a tree and both hit the same target — race or checklist?**
3. **What does turn 1 offer a new player?** The loop is triage and turn 1 has nothing to triage.
4. **Does the Deseret recognition exception cover Riverside?** See §5.
5. **Should a tree be balanced against a board that varies by seed?**

---

## 5. The best thing tracing found

**Deseret is the only completely sealed nation on the board.** *Verified across all 57 corridor Areas
on 15 September: no port, no coastal county, no Great Lakes county, no border crossing, no county on a
navigable river, no chokepoint. One rail hub.*

**It touches California through exactly ONE Area** — Mohave County, Arizona, looking at San Bernardino.
**And San Bernardino belongs to Riverside**, not to the San Diego successor its own note implies.
**Riverside is landlocked but holds Imperial County, a Mexican border crossing.**

> **So Deseret's shortest route to any market on earth is Deseret → Riverside → Mexico, and the ocean
> is one step further. The pariah's lifeline runs through a small landlocked neighbour nobody in this
> project had ever mentioned.**

**And in about one game in five it does not exist**, because Mohave sits in the Zion leaf which cedes
at 0.82.

---

## 6. ⚠ Can a Hog Wild run start from here? Yes, with ONE exclusion

**Fifteen of the sixteen remaining documents can be written without Aaron.** They are conversions of
judged material — 536 ideas and 178 rulings across seven closed ideation rounds, plus `DESIGN.md`.

| | |
|---|---|
| **Ready, material is judged and sufficient** | `identity` · `population` · `power` · `movements` · `governing` · `economy` · `trade` · `force` · `war` · `diplomacy` · `blocs` · `events` · `nation` · `opening-board` · `ai` |
| **⚠ BLOCKED — should be PARKED BY NAME for any run** | **`presentation-design.md`**. It depends on `docs/design/TONE.md`, which does not exist: Aaron is being interviewed for it by a separate Claude chat using `prompts/tone-interview.md`. **Writing it without that document means inventing the game's position on its own subject matter, which is the clearest "stop and wait" case in `HOGWILD.md`** |

**Three things a run would have to decide in Aaron's place, and each needs a four-part log entry:**

1. **The logistics spiral's brake** — economy finding E, *the most serious thing round 4 found.*
   **Three candidates exist and none is chosen.** Arguably a matter of taste about how the game feels,
   which is a stop-and-wait case; arguably a mechanism choice with a measurable answer. **A run should
   pick, log it loudly, and flag it as the first thing to revisit.**
2. **The federation's flat toll against the built corridor system** — **three internal-trade regimes**
   to reconcile, and diplomacy ruling 4 made it worse rather than better.
3. **The five cards in §4**, if he has not answered them by the time the run reaches those documents.

**Two things a run must NOT do:** invent `MAX_DISTANCE` for the three-axis board (*it is the
architect's, and every tuned threshold in the game is measured against it*), and invent the game's
tone.

---

## 7. Known but unverified, carried forward

- **Nothing in any design document has ever run.** All paper.
- **The game has not been opened since 5 September; the suite not run since 14 September.**
- **Round 4 ruling 7 still depends on where phosphate, potash and natural gas actually are.** A data
  job; check it, never remember it.
- **The wiki is PAUSED at Aaron's instruction.** `docs/wiki/Economy.md` still says the economy has had
  no design round, which is false. **Do not fix it without asking.**
- **The repository is public and that is correct** — his decision of 7 September. **Do not raise it.**
- **`docs/deferred.md` 33** carries four scenario-content items; round 7's ruling 2 rests on two.
- **The Sector Wiring page** is a second published artifact and **is design input** — read its `links`
  collection at the start of a session.

---

## 8. Before you stop, every time

Run `/signoff`, and **write the handoff last**. If you commit anything after it, rewrite it.
**This project has now failed that rule three times.**
