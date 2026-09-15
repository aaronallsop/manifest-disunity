# Missions

**Stage 2 of five: DESIGN.** What the thing does, what it is measured in, what the player sees, and
what happens at each level.

**Depends on:** `GDD.md` · `nation-design.md` (victory, and the conditions table a mission is a
smaller instance of) · `turn-design.md` (a mission costs nothing, which only means something once the
turn has no budget) · `movements-design.md` · `diplomacy-design.md` · `economy-design.md` ·
`blocs-design.md`.

**Status: ruled 15 September 2026**, `DECISIONS.md` **D221**. **This is the only document in the GDD
that carries authored content rather than mechanics.** The system is §1–§4; the trees are §5 onward,
and each is content that can be rewritten without touching anything above it.

---

## 0. Why this exists at all

**Seven ideation rounds produced 536 ideas and not one of them was a mission.** What the game has is
three victory conditions checked every world turn — **an ending, not something to work on.** Nothing
anywhere tells a player what they should be doing this decade.

**And the ideation plan named the consequence about itself in September, before any round ran:**

> *Almost every idea we have is something that happens **to** a nation, and very few are things a
> player **does**… **Every round should be made to answer the same question before it closes: what
> does the player actually do about this, on a Tuesday, with one action?** If a round cannot answer
> that, it is not finished.*

**A mission tree is the answer at the scale of a whole game rather than a turn.** Aaron's four
reasons, and they are the design brief for everything below:

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
already answerable. A mission adds two fields to that row: **what unlocks it** and **what it pays.**

**A mission costs nothing.** It is not a thing you do — it is a state the game notices you have
reached. **So missions never compete with anything in the turn**; they sit above it and say what is
worth starting.

> **Missions are the middle game. Victory is the end.**

**And that is what they are for.** A game runs **200 turns** and the painted separatist movements
resolve inside roughly the first third. Victory is unreachable for most of a game and unavailable to
most of the board. **Without missions the long middle of a 200-turn game has nothing in it that tells
a player they are getting somewhere.**

### 1.1 A tree belongs to a situation, not to a nation

**The five Texan successors share one tree**, because they are five claimants to one prize.
**Minnesota and Wisconsin share one**, because they are two candidates to lead the same union. You
pick one of them and play it; the tree is the same and **the situation is not**, which is what makes
the same tree a different game.

**Three trees in the alpha covering seven of sixty-one nations.** Everything else plays without one.

---

## 2. The structure

**Three branches, four elements, one pivot.** Read out of Aaron's Texas draft and generalised so the
other two can follow it.

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

**The three branches run in parallel.** None gates another. A player pushes whichever suits their
situation, and most push all three unevenly.

### 2.2 ⚠ Standing and Ground pull against each other, and the model does it without being asked

**Recognition's first term is standing.** Influence **falls** with conquest, scaled by how much
standing you had — measured across twelve turns of expansion, **Influence 0.666 → 0.148** while
Authority barely moved.

**So wherever ground must be taken by force, every step of the Ground branch makes the Standing branch
harder — and the nation panel says so, by name, in the Why record.**

| | How its ground arrives | The tension |
|---|---|---|
| **Texas** | Conquest | **Severe.** The branches fight |
| **Deseret** | Defection | **Mild.** Its ground comes to it |
| **Great Lakes** | Agreement | **Inverted.** Joining a federation *raises* Influence, because membership is flat-rate trade with every member and Influence counts **reach** — *"nations you have live trade relations with"* |

**This is the property Aaron named as the reason EU4 works:** *"you could be so advanced in military
that you are missing out on trade increases… all the systems work together to both make the other
more powerful but also work in the opposite way."* **It is already in the model. The trees only had
to find it.**

**And Building feeds Standing more than Ground**, because the one buildable thing is trade capacity
and Influence counts trade reach. So the structure quietly says: **build and trade and be admitted, or
conquer and be feared.**

### 2.3 Four structural elements

| | | Example |
|---|---|---|
| **Ladder** | The same achievement at increasing scale. Each rung unlocks the next | one nation recognises you → half the continent → all of it |
| **Set** | N missions in any order; **all** are required to open what follows | the five Texan cities |
| **Fan** | Several independent missions that all become available when a gate opens | the five Texan capstones |
| **Free** | No prerequisite and no gate | the development branch |

