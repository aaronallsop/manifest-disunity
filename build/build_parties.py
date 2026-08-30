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
import re

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

# ---- M1.13f: five states could not receive ANY movement -------------------
# Alaska, Arizona, Colorado, Hawaii and New Mexico had no homeland in this
# table at all, so 348 of 1,676 Areas were permanently outside the emergent-
# movement system: no separatism, no sentiment, nothing for two-tier secession
# to build on. The regions below close that gap and add the three movements
# docs/REBUILD-PLAN.md M4.1 names by name.

# Greater Idaho: the real proposal to move Oregon's rural east into Idaho.
GREATER_IDAHO = ["41045", "41001", "41023", "41025", "41063", "41061", "41059",
                 "41049", "41021", "41069", "41013", "41031", "41035", "41037",
                 "41033", "41029", "41019"]               # *E + S Oregon
# Jefferson: the 1941 State of Jefferson, far northern CA + southern OR.
JEFFERSON = ["06015", "06093", "06049", "06023", "06105", "06089", "06035",
             "06103", "06063", "41015", "41033", "41029", "41019", "41011"]
# Tribal-majority and reservation counties across the interior West and Plains.
NATIVE_CONFED = ["04001", "04017", "04005", "04003", "04009", "04023",   # AZ
                 "35031", "35045", "35006", "35039", "35043", "35055", "35049",  # NM
                 "49037", "46102", "46121", "46041", "46137", "46031", "46017", "46007",
                 "30003", "30035", "30085", "30087", "30005", "30041",   # MT
                 "38085", "38079", "38005", "38061",                     # ND
                 "40021", "40001", "40041", "40113", "40097", "40135", "40091",
                 "02050", "02070", "02180", "02185", "02188", "02270"]   # AK
# Alaskan Independence: a real party that has held statewide office.
ALASKA_STATES = ["02"]
# Hawaiian sovereignty, a live political tradition since 1893.
HAWAII_STATES = ["15"]
# Front Range: Colorado's urban corridor, which votes nothing like its plains.
FRONT_RANGE = ["08031", "08013", "08059", "08001", "08005", "08035", "08041",
               "08069", "08123", "08101", "08014"]
# Sonoran Republic: the Arizona borderlands.
SONORAN = ["04019", "04023", "04003", "04027", "04021", "04012", "04013", "04007"]
# Rio Grande Union: the New Mexico corridor from Las Cruces to Taos.
RIO_GRANDE = ["35001", "35049", "35035", "35029", "35017", "35023", "35051",
              "35053", "35061", "35057", "35007", "35033", "35047", "35043",
              "35039", "35055"]

# ---- IDEOLOGY: every movement sits somewhere on the two axes -------------
# The six ideologies are authored in content/ideologies.json. A movement is not
# an ideology - it is an organised faction that HAS one (see REBUILD-PLAN M4.1:
# a Movement is {id, ideology, type, homeland[], ...}). This mapping is what
# lets the model carry six symmetric ideologies as the political truth while
# movements stay named, regional and separately trackable.
#
#   red    Republican                mainstream market right
#   blue   Democrat                  mainstream liberal
#   green  Democratic Socialist      economically left, socially liberal
#   yellow Conservative Nationalist  economically right, socially traditional
#   orange Distributist              economically left, socially traditional
#   purple Socialist                 furthest economically left
IDEOLOGY = {
    "Christian Nationalism":         "yellow",
    "Cascadian Separatists":         "green",
    "New England United":            "blue",
    "Anarcho-Capitalist":            "red",
    "Libertarians":                  "red",
    "Blue-Collar Populist":          "orange",
    "Techno-Autocrat":               "yellow",
    "A Free Texas":                  "red",
    "Deseret":                       "yellow",
    "New Confederacy":               "yellow",
    "Great Lakes Free Trade":        "blue",
    "New Absaroka":                  "red",
    "El Paso United":                "orange",
    "Northern Christian Kingdom":    "yellow",
    "The Farmers Union":             "orange",
    "Eastern Progressives":          "green",
    "Greater Idaho":                 "red",
    "State of Jefferson":            "red",
    "Native American Confederation": "orange",
    "Alaskan Independence":          "red",
    "Hawaiian Sovereignty":          "orange",
    "Front Range Republic":          "blue",
    "Sonoran Republic":              "orange",
    "Rio Grande Union":              "green",
}

