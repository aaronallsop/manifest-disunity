# Manifest Disunity — Game Design Document

**Stage 2 of five: DESIGN.** This is the master document. It is the tip of the iceberg: orientation,
the system map, and the concepts several systems share. **Everything deep lives in a satellite** —
if a section here starts restating one, it is too long and should be cut back to a pointer.

**Depends on:** nothing. Every satellite depends on this.

**⚠ This document is never finished, and that is a ruling rather than an excuse (D230).** A GDD is a
living document; it is expected to grow, and **when a part of it outgrows its seam the answer is to
split it, never to let it thicken.** Findings from play are filed into the **Open questions** section
of whichever satellite owns them, which is what that section is for.

**Downstream reader: a Technical Designer**, who takes one system at a time and writes formulas,
pseudocode, inputs and outputs, and edge cases. Every structural choice in this document and in the
split below is made to serve that pass.

---

## 0. How to read this, and the one convention that matters

**Two kinds of statement live in this project and confusing them is the recorded failure mode.**

| | |
|---|---|
| **BUILT** | `DESIGN.md` at the repository root. What the game does today. If it and the code disagree, the document is a bug |
| **DESIGNED** | This folder. What the game is *intended* to do and is not. Some of it contradicts what is built, deliberately |

**Where they disagree, this document says so in place rather than picking one.** Four closed
ideation rounds wrote rulings about nations that are not on the board, which is where programmer
rule 17 comes from. **A number without a provenance is not carried forward here.** Every quantity
below is marked: *measured* (from a named file or a named run, with its date), *authored* (a tunable
or a data file), or *unset* (nobody has decided).

**Two rules governing this stage, from the designer's brief:**

1. **Nothing is invented.** Where the design does not specify something, it is a **Gap**, named as
   one. A document that quietly invents is worse than one with visible holes.
2. **Nothing open is resolved.** Where something is contested or undecided it is an **Open
   question**, and the decision is Aaron's.

---

## 1. Working title

**Manifest Disunity.**

*Called **Nation States** until 15 September 2026. That was a working title and was dropped over a
clash with another game of the same name (D217). `DESIGN.md` and `README.md` were retitled the same
day and both carry the reason.*

---

## 2. Concept statement

> **The United States has already come apart. You take one of the sixty-one nations standing in the
> wreckage, and you decide whether a country can be put back together — by force, by argument, or by
> being the economy everyone else depends on.**

**⚠ DRAFT FOR REVIEW.** The source material states the premise as system description rather than as
a claim about the game; this is the first attempt at the second thing. `DESIGN.md` §1 is what it was
drawn from.

---

## 3. Target audience

> **✅ ANSWERED BY AARON, 15 September 2026 — D232. This section is no longer a draft.**
>
> **"I have created this game for someone who like me — and the inspiration draws heavily on EU4. Not
> so much the mechanics but rather the things I like about it that make it really fun."**

**The audience is the Europa Universalis player, and specifically the one who plays it for the three
things below.** Not the wargamer, not the optimiser, and — see the correction in §3.1 — **not the
player who wants the machine explained to them up front.**

### The three things he plays EU4 for, in his own words

| | |
|---|---|
| **1. It teaches real history sideways** | *"Although fictitious it is a history game where I have been able to learn a lot about 15–19th century world history and things about it I would never have learned any other way."* |
| **2. You can play it long before you understand it** | *"It is an in depth complex game that looks complicated on the surface but you are still able to play the game and learn something new about how things work and interact with next time. I went a long time before I understood trade properly and I was still able to play and have fun. I didn't even know about estates until 1000 hours into the game and I had fun still."* |
| **3. Ridiculous outcomes, and the writing around them** | *"The world record for fastest world conquer is by someone who playing as Oirat became the Mongolian empire, converted to Catholicism, became the Holy Roman Emperor, and conquered the world. My favorite game play has been Provence becoming Jerusalem. The one I am trying to do but is tricky is as the Aztecs beating back the colonists and taking the fight to their shore."* |

### 3.1 ⚠ This corrects a draft that had it backwards, and the correction matters

**The earlier draft of this section said the audience was "the grand-strategy player who has bounced
off the genre's opacity" — someone who watched a number move and could not find out why.** Aaron's
answer says the opposite about himself: **he played for a thousand hours without knowing a whole
system existed, and had fun the entire time.**

**The correction is not that explanation is worthless. It is that explanation is not the HOOK.**

> **Requirement, and it is testable: the game must be playable, and fun, by somebody who does not
> understand the economy, or transit, or the political board. Understanding a layer is a REWARD for
> coming back, not a toll on the way in.**

**That reframes what the Why record is for, and improves it.** It is not a fix for frustration at the
door; it is **the thing that makes the next layer learnable at the moment a player goes looking for
it.** A player who has just noticed that their standing abroad keeps falling can find out why, on the
turn they get curious — **which is exactly the "learn something new about how things work" loop
Aaron named, made reliable instead of left to forums.**

**⚠ And it puts a real constraint on every satellite after this one:** a system may be deep, and it
may not be a prerequisite. *If a document specifies something a player MUST understand before they can
act at all, that is a finding against the document.*

#### 3.2 The rule this produces, which a screen can actually be tested against

**Found by tracing §19.1**, because the requirement above is not yet something anyone can check:

> **A layer the player has not learned yet must be either INVISIBLE or SELF-EXPLAINING. It must never
> be VISIBLE AND WRONG.**

**Three states, and only the third is a defect.** *Invisible* is fine — drift and sentiment run for
sixty turns whether or not anybody opens the politics screen, and a movement declaring is the system
acting on you before you act on it. *Self-explaining* is the Why record. **Visible and wrong is the
port a player can see and cannot use** — `board-design.md` §14.5: **59 of the game's 136 ports reach
no foreign market at all, and nothing on screen distinguishes them.**

**That is not depth waiting to be discovered. It is an unanswerable question**, and it is the exact
failure this requirement exists to prevent.

---

## 4. Player experience and point of view

**You are one nation, and only one.** `Game.getPlayer()` returns an id; `playerNation()` returns null
when that nation has died, because **losing has to be something the game can say out loud**. This is
load-bearing rather than cosmetic: before it existed, a human took every seat, and an annexation was
not a risk but a transfer between two of your own accounts — which is upstream of every balance
complaint the project has recorded. *Built; `DESIGN.md` §6.2.*

**You are a government, not a person.** You have a leader with a name and a set of modifiers, an
ideology you govern as, and a population that mostly did not choose you.

> **⚠ REFINED 24 SEPTEMBER 2026 (D260).** *Aaron, in his own words: "you are the nation itself that you are
> playing." Leaders and governments change underneath, and who is in charge changes how well the nation
> can do things. `DIRECTOR-BRIEF.md` §3.*

### The fantasy

**⚠ DRAFT FOR REVIEW — no statement of the fantasy exists anywhere in the source material.**

**You are trying to hold something together, or put it back, while it actively resists you.** The
design grants competence, not omnipotence: you can see clearly and act deliberately, and it will
still not be enough on its own, because the continent is sixty other governments doing the same.

### The emotional target

**⚠ DRAFT FOR REVIEW — absent from the source material.** Three emotions the mechanisms actually
produce, named from what they do rather than from what would sound good:

| | Where it comes from |
|---|---|
| **Dread on a clock** | Nothing collapses in one turn. The stock discipline rate-limits *change*, so a catastrophe costs `maxFall` and a collapse takes a decade — **long enough to be a story, and long enough to be recoverable.** You watch it coming |
| **Being cornered by your own people** | A movement's demand is a question you must answer, and every answer costs. The release valves are *"four prices for the same relief"* |
| **Earned standing** | Recognition, alliance and reunification-by-consent are all things other nations do *to* you, not things you take |

### The phases of a playthrough

**⚠ PARTLY DRAFT.** The opening and the ending are measured; the middle is a ruling that is not
built.

| Phase | | State |
|---|---|---|
| **Opening, roughly turns 1–30** | The painted movements grow toward their ceilings. **First secession measured at t22–t29 across four seeds** at the shipped `sent.maxRise` of 0.014 | Built |
| **Middle, from roughly turn 60** | **The painted movements have capped out.** D223 ruled that the middle game runs on *movements born in play* — round 1's ruling 42 specifies them (Rejoin, Expand, Reconquer). **None of it is built** | ⚠ Designed only |
| **End, to turn 200 / 2086** | Victory checked every world turn over every nation. **The board is still politically alive at the end:** within-nation spread of the leading ideology's share runs **13.3 (t0) → 7.5 (t50) → 5.5 (t100) → 4.8 (t200) → 4.8 (t300)** — it stabilises rather than decaying | Measured |

**⚠ A playtest is sixty turns; a game is two hundred.** These are different numbers and the project
has conflated them once already. The alpha's definition of done is a sixty-turn test, which is
exactly the window the painted movements cover — *so the alpha cannot see the hole in the middle
game.*

---

## 5. Unique selling points

> **✅ REWRITTEN 15 September 2026 against D232, and the order changed.** The first draft led with the
> Why record. **Aaron's answer says that is not what pulls him in**, so the three things he actually
> plays for lead, and the Why record follows as what serves the second of them. *The draft's version
> is not deleted — it is demoted, and §3.1 says why.*

### 5.0 The three that answer "why this instead of Paradox", because they are why HE plays Paradox

