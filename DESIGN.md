# Nation States — Design & Roadmap

*Consolidated reference, assembled 2026-08-29 from the project's README, source
files, and build scripts. This is the single place to look for what the game is,
what is built, and what comes next. The README stayed accurate through the
"actions + civil war" era; everything after it (Areas, economy, market, trade,
transport, emergent parties, map editor, treasuries, save/load) was built after
and is documented here for the first time.*

---

## 1. Premise

A map-based strategy game set in a scenario where **every U.S. state becomes its
own nation**. You start on a board of 51 nations built from real 2024 data —
population, GDP, and presidential vote — and play through turns of union,
annexation, civil war, politics, and economy.

Nothing is invented where real data exists. Where a figure isn't published
separately, a grounded estimate is apportioned from a real total (so nation-level
sums stay correct) and flagged in the UI with an **est.** badge.

---

## 2. Data foundation

| Layer | Source |
| --- | --- |
| Geometry | us-atlas / Census TIGER counties (`counties-10m.json`) |
| Connecticut | Current 9 planning regions from Census TIGERweb (replaces the obsolete 8 counties) |
| Population | Census Bureau 2024 estimates |
| GDP | BEA 2024 county GDP, all-industry total, current dollars |
| Politics | 2024 presidential vote share, to 0.1% |
| Adjacency | Census county adjacency file → `adjacency.json`, `county_neighbors.json` |
| Trade geography | BTS/USACE navigable waterways, principal ports, TIGER coastline → `county_trade.json` |
| Transport | BTS Class I rail network, TIGER primary/secondary roads (Interstates), border crossings → `transport.json` |

**Known estimates.** Alaska boroughs use the statewide 2024 result (Alaska reports
vote by house district, not borough). Virginia independent cities + their counties,
and Hawaii's Maui/Kalawao, split a combined BEA GDP by population.

**Everything is baked offline.** The browser never does geography at runtime — each
`build/build_*.py` script writes a JSON file into `data/`, and the game only reads.
Every build script carries an editable authored table at its top; edit and re-run.

---

## 3. Core model

- **The county is the only unit of truth.** A nation is never stored as primary
  data — it is *derived* by summing the counties it owns. Invariant enforced
  everywhere: each county's party counts sum exactly to its population.
- **The Area is the atomic clickable unit.** `build_areas.py` merges small counties
  into an adjacent same-state neighbor until each Area clears a 50k population
  threshold — east of the MT/WY/CO/NM line only; western states and AK/HI are left
  alone apart from authored merges (San Juan WA, the Aleutians cluster, Dukes +
  Nantucket → Barnstable). Member counties are preserved inside each Area, so no
  data is lost, and a **County lines** toggle reveals them.
- **Nations own Areas** and carry a color, a treasury, and a government type.
- Runtime state is one serializable object; `game_state.py` is the Python mirror of
  the same model.

---

## 4. What's built

### Map & interface
- Select **Nations** or **Counties**; hover to preview, click to select, scroll to
  zoom, drag to pan, click ocean to deselect.
- Seven map modes, each with a legend, nation borders always drawn on top:
  **Standard** (ownership) · **Political** (red→purple→blue) · **GDP** (white→green)
  · **Population** (yellow→blue) · **Geographic** · **Culture** · **Economy**.
- **Leaderboard** ranking every live nation by Population, GDP, or Politics;
  updates as nations form and dissolve; click a row to select.
- **Save / Load** — full runtime state serialized into localStorage under a
  player-chosen name, with overwrite-or-rename.

### Turns
51 nations are shuffled into a hidden 1..N order at start. Each nation takes **one
action or a pass** per turn. Splinter nations are slotted in right after their
parent in random relative order; dissolved nations drop out.

### Actions
- **🤝 Unite with nation** — propose union with an *adjacent* nation (adjacency uses
  the state graph plus the "Canadian-highway" rule: Alaska borders every Pacific and
  Canada nation, Hawaii every Pacific one). Success is probabilistic, driven by
  closeness in population + GDP and political alignment, clamped so either outcome
  is always possible. On failure your nation splinters: same-party border counties
  defect to the target, cut-off regions break away, you lose pop and GDP.
