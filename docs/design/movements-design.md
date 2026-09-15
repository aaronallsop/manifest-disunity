# Movements — why a region turns against you, and what it does about it

**Stage 2 of five: DESIGN.** A specification for the Technical Designer, not an idea bank.

**Depends on:** `GDD.md` · `identity-design.md` (a movement is a slice of a position) ·
`population-design.md` (membership is people, and every phase that moves them ignores movements) ·
`board-design.md` (homelands are Areas; the pull term walks the adjacency graph) ·
`power-design.md` (four of the six grievance terms are stocks) · `governing-design.md` (what a
government can do about one) · `force-design.md` (the garrison).

**Read by:** `nation-design.md` · `governing-design.md` · `events-design.md` ·
`opening-board-design.md` · `missions-design.md` · `ai-design.md`.

**Status: the model is BUILT and well measured. The verbs, the demands and the movements born in play
are DESIGNED and not built.** Round 1 is the largest single bank in the project — **53 rulings.**

> **The one-sentence version: geography says where a movement CAN exist, ideology says how strong it
> is there, and the government's own record says how fast it grows.**

---

## 1. What a movement is

> **Three things: a VERB — what happens if it wins. An ADJECTIVE — what would make it stop wanting to.
> And an IDEOLOGY — the politics it travels on.**

*Rulings 39, 40 and 43. The adjective **constrains** the ideology — Aaron: "Christian nationalists
wouldn't be socialists" — **but it does not determine it.***

**And it is bound to counties, never to state lines.** *Ruling 51: **a state line may appear in what a
movement WANTS — reunite Texas, annex eastern Oregon, an end to Denver's rules — and never in where it
IS.***

### 1.1 The six verbs

**Ruling 39. The verb is the whole of what the engine needs: it decides what happens when the movement
wins.**

| | **Forward** — something new | **Backward** — something that was |
|---|---|---|
| **Nations merge** | **Unify** — several states solidify into one nation that never existed *(the Farmers Union)* | **Reunify** — a broken state is put back together *(Texas, California, the Confederacy, the USA)* |
| **Ground leaves** | **Separate** — this ground stops being part of its state and becomes its own | **Rejoin** — ground that left, or was taken, wants to go back to a parent that still exists |
| **A nation takes** | **Expand** — a nation's own people push their government to take ground | **Reconquer** — take back what was lost |

> **Unify, Reunify, Separate and Rejoin all move the movement's OWN ground. Expand and Reconquer are
> pressure on your own government to move SOMEBODY ELSE'S.** *That is the line between the two halves
> of the table and it decides which system answers each one.*

### 1.2 The five adjectives

**Ruling 11a, and the merge test is exact: *two adjectives merge when the same government act cures
both.*** Seven became five.

| Adjective | Movements | What removes the want | Merged in |
|---|---:|---|---|
| **autonomist** | 7 | Self-rule, and giving land back — **the same cell as *concede less*, so these two collapse** | **indigenous** |
| **cultural** | 6 | Recognition — let them be what they are, inside your state | |
| **ideological** | 6 | Change course ·*built* | **religious** |
| **resource** | 3 | A share of what its own ground produces | |
| **economic** | 3 | Deliver the prosperity by other means — national policy | |

**Resource did NOT merge with economic, and the reason is which machinery each re-points:** *resource*
is **revenue forgone locally and permanently**, which re-points **autonomy**; *economic* is **national
policy**, which re-points **trade**.

> **An autonomist movement is the cheapest kind to satisfy, because its cheap substitute and its cure
> are the same act.** **And the whole design is 6 verbs + 5 adjectives + 5 moves = SIXTEEN things, not
> forty-two authored cells.**

### 1.3 Two states, and one of them is read rather than set

**REALISED** — its nation exists, so its own ground reads as loyalty and its homeland covers that
ground automatically. **GROWING** — no nation yet, painted in levels that roll at setup.

**The built state machine is `latent → rising → armed → declared → realized`, and it is READ OFF THE
MAP EVERY TURN, never set by an event.** *That is why a movement cannot get out of step with the
board it is on.*

---

## 2. The record, as built

```
{ id, name, ideology, type, homeland[], core[], seed[],
  growthCap, growthRate, goals[], sponsor, nation, state }
```

