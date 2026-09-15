# Manifest Disunity — Game Design Document

**Stage 2 of five: DESIGN.** This is the master document. It is the tip of the iceberg: orientation,
the system map, and the concepts several systems share. **Everything deep lives in a satellite** —
if a section here starts restating one, it is too long and should be cut back to a pointer.

**Depends on:** nothing. Every satellite depends on this.

**Downstream reader: a Technical Designer**, who takes one system at a time and writes formulas,
pseudocode, inputs and outputs, and edge cases. Every structural choice in this document and in the
split below is made to serve that pass.

---

## 0. How to read this, and the one convention that matters

**Two kinds of statement live in this project and confusing them is the recorded failure mode.**

| | |
|---|---|
| **BUILT** | `DESIGN.md` at the repository root. What the game does today. If it and the code disagree, the document is a bug |
| **DESIGNED** | This folder. What the game is *intended* to do and is not. Some of it contradicts what is built, deliberately |

**Where they disagree, this document says so in place rather than picking one.** Four closed
ideation rounds wrote rulings about nations that are not on the board, which is where programmer
rule 17 comes from. **A number without a provenance is not carried forward here.** Every quantity
below is marked: *measured* (from a named file or a named run, with its date), *authored* (a tunable
or a data file), or *unset* (nobody has decided).

**Two rules governing this stage, from the designer's brief:**

1. **Nothing is invented.** Where the design does not specify something, it is a **Gap**, named as
   one. A document that quietly invents is worse than one with visible holes.
2. **Nothing open is resolved.** Where something is contested or undecided it is an **Open
   question**, and the decision is Aaron's.

---

## 1. Working title

**Manifest Disunity.**

*Called **Nation States** until 15 September 2026. That was a working title and was dropped over a
clash with another game of the same name (D217). `DESIGN.md` and `README.md` were retitled the same
day and both carry the reason.*

---

## 2. Concept statement

> **The United States has already come apart. You take one of the sixty-one nations standing in the
> wreckage, and you decide whether a country can be put back together — by force, by argument, or by
> being the economy everyone else depends on.**

**⚠ DRAFT FOR REVIEW.** The source material states the premise as system description rather than as
a claim about the game; this is the first attempt at the second thing. `DESIGN.md` §1 is what it was
drawn from.

---

## 3. Target audience

**⚠ DRAFT FOR REVIEW — this was absent entirely from the source material.** Nothing anywhere in the
project states who the game is for. What follows is drawn from what the design actually is, not from
a decision anybody has made.

**The primary audience is the grand-strategy player who has bounced off the genre's opacity.**
Someone with hundreds of hours in Paradox titles or Civilization who has, at least once, watched a
number move and been unable to find out why. The design's single most distinctive commitment — the
Why record, which makes every stock able to state its own working — is aimed squarely at that person.

**Secondary: the politically literate reader who does not normally play strategy games** but would
play this one because the map is their actual country, drawn from real county data, and the question
it asks is a live one.

**"Everyone" is not an answer and neither is this until Aaron rules on it.** The commercial question
underneath — whether this is a niche title for people who already like this genre, or a crossover
built on the subject matter — is **not a designer's call** and is filed as open question 1.

---

## 4. Player experience and point of view

**You are one nation, and only one.** `Game.getPlayer()` returns an id; `playerNation()` returns null
when that nation has died, because **losing has to be something the game can say out loud**. This is
load-bearing rather than cosmetic: before it existed, a human took every seat, and an annexation was
not a risk but a transfer between two of your own accounts — which is upstream of every balance
complaint the project has recorded. *Built; `DESIGN.md` §6.2.*

**You are a government, not a person.** You have a leader with a name and a set of modifiers, an
ideology you govern as, and a population that mostly did not choose you.

### The fantasy

**⚠ DRAFT FOR REVIEW — no statement of the fantasy exists anywhere in the source material.**

**You are trying to hold something together, or put it back, while it actively resists you.** The
design grants competence, not omnipotence: you can see clearly and act deliberately, and it will
still not be enough on its own, because the continent is sixty other governments doing the same.

### The emotional target

**⚠ DRAFT FOR REVIEW — absent from the source material.** Three emotions the mechanisms actually
produce, named from what they do rather than from what would sound good:

| | Where it comes from |
|---|---|
| **Dread on a clock** | Nothing collapses in one turn. The stock discipline rate-limits *change*, so a catastrophe costs `maxFall` and a collapse takes a decade — **long enough to be a story, and long enough to be recoverable.** You watch it coming |
| **Being cornered by your own people** | A movement's demand is a question you must answer, and every answer costs. The release valves are *"four prices for the same relief"* |
| **Earned standing** | Recognition, alliance and reunification-by-consent are all things other nations do *to* you, not things you take |

### The phases of a playthrough

**⚠ PARTLY DRAFT.** The opening and the ending are measured; the middle is a ruling that is not
built.

| Phase | | State |
|---|---|---|
| **Opening, roughly turns 1–30** | The painted movements grow toward their ceilings. **First secession measured at t22–t29 across four seeds** at the shipped `sent.maxRise` of 0.014 | Built |
| **Middle, from roughly turn 60** | **The painted movements have capped out.** D223 ruled that the middle game runs on *movements born in play* — round 1's ruling 42 specifies them (Rejoin, Expand, Reconquer). **None of it is built** | ⚠ Designed only |
| **End, to turn 200 / 2086** | Victory checked every world turn over every nation. **The board is still politically alive at the end:** within-nation spread of the leading ideology's share runs **13.3 (t0) → 7.5 (t50) → 5.5 (t100) → 4.8 (t200) → 4.8 (t300)** — it stabilises rather than decaying | Measured |

