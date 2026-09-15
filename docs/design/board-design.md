# The board

**Stage 2 of five: DESIGN.** What the thing does, what it is measured in, what the player sees, and
what happens at each level. This document is a specification for the Technical Designer, not an idea
bank.

**Depends on:** `GDD.md` only. **This is substrate — nothing it needs is above it, and almost
everything is above it.** `population-design.md`, `economy-design.md`, `trade-design.md`,
`war-design.md`, `nation-design.md`, `opening-board-design.md`, `events-design.md` and
`missions-design.md` all read from here.

**Status: almost entirely BUILT**, and the transit half is the most finished thing in the project.
This document's job is therefore unusual: it is **carrying forward a working system exactly**, not
specifying one that does not exist. Where something is designed and not built it says so in the line.

> **The one-sentence version: the board is geography as a graph with costs, and every cost on it is
> the answer to "can you actually get there" — for goods, for armies, and for influence.**

---

## 1. The Area — the atomic unit

**3,143 real counties collapse to 1,688 Areas.** *Counted from `areas.json` on 15 September 2026: 507
merge groups absorbing 1,455 counties.*

**The merge rule:** small counties merge into an adjacent **same-state** neighbour until each Area
clears a **50,000** population threshold, **east of the MT/WY/CO/NM line only.** Western states and
Alaska/Hawaii are left alone apart from authored merges — San Juan WA, the Aleutians, and Dukes plus
Nantucket into Barnstable. **An Area is capped at 8 member counties.**

**Member counties are preserved on the record**, so nothing is lost and a **County lines** toggle
reveals them.

**Three properties that matter more than the merge rule:**

| | |
|---|---|
| **The Area is the join key** | For the economy data, both map modes, and every save. It is why the bake must be deterministic |
| **The bake IS deterministic** | `build_areas.py` produces byte-identical output across runs |
| **A re-bake is a breaking change** | The save document carries a **build stamp** — the Area count and the merge threshold — and is **refused** if the map has been rebuilt underneath it. *The M9.6 re-bake took 1,676 Areas to 1,688, retired eleven ids and created twenty-three* |

**⚠ Ownership by Area, not county, has one consequence worth naming:** Mackinac and the Soo Locks
fall inside the same Area and **can never be held by different nations.**

---

## 2. Adjacency — the land graph

**Built once, as compressed sparse row**: `start[n+1]`, `list[m]`, over the same node numbering the
population columns use. **Neighbour rows are sorted by index**, so neighbour order is a property of
the graph rather than of the key order of the file that described it — *which used to decide `argmax`
ties and component traversal, and so used to make a re-bake a silent replay divergence.*

**⚠ The size figures are stale and are marked so in `DESIGN.md` itself:** 1,676 nodes, 9,454 directed
edges, 43.5 KB of flat `Int32Array` — **measured before the M9.6 re-bake** that took the Area count to
1,688. *The graph was not re-measured. Gap 1.*

**Islands need authored adjacency.** County adjacency comes from shared map arcs and an island shares
none — so Hawaii's three main islands had no neighbours at all and **the state was mechanically
inert**: nothing could be annexed from it, nothing released into it, and the neighbour-pull term in
political drift had nothing to read. An authored table writes the archipelago as a clique.

**Connecticut is a special case that costs real code.** Three files disagree about what Connecticut
is: the base geometry holds the eight pre-2022 *counties*, the game data holds the nine *planning
regions*, and `areas.json` has no `09*` entries at all. **The internal border layer cannot be fixed by
a predicate over the topology**, because the topology only contains the old county polygons; CT is
excluded from that mesh and drawn from the planning-region geometry instead, which is what makes the
lines coincide with the fills.

---

## 3. The transport network, and what entering ground costs

**This is what the baked rail and interstate data is for.** *`transport.json`, verified 15 September
2026: 2,430 counties carry transport data; 2,245 carry rail; **76 are rail hubs**.*

| Entering an Area | Cost | Tunable |
|---|---:|---|
| **Open country** | **1.00** | `proj.overlandCost` — *"the unit everything else is measured in"* |
| **Along an interstate** | **0.72** | `proj.highwayCost` |
| **Where there is rail** | **0.58** | `proj.railCost` |
| **Through a rail hub** | **0.34** | `proj.hubCost` |
| **Foreign ground** | **× 2.2** whatever it costs | `proj.foreignCost` |

> **Seventy-six rail hubs in the entire country, so holding one is worth a war.** And the foreign
> multiplier is most of what makes a distant war hard.

*Empty ground with no interstate and no railway is the hardest kind to move an army through, and most
of the interior west is exactly that.*

---

## 4. Reach — how far a nation can actually act

**This is anti-snowball brake #3, and the only one of the three that is a limit rather than a price.**
The coalition and the cost of occupation make expansion expensive; **this makes it impossible.**

**Reach is a bounded Dijkstra from ONE place:** the government's own seat if it still holds it,
otherwise its largest Area — *because a government that has lost its capital sits in its largest
city.* Cost accumulates per Area entered and **reach is `decay^cost`** (`proj.decay`), so it falls
smoothly and **there is no ring on the map.**

### 4.1 One source, and that is the whole design

**The first cut made every seat of government a nation holds a source**, on the reasoning that
capturing a capital should extend your reach. **That made the brake a no-op**, because an empire built
by conquest captures capitals *by construction*: a nation holding 852 of 1,676 Areas had twenty-four
seats, full reach over every frontier target it had, and **no limit of any kind.**

