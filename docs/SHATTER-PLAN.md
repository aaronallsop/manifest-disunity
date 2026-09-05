# The Shattering — M8

**Paste this whole file into a new Claude Code chat in `C:\Users\aaron\Nation States` and work
through it in order.** Every task ends with the tests green. The dependency order is real: M8.1 and
M8.2 are prerequisites the later tasks silently corrupt without, and the boot-sequence contract in
§1 is load-bearing — five of the nastiest traps below are ordering bugs.

Companion documents:
- `DESIGN.md` — what the game is today. This milestone changes §1's opening premise; the M8 close
  rewrites the affected sections, same as every milestone before it.
- `DECISIONS.md` — append the decisions in §2 as D-entries when they are implemented.
- The Union Audit (consulting review, 2026-08-30) — its roadmap M8–M13 renumbers to M9–M14; this
  milestone goes first because it changes the opening board every later measurement runs on.

---

## 0. What this milestone is

The game's story is that the United States has already come apart — but the board opens as 51
intact states, which is the *moment before* the story. M8 makes the opening board tell it:

- **Texas is gone.** Five successor nations partition its 104 Areas along the authored cultural
  leaves: **Dallas**, **Houston**, **El Paso**, **Austin**, and **San Antonio** (the San Antonio +
  Hidalgo leaves together).
- **California is gone.** Five successors plus a cession: **Los Angeles** (one Area), the
  **Bay Area** (nine authored counties), **Riverside** (three), **SoCal** (the SoCal leaf minus LA
  and Riverside), **Northern California** (the NorCal leaf minus the Bay Area) — and the nine
  Areas of the Cascadia cultural sub-region become the founding ground of a **Cascadia** nation.
- **Deseret is half-born.** At setup, a seeded RNG decides which Mormon Corridor Areas cede to a
  new **Deseret** nation (the Wasatch Front always goes). The corridor Areas that *didn't* cede
  carry elevated Deseret sentiment that grows faster than any other movement — the unfinished
  secession is the region's live story.
- **The Cascadian and State of Jefferson movements get larger homelands**, baked.