REGIONS = {
    "Christian Nationalism":     {"states": SOUTH, "min_pop": 100_000},
    # chance 1.0: the plan names Cascadia, Deseret, Greater Idaho and Jefferson
    # as the DETERMINISTIC four. They are the spine of the West slice, and a run
    # that happens to have no Deseret in it is not the scenario. Only Greater
    # Idaho and Jefferson carried the flag; these two were still rolling 0.5.
    "Cascadian Separatists":     {"states": ["41", "53", "16", "30"], "lean": "R",
                                  "fips": NORTHERN_CA, "chance": 1.0},
    "New England United":        {"states": NEW_ENGLAND},
    "Anarcho-Capitalist":        {"mt_interior": True},
    "Libertarians":              {"states": GREAT_PLAINS},
    "Blue-Collar Populist":      {"states": ["39", "26", "18", "17", "55", "42"]},
    "Techno-Autocrat":           {"fips": TECH_HUBS},
    "A Free Texas":              {"states": ["48"]},
    "Deseret":                   {"states": ["49"], "fips": DESERET_FIPS, "chance": 1.0},
    "New Confederacy":           {"states": CONFEDERACY},
    "Great Lakes Free Trade":    {"fips": GREAT_LAKES},
    "New Absaroka":              {"fips": ABSAROKA},
    "El Paso United":            {"fips": EL_PASO},
    "Northern Christian Kingdom": {"states": ["41", "53"], "lean": "R",
                                   "fips_states": ["16", "30", "56"]},
    "The Farmers Union":         {"states": GREAT_PLAINS + MIDWEST, "max_pop": 100_000},
    "Eastern Progressives":      {"states": EAST_COAST, "min_pop": 500_000},

    # --- M1.13f: the five states with no coverage, plus the three movements
    #     docs/REBUILD-PLAN.md M4.1 names. Deterministic movements (Cascadia,
    #     Deseret, Greater Idaho, Jefferson) get chance 1.0; the rest roll.
    "Greater Idaho":             {"fips": GREATER_IDAHO, "chance": 1.0},
    "State of Jefferson":        {"fips": JEFFERSON, "chance": 1.0},
    "Native American Confederation": {"fips": NATIVE_CONFED, "share": [0.05, 0.30]},
    "Alaskan Independence":      {"states": ALASKA_STATES},
    "Hawaiian Sovereignty":      {"states": HAWAII_STATES, "share": [0.05, 0.30]},
    "Front Range Republic":      {"fips": FRONT_RANGE},
    "Sonoran Republic":          {"fips": SONORAN},
    "Rio Grande Union":          {"fips": RIO_GRANDE},
}

# ============================ MOVEMENT CHARACTER =============================
# M4.1 gives a Movement more than a homeland and an ideology.
#
#   type       what KIND of thing this is. It decides nothing mechanical yet;
#              M6's AI reads it to know what a movement will negotiate over, and
#              the UI reads it to say what the thing on the map IS.
#   growthCap  the ceiling on its share of any one Area, replacing the single
#              global world.partyCeiling. A fringe movement should stay fringe:
#              one number per movement is what makes "the Anarcho-Capitalists
#              are a nuisance" and "Deseret is a country in waiting" different
#              facts rather than the same fact at different times.
#   goals      what it actually wants, in its own words. Authored flavour today,
#              M6 negotiation hooks tomorrow. A movement with no stated goal is
#              one the player has no way to satisfy.
#
# The DETERMINISTIC four the plan names - Cascadia, Deseret, Greater Idaho,
# Jefferson - carry chance 1.0 in REGIONS above and the highest caps here: they
# are the spine of the West slice and a scenario that sometimes has no Deseret
# in it is not the scenario.
CHARACTER = {
    # name:                          (type, growthCap, [goals])
    "Cascadian Separatists":         ("separatist", 0.55, ["independence", "environmental sovereignty"]),
    "Deseret":                       ("theocratic-separatist", 0.60, ["independence", "religious autonomy"]),
    "Greater Idaho":                 ("irredentist", 0.50, ["annex eastern Oregon", "rural self-rule"]),
    "State of Jefferson":            ("separatist", 0.50, ["statehood", "rural self-rule"]),
    "New Absaroka":                  ("separatist", 0.40, ["statehood", "resource rights"]),
    "Native American Confederation": ("indigenous", 0.45, ["sovereignty", "land restoration"]),

    "Christian Nationalism":         ("ideological", 0.45, ["religious government", "moral law"]),
    "New Confederacy":               ("separatist", 0.45, ["independence", "states rights"]),
    "A Free Texas":                  ("separatist", 0.50, ["independence", "border control"]),
    "Northern Christian Kingdom":    ("theocratic-separatist", 0.40, ["religious government", "independence"]),
    "Alaskan Independence":          ("separatist", 0.45, ["independence", "resource royalties"]),
    "Hawaiian Sovereignty":          ("indigenous", 0.45, ["sovereignty", "land restoration"]),
    "Sonoran Republic":              ("separatist", 0.40, ["independence", "water rights"]),
    "Rio Grande Union":              ("separatist", 0.40, ["independence", "open border"]),
    "Front Range Republic":          ("separatist", 0.35, ["independence", "urban self-rule"]),
    "El Paso United":                ("autonomist", 0.35, ["regional autonomy", "cross-border trade"]),

    "New England United":            ("autonomist", 0.35, ["regional federation", "social democracy"]),
    "Eastern Progressives":          ("ideological", 0.35, ["social democracy", "civil liberties"]),
    "Great Lakes Free Trade":        ("economic", 0.30, ["free trade bloc", "water compact"]),
    "Blue-Collar Populist":          ("ideological", 0.35, ["industrial policy", "tariffs"]),
    "The Farmers Union":             ("economic", 0.30, ["farm price supports", "rural credit"]),
    "Libertarians":                  ("ideological", 0.30, ["minimal government", "free markets"]),
    "Anarcho-Capitalist":            ("ideological", 0.25, ["abolish the state", "free markets"]),
    "Techno-Autocrat":               ("ideological", 0.30, ["technocracy", "network states"]),
}
DEFAULT_TYPE = "ideological"
DEFAULT_CAP = 0.35

