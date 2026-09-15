# The turn

**Stage 2 of five: DESIGN.** What the thing does, what it is measured in, what the player sees, and
what happens at each level. This document is a specification for the Technical Designer, not an idea
bank — the ideas it was built from are in `the-things-above-ideation.md` §5 (W1–W50).

**Depends on:** `GDD.md` only, for the cross-cutting concepts — the phase contract, the plan/resolve
contract, and the determinism rules. **Everything else in this design depends on this document**,
because it decides what a decision costs and when it resolves.

**Status: ruled 15 September 2026**, `DECISIONS.md` **D218**, **D220** and the entries after them.
This supersedes round 7's ruling 1, which deferred the action budget to the Technical Designer on the
belief that it was an architectural question. It is not; see §1.

---

## 0. The rule this replaces was never a decision

**"One action per nation per turn, and it ends the turn"** was written at the head of all seven
ideation rounds, and five rounds deposited complaints under it.

**Checked, 15 September 2026: there is no entry in 216 decisions establishing it.** Every mention of
it in `DECISIONS.md` is a complaint about it or a deferral of it — D195, D199, D201, D215. It was
implemented by a programming session that had been given free rein, and it hardened into a premise
because seven documents wrote it down as one.

**So round 7's ruling 1 was deferring an accident rather than a design.** That is why the question
came back to the designer, and the line between the two stages is politics ruling 10, already
ratified: *what should happen* is ideation's, *what is measured and what the effects are at each
level* is design's, **the values are the architect's.**

---

## 1. What a turn is

**One turn is one quarter.** Four turns to a year. The game opens **1 March 2036** — the eve of two
hundred years since Texas declared itself a nation — and ends in **2086**: **200 turns, fifty years.**
D163 set the quarter and its reason still holds: *every rate in the engine is tuned per quarter and
the label buys flavour only.*

**A turn is a ROUND, and this is the most important structural fact in the document.** A round is one
pass through all sixty-one nations in a shuffled order. Each nation gets its own slot. **When the
pointer wraps, the world advances once** — every model phase, from political drift through migration
and growth, runs at that moment and not before.

> **So one turn = one quarter = sixty-one nation-slots resolved in sequence, followed by one
> simulation step.**

**There is no "has acted this turn" flag anywhere, because under the old rule there did not need to
be one: a nation's turn *was* its action.** Removing the action budget removes that identity.
**A nation's slot now ends when the player or the AI says it does**, which is a change to how the
game is stepped rather than a cap being adjusted. *Round 7's finding A, and it is the first thing the
Technical Designer needs to know.*

### 1.1 The three beats

| | | Costs |
|---|---|---|
| **1. The briefing** | What landed, what came back, what arrived unbidden — and you answer what it asks | **Nothing** |
| **2. The turn** | Start as many things as you like | **Money and time** |
| **3. End turn** | The world resolves and the briefing comes round again | — |

**The briefing is not homework standing in front of the turn. It is the seam between turns, and in
this design it has to be.** Two reasons, and the second is the load-bearing one:

1. **With no action budget, nothing else makes a turn discrete.** There is no *you have used your
   action* moment. The End Turn button is the only boundary there is.
2. **Nothing completes in one turn, so the briefing is the only place completion is ever felt.** If a
   player never sees a bar fill, the projects are invisible. **The briefing is the payoff loop** —
   which is the mechanism under *"one more turn"*: you end the turn to find out what finished.

---

## 2. The action economy: there isn't one

**A nation may start as many things as it likes in its slot.** There is no budget, no points, no cap
and no cooldown.

**The limits are three, and none of them is a rule that refuses you:**

| | |
|---|---|
| **Money** | Every running project bills its holder every quarter |
| **Time** | Nothing you want arrives quickly |
| **Geography** | You can only build capacity where you have a way out, champion a movement that exists, or campaign against ground you can reach |

**This is the same move conquest made and it is deliberate.** Ruling 24 removed the three-Areas-a-turn
cap and the four-turn cooldown; ruling 25 removed the four-times-your-size shield. *"All three of the
hard-refusal brakes on conquest are now gone, and what remains is entirely pricing."* **The turn
budget was the fourth.**

### 2.1 The organising rule

> **A turn holds multiple things you can do; none of them finishes in one turn; and the things that
> do finish in one turn are a card you click.**

