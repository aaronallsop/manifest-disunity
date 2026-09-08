# Military conquest — ideation (round 2)

**Status: OPEN. Opened 7 September 2026.** Round 1 (secession) closed with 53 rulings and six
findings; this round inherits twelve questions from it and owns four of the nine pressures that
decide whether a region turns against the country holding it.

**Nothing in this document is judged or decided.** Contradictions are correct at this stage. Ideas
are numbered **C1** upward and are added, never cut — a design pass that cuts during ideation
destroys the material design works from (D180). Rulings from Aaron are numbered and dated as they
are made.

---

## 0. The frame, ruled by Aaron on the day the round opened

> **"This isn't a war game. I don't want this to be a game of just war and conquering, where
> economics and diplomacy help your war effort. I want a game where war impacts your economy and
> your diplomacy and your internal relations, and they all interact."** — Aaron, 7 September 2026

**This is the sentence every idea in this round is measured against**, and it points the arrows the
opposite way to how a strategy game usually points them. Conquest is not the thing the other systems
serve. It is a thing that *happens to* the other systems. An idea in this document earns its place by
what it does to the economy, to the neighbours and to your own people — not by how well it wins wars.

Recorded as **D181**, and as rulings 1 and 2 in §6.

---

## 0a. The three things written at the top of every round

**One action per nation per turn, and it ends the turn.** Six components compete for one slot. Any
idea below that assumes a decision every turn has taken that turn away from the other five, and this
round has to say so out loud. §L is where that debt is counted.

**The board and the six ideologies are fixed.** Geography is baked from federal data. If this round
finds itself wanting to change either, that is a finding worth stopping for.

**Every quantity says where its number comes from** — measured from a named file, invented as a
placeholder, or still to be asked about.

---

## 1. What conquest already is, and it is more than it looks

Verified against `DESIGN.md` and, where marked, against the running code on 7 September 2026.

| | What exists |
|---|---|
| **Force** | **One derived number** — manpower × equipment × doctrine, from population, wealth per head, and how well the state governs. Nothing about it is stored except **where it points** and how ready it is |
| **The allocation** | Three ways to point it: **Garrison** (quiet at home, paid for in civil liberties), **Border** (expensive to attack), **Field** (your own attacks landing). Readiness follows the allocation slowly — measured: a one-turn switch to Field reaches **under 60%** of a standing posture |
| **Taking ground** | **Annex**: adjacent Areas, hard cap of **3 a turn** whether you are a minnow or a superpower, a price per Area and per head, a cooldown, and neighbours more than **4× your size** on both population and GDP are untouchable |
| **The risk** | A **civil war** inside the attacker, triggered if the annexation flips your leading ideology or if what you took is bigger than **15%** of what you held. Dice, then victory / partial / fall apart. Measured across 52 triggered wars on the real opening board: **30.8 / 30.8 / 38.5** |
| **Merging** | **Unite**: a peace roll on population, GDP share and the ideological distance between the two governments. Failure fractures *you* — Areas defect to the target if they sit closer to it politically, or secede if cut off |
| **How far** | **Reach**: a bounded search out from **one** core — your seat of government, or your largest Area if you have lost it. Entering an Area costs 1.0 across open country, 0.72 on an interstate, 0.58 on rail, 0.34 through a rail hub (there are **76** in the whole country). Foreign ground costs **2.2×**. It prices the attempt, weakens the army, and past a limit refuses the move outright |
| **Being ganged up on** | **Coalitions**: threat is size share × (1 − influence), so being big is not the crime. Costs the target money every turn and puts its members' border armies in the way of the next annexation |
| **Holding** | **Occupation upkeep** = base × (1 + hostility) × (1 + count^α). The count term is superlinear — 25 occupied Areas roughly doubles the bill, 100 costs about 5×, 400 about 24× |
| **The cost at home** | **War weariness** is a stock of its own with a floor of zero. It rises with wars fought, ground taken and civil wars, and **falls only with peace**. Quality of life, civil liberties and the electorate all read it |
| **Memory** | One append-only, dated, decaying, **directed** list. Warred, annexed, lost, broke. Every relationship in the game is a query over it |

**Round 1 asked conquest for four things and three of them already exist:** war weariness that rises
with fighting and falls only with peace ✅; occupation resented in proportion to who was taken ✅; one
machine for making nations, shared between a civil war and a declaration ✅. **The fourth is missing:
a garrison that holds ground down *and radicalises it*.** Today suppression only subtracts. See C23.

### 1a. The thing that is actually missing, verified in the code

**There is no war. Taking ground is a purchase.**

Traced through the annexation move on 7 September: the price is paid, the reach check passes, the
cooldown clears — and unless a civil war fires **inside the attacker**, the ground changes hands with
no roll of any kind. The defender's Border allocation, its readiness, its armed population and its
willingness to fight are read **only** as a multiplier on the attacker's own civil-war score. If that
war does not trigger, the defender is never consulted.

So a nation of three Areas with its whole army on the border and a hostile, well-armed population is,
mechanically, a shop. The four-times-your-size shield is the *only* thing that has ever stopped a
purchase, and it protects the big from the bigger.

**This is the centre of round 2 and most of the ideas below hang off it.**

---

## 2. The idea bank

### THE SPINE — seven states a pair of nations can be in (Aaron, 7 September, ruling 2)

**This replaces "is there a war" with something better: two nations are *always* in one of seven
named states, and war is only one of them.** Aaron's list, in his words, ordered from least
constrained to most:

| | What it means |
|---|---|
| **Peace** | You can do anything with the nation |
| **Peace-treaty** | You signed a treaty with stipulations — trade, territory, repayment. **Breaking it has a huge impact** |
| **Hostile** | Things have happened that bring you close to war without being at war. It has impacts |
| **Cease-fire** | **All the impacts of war, but you cannot attack** |
| **War** | Trade is prohibited and you may attack |
| **Subject** | *Deferred by Aaron — later* |
| **Allied** | *Deferred by Aaron — later* |

**Why this is stronger than the thing it replaced.** I proposed a war object. What Aaron ruled is a
*relationship*, which is the same shape as everything else in this game that has worked: recognition
is a standing directed fact, a trade deal is a standing contract, a coalition is a standing set of
named nations. A pair's state is one more standing fact, and every other system can read it.

**And it does the thing the frame demands** — none of these five states is about fighting. Four of
them are about what you are *not allowed to do*, which is exactly how war reaches an economy.

**C55 — Peace is the default and costs nothing to store.** Recognition already works this way: a
directed fact written down only where it is not the default, so the table is empty on turn 0 and
never grows to n². Sixty nations at peace is an empty table.

**C56 — The transitions are the game, not the states.** Each state is a short list of prohibitions;
what is *interesting* is what moves a pair from one to the next, and there are three different kinds
— one you **choose** (declare), one you **earn** without choosing (hostility accumulating from things
you did for other reasons), and one you must **negotiate** (a cease-fire, a treaty). A game where
you can slide into Hostile without ever deciding to is a game about consequences.

**C57 — Declaring war breaks live contracts, and there is already a ruling about that.** Trade is a
standing deal with a term of 2, 4, 8 or 20 turns. If war prohibits trade, then declaring war on a
partner **breaks a signed agreement** — and Aaron has already ruled (Control Board, 5 September) that
breaking a deal early damages your reputation, makes other nations warier of dealing with you, and
raises what they ask, cooling over time. *So the economic price of a war arrives on the day it is
declared, before a shot, and it is machinery that already exists.* This is the frame working.

