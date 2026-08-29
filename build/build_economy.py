"""
ONE-TIME offline bake -> data/economy.json: six-sector production values per Area.

Sectors: Agriculture, Resource Extraction, Manufacturing, Trade & Transportation,
Finance, Information Technology. Each Area's GDP is split across the six by a
profile chosen from layered signals (first match wins):

  1. AUTHORED county profiles (real-world knowledge -- edit freely below)
  2. structural: port / choke point counties -> Trade & Transportation
  3. STATE_TILT: characteristic rural economy of the state
  4. the fallback ladder for unknowns:
       pop <  50k                     -> Agriculture
       50k  <= pop < 200k             -> Resource Extraction
       200k <= pop < 500k             -> Manufacturing
       500k <= pop < 1M               -> Information Technology
       pop >= 1M                      -> Trade if port/major river, else Finance

Re-run after editing:  python build/build_economy.py
"""

import json
import os

SECTORS = ["Agriculture", "Resource Extraction", "Manufacturing",
           "Trade & Transportation", "Finance", "Information Technology"]
AG, EX, MF, TR, FI, IT = range(6)

# dominant-sector GDP split templates (percent, sum 100)
TEMPLATE = {
    AG: [38, 10, 14, 16, 12, 10],
    EX: [8, 40, 16, 16, 12, 8],
    MF: [6, 8, 40, 18, 16, 12],
    TR: [6, 6, 16, 40, 20, 12],
    FI: [4, 6, 10, 20, 42, 18],
    IT: [4, 4, 10, 16, 22, 44],
}

# ====================== AUTHORED PROFILES (edit freely) ========================
# county fips -> dominant sector, based on the real-world economy
AUTHORED = {}
def _mark(sector, fips_list):
    for f in fips_list:
        AUTHORED[f] = sector

_mark(IT, ["06085", "06081", "06001", "53033", "48453", "48491", "25017",
           "37063", "37183", "08031", "08013", "49035", "49049", "06073",
           "51059", "24031", "27053", "26161", "53061"])
_mark(FI, ["36061", "37119", "17031", "10003", "06075", "25025", "48113",
           "13121", "19153", "09110", "09190", "31055", "12031", "39049",
           "42101", "36059", "55025", "04013"])
_mark(MF, ["26163", "26125", "39035", "55079", "21111", "45045", "45083",
           "39095", "39153", "39099", "26081", "20173", "47065", "47149",
           "21209", "01125", "45015", "45019", "17143", "17201", "18003",
           "18039", "39061", "39113", "26077", "18163", "29510", "36029"])
_mark(EX, ["48329", "48135", "48389", "48475", "48495", "38053", "38105",
           "38061", "38025", "56005", "56037", "56035", "54005", "54045",
           "54059", "54047", "42125", "42115", "42015", "40017", "35025",
           "35015", "08123", "02185", "06029", "32007", "32013", "27137",
           "04011", "49013", "49047", "22057", "22109", "54051"])
_mark(AG, ["06019", "06107", "06053", "06025", "06031", "06047", "06099",
           "53077", "53025", "53021", "42071", "19149", "48117", "48369",
           "16031", "16053", "16067", "05107", "28133", "28151", "12093"])
_mark(TR, ["47157", "17197", "48479", "06071", "06065", "06037", "22071",
           "48201", "51810", "51710", "24510", "34003", "34017", "12086",
           "13051", "45019", "53053", "41051", "48061", "48141", "32003"])

# state fips -> characteristic rural/unknown-county economy
STATE_TILT = {
    "19": AG, "31": AG, "20": AG, "46": AG, "38": AG, "27": AG, "16": AG,
    "05": AG, "28": AG, "30": AG, "48": AG,   # farm/ranch heartland
    "21": AG, "47": AG, "51": AG, "37": AG, "13": AG, "01": AG, "45": AG,
    "29": AG, "17": AG, "12": AG,             # rural South + corn belt
    "56": EX, "54": EX, "40": EX, "35": EX, "02": EX, "22": EX,  # energy states
    "26": MF, "18": MF, "39": MF, "55": MF, "42": MF,            # industrial belt
}
# ===================== END AUTHORED PROFILES ===================================

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "data")


def main():
    gd = json.load(open(os.path.join(DATA, "game-data.json"), encoding="utf-8"))["counties"]
    areas_def = json.load(open(os.path.join(DATA, "areas.json"), encoding="utf-8"))["areas"]
    trade = json.load(open(os.path.join(DATA, "county_trade.json"), encoding="utf-8"))["counties"]

    merged = set()
    for ms in areas_def.values():
        merged.update(ms)
    area_members = dict(areas_def)
    for f in gd:
        if f not in merged:
            area_members[f] = [f]

    src_count = {"authored": 0, "structural": 0, "state": 0, "ladder": 0}
    out = {}
    for aid, members in area_members.items():
        pop = sum(gd[m]["pop"] or 0 for m in members)
        anchor = max((gd[m]["pop"] or 0) for m in members)  # largest member county:
        # a merged Area of many tiny farm counties is still "small rural"
        gdp = sum(gd[m]["gdp"] or 0 for m in members)
        st = gd[aid]["st"]
        has_port = any(trade.get(m, {}).get("has_port") for m in members)
        on_water = has_port or any(
            trade.get(m, {}).get("choke_point") or trade.get(m, {}).get("rivers") for m in members)

        # 1) authored: strongest-GDP member with an authored profile decides
        authored = [m for m in members if m in AUTHORED]
        if authored:
            dom = AUTHORED[max(authored, key=lambda m: gd[m]["gdp"] or 0)]
            src_count["authored"] += 1
        # 2) structural: substantial port / choke-point economies are trade hubs
        elif has_port and pop >= 250_000:
            dom = TR
            src_count["structural"] += 1
        # 3) state tilt for small places in characteristic states
        elif pop < 200_000 and st in STATE_TILT:
            dom = STATE_TILT[st]
            src_count["state"] += 1
        # 4) the unknown-area ladder (sized by the anchor county, so merged
        #    clusters of tiny counties still count as small rural)
        else:
            if anchor < 50_000:
                dom = AG
            elif anchor < 200_000:
                dom = EX
            elif anchor < 500_000:
                dom = MF
            elif anchor < 1_000_000:
                dom = IT
            else:
                dom = TR if on_water else FI
            src_count["ladder"] += 1

        values = [round(gdp * pct / 100 / 1e6) for pct in TEMPLATE[dom]]  # $M
        out[aid] = {"v": values, "d": dom}

    dest = os.path.join(DATA, "economy.json")
    with open(dest, "w", encoding="utf-8") as f:
        json.dump({"sectors": SECTORS, "areas": out}, f, separators=(",", ":"))

    from collections import Counter
    doms = Counter(SECTORS[a["d"]] for a in out.values())
    print("areas:", len(out), "| sources:", src_count)
    print("dominant counts:", dict(doms))
    print("output:", os.path.relpath(dest, HERE), f"({os.path.getsize(dest) // 1024} KB)")


if __name__ == "__main__":
    main()
