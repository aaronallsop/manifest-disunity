"""
Bake data/parties.json: emergent regional-party definitions.

============================ EDITABLE TABLE ====================================
Edit REGIONS below (and SPAWN_CHANCE / SHARE_RANGE), then re-run:
    python build/build_parties.py

Each region resolves to a county list via any of these rule fields:
  states    : list of 2-digit state FIPS -- all counties in those states
  min_pop   : keep only counties with population  > this
  max_pop   : keep only counties with population  < this
  lean      : "R" or "D" -- keep only counties leaning that way (2024 data)
  fips      : hand-picked county FIPS added to the result (always included)
  mt_interior : True -> Montana counties whose neighbors are ALL in Montana
  chance / share : per-party overrides of SPAWN_CHANCE / SHARE_RANGE

Judgment calls (marked *): El Paso United = Trans-Pecos reading; Deseret =
Utah + SE Idaho + Elko NV; Great Lakes / Absaroka / tech hubs are hand lists.
================================================================================
"""

import json
import os

SPAWN_CHANCE = 0.5          # default probability each party spawns at setup
SHARE_RANGE = [0.00, 0.20]  # initial county share range X (modest; growth later)

SOUTH = ["12", "13", "01", "22", "48", "40", "29", "28", "47", "21", "54", "51", "37", "45", "05"]
NEW_ENGLAND = ["09", "23", "25", "33", "44", "50"]
GREAT_PLAINS = ["38", "46", "31", "20", "40"]
MIDWEST = ["39", "26", "18", "17", "55", "27", "19", "29"]
EAST_COAST = ["23", "33", "25", "44", "09", "36", "34", "42", "10", "24", "11", "51", "37", "45", "13", "12"]
CONFEDERACY = ["45", "28", "12", "01", "13", "22", "48", "51", "05", "47", "37"]
NORTHERN_CA = ["06015", "06093", "06049", "06023", "06105", "06089", "06035", "06103", "06063",
               "06007", "06021", "06045", "06033", "06011", "06115", "06101", "06057", "06091"]
TECH_HUBS = ["06085", "06081", "06001", "06075",          # Silicon Valley + SF
             "48453", "48491",                            # Austin TX
             "53033",                                     # Seattle (King)
             "25017", "25025",                            # Cambridge cluster
             "49035", "49049"]                            # Salt Lake + Utah County
DESERET_FIPS = ["16005", "16007", "16011", "16019", "16029", "16031", "16041", "16051",
                "16065", "16071", "16077", "32007"]       # *SE Idaho + Elko NV
GREAT_LAKES = ["27137", "27075", "27031", "55003", "55007", "55013", "55031", "55061", "55071",
               "55029", "55009", "55079", "55089", "55101", "55059", "17097", "17031", "17197",
               "18089", "18091", "18127", "26005", "26021", "26027", "26105", "26121", "26139",
               "26161", "26163", "26147", "26099", "26049", "26011", "26017", "26029", "26055",
               "26089", "26101", "26031", "26141", "26043", "26053", "26071", "26103", "26109",
               "26131", "26153", "39095", "39123", "39043", "39077", "39093", "39035", "39085",
               "39007", "42049", "36029", "36063", "36073", "36055", "36117", "36075", "36045",
               "36089", "36049", "36059"]                  # *hand list, editable
ABSAROKA = ["56033", "56019", "56005", "56011", "56045", "56003", "56043", "56017", "56029",
            "30011", "30075", "30017", "30025", "30003", "30087", "30103", "30111",
            "46019", "46081", "46093", "46103", "46033", "46047", "46063", "46105"]
EL_PASO = ["48141", "48229", "48109", "48243", "48377", "48043", "48443", "48389",
           "48301", "48475", "48495", "48371"]            # *Trans-Pecos

REGIONS = {
    "Christian Nationalism":     {"states": SOUTH, "min_pop": 100_000},
    "Cascadian Separatists":     {"states": ["41", "53", "16", "30"], "lean": "R", "fips": NORTHERN_CA},
    "New England United":        {"states": NEW_ENGLAND},
    "Anarcho-Capitalist":        {"mt_interior": True},
    "Libertarians":              {"states": GREAT_PLAINS},
    "Blue-Collar Populist":      {"states": ["39", "26", "18", "17", "55", "42"]},
    "Techno-Autocrat":           {"fips": TECH_HUBS},
    "A Free Texas":              {"states": ["48"]},
    "Deseret":                   {"states": ["49"], "fips": DESERET_FIPS},
    "New Confederacy":           {"states": CONFEDERACY},
    "Great Lakes Free Trade":    {"fips": GREAT_LAKES},
    "New Absaroka":              {"fips": ABSAROKA},
    "El Paso United":            {"fips": EL_PASO},
    "Northern Christian Kingdom": {"states": ["41", "53"], "lean": "R",
                                   "fips_states": ["16", "30", "56"]},
    "The Farmers Union":         {"states": GREAT_PLAINS + MIDWEST, "max_pop": 100_000},
    "Eastern Progressives":      {"states": EAST_COAST, "min_pop": 500_000},
}
# ============================ END EDITABLE TABLE ================================

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")


def main():
    with open(os.path.join(DATA, "game-data.json"), encoding="utf-8") as f:
        counties = json.load(f)["counties"]
    with open(os.path.join(DATA, "adjacency.json"), encoding="utf-8") as f:
        adj = json.load(f)["county"]

    def resolve(rule):
        out = set(rule.get("fips", []))
        for st in rule.get("fips_states", []):          # whole states, unfiltered
            out |= {f for f, c in counties.items() if c["st"] == st}
        pool = [f for f, c in counties.items() if c["st"] in rule.get("states", [])]
        for f in pool:
            c = counties[f]
            if rule.get("min_pop") and (c["pop"] or 0) <= rule["min_pop"]:
                continue
            if rule.get("max_pop") and (c["pop"] or 0) >= rule["max_pop"]:
                continue
            if rule.get("lean") == "R" and not ((c["gop"] or 0) > (c["dem"] or 0)):
                continue
            if rule.get("lean") == "D" and not ((c["dem"] or 0) > (c["gop"] or 0)):
                continue
            out.add(f)
        if rule.get("mt_interior"):
            out |= {f for f in counties if f[:2] == "30"
                    and all(n[:2] == "30" for n in adj.get(f, []))}
        return sorted(f for f in out if f in counties)

    defs = {}
    for name, rule in REGIONS.items():
        defs[name] = {
            "chance": rule.get("chance", SPAWN_CHANCE),
            "share": rule.get("share", SHARE_RANGE),
            "counties": resolve(rule),
        }
        print(f"{name:28} {len(defs[name]['counties']):>5} counties")

    out_path = os.path.join(DATA, "parties.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(defs, f, separators=(",", ":"))
    print(f"\noutput: data/parties.json ({os.path.getsize(out_path) // 1024} KB)")


if __name__ == "__main__":
    main()
