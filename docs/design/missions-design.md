# Missions

**Stage 2 of five: DESIGN.** What the thing does, what it is measured in, what the player sees, and
what happens at each level.

**Depends on:** `GDD.md` · `nation-design.md` (victory, and the conditions table a mission is a
smaller instance of) · `turn-design.md` (a mission costs nothing, which only means something once the
turn has no budget) · `movements-design.md` · `diplomacy-design.md` · `blocs-design.md` ·
`economy-design.md` · `board-design.md`.

**Status: ruled 15 September 2026**, `DECISIONS.md` **D221** and after. **This is the only document in
the GDD that carries authored content rather than mechanics.** The system is §1–§4; the trees are §5
onward, and each is content that can be rewritten without touching anything above it.

---

## 0. Why this exists at all

**Seven ideation rounds produced 536 ideas and not one of them was a mission.** What the game has is
three victory conditions checked every world turn — **an ending, not something to work on.** Nothing
anywhere tells a player what they should be doing this decade.

**And the ideation plan named the consequence about itself in September, before any round ran:**

> *Almost every idea we have is something that happens **to** a nation, and very few are things a
> player **does**… **Every round should be made to answer the same question before it closes: what
> does the player actually do about this, on a Tuesday, with one action?***

**A mission tree is that answer at the scale of a whole game.** Aaron's four reasons, and they are the
brief for everything below:

1. It gives you **direction** to play.
2. It gives you **challenges**.
3. It gives the play a **story**.
4. It gives you **bonuses** for accomplishing them, to keep momentum up.

---

## 1. What a mission is

> **A mission is a condition the game watches for, with a target, a reward, and a prerequisite that
> unlocks it.**

**It is the victory table at a smaller scale, and that is the whole implementation.** The three
victory paths are already *"a table of rows rather than code paths"* — data with per-condition
targets, evaluated over every nation once per world turn, which is why *"what am I short of"* is
already answerable. A mission adds two fields: **what unlocks it** and **what it pays.**

**A mission costs nothing.** It is not a thing you do — it is a state the game notices you have
reached. **So missions never compete with anything in the turn**; they sit above it and say what is
worth starting.

> **Missions are the middle game. Victory is the end.**

A game runs **200 turns** and the painted separatist movements resolve inside roughly the first third.
Victory is unreachable for most of a game and unavailable to most of the board. **Without missions the
long middle of a 200-turn game has nothing in it that tells a player they are getting somewhere.**

### 1.1 A completed mission stays completed

**Ruled 15 September 2026.** Once the condition has been true, the mission and its bonus are
permanent — even if the ground changes hands, even if you lose the office that qualified you.

**The reason is momentum**, which is Aaron's fourth requirement. A tree whose bonuses switch on and off
as circumstances move is a tree that flickers, and a player cannot plan against it. *It is the same
shape as conquest ruling 26 refusing to let occupation expire on a timer: a state you reached is a
fact about your history, not a reading of the present.*

### 1.2 A tree belongs to a situation, not to a nation

**The five Texan successors share one tree**, because they are five claimants to one prize.
**Minnesota and Wisconsin share one**, because they are two candidates to lead the same union. You
pick one and play it; **the tree is the same and the situation is not**, which is what makes one tree
two games.

**Three trees in the alpha, covering seven of sixty-one nations.** Everything else plays without one.

### 1.3 The four conditions a mission may test

**Aaron writes *"own and control"* colloquially and it is one phrase doing four jobs.** The build
already has the distinctions; this is the vocabulary.

| Term | Means |
|---|---|
| **Held** | It is yours on the map, whatever flag it carries |
| **Settled** | Held **and digested** — no longer under an occupation flag. Ruling 26's fourth rung, and it takes time |
| **In the union** | A federation member holds it **and you lead that federation** |
| **Reached** | Not yours, but a **working trade route** runs to it |

**⚠ "In the union" is a ruling and it is load-bearing.** *Leading a federation counts as controlling
its members' ground, for mission purposes.* That makes being elected leader the single most valuable
rung in any tree that has one — **most of a federation tree's territorial branch can be finished
without a shot** — and §1.1 is what keeps it from flickering when the presidency changes hands.

**It applies to missions and not to victory.** See §2.4.

### 1.4 The voice — a constraint on whoever writes a tree

> **A mission's name is a regional joke the people who live there would get.**

Read off Aaron's two drafts: *Not Just a Great Lake · The Northern Cheese Mongers · Bearing Down on the
Lions Out East · The Tiger and the Buffalo Drink Water from the Same Riverbank · Southern Hospitality ·
The Superior Lakes*; and in Texas, *Spirit of Sam Houston · Remember the Alamo · The Pass · Well,
That's Dallas · Father of Texas · We Never Wanted to Be Part of Your Country Anyways.*

**Sports teams, state history, local self-deprecation.**

**And the names do design work rather than decoration.** *Bearing Down on the Lions* says the mission
is about Detroit without naming a mechanic; *the tiger and the buffalo drink from the same riverbank*
says Cincinnati and Buffalo are on the same water. **That is requirement 3 — the play gets a story —
delivered in the title instead of a paragraph underneath it.** A tree written in flat descriptive
language would work mechanically and lose the thing it is for.

---

## 2. The structure

**Three branches, four elements, one pivot.**

### 2.1 Three branches

| Branch | What it is about |
|---|---|
| **Standing** | How the world sees you |
| **Ground** | The territorial ambition your story is about |
| **Building** | What you make of what you hold |

**Ground is not "the military branch", and getting that wrong would flatten all three trees into one.**
Texas's ground arrives by **conquest**. Deseret's arrives by **defection** — Areas crossing the
threshold along a frontier, which is built and needs no army. A Great Lakes nation's arrives by
**agreement**, because what it wants is not to own the gates but to have them inside its union.

**The three branches run in parallel.** None gates another.

### 2.2 Standing and Ground pull against each other, and the model does it unprompted

**Recognition's first term is standing.** Influence **falls** with conquest, scaled by how much
standing you had — measured across twelve turns of expansion, **Influence 0.666 → 0.148** while
Authority barely moved.

| | How its ground arrives | The tension |
|---|---|---|
| **Texas** | Conquest | **Severe.** The branches fight |
| **Deseret** | Defection | **Mild.** Its ground comes to it |
| **Great Lakes** | Agreement | **Inverted.** Joining *raises* Influence, because membership is flat-rate trade with every member and Influence counts **reach** — *"nations you have live trade relations with"* |

