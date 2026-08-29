# Nation States — Code Review

*2026-08-29. Full evidence in `docs/CODE-REVIEW-FINDINGS.md` (152 verified findings).
Action plan in `docs/REBUILD-PLAN.md`.*

Method: seven independent reviewers, one per dimension, each working from the actual files and
running real arithmetic against the real data; one adversarial verifier per dimension whose default
was to refute; then a completeness critic and a target-design gap analysis. 137 findings survived
verification, 15 more were added by the critic, and 27 gap entries map the design onto the code.

---

## Verdict

**Rearchitect the core (~1,200 lines of model code). Keep the shell — and the shell is the good
part.**

Not *extend*: the target design's central mechanic is movements **spreading**, and the shipping
runtime structurally cannot grow one. Not *refactor in place* either: the two things that must
change first — the Area record's shape and the singleton module state — are read by 7–8 of the 13
JS files, so "in place" is a euphemism for the same rewrite done in a worse order.

But this is a rearchitecture of the model, not of the project.

**Keep, unchanged:** all of `data/` and `build/` — the data foundation is the strongest part of
this project. The d3 map setup (`app.js:90-165`). The editor's tree/painting UX. The CSS. The panel
and leaderboard layout. And the *math* in `civilwar.js` and the world phases: the formulas are
reasonable; the two-party vocabulary and the global state they are written against are not.

---

## Scorecard

| Area | Verdict |
|---|---|
| **Data foundation** (`build/`, `data/`) | **Excellent.** Real Census/BEA/2024-vote data, county adjacency, ports, navigable rivers, rail, interstates, hand-authored choke points, CT planning regions. Better sourced than most shipped games. Marred by cross-file key drift and non-determinism, all fixable. |
| **Map client** (`app.js`, `mapmodes.js`, d3 layer) | **Good.** Clean projection, seven working map modes, an Area abstraction that mostly holds. Performance is the problem, not the design. |
| **Map editor** (`editor.js`) | **Good UX, broken loop.** It can publish but never import — there is no round trip between `data/*.mapmode.json` and the tool that made them. |
| **World engine** (`world.js`) | **Right shape, wrong content.** The snap/next phase pipeline is exactly the correct architecture. The phases inside it converge the map to uniformity, freeze GDP, and cannot spread a movement. |
| **Civil war** (`civilwar.js`) | **Structurally broken as a dice game.** Not a random variable — a step function. |
| **Actions** (`actions.js`) | **Fused to the DOM.** Every outcome is computed inside an `onclick` closure and returns nothing. |
| **Economy / market** (`market.js`) | **Decorative.** A one-way price ratchet over two economies that never reconcile. |
| **Turn system** (`turns.js`) | **Fine.** The cleanest module in the repo. |
| **Persistence** (`saves.js`) | **Partial.** 2 of 8 stateful modules serialize. |
| **Game design as shipped** | **Not yet a game.** No win condition, no lose condition, no player identity, no AI, no cost on any action. |

---

## The eight findings that decide the architecture

1. **`lean` is a binary control-flow key, not a display value.**
   `lean: dem >= gop ? 'D' : 'R'` (`game.js:87,110`) is answered with `===` by four separate game
   decisions across 8 files: does this annexation trigger a civil war, may I annex this neighbour,
   who defects in a failed union, which counties survive a partial victory. Six symmetric
   ideologies has no `===` answer — the question becomes "how far apart are these two on two axes",
   which is a different function with a threshold, everywhere.
   *Side effects today:* `applyCivilWarCost` picks the bleeding party as `d >= g` (`game.js:271`),
   so a nation whose real majority is an emergent movement bleeds the wrong population and a
   movement can never take casualties; and `demographics.lean` ignores `ext` entirely, so a nation
   that is 40% Deseret / 31% R / 29% D reports its lean as a minority party.

