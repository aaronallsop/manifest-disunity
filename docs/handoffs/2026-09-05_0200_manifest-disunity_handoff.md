# Handoff — 5 September 2026, 02:00

**State:** Phase 0 of the economy brief, three of eight items done and verified. 861 tests green.
Everything committed and pushed. Nothing is broken and nothing is half-applied.

**Read first:** `CLAUDE.md`, then `docs/spec/economy-system-spec.md` (v2 — v1 is discarded), then the
Control Board at `docs/control-board/BOARD-URL.md`. `DECISIONS.md` D161–D167 are all from this
session and carry the reasoning that is not repeated here.

---

## What happened this session

The session began before the brief existed. It ran: build Economy mode → audit the codebase against
the brief → send the audit to the consultant → receive spec v2 → start Phase 0.

**Economy mode (v0.2)** — a switch, not a fork. Two flags, `movements` and `politics`, both on by
default so the full game is untouched. Economy mode turns both off, leaving unite, annex, trade, the
market and the treasury.

**A thirteen-agent audit with adversarial verification**, run before building anything against the
brief. It paid for itself twice over: it found two of my own errors before Aaron did, and it found
that **demand is defined as a share of each state's own output, so no state can ever be short of
anything.** That would have surfaced around Phase 4, on top of three phases built over it. The
consultant rewrote the brief around the findings. Spec v2 §10 asks for the same method again before
Phase 4, and that request should be honoured.

**Spec v2 arrived and rules on everything.** The big ones: demand and goods-movement are replacements
not extensions; industry mix does NOT need to be mutable (capacity × utilisation carries the
supply-cut demonstration); Logistics stays a sector; the price index becomes the base price with deal
multipliers on top; no faction system.

---

## Phase 0: three of eight done

| Item | State |
|---|---|
| 2.1 Unblock Economy mode | **Done, verified.** |
| 2.2 Calendar | **Done, verified.** |
| 2.3 Tuning survives a load | **Done, verified end to end.** |
| 2.4 Per-state CSV export | Not started |
| 2.5 Measure determinism + speed | **Partly — see below. Do not skip the caveat.** |
| 2.6 Safe stepping / fast-forward | Not started |
| 2.7 Forcing controls | Not started |
| 2.8 Why record for the economy | Not started |

**2.1** — Economy mode was refusing trades because recognition still gated them while the politics
layer that drives recognition was switched off and its UI hidden. Fixed inside `js/recognition.js` so
no call site can miss it. **Note D166: the consultant's ruling 1.6 was wrong on its premise.**
`DESIGN.md`:833 deliberately specifies BOTH a block on bilateral deals AND a smuggler's rate on the
world market; the code implemented both correctly. The consultant should correct this in v3. The
recognition *ramp* (v2 §5.5) is a real change and stays scheduled for Phase 5.

**2.2** — `js/calendar.js`, pure, turn number in and date out. Opens March 2036; four turns to a year;
March/June/September/December. Start date and turn length are tunables, so a future sub-turn design
(FUTURE-IDEAS F1) can change them without a rebuild.

**2.3** — The real fix of the three. Tuning now has three layers: schema defaults < authored
`content/tunables.json` < deliberate overrides. Previously a save recorded everything differing from
the *schema* default, which swept the authored file in as though it were a set of choices, so
re-authoring a number could not reach a game in progress. Verified by playing, editing the file,
reloading, and watching the running game pick the new value up. Also: the dashboard showed factory
numbers while running authored ones, and its export was a clipboard copy — both fixed, the export now
writes the file and merges rather than replaces.

---

## The one thing to look at first

**2.5 is measured-but-inconclusive and it may be hiding something important.** A 50-turn headless run
takes 22.0 s and 22.2 s — the first honest speed figure this project has. But two 100-turn runs had
not finished after ten minutes, where linear cost predicts about ninety seconds for both.

Either the hidden browser tab driving them was throttled, or **the per-turn cost grows with run
length.** Nothing separates the two. If it is the second, it matters far more than the timing task it
came out of, because Phase 8 wants twenty headless runs.

**Do this first: re-run it in a foreground tab.** If the cost really is superlinear, stop and
investigate before planning any further phase. No number was published; see D167 and deferred #5.

---

## Traps this session hit, so the next one does not

1. **PowerShell `Set-Content` destroys UTF-8 files.** It double-encoded the whole Control Board and it
   was published to Aaron in that state. Now rule 1 in `docs/PROGRAMMER-RULES.md`. Worse than the bug:
   on Windows, reading a file back through a pipe shows the same mojibake whether it is corrupt or
   not, so three diagnostic attempts each concluded something different. **Compare raw bytes against
   `git show <commit>:<path>` — it is the only check that cannot lie.**

2. **The browser caches ES modules hard.** Three times a change looked broken when the browser was
   simply running the old file. `await fetch(path, {cache:'reload'})` for each changed file, then
   navigate. Symptom: a fix that is provably in the served file but absent from behaviour.

3. **This session's preview server was pinned to the old project folder** after the project moved, so
   it served a stale copy and one verification nearly passed against the wrong code. There is a
   throwaway shim at `C:\Users\aaron\Nation States\.claude\launch.json` pointing at the real
   `server.py`. **A fresh session should not need it — delete that folder if the preview works
   without it.** Use `server.py` and not `python -m http.server`: the tests need the `/api` endpoints,
   and 7 failures were traced to exactly that.

4. **Verify against the real server.** A run showing 7 failures was the harness, not the code.

---

## What is waiting on Aaron

- **Checkpoint 0**, when Phase 0 finishes. His written approval is required before Phase 1.
- **Phase 1 predictions** — which five nations self-sufficient, which five structurally short. Must be
  written before the build, and are worthless if we write them.
- **The sector-coverage card** on the board. He has said to leave the resources alone for now, so it
  is not urgent, but the game still presents invented industry figures as measured, which his own
  design document forbids. The cheap honest stopgap is labelling them.
- **v0.2 to playtesters** — the link still serves v0.1 from 3 September. Publishing changes what other
  people receive, so it needs his word.
- **The GitHub CLI is still not installed**, so the repo's private setting remains unverified.

## Housekeeping

- The old project folder `C:\Users\aaron\Nation States` is an empty directory plus the shim above. It
  can be deleted once nothing is pinned to it.
- Permissions on the Control Board: Aaron said he would tick "re-run long jobs" and "fix a failing
  check" before bed. **Read them at session start** — `read_db`, collection `settings`, doc
  `permissions` — and honour exactly what is ticked.