**1. It teaches you your own country, sideways.** This is the EU4 effect pointed at America. **The
board is real**: 3,143 counties with real 2024 population, BEA output and presidential vote; borders
cut along cultural regions somebody actually painted; **fifteen chokepoints that are all real places**
— the Soo Locks, Cairo, the Chicago canal, the Mouth of the Mississippi. A player who finishes a game
knows **why Louisiana matters, what the Mackinac Straits are, and which states cannot reach the sea
without asking** — and none of that was taught, it was played. *Aaron on EU4: "things about it I would
never have learned any other way."*

**2. You can play it long before you understand it, and understanding is the reason to come back.**
See §3.1 — this is a **requirement**, not a boast, and every satellite is answerable to it.

**3. Stories worth telling afterwards.** The design already produces these and they were designed
before Aaron said this, which is the good kind of confirmation: **the Texas mission tree's pivot ends
with you reuniting the continent as the United States *of Texas*** — the only pivot in the game that
changes the *name of the prize* — and **Deseret's ends with the trail complete and frontier-free
defection**, a landlocked pariah walking its migration backwards to Ohio. *Aaron's own EU4 examples are
exactly this shape: Provence becomes Jerusalem; Oirat becomes the Mongol Empire, converts to
Catholicism, becomes Holy Roman Emperor, and conquers the world.*

> **⚠ A tension worth naming rather than smoothing, because two good things pull against each other.**
> USP 3 wants **absurd outcomes to be reachable**. The project's whole anti-snowball philosophy exists
> to stop runaway outcomes — reach that refuses you, a coalition that forms against you, an Influence
> floor a conqueror cannot clear. **These are not the same thing** — the brakes punish *dominance*,
> and a Provence-to-Jerusalem run is *improbable* rather than dominant — **but nothing in the design
> currently says so on purpose, and a brake tuned carelessly would flatten exactly the runs that make
> the best stories.** *Open question 4.*

### 5.1 And the one that is genuinely unlike anything else in the genre

**Every number can explain itself.** Every power stock returns a **Why record**: its value, its
target, and the full list of inputs with each one's raw figure, its normalised figure, its weight,
its contribution, the tunable key that moves it, and a sentence saying what it is. Nothing
downstream recomputes anything — the panel, the leaderboard and the summary all read the same
record, **so they cannot disagree with each other.** The AI scores moves in the same shape, because
*"why did Texas attack me"* is a question the game has to be able to answer.

⚠ *The claim that no other game in this genre does this is **written from memory and is not
verified.** It is the load-bearing claim under this USP and somebody should check it against actual
titles before it goes in front of a player.*

### 5.2 Two more that hold, and are about how it plays rather than why you start

**Conquest is a trap, and the game says so with arithmetic.** Measured: California conquering
from 58 to 118 Areas over twelve turns moved **Authority 0.501 → 0.515** and **Influence 0.666 →
0.148.** Secure at home, a pariah abroad. The reputational cost scales as `(1 + influence)`, so a
superpower pays more for the same annexation than an unknown does. **And the victory capstone has an
Influence floor**, so a conqueror can hold every acre on the continent and still be unable to close.

**Buy now, pay later, as a recurring motif.** The design has produced the same shape at least five
times independently: haste is available everywhere and the reaction lands later rather than at the
till. Pay above a project's quarterly draw to finish sooner and the chance of being found out rises.
**Triage is the game** — not resource optimisation.

**⚠ None of these has been tested against a player who is not Aaron.** The three in §5.0 are grounded
in one person's account of why he plays the game this one is modelled on, which is a much better
foundation than the guess they replaced — **and it is still one person.** *No player outside this
project has ever seen the game.*

---

## 6. Genre

**⚠ DRAFT FOR REVIEW — implied everywhere, stated nowhere.**

**Turn-based grand strategy**, with an unusually heavy **political simulation** layer and an
**economic** one under that. Closest neighbours by mechanism rather than by marketing: **Civilization
II** for the turn's shape (several things in flight, none of them finishing this turn) and
**Europa Universalis IV** for direction (mission trees, standing arrangements with terms, and
constraints that interlock rather than stack). Both are named by Aaron as the explicit models for the
turn, and the turn was rebuilt from them (D218).

**It is not a wargame.** Force is one derived number pointed at four places, small on purpose —
*"there isn't going to be troops / troop types."*

---

## 7. Visual and audio style

**Visual — partly specified, and specifically.** *Built; `DESIGN.md` §8.*

- **One SVG**, layered: county fills, Area borders, nation borders, nation outline, cultural
  highlights, the action layer, hover and selection. d3 and topojson, both vendored.
- **Eight map modes**, each with a legend: Standard (ownership), Pressure, Political, GDP,
  Population, Geographic, Culture, Economy.
- **Every nation has a flag, drawn as inline SVG from a hash of its id** — layout, palette and charge
  all fall out of it. A flag is a pure function of who you are, so it survives a save without being
  in one and cannot drift from the nation it belongs to. New nations get a **name** drawn against
  their founding ideology: a Distributist breakaway is a *Compact*, a Nationalist one a
  *Directorate*, and no two countries may share a name.
- **A timeline**, stored as one baseline plus per-turn ownership deltas — **13 KB for thirty turns
  against roughly 250 KB naive** — with a cast recording every nation's name and colour when it first
  appears, so the scrubber can name countries that no longer exist.

**⚠ There is no art direction anywhere.** No palette rationale, no typographic intent, no reference,
no statement of what the game should *feel* like to look at. What exists is a description of the
rendering architecture. **Gap 1.**

**Audio: ✅ ANSWERED 15 September 2026 — D232. Aaron: "Not yet."**

**So audio is deliberately out of scope, and it is now recorded as a decision rather than surviving as
an absence.** *That is the whole point of having asked: this project writes down what it is not doing,
with a reason, and audio was the one absence that was simply an absence.* **Nothing about it is
specified and nothing should be invented.** It joins the out-of-scope list in §9.

---

## 8. Platform and primary technology

**Answered, and precisely.** *Built; `README.md` and `DESIGN.md` §2, §8, §9.*

- **The browser.** Plain HTML, CSS and ES modules. **No build step and no framework**, which is a
  stated project requirement: it must still work in six months.
- **`server.py`** — Python standard library only, no `pip install` and no Node. It serves the repo
  statically and adds the endpoints the game needs to persist state.
- **All geography is baked offline.** The browser never does geography at runtime: `build/build_*.py`
  scripts write JSON into `data/` and the game only reads. **The bakes are deterministic** —
  `build_areas.py` produces byte-identical output across runs, which matters because an Area id is
  the join key for the economy data, both map modes and every save.
- **Two directories, and the split is load-bearing.** `data/` is bake output and nothing hand-edits
  it. `content/` is authored — the ideology table, tunable overrides, the two map modes and saves.
- **Tests run in the browser**, written so the same files run under `node --test` unchanged.
  **956 tests across 51 files, all green, in 212.71 seconds** — *measured at sign-off on 14 September
  2026 and not re-run since.*

---

## 9. Schedule and scope

**In scope has no dates, and that is deliberate — this is a solo project with no delivery
commitment.** What it has instead is an ordered phase list.

**The phase order (D217):** Game Design → Technical Design → build order → implementation.

| Stage | |
|---|---|
| **1. Ideation** | ✅ **Closed 15 September 2026.** Seven rounds, **536 ideas and 178 rulings**, counted 14 September |
| **2. Design** | ◀ **Live.** This document and its satellites |
| **3. Technical Design** | Formulas, pseudocode, inputs and outputs, edge cases. **Every number in this stage is the architect's, not the designer's** |
| **4. Build order** | **Aaron's and the planning stage's.** A design document supplies evidence about what depends on what; **it does not rank, recommend or cut** |
| **5. Implementation and verification** | A separate session that writes and tests code |

**What is already built and playable:** the economy alpha — trade as a standing contract with a term
and a fixed price, transit across other nations' ground with compounding tolls and a notice period,
the rivers and their **fifteen chokepoints**, two seas with the Panama Canal shut between them,
Canada and Mexico as places, a trade network map, and all sixty nations using the system rather than
only the player. Tagged `v0.6`. **The alpha test has not been run.**

### Alpha content scope — what the alpha does NOT contain

**Aaron, 15 September 2026, in the tone interview (D239).** *He put these on the list himself; nobody
asked.* **They are scope decisions rather than tone decisions**, and they are recorded here because
**every rule in `docs/design/TONE.md` was written against them.**

| Out of the alpha | |
|---|---|
| **The New Confederacy movement** | Returns post-alpha. `docs/FUTURE-IDEAS.md` **F39 is its return ticket** |
| **The Christian Nationalism movement** | Returns post-alpha. Same ticket |
| **The Despotism government state** | Returns post-alpha. Its mechanics are **F19's** and were deferred there on 9 September — **the same answer reached twice, six days apart, from two directions** |

**Stateless ground IS in the alpha — but it is not a playable nation.** *This splits F19, which had
held despotism and statelessness together as one idea.*

**Alpha content focuses on the Texas area, the Great Lakes and the West.** *That is exactly the ground
of the three mission trees — the Great Lakes union, the five Texas cities, Deseret's trail — and of the
starting situations D236 makes the player's.* **Two decisions taken separately, a day apart, landed on
the same map.**