2. **Movements cannot spread.**
   `const names = Object.keys(s.ext); if (!names.length) continue;` (`world.js:96`). An emergent
   party can never appear in an Area that did not spawn one. `phaseCleanup` can shrink the set;
   nothing can grow it. Deseret spawns in 41 counties and is in exactly those 41 counties 200 turns
   later. There is no continuous tier for two-tier secession to build on.

3. **Every action outcome lives inside a DOM closure.**
   `Actions` exports `{isActive, start, onHover, onClick, cancel}` (`actions.js:641`). There is no
   `resolve(intent)` anywhere and no event log anywhere in `js/`. This one missing seam blocks the
   AI loop, deterministic replay, outcome tests, the explanation layer, the narrative-event system
   and the map-history timeline simultaneously.

4. **Rendering is fused to mutation.**
   `emit()` (`game.js:209`) carries no payload; `onGameChange` re-meshes the entire 3,231-geometry
   topology. One annex = 2 emits = 5 leaderboard rebuilds + 5 whole-topology merges + 3 full
   recolors + 4 panel rebuilds. 51 AI nations acting per turn does that 100+ times a round.

5. **48% of every emergent party's footprint is silently discarded at setup.**
   `Parties.setup` indexes `Game.county` by raw county FIPS (`parties.js:63-65`), but `Game.init`
   *deletes* the 1,467 counties merged into Areas (`game.js:51-64`). Measured: **2,025 of 4,198
   party-county references hit a deleted key and no-op.** El Paso United loses 83% of its footprint,
   Libertarians 79%, The Farmers Union 71%, New Confederacy 53%. Nothing warns.

6. **Annexation is free, and its cap is a multiple of your own size.**
   No treasury debit, no cooldown, no per-turn limit, no weariness (`actions.js:550-595`); cap is
   `2 × your own pop/GDP` (`actions.js:504`). `Game.spend` is exported and has **zero call sites** —
   no action in the game costs anything. Simulated from turn 0: Wyoming takes 1,167 of 1,676 Areas
   in 9 turns without triggering a single civil war; California takes 3 turns.

7. **The civil war is a step function.**
   `points()` rounds to zero for the median Area (88,948 people, $4.93B ⇒ 0 points ⇒ auto-victory
   even when triggered). `diceCount` is uncapped and the dice are **multiplied** — a real party flip
   yields 4–10 dice; at 10 dice the median product is 3.5¹⁰ ≈ 2.8×10⁵, so a 223-point war scores
   ~6×10⁷ against a 67 threshold. Even the minimum possible product still lands in `fall_apart`.
   Measured: (3 pts, 5 dice) = 1.5% / 3.0% / 95.5%.

8. **There is no player, no win, no loss.**
   `grep -rni "player\b" js/*.js` → zero hits across all 13 modules. You hot-seat all 51 seats, so
   an annexation is a transfer between two of your own accounts and every anti-snowball device is a
   speed bump you route around by taking the other nation's turn. There is no end-condition check
   anywhere, and a nation being conquered out of existence is a silent `Map.delete()`.

---

## Simulation integrity

- **Counties converge to a single mix.** Drift pulls each county toward its owner's lean; growth
  adds new residents in that same mix. Both pull toward the same attractor, nothing pushes back.
  Per-turn deviation multiplier ≈ 0.9703, **half-life 23 turns**. Within-nation stdev of dem%:
  12.5 → 2.5 by turn 50. Nations where every county shares a lean letter: 10/51 → 35/51 by turn 50.
  Since "county party majority" is factor #1 of the target sentiment model, this degenerates the
  county grid into a nation-level scalar.
- **Two growth engines on two clocks.** `growAll(0.05)` at the player round boundary (grows GDP);
  `phasePopulationGrowth(1%)` only when a human clicks *Advance world* (does not grow GDP at all,
  and `app.js:503` is its only call site). A player who never notices the button plays a static map;
  a player who does can click it 200 times during Alabama's turn.
