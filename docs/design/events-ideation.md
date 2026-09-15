# Events — ideation (round 6)

**Stage 1 of five: IDEATION. Nothing here is judged, chosen, sized or ruled on.**

**Status: OPEN, 14 September 2026.** Round 5 ran the same day. This is the idea bank for **things that
happen that nobody chose** — shocks from outside, as distinct from the twelve authored *crises* the
game already has, each of which is triggered by a nation's own condition and is therefore a symptom
with choices attached rather than a shock.

**The rule for this document:** an idea earns a place by having been had. It does not have to be
good, affordable, consistent with its neighbours, or compatible with what is already built.

**Ideas are numbered X1, X2, … — X for an eXternal shock.** S, C, P, E and T are taken by rounds 1–5,
D is `DECISIONS.md`, and F is `FUTURE-IDEAS.md`.

---

## 0a. The three things written at the top of every round

**One action per nation per turn, and it ends the turn.** ⚠ **Round 7 is now rewriting this rule** —
Aaron has said so and four rounds have deposited into it. **This round must therefore be careful in
the opposite direction from the others:** an event is the one thing in the game that can *give* the
player a decision without spending their action, because politics ruling 12 already opened that door
for movement demands. **Round 6 is the round most likely to abuse an exception that is about to be
redesigned.**

**The board and the ideologies are fixed.** If this round wants to change either, that is a finding.

**Every quantity says where its number comes from** — measured from a named file, invented as a
placeholder, or still to be asked about.

**And the rule round 5 earned the hard way, written at the top of this one too: verify the roster,
not only the code.** §3 below is checked against the content files and the engine this session.

---

## 1. What this round owns

**Things that happen that nobody chose.** The ideation plan put it last for a reason: *"you cannot
design a shock before you know what it is shocking."* Five rounds have now told it what there is to
shock.

| Owned here | Owned elsewhere |
|---|---|
| A shock from outside — what one is, where it lands, who feels it | The twelve authored **crises**, which are built and are not shocks |
| Whether the world has a state of its own that can change | The nation's own stocks — every other round |
| What a shock may reach: a place, a sector, a deal, a corridor, a bloc, a vassal | What each of those things *is* — rounds 3, 4 and 5 |
| The backstory as events, and what the opening edition says | What the backstory *is* — secession §8, closed |
| A war that starts because somebody else's crisis made it | What a war is — conquest, closed |
| Whether a shock can be prepared for | What preparing costs — the economy |

---

## 2. The in-tray, emptied

**Collected as the first act, as round 5 did.** Round 4 opened without doing this and it cost a
morning; round 5 did it on day one and the round ran in a single sitting.

**Nine items. It is the smallest in-tray of any round**, which is what the plan predicted: events
reads from nothing and writes to everything, so nobody could send it much until they were finished.

### 2a. From round 1, secession — filed 6 September

| | Item | State |
|---|---|---|
| **1** | **The break-up as a chain of events.** Texas seceded → the five fell out → oil stopped → Washington would not recognise them → shortages → trust collapsed → protests → martial law → local powers stepped up. **Is the backstory told as dated events, and could the same chain run FORWARD in play, for some other nation, from some other spark?** | **OPEN, and it is the biggest question in the round** |
| **2** | **Mass protests at the capital.** An event with a choice — concede, crush, wait | **Half built.** Two cousins exist in the deck: *the veterans march* and *they arrested the wrong person* |
| **3** | **A world shock.** The oil stoppage hit every nation at once. **The first exogenous event the game would need** | ⚠ **OPEN, and §3 shows it is not expressible today** |
| **4** | **A neighbour comes apart**, and the people who arrive carry their politics with them | **Half built.** *A neighbour comes apart* exists; the politics-carrying half does not |
| **5** | **Events as the backstory's voice** (F12, F14). The canal, the bicentenary, the year the Union dissolved | **OPEN.** The game has nowhere to say any of it |
| **6** | **Shocks that land on grievance** — what secession asked of this round | **OPEN.** `sentiment` exists as an effect and moves only movements already present |

### 2b. From round 2, conquest — filed 9 September

| | Item | State |
|---|---|---|
| **7** | **A war that starts because somebody else's crisis made it** | **OPEN.** No effect in the built vocabulary can start a war |

### 2c. From round 4, economy — filed 14 September

| | Item | State |
|---|---|---|
| **8** | **The bands are the hook a shock hangs on.** *"A bad winter is a supply shock to agriculture and needs nothing new to land."* And **ruling 7 doubled the blast radius**: a shock to extraction now hits fuel, factories and food at once | ⚠ **OPEN, and the claim needs reading carefully** — see finding A. The bands are part of the *designed* economy, which has never run; the *built* effect vocabulary has no supply term at all |

### 2d. From round 5, diplomacy — filed 14 September

| | Item | State |
|---|---|---|
| **9** | **Three new things a shock can break, none of which existed when round 6 was planned.** A **bloc** can lose a member to a crisis; a **vassal's overlord** can be the thing that fails it; and a **recognition claim now changes hands when ground does** (ruling 18), so a war somewhere else can silently make you a pariah's parent. **And the sharpest: rulings 1–3 mean 23 pairs can never de-escalate** — an event that makes two nations need each other has no way to let them cooperate, and **round 6 must not write one that assumes they can** | **OPEN, and item (9d) is a constraint rather than a question** |

---

## 3. What is actually built today — verified 14 September 2026

**Checked against `content/events.json`, the engine and the tuning file this session.**

### 3a. The crisis deck is twelve rows of content, and it invents no mechanics

