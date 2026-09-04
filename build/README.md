# `build/` — the offline data bakes

The browser never does geography at runtime. Every script here reads raw sources and writes a JSON
file into `data/`, and the game only reads. This file documents the **dependency order**, because
the pipeline has a real DAG and running it out of order produces files that join to nothing.

**You do not need to run any of this to play the game or run the tests.** Everything in `data/` is
committed. Re-bake only when you are deliberately changing the world.

## Dependencies

Standard library only, except the two geospatial bakes. See `requirements.txt`.

```bash
python -m pip install -r build/requirements.txt   # only for build_trade / build_transport
```

## The DAG

```
                       counties-10m.json ──┬──> build_adjacency.py ──> adjacency.json
  (raw census/BEA/vote) ──> build_data.py ─┤                                  │
                                  │        └──────────────┐                   │
                                  v                       v                   v
                            game-data.json ─────────> build_areas.py <────────┘
                                  │                       │
                                  │                       v
                                  │                  areas.json
                                  │                       │
                   ┌──────────────┼───────────────────────┤
                   v              v                       v
          build_economy.py  build_parties.py     build_trade.py / build_transport.py
                   │              │                       │
                   v              v                       v
             economy.json   parties.json     county_trade.json / transport.json
                   └──────────────┴───────────┬───────────┘
                                              v
                                        validate.py
```

**`build_parties.py` also reads `content/cultural.json`.** The Mormon Corridor and Cascadia are
authored there, in the map mode the player can see and the editor can republish, and
`cultural_leaves()` expands the named leaves back through `areas.json` into member counties. That is
one definition of a region rather than two: a leaf repainted in the editor moves the homelands that
name it on the next bake. It is the only edge in this pipeline that runs from `content/` into
`data/`, and it is deliberate.

`build_neighbors.py` sits outside the DAG: it parses the Census County Adjacency File into
`county_neighbors.json`, which feeds **only** the display-only "Neighbors" row in the county panel.
The simulation reads `adjacency.json` instead.

## Run order

```bash
# 1. The base table. Everything joins on the county FIPS it emits.
python build/build_data.py

# 2. Adjacency, from the map geometry (NOT from the Census file).
python build/build_adjacency.py

# 3. The Area merge plan. Read the warning below before running this one.
python build/build_areas.py

# 4. Anything keyed by Area id, in any order.
python build/build_economy.py
python build/build_parties.py
python build/build_trade.py        # needs geopandas
python build/build_transport.py    # needs geopandas

# 5. Display-only Census adjacency (independent of the above).
python build/build_neighbors.py --force

# 6. ALWAYS.
python build/validate.py
```

## Re-running `build_areas.py` changes Area IDs

An Area's id is the FIPS of its most-populous member county. `economy.json`, both `*.mapmode.json`
files and every save game are keyed by that id, and the runtime **deletes** the member counties
that were merged away. Change the merge plan and those keys point at nothing.

The script is deterministic — every tie-break sorts, and five runs under different
`PYTHONHASHSEED` values produce byte-identical output. It was not: the candidate neighbours were
held in a `set`, and CPython randomises string hashing per process, so identical inputs produced
different Area IDs across runs.

If you do change `THRESHOLD` or `MAX_MEMBERS`:

```bash
python build/build_areas.py --out /tmp/areas.json   # write elsewhere and diff first
```

then re-run steps 4–6, and expect to repaint any Areas the map-mode editor no longer covers.

## `validate.py`

Cross-file key consistency. Run it after every bake and read the warnings.

```bash
python build/validate.py           # exit 1 on any ERROR
python build/validate.py --strict  # exit 1 on warnings too
```

It checks that every key in `economy.json`, `parties.json`, `county_trade.json`, `transport.json`
and both `*.mapmode.json` files resolves to a live Area or a real member county; that no Area is
isolated; that adjacency is symmetric; that Connecticut is the nine planning regions and not the
eight abolished counties; and that every live Area has a shape to draw.

**This is the check that would have caught the worst data bug in the project at build time**:
`Parties.setup` indexed the county table by raw FIPS while the runtime deletes the 1,467 counties
merged into Areas, so 2,025 of 4,198 authored party references — 48.2% — silently resolved to
nothing, with no warning anywhere. The validator prints that ratio on every run so a regression is
visible immediately.

## Authored content

Every script carries an editable table at the top. These are the design surface, not incidental
constants:

| Script | Authored table |
|---|---|
| `build_areas.py` | `AUTHORED_MERGES`, `THRESHOLD`, `MAX_MEMBERS`, `WEST_EXEMPT` |
| `build_adjacency.py` | `MARITIME_COUNTY_LINKS`, `PACIFIC_STATES`, `CANADA_STATES` |
| `build_parties.py` | the region table: movement names, spawn chances, share ranges, homelands, `GROWTH_RATE` |
| `build_trade.py` | `CHOKE_POINTS`, `BORDER_CROSSINGS`, corridor and river definitions |
| `build_transport.py` | `RAIL_HUBS` |
| `build_economy.py` | the sector templates and the classification ladder |

## Raw downloads

`build/raw/` holds ~376 MB of caches and is not committed. `build/raw/README.md` lists every
artifact, its source URL and its size.