The opening roster goes 51 → **~61 nations** (60 fixed + Deseret; Utah and the other corridor
states survive as rumps of whatever didn't cede).

### The successor board, from the shipped data

Computed from `content/cultural.json` + `data/game-data.json` (2024 figures). The six Texas leaves
partition all 104 TX Areas exactly once the 9 Oklahoma-FIPS strays are filtered out (Dallas leaf
holds 8, El Paso leaf 1 — **the leaf lists must be filtered to `st === '48'`**). The three CA
leaves partition all 58 CA Areas.

| Nation | Areas | Pop | GDP | Lean R–D | Seat (authored) |
| --- | ---: | ---: | ---: | --- | --- |
| Dallas | 22 | 9.02M | $848B | 54.6–43.8 | Dallas Co `48113` |
| Houston | 32 | 9.69M | $881B | 57.0–41.6 | Harris Co `48201` |
| El Paso | 16 | 2.37M | $188B | 63.9–35.1 | El Paso Co `48141` |
| Austin | 13 | 3.54M | $326B | 45.7–52.8 | Travis Co `48453` |
| San Antonio | 21 | 5.17M | $313B | 53.7–45.4 | Bexar Co `48029` |
| Los Angeles | 1 | 9.76M | $1,003B | 31.9–64.8 | LA Co `06037` |
| Bay Area | 9 | 7.65M | $1,332B | 24.7–71.6 | San Francisco `06075` |
| Riverside | 3 | 4.93M | $286B | 49.5–47.8 | Riverside Co `06065` |
| SoCal | 6 | 8.95M | $882B | 44.0–53.0 | San Diego Co `06073` |
| Northern California | 30 | 7.56M | $513B | 46.5–50.5 | Sacramento Co `06067` |
| Cascadia | 9 | 0.59M | $33B | 53.7–43.0 | Humboldt Co `06023` |
| Deseret (expected) | ~31 of 57 | ~3.9M | — | — | Salt Lake Co `49035` |

> **Correction, M8.4 (2026-08-31): the five Texan population and GDP figures above are wrong.**
> They were computed by summing only each Area's *representative* county and dropping the members
> the Area merge folded into it — the M1.13 trap one level up — so they understate every Texan
> successor and lose 1.5M people between them. California's rows are unaffected, because California
> has 58 counties and 58 Areas and nothing is merged. The real figures, which sum to Texas's own
> 31.29M: **Dallas 9.34M / $868B**, **Houston 10.07M / $904B**, **El Paso 2.79M / $308B**,
> **Austin 3.69M / $344B**, **San Antonio 5.40M / $347B**. The Area counts are exactly as stated.
> `tests/scenario.test.js` asserts the real ones.

Fixed lists: Bay Area = `06041 06097 06055 06095 06013 06001 06085 06081 06075`; Riverside =
`06065 06025 06071`; the CA Cascadia belt = `06015 06023 06035 06045 06049 06089 06093 06103 06105`
(Del Norte, Humboldt, Lassen, Mendocino, Modoc, Shasta, Siskiyou, Tehama, Trinity). Seats resolve
through `Game.areaIdOf` at load — Texas Areas are merged, and a raw FIPS lookup is the M1.13 trap.

**Two deliberate dramas fall out of the data — keep them.** The CA belt handed to Cascadia is the
State of Jefferson movement's heartland (its core is Humboldt + Shasta): a green government over
red-leaning ground, born with its own secession problem. And Austin is the only blue Texan
successor *and* holds the old Texas seat — the neighbours it just divorced surround it.

### Mormon Corridor reference (57 Areas, 7 states)

| Sub-region | Areas | Pop | States | Cede chance |
| --- | ---: | ---: | --- | ---: |
| Wasatch Front | 10 | 2.87M | UT, ID | always |
| Zion | 6 | 0.77M | UT, AZ | 0.70 |
| Bonneville | 10 | 0.24M | UT, NV | 0.50 |
| Tetonia | 15 | 0.48M | ID, MT | 0.40 |
| Uintas | 16 | 0.56M | UT, CO, WY | 0.35 |

At those odds Deseret expects ~31 Areas / ~3.9M. The chances are authored numbers in the scenario
file — tune freely.

> **Tuned, M8.6 (2026-08-31).** ~31 is the expectation *before* the connectivity filter, and on a
> corridor this thin the filter is not a rounding error: rolling per Area punches holes in it, and
> about nine of every thirty-one rolled Areas end up cut off from Salt Lake. Measured over 20 seeds
> at the odds above, the cession ran 14–39 with a mean of 21.3. The shipped odds are
> **1.0 / 0.82 / 0.70 / 0.60 / 0.55**, which measures 19–45 with a mean of 31.1 Areas and 3.75M
> people — where this table says it should be.

---

## 1. The boot-sequence contract (read before writing any code)

The fact-finding pass confirmed the setup order is load-bearing. The scenario runs in **two
phases**, and both hook points matter:

```
Colors.assign → Game.init → Parties.setup (movements seeded, governments refreshed)
    → Scenario.apply(...)          ← phase A: the surgery
    → choosePlayer / faction picker  (must see the shattered roster)
    → TurnSystem.begin               (successors must already exist or they never act)
    → World.begin                    (stocks + History turn-0 frame see the shattered board;
                                      World.begin calls Recognition.reset() — world.js:841)
    → Scenario.afterBegin(...)     ← phase B: recognition + relations authoring
```

Why each line is where it is:
- **After Parties.setup**: movements must exist so phase A can wire `rec.nation` (below) and seed
  corridor shares.
- **Before TurnSystem.begin**: `createNation` does not touch the turn order; every existing birth
  site calls `TurnSystem.insertAfter` itself. Born before `begin`, successors are simply in the
  shuffled opening order (turns.js:44-124).
- **Before World.begin**: stocks open *at target* on what they see, and `History.capture(0)` takes
  the timeline's turn-0 frame — run the split later and the timeline opens on an intact Texas.
- **Governments before World.begin**: a null `gov.rulingIdeology` at stock time means "a country
  nobody governs" in the polls, spurious alignment in Victory, and an unweighted leader draw.
- **Recognition strictly after World.begin**: `World.begin` wipes the granted matrix *and* the
  origins map. Anything phase A writes there vanishes (world.js:841, recognition.js:47).

The same two hooks go into **all three world-construction sites** — `js/app.js:120-146`,
`js/sim.js:137-149` (behind `opts.scenario`), `tests/world-fixture.js:85-100` (behind an opts flag,
**default off**) — and `js/scenario.js` gets a script tag in `index.html`, `tests/run.html`, and
`dev.html` (no bundler; omission fails as `Scenario is not defined` only on the path you forgot).
Pass the scenario everything explicitly (`raw.culture`, rng, tune): `MapModes.getCulture()` is
null headless, and `attrs.culture` only carries the region-level name, so the applier reads the
cultural doc's `assign` table directly.

---

## 2. Decisions settled up front

Append these to `DECISIONS.md` as they land; flag disagreement before implementing, not after.

- **D-M8a — The scenario is authored content, applied by one DOM-free module.**
  `content/scenario-shattered.json` (nations, seats, cession rules, sentiment boosts, relations
  seeds) + `js/scenario.js` (`apply` / `afterBegin`, pattern of `js/statedoc.js`). The baseline
  51-state boot remains reachable: `?scenario=none` in the URL, `opts.scenario` in Sim, default-off
  in the fixture. **Default game = shattered.** The 785 existing tests keep booting baseline —
  they pin `Game.nations.size === 51`, 51 seats, and `'48'`/`'06'` as live nations
  (invariants.test.js:22-24, victory.test.js:25-48) and stay meaningful as the model's baseline.
- **D-M8b — Successors are founding states; Deseret is a declared breakaway.** The eleven Texan /
  Californian successors and Cascadia get `origin: true` — recognised by construction
  (recognition.js:80), no honeymoon, no parent; the dissolution settled before turn 0. Deseret is
  `origin: false` with `Recognition.founded(id, '49', {recognised: false})` authored in phase B:
  a pariah earning recognition in play, whose parent's signature (Utah's) is the key that unlocks
  the continent — the game's best mechanic, now on the board from turn 0. Deseret gets the
  honeymoon Authority term but **not** the 12% transition GDP cut (`applyIndependence` bundles
  both — world.js:806-815 — so split the function or pass flags): the shattering predates the
  first turn, and an economy pre-damaged at setup reads as a data bug, not a story.