That constraint is written into the engine's own preamble and it holds: *"Every trigger reads a fact
some other system already computes… and every effect moves a number some other system already owns.
So an event is a nudge and a story, and the content file is content rather than code."*

**The twelve:** the harvest fails · a general will not go · shots on the border · a petition for home
rule · an offer from abroad · the veterans march · the currency slips · a neighbour comes apart ·
where the money went · a convention is called · they arrested the wrong person · a good year.

**Each has two or three options with no right answer** — *"an option that is strictly best is a
button, and a button is not a decision."* **The AI answers too**, taking whatever most helps what it
is currently worst at.

### 3b. ⚠ Every trigger reads THIS nation's own condition. There is no world state

Fourteen facts are available to a trigger: the turn, quality of life, liberties, authority,
influence, war weariness, strain, coalition pressure, how many Areas it holds, what share is
occupied, how many turns of upkeep the treasury covers, how much force is deployed, and whether a
neighbour ceased to exist recently.

**Every one of them is about the nation the event is firing for.** *`neighbourDied` is the only one
that looks outward at all, and it reads the ledger rather than a stock.*

**So in-tray item 3 — a world shock that hits everyone at once — cannot be expressed today.** There is
nothing for it to be true *of*. **That is the central gap of this round**, and it is the same shape
as the gaps rounds 4 and 5 each found in their own subject.

### 3c. ⚠ Every effect moves a national stock. Nothing reaches a place, a sector or an object

The effect vocabulary is closed and has **eight** entries: treasury as a share of income, authority,
influence, quality of life, liberties, war weariness, **sentiment**, and **standing**.

- **`sentiment`** is the only one that touches the map, and it deliberately moves **movements already
  present** — *"a crisis gives an existing argument more people; it does not invent a separatist
  tradition."*
- **`standing`** is the only one that reaches another nation: it writes to the memory list, toward
  every neighbour at once.

**Nothing reaches a region, a sector, a resource, a trade deal, a corridor, a bloc, a vassal, an
alliance, or a recognition claim.** *Four of those did not exist when the vocabulary was written; four
of them were ruled into existence by rounds 4 and 5 this week.*

### 3d. ⚠ A player meets the crisis deck about three times in a sixty-turn game

**Arithmetic from the tuning file, not from a run.** At most **three crises across the whole roster
per turn**, on a board of **sixty-one nations**, with an eight-turn cooldown per nation and thirty
turns before the same crisis recurs.

**So any one nation is picked roughly three turns in sixty-one — about once every twenty turns.** Over
a sixty-turn game a player sees **around three crises**, drawn from a deck of twelve.

**Three consequences, and they pull against each other.** The deck is *rare*, which is what the
tuning intends — *"a country that has a crisis every turn is not having crises."* It is also **mostly
unseen**: three quarters of the authored content never reaches a given player. And **the cooldowns
are not the binding constraint** — the per-turn cap is, so raising the cap is the only lever that
changes how often anything happens.

### 3e. The opening edition is a blurb and three sentences

Verified in the scenario content: a paragraph — *"The United States has already come apart. Texas
partitioned along its own cultural lines, California along the coast and the mountains, and the
Mormon Corridor is halfway out of the Union with the argument still running"* — and then three
sentences, one per dissolution and one for the cession.

**Against secession §8, which is a page of story with a dated chain of causes in it.** *In-tray item 1
is the gap between those two things.*

### 3f. The opening roster, restated because round 5 got this wrong

**Twelve new nations exist: Texas's five, California's six, and Deseret.** The story's twenty-nine —
the Deep South, Appalachia, the city-states, the Gulf nation, all stateless ground — **are a design
and are not built.** *Round 6 must not write an event about a nation that is not on the board without
saying which board it means.* **This is programmer rule 17 and it was earned four hours ago.**

---

## 4. The spine — the questions, in the order they will be asked

1. **What is a world shock, given there is no world?** Does the world get a state of its own, or does
   a shock stay a thing that happens to nations one at a time? *(Item 3, finding B.)*
2. **Does a shock land on a PLACE, or only on a nation?** *(Item 6, and round 4's whole quarrel with
   the national pot.)*
3. **What may an event reach?** The effect vocabulary is eight national stocks. Rounds 4 and 5 have
   just created sectors, deals, corridors, blocs, vassals and claims. *(Items 8, 9.)*
4. **Can an event start a war?** *(Item 7.)*
5. **Can an event be prepared for, or is a shock only ever weather?**
6. **Is the backstory told as events?** *(Items 1, 5.)*
7. **Does a chain of events exist — can one shock cause the next?** *(Item 1's second half, which is
   the more interesting half.)*
8. **Should the player see more of the deck than three cards a game?** *(Finding C.)*
9. **What does the player actually do about this, on a Tuesday, with one action?** — and for this
   round the honest version is sharper: **an event is the one thing that can hand the player a
   decision without costing the action, so what this round owes round 7 is a rule about when that is
   allowed.**

---

## 5. The idea bank

*Numbered X1, X2, … Unjudged.*

### A. What a shock is

**X1 — A shock is a crisis with no trigger.** The simplest possible definition and it reuses
everything: same table, same options, same effect vocabulary, and the `when` clause is replaced by a
roll. *Costs almost nothing and answers item 3 badly — it is still one nation at a time.*

**X2 — A shock is a crisis whose trigger reads the WORLD rather than the nation.** Which requires a
world with facts in it. *This is the real answer to item 3 and it is the expensive one.*

