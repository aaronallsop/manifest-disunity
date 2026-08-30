#!/usr/bin/env python3
"""
Cross-file integrity check for data/. Run it after every bake.

The pipeline writes eight JSON files that join on two keys — the county FIPS and
the Area id — and nothing checked that the joins hold. The consequence, measured:
`Parties.setup` indexed the county table by raw FIPS while the runtime deletes the
1,467 counties merged into Areas, so **2,025 of 4,198 authored party references
(48.2%) silently resolved to nothing**. El Paso United spawned on 2 Areas of its
12. No warning, no count, no console message. This script is the check that would
have caught it the day the merge landed.

    python build/validate.py            # report and exit 1 on any ERROR
    python build/validate.py --strict   # exit 1 on warnings too
    python build/validate.py --quiet    # only ERROR/WARN lines

Every check names the file, the key and an example, because "3 keys do not
resolve" without the keys is not actionable.

Standard library only.
"""

import argparse
import json
import os
import sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")       # bake output
CONTENT = os.path.join(HERE, "..", "content") # authored, hand- or editor-written

# Connecticut abolished its eight counties in 2022. The base GEOMETRY still
# carries them; the game data carries the nine planning regions that replaced
# them. js/geo-ct.js holds the same table on the JS side — if you change one,
# change both.
OLD_CT = {"09001", "09003", "09005", "09007", "09009", "09011", "09013", "09015"}
CT_REGIONS = {"09110", "09120", "09130", "09140", "09150", "09160", "09170", "09180", "09190"}


class Report:
    def __init__(self, quiet=False):
        self.errors = []
        self.warnings = []
        self.notes = []
        self.quiet = quiet

    def error(self, check, msg):
        self.errors.append((check, msg))
        print(f"ERROR  {check}: {msg}")

    def warn(self, check, msg):
        self.warnings.append((check, msg))
        print(f"WARN   {check}: {msg}")

    def ok(self, check, msg):
        self.notes.append((check, msg))
        if not self.quiet:
            print(f"ok     {check}: {msg}")

    def info(self, msg):
        if not self.quiet:
            print(f"       {msg}")


