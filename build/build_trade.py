"""
ONE-TIME offline preprocessing -> data/county_trade.json.

The game only READS the output file; it never does geography at runtime.
Re-run manually if the authored lists below change:
    python build/build_trade.py

AUTOMATED (GeoPandas intersections, all inputs cached in build/raw/trade/):
  - Census TIGER cartographic county boundaries (FIPS-keyed)
  - BTS/USACE "Commercially Navigable Waterways" (National Waterway Network
    derivative that already excludes recreational / no-traffic routes)
        -> per-county river intersects + river names
  - USACE/BTS Principal Ports -> counties containing a port
  - Census TIGER coastline (NAME field) -> coastal (ocean/gulf) vs Great Lakes

================================ AUTHORED TABLES ===============================
Edit these freely (they are merged into the output). County FIPS below were
resolved from the TIGER county layer -- never invented.
"""

import io
import json
import os
import urllib.request
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "raw", "trade")
DATA = os.path.join(HERE, "..", "data")

# --- CHOKE_POINTS: strategically critical passages (proposed set -- confirm/edit) ---
CHOKE_POINTS = {
    "26033": "Soo Locks / Sault Ste. Marie",        # Chippewa, MI
    "26097": "Straits of Mackinac",                 # Mackinac, MI
    "26163": "Detroit River",                       # Wayne, MI
    "26147": "St. Clair River",                     # St. Clair, MI
    "36063": "Niagara River / Welland approach",    # Niagara, NY
    "36089": "St. Lawrence outlet",                 # St. Lawrence, NY
    "17031": "Chicago Sanitary & Ship Canal",       # Cook, IL (Lakes-Mississippi link)
    "17003": "Ohio-Mississippi confluence (Cairo)", # Alexander, IL
    "29510": "Missouri-Mississippi confluence",     # St. Louis City, MO
    "22071": "Lower Mississippi / New Orleans",     # Orleans, LA
    "22075": "Mouth of the Mississippi",            # Plaquemines, LA
    "48201": "Houston Ship Channel",                # Harris, TX
    "06075": "Golden Gate",                         # San Francisco, CA
    "51810": "Chesapeake entrance / Hampton Roads", # Virginia Beach, VA
    "53009": "Strait of Juan de Fuca",              # Clallam, WA
}

# --- BORDER_CROSSINGS: counties with a major LEGAL land crossing (edit freely) ---
BORDER_CROSSINGS = {
    # Canada
    "53073": "Blaine WA (Peace Arch/Pacific Hwy)",
    "16021": "Eastport ID",
    "30101": "Sweetgrass MT",
    "38067": "Pembina ND",
    "27071": "International Falls MN",
    "27031": "Grand Portage MN",
    "26033": "Sault Ste. Marie MI",
    "26163": "Detroit-Windsor MI",
    "26147": "Port Huron MI",
    "36029": "Buffalo-Fort Erie NY",
    "36063": "Niagara Falls NY",
    "36045": "Thousand Islands NY",
    "36089": "Massena NY",
    "36019": "Champlain NY",
    "50019": "Derby Line VT",
    "23003": "Houlton ME",
    "23029": "Calais ME",
    "02240": "Alcan AK",
    # Mexico
    "06073": "San Ysidro/Otay Mesa CA",
    "06025": "Calexico CA",
    "04027": "San Luis/Yuma AZ",
    "04023": "Nogales AZ",
    "04003": "Douglas AZ",
    "35029": "Columbus NM",
    "35013": "Santa Teresa NM",
    "48141": "El Paso TX",
    "48377": "Presidio TX",
    "48465": "Del Rio TX",
    "48323": "Eagle Pass TX",
    "48479": "Laredo TX",
    "48215": "Hidalgo/McAllen TX",
    "48061": "Brownsville TX",
}

# --- CORRIDORS / RIVER_BANK_PAIRS are GENERATED below from the waterway tags ---
# (corridor = counties intersecting that river system, ordered along the flow
# axis; bank pairs = Census-adjacent counties in different states sharing the
# river). Both land in the output JSON, where you can edit them directly.
CORRIDOR_RULES = {
    #  name          river-name substrings           ordering        direction
    "Mississippi":  (("MISSISSIPPI RIVER",),          "lat",  "desc"),  # N -> S
    "Missouri":     (("MISSOURI RIVER",),             "lon",  "asc"),   # W -> E
    "Ohio":         (("OHIO RIVER",),                 "lon",  "desc"),  # E -> W
    "Great_Lakes":  ((),                              "lon",  "asc"),   # lakeshore, W -> E
}
BANK_PAIR_RIVERS = ("MISSISSIPPI RIVER", "MISSOURI RIVER", "OHIO RIVER",
                    "COLUMBIA RIVER", "SNAKE RIVER", "RED RIVER", "SAVANNAH RIVER",
                    "DELAWARE RIVER", "POTOMAC RIVER")