**X3 — A shock is one event delivered to many nations at once, each answering it separately.** The
oil stoppage: one cause, sixty answers, and the interesting part is that the answers differ. *No new
trigger vocabulary needed — only a way to address more than one nation.*

**X4 — A shock has a blast radius rather than a target.** It hits everyone within some distance of
where it happened: a hurricane on the Gulf, a drought across the plains. **The map is already county
data with real geography**, so "everyone on this coast" is answerable.

**X5 — A shock hits everyone who shares a property, not everyone who shares a place.** Everyone with
a port. Everyone in a bloc. Everyone who buys fuel from the same supplier. *Which makes a shock a
test of a nation's arrangements rather than of its location, and that is closer to what the story
describes.*

**X6 — There is no such thing as a shock; there is only somebody else's crisis reaching you.** The
oil stoppage was Texas's war, felt in Ohio. **Under this reading round 6 builds no new object at all
— it builds the CONNECTIONS along which an existing crisis travels.** *The cheapest idea in the round
and possibly the best.*

**X7 — A shock is a change to a tunable for a number of turns.** Winter is a multiplier on
agriculture for four turns. *Mechanically tiny, thematically thin, and it needs the economy's sectors
to be reachable — which §3c says they are not.*

**X8 — A shock announces itself before it lands.** A forecast, a warning, a bad omen — a turn or two
of notice in which a player can do something. *Turns a shock from weather into a decision, which is
the whole Tuesday problem.*

**X9 — A shock is only a shock the first time.** The second drought is a known risk; the tenth is a
climate. **Repetition should change what it costs**, because a nation that has been flooded three
times has either built defences or has decided not to.

**X10 — Some shocks are good.** *A good year* already exists in the deck. The opening of a new trade
route, a technology, a bumper harvest, a neighbour's collapse that happens to help you.

### B. Where it lands

**X11 — A shock lands on a nation, as everything already does.** The honest cheap answer, consistent
with round 4's single national pot.

**X12 — A shock lands on a REGION and the nation feels it through the region.** Which is the thing
round 4 explicitly gave up — Aaron chose one national pot for the alpha's sake, at the stated cost
that *"a player cannot point at a region and say THERE."* **An event is the cheapest possible place to
get that back**, because a shock is naturally local in a way a market is not.

**X13 — Against X12: a shock that lands on a region needs a region to have stocks, and round 4 ruled
it does not.** *Recorded as the collision, not resolved. It is round 4's ruling and this round may not
overturn it.*

**X14 — A shock lands on a sector.** The harvest is agriculture; the strike is haulage; the fire is
extraction. *Needs §3c's vocabulary to gain a sector term, which it does not have.*

**X15 — A shock lands on a ROUTE.** The river freezes; the pass closes; the canal shuts. **This is
the one kind of shock the built game could nearly express today**, because corridors, chokepoints and
the fifteen river gates are real objects with owners.

**X16 — A shock lands on a relationship.** An incident, an insult, a border shooting — and two
nations that were fine are not. *`standing` already exists as an effect and writes to every
neighbour at once; a targeted version is a small change.*

**X17 — A shock lands on a person.** The leader dies. **Leaders exist in the game with traits that
modify outcomes.** *The cheapest dramatic event nobody has written.*

**X18 — A shock lands on everyone EXCEPT you, and that is the interesting case.** A good year in
every neighbouring country makes your own ordinary year a grievance.

**X19 — A shock lands where the map is thin.** Fourteen of sixty nations hold no port, no lake and no
border crossing — measured when transit was built. **A shock to shipping lands on nobody there and
ruins everybody else**, which is a real asymmetry the board already has.

**X20 — A shock lands on the ground rather than the government** — and stateless ground, which
round 5 ruled is terrain with a price, has no government to feel it. *So what happens when a flood
hits a region nobody governs? Nothing, under ruling 16, and that may be correct or may be a hole.*

### C. The world, and whether it has a state

**X21 — The world gets a small set of facts of its own.** A handful of numbers everyone can read: the
world price of fuel, a climate index, a decade. *The minimum that makes X2 possible.*

**X22 — Against X21: the world market already exists and is already a fact everyone reads.** Round 4
built it as a single abstract partner with a price and a shipping cap. **So a world shock could be a
change to the world market and nothing else** — and that is free.

**X23 — The world's state is just the sum of the nations in it.** No new numbers: a continent-wide
famine is what it is called when enough nations are hungry at once. *Elegant, and it cannot produce a
shock, only describe one.*

**X24 — There is a calendar, and some things happen on it.** The game opens on 1 March 2036, the eve
of two hundred years since Texas declared itself a nation. **The bicentenary is a date the game
already knows and has nothing to say about.**

**X25 — The world outside the continent exists and occasionally acts.** Canada and Mexico are
geography by standing ruling; but the *world market* is not, and a world that stops buying is a shock
nobody on the board caused.

**X26 — A world shock is announced in the newspaper and answered by nobody.** Some things are just
true: the price of fuel doubled. No options, no card, no decision — it changes the arithmetic and the
player finds out by playing. *The opposite of a crisis and probably necessary.*

**X27 — The world has a mood toward the continent.** After enough war, outside buyers want less to do
with it. *An outside version of the recognition idea, and it would give the whole board a shared
consequence for its own behaviour.*

**X28 — Seasons.** Four turns to a year, and one of them is winter. **The clock already reads as a
date.** *A recurring, predictable, mild version of X4 that costs one line and makes the calendar mean
something.*

### D. Shocks that reach what rounds 4 and 5 just built