**This is the property Aaron named as the reason EU4 works** — *"all the systems work together to both
make the other more powerful but also work in the opposite way."* **It is already in the model. The
trees only had to find it.**

**And Building feeds Standing more than Ground**, because the one buildable thing is trade capacity and
Influence counts trade reach. So the structure quietly says: **build and trade and be admitted, or
conquer and be feared.**

### 2.3 Four structural elements

| | | Example |
|---|---|---|
| **Ladder** | The same achievement at increasing scale. Each rung unlocks the next | one nation recognises you → half the continent → all of it |
| **Set** | N missions in any order; **all** are required to open what follows | the five Texan cities |
| **Fan** | Several independent missions that all become available when a gate opens | the Texan capstones |
| **Free** | No prerequisite and no gate | the development branch |

**Each branch opens with something reachable in the first few years**, so a tree begins paying
immediately rather than after a decade. That is requirement 4 as a placement rule.

### 2.4 The pivot

**At most one per tree, at the end of the longest branch, and its reward is not a bonus — it is a
victory re-aimed or a licence that changes what you can afford to do.**

Texas's: **conquer Washington D.C. and unite the map as the United States of Texas** — the objective
changing hands, and a third answer to round 7 ruling 2's open half. That ruling said the federal
remnant **restores** where everyone else **replaces**, and left open whether the remnant has its own
condition set. **A pivot gives a third mode: the remnant's story can be seized.**

**⚠ A pivot is where a general permission may be granted that the design refuses by default.** The
clearest case is *"leading a federation counts as owning"*: it holds for **missions** everywhere and
for **victory** nowhere, because **victory is re-checked every world turn while a mission is
permanent** — so a win that arrived on a federation election would evaporate at the next one. *A pivot
is the right place to grant such a thing, because it is earned rather than handed out.*

**⚠ And a pivot need not close the tree. It may open one more mission.** Texas's and the Great Lakes'
sit at the end; **Deseret's sits before its last one, deliberately** — the Gathering is what makes the
Mormon Battalion's march on San Diego affordable, so the licence has to arrive first. *Worked example
in §7.4.*

*A tree without a pivot is complete and normal.*

---

## 3. Rewards

### 3.1 A bonus is a named row in the Why record

**A mission may move a stock, provided it appears in the panel with its own label.**

The precedent is built. **A leader** is *"a thumb on the scale, deliberately small"* — one named person
per nation, two traits, and **a signed modifier on each of the five stocks plus a small pull on the war
roll.** A leader's trait is already a named, permanent, explained term the panel prints as its own row.

**So *"Spirit of Sam Houston: +0.04 Authority"* is a row that tells a story. What is forbidden is an
unexplained adjustment** — every number in this game explains itself from named inputs, the summary is
built from the same rows the panel shows *"so it cannot disagree with the numbers beside it"*, and a
hidden mission bonus would be the one kind of row this game has never had.

***Recorded rather than edited away:** the first recommendation put to Aaron was "permission, not
power" — that a mission may only unlock or cheapen something. **It was too strict**, and the leader
modifier is what shows it.*

### 3.2 What a reward may be

| | |
|---|---|
| **A named modifier** | Signed, permanent, labelled, on any of the five stocks or on a term some system already computes |
| **A permission** | Something you may now do that you could not |
| **A claim** | A recognition claim is a property of territory and changes hands with the ground — diplomacy ruling 18 |
| **A project unlocked or cheapened** | Sits inside `turn-design.md` and adds no new kind of effect |
| **Money** | Dull, safe, and it converts straight into projects |
| **A pivot** | §2.4. One per tree at most |

### 3.3 Three traps, all found by checking rather than assuming

**A reward can be redundant.** *Dominate the Gulf* proposed letting you charge 10% more and still be
accepted. **The economy already pays that automatically:** `AlternativesMult` rises as a buyer's
supplier count falls, to ×1.5, and the spec calls it *"the most important term… what makes cutting a
rival's other supplier a strategic act rather than a flavour event. Do not simplify it away."*

**A reward can need a kind of term the game does not have.** *Increased recognition from nations west of
the Mississippi* is a **geographic** modifier on recognition, and recognition is earned from standing,
kinship, duration and size — **nothing modifies it by where the other nation is.** Small, but new.

**⚠ A reward can make Canada or Mexico an actor, and they are not.** D168 and `CLAUDE.md`: **they are
geography — not actors, no opinion, no negotiation**, and round 4's ruling 4 refused an appetite for
them because *"giving them an appetite of their own would make them actors by the back door."*

> **The conversion is always the same: "Canada becomes your friend" → "your goods cross the corridor
> free."** Same feeling, no new actor. It has come up twice — El Paso's *The Pass* and the Great
> Lakes' *Superior Lakes* — and it will come up again.

### 3.4 A licence may be scoped to ground

**A reward that lowers the price of conquest points the anti-snowball brake backwards**, because the
penalty is `conquest × (1 + influence)` — deliberately scaled so *"a superpower annexing a neighbour
pays more in reputation than an unknown does, because it had more to spend"* — and coalitions form on
`size_share × (1 − influence)`, so a nation with high standing already draws none.

**So a conquest licence is scoped to named ground rather than granted generally.** The Great Lakes
pivot (§5.6) is the worked example: the condition is about the Mississippi, so the licence is too.
**Everywhere else, the full price.** This keeps the brake, keeps the Why record honest — the row reads
against named ground — and makes the pivot mean what it says.

---

## 4. ⚠ What a tree must not do

**It must not be finishable in a run much shorter than the game, and it must not be unfinishable.** A
game is **200 turns** and nobody has played one, so there is no measurement to size a tree against —
*which is itself the useful thing to say.* **The first tree played is the measurement.**

**It must not require a nation the board does not have.** Programmer rule 17. **Every mission below is
verified against the data**, and where one depends on something unbuilt the row says so.

---

# 5. The Great Lakes tree — Minnesota **or** Wisconsin

**You play one of them. The tree is the same and the situation is not.**

## 5.1 The situation, measured

**Verified against `data/county_trade.json`, `data/adjacency.json` and `data/parties.json` on
15 September 2026.**