| Field | What it is |
|---|---|
| **homeland** | **Every Area it can exist in. Geography decides where** |
| **core** | The Areas it must **all** hold to declare. **Derived** in the bake as the smallest set of homeland Areas holding **60%** of its people, never fewer than three. *Not guaranteed contiguous* |
| **seed** | Where it actually started, which is its core |
| **growthCap** | Its own ceiling — **0.25 for a nuisance, 0.60 for a country in waiting** |
| **growthRate** | A multiplier on `sent.maxRise`. Default 1.0; **Deseret is 1.5. Only the RISE is scaled** |
| **nation** | The country it realised into. It arms tier-1 defection toward that country **and stops the movement being a candidate to declare a second one out of the first one's territory** |
| **state** | Read off the map every turn |

**⚠ The authored file does not have this shape.** `data/parties.json` carries
`{id, chance, share, ideology, type, growthCap, growthRate, goals, counties, core}`. **There is no
`homeland`, `seed`, `sponsor`, `nation` or `state` key in any of the 32 records** — `counties` is the
homeland, and the rest are runtime or derived. *Gap 1.*

**Every Area is inside somebody's homeland.** *Measured: 348 Areas were outside the system when five
whole states had no movement at all, 278 after one fix, 179 after the east got five of its own, and
**zero** since.*

---

## 3. Sentiment — the model, exactly

```
base        = affinity(the Area's leading ideology, the movement's)          0..1
grievance   = w_qol   * (1 - quality of life)
            + w_lib   * (1 - civil liberties)
            + w_power * (1 - how powerful the nation holding it is)
            + w_auth  * (1 - that nation's authority)
            + w_wear  * war weariness
            + w_boost * the Area's own authored grievance
pull        = w_nbr   * tanh(k * SUM over neighbours of their share)
suppression = w_sup   * garrison pressure

target      = clamp01( base * (grievance + pull) - suppression )
```

| Term | Tunable | Value |
|---|---|---:|
| quality of life | `sent.wQol` | **0.22** |
| civil liberties | `sent.wLiberty` | **0.20** |
| how powerful the holder is | `sent.wPower` | **0.14** |
| the holder's authority | `sent.wAuthority` | **0.18** |
| war weariness | `sent.wWeariness` | **0.22** |
| **the Area's own authored grievance** | `sent.wBoost` | **0.35** |
| the neighbour pull | `sent.wPull` · `sent.pullScale` | **0.42** · **0.9** |
| suppression | `sent.wSuppression` | **−0.30** |

**⚠ The block above is INCOMPLETE as printed in `DESIGN.md`, and this is the correction.** A seventh
factor exists: **grievance blends the AREA's own quality of life and liberties with its nation's at
`sent.wLocal` = 0.55.** *The formula reads the two stocks flatly; the code does not.* **Gap 2.**

### 3.1 Four things about that formula that are load-bearing

**`base` is MULTIPLICATIVE, and this is the most important line in the document.**

> **Geography defines where a movement can exist; ideology defines how strong it is there.**
> **Misgovern a Democratic Socialist city and you do not get Deseret — you get somebody else.**
> *Additive grievance would let bad government alone produce any movement anywhere, collapsing
> thirty-two regional factions into one national discontent meter.*

**`w_boost` is the only term that is a property of the PLACE rather than of the nation holding it.**
It is authored per Area — *the Shattering uses it for the Mormon Corridor that did not cede, hardest on
the ground that voted to go and was cut off* — and **it rides INSIDE grievance rather than beside it,
so it is still multiplied by `base`.** *An authored grievance cannot radicalise a place into a movement
whose ideology it does not share.* **It shows up in the panel as *Unfinished business*.**

**`pull` uses `tanh` so that one committed neighbour matters a great deal and the tenth matters
little.** *A movement spreads along a frontier; it does not multiply by how many friends it already
has.* **Read from the snapshot, never from the working buffer.**

**Sentiment IS the share — there is no second quantity.** *The head count a movement has organised is
exactly what its share of the Area means; a second number beside it would be two representations of
one fact needing two stacked rate limits.* **Nothing new goes in the save.**

### 3.2 Growth is rate-limited, not value-limited

**The same discipline as the power stocks. A region takes years to turn.**

`sent.maxRise` = **0.035** per Area per turn. `sent.maxFall` = **0.05** — *larger than the rise,
because **organising is slower than collapsing**.* `sent.floor` = **0.004**.

**⚠ `content/tunables.json` overrides `sent.maxRise` to 0.014** — *the only override in the whole
authored tuning file.* **So the live rise is 0.014, not 0.035**, and it was tuned across four seeds to
put the first secession at **t22–t29**.

**Measured over 60 turns on the baseline board:**