> **⚠ This lands on documents that are already written.** `identity-design.md` places all 26 movements
> and `movements-design.md` describes what they do; **neither knows that two of them are out of the
> alpha.** *Deliberately not corrected in place: a movement cut from the ALPHA is not a movement cut
> from the GAME, and a design document describes the game.* **The build order is where this is read —
> and under the standing rule, what moves post-alpha is Aaron's and the planning stage's, not a design
> document's.**

---

### Deliberately out of scope

**Unusually well kept, and it is one of this project's real assets.** `DESIGN.md` §12 is an honest
account of where the model stops; `docs/FUTURE-IDEAS.md` holds **F1–F35**; `docs/deferred.md` holds
numbered defects that do not block. The largest standing exclusions:

- **Sub-turn time.** One turn is one quarter and nothing finer exists. A future design would give
  both clocks (F1); today's choice is its outer clock, so nothing is foreclosed.
- **Troops as objects.** Force is one derived number and four slices.
- **Canada and Mexico as actors.** They are geography: not conquerable, no opinion, no negotiation.
  Any bordering state may route through them at a flat placeholder toll.
- **Power stocks per Area.** They are per nation, so grievance terms are uniform across everything a
  nation owns. Named as a change of scope rather than of model.
- **Audio.** ✅ **Ruled out for now, D232 — Aaron: *"Not yet."*** Nothing is specified and nothing
  should be invented. *Recorded here because this list is the difference between a decision and an
  oversight, and audio was the only absence in the project that was merely an absence.*
- **Distance.** **Nothing in the transit layer has a length.** Measured 5 September 2026 from the
  game's own map: the closest two ports on one sea are **16 miles** apart and the farthest **2,578**,
  priced identically. The raw material exists — the data build computes centroids and throws the
  coordinates away.

---

## 10. Game world fiction

**The world as the player meets it.**

**The game opens on 1 March 2036** — the eve of two hundred years since Texas declared itself a
nation. The Union has dissolved. **Sixty-one nations stand where fifty-one states used to be**, and
the first thing the player sees is a newspaper front page dated that day, printing the opening
edition: *The year the Union dissolved.*

**Twelve of the sixty-one are new.** Texas has gone five ways — Dallas, Houston, El Paso, Austin and
San Antonio. California has gone five ways plus a cession to **Cascadia**, whose nine Areas are the
State of Jefferson's heartland. And **Deseret** is half out of the Mormon Corridor.

**Two dramas fall out of the real data and are kept because they were not designed.**

- **Cascadia opens as a green government over ground that wants something else.** Its Civil Liberties
  open at **0.47** against 0.63–0.71 for the other Californian successors, and it is the only opening
  the faction picker rates *brutal*.
- **Austin is the only blue Texan successor and holds the old Texas seat of government**, surrounded
  by the four states it just divorced.

**Deseret is half-born, and that is the whole point.** The Wasatch Front always cedes; every other
corridor Area rolls its own sub-region's odds, and anything that ends up disconnected from Salt Lake
**does not cede and is remembered as `leftBehind`.** It opens unrecognised, with a parent — so
**Utah's signature is the key that unlocks the continent from turn 0.** Measured: the rest of the
continent's per-turn chance of recognising Deseret goes **0.070 → 0.181** the moment Utah gives in.

**⚠ THE FICTION IS ANSWERED TWICE, INCOMPATIBLY, AND THIS IS THE PROJECT'S LARGEST STANDING
DISAGREEMENT.**

| | New nations | Total | Stateless ground |
|---|---:|---:|---|
| **The story** (`secession-ideation.md` §8) | **29** | 47 | Six regions |
| **The board** (built) | **12** | **61** | **None** |

The Deep South, Appalachia, the Gulf nation, the city-states — Philadelphia, New York City, Chicago,
Detroit — and all stateless ground **are a design and are not built.** Four closed ideation rounds
quoted them as though they were the game. **Every document must say which board it means, every
time.** *This is programmer rule 17, and `docs/deferred.md` 33 carries the four content items that
would close it.*

---

## 11. Core loops

**⚠ Absent as such from the source material. Every ingredient existed; nobody had written the loop.
DRAFT FOR REVIEW.**

### 11.1 The turn loop — three beats

**Specified in full in `turn-design.md`.** The shape only:

| | | Costs |
|---|---|---|
| **1. The briefing** | What landed, what came back, what arrived unbidden — and you answer what it asks | **Nothing** |
| **2. The turn** | Start as many things as you like | **Money and time** |
| **3. End turn** | The world resolves and the briefing comes round again | — |

**There is no action budget.** The limits are **money, time and geography**, and none of them is a
rule that refuses you. **Nothing you gain finishes in one turn; a concession is instant.**

> **The organising rule: a turn holds multiple things you can do; none of them finishes in one turn;
> and the things that do finish in one turn are a card you click.**

**The briefing is the payoff loop, and this is the mechanism under *one more turn*: you end the turn
to find out what finished.** With no action budget there is no *you have used your action* moment, so
**the End Turn button is the only boundary the turn has** — and since nothing completes inside a
turn, the briefing is the only place completion is ever felt. **If a player never sees a bar fill,
the projects are invisible.**

### 11.2 The staggered clocks, and how they do and do not surface

**This is what makes the turns unequal, and it is the honest weakness of the current loop.** The
design already runs many clocks at different periods:

| Clock | Period | Surfaces to the player? |
|---|---|---|
| **Project bars** | Several quarters, per project | ✅ **Yes — as a bar with progress.** The newest and the most visible |
| **Trade deal terms** | **20 / 30 / 40 / 50 / 100 turns** — *corrected 16 Sept 2026: this row said 2 / 4 / 8 / 20 plus a fifth term, which is the menu Aaron REPLACED on 6 September. D228 was put to him on that stale premise and **D233 voids half of it**; the project CLAUDE.md is the authority* | ✅ Yes — countdowns at **4, 2 and 1**, then a full-screen card |
| **Transit notice** | **4 turns** | ✅ Yes — *"a corridor holder who gives notice does not stop a deal, he starts a clock on it"* |
| **Elections** | Staggered by a hash of the nation id and the turn | ⚠ **Partly.** Derived, not stored |
| **Movement growth toward a ceiling** | Continuous, per movement | ⚠ **Only via the pressure map**, and only in three bands for other people's ground |
| **Power stocks** | Every world turn, rate-limited | ✅ Yes — the panel reads *"51% — heading for 64%"*, because a nation visibly on its way somewhere for a dozen turns is more useful than the instantaneous number |
| **Relational memory** | Per-event, decaying by `rel.decay` each turn; the territorial window is 20 turns | ✅ **Yes, as a sentence.** A band — Close / Warm / Indifferent / Cold / Hostile — plus the heaviest memory and its age: *"Hostile: took our ground, 3 turns ago."* **But the decay itself is invisible** — nothing says how long a grievance has left to run. *Verified in `js/relations.js` and `js/panels.js`* |
| **Annexation and release clocks** | Authored cooldowns | ⚠ Partly |

**⚠ Open question 3: three of the eight are half-visible, and the most consequential thing on the
list is half-visible in a specific way** — a player can read *that* a neighbour is Hostile and what
for, and cannot read **how long that has left to run**, which is the number that decides whether to
wait or to act now. Whether that is fog worth keeping or an interface gap is a presentation decision,
and `presentation-design.md` owns it.

### 11.3 The strategic loop

**Direction comes from mission trees**, which are the answer to a real hole: *seven ideation rounds
produced 536 ideas without a single goal among them.* Three trees exist — **Great Lakes, Deseret,
Texas** — each with three branches (Standing, Ground, Building), four elements and one pivot. A
completed mission stays completed. **Specified in `missions-design.md`.**

> **The finding worth carrying: all three trees want the Mississippi, for three different reasons.**
> Texas to strangle the Midwest, the Great Lakes to reach the sea, Deseret to hold Cairo and Nauvoo on
> one river. **Three trees written separately, converging on one river. Nobody designed that.**

---

## 12. Objectives and progression

**Three ways to win**, evaluated over **every** nation once per world turn, as a table of rows rather
than as code paths. *Built; `DESIGN.md` §6.2.*

| | |
|---|---|
| **Reunification of the Union** | The seats of government, half the people, half the economy, and floors under *both* power stocks |
| **Ideological Dominance** | Govern well, be heard, and watch the continent come round |
| **Economic Supremacy** | Be the economy the continent runs on, and rich per head as well as in total |

**The Influence floor in the capstone is the whole design.** Without it the shortest path to winning
is conquering the continent — the strategy the rest of the game spends its time punishing. **A seat
you do not own counts toward Reunification if its holder governs as you do and your Influence exceeds
theirs by a margin**, so a beloved hegemon reunifies through nations it never invaded and a feared
one takes every capital by hand.

**Losing has three shapes, and only one of them is being conquered.** Your nation can be annexed;
it can fragment under you; or you can **go with the breakaway** — when a movement declares out of
your own ground you may become it rather than go down with the parent, offered *after* the
declaration so you decide knowing what actually left, and *before* the defeat check, because the case
worth having is the one where the breakaway takes everything.

### ⚠ Two things D223 broke, both named rather than discovered later