> **Reach has to decay from a CORE or it does not decay at all.** And the shape that falls out of one
> core is the interesting one: **an empire grows as a blob around its capital, and a long thin one
> cannot push at its far end whatever it holds in between.**

### 4.2 One number, three jobs

| | |
|---|---|
| **It prices** an annexation | Up to **+1.6×** at the edge (`proj.costAtLimit`) |
| **It weakens** the army that fights for it | `proj.warAtLimit` |
| **It refuses** the move | Past `proj.minReach` |

**All three come off the same record**, so the panel explains a refusal with the number that priced
the attempt. **A nation always reaches its own soil** — holding and taking are different questions —
and that floor (`proj.homeFloor`) is applied **after** the search so it never feeds the frontier.

### 4.3 What it measures, projecting from one capital

*Measured across empire sizes; figures carried forward from `DESIGN.md` and not re-measured here.*

| | Worst frontier target |
|---|---:|
| The opening board — worst of **944** targets | **0.31** |
| A 270-Area empire | **0.23** |
| A 517-Area empire | **0.13** |
| A 660-Area empire | **0.10** |

**At `proj.minReach` = 0.18: the opening board is untouched, the far corners start being refused past
a quarter of the continent, and a single-capital empire stalls around a third of it.** *That is the
brake working as designed, and it is the clearest measured result in the project.*

---

## 5. Water, part one: the rivers and the fifteen gates

**Four navigable corridors**, built from the real commercially-navigable waterways layer rather than
drawn by hand. *Verified from `county_trade.json`, 15 September 2026:*

| Corridor | Counties |
|---|---:|
| **Mississippi** | **105** |
| **Great Lakes** — not a river, treated as one, ordered west to east | **81** |
| **Ohio** | **56** |
| **Missouri** | **50** |

### 5.1 A river is a LINE, cut at its gates into stretches

**Everybody on the same stretch reaches everybody else on it for nothing**, exactly as two nations
sharing a border do. **To get from one stretch to the next you must pass the nation holding the gate
between them — and only between them.** A gate bridges the stretch above it and the stretch below it,
**never any other pair.**

> **⚠ That constraint is the whole mechanic, and it has already failed once.** An early version
> connected every stretch of a river to every other, **which put Minnesota one hop from Louisiana and
> silently deleted the chokepoints while every test stayed green.** *A test now says a river is a line
> in those words.*

### 5.2 The fifteen chokepoints, and all of them are real places

*`choke_point_labels` holds exactly 15, verified 15 September 2026.*

The **Soo Locks** and the **Straits of Mackinac**; the **Detroit** and **St. Clair** Rivers;
**Niagara**; the **St. Lawrence** outlet; the **Chicago Sanitary and Ship Canal**; the
**Ohio–Mississippi confluence at Cairo**; the **Missouri–Mississippi confluence at St. Louis**; **New
Orleans** and the **Mouth of the Mississippi**; the **Houston Ship Channel**; the **Golden Gate**; the
**Chesapeake entrance at Hampton Roads**; and the **Strait of Juan de Fuca**.

**Holding one makes you an ordinary middleman with an extraordinary position.** You can refuse passage
outright; you can charge for it; and **you can give notice and strangle a contract you never signed**,
because a deal whose route has closed pays nothing while its term runs down.

**Six of the gates are coastal and are therefore a private door to the world market.**

### 5.3 Facing banks — baked, and read by nothing

**`bank_pairs` holds 213 pairs** — *verified 15 September 2026.* Each is **two Census-adjacent
counties in different states that share a major river**: the classic facing-banks case, generated
against nine named rivers — Mississippi, Missouri, Ohio, Columbia, Snake, Red, Savannah, Delaware and
Potomac.

> **⚠ Nothing in the game reads them.** *Verified by search across `js/` and `tests/` on 15 September
> 2026.* **They are baked and dead.** Gap 8.

**And they are generated from the stale neighbour file** (gap 5), so if anything ever does read them
it will be reading a pre-2015 county vintage. **Recorded together because the second fact is only a
problem once the first one stops being true.**

*What they would be FOR is not written down anywhere.* The obvious reading — that two counties facing
each other across a river are neighbours for trade even though a river runs between them — is a
mechanic nobody has specified, and **it is not being invented here.**

---

## 6. Water, part two: two seas and a shut canal

**Not one ocean but two basins.** **The Panama Canal is closed to the former American states** — which
is also part of why the Union could not hold, since **it cut the navy in half.**

**Membership is by the GROUND a nation holds, not its name**, so a nation that took both coasts would
be on both seas. **The Gulf counts as Atlantic.**

> Washington ships to California freely and **to Maine not at all**; Maine's goods go by land, which
> is what they would really do.

**A basin link is a direct edge and costs nothing**, exactly as a shared land border does.

### 6.1 ⚠ The canal has been forced twice, in code rather than in fiction

**Both are recorded because both were caught late and neither was caught by a test.**

1. **Canada was given an Atlantic coast only, deliberately** — *a deliberate lie about geography.*
   With a Pacific coast, Washington ships to Vancouver, Vancouver ships to Halifax, **and Seattle is
   trading with Boston by sea**: the closed-canal rule defeated by going the other way round.
2. **Mexico was then given both coasts**, because nothing on the far side of Mexico connects onward —
   **and Mexico is a place goods pass through.** So Washington sailed to Mexico, Mexico sailed to
   Florida, **and the rule was defeated for a flat ten per cent while four tests that guard it stayed
   green, because all four read the map's connections rather than running a journey.**

