# Manifest Disunity — handoff, 24 September 2026, 13:58

**Written at sign-off.** *Supersedes the handoff of 16 September 03:01, which described the world
before stage 3 existed.*

---

## ⚠ READ THIS FIRST — what went wrong, and it is a record fault rather than a work fault

**1. Seven commits landed on 16 September after the last handoff was written, and not one of them was
handed off.** The newest handoff on disk was `2026-09-16_0301`, and it describes the project **before
stage 3 was scoped**. Anyone who ran `/resume` in the last eight days read a document that predates the
entire technical stage — its plan, Aaron's approval of it, all of step 1, and eleven decisions.
**This document exists to close that gap.**

**2. The session this sign-off closes produced nothing.** Working tree clean, nothing unpushed, last
commit **16 September**. The conversation that ran into it was a transcript from **14–15 September** —
ideation rounds 5, 6 and 7, diplomacy through the frame above everything — whose rulings had already
landed at the time as **D214, D215 and D216**. Nothing in it was lost and nothing in it is new. **Do not
treat any of that conversation as recent.** *⚠ An earlier version of this paragraph dated it 9–10
September and cited D185–D195; both were wrong and are corrected here.*

**3. The checks were run at this sign-off rather than quoted: 956 passed, 0 failing, 51 files,
308.72 seconds — all green**, in the browser, which is the only runner that actually executes them.
*⚠ An earlier version of this line shipped as an unfilled placeholder and was committed before anybody
read it back. Corrected in the next commit. The lesson is old and is rule 18's cousin: **re-read a file
you are about to commit, especially one you did not write in the same breath.***

**4. Another chat has this project's dev server running on port 8000.** If a session is live elsewhere,
this handoff may already be behind it. **Check `git log` before trusting a word of this.**

---

## 1. What the seven unrecorded commits actually did

**Stage 3 — technical design — was scoped, approved, and begun.** 2,056 lines across nine files, all on
16 September 2026.

| | |
|---|---|
| `docs/technical/TDD-PLAN.md` | **420 lines. The stage's shape** — a master plus satellites, seven steps **T0–T6**. **Approved by Aaron, 16 Sept 15:50: alpha first, foundations then slices** |
| `docs/technical/TRIAGE.md` | 507 lines. The **300 live items** the twenty design documents left behind, sorted — **52 of them are Aaron's** |
| `docs/technical/TRIAGE.md` → `LEDGER.md` | 145 lines. **The difference between the game that RUNS and the game that is DESIGNED**, system by system, verified in the code rather than carried from a document |
| `docs/technical/MEASUREMENTS.md` | 181 lines. The three numbers stage 2 left waiting. **Two answered; the third cannot be, and that is the most consequential result in it** |
| `docs/technical/ARCHITECT-BRIEF.md` | 123 lines |
| `docs/technical/FIRST-ORDER.md` | 189 lines. **Aaron's own idea** — a running register of changes that must land *before* other work, because anything built on them would have to be built twice. Strict admission test: *would it have to be REDONE* |
| `DECISIONS.md` | **D244–D254** |
| `docs/deferred.md` | **fault 46** — the hang. *⚠ An earlier version of this row said "faults 34–45"; those predate these commits. Verified: the seven commits added exactly one entry, and it is 46. The file holds **31 entries**, numbered to 46* |
| `docs/control-board/board.html` | versions **42–45** |

---

## 2. The three things that matter most out of it

**1. THE GAME CANNOT REACH TURN 200.** It hangs somewhere between **turn 80 and 95**, and it is
designed to run **200 turns to 2086**. **Filed rather than fixed (D252).** Steps 2 and 3 of the stage
can be written without it; **it has to be fixed before step 4, which is where the numbers start.**

**2. The political board is the largest first-order item — and it is round 3's work coming home.** The
game runs on **six ideologies over two axes**; Aaron ruled **three axes and ten positions** (D231).
**Every formula in the game reads the old one.** Nine things depend on the conversion, including
coalitions, who splinters off whom, and how badly a civil war goes. One piece is already done and has
been sitting unused since 11 September: **all 26 live movements were placed on the ten positions when
that round closed.**

**3. There are 39 live faults, not 12 (D245)** — and a decision had already been taken against the
wrong number. **31 entries stand open in `docs/deferred.md` today.**

---

## 3. Where the work stands

