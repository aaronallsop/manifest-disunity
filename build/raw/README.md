# `build/raw/` — regenerable download cache

**Nothing in this directory is committed.** It is excluded by `.gitignore` (`build/raw/`) because
it holds ~376 MB of third-party downloads. Every file here is a *cache*: delete the whole
directory and re-run the build scripts and it comes back byte-identical (modulo upstream data
revisions). No hand-authored content lives here — authored tables live inside the `build/*.py`
scripts themselves and in `content/`.

`build/raw/README.md` is the one exception: it is committed so the directory documents itself.

## Contents

| Path | Size | Source | Fetched by |
|---|---:|---|---|
| `co-est2024-alldata.csv` | 1.7 MB | `https://www2.census.gov/programs-surveys/popest/datasets/2020-2024/counties/totals/co-est2024-alldata.csv` | manual `curl` → `build_data.py` reads it |
| `CAGDP2.zip` | 15 MB | `https://apps.bea.gov/regional/zip/CAGDP2.zip` | manual `curl` → `build_data.py` reads it |
| `election2024_counties.csv` | 348 KB | `https://raw.githubusercontent.com/tonmcg/US_County_Level_Election_Results_08-24/master/2024_US_County_Level_Presidential_Results.csv` | manual `curl` → `build_data.py` reads it |
| `county_adjacency.txt` | 712 KB | Census county adjacency file (**pre-2015 vintage** — see caveat below) | `build_neighbors.py` |
| `trade/counties.zip` | 11 MB | `https://www2.census.gov/geo/tiger/GENZ2023/shp/cb_2023_us_county_500k.zip` | `build_trade.py` (`COUNTIES_URL`) |
| `trade/coastline.zip` | 16 MB | `https://www2.census.gov/geo/tiger/TIGER2023/COASTLINE/tl_2023_us_coastline.zip` | `build_trade.py` (`COASTLINE_URL`) |
| `trade/cnw.geojson` | 34 MB | ArcGIS `services3.arcgis.com/OYP7N6mAJJCyH6hd/.../Commercially_Navigable_Waterways/FeatureServer/0/query` | `build_trade.py` (`CNW_URL`) |
| `trade/ports.geojson` | 21 MB | ArcGIS `services7.arcgis.com/n1YM8pTrFmm7L4hs/.../Principal_Ports/FeatureServer/0/query` | `build_trade.py` (`PORTS_URL`) |
| `transport/roads_<ST>.zip` × 51 | 279 MB | `https://www2.census.gov/geo/tiger/TIGER2023/PRISECROADS/tl_2023_<ST>_prisecroads.zip` | `build_transport.py` (`ROADS_URL`) |

Rail Class-I line geometry is fetched from
`https://services.arcgis.com/xOi1kZaI0eWDREZv/.../NTAD_North_American_Rail_Network_Lines_Class_I_Railroads/FeatureServer/0/query`
by `build_transport.py` (`RAIL_URL`). See the caching note below.

## Known caveats (tracked as M1.13 in `docs/REBUILD-PLAN.md`)

- `county_adjacency.txt` is a **pre-2015** Census vintage. It still lists the eight obsolete
  Connecticut counties, has no planning regions, and contains 11 phantom FIPS. It is also missing
  Watonwan County MN (`27165`) and has no entries at all for Hawaii's islands.
- `build_neighbors.py` is a no-op once `data/county_neighbors.json` exists; refreshing the raw file
  alone will not regenerate the output.
- `build_transport.py`'s `rail_counties()` had no on-disk cache, so rail geometry was re-fetched
  live on every build.

## Regenerating

```
# one-off manual fetches (build_data.py inputs)
curl -sL --max-time 90  -o build/raw/co-est2024-alldata.csv    "https://www2.census.gov/programs-surveys/popest/datasets/2020-2024/counties/totals/co-est2024-alldata.csv"
curl -sL --max-time 120 -o build/raw/CAGDP2.zip                "https://apps.bea.gov/regional/zip/CAGDP2.zip"
curl -sL --max-time 60  -o build/raw/election2024_counties.csv "https://raw.githubusercontent.com/tonmcg/US_County_Level_Election_Results_08-24/master/2024_US_County_Level_Presidential_Results.csv"

# the rest self-download on first run
python build/build_data.py
python build/build_adjacency.py
python build/build_areas.py
python build/build_neighbors.py
python build/build_economy.py
python build/build_parties.py
python build/build_trade.py
python build/build_transport.py
```

Geometry inputs that *are* committed because they are small and load at runtime:
`data/counties-10m.json` (us-atlas@3) and `data/ct-planning-regions.geojson`.