**C58 — A cease-fire needs a clock or nobody ever leaves it.** If a cease-fire carries all the costs
of war, it is a waiting room and not a destination — which is right. But two AI nations will sit in
one indefinitely, both bleeding, unless it either expires into war, expires into peace, or presses
both sides toward a treaty. My instinct is that it should **expire**, and that whichever side lets it
expire wears the blame.

**C59 — Hostile is where most of this game will actually live**, and it is the state Aaron invented
that no standard model has. Nobody is shooting, so nothing is dramatic — and yet it should be the
state that costs the most *cumulatively*, because it is the one you spend decades in with the
neighbour you dislike. Candidate causes: taking ground near them, sponsoring a movement inside them,
refusing to recognise them, shutting a corridor they depend on, guaranteeing their enemy, or simply
joining the coalition against them.

**C60 — A peace-treaty's stipulations are the first standing obligations in the game.** Ground ceded,
a sum repaid over N turns, a trade at a fixed rate, a promise not to return. `DESIGN.md` names
"treaties honoured and broken" as an Influence term that was never built because no treaty object
existed. This is that object, and Aaron's "huge impact" is that term finally having something to
measure.

**C61 — Your own people have an opinion about who you are at war with.** The frame says internal
relations must feel it. A war against a neighbour your population feels kinship with is a different
war from one against a stranger, and the ideological affinity that decides everything else in this
game can decide this too, at no cost.

**C62 — The state is what the neighbours read.** A coalition should form out of states rather than
out of size alone: three nations Hostile to you is a fact about the world, and it is legible in a way
"size share × (1 − influence)" never is.

**C63 — The state belongs on the map, in one glance.** Sixty nations, five colours, and the player
can see the shape of the continent's temper without opening a panel.

**C64 — Whether a state is shared or one-sided is not the same answer for all seven.** War and a
cease-fire and a treaty are things two nations are *in together*. Hostile is a feeling and feelings
run one way. Subject runs one way by definition. *Open — see the questions in §8.*

---

### THE SPINE, continued — the rest of what makes a pair hostile

*Ruling 4 gave five causes and invited more. These are the additions, and the first is the largest.*

**C65 — The board does not open at Peace, and ruling 4's second cause says how many pairs do not.**
Derived from round 1's ruling 19, which named the four reunification contests and who may win each:

| Contest | Claimants | Hostile pairs it creates |
|---|---:|---:|
| **A Free Texas** | the five Texan successors — Dallas, Houston, San Antonio, Austin, El Paso | 10 |
| **California Republic** | the five Californian successors | 10 |
| **The Confederacy** | the Deep South, the Carolinas, the Gulf nation, Appalachia, Central Florida | 10 |
| **The Thirteen Colonies** | Washington D.C., Philadelphia, New York City *(Boston out, ruling 20)* | 3 |
| | | **33** |

**Thirty-three pairs of nations open Hostile on cause 2 alone**, out of 1,081 possible pairs on a
47-nation board — about 3%, and every one of them a story somebody can name. *Derived from ruling
19's stated claimant fields, not measured from data; the five Californias are counted there but never
named individually, so that row is a count and not a list.*

**And that is before the wars that already happened.** Houston holds western Louisiana. The federal
army marched into West Virginia. Chicago took north-west Indiana. The Gulf nation took the Florida
panhandle for Pensacola. **A war that ended two years ago does not leave two nations at Peace** — it
leaves them Hostile, or in a treaty one of them resents. *This is C46 upgraded: the opening board
should be seeded with states, not only with memories.*

**C66 — Refusing to recognise them.** Recognition is built, directed, and stored only where it is not
the default. A nation you will not admit exists has an obvious and permanent reason to be hostile to
you — and the game already measures that giving in is worth more than everything else combined.

**C67 — Cutting off their way out.** Fourteen of the nations have no port and no foreign border and
reach the world only across a neighbour's ground — measured. Shutting a corridor on one of them is
close to an act of war, and `DESIGN.md` records that **no AI nation has ever closed one**: the
machinery is symmetrical and only the player uses it. Ruling 4's cause 3 is the reason sixty nations
have been waiting for.

**C68 — Several nations eyeing the same unclaimed ground.** New Mexico's remainder is prey to El
Paso, Oklahoma, the Navajo Nation and the Front Range Republic at once. Rivals before anybody moves,
and the same shape as cause 2 pointed at ground rather than at an inheritance.

**C69 — A garrison standing on ground somebody else calls home.** Appalachia holds all fifteen of
West Virginia's Areas and Franklin's homeland reaches into six states. Occupying ground that is
another nation's founding grant is cause 1 with soldiers on it.

**C70 — Sheltering the people who fled them.** Migration is built and moves people toward people who
think as they do. A nation collecting its neighbour's refugees is a fact the neighbour can resent.

**C71 — Their government changed, and it changed away from you.** Elections are built and can swap a
nation's ruling ideology. A neighbour swinging far from you is a diplomatic event that nobody chose
and nobody can be blamed for — which makes it the purest possible expression of ruling 1.

---

### THE SPINE, continued — the ladder is a justification scale

**C72 — What it costs you to attack somebody depends on the state you were in when you did it, and
this is what makes the whole spine pay for itself.** *(Claude, 7 September, after ruling 7.)*

The five states are not only a machine for tracking who is fighting whom. Read the other way, they
are **a scale of how defensible your aggression is** — and the game already has three places to
charge you: your standing abroad, your own people's tolerance, and the neighbours' willingness to
gang up.

| You attack somebody you were… | and it reads as | so it costs |
|---|---|---|
| **Hostile** with | the thing everyone saw coming | least — you have a grievance on the record, dated, that the game can name |
| At **Peace** with | an outrage | a great deal — you had no quarrel and you started one |
| in a **Peace-treaty** with | **a betrayal** | most — this is Aaron's "huge impact", and it is the top of this ladder rather than a separate rule |
| in a **Cease-fire** with | breaking your word while the guns were quiet | most, and arguably worse than a treaty, because a cease-fire is the moment you were trusted |

**Why this is worth having.** It answers three loose questions with one mechanism: what breaking a
treaty costs (the top of the scale), why anybody would bother spending years being *seen* to be
provoked (it makes the eventual war cheap), and what Hostile is actually *for* beyond being a mood —
**it is the state you manoeuvre into before a war you intend to fight.** A player who understands that
is playing diplomacy in order to make a war affordable, which is ruling 1 read backwards and is
exactly the game Aaron described.

**And the game already has the ledger to charge it to.** Influence falls with conquest scaled by how
much standing you had; the memory list is dated and decaying; a coalition forms out of who resents
you. Nothing new is needed to *pay* for this — only something that says how much.

**C73 — Which of the three a cease-fire falls into is what the cease-fire is FOR.** A cease-fire is a
timed negotiation with all of war's costs running while it ticks: agree terms and you leave by
peace-treaty, agree to disengage without terms and you leave hostile, agree nothing and the guns
restart. **The default on failure is war, and that is the pressure that makes the window mean
something.** *Proposed, not ruled — see §8.*

---

### A. What a war *is*