- **⚔️ Annex counties** — take bordering counties; selection grows contiguously and
  is capped at 2× your pop/GDP. You can't annex from a larger same-lean nation.
  Triggers a civil war if it flips your party or adds more GDP or population than
  you already have. Map auto-switches to Political while picking.
- **🕊️ Release counties** — *not built.* Button is present and disabled.

### Civil war
```
dice   = points past 50% into the other party, rounded up (>=1)
points = round(addedPop / 1e6) + round(addedGDP / 1e10)
score  = points × (d1 × d2 × …) × blueShell        each die 1-6

  0-33  Complete victory   — all chosen counties annexed
 34-66  Partial victory    — only same-lean counties still connected to you
  67+   The union falls apart — chosen counties break into new nations
```
The dice aren't shown; the result line reports the numbers. **Fallout:** the loser
sheds a dice-scaled slice of its ruling-party population (spread evenly across its
counties) and hands **2%+ of its GDP** to the winner.

**Blue shell (anti-snowball).** The top ~10% of nations by population are penalized
when they act — the #1 nation gets **half the annex cap** and **double** civil-war
severity, scaling down to the tier edge, plus worse peaceful-union odds.

**Breakup rule.** A nation formed by a breakup must be **≥10 counties** (smaller only
if that's all that's left); smaller fragments join whichever neighbor they border
most, never the attacker.

### World engine (`world.js`)
The world advances separately from player/AI actions, in a fixed phase order, under
strict **double buffering**: every phase reads a frozen `snap` of this turn's values
and writes into a fresh `nxt`, swapped in at the end — so no feedback loop can
compound within one turn.

1. **Recompute leans** — cache each nation's D/R/Other mix from the snapshot.
2. **Political drift** — each county eases 2% of the gap toward its *owner nation's*
   lean per turn. Moves people between parties; population unchanged.
3. **Party growth** — each emergent party closes 3% of its gap to a 35% per-county
   ceiling, taken proportionally from all other parties.
4. **Population growth** — ~1%/turn (README-era value was ~5%); new residents arrive
   in the *nation's* party mix, so annexed counties drift toward their new owner.
5. **Cleanup** — emergent parties under 1% share are removed and redistributed.
   D/R/Other are structural and never cleaned up.
6. **Treasuries tick**, then **the market reprices**.

### Emergent parties (`parties.js`, `build_parties.py`)
Regional parties spawn **once, at setup**, before play. Definitions come from an
editable region table (spawn chance default 0.5, initial county share 0–20%), with
regions resolved by state list, population band, 2024 lean, hand-picked FIPS, or
special rules (e.g. Montana interior counties).

Absorption rule: a new party at rolled share X takes X of the population **plus the
county's entire "Other" share** (Other → 0); remaining parties shrink proportionally.

Six color families; parties sharing a color form a **coalition** that pools its share:

| Color | Parties |
| --- | --- |
| red | Republican |
| orange | Christian Nationalism, New Confederacy |
| yellow | socialists / anything unlisted |
| green | Northern Christian Kingdom, Cascadian Separatists |
| blue | Democrat |
| purple | Libertarians, Anarcho-Capitalist |

Authored regions include Deseret (Utah + SE Idaho + Elko NV), El Paso United
(Trans-Pecos), Great Lakes, Absaroka, and hand-listed tech hubs.

### Economy (`build_economy.py`, `market.js`, treasuries in `game.js`)
Six sectors: **Agriculture, Resource Extraction, Manufacturing, Trade &
Transportation, Finance, Information Technology.** Each Area's GDP is split across
them by a profile chosen from layered signals, first match wins:

1. authored county profiles (real-world knowledge)
2. structural — port / choke-point counties → Trade & Transportation
3. state tilt — the characteristic rural economy of the state
4. fallback ladder by population: <50k Agriculture · 50–200k Extraction ·
   200–500k Manufacturing · 500k–1M IT · ≥1M Trade if port/major river, else Finance

**Global market.** Each world turn every resource is repriced:

```
supply_i = Σ each Area's production of i, scaled by that Area's LIVE GDP
demand_i = DEMAND_SHARE_i × live population × per-capita spend (calibrated at start)
price_i  = 100 × (demand / supply)^1.3,  clamped to 20–400
```
So war losses cut supply and push prices up; population growth pushes demand up.

**Treasuries.** Income = 2% of GDP per turn. Maintenance = a government-type rate
(Republic 1.5%, a placeholder for a fuller government system) + $40M flat upkeep per
Area. Actions draw from the treasury.

### Trade & transport geography (baked, partly surfaced)
`county_trade.json` carries navigable-river intersects and names, principal ports,
coastal vs Great Lakes shoreline, legal border crossings, and an authored set of
**choke points** (Soo Locks, Straits of Mackinac, Detroit River, and others).
`transport.json` carries Class I rail, passenger-rail hubs, Interstate routes per
county, and Canada/Mexico gateways. Both are loaded and shown in the info panel;
neither yet drives mechanics.

### Map editor (`editor.js`)
An EU4-style authoring tool for **3-tier region hierarchies** as map modes:
super-region → region → group. Each Area belongs to at most one path; painting a
child auto-assigns the parent chain, painting another branch reassigns. Paint at
state or Area granularity. Built-in **Geographical** and **Cultural** modes must
contain every Area before publishing. Drafts live in localStorage; **Publish**
downloads `<name>.mapmode.json` to drop into `data/`. Both built-in modes have been
published and are live as map modes.

---

## 5. Roadmap

**Next up**
- **Release counties** — the third action; UI exists, logic doesn't.
- **Per-nation growth rates** — `phasePopulationGrowth` currently applies one global
  rate; the code notes per-nation rates as the intended replacement.
- **Government types** — `GOV_TYPES` holds a single placeholder (Republic, 1.5%
  maintenance). A real set of governments with distinct income/maintenance/behavior
  is the obvious extension.

**Systems baked but not yet mechanical**
- **Trade** — ports, navigable rivers, choke points, coastline classification are all
  baked and displayed. No trade routes, no blockades, no choke-point control yet.
- **Transport** — rail, rail hubs, Interstates, border gateways likewise: data
  present, no movement or logistics layer consuming it.
- **Resource market** — prices move each turn but nothing yet spends against them
  (no buying, selling, shortages, or price-driven events).

**Open / unresolved**
- Turn state and saves are browser-side only (localStorage); no server, no files.
- No AI opponents — the turn order cycles through all 51 nations as player-driven
  seats.
- README is stale relative to the code; DESIGN.md (this file) is now the source of
  truth.

---

## 6. Running it

The game fetches local data, so it needs a server (`file://` is blocked):

```bash
python -m http.server 8000     # from this folder, then open http://localhost:8000
```

A VS Code launch config for this is in `.claude/launch.json` as `nation-states`.

Rebuild any baked data by editing the table at the top of the relevant script and
re-running it: `python build/build_data.py`, `build_areas.py`, `build_adjacency.py`,
`build_neighbors.py`, `build_parties.py`, `build_economy.py`, `build_trade.py`,
`build_transport.py`.

---

## 7. Code map

```
index.html              markup + script tags (cache-busted ?v= on each)
css/style.css           styling
js/colors.js            distinct color per nation
js/game.js              counties, Areas, ownership, demographics, adjacency, treasuries
js/parties.js           emergent regional parties, coalitions, spawn/absorption
js/civilwar.js          pure scoring: triggers, dice, points, outcome
js/mapmodes.js          per-county color scales + legends (political/GDP/pop/geo/culture/economy)
js/turns.js             hidden turn order, advance, splinter insertion
js/actions.js           Unite / Annex UI flows + outcome application
js/leaderboard.js       live ranking sidebar
js/world.js             world turn engine, double-buffered phases
js/market.js            global resource market pricing
js/app.js               rendering, interaction dispatch, info panel, data loading
js/saves.js             save/load to localStorage
js/editor.js            3-tier region map-mode editor
game_state.py           Python mirror of the serializable state model
build/                  one-time offline bakes (see above) + raw/ sources
data/                   all baked JSON the game reads
lib/                    vendored d3 + topojson-client (offline)
```
