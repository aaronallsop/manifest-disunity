# Events — the crisis, the shock, and the dispatch

**Stage 2 of five: DESIGN.** A specification for the Technical Designer, not an idea bank.

**Depends on:** `GDD.md` · `board-design.md` (adjacency, because a radius is measured in hops) ·
`power-design.md` (six of the eight effects move a stock) · `movements-design.md` (the seventh moves
sentiment) · `diplomacy-design.md` (the eighth writes to memory) · `turn-design.md` (the briefing card
and the free decision) · `trade-design.md` (the world market a dispatch changes).

**Read by:** `turn-design.md` · `presentation-design.md` · `nation-design.md`.

> **⚠ PROGRAMMER RULE 17 — WHICH BOARD.** *Every nation named here is tagged.* **BUILT is 61 nations;
> the story's 47 with six stateless regions is not built.** *Round 6 wrote this rule down the day it
> was earned.*

> **The one-sentence version: this is the most restrained round in the project — two objects, both one
> turn deep, one new way of addressing them, and a page of prose. Everything else on the table was
> declined, and the round got better for it.**

---

## 1. Three objects, and they are not the same shape

**Round 6 settled two. The turn document added the third.**

| | **A crisis** | **A shock** | **A dispatch** |
|---|---|---|---|
| **Comes from** | the nation's **own condition** | **a place on the map** | **outside the continent** |
| **Reaches** | one nation | **everything in the radius** | everyone who trades out |
| **Asks you anything** | yes — two or three options | yes | **no. It is simply true** |
| **Lasts** | one turn | one turn | **until the standing number changes back** |
| **Needs a new object** | no | no — **the map is what it is true of** | no — **the world market** |
| **BUILT?** | **YES — twelve rows** | **no** | **no** |

> **A crisis is wide in nothing; a shock is wide in space.** ⚠ **And a dispatch is the only one that is
> wide in TIME** — which sits against round 6's own summary that its objects are *"both one turn
> deep."* **Not a contradiction — the dispatch is a later document's object — but the seam is real and
> is written down here rather than found later.**

---

## 2. The crisis — built, twelve rows, and every trigger is about you

### 2.1 The discipline that makes it content rather than code

> *"Every trigger reads a fact some other system already computes… and every effect moves a number
> some other system already owns. **So an event is a nudge and a story, and the content file is
> content rather than code.**"*

### 2.2 The twelve

| # | | Fires when | Weight |
|---:|---|---|---:|
| 1 | **The harvest fails** | quality of life below 0.62, turn 5+ | 4 |
| 2 | **A general will not go** | war weariness above 0.4 | 5 |
| 3 | **Shots on the border** | coalition pressure above 0.15 | 4 |
| 4 | **A petition for home rule** | strain above 0.55 | 5 |
| 5 | **An offer from abroad** | influence above 0.4, turn 8+ | 3 |
| 6 | **The veterans march** | weariness above 0.3 **and** liberties below 0.6 | 4 |
| 7 | **The currency slips** | under 4 turns of treasury runway, turn 6+ | 5 |
| 8 | **A neighbour comes apart** | a nation died recently | **6 — the heaviest** |
| 9 | **Where the money went** | force deployed above 0.3, turn 10+ | 3 |
| 10 | **A convention is called** | authority below 0.42, turn 8+ | 4 |
| 11 | **They arrested the wrong person** | strain above 0.4 **and** liberties below 0.55 | 4 |
| 12 | **A good year** | QoL above 0.7, weariness below 0.15, turn 10+ | **2 — the lightest** |