*Ruling 1 settled the shape: a war is a standing state, not an event. What follows are the ideas
about the state numbered 5 on the spine above.*

**C1 — A war is a standing relationship with a term, exactly as a trade deal is.** The best
structural idea the economy alpha produced was making trade a *standing contract* rather than a
click. War is the same shape: you enter it, it persists, it bills both sides every turn, and it ends
by treaty, by exhaustion or by conquest. This makes weariness something you *live in* rather than a
tax you pay at the till, gives diplomacy something to mediate, and — critically — gives the player
something to decide every turn without spending the single action.

**C2 — You do not declare war on a nation; you declare it *for* something.** War aims named at the
outset: these four Areas, that port, the release of a client, the return of what you lost. Three
things fall out of it. The AI knows when to accept peace. The coalition knows how alarmed to be — a
war for two border counties is not a war for the continent, and today the model cannot tell them
apart. And the player gets a victory condition smaller than annihilation. *Limited war is what stops
every conflict being existential, and nothing in the game currently permits one.*

**C3 — A front, not unit counters.** The war has a *front*: the Areas where the two touch, plus
wherever either has pushed. Each turn the front moves by a roll driven by force committed, reach,
terrain, readiness and what is standing on the ground. Ground changes hands along the front only.
This keeps the hard-won "no stacks, no tokens" simplicity and makes a war take **time**, which is the
one thing an instant purchase can never do.

**C4 — Annex stays, but shrinks to what it honestly is: a fait accompli.** Keep it for the
undefended, the tiny, the willing and the stateless. Anything that can resist has to be fought for.
The 4× shield already gestures at this line; C4 draws it properly.

**C5 — Peace has terms, and the terms are the first treaty in the game.** `DESIGN.md` names
"treaties honoured and broken" as one of two Influence terms that were never built because no treaty
object exists. A peace is the natural first one: ground ceded, an indemnity, a demilitarised strip, a
promise not to return for N turns. Breaking it is the Influence hit that has been waiting for
something to measure.

**C6 — Exhaustion ends the wars the players will not.** Past a weariness threshold the government
faces a crisis — the twelve authored crises already work this way — and must accept a white peace or
pay in Authority and liberties. A war neither side can end is how a strategy game becomes a chore.

**C7 — War is the reason to close a corridor, and the machinery is already built and unused.**
Declaring breaks your trade deals with the enemy and revokes their transit across your ground.
`DESIGN.md`'s own list of gaps says *"No AI nation ever closes a corridor"* — the decision exists and
only the player uses it. War gives sixty nations a reason.

**C8 — Blockade.** Fifteen river chokepoints and two seas exist as economic objects and none of them
can be shut in anger. Standing on a chokepoint is the cheapest possible act of war and the most
legible on a map.

**C9 — Raid without conquest.** Hurt without holding: burn a season's output, break a rail hub, cost
them a corridor for four turns. For a nation too small to take ground and too angry to do nothing.

**C10 — A war can be lost.** Today the worst outcome of aggression is that you fracture. There is no
mechanism by which the *defender* takes ground back, which means defence can never be profitable and
no nation will ever spend on Border for its own sake.

### B. Where the army is

**C11 — Force gets a *theatre*, not a location.** The three-way allocation gains a direction: your
Field army points at one neighbour, and turning it takes a turn or two through the readiness limit
that already exists. A nation fighting on two fronts is genuinely worse off, and "the army is
somewhere else" becomes true with one new number rather than a map layer. *This is the minimum change
that answers inbox question 3.*

**C12 — Some of the army is not here at all.** The federal army opens "stretched thin across the
world". A share of force that is unavailable at turn 0 and returns over N turns — or never returns,
because it dispersed. See also C48.

**C13 — Reach already decides how far a front can advance and nobody has said so.** The same number
that prices an annexation and weakens the army should cap how fast a front moves. One number, three
jobs, no new model.

### C. The ground itself

**C14 — The road network we already baked *is* a terrain model, upside down.** An Area that costs 1.0
to enter is open country; one that costs 0.34 is a rail hub. **Invert the movement cost into a
defence value** and terrain arrives for free, derived from data already on disk, with no new bake and
no invented numbers. *This is my recommendation over a real elevation bake, and it is worth saying
plainly: a ruggedness dataset is a week of work to make the Tetons hard to invade, and the road
network makes them hard to invade today because nothing crosses them.*

**C15 — Rivers are defensive lines.** Fifteen chokepoints exist. A contested crossing is the oldest
military fact there is and it costs nothing new to model.

**C16 — Cities are the expensive part.** Density raises what it costs to take an Area and what it
costs to hold it. Rapid City is 190,000 of the Lakota Nation's 271,000 people and round 1's whole
Lakota problem is a city question.

**C17 — The armed share is a defence value and it has already been measured.** Round 1 computed it
from RAND state ownership rates apportioned to counties by settlement density: **8.9%–65.0%, median
40.0%** (DC absent from the dataset and assigned 6% by hand — invented, and it must carry the est.
badge). Today it is used only for resisting *occupation*. A county that is 65% armed and hates you is
also a bad place to march into, and that costs nothing to say.

**C18 — Ground you have already fought over is harder the second time.** A war leaves the Areas it
crossed damaged: less output, more grievance, and cheaper to take next time or dearer, depending on
which way we want the story to run.

### D. Things worth a war

**C19 — A short authored list of places, not a general asset system.** Pearl Harbor. Pensacola.
NORAD and Cheyenne Mountain. Norfolk. San Diego. Bremerton. Groton. The Nevada and Utah arsenals.
Each grants something concrete and each is a war aim you can point at. This project is good at
authored content and this is the cheapest way to make the map *legible* — players learn where matters
by losing to it once. *Inbox question 4 asked whether bases exist as things to hold and lose; this is
the smallest version that answers yes.*

**C20 — An asset can be destroyed instead of surrendered.** Denying the prize, at the cost of never
having it yourself.

**C21 — The navy was cut in two by the shut canal, and the map already knows.** Two seas, the Panama
Canal closed between them. A fleet as a per-sea pool follows directly, and it is what makes Hawaii
and Alaska anything other than decorations.

**C22 — Nuclear weapons.** Written down because the United States has them and a break-up is the
exact scenario in which somebody asks. It is also an entire game of its own and probably belongs in
`FUTURE-IDEAS.md`. **The one thing it must not be is silently dropped** — that is the mistake D180
exists to prevent.

### E. What it costs to hold

**C23 — A garrison buys quiet today and sells the next decade.** Round 1 asked for a garrison that
holds ground down *and radicalises it*, and today suppression only subtracts. The mechanism: the
garrison lowers the movement's share now and raises **the Area's own authored grievance** — the one
term in the whole sentiment formula that belongs to the *place* rather than to whoever holds it. You
are buying peace on credit, and the bill arrives after the government that borrowed has gone. *This
is the single cleanest expression of the game's thesis available anywhere in this round.*

**C24 — Resistance is a war that does not end.** Occupied ground with a high armed share and a poor
ideological match drains money, force and weariness continuously rather than once. An insurgency with
no new machinery: it is the occupation formula plus a weariness term.

**C25 — Loyal ground needs no garrison, and that is the reward for a legitimate founding.** Round 1
ruling 16: a nation founded by a movement holds ground that will not defect. It should also be ground
that costs nothing to police — which makes conquest structurally more expensive than consent. *The
code currently gets a related case backwards and it is logged as deferred #14.*

