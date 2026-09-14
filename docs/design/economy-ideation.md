# The economy — ideation

**Stage 1 of five: IDEATION. Nothing here is judged, chosen, sized or ruled on.**

This is the idea bank for the economy and resources. Its only job is to be **complete** — every idea
we have had about how this part of the game should work, in one place, so that when we move to
design nothing gets quietly lost because it happened to be in a conversation nobody re-read.

**The rule for this document:** an idea earns a place by having been had. It does not have to be
good, affordable, consistent with its neighbours, or compatible with what is already built. Several
entries below flatly contradict each other and that is correct at this stage. Judging them is the
next document's job.

**Where they came from.** `docs/design/resources.md` (the 6 September conversation),
`docs/design/resources-v2.md` (the simplification pass — *including everything it cut, which is
restored here, because cutting is a design act and this is not the design*), `docs/FUTURE-IDEAS.md`
entries F2 to F13, and the known gaps in `docs/deferred.md`. The long-form reasoning for the
F-entries stays where it is; what is here is the idea itself.

**Not included, on purpose:** F1 (sub-turns), F14 (a turn arriving as news) and F15 (whether
counties are too small). Those are about time, presentation and the size of the map — three
different systems, each of which deserves its own ideation round rather than being smuggled into
this one.

---

## 0a. The three things written at the top of every round

**One action per nation per turn, and it ends the turn.** Six components compete for one slot. Any
idea below that assumes a decision every turn has taken that turn away from the other five, and this
round has to say so out loud.

**The board and the six ideologies are fixed.** Geography is baked from federal data. If this round
finds itself wanting to change either, that is a finding worth stopping for.

**Every quantity says where its number comes from** — measured from a named file, invented as a
placeholder, or still to be asked about.

---

## 1. What this round owns

The economy owns **one of the nine pressures** that feed a region's anger — how well its people are
fed, treated and paid — and round 1 called it the deepest of them. Round 1 measured the term at
**17% of grievance** and asked that quality of life be able to *fall*, visibly and for a reason a
player can read, and recover when the cause is fixed.

It also inherits the story the whole plan is aimed at: **scenario 4, a hungry nation with an army**,
where buying food is possible but invading for it is cheaper. That story needs rounds 1, 2 and 4
finished before it can be told, which makes it this round's exam rather than one of its exercises.

### What this round is NOT, and it changes the shape of the work

**It is not "invent how shortage works". That is already written.** `docs/spec/economy-system-spec.md`
§3 specifies a complete resource model — supply-to-demand bands, derived demand, and a table of
effects per sector per band — and its owner rulings 1.2 to 1.5 already replaced the broken parts of
the built economy **on paper**.

**None of it is built.** The alpha track deliberately built trade and transit *on top of* the
known-wrong economy and left demand, supply and price alone: *"A1 and A2 build on the existing economy
and do not touch it. No changes to demand, supply or price… The model is known to be structurally
wrong and is being kept on purpose."*

So the hollow spot everybody keeps naming — **nothing bad happens to a nation that does not trade** —
**has a written cure that was never built.** This round's job is to test that cure against what three
closed rounds now demand of it, and to settle where the two disagree. It is not to write a second one.

### What is already built, verified against `DESIGN.md` on 14 September 2026

| | |
|---|---|
| **Six sectors** | Agriculture, Resource Extraction, Manufacturing, Trade & Transportation, Finance, Information Technology. Each Area has a baked production profile, rescaled to its live GDP |
| **One price index** | `100 × (demand share ÷ supply share)^1.3`, clamped, recalibrated every turn so it reports *what is scarce* rather than what turn it is |
| **Treasury** | GDP × tax rate, less maintenance, administration and occupation |
| **Occupation as the anti-snowball brake** | Superlinear on Areas held outside the home state. A greedy conqueror's treasury crosses into deficit around **110 occupied Areas** |
| **Trade as a standing contract** | A term, a fixed price and an expiry. All sixty nations use it, not only the player |
| **Transit across other people's ground** | Compounding tolls, a notice period, and a route-finder |
| **The rivers** | Four corridors and **fifteen chokepoints**, all real places. A gate bridges the stretch above it and the stretch below it and no other pair |
| **Two seas and a shut canal** | Panama closed to former American states |
| **Canada and Mexico** | Geography, not nations. Great Lakes ports reach the world market only through the Canada corridor |

### What is not built, and this round has to know all five