**Each branch opens with something reachable in the first few years**, so a tree begins paying
immediately rather than after a decade. That is Aaron's fourth reason — *bonuses to keep the momentum
up* — expressed as a placement rule.

### 2.4 The pivot

**At most one per tree, at the end of the longest branch, and its reward is not a bonus — it is a
victory re-aimed.**

Aaron's Texan example: **conquer Washington D.C. and unite the map as the United States of Texas
instead of the USA.** That is the objective changing hands, and it answers round 7 ruling 2's open
half in a way neither of its candidates anticipated. That ruling said the federal remnant plays a
different game — *restore*, where everyone else *replaces* — and left open whether the remnant's
victory is its own condition set. **A pivot gives a third mode: the remnant's story can be seized.**

*A tree without a pivot is complete and normal. A pivot is what a tree earns by being finished.*

---

## 3. Rewards

### 3.1 A bonus is a named row in the Why record

**A mission may move a stock, provided it appears in the panel with its own label.**

The precedent is built and it is the right one. **A leader** is *"a thumb on the scale, deliberately
small"* — one named person per nation, two traits, and **a signed modifier on each of the five stocks
plus a small pull on the war roll.** A leader's trait is already a named, permanent, explained term
that the panel prints as its own row.

**So *"Spirit of Sam Houston: +0.04 Authority"* is a row that tells a story. What is forbidden is an
unexplained adjustment** — every number in this game explains itself from named inputs, the summary is
built from the same rows the panel shows *"so it cannot disagree with the numbers beside it"*, and a
hidden mission bonus is the one kind of row this game has never had.

***Recorded rather than edited away:** the first recommendation put to Aaron was "permission, not
power" — that a mission may only unlock or cheapen something. It was too strict, and the leader
modifier is what shows it.*

### 3.2 What a reward may be

| | |
|---|---|
| **A named modifier** | Signed, permanent, labelled, on any of the five stocks or on a term some system already computes |
| **A permission** | Something you may now do that you could not — *"your goods cross Mexico free"* |
| **A claim** | The machinery exists: a recognition claim is a property of territory and changes hands with the ground (diplomacy ruling 18) |
| **A project unlocked or cheapened** | Sits inside `turn-design.md` and adds no new kind of effect |
| **Money** | Dull, safe, and it converts straight into projects |
| **A pivot** | §2.4. One per tree at most |

### 3.3 Two traps, both found by checking

**A reward can be redundant.** *Dominate the Gulf* proposed letting you charge 10% more and still be
accepted. **The economy already pays that automatically:** `AlternativesMult` rises as a buyer's
supplier count falls, to ×1.5, and the spec calls it *"the most important term… what makes cutting a
rival's other supplier a strategic act rather than a flavour event. Do not simplify it away."* **Hold
the Gulf and you can already charge more, by arithmetic.** Check before authoring.

**A reward can need a kind of term the game does not have.** *Increased recognition from nations west
of the Mississippi* is a **geographic** modifier on recognition, and recognition is earned from
standing, kinship, duration and size — **nothing in the game modifies it by where the other nation
is.** Small, but new.

---

## 4. ⚠ What a tree must not do

**A tree must not be finishable in a run that is shorter than the game, and it must not be
unfinishable either.** A game is **200 turns**. Nobody has played one, so there is no measurement to
size a tree against — *which is itself the useful thing to say.* **The first tree to be played is the
measurement.**

**A tree must not require a nation the board does not have.** Programmer rule 17, earned on
14 September when a round wrote eleven rulings about nations that are not in the game. **Every mission
below names ground or nations verified against the data on 15 September 2026**, and where one depends
on something unbuilt it says so in the row.

---

# 5. The Great Lakes tree — Minnesota or Wisconsin

**You play one of them. The tree is the same and the situation is not.**

## 5.1 The situation, measured

**Checked against `data/county_trade.json` and `data/parties.json`, 15 September 2026.**

