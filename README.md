# Nation States

A map-based game that simulates a scenario where **every U.S. state becomes its own nation**.

The interactive map lets you select two kinds of things:

- **Nations** — the former states, each drawn in its own color.
- **Counties** — outlined individually but filled with the color of the nation they belong to.

Selecting either opens an info panel showing:

1. **Name**
2. **Population** — U.S. Census Bureau, 2024 population estimates
3. **GDP** — U.S. Bureau of Economic Analysis, 2024 county GDP (all-industry total, current dollars)
4. **Political leaning** — 2024 U.S. presidential vote share, to the nearest tenth of a percent

## Running it

The game loads local data with `fetch()`, so it needs a local web server (opening
`index.html` directly with `file://` will be blocked by the browser).

```bash
# from this folder
python -m http.server 8000
```

Then open <http://localhost:8000> in a browser.

## How to play (so far)

- Toggle **Nations / Counties** at the top to choose what clicking selects.
- **Hover** to preview an entity, **click** to select it, **scroll** to zoom, **drag** to pan.
- Click empty ocean to deselect.

## Project layout

```
index.html            markup + script tags
css/style.css         styling
js/colors.js          assigns each nation a distinct color
js/app.js             map rendering, interaction, info panel
data/
  counties-10m.json         county + state geometry (us-atlas / Census TIGER)
  ct-planning-regions.geojson  Connecticut's current 9 regions (replaces old CT counties)
  game-data.json            baked population + GDP + 2024 vote, keyed by FIPS
build/
  build_data.py       regenerates data/game-data.json from raw sources
  raw/                raw source files (Census, BEA, election CSV)
lib/                  vendored d3 + topojson-client (works offline)
```

## Rebuilding the data

`data/game-data.json` is generated. To regenerate it (e.g. with newer figures),
place updated source files in `build/raw/` and run:

```bash
python build/build_data.py
```

## Estimated values

Every rendered unit now has a population, GDP, and political leaning — there are no
blanks. Where a figure isn't published separately, a grounded best estimate is used
and flagged in the UI with a small **est.** badge plus an explanatory note. Estimates
are apportioned from a real total, so nation-level sums stay correct.

- **Alaska boroughs — political leaning (estimated).** Alaska reports the presidential
  vote by state-house district, not by borough, so each borough shows the 2024
  *statewide* result. (Population and GDP are real.)
- **Virginia independent cities + their counties — GDP (estimated).** The BEA reports
  these as combined areas; the combined GDP is split among members by population.
- **Hawaii (Maui/Kalawao) — GDP (estimated).** Same combined-area split.

Two things were resolved with **real** data rather than estimates:

- **Connecticut** now uses the current 9 planning-region boundaries (fetched from the
  Census TIGERweb service, `data/ct-planning-regions.geojson`) instead of the obsolete
  8 counties, so its population, GDP, and vote are all real 2024 figures.
- **Alaska borough populations** were being mis-joined to same-numbered house districts
  (e.g. Anchorage showed ~7k votes); borough vote is now excluded from that join.

## Actions

Select a nation (Nations mode) to act on it. Each action is atomic: you enter it,
it resolves, and the map re-renders from the model.

- **🤝 Unite with nation** — propose union with an *adjacent* nation (adjacency uses the
  state graph plus the "Canadian-highway" rule: Alaska borders every Pacific & Canada
  nation, Hawaii every Pacific one). Success is **probabilistic**: the preview shows a
  *chance of peaceful union* driven by how close the two are in population + GDP and how
  aligned they are politically, clamped so there's always a chance either way (a much
  bigger nation usually — but not always — absorbs a smaller one; a minnow uniting a
  giant is a long shot but possible). On **failure** your nation splinters: same-party
  border counties defect to the target, cut-off regions break away, and you lose
  population + GDP.

- **⚔️ Annex counties** — take counties bordering your nation (selection grows
  contiguously and is capped at 2× your pop/GDP). You can't annex from a same-lean
  nation that's larger than you. Annexing triggers a **civil war** if it flips your
  party, or adds more GDP or population than you already have. The map auto-switches
  to the Political view while you pick.

- **🕊️ Release counties** — *coming next.*

**Blue shell (anti-snowball).** The top ~10% of nations by population are penalized when
they act: the #1 nation gets **half the annex cap** and **double** civil-war severity,
scaling down to the edge of the tier. It also lowers their odds of a peaceful union.

**Breakup rule.** A new nation formed when a nation breaks apart must be **≥10 counties**
(smaller only if that's genuinely all that's left); smaller fragments join the neighbor
they border most.

## Map modes & leaderboard

- **Map** toggle (header): **Standard** (nation colors) · **Political** (per-county
  red → purple → blue) · **GDP** (white → green) · **Population** (yellow → blue),
  each with a legend. Nation borders stay drawn on top so you can read ownership and
  the data at once.
- **Leaderboard** (left): ranks every current nation by **Population**, **GDP**, or
  **Politics**; updates live as nations form or are absorbed. Click a row to select it.

## Turns

At game start the 51 nations are shuffled into a hidden 1..N order. Play moves through
that order — each nation gets **one action (or a pass)** on its turn, shown in the turn
bar and auto-selected. Other nations can be inspected but not acted on until their turn.

When an action splinters a nation into new ones, the newborns are slotted into the turn
order **right after their parent** (in random relative order) and everyone after shifts
down; dissolved nations drop out. (Turn state is in memory; reloading reshuffles.)

### Civil war resolution

When triggered, the outcome is scored:

```
dice   = points past 50% into the other party, rounded up (>=1)
points = round(addedPop / 1e6) + round(addedGDP / 1e10)
score  = points × (d1 × d2 × …) × blueShell    each die 1-6

  0-33  Complete victory  — all chosen counties annexed
 34-66  Partial victory   — only same-lean counties still connected to you
  67+   The union falls apart — chosen counties break into new nations
                              (contiguous chunks of >=10 counties; small
                               fragments join a neighbor, never the attacker)
```

The bigger the political shift, the more dice, the sharper the risk. The dice roll
isn't shown, but the result line reports the numbers.

**Fallout.** Whichever side loses a civil war loses a slice of its **ruling-party
population** (dice-scaled, spread evenly across its counties) and hands **2%+ of its
GDP** to the winner (spread evenly across the winner's counties).

## Dynamics

Population, GDP, and politics all change over the game:

- **Growth** — at the end of each full round every nation grows ~5%. The new residents
  arrive in that *nation's* overall party mix (not each county's), so counties slowly
  drift toward their nation's leaning. GDP grows ~5% too.
- **War** — civil wars bleed population and transfer GDP (above).
- The **Political / GDP / Population** map modes, the info panels, and the leaderboard
  all read these live values.

Game state lives in memory only — reload the page to reset to the 51-nation board.

## Next steps (not built yet)

- **Release counties** (the third action).
- Save/load game state.

## Code map (actions)

```
js/game.js      mutable nations + ownership, demographics, adjacency & grouping
js/civilwar.js  pure scoring: triggers, dice, points, outcome
js/mapmodes.js  per-county color scales (political / GDP / population) + legend
js/turns.js     hidden turn order, advance, splinter insertion
js/actions.js   Unite / Annex UI flows + outcome application
js/leaderboard.js  live ranking sidebar
js/app.js       ownership-driven rendering, interaction dispatch, info panel
build/build_adjacency.py   -> data/adjacency.json (county+state neighbors)
```