**This dissolves the action-budget problem rather than solving it.** The question stops being *how
many things may I do this quarter* and becomes *how many may I have going at once* — which is the
Civ2 engine, where the constraint is that everything you own is busy, and the EU4 one, where a
building takes months and a mission takes years.

**It was W10, one unjudged line in a bank of twenty:** *"Some actions take more than one turn. A
campaign, a negotiation, a construction. **Nothing in this game currently takes time**, and a
multi-turn commitment is a different way to limit a player than a per-turn cap."*

### 2.2 The second rule, which says which is which

> **A concession is instant. Anything you gain takes time.**

**Not for symmetry — because a release valve with a two-year delay is not a valve.** Round 3's table
is *"four prices for the same relief"*, and relief you wait eight quarters for cannot answer a crisis.
**Change course sits on the instant side by the same argument**: it is conceding your own identity,
and a government cornered by its own people must be able to reach for it now.

### 2.3 What resolves when

| | |
|---|---|
| **Instant and free** | recognise · answer a movement's demand · answer an event |
| **Instant and costly** | release · grant autonomy · change course · declare war |
| **A short bar** — one turn | propose a trade deal · propose a treaty · any offer that needs somebody else's answer |
| **A long bar** — several quarters | build capacity · champion a movement · arm a movement · fight a war · pay a patron · a union proposal answered *"let's think about it"* · re-point the army |

**Declaring war is instant because starting something is instant.** The war itself is the longest bar
in the game.

### 2.4 Nine parked items close, and none needed its own answer

Round 7 handed these forward *"named so none is lost."* **The currency they were priced in no longer
exists.**

| | Where it lands |
|---|---|
| Politics ruling 14 — does martial law cost the action | Money, and a stock cost that compounds each turn it holds |
| Diplomacy ruling 9 — the overture's price | A courtship bar |
| Diplomacy's **mediation** — *"the only idea in the round where one action moves three nations, which is either the answer to the budget or a reason to reject it"* | **Neither.** A project you run |
| Round 6's claim that an event should be free | It is a card |
| Round 4's **ten verbs against a budget of one** | All ten available. They cost money and quarters |
| Round 7 in-tray item 6 — do standing arrangements cost the action | A running project runs itself |
| **W18 / W19** — *"then a nation with many arrangements is strictly better off, and nothing pushes back on accumulating them"* | **The per-quarter bill.** This is **W20**, ruled by consequence: *an arrangement has an upkeep that is not an action but is a cost* |
| Politics ruling 19 — proposing a union costs the turn's action | **Superseded**, as that ruling said it would be: *"when the one-action rule changes, this ruling changes with it"* |

---

## 3. A project

**A project is the unit of doing things.** It is what replaced the action.

### 3.1 What one holds

| | |
|---|---|
| **A total cost** | In money |
| **A duration** | In turns |
| **A per-quarter draw** | The total spread across the duration |
| **Progress** | Visible, as a bar |
| **A throttle** | Pay above the draw to finish sooner |
| **Public or covert** | Which decides who can see the bar |

**The design already contained exactly one project and never generalised it.** Secession **ruling
21**, 7 September 2026, Aaron's own words:

> **A nation can fund a movement, and it is a standing commitment rather than a move.** You declare
> yourself its champion and **pay a share of your treasury every quarter**; the movement grows faster
> on ground you do not hold; everyone can see you doing it.

That ruling's own open question — *"whether it is the turn's one action every turn or a standing
payment that runs by itself"* — is answered here: **the second.**

### 3.2 Haste, and what it costs

**You may pay above the per-quarter draw to fill the bar faster. Every acceleration carries an
opposite reaction, and the reaction lands later rather than at the till.**

**That shape is not a taste. It is a motif this design has now produced five times**, and round 3
counted the first four: the garrison buys quiet and sells the next decade; appeasement buys a region
and pays at the next election; *"tell them to wait"* borrows patience at interest; the honeymoon ends
worse than neutral. **Buy now, pay later.** Haste is the fifth.

**The cost is paid where the project sits:**

| Project | What haste costs |
|---|---|
| **Covert** | **Exposure.** A greater chance the target finds out, sooner |
| **Public** | **The ground it is built on.** `attrs.sentBoost` rises in the Area — the authored grievance term, which is *"the only term that is a property of the PLACE rather than of the nation holding it"*, and the only way the model can say *this ground has a reason of its own* |