- **D-M8c — Home ground becomes the ground you were born with, not a state code.** `homeSt` is one
  modal state FIPS, and occupation is `area.st !== homeSt` (game.js:1501, 1185, 1792-1797). Under
  the scenario that is wrong twice: all five Texan successors share `homeSt '48'`, so Dallas
  annexing Houston pays no occupation anywhere in Texas; and a seven-state Deseret counts most of
  its own founding homeland as occupied — paying the superlinear surcharge, dragging four stocks,
  and *suppressing its own movement* on its own soil (sentiment.js:110-112). M8.1 replaces the
  check with a per-nation home set stamped at birth — the "real occupied flag" the code already
  promises itself at game.js:1173-1177.
- **D-M8d — Scenario randomness draws from a new named stream `scenario`.** Deseret's cession must
  not touch the `spawn` stream or every movement's seed reshuffles and same-seed determinism
  breaks (movements.js:92-149).
- **D-M8e — Founding grants are not conquest and not news.** `createNation(..., {reason:
  'secede'})` stays outside Power's `CONQUEST` filter (power.js:711-719 — the filter exists because
  Deseret once opened with Overreach −0.123 for "blitzing" its own founding ground). Setup writes
  **no** `declare`/`died`-kind ledger entries for the splits — Sim's `firstSecessionTurn` and
  `nationsLost` verdict cards would read every shattered run as broken (dev.html thresholds).
  Use a dedicated `scenario` ledger kind; the turn-0 newspaper renders those entries once as the
  opening edition ("The year the Union dissolved").
- **D-M8f — Movement homelands are enlarged in the bake, nowhere else.** `phaseSentiment`
  hard-deletes any share outside the baked homeland every turn (world.js:328), and runtime
  homeland edits don't survive save/load (movements.js:337-373). Deseret's homeland widens from 41
  counties to the full 57-Area corridor; Cascadia and Jefferson get their enlargements; all in
  `build_parties.py`'s authored table, then rebake. Cores re-derive themselves.
