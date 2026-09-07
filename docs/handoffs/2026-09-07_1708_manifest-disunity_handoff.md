# Handoff — 7 September 2026, 17:08

**Round 1 of ideation is closed: 53 rulings, five scenarios traced, six findings. Working tree is
clean and everything is pushed. No code was written or run this session and no test was executed —
this was a design session and it touched only `docs/`.**

Nothing is broken. The two things that need saying up front are that **two of the five closing
scenarios stalled on contradictions we made without noticing** (findings A and B below), and that
**the game itself has not been opened since 5 September**, so every claim about the running build
is inherited rather than re-verified.

---

## 1. Read these first, in this order

| | Why |
|---|---|
| `docs/design/DESIGNER-BRIEF.md` | The standing brief for a design session. **Paste its lower half into a fresh session.** It now records five stages, not four |
| `docs/design/IDEATION-PLAN.md` | The seven rounds, why they are in that order, and which is next. Round 1 ✅, **round 2 ◀ NEXT** |
| `docs/design/secession-ideation.md` | Round 1's output, 1,593 lines. **§6b and §6c are the close** — the five traced scenarios and the six findings. Read those before anything else in it |
| `docs/design/conquest-ideation.md` | Round 2's inbox. Not empty: twelve questions handed to it by round 1 |
| `DECISIONS.md` D179, D180 | Why all four (now five) stages happen here, against one set of documents |

`DESIGN.md` remains the truth about what the game **does**. `docs/design/` is what it is **intended**
to do and is not built. When something ships, its design note points at `DESIGN.md`.

---

## 2. The operator and the board

**Aaron is a filmmaker and project manager, not a programmer.** He cannot read code and does not want
to. Write to him about the thing being built, never about the code. Lead with bad news.

**Control Board:** https://claude.ai/code/artifact/aae9bdbf-3309-4df1-be0f-471abb77fa1d — its saved
records are instructions to you. **Read them at the start of every session.** As of 7 September:
Hog Wild **off**, so ask rather than decide; `live` is still ticked from an earlier session and has
been left alone; four saved decisions, all already in `DECISIONS.md`.

**One more artifact now exists and it is a working document, not a report:**
https://claude.ai/code/artifact/d5a0bcf2-9e45-42aa-99c2-43f78dfe5204 — the **Movement Register**, all
32 movements with editable verb, adjective and political leaning. Aaron marks it up; read it back
with `action: read_db`, collection `movements`. He used it once and 27 of 32 rows carry his answers.

**A standing instruction he gave this session:** list every question you have first, then ask **only
the first** and wait. He answers one at a time. It is in the brief and in memory.

---

## 3. The rule you must not get wrong

**A design session does not touch code or data.** Not `js/`, `tests/`, `css/`, `build/`,
`index.html`, `dev.html`, `server.py`; not `data/` or `content/`; not `DESIGN.md`; not `docs/spec/`
without permission. You write in `docs/design/`, and you may append to `DECISIONS.md`,
`docs/deferred.md` and `docs/FUTURE-IDEAS.md`. If you find a bug, **write it down and move on**.

---

## 4. Where the work is

| | State |
|---|---|
| **Round 1 — Secession** | ✅ **Closed 7 Sep, 53 rulings.** Five scenarios traced; three narrate, two stall |
| **Round 2 — Conquest** | ◀ **Next.** Stub with 12 inherited questions |
| Rounds 3–7 | Stubs, each with an inbox filled by round 1 |
| Economy ideation | 92 entries, parked. Finished at round 4, not before |
| The build | Untouched since 5 Sep. `stage/a5`, 954 tests green **as of 5 September** |

**Measured this session** (7 September, from files on disk — re-derive before repeating):

- Firearm ownership by state, **RAND TL-354**, 2016, 50 states: **8.9%–65.0%, median 40.0%**. DC is
  absent from the dataset and was assigned **6% by hand** — invented, must carry the est. badge.
- Armed share apportioned to counties by settlement density: **largest state-total error 1.9 × 10⁻¹⁶**.
  Regional medians: ranching West 65.0%, Deseret corridor 58.5%, Appalachia 49.9%, New England 42.9%,
  New York City 12.5%.