| | **Minnesota** | **Wisconsin** |
|---|---:|---:|
| Counties carrying trade geography | 20 | 28 |
| Ports | **4** | 2 |
| Ocean coast | **0** | **0** |
| Great Lakes counties | 3 | **15** |
| **International border crossings** | **2** — International Falls, Grand Portage | **0** |
| **Chokepoints held** | **0** | **0** |
| Counties on the Mississippi corridor | 11 | 7 |

**Three facts decide this tree and none of them was guessable:**

**1. Neither of them holds a single one of the fifteen chokepoints.** The gates are Michigan's four
(Soo Locks, the Straits of Mackinac, the Detroit River, the St. Clair River), New York's two (Niagara,
the St. Lawrence outlet), Illinois's two (the Chicago Sanitary & Ship Canal, and Cairo at the
Ohio–Mississippi confluence), and Missouri's one (the Missouri–Mississippi confluence at St. Louis).

**2. They sit at the far western end of both corridors.** The Great Lakes corridor is 81 counties
ordered west to east and **Duluth is the first county in the list**; by state it runs Michigan 41,
Wisconsin 15, New York 9, Ohio 7, Minnesota 3, Indiana 3, Illinois 2, Pennsylvania 1. The Mississippi
corridor is 105 counties and **it begins in Minnesota.**

> **So every water route out of a Great Lakes nation runs past somebody else's gate.** East through
> the lakes means Michigan then New York. South down the river means Illinois then Missouri then
> Louisiana. *A gate bridges the stretch above it and the stretch below it and no other pair* — so
> each one is a separate permission and a separate toll, compounding on what arrives.

**3. Its trade with the world is easy and its trade with its own continent is not.** Great Lakes ports
reach the world market **only through the Canada corridor** — a flat 10% that is a cost and not a
transfer, and **Canada is geography, so nobody can close it.** *That is the inverse of most nations
on the board, and it is the whole strategic character of this one.*

### 5.2 Its politics, and they are unlike anywhere else on the board

**Three movements live in Minnesota and Wisconsin. All three are Unify movements, and all three are
capped below the line at which ground leaves.**

| Movement | Counties | in MN | in WI | Cap | Adjective |
|---|---:|---:|---:|---:|---|
| **Blue-Collar Populist** | 693 | 87 | 72 | **0.35** | ideological |
| **The Farmers Union** | 983 | 75 | 56 | **0.30** | economic |
| **Great Lakes Free Trade** | 103 | 3 | 12 | **0.30** | economic |

**`secession.countyThreshold` is 0.40.** None of the three can reach it.

> **This is the one nation on the board that cannot be broken apart by its own people. It can only be
> nagged into unions.**

**And a Unify movement's demand is not something you can deliver at home.** Politics ruling 15: past a
share of the population, **the demand is that your government go and propose to its neighbours** — and
ruling 16 gives the neighbour three answers, of which the middle one is the interesting one:

| Answer | What happens |
|---|---|
| **Yes** | The two nations become **one entity**, everyone a full member, **and none of conquest's five penalties apply** |
| **"Let's think about it"** | **The movement inside THEIR country grows faster** |
| **No** | Refused — and it can read as a nation consolidating power |

**Ruling 18 then makes the movement clever for free:** asking discharges the demand, and later it
comes back **pointing at whichever neighbour is now the likeliest yes — which is often the one who
said "let's think about it", because that answer grew their appetite.**

> **So the Great Lakes player's own farmers do the persuading. You are the instrument they use.**

**⚠ And the Farmers Union's heartland is not in the eight governor states.** Its 257 core counties run
**Ohio 44, Indiana 32, Michigan 26, Wisconsin 25, Oklahoma 24, Missouri 23, Illinois 22, Minnesota
21.** *Ohio and Michigan are not in the story's bloc of eight, and between them they hold more of the
movement's core than Minnesota and Wisconsin do.* **To satisfy the movement you have to bring in
states the bloc does not contain — and Michigan is the one holding four gates.**

---

## 5.3 Branch one — STANDING: build the union

**A ladder of four.** Each rung is built machinery: politics ruling 34 sets three as the floor for a
federation and diplomacy ruling 4 reuses it for a bloc; ruling 25 gives a federation a leader elected
by its members.