1. **The victory targets were reasoned against an eighty-turn game and a game is now 200 turns.**
   `DESIGN.md` §12 states the reasoning in its own words: the targets are two to five times what an
   AI-only world produces, *"on the reasoning that a player playing deliberately for eighty turns
   should substantially outperform a deliberately mild AI. That last step is a judgement rather than
   a measurement, and it is the first thing a real play test should revisit."* **A 200-turn game gives
   two and a half times that horizon.** *The architect's.*
2. **The middle game has no new separatist pressure arriving.** See §4 above. *Designed, not built.*

**⚠ Surviving is not a win and not a loss, and the game says nothing about it.** Sixty-one nations
and three ways to win means fifty-eight ways not to. **A small nation still standing at turn 200 has
done something, and the game has no way to say so.** Filed to `nation-design.md`.

**⚠ The federal remnant plays a different game** — for Washington, putting the country back together
means **restoring** what it already claims to be; for everyone else it means **replacing** it. Round 7
ruled the asymmetry and left its form open. **There are now three candidate answers, not two**: the
same conditions told two ways, its own condition set, or — from the Texas tree's pivot — **the
remnant's story can be seized**, and you unite the continent as the United States *of Texas*.
*Open in `nation-design.md`.*

---

## 13. Game systems — the map, and the index into the satellites

**✅ APPROVED BY AARON, 15 September 2026 — D230.** First proposed at 03:35 that morning and left
unanswered for a day; ratified with two reasons, and **the second one binds everything below**:

> **A GDD is a living document and is never finished, so a fat document now becomes an obese one
> later.** *Smaller parts are also simply easier to work with — but that is the convenience argument,
> and the growth argument is the structural one.*

**So the split is a floor, not a ceiling.** When a satellite outgrows its seam it is **split again**,
and the question asked of a document is not *is this too long to read* but *what will this look like
after a playtest files findings into it.* §13.1 carries the first case.

**⚠ The record carried this count twice, differently, and the reason is now established.** D217 says
*eighteen satellites*; the Control Board says *nineteen* and prints the denominator as **20**.
**Both were true when written, and neither said as of when.** The proposal of 03:35 contained
**eighteen**. **`missions-design.md` was not among them** — mission trees did not exist as an idea
until Aaron introduced them later that night, and the document was written and the list never
updated. *Reconstructed from the session transcript of 15 September and verified against the
proposal's own list.*

> **Master plus NINETEEN satellites — twenty documents in total.**
> **✅ NINETEEN satellites are written and this master makes TWENTY of twenty — 16 September 2026.**
> **✅ ALL TWENTY EXIST — 16 September 2026.** *`presentation-design.md`, the last one, was parked by
> name until `docs/design/TONE.md` existed, because writing what the player reads without a settled
> position on the game's own voice means inventing that position by accident, one caption at a time.
> Aaron ran the interview on the night of the 15th; the document was written the next morning.*
> **⚠ Written is not CLOSED.** *The standing rule is that a round is done when Aaron says so, and he
> has not been asked yet.*
> *Counted and line-measured 15 September 2026 rather than carried forward — and **two figures in
> the table below were already stale**, because traced scenarios were added to both documents
> after D232 and nobody updated the count.*

*Corrected here rather than anywhere else, because this is the first place the list has ever been
written down. `missions-design.md` is marked as the addition.*

### Substrate — nothing above them depends on anything else

| File | What it owns | Depends on |
|---|---|---|
| ✅ `board-design.md` | **Written, 675 lines.** Geography as a graph with costs: Areas, adjacency, the transport network and its entry costs, reach, the rivers and their fifteen gates, the two seas, Canada / Mexico / the world market as **places**. Carries the honest gap that **nothing has a length or a coordinate** | GDD |
| ✅ `identity-design.md` | **Written, 573 lines.** The political board and the one function everything downstream uses: three axes and ten positions, the two trapdoors, affinity, ruling 40's ideology / party / movement distinction, the drift partition, where all 26 movements sit, and what is built | GDD |
| ✅ `population-design.md` | **Written, 453 lines.** How people are counted, how they change their minds, and how they move: the six exact counts, drift, growth, migration's five terms, the sum invariants | GDD, identity, board, power |

### Shared currency

| File | What it owns | Depends on |
|---|---|---|
| ✅ `power-design.md` | **Written, 365 lines.** The five stocks, the rate-limit discipline, and the Why record | GDD, identity, economy, force, governing, diplomacy — *the long list is the point: power is the aggregator* |
| ✅ `turn-design.md` | **Written, 748 lines.** *(Was 572 when this table was filled in; traced scenarios were added after D232.)* One round of sixty-one slots and one world step; the ordered phases and why each sits where it does; the phase contract; projects; what a decision costs and the three things that are free; plan / resolve | GDD, and it names every system whose phase it orders |

### The systems

| File | What it owns | Depends on |
|---|---|---|
| ✅ `movements-design.md` | **Written, 496 lines.** What a movement is (verb, adjective, ideology), the sentiment formula, the two tiers of secession, the three thresholds read as a set, growth on ungoverned ground, demands and the free-and-mandatory answer phase | GDD, identity, board, population, power, force, governing |
| ✅ `governing-design.md` | **Written, 551 lines.** The government, its leader, its elections, and the price of every answer it can give — release, autonomy, change course, become them, referendum, martial law, stealing a result | GDD, identity, power, movements, economy, force |
| ✅ `economy-design.md` | **Written, 444 lines.** What is produced, what is needed, what things cost: six sectors, capacity × utilisation, bands, derived demand, per-sector effects, price formation, treasury, the occupation surcharge, the sector network and its five loops, **and the logistics spiral with its three unchosen brakes** | GDD, board, population, power, trade |
| ✅ `trade-design.md` | **Written, 417 lines.** Deals with terms, transit grants, tolls on what arrives, friction by mode, the route-finder, capacity, the markets abroad, blockade — **and the three unreconciled internal-trade regimes** | GDD, board, economy, diplomacy, blocs |
| ✅ `force-design.md` | **Written, 322 lines.** **⚠ One derived number and THREE places to point it — garrison, border, field.** *A fourth, Ally, is an unconfirmed default and is not built.* Readiness as a commitment; readiness as a commitment; upkeep; the militia split; bases | GDD, population, economy, power, governing |
| ✅ `war-design.md` | **Written, 535 lines.** Declaring, the fight, the three occupation flags and the digestion ladder, the peace treaty's four levers and the blind double-tabling, the war-cost ledger, what breaking a treaty does | GDD, board, force, diplomacy, power, economy, nation |
| ✅ `diplomacy-design.md` | **Written, 458 lines.** What two nations **are** to each other: the relations list, the eight-state spine and its transitions, recognition, coalitions, the contests and their floors, the one offer object with five faces, alliances, guarantees, vassalage, sponsorship, the overture, creditor demands | GDD, identity, power, trade |
| ✅ `blocs-design.md` | **Written, 436 lines.** The two multilateral objects — the light bloc and the heavy federation, with its leader, treasury, turn, toll and collective defence | GDD, diplomacy, trade, power, governing, war |
| ✅ `events-design.md` | **Written, 475 lines.** The crisis and the shock; blast radius in adjacency hops; proportional share; two budgets; no chains; the opening front page | GDD, board, power, movements, presentation |

### The frame

| File | What it owns | Depends on |
|---|---|---|
| ✅ `nation-design.md` | **Written, 605 lines.** **How a country is born, what it holds, how it ends, and how it wins.** One machine for nation-making: declaration, defection, civil-war fragmentation, unite's fracture, envelopment, stranding, release; the minimums; the honeymoon and the fervour; home ground; extinction; the three victory paths and the remnant's asymmetry | GDD, board, identity, power, movements, war, diplomacy |
| ✅ `opening-board-design.md` | **Written, 390 lines.** **The opening position on 1 March 2036** — who exists, what they remember, what is already signed, **and a line down the middle of every page separating built from designed** | GDD, nation, diplomacy, movements |
| ✅ `missions-design.md` | **Written, 1003 lines** — *was 836 before its traced scenarios landed.* **⚠ NOT IN THE ORIGINAL PROPOSAL — this is the nineteenth, added on the night of 15 September** when Aaron introduced mission trees. Three trees, three branches, four elements, one pivot each; what a mission may reward; the name register | GDD, nation, board, trade, diplomacy, movements |
| ✅ `ai-design.md` | **Written, 366 lines.** The other sixty nations: one scoring model over the same Previews the player sees, posture from strain, softmax, the Closing term, and the cost of making it play under a restricted view | GDD, turn, and every system supplying a Preview |
| ✅ `presentation-design.md` | **Written, 706 lines.** The last of the twenty. What the player sees — the map and its modes, the Why-record panel, the one card shape the game asks questions with, the newspaper, the timeline — **and what a nation may know**, because the only fog in the game exists for a screen reason and not a realism one | GDD, **TONE**, board, power, turn, movements, diplomacy, economy, events, ai — *the longest list in the folder, because every system has a surface* |

### Three seams deliberately moved away from `DESIGN.md`'s own section breaks

1. **The eight-state pair spine goes to diplomacy, not war.** It describes what two nations are to
   each other; war is one of its states. Somebody writing the fight should not have to own
   hostility's cooling clock.
2. **All nation-making goes into one document.** Round 1 demanded it — *"conquest's civil wars and
   secession's declarations must produce the same kind of country"* — and no document owned it.
   Triggers stay with the system that fires them; everything downstream of *a country now exists*
   lives in one place, so the two paths cannot grow apart.