| | **Minnesota** | **Wisconsin** |
|---|---|---|
| **Lake Superior ports** | **2** — St. Louis Co (Duluth), Lake Co | **0** |
| **Lake Michigan ports** | 0 | **2** — Brown Co (Green Bay), Milwaukee Co |
| **Mississippi river ports** | **2** — Winona, Ramsey (St. Paul) | **0** |
| **Land gates to Canada** | **2** — Cook Co (Grand Portage), Koochiching (International Falls) | **0** |
| Great Lakes corridor counties | 3 | **15** |
| Mississippi corridor counties | **11** | 7 |
| **Chokepoints held** | **0** | **0** |

> **Minnesota sits on both networks — the lakes and the river — and has two doors to Canada.
> Wisconsin is on Lake Michigan and nothing else.**

**Three facts decide this tree and none was guessable:**

**1. Neither holds a single one of the fifteen chokepoints.** They belong to Michigan (4 — the Soo
Locks, the Straits of Mackinac, the Detroit River, the St. Clair River), New York (2 — Niagara, the
St. Lawrence outlet), Illinois (2 — the Chicago Sanitary & Ship Canal, and Cairo at the
Ohio–Mississippi confluence), Louisiana (2 — New Orleans, the Mouth) and Missouri (1 — the
Missouri–Mississippi confluence at St. Louis).

**2. They sit at the western end of both corridors.** The Great Lakes corridor is **81 counties ordered
west to east and Duluth is the first in the list** — Michigan 41, Wisconsin 15, New York 9, Ohio 7,
Minnesota 3, Indiana 3, Illinois 2, Pennsylvania 1. The Mississippi corridor is **105 counties and it
begins in Minnesota.**

> **Every water route out runs past somebody else's gate.** *A gate bridges the stretch above it and
> the stretch below it and no other pair* — so each is a separate permission and a separate toll,
> compounding on what arrives.

**3. Trade with the world is easy; trade with the continent is not.** Great Lakes ports reach the world
market **only through the Canada corridor** — a flat 10% that is a cost and not a transfer, and
**Canada is geography, so nobody can close it.** *That is the inverse of most nations on the board and
it is the strategic character of this one.*

**⚠ One route question the data does not answer: does a Lake Michigan port reach the Canada corridor
without passing the Straits of Mackinac?** If it does not, **Wisconsin's entire world trade runs
through Michigan's gate** and it is the most dependent nation in the tree. **For the Technical
Designer.**

## 5.2 Its politics, and they are unlike anywhere else on the board

**Three movements live here. All three are Unify movements, and all three are capped below the line at
which ground leaves.**

| Movement | Counties | in MN | in WI | Cap | Adjective |
|---|---:|---:|---:|---:|---|
| **Blue-Collar Populist** | 693 | 87 | 72 | **0.35** | ideological |
| **The Farmers Union** | 983 | 75 | 56 | **0.30** | economic |
| **Great Lakes Free Trade** | 103 | 3 | 12 | **0.30** | economic |

**`secession.countyThreshold` is 0.40. None of the three can reach it.**

> **This is the one nation on the board that cannot be broken apart by its own people. It can only be
> nagged into unions.**

**A Unify movement's demand is not something you can deliver at home.** Politics ruling 15: past a
share of the population **the demand is that your government go and propose to its neighbours** — and
ruling 16 gives three answers:

| Answer | What happens |
|---|---|
| **Yes** | The two become **one entity**, everyone a full member, **and none of conquest's five penalties apply** |
| **"Let's think about it"** | **The movement inside THEIR country grows faster** |
| **No** | Refused — and it can read as a nation consolidating power |

**Ruling 18 makes the movement clever for free:** asking discharges the demand, and later it returns
**pointing at whichever neighbour is now the likeliest yes — often the one who said "let's think about
it", because that answer grew their appetite.**

> **So the player's own farmers do the persuading. You are the instrument they use.**

**⚠ And the Farmers Union's heartland is not in the eight governor states.** Its 257 core counties run
**Ohio 44, Indiana 32, Michigan 26, Wisconsin 25, Oklahoma 24, Missouri 23, Illinois 22, Minnesota
21.** *Ohio and Michigan are not in the story's bloc of eight, and between them they hold more of the
movement's core than Minnesota and Wisconsin do.* **To satisfy the movement you must bring in states
the bloc does not contain — and Michigan is the one holding four gates.**

---

## 5.3 Branch one — STANDING: build the union

**A ladder of four.**

| | Mission | Condition |
|---|---|---|
| **S1** | **Sign the paper** | Be a founding member of a **bloc** of at least three. *Reachable in the opening years* |
| **S2** | **The eight governors** | The bloc holds all eight signatories — **Minnesota, Wisconsin, Illinois, Indiana, Iowa, Nebraska, Missouri, Kansas.** *All eight are on the board* |
| **S3** | **More than a piece of paper** | The bloc becomes a **federation** — elected leader, budget, turn of its own, flat internal toll |
| **S4** | **Elected** | Be voted its **leader**, and spend its budget for a full term |

**This is the spine rather than one branch of three.** A federation dissolves every gate at once:
politics ruling 26, *"the flat 10% replaces members' own arrangements with one another — inside a
federation there are no negotiated corridors between members: they trade at a rate nobody can refuse or
revoke."*

> **This branch is not "make friends". It is the only way a Great Lakes nation stops living at other
> people's permission.**

**S3 is the hinge, and what it costs somebody else is why it is hard.** The gate-holders are *"exactly
the nations that lose most by joining, because their leverage is the thing membership dissolves."*
Ruling 27 softens rather than removes it: the host's 5% goes to the ground actually crossed, so
**Michigan still earns from every member's cargo on its lakes, at a fixed rate instead of whatever it
could extract. Joining does not zero a gate-holder's advantage; it caps it.**

**S4 is worth real money and it is the key to branch two.** The leader runs **two budgets** and the
federation's turn is three things: fund a struggling member, permit a declaration of war, and **accept
or reject trade deals offered from outside on behalf of everybody.** And under §1.3, **leading counts
as controlling every member's ground.**

*Rewards: this branch should pay in **Influence**, which membership already generates — joining an
eight-member federation hands you seven live trade relations in one act. The tree names it rather than
inventing it.*

---

## 5.4 Branch two — GROUND: the corridors

**A set of three, a fan of three, and a capstone.** Names are Aaron's.

### The set — any order, all required