| | Mission | Condition | Element |
|---|---|---|---|
| **S1** | **Sign the paper** | Be a founding member of a bloc of at least **three** | Ladder, and **reachable in the first years** |
| **S2** | **The eight governors** | The bloc holds the story's eight — Minnesota, Wisconsin, Illinois, Indiana, Iowa, Nebraska, Missouri, Kansas | Ladder |
| **S3** | **More than a piece of paper** | The bloc becomes a **federation** — leader, budget, turn, flat internal toll | Ladder |
| **S4** | **Elected** | Be voted its **leader**, and spend its budget for a full term | Ladder. **The top of the branch** |

**What S3 costs, and it is the hinge of the whole tree.** Politics ruling 26: **the federation's flat
10% replaces members' own arrangements with one another.** Inside it there are no negotiated corridors
— members trade at a rate nobody can refuse or revoke. **That is the sacrifice for the gate-holders
and the prize for everybody else.** Ruling 27 softens it: the host's 5% goes to the ground actually
crossed, so **Michigan still earns from every member's cargo on its lakes, at a fixed rate rather than
whatever it could extract. Joining does not zero a gate-holder's advantage; it caps it.**

**What S4 is worth.** The leader runs **two budgets, its own and the federation's**, and the
federation's turn is deliberately three things: fund a struggling member, permit a declaration of war,
and accept or reject trade deals offered from outside **on behalf of everybody.**

*Rewards: each rung should pay in **Influence**, which is what membership already generates — joining
an eight-member federation hands you seven live trade relations in one act, and Influence counts reach.
The tree should not need to invent that; it should name it.*

---

## 5.4 Branch two — GROUND: the gates

**Your ambition is not to own the gates. It is to have them inside your union, where they stop being
threats and become a fixed 5%.** A **set** of three, any order, then a **fan**.

| | Mission | What it means | Verified |
|---|---|---|---|
| **G1** | **The Soo and the Straits** | **Michigan** is in your bloc or federation | Michigan holds **4 of the 15 gates** and **41 of the 81** Great Lakes corridor counties |
| **G2** | **The river gate** | **Illinois** is in it | Illinois holds the **Chicago canal** and **Cairo**, and Cairo is the Ohio–Mississippi confluence |
| **G3** | **The outlet** | **New York** is in it | New York holds **Niagara** and the **St. Lawrence outlet** — the lakes' only way to the ocean |

**⚠ G3 is the hard one and it should be.** New York is not a Farmers Union state, it is not in the
Midwest, and it is nine counties of the Great Lakes corridor away at the far end. **A Great Lakes
federation that reaches New York has crossed the continent by agreement.**

**The fan, unlocked when all three are in:**

| | Mission |
|---|---|
| **G4** | **An inland sea** — every Great Lakes corridor county held by a member |
| **G5** | **From the headwaters down** — the Mississippi corridor from Minnesota to Cairo held by members |
| **G6** | **Nobody's toll** — no member pays a negotiated corridor toll to a non-member to reach the world market |

---

## 5.5 Branch three — BUILDING: a way out of your own

**Free missions, no gate. And this is where the two nations stop being the same.**

| | Mission | Minnesota | Wisconsin |
|---|---|---|---|
| **B1** | **Duluth / the lakeshore** — build capacity at your own Great Lakes ports | 4 ports, 3 lake counties | 2 ports, **15** lake counties |
| **B2** | **The land gate** — hold and build a border crossing to Canada | **Has two already**: International Falls and Grand Portage | **Has none. Must take or federate for one** |
| **B3** | **The granary** — hold a food surplus for eight turns | | |

**⚠ B2 is the asymmetry, and it is real rather than authored.** Minnesota opens with two international
crossings and Wisconsin opens with none. **The same mission is a development project for one of them
and a foreign-policy problem for the other** — which is exactly how Austin and Houston share a tree and
do not share a game.

*B3 is the spec's **Surplus** band — a food supply-to-need ratio of 1.11 to 1.50 — held for eight turns.
**It needs the resource model built**, which is not in the alpha track today.*

---

## 5.6 The pivot — **the union becomes the Union**

**Condition:** your federation holds the seats, the people and the economy that Reunification measures.

**Reward: the victory re-aims.** You are not restoring the United States and you are not replacing it.
**You are reassembling it by agreement**, and the federation you built is the thing that did it.