**The rule now holds where it is actually meant to: water in and water out, across two different
oceans, is refused.** Arriving overland and shipping onward is still allowed, *because that is what
those goods would really do.*

> **The lesson belongs to the Technical Designer, not just to history: a rule about journeys cannot be
> tested by reading the graph. It has to be tested by running a journey.**

---

## 7. The edges of the map — Canada, Mexico, and the world market

**They are places on the graph, not menu options**, and each is reached by real geography: Canada and
Mexico **by the counties that actually border them** (*32 border crossings, verified*), or by sea from
a nation with the right coast; **the world market only through an ocean port, or through somebody
else's.**

**They differ from nations in three deliberate ways:**

| | |
|---|---|
| **A flat ten per cent, credited to nobody** | `transit.foreignCorridorToll`. There is no negotiating with Canada, no agreement to sign, no treasury to pay. **It is a cost, not a transfer** — and the absence is structural: *there is no path by which Canada could acquire an opinion, a treasury, or a veto* |
| **A route may duck outside ONCE** | Not twice. One corridor keeps the Idaho-to-Minnesota case alive **without turning the two neighbours into a general-purpose bypass for the whole continent** |
| **Nothing comes back out of the world market** | It has **no outgoing edges at all**, so goods cannot be laundered through it and reappear somewhere convenient |

**⚠ And one rule that belongs to this document because it is geography:** *Great Lakes ports reach the
world market only through the Canada corridor; ocean ports reach it directly.* **A lake port puts you
on the lakes; the lakes leave by the St. Lawrence, which is New York's.** That was changed from
Aaron's own earlier rule on his own later evidence — his scenario had Chicago having to get past
Michigan and then New York, **which is richer than the rule and is what the geography actually does.**

### 7.1 A port is not one thing, and the three kinds behave differently

*Verified 15 September 2026 against `county_trade.json`. **The three sets are disjoint, so this is a
classification and not a heuristic.***

| | Counties | Reaches |
|---|---:|---|
| **Ocean ports** | **57** | The world market **directly**, and the basin they sit on |
| **Great Lakes ports** | **20** | The lakes — and the world market **only through the Canada corridor** |
| **River and inland ports** | **59** | Their river stretch, and **no external sink at all** |
| **Total with a port** | **136** | of 986 counties carrying any trade geography |

> **A river port is real capacity that reaches no sink.** It counts toward what a nation can physically
> handle and it will not route anywhere abroad. **Forty-three per cent of the ports in this game are
> that kind**, which is why "has a port" and "can export" are different questions and must stay
> different.

**⚠ The trap under this, and it is stated in the code as the most expensive mistake available:** the
port count feeds `tradeCapacity.total`, which is **the volume limit on every standing trade deal in
the game.** Redefining what counts as a port quietly changes what every deal on the board pays, every
turn — **and it does not look like a mistake.**

### 7.1a ⚠ FOUR REAL OCEAN PORTS ARE FLAGGED AS INLAND, AND IT COSTS FOUR NATIONS THEIR FOREIGN TRADE

**Found by measurement on 15 September 2026.** *`has_port` and `coastal` are baked as separate flags,
and a port county whose polygon does not meet the coastline layer is demoted to "reaches no external
sink."* **Four of the 59 river/inland ports are real deep-water ocean ports:**

| County | What is actually there | `has_port` | `coastal` | What the game says |
|---|---|:---:|:---:|---|
| Philadelphia County, PA | **the Port of Philadelphia** | ✅ | ❌ | reaches nothing |
| Berkeley County, SC | **Charleston's port district** | ✅ | ❌ | reaches nothing |
| Chesapeake city, VA | **Hampton Roads** | ✅ | ❌ | reaches nothing |
| Providence County, RI | **the Port of Providence** | ✅ | ❌ | reaches nothing |

**Verified individually against `data/county_trade.json` this session.**

> **So Pennsylvania, South Carolina, Virginia and Rhode Island — all [BUILT] — cannot sell abroad
> through ports that in the real world are among the busiest on the eastern seaboard.** *They are four
> of the ten nations in §8's count.*

**⚠ And it changes what the 59 MEANS.** *The document's own headline — "59 of the 136 ports reach no
foreign market" — currently measures a **data fault** as though it were geography.* **The real
question is how many of the 59 are genuinely inland and how many are misclassified, and nobody has
asked it.** *Open question 12.*

**This is not cosmetic: the port count feeds `tradeCapacity`, which is the volume limit on every
standing trade deal in the game.** *Redefining what counts as a port moves a number every deal reads —
which is exactly why it must be a decision rather than a repair somebody makes quietly.*

---

### 7.2 Where the border actually is, and it is in two files

**Canada and Mexico access is decided by `transport.json`'s `external` lists: 18 Canadian-border
counties and 14 Mexican.** *Verified.*

**`county_trade.json` separately flags 32 counties as `border_crossing` and names all 32.** *Verified:
**they are the same 32 counties** — 18 + 14 — and the trade file's flag is read **only** to print a
chip on a panel.*

**So the two files agree today and nothing keeps them agreeing.** *Gap 6.*

---

## 8. Transit — crossing somebody else's ground

**A deal says two nations will trade. It does not say the goods can get there.**

