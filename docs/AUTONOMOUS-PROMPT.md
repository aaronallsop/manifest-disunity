# Autonomous rebuild prompt

Paste the block below into a new Claude Code chat opened in `C:\Users\aaron\Nation States`.

**Before you paste it:** switch Claude Code to a permissive permission mode (accept-edits or
bypass-permissions). Otherwise it will still stop to ask for tool approval on every file write,
which defeats the point.

**To resume after a session ends:** paste the exact same block again. It reads
`docs/PROGRESS.md`, finds the first unchecked task, and continues from there.

---

```
You are rebuilding the "Nation States" strategy game in this directory, autonomously, start to
finish. Work through docs/REBUILD-PLAN.md milestone by milestone, task by task, M0.1 through M7,
until it is done.

## Operating mode — read this first

DO NOT ASK ME ANYTHING. Not for clarification, not for approval, not for a design preference, not
to confirm a deletion, not to pick between two reasonable options, not at the end of a milestone.
Every decision in this project is yours to make. If two approaches are defensible, pick the one
that better serves docs/REBUILD-PLAN.md's stated architecture, write one line in DECISIONS.md
saying what you chose and why, and keep going. If something in the plan turns out to be wrong when
you meet the real code, fix the plan, note it in DECISIONS.md, and keep going. Silence from me
is not a blocker — it is the mode.

Do not stop to summarise progress and wait. Do not end a turn with a question. When you finish a
task, start the next one.

## Start here, every session

1. Read docs/REBUILD-PLAN.md in full. It is the spec.
2. Read docs/CODE-REVIEW.md for the verdict and the reasoning behind it.
3. If docs/PROGRESS.md exists, read it and resume at the first unchecked task. If it does not,
   create it from the plan's task list as a checklist (M0.1 ... M7.x) and start at M0.1.
4. Do not re-do completed tasks. Do not restart from the beginning.

## The reference you must actually use

docs/CODE-REVIEW-FINDINGS.md holds 152 verified findings with exact line numbers, measured
evidence, and a "verifier note" recording where the original claim was corrected or narrowed.
Before you write any fix, grep that file for the relevant finding id and read it — including the
verifier note. Several findings are true but narrower than their titles sound, and a few contain
corrected arithmetic. Fixing the title instead of the finding will produce the wrong patch.

## Decisions already made — do not revisit these

- JavaScript owns the game rules. Python owns the local server and the offline data bakes.
  game_state.py is deleted in M2.1. Do not port the model to Python.
- Node.js is NOT installed and you must NOT install it. Tests and the 50-turn simulator run as
  browser pages (d3 and topojson are already vendored in lib/). Write test files as plain ESM so
  they also run under `node --test` later, unchanged, if Node ever appears.
- server.py uses the Python standard library only. No pip installs. Bind 127.0.0.1 only.
- Convert to native ES modules (`<script type="module">`) during M2. That retires the hand-bumped
  `?v=` cache-busters in index.html.
- Game state lives in data/state.json, written through PUT /api/state, and is gitignored.
  Authored content lives in content/*.json and IS committed.
- Save format version bumps to 2. Old v1 saves are refused with a clear message, not migrated.
- 1 turn = 1 quarter. Default game length 80 turns.
- The six ideologies and their two-axis coordinates are given in REBUILD-PLAN M2.2. Use exactly
  those. Map the existing 2024 R -> red and D -> blue at load; distribute "Other" across the
  remaining four by region rather than leaving them at zero.
- The West vertical slice (M4) is a SCENARIO FILTER over the existing full map, not a fork, not a
  separate data set, and not a deletion of the East. The full 51-nation map must still load and
  play at every milestone.
- Keep the existing visual design. Do not redesign the CSS, the layout, or the map styling. New UI
  (dashboard, simulator, faction select, newspaper) matches what is already there.
- Author all content yourself: the ~22 faction definitions and their homelands (extend the region
  table in build/build_parties.py), difficulty tiers, starting tunable values, event/crisis text,
  nation name templates, leader traits. Do not ask me for any of it. Reasonable and consistent
  beats perfect.
- Tunable starting values: pick sensible ones, record them in content/tunables.json, and tune them
  properly with the M5 simulator. Do not stall trying to get a number right before the tool that
  measures it exists.

## Working rules

1. M0.1 (git init + .gitignore) is the first thing you do, before touching any other file. The
   .gitignore must exclude build/raw/ (395 MB), __pycache__/, *.pyc, and data/state.json BEFORE the
   first `git add`. Verify with `du -sh .git` after the first commit; if it is over 20 MB, you got
   the .gitignore wrong — fix it and redo the commit.
2. `git commit` after every numbered task, with a message naming the task (e.g. "M1.3 civil war
   scoring: sum dice, cap count, plurality-relative flip").
3. Every fix ships with a test in the M0.5 harness. The invariants are the point of the exercise.
4. No magic numbers in model code. Every constant goes in TUNE with a name.
5. The engine never touches the DOM and never reads a global. Every engine function takes
   (state, tune, rng) explicitly. This is the single constraint that buys the simulator, the
   dashboard, the tests, replay and the AI — do not compromise it for convenience.
6. Phases read `snap`, write `next`, append to the ledger, and never read what they wrote this
   turn. The current code advertises this at world.js:6-10 and violates it in two of four phases.
   Do not repeat that.
7. Never leave the repo in a broken state at a commit. If a rewrite makes something temporarily
   worse, finish it and commit the working end state, not the middle.
8. Ship a playable game at the end of every milestone. If a milestone cannot end playable, split it
   into two that can, and update docs/PROGRESS.md to match.

## Verify your own work — you have a browser, use it

After every milestone, and after any task that touches rendering or the turn loop:

1. Start the server (`preview_start` with the nation-states launch config).
2. Load the page and call `read_console_messages` with onlyErrors. Zero errors is the bar.
3. Run tests/run.html and confirm all green.
4. Drive the actual game with the browser tools — select a nation, take an action, advance a turn,
   save, reload the page, load. Confirm it behaves.
5. Take a screenshot when something visual changed.

Do not mark a task complete on the strength of "the code looks right". Load it and check.

## When something goes wrong

- A test fails: fix the cause, not the test. If the test itself is wrong, fix the test and say so
  in the commit message.
- A task is much bigger than the plan implies: split it into sub-tasks in docs/PROGRESS.md, do them
  all, and note the split in DECISIONS.md. Never abandon a milestone half-done.
- You hit something genuinely ambiguous: choose, record it in DECISIONS.md, move on.
- You break something badly: `git diff`, `git stash` or revert to the last good commit and redo the
  task differently. This is exactly why M0.1 comes first.
- You run low on context: update docs/PROGRESS.md with precise state — which task, what is done,
  what is next, what you learned that is not yet written down — commit it, and continue. That file
  is how the next session resumes without losing anything.

## Keep these three files current as you go

- docs/PROGRESS.md — the checklist, ticked as you complete tasks, with a one-line note per task.
- DECISIONS.md — every judgment call you made instead of asking me, with the reason.
- DESIGN.md — updated at the end of each milestone to describe the game as it actually is then.
  It is meant to be the single source of truth and it is currently stale in three places; do not
  let it go stale again.

Begin with M0.1 now. Work continuously through the plan. Report only when you have finished M7, or
when you are out of context and have committed a clean resume point.
```
