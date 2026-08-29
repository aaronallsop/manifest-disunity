"""
Loader for county adjacency from the U.S. Census Bureau County Adjacency File
(build/raw/county_adjacency.txt) -> data/county_neighbors.json.

    python build/build_neighbors.py            # build only if the output is absent
    python build/build_neighbors.py --force    # re-parse the raw file

--force exists because this was a NO-OP once its output existed: `load_neighbors`
returned the cached JSON without ever looking at the raw file, so refreshing the
Census download could not regenerate the data and there was no way to tell the
script to try. A cache you cannot invalidate is not a cache.

KNOWN DATA PROBLEM. The shipped raw file is a PRE-2015 vintage. It still lists
Connecticut's eight abolished counties, has no planning regions, and carries
about 100 FIPS that no longer exist (build/validate.py counts them). It is also
missing Watonwan County MN (27165) entirely.

This file feeds the DISPLAY-ONLY "Neighbors - Census adjacency" row in the county
panel. Everything the simulation reads - annexation targets, contiguity, the
neighbour-pull term in political drift - comes from data/adjacency.json, which is
derived from the map geometry and is current. Do not wire game logic to this file
without refreshing the raw download first.

Output: { "01001": ["01021", "01047", ...], ... }  (self excluded)
"""

import argparse
import csv
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "raw", "county_adjacency.txt")
OUT = os.path.join(HERE, "..", "data", "county_neighbors.json")


def _parse(path):
    neighbors = {}
    current = None
    with open(path, encoding="latin-1", newline="") as f:
        for row in csv.reader(f, delimiter="\t"):
            if len(row) < 4:
                continue
            if row[0].strip():          # a 4-field line starts a new county block
                current = row[1].strip()
                neighbors[current] = []
            nb = row[3].strip()
            if current and nb and nb != current:   # skip the self-reference
                neighbors[current].append(nb)
    return neighbors


def load_neighbors(force=False):
    """Return the county->neighbors dict, re-parsing the raw file when forced."""
    if os.path.exists(OUT) and not force:
        with open(OUT, encoding="utf-8") as f:
            return json.load(f)
    if not os.path.exists(RAW):
        raise SystemExit(f"missing {RAW} - see build/raw/README.md for the download")
    neighbors = _parse(RAW)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(neighbors, f, separators=(",", ":"))
    return neighbors


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--force", action="store_true", help="re-parse the raw file")
    args = ap.parse_args()
    data = load_neighbors(args.force)
    total = sum(len(v) for v in data.values())
    print(f"counties: {len(data)}  |  total adjacency links: {total}")
    isolated = sorted(f for f, v in data.items() if not v)
    if isolated:
        print(f"counties with no neighbours on file: {isolated}")
    print(f"output: {os.path.relpath(OUT, HERE)} ({os.path.getsize(OUT) // 1024} KB)")
    print("NOTE: pre-2015 Census vintage - display only. run build/validate.py.")