**⚠ CORRECTED 15 September 2026, by measurement, and the figure that was here was doing two jobs.**
*This said "fourteen of the sixty-one nations have no port of any kind." **Fourteen is the count of
nations with no port AND no border crossing** — that figure is right, and it is the one every other
document means.* **Nations with no port of any kind: TWENTY-TWO.** *Measured this session by
reconstructing the 61-nation board from `content/scenario-shattered.json` and `content/cultural.json`
and testing every county against `data/county_trade.json`.*

> **⚠ AND THE NUMBER THAT MATTERS MOST WAS NEVER COUNTED AT ALL: TWENTY-FOUR of the sixty-one nations
> cannot reach the world market from their own ground.**
>
> *The gap between 14 and 24 is **ten nations that HOLD A PORT and cannot export through it** —
> Arkansas, Kentucky, Missouri, Northern California, Oklahoma, Pennsylvania, Rhode Island, South
> Carolina, Tennessee and Virginia, **all [BUILT]**.* **Their port is on their panel, its capacity is
> multiplied into every deal they sign, and it reaches no foreign market.**
>
> **That is this project's own named failure mode, word for word:** *a layer the player has not learned
> yet must be **INVISIBLE or SELF-EXPLAINING**, never **VISIBLE AND WRONG**.* **Nobody had counted how
> many nations are inside it.**

**And four of those ten are there because of a DATA FAULT, not because of geography** — see §7.1a.

*A border that carries no road and no rail is not a border for goods at all.*

### 8.1 The grant

**Passage is a GRANT: a standing permission from one nation to another, at a rate, for a term.**

**It is DIRECTED and PER-MODE** — Nevada carrying Idaho's goods is a different object from Idaho
carrying Nevada's, and rail rights are not road rights. **A grant is keyed on the triple
`grantor → grantee : mode`, never on the pair. One live grant per triple.**

**Closing one takes notice, and that is the drama.** Default **four turns** (`transit.noticeTurns`).

> **A grant under notice still carries goods for exactly its notice period, so a corridor holder who
> gives notice does not stop a deal — he starts a clock on it. And a deal whose route has gone pays
> NOTHING while its term keeps running down. A five-year contract can be burned to nothing by a
> neighbour who never touched it.**

**The register remembers.** Closing corridors counts against standing, weighted at
`transit.renegeWeight` **against how many you hold**, over the twenty-turn history window.

### 8.2 What a journey costs, and the one rule that does the work

> **A toll is charged on what REACHES you, not on what set out.**

**That single rule is what makes long chains fail on their own rather than by decree.** The first
middleman takes the most in absolute terms; the third takes a third as much, because it is charging
its percentage of a much smaller parcel.

**And every crossing loses something to nobody.** **Friction** — handling, transhipment, delay — is
subtracted at each hop and **collected by no one.** It exists because compounding tolls alone are not
enough: *five hops at the negotiated floor would still deliver 77% of the money, which would make a
resale chain across the continent a perfectly good business.* **Friction is what makes distance cost
something regardless of how generous the middlemen are.**

| Mode | Friction per crossing | Survives one crossing | Tunable |
|---|---:|---:|---|
| **Road** | **0.25** — the baseline | 75% | `transit.hopFriction` |
| **Rail** | **0.15** | 85% | `transit.railFrictionMult` |
| **Water** — river and sea alike | **0.1125** | 89% | `transit.waterFrictionMult` |

**The road baseline is not a taste.** It is the **lowest** number at which all three modes still fail
the five-hop test — *the floor that keeps both the hierarchy and the thing the hierarchy is for.*

**End to end, at the negotiated floor of 5%:**

| Territories crossed | Road | Rail | Water |
|---|---:|---:|---:|
| One | 71% | 81% | 84% |
| Two | 51% | 65% | 71% |
| **Three — the cap** | **36%** | **53%** | **60%** |
| Five | 18% | 34% | 43% |

### 8.3 Two neighbours pay nothing

**With nobody in between there is no hop to charge and no crossing to lose, and the money that
arrives is exactly the money that was sent, to the last bit.** The same is true of **two ports on one
sea** and **two nations on one stretch of river.**

### 8.4 The rate, and the discount that makes two systems pull together

**The negotiated rate runs from 5% to 60%** (`transit.rateMin`, `transit.rateMax`). *Below the floor a
corridor is not worth the paperwork; above the ceiling nobody would ship.*

**A corridor holder who is ALSO a trading partner charges half** (`transit.partnerDiscount`) — flat,
automatic, **deliberately blunt**. It makes the two systems pull in the same direction: **the
neighbour you trade with is the neighbour who lets you through cheaply.**

---

## 9. Finding a route

**The search maximises WHAT SURVIVES, not what is spent**, and it is bounded at **three
intermediaries** (`transit.maxHops`). **Four decisions in it are load-bearing and all four were made
against the obvious alternative.**

1. **It is not a shortest-path search.** The textbook algorithm settles each place at its cheapest
   depth and then reports *"no route"* when the only permitted way through needed a shallower one.
   **Relaxing layer by layer instead keeps the best route at EACH depth, so the hop cap can never hide
   a route that would have fitted inside it.**
2. **It does not use logarithms**, which is the textbook way to turn a chain of multiplications into a
   sum. **`Math.log` is not guaranteed to give bit-identical answers in different browsers, and a
   saved game that replays differently because it was opened in a different browser is the worst class
   of bug this project can produce.** Multiplying fractions is exactly rounded and the product only
   ever falls.
