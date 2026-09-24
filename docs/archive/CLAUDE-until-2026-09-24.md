# Manifest Disunity

<!-- The standing rules live in ~/.claude/CLAUDE.md and apply here automatically.
     This file holds only what is specific to THIS project. Keep it short — it is
     re-read every session and after every compact. -->

## What this is, in one paragraph

A browser strategy game about the United States coming apart and being put back together. The
board opens on sixty-one nations where fifty-one states used to be, drawn on a real county map
with real population, output and voting data. Nations trade, annex, unite, secede, hold elections
and gang up on whoever frightens them. It runs as plain HTML and JavaScript with a small Python
server — no build step, no framework — and it must still work in six months. "Working" means a
playtester who has never seen it can open a link, play sixty turns, and tell you afterwards why
they lost.

## Where things are

- Control Board: see `docs/control-board/BOARD-URL.md`
- Current handoff: newest file in `docs/handoffs/`
- The brief for the economy work: `docs/spec/` — authoritative; **you may not modify it without permission**
- What the game currently is: `DESIGN.md` — the source of truth for behaviour, kept current
- Run it: see `README.md`

## Rules specific to this project

- **Check Hog Wild Mode on the Control Board at the start of every session.** It is a standing
  permission like the others, and when it is on it changes how the whole session runs: keep building
  without stopping to ask, use as many parallel agents as the work needs, and answer the questions
  that would otherwise become cards — but write every one of them into `docs/HOGWILD-LOG.md` as it
  happens, with the question, why you could not answer it, what you did instead, and the command that
  undoes it. **Every stage gets a `stage/<name>` git tag.** The full definition, including the five
  things the mode does NOT unlock and the four cases where you stop and wait anyway, is in
  `docs/HOGWILD.md`. Read it before switching it on in your head.
- **`DESIGN.md` is the source of truth for what the game does.** If behaviour changes, it changes
  in the same commit. If `DESIGN.md` and any other document disagree, `DESIGN.md` is right and the
  other is a bug.
- **Every number the model uses is a named tunable in the tuning file, never a literal in code.**
  Aaron must be able to change a value, reload, and see the effect without a rebuild and without you.
- **Determinism is non-negotiable.** The same seed must reproduce a run exactly. It is tested; keep
  it that way.
- **The full game must stay untouched by work on the stripped-back Economy mode.** Economy mode is
  a set of flags, not a fork. All tests green is the bar before anything is called finished.
- **The economy brief runs on checkpoints.** No phase is skipped and no two phases are merged. Outside
  the alpha track, nothing in a later phase starts until Aaron has verified the previous one on the
  Control Board in writing — **for A0–A4 he has waived this; see the Addendum A rules below.** When
  something in the brief is ambiguous, stop and ask — do not pick something reasonable and carry on.
- **The Control Board never drives the game.** It is where Aaron reads progress and answers
  decisions. It cannot reach a running game and must not be built to try. Every testing control —
  step a turn, fast-forward, force a state's figures, run the simulation, choose a seed — belongs to
  the game's own developer dashboard behind the dev flag. The economy brief says otherwise in its
  Phase 0; the brief is wrong on this point and Aaron has ruled so (D162). Do not re-raise it.
- **One turn is one quarter, and the game opens on 1 March 2036** — the eve of two hundred years
  since Texas declared itself a nation. The month was ruled and then reversed once the cost was
  priced: every rate in the engine is tuned per quarter and the label buys flavour only (D163).
  **⚠ DEAL DURATIONS ARE 20 / 30 / 40 / 50 / 100 TURNS — five, seven and a half, ten, twelve and a half
  and twenty-five years. Aaron raised them himself on 6 September from 2 / 4 / 8 / 20.** This line said
  the old four until 15 September and D228 was put to him on that stale premise; **D233 voids half of
  that ruling.** What survives: **signing a long agreement should cost something, and today it costs
  nothing** — the menu tops out at half the game and is free. A future sub-turn design would give both clocks — see `docs/FUTURE-IDEAS.md` F1 —
  and today's choice is its outer clock, so nothing is foreclosed.
- **The game is 200 turns and ends in 2086** (D223) — fifty years. **A turn is a ROUND:** sixty-one
  nation-slots in a shuffled order, then the world advances once when the pointer wraps. **There is no
  action budget** (D218) — the limits are money, time and geography, nothing finishes in one turn, and
  the things that do are a card you click.
