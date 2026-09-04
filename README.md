# Nation States

A browser strategy game about the fragmentation and re-formation of the United States. The board
opens on a country that has already come apart: **sixty-one nations** on a real-data county map,
where fifty-one states used to be — Texas partitioned five ways, California five plus a cession
to Cascadia, and a Deseret half out of the Mormon Corridor. Movements, secession, trade and war take
it from there. (`?scenario=none` boots the fifty-one intact states instead.)

Nations remember what has been done to them, gang up on whoever frightens them, argue about whether
a breakaway is a country at all, hold elections they can lose, and lose people to whoever is a
better place to live.

**`DESIGN.md` is the single source of truth for what the game is and how it works.** This file
tells you how to run it and where things live. If the two ever disagree, `DESIGN.md` is right and
this file is a bug.

## Running it

The game loads local data with `fetch()` and writes saves back to disk, so it needs the local
server. Opening `index.html` with `file://` will not work.

```bash
python server.py
```

Then open <http://localhost:8000>.

`server.py` is Python standard library only — no `pip install`, no Node. It serves the repo as
static files and adds the endpoints the game needs to persist state:

| | |
|---|---|
| `GET/PUT/DELETE /api/state` | `data/state.json`, the live game |
| `GET/PUT /api/content/<name>.json` | authored content and named saves |

Append `?dev=1` to the URL for the developer controls (currently a manual world-step button).

## Tests

```bash
python server.py
```

Then open <http://localhost:8000/tests/run.html>. All green is the bar.

The tests are plain ES modules with no dependencies, written so the same files run under
`node --test` unchanged if Node ever appears on this machine. `tests/harness.js` is the whole
framework.

## Layout

```
index.html              markup + script tags
server.py               local server: static files + the state/content write API
css/style.css           styling

js/rng.js               seeded PRNG with named streams (ESM)
js/tunables.js          TUNE: every model constant, named, with a slider range (ESM)
js/geo-ct.js            the one place Connecticut's obsolete counties are normalised (ESM)
js/boot-globals.js      bridges the ESM modules onto window for the legacy files (ESM)

js/game.js              the model: Areas, nations, ownership, treasury, adjacency
js/state.js             the columnar Area state: one typed array per field (ESM)
js/graph.js             the CSR adjacency graph (ESM)
js/world.js             the world turn: every phase, in order
js/power.js             the five power stocks and their Why records (ESM)
js/moves.js             every action as plan/resolve — the rules the AI and the UI share
js/ai.js                the other fifty nations
js/civilwar.js          civil-war resolution (pure math)
js/market.js            the six-sector resource market
js/movements.js         emergent regional movements
js/sentiment.js         how much an Area wants to leave, and why
js/migration.js         people move along the quality-of-life gradient
js/military.js          force as an allocation: garrison / border / field
js/projection.js        how far a nation can act, off the transport network
js/relations.js         what nations remember about each other
js/coalitions.js        who the continent is ganging up on, and why
js/recognition.js       whether anybody admits a new state exists
js/elections.js         a nation losing its own government
js/leaders.js           who is in charge, and what they are like
js/events.js            authored crises with real trade-offs
js/victory.js           the three ways to win
js/factions.js          who you can play, and how hard it is
js/history.js           the map at every turn it has been
js/identity.js          what a new country calls itself, and its flag
js/ledger.js            every event, and the terms that caused it
js/turns.js             turn order
js/actions.js           the action UI: selection, previews, the trade screens
js/app.js               d3 map, panels, boot
js/colors.js            nation colours
js/leaderboard.js       the ranked nation list
js/mapmodes.js          map colouring modes
js/statedoc.js          the save document: assemble / validate / applyModel (ESM)
js/saves.js             save/load transport (format v2)
js/sim.js               the headless simulator
js/editor.js            the 3-tier map-mode editor

data/                   baked game data (committed) + state.json (not)
content/                authored content: tunables, saves
build/                  the offline Python bakes that produce data/
tests/                  the test harness and suites
docs/                   the rebuild plan, the code review, progress and decisions
```

## The data

Everything the map knows is baked offline by the scripts in `build/` from real sources:

- **Population** — U.S. Census Bureau, 2024 county population estimates
- **GDP** — U.S. Bureau of Economic Analysis, 2024 county GDP, all-industry, current dollars
- **Politics** — 2024 U.S. presidential vote share by county
- **Geography** — county adjacency, ports, navigable waterways, Class-I rail, interstates, border
  crossings and hand-authored choke points

Connecticut's eight counties were abolished in 2022; the map uses the nine planning regions that
replaced them, fetched from TIGERweb. See `js/geo-ct.js` for why that is more work than it sounds.

`build/raw/` holds ~376 MB of download caches and is not committed —
`build/raw/README.md` lists every artifact, its source URL and how to fetch it again.

## Where the work is tracked

- `DESIGN.md` — what the game is, now
- `docs/REBUILD-PLAN.md` — the milestone plan being worked through
- `docs/PROGRESS.md` — which tasks are done
- `docs/DECISIONS.md` — every judgment call and its reason
- `docs/CODE-REVIEW.md` and `docs/CODE-REVIEW-FINDINGS.md` — the review the plan came from
