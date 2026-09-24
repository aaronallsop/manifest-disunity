# Manifest Disunity

## What this is

A browser strategy game about the United States coming apart and being put back together. The
board opens on sixty-one nations where fifty-one states used to be, drawn on a real county map
with real population, output and voting data. Nations trade, annex, unite, secede, hold elections
and gang up on whoever frightens them. It runs as plain HTML and JavaScript with a small Python
server — no build step, no framework — and it must still work in six months. "Working" means a
playtester who has never seen it can open a link, play sixty turns, and tell you afterwards why
they lost.

## How to use this file

This file holds what is **permanent**: what the game is, how the studio runs, where things live,
and the rules that do not change from session to session. It is read by every session and every
specialist before any work begins, so every line in it costs something.

**It is not a diary.** Progress, counts, what was done today and what is waiting belong in the
handoff and on the Control Board. Reasons belong in `DECISIONS.md`. When something here changes,
the old version is not kept here with a correction beside it — the decision that changed it is
recorded in `DECISIONS.md` and this file simply says the new thing.

The previous version of this file, with its full history, is kept unchanged at
`docs/archive/CLAUDE-until-2026-09-24.md`.

## Where we are

*Changes only when the phase changes. Everything finer-grained is in the newest handoff.*

- **Stage 1, ideation, and stage 2, design, are closed** (D241). Twenty design documents: a master,
  `docs/design/GDD.md`, and nineteen satellites.
- **Stage 3, technical design, is under way.** The plan is `docs/technical/TDD-PLAN.md`, approved
  (D248): alpha first, foundations then slices. Step 1 (T0, foundations) is done. Step 2 (T1, the
  contracts pass) is next.
- **The build is `v0.6`** — the economy alpha track. The alpha test has not been run.
- **The studio is being reorganised** around `docs/design/STUDIO-ROSTER.md`. See the next section.

## How the studio runs

Aaron is Creative Director: he owns the vision and makes the final call. Specialists bring him
decisions, not conclusions. The roster is `docs/design/STUDIO-ROSTER.md`, and its three rules
bind: every file has exactly one owning role; whoever makes a thing never approves it; a role is
a job description, not a person.

The main session is the **Conductor**. It hands out work, collects results and enforces the
approval steps. Specialists cannot call other specialists, so all dispatch goes through it.

**The roster is being adopted one role at a time, when a job needs one** — not all at once. Until
a role has its own definition file, the main session does that job itself and says so.

> **OPEN — Aaron's to answer:** the roster says Aaron approves every phase gate, and also that the
> Lead Game Designer approves the technical design. Is the Lead Game Designer's check a step before
> Aaron's sign-off, or a replacement for it?

**Every specialist's instructions start with the hard rules below.** They have full access to the
project and will otherwise be helpful in ways that break things.

## At the start of every session, in this project

In addition to `/resume`:

1. **Check Hog Wild Mode on the Control Board** (below).
2. **Read the Sector Wiring page's saved links** — what Aaron draws there is design input, the
   same as a note on the Control Board. Its address is in `docs/control-board/BOARD-URL.md`.

## Where things are

| | |
|---|---|
| Control Board | address in `docs/control-board/BOARD-URL.md` |
| Current handoff | newest file in `docs/handoffs/` |
| What the game **does** today | `DESIGN.md` — the source of truth for behaviour |
| What the game **will be** | `docs/design/GDD.md` and its nineteen satellites in `docs/design/` |
| The game's voice | `docs/design/TONE.md` |
| Stage 3 | `docs/technical/` — the plan, the ledger, the triage, the measurements, the first-order register, the architect brief |
| The economy brief | `docs/spec/` — authoritative; **may not be modified without Aaron's permission** |
| Every tuning number | `js/tunables.js` (values can be overridden from `content/tunables.json`) |
| Known defects | `docs/deferred.md` |
| Ideas for later | `docs/FUTURE-IDEAS.md` |
| Hog Wild Mode | `docs/HOGWILD.md` (the rules) and `docs/HOGWILD-LOG.md` (the trail) |
| Versions | `docs/VERSIONING.md` |
| How to run it | `README.md` |

## Hard rules

### Aaron's most recent word wins

- **When Aaron says something that changes an earlier ruling, the new statement is the source of truth.**
  An older document, decision or design text that disagrees with it is out of date, not a reason to
  push back. Never tell him "that's not accurate, the document says otherwise."
- **You may flag the conflict once, as information:** *"This replaces what you ruled on <date> — X. I'll
  mark that superseded."* If he confirms, or has plainly meant it, that is the end of it.
- **Mark the old version superseded in the same session**, with a dated `DECISIONS.md` entry that says
  what changed and in his words. Never delete the old text — history is kept; it just stops being the
  rule. A change recorded only in conversation will be contradicted by the next session that reads the
  stale document.
- **This is about what the game is meant to be.** What the code currently *does* is still described by
  `DESIGN.md`, and a difference between the two is a job to build, not a disagreement.