**X29 — A crisis can break a bloc.** Round 5's ruling 4: a bloc is light, and anyone may walk out. **A
shock that makes one member's interest diverge is the natural reason to.**

**X30 — A crisis can break a vassalage.** Ruling 5: a vassal may repudiate, and repudiating is a
hostile act. **An overlord that fails its vassal in a crisis is exactly when that happens.**

**X31 — A crisis can break a trade deal** — which today cannot be broken at all (F2, and round 5's
T76). *So either an event is the first thing that can break one, or it cannot touch deals.*

**X32 — A crisis can close a corridor without anybody deciding to.** The bridge is out. **The
notice period exists and this would bypass it**, which is either the point or a violation of the
rule that makes corridors trustworthy.

**X33 — A crisis can move a recognition claim.** Round 5's ruling 18 made the claim a property of
territory. **A war somewhere else can therefore make you a pariah's parent without your involvement**
— and an event that reports that to you is free, because the fact already changes.

**X34 — A crisis can make two nations need each other.** ⚠ **And round 5 filed a constraint against
exactly this:** twenty-three pairs can never de-escalate, so **an event that offers cooperation to
those pairs has nothing to offer.** *The event must check, or it will silently do nothing for a third
of the board's worst relationships.*

**X35 — A crisis can create a petition.** Round 5's ruling 6 gives a movement a line it crosses to
start asking. **A shock that pushes it over is the most natural trigger in the game.**

**X36 — A crisis can make a sponsor's money visible.** Round 5's ruling 7 makes sponsorship public
already; an event is how the *player* learns about it rather than reading a screen.

**X37 — A crisis can be aimed by another nation.** Sabotage. *Which makes it not an event at all but
a move, and it belongs to round 5 if it belongs anywhere. Recorded so the boundary is explicit.*

**X38 — A crisis can hit the federation rather than a member.** Round 3 built the federation with a
turn and a budget of its own. **It is the only object in the game that could receive an event and is
not a nation.**

### E. The chain

**X39 — One event can cause the next, and that is the story's actual shape.** The whole backstory is
a chain: secession → war → oil stops → recognition refused → shortages → trust collapses → protests →
martial law → local powers. **Nine links and not one of them is a coincidence.**

**X40 — A chain is just an event whose trigger is another event having fired.** *The smallest possible
implementation, and it needs the ledger, which already records everything.*

**X41 — A chain should be able to run FORWARD, for a nation nobody scripted.** In-tray item 1's second
half. **This is the difference between a backstory and a game**: the same nine links available to any
nation, from any spark, so a player watches their own country do what the United States did.

**X42 — Against X41: a scripted chain is a cutscene and the game already refuses those.** Every crisis
today is triggered by the nation's own condition, which means the world reacts rather than performs.
*A nine-link chain that runs on rails would be the first thing in this game that ignores what the
player does.*

**X43 — The reconciliation: a chain is not scripted, it is just consequences that are legible.** Each
link is an ordinary event whose trigger happens to be the previous link's effect. **Nobody writes the
chain; the player sees one.**

**X44 — A chain needs a memory the player can read.** *"This happened because that happened."* The
ledger already records everything and the game already builds *why* records for every number.

**X45 — Some chains should be breakable and the player should be able to see where.** The point at
which the oil stoppage could have been stopped was the recognition refusal, three links earlier.

**X46 — A chain that crosses borders is the thing the continent has never had.** Every crisis today
fires for one nation and ends there. **Item 1 is asking for the opposite**, and X6 is the cheap
version of it.

### F. Preparation

**X47 — You can insure against a shock, and the premium is the decision.** Money now against a loss
later, at odds you cannot see.

**X48 — You can prepare against a shock by being less exposed.** Diversify your suppliers — which
round 4 measured as worth about **12% on the price** and round 5 called a diplomatic objective.
**Preparation already exists and nobody named it that.**

**X49 — Stockpiles.** The oldest answer to a bad winter, and the game has no storage of any kind.
*Round 4 raised shared storage as a bloc question and did not rule it.*

**X50 — Preparation is a standing arrangement, not an action** — which makes it round 7's problem,
because standing arrangements are what the one-action rule is bad at.

**X51 — You cannot prepare, and that is the point.** A shock you can insure against is a cost; a
shock you cannot is a story. *Against X47–X49 and worth keeping.*

**X52 — A forecast is the middle ground.** You cannot stop it, you can see it coming, and what you do
with two turns' notice is the whole game. *X8 restated as a design principle.*

**X53 — Preparation should be visible to others.** A nation that is obviously stockpiling is a nation
that expects something, which is information — and information is round 7's.

**X54 — The best preparation is a friend.** Which makes every shock an argument for the diplomacy
round's objects, and gives blocs a reason to exist that is neither trade nor defence.

### G. The backstory and the newspaper

**X55 — The backstory is told as dated events in an opening edition.** In-tray items 1 and 5. **Today
it is a blurb and three sentences against a page of story.**

**X56 — The opening edition is a newspaper front page, dated 1 March 2036.** F14 already asks for a
turn to arrive as news rather than a number; this is the same idea pointed at turn zero.

**X57 — Each nation gets a different front page.** The same events, reported by somebody with an
interest. *The cheapest way to make sixty-one nations feel like sixty-one countries.*

**X58 — The backstory's events are real entries in the ledger, back-dated.** The game already
back-dates grudges into the memory list at turn zero; **this is the same trick pointed at the
journal**, and it would mean a player could scroll back before the game began.

