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
| **Wary** | *Added by ruling 17.* Trade and dealings are permitted, but guarded. **The step every cooling grudge passes through on its way back to Peace** |
| **Peace-treaty** | You signed a treaty with stipulations — trade, territory, repayment. **Breaking it has a huge impact** |
| **Hostile** | Things have happened that bring you close to war without being at war. It has impacts |
| **Cease-fire** | **All the impacts of war, but you cannot attack** |
| **War** | Trade is prohibited and you may attack |
| **Subject** | *Deferred by Aaron — later* |
| **Allied** | *Deferred by Aaron — later* |

*Ruling 2 said seven states and named five live ones. **Ruling 17 makes it six live states and eight
in total.** Everything below written before 9 September says "five states"; read it as six.*

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

**Ruling 16 — a movement makes DEMANDS, they are shown on a screen of their own, and every demand
gets one of three answers. (Aaron, 7 September 2026.)**

> *"There should be a new game mechanic that displays the movement's demands, as well as their
> strength and support and any other info we decide later. So they might say something like: start a
> war with this country. In each of these demands you can do one of three options: implement it,
> decline to implement it, or tell them to wait — which they will do, but if you never implement it
> that will make them more angry than if you just declined in the first place."*

**✅ This closes round 1's finding D, which round 1 could not close and handed to politics.** Finding D
said: *"Five of the six verbs have no government response. The four release valves answer Separate and
nothing else. Unify, Reunify, Rejoin, Expand and Reconquer each need their own answer… Blocks: the
player having anything to do about most movements."* Ruling 16 is the general form finding D was
asking for. **It is not an answer for Expand; it is an answer for all six verbs at once**, because
every movement can state what it wants and every statement can be met with yes, no, or not yet.

**✅ And it is the Tuesday answer.** The ideation plan requires every round to say what a player
actually *does*, on a Tuesday, with one action — and round 1's fifth traced scenario stalled on
precisely this, with Illinois holding four movements it had no way to answer. **A screen of standing
demands with three buttons is a thing to do on a Tuesday.** It is the first mechanism in either round
that lets a player act on a movement rather than watch one.

**The three answers, and why the third is the good one.**

| | |
|---|---|
| **Implement it** | You do the thing. Support, and whatever the thing costs |
| **Decline** | Honest, immediate, and cheaper than the third option done badly |
| **Tell them to wait** | They will wait — **but never delivering angers them more than declining would have** |

**"Wait" is a debt: you are borrowing patience at interest.** It is the same shape as C23's garrison,
which buys quiet today and sells the next decade, and the same shape as the appeasement valve, which
buys a region and pays at the next election. This game keeps producing "buy now, pay later" and it is
what makes it a game about consequences rather than about optimisation. **The lesson it teaches is
unusual and worth protecting: stringing somebody along costs more than saying no.** So "wait" is
correct only when you *intend* to deliver and need time to get ready — never as a way to avoid the
question.

**C83 — A screen, not a card, and the game has a precedent for each.** The full-screen card is how
this game asks a one-off question and is deliberately shared across systems; **the deals screen** is
how it shows standing agreements. A movement's demands are standing, so this is a **movements screen**
— the deals screen pointed at your own internal politics instead of at your neighbours.

**C84 — Answering is free; obeying costs what the obeyed act costs.** *My proposal, unruled.*
Answering a demand must not spend your one action — the game already establishes that answering a
card *"does not use your turn"*, and a nation with four movements would otherwise lose four turns
saying no. But **implementing** commits you to an act that costs whatever that act costs, and
declaring a war is an action. So the screen is free and the obedience is not.

**C85 — Every verb has a demand shape, and the adjective already says what would buy it off.**
Round 1 established that a movement is a **verb**, an **adjective** and an **ideology**. The verb
writes the demand; the adjective says what an alternative would look like:

| Verb | What it demands |
|---|---|
| **Separate** | Let us go |
| **Unify** | Join that compact |
| **Reunify** | Put the old country back together, under us |
| **Rejoin** | Give us back to them |
| **Expand** | **Take that ground** |
| **Reconquer** | **Get back what we lost** |

**C86 — A demand names a target, and that is what turns a pressure into a map objective.** The Front
Range Republic's Expand movement wants NORAD, the air bases and the trade corridor; Hawaii is short of
resources and holds Pearl Harbor; the Gulf's Louisiana remnant wants the parishes Houston holds, and
the dated memory of that loss already exists. **A demand that names Areas is something a player can
click on.**

**C87 — A demand should lapse when the world does.** If the nation a movement wants you to attack has
ceased to exist, or you already hold the ground it wanted, the demand is met or void rather than
standing forever.

**C88 — The other sixty nations answer demands too, and this is where it pays for itself.** If only
the player has internal politics, the board is a solitaire game with scenery. The AI already scores
the same previews the player is shown, so **an AI nation obeying its own Expand movement is a war
nobody authored** — and it is the cheapest possible source of wars that are not about the player.

**C89 — What does the movement do when you decline?** Ruling 16 says declining is cheaper than
promising and failing, and does not say what either costs. Candidates: it grows faster, it hardens
toward Separate, it looks for a foreign sponsor — round 1 ruling 21 already lets a nation fund
somebody else's movement — or it stops asking. *Open.*

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
  C34 are diplomacy objects with a military trigger. **And three things ruling 21 handed forward on
  9 September, the first of which is now blocking:**
  **(a) the diplomatic action that speeds a thaw** — ruled by Aaron to exist and deferred to round 5.
  Without it, hostility can *only* be waited out, and the thirty-three pairs that open Hostile have
  no move available to them at all. The ledger it writes to already exists (C99);
  **(b) whether conquering the nation that withholds recognition ends the veto or makes it permanent**
  (C100), which decides whether the Texas board resolves by diplomacy or by force;
  **(c) what a nation gets for recognising somebody**, given that recognition is unilateral and
  therefore the only thing two hostile nations can do to each other that is not violent.
- **From the economy (round 4), and ruling 4 makes two of these blocking — ruling 23 makes a third:**
  **what a war costs to run, which ruling 23 deferred here explicitly and which ruling 22's repayment
  lever cannot be priced without**;
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
| **Hostile** | **time** | ~~Peace~~ **Wary** *(ruling 17)* |
| **Wary** | **time** | **Peace** *(ruling 17)* |
| **Wary** | the five causes of ruling 4 | back to Hostile *(ruling 17)* |
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

**✅ CLOSED by ruling 17 (9 September), and by a third answer neither option contained.** The clock
runs on **time** and always runs; a live cause **slows it** rather than stopping it. So the loop
cannot lock a pair in place — it can only make them cool slowly. And the brake weakens on its own,
because movement growth is geometric: each movement closes a fraction of the gap to **its own
ceiling** every turn,¹ so a movement that is being fed grows fastest when it is young and barely at
all once it has filled up. **Hostility over a separatist movement is therefore hardest to escape when
the movement is new, and eases as the situation becomes chronic** — which is the right curve, and
nobody designed it. See ruling 17 for what replaced this finding.