- **There is one tuning file.** Every model constant the economy needs joins the constants already
  there. Never create a second tuning file (D162).
- **⚠ POLITICS IS THREE AXES AND TEN POSITIONS (D231, 15 September 2026), and the built two-axis model
  is superseded.** Economy (collective · neo-liberal), morals (conservative · progressive), power
  (authoritarian · libertarian), each −1 to +1. **Eight corners are parties named for real ones, plus
  two centrists — Republicans and Democrats — which is what makes it ten**, plus two conditions you
  *fall into* rather than stand for, Despotism and Stateless, whose mechanics stay deferred to F19.
  **`GDD.md` §15.1 is the authority; §15.1a records what is built and what converting it costs.**
  The game still runs on six ideologies over two axes and **will keep doing so until the build stage
  reaches this** — so when reading a formula, check which board it is on.

## Versions

`docs/VERSIONING.md` is the scheme and it is binding. The short form: the middle number moves when
something exists that did not before (`v0.2`), the last number when the same thing is merely fixed
(`v0.2.1`). Tag on `master`, never on the playtest branch. Tag only a verified state. One alpha bump
per stage of the roadmap as it lands — for the alpha track, at each of A0–A4.
Published tags are never moved or deleted.

Current: `v0.1` the prototype, `v0.2` Economy mode. The `main` branch is a built copy for the browser
that playtesters open — an output, not a place work happens. Do not delete it.

## Where this project departs from the standard layout, and why

- The code lives in `js/`, `css/` and at the root rather than in `src/`. It is loaded directly by
  the browser as plain script files; moving it would break every path in the page for no gain.
- **`prompts/` now exists, from 15 September 2026.** It was absent because nothing here talked to a
  language model. It does now: `prompts/tone-interview.md` is a prompt Aaron pastes into a Claude chat,
  which interviews him about tone and returns `docs/design/TONE.md` (D232). **The standing rule applies
  as written — any prompt text sent to a model lives in that folder as a file, never in code.**
- `build/` holds the offline Python scripts that bake the map and economy data, and serves the role
  `scripts/` does elsewhere.

## Rules from Addendum A (the alpha track, 5 September 2026)

- **The roadmap is now A0 → A4 then an alpha test**, per `docs/spec/economy-system-spec-addendum-a.md`.
  Aaron has ruled that the A-stages run **straight through without stopping for approval between
  them**; this supersedes, for the alpha track only, the rule that each phase waits for written
  sign-off. Commit and tag each stage as it lands. Stop only on something genuinely his to decide.
- **A1 and A2 build on the existing economy and do not touch it.** No changes to demand, supply or
  price. If a stage starts needing them, stop and raise it. The model is known to be structurally
  wrong and is being kept on purpose.
- **Do not tune anything.** Tolls, durations and caps get placeholder tunables and stay there.
- **Canada and Mexico are geography, not nations.** Not actors, not conquerable, no opinion, no
  negotiation. Any bordering state may route through them at a flat placeholder toll (10%) that is a
  cost, not a transfer. **Great Lakes ports reach the world market only through the Canada corridor;
  ocean ports reach it directly.** `data/county_trade.json` already distinguishes the two.
- **The recognition trade block stays** (D166). Do not implement v2 ruling 1.6 or its restatement in
  the addendum; both misread DESIGN.md.
- **Economy mode is a sandbox with no win condition**, and testers are told so up front.
- **The five-nation prediction exercise is struck.** Do not wait on it or ask for it.

## Definition of done for the current phase

**STAGE 1, IDEATION, IS CLOSED. All seven rounds.** `docs/design/IDEATION-PLAN.md` is now a record
rather than a plan, and it is still the first thing to read before opening anything in
`docs/design/`. Rounds 1–4 closed between 7 and 14 September. **Rounds 5 (diplomacy), 6 (events) and
7 (the things above) ran on 14 September and Aaron closed all three on the Control Board at 02:53 on
15 September, with the same click confirming the eight defaults round 5 had taken in his place.**

**⚠ So the seven ideation documents are records now.** A later change to one is a *correction with a
reason*, not a fresh ruling — the same status rounds 1–4 have had since they closed.

**Totals, counted on 14 September rather than carried forward: 536 ideas and 178 rulings across the
seven documents.**