**⚠ A playtest is sixty turns; a game is two hundred.** These are different numbers and the project
has conflated them once already. The alpha's definition of done is a sixty-turn test, which is
exactly the window the painted movements cover — *so the alpha cannot see the hole in the middle
game.*

---

## 5. Unique selling points

**⚠ DRAFT FOR REVIEW — absent as a list from the source material.** The material was unmistakable
once assembled; nobody had written it down.

**1. Every number can explain itself.** Every power stock returns a **Why record**: its value, its
target, and the full list of inputs with each one's raw figure, its normalised figure, its weight,
its contribution, the tunable key that moves it, and a sentence saying what it is. Nothing
downstream recomputes anything — the panel, the leaderboard and the summary all read the same
record, **so they cannot disagree with each other.** The AI scores moves in the same shape, because
*"why did Texas attack me"* is a question the game has to be able to answer.

⚠ *The claim that no other game in this genre does this is **written from memory and is not
verified.** It is the load-bearing claim under this USP and somebody should check it against actual
titles before it goes in front of a player.*

**2. It is your actual country, at county resolution.** 3,143 real counties with real 2024
population, BEA GDP and presidential vote, merged to **1,688 Areas**. Where a figure is not published
separately, a grounded estimate is apportioned from a real total so national sums stay correct, and
it is **flagged in the interface with an `est.` badge**. The borders the game opens on are cut along
cultural regions somebody actually painted, not along lines drawn to make a nice shape.

**3. Conquest is a trap, and the game says so with arithmetic.** Measured: California conquering
from 58 to 118 Areas over twelve turns moved **Authority 0.501 → 0.515** and **Influence 0.666 →
0.148.** Secure at home, a pariah abroad. The reputational cost scales as `(1 + influence)`, so a
superpower pays more for the same annexation than an unknown does. **And the victory capstone has an
Influence floor**, so a conqueror can hold every acre on the continent and still be unable to close.

**4. Buy now, pay later, as a recurring motif.** The design has produced the same shape at least five
times independently: haste is available everywhere and the reaction lands later rather than at the
till. Pay above a project's quarterly draw to finish sooner and the chance of being found out rises.
**Triage is the game** — not resource optimisation.

**⚠ These four have not been tested against the market question they exist to answer**, which is
*why would someone stop playing Paradox games and play this instead.* That is a claim about players,
and no player outside this project has ever seen the game.

---

## 6. Genre

**⚠ DRAFT FOR REVIEW — implied everywhere, stated nowhere.**

**Turn-based grand strategy**, with an unusually heavy **political simulation** layer and an
**economic** one under that. Closest neighbours by mechanism rather than by marketing: **Civilization
II** for the turn's shape (several things in flight, none of them finishing this turn) and
**Europa Universalis IV** for direction (mission trees, standing arrangements with terms, and
constraints that interlock rather than stack). Both are named by Aaron as the explicit models for the
turn, and the turn was rebuilt from them (D218).

**It is not a wargame.** Force is one derived number pointed at four places, small on purpose —
*"there isn't going to be troops / troop types."*

---

## 7. Visual and audio style

**Visual — partly specified, and specifically.** *Built; `DESIGN.md` §8.*

- **One SVG**, layered: county fills, Area borders, nation borders, nation outline, cultural
  highlights, the action layer, hover and selection. d3 and topojson, both vendored.
- **Eight map modes**, each with a legend: Standard (ownership), Pressure, Political, GDP,
  Population, Geographic, Culture, Economy.
- **Every nation has a flag, drawn as inline SVG from a hash of its id** — layout, palette and charge
  all fall out of it. A flag is a pure function of who you are, so it survives a save without being
  in one and cannot drift from the nation it belongs to. New nations get a **name** drawn against
  their founding ideology: a Distributist breakaway is a *Compact*, a Nationalist one a
  *Directorate*, and no two countries may share a name.
- **A timeline**, stored as one baseline plus per-turn ownership deltas — **13 KB for thirty turns
  against roughly 250 KB naive** — with a cast recording every nation's name and colour when it first
  appears, so the scrubber can name countries that no longer exist.

**⚠ There is no art direction anywhere.** No palette rationale, no typographic intent, no reference,
no statement of what the game should *feel* like to look at. What exists is a description of the
rendering architecture. **Gap 1.**

**⚠ Audio: absent entirely. Not one mention in roughly fifteen thousand lines of design material.**
Not deferred, not ruled out — never raised. **Open question 2**, and it is Aaron's, because it is a
scope and budget question before it is a design one.

---

## 8. Platform and primary technology

**Answered, and precisely.** *Built; `README.md` and `DESIGN.md` §2, §8, §9.*

- **The browser.** Plain HTML, CSS and ES modules. **No build step and no framework**, which is a
  stated project requirement: it must still work in six months.
- **`server.py`** — Python standard library only, no `pip install` and no Node. It serves the repo
  statically and adds the endpoints the game needs to persist state.
- **All geography is baked offline.** The browser never does geography at runtime: `build/build_*.py`
  scripts write JSON into `data/` and the game only reads. **The bakes are deterministic** —
  `build_areas.py` produces byte-identical output across runs, which matters because an Area id is
  the join key for the economy data, both map modes and every save.
- **Two directories, and the split is load-bearing.** `data/` is bake output and nothing hand-edits
  it. `content/` is authored — the ideology table, tunable overrides, the two map modes and saves.
- **Tests run in the browser**, written so the same files run under `node --test` unchanged.
  **956 tests across 51 files, all green, in 212.71 seconds** — *measured at sign-off on 14 September
  2026 and not re-run since.*

---

## 9. Schedule and scope

**In scope has no dates, and that is deliberate — this is a solo project with no delivery
commitment.** What it has instead is an ordered phase list.