- **D-M8g — "Grows faster" is a real per-movement rate, not a bigger seed.** Seeded shares erode
  back toward the formula's target at `sent.maxFall` (world.js:349), so seeding alone cannot
  sustain elevation. M8.2 adds a per-movement rise multiplier (bake field → live record →
  `Sentiment.build` `rises[]` beside `caps[]` → multiply at world.js:349) plus a per-Area
  `attrs.sentBoost` term inside `Sentiment.target()` — attrs already round-trip in the v2 save,
  and target/explain share one implementation, so the boost shows up in the Why rows for free.
- **D-M8h — Realized movements are wired, or they declare twice.** A movement's state reads
  `realized` only when `rec.nation` names a live nation (movements.js:266). Phase A sets
  `Movements.get('Deseret').nation = <nid>` (and Cascadian Separatists → Cascadia), which both
  arms tier-1 frontier defection toward the scenario nation (world.js:764-765) and disarms
  phaseSecession founding a *second* Deseret out of the first one's territory. Both fields
  serialize already.
- **D-M8i — Treasuries are re-banked after the surgery.** `Game.init` banks the opening treasury
  before any split (game.js:403-407) and `createNation` opens at 0 — so successors would open with
  every priced action unaffordable, the exact failure the bank exists to prevent. Phase A re-runs
  the same formula per successor (`gdp × econ.startingTreasuryTurns × econ.taxRate`) and rebanks
  surviving corridor rumps.
- **D-M8j — Statewide movements are retargeted, not deleted.** "A Free Texas" (chance 0.5) and
  "California Republic" (0.5) would otherwise declare a sixth Texas out of the successors — but a
  movement to *reunify* the old state is exactly the right pressure on a shattered board. They
  stay, rebranded in type/goals as reunification movements; if either declares, the nation it
  founds is the old state trying to come back. El Paso United and Rio Grande Union spawn inside
  El Paso / San Antonio and simply become their domestic politics. *(If rebranding costs more than
  a bake-table edit, ship them unchanged and note it — the mechanics already do the right thing.)*

**Open questions for Aaron** (defaults chosen; say the word and they flip):
1. Cascadia's government: **green** (the movement that founded it — recommended; it creates the
   Jefferson drama) or red (the census plurality, calmer)?
2. Should Utah open already *refusing* to recognise Deseret with an authored grievance, or neutral
   (default: neutral — the relations board starts quiet and the player watches it sour)?
3. Successor-vs-successor opening memories (a back-dated `seceded`/`lost` web among the Texan five,
   say) — authored, or left to emerge? Default: **none authored** except the corridor states'
   `lost` entries toward Deseret, which coalitions need to be honest.

---

## 3. The tasks

### M8.1 — Home ground: a set, not a state *(prerequisite; touches nothing scenario-specific)*

Replace the `c.st !== n.homeSt` occupation test with per-nation home ground stamped at birth.
Origin states: home = every Area of their state (behaviour identical to today — prove it).
Nations born in play: home = founding grant. Annexed ground is never home; nothing un-occupies by
age. Keep `homeSt` as a display/serialization fact (labels, modal state), but no rule reads it.
Consult sites: game.js:1179-1188 (occupiedCount), 1493-1504 (treasury surcharge), 1792-1797
(isOccupied); ai.js:169-176; actions.js:989-993; app.js:1867; projection.js:99-108 (seat lookup —
M8.3 adds the per-nation seat ahead of it). Wire the new column/set through serialization
properly — and do it by finally making `Game.serialize` iterate the FIELDS registry / a
STATEFUL-enumerated path rather than hand-enumerating (the audit found `state.saved()` is only
called by tests), so the new field *cannot* be silently dropped.

**Accept:** all 785 baseline tests green; a 20-turn baseline sim's per-nation occupied counts and
treasury flows are bit-identical before/after (same seed — this is a pure refactor on the baseline
board); new unit tests: a play-born nation spanning two states pays no occupation on founding
ground, and pays it on ground annexed later.

