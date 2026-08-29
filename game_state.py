"""
Serializable game-state model for Nation States.

The COUNTY is the atomic unit of truth. A NATION/STATE is never stored as primary
data -- it is derived by summing the counties it owns. The entire state is one
JSON-serializable dict (`state`), so it can be saved/loaded directly later.

Invariant enforced everywhere: for each county,
    sum(county["parties"].values()) == county["population"]
and each percentage = count / population.
"""

import copy
import json
import os
import random

# baked source uses these keys for the three party shares
_SOURCE_PARTIES = {"Republican": "gop", "Democrat": "dem", "Other": "other"}
CORE_PARTIES = {"Republican", "Democrat", "Other"}  # structural; never cleaned up

# ---- emergent-party tunables ----
PARTY_CEILING = 0.35  # max share an emergent party grows toward per county
PARTY_STEP = 0.03     # closes this fraction of the gap to the ceiling per turn
PARTY_FLOOR = 0.01    # emergent parties below this share are cleaned up


def load_state(path=None):
    """Load the baked data and build the one game-state dict."""
    here = os.path.dirname(os.path.abspath(__file__))
    path = path or os.path.join(here, "data", "game-data.json")
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    neighbors = _load_neighbors(here)

    counties = {}
    for fips, c in data["counties"].items():
        population = int(c.get("pop") or 0)
        pct = {party: c.get(key) for party, key in _SOURCE_PARTIES.items()}
        county = {
            "id": fips,
            "name": c.get("name", fips),
            "owner": c.get("st", fips[:2]),   # nation id = 2-digit state FIPS
            "population": population,
            "parties": _counts_from_percentages(population, pct),
            "gdp": c.get("gdp"),
            "neighbors": neighbors.get(fips, []),   # Census County Adjacency File
            "attrs": {},   # Area attributes: region tags, resources, terrain, modifiers, ...
        }
        if "est" in c:
            county["est"] = c["est"]
        counties[fips] = county

    state = {"counties": counties, "meta": data.get("meta", {}), "turn": 0}
    spawn_regional_parties(state)  # setup-only: emergent regional parties
    return state


def spawn_regional_parties(state, defs=None, rng=random):
    """Setup-only: roll each regional party's spawn, then give it an initial share
    in each of its counties. Absorption rule: the new party takes the rolled X of
    the population PLUS the county's entire "Other" share (Other drops to 0); the
    remaining parties shrink proportionally, then counts are renormalized so they
    sum exactly to population. E.g. Other 2.6% + rolled 4% -> new party 6.6%."""
    if defs is None:
        here = os.path.dirname(os.path.abspath(__file__))
        path = os.path.join(here, "data", "parties.json")
        if not os.path.exists(path):
            state["regional_parties"] = []
            return []
        with open(path, encoding="utf-8") as f:
            defs = json.load(f)
    spawned = []
    for name, d in defs.items():
        if rng.random() > d.get("chance", 0.5):
            continue
        spawned.append(name)
        lo, hi = d.get("share", [0.0, 0.2])
        for fips in d["counties"]:
            county = state["counties"].get(fips)
            if not county or not county["population"]:
                continue
            x = rng.uniform(lo, hi)
            pop = county["population"]
            oth = county["parties"].get("Other", 0)
            new_count = int(round(x * pop + oth))    # rolled share + all of "Other"
            pool = pop - oth
            factor = (pop - new_count) / pool if pool else 0
            counts = {p: int(round(c * factor)) for p, c in county["parties"].items() if p != "Other"}
            counts["Other"] = 0
            counts[name] = counts.get(name, 0) + new_count
            drift = pop - sum(counts.values())   # renormalize: invariant holds
            if drift:
                counts[max(counts, key=counts.get)] += drift
            county["parties"] = counts
    state["regional_parties"] = spawned
    return spawned


def _load_neighbors(here):
    """Census-file county neighbors, cached in data/county_neighbors.json."""
    path = os.path.join(here, "data", "county_neighbors.json")
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return {}


def _counts_from_percentages(population, pct_by_party):
    """Percentages -> integer head counts that sum EXACTLY to population."""
    counts = {p: int(round((pct or 0) / 100.0 * population)) for p, pct in pct_by_party.items()}
    drift = population - sum(counts.values())  # absorb rounding drift on the largest party
    if counts and drift:
        counts[max(counts, key=counts.get)] += drift
    return counts