3. **Information merges with presentation.** Round 7 ruled what *gates* sight and said plainly it did
   not rule what a restricted view *looks like*, and it handed this stage a better test than
   plausibility: **does this screen become a targeting computer?** That is answerable about a screen
   by looking at it. The test and the screens belong on the same page.

**The reservation stated when the split was proposed — that nineteen is a lot of documents — is
answered and dismissed by D230, and dismissed in the direction of MORE documents rather than fewer.**
It is kept here because the merges it named are the ones NOT to make. The case for the split is that
the Technical Designer takes one system at
a time and should
never have to read a system they are not writing. **The merges that were on the table and are now off — `identity` into `population`, `force` into
`war`, `blocs` into `diplomacy`** — each cost the reader something described above, and under D230
each would also be a document built to grow obese.

### 13.1 The first document that will have to split again, and it is already the largest

**`missions-design.md`, at 1003 lines, is the biggest thing in this folder and holds two different
kinds of content**: the mission *system* — what a mission is, the three branches, the four elements,
the pivot, what a reward may be, the name register — and then **three authored trees**, which are
content rather than system.

**Its own open question 4 is whether the other fifty-four nations get trees.** If the answer is ever
yes, this document holds a system plus up to sixty-one trees. **Under D230 that is the definition of
the thing to avoid**, and the seam is already visible: §§1–4 are the system and §§5–7 are three
instances of it.

> **Recommendation, for when it is needed and not before: split at that seam —
> `missions-design.md` keeps the system, and the trees move to their own document or one per tree.**
> **Do not do it now.** Three trees is not a problem, and splitting a document that is working costs
> a round of cross-references for no present gain. **The trigger is the fourth tree.**

*Recorded here rather than acted on, because `missions-design.md` is written and correct and this is
a prediction about it rather than a defect in it.*

---

## 14. Interactivity — what the player is actually doing

**⚠ Absent from the source material in these terms. DRAFT FOR REVIEW.**

| Kind of engagement | What asks for it | Weight |
|---|---|---|
| **Perceptual** | Reading the map. Eight modes, and **the pressure map is the one that matters** — it is where a player sees trouble before it arrives | **High.** The map is the primary instrument |
| **Short-term cognitive** | Answering the briefing. A card arrives, it states the options and their costs, you pick one | **Medium**, and deliberately bounded — a card is one decision with stated prices |
| **Long-term cognitive** | Running several projects against a quarterly bill, against a mission tree, against sixty other governments. **This is the game** | **The dominant mode** |
| **Emotional** | Watching a stock fall for a decade. Being asked by your own people. Deciding whether to go with the breakaway | **High and slow** |
| **Social** | ❌ **None.** Single player. No multiplayer anywhere in the design, not deferred and not ruled out | — |
| **Cultural** | **Very high, and unusual.** The player is expected to recognise their own country — their county, their state's fault lines, the actual 2024 vote. **The names are puns and the puns are deliberate** | **A primary draw and an unexamined risk** |

**⚠ The cultural axis is the one nobody has examined.** A game about the United States coming apart,
using real voting data at county resolution, is making a claim whether or not it intends to.
**Nothing in fifteen thousand lines of design material addresses tone, framing, or how the subject is
handled.** *Open question 5, and it is squarely Aaron's — it is a question about what the game is
saying, not about how a system works.*

---

## 15. Cross-cutting concepts

**Everything here is relied on by several systems, so no satellite owns it. All are built.**

### 15.1 Three axes and ten positions, and the one function

> **✅ RULED BY AARON, 15 September 2026 — D231. Three axes and ten positions.** The politics round's
> rulings 1 and 2 stand, and **the built two-axis model is what changes.** The design below is
> authoritative; §15.1a records what is built today, because it is what every formula currently reads
> and the Technical Designer has to convert it.

**Politics is not a letter, and it is not a left-right line.** Three axes, each running **−1 to +1**:

| Axis | | |
|---|---|---|
| **Economy** | collective | neo-liberal |
| **Morals** | conservative | progressive |
| **Power** | authoritarian | libertarian |

**The eight corners of that cube are parties, each named for a real one**, because what a player meets
on a ballot is a party and not an ideological family. **Laid out as Aaron arranged them — morals run
across, and within each moral half power runs from authoritarian on the OUTSIDE to libertarian on the
inside:**

| | cons / **auth** | cons / lib | prog / lib | prog / **auth** |
|---|---|---|---|---|
| **Collective** | Fascism | Distributism | Democratic Socialism | Communism |
| **Middle** | ← *Republicans, across both conservative columns* → | | ← *Democrats, across both progressive columns* → | |
| **Neo-liberal** | Christian Nationalism | Anarcho-Capitalism | Liberal Anarchy | Digital Technocracy |

**That layout makes the horseshoe visible, and nobody authored it.** Fascism sits at one far edge and
Communism at the other, and they are **neighbours rather than opposites** — they differ on morals
alone and agree on both a collective economy and an authoritarian state. *The cube said so by
arithmetic before the picture did.*

**Plus two centrists, which is what makes it ten.** Republicans and Democrats hold the middle on
economy and on power and sit at one end of morals. **Only these two stand over solid ground; every
one of the eight corners has a trapdoor under it.**

**And two things you FALL INTO, which are not positions and cannot be stood for:**

| | |
|---|---|
| **Despotism** | Off either authoritarian end. One party or none, full command of the state, and every other nation treating you as what you have become |
| **Stateless** | Out through the libertarian middle. The government dissolves into ground with people on it and nobody in charge |

**⚠ The falling itself is DEFERRED at Aaron's instruction — `FUTURE-IDEAS.md` F19, after the alpha.**
What despotism buys, what it costs in standing, and how far *too far* is are **not answered and no
placeholder was invented for any of them.** The two conditions stay named on the board because the
shape needs them: *a corner with nothing beyond it is not a corner.*

#### Why ten rather than eight, measured rather than asserted

**A centrist sits √2 from each of the four corners on its own moral side; any two corners are 2
apart.** So Republicans are closer to fascists, distributists, Christian nationalists and
anarcho-capitalists than any two of those four are to each other — **the mainstream party is the great
coalition-builder of its own half, without being bland.** And **Republicans and Democrats are exactly
2 apart, the same distance as fascism and communism**, which is a true and useful thing to be able to
say about American politics.

*Recorded against the ruling and not to be re-raised: nine positions were recommended — the eight plus
a dead centre — and Aaron chose against it twice, knowing the cost. If coalitions later feel flat, the
centre is three numbers.*

#### The drift partition, and it is the opening move

**Each centrist can reach exactly four corners**: the ones that vary economy and power while keeping
its morals. **2 × 2 = four each, and 4 + 4 = 8 covers every corner exactly once.** No corner is
unreachable and no corner is reachable from both. *Verified, and tighter than it was stated.*

> **This is why the board can open on real election data.** The 2024 county seed gives Republican,
> Democrat and Other — and Republicans and Democrats **are two of the ten positions**, so the seed
> lands directly on the centrists and drift carries people outward to the corners over the course of a
> game.

**⚠ AND THAT APPEARS TO DISSOLVE THE LARGEST JOB RULING 1 LEFT OWING, WHICH IS AN OBSERVATION OF MINE
AND NOT A RULING.** Ruling 1's roster was eight corners with no centrists, so it recorded that
*"neither major party maps onto a corner, so both must be split across the eight by cultural region —
authoring, not engineering, and the largest single job in the change."* **Ruling 2 then added the two
centrists and superseded that roster.** If the seed lands on the centrists, that authoring job is not
needed at turn 0. *Flagged for confirmation as open question 6; it is not treated as settled.*

#### The one function everything downstream uses

```
affinity(a, b) = 1 - distance(a, b) / MAX_DISTANCE      // 0..1
```

**Coalitions, drift attraction, splinter direction, defection targets, civil-war severity, trade
alignment, liberty satisfaction, AI diplomacy and the price of changing your own politics all derive
from it.** That is what makes a position cost three numbers rather than a hand-authored compatibility
table against every other position. **A shared economic axis is trade alignment; a shared moral axis
is moral alignment**, and the axes are readable separately.

**⚠ `MAX_DISTANCE` IS NOT AUTHORED FOR THE NEW BOARD, AND THIS IS THE FIRST THING THE TECHNICAL
DESIGNER MUST SETTLE.** *Gap 11.* On two axes it is **1.7804**, the *actual* widest authored pair,
deliberately not the box diagonal — because normalising on the diagonal would squash every real
affinity into the top third of the range and make every tuned threshold mean less than its label says.
**On three axes the widest authored pair IS the box diagonal**, because opposite corners exist: two
positions differing on all three axes are **2√3 ≈ 3.4641** apart. *That figure is my arithmetic from
the √2 and 2 distances the ruling states, not a number anybody authored.* **Every threshold tuned
against 1.7804 is re-tuned against whatever replaces it.**

#### A movement is a slice, not an eleventh position

`area.mov[name]` is a slice of the people already counted under a position — Deseret's members are
counted in their political position *and* recorded as organised under Deseret. **The whole population
is always exactly the sum of the positions**, so every phase that moves people ignores movements
entirely, and a cleanup phase clamps each movement back inside its bloc once a turn. **Deseret is
therefore not an opinion but an organisation of an opinion**, which is what lets the model tell
*"Deseret grows"* and *"Conservative Nationalism grows"* apart.