- **The six stateless regions are not more armed than average** — 44.6% against 46.9%. That refuted
  the premise behind ruling 32 and it was changed.
- Ring-spread ladder at 33/11/3.7/1: a minimal Deseret gains **1.6 Areas**, a maximal one **19.9**.
- **Roughly 15 of 32 movement homelands are generated from state lists, not drawn**; 8 span several
  states, so their edges follow lines nobody chose.

---

## 5. Your first job

**Open round 2 — military conquest.** There is no command to run and nothing to build.

1. Run `/resume`, then read the Control Board's saved records.
2. Read `docs/design/conquest-ideation.md` — its twelve questions are the agenda.
3. Read `secession-ideation.md` §6b–§6c so you know what round 1 handed you and what it broke.
4. Ask Aaron the first question and wait.

**Two of round 2's questions are load-bearing rather than ordinary:** what a government owes an
**Expand** or **Reconquer** movement it obeys (the first movements a player answers by *acting*), and
**finding C** — three separate mechanisms all amplify the dice, and conquest owns the other half of
that balance.

---

## 6. What was learned this session

**A design pass that only cuts is a design pass that destroys evidence.** The first note written under
the old arrangement, `resources-v2.md`, simplified nine tracked quantities to four before several of
those ideas had been recorded anywhere. Splitting ideation from design (D180) exists because of that,
and everything it cut was restored into `economy-ideation.md`. **Do not simplify during ideation.**

**Tracing scenarios found contradictions that fifty-three rulings did not.** Finding A: a movement can
never petition, because the threshold to ask was never set below the threshold to declare — Cascadia
would take Portland and Seattle rather than ask for them. Finding B: the Rio Grande Union's homeland
is New Mexico, which is stateless, and grievance reads the *holder's* stocks — so it has nothing to
grow against. **Neither was visible while adding rulings.** Close every future round the same way.

**Aaron's playtest observation was a real defect, three times over.** He said Deseret separatists
showed as pressure on Deseret's own soil. Verified: all three places that read movement strength take
the largest share in an Area with **no check on whose movement it is**, so a nation founded by a
movement is charged for its own founding population in its AI posture, its map and its occupation
upkeep. Logged as **`docs/deferred.md` #14** for a programming session.

**RAND blocks automated fetching.** Both the dataset page and the PDF return 403, and there is no PDF
library or poppler on this machine. Aaron downloaded it by hand. **The raw file's home is
`build/raw/`** — it is gitignored, and a design session may not put it there.

**Also found and logged:** `docs/deferred.md` #13 — `DESIGN.md` says twice that treaties and aid do
not exist, and both were built in M11.2.

---

## 7. Known but unverified

- **The 2,100 kcal humanitarian planning figure** and the **rural/suburban/urban density thresholds**
  (1,000 and 100 per square mile) are from memory. So is the geography of the Navajo reservation used
  in ruling 25, and the historical US capitals in ruling 20.
- **The RAND dataset description in ruling 36** was written from a search-index summary before Aaron
  supplied the file; the file itself then confirmed it. The confirmation is recorded above it.
- **The 47-nation board is a sort, not a bake.** Nothing in `data/` or `content/` has changed. Five
  lines still need drawing: the Navajo trim, the Lakota boundary, the Dakota split, Houston's line in
  Louisiana, and Superior's line across the Lower Peninsula.

---

## 8. Before you stop, every time

Run `/signoff`. It tests, commits, pushes, updates the Control Board and the docs, and writes the
next handoff. **Project-specific:** if the session made rulings, they belong in the round's ideation
document as they happen, not in a summary at the end — this session committed after almost every one,
and that is why nothing was lost when the context grew long.

---

## 9. What he owes, and what he does not

**He owes:** the answers to round 2's questions, one at a time. Nothing else — round 1 asked him for
everything it needed and he answered all of it.

**He does not owe:** the RAND download (done), the Movement Register markup (done), any decision about
the build, or anything about rounds 3–7 until they open. **Do not ask him to re-decide anything in
§6b–§6c** — those are findings for a round to solve, not questions for him.
