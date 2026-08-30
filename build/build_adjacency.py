"""
Build data/adjacency.json for the Nation States game.

County adjacency is derived from shared TopoJSON arcs (two county geometries are
neighbors iff they share an arc). Then:

  - Territory counties (PR/AS/GU/VI/MP) are dropped.
  - Connecticut's old counties are replaced by the 9 planning regions. Because the
    regions come from a separate GeoJSON (no shared arcs), CT is approximated as a
    clique internally, all jointly adjacent to whatever external counties bordered
    old Connecticut.
  - FIXED_CROSSINGS are added: five major road bridges and tunnels that join an
    island county to its own state. These are LAND links.
  - MARITIME_COUNTY_LINKS are added. County adjacency from shared arcs cannot
    connect an ISLAND to anything, so Hawaii County, Honolulu and Kauai had zero
    neighbours and the state was mechanically inert: nothing could be annexed
    from it, nothing released into it, and no movement could ever diffuse across
    it. Inter-island sea routes are how everything in Hawaii actually moves, so
    the archipelago is authored as a clique, the same approximation the script
    already makes for Connecticut.
  - State adjacency is rolled up from county adjacency, then the special "Canadian
    highway / ocean" links are added: Alaska borders every Pacific and Canada-border
    state; Hawaii borders every Pacific state.

Output:
{
  "county": { "01001": ["01021", ...], ... },
  "state":  { "01": ["13","28",...], ... },
  "pacific_states": [...], "canada_states": [...]
}
"""

import json
import os
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")

TERRITORIES = {"60", "66", "69", "72", "78"}
OLD_CT = {"09001", "09003", "09005", "09007", "09009", "09011", "09013", "09015"}
CT_REGIONS = ["09110", "09120", "09130", "09140", "09150", "09160", "09170", "09180", "09190"]

# ---- MARITIME_COUNTY_LINKS: sea routes shared arcs cannot see (edit freely) ----
# Each inner list becomes a mutually-adjacent clique. Islands have no shared arcs
# with anything, so without this they are unreachable in every system built on
# county adjacency: annexation targets, release, contiguity, the neighbour-pull
# term in political drift, and M4's movement diffusion.
MARITIME_COUNTY_LINKS = [
    # The Hawaiian archipelago. Kalawao (15005) already shares an arc with Maui.
    ["15001", "15003", "15005", "15007", "15009"],
]

# ---- FIXED_CROSSINGS: major road bridges and tunnels, which are LAND links ----
# A county polygon that touches no other polygon is an island to the topology, but
# four of them are joined to their own state by a road you can drive across. They
# are land borders, not sea routes, and the distinction is load-bearing: game.js
# derives land pairs from county adjacency and treats everything left in the state
# table as maritime, so putting these in MARITIME_COUNTY_LINKS would tell the game
# you cannot march across the Mackinac Bridge.
#
# Found by the M2.4 contiguity test, which reported Michigan, New York, Rhode
# Island and Virginia as starting in two disconnected pieces. That was not
# cosmetic: the splinter rule secedes an Area that is politically distant AND
# geographically cut off, so Staten Island and the Upper Peninsula were one bad
# roll from leaving on turn 1 for a reason the map does not show.
FIXED_CROSSINGS = [
    # Mackinac Bridge, I-75: St Ignace (Mackinac Co) - Mackinaw City (Emmet Co).
    # The Upper Peninsula reaches the rest of the country through Wisconsin, but
    # nothing joined it to the Lower Peninsula.
    ("26097", "26047"),
    # Verrazzano-Narrows Bridge, I-278: Staten Island (Richmond) - Brooklyn (Kings).
    ("36085", "36047"),
    # Aquidneck Island: Pell Newport Bridge west to Washington County, Mount Hope
    # Bridge north to Bristol County.
    ("44005", "44009"),
    ("44005", "44001"),
    # Chesapeake Bay Bridge-Tunnel, US-13: Northampton - Virginia Beach city.
    # Virginia's Eastern Shore otherwise reaches the mainland only via Maryland.
    ("51131", "51810"),
]