> **Prompt:** In `js/game.js`, generalize home ground per D-M8c of docs/SHATTER-PLAN.md: add a
> per-nation home-ground set stamped at nation creation (origin states: all Areas of their state;
> createNation: the founding countyIds), consulted by occupiedCount, treasuryFlow's occupation
> surcharge, and isOccupied; keep homeSt for display only. Serialize it via the registry-driven
> path (wire Game.serialize through the FIELDS/AreaState.saved() mechanism at the same time).
> Update the read sites in ai.js, actions.js, app.js. Prove baseline equivalence: same-seed
> 20-turn sim, occupied counts and treasuries identical before/after; add the two-state-birth
> unit tests. All existing tests stay green.

### M8.2 — The bake: homelands and the growth rate

In `build/build_parties.py`: widen **Deseret** to the 57-Area corridor; enlarge **Cascadian
Separatists** (add the full wet-side plus whatever of the belt is missing) and **State of
Jefferson** (the 9-county CA belt plus the southern-Oregon tier — Josephine, Curry, Klamath,
Lake, Douglas, Jackson); add a per-movement `growthRate` field (default 1.0; Deseret 1.5).
Rebake; cores re-derive. Plumb `growthRate` bake → defs → live record → `Sentiment.build`
`rises[]` → the world.js:349 rise cap. Update the pinned tests knowingly: the 32-movement count
(movements.test.js:35), the zero-orphan homeland pin (parties.test.js:218), the raw-lookup <60%
heuristic (parties.test.js:38), the deterministic-spawn list — each with a dated reason, the
house rule.

**Accept:** `build/validate.py` clean; parties suite green with updated pins; a 60-turn baseline
sim shows Deseret's spread reaching the widened homeland and no other movement's trajectory
moved by more than noise (`growthRate` 1.0 elsewhere — assert one unchanged reference movement).

> **Prompt:** Per D-M8f/D-M8g of docs/SHATTER-PLAN.md: widen Deseret's homeland to the full
> 57-Area Mormon Corridor, enlarge Cascadian Separatists and State of Jefferson as specified, and
> add a per-movement growthRate (default 1.0, Deseret 1.5) in build/build_parties.py; rebake
> data/parties.json. Plumb growthRate through Movements to Sentiment.build as a rises[] array
> multiplying sent.maxRise at the world.js:349 site. Update the four pinned tests with dated
> reasons. Run build/validate.py and the full suite; measure the 60-turn Deseret spread before
> and after and record both numbers in the test.

### M8.3 — The scenario engine

`js/scenario.js` (DOM-free; `apply(opts)` + `afterBegin(opts)`) + `content/scenario-shattered.json`
+ wiring per §1 into app.js, sim.js (with a dev.html control), world-fixture (default off), the
three script tags, and `?scenario=` beside `?fresh`. The applier: reads the cultural doc's assign
table directly; validates each authored nation's Area list (exists, owned by the state being
dissolved, exact partition — leftover or double-claim is a thrown error naming the FIPS);
`createNation(name, areas, {reason:'secede', founded:0, color})` + `origin:true` + authored seat;
`Game.refreshGovernments()` once, then authored government overrides; re-bank treasuries
(D-M8i); movement wiring (D-M8h); `originalNationCount` set to the post-scenario roster;
`scenario`-kind ledger entries (D-M8e); parents die by running out of ground, which is correct.
Per-nation seats: scenario stores `seat` on the nation, `Projection.sources` consults it ahead of
`Victory.all()[homeSt]` (projection.js:102); Victory's 51-seat table is untouched.

**Accept:** shattered boot reaches the faction picker with ~61 nations, every successor holding a
non-null government, a treasury within 1% of the init formula, and its authored seat; baseline
boot (`?scenario=none`, fixture default) bit-identical to today; save/load round-trips a shattered
game (roster, movements wiring, home ground) with no format change beyond M8.1's.