3. **Ties are broken by a total order** — most surviving, then fewest hops, then alphabetically —
   because *"whichever the loop happened to find first"* is a replay divergence waiting to happen.
   **Every loop over the graph runs in sorted order for the same reason.**
4. **Permission is asked WHILE searching, not baked into the graph.** The graph is rebuilt once a turn
   and every nation's question is answered against it. **A route is then re-priced from scratch before
   it is handed back, so the price a nation is quoted can never disagree with the price it is
   charged.**

---

## 10. What the player sees

**The map is the primary instrument of the whole game**, and this document owns the part of it that is
geography. *The screens themselves belong to `presentation-design.md`; what is here is what the board
has to be able to show.*

- **Eight map modes**, each with a legend: Standard (ownership), Pressure, Political, GDP, Population,
  **Geographic**, Culture, Economy. **Two of them — Geographic and Culture — are not computed: they are
  authored three-tier region hierarchies painted in the map editor and published as content.**
  *That is why repainting a leaf can move a successor state's border without a code change, which is
  how the opening board is built.*
- **A ninth that draws rather than colours — Trade routes.** Counties keep their ownership colours and
  the network is an overlay: one nation's deals along the ground they actually cross, every corridor
  it rents or grants, and every way out it can currently use. **Road, rail and water are three colours
  and each switches off**, because *"show me only the railways"* is how a player finds out their whole
  economy runs through one line. **A route somebody has cut is drawn in red to the nation that cut
  it.**
- **The lines are straight, between capitals, and that is deliberate.** The data says which counties
  **carry** rail and motorway, never **where** the rails and roads run. *A convincing line along ground
  nobody surveyed would be an invention dressed up as data. A straight line is obviously a diagram,
  which is what it is.*
- **A County lines toggle** reveals the member counties inside each Area.

---

## 11. What this hands the Technical Designer

**Everything below is structural. None of it is a number to invent.**

| | |
|---|---|
| **The graph is rebuilt once a turn** | And every nation's routing question is answered against that one build. **Permission is a question asked during the search**, never an edge |
| **Determinism is load-bearing here specifically** | Sorted neighbour rows, a total tie-break order, no logarithms, exactly-rounded fraction products. **This is the part of the project where a replay divergence would be hardest to find** |
| **Reach decays from ONE core** | Not from every capital. See §4.1 — the alternative was tried and produced no limit at all |
| **A toll is charged on what arrives** | Not on what set out. Every chain rule in the game falls out of this |
| **Friction is collected by nobody** | It is a loss, not a transfer, and so is the foreign 10% |
| **A rule about journeys must be tested by running a journey** | §6.1. Four tests guarded the closed canal and all four passed while it was defeated |
| **Every number on this page is a named tunable** | `proj.*` for reach and the network, `transit.*` for crossings. None is a literal |
| **⚠ Do not redefine what counts as a port** | The port count feeds `tradeCapacity.total`, **the volume limit on every standing trade deal in the game.** Widening it quietly changes what every deal pays every turn, and **it does not look like a mistake.** §7.1 — and note that 59 of the 136 ports reach no external sink at all |

---

## 12. Open questions

*A decision Aaron has not made. Playtest findings for the board are filed here.*

| | | Owner |
|---|---|---|
| **1** | **⚠ Does anything on this board have a LENGTH?** Nothing in the transit layer does. **Measured from the game's own map on 5 September 2026: the closest two ports on one sea are 16 miles apart (Delaware and New Jersey) and the farthest are 2,578 (Hawaii and Washington), priced identically.** A Canada corridor spans 411 to 2,442 miles at one flat rate and is **the only edge in the game that pays no crossing cost at all.** The median sea crossing is **707 miles** against a median land border of **253**, and **59% of same-sea pairs are further apart than the longest land border on the board.** *Three sub-questions — whether coastal shipping should be free, whether a ship should still beat a lorry over a short haul, and why a transcontinental corridor is flat-priced — are all this one question.* **The raw material exists: the data build already computes county and port centroids and throws the coordinates away** | **Aaron**, then the architect |
| **2** | **Should a Lake Michigan port reach the Canada corridor without passing Mackinac?** *Carried from `missions-design.md` open question 6, which is where it was found* | The Technical Designer |
| **3** | **Can a smuggler's rate reach the world market for a nation with no port?** The market is *"a haircut rather than a lock"* because *"refusing external trade outright would make an unrecognised landlocked state unplayable"* — **which is a description of Deseret** — but the market is reached *"only through an ocean port, or through somebody else's."* **Nobody has asked whether the two rules agree.** *Carried from `missions-design.md` open question 8* | The Technical Designer |
| **4** | **Does lasting infrastructure damage exist at all?** Today a wrecked rail hub lasts **one turn**, *so it is a raid and not a demolition, and nobody decided that on purpose.* **Filed to stage 2 by the economy round and it lands here**, because a rail hub is a board object: 76 of them exist and the entry cost through one is 0.34 against 1.00 for open country | **Aaron** |
| **5** | **Is a shock's blast radius walked in adjacency hops the right shape?** Round 6 ruled it because **the map has no coordinates**, and recorded that it is *arguably truer* — a drought spreads along the plains rather than into the mountains. **It has never run.** *Shared with `events-design.md`, which owns the event; this document owns the walk* | The alpha |
| **6** | **⚠ Does D227's recognition exception cover RIVERSIDE?** D227 opens Deseret recognised by its neighbours and not by Utah, **so that a pariah needing a corridor can be granted one** — and it was verified against the legitimacy threshold but **never against the map.** §14.1 traces it: **Deseret's only Californian border is one Area wide, and the nation on the other side of it is Riverside**, a three-Area landlocked successor that holds the Mexican crossing at Imperial. **The ruling's own purpose turns on a nation nobody has thought about.** *Found by tracing, 15 September 2026* | **Aaron**, in `diplomacy-design.md` |
| **7** | **⚠ Is it acceptable that about one game in five opens with Deseret touching no Californian ground at all?** Its single Californian border Area is Mohave County, in the **Zion** leaf, which cedes at **0.82**. **A good roll and a bad roll are materially different games for Deseret's trade**, and the mission document already says that about its ground | **Aaron** |