1. **Nothing physically moves.** Settlement is a treasury credit, so a buyer gains *money* rather than
   goods. `DESIGN.md` §12 calls this "the honest remaining gap". **Spec ruling 1.3 already replaced it
   on paper** — *"trade becomes a transfer of quantities… goods move too, and the buyer's supply figure
   rises"* — and it was never built.
2. **A trade deal cannot be haggled on price.** The lever exists in the model and reaches no screen, so
   *a buyer with no alternative pays exactly what a buyer with three alternatives pays*. `DESIGN.md`
   calls this "the single largest gap between what the economy spec asks for and what is built".
   **Conquest is blocked on it** (I3).
3. **Nothing in the transit layer has a length.** Measured 5 September 2026: the closest two ports on
   one sea are **16 miles** apart and the farthest **2,578**, priced identically; a Canada corridor
   spans **411 to 2,442 miles** at one flat rate.
4. **No AI nation ever closes a corridor.** They sign them, price them and let them expire. The
   decision to cut somebody off is the player's alone, and the machinery is symmetrical.
5. **Quality of life is one national number.** This is finding A below, and it is the round's first
   real contradiction.

---

## 2. The inbox — what rounds 1, 2 and 3 handed this one

**Filed 14 September 2026, seven days after the round went live.** Rounds 2 and 3 closed on 9 and
11 September and neither handover was carried across at the time. This section is that repair.
**Nothing here is new** — every row is a demand already written down in a closed round, and three of
them block a rule that has already been ruled.

### Blocking — a written rule cannot work until this round answers

| # | From | What it asks for |
|---|---|---|
| **I1** | **Conquest**, ruling 23 | **What a war costs to run.** Deferred here explicitly, and ruling 22's repayment lever cannot be priced without it |
| **I2** | **Conquest**, ruling 4's third cause | **Desperation must bite.** A nation that cannot get a resource must actually suffer for it, or the third cause of war can never fire. *This is the hollow spot arriving as a blocking requirement rather than as an observation* |
| **I3** | **Conquest**, ruling 4 | **A price must be settable by the seller**, or nobody can charge the absurd price that same cause names |

### Owed, but blocking nothing

| # | From | What it asks for |
|---|---|---|
| **I4** | **Conquest** | What a **blockade** actually stops, and what a **destroyed rail hub** does to a corridor |
| **I5** | **Conquest**, finding E | Its fifth story stalls on **I2**. Filed so this round knows its answer unblocks somebody else's scenario |
| **I6** | **Politics**, rulings 25–27 | **What a federation's toll split is worth** — 5% between direct neighbours, 10% routed, the host's share going to the ground actually crossed. *What a percentage of trade is worth is the economy's to say* |
| **I7** | **Politics**, ruling 21 (S26) | **Buying a movement off.** Deferred here because what money can buy is this round's to say |
| **I8** | **Politics**, F21 | **Funding propaganda** before a referendum — S26 pointed at a vote instead of at a region. The legal end of the same scale as rigging: money buys the result openly, liberties buy it quietly |
| **I9** | **Secession**, §4 | **Quality of life must be able to fall** — from hunger, from a broken supply, from a blockade — visibly, for a readable reason, **and locally** — and recover when the cause is fixed |

### One item corrected on arrival

**Ruling 15's X% is not this round's.** Politics §9 assigns it to the **mechanics stage**, carrying the
hard constraint that it must sit **below 0.30** or two Unify movements can never make a demand at all
(politics finding I). It is noted here only because this round may set what a *share of trade* is
worth (I6), and the two numbers will be read side by side by whoever sets them.

---

## 3. The spine — the questions, in the order they are asked

Asked one at a time, each with a recommendation. Answered ones move into a rulings section.

**The order puts the blocking questions first**, so that the three rules already written in another
round stop being blocked as early as possible, and puts the Tuesday test last because every answer
above it changes what there is to do.