**The phase order (D217):** Game Design → Technical Design → build order → implementation.

| Stage | |
|---|---|
| **1. Ideation** | ✅ **Closed 15 September 2026.** Seven rounds, **536 ideas and 178 rulings**, counted 14 September |
| **2. Design** | ◀ **Live.** This document and its satellites |
| **3. Technical Design** | Formulas, pseudocode, inputs and outputs, edge cases. **Every number in this stage is the architect's, not the designer's** |
| **4. Build order** | **Aaron's and the planning stage's.** A design document supplies evidence about what depends on what; **it does not rank, recommend or cut** |
| **5. Implementation and verification** | A separate session that writes and tests code |

**What is already built and playable:** the economy alpha — trade as a standing contract with a term
and a fixed price, transit across other nations' ground with compounding tolls and a notice period,
the rivers and their **fifteen chokepoints**, two seas with the Panama Canal shut between them,
Canada and Mexico as places, a trade network map, and all sixty nations using the system rather than
only the player. Tagged `v0.6`. **The alpha test has not been run.**

### Deliberately out of scope

**Unusually well kept, and it is one of this project's real assets.** `DESIGN.md` §12 is an honest
account of where the model stops; `docs/FUTURE-IDEAS.md` holds **F1–F35**; `docs/deferred.md` holds
numbered defects that do not block. The largest standing exclusions:

- **Sub-turn time.** One turn is one quarter and nothing finer exists. A future design would give
  both clocks (F1); today's choice is its outer clock, so nothing is foreclosed.
- **Troops as objects.** Force is one derived number and four slices.
- **Canada and Mexico as actors.** They are geography: not conquerable, no opinion, no negotiation.
  Any bordering state may route through them at a flat placeholder toll.
- **Power stocks per Area.** They are per nation, so grievance terms are uniform across everything a
  nation owns. Named as a change of scope rather than of model.
- **Distance.** **Nothing in the transit layer has a length.** Measured 5 September 2026 from the
  game's own map: the closest two ports on one sea are **16 miles** apart and the farthest **2,578**,
  priced identically. The raw material exists — the data build computes centroids and throws the
  coordinates away.

---

## 10. Game world fiction

**The world as the player meets it.**

**The game opens on 1 March 2036** — the eve of two hundred years since Texas declared itself a
nation. The Union has dissolved. **Sixty-one nations stand where fifty-one states used to be**, and
the first thing the player sees is a newspaper front page dated that day, printing the opening
edition: *The year the Union dissolved.*

**Twelve of the sixty-one are new.** Texas has gone five ways — Dallas, Houston, El Paso, Austin and
San Antonio. California has gone five ways plus a cession to **Cascadia**, whose nine Areas are the
State of Jefferson's heartland. And **Deseret** is half out of the Mormon Corridor.

**Two dramas fall out of the real data and are kept because they were not designed.**

- **Cascadia opens as a green government over ground that wants something else.** Its Civil Liberties
  open at **0.47** against 0.63–0.71 for the other Californian successors, and it is the only opening
  the faction picker rates *brutal*.
- **Austin is the only blue Texan successor and holds the old Texas seat of government**, surrounded
  by the four states it just divorced.

**Deseret is half-born, and that is the whole point.** The Wasatch Front always cedes; every other
corridor Area rolls its own sub-region's odds, and anything that ends up disconnected from Salt Lake
**does not cede and is remembered as `leftBehind`.** It opens unrecognised, with a parent — so
**Utah's signature is the key that unlocks the continent from turn 0.** Measured: the rest of the
continent's per-turn chance of recognising Deseret goes **0.070 → 0.181** the moment Utah gives in.

**⚠ THE FICTION IS ANSWERED TWICE, INCOMPATIBLY, AND THIS IS THE PROJECT'S LARGEST STANDING
DISAGREEMENT.**

| | New nations | Total | Stateless ground |
|---|---:|---:|---|
| **The story** (`secession-ideation.md` §8) | **29** | 47 | Six regions |
| **The board** (built) | **12** | **61** | **None** |

The Deep South, Appalachia, the Gulf nation, the city-states — Philadelphia, New York City, Chicago,
Detroit — and all stateless ground **are a design and are not built.** Four closed ideation rounds
quoted them as though they were the game. **Every document must say which board it means, every
time.** *This is programmer rule 17, and `docs/deferred.md` 33 carries the four content items that
would close it.*

---

## 11. Core loops

**⚠ Absent as such from the source material. Every ingredient existed; nobody had written the loop.
DRAFT FOR REVIEW.**

### 11.1 The turn loop — three beats

**Specified in full in `turn-design.md`.** The shape only:

| | | Costs |
|---|---|---|
| **1. The briefing** | What landed, what came back, what arrived unbidden — and you answer what it asks | **Nothing** |
| **2. The turn** | Start as many things as you like | **Money and time** |
| **3. End turn** | The world resolves and the briefing comes round again | — |

**There is no action budget.** The limits are **money, time and geography**, and none of them is a
rule that refuses you. **Nothing you gain finishes in one turn; a concession is instant.**

> **The organising rule: a turn holds multiple things you can do; none of them finishes in one turn;
> and the things that do finish in one turn are a card you click.**

**The briefing is the payoff loop, and this is the mechanism under *one more turn*: you end the turn
to find out what finished.** With no action budget there is no *you have used your action* moment, so
**the End Turn button is the only boundary the turn has** — and since nothing completes inside a
turn, the briefing is the only place completion is ever felt. **If a player never sees a bar fill,
the projects are invisible.**

### 11.2 The staggered clocks, and how they do and do not surface