## ✅ STAGE 2, DESIGN, IS CLOSED — Aaron, 16 September 2026, 09:01 (D241)

**A master and nineteen satellites. Twenty documents, 11,324 lines, sixty-seven situations traced.**
*Written between 15 and 16 September; closed on the Control Board with no note, which under this
project's convention means the recommendation as written.*

> **⚠ Closing the stage closed the WRITING, not the DECIDING.** *The documents leave open questions and
> every one of them is Aaron's. They are listed at the end of the document that owns them and nowhere
> else — **do not reassemble that list from memory.***

### ⛔ THE CURRENT PHASE IS STAGE 3, TECHNICAL DESIGN — SCOPED, APPROVED, AND STEP 1 OF SEVEN IS DONE

**⚠ This section was eight days stale and was corrected on 24 September.** It said stage 3 *"has never
been scoped"* and *"nobody has said it starts."* **Both stopped being true on 16 September** and
nothing updated this file, because the seven commits that did the work never touched it. *The handoff
was stale too and the session-start hook caught that one; nothing catches a stale definition of done,
which is why this warning is written here rather than only in the record.*

**`GDD.md` §9 names the stage:** *formulas, pseudocode, inputs and outputs, edge cases.* **Every number
in it is the architect's, not the designer's** — Aaron's line of 14 September, and it is why round 7
refused to set the turn budget.

**THE PLAN EXISTS AND AARON APPROVED IT — D248, 16 September, both cards with no note.**
`docs/technical/TDD-PLAN.md` is the authority and carries the approval at its head.

- **Scope: ALPHA FIRST, whole-game aware.** Full build-standard specification for what the alpha needs;
  for everything else **only its contract** — what it must expose to its neighbours, so nothing is
  foreclosed.
- **Sequence: FOUNDATIONS FIRST, THEN SLICES.** T0 and T1 finish on paper because everything depends on
  them; then **specify one system and build it before specifying the next**, each slice ending in
  something that runs and is tested.
- **Seven steps, T0–T6**, and the board's progress rail shows them as their own phases.
- **⚠ Dependency order was abandoned before it was tried (D244)** — eleven systems are in one knot, so
  the plan orders by *contracts before internals* instead.

**✅ STEP 1 (T0, FOUNDATIONS) IS COMPLETE — 16 September.** *It produces no specification, and that is
the point of it.* It delivered the architect brief, **the reconciliation ledger** (nineteen systems:
what is built, what is designed, the difference — *ten satellites had never written down what already
exists*), the triage of the three hundred open items, the three waiting measurements, the state
inventory, and **the first-order register**.

**⚠ THE FIRST-ORDER REGISTER IS A HABIT, NOT A STEP** — `docs/technical/FIRST-ORDER.md`, added by Aaron
on 16 September. It holds changes that must land before other work **because anything built on top of
them would have to be built twice**. *It grows at the moment a finding is made, at every step of this
stage, rather than being reconstructed at the end.* **Its admission test is strict and that is the whole
reason it stays short: an item is first-order only if building on it would have to be REDONE** — not
"important", not "broken".

> **⚠ AND THE FRAMING THAT CORRECTS A CARD PUT UP WRONG, in Aaron's words, 16 September:**
> ***"we are not building the game right now, we are building the technical design document. We can
> change things."*** *Step 1 asked him whether to repair a fault now or later. **That was the wrong
> question.** A fault found while writing a specification is an **input** to the specification, not an
> interruption of it — it goes in the register, and the sequencing it asserts is evidence for stage 4
> rather than a request for permission.*

**⛔ THE WORST THING THIS STAGE HAS FOUND — `docs/deferred.md` 46, and it was found by RUNNING the game
rather than reading it.** **The simulation hangs somewhere around turn 80–95 and never returns**, and
the game is designed to be **200 turns** (D223). It stops inside the call that plays all sixty-one
seats. **The turn it stops on moves with the seed**, so it is a condition some world reaches rather than
a counter running out. *Four runs; instrumentation, browser throttling, mere slowness, a turn cap and
the known non-re-entrancy were each ruled out by check rather than by argument.*

**Three numbers that did not survive contact, all 16 September:** **`MAX_DISTANCE` is 2√3** and the one
function turned out to be two (D250); **the victory targets are stale at EIGHTY turns**, before the
200-turn question is even reached (D251); and there are **38 standing faults, not 12** — a decision had
been taken against the wrong number (D245).