| # | Question | Why here |
|---|---|---|
| **Q1** | **Does the spec's resource model still stand, now that three rounds have made demands of it?** | Everything else is a detail of the answer. It is also the cheapest possible outcome: if it stands, most of this round is filing rather than inventing |
| **Q2** | **Does shortage land on a place, or on a country?** | **Finding A.** Round 1 demanded local; the spec rules resources pool nationally. They cannot both be right, and the scenario this round is examined on needs the answer |
| **Q3** | **What does a war cost to run?** | **I1, blocking** |
| **Q4** | **Can a seller set a price, and what does a buyer with no alternative pay?** | **I3, blocking.** The lever exists and reaches no screen |
| **Q5** | **What does the outside world want?** | Canada, Mexico and the world market have no demand at all, so every route out currently ends in a buyer with infinite appetite |
| **Q6** | **What stops a self-sufficient nation from simply opting out?** | Measured: five states are above the national average on both food and energy. If trade is optional for them, the whole system is optional for them |
| **Q7** | **What can money buy?** | **I7 and I8** together — buying a movement off, and funding a referendum |
| **Q8** | **What is a share of trade worth?** | **I6.** The federation's toll split, and the number the mechanics stage will read beside ruling 15's X% |
| **Q9** | **What does a blockade stop?** | **I4** |
| **Q10** | **Where does water data come from, if water is to be geography rather than invention?** | E51 measured that the rivers in the game are shipping lanes with no flow and no volume, and that the Colorado — the actual water fight — is absent entirely |
| **Q11** | **What does the player actually do about all of this, on a Tuesday, with one action?** | The Tuesday test. Last, because every answer above changes it |

---

## 3a. Findings

### Finding A — shortage cannot land on a place, and two documents disagree about whether it can

**Round 1 handed this round the requirement that quality of life must fall *locally***, adding: *"the
formula already reads the Area's own condition."* **It does — but not through the term this round
owns.**

Verified against `DESIGN.md` §7.2 and §12 on 14 September 2026. A region's grievance reads quality of
life, civil liberties, how powerful the holding nation is, that nation's authority, war weariness, and
the Area's own authored grievance. **Of those six, only the authored grievance is a property of the
place.** The rest are national stocks, and `DESIGN.md` §12 says so in terms: *"the power stocks are
still per NATION, so sentiment's grievance terms are uniform across everything a nation owns."*

**The spec makes the same collision internally, which is the part worth stopping for.** §3.3 gives a
food crisis two effects — **Quality of Life −30** *and* **Area grievance +5/turn** — but §3.5 rules
that **resources pool nationally, with no intra-national supply chain.** If every Area is equally
short, every Area takes the same +5, and the per-Area channel is national in everything but name.

**Why it matters more than it sounds.** The story this round is examined on needs hunger to be *worse
somewhere*. A nation uniformly 8% short of food has a management problem. A nation whose two eastern
Areas are starving while the capital eats has a **secession** problem — and that is the game.

**What it would cost, in the document's own words.** `DESIGN.md` §12 names the fix and prices it as
cheap: *"Quality of life and liberty satisfaction per Area would give the diffusion term a real
gradient to run along, and would give migration a much sharper one; the economy bake is already per
Area, so it is a change of scope rather than of model."*

**Owner: Aaron**, as **Q2**. It is a scope decision rather than a technical one.

### Finding B — the cure for the hollow spot was written a week before the hollow spot was named

The known hollow spot — *nothing bad happens to a nation that does not trade* — is recorded in three
places as an open problem. **The spec answers it**: derived demand (§3.4) replaces demand-as-a-share-
of-own-output, which is the single thing that makes a shortage arithmetically impossible today; bands
(§3.1) turn a ratio into a state; and the per-sector tables (§3.3) attach real consequences to each
band, food crisis included.

**It was not built because the alpha track was told not to touch it**, and that was a deliberate,
recorded choice rather than an oversight.

**What this changes about the round:** the first question is not *what should happen to a hungry
nation* but **whether the answer already written is still the right one** after three rounds of new
demands. That is **Q1**, and it is cheap to ask and expensive to skip.

---

## A. What a resource fundamentally is

**E1 — A resource is a thing you need a certain amount of, not a thing you own.** *(Aaron, 6 Sep)*
Food should be a resource that is traded, and you need to reach a certain amount to feed your
citizens. The number that matters is not how much you have but how much you have *against how much
you need*.

**E2 — One number is currently doing two jobs, and they are unrelated.** *(6 Sep)* A sector's share
of the economy is being used as both "how much this is worth" and "how much of it you need". Farming
is 0.9% of the American economy and the first requirement to stay alive.

**E3 — GDP and trade are not the same thing.** *(6 Sep)* GDP measures value added where it happens;
trade is what physically moves. A county full of insurance offices posts enormous output and puts
nothing on a lorry.

**E4 — Three tiers, each with its own zero.** *(Aaron, 6 Sep)* Necessities run −1 to 0, where zero
means *fed* and there is no reward above it. A middle tier runs −0.5 to +0.5 around what you need. A
wealth tier runs 0 to +1 with no floor and no requirement. Each tier gets its own scale so they
never have to be converted into one another.

