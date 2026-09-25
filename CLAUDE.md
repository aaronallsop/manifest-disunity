# Manifest Disunity

## What this is, in one paragraph

A browser strategy game about the United States coming apart and being put back together. The
board opens on sixty-one nations where fifty-one states used to be, drawn on a real county map
with real population, output and voting data. Nations trade, annex, unite, secede, hold elections
and gang up on whoever frightens them. It runs as plain HTML and JavaScript with a small Python
server — no build step, no framework — and it must still work in six months. "Working" means a
playtester who has never seen it can open a link, play sixty turns, and tell you afterwards why
they lost.

This file holds only what is permanent; progress and counts live in the handoff and on the Control Board.

## Where we are — changes with the stage or step, or when a line stops being true; details in the handoff

- Stages 1 and 2, ideation and design, are closed (D216, D241): `GDD.md` plus one satellite per system (§13).
- **The road to alpha is `docs/technical/ROAD-TO-ALPHA.md`, adopted (D264): milestones M0–M11.** The GDD
  stays and the technical design is still the road: nothing new is built before its technical document is
  written and approved; the documents are written slice by slice, the contracts pass (M3) whole and first.
  `docs/technical/TDD-PLAN.md` (D248) still defines each technical document; the road sets their order.
  **M0 is under way (25 Sep):** Pluto's terminology list and his saving of Aaron's own words from the design
  sessions on Terra (a session on the PC), Rhea's board redesign, and Makemake's history
  research on Texas, Deseret and the Great Lakes, which runs alongside every milestone. The contracts pass
  waits for the terminology list. **The road, task by task, is `docs/technical/ROAD-TASKS.md`** (Rhea's;
  draft until Aaron reviews it): a task starts once what it waits for is done, not when its milestone's
  turn comes (D272). **The alpha's deadline is 31 March 2027, stretch goal 31 December 2026** (D271).
  Rhea and Pluto are hired; their role files are in `.claude/agents/`.
- **M1 is a programming session**, permitted with the road: six narrow repairs, starting with the freeze
  around turn 80–95 (defect 46). The other standing faults in `docs/deferred.md` stay filed. After M1, one
  yes from Aaron per milestone covers its build and its screening; he approves every specification and
  plays every build first.
- The build is `v0.6`, Economy mode (D173). Its test is never run on its own: its questions go into the
  first look at M2 (D264). The rest of that plan is parked, off the board on Aaron's instruction (D258).
  Here the economy alpha is always called Economy mode, and "the alpha" always means the game alpha that
  stage 3 works towards.

## How the studio runs

Aaron is the Creative Director: he owns the vision and makes the final call. Roles bring him decisions,
not conclusions. `docs/design/STUDIO-ROSTER.md` sets three rules: every file has one owning role; whoever
makes a thing never approves it; a role is a job description, not a person. Every role is named after the
solar system (D262): Aaron is the Sun, a planet leads a function, its moons are the roles under it, the
dwarf planets find things out. **Terra and Luna are his two computers, the PC and the MacBook — never roles.**

The main session is **Saturn, the Conductor**. It hands out work, collects results and enforces the gates;
a sub-agent cannot start another, so all dispatch goes through Saturn, which never writes game code or
design itself. **Naming a role does not hire it:** a role is hired when its definition file is written in
`.claude/agents/`, which happens when its first job arrives (D262); the roster lists the plan, not the
staff. So for a job whose role has no file, Saturn writes the file, then hands the job over. A role file
written mid-session is used from the next session; until then Saturn pastes it into the job. Every job
carries the current hard rules too, because a sub-agent is given this file as it stood when the session
began. The exception is running-it work, everything in Rhea's, Titan's and Janus's rows of the roster
(the plan and schedule, the board, the handoff, the decisions log and this file, saving, syncing,
combining parallel work, version tags): until they are hired Saturn does it itself, and Rhea's first job,
the board redesign at M0, is the one that hires her. Every role's instructions start with the hard rules
below and tell it to read this file from disk and the director's brief first, all of it (D260).

> Open, and Aaron's: the roster's technical-design gate is "Lead Game Designer confirms it matches the
> GDD". Is Jupiter's check a step before Aaron's sign-off, or instead of it? He has said to hold off, so
> do not raise it. Until he answers, a technical-design gate goes to Aaron, as every gate always has.

## At the start of every session, in this project