*Aaron's own arrow from the Sector Wiring page, 14 September, previously unused: **"people don't like
resource extraction in their back yard."***

**The public cost self-limits and that is why it is the right term.** `sentBoost` rides *inside*
grievance and is therefore multiplied by `base`, the ideological match — so *"an authored grievance
cannot radicalise a place into a movement whose ideology it does not share."* **Rushing a port only
bites where something was already there to catch it.** It shows in the Why panel as **Unfinished
business**, with no second code path.

**Haste has a floor: a project may be sped up and may never finish in the quarter it was started.**
Otherwise money buys its way straight through §2.1 and *"nothing completes in one turn"* acquires a
price tag. **The floor's value is the architect's; that there is one is design's.**

### 3.3 When you cannot pay

**The project stalls, keeps its progress, and the bill stops with it.** No forfeit and no penalty.
**The price of being poor is that nothing you want arrives.**

Confiscating spent progress would make a player never start anything, and this design charges prices
rather than issuing punishments. **The precedent is built:** a patron who stops paying stops being
one, and the client's political drift *decays* rather than being seized.

### 3.4 Public and covert are two acts, not one

**Backing somebody else's separatists comes in two forms and both stand.**

| | **Champion** — secession ruling 21, unchanged | **Arm** — new, 15 September 2026 |
|---|---|---|
| Who knows | Everyone, from the first quarter | Nobody, until discovery |
| What it draws | A coalition, and a memory heavier than recognising them | Nothing — **until discovery, and then the whole bill at once** |
| Haste | — | Found out sooner |

**Discovery is what writes the memory.** That keeps both of the brakes round 5 counted on the
sponsor-then-invite play — *"expensive, slow, public, stealable, and it costs you your own ambition
to complete"* — while turning two of them from an announcement into a gamble.

**It is the fourth instance of a shape round 3 named twice**: martial law against a stolen election,
propaganda against rigging a referendum, and now this. ***A decent government's options are expensive
and public; a rotten one's are cheap and quiet.***

### 3.5 Four of the eleven built moves were already projects

The move registry holds eleven planners — **annex, unite, release, govern, autonomy, recognise, trade,
treaty, aid, transit, revoke.** Four of them already had a duration and nobody drew them as bars:

| | What it already is |
|---|---|
| **aid** | A patron's ideology bleeds into the client's government, weighted by how recently and how much they paid, **decaying every turn they do not** |
| **transit / revoke** | Closing a corridor takes **four turns' notice**, and *"a corridor holder who gives notice does not stop a deal, he starts a clock on it"* |
| **trade** | A deal runs a term of **2, 4, 8 or 20 turns**, with countdowns at 4, 2 and 1 |
| **war** | A standing state that bills both sides every quarter — weariness climbing, trade prohibited, corridors shut — and ends only at a settlement |

### 3.6 The war bar

**A war's progress bar is how close the other side is to signing.**

That is round 2's ruling 10 drawn rather than a new idea: *"The war is the leverage; the treaty is the
game. What a war is for is making the other side's position bad enough that they sign."*

**And it answers the cost that ruling accepted when it refused a moving front:** *"a war with no
visible front is harder to read, and risks becoming an abstract bill arriving every quarter. That is
a presentation problem and it must be solved."* **A bar measuring their willingness to settle is a
better readout than a front line, because it shows the thing the war is actually for.**

### 3.7 ⚠ What this costs conquest, recorded rather than buried

**Making an acquisition take quarters reverses the *effect* of conquest ruling 24** while respecting
its reason.

That ruling removed the cap and the cooldown so that *"if a nation has the money and manpower they can
attack and organize as big of an attack as they want"*, and the change was **measured to make
sustained conquest 67% faster**: a burst of 3 Areas then a 4-turn wait is **0.6 Areas a turn**; one
Area every turn with no wait is **1.0**. A campaign bar slows it again.

**What Aaron objected to was a rule that refuses you. A duration is a commitment, not a refusal.** You
may still mount as large an attack as you can afford; it is simply not finished this quarter.

---

## 4. The reactive channel

### 4.1 What is free, and the principle nobody had stated

> **A decision is free when you did not choose to be asked.**