# ============================== END AUTHORED TABLES =============================

COUNTIES_URL = "https://www2.census.gov/geo/tiger/GENZ2023/shp/cb_2023_us_county_500k.zip"
COASTLINE_URL = "https://www2.census.gov/geo/tiger/TIGER2023/COASTLINE/tl_2023_us_coastline.zip"
CNW_URL = ("https://services3.arcgis.com/OYP7N6mAJJCyH6hd/arcgis/rest/services/"
           "Commercially_Navigable_Waterways/FeatureServer/0/query")
PORTS_URL = ("https://services7.arcgis.com/n1YM8pTrFmm7L4hs/ArcGIS/rest/services/"
             "Principal_Ports/FeatureServer/0/query")


# ---- FIPS the shipped geometry and game-data still key the OLD way ----
# Valdez-Cordova AK (02261) was split into Chugach (02063) and Copper River
# (02066) in 2019. data/counties-10m.json and data/game-data.json both still use
# 02261, so a record keyed by a successor joins to nothing and the port at
# Cordova is invisible. Fold successors back onto the key the game actually uses.
SUCCESSOR_TO_LEGACY = {
    "02063": "02261",   # Chugach      -> Valdez-Cordova
    "02066": "02261",   # Copper River -> Valdez-Cordova
}


def fold_successors(by_county):
    """Merge successor-FIPS records onto the legacy key the game data uses."""
    for new, legacy in SUCCESSOR_TO_LEGACY.items():
        rec = by_county.pop(new, None)
        if rec is None:
            continue
        base = by_county.setdefault(legacy, {})
        for k, v in rec.items():
            if isinstance(v, bool):
                base[k] = bool(base.get(k)) or v
            elif isinstance(v, list):
                base[k] = sorted(set(base.get(k, [])) | set(v))
            else:
                base.setdefault(k, v)
    return by_county


def fetch(url, dest):
    if os.path.exists(dest):
        return dest
    print("downloading", url.split("?")[0])
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with urllib.request.urlopen(url, timeout=180) as r, open(dest, "wb") as f:
        f.write(r.read())
    return dest


def fetch_arcgis(url, out_fields, dest):
    """Page an ArcGIS FeatureServer layer into one cached GeoJSON file."""
    if os.path.exists(dest):
        return dest
    feats, offset = [], 0
    while True:
        q = (f"{url}?where=1%3D1&outFields={out_fields}&outSR=4326&f=geojson"
             f"&resultOffset={offset}&resultRecordCount=2000")
        with urllib.request.urlopen(q, timeout=180) as r:
            page = json.load(r)
        got = page.get("features", [])
        feats.extend(got)
        print(f"  {url.split('/services/')[1].split('/')[0]}: {len(feats)} features")
        if len(got) < 2000:
            break
        offset += 2000
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, "w", encoding="utf-8") as f:
        json.dump({"type": "FeatureCollection", "features": feats}, f)
    return dest