**This is what makes the turns unequal, and it is the honest weakness of the current loop.** The
design already runs many clocks at different periods:

| Clock | Period | Surfaces to the player? |
|---|---|---|
| **Project bars** | Several quarters, per project | ✅ **Yes — as a bar with progress.** The newest and the most visible |
| **Trade deal terms** | 2 / 4 / 8 / 20 turns, **plus a fifth longer term (D228)** | ✅ Yes — countdowns at **4, 2 and 1**, then a full-screen card |
| **Transit notice** | **4 turns** | ✅ Yes — *"a corridor holder who gives notice does not stop a deal, he starts a clock on it"* |
| **Elections** | Staggered by a hash of the nation id and the turn | ⚠ **Partly.** Derived, not stored |
| **Movement growth toward a ceiling** | Continuous, per movement | ⚠ **Only via the pressure map**, and only in three bands for other people's ground |
| **Power stocks** | Every world turn, rate-limited | ✅ Yes — the panel reads *"51% — heading for 64%"*, because a nation visibly on its way somewhere for a dozen turns is more useful than the instantaneous number |
| **Relational memory** | Per-event, decaying by `rel.decay` each turn; the territorial window is 20 turns | ✅ **Yes, as a sentence.** A band — Close / Warm / Indifferent / Cold / Hostile — plus the heaviest memory and its age: *"Hostile: took our ground, 3 turns ago."* **But the decay itself is invisible** — nothing says how long a grievance has left to run. *Verified in `js/relations.js` and `js/panels.js`* |
| **Annexation and release clocks** | Authored cooldowns | ⚠ Partly |

**⚠ Open question 3: three of the eight are half-visible, and the most consequential thing on the
list is half-visible in a specific way** — a player can read *that* a neighbour is Hostile and what
for, and cannot read **how long that has left to run**, which is the number that decides whether to
wait or to act now. Whether that is fog worth keeping or an interface gap is a presentation decision,
and `presentation-design.md` owns it.

### 11.3 The strategic loop

**Direction comes from mission trees**, which are the answer to a real hole: *seven ideation rounds
produced 536 ideas without a single goal among them.* Three trees exist — **Great Lakes, Deseret,
Texas** — each with three branches (Standing, Ground, Building), four elements and one pivot. A
completed mission stays completed. **Specified in `missions-design.md`.**

> **The finding worth carrying: all three trees want the Mississippi, for three different reasons.**
> Texas to strangle the Midwest, the Great Lakes to reach the sea, Deseret to hold Cairo and Nauvoo on
> one river. **Three trees written separately, converging on one river. Nobody designed that.**

---

## 12. Objectives and progression

**Three ways to win**, evaluated over **every** nation once per world turn, as a table of rows rather
than as code paths. *Built; `DESIGN.md` §6.2.*

| | |
|---|---|
| **Reunification of the Union** | The seats of government, half the people, half the economy, and floors under *both* power stocks |
| **Ideological Dominance** | Govern well, be heard, and watch the continent come round |
| **Economic Supremacy** | Be the economy the continent runs on, and rich per head as well as in total |

**The Influence floor in the capstone is the whole design.** Without it the shortest path to winning
is conquering the continent — the strategy the rest of the game spends its time punishing. **A seat
you do not own counts toward Reunification if its holder governs as you do and your Influence exceeds
theirs by a margin**, so a beloved hegemon reunifies through nations it never invaded and a feared
one takes every capital by hand.

**Losing has three shapes, and only one of them is being conquered.** Your nation can be annexed;
it can fragment under you; or you can **go with the breakaway** — when a movement declares out of
your own ground you may become it rather than go down with the parent, offered *after* the
declaration so you decide knowing what actually left, and *before* the defeat check, because the case
worth having is the one where the breakaway takes everything.

### ⚠ Two things D223 broke, both named rather than discovered later

1. **The victory targets were reasoned against an eighty-turn game and a game is now 200 turns.**
   `DESIGN.md` §12 states the reasoning in its own words: the targets are two to five times what an
   AI-only world produces, *"on the reasoning that a player playing deliberately for eighty turns
   should substantially outperform a deliberately mild AI. That last step is a judgement rather than
   a measurement, and it is the first thing a real play test should revisit."* **A 200-turn game gives
   two and a half times that horizon.** *The architect's.*
2. **The middle game has no new separatist pressure arriving.** See §4 above. *Designed, not built.*

**⚠ Surviving is not a win and not a loss, and the game says nothing about it.** Sixty-one nations
and three ways to win means fifty-eight ways not to. **A small nation still standing at turn 200 has
done something, and the game has no way to say so.** Filed to `nation-design.md`.

**⚠ The federal remnant plays a different game** — for Washington, putting the country back together
means **restoring** what it already claims to be; for everyone else it means **replacing** it. Round 7
ruled the asymmetry and left its form open. **There are now three candidate answers, not two**: the
same conditions told two ways, its own condition set, or — from the Texas tree's pivot — **the
remnant's story can be seized**, and you unite the continent as the United States *of Texas*.
*Open in `nation-design.md`.*

---

## 13. Game systems — the map, and the index into the satellites

**⚠ THIS SPLIT IS PROPOSED AND HAS NOT BEEN APPROVED.** It was put to Aaron on 15 September at 03:35
and he redirected to turn design before answering. **Two satellites have since been written against
it.** *Open question 1, and it is the first thing on the list.*

**⚠ The record carried this count twice, differently, and the reason is now established.** D217 says
*eighteen satellites*; the Control Board says *nineteen* and prints the denominator as **20**.
**Both were true when written, and neither said as of when.** The proposal of 03:35 contained
**eighteen**. **`missions-design.md` was not among them** — mission trees did not exist as an idea
until Aaron introduced them later that night, and the document was written and the list never
updated. *Reconstructed from the session transcript of 15 September and verified against the
proposal's own list.*