| | Mission | Condition | Verified |
|---|---|---|---|
| **G4** | **The Northern Cheese Mongers** | Hold the Mississippi counties of Minnesota and Wisconsin | **18 counties — 11 MN, 7 WI.** ⚠ **The easiest mission in the branch and it is a duel:** whichever nation you play, the other half belongs to your tree-rival |
| **G1** | **Not Just a Great Lake** | Hold every port on Lake Superior | **11 Superior counties and only 3 have ports** — St. Louis Co MN (Duluth), Lake Co MN, **Marquette Co MI.** ⚠ **Minnesota starts with two of three. Wisconsin starts with none** — Bayfield, Douglas and Iron have no port at all |
| **G2** | **The Soo and the Straits** | Michigan held or in the union | **4 of the 15 gates and 41 of the 81** Great Lakes corridor counties. **The hardest diplomatic ask in the tree** |

### The fan — all three open when the set is done

| | Mission | Condition | Verified |
|---|---|---|---|
| **G5** | **Bearing Down on the Lions Out East** | Hold every county surrounding Chicago and Detroit | **10 counties.** Chicago (Cook Co IL) has **6** neighbours — DuPage, Kane, Lake IL, McHenry, Will, and Lake Co **Indiana**. Detroit (Wayne Co MI) has **4** — Macomb, Monroe, Oakland, Washtenaw. ⚠ **Thin today and dramatic later:** Chicago and Detroit are city-states in the story and **are not on the board** |
| **G6** | **The Tiger and the Buffalo Drink Water from the Same Riverbank** | Hold Ohio and Buffalo | Ohio is **88 counties** and the Farmers Union's **largest core state — 44 of 257.** Buffalo is **Erie County NY.** ⚠ **Buffalo is not Niagara** — Erie, Niagara and St. Lawrence are three different counties, so this does not deliver the New York gates |
| **G3** | **Southern Hospitality** | The mouth of the Mississippi **held or allied**, with **trade route access** to it | **Orleans Parish and Plaquemines Parish** — both ports, both ocean-coastal, both gates. **The only ocean the river reaches.** *The gentlest condition in the tree, and the right one: it uses the transit system rather than conquest* |

### The capstone

| | Mission | Condition | Reward |
|---|---|---|---|
| **G7** | **The Superior Lakes** | Every chokepoint on the Great Lakes and the Mississippi | **11 of the game's 15** — Michigan 4, New York 2, Illinois 2, Louisiana 2, Missouri 1. ⚠ **Needs Niagara County and St. Lawrence County on top of Buffalo.** **Reward: your goods cross the Canada corridor free** — today a flat 10%, and for a nation whose world trade all runs that way it is the most valuable bonus in the tree |

**The two gates in the middle of the river come free with branch one** — Cairo is Illinois and St. Louis
is Missouri, both governor states. **So branch one delivers the middle and the ends are the work.**

---

## 5.5 Branch three — BUILDING

**Free missions, no gate — and this is where the two nations stop sharing a game.** *Names are
placeholders in Aaron's register.*

| | *[placeholder]* | Condition |
|---|---|---|
| **B1** | *The Twin Ports* | **Build a Lake Superior port.** Minnesota has two and upgrades them. **Wisconsin has none and must build one at Douglas County — which is Superior, Wisconsin, Duluth's twin across the harbour** |
| **B2** | *The Boundary Waters* | **Hold and build a land gate to Canada.** Minnesota opens with two. Wisconsin must take or federate for one |
| **B3** | *[a hotdish joke]* | **Hold a food surplus for eight turns** — the spec's **Surplus** band, a supply-to-need ratio of 1.11–1.50. ⚠ *Needs the resource model built, which is not in the alpha track today* |

**⚠ B1 unblocks G1 for Wisconsin and not for Minnesota.** Build the port at Superior and you have a
foot on the lake you were locked out of. **So the two nations run the same tree in a different order** —
Minnesota pushes Ground first because its geography is already done; Wisconsin must build before it can
reach. *That is the Austin-and-Houston property arriving from federal port data rather than an author's
hand, and it is the strongest argument that one tree for two nations is right.*

**This branch is thinner than the other two and that is correct.** Development is *"very small and
limited"* by ruling — one buildable thing, capacity. Texas's third branch came out the same way.

---

## 5.6 The pivot — **both banks of the Mississippi**

**Condition: hold both counties of every facing pair along the Mississippi.**

**`bank_pairs` is exactly this** — 213 pairs of counties facing each other across a river, of which
**96 are both on the Mississippi corridor.** So *"everything east and west of the Mississippi"* is
computable as written.

| | States in those 96 pairs |
|---|---|
| **In the Farmers Union eight** | Illinois, Missouri, Iowa, Wisconsin, Minnesota — **five** |
| **Outside it** | **Mississippi, Arkansas, Louisiana, Tennessee, Kentucky — five** |

> **The upper half federates. The lower half is the South.**

**⚠ So the peaceful tree cannot finish peacefully, and the map is what decided that.** You can federate
the Midwest — those five are your own governors. **You cannot federate Louisiana, Mississippi and
Arkansas**, because they are Gulf and Deep South ground with their own reunification contest running,
and a farming bloc has nothing to offer them.

**The last third of the river has to be taken, and the pivot is the licence to take it.** *Not an
author deciding the nice tree ends in a war — the map running out of people who will say yes.*

**Reward: ground on the Mississippi bank pairs costs less in Influence and Authority to take and to
hold. Everywhere else, the full price.** §3.4 is why it is scoped: unscoped, it points the
anti-snowball brake backwards, because a federation leader has high Influence, therefore low
`threat = size_share × (1 − influence)`, therefore no coalition — and a bonus that stops them losing
Influence means they never become a threat while they take the continent.

**And it gives the tree an ending it otherwise had not got.** A purely diplomatic tree federates and
federates. **This one builds a union for a hundred and fifty turns and then finds the thing it built
the union for is held by people who will never join it.**

---

## 5.7 What this tree would be tested for

1. **Will Michigan ever join?** Politics ruling 26 states the problem: the gate-holders lose most by
   joining, *"so a federation must pay them, elect them, or do without them — and the map decides
   which."* **Without Michigan this branch stops at G4.**
2. **Does the movement actually push?** The whole Standing branch runs on Unify demands, and ruling
   15's threshold is unset with a hard constraint: **it must sit below 0.30**, or the Farmers Union and
   Great Lakes Free Trade — both capped at 0.30 — **can never make a demand at all.**
3. **Is a peaceful tree as interesting to play as a violent one?** *Texas's tree is a race with four
   rivals. This one is a committee for most of its length.*