**E5 — Or: one rule, two customers.** *(Claude, 6 Sep)* Every resource has a requirement and a
supply; divide one by the other and you have its coverage. Below enough, things go wrong; above
enough, you have something to sell. The only difference between the tiers is *who* is short — the
people, or the factories.

**E6 — The wealth tier is just money.** *(6 Sep)* No floor and no need means "more is better", which
is the definition of income. But the *sources* still differ in how they fail: money from finance
keeps arriving under blockade, money from shipping stops when the ports close, money from knowledge
needs an educated population that can leave.

**E7 — A full belly is not a reward.** *(6 Sep)* Surplus food does not make your people happier. It
makes you money. Whatever shape the model takes, the asymmetry between "short" and "spare" has to
survive.

---

## B. Necessities, need, and what shortage feels like

**E8 — The three necessities are food, water and energy.** *(Aaron, 6 Sep)*

**E9 — Measure necessities in physical units, not money.** *(Aaron, 6 Sep)* Calories, litres,
megawatt-hours. The point is that cutting a nation's imports and watching its factories stall three
turns later only works if the thing flowing is tonnes and calories rather than dollars.

**E10 — Calories per person per day, because it scales itself.** *(Aaron, 6 Sep)* California needing
eighty billion calories is frightening and meaningless. "Your people are eating 1,840 calories a
day" is a sentence anyone can act on, and a nation of forty million and one of six hundred thousand
read the same number and both understand it.

**E11 — The famine bands.** *(Aaron, 6 Sep)* Under 1,000 total famine; 1,000–1,250 severe rationing;
1,250–1,500 rationing; 1,500–1,750 food shortages; 1,750–2,000 food insecurity; 2,000+ adequate.

**E12 — Or move the top band to 2,100**, so "adequate" means what humanitarian standards mean by it.
*(Claude, 6 Sep — and the 2,100 figure is from memory and unverified.)*

**E13 — The requirement itself can be raised deliberately.** *(Aaron, 6 Sep)* Working a population
harder for a war effort might set the bar at 2,100 instead of 2,000.

**E14 — Only give a resource a physical unit if the player already has a feel for it.** *(Claude,
6 Sep)* Calories qualify. Megawatt-hours per person per day do not. Everything else reads as a
percentage with a consequence attached.

**E15 — The three necessities should differ sharply in how fast a shortfall can be fixed.**
*(Aaron, 6 Sep)* Food is fast — a season, frightening and survivable. Energy is medium — burn more
of what you hold, but new generation takes years. Water is nearly immovable: you cannot decide to
have more rain.

**E16 — Two numbers give you that character: a buffer and a rebuild time.** *(Claude, 6 Sep)* How
long you can go without noticing, and how long it takes to put right. Food: a year of silos, fixed
in a season. Water: no buffer at all, and effectively never fixed.

**E17 — Bands with named effects.** *(economy brief)* Crisis, deficit, met, surplus, glut — each
firing an event the journal can print, and each with its own consequences per resource.

**E18 — Food storage as silos measured in turns of national consumption.** *(economy brief)* Surplus
fills storage freely; only volume above capacity counts as a glut.

---

## C. Making more of something

**E19 — A county does not have a resource, it has a capability and a current allocation of it.**
*(Aaron, 6 Sep)* Utah farmland can grow alfalfa or wheat; the land is the capability and alfalfa is
merely what it is doing. When nobody wants alfalfa and everybody wants calories, the allocation
moves. Nothing is built; something existing is pointed somewhere else.

**E20 — What a county exports stops being a label and becomes a consequence.** *(6 Sep)* It is
whatever it produces far past what it consumes.

**E21 — Feeding yourself makes you poorer.** *(6 Sep)* Every acre growing wheat is an acre not
earning. The trade-off should be real and it should sting.

**E22 — Some places simply cannot.** *(Aaron, 6 Sep)* The Bay Area has no arable capability, so it
must buy. That stops being an assertion and becomes an output of the model.

**E23 — Allocation moves automatically, following need and price.** *(Aaron, 6 Sep)* Nobody wants to
hand-farm sixty-one countries.

**E24 — The player can override it, and overriding costs something.** *(Aaron, 6 Sep)* Direct the
economy, subsidise, ration. Directing an economy costs something.

**E25 — Capability for farmland only, or for everything?** *(open)* One lever — how much of your
farmland feeds you versus earns — is small. The same idea across all industries is a general-purpose
reallocation engine.