**C26 — Occupation has to be able to end, or the only winning move is not to play.** Today nothing
becomes home by being held long enough, and that ruling is right about *timers* — but there is
currently no route at all. A route through consent rather than through the calendar: an election held
and accepted, an autonomy grant that expires unrenewed, a generation of migration. Otherwise every
conquest is permanently expensive and the game quietly instructs the player never to conquer.

### F. Who else joins in

**C27 — Help short of war.** Louisiana's neighbours "went in to support them" and the model has no
way to say that. Money, arms, or a force contribution that raises the defender's roll without
creating a state of war. Deniable, cheap, and it is what neighbours actually do. *Inbox question 2.*

**C28 — A coalition that can declare.** Today it is a standing money cost and some armies in the way
— a tax. A coalition that can go to war is a threat, and the difference is the whole point of having
one.

**C29 — A guarantee: a promise that costs nothing until it is called.** The best diplomatic object
this round can hand to round 5, and the second treaty the Influence stock has been waiting for.

**C30 — Somebody else's movement is a weapon.** Round 1 handed *sponsorship* to diplomacy; the
military half — arming a movement inside your enemy — belongs here. It is also the only offensive
move available to a nation too small to invade anybody.

### G. What stops the strong, and what saves the weak

**C31 — The hole, stated precisely.** Threat is size share × (1 − influence), so a coalition fires
against a giant and never against a middling neighbour eating a three-Area state. Maine, Vermont and
New Hampshire were eaten early in play. **A small predator frightens nobody.** Three candidate
repairs, and they are not exclusive:

- **(a) Threat measured against the victim, not the continent** — taking somebody defenceless is
  alarming whoever you are.
- **(b) A proportional term** — taking 100% of a nation is an extinction and everybody notices.
- **(c) A personal stake** — the victim's own neighbours react even when the continent does not.

**C32 — Extinction is its own event.** Ending a nation should cost more than taking the same ground
from a survivor. One rule, cheap, and it fixes most of inbox question 7 on its own.

**C33 — The porcupine, and it is already measured.** A small, homogeneous, well-armed nation should
be disproportionately expensive to take. Wyoming has almost nobody in it and should still be a bad
idea. The armed share (C17) says exactly this and the number exists — the regional medians round 1
measured are ranching West **65.0%**, Deseret corridor 58.5%, Appalachia 49.9%, New England 42.9%,
New York City 12.5%. *This is the interesting answer to "what defends a small nation", and it also
says New England was eaten because New England is the least armed ground on the continent, which is a
better story than a balance patch.*

**C34 — A small nation can buy a protector.** Hand your foreign policy to a big neighbour in exchange
for their guarantee. It is what small states historically did, it gives the weak a *verb* instead of
a fate, and it hands diplomacy a real object. F16 already has the Canadian version of this.

**C35 — Fortify: an action a small nation takes and a large one would not bother with.** The
single-action economy currently offers a three-Area state nothing it can usefully do.

**C36 — Finding C is a balance question that has never been measured.** Three separate mechanisms all
amplify a bad roll — a badly-rolled nation's movement grows *slower*, the ring ladder gives a minimal
Deseret 1.6 Areas and a maximal one 19.9 (measured), and stateless fragments are prey in proportion
to how small they are. Conquest owns the other half: **it is where a weak nation actually dies.**
Everything in §G is damping, and none of it has been weighed against the three.

### H. Unite, and the civil war it can become

**C37 — Kinship on the peace roll.** The story's Texas is five nations each trying to reunify Texas
under itself. Two nations born of the same movement, or sharing a founding state, should find union
easier than two strangers do — which makes reunification the attractor the story wants without
authoring it.

**C38 — A failed Unite should be able to become a *war*, not only a fracture.** If war exists as a
state, this is the most natural place it comes from: you asked, they refused, and now the two of you
are in something.

**C39 — Reunification declares a winner** (round 1 ruling), so a Texas that unites the other four
*is* Texas again — and that should be a named, visible event rather than an ownership change.

**C40 — Union by force and union by persuasion are the same road at different prices.** Whether that
is one move with a dial or two moves is the round's question, not the answer.

### I. Expand and Reconquer — the movements that want you to march

**C41 — A movement that demands you take ground is the mirror of one that demands you let ground go.**
Two of the six verbs point outward. The government's answer is again several prices for one relief:
obey and take the war, buy it off with what its adjective asks for, suppress it, or refuse and pay.
*The four release valves answer only Separate; this is the missing half of the same table.*

**C42 — Refusing to march has a clock.** Round 1 ruling 49 already gave refusal a clock in the
petition case. Reuse the shape rather than inventing a second one.

**C43 — An Expand movement names its ground, and that is the Tuesday answer.** The Front Range
Republic wants NORAD, the air bases and the trade corridor. Hawaii is short of resources and holds
Pearl Harbor. A movement that names a target converts a pressure into a **map objective**, which is
precisely the thing the ideation plan says every round must produce and round 1 could not.

**C44 — Reconquer reads the lost-ground memory, which exists and is dated and decaying.**
Louisiana's remnant inside the Gulf Compact wants the parishes Houston holds, and the list already
knows Houston took them.

**C45 — Obeying a movement is how a player is dragged into a war they did not choose.** The best
argument that politics and conquest are one system.

### J. The board on the day it opens

**C46 — Back-date the relations list, and it costs nothing.** The memory is append-only, dated and
decaying — history can simply be *written into it* at setup. Houston's invasion of Louisiana. The
federal march into West Virginia. Chicago's north-west Indiana counties. The Gulf taking the Florida
panhandle for Pensacola. **No new machinery, and the entire opening board gains a past.** *This is the
best cost-to-benefit idea in the round.*

**C47 — Opening weariness is not zero.** The nations that fought open tired, and it decays — a
visible reason with an expiry date on it, which is what the stock is for.

**C48 — Armies out of position at setup**, per C11 and C12.

**C49 — Authored grudges on the ground.** The per-Area grievance term already does this; the
Shattering already uses it for the Mormon corridor. Every pre-turn-0 war should leave one.

**C50 — Ground already taken is ground already occupied.** If Houston holds western Louisiana on turn
0, it should be paying the occupation bill on turn 0 — or the opening annexations are free in a way
no later one is.

### K. Conquering ground nobody governs

**C51 — Stateless ground is cheap to take and that may be the problem.** New Mexico's remainder is
"ripe for conquering" by El Paso, Oklahoma, the Navajo Nation or the Front Range Republic. Nobody
defends it, so whoever reaches it first has it. **The question this round owns is whether taking
unclaimed ground should anger anybody at all** — and round 1's finding B says the deeper problem is
that stateless ground has no stocks, which belongs to politics.

**C52 — The people living there are not nobody.** Tier-3 ground has a population, an ideology and an
armed share. Even with no government, C17 and C24 say marching in has a price.

### L. What the player actually does about this, on a Tuesday

The plan says a round is not finished until it answers this, and round 1 stalled on exactly here.

**C53 — The verbs conquest could offer:** declare, with an aim · commit force to a front · redeploy ·
fortify · blockade a chokepoint · raid · sponsor somebody's movement · guarantee somebody's borders ·
sue for peace · obey or refuse a movement that wants you to march · recognise a conquest, or refuse
to.