> **Master plus NINETEEN satellites — twenty documents in total.**
> **Two satellites are written; this master is the third document. Seventeen to go.**

*Corrected here rather than anywhere else, because this is the first place the list has ever been
written down. `missions-design.md` is marked as the addition.*

### Substrate — nothing above them depends on anything else

| File | What it owns | Depends on |
|---|---|---|
| `board-design.md` | Geography as a graph with costs: Areas, adjacency, the transport network and its entry costs, reach, the rivers and their fifteen gates, the two seas, Canada / Mexico / the world market as **places**. Carries the honest gap that **nothing has a length or a coordinate** | GDD |
| `identity-design.md` | The political board and the one function everything downstream uses: the built two axes and the designed three, affinity, the ideology / party / movement distinction, the drift partition | GDD |
| `population-design.md` | How people are counted, how they change their minds, and how they move: the six exact counts, drift, growth, migration's five terms, the sum invariants | GDD, identity, board, power |

### Shared currency

| File | What it owns | Depends on |
|---|---|---|
| `power-design.md` | The five stocks, the rate-limit discipline, and the Why record | GDD, identity, economy, force, governing, diplomacy — *the long list is the point: power is the aggregator* |
| ✅ `turn-design.md` | **Written, 572 lines.** One round of sixty-one slots and one world step; the ordered phases and why each sits where it does; the phase contract; projects; what a decision costs and the three things that are free; plan / resolve | GDD, and it names every system whose phase it orders |

### The systems

| File | What it owns | Depends on |
|---|---|---|
| `movements-design.md` | What a movement is (verb, adjective, ideology), the sentiment formula, the two tiers of secession, the three thresholds read as a set, growth on ungoverned ground, demands and the free-and-mandatory answer phase | GDD, identity, board, population, power, force, governing |
| `governing-design.md` | The government, its leader, its elections, and the price of every answer it can give — release, autonomy, change course, become them, referendum, martial law, stealing a result | GDD, identity, power, movements, economy, force |
| `economy-design.md` | What is produced, what is needed, what things cost: six sectors, capacity × utilisation, bands, derived demand, per-sector effects, price formation, treasury, the occupation surcharge, the sector network and its five loops, **and the logistics spiral with its three unchosen brakes** | GDD, board, population, power, trade |
| `trade-design.md` | Deals with terms, transit grants, tolls on what arrives, friction by mode, the route-finder, capacity, the markets abroad, blockade — **and the three unreconciled internal-trade regimes** | GDD, board, economy, diplomacy, blocs |
| `force-design.md` | One derived number and four places to point it; readiness as a commitment; upkeep; the militia split; bases | GDD, population, economy, power, governing |
| `war-design.md` | Declaring, the fight, the three occupation flags and the digestion ladder, the peace treaty's four levers and the blind double-tabling, the war-cost ledger, what breaking a treaty does | GDD, board, force, diplomacy, power, economy, nation |
| `diplomacy-design.md` | What two nations **are** to each other: the relations list, the eight-state spine and its transitions, recognition, coalitions, the contests and their floors, the one offer object with five faces, alliances, guarantees, vassalage, sponsorship, the overture, creditor demands | GDD, identity, power, trade |
| `blocs-design.md` | The two multilateral objects — the light bloc and the heavy federation, with its leader, treasury, turn, toll and collective defence | GDD, diplomacy, trade, power, governing, war |
| `events-design.md` | The crisis and the shock; blast radius in adjacency hops; proportional share; two budgets; no chains; the opening front page | GDD, board, power, movements, presentation |

### The frame

| File | What it owns | Depends on |
|---|---|---|
| `nation-design.md` | **How a country is born, what it holds, how it ends, and how it wins.** One machine for nation-making: declaration, defection, civil-war fragmentation, unite's fracture, envelopment, stranding, release; the minimums; the honeymoon and the fervour; home ground; extinction; the three victory paths and the remnant's asymmetry | GDD, board, identity, power, movements, war, diplomacy |
| `opening-board-design.md` | **The opening position on 1 March 2036** — who exists, what they remember, what is already signed, **and a line down the middle of every page separating built from designed** | GDD, nation, diplomacy, movements |
| ✅ `missions-design.md` | **Written, 836 lines. ⚠ NOT IN THE ORIGINAL PROPOSAL — this is the nineteenth, added on the night of 15 September** when Aaron introduced mission trees. Three trees, three branches, four elements, one pivot each; what a mission may reward; the name register | GDD, nation, board, trade, diplomacy, movements |
| `ai-design.md` | The other sixty nations: one scoring model over the same Previews the player sees, posture from strain, softmax, the Closing term, and the cost of making it play under a restricted view | GDD, turn, and every system supplying a Preview |
| `presentation-design.md` | What the player sees — the map and its modes, the Why-record panel, the one card shape the game asks questions with, the newspaper, the timeline — **and what a nation may know**, because the only fog in the game exists for a screen reason and not a realism one | GDD, movements, diplomacy, economy, events |

### Three seams deliberately moved away from `DESIGN.md`'s own section breaks

1. **The eight-state pair spine goes to diplomacy, not war.** It describes what two nations are to
   each other; war is one of its states. Somebody writing the fight should not have to own
   hostility's cooling clock.
2. **All nation-making goes into one document.** Round 1 demanded it — *"conquest's civil wars and
   secession's declarations must produce the same kind of country"* — and no document owned it.
   Triggers stay with the system that fires them; everything downstream of *a country now exists*
   lives in one place, so the two paths cannot grow apart.
