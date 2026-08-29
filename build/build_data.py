"""
Build data/game-data.json for the Nation States game.

Joins by FIPS code (county- and state-level):
  - Census 2024 population estimates  (build/raw/co-est2024-alldata.csv)
  - BEA 2024 county GDP, all-industry  (build/raw/CAGDP2.zip)
  - 2024 presidential election results (build/raw/election2024_counties.csv)

The set of county units is driven by what the MAP actually renders:
  - every county in the geometry (data/counties-10m.json) in the 50 states + DC,
  - EXCEPT Connecticut's old counties, which the app replaces with the 9 new
    planning regions (data/ct-planning-regions.geojson).

Where a real value is unavailable, a grounded best estimate is used and flagged
in the record's "est" string (letters p/g/v = pop/gdp/vote estimated). This keeps
nation-level totals consistent (estimates apportion the real state/combined total).

Output:
{
  "meta": {...},
  "states":   { "01": {name, pop, gdp, gop, dem, other, votes}, ... },
  "counties": { "01001": {name, st, pop, gdp, gop, dem, other, votes, est?}, ... }
}
gdp is in whole US dollars; gop/dem/other are vote-share percents (1 decimal).
"""

import csv
import json
import os
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "raw")
DATA = os.path.join(HERE, "..", "data")
OUT = os.path.join(DATA, "game-data.json")

TERRITORIES = {"60", "66", "69", "72", "78"}
OLD_CT = {"09001", "09003", "09005", "09007", "09009", "09011", "09013", "09015"}
CT_REGIONS = ["09110", "09120", "09130", "09140", "09150", "09160", "09170", "09180", "09190"]

# BEA combined GDP areas -> member county/city FIPS (from BEA GeoName fields).
COMBOS = {
    "51901": ["51003", "51540"],                    # Albemarle + Charlottesville
    "51903": ["51005", "51580"],                    # Alleghany + Covington
    "51907": ["51015", "51790", "51820"],           # Augusta + Staunton + Waynesboro
    "51911": ["51031", "51680"],                    # Campbell + Lynchburg
    "51913": ["51035", "51640"],                    # Carroll + Galax
    "51918": ["51053", "51570", "51730"],           # Dinwiddie + Colonial Heights + Petersburg
    "51919": ["51059", "51600", "51610"],           # Fairfax + Fairfax City + Falls Church
    "51921": ["51069", "51840"],                    # Frederick + Winchester
    "51923": ["51081", "51595"],                    # Greensville + Emporia
    "51929": ["51089", "51690"],                    # Henry + Martinsville
    "51931": ["51095", "51830"],                    # James City + Williamsburg
    "51933": ["51121", "51750"],                    # Montgomery + Radford
    "51939": ["51143", "51590"],                    # Pittsylvania + Danville
    "51941": ["51149", "51670"],                    # Prince George + Hopewell
    "51942": ["51153", "51683", "51685"],           # Prince William + Manassas + Manassas Park
    "51944": ["51161", "51775"],                    # Roanoke + Salem
    "51945": ["51163", "51530", "51678"],           # Rockbridge + Buena Vista + Lexington
    "51947": ["51165", "51660"],                    # Rockingham + Harrisonburg
    "51949": ["51175", "51620"],                    # Southampton + Franklin
    "51951": ["51177", "51630"],                    # Spotsylvania + Fredericksburg
    "51953": ["51191", "51520"],                    # Washington + Bristol
    "51955": ["51195", "51720"],                    # Wise + Norton
    "51958": ["51199", "51735"],                    # York + Poquoson
    "15901": ["15009", "15005"],                    # Maui + Kalawao
}
MEMBER_TO_COMBO = {m: c for c, members in COMBOS.items() for m in members}

# Old merged Alaska area still in the geometry -> its post-2019 successors.
VALDEZ_CORDOVA = ("02261", ["02063", "02066"])

# Populations the Census file does not report separately (combined elsewhere).
POP_HARDCODE = {"15005": 82}  # Kalawao, HI (2020 census)


def pct(part, whole):
    return round(part / whole * 100, 1) if whole else None