**The twenty design documents leave 300 live items, and 52 of them are Aaron's** (D246). *The plan's §6
is how he answers fifty-two questions without receiving fifty-two cards.*

**What the next session does:** read `docs/technical/TDD-PLAN.md` and continue at **T1, the contracts
pass** — unless Aaron says otherwise. **The other live option, which is not stage 3 and is his to
call:** the standing faults in `docs/deferred.md` are filed and unfixed, **that is a programming session
under a different permission**, and defect 34 — a failed invasion that charges the defender and pays the
attacker, live in the playtest build — is the one to do first.

---

## What stage 2 produced, kept below because it is the material stage 3 reads

A round is done when a session can read its document end to end and the only new entries are
recombinations of ones already there; when **every one of its scenarios has been traced** — tracing has
found contradictions in every closed round that the rulings alone did not, and round 6 proved it is
better done **before** the rulings than after; when it has answered **what the player actually does
about this, on a Tuesday, with one action**; and when Aaron says so.

**A design round writes documents only.** No code, no data. Changes a round decides are *specified* for
the build, not made — round 3's ruling 41 is the worked example. **⚠ One correction, 15 September:
`DESIGN.md` is no longer on that forbidden list** — D217 lifted the bar for stage 2 work. It still
describes what the game *does*, and it still wins any disagreement with another document.

### ⚠ Two lines Aaron drew on 14 September that bind every session after it

1. **"You are currently the game designer working towards a game design document. The actions/turn
   will be handled by the technical design director in the next step."** — **so the turn budget and
   the clock are not the designer's.** Round 7 hands them forward as a *requirement*, not an answer,
   and two of its four rulings are refusals to decide. **Whether a thing can work, and how, is the
   architect's.**
2. **"Remember — you are not deciding what to cut."** — **the build order and what gets moved
   post-alpha are Aaron's and the planning stage's.** A design document supplies evidence: what a
   thing depends on and whether the alpha's stated purpose needs it. It does not rank, recommend, or
   cut.

### STAGE 2 AS IT WAS BUILT — the shape, and why it is twenty documents

**⚠ The shape changed on 15 September and this section is the corrected version. D217 is the ruling.**
It is **not** one document per system. It is **a short master, `docs/design/GDD.md`, plus a satellite
per system** — because the downstream reader is one **Technical Designer** taking one system at a
time, who should never have to read a system they are not writing. **The master exists and is 1,168
lines.**

**Every satellite has the same FIVE parts** — four from the GDD brief plus one Aaron reinstated on
15 September. It **opens** with a `Depends on:` line naming every other document whose state or
formulas it needs; then **what the thing does, what it is measured in, what the player sees, and what
happens at each level**; and it **closes** with **Open questions** (a decision Aaron has not made) and
**Gaps** (something referenced and never specified) kept separate.

**⚠ AND IT ENDS WITH TRACED SCENARIOS — reinstated by Aaron, D232, 15 September 2026.** The two briefs
had disagreed and the newer one had won by default; he has ruled for the older. **Every design document
ends with the situations it must be able to narrate, each one traced step by step.** *Worked examples
are the test suite: tracing found contradictions in every closed ideation round that the rulings alone
did not, round 1 found two of five stories jammed on contradictions fifty-three rulings had missed, and
round 6 proved it works better BEFORE the rulings than after.* **A trace that narrates smoothly first
time has probably not been pushed hard enough.**

**✅ The four documents that predate the ruling have all been traced — 15 September 2026.** `GDD.md`
§19, `turn-design.md` §12, `missions-design.md` §10, `board-design.md` §14. **Nineteen scenarios; the
practice earned its keep immediately.** It produced **eight new findings** — four open questions and four
gaps — none of which the rulings alone had surfaced. *Biggest three: Deseret's only route to any market
runs through Riverside, a nation nobody had considered; the turn is well specified for turn 40 and
unspecified for turn 1; and a mission is ruled permanent while its REWARD is not, which is a fork nobody
has taken.* **A master document's scenarios are the cross-cutting ones** — a scenario that lives inside
one system belongs in that system's document.

**What exists — ALL TWENTY. ⚠ Line counts re-measured 16 September 2026; the 15 September set was stale in three rows.**