| | Peak Area share | Areas |
|---|---|---|
| **Deseret** | 0.197 → **0.601** (its cap) | 6 → **61** |
| **A Free Texas** | — | 11 → **117** |
| **Cascadia** | — | 9 → **50** |
| **El Paso United** | 0.145 → **0** | — |
| **Hawaiian Sovereignty** | 0.230 → **0.160** | — |

**⚠ There is a SECOND growth track and two ceilings for one quantity.** A separate emergent-party
phase closes **3%** of the gap to a **35%** per-Area ceiling (`world.partyStep`, `world.partyCeiling`).
**That 35% is below 22 of the 32 movements' own `growthCap`.** *Nothing reconciles them.* **Gap 3.**

---

## 4. Demands — free, mandatory, and not built

**Ruling 12, and it is the first thing in the whole design to get a guaranteed decision every turn
without spending the action.**

> **Aaron: *"Responding to them is not counted as part of your turn and it is something you have to do
> before you can move on."***

**Measured volume: median 2 movements touching a state, worst 5 — and the worst is Oregon. Eight
states have one or none.**

**⚠ The precedent it set is the thing to carry forward, not the ruling:** *every other component will
now want the same channel, and **the answer has to be no unless it earns it the same way.*** *Three
have since asked — movements, events, and the answers to offers you sent. `turn-design.md` §4 is where
that was settled.*

### 4.1 The three answers, and silence is the expensive one

| Your answer | What the movement does |
|---|---|
| **Implement** | You pay whatever the act costs. Satisfied, for now |
| **Decline** | **It grows faster.** An honest enemy inside your own country |
| **Wait, and never deliver** | **Its verb changes toward *Separate*** |

**Ruling 22 counts BROKEN PROMISES, not turns.** *A turn timer punishes a government that said wait
once and then delivered late; a count of promises made and not kept punishes exactly the behaviour
being named.* **It moves one step, always to *Separate*, and never back.** *A movement that has been
disappointed does not start believing you again.* **It fires once, as an event the player is told
about.**

**And it is immune to a player who simply never opens the screen, because answering is mandatory.**

> **⚠ Finding G, and it is the only exit from a permanent feud in the whole design: a country can talk
> its way out of a forever-war by DISAPPOINTING ITS OWN HARDLINERS until they stop asking — at the
> price of turning them into separatists.** *Nobody designed it. It fell out of ruling 30.*

**The adjective does NOT change, only the verb** — *the farmers still want farm policy, they just want
it in their own country now.* **A default taken, one line to reverse.**

**⚠ NOTHING OF §4 IS BUILT.** *There is no petition or demand machinery in the game at all.* **Gap 4.**

---

## 5. Secession, in two tiers

| | |
|---|---|
| **Tier 2 — discrete** | A movement whose core is **entirely** over `secession.countyThreshold` **DECLARES**: its over-threshold Areas break away as a nation |
| **Tier 1 — continuous** | Once that nation exists, further Areas that cross the threshold **DEFECT** to it along its frontier, **at most `secession.maxPerTurn` = 3 a turn** |

> **Declaring is how a movement becomes a country; defecting is how that country grows.** *Letting
> tier 1 create nations too turns the map to confetti, because at a 0.40 threshold with caps up to 0.60
> dozens of Areas sit over the line at once.*

### 5.1 The three thresholds, read as a set

| | Value | What it means |
|---|---:|---|
| `secession.countyThreshold` | **0.40** | The share an Area must organise before it will leave. **Also what *armed* means**, and what every core Area must clear before a declaration |
| `secession.risingThreshold` | **0.20** | **Purely descriptive** — it changes what the interface says, not what the model does |
| `secession.coreShare` | **1.0** | **An AND across the whole core** |

**⚠ `coreShare` = 1.0 has a recorded failure and it is instructive.** *The AI defeated it completely:
**one annexed core Area held every movement below the line, and forty turns produced zero declarations
where the same seed without an AI produced two.*** **A movement should declare when it holds its
HEARTLAND, not when it holds every last piece of it.**

### 5.2 Birth — a grace period and a price, opposite in sign

| | Value |
|---|---:|
| `secession.honeymoonTurns` | **4** |
| `secession.honeymoonAuthority` | **0.9** |
| `secession.transitionGdpLoss` | **0.12** |

**The honeymoon exists because a nation founded this turn has no age, no tenure and no reserves, so
EVERY other Authority term reads zero.** **It is a decaying Authority TERM, so a player can watch the
reason expire** rather than being handed an unexplained number.

**The transition loss is institutions, contracts and trade routes all breaking at once.**