---

## 13. Gaps

*Referenced and never specified. Distinct from an open question: these may already have been decided
and simply are not written down anywhere.*

| | |
|---|---|
| **1** | **The adjacency graph's own measurements are stale.** 1,676 nodes / 9,454 directed edges / 43.5 KB were measured **before** the M9.6 re-bake took Areas to 1,688. `DESIGN.md` marks them stale; **nobody has re-measured them** |
| **2** | **⚠ A number published on the Control Board is wrong by a factor of seven.** Its permanent log records, of 5 September, *"There are 986 [ports], from the real Principal Ports dataset."* **Verified 15 September 2026: `county_trade.json` holds 986 COUNTIES that carry any trade geography at all; 136 of them have a port; and the raw Principal Ports dataset holds 150 port features.** *986 is the size of the file, not a count of ports. A correction is going beside the original rather than over it, because that log is never revised* |
| **3** | **Nothing states what happens to a chokepoint's Area when its owner ceases to exist.** Gates are held by whoever owns the ground and the ground always has an owner — **except that round 3 created ungoverned ground.** *Nothing says whether an ungoverned gate is open, shut, or free* |
| **4** | **Nothing specifies whether a corridor survives its grantor being annexed.** Diplomacy ruling 18 makes a *claim* inherit with the ground; transit grants are keyed `grantor → grantee : mode` and the grantor may stop existing |
| **5** | **`county_neighbors.json` is a pre-2015 Census vintage** with roughly 100 FIPS that no longer exist. `DESIGN.md` §12 says *"it feeds the display-only Neighbors row; the simulation reads `adjacency.json`, which is current."* **⚠ That is not the whole truth: `build_trade.py` also reads it to generate `bank_pairs`, which is baked into `county_trade.json` — a file the simulation does read.** *Harmless only because nothing reads `bank_pairs` (gap 8). Two gaps that are each other's safety net is not a safe arrangement* |
| **6** | **The border is defined in two files and nothing keeps them in step.** Routing reads `transport.json`'s `external` lists (18 Canada + 14 Mexico); the panel chip reads `county_trade.json`'s `border_crossing` flag (32 counties, all named). **Verified: they are the same 32 counties today.** *Two independent bakes of one fact, agreeing by luck rather than by construction — and `build/validate.py` is the check that is supposed to catch exactly this class of drift* |
| **7** | **Nothing says what a border crossing IS, mechanically.** Thirty-two are named and the only thing holding one does is put Canada or Mexico within reach. **Nothing says whether a crossing has a capacity, whether it can be closed the way a corridor can, or whether losing one hurts differently from losing an ordinary Area** — which matters because a mission tree already asks a player to take one |
| **8** | **⚠ `bank_pairs` — 213 facing-bank county pairs — is baked and read by nothing.** *Verified by search across `js/` and `tests/`, 15 September 2026.* **Dead baked data**, in the same class as the dead `enteredBy` field already in `docs/deferred.md` 10. **What it is FOR is written down nowhere** — the obvious reading is that two counties facing each other across a river should be trade-neighbours despite the water, but that is a mechanic nobody has specified and it is not invented here |
| **9** | **⚠ The scenario file contradicts itself about Imperial County, and it is the county this whole question turns on.** SoCal's note says it receives *"San Diego, Orange, Ventura, Santa Barbara, San Luis Obispo and Imperial."* **Riverside's `areas` array explicitly claims Imperial (06025), and the explicit claim wins** — so the note is wrong. **Imperial is a Mexican border crossing and §14.1 shows it is Deseret's shortest route to any market at all.** *Authored content, not code. Found by tracing, 15 September 2026* |

---

---

## 14. The scenarios this document must be able to tell

**Reinstated by Aaron on 15 September 2026 (D232).** *Worked examples are the test suite: a design is
not finished because it is elegant, it is finished when it can narrate concrete situations. Tracing
has found contradictions in every closed round that the rulings alone did not.*

**Five traced below. Three narrate, one narrates and exposes something nobody had looked at, and one
is refused — which is the correct outcome and is the point of tracing it.**

---

### 14.1 ⚠ Deseret tries to sell something — and this is the one that found things

**The situation.** Turn 1. Deseret is half-born out of the Mormon Corridor, holds roughly 31 of 57
Areas, and wants to export. *Everything below is verified against the data on 15 September 2026, not
carried forward.*

**Step 1 — what Deseret physically has.** Across all **57** corridor Areas: **no port, no coastal
county, no Great Lakes county, no border-crossing county, no county on a named navigable river, and no
chokepoint.** One rail hub.

**⚠ CORRECTED: it is NOT the only sealed nation on the board.** *On this paragraph's own six-part test,
**eight** nations qualify — Austin, Colorado, DC, Dallas, Deseret, Nevada, Utah and Wyoming, all
**[BUILT]**.* **What is unique about Deseret is not that it is sealed. It is that it is sealed AND a
pariah**, which is a different and much sharper problem, and it is the one D227 was ruled to solve.

