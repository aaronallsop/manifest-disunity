"""
ONE-TIME offline bake -> data/transport.json: per-county transport flags.

  rail        county crossed by a Class I (major) railway line
              (BTS/USACE North American Rail Network, Class I subset -- the
              layer carries county FIPS as attributes, no geometry needed)
  rail_hub    county contains a city on the national passenger-rail map
              (authored list below -- edit freely)
  interstates list of Interstate routes through the county (e.g. I-15, I-80),
              from Census TIGER PRISECROADS (RTTYP = 'I'), per state
  external    Canada / Mexico gateway counties (legal border crossings from
              county_trade.json, split by border)

Re-run: python build/build_transport.py
"""

import io
import json
import os
import re
import urllib.request
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "raw", "transport")
DATA = os.path.join(HERE, "..", "data")

RAIL_URL = ("https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/"
            "NTAD_North_American_Rail_Network_Lines_Class_I_Railroads/FeatureServer/0/query")
ROADS_URL = "https://www2.census.gov/geo/tiger/TIGER2023/PRISECROADS/tl_2023_{st}_prisecroads.zip"

CANADA_STATES = {"53", "16", "30", "38", "27", "26", "36", "50", "23", "02"}
MEXICO_STATES = {"06", "04", "35", "48"}

# ---- RAIL_HUBS: cities on the national passenger-rail map (edit freely) ----
RAIL_HUBS = {
    "53033": "Seattle", "41051": "Portland", "53063": "Spokane", "41039": "Eugene",
    "06089": "Redding", "06067": "Sacramento", "06075": "San Francisco", "06085": "San Jose",
    "06019": "Fresno", "06029": "Bakersfield", "06037": "Los Angeles", "06073": "San Diego",
    "32031": "Reno", "49035": "Salt Lake City", "32003": "Las Vegas", "04005": "Flagstaff",
    "35001": "Albuquerque", "04019": "Tucson", "48141": "El Paso", "08031": "Denver",
    "27053": "Minneapolis-St. Paul", "31055": "Omaha", "29095": "Kansas City",
    "40109": "Oklahoma City", "48439": "Fort Worth", "48113": "Dallas", "48453": "Austin",
    "48029": "San Antonio", "48201": "Houston", "05119": "Little Rock", "29510": "St. Louis",
    "17001": "Quincy", "17031": "Chicago", "55079": "Milwaukee", "26081": "Grand Rapids",
    "26147": "Port Huron", "26125": "Pontiac", "26163": "Detroit", "47157": "Memphis",
    "22071": "New Orleans", "01097": "Mobile", "01073": "Birmingham", "13121": "Atlanta",
    "13051": "Savannah", "12031": "Jacksonville", "12095": "Orlando", "12057": "Tampa",
    "12086": "Miami", "39061": "Cincinnati", "18097": "Indianapolis", "39035": "Cleveland",
    "42003": "Pittsburgh", "36029": "Buffalo", "36001": "Albany", "50007": "Burlington",
    "50011": "St. Albans", "23005": "Brunswick", "25025": "Boston", "44007": "Providence",
    "09170": "New Haven", "36061": "New York", "42043": "Harrisburg", "42101": "Philadelphia",
    "24510": "Baltimore", "11001": "Washington D.C.", "51760": "Richmond",
    "51700": "Newport News", "51710": "Norfolk", "51770": "Roanoke", "37081": "Greensboro",
    "37119": "Charlotte", "37183": "Raleigh", "02090": "Fairbanks", "02020": "Anchorage",
    "02170": "Palmer", "02063": "Whittier", "02122": "Seward",
}
# ---------------------------------------------------------------------------