# ----------------------------------------------------------------------
# load raw sources
# ----------------------------------------------------------------------
def load_population():
    state_pop, county_pop, county_name, state_name = {}, {}, {}, {}
    with open(os.path.join(RAW, "co-est2024-alldata.csv"), encoding="latin-1", newline="") as f:
        for row in csv.DictReader(f):
            st = row["STATE"].zfill(2)
            try:
                pop = int(row["POPESTIMATE2024"])
            except ValueError:
                pop = None
            if row["SUMLEV"] == "040":
                state_pop[st], state_name[st] = pop, row["STNAME"]
            elif row["SUMLEV"] == "050":
                fips = st + row["COUNTY"].zfill(3)
                county_pop[fips], county_name[fips] = pop, row["CTYNAME"]
    return state_pop, county_pop, county_name, state_name


def load_gdp():
    """county_gdp (real, whole $), state_gdp (whole $), combo_gdp (whole $)."""
    county_gdp, state_gdp, combo_gdp = {}, {}, {}
    with zipfile.ZipFile(os.path.join(RAW, "CAGDP2.zip")) as z:
        target = next(n for n in z.namelist() if "ALL_AREAS" in n.upper())
        lines = z.read(target).decode("latin-1").splitlines()
    reader = csv.reader(lines)
    header = next(reader)
    last = len(header) - 1
    for row in reader:
        if len(row) <= last or row[4].strip() != "1":
            continue
        geo = row[0].strip().strip('"').strip()
        if not geo.isdigit() or len(geo) != 5 or geo == "00000":
            continue
        try:
            val = int(float(row[last].strip().strip('"').strip())) * 1000
        except ValueError:
            val = None  # (NA)/(D)
        if geo in COMBOS:
            combo_gdp[geo] = val
        elif geo.endswith("000"):
            state_gdp[geo[:2]] = val
        else:
            county_gdp[geo] = val
    return county_gdp, state_gdp, combo_gdp


def load_votes():
    """county_votes[fips]=(gop,dem,tot); state_votes[st]=(gop,dem,tot) incl. AK districts."""
    county_votes, state_votes = {}, {}
    with open(os.path.join(RAW, "election2024_counties.csv"), encoding="latin-1", newline="") as f:
        for row in csv.DictReader(f):
            fips = row["county_fips"].zfill(5)
            st = fips[:2]
            try:
                gop, dem, tot = int(float(row["votes_gop"])), int(float(row["votes_dem"])), int(float(row["total_votes"]))
            except ValueError:
                continue
            # Alaska reports by State House District, not by borough: use only for
            # the statewide total, never as a per-county (borough) value.
            if st != "02":
                county_votes[fips] = (gop, dem, tot)
            sg, sd, stt = state_votes.get(st, (0, 0, 0))
            state_votes[st] = (sg + gop, sd + dem, stt + tot)
    return county_votes, state_votes


def load_geometry_counties():
    with open(os.path.join(DATA, "counties-10m.json"), encoding="utf-8") as f:
        topo = json.load(f)
    out = {}
    for g in topo["objects"]["counties"]["geometries"]:
        if g.get("id"):
            out[g["id"]] = (g.get("properties") or {}).get("name", g["id"])
    return out


# ----------------------------------------------------------------------
# helpers
# ----------------------------------------------------------------------
def shares_from_counts(votes):
    gop, dem, tot = votes
    g, d = pct(gop, tot), pct(dem, tot)
    o = round(100 - g - d, 1) if g is not None and d is not None else None
    return g, d, o, tot