**⚠ And conquest is filtered by REASON when a nation is born** — *annex and war only — or a movement
declaring with 39 Areas is scored as having blitzed 39 Areas on the day it was founded.*

---

## 6. The release valves — the same relief at four prices

> **Liberties, revenue and Authority, the Area itself, or your own government's identity.**

*Full pricing in `governing-design.md`. What belongs here is what each does to the movement.*

| Valve | What the movement gets | Its price |
|---|---|---|
| **Release** | Exactly what it wanted | The Area. **Needs a RECIPIENT, not a target** — without that guardrail, releasing is a way to *dump* counties |
| **Autonomy** | `autonomy.sentimentRelief` = **0.45**, applied to **the whole grievance** rather than one term — *because the answer autonomy gives is not "your quality of life improved" but "this is your government now"* | **Revenue and reach** |
| **Change course** | The cure, for **ideological** movements only | **Your identity**, and the majority you had |
| **Garrison** | Suppression, at `sent.wSuppression` = −0.30 | **⚠ It is the one that makes the next movement** |

> **The garrison is the only valve that answers a movement with force rather than a concession, and it
> buys quiet in the sentiment phase and pays for it in the stock that feeds the grievance driving the
> next one.** *`liberty.wGarrison` = −0.35. **Suppression buys you this term and buys the grievance
> that takes the next one.***

---

## 7. Movements born in play — ruled, and not built

**Ruling 42: three of the six verbs are born in play, not painted.**

| Verb | Fires when | What it would read |
|---|---|---|
| **Rejoin** | The state holding this ground governs it badly | Authority, quality of life, war weariness, occupation — **all built** |
| **Expand** | The nation is short of something | The economy's coverage figures |
| **Reconquer** | The nation has lost ground | The `lost` relation memory — **built** |

> **Painted at setup: Unify, Reunify, Separate. Born in play: Rejoin, Expand, Reconquer.**

**Ruling 44 refines it: a condition can already be true on turn 0, so Expand and Reconquer can ALSO be
authored at setup.**

**⚠ THIS IS THE MIDDLE GAME AND IT DOES NOT EXIST.** *D223 ruled that everything after roughly turn
sixty runs on movements born in play, because the painted ones reach their ceilings inside the first
third of a 200-turn game.* **All thirty-two spawn once at setup and nothing founds a movement in
play.** **Gap 5, and it is the largest one in this document.**

---

## 8. The roster — what is actually on the board

**`data/parties.json` holds 32 movements.** *Six of them were struck by ruling 45 and are still in the
file with a 0.5 spawn chance — see `identity-design.md` §5.3. The design says 26.*

**Six are deterministic** (`chance` = 1.0): **Cascadian Separatists, Deseret, Greater Idaho, State of
Jefferson, Franklin, New England Revivalist.** *A run that happens to have no Deseret in it is not the
scenario, and an East with no Franklin is not the widened East.*

**Two carry a raised opening share** (`[0.05, 0.3]` rather than `[0.0, 0.2]`): **Native American
Confederation and Hawaiian Sovereignty.**

### 8.1 ⚠ Nine movements are capped BELOW the line they must cross

| Movement | Cap | People |
|---|---:|---:|
| Blue-Collar Populist | 0.35 | 70,123,744 |
| Great Lakes Free Trade | 0.30 | 23,731,284 |
| The Farmers Union | 0.30 | 22,638,807 |
| New England United | 0.35 | 15,386,085 |
| Central States Union | 0.35 | 9,998,817 |
| Sagebrush Rebellion | 0.35 | 5,586,384 |
| Front Range Republic | 0.35 | 4,986,980 |
| Acadiana | 0.35 | 1,527,231 |
| El Paso United | 0.35 | 944,471 |

**The secession line is 0.40. So 118 million people — 38% of everyone inside any live movement — are
organised under something that CANNOT reach the line on its own.** *They can break a country and never
make one.*

**Ruling 41 raised three of them to 0.45 and the change was never applied.** *0.45 is the modal cap
among movements already above the line — seven carry it.*

### 8.2 ⚠ The type vocabulary in the data is the superseded one

**Rulings 39, 40 and 43 replaced *types* with verb + adjective + ideology. `data/parties.json` still
stores `type` as `separatist / autonomist / ideological / reunification / economic / irredentist /
indigenous / theocratic-separatist` for all 32.** *And ruling 44 changed four verbs that the data does
not know about:* Front Range Republic and Hawaiian Sovereignty are still `separatist` and `indigenous`
where the ruling makes them **Expand**; Blue-Collar Populist and Christian Nationalism are still
`ideological` where the ruling makes them **Unify**. **Gap 6.**