4. **⚠ Does the Midwest run away with the continent?** Round 5 already flagged that *"the south may run
   away"* because the Confederate five are the only large group that can freely combine. **This gives
   the Midwest a second peaceful route to the same prize by a different mechanism.** Watch both.

---

# 6. The Texas tree — one tree, five claimants

**Dallas, Houston, San Antonio, Austin or El Paso. You play one; the tree is the same.** It is the only
one of the three whose players are **rivals for the tree itself** — five nations claiming one prize,
none of whom can ever thaw with the others and none of whom may ever join a union or federation with
them.

## 6.1 The situation, measured

**Verified against `DESIGN.md` §2.1, `data/county_trade.json` and `data/game-data.json`,
15 September 2026.**

| | Areas | Pop | GDP | Governs | Seat |
|---|---:|---:|---:|---|---|
| **Houston** | 32 | 10.07M | $904B | red | Harris Co |
| **Dallas** | 22 | 9.34M | $868B | red | Dallas Co |
| **San Antonio** | 21 | 5.40M | $347B | red | Bexar Co |
| **El Paso** | 16 | 2.79M | $308B | red | El Paso Co |
| **Austin** | **13** | 3.69M | $344B | **blue** | Travis Co |

### ⚠ The five cities are not five of the same thing, and the data is emphatic

| Seat | What the map says it is |
|---|---|
| **Harris County (Houston)** | **`has_port: true`, `coastal: true`, `choke_point: true`** — an ocean port **and** the Houston Ship Channel gate |
| **El Paso County** | **`border_crossing: true`** — one of Texas's **seven** crossings into Mexico |
| **Dallas · Travis · Bexar** | **No trade geography at all.** Inland |

> **Two of the five cities are the only reasons Texas can reach the world. Three are politics.**

**And it makes El Paso's bonus exact rather than evocative:** *The Pass* is about a county that **is a
pass.**

**Texas is 254 counties with seven Mexican crossings** — Cameron, El Paso, Hidalgo, Maverick, Presidio,
Val Verde and Webb.

### The board this tree sits on

**Conquest ruling 19 came forward on 15 September (D222).** Austin is the legitimate Texas; **Dallas,
Houston, San Antonio and El Paso open unrecognised**, and Austin holds the signature each of them
needs. **Diplomacy ruling 18**: whoever takes Austin inherits the claim — *"Austin's asset stops being
a thing worth protecting and becomes a thing worth fighting over."*

**Austin is the crown, ruled and deliberate** (D222). Its defence is the **auction** — four nations
each needing their own copy of one signature — and **outward alliances**, since it is hostile with four
Texans and with nobody else, making it the only one of the five that can build a coalition.

## 6.2 Branch one — STANDING: become accepted on the world stage

**A ladder of three.** *Aaron's names to come; these are his conditions.*

| | Condition | ⚠ |
|---|---|---|
| **S1** | **One nation larger than you** recognises your sovereignty | *Reward: a small trade bonus* |
| **S2** | **Over half the continent** recognises you | ⚠ **By weight, not head count.** `legitimacy` is *"the share of the continent, **by weight**, that recognises B"*, and 0.50 is the top band of the recognition ramp — above it, full market access |
| **S3** | **Everybody except the other Texans** recognises you | *Deliberately excludes the four who never will. The contest floor is permanent* |

### ⚠ Austin opens with this branch already finished

**Every nation the game opens with recognises every other**, and ruling 19 makes only the four rebels
unrecognised. **Austin is recognised by all of them, so S1, S2 and S3 are green on turn 1.**

**That is correct and it should be visible.** Austin's whole identity is that it is already the
legitimate Texas — **the tree simply says so out loud on the opening screen, and the other four can see
the branch they must spend a game earning sitting finished on the nation they all want to eat.**

## 6.3 Branch two — GROUND: claim authority over the five cities

### The set — any order, all five required

| | Mission | Reward |
|---|---|---|
| **G1** | **Spirit of Sam Houston** — Houston | Improves the ability to govern — **Authority** |
| **G2** | **Remember the Alamo** — San Antonio | Your provinces are harder to capture — a modifier on **Border** strength, which is what an attacker's Field is weighed against |
| **G3** | **The Pass** — El Paso | ⚠ **Converted: your goods cross Mexico free.** Aaron wrote *"able to trade with Mexico"*; **Mexico is geography, not a nation** (D168), so there is nobody to trade with. Today the corridor is a flat 10% that is a cost and nobody collects — **dropping it to nothing is the same reward without a new actor** |
| **G4** | **Well, That's Dallas** — Dallas | Increased recognition from nations **west of the Mississippi**. ⚠ **A geographic modifier on recognition, and nothing in the game has one.** Recognition is earned from standing, kinship, duration and size. Small, but a new kind of term |
| **G5** | **Father of Texas** — Austin | Conquered Texan ground carries **less unrest and settles faster**, and you are **likelier to take ground from the other Texans.** Both are existing terms — Area hostility, ruling 26's digestion speed, and the fight |

**⚠ G5 is the strongest reward in the tree and it belongs to whoever takes Austin, not to Austin.**
Compounded with ruling 18's inherited veto, **it makes Austin the first target on the board.** *That is
the ruling, not an oversight — Austin is the crown and the prize for taking it should be the biggest
thing here.*

### The fan — all four open when the five cities are held

| | Mission | Condition | ⚠ |
|---|---|---|---|
| **G6** | **Texas United** | Every county in Texas | **254 counties.** Reward: lower civil unrest |
| **G7** | **Former Glory** | Every county that was part of the **Republic of Texas** | ⚠ **Needs the Republic's claimed boundary painted as a region.** The map editor does exactly this. **Its extent was not verified and must not be written from memory** |
| **G8** | **Choke the Farmers** | The **southern Mississippi gate** and the lower river counties | ✓ **New Orleans and the Mouth** — Orleans and Plaquemines Parishes, both ports, both ocean-coastal, both chokepoints. The lower corridor is Louisiana 17, Mississippi 11, Arkansas 6, Tennessee 5, Kentucky 3 |
| **G9** | **Dominate the Gulf** | At least half the Gulf ports | ⚠ **Two problems.** The reward — *charge 10% more and still be accepted* — **may be redundant**, because `AlternativesMult` rises to ×1.5 as a buyer's supplier count falls and already pays you for cornering a coast. **And the Gulf is not a distinguishable set in the data**: the basin model says *"the Gulf counts as Atlantic"*, and there are **25 coastal ports across Texas 7, Louisiana 7, Mississippi 2, Alabama 1 and Florida 8** — with nothing separating Florida's Gulf ports from its Atlantic ones. **A Gulf list has to be authored** |