def rail_counties(force=False):
    """
    Distinct county FIPS crossed by Class I rail (attribute-only queries).

    CACHED to build/raw/transport/rail_counties.json. This had no cache at all:
    every run re-queried a live ArcGIS endpoint in 2,000-record pages, so the
    build could not be reproduced offline, could not be reproduced at all if the
    service moved, and silently produced different data if the upstream layer was
    revised between runs. Pass force=True to refresh.
    """
    cache = os.path.join(RAW, "rail_counties.json")
    if os.path.exists(cache) and not force:
        with open(cache, encoding="utf-8") as f:
            return set(json.load(f))

    out, offset = set(), 0
    while True:
        q = (f"{RAIL_URL}?where=1%3D1&outFields=STCNTYFIPS&returnGeometry=false"
             f"&returnDistinctValues=true&f=json&resultOffset={offset}&resultRecordCount=2000")
        with urllib.request.urlopen(q, timeout=120) as r:
            feats = json.load(r).get("features", [])
        for f in feats:
            v = (f["attributes"].get("STCNTYFIPS") or "").strip()
            if len(v) == 5:
                out.add(v)
        if len(feats) < 2000:
            break
        offset += 2000

    os.makedirs(RAW, exist_ok=True)
    with open(cache, "w", encoding="utf-8") as f:
        json.dump(sorted(out), f)
    return out


def interstates_by_county(states, counties_gdf):
    """county fips -> sorted list of Interstate routes (TIGER PRISECROADS)."""
    import geopandas as gpd
    os.makedirs(RAW, exist_ok=True)
    result = {}
    for st in sorted(states):
        dest = os.path.join(RAW, f"roads_{st}.zip")
        if not os.path.exists(dest):
            for attempt in range(3):  # flaky big downloads: retry, write atomically
                try:
                    with urllib.request.urlopen(ROADS_URL.format(st=st), timeout=300) as r, open(dest + ".part", "wb") as f:
                        f.write(r.read())
                    os.replace(dest + ".part", dest)
                    break
                except Exception as ex:
                    if attempt == 2:
                        raise
                    print(f"  {st}: retrying ({ex})")
        roads = gpd.read_file(dest)
        roads = roads[roads["RTTYP"] == "I"].to_crs(4326)
        if roads.empty:
            continue
        cs = counties_gdf[counties_gdf["GEOID"].str[:2] == st]
        hits = gpd.sjoin(cs, roads[["FULLNAME", "geometry"]], predicate="intersects")
        for _, row in hits.iterrows():
            m = re.search(r"I-?\s*(\d+[A-Z]?)", str(row["FULLNAME"]))
            if m:
                result.setdefault(row["GEOID"], set()).add(f"I-{m.group(1)}")
        print(f"  {st}: {len(cs)} counties, {len(roads)} interstate segments")
    return {f: sorted(v) for f, v in result.items()}


def main():
    import geopandas as gpd
    gd = json.load(open(os.path.join(DATA, "game-data.json"), encoding="utf-8"))["counties"]
    trade = json.load(open(os.path.join(DATA, "county_trade.json"), encoding="utf-8"))

    counties = gpd.read_file(os.path.join(HERE, "raw", "trade", "counties.zip")).to_crs(4326)
    counties = counties[["GEOID", "geometry"]]
    states = {f[:2] for f in gd}

    print("rail (attribute query)...")
    rail = rail_counties()
    print(f"  {len(rail)} counties with Class I rail")
    print("interstates (TIGER PRISECROADS per state)...")
    inter = interstates_by_county(states, counties)

    out_counties = {}
    for f in gd:
        rec = {}
        if f in rail:
            rec["rail"] = True
        if f in RAIL_HUBS:
            rec["rail_hub"] = True
        if f in inter:
            rec["interstates"] = inter[f]
        if rec:
            out_counties[f] = rec

    # Canada / Mexico gateways = legal border crossings, split by border
    external = {"Canada": [], "Mexico": []}
    for f in trade["border_crossing_labels"]:
        if f[:2] in CANADA_STATES:
            external["Canada"].append(f)
        elif f[:2] in MEXICO_STATES:
            external["Mexico"].append(f)

    dest = os.path.join(DATA, "transport.json")
    with open(dest, "w", encoding="utf-8") as f:
        json.dump({"counties": out_counties, "external": external}, f, separators=(",", ":"))
    n_hwy = sum(1 for r in out_counties.values() if r.get("interstates"))
    print(f"\nflagged counties: {len(out_counties)} | rail: {len(rail)} | "
          f"interstate: {n_hwy} | hubs: {len(RAIL_HUBS)}")
    print("gateways:", {k: len(v) for k, v in external.items()})
    print("output:", os.path.relpath(dest, HERE), f"({os.path.getsize(dest) // 1024} KB)")


if __name__ == "__main__":
    main()