**✅ `docs/design/TONE.md` EXISTS** (D238), written from Aaron's own interview: 41 rules, 11 worked
examples, 19 open questions. *It is **not** one of the twenty; it is the input the twentieth could not
be written without.* **Read it before writing anything the player reads — it is checked against
artefacts, not vibes, and rules 1–4 bind every panel, prompt and tooltip in the game.**

**✅ AND THE TWENTIETH IS WRITTEN — `presentation-design.md`, 706 lines, 16 September 2026.** *The
briefing, the card, the map, the panel, the newspaper's form, the timeline, and **the form of round 7's
ruling 3** — what a nation may know. It closes `GDD.md` gap 6 and takes over its open question 3.*
**⚠ Two of its five traced scenarios JAM, and both jams are other documents':** *the opening board
holds **no offers in flight**, which Aaron's taught first turn needs; and his own line — **"nations only
sign peace treaties with nations"** — couples a peace treaty to recognition, which `diplomacy-design.md`
currently keeps independent.* **Neither was findable by reading his note; only by walking it beat by
beat.**

**⚠ AND THE ALPHA'S CONTENT SCOPE CHANGED WITH IT — D239, Aaron's, unprompted.** *Out of the alpha and
returning afterwards: **the New Confederacy and Christian Nationalism movements, and the Despotism
government state**. **Stateless ground IS in the alpha but is not a playable nation.** Alpha content is
**the Texas area, the Great Lakes and the West** — which is exactly the ground of the three mission
trees.* **`identity-design.md` and `movements-design.md` still describe all 26 movements and were
deliberately not corrected**: a movement cut from the ALPHA is not cut from the GAME. **The scope lives
in `GDD.md` §9.**

| | Lines | |
|---|---:|---|
| **`GDD.md`** | **1,168** | **The master.** The pitch layer, the system map, the full document list, the cross-cutting concepts |
| `missions-design.md` | **1,003** | Three trees, three branches, four elements, one pivot each. **The first document that will have to split again** |
| `turn-design.md` | **761** | No action budget; nothing finishes in one turn |
| `board-design.md` | **731** | **Substrate: seven satellites read it.** ⚠ §7.1a is new — **four real ocean ports are flagged inland** |
| `nation-design.md` | **618** | ⚠ **Round 1 asked for one machine for making nations. There are FIVE** |
| `identity-design.md` | **573** | Three axes, ten positions, the six struck movements named |
| `governing-design.md` | **552** | Government, leader, elections, martial law, the referendum |
| `war-design.md` | **535** | ⚠ **"There is no war. Taking ground is a purchase"** |
| `events-design.md` | **497** | The crisis, the shock and the dispatch |
| `movements-design.md` | **496** | The sentiment formula, six verbs, two tiers of secession |
| `economy-design.md` | **476** | ⚠ **Carries D234, the logistics brake** |
| `diplomacy-design.md` | **458** | The relations list, the eight-state spine, the recognition pivot |
| `population-design.md` | **453** | The six counts, drift, migration's five terms |
| `blocs-design.md` | **436** | ⚠ **The reconciliation job — and it is FIVE regimes, not three** |
| `trade-design.md` | **417** | ⚠ **24 of 61 nations cannot reach the world market. The published figure was 14** |
| `presentation-design.md` | **706** | ⚠ **The last one.** Two of its five traces jam, and both jams belong to other documents |
| `opening-board-design.md` | **390** | Authored against derived, down the middle of every page |
| `ai-design.md` | **366** | ⚠ **Built on a turn rule D218 superseded this morning** |
| `power-design.md` | **365** | The five stocks, the Why record, the rate limit |
| `force-design.md` | **322** | ⚠ **Three slices, not four** |

**⚠ TOTAL, RE-MEASURED 16 September 2026 with all twenty in place: 10,156 lines across the NINETEEN
satellites, plus a 1,168-line master — 11,324 lines.** *Against the ideation stage's 11,725, **a design
stage converts an idea stage very nearly one for one — 97%.*** **⚠ That corrects the four-fifths figure
published a day earlier**, which was measured when the largest missing document was still missing and
was therefore a floor rather than a ratio. *The lesson is the one this project keeps relearning: a
figure measured before the work is finished is a figure about something else.*