### ⚠ And here is where all three trees meet

**Choke the Farmers wants New Orleans and the Mouth. So does the Great Lakes tree's *Southern
Hospitality* — for the opposite reason.**

| Tree | Wants the Mouth because |
|---|---|
| **Texas** | It is how you **strangle the Midwest** |
| **Great Lakes** | It is **the only ocean the river reaches** |
| **Deseret** | Wants **Cairo and Nauvoo** on the same river — *East of Eden* |

> **All three live trees converge on the Mississippi, and none of them was written with the others in
> front of it.** *That is the strongest argument in this document that three trees is the right number.*

## 6.4 The pivot — **We Never Wanted to Be Part of Your Country Anyways**

> **Condition: conquer Washington D.C.** — one county, 11001, and a real nation on the board: **702,250
> people and $184B**, the smallest thing on the map that is not a city-state.
>
> **Reward: the victory re-aims. You unite the continent as the United States *of Texas*.**

**This is the only pivot in the three trees that changes the *name* of the prize**, and it answers
something round 7 left open. That round ruled the federal remnant plays a different game — **restore**,
where everyone else **replaces** — and left open whether the remnant has its own condition set.
**Aaron's mission gives a third answer neither candidate anticipated: the remnant's story can be
seized.**

**⚠ What it depends on and does not have.** Aaron's own note was that it *"would make you fight against
Philadelphia and NYC."* **Neither is on the board.** The capital contest's three claimants are D.C.,
Philadelphia and New York City (secession ruling 20), **and two of the three are a design that is not
built.** *So today the pivot is one county and a rename; when the story's board exists it becomes a
three-way war for the capital.*

## 6.5 Branch three — COUNTRY DEVELOPMENT

**Free, and deliberately short.** *Aaron: "and I don't know maybe other ones for the other things?"* —
which is the correct length. Development is *very small and limited* by ruling.

| | Mission | Condition | State |
|---|---|---|---|
| **B1** | **Texas BBQ** | **110% of food needs for two years** | ✓ Exactly the spec's **Surplus** band (1.11–1.50) held for **eight turns**. ⚠ **Needs the resource model** |
| **B2** | **Texas Oil** | A **Resource Extraction** surplus | ⚠ **There is no oil.** Energy lives inside Resource Extraction alongside ore and fertiliser — round 4's finding D calls it the model's single upstream chokepoint. ⚠ **Needs the resource model** |
| **B3** | *[yours]* | **Build capacity** — Houston's port, or the Mexican crossings | ✓ **The one buildable thing. The only mission in this branch that works in the alpha** |

## 6.6 What this tree would be tested for

1. **Does Austin survive long enough for the auction to happen?** D222's watch item. *If it dies on
   turn six in every game, the most interesting corner of the map is a two-quarter story.*
2. **Is a branch that opens finished a gift or a dead space?** Austin starts with Standing complete.
3. **Does the race compress?** Four nations, one crown, and the biggest reward in the tree sitting on
   it. **Ruling 25 removed the last hard refusal**, so nothing but price stops a turn-two attack.
4. **Do three trees fighting over the Mississippi produce a war or a stalemate?** §6.3.

# 7. The Deseret tree

**This one is different in kind, and Aaron named why: *"this is a movement, so they need to get
acceptance but also get the movement united."*** Texas is a state that came apart and wants putting
back. The Great Lakes is a state that wants to build something new. **Deseret is a movement that
half-realised**, and its tree is about **completing itself**.

## 7.1 The situation, measured

**Verified against `content/scenario-shattered.json`, `content/cultural.json`,
`data/county_trade.json` and `data/game-data.json` on 15 September 2026.**

| | |
|---|---|
| **The Mormon Corridor** | **57 Areas across seven states** — Utah 25, Idaho 13, Colorado 8, Montana 4, Wyoming 3, Arizona 2, Nevada 2 |
| **What it opens holding** | **Mean 31.1 Areas and 3.75M people, ranging 19–45 across twenty seeds**, always one connected piece. The Wasatch Front always cedes; **Zion rolls at 0.82, Bonneville 0.70, Tetonia 0.60, Uintas 0.55** |
| **What it doesn't** | **Roughly 26 Areas** — and **about nine of every thirty-one that rolled to join end up cut off from Salt Lake and are remembered as `leftBehind`.** Ground that voted to go and was stranded |
| **Its grievance** | The corridor that stayed carries a standing authored grudge, **strongest on the ground that voted to go and was cut off**, and its movement grows at **1.5× the ordinary rate** against a cap of **0.60** |
| **⚠ Its geography** | **No port. No border crossing. No ocean coast. None, in any of the 57 Areas.** Every transaction with the outside world crosses somebody else's ground |
| **Its seat** | Salt Lake County. It governs **yellow** |

### ⚠ 7.1a The recognition exception — ruled 15 September 2026

**Deseret opens recognised by its neighbours. Not by Utah.**

**Why it was needed.** Transit requires **mutual recognition**, the same test that gates trade and
treaties. A nation with no port and no border crossing needs a corridor to do anything at all — and a
pariah cannot be granted one. **Round 5 found the diplomatic half of this dead end and called the
game's answer *"wait, and hope."* This is the economic half, and it is worse.**

**Why it does not delete the story, which is the part worth checking.** `legitimacy` is *"the share of
the continent, **by weight**, that recognises you"*, and Deseret's neighbours are small. **Even with all
six signing it stays under 0.15 — the smuggler's-rate band.**

| Unlocked | Still true |
|---|---|
| Bilateral trade with its neighbours — the test is **per pair** | The world market, at a smuggler's rate |
| **Transit across their ground**, which is the one that matters | No seat in a coalition |
| S1 becomes possible | A standing Influence deficit |
| | **Utah's signature is still the key**, and *"the parent giving in is worth more than all of them combined"* |

> **Deseret stops being frozen and stays a pariah.**

**⚠ Utah is excluded deliberately, and the measurement is why.** The continent's per-turn chance of
recognising Deseret runs **0.070 → 0.181** the moment Utah gives in, and in a played game the State of
Jefferson went from **14% recognition to 100% in twelve turns** on exactly that. *Put the parent in the
exception and the most measured piece of drama in the game goes with it.*