| Stage | |
|---|---|
| **1 — Ideation** | ✅ **Closed.** All seven rounds. 536 ideas, 178 rulings |
| **2 — Design** | ✅ **Closed 16 September (D241).** Twenty documents, **11,350 lines** (D247 corrects the 11,324 printed elsewhere) |
| **3 — Technical design** | ◀ **Step 1 of seven is COMPLETE.** T0 foundations done. **T1, the contracts pass, is next** |
| 4 — Planning · 5 — Programming | Not started |

**The build is `v0.6`** and has not moved. Five of nineteen systems have **no code behind them at all**.

---

## 4. What is on the Control Board

**Nothing, and that is correct.** The decision queue is empty; the headline records that Aaron
corrected a card that asked the wrong question and it was taken down. Last republished **16 September
12:05** and its figures are still true.

**I read the saved answers at this sign-off: nothing new from Aaron since 16 September 15:51.** No
instruction was missed in the eight days. **Hog Wild is OFF.**

**The board was NOT republished at this sign-off**, because nothing it reports has changed and
republishing to bump a date is noise.

---

## 5. What the next session starts with

**T1 — the contracts pass. One document.** It fixes the edges between systems so the remaining eleven
can each be written on their own. The brief is `docs/technical/TDD-PLAN.md`, its §1 and its T1 section.
**Read `IDEATION-PLAN.md` first as the standing rule requires, then `TDD-PLAN.md`, then `LEDGER.md`.**

**The other live option, and it is Aaron's to call:** the faults at `docs/deferred.md` **34–45** are all
filed and none is fixed. **That is a programming session under a different permission**, and
**defect 34 — a failed invasion that charges the defender and pays the attacker, live in the playtest
build — is the one to do first.**

---

## 6. Before you stop, every time

**Run `/signoff`, and write the handoff.** *The gap this document exists to close was seven commits of
real work that nobody wrote down, and it went unnoticed for eight days. The session-start hook caught
it; the sessions that created it did not.*

---

# ⚠ ADDENDUM — written by a SECOND sign-off session, same timestamp, same tree

**Point 4 above was right, and it was about me.** *Two sessions ran `/signoff` against this working
tree within the same minute and were both given the timestamp `2026-09-24_1358`. This section is the
second one's; everything above is the first one's and stands, **with one correction.***

## The correction: "all green" was a coin-flip, not a state

**Point 3 reports 956 passed · 0 failed · 308.72s. That run is real.** *So are these two, taken in the
same half hour, in the same tree, with nothing committed between them:*

| | Result | |
|---|---|---|
| First session | **956 · 0** | 308.72s |
| Second session | **955 · 1** | 306.50s |
| Second session, again | **954 · 2** | 272.06s |

**Both red runs failed on an assertion naming `Round Trip Test Region`** — a string that exists in
exactly one place in the project, `tests/content.test.js`, which PUTs an edited `content/cultural.json`
to the live server and restores it in a `finally`. *The second red run added a bare
`TypeError: Failed to fetch`.*

**So defect 47 is confirmed rather than observed**, and two mechanisms make it worse than a transient
diff: **`server.py` writes into the repository's own `content/` directory**, so a different port does
not isolate anything — the contention is over the *file*; and **`world-fixture.js` fetches every data
file once per page and shares it**, so a one-second collision poisons a five-minute run.

> **⛔ DO NOT RECORD THIS SUITE AS GREEN UNTIL IT HAS BEEN RUN WITH THE WORKING TREE TO ITSELF.**
> *It is not a regression either. `DECISIONS.md` D256 *(filed as a duplicate D255; renumbered 17:02)* sets out why it is reported as unattributed.*

## The other finding is the collision itself

**Two sessions, one tree, produced two defect 47s, two rule 21s, racing commits and a duplicate
handoff attempt.** *The duplicates were caught by reading the files before committing — which is the
first session's own new rule 21 — and merged: there is one 47, and the second rule 21 was renumbered
**22**. **Nothing prevented any of it.***

**The sign-off ritual is the worst place for this gap**, because it ends in a commit, a board
republish and a handoff that each assume they are alone. *The project has no lock, no convention and
no warning.* **Whoever reads this next: check `git log` and `git status` before starting, and if
another session is live, say so and stop rather than racing it.**

## What this session added

`DECISIONS.md` **D256** *(filed as a duplicate D255)* · `docs/deferred.md` **47**, merged and confirmed · `docs/PROGRAMMER-RULES.md`
**22** — run the suite with the tree to yourself, and treat a red run as unattributed until you have.

**This session deliberately did NOT republish the Control Board**, because a concurrent session may be
mid-republish and the board is last-writer-wins. *The board still reads `2026-09-16 12:05`. It needs
the test finding and the collision warning added by whichever session runs next, alone.*
