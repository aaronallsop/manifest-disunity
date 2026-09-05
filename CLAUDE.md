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