*¹ Verified in `DESIGN.md` 9 September: world-turn phase 3, plus the per-movement `growthCap`
(0.25 for a nuisance, 0.60 for a country in waiting) and `growthRate` tunables.*

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

**Ruling 15 — what goes in a peace treaty, and what refusing one costs.
(Aaron, 7 September 2026.)** Four levers and no more:

| Lever | |
|---|---|
| **Territory** | Which occupied Areas you keep. This is the lever that converts `occupied-war` into `occupied` |
| **Repayment** | **Capped at 1.25× the cost of what was spent on the war** |
| **Forced trade deals** | A deal on terms you set rather than terms they agreed |
| **How long it runs** | Ruling 7 already says it lapses back into Peace at the end |

**And refusing is not free:** *"If they say no then the war continues, which will increase war
weariness and increase chances of bad things happening."*

**⚠ The 1.25× needs one word settling and it is a number, so it is flagged rather than guessed.**
Aaron's words are *"no more than 1.25 the cost of what **they** spent on the war."* Grammatically
"they" is the other nation, giving **the loser's own war spending** as the basis — you cannot bleed a
nation that never really fought, and a long hard war produces a large indemnity. The other reading is
the classic indemnity one: **the winner's** costs plus a quarter. *I have taken the grammatical
reading. Both are defensible and it is a one-line correction.*

**Either way the cap does something important, and it is Aaron's not mine: war cannot be a
money-making machine.** Whatever the basis, repayment is bounded by what a war cost rather than by
what the loser owns. **So the cash is at best a refund with a margin, and the real prize is always
the ground.** That is a stronger anti-snowball device than anything in §G, because it removes the
incentive to farm weak neighbours for treasure rather than for territory.

**And "bad things happening" is not vague — it is two built mechanisms.** Verified 7 September:

- **Crises** are authored with *"a trigger over the stocks"*, and war weariness is one of the five
  stocks. A war that drags makes the authored crises fire.
- **Elections read war weariness directly.** A government gets one swing against its own population's
  ideology, made of the four things it is answerable for — quality of life, authority, civil
  liberties and **war weariness**.

**✅ This closes the risk recorded under ruling 6.** I logged that a player could be held in a war
they cannot leave by an opponent willing to bleed. Ruling 15 answers it without new machinery:
**the stubborn opponent's own electorate removes them.** A government that will not make peace watches
its weariness climb into an election it then loses, and a new government is a new person. Refusal is
survivable for a while and not indefinitely, which is the correct shape.

**C82 — The civil war is a consequence of SUCCESS, not of the fight, and the two must not be merged.**
*Default taken, flagged rather than asked.* Ruling 14's two outcomes are about beating the defender.
The existing civil war — triggered when what you swallowed flips your leading ideology or exceeds 15%
of what you held — is about what winning does to *you*, and it keeps its own three outcomes. **They
stack: you can take the ground and lose the country.** That is scenario 1 in §7 and it is the story
this whole round exists to tell, so the two rolls should stay separate.

---

### THE SPINE, continued — how a grudge ends

**Ruling 17 — a grudge fades on time, there is a sixth state between Hostile and Peace, and the
reunification rivalries never fade at all. (Aaron, 9 September 2026.)**

> *"I think that grudge should fade over time. Maybe there is another state — wary — in between
> hostile and peace — so you can still trade with them and interact and they will make a trade with
> you but are wary and cautious. I think though having a trade deal and other things could increase
> how fast that state changes. but like you said if there is a growing movement or something else
> that would slow down how fast they get to peace.*
>
> *I also think that all five texas states start hostile and they will all stay feeling that way at a
> minimum. Same with California, and the other city states trying to reunify the USA. That way it
> creates impositions and challenges. I think Austin would be wiped out pretty quickly because they
> have no trade possibility then, but that is ok with me."*

**Four parts, and the third is one I did not offer.**

**(a) The clock is real and it always runs.** I proposed that hostility should end only when its
cause cleared, with Aaron's clock as a cooling-off period afterwards. **Rejected.** Time is what ends
a grudge.

**(b) There is a sixth state, and it is called Wary.** It sits between Hostile and Peace. **Trade and
dealings are permitted** — the other nation will make a deal with you — but guarded. A cooling grudge
passes *through* it rather than jumping to Peace.

**(c) The causes set the speed of the clock rather than gating it.** A trade deal and other good
standing make a pair cool **faster**; a growing movement or another live cause makes them cool
**slower**. *This is the part I missed, and it is better than either option I put in front of him.* I
framed the question as cause **or** time. The answer is **time, at a speed the causes set** — which
gets the permanent-rivalry feel where a cause is genuinely live, without a pair ever locking solid,
and without the state machine ever blinking.

**(d) The reunification contests are a floor, not a rate.** All five Texan successors stay Hostile
with each other **at a minimum, permanently**. The same for the five Californias and for the eastern
capitals contesting the Union. Cause 2 of ruling 4 does not slow a clock — it **removes** one. Hostile
is the best those pairs can ever be, and the only way out is for the contest itself to end.

**Why (b) and (c) together fix the flicker I warned about.** The objection to a pure clock was that a
pair with a live cause would expire into Peace, be re-checked, and snap back to Hostile — a
relationship that blinks rather than fades. Wary absorbs it: the step down from Hostile is to a
guarded peace, so even a pair that sours again moves Hostile → Wary → Hostile, which reads as *a
relationship that keeps going wrong* rather than as a machine glitching. And because a live cause
slows the clock, most such pairs never reach the step in the first place.

**And it makes Hostile leave a mark.** Under the old shape a quarrel ended and the world forgot. Now
every quarrel is followed by a period in which the two nations deal with each other *cautiously* —
which is the diplomatic equivalent of the dated, decaying memory list the game already keeps, and
sits on top of it exactly the way ruling 5 said a state should.

---

**⚠ NAMING — Aaron wrote "weary"; recorded here as "Wary", and it is one word to correct.**
From his own description — *"you can still trade with them and interact… but are wary and cautious"* —
the sense is plainly *wary*: guarded, watchful. **"Weary" is already taken and heavily so:** war
weariness is one of the five power stocks, it rises with fighting and falls only with peace, and both
the crises and the elections read it. A diplomatic state called Weary would put two unrelated things
under one word on the same screens. *Renamed on that ground alone. If Aaron meant the state to carry
the tiredness sense, the word to use is something else again — Cold, Guarded, Cool — but not the one
the stock already owns.*

---

**C90 — What Wary costs should be ruling 9's four costs at a fraction, and one of them at zero.**
*Claude's proposal, unruled.* Ruling 9 gave Hostile four costs. The natural shape for Wary:

| Ruling 9's cost of Hostile | In Wary |
|---|---|
| Their tolls on your goods rise | **Rise, less** |
| What they demand before granting a crossing rises | **Rises, less** |
| Movements matching them grow faster inside you | **Zero** — this is the cost that makes a quarrel self-sustaining, and Wary is the state a quarrel goes to *die* in |
| Guarding the border costs more | **Costs more, less** |