**X59 — The bicentenary is turn 1 and nothing marks it.** X24. **Two hundred years since Texas
declared itself a nation, five governments each claiming to be that Texas, and the game says
nothing.**

**X60 — The Panama Canal closing is F12 and it is already in the game's arithmetic** — two seas that
do not connect — **with nowhere to say so.**

**X61 — An event is the only place this game has to put prose.** Everything else is numbers with
explanations. *Which makes the deck the narrative surface, and twelve rows a small surface.*

**X62 — The newspaper should report other people's events, not only yours.** Today a crisis is a card
for the nation it fires for. **A continent where you read about your neighbour's harvest failing is a
different game from one where you do not** — and it is information, so round 7 has a say.

### H. Frequency and the deck

**X63 — Three crises a game is too few and the deck should be seen.** Finding C. *Raising the per-turn
cap is the only lever; the cooldowns are not binding.*

**X64 — Against X63: rarity is what makes a crisis an event.** The tuning note says so in as many
words. **The answer may be more rows rather than more draws.**

**X65 — A shock and a crisis should have separate budgets.** Twelve crises tuned to be rare, and
shocks on a different clock entirely — because a world shock that fires once every twenty turns for
one nation is not a world shock.

**X66 — The deck should grow with the game.** Events that only become available after certain things
have happened — a bloc exists, a nation has been conquered, somebody is a pariah. **Rounds 4 and 5
have just created six new objects and the deck knows about none of them.**

**X67 — Weight by drama, not by probability.** The draw is weighted today. *Whether a rare event
should be rare because it is unlikely or because it is precious is a real question and nobody has
asked it.*

**X68 — A nation should be able to have a quiet decade.** And the player should notice that it was
quiet.

### I. Shocks that come from the player's own side

**X69 — Your own crisis is somebody else's shock.** X6 from the other end. **The player who causes a
continental shortage by winning a war should be told that they did.**

**X70 — An event can report a consequence you caused and did not see.** The game computes far more
than it shows. *An event is the cheapest possible window onto it.*

**X71 — A shock can arrive because of a decision you took twenty turns ago.** The game already has
dated, decaying memory. **Nothing currently reaches back that far and says so.**

**X72 — The AI should be shocked too, visibly.** It already answers crises from what it is worst at.
*A player who can see that a rival is having a bad year has been handed a diplomatic opportunity.*

**X73 — An event that fires for two nations at once, with opposite options.** The border incident from
both sides. **The first genuinely two-sided object in the game.**

**X74 — Some events should have no options at all.** X26. *The world telling you something, rather
than asking you.*

---

## 6. Findings

| | | State | Owner |
|---|---|---|---|
| **E** | ⚠ **Ruling 1 needs the delivery mechanism changed.** An event fires for exactly one nation and at most three fire across the roster per turn; a blast radius addresses many at once. **At today's cap one winter would take three turns to deliver.** Shocks need to address a set of nations and to have a budget separate from the crisis deck's. §8 ruling 1 | **OPEN, and it is what ruling 1 costs** | **The architect** |
| **F** | **The model has no coordinates anywhere** — counties carry name, state, population, output and votes, and nothing in the data has a latitude, longitude or centroid. **So ruling 1's radius is measured in adjacency hops, not miles.** *The same absence the transit work hit, where nothing has a length* | **OPEN.** A route is named and it is cheap; buying real coordinates instead is a choice | **The architect** |
| **B** | ⚠ **A world shock is not expressible.** Every one of the fourteen facts a trigger may read is about the nation the event fires for; there is no world state of any kind. §3b | **CLOSED by ruling 1** — a shock is true of a PLACE, not of a world, so no world object is needed. *What it costs instead is findings E and F* | — |
| **A** | ⚠ **Round 4's handover says a bad winter "needs nothing new to land." Read carefully, it needs two things.** The *bands* it refers to belong to the designed economy, which has never run; and **the built effect vocabulary has no sector or resource term at all** — eight effects, all national stocks. §3c | **OPEN.** Not a contradiction, a scope correction | **The architect.** The vocabulary gains a term or the shock lands elsewhere |
| **C** | **A player meets the crisis deck about three times in a sixty-turn game**, from a deck of twelve — arithmetic from the tuning file. Three quarters of the authored content never reaches a given player, and **the per-turn cap, not the cooldowns, is the binding constraint.** §3d | **OPEN** | **This round** for whether it matters; the architect for the number |
| **D** | **The deck knows about none of the six objects rounds 4 and 5 created** — sectors, deals, corridors, blocs, vassals and recognition claims. Four of them did not exist when the effect vocabulary was written. X29–X38 | **OPEN** | **This round**, then the architect |

---

## 7. Scenario 6, traced — "a bad winter"

*Written after the idea bank and before any ruling, which is the order round 5 proved.*

**The scenario, as the ideation plan set it:** *"Nobody chose it, everybody feels it, and it lands
differently on a nation that feeds itself than on one that buys. Written last, because it is only
interesting once there is something for it to hit."*

**Traced against the built game.**

### It fails at the first word: "everybody"

**There is no way to make one thing true for more than one nation.** §3b. An event fires for a single
nation, chosen from at most three across the roster in a turn. **A winter that hits everybody would
have to be sixty-one separate draws**, which the per-turn cap of three forbids outright — *it would
take twenty turns to deliver one winter.*

### It fails at the second phrase too: "lands differently on a nation that feeds itself"

**The whole point of the scenario is the difference between the self-sufficient and the dependent.**
Under round 4's ruling 2 there is **one national pot**, and under §3c the effect vocabulary has **no
sector, no resource and no supply term** — so the only winter this game can express is *"quality of
life falls by some amount"*, which is identical for the farmer and the importer.

