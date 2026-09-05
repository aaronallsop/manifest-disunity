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

- **`DESIGN.md` is the source of truth for what the game does.** If behaviour changes, it changes
  in the same commit. If `DESIGN.md` and any other document disagree, `DESIGN.md` is right and the
  other is a bug.
- **Every number the model uses is a named tunable in the tuning file, never a literal in code.**
  Aaron must be able to change a value, reload, and see the effect without a rebuild and without you.
- **Determinism is non-negotiable.** The same seed must reproduce a run exactly. It is tested; keep
  it that way.
- **The full game must stay untouched by work on the stripped-back Economy mode.** Economy mode is
  a set of flags, not a fork. All tests green is the bar before anything is called finished.
- **The economy brief runs on checkpoints.** No phase is skipped, no two phases are merged, and
  nothing in a later phase starts until Aaron has verified the previous one on the Control Board in
  writing. When something in the brief is ambiguous, stop and ask — do not pick something reasonable
  and carry on.
- **The Control Board never drives the game.** It is where Aaron reads progress and answers
  decisions. It cannot reach a running game and must not be built to try. Every testing control —
  step a turn, fast-forward, force a state's figures, run the simulation, choose a seed — belongs to
  the game's own developer dashboard behind the dev flag. The economy brief says otherwise in its
  Phase 0; the brief is wrong on this point and Aaron has ruled so (D162). Do not re-raise it.
- **One turn is one quarter, and the game opens on 1 March 2036** — the eve of two hundred years
  since Texas declared itself a nation. The month was ruled and then reversed once the cost was
  priced: every rate in the engine is tuned per quarter and the label buys flavour only (D163). Deal
  durations are 2 / 4 / 8 / 20 turns. A future sub-turn design would give both clocks — see
  `docs/FUTURE-IDEAS.md` F1 — and today's choice is its outer clock, so nothing is foreclosed.
- **There is one tuning file.** Every model constant the economy needs joins the constants already
  there. Never create a second tuning file (D162).

## Versions

`docs/VERSIONING.md` is the scheme and it is binding. The short form: the middle number moves when
something exists that did not before (`v0.2`), the last number when the same thing is merely fixed
(`v0.2.1`). Tag on `master`, never on the playtest branch. Tag only a verified state. One alpha bump
per economy phase, and only after Aaron has approved that phase's checkpoint on the Control Board.
Published tags are never moved or deleted.

Current: `v0.1` the prototype, `v0.2` Economy mode. The `main` branch is a built copy for the browser
that playtesters open — an output, not a place work happens. Do not delete it.

## Where this project departs from the standard layout, and why

- The code lives in `js/`, `css/` and at the root rather than in `src/`. It is loaded directly by
  the browser as plain script files; moving it would break every path in the page for no gain.
- There is no `prompts/` folder because nothing here talks to a language model.
- `build/` holds the offline Python scripts that bake the map and economy data, and serves the role
  `scripts/` does elsewhere.

## Definition of done for the current phase

**Phase 0 of the economy brief — instruments and time. No economic logic.**

Done means Aaron can, on the Control Board: see a turn counter showing a date where one turn is one
month; select any state and read its supply, demand, ratio and band per resource with the top three
contributors to each; change a value in the tuning file, reload, and see behaviour change without a
rebuild; run one hundred turns without the screen in under sixty seconds and open the result in a
spreadsheet; and get identical results from the same seed twice.

Before building any of it, report which parts already exist in the game, so nothing is paid for twice.