# ---- Area abstraction ----
# An AREA is the atomic map unit. Today an area maps 1:1 to a county (it IS the
# county record), so all existing county logic already reads through it; future
# data (region tags, resources, terrain, modifiers, ...) goes in area["attrs"].
def area(state, area_id):
    """Return the Area for an id (currently identical to the county record)."""
    return state["counties"][area_id]


def area_attrs(state, area_id):
    """The Area's extensible attribute dict."""
    return state["counties"][area_id]["attrs"]


# ---- county helper ----
def county_percentages(county):
    """party -> percentage of the county's population."""
    pop = county["population"]
    if not pop:
        return {party: 0.0 for party in county["parties"]}
    return {party: count / pop * 100 for party, count in county["parties"].items()}


# ---- derived nation/state helpers (nations are summed from owned counties) ----
def _owned(state, nation):
    return [c for c in state["counties"].values() if c["owner"] == nation]


def nation_population(state, nation):
    """Sum of population of the counties this nation owns."""
    return sum(c["population"] for c in _owned(state, nation))


def nation_party_totals(state, nation):
    """party -> summed head counts across the nation's counties."""
    totals = {}
    for c in _owned(state, nation):
        for party, count in c["parties"].items():
            totals[party] = totals.get(party, 0) + count
    return totals


def nation_lean(state, nation):
    """party -> percentage (counts / total) for the nation."""
    totals = nation_party_totals(state, nation)
    pop = sum(totals.values())
    if not pop:
        return {party: 0.0 for party in totals}
    return {party: count / pop * 100 for party, count in totals.items()}


# ---- world turn engine (separate from player/AI actions) ----
def phase_recompute_leans(snap, nxt):
    """Compute and cache each nation's lean (party -> pct) from the start-of-turn
    snapshot. Returned cache is what the drift phase reads, so drift never sees
    leans influenced by counties already drifted this turn."""
    totals = {}
    for c in snap.values():
        t = totals.setdefault(c["owner"], {})
        for p, n in c["parties"].items():
            t[p] = t.get(p, 0) + n
    leans = {}
    for owner, t in totals.items():
        pop = sum(t.values())
        leans[owner] = {p: (n / pop * 100 if pop else 0.0) for p, n in t.items()}
    return leans


def phase_political_drift(snap, nxt, leans, step=0.02):
    """Ease each county toward its OWNER nation's cached lean.

    Per party: new% = old% + step * (target% - old%)  (default closes 2% of the
    gap per turn -- self-limiting, eases in and settles). Percentages are then
    renormalized and converted back to counts. Drift moves people BETWEEN
    parties; the county's population is unchanged by this phase.
    """
    for fips, county in nxt.items():
        src = snap[fips]
        pop = src["population"]
        if not pop:
            continue
        target = leans.get(src["owner"], {})
        new_pct = {}
        for p in set(src["parties"]) | set(target):
            old = src["parties"].get(p, 0) / pop * 100
            new_pct[p] = old + step * (target.get(p, 0.0) - old)
        total = sum(new_pct.values()) or 1
        new_pct = {p: v / total * 100 for p, v in new_pct.items()}
        county["parties"] = _counts_from_percentages(pop, new_pct)
        county["population"] = pop


def phase_party_growth(snap, nxt, step=PARTY_STEP, ceiling=PARTY_CEILING):
    """Ease each emergent party toward its per-county ceiling.

    gain = step * (ceiling - current share), with current share read from the
    SNAPSHOT -- so it closes a fraction of the gap, eases in, and never exceeds
    the ceiling. The gained share is taken proportionally from all OTHER parties
    (multiply them by 1 - gain), then everything is renormalized and counts are
    reconstituted from the county's population.
    """
    for fips, county in nxt.items():
        src = snap[fips]
        spop = src["population"]
        emergent = [p for p in src["parties"] if p not in CORE_PARTIES]
        pop = county["population"]
        if not emergent or not spop or not pop:
            continue
        sh = {p: c / pop for p, c in county["parties"].items()}  # post-drift base
        for name in emergent:
            cur = src["parties"][name] / spop                    # snapshot share
            gain = step * (ceiling - cur)
            for q in sh:
                if q != name:
                    sh[q] *= 1 - gain
            sh[name] = cur + gain
        total = sum(sh.values()) or 1
        county["parties"] = _counts_from_percentages(pop, {p: v / total * 100 for p, v in sh.items()})
        county["population"] = pop