**✅ RESOLVED 15 September 2026, and the list now exists — `GDD.md` §13.** D217 said *eighteen
satellites*; the Control Board said *nineteen* and printed the denominator as **20**. **Both were true
when written and neither said as of when.** The proposal of 03:35 held eighteen; **`missions-design.md`
was not among them**, because mission trees did not exist as an idea until later that night. **The
answer is a master plus NINETEEN satellites — twenty documents.** **✅ ALL NINETEEN SATELLITES AND THE
MASTER ARE WRITTEN — 16 September 2026.**

**✅ AND THE SPLIT IS APPROVED — D230, 15 September 2026.** Aaron ratified nineteen, and **his reason
binds every document after it**: *a GDD is a living document and is never finished, so a fat document
now becomes an obese one later.* **So the split is a FLOOR, not a ceiling — when a satellite outgrows
its seam it splits again**, and a document is sized against what it will look like after a playtest
files findings into it, not against how long it is today. `GDD.md` §13.1 names the first document that
will have to split (`missions-design.md`, at the system/trees seam) and the trigger for doing it (the
fourth tree). **Do not do it early and do not merge anything.**

**A design session may now edit `DESIGN.md`** — D217 lifted the designer brief's bar for this work.
The precedence rule is unchanged: `DESIGN.md` still describes what the game *does*.

**What the rounds explicitly filed to it**, so the backlog is not reassembled from seven documents.
**⚠ The line that used to stand here — "the two documents that exist closed NONE of these" — was
written when two existed. NINETEEN exist now and it has NOT been re-checked item by item.** *What is
known: **the logistics brake is CLOSED**, chosen by D234 during the Hog Wild run and carried in
`economy-design.md`. One item has MOVED rather than closed, marked below.* **Treat the rest as
DESCRIBED by the documents that now exist and NOT decided — and verify before quoting any of it as
open.** *The turn and missions were never on this list; they arrived from Aaron on the day.*

- **The logistics spiral's brake** (economy finding E) — *the most serious thing round 4 found.* Three
  candidate brakes exist and **none is chosen**.
- **The federation's flat toll against the built corridor system** — and **diplomacy's ruling 4 made
  this worse, not better**: there are now two internal-trade regimes to reconcile with the one that is
  built.
- **A diplomacy screen** — six of the game's eleven moves are diplomatic and all are reached by
  clicking the map.
- **What a shock looks like on screen** — round 6's ruling 1 makes the first event that is about a
  *region*, and the map is what the player reads.
- **Whether lasting infrastructure damage exists at all** — today a wrecked rail hub lasts one turn,
  so it is a raid and not a demolition, and nobody decided that on purpose.
- **Two of F21's questions** — whether referendum spending moves the vote or only the turnout, and
  whether the movement may spend too.
- **Politics finding H** — the movement roster occupying half the board.
- **From round 7:** whether the remnant's victory is the same conditions told two ways or its own set
  — **⚠ MOVED, NOT CLOSED, 15 September.** The Texas tree's pivot supplies a third answer neither
  candidate anticipated: *the remnant's story can be seized*, and you unite the continent as the United
  States **of Texas**. It still belongs to `nation-design.md`, and it now has three candidates rather
  than two. And **what a restricted view actually looks like** — ruling 3 settled what *gates* sight,
  not what you see. Bands and staleness are both still available.

**⚠ THIS BLOCK IS SUPERSEDED AND IS KEPT ONLY AS A DATED RECORD.** *It read: 9,436 lines across
eighteen satellites, counted 15 September, and **"a design stage converts an idea stage at about four
fifths its size."*** **Both figures were measured while the largest missing document was still
missing.** *The current total is the one above — **11,324 lines across twenty documents, 97% of the
idea stage** — and the lesson is kept rather than the number: **a figure measured before the work is
finished is a figure about something else.*** *It was also duplicated in this file for a day, which is
how a stale total survives: it was corrected in one place and not the other.*

### The phase this supersedes, kept because it is still the state of the build

**The alpha track, A0 through A4, is built and tagged `v0.6`**, and the alpha test has not been run.
Done there means an alpha tester who did not write the game can: negotiate a trade deal with real terms
and see it expire and prompt renegotiation; grant or revoke transit through their territory by mode and
feel the consequence land; look at the trade network map and understand why a route broke and what to
do about it; and see AI nations trading with each other unprompted. Economy mode is the sandbox this
happens in, and it says so.

The known hollow spot, deliberately accepted: nothing bad happens to a nation that does not trade.
That is the first thing the alpha should watch for. **Round 4 is where it gets answered.**