**⚠ Ruling 40 is what makes this sayable and it belongs here: ideology, party and movement are three
different words for three different things.** The corners are occupied by **parties** and by
**governments**, not by **movements**. *Full treatment in `identity-design.md`.*

### 15.1a What is BUILT today — six ideologies on two axes

**This is not the design. It is what every formula in the game currently reads**, and it is recorded
here because converting it is the single largest piece of work D231 creates.

Six ideologies at fixed coordinates on an **economic** axis (collective ↔ market) and a **social**
axis (liberal ↔ traditional), authored in `content/ideologies.json`:

| id | Ideology | economic | social |
| --- | --- | ---: | ---: |
| `red` | Republican | +0.6 | +0.2 |
| `blue` | Democrat | +0.3 | −0.4 |
| `green` | Democratic Socialist | −0.6 | −0.7 |
| `yellow` | Conservative Nationalist | +0.5 | +0.7 |
| `orange` | Distributist | −0.4 | +0.6 |
| `purple` | Socialist | −0.8 | −0.2 |

```
affinity(a, b) = 1 - distance(a, b) / MAX_DISTANCE      // 0..1
```

**Coalitions, drift attraction, splinter direction, defection targets and civil-war severity all
derive from it.** That is what makes six ideologies cost two numbers each instead of fifteen
hand-authored compatibility pairs, and a seventh cost two more rather than six. A shared economic
axis is trade alignment; a shared social axis is moral alignment, and `axisDistance` reads them
separately.

**`MAX_DISTANCE` is 1.7804** — the *actual* widest authored pair, Democratic Socialist to
Conservative Nationalist, **not** the 2√2 diagonal of the coordinate box. Normalising on 2.8284 would
squash every real affinity into the top third of the range and make every tuned threshold mean less
than its label says.

**Where the sixth ideology's people come from, today.** The 2024 result gives three numbers.
Republican becomes `red`, Democrat becomes `blue`, and **Other is split across the remaining four by
cultural region** — a third-party voter in Vermont is not the same person as one in Alabama. Weights
are carried for all 20 regions with a flat default, and the split runs on the merged Area rather than
per member county. **Other is 1–4% of most counties, so this sets the texture and movements provide
the shape.**

**Units are rigid, because mixing them is the easiest bug to write here.** Populations are people
(exact). Shares are percentages, 0–100. Affinity and cohesion are fractions, 0–1.

#### ⚠ What converting this costs, named rather than discovered

**This is the single largest piece of work in the project and it is the architect's to size, not
mine.** What is nameable today:

| | |
|---|---|
| **Six buckets become ten** | Every Area holds exact per-position counts, and the sum-to-population invariant the whole model rests on has to hold across the new roster |
| **Every threshold is re-tuned** | Because `MAX_DISTANCE` changes, and affinity feeds coalitions, drift, splinters, defection, civil-war severity, trade alignment, liberty satisfaction and AI diplomacy |
| **`axisDistance` gains a third axis** | And the two-axis readings that mean *trade alignment* and *moral alignment* need saying again for three |
| **The seed changes shape** | Republican and Democrat stop being two of six ideologies and become two of ten **positions** — see the drift-partition note above, which may make this *simpler* rather than harder |
| **The movement roster is re-placed** | ⚠ **Already done.** All 26 live movements were placed on the ten positions when the politics round closed, and that work has been sitting unused since 11 September |

### 15.2 The Why record

Every power stock returns its own working — value, target, raw, base, and an array of inputs each
carrying a label, its raw and normalised figures, its weight, its contribution, **the tunable key
that moves it**, and a sentence saying what it is; plus a one-line summary built from the same array.
**Nothing downstream recomputes anything.** The AI's move scores are the same shape, with one
difference: **a score may be negative**, because the difference between a bad move and a
catastrophic one has to survive, and clamping to [0, 1] destroys it exactly where it matters.

**Normalise before weighting.** Every input is mapped to 0–1 by a named curve — `ramp` for quantities
with a natural *enough*, `saturate` for unbounded counts with diminishing returns — **before** its
weight applies, so weights are comparable and a slider means the same kind of thing everywhere.

### 15.3 The stock discipline

```
value = max(floor, clamp01(previous + clamp(target - previous, -maxFall, +maxRise)))
```

**The change is rate-limited, not the value, and that difference is the whole anti-death-spiral
guarantee.** Clamping the value to a minimum leaves the *pressure* unbounded, so the moment the clamp
relaxes the nation falls off a cliff — the clamp hides the problem. Limiting the change means a
catastrophic turn costs `maxFall` and a collapse takes a decade. **`maxFall` is 0.08 and `maxRise` is
0.05, because standing is easier to lose than to build.** A stock with no previous value opens **at**
its target rather than climbing from the floor. The `target` is kept beside the `value` so the panel
can say *"51% — heading for 64%"*.

**Turn-0 bands across the 51-state baseline: Authority 0.44–0.56, Influence 0.45–0.66, Quality of
life 0.55–0.98, Civil liberties 0.60–0.84.** *Measured.*

### 15.4 Columnar state

Every per-Area field is one typed array indexed by an integer node number, declared once in a
`FIELDS` registry. **A turn's snapshot is one `.slice()` per field, and adding a field is one
registry entry** — clone, byte accounting and the save path all iterate the list, so nothing can add
a field that the save silently drops. **Float64 for people and money** (the world total is an exact
integer invariant and 24 bits of mantissa is not enough); Float32 for bounded 0–1 scores.

**A nation is derived, never stored.** Population, GDP and politics are always the sum of the Areas it
owns, and the suite enforces it: every Area's ideology counts sum exactly to its population, and every
nation's totals reconcile with its Areas'. **Ownership is stored in exactly one place.**

### 15.5 The phase contract

A world turn runs a fixed order of phases over the columnar buffer. Precisely:

- **No phase reads back a value it wrote.**
- Every cross-Area **aggregate** is computed from the snapshot.
- Per-Area values **do** compose down the pipeline — a later phase sees an earlier one's result. This
  is deliberate and noted at each site that relies on it.
- **Ownership is snapshotted for the whole turn**, so a phase that moves an Area cannot make its
  successors see the move.

**Two phases read Areas other than the one they write, and they are the two that need care.**
Political drift reads its neighbours' mixes. **Migration writes to its neighbours, which is worse:**
every flow on the board is computed before any is applied, because applying as it goes would let the
first Area's arrivals decide the second's departures — **and the node numbering would decide who
moved.**

**Two orderings are load-bearing and should not be moved without reading why.** The five power stocks
recompute **last**, because every input the power phase reads is a result of *this* turn; running it
earlier would report the previous turn's world with this turn's label on it. **Elections run just
before them** for the mirror-image reason: the four things a government is answerable for at the polls
are four of the five stocks, and an election held after the recompute would be judging the world its
own result produced.

### 15.6 Plan and resolve

`Moves.plan(intent, tune)` is **pure** — no RNG, no DOM, no mutation — and returns a **Preview**:
`{ok, reason, cost, effects[]}`. The interface renders it and then calls `Moves.resolve`. The AI
plans over its candidates, scores the previews, and resolves the winner.

**Being the same function is what stops the player's preview and the AI's model from ever disagreeing
about what an action does** — and a disagreement there is *unfalsifiable from inside the game*,
because each side only ever sees its own answer.

**`reason` is a sentence, not a code**, so the interface prints it and the AI filters on `ok` without
either re-translating.

### 15.7 Determinism

**The same seed reproduces a run exactly. It is tested.** Each system has its own named random stream
derived from `hash(seed, name)` — `spawn`, `combat`, `turnorder`, `unite`, `drift`, `scenario` — so
**adding a die roll to combat cannot reshuffle party spawns.** The whole generator serializes and
restores in one step. Neighbour rows in the adjacency graph are sorted by index, so neighbour order
is a property of the graph rather than of a file's key order — which used to decide `argmax` ties and
make a re-bake a silent replay divergence.

### 15.8 One tunable per constant

**Every model constant is a named tunable** with a label, a doc line and a slider range. `TUNE.get`
records every read and `TUNE.trace(fn)` returns the exact set of keys a computation touched.
**The schema holds 370 entries** — *counted 15 September 2026.* Authored overrides live in
`content/tunables.json` and the dashboard generates every slider from the schema, so a tunable added
in code appears with no work and one renamed cannot leave a stale control behind.

**Honesty about the tuning, stated by the project against itself:** most numbers are still chosen by
argument rather than measurement. Counted strictly — a doc that says *measured* and then gives the
number — **that was 21 of 298 sliders**, and the denominator has since moved to 370 without the
numerator being recounted.

---

## 16. What the player is measured in — the five stocks

*Full working in `power-design.md`. Named here because eight satellites read them.*

| Stock | What it measures | Rises with | Falls with |
|---|---|---|---|
| **Authority** | How firmly a state holds its own ground | Age, tenure, wars won, solvency, cohesion | Territory lost, occupation, overreach, self-rule granted |
| **Influence** | How much the rest of the world listens | Economic weight, trade reach, alignment abroad | Conquest × (1 + influence), blitz pace, occupation, a coalition against you, not being recognised |
| **Quality of life** | How well it feeds, treats and pays its people | Food security, healthcare, prosperity | Fiscal strain |
| **Civil liberties** | How freely it lets people disagree | Alignment at home, government type, prosperity | A divided people, occupation, a garrison at home |
| **War weariness** | What a decade of fighting costs at home | Wars fought, ground taken, civil wars | Peace, and only peace |