**The third row is the load-bearing one.** If Wary still accelerated the neighbour's movement inside
you, it would keep its own cause alive and the pair would never reach Peace — the exact loop ruling 17
was answering. *Setting it to zero is what makes Wary an exit rather than a second Hostile.*

**C91 — "Other things" that speed the thaw are already built, and they are the same four the game
uses everywhere.** Aaron named a trade deal and left the rest open. The candidates all exist as
standing facts and none needs new machinery: **a live trade deal**, **a granted transit corridor**,
**recognising them** *(measured as worth more than everything else combined)*, and **being in a
coalition together rather than on opposite sides of one**. *Proposed, not ruled.*

**C92 — The floor in (d) needs one word: does it freeze the state, or only the floor?**
*Default taken, flagged rather than asked.* Two Texans at Hostile can still declare war, sign a
cease-fire and sign a peace treaty — the floor stops them **descending below Hostile**, it does not
stop them moving. So a Dallas–Houston peace treaty is possible, it runs its term, and when it lapses
they land back on the floor rather than in Peace. **That makes a treaty between mirror images a thing
you have to keep renewing rather than a thing that solves anything**, which is the right feel and it
falls out of the floor without a rule of its own.

**C93 — The floor ends when the contest does.** Ruling 19 of round 1 named the four contests and who
may win each. If one claimant wins outright — or if a claimant ceases to exist — the contest is over
and the floor goes with it. **A game where Dallas unites Texas is a game where the floor lifts.**
*Proposed, not ruled, and it is the only exit (d) has.*

---

#### ⚠ FINDING — the accelerant stacks, and Texas is where it shows

**Ruling 9's third cost now runs forever on thirty-three pairs, and on ten of them it runs four times
at once.**

Ruling 17(d) makes the five Texan successors permanently Hostile with each other — ten pairs. Ruling
9.3 says hostility makes the movement matching the other nation grow faster inside you. But **A Free
Texas is one movement with five claimants**, so for Dallas, the movement accelerated by its quarrel
with Houston is *the same movement* accelerated by its quarrels with San Antonio, Austin and El Paso.

**If the acceleration stacks per hostile neighbour, every Texan nation carries a permanently
quadruple-accelerated separatist movement**, with a ceiling up to 0.60 against a secession threshold
of 0.40. Areas cross the line, defect to whichever claimant they sit closest to, and **Texas reunifies
itself by defection on a timer, the same way, in every game.** That is a script rather than a story.

**Proposed default, flagged rather than asked: the acceleration does not stack — a movement takes the
largest bonus among the hostile pairs that match it, not the sum.** One quarrel and four quarrels then
differ in *kind* rather than by a factor of four, which is also the honest reading of ruling 9.3: the
mechanism is "your quarrel feeds their friends inside you", and Dallas's four quarrels are with people
who all want the same thing.

**This is the first thing the closing trace of this round must run**, in place of the loop that ruling
17 closed. Scenario 2 in §7 is where it will show.

---

#### ⚠ FINDING — Austin's death is accepted, but the reason Aaron gave is not the reason it happens

**Aaron accepts that Austin may be wiped out early: *"they have no trade possibility then, but that
is ok with me."* The acceptance stands. The mechanism needs correcting, because it is not a trade
ban — it is transit dependence.**

**Nothing yet ruled says Hostile prohibits trade.** Ruling 2 gives that prohibition to **War** alone,
and ruling 9's four costs of Hostile are all *prices*, not bans. The proposal that a hostile pair
cannot open or renew a deal is banked under §8 question 1 and **has never been ruled**.

**What actually strangles Austin is the map.** Austin holds thirteen Areas in central Texas with **no
ocean port and no international border** — it is one of the fourteen nations that reach the world only
across a neighbour's ground.² Under 17(d) all four of those neighbours are permanent enemies. So
ruling 9's first two costs — their tolls rise, and what they demand before granting a crossing rises —
apply to **the whole of Austin's foreign trade, forever**. It does not need a ban. It needs a toll.

**And the project has already answered a version of this question, in the other direction.** When a
nation is unrecognised it loses bilateral trade with everyone who will not admit it exists — but the
world market stays open to it at a smuggler's rate, **deliberately**, because *"refusing external
trade outright would make an unrecognised landlocked state unplayable and would also be untrue — what
an unrecognised country loses is the margin, not the trade."*³ **That is the precedent, and it says a
diplomatic status should take the margin rather than the trade.** Austin's case is harder, because
Austin has no world market of its own to be given a haircut on.

**So the open question is now urgent and it jumped the queue: does Hostile permit trade at all?**
Aaron's Austin sentence assumes it does not. The recognition precedent says it should. **The two
answers give a very different Austin** — squeezed, or dead — and he has accepted the harsher one
without being asked the question directly.

*² Austin's encirclement by Dallas, Houston, San Antonio and El Paso is stated in round 1's second
traced scenario and restated by Aaron. "No port and no international border" is plain geography for
central Texas and is consistent with the measured count of fourteen transit-only nations, **but Austin
has not been individually confirmed against that measured list** — one check for stage 3.*
*³ `DESIGN.md`, recognition. Verified 9 September.*

---

**Ruling 18 — Hostile honours what is signed and permits nothing new. (Aaron, 9 September 2026.)**

> *"If you have an ongoing trade deal it stays in place until the end of the trade deal but no new
> ones can be signed with them."*

**A third answer again, and it is better than either I offered.** I proposed that Hostile takes the
margin rather than the trade; the alternative was a flat prohibition. Aaron's rule is neither: **what
is signed runs to its term, and nothing new gets signed.** A quarrel does not cut the rope — it stops
you tying another one.

**It completes a four-step ladder of permission, and every step is now different from its
neighbours.**

| State | New deals | Deals already signed |
|---|---|---|
| **Peace** | Freely | Run |
| **Wary** | **Yes, guarded** — Aaron: *"they will make a trade with you but are wary and cautious"* | Run |
| **Hostile** | **None** | **Run to term, then die** |
| **War** | None | **Prohibited — broken on the spot** |

*This is what makes the spine worth having. Before ruling 18, Hostile and War differed only in whether
you could attack. Now each of the four permits a measurably different amount, and a player can feel
the difference between them without being told.*

**C94 — Ruling 18 gives the deal term a meaning it did not have, at no cost.** A trade deal runs 2, 4,
8 or 20 turns, and until now the term was a trade between price and flexibility. **Under ruling 18 a
long deal is insurance against a relationship going bad.** Twenty turns with a neighbour you might one
day quarrel with is a hedge; two turns is exposure. An existing lever acquires a second dimension and
nothing had to be built. *This is the cheapest thing in the round.*

**C95 — And it creates a real reason to prefer Hostile to War, which is the nastiest option the game
has produced yet.** C57 established that declaring war on a trading partner **breaks** a signed
agreement — and Aaron has already ruled (Control Board, 5 September) that breaking a deal early
damages your reputation, makes other nations warier of dealing with you, and raises what they ask.
**Ruling 18 lets deals *lapse* instead. No broken contract, no reputation cost.**

