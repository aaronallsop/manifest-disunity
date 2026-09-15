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
  priced: every rate in the engine is tuned per quarter and the label buys flavour only (D163). Deal
  durations are 2 / 4 / 8 / 20 turns, **and D228 added a fifth, longer term with a price paid at
  signing — how long it is and what it costs are the architect's, and the four-entry table is read in
  several places.** A future sub-turn design would give both clocks — see `docs/FUTURE-IDEAS.md` F1 —
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

**The current phase is now STAGE 2, DESIGN**, described below. **It has started: two of its
documents exist**, both written on 15 September.

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

### THE CURRENT PHASE: STAGE 2, DESIGN — two documents written, the rest to go

**⚠ The shape changed on 15 September and this section is the corrected version. D217 is the ruling.**
It is **not** one document per system. It is **a short master, `docs/design/GDD.md`, plus a satellite
per system** — because the downstream reader is one **Technical Designer** taking one system at a
time, who should never have to read a system they are not writing. **The master does not exist yet.**

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

**What exists:**

- **`GDD.md`** — the master. The pitch layer (much of it marked draft for Aaron), the system map and
  the full document list, and the cross-cutting concepts every satellite reads. **Written 15 September.**
  **Its §17 carries seven open questions and §18 ten gaps**, and open question 1 is the split itself.
- **`turn-design.md`** — 572 lines. The turn rebuilt from nothing: no action budget, nothing finishes
  in one turn, and the things that do are a card you click. **D218, D219, D220, D224, D225.**
- **`missions-design.md`** — 836 lines. Three trees (Great Lakes, Deseret, Texas), three branches, four
  elements, one pivot each. The game had no goals before this. **D221, D222, D226, D227.**
- **`board-design.md`** — 478 lines, written 15 September. **Substrate: seven other satellites read it.**
  The Area, adjacency, the transport network's entry costs, reach and why it decays from one core, the
  four rivers and their fifteen gates, the two basins, the edges of the map, transit, and the route
  search. **Almost all of it is built**, so it carries a working system across exactly. *Its §7.1 is the
  one to read first: a port is three different things and 59 of the 136 reach no foreign market at all.*

**✅ RESOLVED 15 September 2026, and the list now exists — `GDD.md` §13.** D217 said *eighteen
satellites*; the Control Board said *nineteen* and printed the denominator as **20**. **Both were true
when written and neither said as of when.** The proposal of 03:35 held eighteen; **`missions-design.md`
was not among them**, because mission trees did not exist as an idea until later that night. **The
answer is a master plus NINETEEN satellites — twenty documents.** Two satellites plus the master are
written; **seventeen to go.**

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
**⚠ Checked 15 September: the two documents that exist closed NONE of these.** The turn and missions
were not on this list — they arrived from Aaron on the day. **So the backlog below is untouched**, and
one item has moved rather than closed:

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

**Do not size stage 2 from a guess, and there is still no total.** Two are written and measured —
**572 and 836 lines** — and that is deliberately not extrapolated: the turn had almost no material
behind it and the large systems carry forty rulings each. The only honest comparison on record is that
the seven idea documents run to **11,725 lines** and a design stage converts an idea stage, so the
answer is the same order of size. **Measure more before quoting a total.**

### The phase this supersedes, kept because it is still the state of the build

**The alpha track, A0 through A4, is built and tagged `v0.6`**, and the alpha test has not been run.
Done there means an alpha tester who did not write the game can: negotiate a trade deal with real terms
and see it expire and prompt renegotiation; grant or revoke transit through their territory by mode and
feel the consequence land; look at the trade network map and understand why a route broke and what to
do about it; and see AI nations trading with each other unprompted. Economy mode is the sandbox this
happens in, and it says so.

The known hollow spot, deliberately accepted: nothing bad happens to a nation that does not trade.
That is the first thing the alpha should watch for. **Round 4 is where it gets answered.**