**E26 — Money builds capacity.** *(Aaron, 6 Sep)* The Bay Area buying food is one thing; the Bay
Area buying a *fertilizer plant* is the other, and only the second changes the map permanently.
Buying a meal is a choice you make again next quarter; buying a factory is a choice you make once.

---

## D. The production chain

**E27 — Four stages, each converting the one before it.** *(Aaron, 6 Sep)* Extraction produces raw
resources; processing produces materials; manufacturing produces goods; and a fourth stage produces
capital goods.

**E28 — The fourth stage is capital goods, not "better goods".** *(Aaron, 6 Sep)* Stage three makes
what *people* consume; stage four makes what *the economy* consumes. Bread versus the oven.

**E29 — The loop is the point.** *(6 Sep)* Stage four makes the industrial equipment stage one needs
and the factories stage three needs, so the economy builds its own tools.

**E30 — Which means you cannot bootstrap.** *(6 Sep)* Advanced factories are required to make
advanced factories.

**E31 — And losing stage four does not kill you immediately — you slide, visibly, over a decade.**
*(6 Sep)* That is the right feeling for a fractured continent.

**E32 — The inputs, at the broad level:** raw resources; labour, educated and manual; industrial
equipment; manufacturing equipment; infrastructure; energy. *(Aaron, 6 Sep)*

**E33 — Nothing wears out, and it should.** *(6 Sep)* Without depreciation, capital goods become a
one-off purchase. With it, every country needs a permanent trickle just to stand still, and a
country cut off from it slides rather than collapsing.

**E34 — No lag and no stockpile.** *(6 Sep)* Ore should become steel next turn and a machine the
turn after, with inventory in between. Without stock, a severed input is instant famine — punishing
once. With it, the player gets a visible countdown and a chance to act.

**E35 — Minimum viable scale.** *(6 Sep)* A refinery, a fab, a smelter and a fertilizer plant each
have a smallest economic size. A nation of two million cannot run one at any price. This is the
arithmetic that *forces* trade rather than encouraging it, and gives small nations a structural
reason to unify.

**E36 — Labour is not fungible.** *(6 Sep)* A miner is not a fab technician.

**E37 — And educated labour leaves.** *(6 Sep)* It takes a generation to make and a year to lose,
and when a country goes badly the educated go first — so advanced capacity can be destroyed by
emigration without a shot fired.

**E38 — Water belongs in the input list**, for refineries, power-station cooling, semiconductors and
above all agriculture. *(6 Sep)*

**E39 — Or: cut the chain entirely and keep only the pattern.** *(Claude, 6 Sep)* The lesson of the
worked examples was never "model eight steps", it was *one invisible input is enough to ruin you*.
Give each necessity exactly one and no necessity two.

**E40 — Capability that is not fed decays.** *(Claude, 6 Sep)* Farmland without fertilizer yields
less next year. A cheap version of depreciation that does not need a capital-goods system.

---

## E. The invisible layer

**E41 — Between ore in the ground and a thing on a shelf sits a layer of processed intermediates
that only a few places make.** *(Aaron, 6 Sep)* This is where a broken continent actually hurts,
because these take years to build and cannot be improvised.

**E42 — The filter for what earns a place.** *(6 Sep)* An input qualifies only if it is all three
of: **essential** (production drops sharply without it, not merely gets dearer), **concentrated**
(not everyone has it, so it must cross a border), and **slow to replace** (it cannot be fixed inside
a few turns). Fertilizer passes all three. Sand passes none. Semiconductors pass spectacularly.

**E43 — Fertilizer is the canonical example.** *(Aaron, 6 Sep)* It is three separate things —
nitrogen from natural gas, phosphate mined in few places, potash in fewer still — and losing any one
drops yields hard. An invisible input standing between a country and famine.

**E44 — One invisible input per necessity, and no more.** *(Claude, 6 Sep)* Fertilizer behind food;
refining behind energy; **nothing** behind water — and that is the point of water.

**E45 — Candidates on this map**, all unverified: potash from Canada; refining on the Gulf Coast
with the continent fed by pipeline from Texas and Louisiana; the grid already being three separate
machines, with Texas islanded in real life; steel in the Ohio Valley; phosphate in Florida and
Idaho; nitrogen wherever the gas is; soda ash in Wyoming.

**E46 — Nine tracked quantities, or four?** *(open)* The original conclusion was roughly nine —
four or five foundation inputs plus a small number of essential, concentrated, slow intermediates.
The simplification pass argued four, plus two arrows.

---

## F. Water

**E47 — Water may be the best resource in the game.** *(Aaron, 6 Sep)* It is the only one that
arrives by **geography rather than by trade**.