**Three exceptions to the old rule already existed and shared this and nobody had noticed** — round
7's finding B. **Recognise** has been free since before any ideation round ran: *"charging a nation's
one action for a diplomatic signature would price it at the same rate as a war."* **A movement's
demands** were made free *and mandatory* by politics ruling 12. **An event** arrives unbidden, which
round 6 called *"the strongest candidate for a free decision there is."*

### 4.2 A card, and what silence costs

**Anything the world asks you arrives as a card in the briefing. Answering is free. So is not
answering — and not answering is choosing.**

**Every card carries a default, and the default is the worst option available.** A player who never
opens the reactive section loses slowly and legibly rather than being stopped and made to look.

**The default for a movement's demand is already ruled, which is how we know the shape is right.**
Round 2's ruling 30 gives three answers:

| Your answer | What the movement does |
|---|---|
| **Implement** | You pay whatever the act costs. Satisfied, for now |
| **Decline** | **It grows faster.** An honest enemy inside your own country |
| **Wait, and never deliver** | **Its verb changes toward *Separate*.** It stops asking you for things and starts wanting out |

**Silence is not "decline". Silence is "wait"** — you did not say no, you simply did not answer. And
*wait* is the expensive one: politics ruling 22 counts **broken promises** rather than turns, the verb
moves **one step, always to Separate, and never back**, and it **fires once as an event the player is
told about.**

> **A card you never open is a promise you never kept.**

### 4.3 The queue risk, and why the answer is editing rather than capping

Round 7 named the real risk as **W16**: *"If every component gets ruling 12's channel, a player
answers six cards before doing anything."* **Three components have now asked** — movements, events,
and the answers to offers you sent.

**W17 proposed a cap of three a quarter. That is the wrong tool.** The answer is that **the briefing
is ranked and edited, not rationed** — which the game already does in two places. The turn-summary
newspaper draws *"three to six headlines per round from the ledger, **ranked by kind and
magnitude**."* And `disclosure.js` folds the nation panel *"so a newcomer meets six lines instead of
sixteen blocks — it hides nothing; everything is one click away."*

**That is W49 arriving from the interface rather than from the budget:** *"Triage IS the game, and the
interface is where it lives or dies. If a player must read six screens to find their one move, the
budget is not the problem."*

### 4.4 Reacting to an invasion

**Both halves of the obvious reaction are bars, and that is what preserves a measured rule.**

*Send troops to the border* is a **reallocation**, and readiness already follows an allocation
rate-limited, *"falling faster than it rises"* — **a one-turn switch to Field reaches under 60% of a
standing posture.** The reason is recorded: *"without it the three sliders are something you set at
the moment of use, and a decision you can always take later is not a decision."*

*Counter-assault their southern counties* is an **acquisition**, so it is a campaign bar.

**So the card is free and instant; the army is not.** The question an invasion actually puts to you is
**what are you prepared to lose while the army gets there** — answered by concessions, which are
instant precisely so they are available when you are cornered.

**Nothing new prices a flip-flop.** A player who re-points every quarter is never ready anywhere,
because the rate limit does it by physics rather than by a rule.

**And it produces X73 for nothing** — an invasion of your ally raises a card for *them*, since
conquest ruling 27 permits an ally who borders the enemy to join and **never compels it.** Round 6
called that *"the first genuinely two-sided object in the game."*

---

## 5. The briefing

**Three sections. The first two are divided by a rule already made.**

| | | Who can see it |
|---|---|---|
| **1. The continent** | What happened that anybody could see. Round 6's front page, per turn | Everyone. Public facts |
| **2. Your own government, reporting to you** | What came back from the offers you sent; how your projects are going; what your ministries are worried about | **Gated by round 7's ruling 3** — an ally's panel is open, a hostile nation's is bands and guesswork |
| **3. World affairs** | Smaller. Outside the continent, and the place to build the world out diegetically | Everyone |

**Section 3 needs no new object.** Round 6 ruled there is **no world state** and that a shock is true
of *a place*. That stands. But **X22** recorded the thing nobody acted on: *the world market already
exists and is already a fact everyone reads* — a price-taker with slow-moving prices and a shipping
cap. **A world event is a change to that, and nothing else.**

**So there is a third kind of event beside the crisis and the shock**, and it is **X26**, which round
6 called *"the opposite of a crisis and probably necessary"*:

