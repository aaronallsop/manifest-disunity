# Decisions

Every judgment call made during the rebuild instead of asking, with the reason. Newest last.

---

### D1 — `build/raw/README.md` is committed, everything else under `build/raw/` is not
**M0.1.** `.gitignore` uses `build/raw/*` + `!build/raw/README.md` rather than `build/raw/`.
A bare directory exclusion stops git descending into the directory at all, so the negation would
never fire and the plan's requirement ("write `build/raw/README.md` listing each raw artifact")
would produce an untracked file. The `*`-plus-negation form keeps the 376 MB out and the
self-documentation in.

### D2 — `.gitattributes` normalises to LF
**M0.1.** The working tree is Windows; git warned on every one of the 48 baseline files that LF
would become CRLF. Left alone, the first `sed`/heredoc edit would produce whole-file diffs. Set
`* text=auto eol=lf` and `core.autocrlf=false` so diffs stay line-scoped for the rest of the
rebuild.

### D3 — New engine modules are ESM; the legacy IIFEs reach them through a `window` bridge
**M0.3.** `js/rng.js` and `js/tunables.js` are native ES modules so `tests/` can import them today
and `node --test` can run the same files unchanged later. The thirteen legacy files are classic
IIFE globals until M2. `js/boot-globals.js` imports the real modules and publishes them on
`window`; because `<script type="module">` is deferred it evaluates after every classic script and
before `DOMContentLoaded`, which is when `app.js:init` runs. M2 deletes the bridge.

### D4 — `TUNE` is read off the global bridge inside the legacy modules, not threaded as an argument
**M0.4.** Working rule 5 says the engine takes `(state, tune, rng)` explicitly. The legacy modules
are singleton IIFEs that already read `Game`, `Colors`, `Market` and `MapModes` as globals, so
threading one argument through them while the other four stay global would be theatre. The rule is
honoured where it can be: the pure-math surfaces — every `world.js` phase, `CivilWar.resolve`,
`Market.update`, `Market.nationSurplus` — take `tune` as a parameter and only fall back to the
global when a caller omits it. M2.5 promotes the closure into an explicit state document and the
fallback goes away.

### D5 — M0.4 is behaviour-preserving; value changes wait for the milestone that owns them
**M0.4.** Constants moved into `TUNE` at their *current* values, including `market.demandShare`,
which sums to 0.80 and is wrong (M1.8 owns the fix). Keys for future milestones (annex budget,
occupation cost, trade capacity, the drift blend) are in the schema but unread, so they change
nothing until wired. `TUNE.unreadKeys()` lists exactly what is still pending. Verified by the
opening market prices, which still match the review's measured baseline to 0.1.

### D6 — `TUNE` freezes composite values rather than copying them per read
**M0.4/M0.5.** The test suite caught `get()` handing out arrays by reference, so a caller could
mutate a tunable. Copying on every read was the obvious fix, but `get()` runs inside per-Area loops
and a six-element copy per Area per turn is ~10,000 allocations a turn for nothing. Stored arrays
and objects are cloned once on the way in and frozen; a write now throws in the module code that
would do it, instead of silently corrupting the run.

### D7 — Saves are lossless; size is handled by moving the primary store to disk
**M0.6.** Finding 51 measured a 30-round save at 536 KB and proposed rounding populations to cut it
to ~172 KB. Rounding was implemented, then reverted: it broke "a save/load round-trip reproduces
the state exactly", which is an M0.5 acceptance criterion and the substrate for replay, the M5
simulator and M2.5's state document — all worth more than 360 KB on a local disk. Size is handled
where it actually bites instead: saves go to the server first, and the `localStorage` fallback
surfaces its quota error rather than failing silently. Empty `ext`/`attrs` bags are still omitted,
which is free.

### D8 — Named saves live at `content/save-<slug>.json`; `data/state.json` mirrors the latest
**M0.6.** The M0.2 API has one `/api/state` slot and a `/api/content/<name>.json` namespace. Named
saves need many slots, so they go to content under a slug matching the endpoint's `^[a-z0-9-]+$`
validation, with the display name carried inside the document. Every save also writes
`data/state.json`, which is the document M2.5 promotes to the single source of truth.
`content/save-*.json` is gitignored — content is otherwise authored data and IS committed, but a
save game is not authored data.

### D9 — `TurnSystem.drop()` no longer touches `round`; `endTurn()` owns it
**M0.6, finding 49.** Two clocks were incrementing `round` and only one was observed, so a nation
dissolving on its own turn could pass a round boundary with no growth tick and no toast. `drop()`
now sets a `wrapped` flag and `endTurn()` consumes it, making `endTurn` the single owner.

### D10 — `Game.reset()` / `Colors.reset()` exist for the tests
**M0.5.** Every module is a singleton IIFE with private mutable state (finding 129), so the harness
cannot run two worlds; it runs one world repeatedly and needs an explicit teardown. M2.3 makes
state a value and these go away.