**C54 — And the debt that list runs up.** A war lasting ten turns, in a game with one action a turn,
means war *consumes the game*. **The structural answer is the one trade already found: a war is a
standing state that runs on its own, and the action is what you spend to CHANGE it** — declare,
escalate, redeploy, sue for peace. Fighting is not an action. Deciding is.

---

## 3. Questions inherited from the story of the break-up (6 September)

*Kept as filed. Where an idea above answers one, it is named.*

1. **Wars that happened before turn 0.** Texas fought itself; Houston invaded Louisiana and kept its
   western parishes; the federal army marched into West Virginia and made an enemy of Appalachia.
   How does a war that already happened show on the opening board? → **C46–C50.**

2. **Third parties who fight without declaring.** Louisiana's neighbours "went in to support them".
   Is there intervention short of war? → **C27, C28.**

3. **An army that is somewhere else.** The federal army opens stretched thin and guarding the
   capital. Does force start deployed, depleted, or absent? → **C11, C12.**

4. **Inherited assets.** The Gulf nation took the Florida panhandle for Pensacola; the navy was cut
   in two by the shut canal. Do bases, fleets and arsenals exist? → **C19–C21.**

5. **Terrain.** "The rocky terrain of the Tetons and Rocky Mountains made it hard to invade."
   → **C14–C16.**

6. **Conquering stateless ground.** → **C51, C52**, and finding B belongs to politics.

7. **What defends a small nation?** Maine, Vermont and New Hampshire were eaten early. → **C31–C35.**

8. **Annexations authored at open** — settled facts, or facts with consequences? → **C46, C49, C50.**

9. **Unite lives here.** → **C37–C40.**

10. **Expand and Reconquer — what a government owes a movement it obeys.** → **C41–C45.**

11. **Finding C: three mechanisms all amplify the dice.** → **C36**, and all of §G is the other half.

12. **Loyalty is a real defence now, and occupation has a second term.** → **C17, C23–C25, C33.**

---

## 4. What this round needs from the others

*Filled in as the round runs.*

- **From politics (round 3):** whether stateless ground has stocks at all (finding B) — C51 cannot be
  priced until it does. The government's answer to Expand and Reconquer sits beside the four release
  valves and should be one table, not two.
- **From diplomacy (round 5):** guarantees, protectorates, peace treaties and who mediates. C29 and
  C34 are diplomacy objects with a military trigger.
- **From the economy (round 4), and ruling 4 makes two of these blocking:** what a war costs to run,
  what a blockade actually stops, and what a destroyed rail hub does to a corridor. **And:**
  **(a) desperation must bite** — a nation that cannot get a resource must actually suffer for it, or
  ruling 4's third cause can never fire; **(b) a price must be settable by the seller**, or nobody can
  charge the absurd price that cause names. Both are already recorded as gaps rather than being new
  demands.
- **From events (round 6):** a war that starts because somebody else's crisis made it.

## 5. What the other rounds may demand of this one

*Filled in as the round runs.*

- **Nation-making must stay one machine.** A civil war that goes badly and a movement that declares
  must produce the same kind of country. Already true; must stay true.
- **Weariness must be readable as a reason**, not felt as a drag.
- **A player must be able to answer "why am I at war" in one sentence**, from the same memory list
  everything else reads.

---

## 6. Rulings

**Ruling 1 — This is not a war game, and the arrows point the other way. (Aaron, 7 September 2026.)**
War is not the thing the economy and diplomacy serve; it is a thing that happens *to* them. Every
idea in this round is measured by what it does to the economy, to the neighbours and to a nation's own
people. Recorded as D181 and quoted in full at §0.

**Ruling 2 — A war is a standing state, and it is one of seven. (Aaron, 7 September 2026.)**
Two nations are always in a named relationship: **Peace, Peace-treaty, Hostile, Cease-fire, War**, and
later **Subject** and **Allied**. Peace permits everything. A peace-treaty carries stipulations —
trade, territory, repayment — and **breaking it has a huge impact**. Hostile is what happens when
events bring two nations close to war without war. A cease-fire carries **all the impacts of war
except the ability to attack**. War **prohibits trade** and permits attack. Subject and Allied are
deferred to later in the round. The spine and the ideas hanging off it are at the top of §2.

*This supersedes my own proposal of a war object with named aims. The aims idea is not dead — it
becomes a property of the War state rather than a thing of its own — but the state machine is the
better spine and it is Aaron's.*

**Ruling 3 — a cease-fire is temporary and carries a set number of turns. (Aaron, 7 September 2026.)**
It is the only one of the five states that cannot be a resting place. It is set for a term, it runs
out, and something else must happen when it does. *This settles C58 and it settles it harder than I
proposed: I suggested it "should probably expire"; Aaron has made expiry the definition. A cease-fire
is a clock with all of war's costs running while it ticks, which means both sides are paying for the
time they are using to decide.*

**Ruling 4 — what puts two nations into Hostile. (Aaron, 7 September 2026.)** Five causes, in his
words, and the round may add more:

1. **One nation has a large growing movement inside the other.** *"Oregon is hostile with Greater
   Idaho because the Greater Idaho movement is growing in their state."*
2. **Two nations competing to reunify the same thing** — the Texases, the Californias, the eastern
   capitals, and the others named below.
3. **One nation desperate for a resource, and the other will not trade it or charges an absurd
   price for it.**
4. **One nation funding a movement inside another.**
5. **Hostility inherited through alliances.** If A is allied to B, and C is allied to D, and A
   attacks C and D, then **D becomes hostile with B**. You inherit your ally's enemies.

**These five are not five mechanisms. They are five systems reaching into one place**, and that is
ruling 1 working: cause 1 is secession reaching diplomacy, cause 2 is the board itself, cause 3 is
the economy, cause 4 is a player's own deliberate act, and cause 5 is diplomacy folding back on
itself. Not one of them is a military act. *A nation can arrive at the edge of war without ever
having raised an army.*

**Cause 5 depends on Allied, which Aaron deferred.** Not a contradiction — it is a cause that
switches on when alliances exist, and it is an argument for taking Allied earlier in this round
rather than later.

**Cause 3 depends on two things the economy does not yet do**, and both are already written down as
gaps:
  - **Desperation has to bite.** The stated hollow spot in the current build is that *nothing bad
    happens to a nation that does not trade*. Until it does, no nation can be desperate for anything.
  - **A price has to be settable.** `DESIGN.md` records that the model has the price lever and no
    screen anywhere sets it — *"the single largest gap between what the economy spec asks for and
    what is built"*. "An absurdly high price" cannot be charged until somebody can charge it.
  → **Recorded in §4 as what this round needs from round 4.**

**Ruling 5 — a state is shared, not one-sided. (Aaron, 7 September 2026.)** All five live states are
one fact held **between** a pair of nations, symmetric, for both of them at once. Aaron: *"I think
down the road I could see a more complex version of the game being different, but for now they are
shared."* **This is simpler than what I recommended and it survives every one of ruling 4's causes**,
checked one by one — because the word describes the *relationship* and not the emotion. Greater
Idaho, funding irredentism inside Oregon, is in a hostile relationship with Oregon whether or not it
is enjoying itself. Two nations whose allies are shooting at each other are on opposite sides. A
nation gouging a desperate neighbour knows it has a problem with them.

