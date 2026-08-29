"""
ONE-TIME offline bake -> data/areas.json: the county->Area merge plan.

An Area is the game's atomic clickable unit. Small counties are merged into an
adjacent county (same state only, using the map's geometric adjacency) until
each Area reaches THRESHOLD population. The full member-county list is kept
inside each Area, so no underlying data is lost.

Rules (edit + re-run: python build/build_areas.py):
  1. AUTHORED_MERGES below happen first, unconditionally.
  2. Virginia's independent cities merge into their surrounding county
     (same-name adjacent county if any, else the most-populous adjacent VA
     county, else they cluster with adjacent cities -- Hampton Roads).
  3. In states EAST of Montana/Wyoming/Colorado/New Mexico, any Area under
     THRESHOLD keeps merging into its smallest adjacent same-state Area,
     up to MAX_MEMBERS counties.
Western states (and AK/HI) are left alone apart from the authored merges.

DETERMINISM. Every choice below breaks ties on a SORTED key. It did not: the
candidate neighbours were held in a `set`, and CPython randomises string hashing
per process, so `min(set_of_fips, key=...)` picked a different winner across runs
on byte-identical inputs. Area IDs are the join key for economy.json,
parties.json, the map modes and every save, so a shuffle there silently
invalidates all of them.

RE-RUNNING THIS CHANGES AREA IDS, and therefore invalidates every existing save
and every file keyed by Area id. Use --out to write somewhere else and diff first;
run build/validate.py afterwards, always.

    python build/build_areas.py                  # overwrite data/areas.json
    python build/build_areas.py --out /tmp/a.json  # write elsewhere
"""

import argparse
import json
import os

THRESHOLD = 50_000   # tune me: minimum Area population east of the line

# A merged Area is one clickable shape, and chaining "merge into the smallest
# neighbour" without a cap produced 22-county blobs spanning most of a state.
MAX_MEMBERS = 8      # tune me: most counties one Area may contain

# state FIPS NOT subject to the threshold rule (the MT/WY/CO/NM line and west)
WEST_EXEMPT = {"02", "04", "06", "08", "15", "16", "30", "32", "35", "41", "49", "53", "56"}

# ---- AUTHORED_MERGES: each inner list becomes one Area (edit freely) ----
AUTHORED_MERGES = [
    ["53055", "53073"],                       # San Juan WA -> Whatcom WA
    ["02016", "02013", "02164", "02060",      # Aleutians West + East, Lake & Peninsula,
     "02150", "02070", "02050"],              #  Bristol Bay, Kodiak, Dillingham, Bethel
    ["25007", "25019", "25001"],              # Dukes + Nantucket -> Barnstable MA
]

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")


def main(out_path=None):
    with open(os.path.join(DATA, "game-data.json"), encoding="utf-8") as f:
        counties = json.load(f)["counties"]
    with open(os.path.join(DATA, "adjacency.json"), encoding="utf-8") as f:
        adj = json.load(f)["county"]

    pop = {f: (c["pop"] or 0) for f, c in counties.items()}
    st = {f: c["st"] for f, c in counties.items()}

    # union-find
    parent = {f: f for f in counties}
    def find(f):
        while parent[f] != f:
            parent[f] = parent[parent[f]]
            f = parent[f]
        return f
    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb

    # 1) authored merges
    for group in AUTHORED_MERGES:
        for f in group[1:]:
            if group[0] in counties and f in counties:
                union(f, group[0])

    # 2) Virginia independent cities -> surrounding county
    va_cities = [f for f in counties if st[f] == "51" and int(f[2:]) >= 510]
    for f in va_cities:
        nbs = [n for n in adj.get(f, []) if n in counties and st[n] == "51"]
        nb_counties = [n for n in nbs if int(n[2:]) < 510]
        base = counties[f]["name"].replace(" city", "").replace(" City", "")
        same = [n for n in nb_counties if counties[n]["name"].startswith(base)]
        target = (same or sorted(nb_counties, key=lambda n: -pop[n]) or
                  sorted(nbs, key=lambda n: -pop[n]) or [None])[0]
        if target:
            union(f, target)

    # 3) eastern small-Area threshold rule (same-state merges only)
    def group_pop(root):
        return sum(pop[f] for f in counties if find(f) == root)
    changed = True
    while changed:
        changed = False
        roots = {}
        for f in counties:
            roots.setdefault(find(f), []).append(f)
        gpop = {r: sum(pop[f] for f in ms) for r, ms in roots.items()}
        # Smallest deficient eastern group first. `r` is the tie-break so two
        # groups of identical population always resolve the same way.
        for r in sorted(roots, key=lambda r: (gpop[r], r)):
            if st[r] in WEST_EXEMPT or gpop[r] >= THRESHOLD:
                continue
            if len(roots[r]) >= MAX_MEMBERS:
                continue  # already as big a single shape as we allow
            neigh_roots = set()
            for f in roots[r]:
                for n in adj.get(f, []):
                    if n in counties and st[n] == st[r]:
                        rn = find(n)
                        if rn != r:
                            neigh_roots.add(rn)
            # Only neighbours that have room, and SORTED before the min() so the
            # tie-break is the fips, not CPython's randomised string hash order.
            cands = sorted(x for x in neigh_roots
                           if len(roots[r]) + len(roots[x]) <= MAX_MEMBERS)
            if not cands:
                continue
            target = min(cands, key=lambda x: (gpop[x], x))
            union(r, target)
            changed = True
            break  # recompute groups after each merge

    # assemble: primary = most-populous member; only multi-member Areas listed
    groups = {}
    for f in counties:
        groups.setdefault(find(f), []).append(f)
    areas = {}
    for members in groups.values():
        if len(members) < 2:
            continue
        primary = max(members, key=lambda f: pop[f])
        areas[primary] = sorted(members, key=lambda f: -pop[f])

    out = {"threshold": THRESHOLD, "max_members": MAX_MEMBERS,
           "areas": {k: areas[k] for k in sorted(areas)}}
    dest = out_path or os.path.join(DATA, "areas.json")
    with open(dest, "w", encoding="utf-8") as f:
        json.dump(out, f, separators=(",", ":"))

    n_before = len(counties)
    n_after = len(groups)
    per_state = {}
    for members in groups.values():
        per_state[st[members[0]]] = per_state.get(st[members[0]], 0) + 1
    print(f"units: {n_before} counties -> {n_after} areas ({len(areas)} merged groups)")
    print("NE:", per_state.get('31'), "| KS:", per_state.get('20'), "| UT:", per_state.get('49'),
          "| VA:", per_state.get('51'), "| TX:", per_state.get('48'))
    biggest = max((len(m) for m in areas.values()), default=0)
    print(f"largest Area: {biggest} counties (cap {MAX_MEMBERS})")
    print("output:", dest, f"({os.path.getsize(dest) // 1024} KB)")
    print("NOTE: Area ids are the join key for economy.json, parties.json, the map")
    print("      modes and every save. Run build/validate.py after any rebake.")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--out", help="write here instead of data/areas.json")
    main(ap.parse_args().out)