So a nation that wants to strangle a neighbour without paying the price of being seen to has a move:
**manoeuvre them into hostility and wait.** The trade dies on its own schedule, the ledger records
nothing against you, and the victim watches a clock they cannot stop. *That is C72's justification
ladder read from the other end — not "how cheaply can I attack them" but "how cheaply can I hurt them
without attacking at all" — and it is the purest expression of ruling 1 in either round: a war that
never happens, fought entirely through the economy.*

**C96 — What Hostile does to a corridor is not settled by ruling 18, and for the fourteen
transit-only nations it is the question that matters.** A trade deal says two nations will trade; a
**transit grant** says the goods may cross somebody's ground, and they are different objects.¹ Ruling
18 speaks only to deals. *See the question under the finding below.*

---

#### ⚠ FINDING — the corridor machinery already builds Aaron's rule, and it is crueller than the rule

**Verified in `DESIGN.md`, 9 September.** A transit grant is *"a standing permission from one nation
to another, at a rate, for a term"*, directed and per-mode. And three properties decide Austin's fate:

- **Closing one takes notice — four turns by default** — and a grant under notice keeps carrying goods
  for exactly that period. *"A corridor holder who gives notice does not stop a deal, he starts a
  clock on it."*
- **A deal whose route has gone pays nothing while its term keeps running down.** In the document's
  own words: *"A five-year contract can be burned to nothing by a neighbour who never touched it."*
- **Closing corridors counts against your standing**, weighted against how many you hold, over a
  twenty-turn window.

**So the third bullet is the brake, and it is the good part.** Strangling a neighbour by shutting
their door is **not free** — it costs the strangler reputation, and it costs more the more corridors
they hold. **Austin's survival therefore rests on four separate nations each deciding whether the
pleasure of killing Austin is worth the standing it costs them.** Some will pay it and some will not,
and it will differ between games. *That is the difference between a story and a script, and it is
already built.*

**And the second bullet is why Austin dies anyway, if they do.** Austin's deals are with nations
beyond Texas, and ruling 18 protects those deals — they are not with a hostile nation, so they run.
**But the goods still have to cross Dallas.** A revoked corridor leaves a live twenty-turn contract
paying nothing for sixteen more turns, and ruling 18 does not let Austin replace it, because the only
nations it can reach are the four it may no longer sign with. *Aaron's acceptance of Austin's death
stands, and this is the mechanism: not a ban on trade, but a door closed by somebody willing to pay
for closing it.*

*¹ `DESIGN.md` §6.7, "An agreement, not a right". Verified 9 September.*

---

**Ruling 19 — Austin is the legitimate Texas, and the other four are rebels. (Aaron,
9 September 2026.)**

> *"In the story Texas fell apart, so we will say that because they were going to secede from the
> union peacefully, Austin is recognised as the actual state of Texas by all other nations — whereas
> El Paso, Dallas, Houston and San Antonio are all seen as secessionist movements. That would give
> Austin a bonus while the others have negatives."*

**This is a story ruling with an enormous mechanical consequence, and the mechanism is already
built.** Recognition in this game is a directed fact — who admits that you exist — and `legitimacy` is
the share of the continent, by weight, that admits it. **What it costs to be a pariah is four things,
all built:** no bilateral trade with anyone who does not recognise you, a smuggler's rate on the world
market, no seat in a coalition, and a standing deficit on Influence.¹

**⚠ And it reverses Austin's fate completely. This is the best thing in the round.**

Recognition is **earned every turn** — by standing, by kinship, by having lasted, by being too big to
ignore — and, **worth more than all of them combined, by the state you broke away from giving in.**¹

**The state Dallas, Houston, San Antonio and El Paso broke away from is Texas. Under ruling 19,
Austin *is* Texas.**

So Austin — landlocked, ringed by four permanent enemies, holding no route to the world and rated
*brutal* by the game's own faction picker — **holds the single most valuable diplomatic asset on the
board, and four different nations each need their own copy of it.** Its whole game becomes selling
recognition to its enemies, one at a time, for the passage it cannot otherwise buy.

*The scale of the asset is measured, not guessed: in a played game, Texas's chance of recognising the
State of Jefferson ran at **0.07 a turn** while California called it a rebellion and **0.24** the
moment California signed — and Jefferson went from 14% recognition to 100% in twelve turns.¹*

**C97 — Austin stops being a difficulty setting and becomes a *different game*.** Every other nation
on the board plays economy-and-territory. Austin plays one hand of cards it can never draw more of.
It is bankrupt, encircled, and holds four keys; it can sell them for corridors, or hold them to keep
four enemies weak, and it cannot do both. *That is a genuinely distinct opening rather than a hard
one, and it came out of a story instinct rather than a mechanic.*

**C98 — The four rebels get a shared problem and a reason to hate each other more than they hate
Austin.** All four need the same signature from the same nation, and Austin can only sell it four
times. **They are competing for Austin's favour while permanently hostile to it and to each other.**
That is a four-way auction nobody designed, running under a floor that guarantees none of them can
ever be friends. *The Texas board is now the most interesting corner of the map, and it is where the
closing trace should look hardest.*

**⚠ DEPARTURE — this is the first deliberate asymmetry on the opening relations board, and the
scenario says the board opens quiet.** The shattered scenario writes only back-dated `lost` entries
for the Deseret cession, and its own note is explicit: *"Utah does NOT open refusing recognition: the
relations board starts quiet and the player watches it sour."*² Ruling 19 seeds recognition against
four nations on turn 0, which reverses that principle for the Texas corner.

**I support it, and the argument is already in this document.** C46 and C65 both say the opening board
should be seeded with **states**, not only with memories — *"a war that ended two years ago does not
leave two nations at Peace."* Ruling 19 is that argument applied to recognition instead of hostility.
It is a change to scenario **content**, not to geography or to the ideologies, so it does not touch
the two things §0a says are fixed. *Recorded as a departure so that nobody later reads the "starts
quiet" note as still governing and treats this as a bug.*

*¹ `DESIGN.md`, recognition. Verified 9 September.*
*² `content/scenario-shattered.json`, the `relations` note. Verified 9 September.*

---

**Ruling 20 — a corridor behaves under hostility exactly as a trade deal does. (Aaron,
9 September 2026.)** *"I still think that it should stay the same though."* Existing grants run; no
new grant may be made with a hostile nation.

**⚠ BUT THE RULING WAS MADE ON A PREMISE THAT IS WRONG, AND THE CONSEQUENCE FLIPS. Asked, not
assumed.**

Aaron asked: *"Tolls don't have trade deal term lengths right? They are just set tolls?"*

**They are not.** Verified in the running game, 9 September. A corridor is negotiated with **the same
term lengths a trade deal has**, and the player-facing text says so in as many words: *"It lasts the
term you agree, they take a cut of what passes, and either side can end it with four turns'
notice."*³ The panel shows a live corridor as *"N more turns at X%"*. **A corridor is a term contract
with a notice period on top, not a standing toll.**