**Nine have three options; three have exactly two (#4, #9, #10).** *And the rule behind them is the
whole design: **an option that is strictly best is a button, and a button is not a decision.***

### 2.3 ⚠ There is no world state. Every trigger is about the nation it fires for

**Thirteen distinct facts are available to a trigger** — fourteen keys, two of which are the turn under
different names. *The turn, quality of life, liberties, authority, influence, war weariness, strain,
coalition pressure, Areas held, share occupied, turns of treasury runway, force deployed, and whether
a neighbour ceased to exist recently.*

**Closed on purpose**, and the reason is in the file: *a closed list is what makes an authored event
checkable by the validator, and what stops a crisis quietly becoming the only consumer of some number
nobody else looks at.*

> **⚠ AND THE ONE FACT THAT LOOKS OUTWARD DOES NOT LOOK OUTWARD.** *`neighbourDied` never asks
> adjacency at all — it walks the ledger for ANY death anywhere within four turns and returns true.*
> **The reason is written into the code — *"the nation is gone, so adjacency cannot be asked"* — but
> it means crisis #8 fires on a nation dying on the other side of the continent.** *The ideation's
> "the only one that looks outward" is stronger than the code. Gap 1.*

### 2.4 The eight effects, and they are closed

**Treasury as a share of income · authority · influence · quality of life · liberties · war weariness ·
sentiment · standing.**

- **`sentiment` is the only one that touches the map**, and it deliberately moves **movements already
  present**: *a crisis gives an existing argument more people; it does not invent a separatist
  tradition.*
- **`standing` is the only one that reaches another nation.** It writes to the memory list, toward
  **every neighbour at once.**

> **Nothing reaches a region, a sector, a resource, a trade deal, a corridor, a bloc, a vassal, an
> alliance or a recognition claim.** *Four of those did not exist when the vocabulary was written; four
> were ruled into existence in a single week.* **Ruling 5 keeps it closed anyway — §3.5.**

**The stock discipline, and it is the same one the whole game runs on:** *a nudge is applied to the
**stock**, not to its target — the target recomputes from the world next turn and would simply undo
it.* **That is what turns a shock back into a recovery over several turns rather than a blip.**

**⚠ Two effects are inverted and it is easy to get wrong:** **weariness and sentiment are BAD when they
go up.** *The AI's chooser negates them explicitly; anything else reading the vocabulary must too.*

### 2.5 How an AI answers, and why it is deliberately stupid

> *"The option that most helps whatever it is worst at. **Deliberately simple.** An event is a place
> where the world speaks to the player, and a scoring apparatus of its own here would be a second
> opinion about a table twelve rows long."*

**The weights are the nation's own shortfalls** — so a nation with no money takes the money and a hated
one buys goodwill.

### 2.6 ⚠ The player meets the deck about three times in a sixty-turn game

**Arithmetic from the tuning file, not from a run, and the document says so itself.** *At most three
crises across the whole roster per turn, on a board of 61 nations, with an eight-turn cooldown per
nation and thirty turns before the same crisis recurs.* **So any one nation is picked roughly three
turns in sixty-one — about once every twenty turns.**

**Three consequences that pull against each other:**

1. **The deck is rare, which is what the tuning intends** — *"a country that has a crisis every turn is
   not having crises."*
2. **It is mostly unseen.** Three quarters of the authored content never reaches a given player.
3. **The cooldowns are not the binding constraint. The per-turn cap is** — so **raising the cap is the
   only lever that changes how often anything happens.** *Recorded so nobody spends an afternoon
   adjusting cooldowns.*

> **⚠ AND THE FIGURE IS NOW STALE ON GAME LENGTH.** *It was computed for sixty turns. **The game is
> 200 turns** (D223). The same arithmetic gives roughly **ten crises a game**, not three.* **Nobody has
> restated it. Recomputed here and marked as derived, not measured.**

### 2.7 ⚠ The cap is spent in roster order, not sampled

**The delivery loop walks the nations in insertion order and stops the moment the budget runs out.**
*So the three crises a turn go to whichever nations come first in the map, every turn, forever.* **No
document records this as a decision. Gap 2.**

### 2.8 Every number this system has

*Read from `js/tunables.js` this session. **Five keys, and that is the whole system.***

| Key | | |
|---|---:|---|
| `events.maxPerTurn` | **3** | *"Across the whole roster. Three is enough that the newspaper has something in it most turns and few enough that a crisis is still an event rather than the weather."* |
| `events.cooldownTurns` | **8** | *"A country that has a crisis every turn is not having crises."* |
| `events.repeatTurns` | **30** | *"Longer than the general cooldown, so a nation cycles through its problems rather than reliving one."* |
| `events.memoryTurns` | **4** | *"A neighbour ceasing to exist is news for a few turns and history after that."* |
| `events.comfortableRunway` | **12** | *AI only. "A nation with a year of reserves values cash at nothing, one with two turns of it values cash above everything."* |

**Two more are read from elsewhere** — the positive and negative standing magnitudes, because the
`standing` effect scales against them — **and the calendar's opening year, 2036, which ruling 4's
front page is dated to.**

> **⚠ AND THE ARITHMETIC IS WORTH DOING ONCE, HERE.** *Three a turn across 61 nations is **3T/61 per
> nation over T turns**. At 60 turns that is **2.95 — the "about three" figure**. At 200 turns it is
> **9.8.*** **Neither cooldown binds at either length** — *8 turns allows 25 crises in 200, and 30
> turns only limits repeats of the same row* — **which is the proof that the per-turn cap is the only
> lever.** *Derived from the five values above; not a measured run.*

---

## 3. The seven rulings

### 3.1 Ruling 1 — a shock has a blast radius on the map

**RULED 14 September 2026.** *"A shock has a blast radius on the map."*

> **A shock happens somewhere and reaches everything near it.** A hurricane on the Gulf, a drought
> across the plains, a freeze in the north. **It is not addressed to a nation at all — it is addressed
> to ground, and whichever nations hold that ground find out.**

**This is the answer that needs no world.** *Finding B said a world shock has nothing to be true **of**;
ruling 1 replies that it is true of **a place**, and the game is built on a real county map.* **No world
object, no continental facts, no new layer above the nations.**

**Three were rejected, and all three were put to him:** a crisis reaching you down the trade network
(the cheapest, and it makes arrangements decide who suffers); a world with facts of its own (the most
faithful and the most to build); and a shock hitting everyone who shares a property — a port, a bloc,
a supplier. **Aaron took the most physical of the four, and it is the only one where the map itself
decides.**

**What it costs, and both are open:**

| | |
|---|---|
| **⚠ A radius must be in HOPS, not miles** | **The model has no coordinates anywhere.** *Counties carry a name, a state, population, output and votes — no latitude, no longitude, no centroid.* So a radius is *"within N counties of where it started"*, walked through neighbours. **Cheap, already built, and arguably more honest — it follows the land rather than a circle on a projection.** *Whether to buy real coordinates instead is the architect's, and it is not free* |
| **⚠ The delivery mechanism forbids it today** | **An event fires for exactly one nation.** A blast radius addresses many. *Shocks must learn to address a SET and to have a budget separate from the crisis deck's* |

> **⚠ TWO DIFFERENT DELIVERY FIGURES ARE IN ONE DOCUMENT AND THE DIFFERENCE IS NEVER STATED.** *"Three
> turns to deliver one winter" is the **eight-nation plains** case. **"Twenty turns"** is the
> **whole-roster** case — 61 nations at three a turn.* **Both true, both unqualified. Stated here so
> nobody quotes the wrong one.**

### 3.2 Ruling 2 — the effect scales with how much of your ground is inside it

**A nation feels a shock in proportion to the share of its ground the shock covers.** *Three of forty
Areas in the drought is a fraction of it; a whole territory inside it is all of it.*

**Why it is a default rather than a product judgement:** it **respects round 4's one-national-pot
ruling**, which this round may not overturn; it needs **no new effect vocabulary** — the eight are
simply multiplied by a share; and it delivers what the scenario asked for **without a regional model.**

> **⚠ WHAT IT DOES NOT DELIVER, STATED PLAINLY.** *The scenario's other half — **"it lands differently
> on a nation that feeds itself than on one that buys"** — is answered by neither ruling.* **A shock
> covering your whole territory hits you fully whether you farm or import.** *That half belongs to the
> economy: the winter reduces what the plains produce and the importer feels it through price — which
> means **the scenario needs the DESIGNED economy built before it can be told**, and that was true
> before this round started.*

**Two things ruling 2 does not define, and both change what it means:**

1. **⚠ "Share of your ground" — Areas, population, or GDP?** *The worked example counts Areas; the words
   say "ground". Nobody chose.* **Open question 4.**
2. **⚠ `sentiment` cannot simply be multiplied.** *It is already per-Area.* **So "scale by the share"
   has two incompatible readings: multiply the value by the national share, or apply the full value
   only to the Areas inside the radius.** *Ruling 7 calls it "the geographic version secession was
   asking for", which implies the second.* **Open question 5, and it is a design question, not a
   number.**

### 3.3 Ruling 3 — no chains in play, and it deleted the rest of the round

**RULED 14 September 2026.** *"No — chains are the backstory's job only."*

**The chain that made this world is told once, at the opening, and never runs again.** *A crisis remains
what it is today: **one nation, one turn, and it ends there.*** **And it binds shocks as well** — the
taxonomy's "does it cause another?" row says **no** for both.

**The rejected version is worth recording because it was the one this project argued for.** *The
emergent chain — nobody writes it; each link is an ordinary event whose trigger is the last link's
effect — gets the drama without rails.* **Aaron took the tighter answer, and the authored nine-step arc
was rejected for the document's own reason: it would be the first thing in this game that runs on
rails, and the rest of it deliberately refuses to.**

> **Why the restraint is coherent rather than merely cautious.** *Every complaint Aaron has made about
> this design for a fortnight has been the same one — **there is too much to think about.*** **Ruling 3
> buys the round's whole remaining scope back**: no chain memory, no breakable link to surface, no
> *"this happened because that happened"* record, and no risk of a sequence firing that nobody can stop
> or explain.

**What it costs, and the second one is somebody else's question answered:**

1. **The oil stoppage cannot be told as what it was.** *In the story it is a **consequence** — Texas's
   war stopped the gas.* **Under ruling 3 the game can have a fuel shock at a place, caused by
   nothing.** *The shape survives; the causation does not.*
2. **⚠ Conquest's in-tray item 7 is answered NO, and round 2 was closed and could not argue.** *"A war
   that starts because somebody else's crisis made it" is a chain across nations by definition.*
   **Recorded as answered rather than quietly dropped.** *A shock that makes war more likely by making
   a nation hungrier is still available; a shock that hands anyone a war is not.*

### 3.4 Ruling 4 — the opening is a front page, dated 1 March 2036

**The game opens as a newspaper.** *The bicentenary, the war of succession, the oil, the collapse of
trust in Washington, martial law, and the states that went their own way.* **The player starts knowing
why the map looks like that, instead of inferring it from three sentences.**

**It replaces a blurb and three sentences** — one per dissolution and one for the cession — *against a
page of story that already exists in the secession round.*

**It is content, not machinery. Nothing in the engine changes; the writing is the work.**

**Two things it sets up for free:**

- **A turn arriving as news rather than as a number** (F14). *This is the same idea pointed at turn
  zero, so the format exists before the per-turn version is designed.*
- **The bicentenary finally gets said.** *The game opens on the eve of two hundred years since Texas
  declared itself a nation, with **five governments each claiming to be that Texas** — Dallas, Houston,
  El Paso, Austin and San Antonio, all **[BUILT]** — and today it says nothing about it.*

**The near miss is worth recording: a different front page per nation**, the same events reported by
somebody with an interest, so Austin's page and Dallas's disagree about who the traitor is. **Aaron
took the single page** — *one page of writing rather than sixty-one points of view, and the per-nation
version stays available later at the cost of prose alone. No mechanism stands between here and there.*

**The date is real in the engine**, not flavour: the opening year is a tunable and the calendar renders
*"March 2036"*.

### 3.5 Ruling 5 — the effect vocabulary stays closed

**The eight effects stand.** *An event still may not reach a sector, a deal, a corridor, a bloc, a
vassal or a recognition claim.* **The only addition is whatever ruling 1's blast radius requires, which
is a way of addressing ground rather than a new thing to move.**

> **Why the default is NO and not YES: ruling 1 removed the reason to say yes.** *The trace's
> interesting version needed an event to reach a trade deal — but that was under the version where the
> shock travels the trade network.* **Under a blast radius the shock reaches the ground directly and
> the economy carries it onward**, so the new effect is not needed.

### 3.6 Ruling 6 — shocks get their own budget; the crisis cap stays

**Two budgets, not one.** *A world event rationed to three nations a turn is not a world event.*

**Whether three crises a game is too few is left open on purpose.** *It is a number, numbers are the
architect's, and **the structural half is what this round owes**.* **⚠ The shock budget has no tunable
key. Gap 3.**

### 3.7 Ruling 7 — the three half-built items are closed as already owned elsewhere

| | |
|---|---|
| **Protests at the capital** | **Closed.** *Two cousins already exist in the deck — the veterans march, and they arrested the wrong person.* **⚠ The story's version happens at the capital specifically, and the game has no notion of a capital as a place an event can target.** *A refinement, not a gap* |
| **A neighbour comes apart and the arrivals carry their politics** | **Half closed.** *The event exists; the carrying half is migration's, and migration is built and already moves people toward people who think as they do.* **The two systems already meet** |
| **Shocks that land on grievance** | **Closed, and it was already built.** *`sentiment` moves movements already present; ruling 2 now scales it by the share of ground inside the shock, which is the geographic version secession was asking for* |

---

## 4. ⚠ A crisis is the only thing in this game that stops to ask — and the turn document just changed that

**Built today, a crisis is a BLOCKING card.** *The code says so: it is **the only thing in this game
that stops to ask** for an answer.*

**Under the turn design it becomes a briefing card that does not block**, because of a rule this round
itself supplied:

> **A decision is free when you did not choose to be asked.**

**Three exceptions already existed and shared exactly that, and nobody had noticed.** *Recognise has
been free since before any ideation round ran. A movement's demands were made free **and mandatory**.
And an event arrives unbidden — which round 6 called **"the strongest candidate for a free decision
there is."***

**And the turn design gives every card a default, and the default is the worst option available:**

> *A player who never opens the reactive section loses slowly and legibly rather than being stopped and
> made to look.* **"A card you never open is a promise you never kept."**

> **❌ SO TWO LIVE DESIGNS EXIST FOR THE SAME OBJECT.** *Blocking with no default, or non-blocking with
> the worst option as default.* **Neither document decides which, and they were written a day apart.**
> *Open question 7.*

**And nothing ranks the three briefing sections against one another.** *The newspaper ranks headlines
"by kind and magnitude" within itself; there is no rule for a world dispatch against a movement's
demand.* **Gap 4.**

---

## 5. The dispatch — the world market, pointed outward

**Round 6 ruled there is no world state, and that stands.** *But the world market already exists and is
already a fact everyone reads.* **A world event is a change to that, and nothing else. No new object.**

> **How hard a dispatch lands is ruling 2 pointed outward.** *A nation feels a shock in proportion to
> the share of its ground the shock covers; **a nation feels a world event in proportion to how much of
> its trade goes out through the world market.*** **So a price crash wrecks an export economy and a
> landlocked farm state shrugs — because of arrangements they made.** *Fourteen of sixty-one nations
> have no way out of their own at all.*

**And the world market reacts to the continent's own behaviour — small.** *It is the only shared
consequence in the design: everything else is a pressure on one nation.*

**Two things a dispatch delivers that nothing else can:** *a turn arriving as news rather than as a
number*, and **the Panama Canal — shut in the game's arithmetic since the first build, part of why the
Union could not hold, and never once mentioned to the player.**

---

## 6. What this hands the Technical Designer

| | |
|---|---|
| **An event must learn to address a SET of nations** | §3.1. It is what ruling 1 costs |
| **Shocks need their own budget, and the key does not exist** | §3.6 |
| **A radius is measured in adjacency hops** | §3.1. *The number of hops is unset and so is the tunable* |
| **⚠ `sentiment` cannot be scaled the same way the other seven can** | §3.2. It is already per-Area |
| **⚠ Decide whether a crisis still blocks** | §4. Two live designs, one object |
| **The per-turn cap is the only lever on frequency** | §2.6. Not the cooldowns |
| **⚠ The cap is spent in roster order** | §2.7. Undocumented, and it is always the same nations |

---

## 7. Open questions

| | | Owner |
|---|---|---|
| **1** | **Is three crises a game too few?** *"It is a number, numbers are the architect's"* — **and at 200 turns it is ten, not three** | **The architect** |
| **2** | **Adjacency hops, or buy real coordinates?** *"Not free"* | **The architect** |
| **3** | **How many hops is a radius?** *No number is proposed anywhere and no tunable exists* | **The architect** |
| **4** | **⚠ What is "the share of your ground" — Areas, population, or GDP?** | **Undeclared.** *A design question* |
| **5** | **⚠ How does ruling 2 scale `sentiment`, which is already per-Area?** *Two incompatible readings* | **Undeclared.** *A design question* |
| **6** | **What does a shock look like on screen?** *"A crisis is a card; a shock is a card and a shape"* | **`presentation-design.md`** |
| **7** | **⚠ Does a crisis stay blocking, or become a defaulted briefing card?** | **Undeclared.** *Aaron's* |
| **8** | **How are the three briefing sections ranked against each other?** | **Undeclared** |
| **9** | **The vocabulary against the designed economy** — *finding A: "the vocabulary gains a term or the shock lands elsewhere"* | **The architect** |

---

## 8. Gaps

| | |
|---|---|
| **1** | **⚠ `neighbourDied` is temporal, not spatial.** *It never asks adjacency; any death anywhere within four turns fires it.* **The ideation overstates it as "the only fact that looks outward"** |
| **2** | **⚠ The per-turn cap is spent in roster insertion order with a hard stop.** *Not documented as a decision anywhere* |
| **3** | **The shock budget ruling 6 requires has no tunable key** |
| **4** | **Nothing ranks a world dispatch against a movement's demand** in the briefing |
| **5** | **The game has no notion of a capital as a place an event can target** — *so the story's protests-at-the-capital can only be told generically* |
| **6** | **"Three crises in a sixty-turn game" is stale against a 200-turn game** and has never been restated |
| **7** | **⚠ A dispatch lasts "until the standing number changes back"** — *the only object in the round that is wide in time, and nothing says what changes it back* |

---

## 9. The scenarios this document must be able to narrate

**Three traced. The first is the round's own scenario and it fails twice before a ruling rescues half
of it.**

### 9.1 ❌ A bad winter — and it fails at the first WORD

**The scenario as set:** *"Nobody chose it, everybody feels it, and it lands differently on a nation
that feeds itself than on one that buys."*

**Step 1 — it fails at "everybody."** *There is no way to make one thing true for more than one nation.
Every trigger reads the condition of the nation it fires for.*

**Step 2.** A winter that hits everybody would have to be **sixty-one separate draws.**

**Step 3 — the per-turn cap of three forbids it outright.** *It would take **twenty turns to deliver one
winter.***

**Step 4 — it fails again at "lands differently."** *One national pot, and the effect vocabulary has no
sector, no resource and no supply term.*

**Step 5.** So the only winter this game can express is *"quality of life falls by some amount"* —
**which is identical for the farmer and the importer.**

> **❌ JAMS TWICE.** *And the cheap version is already built: **a bad winter as a national quality-of-life
> shock with three options — buy at any price, ration it, or let the market handle it — is row one of
> the deck.*** **The scenario's cheap version exists; its interesting version needs two things this
> round does not own.**

**With ruling 1, half of it narrates:** *the winter lands on the plains and everything holding plains
ground feels it, scaled by how much of that nation is inside.* **The other half — farmer versus
importer — still waits on an economy that has never run.** *Said plainly rather than discovered later.*

### 9.2 ✅ A neighbour ceases to exist, and the player is asked something free

**Step 1.** A nation is conquered out of existence. *The ledger records that it died.*

**Step 2.** Within four turns, crisis #8 becomes available to every nation on the board — **⚠ not just
the neighbours, because the fact is temporal and not spatial.** *Gap 1, and it shows up here.*

**Step 3.** The draw picks a nation. **Weight 6 — the heaviest in the deck**, so it wins most contests
it enters.

**Step 4 — the card asks:** *open the border, close it, or open it and say what it costs.*

**Step 5.** **Every option is a real trade.** *Opening costs quality of life and buys standing with
every neighbour at once. Closing costs standing and buys authority. The third splits the difference and
is paid for out of the treasury.* **No option is strictly best, so it is a decision and not a button.**

**Step 6.** The player did not choose to be asked, **so answering is free and costs no part of the
turn.**

> **✅ NARRATES, and it is the best demonstration of the design in the project:** *one nation, one turn,
> three real options, no rails, no new machinery.* **⚠ The only wrong note is step 2 — a nation on the
> far side of the continent gets a card about refugees from a country it has never touched.**

### 9.3 ⚠ A hurricane on the Gulf, and the delivery mechanism cannot carry it

**Step 1.** A shock is authored at a Gulf county. **Radius: some number of adjacency hops.** *⚠ The
number does not exist and neither does the tunable.*

**Step 2.** The walk goes outward through neighbours. *Eight nations hold ground inside it.*

**Step 3 — ruling 2 scales each one** by the share of its ground inside the radius. *⚠ And "share" is
undefined — Houston **[BUILT]** by Areas is one answer and Houston by population is a different one.*

**Step 4.** Seven of the eight effects multiply cleanly. **⚠ The eighth, `sentiment`, does not — it is
already per-Area, so scaling it nationally and applying it only inside the radius give different
games.**

**Step 5 — the delivery.** *Eight nations must be told. The cap is three a turn.*

**Step 6.** **❌ The hurricane takes three turns to finish happening.** *Nine months, on a quarterly
clock, for one storm.*

> **❌ JAMS on the mechanism, not on the idea.** *Ruling 6 answers it — shocks get their own budget —
> **and the budget does not exist as a number, a key, or a line of code.*** **This trace is what ruling
> 1 costs, made concrete.**

---

*Sources, verified 15 September 2026: `docs/design/events-ideation.md` — rulings 1–7, findings A–F,
ideas X1–X74, the §3a–3e survey of the built deck, and the scenario 6 trace; `docs/design/turn-design.md`
§§3–4 (the dispatch, the free decision, the briefing card) and §§10–11; `docs/design/the-things-above-ideation.md`
§§ on time and the board; `content/events.json` (all twelve rows, their triggers, weights, options and
effects); `js/events.js` (the fourteen fact keys, the eight effects, the draw, the AI's chooser, the
per-turn loop); `js/tunables.js` (`events.*`, `calendar.startYear`, `rel.magGranted`, `rel.magWarred`);
`js/shell.js` (the blocking card); `js/calendar.js`. **The "three crises in sixty turns" figure is
ARITHMETIC from the tuning file, not a measured run — the ideation says so itself — and the ten-crises
restatement for a 200-turn game is derived here and marked as derived. The three-turn and twenty-turn
delivery figures are both in the source document; the distinction between them is stated here for the
first time.***