⚠ **So the scenario as written cannot be told, and neither half of the failure is this round's to
fix alone.** *The first half needs a world, or a way to address many nations. The second needs the
economy's designed model to be built and the effect vocabulary to reach it.*

### What CAN be told today, and it is worth saying

**A bad winter as a national quality-of-life shock with three options** — buy at any price, ration
it, or let the market handle it — **already exists. It is called *the harvest fails* and it is row one
of the deck.** *The scenario's cheap version is built; its interesting version needs two things the
round does not own.*

### The interesting version, and the cheapest route to it

**The route is X6:** *there is no such thing as a shock; there is only somebody else's crisis reaching
you.* A bad winter in the farm belt is one nation's harvest failing — which the deck already does —
**and the continent feels it because that nation stops selling grain.** No world state, no multi-nation
delivery, no new trigger vocabulary: **the shock travels along the trade network that round 4 and the
transit work already built.**

**Under X6 the scenario narrates:** Iowa's harvest fails and it stops exporting. Its customers lose a
supplier, which round 4 measured as worth about **12% on the price** in the other direction. A nation
with three suppliers shrugs. **A nation with one goes hungry — and it goes hungry because of a choice
it made about who to trade with, twenty turns earlier.** *That is the scenario's own sentence — it
lands differently on a nation that feeds itself — arriving out of arrangements rather than out of a
new mechanic.*

**⚠ It still needs one thing this round does not own:** for a failed harvest to stop exports, the
crisis must be able to reach a trade deal, and **§3c says no effect can.** *That is finding D, and it
is one new effect rather than a new system.*

### What the player does on a Tuesday, with one action

**Nothing — and that is the answer, not a failure.** **An event is the one thing in this game that
hands the player a decision without spending their action.** Politics ruling 12 already opened that
door for a movement's demands and recorded it as a deliberate exception *"precisely because every
other component will now want the same channel."*

**So what round 6 owes round 7 is not another verb. It is the rule about when a decision is free** —
and the honest observation is that **an event is the strongest candidate for free there is**, because
the player did not choose to be asked.

---

## 8. Rulings

### Ruling 1 — A shock has a blast radius on the map. It hits the ground, and the ground tells the nations

**RULED 14 September 2026.** *"A shock has a blast radius on the map."* — answering spine question 1
and in-tray item 3, and closing **finding B**.

**A shock happens somewhere and reaches everything near it.** A hurricane on the Gulf, a drought
across the plains, a freeze in the north. **It is not addressed to a nation at all** — it is addressed
to ground, and whichever nations hold that ground find out.

**This is the answer that needs no world.** Finding B said a world shock has nothing to be true *of*;
ruling 1 replies that it is true of **a place**, and the game is built on a real county map. *No world
object, no continental facts, no new layer above the nations — the thing that already exists is the
thing the shock is true of.*

**Rejected, and all three were put to him.** Somebody else's crisis reaching you down the trade
network (X6), which was the cheapest and makes arrangements decide who suffers. A world with facts of
its own (X21), the most faithful to the story and the most to build. And a shock that hits everyone
sharing a property — a port, a bloc, a supplier (X5). **Aaron took the most physical of the four**,
and it is the only one where the map itself decides.

### ⚠ Two things it costs, both found by checking rather than assuming

**1. The model has no coordinates. A radius must be measured in adjacency, not in miles.** Verified
this session: counties carry a name, a state, population, output and votes, and **nothing in the
model data has a latitude, a longitude or a centroid anywhere.** *The same absence the transit work
already ran into — it recorded that nothing has a LENGTH, so a 16-mile sea crossing costs what a
2,578-mile one costs.*

**What exists instead is adjacency**, county by county, and it is complete. **So a blast radius is
"within N counties of where it started"**, walked outward through neighbours. *That is cheap, it is
already built, and it is honest: it follows the shape of the land rather than a circle drawn on a
projection — a drought that spreads along the plains rather than into the mountains is arguably the
better model anyway.* **Recorded as the route rather than ruled: whether to buy real coordinates
instead is the architect's, and it is not free.**

**2. An event today fires for exactly one nation, and a blast radius addresses many.** §3b and §3d: a
crisis is drawn for a single nation, at most three across the whole roster in a turn. **A shock that
hits the plains hits eight nations at once, which the delivery mechanism forbids** — at three a turn
it would take three turns to tell everybody about one winter. **So ruling 1 requires the event system
to learn to address a set of nations rather than one**, and to have a budget separate from the crisis
deck's. *That is X65, and it is finding E.*

### Ruling 2 — The effect scales with how much of your ground is inside it. Default taken

*Answering the obvious next question — a shock lands on ground, but every effect the game has is a
national stock.*

**A nation feels a shock in proportion to the share of its ground the shock covers.** A nation with
three of its forty Areas in the drought feels a fraction of it; a nation whose whole territory is
inside it feels all of it.

**Why this is the default and not a product judgement.** It **respects round 4's ruling 2** — one
national pot, no regional stocks — which this round may not overturn. It needs **no new effect
vocabulary**: the eight existing effects are simply multiplied by a share. And it delivers the thing
the scenario asked for **without a regional model**: the same winter is a catastrophe for a small
farm state and an inconvenience for a large diversified one, *because of where their ground is.*