**Authority and Influence must be able to disagree — that is the entire reason there are two.**
See USP 3 for the measurement.

**War weariness is the one that runs the other way**, and the only stock with a floor of zero rather
than of `power.floor`: **a nation at peace is not eight per cent exhausted.**

---

## 17. Open questions

*A decision Aaron has not made. Ordered by what blocks the most work.*

| | | Blocks |
|---|---|---|
| ~~**1**~~ | ~~**Is the split approved, and is it nineteen satellites?**~~ ✅ **ANSWERED 15 September 2026, D230 — yes, nineteen, and the reasoning pushes toward more documents rather than fewer.** *A GDD is a living document and is never finished, so a fat document now becomes an obese one later.* **The split is a floor, not a ceiling** (§13), and §13.1 names the first document that will have to split again and the trigger for doing it | — |
| ~~**2**~~ | ~~**Audio: is there any?**~~ ✅ **ANSWERED 15 September 2026, D232 — "Not yet."** Deliberately out of scope and now recorded as a decision rather than an absence. §7 and the out-of-scope list in §9 | — |
| ~~**3**~~ | ~~**Three of the eight staggered clocks are invisible or half-visible.**~~ ✅ **MOVED 16 September 2026, not answered — and moving it was the point.** *It is now `presentation-design.md` §9 and its open question 5, with the table of all eight, the reason the relational-decay one is the consequential one (**it is the number that decides whether to wait or to act now**), and a recommended third way that nobody had proposed: **show the DIRECTION and not the date** — "Hostile, cooling" against "Hostile, and getting worse" — which is the shape the pressure map and the power panel both already use, and invents no new vocabulary.* **Still Aaron's** | — |
| ~~**4**~~ | ~~**Target audience**~~ ✅ **ANSWERED 15 September 2026, D232 — the EU4 player, and specifically the one who plays it for the three things Aaron named.** §3 is his words now, not a draft. **⚠ It corrected the draft rather than confirming it** — §3.1, and the correction produces a testable requirement: *the game must be playable and fun before it is understood* | — |
| ~~**5**~~ | ~~**Tone and framing.**~~ ✅ **ANSWERED 15 September 2026, D238 — `docs/design/TONE.md`: 41 rules and 11 worked examples, from the interview he asked for.** **The position in one line: the game holds no opinion about what the player does, every judgement in it belongs to somebody in the world, and the model is the honesty — the paper may spin but may not lie.** *The route is worth recording: he refused to answer the card and asked for a prompt instead, which turned a question into a piece of work and produced far more than a card would have. **Nine tone questions remain open inside that document and are his**, and it also turned up three faults nobody had found.* **The original card, for the record:** Aaron, 15 September: *"take this thought/question and give me a prompt that I can put into claude chat that will ask me questions about this. Then it will take my answers and format it into a document based on what you need."* **That turned it from a card into a piece of work** — delivered as `prompts/tone-interview.md` and answered as `docs/design/TONE.md` | — |
| **5a** | **The nine tone questions `TONE.md` §5 leaves open.** *Not one of them blocks `presentation-design.md`* — the heaviest is whether the player is **told** when their own paper becomes state press, which is a screen that document can specify both ways | `presentation-design.md`, at the margins |
| ~~**6**~~ | ~~**Two axes or three?**~~ ✅ **ANSWERED 15 September 2026, D231 — three axes and ten positions.** The politics round's rulings stand and **the built two-axis model is what changes.** §15.1 is the design; §15.1a is what exists and what converting it costs. **What replaces this question is smaller and is the architect's**, not Aaron's: `MAX_DISTANCE` has no authored value on the new board — gap 11 | — |
| **6a** | **⚠ ONE THING TO CONFIRM, and it is mine rather than a designer's ruling.** Ruling 1 recorded that the largest single job in the change was splitting Republican and Democrat across the eight corners by cultural region, because neither mapped onto a corner. **Ruling 2 then added the two centrists, which ARE Republican and Democrat** — so the 2024 seed appears to land directly on them and drift carries people outward. **If that is right, ruling 1's largest owed job does not exist.** I have not treated it as settled | `identity-design.md` |
| ~~**7**~~ | ~~**May a design session edit `DESIGN.md`?**~~ ✅ **ANSWERED 15 September 2026, D232 — approved.** **The limit is the one the card asked for and it is binding: corrections of FACT only** — a figure that no longer matches what was measured, or a name that changed — **each marked in place, dated, and carrying the measurement that justifies it. Never a change to what the game DOES.** *The permission is now real, and yesterday's edits are retrospectively covered rather than quietly kept* | — |

---

## 18. Gaps

*Referenced and never specified. Distinct from an open question: these may already have been decided
and simply are not written down anywhere.*

| | |
|---|---|
| **1** | **There is no art direction.** No palette rationale, no typography, no reference, no statement of what the game should feel like to look at. What exists is a description of the rendering architecture |
| ~~**2**~~ | ~~**`DESIGN.md` §9 says the save format is version 2.**~~ ✅ **FIXED 15 September 2026** under the permission D232 granted, and marked in place with its date and the line of code that settles it. *It was the fourth self-contradiction in that document, beyond the three D217 found* |
| **3** | **`DESIGN.md` §4.1 and §12 both state that treaties and aid do not exist.** Both are built — a non-aggression pact with a cooldown and a minimum standing, aid as a treasury transfer that buys patronage, and three relation kinds for them. *`docs/deferred.md` 13, found 6 September and still open* |
| **4** | **`DESIGN.md` §6 opens *"One action per nation per turn. Each ends the turn."*** That is a true description of what is **built** and a false description of the design, which D218 replaced. **The two documents now disagree by design** and every reader has to know which they are holding |
| ~~**5**~~ | ~~**The movement roster's live count is not written down anywhere.**~~ ✅ **CLOSED 15 September 2026 by diff, in `identity-design.md` §5.3.** 32 baked, 26 placed on the ten positions, **and the six struck are now named: Anarcho-Capitalist, Delmarva Republic, Eastern Progressives, Fifty-First State, Libertarians, Techno-Autocrat.** *What is still not recorded is WHY each was struck — that moves to `identity-design.md` gap 2* |
| ~~**6**~~ | ~~**Nothing specifies the vocabulary of a card.**~~ ✅ **CLOSED 16 September 2026, `presentation-design.md` §2** — seven parts, every one of them present on every card, and `TONE.md` rule 4 as its acceptance test. **⚠ And specifying it immediately opened a hole the rule could not reach:** *"the default is the worst option available" is ruled for a movement's demand and **undefined for a symmetrical card** — Miami counter-offers, and neither accepting nor declining is obviously worse. Three readings, and they are different games.* **`presentation-design.md` gap 1, found by tracing rather than by writing** |
| **7** | **Nothing says how a nation's opening memories are dated.** Whether they are spread across the two years before turn 0 or all stamped *two years ago* changes nothing visible if eight turns of decay are indistinguishable. **Measure before building** |
| **8** | **No multiplayer exists anywhere in the design** — not built, not deferred, not ruled out, never mentioned. Recorded because its absence is currently an accident rather than a decision |
| ~~**9**~~ | ✅ **RESOLVED 15 September 2026, D232 — traced scenarios are REINSTATED**, and four existing documents now owe one. *The disagreement, for the record:* `docs/design/DESIGNER-BRIEF.md` says *"End every design document with the scenarios it must be able to tell, each one traced"* and calls worked examples *"your test suite"*. The GDD brief of 15 September specifies a four-part satellite — Depends on, the system, Open questions, Gaps — **and traced scenarios are not one of the four.** **Neither written satellite has a traced-scenarios section, and neither does this master.** The newer, more specific brief was followed. *Recorded rather than resolved: whether tracing is dropped or reinstated is Aaron's, and it is the practice that found contradictions in every closed ideation round that the rulings alone did not* |
| **10** | **`docs/design/DESIGNER-BRIEF.md` is itself stale and is the file a new design session is told to paste.** It states the live stage is ideation, names round 4 as the live round, and forbids editing `DESIGN.md` — all three superseded. **A session started from it would begin by contradicting the current phase.** *Found 15 September 2026* |
| **11** | **⚠ `MAX_DISTANCE` HAS NO AUTHORED VALUE ON THE THREE-AXIS BOARD, and it is the first thing the Technical Designer must settle.** It is the denominator of the one function that drives coalitions, drift, splinters, defection, civil-war severity, trade alignment, liberty satisfaction and AI diplomacy, so **every threshold in the game is measured against it.** On two axes the rule was to use the *actual* widest authored pair (**1.7804**) and explicitly **not** the box diagonal, because the diagonal squashes every real affinity into the top third of the range. **On three axes the widest authored pair IS the diagonal** — opposite corners exist — which is **2√3 ≈ 3.4641**. *That figure is arithmetic from the √2 and 2 distances the ruling states; nobody has authored it, and the two-axis rule does not decide it because its whole point was that the diagonal was unoccupied* |
| **12** | **⚠ TWO TONE RULES ARE REQUIREMENTS ON GENERATORS, AND NO GENERATOR KNOWS.** `TONE.md` rule 16 says a generated **flag** may carry no real hate-group iconography, and rule 30 says **leader name pools** are drawn by region and history and **never correlated with ideology**, so the generator cannot make a racial claim nobody wrote. **Both are checked against the generator rather than against a writer** — which makes them the Technical Designer's, and neither generator is specified anywhere. *Rule 17 is the same shape: a generated nation name may not combine with a movement name into an echo of a real regime* |
| **13** | **Nothing says what a design document does when the ALPHA excludes something the GAME contains.** §9's alpha content scope is the first case — two movements and a government state are out of the alpha and remain in `identity-design.md` and `movements-design.md`. *The choice made here was to record the scope centrally and leave the satellites describing the whole game.* **It is a choice and not a convention**, and the next case should follow it or overturn it deliberately |