3. **Information merges with presentation.** Round 7 ruled what *gates* sight and said plainly it did
   not rule what a restricted view *looks like*, and it handed this stage a better test than
   plausibility: **does this screen become a targeting computer?** That is answerable about a screen
   by looking at it. The test and the screens belong on the same page.

**The reservation, stated when the split was proposed and still true — and now one document worse:
nineteen is a lot of documents.** The case for it is that the Technical Designer takes one system at
a time and should
never have to read a system they are not writing. **If fewer, fatter documents are preferred, the
merges to make first are `identity` into `population`, `force` into `war`, and `blocs` into
`diplomacy`** — in that order, each costing the reader something described above. *This is evidence,
not a recommendation to cut; the call is Aaron's.*

---

## 14. Interactivity — what the player is actually doing

**⚠ Absent from the source material in these terms. DRAFT FOR REVIEW.**

| Kind of engagement | What asks for it | Weight |
|---|---|---|
| **Perceptual** | Reading the map. Eight modes, and **the pressure map is the one that matters** — it is where a player sees trouble before it arrives | **High.** The map is the primary instrument |
| **Short-term cognitive** | Answering the briefing. A card arrives, it states the options and their costs, you pick one | **Medium**, and deliberately bounded — a card is one decision with stated prices |
| **Long-term cognitive** | Running several projects against a quarterly bill, against a mission tree, against sixty other governments. **This is the game** | **The dominant mode** |
| **Emotional** | Watching a stock fall for a decade. Being asked by your own people. Deciding whether to go with the breakaway | **High and slow** |
| **Social** | ❌ **None.** Single player. No multiplayer anywhere in the design, not deferred and not ruled out | — |
| **Cultural** | **Very high, and unusual.** The player is expected to recognise their own country — their county, their state's fault lines, the actual 2024 vote. **The names are puns and the puns are deliberate** | **A primary draw and an unexamined risk** |

**⚠ The cultural axis is the one nobody has examined.** A game about the United States coming apart,
using real voting data at county resolution, is making a claim whether or not it intends to.
**Nothing in fifteen thousand lines of design material addresses tone, framing, or how the subject is
handled.** *Open question 5, and it is squarely Aaron's — it is a question about what the game is
saying, not about how a system works.*

---

## 15. Cross-cutting concepts

**Everything here is relied on by several systems, so no satellite owns it. All are built.**

### 15.1 Six ideologies on two axes, and the one function

Politics is not a letter. Six ideologies sit at fixed coordinates on an **economic** axis (collective
↔ market) and a **social** axis (liberal ↔ traditional), authored in `content/ideologies.json`:

| id | Ideology | economic | social |
| --- | --- | ---: | ---: |
| `red` | Republican | +0.6 | +0.2 |
| `blue` | Democrat | +0.3 | −0.4 |
| `green` | Democratic Socialist | −0.6 | −0.7 |
| `yellow` | Conservative Nationalist | +0.5 | +0.7 |
| `orange` | Distributist | −0.4 | +0.6 |
| `purple` | Socialist | −0.8 | −0.2 |

```
affinity(a, b) = 1 - distance(a, b) / MAX_DISTANCE      // 0..1
```

**Coalitions, drift attraction, splinter direction, defection targets and civil-war severity all
derive from it.** That is what makes six ideologies cost two numbers each instead of fifteen
hand-authored compatibility pairs, and a seventh cost two more rather than six. A shared economic
axis is trade alignment; a shared social axis is moral alignment, and `axisDistance` reads them
separately.

**`MAX_DISTANCE` is 1.7804** — the *actual* widest authored pair, Democratic Socialist to
Conservative Nationalist, **not** the 2√2 diagonal of the coordinate box. Normalising on 2.8284 would
squash every real affinity into the top third of the range and make every tuned threshold mean less
than its label says.

**A movement is a slice, not a seventh bucket.** `area.mov[name]` is a slice of
`area.pop[ideologyOf(name)]` — Deseret's members are counted in Conservative Nationalist *and*
recorded as organised under Deseret. The whole population is always exactly `sum(pop)`, so every
phase that moves people ignores movements entirely, and a cleanup phase clamps each movement back
inside its bloc once a turn. **Deseret is therefore not an opinion but an organisation of an
opinion**, which is what lets the model tell *"Deseret grows"* and *"Conservative Nationalism grows"*
apart.

**⚠ THE LARGEST DESIGN-VERSUS-BUILT GAP IN THE PROJECT.** The six-ideology two-axis model above is
what every downstream formula reads. **Politics rulings 1–2 replace it with three axes and ten
positions** — eight corners plus two centrists, with despotism and statelessness as trapdoors off the
edges — and ruling 40 then prices *change course* by distance on that new board. **Nothing reconciles
them.** *Open question 6; `identity-design.md` owns it and cannot be written without an answer.*

### 15.2 The Why record

Every power stock returns its own working — value, target, raw, base, and an array of inputs each
carrying a label, its raw and normalised figures, its weight, its contribution, **the tunable key
that moves it**, and a sentence saying what it is; plus a one-line summary built from the same array.
**Nothing downstream recomputes anything.** The AI's move scores are the same shape, with one
difference: **a score may be negative**, because the difference between a bad move and a
catastrophic one has to survive, and clamping to [0, 1] destroys it exactly where it matters.

**Normalise before weighting.** Every input is mapped to 0–1 by a named curve — `ramp` for quantities
with a natural *enough*, `saturate` for unbounded counts with diminishing returns — **before** its
weight applies, so weights are comparable and a slider means the same kind of thing everywhere.

### 15.3 The stock discipline

```
value = max(floor, clamp01(previous + clamp(target - previous, -maxFall, +maxRise)))
```

