"""
One-time loader for county adjacency from the U.S. Census Bureau County Adjacency
File (build/raw/county_adjacency.txt). Parses it once and caches the result to
data/county_neighbors.json so the raw file is never parsed again.

Output: { "01001": ["01021", "01047", ...], ... }  (self excluded)
"""

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


def load_neighbors():
    """Return the cached county->neighbors dict, building it once if needed."""
    if os.path.exists(OUT):
        with open(OUT, encoding="utf-8") as f:
            return json.load(f)
    neighbors = _parse(RAW)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(neighbors, f, separators=(",", ":"))
    return neighbors


if __name__ == "__main__":
    data = load_neighbors()
    total = sum(len(v) for v in data.values())
    print(f"counties: {len(data)}  |  total adjacency links: {total}")
    print(f"output: {os.path.relpath(OUT, HERE)} ({os.path.getsize(OUT) // 1024} KB)")