> **Prompt:** Build js/scenario.js and content/scenario-shattered.json per §1 and D-M8a/e/h/i of
> docs/SHATTER-PLAN.md: a two-phase applier (apply before choosePlayer/TurnSystem.begin/World.begin;
> afterBegin after World.begin) wired into app.js, sim.js (opts.scenario + a dev.html toggle),
> tests/world-fixture.js (opts, default off), script tags in all three HTML files, and a
> ?scenario= URL param. apply() validates exact partitions against the cultural assign table
> (throw with the offending FIPS), creates origin:true successors with authored seats read by
> Projection ahead of the homeSt capital, refreshes then overrides governments, re-banks
> treasuries by the init formula, wires movement rec.nation links, sets originalNationCount, and
> logs scenario-kind ledger entries the newspaper renders as the turn-0 edition. No declare/died
> kinds at setup. Add tests: partition validation errors, treasury formula, baseline untouched.

### M8.4 — Texas, five ways

The scenario entry: five nations from the leaf assignments **filtered to `st === '48'`** (nine
Oklahoma strays hide in the Dallas and El Paso leaves), seats per §0, governments by plurality
(Austin lands blue, the rest red — the data already says so).

**Accept:** 104 Areas, five nations, zero leftovers; Austin holds Travis and therefore the old
Texas seat; the scenario test asserts each nation's Area count and population against §0's table.

> **Prompt:** Author the Texas partition in content/scenario-shattered.json per §0 of
> docs/SHATTER-PLAN.md: Dallas/Houston/El Paso/Austin leaves plus San Antonio = San Antonio +
> Hidalgo leaves, each filtered to st==='48', with the authored seats. Assert in
> tests/scenario.test.js: exact partition of Texas's 104 Areas, per-nation counts (22/32/16/13/21)
> and populations from the plan table, Austin owning the Travis Area.

### M8.5 — California, five ways plus a cession

LA / Bay Area / Riverside by the fixed FIPS lists in §0; SoCal and Northern California as leaf
remainders; the nine belt Areas to a new **Cascadia** nation (government per open question 1 —
default green; seat Humboldt). The Jefferson-inside-Cascadia tension is intended: with M8.2's
enlarged Jefferson homeland, Cascadia opens with an organised opposition on most of its ground.

**Accept:** 58 Areas across six recipients, zero leftovers; Cascadia's opening Civil Liberties
reflect a government its people don't lean toward (record the turn-0 number in the test);
Jefferson's movement state reads correctly on Cascadia's ground.

> **Prompt:** Author the California partition in content/scenario-shattered.json per §0 of
> docs/SHATTER-PLAN.md: LA, Bay Area, and Riverside by fixed FIPS lists, SoCal and Northern
> California as leaf remainders, and the nine Cascadia-belt Areas founding the Cascadia nation
> (green government, Humboldt seat). Wire Cascadian Separatists' rec.nation to it. Assert exact
> partition (1/9/3/6/30/9), the recorded turn-0 Cascadia liberties number, and that the Jefferson
> movement is live on Cascadia ground.

### M8.6 — Deseret: the cession

Phase A rolls the corridor on the `scenario` stream: Wasatch Front authored-in, every other
corridor Area by its sub-region's chance (§0 table, authored in the scenario file), then **keep
only the connected component containing the core** (components pattern at game.js:1033) — rolled
Areas that end up disconnected do not cede and are remembered as `leftBehind`. The nation:
`origin:false`, government yellow, seat Salt Lake, honeymoon without the GDP cut (D-M8b),
`rec.nation` wired. Phase B: `Recognition.founded(deseret, '49', {recognised:false})`; each state
that lost ground writes a back-dated `lost` relations entry toward Deseret (the closed KINDS
vocabulary, relations.js:71-83, silent grants only).

**Accept:** across 20 seeds, ceded size lands in a 20–45 Area band with the Wasatch Front always
in and always connected; Deseret opens unrecognised (legitimacy ≈ 0), pays **no occupation on its
founding ground** (M8.1's point — assert it), carries the honeymoon term, and Utah's later
recognition measurably moves the continent (re-use the 0.07→0.24 measurement pattern).

> **Prompt:** Implement the Deseret cession per D-M8b/d and §3-M8.6 of docs/SHATTER-PLAN.md:
> per-sub-region cede chances from the scenario file on a new named rng stream 'scenario',
> Wasatch Front forced, connectivity filter keeping the core's component (disconnected successes
> recorded as leftBehind, not ceded), origin:false + Recognition.founded(id,'49',
> {recognised:false}) in afterBegin, honeymoon Authority term without the transition GDP cut
> (split applyIndependence), yellow government, Salt Lake seat, movement wired. Author back-dated
> 'lost' relations from each ground-losing state. Tests: 20-seed size band, connectivity, zero
> occupation on founding ground, pariah opening, same-seed determinism of the ceded set.