| | **Crisis** | **Shock** | **Dispatch** |
|---|---|---|---|
| Comes from | the nation's own condition | a place on the map | outside the continent |
| Reaches | one nation | everything in the radius | everyone who trades out |
| Asks you anything | **yes** — two or three options | **yes** | **no. It is simply true** |
| Lasts | one turn | one turn | until the standing number changes back |
| Needs a new object | no | no | **no — the world market** |

**How hard a dispatch lands is round 6's ruling 2 pointed outward:** *a nation feels a shock in
proportion to the share of its ground the shock covers.* **A nation feels a world event in proportion
to how much of its trade goes out through the world market** — so a price crash wrecks an export
economy and a landlocked farm state shrugs, **because of arrangements they made.** Fourteen of
sixty-one nations have no way out of their own at all.

**And the world market reacts to the continent's own behaviour — small.** **X27**, ruled. *It is the
only shared consequence in the design: everything else is a pressure on one nation.*

**Two things this delivers that were on file with nothing to attach them to.** **F14** — *a turn
should arrive as news, not as a number* — filed 5 September. And **X60**: the Panama Canal has been
shut in the game's arithmetic since the first build, it is part of why the Union could not hold, and
the game has never once mentioned it.

---

## 6. What happens when the pointer wraps

**The phases below are carried forward exactly from `DESIGN.md` §4 and their order is load-bearing.**
The Technical Designer should treat the reasons as requirements rather than commentary.

**Over the columnar snapshot buffer, in this order:**

1. **Recompute mixes** — each nation's ideology shares, cached from the start-of-turn snapshot.
2. **Political drift** — each Area eases toward a blended target over all six ideologies.
3. **Sentiment and movement growth** — each movement closes a fraction of the gap to its own ceiling.
4. **Migration** — *after* drift, because somebody migrates as whoever they have just become; *before*
   growth, so the babies are born where their parents ended up.
5. **Population growth** — everybody, movements included.
6. **Economic growth** — by sector and by the population change actually realised.
7. **Cleanup** — movements below a floor removed, every survivor clamped to a valid slice of its own
   ideology. **That clamp is the reconciliation the whole model rests on.**

**Then against the live world, in one batch:**

**secession** → **governments refreshed** → **military readiness** → **relations forgotten** →
**recognition** → **crises** → **leaders seated** → **elections** → **movement states re-read from the
map** → **treasuries** → **the market reprices** → **the five power stocks recompute.**

**The stocks are last on purpose:** every input the power phase reads is a result of *this* turn, so
running it earlier would report the previous turn's world with this turn's label on it. **Elections
run just before them for the mirror-image reason** — four of the five stocks are the four things a
government is answerable for, and an election held after the recompute would be judging the world its
own result produced.

**Then the turn counter moves, the map is recorded for the timeline, and victory is checked.**

### 6.1 The phase contract

- **No phase reads back a value it wrote.**
- **Every cross-Area aggregate is computed from the snapshot**, never from the working buffer.
- **Per-Area values do compose down the pipeline** — a later phase sees an earlier one's result. This
  is deliberate and is noted at each site that relies on it.
- **Ownership is snapshotted for the whole turn**, so a phase that moves an Area cannot make its
  successors see the move.

**Two phases read Areas other than the one they write and both need care.** Political drift reads its
neighbours' mixes. **Migration writes to its neighbours**, which is worse: every flow on the board is
computed before any is applied, *"because applying as it goes would let the first Area's arrivals
decide the second Area's departures and the node numbering would decide who moved."*

### 6.2 ⚠ Where projects have to go, and it is not specified anywhere

**A project is new state.** `STATEFUL_MODULES` enumerates every module holding mutable state so that
none can be forgotten by the save, and **there is no project module in it.** A project also has to
resolve somewhere in the order above and nothing says where. *See Gaps.*

---

## 7. Time, as it now stands

| | |
|---|---|
| **One turn** | One quarter. Four to a year |
| **The game opens** | **1 March 2036** — the eve of two hundred years since Texas declared itself a nation |
| **The game ends** | **2086. 200 turns, fifty years** |
| **Agreement durations** | **2 / 4 / 8 / 20 turns** — six months to five years (D163) |
| **Elections** | Every **16 turns** — four years — on a schedule staggered by a hash of the nation's id and **stored nowhere** |
| **A new nation's honeymoon** | **4 turns** |
| **Transit notice** | **4 turns** |
| **The backstory** | Two years before the opening, so **eight turns of memory decay** |
| **A playtest** | **Sixty turns**, per the definition of done. *This is the length of a test, not of a game* |