**What it costs, said plainly:** a small nation can no longer nurse a grievance against a giant that
has not noticed. El Paso cannot loathe Dallas while Dallas is busy with Houston — if El Paso is
hostile, Dallas is hostile back. And the "both sides are hostile" upgrade I offered as free drama
does not exist, because there is no one-sided hostility for it to be an upgrade *from*. **The
one-sided version is filed as F18**, in Aaron's own words: the more complex version, down the road.

**And it does *not* delete the rivalry, which is worth saying because the built model cares.** The
dated, decaying record of what one nation has done to another is **directed**, and `DESIGN.md` is
explicit that making it symmetric *"would be one line less code and would delete the rivalry"*. That
record stays exactly as it is. **The feelings run one way and keep every asymmetry the game already
has; the state is the shared summary sitting on top of them.** Nothing is lost, and the two are not
in conflict — they are answering different questions.

**Ruling 6 — a war ends only by agreement, and refusing is allowed. (Aaron, 7 September 2026.)**
*"If Houston is at war and it wants out of it and Dallas refuses then they are still at war."* No
penalty attaches to refusing. **I proposed one and Aaron did not take it, and he is right** — a rule
charging the refuser would be bolted on top of a system that already produces the cost. Dallas
refusing peace is not free: it is at war, its weariness is rising, its trade with Houston is
prohibited, and its own people are reading all three. **The frame from ruling 1 is what makes ruling 6
safe.** War is expensive for the side that will not stop, and it is expensive without anybody writing
a rule that says so.

*The residual risk is recorded rather than argued: a player can be held in a war they cannot leave by
an opponent willing to bleed. Whether that is drama or a trap is a question for the alpha, not for
this round.*

**Ruling 7 — every state has an exit, and three of the four are clocks. (Aaron, 7 September 2026.)**

- **A cease-fire runs out into one of three states: War, Peace-treaty, or Hostile.**
- **A peace-treaty runs out back into Peace.**
- **Hostile turns back into Peace after a certain time.**

**This closes the cycle, and the shape it makes is the good part:** the *only* two transitions that
need both nations to agree are the ones into a cease-fire and into a peace-treaty. Everything else is
either taken alone (declaring) or arrives on a clock (hostility cooling, a treaty maturing, a
cease-fire expiring). **A pair of nations cannot get permanently stuck anywhere except War**, which is
ruling 6 and is deliberate.

| From | Leaves by | Into |
|---|---|---|
| **Peace** | the five causes of ruling 4 | Hostile |
| **Peace** | one nation declaring | War |
| **Hostile** | **time** | Peace |
| **Hostile** | one nation declaring | War |
| **War** | **both agreeing** | Cease-fire |
| **War** | one side ceasing to exist | — |
| **Cease-fire** | **its term running out** | Peace-treaty if one is signed, **otherwise Hostile** *(ruling 8)* |
| **Cease-fire** | a counter-offer being sent | **Cease-fire, extended** *(ruling 8)* |
| **Peace-treaty** | **its term running out** | Peace |
| **Peace-treaty** | being broken | *open — see §8* |

*"A certain time" for hostility, and the term of a treaty, are placeholder tunables. Nothing about
them is measured and nothing should be tuned during ideation.*

**Ruling 8 — a cease-fire ends in a negotiation, and its default is Hostile rather than War.
(Aaron, 7 September 2026.)** *"At the end of a cease-fire there will be a peace treaty signed, or war
will break out, or things will remain hostile. So at the end of a cease-fire there should be a
question if you want to send them a peace treaty. If no peace treaty is signed then things remain
hostile. If a peace treaty is sent they should be able to send a counter offer and the cease-fire
would extend."*

**This corrects my proposal in the direction that matters.** I said the default on failure should be
war, on the argument that it is the pressure making the window mean something. Aaron's default is
**Hostile**, and it is better: the guns do not restart because a clock ran out and nobody spoke.
**War is still one of the three outcomes — it is simply reached by somebody declaring it**, which the
machine already allows from Hostile and needs no rule of its own. *That last step is my reading
rather than his words; it is the parsimonious one and I have taken it as the default rather than
asking.*

**And the machinery for it is built, playtested, and shaped exactly right.** `DESIGN.md`'s
negotiation is already *"you propose; they accept, counter, or decline, and say why in plain
sentences"*, delivered on a **full-screen card whose shape is deliberately shared across systems** so
that a player learns one way this game asks a question. A peace treaty is a third use of a card they
already know. Three properties it brings with it, all of them load-bearing here:

- **Answering a card does not use your turn.** So the whole peace negotiation sits outside the
  single-action budget — which is the answer to the worry that a long war eats a game that only
  grants one decision a turn.
- **The answer is a pure function of the world and the terms — no dice, no clock.** Proposing the
  same thing twice gets the same reply. *"There is nothing to grind and no reroll to shop for."*
- **Which means an extension is only bought by conceding something.** Re-sending terms already
  refused changes nothing, so the cease-fire extends only when somebody actually moves. That is what
  a negotiation is, and it falls out of a rule that was written for trade deals.

**C74 — Each extension should be shorter than the last.** The one risk in ruling 8 is a pair of
nations countering each other indefinitely and living in a cease-fire forever. War's costs running
throughout is most of the answer — stalling hurts — but a window that narrows each time it reopens
makes the negotiation *converge* rather than merely become expensive. Cheap, and it turns a possible
exploit into rising tension. *Proposed, not ruled.*

**C75 — What can go in a peace treaty is the open half of this.** Aaron has named the categories
— trade, territory, repayment — and a trade deal's negotiation has exactly two levers while a
corridor's has three, deliberately, because a slider you always say yes to is not a decision. **A
peace treaty wants the same discipline: few levers, each one a real choice.** *Open.*

**Ruling 9 — what Hostile costs. (Aaron, 7 September 2026.)** Four things:

1. **Tolls rise.** What they charge to move your goods across their ground goes up.
2. **What they will accept as a toll rises.** They demand a bigger cut before agreeing to a crossing
   at all. *This is my reading of "willingness to accept tolls rise" and it maps onto built
   machinery — a corridor is negotiated on a slider from 5% to 60% that deliberately opens below what
   the other side would ask, so "what they would ask" is a real number that can move. The other
   possible reading is that a hostile nation becomes willing to pay more because it is cornered; if
   that was the intent, this entry is wrong and cheap to fix.*
3. **Movements grow faster where they match the other nation.** Oregon and Greater Idaho being
   hostile makes the Greater Idaho movement inside Oregon grow faster. Targeted, not general.
4. **Guarding the border costs more money.**

**Aaron's third item replaces a mechanism I proposed, and replaces it with a better one.** I had
suggested that a hostile border drags a nation's army outward, weakening the garrison at home, so
that *all* of its separatists grow. His version reaches the same outcome directly and legibly, and it
is **targeted at the movement that belongs to the nation you are quarrelling with** — which is a
story a player can read off the map in one glance. The indirect version survives as an idea, below,
because it says something his does not.

**C76 — The indirect version, kept because it is a different claim.** *(Claude, superseded as the
main mechanism by ruling 9.3.)* An army pointed outward is an army not holding the ground behind it.
Ruling 9.3 grows *the neighbour's* movement inside you; this would raise the pressure on **all** your
restless ground, because your soldiers are facing the wrong way. It is the general "a quarrel abroad
weakens your grip at home" claim rather than the specific irredentist one.