**And the fiction is the justification rather than a problem.** Every one of those six states **lost
ground to Deseret** — Idaho thirteen Areas, Colorado eight, Montana four, Wyoming three, Arizona and
Nevada two each. *"The states around it" is the same list as "the states it took territory from."*
**A state that has lost thirteen Areas and cannot get them back has the strongest practical reason on
the board to regularise the border. You recognise the thing you cannot remove** — and everyone who
lost ground accepting reality is what makes the parent's refusal read as grief rather than policy.

*It is a change to **authored scenario content**, not to rules — the same class as bringing conquest
ruling 19 forward, in the same file, and it does not rot.*

## 7.2 Branch one — STANDING

| | Mission | Condition | ⚠ |
|---|---|---|---|
| **S1** | **Friends with Benefits** | Hold an alliance with a nation that has a **Canada or Mexico border crossing**, and transit access through it | *This was blocked until §7.1a — nobody has ever ruled whether an alliance requires recognition, because alliances are not built. **The exception unblocks it without settling the general question**, which stays open in §8* |
| **S2** | **My Brother's Keeper** | **Recognise two other movement-born nations**, and/or **champion two growing movements in other states** | ✓ **Both are things a pariah can do without anyone's permission.** Recognition is the only unilateral act in the game, and since ruling 19 came forward there are **four unrecognised Texans** to give it to. Championing is a standing per-quarter project, and *everyone sees you doing it* |
| **S3** | **An Ensign to the Nations** | **Reach the world market three ways** — through a Canada corridor, through a Mexico corridor, and through somebody's ocean port | ⚠ **Converted.** Aaron wrote *"trade deals with Canada, Mexico and the World Markets"*; **Canada and Mexico are geography, not nations** (D168), so there is nobody to sign. **Three separate transit arrangements in three directions is the same achievement without a new actor** — and for a landlocked pariah it is a proper capstone |

**S2 is the tree's quiet argument.** The two acts a pariah can perform are *recognise* and *champion* —
and this mission is made of exactly those two, **pointed at other people in the same position.**

## 7.3 Branch two — GROUND: the trail, walked backwards

**Seven missions that retrace the migration east across the continent, and one that goes west to the
sea.** *Aaron's names.*

| | Mission | Condition | Verified |
|---|---|---|---|
| **G1** | **Building Zion** | Every Area of the Mormon Corridor either **held** or **over 0.40 movement share** | ✓ **0.40 is `secession.countyThreshold`** — the line at which an Area defects to a breakaway along its frontier. Deseret's cap is 0.60 at 1.5× growth, measured spreading from a 6-Area core to its whole homeland. **Aaron's stated purpose is to teach the player to cause uprisings elsewhere, and the mechanic is real** |
| **G2** | **Juarez to Cardston** | A **contiguous chain of held Areas touching both the Canadian and the Mexican border** | ⚠ **Converted.** Cardston is in Alberta and Colonia Juárez in Chihuahua — **both outside the United States, and the board is US counties only.** A continental strip north to south is what the colonies actually were |
| **G3** | **Winter Quarters** | Contiguous held ground reaching **Douglas County, Nebraska** | ✓ Omaha. Inland, no port. **Nebraska is a Farmers Union governor state** |
| **G4** | **Adam-ondi-Ahman** | Conquer **northern Missouri**, including **Daviess County** | ✓ Daviess County exists and carries no trade geography. **Missouri is a governor state and holds the St. Louis gate** |
| **G5** | **East of Eden** | Hold **Illinois's Mississippi counties** | ✓ **18 counties — and they include both Hancock (Nauvoo, a river port) and Alexander (Cairo).** ⚠ **Cairo is one of the fifteen chokepoints and the single most contested gate in the Great Lakes tree** |
| **G6** | **The Temple East of East of Eden** | Hold **Lake County, Ohio** | ✓ Kirtland. ⚠ **It is a Great Lakes corridor county**, and Ohio is the Farmers Union's **largest core state — 44 of its 257 core counties** |
| **G7** | **The Mormon Battalion Part 2** | **San Diego** | ✓ **`has_port: true`, `coastal: true`.** ⚠ **An ocean port — the answer to being landlocked.** And it is **SoCal's seat of government** |

### ⚠ The branch is a ladder by physics, not by design

**You cannot take Kirtland from Salt Lake.** **Reach** is a bounded search out from *one* seat, decaying
per Area entered, that **refuses the move outright past a limit** — measured, a 517-Area empire's worst
frontier sits at **0.13** against a limit of **0.18**, and Deseret at roughly 31 Areas is nowhere near
Ohio.

> **So the trail has to be walked in order, and the engine enforces it. Nobody had to write a rule
> saying you cross Nebraska before Illinois.**

| | |
|---|---|
| **G1** | **The gate.** Home, and it teaches the mechanic the whole tree runs on |
| **G2** | **Off the ladder** — it runs north–south while everything else runs east. Free once G1 is done |
| **G3 → G4 → G5 → G6** | **A ladder east, enforced by Reach** |
| **The pivot** | §7.4 |
| **G7** | **Unlocked by the pivot** |

### ⚠ Four of the seven are aimed at the Great Lakes tree

**Nebraska, Missouri, Illinois and Ohio.** *Deseret's G5 and the Great Lakes' capstone want the same
county.* **The two live trees are on a collision course across the entire Midwest**, and that is the
best structural argument for having more than one.

## 7.4 The pivot — **the trail complete**, and the reward is **the Gathering**

> **Condition: hold a contiguous chain of ground from Kirtland to the Wasatch Front.** The whole
> migration under one flag. *Contiguity is already a single call in the build.*
>
> **Reward: defection no longer needs a frontier.** Today an Area crossing 0.40 defects to a breakaway
> *"along its frontier."* After the pivot, **any Area on the continent where your movement crosses the
> line comes to you, wherever it is.**

**Why this and not something else.** Deseret is the only realised *movement* on the board; its ground
arrives by people changing their minds rather than by an army; and **G1's stated purpose is to teach
the player to cause uprisings in other states.** The pivot is that lesson paid off — *you stop
marching and start calling people home.* **It is scoped to your own movement**, exactly as the Great
Lakes licence is scoped to the river, so it is not a general gift.

### ⚠ And it comes BEFORE the last mission, which the other two trees do not

