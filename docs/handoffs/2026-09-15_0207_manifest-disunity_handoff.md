# Handoff — 15 September 2026, 02:07

## ⚠ This handoff was RECONSTRUCTED, not written by the session it describes

**The session that ran from 23:42 on 14 September to 02:07 on 15 September ended without writing
one.** It made **nine commits** after the previous handoff was sealed, including the two documents
that opened stage 2 and twelve decisions — and left the newest handoff on disk describing a world
that no longer existed.

**This file was rebuilt on 15 September by the next session, from the nine commits and the documents
they changed.** Everything in it is taken from the commits, `DECISIONS.md` D217–D228, the two design
documents, and the Control Board's saved records. **Nothing here is remembered; the session that did
the work is gone.**

**Its cost, so it is not repeated:** the next session had to read nine commits and four documents
before it could say a true sentence about where the project was. `CLAUDE.md` had been telling every
session that stage 2 did not exist. **The record was about five hours behind, and five hours of that
record covered the single largest change of direction the design has had.**

*Programmer rule: the handoff is written last and a session does not end without one. This is the
second time on this project — the previous handoff's own step 11 says so.*

---

## 1. The state

**Everything is committed and pushed. Working tree clean. Nothing failed.**

**No code, data, tests or `DESIGN.md` behaviour was touched** beyond three record corrections. **The
test suite was NOT run in that session** and the figure it quotes — 956 tests, 51 files, 212.71
seconds — is carried from the 14 September sign-off **with its date attached**, not claimed as a fresh
run. *Do not re-quote it as though it were measured today.*

**Both Control Board cards were answered by Aaron at 08:01 UTC and both are banked as D228.**
**Nothing is waiting on him.**

---

## 2. What that session actually did, shortest useful version

**It opened stage 2 and then discovered stage 2 was the wrong shape.**

### The shape changed — D217

Not seven system documents. **A short master, `GDD.md`, plus a satellite per system**, because the
reader downstream is one **Technical Designer** taking one system at a time who should never have to
read a system they are not writing. **The master does not exist yet.**

**The project's name is Manifest Disunity.** *Nation States* was a working title dropped over a clash
with another game. `DESIGN.md` and `README.md` were both still carrying the old title and were fixed.

**The phase order is now: Game Design → Technical Design → build order → implementation.**

**A design session may now edit `DESIGN.md`.** Aaron lifted the designer brief's bar for this work.

### The turn was rebuilt from nothing — D218, D219, D220, D224, D225

**"One action per nation per turn" was never a decision.** Checked before it was asserted: there is
**no entry in 216 decisions** establishing it. Every mention of it is a complaint about it or a
deferral of it. A programming session given a free hand put it in, and seven ideation documents wrote
it at their head as though it were a rule — **so round 7 was deferring an accident, not a design.**

**What replaced it, from Civ2 and EU4:** start as many things as you like; the limits are **money,
time and geography**; nothing finishes in one turn; and the things that do are **a card you click**.
**Nine questions five rounds had parked on the action budget dissolved**, because the currency they
were priced in stopped existing.

**Development enters the alpha as one buildable thing** — capacity to move goods. **A concession is
instant and anything you gain takes time.** A project **stalls rather than fails** when unpaid.

### Missions arrived, and the game had none — D221, D222, D226, D227

**Seven rounds produced 536 ideas without a single goal among them.** Three trees now exist —
**Great Lakes, Deseret, Texas** — three branches, four elements, one pivot each. **Every condition was
checked against the real map before it was written down.**

**The finding worth keeping: all three trees want the Mississippi, for three different reasons.**
Texas to strangle the Midwest, the Great Lakes to reach the sea, Deseret to hold Cairo and Nauvoo on
one river. **Three trees written separately on three different nights, converging on one river.
Nobody designed that.**

**D222 brought conquest ruling 19 forward into the alpha**, superseding diplomacy ruling 8 — and **it
closed the pariah dead end for free.** Deseret now has four nations it can recognise, so the one
pariah on the board stops having no diplomatic move at all.

---

## 3. ⚠ Two of those decisions broke two already-tuned things

**Both were found by checking rather than by failing, and both are named rather than discovered
later.**