**Step 2 — so every route must cross somebody.** The world market is reachable *"only through an ocean
port, or through somebody else's."* Deseret has neither, so it needs a **transit grant**, which is
directed, per-mode, and requires **mutual recognition.**

**Step 3 — who does it actually touch?** The corridor borders **eight** states' ground: Arizona,
California, Colorado, Idaho, Montana, Nevada, Utah and Wyoming. **Of those, only three can reach
anything external at all** — California (5 ocean ports, 2 crossings), Arizona (3 Mexican crossings),
and Idaho and Montana (1 Canadian crossing each). **Colorado, Nevada, Utah and Wyoming are dead ends.**

**Step 4 — and the California border is ONE Area wide.** Exactly one corridor Area touches California:
**Mohave County, Arizona**, which borders **San Bernardino County**. *Nothing else in the corridor
touches a Californian county, and **no corridor Area touches a border-crossing county anywhere.***

**Step 5 — who holds San Bernardino? Not who you would guess.** San Bernardino sits in the **SoCal**
cultural leaf, **but the scenario gives it to Riverside**, whose three Areas are Riverside, Imperial
and San Bernardino. **And Riverside is landlocked** — the scenario says so in its own note: *"The
Inland Empire and the desert. Landlocked, and the only near-even Californian successor."*

**Step 6 — so the lifeline is not the one it looks like.** **Riverside holds Imperial County, which is
a Mexican border crossing.** So:

| Route | Hops | Reaches |
|---|---|---|
| **Deseret → Riverside → Mexico** | **one intermediary** | Mexico, at Riverside's toll **plus the flat 10% that credits nobody** |
| **Deseret → Riverside → SoCal → world market** | **two intermediaries** | The ocean, through San Diego |
| Deseret → Arizona → Mexico | one intermediary | Mexico — *Arizona proper, since no corridor Area touches a crossing* |
| Deseret → Idaho or Montana → Canada | one intermediary | Canada |
| Deseret → Nevada → anything | — | ❌ **Dead end.** Nevada has no port and no crossing |

> **It narrates. Deseret is not sealed off — it is one grant away from Mexico and two from the world.
> But the route runs through a specific small landlocked neighbour nobody has ever thought about.**

#### What this trace found, and none of it was written down anywhere

1. **⚠ D227's recognition exception has to cover RIVERSIDE, and nobody checked who "its neighbours"
   are.** D227 opens Deseret recognised by its neighbours and not by Utah, *verified at the time
   against the legitimacy threshold.* **It was never checked against the map.** The neighbour that
   matters most for the ruling's own stated purpose — *"a pariah that needs a corridor to do anything
   at all cannot be granted one"* — is **Riverside**, a three-Area Californian successor. *Open
   question 6.*
2. **⚠ In roughly one game in five, the Californian border does not exist.** Mohave County is in the
   **Zion** leaf, which cedes at **0.82**. **So about 18% of games open with Deseret touching no
   Californian ground at all**, and its shortest route to a market becomes Arizona or the Canadian
   border instead. **A good roll and a bad roll are materially different games** — which the mission
   document already says about Deseret's ground and nobody had said about its trade.
3. **⚠ The scenario file contradicts itself about Imperial County.** SoCal's note says it receives
   *"San Diego, Orange, Ventura, Santa Barbara, San Luis Obispo and Imperial."* **Riverside's `areas`
   array explicitly claims Imperial (06025).** The claim wins and the note is wrong — **and Imperial is
   the border crossing this whole trace turns on.** *Gap 9.*
4. **The pariah's lifeline runs through a nation with every reason to refuse.** Riverside is small,
   landlocked, and its one asset is the crossing Deseret needs. **That is a good story and nobody
   designed it.**

---

### 14.2 Louisiana gives notice on the Mouth of the Mississippi

**The situation.** Illinois ships to the world down the Mississippi through Louisiana. Louisiana wants
it to stop.

**Step 1.** Louisiana holds **both New Orleans and the Mouth of the Mississippi** — two of the fifteen
gates, on one river, in sequence.

**Step 2.** A river is a **line**, cut at its gates into ordered stretches. Illinois is upstream of
Cairo and St. Louis; to reach the sea it must pass every gate below it **in order**, and Louisiana
holds the last two.

**Step 3.** Louisiana gives notice. **The grant still carries goods for exactly its notice period —
four turns.** *It does not stop the deal; it starts a clock on it.*

**Step 4.** When the notice expires, Illinois's deal **pays nothing while its term keeps running
down.** A long contract can be burned to nothing by a nation that never touched it.

**Step 5 — and it is not a monopoly.** Illinois reroutes **through the state of Mississippi**, which
reaches the Gulf without passing New Orleans. **The Mouth is a gate, not a lock.**

**Step 6 — Louisiana pays for it.** Closing a corridor counts against standing, weighted **against how
many corridors you hold**, over the twenty-turn window — so a nation that holds many gates pays more
per closure than one that holds a single one.

> **Narrates cleanly, end to end, and it is the clearest demonstration in the game of why the rivers
> were worth building.**

---

### 14.3 A long thin empire tries to push at its far end

**The situation.** A nation has conquered a corridor of ground stretching from its capital across a
third of the continent, and wants to take one more Area at the far end.