def load(name, required=True, root=None):
    """Read a JSON file from data/ (bake output) or content/ (authored)."""
    path = os.path.join(root or DATA, name)
    if not os.path.exists(path):
        return None if not required else {}
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def sample(items, n=5):
    items = sorted(items)
    shown = ", ".join(items[:n])
    return shown + (f", … (+{len(items) - n} more)" if len(items) > n else "")


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--strict", action="store_true", help="exit 1 on warnings too")
    ap.add_argument("--quiet", action="store_true", help="only print problems")
    args = ap.parse_args()
    r = Report(args.quiet)

    game = load("game-data.json")
    areas_doc = load("areas.json", required=False) or {"areas": {}}
    adjacency = load("adjacency.json")
    counties = game.get("counties", {})
    states = game.get("states", {})
    areas = areas_doc.get("areas", {})

    if not counties:
        r.error("game-data", "data/game-data.json has no counties; nothing else can be checked")
        return 1

    # ---------------------------------------------------------------- Areas
    # The Area merge is the source of every join hazard downstream: it DELETES
    # the member counties from the runtime table.
    member_of = {}
    dup_members = defaultdict(list)
    for primary, members in areas.items():
        if primary not in counties:
            r.error("areas", f"Area primary {primary} is not a county in game-data.json")
        if primary not in members:
            r.error("areas", f"Area {primary} does not list itself among its members")
        for m in members:
            if m not in counties:
                r.error("areas", f"Area {primary} lists member {m}, which is not a county")
            if m in member_of and member_of[m] != primary:
                dup_members[m].append(primary)
            member_of[m] = primary
    for m, prims in dup_members.items():
        r.error("areas", f"county {m} is a member of more than one Area: {prims}")

    for primary in areas:
        owner = member_of.get(primary)
        if owner and owner != primary:
            r.error("areas", f"Area primary {primary} is also a member of Area {owner}")

    if not dup_members:
        r.ok("areas", f"{len(areas)} merged groups, {len(member_of)} member counties, no overlaps")

    # THE RESOLVER. This is exactly what Game.areaIdOf does at runtime: a raw
    # county FIPS resolves to its Area, and only Area primaries survive.
    alias = {m: p for p, ms in areas.items() for m in ms if m != p}
    live_areas = {f for f in counties if f not in alias}
    resolve = lambda f: alias.get(f, f)
    r.ok("areas", f"{len(counties)} counties collapse to {len(live_areas)} live Areas")

    sizes = Counter(len(m) for m in areas.values())
    biggest = max((len(m) for m in areas.values()), default=1)
    cap = areas_doc.get("max_members")
    if cap and biggest > cap:
        r.warn("areas", f"largest Area holds {biggest} counties against a declared cap of {cap}")
    elif biggest > 10:
        r.warn("areas", f"largest Area holds {biggest} counties — one clickable shape spanning "
                        f"most of a state. build_areas.py MAX_MEMBERS caps this on the next bake.")
    else:
        r.ok("areas", f"largest Area holds {biggest} counties")
    r.info(f"Area size histogram: {dict(sorted(sizes.items()))}")

    # ------------------------------------------------------- Area-keyed files
    def check_area_keys(label, keys, filename):
        dead = [k for k in keys if k not in live_areas]
        if dead:
            r.error(label, f"{filename}: {len(dead)} of {len(keys)} keys are not live Areas — "
                           f"{sample(dead)}")
        else:
            r.ok(label, f"{filename}: all {len(keys)} keys resolve to live Areas")

    economy = load("economy.json", required=False)
    if economy:
        check_area_keys("economy", list(economy.get("areas", {})), "economy.json")
        sectors = economy.get("sectors", [])
        bad = [k for k, v in economy.get("areas", {}).items() if len(v.get("v", [])) != len(sectors)]
        if bad:
            r.error("economy", f"{len(bad)} Areas have the wrong number of sector values — {sample(bad)}")

    # Authored in the editor and saved through PUT /api/content, so they live in
    # content/ with the rest of the authored data - not in data/, which is bake
    # output. They were the last authored files whose only publish path was the
    # user's Downloads folder (M2.5b).
    # ------------------------------------------------------- seats of government
    # Authored by county NAME and baked to a FIPS, so a typo is a loud miss here
    # rather than a silently wrong capital. Every one must also survive the Area
    # merge, which is the same hazard that discarded 48.2% of the party
    # references: several capitals sit in counties the merge deletes.
    caps_doc = load("capitals.json", required=False, root=CONTENT)
    if caps_doc:
        caps = caps_doc.get("capitals", {})
        missing_states = set(states) - set(caps)
        extra_states = set(caps) - set(states)
        if missing_states:
            r.error("capitals", f"{len(missing_states)} states have no seat of government "
                                f"— {sample(missing_states)}")
        if extra_states:
            r.error("capitals", f"{len(extra_states)} seats name a state that does not exist "
                                f"— {sample(extra_states)}")
        bad_fips, wrong_state, unresolved = [], [], []
        for st, rec in caps.items():
            fips = rec.get("fips")
            if fips not in counties:
                bad_fips.append(f"{rec.get('city')} -> {fips}")
                continue
            if counties[fips].get("st") != st:
                wrong_state.append(f"{rec.get('city')} ({fips}) is in state "
                                   f"{counties[fips].get('st')}, not {st}")
            if member_of.get(fips, fips) not in counties:
                unresolved.append(f"{rec.get('city')} ({fips})")
        if bad_fips:
            r.error("capitals", f"{len(bad_fips)} seats resolve to no county — {sample(bad_fips)}")
        if wrong_state:
            r.error("capitals", f"{len(wrong_state)} seats sit in the wrong state — {sample(wrong_state)}")
        if unresolved:
            r.error("capitals", f"{len(unresolved)} seats do not survive the Area merge "
                                f"— {sample(unresolved)}")
        if not (bad_fips or wrong_state or unresolved or missing_states or extra_states):
            merged = sum(1 for rec in caps.values()
                         if member_of.get(rec["fips"], rec["fips"]) != rec["fips"])
            r.ok("capitals", f"all {len(caps)} seats of government resolve to live Areas")
            r.info(f"{merged} of {len(caps)} sit in a county the Area merge folds into a larger "
                   f"Area — they must be looked up through the alias, never directly.")

    for mode_file in ("geographical.json", "cultural.json"):
        mode = load(mode_file, required=False, root=CONTENT)
        if not mode:
            continue
        assign = mode.get("assign", {})
        check_area_keys("mapmode", list(assign), mode_file)
        node_ids = set()

        def walk(nodes):
            for n in nodes:
                node_ids.add(n["id"])
                walk(n.get("children", []))
        walk(mode.get("nodes", []))
        dangling = {nid for path in assign.values() for nid in path} - node_ids
        if dangling:
            r.error("mapmode", f"{mode_file}: {len(dangling)} assigned node ids do not exist in the "
                               f"tree — {sample(dangling)}")
        if mode.get("requireAll"):
            missing = live_areas - set(assign)
            if missing:
                r.warn("mapmode", f"{mode_file} declares requireAll but {len(missing)} live Areas "
                                  f"are unassigned — {sample(missing)}")

    # ------------------------------------------------- county-keyed files
    parties = load("parties.json", required=False) or {}
    if parties:
        total = unresolved = 0
        raw_misses = 0
        per_party = {}
        for name, d in parties.items():
            refs = d.get("counties", [])
            total += len(refs)
            bad = [f for f in refs if resolve(f) not in live_areas]
            raw_misses += sum(1 for f in refs if f not in live_areas)
            unresolved += len(bad)
            per_party[name] = (len(refs), len({resolve(f) for f in refs}), len(bad))
            if bad:
                r.error("parties", f'"{name}": {len(bad)} of {len(refs)} FIPS resolve to no live '
                                   f"Area — {sample(bad)}")
        if not unresolved:
            r.ok("parties", f"all {total} authored references across {len(parties)} movements "
                            f"resolve through the Area alias")
        # The measurement from finding 3, kept live so a regression is visible.
        if raw_misses:
            pct = 100.0 * raw_misses / total if total else 0
            r.info(f"{raw_misses} of {total} ({pct:.1f}%) references point at a county that the "
                   f"Area merge DELETES — they must be resolved through the alias, never looked "
                   f"up directly (finding 3).")

        # coverage: Areas that can never receive a movement
        reachable = {resolve(f) for d in parties.values() for f in d.get("counties", [])}
        unreachable = live_areas - reachable
        if unreachable:
            by_state = Counter(f[:2] for f in unreachable)
            whole_states = [s for s in by_state
                            if by_state[s] == len({f for f in live_areas if f.startswith(s)})]
            r.warn("parties", f"{len(unreachable)} of {len(live_areas)} Areas can never receive a "
                              f"movement; {len(whole_states)} states have NO coverage at all: "
                              f"{sorted(whole_states)}")

    for fname, key in (("county_trade.json", "counties"), ("transport.json", "counties")):
        doc = load(fname, required=False)
        if not doc:
            continue
        keys = list(doc.get(key, {}))
        ghost = [k for k in keys if k not in counties]
        if ghost:
            r.error("trade/transport", f"{fname}: {len(ghost)} county keys are not in "
                                       f"game-data.json — {sample(ghost)}")
        else:
            r.ok("trade/transport", f"{fname}: all {len(keys)} county keys are real counties")
        # A county that exists but whose Area sibling carries the attribute is
        # fine; a county that exists in NEITHER form is the Valdez-Cordova case.
        orphaned = [k for k in keys if k in counties and resolve(k) not in live_areas]
        if orphaned:
            r.error("trade/transport", f"{fname}: {len(orphaned)} keys resolve to a dead Area — "
                                       f"{sample(orphaned)}")

    # --------------------------------------------------------- adjacency
    cadj = adjacency.get("county", {}) if adjacency else {}
    if cadj:
        no_neighbours = sorted(f for f in live_areas
                               if not {resolve(n) for n in cadj.get(f, [])} - {f}
                               and not any(
                                   {resolve(n) for n in cadj.get(m, [])} - {f}
                                   for m in areas.get(f, [])))
        if no_neighbours:
            by_state = Counter(f[:2] for f in no_neighbours)
            r.error("adjacency", f"{len(no_neighbours)} live Areas have NO neighbours and are "
                                 f"mechanically inert — {sample(no_neighbours)} "
                                 f"(by state: {dict(by_state)})")
        else:
            r.ok("adjacency", "every live Area has at least one neighbour")

        ghost_refs = {n for nbs in cadj.values() for n in nbs if n not in counties}
        if ghost_refs:
            r.warn("adjacency", f"{len(ghost_refs)} referenced FIPS do not exist in game-data.json "
                                f"— {sample(ghost_refs)}")

        asym = []
        for f, nbs in cadj.items():
            for n in nbs:
                if n in cadj and f not in cadj[n]:
                    asym.append(f"{f}->{n}")
        if asym:
            r.warn("adjacency", f"{len(asym)} asymmetric county links — {sample(asym)}")
        else:
            r.ok("adjacency", f"county adjacency is symmetric across {len(cadj)} entries")

    neighbors = load("county_neighbors.json", required=False)
    if neighbors:
        ghost = [k for k in neighbors if k not in counties]
        if ghost:
            r.warn("neighbors", f"county_neighbors.json: {len(ghost)} keys are not real counties — "
                                f"{sample(ghost)}. It is built from a PRE-2015 Census adjacency "
                                f"file (obsolete CT counties, no planning regions).")

    # -------------------------------------------------------- Connecticut
    ct_in_data = {f for f in counties if f.startswith("09")}
    if ct_in_data & OLD_CT:
        r.error("connecticut", f"game-data.json still carries abolished CT counties: "
                               f"{sample(ct_in_data & OLD_CT)}")
    missing_regions = CT_REGIONS - ct_in_data
    if missing_regions:
        r.error("connecticut", f"game-data.json is missing CT planning regions: "
                               f"{sample(missing_regions)}")
    if not (ct_in_data & OLD_CT) and not missing_regions:
        r.ok("connecticut", "game-data.json holds the nine planning regions and none of the eight "
                            "abolished counties")
    ct_areas = [a for a in areas if a.startswith("09")]
    if ct_areas:
        r.warn("connecticut", f"areas.json now has CT entries ({ct_areas}); js/geo-ct.js assumes it "
                              f"has none — re-read the note there")

    # ------------------------------------------------------------- states
    st_counts = Counter(c["st"] for c in counties.values())
    empty = [s for s in states if st_counts.get(s, 0) == 0]
    if empty:
        r.error("states", f"{len(empty)} states have no counties: {sample(empty)}")
    unknown = [s for s in st_counts if s not in states]
    if unknown:
        r.error("states", f"counties reference {len(unknown)} states not in game-data.states: "
                          f"{sample(unknown)}")
    if not empty and not unknown:
        r.ok("states", f"{len(states)} states, every one populated")

    # ---------------------------------------------------------- geometry
    topo = load("counties-10m.json", required=False)
    if topo:
        geom_ids = {g.get("id") for g in topo["objects"]["counties"]["geometries"]}
        drawable = (geom_ids - OLD_CT) | CT_REGIONS  # CT comes from the separate geojson
        undrawable = sorted(f for f in live_areas if f not in drawable)
        if undrawable:
            r.error("geometry", f"{len(undrawable)} live Areas have no shape to draw — "
                                f"{sample(undrawable)}")
        else:
            r.ok("geometry", f"every live Area has a shape ({len(geom_ids)} county geometries)")

    # -------------------------------------------------------------- done
    print()
    print(f"{len(r.errors)} error(s), {len(r.warnings)} warning(s), {len(r.notes)} check(s) passed")
    if r.errors:
        return 1
    if args.strict and r.warnings:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