| | Trade deal | Corridor |
|---|---|---|
| A term you choose | ✅ | ✅ **the same lengths** |
| A rate | ✅ | ✅ up to a 60% ceiling⁴ |
| Notice to end early | — | ✅ **4 turns**, either side |
| Ending it costs your standing | ✅ *(D of 5 Sept)* | ✅ **weighted ×2**⁴ |

*The four-turn notice is deliberately set to match the largest expiry warning a trade deal gives, "so
a player learns one rhythm for **something you rely on is ending** rather than two."⁴ The two objects
were built to feel the same, which is why the premise was a reasonable one to hold.*

**What this does to Austin, and it is the opposite of what I told Aaron one message ago.** I said the
brake was that strangling Austin costs the strangler standing, so four nations each have to *decide*
to pay for it. **That brake only applies to revocation.** If corridors have terms and ruling 20 blocks
renewal, then **Austin's routes die by themselves when their terms run out. Nobody decides. Nobody
pays. Nobody even acts.** The game strangles Austin on a clock while all four Texans stand still.

**And there is a second consequence, which is structural and worse — see the finding.**

*³ `js/actions.js`, the corridor panel. ⁴ `js/tunables.js`: `transit.noticeTurns` = 4,
`transit.renegeWeight` = 2, toll ceiling 0.60. Verified 9 September.*

---

#### ⚠ FINDING — two hostile nations now have no way to agree on anything at all

**Put rulings 18 and 20 together with ruling 7 and a door closes that nobody meant to close.**

- **Ruling 18:** hostile nations may sign no new trade deal.
- **Ruling 20:** hostile nations may grant no new corridor.
- **Ruling 7:** a **peace-treaty** is reached only from a **cease-fire**, and a cease-fire is reached
  only from **War**.

**So the only instrument by which two hostile nations can come to terms is a war.** The thirty-three
pairs that open Hostile — and the ten Texan pairs that are hostile *permanently* under ruling 17(d) —
must fight each other before they can agree on so much as a road.

**This lands hardest on the nation ruling 19 just made interesting.** Austin holds four keys its
enemies need and **has no legal instrument with which to sell one.** It cannot trade the recognition
for a deal or for passage, because both are barred by hostility. Ruling 19 hands Austin a priceless
asset and rulings 18 and 20 leave it no way to spend it. *That is not drama; it is a gap.*

**Proposed answer, and it is the next question rather than a default, because it changes the shape of
the spine:** let a **peace treaty be proposed from Hostile**, not only from a cease-fire. Two hostile
nations would then have exactly one instrument — the heavyweight, formally negotiated, term-limited
one, whose four levers already include trade — and the floor in ruling 17(d) would have exactly one
door through it. **Mirror-image rivals could deal, but only formally, only temporarily, and only by
renewing.** *That is the right feel, and it needs no new machinery: the negotiation card exists and a
treaty already has its levers.*

---

**Ruling 21 — hostility is resolved by time and by diplomacy, never by a treaty. (Aaron,
9 September 2026.)**

> *"Cease-fire can only result from a war. Hostile should only be resolved over time, but I think
> there could be a diplomatic option (discussed later) where they would be basically improving
> relations and it would speed things up."*

**My proposal is rejected and the spine keeps its shape.** A peace treaty is not reachable from
Hostile; a cease-fire comes only out of a war; ruling 7's table stands unchanged. **The answer to
"what can two hostile nations do about it" is not an agreement — it is an *action*.** Somebody spends
a turn improving relations, the clock runs faster, and only once the pair has cooled to Wary can they
sign anything at all.

*This is ruling 17(c) turned from a passive modifier into something a player does, and it is better
that way: the thaw stops being weather and becomes a move.*

**Its home is round 5, Diplomacy**, which the ideation plan already describes as the round where
*"recognition, alliances against a conqueror, being nobody"* land. **Handed forward in §4 rather than
designed here.**

**C99 — The machinery for "improving relations" already exists, and it is richer than expected.**
Verified 9 September. The dated, decaying, directed memory list is **not** the all-negative vocabulary
this document assumed. Sixteen kinds, and five of them are good things:¹

| Good | Bad |
|---|---|
| `granted` handed us ground · `traded` did business with us · **`recognised` admitted we are a country** · `treatied` signed a pact with us · `aided` paid for something of ours | `annexed` · `warred` · `witnessed` · `absorbed` · `broke` · `seceded` · `lost` · **`betrayed` recognised our breakaway** · `reneged` |

**So a diplomatic thaw does not need a new ledger — it needs an action that writes one of five entries
that already have weights.** Round 5 inherits a half-built system rather than a blank page.

---

#### ⚠ FINDING — Austin's asset is a veto, not a currency, and that is a better game than selling it

**Rulings 18, 20 and 21 together mean Austin can never sign anything with any of its four
neighbours.** Not a deal, not a corridor, not a treaty — and the floor of ruling 17(d) means the
thaw of ruling 21 can never carry those pairs below Hostile either. **The only instrument left
between Austin and a Texan neighbour is a war**, which is the one door ruling 7 leaves open.

**But recognition needs no instrument, because it is unilateral.** One nation simply admits another
exists. No negotiation, no agreement, no state requirement. **So Austin's asset works after all — as
a thing it can withhold rather than a thing it can sell.**

**And withholding is enormous.** Under ruling 19 the four rebels open unrecognised, which costs each
of them: no bilateral trade with anyone who does not recognise them, a smuggler's rate on the world
market, no seat in a coalition, and a standing deficit on Influence. **Austin, bankrupt and encircled,
holds four larger nations down by refusing to sign — and the game already measures the parent's
signature as worth more than every other route to recognition combined.**

*So the Texas corner opens as: one starving nation with a veto, and four crippled ones who can only
take it by force. Austin's game is to stay alive long enough to matter, and the four have a reason to
attack it that is nothing to do with its land.* **That is scenario 2 in §7 — "a three-Area state that
is not worth eating" — inverted into a state that is worth eating for a reason the panel can name.**

**C100 — Does conquering Austin end the veto, or make it permanent?** *Open, and it is round 5's.*
If Austin ceases to exist, do the four become recognised by default — inheriting legitimacy from the
nation they destroyed — or does killing the only country that could ever have legitimised them leave
them pariahs for good? **The first makes conquest the answer; the second makes Austin's survival
something its enemies need.** *Not assumed either way.*

*¹ `js/relations.js`, `KINDS` and `LABELS`. Verified 9 September.*

---

**Ruling 22 — the repayment cap is measured against the war costs of whoever *sends* the treaty.
(Aaron, 9 September 2026.)**

> *"I would say that it would be the one sending the deal. So Utah invades Idaho. Idaho ends up
> winning. They send a deal to Utah — some of their counties — but because the war cost them money,
> Utah has to pay them 1.25 the cost of the war so far. (Or maybe Utah comes back and says they will
> pay 0.5 the cost of their war and give the counties, and Idaho accepts.)"*

**Neither "the winner's" nor "the loser's" — the *proposer's*. And it is better than both, for a
reason that goes past this lever.**