### How work is done

- **Hog Wild Mode.** It is a standing permission on the Control Board. When it is on: keep building
  without stopping to ask, use as many parallel specialists as the work needs, and answer the
  questions that would otherwise become cards — but write every one into `docs/HOGWILD-LOG.md` as it
  happens, with the question, why you could not answer it, what you did instead, and the command
  that undoes it. **Every stage gets a `stage/<name>` git tag.** Read `docs/HOGWILD.md` before
  acting on it: it lists five things the mode does not unlock and four cases where you stop anyway.
- **`DESIGN.md` is the source of truth for what the game does.** If behaviour changes, it changes in
  the same commit. If it disagrees with any other document, `DESIGN.md` is right and the other is a
  bug.
- **Tests run in the browser, and only there.** Start `python server.py`, open
  `http://localhost:8000/tests/run.html`. All green is the bar before anything is called finished.
  **Never use `node --test`: it reports green without running a single check** (D243, defect 45).
- **Every design and technical document ends with traced scenarios** — the situations it must be
  able to narrate, walked step by step (D232). Tracing has found contradictions in every document
  that the rulings alone missed. A trace that goes smoothly first time has not been pushed hard enough.
- **Open questions live at the end of the document that owns them**, and nowhere else. Never
  reassemble the list from memory.
- **During stage 3, a finding that would force later work to be redone goes into
  `docs/technical/FIRST-ORDER.md` the moment it is found.** A fault found while writing the
  specification is an input to it, not a reason to stop and ask (D254).
- **Read `docs/design/TONE.md` before writing anything the player reads.**
- **Any prompt text sent to a language model lives in `prompts/` as a file**, never in code.

### How the game is built

- **Every number the model uses is a named tunable in the one tuning file**, never a literal in code.
  Aaron must be able to change a value, reload and see the effect without anyone's help. Never create
  a second tuning file (D162).
- **Determinism is non-negotiable.** The same seed reproduces a run exactly. It is tested; keep it so.
- **Economy mode is a set of flags, not a fork.** The full game stays untouched by work on it.
- **The Control Board never drives the game.** It is where Aaron reads progress and answers
  decisions. Every testing control — step a turn, fast-forward, force figures, choose a seed —
  belongs to the game's own developer dashboard behind the dev flag (D162). Do not re-raise this.

### Settled facts that sessions keep getting wrong

- **One turn is one quarter. The game opens on 1 March 2036** (D163) **and ends in 2086, after
  200 turns** (D223).
- **A turn is a round:** sixty-one nation-slots in a shuffled order, then the world advances once.
  **There is no action budget** (D218) — the limits are money, time and geography.
- **Deal durations are 20, 30, 40, 50 and 100 turns.** Signing a long agreement should cost
  something, and today it costs nothing (D233).
- **Politics is three axes and ten positions** (D231): economy, morals, power, each −1 to +1; eight
  corner parties plus two centrists. `GDD.md` §15.1 is the authority. **The code still runs the old
  six ideologies on two axes** — when reading a formula, check which one it is on.
- **The alpha's content scope is in `GDD.md` §9** (D239): the Texas area, the Great Lakes and the West.

### Who decides what

- **Every number in stage 3 is the architect's, not the designer's.**
- **What gets built first, and what gets cut, is Aaron's.** A document supplies evidence — what a
  thing depends on and what it costs. It does not rank, recommend or cut.
- **The design documents split; they never merge** (D230). A document is sized for what it will be
  after playtesting, not for today. `missions-design.md` is the first that will split, when a fourth
  mission tree arrives. Do not split early.

### Versions

`docs/VERSIONING.md` is binding. The middle number moves when something new exists (`v0.2`), the
last number when the same thing is fixed (`v0.2.1`). Tag on `master`, only a verified state, one
alpha bump per roadmap stage. Published tags are never moved or deleted.

The `main` branch is the built copy playtesters open — an output, not a place work happens. Do
not delete it.

### Carried from the economy brief and its Addendum A (the work built as `v0.2`–`v0.6`)

- The brief's phases run on checkpoints: none skipped, none merged, and each waits for Aaron's
  written approval — except A0–A4, which he waived. When the brief is ambiguous, stop and ask.
- A1 and A2 build on the existing economy and do not change demand, supply or price.
- Nothing is tuned: tolls, durations and caps keep placeholder values.
- Canada and Mexico are geography, not nations. A bordering state may route through them at a flat
  10% toll, a cost rather than a payment. Great Lakes ports reach the world market only through
  Canada; ocean ports reach it directly.
- The recognition trade block stays (D166).
- Economy mode is a sandbox with no win condition, and testers are told so.
- The five-nation prediction exercise is struck.

## Where this project departs from the standard layout

- **The code lives in `js/`, `css/` and at the root**, not `src/`. The browser loads it directly as
  plain script files; moving it would break every path for no gain.
- **`build/` holds the offline Python scripts** that bake the map and economy data, in place of
  `scripts/`.