### M8.7 — The corridor that stayed

Non-ceded corridor Areas (including `leftBehind`) get: a Deseret seed at an elevated share —
**stay below `secession.countyThreshold` 0.40**, or the movement mass-defects on turn 1
(movements.js:283-291 records the turn-zero Cascadia disaster this guard exists for); use the
grow-pop-then-set pattern from movements.test.js:146-164 so cleanup doesn't clamp the seed away —
plus `attrs.sentBoost` (strongest on `leftBehind` ground) read by `Sentiment.target()` as an
additive grievance-side term that shows in the explain rows. With M8.2's `growthRate` 1.5, the
corridor rises faster by mechanism, not by wish.

**Accept:** over 40 turns, mean Deseret share on non-ceded corridor ground rises measurably
faster than the best non-boosted movement's home ground (record both slopes in the assertion);
tier-1 defections flow corridor Areas into Deseret across the frontier; `Sentiment.explain` shows
the boost as a named row.

> **Prompt:** Implement the stay-behind corridor per D-M8g and §3-M8.7 of docs/SHATTER-PLAN.md:
> scenario seeds Deseret shares on non-ceded corridor Areas below the 0.40 threshold using the
> movements.test.js:146-164 pattern, sets attrs.sentBoost (higher on leftBehind Areas), and
> Sentiment.target()/explain() gain the boost term behind one new tunable. Measure and pin: the
> 40-turn slope of boosted vs unboosted movement growth, defection flow into Deseret, the boost
> visible in explain rows, and clampMovements invariants still exact.

### M8.8 — Reconciliation and the scenario suite

The sweep: rebrand A Free Texas / California Republic per D-M8j; `origin:true` successors need a
label other than "former U.S. state" (app.js:1174) — "successor state" — and authored colors in
the scenario file (generated hsl reads as minted-in-play); verify the faction picker's tier spread
over ~61 nations and that ai.js's literal `seats: 51` still matches Victory's row count; re-run
dev.html verdict baselines for the shattered board (first-secession turn now means *post-Deseret*
secession); DESIGN.md §1/§2 rewritten at the close, house rule. Then `tests/scenario.test.js`
proper: the invariants suite re-run under the shattered fixture (population conservation,
ownership/Set agreement, save round-trip, same-seed determinism), roster shape, no
double-Deseret/Cascadia over 60 turns, and a 61-nation full-round time measured against the
~137ms baseline.

**Accept:** full suite green in both modes; the measured round time recorded; a fresh shattered
boot plays 60 turns in the browser with no console errors and the opening newspaper reads as the
scenario's edition.

> **Prompt:** Close M8 per §3-M8.8 of docs/SHATTER-PLAN.md: rebrand the two statewide movements as
> reunification movements in the bake table, add the successor-state label and authored colors,
> verify picker tiers and the ai.js seats literal, rebaseline dev.html verdict cards for the
> shattered board, and write tests/scenario.test.js running the invariants suite under
> bootWorld({scenario}) plus roster shape, no-duplicate-declarations over 60 turns, and the
> 61-nation round-time measurement. Rewrite the affected DESIGN.md sections; append the D-M8
> entries to DECISIONS.md.

---

## 4. What this does to the Union Audit roadmap

Everything in the audit stands; its M8–M13 become **M9–M14** and two items get easier here:
the FIELDS-registry save wiring lands in M8.1, and the election-steal / preview-seam fixes
(audit M8, now M9) should follow immediately after this milestone — the shattered board's eleven
new governments make the dead AI-steal path and the dishonest panels *more* visible, not less.
One audit item gets more urgent: with more landlocked nations on the board (Dallas, Deseret,
Riverside), trade-as-a-Move (audit M10) is now carrying extra weight.