**It means the game never has to decide who won.** Ruling 10 already moves ground during the war and
leaves the treaty to settle the tenure, so there is no victory flag anywhere in the system and nothing
that declares a winner. A cap priced off "the winner" would have required inventing one. **A cap
priced off the proposer needs nothing that does not already exist:** whoever opens the negotiation
prices their demand against what the war cost *them*, and the other side accepts, counters or
declines. *The asymmetry of a peace settlement falls out of who spoke first.*

**Three properties, all of them good:**

- **The number is observable to the nation using it.** A player knows what their own war cost. The
  slider's maximum is a figure they can see, which is what a negotiation card needs.
- **War still cannot be a money-making machine**, which is ruling 15's stated purpose. The ceiling is
  1.25× your own outlay, so the best case is a 25% margin on money you have already spent. Spending
  more to be allowed to demand more is a losing trade at every scale.
- **It is symmetric, so an aggressor may demand too.** Utah invades, Utah wins, Utah takes ground *and*
  bills Idaho for the cost of taking it. That is what a historical indemnity actually is, and it needs
  no special case — an absurd demand is simply declined, and ruling 8 already makes the reply a pure
  function of the world and the terms.

**"The cost of the war so far" is a running total**, read at the moment the treaty is sent. So the
ceiling moves while the war runs, and a nation that has been bleeding for twenty turns may ask for
more than one that has been fighting for four.

**C101 — A counter-offer haggles within the basis; it does not re-base it.** *Default taken, flagged
rather than asked, because this is the same species of one-word ambiguity that left 1.25× unsettled
for two days.* In Aaron's example Utah counters at **0.5** — a fraction of the number Idaho named,
not a new cap computed from Utah's own costs. **The treaty under negotiation has one basis, set when
it was opened.** The alternative would flip the maximum mid-negotiation for no reason the player could
see. *One line to correct if wrong.*

---

#### ⚠ FINDING — traced against Aaron's own example, a defender can claim nothing

**Ruling 22 works only if "the cost of the war" means more than what you spent attacking. In the
example Aaron used to illustrate it, it does not — and Idaho's claim comes out at zero.**

The one war cost this game currently debits is **the price of an attack**, taken from the treasury
before each roll — per Area and per head.¹ **Idaho never attacked.** Utah invaded; Idaho defended and
won. So Idaho's attack spending is **nothing**, 1.25× nothing is nothing, and the nation the rule was
written to compensate **cannot ask for a penny.**

**What a defensive war actually costs, and three of the four are already measurable:**

| | |
|---|---|
| **Attacking** | The per-Area price, debited before the roll. **Zero for a pure defender** |
| **Holding** | Occupation upkeep, which is superlinear in how many Areas you hold |
| **Not trading** | War prohibits trade (ruling 2) and ruling 18 stops the deals being replaced. **The game knows exactly what a deal was worth** |
| **Guarding** | Ruling 9.4 — a hostile or wartime border costs more to hold |

**The third is the big one and it is the one that makes Idaho whole.** A defender's war is expensive
precisely because it is not fought with money — it is fought by having your economy shut off. *A rule
that counts only attack spending would price the invasion and ignore the damage.*

**Recommendation, and it is question 10 rather than a default, because it sets the size of every
indemnity in the game:** the cost of a war is **what the war took out of your treasury *and* out of
your trade** — spent attacking, spent holding, and not earned because the fighting closed your
markets.

*¹ Verified 7 September and restated under ruling 14.*

---

**Ruling 23 — the cost of a war belongs to the economy of war; and an Area under attack produces
nothing that turn, whether or not it falls. (Aaron, 9 September 2026.)**

> *"I think that the cost of war will be something that we need to create when we get to the economy
> section of war. My thought is that if Idaho is attacked they would lose income from those counties.
> And maybe that is another thing. If a county is attacked — even if not conquered — it doesn't
> produce any income that turn."*

**(a) The definition is deferred, and it is the right call.** What a war costs is an economy question
and this round would be inventing it in the wrong place. **Handed to round 4**, where §4 already
carries the entry — now marked blocking, because ruling 22's repayment lever cannot be priced until
it lands.

**(b) An attack switches an Area off for the turn.** This is a new mechanic and it is the first thing
in the round that gives a **failed** attack a consequence for the defender.

**⚠ It refines ruling 14 and the refinement is worth stating.** Ruling 14 said an attack has two
outcomes and a failure costs you what you already spent — *"that was their turn and they didn't
conquer anything."* **Under ruling 23 a failed attack is no longer nothing.** It cost the defender a
turn of that Area's production. So a 30% attack is not 70% wasted; it is 30% conquest and 100%
denial. *The arithmetic of attacking changes, and it changes in the direction ruling 1 points: the
attack's reliable effect is economic and its unreliable effect is territorial.*

---

#### ⚠ FINDING — the machinery exists, it is sector-aware, and that makes the mechanic bigger than "lost income"

**Verified 9 September: output is already held per Area as a six-element vector, one figure per
sector, across 1,688 Areas.**¹ The six are **Agriculture, Resource Extraction, Manufacturing, Trade &
Transportation, Finance, Information Technology.**

**So "this Area produces nothing this turn" is a mask on a number that already exists — and it does
not deny *income*, it denies a *named kind of production*.** Attacking the wrong farms is a food
shortage. Attacking a Trade & Transportation Area is an attack on the thing that moves everything
else.

**And that joins this mechanic to ruling 4's third cause of hostility.** A nation desperate for a
resource because a neighbour will not sell it can now *take the neighbour's production offline*
instead — or be driven to war by exactly that being done to it. **An attack becomes a way to make
somebody need something**, which is a far more interesting act than a way to take ground.

*The mechanic Aaron described as denying income turns out to deny supply, and the game already knows
which Areas make what. Recorded because it means this is worth more than it cost to say.*

---

**C102 — The raid, and it is the risk in ruling 23.** If an attack denies a turn of output whether or
not it succeeds, then **attacking with no intention of winning becomes a strategy**: pay the price,
lose the roll on purpose, switch off a rich Area, repeat. Three things stand in the way and none has
been measured:

- **The attack price is charged per Area *and per head***, so switching off a rich Area costs more in
  proportion to its being worth switching off.
- **It costs your one action for the turn**, and a nation raiding is a nation not doing anything else.
- **Ruling 23 raises what the victim may demand** under ruling 22, because their lost production is a
  war cost — so raiding a nation makes its eventual indemnity larger. *A pleasing loop: the more you
  hurt them without beating them, the more they can bill you for.*

**The open question is whether the price of an attack exceeds one turn of the target's output.** If it
does not, raiding dominates. *Measurable, and it is stage 3's — flagged here so it is measured rather
than discovered.*

**C103 — And it puts a price on the one-Area-or-three question that was not there before.** §8's
question 15 asks whether an attack targets one Area or up to three. **Under ruling 23 that is no
longer only a question about conquest — it decides whether a single action denies one Area's
production or three.** A three-Area strike is three times the raid for the same turn.

*¹ `data/economy.json`. Verified 9 September.*

---

**Ruling 24 — one Area per attack, and the per-turn cap and the cooldown both go. (Aaron,
9 September 2026.)**