**E48 — It flows downhill across borders whether anyone agrees or not.** *(6 Sep)* An upstream
nation can simply turn it off. Every other resource needs a deal; water needs a river and the will
to dam it.

**E49 — Water is an industrial input as well as a human one.** *(6 Sep)* Refineries, cooling,
semiconductors, and above all agriculture. Putting it in both places is what connects the two
systems.

**E50 — A water crisis is categorically worse than a food crisis** — not because the number is
bigger, but because nothing you do this decade changes it. *(Aaron, 6 Sep)*

**E51 — The rivers in the game are the wrong rivers.** *(Claude, 6 Sep — measured)* The four
corridors were baked from the navigable-waterways layer: they are shipping lanes, with no flow, no
volume and nobody upstream taking any out. The Colorado — the actual water fight — is absent
entirely, because it is not navigable. So water needs a dataset the project does not have.

**E52 — Build water last, or invent it now?** *(open)* Food, energy and materials can be built on
measured data. Water cannot.

---

## G. Geography, rivers and routes

**E53 — The rivers are the argument the whole map rests on.** *(Aaron, 5 Sep, F6)* The United States
holds more navigable internal waterway than the rest of the world combined, and moving heavy goods
by water costs a fraction of moving them by land. A game about America fracturing in which the
rivers do not matter has thrown away the thing that made America rich.

**E54 — Hold both banks, or pay whoever holds the other one.** *(F6)* Measured: 213 county pairs
face each other across a navigable river, and on the opening board all 213 have different owners.

**E55 — The chokepoint chain.** *(Aaron, F6)* Illinois falls out with Michigan, so Michigan will not
let its ships through the Detroit River; it pays a toll; then New York charges it again at Niagara;
then it needs a separate agreement with Canada to reach the open market. Three tolls and a foreign
agreement to sell a bushel of wheat.

**E56 — Over short distances, is a ship really cheaper than a lorry?** *(Aaron, 5 Sep, F13)* Water
wins decisively over long hauls and loses over short ones, because loading and unloading costs the
same whether it sails fifty miles or five thousand. The game has no distance and no transhipment
cost, so it currently says a ship is always better for the wrong reason.

**E57 — "Find me a way out."** *(Aaron, 5 Sep, F9)* The player asks the game for the three cheapest
ways to reach the ocean, sees who they would have to persuade for each, and picks — on information
the game does not have, like which neighbour they are about to invade.

**E58 — Ask the map where you could go.** *(Aaron, 5 Sep, F10)* Pick a destination and the map draws
the routes you *could* have in faded versions of the colours it uses for the ones you *do*.

**E59 — The canal is shut, and nobody is told.** *(Aaron, 5 Sep, F12)* The Panama Canal being closed
to former American states is not only a consequence of the collapse, it is part of the cause — a
navy that cannot move between its own oceans is two navies. The rule is built; the story has never
been told to a player.

---

## H. Trade as an instrument

**E60 — Breaking a deal early, and paying for it in reputation.** *(Aaron, 5 Sep, F2)* You can walk
out of a deal before its term, and the price is not paid to the partner — it is paid to everyone.
Every other state becomes warier of signing with you, and it shows up as a worse price. It decays,
so a reputation can be rebuilt.

**E61 — A tax on particular goods crossing a border.** *(Aaron, 5 Sep, F5)* Not only a percentage
toll on everything, but a set tax on certain goods.

**E62 — Bundled deals.** *(Aaron, 5 Sep, F8)* "Pay us at both ports and the rail toll is free." One
negotiation covering several agreements, where one leg is discounted to make another palatable.

**E63 — Tolls as a bargaining chip inside a trade negotiation.** *(Aaron, 5 Sep, F11)* "I'll accept
your rate, if you give me free transit to the Dakotas."