---

#### ⚠ FINDING — ruling 9.3 closes a loop, and it is the first one in this round

**Ruling 4's first cause and ruling 9's third effect are the same pair of nations pointing at each
other:**

> A movement grows inside you → **you and its nation become Hostile** *(ruling 4.1)* → **the movement
> grows faster** *(ruling 9.3)* → you are more hostile → …

**This is self-reinforcing, and it defeats ruling 7's cooling clock.** Hostility is supposed to turn
back into Peace after a certain time. But if the cause of the hostility is a movement, and the
hostility feeds the movement, **the cause never goes away and the clock never gets to fire.** Oregon
and Greater Idaho would be hostile permanently.

**Three things stand between this and a runaway, and none has been measured:**
- Movement strength is **capped** per movement (Deseret's is 0.55–0.60), so the growth cannot run away
  even if the loop never breaks.
- Ideological match is **multiplicative**, so the movement can only grow where it already fits.
- Sentiment is **rate-limited**, so a region takes years to turn either way.

**It may also simply be correct.** Some rivalries are permanent, and a game in which Oregon and
Greater Idaho never stop being hostile is not obviously wrong — it is the Kashmir answer. **The
question is whether ruling 7's clock should decay on *time* or on *the cause going away*, and they
give different games.** Recorded here rather than decided, and it is the first thing the closing trace
of this round must run.

---

### THE SPINE, continued — how a war is actually fought

**Ruling 10 — ground changes hands at the settlement, not turn by turn. (Aaron, 7 September 2026.)**
Accepting the recommendation and the reason for it: if the border moved every turn, the map would
become the scoreboard, players would watch the front instead of the country, and we would have built
a war game after all. **The war is the leverage; the treaty is the game.** What a war is *for* is
making the other side's position bad enough that they sign.

*Its known cost, recorded honestly: a war with no visible front is harder to read, and risks becoming
an abstract bill arriving every quarter. That is a presentation problem and it must be solved. The
alternative's problem was that it changes what the game is about.*

**Ruling 11 — war must be simple at the level the player touches it. (Aaron, 7 September 2026.)**
*"I want it to be really simple from a user experience level. There isn't going to be troops / troop
types / etc."* **This is a constraint on every idea in this document**, and several already in the bank
fail it or need trimming to pass. It is consistent with what is built — force is deliberately one
derived number with no counters, no stacks and no tokens — and it means the interesting complexity
belongs in the *consequences* of a war rather than in its conduct.

**Ruling 12 — how a fight resolves. (Aaron, 7 September 2026.)** *"I decide I want to invade / annex
an area. It would create a number of my total available military for the field and compare it against
the other nation's set aside for the border. There would be bonuses and negatives that will be
decided later on — like good tech increases your chance, or if you are annexing an area that is a
part of your separatist movement then that is a bonus as well. I do like the idea of a percentage
chance — it feels like your generals analysed the data and are giving you a chance to win / succeed."*

**Almost all of this is already built, and that is the useful thing to know.** Verified 7 September:

- **The comparison exists exactly as described.** The game already computes the attacker's **Field**
  strength against the defenders' **Border** strength as a share — `mine / (mine + theirs)` — adding
  the border armies of any nations lined up against the attacker at a discount, and a modifier for
  who is in charge.
- **It is already shown to the player**, on the Area panel, captioned in plain English: *"How the
  fight goes — an army at the end of its supply line."* It is displayed as a multiplier (×1.42)
  rather than as odds.
- **The distance penalty is already folded in**, off the same record that priced the attempt, so the
  panel explains a refusal with the number that caused it.
- **The preview machinery is exactly the right shape for a stated percentage.** Planning a move is a
  pure function with no dice in it, returning a preview the player's panel renders and the AI scores
  — *deliberately the same function*, so what the player is shown and what the AI believes can never
  drift apart. A stated chance is what that arrangement was built to support.

**So ruling 12 is largely a presentation change on top of a number that already exists** — plus the
one structural change that matters: **it must fire on every attack**, rather than only when the
attacker's own civil war happens to trigger (§1a).

**C77 — The bonus and the penalty are the same number with its sign set by whether the locals agree
with you.** Aaron named a bonus for attacking ground where your own separatist movement has members.
That is the exact mirror of the defence C17 proposed — an armed population that hates you is a bad
place to march into, and **the same armed population that agrees with you is help**. One measured
quantity (RAND armed share apportioned by settlement density, 8.9%–65.0%, median 40.0%), one sign,
decided by ideological match — which is how the sentiment model already decides everything else,
multiplicatively. *This makes "liberating your own people" and "occupying strangers" the same formula
read in two directions, and it is the cheapest coherence available in the round.*

**C78 — What does losing cost?** Ruling 12 gives a chance to succeed and does not say what failure
does. **If a failed attack costs only the turn, the percentage stops meaning anything** — a player
simply attacks every turn until the dice agree, and a 30% chance is a three-turn delay rather than a
risk. Candidates, and they are not exclusive: force spent and slow to recover, weariness, treasury,
the defender's Area hardening against you, or the attempt itself moving the pair down the ladder
(C72). *Open — see §8.*

---

### THE SPINE, continued — how held ground is held

**Ruling 13 — ground you take is yours immediately, but it is held under a flag, and there are three
flags. (Aaron, 7 September 2026.)**

This answers question 10 in a third way, and better than either option I offered. I asked whether
winning the roll makes an Area **owned** or merely **stood on**. Aaron's answer: it becomes your
territory at once — *"it shows as my territory but with a different brightness of my map colour"* —
and carries a modifier saying how you came by it.

| Flag | When | What it does |
|---|---|---|
| **`occupied-war`** | You won the roll and the war is not settled | **Increases civil unrest and impacts the economy greatly.** You may use the ground in your own trade — **but you may not grant it to anybody else as a trade passage.** *"Even if I captured territory my allies wouldn't use it as a trade route while still at war."* |
| **`occupied`** | A peace treaty was signed and you kept it | **All trade permitted**, and still carrying some negative outcomes |
| **`occupied-movement`** | The matching movement is **over 50%** in that Area and the occupier is that movement's nation | Liberation rather than conquest |

**This refines ruling 10 rather than contradicting it, and the refinement is the good part.** Ruling
10 said ground changes hands at the settlement. What actually changes at the settlement is not the
*border* — it is the **tenure**. The map moves when you win; the treaty is what launders
`occupied-war` into `occupied`. **A peace treaty is a title deed**, and that is a far better reason to
sign one than "the fighting stops".

**The transit prohibition is the cleverest thing in this ruling and it is nearly free to build.** The
game already routes goods across other nations' ground by negotiated corridor, already refuses routes,
and already explains a broken one in plain words — *"they closed the border, that country is gone, or
the corridor is full."* **"That ground is under occupation" is a fourth reason in a list that exists.**
And it makes a captured corridor worthless until you settle, which means **a nation that fights for a
trade route cannot use the route until it makes peace.** That is ruling 1 in a single mechanic.

**C79 — The brightness is a stated requirement, not decoration.** Ruling 13 says the map shows held
ground in a different brightness of your own colour. That is the answer to ruling 10's recorded cost —
*"a war with no visible front is harder to read"*. **The front is visible after all: it is the pale
part of your own country.** Recorded so the presentation problem is not solved twice.

**C80 — `occupied-movement` is round 1's loyalty rule pointed at conquest, and it uses the same
number.** Round 1's finding E settled that a movement's loyalty in an Area is **the share it actually
has there**, not mere homeland membership. Ruling 13 reads the same share at a stated threshold. So
the ground that will not defect from you and the ground that welcomes you when you take it are one
quantity read at two points, which is the kind of coherence this project has been paying for
elsewhere.

**⚠ And the threshold has a consequence nobody has stated.** The secession threshold is **0.40** and
movement caps run **0.55–0.60**. So a **50%** share is *above the line at which an Area would defect
to that movement's nation on its own*, under the tier-1 frontier defection that is already built.
**Every `occupied-movement` Area is ground that was going to come to you anyway** — invading merely
takes it sooner and off the frontier. That may be exactly right: it makes the flag rare, it makes it
mean something, and it gives a player a reason to be impatient. But **the 50% and the 0.40 should be
related to each other rather than set independently**, or one will quietly make the other pointless.
*The 50% is an invented placeholder, stated by Aaron and measured against nothing. It must carry the
est. badge.*

**C81 — Held ground needs a fourth state: ground that stops being occupied at all.** C26 asked whether
occupation can ever end. Ruling 13 gives the ladder its first two rungs and stops at "still carrying
some negative outcomes", permanently. *Open, and it is C26 unchanged.*

**Ruling 14 — an attack has two outcomes, and failure costs what you already spent.
(Aaron, 7 September 2026.)** *"Mapping this onto a realistic outcome there are two options: conquer,
or fails to conquer. Which means if they don't conquer it they have paid the cost and that was their
turn and didn't conquer anything."*

**My proposal was over-engineering and it rested on a wrong premise.** I argued that a failed attack
had to spend readiness, or the percentage would be a delay rather than a risk — reasoning from "if a
failed attack costs only the turn". **It does not cost only the turn.** Verified in the code on
7 September: the price of an attack is debited from the treasury *before* the roll is made, not after
it. **The money is already gone whether you win or lose.** Three consequences follow and they are the
whole answer:

- **The odds price themselves.** At a 30% chance you pay roughly three and a third times the cost of
  the Area to take it. Bad odds are automatically expensive, in exact proportion to how bad they are,
  and nobody had to write a rule.
- **The cost scales with the prize.** The price is per Area and per head, so a failed attack on a
  city is a disaster and a failed attack on empty ground is a nuisance.
- **And under the spine, attacking at all puts you in War** — trade prohibited, weariness climbing,
  corridors shut. **So the real cost of a failed attack is that you are now in a war you are not
  winning.** That is a far heavier price than the readiness penalty I proposed, and the spine was
  already producing it.

**C82 — The civil war is a consequence of SUCCESS, not of the fight, and the two must not be merged.**
*Default taken, flagged rather than asked.* Ruling 14's two outcomes are about beating the defender.
The existing civil war — triggered when what you swallowed flips your leading ideology or exceeds 15%
of what you held — is about what winning does to *you*, and it keeps its own three outcomes. **They
stack: you can take the ground and lose the country.** That is scenario 1 in §7 and it is the story
this whole round exists to tell, so the two rolls should stay separate.

---

## 7. The scenarios this round has to be able to tell

Traced at the close, per the lesson round 1 learned: **tracing scenarios found contradictions that
fifty-three rulings did not.**

1. **A conquest that pays for itself and costs the conqueror the country.** *(Rounds 1 and 2.)* You
   take four Areas, the treasury improves, weariness rises, the ground resents the garrison, and
   eighteen months later a region you have held for a century declares.
2. **A three-Area state that is not worth eating.** Somebody looks at Vermont, or at Wyoming, and
   decides against it — for a reason the panel can name.
3. **A war that ends without either side being destroyed.** Declared for something, fought to a
   point, settled by a treaty that both sides then have to keep.
4. **A government dragged into a war by its own people.** The Front Range Republic's Expand movement
   names NORAD, the government refuses, and the refusal costs it.
5. **A hungry nation with an army.** *(Rounds 1, 2 and 4.)* Buying food is possible and expensive;
   invading is cheaper. The player weighs a fed population against the anger of the ground they took.
6. **A Tuesday, in a war.** One action, a front that is moving on its own, and something worth doing
   with the turn.

---

## 8. Open on the spine, after ruling 2

Asked of Aaron in order, one at a time. Answered ones move up into §6 as rulings.

1. ~~**What puts two nations into Hostile, and what does it cost?**~~ **Answered — rulings 4 and 9.**
   *Unruled and still banked from my proposal: no new deals and no renewals with a hostile neighbour;
   they will not recognise you; and they may shut a corridor on you (C67).*
2. ~~**Is a state shared or one-sided?**~~ **Answered — ruling 5. Shared.** The one-sided version is
   **F18**.
3. ~~**How does a state change?**~~ **Answered — rulings 6 and 7.** Declaring is taken alone; a
   cease-fire and a treaty need both; hostility, a treaty's maturity and a cease-fire's expiry are
   clocks. *Still open within it: **does a transition cost your one action for the turn?** My
   proposal, unruled — declaring costs an action, proposing a cease-fire or treaty costs an action,
   becoming hostile costs nothing because you did not do it, and **being at war costs no action at
   all**, because a ten-turn war that eats ten turns of decisions is the whole game.*
4. ~~**Does a peace-treaty expire back into plain peace?**~~ **Answered — ruling 7. Yes.**
5. ~~**Which of the three states does a cease-fire fall into?**~~ **Answered — ruling 8.** A card
   asks whether to send a treaty; a counter extends the cease-fire; nothing signed means Hostile.
   *Still open within it: **what can go in a peace treaty** (C75), and whether each extension should
   be shorter than the last (C74).*
6. **What does breaking a peace-treaty do?** Aaron has ruled it has "a huge impact" and not what
   state it lands you in. **C72 proposes** that it is the top of a justification scale rather than a
   rule of its own.
7. **Subject and Allied** — deferred by Aaron, but ruling 4's fifth cause needs Allied to exist.
   Worth reopening earlier in the round rather than later.
8. **Can a pair go from Peace straight to War**, or does something have to happen first? C72 assumes
   yes-but-expensively.
9. **Does hostility cool on time, or only when its cause goes away?** Raised by the finding under
   ruling 9 — the two give different games and ruling 7 says "a certain time", which the finding
   shows can never arrive for a movement-driven quarrel.
10. ~~**When you win the roll, do you own the Area or are you standing on it?**~~ **Answered —
    ruling 13**, and in a third way: it is yours at once, shown paler on the map, and flagged by how
    you came by it. The treaty changes the **tenure**, not the border.
11. ~~**What does losing an attack cost?**~~ **Answered — ruling 14.** Two outcomes only, and the
    price was paid before the roll. C78 is superseded.
12. **Does `occupied-movement` apply while the war is still on, or only after a treaty?** *Default
    taken, flagged rather than asked: **yes, during the war too**, because the flag is about who the
    locals are and not about the war. But the transit prohibition still applies while at war, since
    ruling 13's reason for it is the war rather than the resentment. One line to correct if wrong.*
13. **Can ground ever stop being occupied at all?** (C26, C81.) Ruling 13's ladder ends at "some
    negative outcomes", permanently.