### 8.3 ⚠ Programmer rule 17 — the roster, not the code

**The board has TWELVE new nations. The story has twenty-nine.** *Appalachia, the Gulf Compact, the
Deep South, the Carolinas, Central Florida, the United States of New England, Superior, the Allegheny
Republic, the Lakota Nation, the city-states and **all six stateless regions** are STORY ONLY and are
NOT BUILT.*

**Four closed rounds wrote rulings about nations that are not on the board.** *Nine of them carry hard
measured figures in round 1's realised-movements table — all of it story arithmetic, not board state.*

---

## 9. What this hands the Technical Designer

| | |
|---|---|
| **`base` multiplies, it does not add** | §3.1. **This is what keeps thirty-two regional factions from collapsing into one national discontent meter** |
| **The state is READ off the map, never set** | So a movement cannot get out of step with the board |
| **Sentiment IS the share** | No second quantity, no second rate limit, nothing new in the save |
| **The rate is limited, not the value** | The same anti-spiral discipline as the power stocks |
| **The core is DERIVED in the bake** | Smallest set holding 60% of the people, never fewer than three. **Not guaranteed contiguous** |
| **⚠ `coreShare` = 1.0 is defeatable** | One annexed core Area froze every movement on the board. §5.1 |
| **⚠ Two ceilings exist for one quantity** | §3.2, and nothing reconciles them |
| **⚠ Everything in §4 and §7 is unbuilt** | Demands, the answer phase, and the entire middle game |

---

## 10. Open questions

| | | Owner |
|---|---|---|
| **1** | **⚠ When does a movement start DEMANDING?** Finding A: *the petition threshold must sit below the secession threshold, and nobody set one.* **Ruling 12 made it BLOCKING** — a mandatory per-turn demand phase cannot be built without it. **Diplomacy ruling 6 later set it as a fixed gap below the secession line; the gap itself is still unset** | **Aaron**, then the architect |
| **2** | **How many broken promises flip a verb?** Ruling 22 deferred it and no figure was substituted | **The architect** |
| **3** | **Ruling 15's X% — the share at which a Unify movement's demand fires.** ⚠ **Constrained: it must sit BELOW 0.30**, or the Farmers Union and Great Lakes Free Trade can never demand at all | **Aaron**, then the architect |
| **4** | **Should `coreShare` stay at 1.0?** §5.1 records that it was defeated by a single annexation. **A movement should declare when it holds its heartland** | **The architect** |
| **5** | **Do the nine capped-out movements stay capped?** §8.1. Ruling 41 answered three of nine and was not applied | **Aaron** |
| **6** | **Is the 35% emergent ceiling or the per-movement `growthCap` the real one?** §3.2 | **The architect** |
| **7** | **What does a REALISED movement do when its goal is met** — dissolve, become the new nation's founding loyalty, or take a new goal? *Four movements have already got what they wanted* | **Aaron** |
| **8** | **Keep the ideology gate for growing movements and make it a modifier for realised ones?** Parked by Aaron: *"let's wait on that ideology until we get there."* The recommendation on file is yes — *a country you can see is a stronger argument than an idea* | **Aaron** |

---

## 11. Gaps

| | |
|---|---|
| **1** | **The authored record shape is not `DESIGN.md`'s record shape.** §2. No `homeland`, `seed`, `sponsor`, `nation` or `state` key exists in the file, yet three separate rulings describe `sponsor` as *"built-but-unused"* |
| **2** | **The published sentiment formula omits `sent.wLocal`.** §3. Grievance blends the Area's own stocks with the nation's at 0.55 and the formula shows neither the blend nor the term |
| **3** | **Two ceilings for one quantity.** §3.2 — a 35% emergent ceiling against per-movement caps up to 0.60 |
| **4** | **No demand machinery exists at all.** §4. *The only `demand` in the code is the economic kind* |
| **5** | **⚠ Nothing founds a movement in play, and the middle game depends on it.** §7 |
| **6** | **The data's `type` vocabulary is superseded and four verbs changed without it.** §8.2 |
| **7** | **⚠ A live defect: the three places that read a movement's strength take the largest movement share in an Area with NO CHECK ON WHOSE MOVEMENT IT IS** — so a nation is charged for its own founding population three times over. *Affects the AI, the pressure map and the occupation surcharge.* `deferred.md` 14 |
| **8** | **`DESIGN.md`'s core examples do not match the baked data.** It says Deseret's core is *"the Wasatch Front (6 Areas)"*; the baked core adds **Mohave and Yavapai, Arizona**. It says Cascadia's core is four counties; the baked core has **nine**. *The derivation may be correct and the prose is an approximation — **do not quote the prose as the core*** |