> *"One area per attack, and I want to remove the 3 per turn and cooling down period. If a nation has
> the money and manpower they can attack and organize as big of an attack as they want."*

**An attack names one place.** Ruling 12's *"I decide I want to invade / annex **an area**"* is taken
literally, and the stated percentage covers a place rather than a package. **The absolute cap of three
Areas a turn and the four-turn wait between annexations are both removed**; what a nation can do is
bounded by **money, manpower and reach** rather than by a rule that says no.

---

#### ⚠ FINDING — this makes conquest 67% FASTER, not slower, and the reason matters

**Measured against the running game, 9 September.**¹

| | Rate |
|---|---|
| **Today** — a burst of **3** Areas, then a **4-turn** wait | **3 Areas per 5 turns = 0.6 a turn** |
| **Under ruling 24** — 1 Area, every turn, no wait | **1.0 a turn** |

**So the tightening is smaller than the loosening.** "One per attack instead of three" sounds like a
two-thirds cut and is not one: **one action per turn already capped attacking at one strike a turn**,
so the budget of three was never reachable in the first place — it was a cap on a thing the action
budget had already capped harder. **The cooldown was the device that actually throttled the long run,
and it is the one being removed.** Twenty turns of war now takes twenty Areas where it used to take
twelve.

**I support the change anyway, and the reason it is safe is not the obvious one.** It is not safe
because one-per-attack is stricter. It is safe because **the brake has moved from the rulebook to the
electorate.**

**War weariness is a stock of its own.** It rises with wars fought and with ground taken, it falls
**only** with peace, and two built systems read it: **crises trigger over the stocks**, and an
**election** gives the population one swing against an incumbent built from four things, of which
weariness is one. *A nation attacking every single turn drives its own weariness up without pause and
is removed by its own voters.*

**That is ruling 1 exactly.** The limit on conquest stops being a rule that refuses you and becomes a
country that will not carry it. **A player who is stopped by the cooldown learns nothing; a player who
is stopped by an election has been taught what the game is about.** *The device Aaron removed was the
kind this game keeps replacing with consequences, and this is the same move made once more.*

*And the anti-snowball history is not endangered, because it was never about this number.* Wyoming's
27 Areas becoming 1,167 in nine turns happened under a **relative** cap — a multiple of your own size,
which compounds. The absolute cap replaced it. **An absolute cap of one, arriving by way of the action
budget, cannot compound at all.**

*¹ `js/tunables.js`: `annex.budgetAreas` = 3, `annex.cooldownTurns` = 4. Verified 9 September.*

---

**⚠ C104 — Ruling 24 makes the raid in C102 unbounded in time, and that moves the measurement from
"should be checked" to "must be checked before alpha".** Under the cooldown, attacking to deny rather
than to win was available in a burst once every five turns. **With no cooldown it is available every
turn, for ever.** The whole question is whether the price of an attack — **$250M per Area plus $400 a
head**¹ — exceeds a turn of that Area's output. If it does not, a nation can profitably switch off a
neighbour's best county every turn indefinitely, and nothing in the rules stops it. *Stage 3's
measurement; recorded here because ruling 24 is what made it urgent.*

**C105 — Two brakes were not named and are kept by default.** *Flagged rather than assumed.* Ruling 24
removes the cap and the cooldown. It does not mention **Reach** — the bounded search out from your seat
of government that prices distance and refuses a move outright past a limit — or the **four-times-your-
size shield**, which makes a neighbour more than 4× your population *and* GDP untouchable. **Both
survive.** *But see the question below: the shield sits awkwardly with the sentence that justified this
ruling.*

---

**Ruling 25 — the four-times-your-size shield is removed. (Aaron, 9 September 2026, accepting the
recommendation.)** Nothing refuses an attack on grounds of size any more. **All three of the
hard-refusal brakes on conquest are now gone** — the per-turn cap, the cooldown and the shield — and
what remains is entirely pricing:

| What stops a hopeless attack now | How |
|---|---|
| **Reach** | Prices distance out from your seat of government and still refuses outright past a limit. *The one hard refusal that survives, and it is about geography rather than about size* |
| **The fight itself** | Your Field against their Border as a share, shown before you commit |
| **The price, debited before the dice** | A 5% chance costs twenty times the Area's price to land once (ruling 14) |
| **Your own people** | War weariness rising with every war fought, read by crises and by elections |

**Why this is the right shape and not merely a simplification.** The shield was the last rule in the
conquest system that answered a player with *no* rather than with *that will cost you*. **It also
silenced the strongest story on the board:** El Paso, permanently hostile to Dallas under ruling
17(d), with a movement growing and a corridor shut, was forbidden by the rulebook from so much as
trying. *The case where the fiction is loudest was the case the rules refused to allow.*

**Its known cost, recorded rather than argued:** AI nations will now sometimes throw themselves at
giants and lose, because only bad odds discourage them and the AI scores the same preview the player
is shown. **If that reads as foolish in the alpha, the fix is to make the AI weigh the percentage
harder — not to put the wall back.**

---

**Ruling 26 — occupied ground eventually becomes your country, and how fast depends on whether life
got better. (Aaron, 9 September 2026.)**

> *"It does eventually become your country and there will be certain modifiers that would either make
> it slow down or speed up. So a county that was conquered by a nation that has a higher quality of
> life than the one it originally was in would be more willing to accept that they are a part of a new
> state."*

**The ladder gets its fourth rung and C26/C81 close.** `occupied-war` → `occupied` at the treaty
(ruling 13) → **ordinary ground**, given time and the right conditions. A conquest is no longer a mark
carried for the rest of the game.

**And the modifier Aaron named is not the one I recommended, which is the point of asking.** I proposed
**ideological match** — the thing that already decides everything else in this game. Aaron's is
**quality of life**: people accept a new flag if life under it is better. *That is materialist rather
than ideological, and it is a truer account of how populations actually settle.*

**⚠ It is also, without being designed as one, the strongest anti-snowball device in the round.**

Quality of Life is one of the five power stocks, and **its turn-0 spread across the board is
0.55–0.98** — nearly two to one, the widest band of the four.¹ So the modifier does not apply evenly;
it sorts the continent. **A prosperous, well-governed nation can digest what it takes. A struggling one
cannot, and its conquests stay indigestible for ever.**

*That inverts the logic of almost every strategy game, in which conquest is how a poor nation becomes
rich. Here **you have to be doing well already to absorb anything**, and a desperate nation that seizes
its neighbour's fields is left holding ground that will never become its own. Conquest is a luxury of
the successful. Nobody had to write a rule saying so.*

**C106 — The machinery it stands on already exists and is already authoritative.** The game has one
definition of home ground — *"THE one definition, and the only thing anything should ask. An origin
state's soil is every Area of its state; a nation born in play holds the ground it was founded on.
**Everything else it holds is occupied**"*² — so ruling 13's three flags and ruling 26's countdown both
sit on a function that is already written and already the single source of the answer.

**C107 — The other candidate modifiers, banked not ruled.** Aaron said *"certain modifiers"*, plural,
and named one. The rest of the plausible list, all of them reading quantities that exist:

| Speeds acceptance | Slows it |
|---|---|
| **Higher quality of life than they had** *(Aaron, ruled)* | Lower quality of life than they had |
| **Ideological match** with your government — the multiplicative term behind everything else | A population that sits far from you |
| **`occupied-movement`** — they wanted you *(ruling 13)* | **`occupied-war`** — the war is not even over |
| **Their old nation no longer exists** — there is nowhere to go home to | Their old nation is thriving next door |
| Wider civil liberties than they had | **A heavy garrison** — see C108 |
| **Migration**, which already moves people toward people who think as they do | |

**C108 — The garrison should be the player's lever on this, and it fills the hole round 1 left.**
Round 1 asked conquest for four things and got three; **the fourth was a garrison that holds ground
down *and radicalises it*, where today suppression only subtracts.** Ruling 26 gives it somewhere to
live: **soldiers hold an occupied county quiet but slow its acceptance, because a population under
boots does not become you.** Garrison hard and it never becomes yours; garrison lightly and it may
settle, or it may rise. *Another buy-now-pay-later, which is the shape this game keeps arriving at.*

**C109 — The comparison runs live, and drops out when there is nobody to compare to.** *Default taken,
flagged rather than asked.* Quality of life is measured against **the nation the ground was taken
from, as things stand now** rather than as they stood on the day it was taken — so a county grows
gladder it left if its old country declines, and more resentful if the old country prospers. **If that
nation no longer exists, the comparison drops out** and acceptance runs at its base rate, which is
C107's "nowhere to go home to" arriving by the same route. *One line to correct if the frozen version
was intended; the live one costs nothing extra and tells a better story.*

**⚠ What ruling 26 gives up, stated plainly.** Conquest becomes a viable **long** game again. A patient
player who takes ground that fits them, garrisons it lightly and waits will end up with a larger
ordinary country and no standing penalty on the map. **The permanent cost of conquest now lives
entirely in war weariness and in what the neighbours remember** — the world remembers, and the map
moves on. *That split is deliberate and it is the answer to C81's complaint that the old ladder quietly
told a player never to conquer at all.*

*¹ `DESIGN.md`, turn-0 bands across the 51 nations. ² `js/game.js`, `isHomeGround`. Verified
9 September.*

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
   rule of its own. *Sharper now that ruling 15 has given a treaty four enforceable terms: breaking
   one means stopping the repayments, tearing up the forced trade, or taking the ground back.*
6b. ~~**Is the 1.25× repayment cap measured against the winner's war costs or the loser's?**~~
   **Answered — ruling 22. Neither: the *proposer's*.** Whoever sends the treaty prices their demand
   against what the war cost them, which means the game never has to decide who won.
6c. ~~**What counts as "the cost of a war"?**~~ **Deferred to round 4 by ruling 23**, and recorded
   in §4 as blocking for ruling 22's lever. *Aaron's steer: lost income from the counties fought over
   counts, which is the direction my recommendation pointed.*
7. **Subject and Allied** — deferred by Aaron, but ruling 4's fifth cause needs Allied to exist.
   Worth reopening earlier in the round rather than later.
8. **Can a pair go from Peace straight to War**, or does something have to happen first? C72 assumes
   yes-but-expensively.
9. ~~**Does hostility cool on time, or only when its cause goes away?**~~ **Answered — ruling 17,
   and in a third way.** **Time**, always running, at a **speed the causes set**; a new sixth state,
   **Wary**, between Hostile and Peace; and the reunification contests are a **permanent floor** at
   Hostile rather than a slow clock.
9b. ~~**Does Hostile permit trade at all?**~~ **Answered — ruling 18, and in a third way again.**
   What is signed **runs to its term**; **no new deals** can be signed. Neither the margin-only
   version I recommended nor a flat ban.
9c. ~~**Does Hostile do to a transit corridor what ruling 18 does to a trade deal?**~~ **Answered —
   ruling 20. The same.** *But the ruling was made on the premise that corridors are standing tolls
   with no term, and they have terms — the same ones a trade deal has. The consequence is harsher
   than intended and it is question 9e.*
9d. **Should the opening board seed recognition against the four Texan rebels?** **Answered — ruling
   19, yes**, and it reverses Austin's fate. *Recorded as a departure from the scenario's stated
   "the relations board starts quiet" principle.*
9e. ~~**Can a peace treaty be proposed from Hostile?**~~ **Answered — ruling 21. No.** Hostility is
   resolved by time, sped by a **diplomatic action** handed forward to round 5. Two hostile nations
   have no instrument but war — and Austin's recognition turns out not to need one, because
   withholding it is unilateral. See the finding under ruling 21.
9f. **Does conquering Austin end its veto or make the rebels pariahs for good?** (C100.) *Round 5's,
   but this round created it.*
10. ~~**When you win the roll, do you own the Area or are you standing on it?**~~ **Answered —
    ruling 13**, and in a third way: it is yours at once, shown paler on the map, and flagged by how
    you came by it. The treaty changes the **tenure**, not the border.
11. ~~**What does losing an attack cost?**~~ **Answered — ruling 14.** Two outcomes only, and the
    price was paid before the roll. C78 is superseded.
12. **Does `occupied-movement` apply while the war is still on, or only after a treaty?** *Default
    taken, flagged rather than asked: **yes, during the war too**, because the flag is about who the
    locals are and not about the war. But the transit prohibition still applies while at war, since
    ruling 13's reason for it is the war rather than the resentment. One line to correct if wrong.*
13. ~~**Can ground ever stop being occupied at all?**~~ **Answered — ruling 26. Yes.** The ladder
    gets a fourth rung and modifiers set the speed; **Aaron's named modifier is quality of life**,
    not the ideological match I recommended — which quietly makes conquest a luxury of the
    prosperous. C26 and C81 close.
14. **What does a movement do when you decline its demand, and what does "wait" cost while it
    waits?** (C89.) Ruling 16 says never-delivering is worse than declining, and does not price
    either.
15. ~~**Does an attack target ONE Area or up to three?**~~ **Answered — ruling 24. One.** *And the
    per-turn cap and the four-turn cooldown are removed with it, which makes sustained conquest 67%
    faster rather than slower — see the finding under ruling 24.*
15b. ~~**Does the four-times-your-size shield survive ruling 24?**~~ **Answered — ruling 25. No.**
    All three hard-refusal brakes on conquest are gone; only Reach still refuses, and only on
    geography. Everything else is a price.

*Superseded text of 15, kept for the record:* **Does an attack target ONE Area or up to three?** *(Found by the closing review, 8 Sep.)*
    Ruling 12 says *"I decide I want to invade / annex **an area**"*, singular. What is built takes up
    to **three Areas a turn**, and that cap is an anti-snowball device with a measured history — a
    relative cap once took Wyoming from 27 to 1,167 Areas in nine turns. If an attack is one Area,
    the cap changes meaning; if it is three, the percentage covers a package rather than a place.
    Neither is assumed.
16. **Does answering a demand cost your one action?** (C84.) My proposal, unruled: answering is free
    because it is a screen, obeying costs whatever the obeyed act costs.