**A game has an end, and it does two things.** It makes **surviving a result** without inventing a
fourth victory path — **W36**: *"Sixty-one nations and three ways to win means fifty-eight ways to
lose. A small nation that is still there has done something, and the game says nothing about it."* And
it gives a mission tree a horizon, which is the only way to know whether a tree is too long.

### 7.1 What 200 turns confirms, and it is measured

**The board is still politically alive at the end.** Within-nation spread of the leading ideology's
share, measured on the real map: **13.3 at turn 0 → 7.5 (t50) → 5.5 (t100) → 4.8 (t200) → 4.8
(t300).** It **stabilises rather than decaying**, which is the property the drift anchor and the
neighbourhood term were added to produce. *Before those, the same spread decayed with a 23-turn
half-life to effectively zero by turn 200, with every nation politically uniform.*

**The opening paces well.** `sent.maxRise` is tuned to **0.014**, measured across four seeds to put
the first secession at **t22–t29** — 11 to 15% of the way through a 200-turn game. *At 0.035 it was
t9, at 0.024 t13, at 0.018 t17, and at 0.010 movements start failing to arrive at all.*

### 7.2 ⚠ What 200 turns breaks

**1. The victory targets were reasoned against an eighty-turn game.** `DESIGN.md` §12: *the targets
are set at two to five times what an AI-only world produces, on the reasoning that **a player playing
deliberately for eighty turns** should substantially outperform a deliberately mild AI. That last step
is a judgement rather than a measurement, and it is the first thing a real play test should revisit.*
**A 200-turn game gives a player two and a half times that horizon.**

**2. The middle game needs an engine, and the design already has one.** The sentiment model was
**measured over sixty turns** — Deseret running from a 0.197 peak to its 0.600 cap, A Free Texas 11 →
117 Areas, Cascadia 9 → 50. **If the painted movements reach their ceilings inside the first third of
the game, the remaining two thirds has no new separatist pressure arriving** — and the premise of this
game is a country coming apart and being put back together.

**The answer is round 1's ruling 42: three of the six movement verbs are born in play, not painted.**

| Verb | Fires when | What it reads |
|---|---|---|
| **Rejoin** | the state holding this ground governs it badly | Authority, quality of life, war weariness, occupation — *all built* |
| **Expand** | the nation is short of something | the economy's coverage figures |
| **Reconquer** | the nation has lost ground | the `lost` relation memory — *built* |

> **The opening act runs on painted movements. Everything after roughly turn sixty runs on movements
> born in play, and a 200-turn game does not work without them.**

*This is not an alpha change. The alpha is a sixty-turn test, which is exactly the window the painted
movements cover.*

**3. An eighty-turn deal stops being absurd.** Round 7 carried the story's twenty-year New
England–Rochester free-trade deal as an unresolved collision: *"eighty turns, and the game's durations
are 2, 4, 8 and 20."* **Against a sixty-turn game an eighty-turn deal was longer than the game.
Against 200 it is 40% of one.** W42's objection survives — *nothing should be settled for a
generation, because a player who signs an eighty-turn deal has removed a decision from the rest of the
game* — but it is now an argument rather than an impossibility.

---

## 8. What the player sees

- **The briefing is a scene, not a report.** Three sections, ranked, three to six things that matter,
  everything else one click away.
- **A project is a bar with a name, a finish line and a throttle.** Public projects are visible to
  everyone; covert ones are visible only to their owner until discovery.
- **A war is a bar measuring how close the other side is to signing.**
- **Ground you took is pale on the map** until a treaty launders it — conquest ruling 13's brightness
  requirement, which is what answers ruling 10's cost of having no visible front.
- **Anything the world asks you is the same card shape**, so the player learns one thing about how
  this game asks a question rather than one per system. *The two existing full-screen cards — a deal
  expiring and a request to cross your ground — already work this way and neither uses your turn.*

---

## 9. What this hands the Technical Designer

**Everything below is structural. None of it is a number.**