- **GDP never changes inside `advanceTurn`.** Copied into `snap`/`next` and written straight back
  (`world.js:144,145,154`), while the comment on line 156 claims otherwise.
- **Emergent-party members never reproduce.** `phasePopulationGrowth` omits `ext` from both the
  nation totals and the growth base, so realised growth is 0.93%/turn and every movement is diluted
  toward an equilibrium of 0.278 instead of the declared 0.35.
- **Double buffering is advertised and not held.** Two of four phases read `next` written by an
  earlier phase; one reads live `Game.getOwner`.
- **No seeded RNG.** Five bare `Math.random()` sites, none in the save. A turn cannot be replayed,
  so the runaway spiral the dashboard exists to find cannot be reproduced.
- **Even-spread mutations flatten the map.** `boostGdp`, the civil-war GDP transfer, and the
  civil-war population loss all divide a total evenly across Areas. The population one also clamps
  at zero, wiping the ruling party out of hundreds of small Areas and delivering ~57% of the
  intended loss.

## Economy

Opening prices (computed from the real data): Ag 80.9 · Extraction 124.1 · Manufacturing 126.3 ·
Trade 60.4 · Finance 61.0 · IT 41.4. Reasonable. Then:

- `perCap` is calibrated once and never again; demand tracks live population while supply tracks
  frozen GDP ⇒ **every price drifts up 1.302%/turn forever** and pins at the 400 clamp around turn
  ~105. Relative prices never change, because the sector mix is fixed.
- `nationSurplus` reads **baked** `a.v` while `update` scales by **live** GDP — two economies that
  never reconcile, so tradeable volume is constant for the whole game.
- `DEMAND_SHARE` sums to **0.80**, so the UI's "100 = balanced" is wrong (balanced is 75). And it
  is declared in `app.js:630` — a *rendering* file — and read by `market.js:34`, which works only
  because of script order.
- Trade mints GDP from nothing for both sides, with no cost, cooldown, capacity or depletion. The
  **World market** option strictly dominates bilateral trade by 1.7×–50×, making the headline trade
  feature dead content. Trade income goes to GDP and never to the treasury — while 11 of 51 nations
  run a permanent structural deficit from turn 1 on the flat $40M/Area upkeep.

## Data pipeline

The strongest part of the project, with fixable integrity problems: `build_areas.py` is
non-deterministic (set-iteration tie-break changes Area IDs across identical runs); merging into the
smallest neighbour chains counties into 22-county blobs with no size cap; Hawaii's islands have no
adjacency entry at all, making Hawaii mechanically inert; Watonwan County MN has zero neighbours;
Valdez-Cordova AK is keyed as obsolete `02261` in one file and as its successors in another;
`build_neighbors.py` is a no-op once its output exists; `county_neighbors.json` comes from a
pre-2015 Census file; two builds fetch live endpoints with no cache; 350 Areas including all of AK,
CO, NM, AZ and HI can never receive an emergent party; and there is no `requirements.txt`, no
documented dependency list, and no documented build order for a pipeline that has a real DAG.

**There is no cross-file validator.** One would have caught finding 5 at build time.

## Housekeeping

Not a git repo. No `.gitignore`. **395 MB of raw download caches inside the source tree** — a naive
`git add .` commits all of it permanently. `archive-log-builder.html` is a 33 KB Final Cut Pro XML
tool sitting in the game's root, referenced by nothing. `.claude/launch.json` carries two configs
belonging to other projects, one of them broken. `README.md` is a full feature-era stale and is the
file the app's own failure message points users at. `DESIGN.md`, written to be the single source of
truth, omits the Trade action entirely. `world.js`'s docstring says the phases are stubs, directly
above 130 lines implementing them. Seven exported symbols have zero call sites.

And: Connecticut renders with its eight obsolete county borders drawn over its nine planning-region
fills, on first load, with no clicks — in exactly the place the project went to the most trouble to
get right.