# States touching the Pacific / bordering Canada (for Alaska & Hawaii's links).
PACIFIC_STATES = ["02", "06", "15", "41", "53"]                     # AK CA HI OR WA
CANADA_STATES = ["02", "16", "23", "26", "27", "30", "33", "36",    # AK ID ME MI MN MT NH NY
                 "38", "39", "42", "50", "53"]                      # ND OH PA VT WA


def arcs_of(geom):
    ids = set()
    def walk(a):
        if isinstance(a, list):
            for x in a:
                walk(x)
        else:
            ids.add(a if a >= 0 else ~a)
    walk(geom.get("arcs", []))
    return ids


def main():
    with open(os.path.join(DATA, "counties-10m.json"), encoding="utf-8") as f:
        topo = json.load(f)

    # ---- raw county adjacency from shared arcs (old CT still present) ----
    arc_to_fips = defaultdict(list)
    for g in topo["objects"]["counties"]["geometries"]:
        fp = g.get("id")
        if not fp:
            continue
        for arc in arcs_of(g):
            arc_to_fips[arc].append(fp)

    adj = defaultdict(set)
    for fips_list in arc_to_fips.values():
        for a in fips_list:
            for b in fips_list:
                if a != b:
                    adj[a].add(b)

    # ---- Connecticut: swap old counties for planning regions ----
    external_ct = set()
    for oc in OLD_CT:
        for n in adj.get(oc, ()):
            if n not in OLD_CT:
                external_ct.add(n)
    for oc in OLD_CT:
        adj.pop(oc, None)
    for x in external_ct:
        adj[x] = {n for n in adj[x] if n not in OLD_CT} | set(CT_REGIONS)
    for r in CT_REGIONS:
        adj[r] = (set(CT_REGIONS) - {r}) | set(external_ct)

    # ---- authored fixed crossings (bridges and tunnels are land borders) ----
    for a, b in FIXED_CROSSINGS:
        if a not in adj or b not in adj:
            raise SystemExit(f"FIXED_CROSSINGS names a county not in the topology: {a} {b}")
        adj[a].add(b)
        adj[b].add(a)

    # ---- authored maritime links (islands share no arcs with anything) ----
    for group in MARITIME_COUNTY_LINKS:
        for a in group:
            for b in group:
                if a != b:
                    adj[a].add(b)
                    adj[b].add(a)

    # ---- drop territories ----
    def keep(fp):
        return fp[:2] not in TERRITORIES
    county_adj = {}
    for fp, neigh in adj.items():
        if not keep(fp):
            continue
        county_adj[fp] = sorted(n for n in neigh if keep(n))

    # ---- roll up to state adjacency ----
    state_adj = defaultdict(set)
    for fp, neigh in county_adj.items():
        st = fp[:2]
        for n in neigh:
            if n[:2] != st:
                state_adj[st].add(n[:2])

    # ---- special Alaska / Hawaii links ----
    def link(a, b):
        if a != b:
            state_adj[a].add(b)
            state_adj[b].add(a)
    for s in set(PACIFIC_STATES) | set(CANADA_STATES):
        link("02", s)            # Alaska: Pacific + Canada highway
    for s in PACIFIC_STATES:
        link("15", s)            # Hawaii: Pacific

    out = {
        "county": county_adj,
        "state": {s: sorted(v) for s, v in state_adj.items()},
        "pacific_states": PACIFIC_STATES,
        "canada_states": CANADA_STATES,
    }
    path = os.path.join(DATA, "adjacency.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, separators=(",", ":"))

    # ---- report ----
    print(f"counties: {len(county_adj)}")
    avg = sum(len(v) for v in county_adj.values()) / len(county_adj)
    print(f"avg county neighbors: {avg:.1f}")
    print(f"CT external neighbors: {sorted(external_ct)}")
    isolated = sorted(f for f in county_adj if not county_adj[f])
    print(f"counties with no neighbours: {len(isolated)}{' ' + str(isolated) if isolated else ''}")
    for s in ["02", "15", "09", "06"]:
        print(f"  state {s} neighbors: {out['state'].get(s)}")
    print(f"output: {os.path.getsize(path)//1024} KB")


if __name__ == "__main__":
    main()
