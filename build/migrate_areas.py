#!/usr/bin/env python3
"""
ONE-TIME migration for an Area re-bake (M9.6).

`build_areas.py` was made deterministic and given a MAX_MEMBERS cap in M1.13b,
but the shipped `data/areas.json` was never re-baked, because an Area id is the
join key for `economy.json`, both map modes, every authored homeland and every
save (D36). `build/validate.py` has warned about the surviving 22-county blob on
every run since.

THIS SCRIPT IS THE MIGRATION THAT WARNING WAS WAITING FOR. It does the one thing
the re-bake cannot do for itself: carry the AUTHORED data across. Everything
else in the pipeline is derived and simply gets re-run.

    python build/migrate_areas.py            # migrate in place
    python build/migrate_areas.py --dry-run  # report, write nothing

WHAT MOVES, AND THE RULE.

`content/geographical.json` and `content/cultural.json` are `{areaId: [nodeId]}`
maps — a human decided which region each Area belongs to, one Area at a time,
and that judgement is not derivable from anything. A re-bake regroups counties,
so some Area ids vanish, some appear, and some keep their id while changing
membership.

The rule is INHERIT THROUGH THE PRIMARY COUNTY: a new Area takes the assignment
of whichever old Area contained the county that is now its primary. That is the
same rule the game itself uses for every other question about a merged Area —
the primary is the Area — and it means no assignment is invented and none is
lost. Where a new Area spans counties that were in two different old Areas, the
primary decides, exactly as it decides the Area's name, its seat and its id.

ORDER MATTERS. `build_economy.py` reads `areas.json`; `build_parties.py` reads
`areas.json` AND `content/cultural.json`, because a homeland is authored as
culture nodes and expanded into member counties (M7 close). So: areas, then the
map modes, then economy, then parties. Run `build/validate.py` afterwards,
always.

WHAT THIS INVALIDATES. Every save. `js/saves.js` bumps its VERSION in the same
commit and refuses an older document by name rather than migrating it, for the
reason the v1 refusal gives: a migration here would have to invent which Area
1,676 counties belong to, and a clear message beats a plausible lie.
"""

import argparse
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "data")
CONTENT = os.path.join(ROOT, "content")

MAPMODES = ["geographical.json", "cultural.json"]


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save(path, obj):
    # Match the pipeline's house format: compact separators, stable key order.
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"), sort_keys=False)
        f.write("\n")


def owner_map(areas):
    """
    county FIPS -> the primary of the Area holding it.

    Only MERGED counties appear. `areas.json` lists the merge groups and nothing
    else, because an unmerged county is an Area on its own and saying so 1,193
    times would be a file that says nothing 1,193 times. So the identity is
    implicit: `owner.get(fips, fips)`.
    """
    out = {}
    for primary, members in areas.items():
        for fips in members:
            out[fips] = primary
    return out


def area_ids(areas, counties):
    """
    Every Area id, which is NOT the same thing as every merge group.

    A county is an Area exactly when it is its own owner: either it heads a
    merge group, or it was never merged into one. Getting this wrong is how the
    first cut of this script reported 507 Areas against a 1,676-entry authored
    map and offered to throw 1,192 of them away.
    """
    own = owner_map(areas)
    return [c for c in counties if own.get(c, c) == c]


def migrate_assign(assign, old_owner, new_ids, label):
    """
    Carry an authored {areaId: [nodeId]} map onto the new Area plan.

    Returns (migrated, report). Every new Area gets exactly one answer, and the
    report says how it was reached, because a migration nobody can audit is a
    migration nobody should run.
    """
    out = {}
    kept = inherited = orphaned = 0
    orphans = []
    for primary in new_ids:
        if primary in assign:
            out[primary] = assign[primary]
            kept += 1
            continue
        # This county is a primary now and was a MEMBER of some old Area (or, if
        # it was never merged either way, itself). Take that Area's region.
        was = old_owner.get(primary, primary)
        if was in assign:
            out[primary] = assign[was]
            inherited += 1
            continue
        # Nothing to inherit: the county was outside the authored map entirely,
        # which can only happen if that map was already incomplete.
        orphaned += 1
        orphans.append(primary)
    dropped = len(assign) - kept
    report = (f"{label}: {len(out)} Areas "
              f"({kept} kept their id, {inherited} inherited through their primary, "
              f"{orphaned} unassigned) — {dropped} old ids retired")
    return out, report, orphans


def run(script, dry):
    if dry:
        print(f"  [dry-run] would run {script}")
        return
    print(f"  running {script} …")
    r = subprocess.run([sys.executable, os.path.join(HERE, script)],
                       capture_output=True, text=True)
    for line in (r.stdout or "").strip().splitlines():
        print("    " + line)
    if r.returncode != 0:
        print((r.stderr or "").strip())
        raise SystemExit(f"{script} failed with code {r.returncode}")


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dry-run", action="store_true",
                    help="report what would change and write nothing")
    args = ap.parse_args()
    dry = args.dry_run

    counties = list(load(os.path.join(DATA, "game-data.json"))["counties"].keys())
    old_areas = load(os.path.join(DATA, "areas.json"))["areas"]
    old_owner = owner_map(old_areas)
    old_ids = area_ids(old_areas, counties)

    # 1. THE RE-BAKE ITSELF. Written to a scratch path first so the map-mode
    #    migration can read the OLD plan and the NEW one at the same time.
    scratch = os.path.join(DATA, "areas.rebake.json")
    print("1. re-baking areas …")
    r = subprocess.run([sys.executable, os.path.join(HERE, "build_areas.py"),
                        "--out", scratch], capture_output=True, text=True)
    for line in (r.stdout or "").strip().splitlines():
        print("    " + line)
    if r.returncode != 0:
        print((r.stderr or "").strip())
        raise SystemExit("build_areas.py failed")
    new_doc = load(scratch)
    new_areas = new_doc["areas"]

    new_ids = area_ids(new_areas, counties)
    shared = set(old_ids) & set(new_ids)
    print(f"    merge groups {len(old_areas)} -> {len(new_areas)}")
    print(f"    AREAS {len(old_ids)} -> {len(new_ids)} "
          f"({len(set(old_ids) - shared)} retired, {len(set(new_ids) - shared)} new)")

    # 2. THE AUTHORED MAPS, carried across.
    print("2. migrating the authored map modes …")
    all_orphans = {}
    migrated = {}
    for name in MAPMODES:
        path = os.path.join(CONTENT, name)
        if not os.path.exists(path):
            print(f"    {name}: absent, skipped")
            continue
        doc = load(path)
        out, report, orphans = migrate_assign(doc.get("assign", {}), old_owner, new_ids, name)
        print("    " + report)
        if orphans:
            print(f"      unassigned: {', '.join(orphans[:12])}"
                  + (" …" if len(orphans) > 12 else ""))
        all_orphans[name] = orphans
        doc["assign"] = out
        migrated[path] = doc

    if dry:
        print("dry run: nothing written")
        os.remove(scratch)
        return

    # 3. COMMIT, areas first — everything downstream reads it.
    os.replace(scratch, os.path.join(DATA, "areas.json"))
    for path, doc in migrated.items():
        save(path, doc)
    print("    written")

    # 4. THE DERIVED BAKES, in dependency order.
    print("3. re-baking what depends on it …")
    run("build_economy.py", dry)      # keyed by Area id
    run("build_parties.py", dry)      # homelands expand through areas + cultural

    print("4. validating …")
    run("validate.py", dry)
    print("\nDone. Saves written before this point are refused by version, not "
          "migrated — see js/saves.js.")


if __name__ == "__main__":
    main()
