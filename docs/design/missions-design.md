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

## 6. The Texas tree

**Drafted by Aaron, reviewed against the build, not yet written up here.** Structure as §2: **Standing**
is a recognition ladder of three, **Ground** is a set of five cities then a fan of five capstones,
**Building** is free, and the **pivot** is Washington D.C.

**Unblocked:** conquest ruling 19 was brought forward on 15 September (D222), so the four Texan rebels
open unrecognised and the Standing branch has something to do. **Its review findings are in D221.**

## 7. The Deseret tree

**Not drafted.** Branch themes agreed:

| Branch | About |
|---|---|
| **Standing** | Stop being nobody. Utah's signature is measured as worth more than everything else combined — the continent's per-turn chance of recognising Deseret runs **0.070 → 0.181** the moment Utah gives in |
| **Ground** | Finish the corridor — the Areas that did not cede, and the `leftBehind` ones that were cut off |
| **Building** | Get out. ⚠ **Unverified: whether Deseret holds any port or international border at all.** The branch depends on it and it must be checked against the data |

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

## 9. Gaps

| | |
|---|---|
| **1** | **A mission's record has no specified shape** beyond §1 — no field list, no home in `STATEFUL_MODULES`, and completed missions are persistent state |
| **2** | **Nothing specifies how a tree is shown.** *Belongs to `presentation-design.md`; named here because momentum is a presentation property before it is a mechanical one* |
| **3** | **Nothing says what happens when two nations sharing a tree complete the same mission.** Both live trees are shared |
| **4** | **`Former Glory` needs the Republic of Texas's claimed boundary painted as a region.** The map editor does exactly this. **Its extent was not verified and must not be written from memory** |
| **5** | **Chicago and Detroit are not on the board.** G5's condition is computable today and means much less than it will when the story's city-states exist |

---

*Sources, verified against the files on 15 September 2026: `data/county_trade.json` (chokepoint labels,
per-county port / Great Lakes / border-crossing / river flags, the four ordered corridors, and
`bank_pairs`); `data/adjacency.json` (county neighbours); `data/parties.json` (movement counties,
cores, caps and adjectives); `data/game-data.json` (county names); `DESIGN.md` §2.1, §4.1, §6.2, §6.5,
§6.6, §6.7, §7.1; `docs/design/politics-ideation.md` rulings 15, 16, 18, 25, 26, 27, 34, 44 and finding
I; `docs/design/diplomacy-ideation.md` rulings 4, 18; `docs/design/the-things-above-ideation.md` ruling
2; `docs/spec/economy-system-spec.md` §3.1, §4.1; `DECISIONS.md` D163, D168, D221, D222.*