**⚠ What it does NOT deliver, stated plainly.** Scenario 6's other half — *"it lands differently on a
nation that feeds itself than on one that buys"* — **is still not answered by ruling 1 or 2.** A shock
that covers your whole territory hits you fully whether you farm or import. **That half belongs to the
economy**: the winter reduces what the plains produce, and the importer feels it through price. *Which
means the scenario needs round 4's designed model built before it can be told, and that was already
true before today.*

---

### Ruling 3 — No chains in play. The nine links are the backstory's job and nothing like them runs forward

**RULED 14 September 2026.** *"No — chains are the backstory's job only."* — closing the second half
of in-tray item 1 and rejecting **X39 through X46** except as history.

**The chain that made this world is told once, at the opening, and never runs again.** A crisis
remains what it is today: **one nation, one turn, and it ends there.**

**Rejected, and the one rejected first is the one worth recording.** The emergent version — *nobody
writes the chain; each link is an ordinary event whose trigger is the last link's effect* — was the
version this document argued for, on the grounds that it gets the drama without putting anything on
rails. **Aaron took the tighter answer**, and the authored nine-step arc was rejected for the reason
the document gave: it would be the first thing in this game that runs on rails, and the rest of it
deliberately refuses to.

**Why the restraint is coherent rather than merely cautious.** Every complaint Aaron has made about
this design for a fortnight has been the same one — there is too much to think about. **Ruling 3 buys
the round's whole remaining scope back**: with no chains there is no chain memory to build, no
breakable link to surface, no *"this happened because that happened"* record, and no risk of a
sequence firing that nobody can stop or explain.

### ⚠ And it settles the taxonomy, which nobody had written down

**Rulings 1 and 3 together give the round exactly two objects, and both are one turn deep.**

| | A **crisis** | A **shock** |
|---|---|---|
| Where it comes from | the nation's **own condition** | a **place on the map** |
| Who it reaches | **one nation** | **everything within the radius** — ruling 1 |
| How long it lasts | one turn | one turn |
| Does it cause another? | **No** — ruling 3 | **No** — ruling 3 |
| Built? | **yes**, twelve rows | **no** |

*A crisis is wide in nothing; a shock is wide in space. Neither is wide in time. That is a small and
completely describable design, which is the point of it.*

### ⚠ What ruling 3 costs, said plainly rather than buried

**1. The oil stoppage cannot be told as what it was.** In the story it is a *consequence* — Texas's war
stopped the gas. Under ruling 3 the game can have **a fuel shock at a place**, which looks the same on
screen and is caused by nothing. *The shape survives; the causation does not.*

**2. Conquest's in-tray item 7 is answered no, and it was somebody else's question.** *"A war that
starts because somebody else's crisis made it"* is a chain across nations by definition. **Round 2 is
closed and cannot argue**, so it is recorded here as answered rather than quietly dropped. *A shock
that makes war more likely by making a nation hungrier is still available; a shock that hands anyone a
war is not.*

**3. In-tray item 1's FIRST half is untouched and still open** — whether the backstory is told as
dated events at all. **Ruling 3 says chains do not run in play; it does not say the opening stays
three sentences.**

### Ruling 4 — The opening is a front page, dated 1 March 2036

**RULED 14 September 2026.** *"A front page, dated 1 March 2036."* — closing the first half of in-tray
item 1 and all of item 5.

**The game opens as a newspaper.** The bicentenary, the war of succession, the oil, the collapse of
trust in Washington, martial law, and the states that went their own way — **the player starts knowing
why the map looks like that**, instead of inferring it from three sentences.

**It is content, not machinery.** A page of prose against the page of story that already exists in
`secession-ideation.md` §8. *Nothing in the engine changes; the writing is the work.*

**Two things it sets up for free.** **F14** — a turn arriving as news rather than as a number — *this
is the same idea pointed at turn zero, and doing it here first means the format exists before the
per-turn version is designed.* And **the bicentenary finally gets said**: the game opens on the eve of
two hundred years since Texas declared itself a nation, with five governments each claiming to be that
Texas, and today it says nothing about it.

**Rejected, and the near miss is worth recording.** *A different front page per nation* — the same
events reported by somebody with an interest, so Austin's page and Dallas's disagree about who the
traitor is. **Aaron took the single page.** *It is one page of writing rather than sixty-one points of
view, and the per-nation version stays available later at the cost of prose alone — no mechanism
stands between here and there.*

### Rulings 5–7 — three defaults, closing the round's remaining items

*Batch treatment, as rounds 3, 4 and 5 all used. Each has a precedent or follows from a ruling
already made today, none is a product judgement, each is one line to reverse.*

#### Ruling 5 — The effect vocabulary stays closed. It gains only what ruling 1 forces

*Answering **finding D** — the deck knows about none of the six objects rounds 4 and 5 created.*

**The eight effects stand, and an event still may not reach a sector, a deal, a corridor, a bloc, a
vassal or a recognition claim.** The only addition is whatever ruling 1's blast radius requires, which
is a way of addressing ground rather than a new thing to move.

**Why the default is *no* and not *yes*.** **Ruling 1 removed the reason to say yes.** The trace's
interesting version of a bad winter needed an event to reach a trade deal — but that was under X6,
where the shock travels the trade network. **Under a blast radius the shock reaches the ground
directly and the economy carries it onward**, so the new effect the trace asked for is not needed.
*X29 to X38 stay on file as ideas, unbuilt, and the six objects are listed there for whoever extends
the vocabulary later.*

#### Ruling 6 — Shocks get their own budget; the crisis cap stays where it is

*Answering **finding C** — a player meets the deck about three times in a sixty-turn game — and
**finding E**, which is what ruling 1 costs.*