| | |
|---|---|
| **The turn is a round** | Sixty-one slots in a shuffled order, one world step at the wrap. **Removing the action budget removes the identity between a nation's slot and its action**, so something now has to end a slot |
| **The measured cost of the old shape** | An AI round is **735 plans and 153 ms**. A headless world turn is **33 ms** — migration 2.4 ms of it, recognition 0.35 ms — and a full round with fifty AI nations acting is about **137 ms**. A 50-turn simulator run is **1.7 s in the browser** |
| **⚠ The measured cost of the new shape is unknown** | 735 plans was sixty nations choosing **one** thing. Sixty nations choosing several is more, and nobody has measured it. **This is the one genuine cost of removing the budget** |
| **Projects are new persistent state** | `STATEFUL_MODULES` has no project module, and a project must resolve somewhere in §6's order |
| **Every number here is the architect's** | Project durations; the per-quarter draw; what haste buys per unit of money; the floor under haste; how fast discovery rises; how much `sentBoost` a rushed build adds; the game-length recalibration of the victory targets |
| **The AI plays under the same rules** | **W12**, and round 7 ruling 3's fourth default already set the precedent: *if it is given sight the player does not have, the player is playing against a cheat* |

---

## 10. Open questions

*A decision Aaron has not made. Playtest findings for the turn are filed here.*

| | | Owner |
|---|---|---|
| **1** | **Does the duration table gain a fifth entry now that a game is 200 turns?** T71 and round 7's ruling 4 were blocked by an eighty-turn deal being longer than the game. That is no longer true | **Aaron**, with the Technical Designer |
| **2** | **Are the opening memories dated across the two years, or all stamped "two years ago"?** W43 says date them — the list is already dated and decays per turn. W44 says two years is **eight turns of decay** and the difference may be invisible. ⚠ **Measure before building** | **A measurement**, then Aaron |
| **3** | **Do the painted movements actually cap out by turn sixty at the shipped tuning?** The 60-turn spread figures may predate M5.3's reduction of `sent.maxRise` from 0.035 to 0.014. **Re-measure over 200 turns at the shipped rate** | **The data stage** |
| **4** | **Are the victory targets still right against a 200-turn horizon?** §7.2 | **The architect**, and *"the first thing a real play test should revisit"* |
| **5** | **Is sixty nations starting several projects each affordable?** §9 | **The architect** |
| **6** | **Does anything other than the player's own choice end a nation's slot?** With no budget there is no natural terminator | **The Technical Designer** |

---

## 11. Gaps

*Referenced and never specified. Distinct from an open question: these may already have been decided
and simply are not written down anywhere.*

| | |
|---|---|
| **1** | **A project's record has no specified shape.** §3.1 lists what one must hold; nothing says where it lives, how it is saved, or how it is addressed |
| **2** | **Nothing specifies a card's vocabulary.** Two full-screen cards exist — an expiring deal and a transit request — and neither is described as an instance of a general form. *Belongs to `presentation-design.md`; named here because §4.2 depends on it* |
| **3** | **Nothing says how the three briefing sections are ranked against one another.** The newspaper ranks headlines *"by kind and magnitude"* within itself; there is no rule for a world dispatch against a movement's demand |
| **4** | **It is not written down whether turn order is re-shuffled each round or drawn once.** The `turnorder` RNG stream exists; the policy is not stated in any document. **With a budget of one this decided little; with unlimited starts it decides more** |
| **5** | **There is no rule for cancelling a project.** §3.3 covers a project you cannot pay for. Nothing covers one you no longer want |
| **6** | **"Discovery" has no mechanism.** §3.4 requires that a covert project can be found out and that haste makes it likelier. Nothing in the build has ever hidden anything from anybody except the pressure map's three bands |

---

*Sources, all verified against the files on 15 September 2026 unless marked: `DESIGN.md` §4, §4.1,
§6, §6.1, §6.5, §6.6, §6.7, §7.2, §7.7, §12; `docs/design/the-things-above-ideation.md` §3a, §5, §7;
`docs/design/events-ideation.md` §5, §8; `docs/design/diplomacy-ideation.md` §5a; `docs/design/
politics-ideation.md` §4; `docs/design/conquest-ideation.md` §6; `docs/design/secession-ideation.md`
ruling 21, ruling 42; `docs/design/economy-ideation.md` §4b; `DECISIONS.md` D163, D181, D195, D218,
D220; `docs/FUTURE-IDEAS.md` F7, F14. **Performance figures are quoted from `DESIGN.md` and were not
re-measured this session.***