**E64 — A buyer with no alternative should pay visibly more.** *(deferred #8)* The lever exists in
the model and reaches no screen. The missing piece is not the slider — it is a representation of
*alternatives*: how many other nations could the buyer plausibly get this from, and reach?

**E65 — The outside world has no idea what it wants.** *(deferred #12)* Canada, Mexico and the world
market have no demand at all. What an outside market demands is exactly what a resource model
decides.

**E66 — Nothing in the game currently rewards timing.** *(measured, 5 Sep)* Over ten years the
largest sector price moved 4.7%. Prices are too flat for a fixed-price contract to be a gamble.

---

## I. Infrastructure you can build

**E67 — Using somebody's port is not the same as using their road.** *(Aaron, 5 Sep, F4)* A port
grant puts their cargo through your cranes and your people, and every ton of theirs you handle is a
ton of your own you cannot. It should cost more, and it should eat into the host's own capacity.

**E68 — Ports are not interchangeable.** *(Aaron, 5 Sep, F7)* Real tonnages exist in the dataset the
map was baked from and are currently thrown away: today Los Angeles and a barge dock count the same.

**E69 — Infrastructure can be built.** *(Aaron, 5 Sep, F7)* Ports, railways, roads — at a price in
money and turns.

**E70 — And where you can build, and what it costs, depends on the ground.** *(Aaron, F7)* Some
coastal counties have no port because nobody lives there; some because the geography is hopeless. A
nation whose only coast is the second kind can still build, and should pay through the nose.

**E71 — Building is the third answer to a hostile neighbour.** *(Aaron, F7)* "You can add rail if
you'd rather not attack an enemy to get somewhere by rail." Every route out of a landlocked country
currently ends in somebody else's hands: you ask, you pay, or you invade. Capital infrastructure is
slow, expensive, and yours.

---

## J. Consequences, politics and people

**E72 — Interest groups who can be angry with you.** *(Aaron, 5 Sep, F3)* A food glut collapses
farm-gate prices and the farmers are furious; a manufacturing glut and the industrialists are. The
difference between "the country is unhappy" and "the farmers are furious with you".

**E73 — Hunger should generate claims.** *(economy brief)* A starving nation has a reason to want its
neighbour's fields, and that reason should be legible.

**E74 — Shortage should reach the political layer, not only the treasury.** *(6 Sep)* Heavy
penalties, unrest, and faster secessionist pressure.

**E75 — Being rich and being safe are different things.** *(6 Sep)* The five things that decide
whether a nation survives — water, food, energy, materials, consumer goods — are about 12% of the
economy between them. The four that decide whether it is powerful are the other 88%. A rich nation
can be one bad harvest from crisis while a poor one is unconquerable because it feeds itself.

---

## K. The shape of the sectors, and honesty about data

**E76 — Fifteen BEA industry lines sum to exactly 100%.** *(measured 6 Sep)* Finance 21.4%,
professional services 13.0%, government 11.3%, manufacturing 9.8%, education and health 8.7%,
retail 6.3%, wholesale 5.8%, information 5.4%, construction 4.5%, arts and hospitality 4.4%,
transport 3.4%, other services 2.1%, utilities 1.6%, mining 1.4%, agriculture 0.9%.

**E77 — A seventh, non-traded bucket.** *(6 Sep)* Government, health, education, hospitality and
other services are 26.5% of the economy and none of it ships. Today those are smeared across the six
game sectors, which is why every sector reads larger than it is.

**E78 — Eight sectors:** food; energy; materials; industry; building; logistics; capital; services.
*(6 Sep)*

**E79 — Ten sectors:** the eight, splitting heavy industry from consumer goods, and adding water.
*(6 Sep)*

**E80 — Water has no industry line at all**, because it is geography rather than industry. That is
exactly why it works: no value and absolute need, so it cannot be bought out of trouble, only shared
or fought over. *(6 Sep)*

**E81 — Resources could sit on top of the six industries rather than replacing them.** *(Claude,
6 Sep)* The industries stay what you trade; the resources are what the trade is *for*. Nothing
already built has to change subject.

**E82 — Or the six could be re-cut entirely** to match what a resource model needs, at the cost of
every deal, corridor and screen changing subject.

**E83 — The Freight Analysis Framework.** *(6 Sep)* A federal dataset of what physically moves
between places, by commodity and by mode. It is the right data for a trade model and the wrong data
for a GDP model — and it describes flows as they were when America was one country with no internal
borders, which is exactly the baseline this game needs. Not fetched; that reaches off Aaron's
machine.

**E84 — Every quantity should say where it comes from.** *(Claude, 6 Sep)* Measured from a file,
invented as a placeholder, or still to be asked about — marked as such at the point it is defined,
so nothing invented can be mistaken for something counted.

---

## L. Inherited from the story of the break-up (6 September)

Filed here from round 1. The story is recorded in `secession-ideation.md` §8; these are the parts
of it that belong to the economy, left as questions.

**E85 — The opening is an energy shock.** Texas's war halted oil production; gas could not leave
Texas because the United States would not recognise its successors; "extreme gas shortages" broke
the people's trust in Washington. Does the economy open in that state — fuel short everywhere,
prices high, supply chains broken — or at its 2024 equilibrium as today? *Built: the economy opens
at its published figures; the recognition trade block is exactly the mechanism the story describes.*

**E86 — A corridor can be overloaded.** With the mountain states cut off, "all trade and
transportation was funnelling down through Arizona… stressing Arizona's freight transportation
capabilities." Does a corridor have a finite capacity that congests when everyone uses it? *Built:
capacity belongs to a nation — its ports, rail hubs and gateways — and caps what it can move; a
corridor has no capacity of its own.*

**E87 — What a bloc does to an economy.** The Farmers Union protects its members' farming and their
corridors to Canada and down the Mississippi. Free transit inside, a common front outside, price
supports, shared storage? *(The relationship is diplomacy's; what it does to prices and routes is
this round's.)*

**E88 — Stateless ground charging tolls.** Wyoming as a tier-3 zone, "mainly just charging tolls to
anyone shipping food to Deseret and new Idaho." Can ground with no state grant a corridor and take a
toll, and where does the money go?

**E89 — Refineries as prizes.** Houston wanted Louisiana for "Mississippi access and the oil
processing plants." The story reaches for the refining arrow (E44) and treats refineries as assets
that can be taken by force. Are they places on the map?

**E90 — Free trade as two corridors.** The New England–Rochester "free trade deal" is really mutual
transit at no toll in both directions, giving the Great Lakes a route to salt water that competes
with the Canada corridor for the first time. Zero-toll corridors; and a term four times longer than
the built five-year maximum.

**E91 — The money.** The dollar, the federal debt and federal transfers — still unaddressed by the
story. A state that lived on federal money opens richer than it should.

**E92 — Federal land.** Still unaddressed. Most of the West's ground was federal, and the Sagebrush
Rebellion's authored goal is to get it back.

**E93 — A new country's people will go hungry for it, for a while.** *(Aaron, 7 September —
secession S65.)* If realisation brings a fervour in which citizens "overlook certain things", one of
those things is shortage. So the same food coverage should hurt a two-year-old country less than a
settled one — and hurt it much more when the fervour runs out. The economy decides how far that
tolerance stretches and whether it applies to hunger at all, or only to money. *(Politics owns the
fervour itself; this is the part that lands here.)*

---

## Questions we have no idea for yet

These are not ideas. They are holes, recorded so that ideation can aim at them.

1. **What makes a nation want to trade rather than merely benefit from it?** The known hollow spot:
   today, nothing bad happens to a nation that does not trade.
2. **What does an outside market want?** Canada, Mexico and the world have no demand.
3. **Where does water data come from**, if water is to be geography rather than invention?
4. **What stops a self-sufficient nation from simply opting out?** Measured: five states are above
   the national average on both food and energy.
5. **What is the player's verb?** Almost every idea above is something that happens *to* a nation.
   Very few are things a player *does* on a given turn.

---

## The state of this document

**Not yet complete, and here is exactly what it is missing**, measured against the three closed
rounds on 14 September 2026.

| | State |
|---|---|
| **The three things at the top of every round** (§0a) | ✅ Written 14 September |
| **What this round owns** (§1) | ✅ Written 14 September, verified against `DESIGN.md` |
| **The inbox** (§2) | ✅ **Nine items carried across 14 September**, seven days late. Three of them block a rule another round has already written |
| **The spine** (§3) | ✅ Eleven questions in order. **None answered** |
| **Findings** (§3a) | Two. **A is Aaron's** and is question 2 of the spine |
| **The idea bank** (A–L) | 93 entries, E1–E93. Complete enough to argue from, not yet closed |
| **Rulings** | ❌ **None.** The round has not put a question to Aaron yet |
| **The scenarios, traced** | ❌ **None.** Scenario 4 — a hungry nation with an army — is this round's exam |
| **The Tuesday test** | ❌ Unanswered, and recorded as hole 5 below |
| **What this round hands onward** | ❌ Not written |

Ideation is finished when a session can read this end to end and the only new entries are
recombinations of ones already here, when every scenario has been traced, when it has answered what
the player actually does about this on a Tuesday with one action — and when Aaron says so.

*Sources: `docs/design/resources.md`, `docs/design/resources-v2.md`, `docs/FUTURE-IDEAS.md` F2–F13,
`docs/deferred.md` #8 and #12, `docs/spec/economy-system-spec.md` §3. Measured figures from
`build/raw/CAGDP2.zip` and `build/raw/co-est2024-alldata.csv`, 6 September 2026.*