**The change is rate-limited, not the value, and that difference is the whole anti-death-spiral
guarantee.** Clamping the value to a minimum leaves the *pressure* unbounded, so the moment the clamp
relaxes the nation falls off a cliff — the clamp hides the problem. Limiting the change means a
catastrophic turn costs `maxFall` and a collapse takes a decade. **`maxFall` is 0.08 and `maxRise` is
0.05, because standing is easier to lose than to build.** A stock with no previous value opens **at**
its target rather than climbing from the floor. The `target` is kept beside the `value` so the panel
can say *"51% — heading for 64%"*.

**Turn-0 bands across the 51-state baseline: Authority 0.44–0.56, Influence 0.45–0.66, Quality of
life 0.55–0.98, Civil liberties 0.60–0.84.** *Measured.*

### 15.4 Columnar state

Every per-Area field is one typed array indexed by an integer node number, declared once in a
`FIELDS` registry. **A turn's snapshot is one `.slice()` per field, and adding a field is one
registry entry** — clone, byte accounting and the save path all iterate the list, so nothing can add
a field that the save silently drops. **Float64 for people and money** (the world total is an exact
integer invariant and 24 bits of mantissa is not enough); Float32 for bounded 0–1 scores.

**A nation is derived, never stored.** Population, GDP and politics are always the sum of the Areas it
owns, and the suite enforces it: every Area's ideology counts sum exactly to its population, and every
nation's totals reconcile with its Areas'. **Ownership is stored in exactly one place.**

### 15.5 The phase contract

A world turn runs a fixed order of phases over the columnar buffer. Precisely:

- **No phase reads back a value it wrote.**
- Every cross-Area **aggregate** is computed from the snapshot.
- Per-Area values **do** compose down the pipeline — a later phase sees an earlier one's result. This
  is deliberate and noted at each site that relies on it.
- **Ownership is snapshotted for the whole turn**, so a phase that moves an Area cannot make its
  successors see the move.

**Two phases read Areas other than the one they write, and they are the two that need care.**
Political drift reads its neighbours' mixes. **Migration writes to its neighbours, which is worse:**
every flow on the board is computed before any is applied, because applying as it goes would let the
first Area's arrivals decide the second's departures — **and the node numbering would decide who
moved.**

**Two orderings are load-bearing and should not be moved without reading why.** The five power stocks
recompute **last**, because every input the power phase reads is a result of *this* turn; running it
earlier would report the previous turn's world with this turn's label on it. **Elections run just
before them** for the mirror-image reason: the four things a government is answerable for at the polls
are four of the five stocks, and an election held after the recompute would be judging the world its
own result produced.

### 15.6 Plan and resolve

`Moves.plan(intent, tune)` is **pure** — no RNG, no DOM, no mutation — and returns a **Preview**:
`{ok, reason, cost, effects[]}`. The interface renders it and then calls `Moves.resolve`. The AI
plans over its candidates, scores the previews, and resolves the winner.

**Being the same function is what stops the player's preview and the AI's model from ever disagreeing
about what an action does** — and a disagreement there is *unfalsifiable from inside the game*,
because each side only ever sees its own answer.

**`reason` is a sentence, not a code**, so the interface prints it and the AI filters on `ok` without
either re-translating.

### 15.7 Determinism

**The same seed reproduces a run exactly. It is tested.** Each system has its own named random stream
derived from `hash(seed, name)` — `spawn`, `combat`, `turnorder`, `unite`, `drift`, `scenario` — so
**adding a die roll to combat cannot reshuffle party spawns.** The whole generator serializes and
restores in one step. Neighbour rows in the adjacency graph are sorted by index, so neighbour order
is a property of the graph rather than of a file's key order — which used to decide `argmax` ties and
make a re-bake a silent replay divergence.

### 15.8 One tunable per constant

**Every model constant is a named tunable** with a label, a doc line and a slider range. `TUNE.get`
records every read and `TUNE.trace(fn)` returns the exact set of keys a computation touched.
**The schema holds 370 entries** — *counted 15 September 2026.* Authored overrides live in
`content/tunables.json` and the dashboard generates every slider from the schema, so a tunable added
in code appears with no work and one renamed cannot leave a stale control behind.

**Honesty about the tuning, stated by the project against itself:** most numbers are still chosen by
argument rather than measurement. Counted strictly — a doc that says *measured* and then gives the
number — **that was 21 of 298 sliders**, and the denominator has since moved to 370 without the
numerator being recounted.

---

## 16. What the player is measured in — the five stocks

*Full working in `power-design.md`. Named here because eight satellites read them.*

| Stock | What it measures | Rises with | Falls with |
|---|---|---|---|
| **Authority** | How firmly a state holds its own ground | Age, tenure, wars won, solvency, cohesion | Territory lost, occupation, overreach, self-rule granted |
| **Influence** | How much the rest of the world listens | Economic weight, trade reach, alignment abroad | Conquest × (1 + influence), blitz pace, occupation, a coalition against you, not being recognised |
| **Quality of life** | How well it feeds, treats and pays its people | Food security, healthcare, prosperity | Fiscal strain |
| **Civil liberties** | How freely it lets people disagree | Alignment at home, government type, prosperity | A divided people, occupation, a garrison at home |
| **War weariness** | What a decade of fighting costs at home | Wars fought, ground taken, civil wars | Peace, and only peace |

**Authority and Influence must be able to disagree — that is the entire reason there are two.**
See USP 3 for the measurement.

**War weariness is the one that runs the other way**, and the only stock with a floor of zero rather
than of `power.floor`: **a nation at peace is not eight per cent exhausted.**

---

## 17. Open questions

*A decision Aaron has not made. Ordered by what blocks the most work.*