1. **Victory is now roughly 2.5 times easier than anybody intended.** The targets in `DESIGN.md` §12
   are set at two to five times an AI-only world **on the reasoning that a player playing deliberately
   for eighty turns should substantially outperform a mild AI.** D223 made a game **200 turns.**
   *The architect's, at the Technical Design stage.*
2. **Turns 60 to 200 have no new separatist pressure arriving at all.** The sentiment model was
   measured over sixty turns and the painted movements reach their ceilings inside the first third.
   **D223 ruled that everything after roughly turn sixty runs on movements born in play** — round 1's
   ruling 42 already specifies them (Rejoin, Expand, Reconquer) and **none of it is built.**
   **The alpha is unaffected**: it is a sixty-turn test, exactly the window the painted movements
   cover.

---

## 4. What is on disk now, and what it measured

| | Lines | Holds |
|---|---|---|
| `docs/design/turn-design.md` | **572** | The turn as three beats. **6 open questions, 6 gaps** |
| `docs/design/missions-design.md` | **836** | Three trees. **8 open questions, 7 gaps** |
| `docs/design/GDD.md` | — | **Does not exist.** The master is unwritten |

**Two measurements, and deliberately no total.** The turn had almost no material behind it and the
large systems carry forty rulings each. The only honest comparison on record: **the seven idea
documents run to 11,725 lines**, and a design stage converts an idea stage, so the answer is the same
order of size.

---

## 5. ✅ A contradiction in the record, raised and then resolved the same day

**D217 said "a master plus eighteen satellites." The Control Board said "a short master document and
nineteen beside it" and printed the denominator as 20.**

**Resolved 15 September while writing `GDD.md`: both were true when written and neither said as of
when.** The split proposed at 03:35 held **eighteen**. **`missions-design.md` was not among them** —
mission trees did not exist as an idea until later that night, the document was written, and the list
was never updated. **The answer is a master plus nineteen satellites: twenty documents**, which is
what the board's denominator already says.

**⚠ What did NOT get resolved, and it is the bigger half.** The split was **proposed and never
approved** — Aaron redirected to turn design before answering. **Three documents now exist against a
structure nobody ratified.** It is open question 1 in `GDD.md` §17.

---

## 6. What straightening the record cost, and what it changed

Done by the reconstructing session on 15 September, before any new work:

- **This handoff**, written from the commits.
- **`CLAUDE.md`'s definition of done** — it said stage 2 was *one document per system* and that
  **nothing of it existed**. Both false. Corrected with D217's shape, the two documents, the four-part
  satellite template, and the 18-versus-19 contradiction flagged in place.
- **`CLAUDE.md`'s clock rule** — it carried four deal durations and no game length. D228 added a fifth
  term and D223 set 200 turns; both are now there, with the turn-is-a-round fact.
- **`CLAUDE.md`'s "no `DESIGN.md`" line** — lifted by D217 and still being asserted.
- **The backlog** — checked item by item: **the two documents closed none of it.** The turn and
  missions were not on the list; they arrived from Aaron on the day. One item **moved without
  closing**: the remnant's victory now has a third candidate from the Texas pivot.

**The Control Board needed no correction.** It was rewritten at 02:07 and is current.

---

## 7. Where to start next

**The master, `GDD.md`, or the next satellite.** Two satellites exist and the master they both declare
a dependency on does not — `turn-design.md` says *"Depends on: `GDD.md` only"*, so the document at the
root of the tree is the one thing missing.

**The stage 2 backlog is in `CLAUDE.md` and is untouched.** Its heaviest item is still **the logistics
spiral's brake** — the most serious thing round 4 found, three candidates, none chosen.

---

## 8. Known but unverified, carried forward

- **Nothing in rounds 4–7's models, or in either design document, has ever run.** All paper.
- **The game has not been opened since 5 September.**
- **The suite has not been run since 14 September.**
- **Round 4 ruling 7 still depends on where phosphate, potash and natural gas actually are.** A data
  job; check it, never remember it.
- **The wiki is PAUSED at Aaron's instruction** (14 September). `docs/wiki/Economy.md` still says the
  economy has had no design round, which is false. **Do not fix it without asking.**
- **The repository is public and that is correct** — his decision of 7 September. **Do not raise it.**
- **Hog Wild Mode is OFF.**
- **`docs/deferred.md` 33** carries four scenario-content items, one of them new (D227, Deseret's
  opening recognition), and **round 7's ruling 2 now rests on two of them.**