def main():
    import geopandas as gpd

    counties = gpd.read_file(fetch(COUNTIES_URL, os.path.join(RAW, "counties.zip"))).to_crs(4326)
    counties = counties[~counties["STATEFP"].isin(["60", "66", "69", "72", "78"])]  # states + DC only
    counties = counties[["GEOID", "NAME", "geometry"]].reset_index(drop=True)

    coast = gpd.read_file(fetch(COASTLINE_URL, os.path.join(RAW, "coastline.zip"))).to_crs(4326)
    cnw = gpd.read_file(fetch_arcgis(CNW_URL, "RIVERNAME,LINKNAME", os.path.join(RAW, "cnw.geojson")))
    ports = gpd.read_file(fetch_arcgis(PORTS_URL, "PORT,PORTNAME", os.path.join(RAW, "ports.geojson")))
    cnw = cnw.set_crs(4326, allow_override=True)
    ports = ports.set_crs(4326, allow_override=True)

    # rivers per county (spatial intersect with commercial waterway lines)
    hits = gpd.sjoin(counties, cnw[["RIVERNAME", "LINKNAME", "geometry"]], predicate="intersects")
    rivers = {}
    for _, row in hits.iterrows():
        name = (row.get("RIVERNAME") or row.get("LINKNAME") or "").strip().title()
        if name:
            rivers.setdefault(row["GEOID"], set()).add(name)

    # ports per county (port polygons cover whole harbors -- use their center
    # point so each port lands in the county actually containing it; harbor
    # polygons whose center is open water fall back to the county they overlap most)
    port_pts = ports.copy()
    port_pts["geometry"] = port_pts.geometry.representative_point()
    pt_hits = gpd.sjoin(port_pts, counties, predicate="within")
    has_port = set(pt_hits["GEOID"])
    unmatched = ports.loc[~ports.index.isin(pt_hits.index)]
    for _, port in unmatched.iterrows():
        cand = counties[counties.intersects(port.geometry)]
        if len(cand):
            overlap = cand.geometry.intersection(port.geometry).area
            has_port.add(cand.loc[overlap.idxmax(), "GEOID"])

    # coastal vs Great Lakes from the TIGER coastline NAME field
    lakes_geom = coast[coast["NAME"].str.contains("Great Lakes", case=False, na=False)]
    ocean_geom = coast[~coast["NAME"].str.contains("Great Lakes", case=False, na=False)]
    great_lakes = set(gpd.sjoin(counties, lakes_geom[["geometry"]], predicate="intersects")["GEOID"])
    coastal = set(gpd.sjoin(counties, ocean_geom[["geometry"]], predicate="intersects")["GEOID"])

    # ---- GENERATED corridors (ordered along the flow axis; edit in the output) ----
    cent = counties.set_index("GEOID").geometry.representative_point()
    def order(fips_set, axis, direction):
        key = (lambda f: cent[f].y) if axis == "lat" else (lambda f: cent[f].x)
        return sorted(fips_set, key=key, reverse=(direction == "desc"))
    corridors = {}
    for cname, (subs, axis, direction) in CORRIDOR_RULES.items():
        if cname == "Great_Lakes":
            members = set(great_lakes)
        else:
            members = {f for f, rs in rivers.items() if any(any(s in r.upper() for s in subs) for r in rs)}
        corridors[cname] = order(members, axis, direction)

    # ---- GENERATED bank pairs: Census-adjacent counties in different states
    # sharing a major river (the classic facing-banks case; edit in the output) ----
    with open(os.path.join(DATA, "county_neighbors.json"), encoding="utf-8") as f:
        neighbors = json.load(f)
    def on(f, river):
        return any(river in r.upper() for r in rivers.get(f, ()))
    bank_pairs = []
    for a, nbs in neighbors.items():
        for b in nbs:
            if a < b and a[:2] != b[:2]:
                for river in BANK_PAIR_RIVERS:
                    if on(a, river) and on(b, river):
                        bank_pairs.append([a, b])
                        break

    # ---- assemble (only counties with at least one flag are listed) ----
    out_counties = {}
    for f in counties["GEOID"]:
        rec = {
            "has_port": f in has_port,
            "coastal": f in coastal,
            "great_lakes": f in great_lakes,
            "rivers": sorted(rivers.get(f, ())),
            "choke_point": f in CHOKE_POINTS,
            "border_crossing": f in BORDER_CROSSINGS,
        }
        if any(v for v in rec.values()):
            out_counties[f] = rec

    fold_successors(out_counties)

    out = {
        "counties": out_counties,
        "choke_point_labels": CHOKE_POINTS,
        "border_crossing_labels": BORDER_CROSSINGS,
        "corridors": corridors,
        "bank_pairs": bank_pairs,
    }
    dest = os.path.join(DATA, "county_trade.json")
    with open(dest, "w", encoding="utf-8") as f:
        json.dump(out, f, separators=(",", ":"))
    print(f"\ncounties flagged: {len(out_counties)} | ports: {len(has_port)} | "
          f"coastal: {len(coastal)} | great lakes: {len(great_lakes)}")
    print("corridors:", {k: len(v) for k, v in corridors.items()}, "| bank pairs:", len(bank_pairs))
    print("output:", os.path.relpath(dest, HERE), f"({os.path.getsize(dest) // 1024} KB)")


if __name__ == "__main__":
    main()
