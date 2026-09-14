"""Build the systems map - one page showing how the game's systems act on each other.

The wiki's links already know more than Obsidian's graph can draw. Each one carries a
RELATION (gates, feeds, blocks, costs, triggers, explains, contradicts), a clause in
plain words, and the ruling it rests on. The graph view paints all of that as identical
grey lines, which is why it comes out a hairball.

This reads the same data and keeps it: systems arranged by the project's own filing
cabinet - the two frames, the six systems, the three substrates - with every link
coloured by what it actually does.

    python build/build_systems_map.py

Writes docs/wiki/systems-map.html, self-contained, no dependencies, no network.
"""

import json
import os
import re
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
OUT = os.path.join(ROOT, "docs", "wiki", "systems-map.html")
TEMPLATE = os.path.join(HERE, "systems_map_template.html")

# The filing cabinet, from docs/design/IDEATION-PLAN.md "The map of the whole game".
# Order here is the order round the ring, so the tiers sit together.
TIERS = [
    # The labels say what each tier IS rather than where it sits, because on a ring
    # "above everything" would end up printed at the bottom half the time.
    ("frame", "The two frames", ["playing", "story"]),
    ("system", "The six systems", ["secession", "politics", "military",
                                   "diplomacy", "economy", "events"]),
    ("substrate", "The three substrates", ["board", "people", "ideology"]),
]

ROUND_OF = {"secession": 1, "military": 2, "politics": 3,
            "economy": 4, "diplomacy": 5, "events": 6}


def read(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def git_say(args, fallback):
    try:
        out = subprocess.run(["git", "-C", ROOT] + args,
                             capture_output=True, text=True, timeout=10)
        return out.stdout.strip() or fallback
    except Exception:
        return fallback


def main():
    spine = read(os.path.join(HERE, "wiki_spine.json"))
    edges = read(os.path.join(HERE, "wiki_edges.json"))["edges"]
    movements = read(os.path.join(HERE, "wiki_movements.json"))["movements"]
    rulings = read(os.path.join(HERE, "wiki_rulings.json"))["rulings"]

    system_of, kind_of = {}, {}
    for p in spine["pages"]:
        system_of[p["page"]] = p["topic"]
        kind_of[p["page"]] = p.get("kind", "mechanic")
    for m in spine["master_topics"]:
        system_of[m["page"]] = m["topic"]
        kind_of[m["page"]] = "master"
    for m in movements:
        if m["live"]:
            system_of[m["name"]] = "secession"
            kind_of[m["name"]] = "movement"
    system_of["Movement register"] = "secession"
    kind_of["Movement register"] = "index"

    blurb = {m["topic"]: m["one_line"] for m in spine["master_topics"]}
    name_of = {m["topic"]: m["page"] for m in spine["master_topics"]}

    page_count = {}
    for p in spine["pages"]:
        page_count[p["topic"]] = page_count.get(p["topic"], 0) + 1

    ruling_count = {}
    for r in rulings:
        t = system_of.get(r["page"])
        if t:
            ruling_count[t] = ruling_count.get(t, 0) + 1

    systems = []
    for tier, tier_label, ids in TIERS:
        for sid in ids:
            systems.append({
                "id": sid,
                "name": name_of.get(sid, sid.title()),
                "tier": tier,
                "tierLabel": tier_label,
                "blurb": blurb.get(sid, ""),
                "pages": page_count.get(sid, 0),
                "rulings": ruling_count.get(sid, 0),
                "round": ROUND_OF.get(sid, 0),
            })

    known = set(system_of)
    out_edges, dropped = [], 0
    for e in edges:
        f, t = e["from"], e["to"]
        if f not in known or t not in known:
            dropped += 1
            continue
        out_edges.append({
            "f": f, "t": t,
            "fs": system_of[f], "ts": system_of[t],
            "fk": kind_of.get(f, "mechanic"), "tk": kind_of.get(t, "mechanic"),
            "r": e.get("relation", "FEEDS"),
            "c": (e.get("clause") or "").strip().rstrip("."),
            "e": e.get("evidence", ""),
            "q": e.get("confidence", "probable"),
        })

    data = {
        "stamp": "%s (%s)" % (git_say(["rev-parse", "--short", "HEAD"], "unknown"),
                              git_say(["log", "-1", "--format=%cs"], "unknown")),
        "systems": systems,
        "edges": out_edges,
        "counts": {
            "edges": len(out_edges),
            "pages": len(spine["pages"]) + len([m for m in movements if m["live"]]),
            "rulings": len(rulings),
        },
    }

    with open(TEMPLATE, encoding="utf-8") as f:
        html = f.read()
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    if "/*DATA*/" not in html:
        raise SystemExit("template has no /*DATA*/ placeholder")
    html = html.replace("/*DATA*/", payload)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(html)

    print("systems map: %d systems, %d links, %d dropped (endpoint not in the spine)"
          % (len(systems), len(out_edges), dropped))
    print("wrote %s" % os.path.relpath(OUT, ROOT))


if __name__ == "__main__":
    main()