---

---

## 19. The scenarios this document must be able to tell

**Reinstated by Aaron on 15 September 2026 (D232), after this document was written.** *Worked examples
are the test suite.*

**A master document's scenarios are the CROSS-CUTTING ones — the situations no single satellite owns
and every satellite has to agree about.** A scenario that lives inside one system belongs in that
system's document, not here.

**Four traced. Two narrate. One jams on a document that does not exist yet, which is the correct
result and tells the next writer what it must cover. And the first is traced against the requirement
D232 created, which this document predates.**

---

### 19.1 ⚠ Somebody plays sixty turns without understanding the economy

**The requirement, from §3.1:** *the game must be playable, and fun, by somebody who does not
understand the economy, or transit, or the political board. Understanding a layer is a reward for
coming back, not a toll on the way in.* **Aaron played a thousand hours of the game this one is
modelled on without knowing a whole system existed.**

**Step 1 — what they meet on turn 1.** A newspaper front page dated 1 March 2036. **Asks nothing,
explains the world.** ✅

**Step 2 — what they can act on without understanding anything.** Recognise somebody (free). Answer a
movement's demand (free, and the options are priced on the card). Answer an event (free). **All three
are cards that state their own options and costs.** ✅ *The reactive channel is the layer that needs
no prior knowledge, and it was built that way for a different reason.*

**Step 3 — what happens when they ignore the economy entirely.** The known hollow spot, deliberately
accepted: **nothing bad happens to a nation that does not trade.** Round 4 closed both halves of it on
paper — a cure written on 4 September, and farmland needing imported fertiliser so almost nobody is
self-sufficient — **and neither is built.** *So today a player can ignore the economy for sixty turns
and not be punished, which satisfies the requirement by accident and for the wrong reason.*

**Step 4 — what happens when they ignore the political board.** Drift, sentiment and movement growth
run whether or not they are understood. A movement crossing its threshold **declares**, and the player
is told. **They can lose territory without ever having opened the politics screen** — which is the
right shape: *the system acts on you before you act on it.* ✅

**Step 5 — where it breaks.** `board-design.md` §14.5: **a player holds a port, sees it on their panel,
and cannot sell abroad**, because 59 of the game's 136 ports are river or inland ports that reach no
foreign market. **The model is right and nothing on screen says so.** *That is not depth-to-be-
discovered; it is an unanswerable question, and it is exactly the failure mode this requirement
exists to prevent.*

> **⚠ Mostly narrates, and the failure is specific and fixable.** The distinction that matters:
> **a layer you have not learned yet should be INVISIBLE or SELF-EXPLAINING, never VISIBLE AND
> WRONG.** *A port you can see and cannot use is the third thing.* **That is a rule this document did
> not have and now does — §3.1's requirement, stated as something a screen can be tested against.**

---

### 19.2 ⚠ Two countries are born on the same turn, by two different routes

**Round 1's demand, in its own words: *conquest's civil wars and secession's declarations must produce
the same kind of country.*** **No document owned it, which is why D217 moved all nation-making into
one satellite.**

**Step 1.** A movement crosses its threshold in nation A and **declares**. A country exists.

**Step 2.** Nation B annexes too much too fast and **fragments in civil war**. A country exists.

**Step 3 — and now every system downstream has to treat them identically.** Both need: a name and a
flag (derived, not stored); a government with a ruling ideology; power stocks opening **at** their
targets rather than climbing from the floor; a founding turn; home ground; a place in the relations
list; a recognition status; and an entry in every other nation's memory.

**Step 4 — do they get the same thing?**

> **⚠ JAMS, and correctly: `nation-design.md` does not exist yet.** **This is the document that seam
> was created for**, and the trace is here rather than there because **until it is written, nothing in
> the project guarantees the two routes agree.**

**What the trace hands that document, so it is not rediscovered:**

| | |
|---|---|
| **The honeymoon** | A new nation takes an Authority term for being new. **Deseret takes it and does NOT take the transition GDP cut**, because the shattering predates turn 1 — *so there is already one authored exception to whatever the general rule turns out to be* |
| **Recognition** | A declared nation opens unrecognised; **the opening board's twelve are a scenario exception**, and D227 adds a second for Deseret. **Three cases, one machine** |
| **Memory** | Every state that lost ground writes a back-dated entry toward the newcomer. **Does a civil-war remnant get the same?** Nothing says |
| **The minimum** | Nothing states how small a country may be and still exist — *and `DESIGN.md` records the federal remnant as one Area of 702,250 people* |

---

### 19.3 A player asks why their standing abroad keeps falling

**This is USP 5.1 traced end to end, and it crosses four systems.**

**Step 1.** Influence has dropped for six turns. The panel shows **the value and the target** — *"51%,
heading for 38%"* — because the target is kept beside the rate-limited value so a nation visibly on
its way somewhere is more useful than an instantaneous number. ✅

**Step 2.** The player opens the stock. **The Why record lists every input**: its raw figure, its
normalised figure, its weight, its contribution, and a sentence saying what it is.

**Step 3.** The heaviest negative row is **conquest, scaled by `(1 + influence)`** — so the more
standing they had, the more each annexation cost them. **The row names the tunable that moves it.**

**Step 4 — and nothing downstream disagrees.** The leaderboard's sort reads the **stored** value; the
one-line summary is built from the **same** inputs array the panel prints. **They cannot contradict
each other, because there is only one record.** ✅

**Step 5 — and the AI's reasoning is the same shape.** *"Why did Texas attack me"* is answerable from
the same kind of record, with one deliberate difference: **an AI score may be negative**, because the
difference between a bad move and a catastrophic one has to survive, and clamping to [0, 1] destroys
it exactly where it matters. ✅

> **✅ Narrates completely, and it is the strongest thing in the project.** **And §3.1 reframes what it
> is for:** not a fix for frustration at the door, but **the thing that makes the next layer learnable
> at the moment a player goes looking for it.** *This trace is that moment, drawn.*

---

### 19.4 The same seed is replayed on a different machine, in a different browser

**Determinism is non-negotiable and it is tested. This traces why it survives contact with reality.**

**Step 1.** The seed is set. **Each system draws from its own named stream** — `spawn`, `combat`,
`turnorder`, `unite`, `drift`, `scenario` — derived from `hash(seed, name)`. **So adding a die roll to
combat cannot reshuffle party spawns.**

**Step 2.** The map is baked. **`build_areas.py` produces byte-identical output across runs**, and the
save carries a **build stamp** and is refused if the map has been rebuilt underneath it.

**Step 3.** The adjacency graph is traversed. **Neighbour rows are sorted by index**, so neighbour
order is a property of the graph rather than of a file's key order — *which used to decide `argmax`
ties and made a re-bake a silent replay divergence.*

**Step 4 — the browser changes, and this is where it would break.** The route search **does not use
logarithms**, the textbook way to turn a chain of multiplications into a sum. **`Math.log` is not
guaranteed to give bit-identical answers in different browsers**, and *a saved game that replays
differently because it was opened in a different browser is the worst class of bug this project can
produce.* **Multiplying fractions is exactly rounded.**

**Step 5.** Ties in the route search break on a **total order** — most surviving, then fewest hops,
then alphabetically — never on *"whichever the loop found first"*. **Every loop over the graph runs in
sorted order for the same reason.**

**Step 6.** The world turn runs its phases in a fixed order over the columnar buffer, with **migration
computed entirely before any of it is applied** — because applying as it goes *"would let the first
Area's arrivals decide the second Area's departures and the node numbering would decide who moved."*

> **✅ Narrates, and the point of tracing it is the pattern rather than the result.** **Five separate
> systems each had one place where an implementation detail could have leaked into the model, and all
> five were closed the same way: make the thing an explicit property of the data rather than an
> accident of traversal.** *That is a rule the Technical Designer should carry into every system that
> does not exist yet.*

---

*Sources, verified against the files on 15 September 2026 unless marked: `DESIGN.md` §1, §2, §2.1,
§3, §3.1, §4, §4.1, §6, §6.2, §6.3, §8, §9, §11, §12; `README.md`; `js/statedoc.js` (save version);
`data/parties.json` (32 movements); `data/economy.json` (the six sectors); `data/areas.json` (507
merge groups); `docs/design/turn-design.md`; `docs/design/missions-design.md`;
`docs/design/secession-ideation.md` §8; `docs/design/politics-ideation.md` rulings 1, 2, 40;
`docs/design/the-things-above-ideation.md`; `docs/deferred.md` 13, 33; `DECISIONS.md` D163, D166,
D217–D228. **Performance and spread figures are quoted from `DESIGN.md` and `DECISIONS.md` with
their original dates and were not re-measured for this document.***