# A movement DECLARES (M4.3 tier 2) when every Area in its CORE has crossed the
# sentiment threshold, so the core decides how hard that is. Rather than
# hand-authoring twenty-four county lists - which is data entry that goes stale
# the moment areas.json is re-baked - the core is DERIVED: the smallest set of
# homeland Areas that between them hold CORE_SHARE of the homeland's population.
#
# That is the principled reading of "heartland": a movement declares when it
# holds the places its people actually live. It produces the right answers by
# construction - Deseret's core is the Wasatch Front, Cascadia's is the
# Portland-Seattle corridor - and it re-derives itself whenever the map does.
CORE_SHARE = 0.60
# ...but never fewer than this many places. Some homelands are dominated by a
# single metro - El Paso United, Hawaiian Sovereignty and the Sonoran Republic
# all derived a ONE-county core - and a movement that declares independence the
# moment one Area turns is not a movement, it is a switch.
CORE_MIN = 3

# ============================ END EDITABLE TABLE ================================

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")


def slug(name):
    """A stable machine id. Movements are keyed by display name today; the id is
    what M6's saves and the AI should reference, because a display name is a
    thing you rename."""
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


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

    def core_of(homeland):
        """The smallest set of homeland counties holding CORE_SHARE of its people.

        Sorted by population descending, with the fips as a tie-break so the
        result does not depend on dict order - the same determinism rule as
        build_areas.py's merge tie-breaks.
        """
        ranked = sorted(homeland, key=lambda f: (-(counties[f].get("pop") or 0), f))
        total = sum((counties[f].get("pop") or 0) for f in homeland)
        if total <= 0:
            return sorted(homeland)
        want, acc, core = total * CORE_SHARE, 0, []
        for f in ranked:
            core.append(f)
            acc += counties[f].get("pop") or 0
            if acc >= want and len(core) >= CORE_MIN:
                break
        return sorted(core)

    defs = {}
    for name, rule in REGIONS.items():
        ideology = rule.get("ideology") or IDEOLOGY.get(name)
        if not ideology:
            raise SystemExit(f'"{name}" has no ideology - add it to the IDEOLOGY table')
        kind, cap, goals = CHARACTER.get(name, (DEFAULT_TYPE, DEFAULT_CAP, []))
        homeland = resolve(rule)
        core = core_of(homeland)
        defs[name] = {
            "id": slug(name),
            "chance": rule.get("chance", SPAWN_CHANCE),
            "share": rule.get("share", SHARE_RANGE),
            "ideology": ideology,
            "type": kind,
            "growthCap": cap,
            "goals": goals,
            "counties": homeland,
            "core": core,
        }
        print(f"{name:32} {ideology:7} {kind:22} cap {cap:.2f} "
              f"{len(homeland):>5} counties, core {len(core):>4}")

    missing = [n for n in REGIONS if n not in CHARACTER]
    if missing:
        print(f"\nWARN: no CHARACTER entry, defaulted: {', '.join(missing)}")

    out_path = os.path.join(DATA, "parties.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(defs, f, separators=(",", ":"))
    print(f"\noutput: data/parties.json ({os.path.getsize(out_path) // 1024} KB)")


if __name__ == "__main__":
    main()