**Aaron's reason: *"the Mormon Battalion to conquer San Diego is going to be tricky, so getting the
pivot beforehand makes that better."* The mechanics agree, and they also say how far it gets you.**

**`base` is multiplicative** — *"an authored grievance cannot radicalise a place into a movement whose
ideology it does not share."* Computed from the authored coordinates: Deseret governs **yellow**, and
**yellow-to-red affinity is 0.71 while yellow-to-blue is 0.37.**

> **So the Gathering carries you across red inland California and stops at the blue coast. It gathers
> you as far as the desert; the Battalion still has to take the port.**

**Structural consequence, and §2.4 is widened for it: a pivot may open one more mission rather than
closing the tree.** Deseret is the worked example.

## 7.5 Branch three — BUILDING

| | Mission | Condition | State |
|---|---|---|---|
| **B3** | **Crossroads of the West** | Improve logistics infrastructure | ✓ **This is the one buildable thing** — capacity. Works in the alpha. *And it is Salt Lake City's actual slogan* |
| **B2** | **A City Beautiful** | Raise quality of life | ✓ A live stock with a measured turn-0 band of **0.55–0.98**. Works in the alpha |
| **B1** | **Busy as a Bee** | Reach a band in **Manufacturing** | ⚠ **Needs the resource model.** And note **capacity is frozen by geography** — only *utilisation* moves — so this is a band, not growth |
| **B4** | **In Our Lovely Deseret** | **Surplus in all six sectors** — the 1.11–1.50 band, six times over | ⚠ **Needs the resource model, and it may be near-impossible by design.** Extraction is the model's single upstream chokepoint and **ruling 7 made it gate farming as well**, so a simultaneous surplus everywhere is a very strong claim |

> **⚠ Two of Deseret's four Building missions are unavailable in the alpha**, against one of the Great
> Lakes' three. *The branch reads fuller than it plays.*

## 7.6 What this tree would be tested for

1. **Can a landlocked pariah actually move goods?** §7.1a unlocks its neighbours. **Whether a
   smuggler's rate reaches anything without a port is still a route-model question nobody has asked.**
2. **Does the corridor come back?** G1 rests on defection at 0.40, and the roll leaves **19 to 45**
   Areas in Deseret's hands depending on the seed. *A bad roll and a good roll are different games.*
3. **Does Reach actually make the trail a ladder, or does it make it impossible?** The branch assumes
   you can walk from Utah to Ohio by expanding contiguously. **Nobody has tried.**
4. **Is the Gathering too strong?** Frontier-free defection is the largest permission granted by any
   pivot in the three trees.

---

## 8. Open questions

| | | Owner |
|---|---|---|
| **1** | **How long should a tree take?** A game is 200 turns and nobody has played one. **The first tree played is the measurement** | The alpha |
| **2** | **Does a tree ever expire, or can it be picked up at turn 180?** | Aaron |
| **3** | **What happens to a tree when its nation is conquered?** Diplomacy ruling 18 makes a *claim* inherit with the ground; nothing says whether a tree does | Aaron |
| **4** | **Do the other fifty-four nations get trees later?** | Aaron, at the build-order stage |
| **5** | **Does the AI read its tree?** If a nation with a tree is AI-played, does it pursue it — and if not, is the player racing an opponent that does not know the race is on? | Aaron, then the architect |
| **6** | **Does a Lake Michigan port reach the Canada corridor without passing Mackinac?** §5.1 | The Technical Designer |
| **7** | **Does an alliance require mutual recognition?** Trade, treaty and transit all test it; an alliance is not built, so nobody has ever asked. **§7.1a unblocked Deseret's S1 without settling this**, and it is a general rule that belongs in `diplomacy-design.md`. *Precedent points at no — vassalage is already the pariah's escape hatch precisely because aid is not recognition-gated* | **Aaron**, in the diplomacy document |
| **8** | **Can a smuggler's rate reach the world market for a nation with no port?** The market is *"a haircut rather than a lock"* because *"refusing external trade outright would make an unrecognised landlocked state unplayable"* — **which is a description of Deseret** — but the market is reached *"only through an ocean port, or through somebody else's."* **Nobody has asked whether the two rules agree** | The Technical Designer |

## 9. Gaps

| | |
|---|---|
| **1** | **A mission's record has no specified shape** beyond §1 — no field list, no home in `STATEFUL_MODULES`, and completed missions are persistent state |
| **2** | **Nothing specifies how a tree is shown.** *Belongs to `presentation-design.md`; named here because momentum is a presentation property before it is a mechanical one* |
| **3** | **Nothing says what happens when two nations sharing a tree complete the same mission.** Both live trees are shared |
| **4** | **`Former Glory` needs the Republic of Texas's claimed boundary painted as a region.** The map editor does exactly this. **Its extent was not verified and must not be written from memory** |
| **5** | **Chicago and Detroit are not on the board.** The Great Lakes G5 is computable today and means much less than it will when the story's city-states exist. **Philadelphia and New York City are not on the board either**, which is what the Texas pivot is missing |
| **6** | **The Gulf is not a distinguishable set.** The basin model says *"the Gulf counts as Atlantic"*, and the county data flags `coastal` without saying which water. **25 coastal ports sit across Texas 7, Louisiana 7, Mississippi 2, Alabama 1 and Florida 8**, with nothing separating Florida's Gulf ports from its Atlantic ones. *Dominate the Gulf* needs an authored list |
| **7** | **Nothing says what a mission's reward does when the ground that earned it is lost.** §1.1 rules the *mission* permanent; whether a modifier tied to holding a place survives losing the place is a different question and is unasked |

---

*Sources, verified against the files on 15 September 2026: `data/county_trade.json` (chokepoint labels,
per-county port / Great Lakes / border-crossing / river flags, the four ordered corridors, and
`bank_pairs`); `data/adjacency.json` (county neighbours); `data/parties.json` (movement counties,
cores, caps and adjectives); `data/game-data.json` (county names); `DESIGN.md` §2.1, §4.1, §6.2, §6.5,
§6.6, §6.7, §7.1; `docs/design/politics-ideation.md` rulings 15, 16, 18, 25, 26, 27, 34, 44 and finding
I; `docs/design/diplomacy-ideation.md` rulings 4, 18; `docs/design/the-things-above-ideation.md` ruling
2; `docs/spec/economy-system-spec.md` §3.1, §4.1; `DECISIONS.md` D163, D168, D221, D222.*