def main():
    state_pop, county_pop, county_name, state_name = load_population()
    county_gdp, state_gdp, combo_gdp = load_gdp()
    county_votes, state_votes = load_votes()
    geom = load_geometry_counties()

    # state vote shares (statewide) -> used as estimates for missing counties
    state_shares = {st: shares_from_counts(v) for st, v in state_votes.items()}
    per_capita_gdp = {
        st: (state_gdp[st] / state_pop[st])
        for st in state_gdp
        if state_gdp.get(st) and state_pop.get(st)
    }

    def pop_of(fips):
        return county_pop.get(fips) if county_pop.get(fips) is not None else POP_HARDCODE.get(fips)

    # ---- decide the rendered county set ----
    units = {}  # fips -> display name
    for fips, gname in geom.items():
        if fips[:2] in TERRITORIES or fips in OLD_CT:
            continue
        units[fips] = county_name.get(fips) or gname
    for fips in CT_REGIONS:
        units[fips] = county_name.get(fips, fips)

    # ---- pass 1: population ----
    pop = {}
    est = {f: "" for f in units}
    for fips in units:
        p = pop_of(fips)
        if p is None and fips == VALDEZ_CORDOVA[0]:
            parts = [pop_of(m) for m in VALDEZ_CORDOVA[1] if pop_of(m) is not None]
            p = sum(parts) if parts else None  # real successor sum (not flagged)
        if p is None:
            p, est[fips] = state_pop.get(fips[:2]), est[fips] + "p"
        pop[fips] = p

    # ---- pass 2: gdp ----
    def estimate_gdp(fips):
        st = fips[:2]
        if fips == VALDEZ_CORDOVA[0]:
            parts = [county_gdp.get(m) for m in VALDEZ_CORDOVA[1] if county_gdp.get(m) is not None]
            return (sum(parts) if parts else None), False  # real successor sum
        combo = MEMBER_TO_COMBO.get(fips)
        if combo and combo_gdp.get(combo):
            members = [m for m in COMBOS[combo] if pop.get(m) or pop_of(m)]
            total = sum((pop.get(m) or pop_of(m) or 0) for m in members) or 1
            mine = pop.get(fips) or pop_of(fips) or 0
            return round(combo_gdp[combo] * mine / total), True
        if per_capita_gdp.get(st) and pop.get(fips):
            return round(per_capita_gdp[st] * pop[fips]), True  # state per-capita
        return None, True

    gdp = {}
    for fips in units:
        g = county_gdp.get(fips)
        if g is None:
            g, flagged = estimate_gdp(fips)
            if flagged and g is not None:
                est[fips] += "g"
        gdp[fips] = g

    # ---- pass 3: vote ----
    politics = {}
    for fips in units:
        st = fips[:2]
        v = county_votes.get(fips)  # AK boroughs never present here
        if v:
            g, d, o, tot = shares_from_counts(v)
        else:
            sh = state_shares.get(st)
            g, d, o, tot = (sh[0], sh[1], sh[2], None) if sh else (None, None, None, None)
            if g is not None:
                est[fips] += "v"
        politics[fips] = (g, d, o, tot)

    # ---- assemble counties ----
    counties = {}
    for fips in sorted(units):
        g, d, o, tot = politics[fips]
        rec = {
            "name": units[fips],
            "st": fips[:2],
            "pop": pop[fips],
            "gdp": gdp[fips],
            "gop": g, "dem": d, "other": o, "votes": tot,
        }
        if est[fips]:
            rec["est"] = est[fips]
        counties[fips] = rec

    # ---- states ----
    states = {}
    for st, name in sorted(state_name.items()):
        g, d, o, tot = shares_from_counts(state_votes[st]) if st in state_votes else (None, None, None, None)
        states[st] = {"name": name, "pop": state_pop.get(st), "gdp": state_gdp.get(st),
                      "gop": g, "dem": d, "other": o, "votes": tot}

    out = {
        "meta": {
            "population_source": "U.S. Census Bureau, 2024 Population Estimates",
            "gdp_source": "U.S. Bureau of Economic Analysis, CAGDP2 2024 (all-industry, current $)",
            "election_source": "2024 U.S. Presidential Election county results",
            "est_note": "Values flagged with 'est' are best estimates where a real figure "
                        "is not published separately: Alaska boroughs (vote apportioned from "
                        "statewide, as Alaska reports by house district), Virginia independent "
                        "cities and Connecticut regions (GDP apportioned from the real BEA "
                        "combined-area / state total by population).",
        },
        "states": states,
        "counties": counties,
    }
    os.makedirs(DATA, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, separators=(",", ":"), ensure_ascii=False)

    # ---- report ----
    def miss(key):
        return [f for f, r in counties.items() if r[key] is None]
    est_counts = {"p": 0, "g": 0, "v": 0}
    for r in counties.values():
        for ch in r.get("est", ""):
            est_counts[ch] += 1
    print(f"states: {len(states)}   counties (rendered): {len(counties)}")
    print(f"  missing pop:  {len(miss('pop'))}  {miss('pop')[:6]}")
    print(f"  missing gdp:  {len(miss('gdp'))}  {miss('gdp')[:6]}")
    print(f"  missing vote: {len(miss('gop'))}  {miss('gop')[:6]}")
    print(f"  estimated -> pop:{est_counts['p']}  gdp:{est_counts['g']}  vote:{est_counts['v']}")
    print(f"output: {os.path.getsize(OUT)//1024} KB")


if __name__ == "__main__":
    main()