def phase_cleanup(snap, nxt, floor=PARTY_FLOOR):
    """End-of-turn: remove emergent parties below `floor` and redistribute their
    share proportionally to the remaining parties (core parties are structural
    and never removed). Stops counties splintering into many tiny parties."""
    for county in nxt.values():
        pop = county["population"]
        if not pop:
            continue
        dead = [p for p, c in county["parties"].items()
                if p not in CORE_PARTIES and c / pop < floor]
        if not dead:
            continue
        for p in dead:
            del county["parties"][p]
        pct = {p: c / pop * 100 for p, c in county["parties"].items()}
        total = sum(pct.values()) or 1
        county["parties"] = _counts_from_percentages(pop, {p: v / total * 100 for p, v in pct.items()})


def phase_population_growth(snap, nxt, rate=0.01):
    """Grow each county by `rate` (default 1%/turn) and drift it politically.

    The county grows by `rate`, but the NEW residents arrive in the party mix of the
    county's OWNER NATION -- not the county's own -- so a county gradually drifts
    toward its nation's alignment (e.g. a county annexed by a Republican nation
    trends Republican over time). Nation-level ratios are preserved while individual
    counties converge toward them. Counts are rounded and population reset to their
    sum so the invariant holds. (rate is a single default for now; per-nation rates
    come later.)
    """
    nation_totals = {}  # owner -> {party: count}, from this turn's snapshot
    for c in snap.values():
        t = nation_totals.setdefault(c["owner"], {})
        for p, n in c["parties"].items():
            t[p] = t.get(p, 0) + n
    for fips, county in nxt.items():
        # per-county counts come from nxt (post-drift, so phases compose);
        # cross-county aggregates (the nation mix) still come from snap.
        cur = county["parties"]
        tot = nation_totals[snap[fips]["owner"]]
        nation_pop = sum(tot.values()) or 1
        growth = sum(cur.values()) * rate  # new people this turn
        grown = {p: int(round(n + growth * tot.get(p, 0) / nation_pop)) for p, n in cur.items()}
        county["parties"] = grown
        county["population"] = sum(grown.values())


def advance_turn(state):
    """Advance the world one turn.

    Per-turn update discipline (double buffering): every phase reads this turn's
    county values from `snap` (a frozen copy) and writes each next value into
    `nxt` (a fresh copy); `nxt` is swapped in only at the end. No phase ever reads
    a value it has already updated this turn, so feedback loops can't compound
    within a single turn.
    """
    snap = copy.deepcopy(state["counties"])
    nxt = copy.deepcopy(state["counties"])
    leans = phase_recompute_leans(snap, nxt)  # start-of-turn lean cache
    phase_political_drift(snap, nxt, leans)
    phase_party_growth(snap, nxt)
    phase_population_growth(snap, nxt)
    phase_cleanup(snap, nxt)
    state["counties"] = nxt
    state["turn"] = state.get("turn", 0) + 1
    return state["turn"]


# ---- save / load (the whole state is plain data, so this is trivial) ----
def save_game(state, path):
    """Write the full game state to JSON."""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(state, f)


def load_game(path):
    """Read a saved game state back into a working dict."""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def roundtrip_guard(state, path=None):
    """Quick guard: save + load reproduces the state (and derived nation stats)."""
    import tempfile
    path = path or os.path.join(tempfile.gettempdir(), "ns_roundtrip.json")
    save_game(state, path)
    back = load_game(path)
    nation = next(iter(state["counties"].values()))["owner"]
    assert back == state, "state changed on round-trip"
    assert nation_population(back, nation) == nation_population(state, nation)
    assert nation_lean(back, nation) == nation_lean(state, nation)
    return True


if __name__ == "__main__":
    s = load_state()
    assert roundtrip_guard(s)
    print("round-trip OK")