| | | Blocks |
|---|---|---|
| **1** | **Is the split approved, and is it nineteen satellites?** Proposed 15 September 03:35 as **eighteen**, never answered — he redirected to turn design. **Two satellites have been written against it since**, one of which (`missions-design.md`) was never in the proposal, which is why the record carries two different counts. §13 has the full list and the resolution. The alternative on the table is fewer, fatter documents; §13 names the first three merges and their costs | **Everything after this document** |
| **2** | **Audio: is there any?** Absent entirely from the source material — never raised, not deferred. A scope and budget question before it is a design one | `presentation-design.md` |
| **3** | **Three of the eight staggered clocks are invisible or half-visible**, and two of them drive other nations' behaviour toward the player. Fog worth keeping, or an interface gap? | `presentation-design.md` |
| **4** | **Target audience, and the commercial question under it** — a niche title for people who already like this genre, or a crossover built on the subject matter? §3 is a draft | The pitch layer |
| **5** | **Tone and framing.** A game about the United States coming apart, on real county-level voting data, makes a claim whether or not it intends to. **Nothing anywhere addresses it** | `presentation-design.md`, and arguably everything |
| **6** | **Two axes or three?** The built model is six ideologies on two axes and every downstream formula reads it. Politics rulings 1–2 replace it with three axes and ten positions. **Nothing reconciles them, and this is the largest design-versus-built gap in the project** | `identity-design.md`, and through it `population-design.md`, `movements-design.md` and `governing-design.md` |
| **7** | **May a design session edit `DESIGN.md`?** Asked at 03:35 on 15 September as part of the same message as (1), never answered — **and it was then edited anyway.** D217 records the permission as granted; no evidence of the grant exists. The edits themselves are three careful, marked corrections **and they are good work**; the question is whether the permission is real | The record, and every future stage-2 session |

---

## 18. Gaps

*Referenced and never specified. Distinct from an open question: these may already have been decided
and simply are not written down anywhere.*

| | |
|---|---|
| **1** | **There is no art direction.** No palette rationale, no typography, no reference, no statement of what the game should feel like to look at. What exists is a description of the rendering architecture |
| **2** | **`DESIGN.md` §9 says the save format is version 2. The code says `VERSION = 3`, and §12 says so too.** *Verified against `js/statedoc.js` on 15 September 2026.* **This is a fourth self-contradiction, beyond the three D217 found and the session of 15 September corrected** |
| **3** | **`DESIGN.md` §4.1 and §12 both state that treaties and aid do not exist.** Both are built — a non-aggression pact with a cooldown and a minimum standing, aid as a treasury transfer that buys patronage, and three relation kinds for them. *`docs/deferred.md` 13, found 6 September and still open* |
| **4** | **`DESIGN.md` §6 opens *"One action per nation per turn. Each ends the turn."*** That is a true description of what is **built** and a false description of the design, which D218 replaced. **The two documents now disagree by design** and every reader has to know which they are holding |
| **5** | **The movement roster's live count is not written down anywhere.** `data/parties.json` holds **32 movements** — *counted 15 September 2026.* `DESIGN.md` §7 says thirty-two spawn. Politics is recorded as having struck six, which would leave **26 live**, and **that figure has not been verified against the data** |
| **6** | **Nothing specifies the vocabulary of a card.** Two full-screen cards exist — an expiring deal and a transit request — and neither is described as an instance of a general form, though `turn-design.md` requires that they are one. *Belongs to `presentation-design.md`* |
| **7** | **Nothing says how a nation's opening memories are dated.** Whether they are spread across the two years before turn 0 or all stamped *two years ago* changes nothing visible if eight turns of decay are indistinguishable. **Measure before building** |
| **8** | **No multiplayer exists anywhere in the design** — not built, not deferred, not ruled out, never mentioned. Recorded because its absence is currently an accident rather than a decision |
| **9** | **⚠ THE TWO BRIEFS GOVERNING THIS STAGE DISAGREE ABOUT WHAT A DESIGN DOCUMENT ENDS WITH.** `docs/design/DESIGNER-BRIEF.md` says *"End every design document with the scenarios it must be able to tell, each one traced"* and calls worked examples *"your test suite"*. The GDD brief of 15 September specifies a four-part satellite — Depends on, the system, Open questions, Gaps — **and traced scenarios are not one of the four.** **Neither written satellite has a traced-scenarios section, and neither does this master.** The newer, more specific brief was followed. *Recorded rather than resolved: whether tracing is dropped or reinstated is Aaron's, and it is the practice that found contradictions in every closed ideation round that the rulings alone did not* |
| **10** | **`docs/design/DESIGNER-BRIEF.md` is itself stale and is the file a new design session is told to paste.** It states the live stage is ideation, names round 4 as the live round, and forbids editing `DESIGN.md` — all three superseded. **A session started from it would begin by contradicting the current phase.** *Found 15 September 2026* |

---

*Sources, verified against the files on 15 September 2026 unless marked: `DESIGN.md` §1, §2, §2.1,
§3, §3.1, §4, §4.1, §6, §6.2, §6.3, §8, §9, §11, §12; `README.md`; `js/statedoc.js` (save version);
`data/parties.json` (32 movements); `data/economy.json` (the six sectors); `data/areas.json` (507
merge groups); `docs/design/turn-design.md`; `docs/design/missions-design.md`;
`docs/design/secession-ideation.md` §8; `docs/design/politics-ideation.md` rulings 1, 2, 40;
`docs/design/the-things-above-ideation.md`; `docs/deferred.md` 13, 33; `DECISIONS.md` D163, D166,
D217–D228. **Performance and spread figures are quoted from `DESIGN.md` and `DECISIONS.md` with
their original dates and were not re-measured for this document.***