**Step 1.** Reach is a bounded search from **one** core — the seat of government if still held,
otherwise the largest Area. **Not from every capital it has captured.**

**Step 2.** Cost accumulates per Area entered — 1.00 open country, 0.72 interstate, 0.58 rail, 0.34
through a rail hub — and reach is `decay^cost`, **so it falls smoothly with no ring on the map.**

**Step 3.** At the far end, reach has decayed below `proj.minReach` (**0.18**). **The move is refused**,
and the panel explains the refusal **with the same number that priced the attempt**, because pricing,
army strength and refusal all read one record.

**Step 4 — measured, so the shape is known.** A 517-Area empire's worst frontier sits at **0.13** and a
660-Area one's at **0.10**; the opening board's worst of 944 targets is **0.31**. **So the opening board
is untouched, the far corners start being refused past a quarter of the continent, and a
single-capital empire stalls around a third of it.**

**Step 5 — and the alternative was tried and failed.** Making every captured seat a source *made the
brake a no-op*: an empire of 852 Areas had twenty-four seats and no limit at all. **Reach has to decay
from a core or it does not decay.**

> **Narrates. And it is the only anti-snowball device in the game that refuses rather than prices —
> which is exactly the tension §5 of the master document names against Aaron's taste for absurd runs.**

---

### 14.4 ❌ Seattle tries to reach Boston by sea — and is refused

**The situation.** A Pacific nation wants to ship to an Atlantic one without crossing anybody's land.

**Step 1.** Two basins, not one ocean. **The Panama Canal is shut to the former American states.**
Membership is by the **ground held**, not the name, so this is a question about which coasts Seattle
holds.

**Step 2.** Seattle is Pacific. Boston is Atlantic. **There is no direct basin edge between them.**

**Step 3 — the first way round, already closed.** Ship to Canada, Canada ships to the Atlantic.
**Refused: Canada was given an Atlantic coast only, deliberately — a deliberate lie about geography**,
because with a Pacific coast this exact route works.

**Step 4 — the second way round, and it WORKED for a while.** Ship to Mexico, which has both coasts,
and on to Florida. **This defeated the rule for a flat ten per cent while four tests that guard it
stayed green** — because all four read the map's connections rather than running a journey.

**Step 5 — what holds now.** **Water in and water out, across two different oceans, is refused.**
Arriving overland and shipping onward is still allowed, *because that is what those goods would really
do.*

> **Correctly refused — and the reason this scenario is in the document is step 4. The rule was
> defeated twice, by geography rather than by code, and neither breach was caught by a test that read
> the graph. A rule about journeys has to be tested by running a journey.**

---

### 14.5 A nation with a port discovers it cannot export

**The situation.** A player holds a county with a port, sees the port on their panel, and cannot sell
abroad.

**Step 1.** **136 counties have a port.** *Verified.*

**Step 2 — and they are three different things.** **57 ocean**, **20 Great Lakes**, **59 river or
inland.** *Disjoint sets, so this is a classification and not a heuristic.*

**Step 3.** An **ocean** port reaches the world market directly. A **Great Lakes** port reaches it
**only through the Canada corridor** — the lakes leave by the St. Lawrence, which is New York's. A
**river** port reaches its river stretch **and no external sink at all.**

**Step 4.** **So 59 of 136 ports — forty-three per cent — cannot export anywhere.** The capacity is
real; the destination is not.

**Step 5 — and the trap underneath.** The port count feeds `tradeCapacity.total`, **the volume limit on
every standing trade deal in the game.** *Widening what counts as a port quietly changes what every
deal on the board pays, every turn, and it does not look like a mistake.*

> **Narrates — but only just, and what it exposes is a PRESENTATION problem rather than a model one.**
> **The model is right and the screen does not say so**: nothing distinguishes the three kinds of port
> to a player, so *"I have a port and I cannot sell"* currently has no answer on screen. **Filed to
> `presentation-design.md`, and it is a direct instance of the master document's requirement that the
> game be playable before it is understood** — a player must be able to find this out, not deduce it.

---

*Sources, verified against the files on 15 September 2026 unless marked: `data/county_trade.json`
(986 county records; 136 `has_port` — **57 ocean, 20 Great Lakes, 59 river/inland, disjoint** — 222
`coastal`, 81 `great_lakes`, 32 `border_crossing`, 15 `choke_point`; `choke_point_labels` 15;
`border_crossing_labels` 32; corridors Mississippi 105, Great_Lakes 81, Ohio 56, Missouri 50;
`bank_pairs` 213, **read by nothing**); `data/transport.json` (2,430 county records, 2,245 rail, 76
rail hubs; `external` lists 18 Canada + 14 Mexico, **the same 32 counties the trade file flags**);
`data/areas.json` (507 merge groups, threshold 50,000, max_members 8);
`build/raw/trade/ports.geojson` (150 port features); `build/build_trade.py` (`bank_pairs` derivation
and its nine named rivers); `js/game.js` (`areaExport`, `exportAccess`); `js/transit.js` (the corridor
graph); `js/panels.js` (the border-crossing chip); `js/tunables.js` (`proj.*`, `transit.*`);
`DESIGN.md` §2, §2.1, §3, §6.4, §6.7, §8, §9, §12; `docs/design/missions-design.md` open questions 6
and 8; `docs/design/economy-ideation.md` ruling 6. **Reach and survival figures, and the distance
measurements in open question 1, are quoted from `DESIGN.md` with their original dates and were not
re-measured for this document.***