**⚠ And the engine already permits this, which is why it is the right pivot rather than a wish.**
The Reunification path counts seats of government as **held, own, and aligned** — *"a seat you do not
own counts toward Reunification if the holder governs as you do and your Influence exceeds theirs by a
margin."* The design note in the engine says it in one line:

> ***A beloved hegemon reunifies through nations it never invaded.***

**So round 7 ruling 2's two modes become three.** The federal remnant **restores**. Texas **replaces**
— and Aaron's Texan pivot replaces the name as well. **A Great Lakes federation reassembles**, and it
is the only one of the three that never needs an army.

---

## 5.7 What this tree would be tested for

**Three questions the alpha would answer and paper cannot:**

1. **Will Michigan ever join?** Politics ruling 26 states the problem plainly: *"the nations worth
   most to a federation are the ones holding the gates — and those are exactly the nations that lose
   most by joining, because their leverage is the thing membership dissolves. So a federation must pay
   them, elect them, or do without them — and the map decides which."* **Without Michigan this tree
   stops at G1.**
2. **Does the movement actually push?** The whole Standing branch runs on Unify demands, and ruling
   15's threshold is unset with a hard constraint on it: **it must sit below 0.30**, or the Farmers
   Union and Great Lakes Free Trade — caps of 0.30 — **can never make a demand at all.**
3. **Is a peaceful tree as interesting to play as a violent one?** *Texas's tree is a race with four
   rivals. This one is a committee. Nobody knows whether that is a different game or a slower one.*

---

## 6. The Texas tree

**Drafted by Aaron, reviewed against the build, not yet written up.** Its structure is the one §2
generalises: **Standing** is a recognition ladder of three, **Ground** is a set of five cities then a
fan of five capstones, **Building** is free, and the **pivot** is Washington D.C.

**It is blocked on nothing** — conquest ruling 19 was brought forward on 15 September (D222), so the
four Texan rebels open unrecognised and the Standing branch has something to do.

**Its findings are recorded in `DECISIONS.md` D221** and will be written into this document next.

## 7. The Deseret tree

**Not yet drafted.** Its three branches are agreed in theme:

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
| **3** | **What happens to a tree when its nation is conquered?** Diplomacy ruling 18 makes a *claim* inherit with the ground. Nothing says whether a tree does | Aaron |
| **4** | **Do the other fifty-four nations get trees later, or is guided play for a chosen few?** | Aaron, at the build-order stage |
| **5** | **Does the AI read its tree?** If a nation with a tree is AI-played, does it pursue it — and if not, is the player racing an opponent that does not know the race is on? | Aaron, then the architect |

## 9. Gaps

| | |
|---|---|
| **1** | **A mission's record has no specified shape** beyond §1 — no field list, no home in `STATEFUL_MODULES`, and completed missions are persistent state |
| **2** | **Nothing specifies how a tree is shown.** *Belongs to `presentation-design.md`; named here because Aaron's fourth reason — momentum — is a presentation property before it is a mechanical one* |
| **3** | **"Own and control" is undefined.** It could mean held, or held-and-digested — the tenure ladder runs `occupied-war` → `occupied` → ordinary ground. **The second makes a mission take time and is probably right, and nobody has said so** |
| **4** | **Nothing says what happens when two nations sharing a tree complete the same mission.** Both Texas and the Great Lakes trees are shared |
| **5** | **`Former Glory` needs the Republic of Texas's claimed boundary painted as a region.** The map editor does exactly this. **Its extent was not verified and must not be written from memory** |

---

*Sources, verified against the files on 15 September 2026: `data/county_trade.json` (chokepoint
labels, per-county port / Great Lakes / border-crossing / river flags, and the four ordered
corridors); `data/parties.json` (movement counties, cores, caps and adjectives); `DESIGN.md` §2.1,
§6.2, §6.5, §6.7, §7.1; `docs/design/politics-ideation.md` rulings 15, 16, 18, 25, 26, 27, 34, 44 and
finding I; `docs/design/diplomacy-ideation.md` rulings 4, 18; `docs/design/the-things-above-ideation.md`
ruling 2; `docs/spec/economy-system-spec.md` §3.1, §4.1; `DECISIONS.md` D221, D222.*