---

## 12. The scenarios this document must be able to tell

**Three traced. One narrates and is the model's best argument for itself. One narrates into a defect.
One jams on the middle game.**

### 12.1 A well-governed nation is handed a separatist region anyway

**Step 1.** A nation takes an Area by conquest. Its own governance is good — quality of life high,
liberties high, Authority high.

**Step 2.** Every grievance term therefore reads *low*. `w_qol`, `w_lib`, `w_power`, `w_auth` all
contribute little.

**Step 3 — but `w_boost` is a property of the PLACE.** If that Area carries an authored grievance, it
enters the sum regardless of how well the new owner governs.

**Step 4 — and `base` still gates it.** The boost is **multiplied by the affinity between the Area's
leading politics and the movement's.** *An authored grievance cannot radicalise a place into a movement
whose ideology it does not share.*

**Step 5.** War weariness enters at **0.22** — the joint-largest weight — so **the conquest that
acquired the Area also feeds the movement inside it.**

> **✅ Narrates, and it is the clearest demonstration of why `base` multiplies.** **Good government is
> not a universal solvent: it lowers four terms out of six and cannot touch the fifth.** *And the
> nation's own war is one of the two heaviest.*

### 12.2 ⚠ Deseret declares, and the game charges it for its own people

**Step 1.** Deseret's corridor Areas cross 0.40. Its core is entirely over the line. **It declares.**

**Step 2.** The new nation holds ground on which **the Deseret movement is the largest movement.**

**Step 3.** Three separate systems read *"the largest organised movement share in this Area"* — the
AI's threat assessment, the pressure map, and the occupation surcharge.

**Step 4 — and none of the three checks WHOSE movement it is.**

> **❌ JAMS. Deseret is charged, three times over, for the population that founded it.** *Ruling 16
> ruled that a realised movement's own ground reads as **loyalty**, not pressure. The build does not
> implement it.* **`deferred.md` 14, and the trace shows it is not cosmetic: it makes the occupation
> surcharge bill a nation for its own heartland.**

**And it compounds with the opening board**, where Deseret is *already* the hardest start in the game:
sealed, unrecognised, and now paying an occupation-shaped cost on its own founding ground.

### 12.3 ⚠ Turn 120, and nothing new is angry

**Step 1.** The painted movements have reached their ceilings. *Measured at the shipped rate, the first
secession lands at t22–t29, and the 60-turn spread shows Deseret at its cap and Cascadia five times its
starting ground.*

**Step 2.** A nation governs badly. Quality of life falls, liberties fall, weariness climbs.

**Step 3 — and the grievance those terms produce has nowhere to go.** **Every movement that can exist
on that ground already exists and is already at its ceiling**, or does not exist and never will,
**because all thirty-two spawn once at setup.**

**Step 4.** Ruling 42 specifies exactly the movements that should arrive here — **Rejoin** when ground
is governed badly, **Reconquer** when ground has been lost, both reading facts the game already
computes.

**Step 5 — none of it is built.**

> **❌ JAMS, and it is the hole D223 named: the back two-thirds of a 200-turn game has no new
> separatist pressure arriving at all.** **The alpha cannot see it**, because the alpha is a
> sixty-turn test and sixty turns is exactly the window the painted movements cover. *The premise of
> this game is a country coming apart and being put back together, and for a hundred and forty turns
> nothing new comes apart.*

---

*Sources, verified against the files on 15 September 2026: `docs/design/secession-ideation.md`
rulings 14, 16, 18, 21, 24, 26, 32, 38–45, 51, 53 and findings A–F; `docs/design/politics-ideation.md`
rulings 11, 11a, 12, 15, 20, 21, 22, 41 and finding I; `DESIGN.md` §7, §7.1–§7.6;
`data/parties.json` (32 records, fields and caps); `content/tunables.json` (the `sent.maxRise`
override); `js/tunables.js` (`sent.*`, `secession.*`, `release.*`, `autonomy.*`, `liberty.wGarrison`);
`docs/deferred.md` 14; `DECISIONS.md` D223. **Sixty-turn growth figures and the demand-volume counts
are quoted as measured in their sources; no date is attached to them there and none is invented
here.***