**Two budgets, not one.** The crisis deck keeps its cap of three a turn across the roster and its
cooldowns; **shocks are counted separately**, because a world event rationed to three nations a turn
is not a world event. *This is X65, and ruling 1 makes it necessary rather than optional.*

**Whether three crises a game is too few is left open on purpose.** It is a number, numbers are the
architect's, and **the structural half is what this round owes**: the per-turn cap is the binding
constraint and the cooldowns are not, so **raising the cap is the only lever that changes how often
anything happens.** *Recorded so nobody spends an afternoon adjusting cooldowns.*

#### Ruling 7 — The three half-built items are closed as already owned elsewhere

*Clearing in-tray items 2, 4 and 6.*

- **Item 2, protests at the capital** — **closed.** Two cousins already exist in the deck, *the
  veterans march* and *they arrested the wrong person*. *The story's version happens at the capital
  specifically, and the game has no notion of a capital as a place an event can target; that is a
  refinement, not a gap.*
- **Item 4, a neighbour comes apart and the people who arrive carry their politics** — **half closed.**
  The event exists. **The carrying half is migration's**, which round 1 deliberately placed inside
  secession, and migration is built and moves people toward people who think as they do. *Nothing here
  to build; the two systems already meet.*
- **Item 6, shocks that land on grievance** — **closed, and it was already built.** `sentiment` is one
  of the eight effects and deliberately moves **movements already present** rather than inventing one.
  **Ruling 2 now scales it by the share of ground inside the shock**, which is the geographic version
  secession was asking for.

---

## 9. The handover

**The round is NOT closed — Aaron closes rounds.** Seven rulings, seventy-four ideas, six findings,
scenario 6 traced, and the in-tray empty: **nine items in, nine answered.**

### 9a. What this round decided, in one table

| | |
|---|---|
| **1** | **A shock has a blast radius on the map.** It is addressed to ground, not to a nation — so no world object is needed, and **finding B is closed** |
| **2** | **A nation feels it in proportion to the share of its ground inside it.** No regional stocks, no new effects, and round 4's national pot is respected |
| **3** | **No chains in play.** The nine links are the backstory's job. A crisis stays one nation, one turn, and ends there |
| **4** | **The opening is a front page, dated 1 March 2036.** Content, not machinery |
| **5** | **The effect vocabulary stays closed**, because ruling 1 removed the reason to open it |
| **6** | **Shocks get their own budget**; the crisis cap stays, and the cap — not the cooldowns — is the lever |
| **7** | **Three half-built items close as already owned** by the deck, by migration, and by `sentiment` |

**The shape of it: this is the most restrained round of the six.** *Two objects, both one turn deep,
one new addressing mechanism, and a page of prose. Everything else on the table was declined.*

### 9b. What the alpha needs from this round

**Nothing, and it is the second round running where that is the honest answer.** The alpha tests trade
deals, transit and the route map. **No ruling here touches any of them.**

**The one row worth a sentence:** ruling 4's front page is **prose with no engine work behind it**, so
it is the cheapest thing in either of the last two rounds and it is the first thing a new player
meets. *That is an observation for the build-order stage, not a recommendation — the cutting is
Aaron's and the build order's.*

### 9c. What round 6 leaves the rounds after it

| To | What |
|---|---|
| **Round 7 — the things above** | **An event is the strongest candidate for a FREE decision there is**, because the player did not choose to be asked. Politics ruling 12 already opened that door for movement demands and recorded it as a deliberate exception *"precisely because every other component will now want the same channel."* **Round 6 is now formally asking for it** — and it is the one component whose claim does not compete with the others, because it arrives unbidden. **Also: F14**, a turn arriving as news, which ruling 4 has just built the format for |
| **The architect (stage 3)** | **Finding E — ruling 1's delivery mechanism.** An event fires for one nation today; a blast radius addresses many, and shocks need their own budget (ruling 6). **Finding F — the model has no coordinates**, so the radius walks adjacency; whether to buy real coordinates instead is a choice and it is not free. **Finding A** — the effect vocabulary has no supply term, so round 4's *"a bad winter needs nothing new to land"* is a statement about the designed economy and not the built one |
| **The design stage** | **What a shock looks like on screen.** Ruling 1 makes the first event in this game that is about a *region of the map*, and the map is the thing the player reads. *A crisis is a card; a shock is a card and a shape* |
| **The writer** | **Ruling 4's front page**, against the page of story in `secession-ideation.md` §8 — the bicentenary, the succession war, the oil, the collapse of trust, martial law, the states that went their own way |
| **Conquest, answered rather than asked** | **In-tray item 7 — a war that starts because somebody else's crisis made it — is NO**, by ruling 3. Round 2 is closed and could not argue, so it is recorded rather than dropped |

### 9d. The two things this round would tell the next one

1. **Trace the scenario before the rulings, not after.** §7 was written *before any ruling was made*,
   on round 5's evidence that tracing finds what rulings miss. **It found both halves of scenario 6
   failing** — no way to make one thing true for many nations, and no way to make a winter mean
   something different to a farmer than to an importer — **and ruling 1 was then made against a known
   problem rather than in the abstract.** *That is the first round to work in that order and it was
   plainly better.*
2. **A restraint ruling buys more scope than a clever one.** Ruling 3 declined chains and **deleted
   the entire remaining second half of the round** — no chain memory, no breakable links, no *"this
   happened because that happened"* record, no sequence firing that nobody can stop. *The round got
   smaller and nothing that matters was lost.*