These come before `/resume` and before any of its own steps, in this order, also when a session opens by
typing `/resume …`. Where the skill says to read another session's changes and carry on, this project stops.

1. **Check that nobody else is live:** `git fetch`, `git status`, port 8000. An uncommitted change at the
   start (the Mac's `.DS_Store` files aside), a change you did not make later on, or a taken port means
   another session is working in this folder: **say so to Aaron and stop**, in Hog Wild Mode too.
2. Pull. Both computers push to one GitHub repository; if the pull brings in the other computer's
   commits from the last few hours, a session there may still be open — tell Aaron before writing.
3. Run `/resume`, which now reads the up-to-date handoff and the board's saved answers; check Hog Wild Mode.
4. Read Sector Wiring's saved links: design input, Aaron's drawing of how the six economic sectors connect.
5. Read `docs/design/DIRECTOR-BRIEF.md`, all of it (D260). Its quotations are Aaron's, word for word; its
   bold summaries, Readings and Checks are the studio's and give way to him.

## Where things are

| | |
|---|---|
| Control Board · Sector Wiring | both addresses are in `docs/control-board/BOARD-URL.md` |
| The current handoff | the newest file in `docs/handoffs/` |
| Aaron's taste | `docs/design/DIRECTOR-BRIEF.md`; the interview behind it is `docs/design/director-brief-interview.md` |
| Who does what | `docs/design/STUDIO-ROSTER.md` |
| What the game does today | `DESIGN.md` |
| What the game will be | `docs/design/GDD.md` and its satellites; read `docs/design/IDEATION-PLAN.md` before opening them |
| The game's voice | `docs/design/TONE.md` |
| The road to alpha (order and milestones) | `docs/technical/ROAD-TO-ALPHA.md` (D264) |
| Technical design | `docs/technical/`: `TDD-PLAN.md` (what each technical document is), `LEDGER.md`, `TRIAGE.md`, `MEASUREMENTS.md`, `FIRST-ORDER.md`, `ARCHITECT-BRIEF.md` |
| Decisions · lessons learned | `DECISIONS.md` (cited as D-numbers) · `docs/PROGRAMMER-RULES.md` (cited as "programmer rule N") |
| The economy brief | `docs/spec/` — **may not be modified without Aaron's permission** |
| Every tuning number | `js/tunables.js`, whose values can be overridden from `content/tunables.json` |
| Known defects · ideas for later | `docs/deferred.md` · `docs/FUTURE-IDEAS.md` |
| Hog Wild Mode | `docs/HOGWILD.md` (the rules) · `docs/HOGWILD-LOG.md` (the trail) |
| Versions · how to run it | `docs/VERSIONING.md` · `README.md` |

## Hard rules

### Aaron's most recent word wins

- **When Aaron says something that changes an earlier ruling, the new statement is the source of
  truth.** An older document, decision or design text that disagrees is out of date, not a reason to
  push back. Never tell him "that's not accurate, the document says otherwise."
- You may flag the conflict once, as information: *"This replaces what you ruled on <date> — X. I'll mark
  that superseded."* If he confirms, or has plainly meant it, that is the end of it.
- Mark the old version superseded in the same session: a dated `DECISIONS.md` entry saying what changed,
  in his words, and a dated note beside the old line. Never rewrite or delete the old line; a closed
  document is a record (D260). A change kept only in conversation will be contradicted by the next session.
- Below his latest word: on taste, the director's brief outranks every older record, `TONE.md` and
  `GDD.md` included (D260); on what the built game does, `DESIGN.md` rules.

### How Aaron's answers are read and kept

- A card approved on the Control Board with no note means the recommendation as written. Every board
  answer gets a `DECISIONS.md` entry before its card leaves the board; an answer that lives only in the
  board's database is not in the record (D258, D259).
- Record what he says word for word, removing only filler and false starts, and check it against his own
  messages before anything quoted as his is relied on. Two answers were caught altered this way (D260).
- Studio wording is never quoted as his, even where he approved it (director's brief §8, item 6).
- One word per idea. Once Pluto's terminology list exists (`docs/design/TERMINOLOGY.md`), use its word.
  A word of his that is not on it, or has two meanings, is a question, not a guess.
- His questions that do not block the work reach him three or four at a time, not as cards: the head of the
  document that owns them points to them, and they stay in its open questions at the end (TDD-PLAN §6.1).

### More than one session, more than one computer

- One live session per project, and one piece of work per session: start with the checks above, end
  with `/signoff`, then archive it. Never name a session after a planet or moon — those are roles.
- **At sign-off, rename the session** so Aaron can see at a glance which teams it touched (D265):
  `Manifest | <teams> | <the work>` — e.g. `Manifest | Design, Research | Terminology list`. Teams are
  the functions, in plain words, in order of how much each did: **Running, Intent, Design, Research,
  Build, Checking** (and **Marketing**, once it exists). Keep the work part short and concrete.
- **Sign off only if you are the only session in this folder.** If you are not, the one session Aaron
  names signs off for all; the others close read-only (no tests, commits, board or handoff) and send it
  what they know (D257).
- Re-read a file immediately before committing it (programmer rule 21): `git add` stages whatever is on
  disk, and another session may have changed it since you wrote it.
- Run the test suite with the folder to yourself (programmer rule 22). The suite writes to the project
  while it runs, so a red result while another session holds the server is unattributed, not a regression.
- Take the next number in a list — decision, rule, defect — from the file after pulling, and check it again
  just before committing (programmer rules 21–22; D256, D257). For a decision, read the last `### D`
  heading and write the entry as `### D<n> — <title>, <date>`, not in the `/decision` skill's `## D` form;
  the skill's own count reads 0 here.

### How work is done

- **Hog Wild Mode** is a standing permission on the Control Board. When it is on: keep building without
  stopping to ask, use as many parallel sub-agents as the work needs, and answer the questions that would
  become cards, logging each in `docs/HOGWILD-LOG.md` as it happens (the question, why you could not answer
  it, what you did instead, the undo command). Each stage of a Hog Wild run gets a `stage/<name>` git tag.
  Read `docs/HOGWILD.md` first: five things it does not unlock, four cases where you stop anyway.
- `DESIGN.md` is the source of truth for what the game does. If behaviour changes, it changes in the same
  commit; if it disagrees with any other document, `DESIGN.md` is right and the other is a bug. A design
  session may correct it for fact only — marked in place, dated, with its measurement (D232, D268).
- Tests run in the browser only: `python server.py` on Terra, `python3 server.py` on Luna, which has no
  `python` (preview entries `nation-states` / `nation-states-mac`), then `http://localhost:8000/tests/run.html`.
  All green is the bar before anything is called finished. **Never use `node --test`: it reports green
  without running a single check** (D243, defect 45).
- Design and technical-design sessions write documents only — no code, no data, no tuning; what they
  decide is specified for the build, not made. A technical document that finds itself redesigning a system
  stops and files a design defect against the design document (TDD-PLAN §9.2). Building a slice after T1,
  like repairing a fault, is a programming session under its own permission from Aaron (D248, D252): ask
  for it before the first slice is built.
- During stage 3, a finding that would force later work to be redone goes into `docs/technical/FIRST-ORDER.md`
  the moment it is found — only what would be redone, not what is important or broken. A fault found while
  writing a specification is an input to it, not a reason to stop and ask (D254). Aaron: *"…we are not
  building the game right now, we are building the technical design document. We can change things."*
- Every design and technical document opens with a `Depends on:` line and ends with traced scenarios,
  walked step by step (D232); a trace that goes smoothly first time has not been pushed hard enough. A
  design satellite has five parts (D217, D232), a technical one seven (TDD-PLAN §5).
- Open questions (a decision Aaron has not made) and gaps (something referenced, never specified) are
  kept apart, at the end of the document that owns them and nowhere else. Never rebuild the list from
  memory. In stage 3, each technical document first gives every gap it inherits an owner (D253).
- Read `docs/design/TONE.md` before writing anything the player reads.

### How the game is built

- **Every number the model uses is a named tunable in the one tuning file**, never a literal in code.
  Aaron must be able to change a value, reload and see the effect without a rebuild and without anyone's
  help. Never create a second tuning file (D162).
- **Determinism is non-negotiable.** The same seed reproduces a run exactly. It is tested; keep it so.
- Economy mode is a set of flags, not a fork. The full game stays untouched by work on it.
- **The Control Board never drives the game.** It is where Aaron reads progress and answers decisions;
  it cannot reach a running game. Every testing control — step a turn, fast-forward, force a state's
  figures, run the simulation, choose a seed — belongs to the developer dashboard behind the dev flag.
  The economy brief's Phase 0 says otherwise and is wrong (D162). Do not re-raise it.

### Settled facts that sessions keep getting wrong

- One turn is one quarter, and every rate in the engine is tuned per quarter. The game opens on 1 March
  2036, the eve of two hundred years since Texas declared itself a nation (D163), and ends in 2086, after
  200 turns (D223). A playtest is sixty turns, as in the paragraph at the top; both stand.
- A turn is a round: sixty-one nation-slots in a shuffled order, then the world advances once. There is no
  action budget (D218); the limits are money, time and geography. Nothing finishes in one turn, and the
  things that do are a card you click.
- Deal durations are 20, 30, 40, 50 and 100 turns. Signing a long agreement should cost something; until
  that is built, it costs nothing (D233).
- Politics is three axes (economy, morals, power, each −1 to +1) and ten positions: eight corner parties
  and two centrists (D231). Despotism and Stateless are conditions fallen into. `GDD.md` §15.1 rules; §15.1a
  records what is built. Until converted, the code runs six ideologies on two axes: check a formula's board.
- The alpha's content scope is in `GDD.md` §9 (D239): the Texas area, the Great Lakes and the West. The
  New Confederacy and Christian Nationalism movements and the Despotism state wait until after it;
  Stateless ground is in it but is not a playable nation. Cut from the alpha is not cut from the game.
- The alpha carries some real history, not a lot, built into play (D261); where it goes (the board,
  movement lines, mission names, Area panels) is still Aaron's (director's brief §9). Jokes and the
  written voice arrive in the beta (D242, D261).
- Canada and Mexico are geography, not nations or actors: bordering states route through them at a flat
  10% toll, a cost not a payment. Great Lakes ports reach the world market only through Canada.
- The recognition trade block stays (D166). Do not implement v2 ruling 1.6 or the addendum's restatement.

### Who decides what

- Whether a thing can work, and how, is the Tech Lead's (Neptune), not the designer's: every formula, limit
  and budget in stage 3, the turn's budget and clock included. Nobody on paper picks the value that makes
  the game feel right; each number gets a named tunable, a range and a measured-or-argued label, and the
  alpha chooses (TDD-PLAN §9.3). The tuning file belongs to Sinope, the Balance Designer.
- What gets built first, and what gets cut, is Aaron's. A design or technical document, and the M4 scope
  sheet, supplies evidence — what a thing depends on and what it costs. It does not rank, recommend or cut.
  A proposal Aaron asks for, like the road (D264), may recommend; he decides.
- The toll system is parked by Aaron until the economy technical document: *"Don't bring this up again
  until we are working on the economy section."* Deseret's placement was parked by the studio, not by him (D249), and comes back at M5.
- The design documents split; they never merge (D230). A document is sized for what it will be after
  playtesting. `missions-design.md` splits first, when a fourth mission tree arrives. Not early.

### Versions

`docs/VERSIONING.md` is binding. Tag on `master`, never the playtest branch, and only a verified state.
On the road the numbers are set (D264, item 7): v0.6.1 the repairs (M1), v0.7 politics and the new turn
(M6), v0.8 Texas (M7), v0.9 all three regions (M9), v0.10 the alpha candidate (M10). Tags are never moved
or deleted. The `main` branch is the built copy playtesters open; never delete it.

### Only when working on Economy mode or `docs/spec/`

The brief's phases run on checkpoints: none skipped or merged, each waiting for Aaron's written approval,
except A0–A4, which he waived. When the brief is ambiguous, stop and ask. A1 and A2 do not change demand,
supply or price, and nothing is tuned. Economy mode is a sandbox with no win condition, and testers are
told so. The rest is in `docs/spec/economy-system-spec-addendum-a.md`.

## Where this project departs from the standard layout

- The code lives in `js/`, `css/` and at the root, not `src/`: the browser loads it directly as scripts.
- `build/` holds the offline Python scripts that bake the map and economy data, in place of `scripts/`.

## Keeping this file permanent

Every session and role reads this first, so every line costs something; the rules in `~/.claude/CLAUDE.md`
apply and are not repeated. When something here changes, the decision goes in `DECISIONS.md` and this file
says the new thing. When a session changes the stage or step, "Where we are" changes in the same commit
(programmer rule 20). The old version is kept unchanged at `docs/archive/CLAUDE-until-2026-09-24.md`.
