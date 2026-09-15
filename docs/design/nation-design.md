# The nation — how a country is born, what it is given, and how it dies

**Stage 2 of five: DESIGN.** A specification for the Technical Designer, not an idea bank.

**Depends on:** `GDD.md` · `identity-design.md` (the politics a newborn takes) · `movements-design.md`
(the declaration that makes one) · `war-design.md` (the civil war that makes another) ·
`diplomacy-design.md` (recognition, and who remembers what) · `power-design.md` (the honeymoon term) ·
`board-design.md` (home ground, and what counts as cut off).

**Read by:** `opening-board-design.md` · `governing-design.md` · `ai-design.md` ·
`presentation-design.md`.

> **⚠ PROGRAMMER RULE 17 — WHICH BOARD.** *Every nation named here is tagged **[BUILT]** or
> **[STORY ONLY]**.* **The board is 61 nations with twelve new ones. The story's 47 with 29 new ones
> and six stateless regions is a design and is not built.** *This is the project's largest standing
> disagreement and this document names it in every trace.*

---

## 1. Why this document exists — and the finding that it is already too late

**Round 1 asked for one thing, in one sentence:**

> **"And one machine for making nations: a civil war that goes badly and a movement that declares must
> produce the same kind of country, with the same birth, because they already share the machinery and
> must not grow apart."**

**They have already grown apart. There are five machines, and they disagree on seven counts.**

> **❌ THE HEADLINE: `applyIndependence` — the honeymoon and the transition cost, the two things that
> make a birth a birth — is called from EXACTLY ONE PLACE IN THE GAME.** *A country born out of a civil
> war, a failed union or a release gets **no honeymoon Authority** and pays **no transition GDP cost**.*
> **This is precisely the contradiction round 1 wrote the sentence to prevent, and it is live.**

---

## 2. The eight routes by which a country comes into existence

| | Route | Built? |
|---|---|---|
| **1** | **Declaration** — a movement holds its heartland and walks out | ✅ |
| **2** | **Defection** — an Area crosses the line and joins a nation that already exists | ✅ *creates no nation* |
| **3** | **Civil-war fragmentation** — an annexation goes badly enough that the contested ground shatters | ✅ |
| **4a** | **Unite's fracture, the secession half** — a failed union throws off cut-off ground | ✅ |
| **4b** | **Unite's fracture, the defection half** — ground joins the target instead | ✅ *creates no nation* |
| **5** | **Release** — you hand territory over on purpose | ✅ |
| **6** | **Scenario successor** — authored, turn 0 | ✅ |
| **7** | **Envelopment** — ground cut off by other nations' land | ❌ **ruled, nothing built** |
| **8** | ~~**Stranding**~~ | ❌ **superseded by 7** |

### 2.1 Declaration — and the two guards that stop the map becoming confetti on turn one

**A movement declares when it holds its heartland, not when it holds every last piece of it.**

**The rule is that it holds ALL of it — and it ships that way on purpose.** *The all-or-nothing test
survived four milestones because nothing could disturb a core; the AI defeated it outright — **one
annexed core Area, whose new owner's authority pulls its sentiment back under the line, holds the whole
movement latent forever.*** *Measured: two declarations over forty turns without an AI, **zero with
one.***

> **⚠ AND LOOSENING IT WAS THE WRONG LEVER, WHICH IS THE INTERESTING PART.** *A movement's core is
> SEEDED over the threshold at setup — so at 70% the Cascadian Separatists **[BUILT — Cascadia]**
> declared on **turn ZERO with 163 Areas.*** **The all-or-nothing test was the only thing between the
> opening position and an instant secession.** *The drought was fixed where it was actually caused —
> unite and release were free, so the AI churned every border — and declarations came back at turns
> 39–44 across three seeds.* **The knob stays because the fragility is real.**

**The second guard is content-side:** *non-ceded corridor Areas open with an elevated Deseret
**[BUILT]** share deliberately **under** the threshold, because an Area over the line on turn 0 defects
on turn 1.*

**And a declaration takes the LARGEST CONNECTED PIECE only.** *Testing the total claim let a movement
declare on four scattered Areas, which the split then broke into pieces: the State of Jefferson
**[STORY-region movement on the BUILT board]** "declared independence taking 4 Areas", **came into
being with two**, was absorbed eight turns later, and re-declared at turn 29 with fourteen.*

### 2.2 Defection — and why it may never make a nation

> *"At a 0.40 threshold and caps up to 0.60, **dozens of Areas sit over the line at once**. Letting
> each leave separately turns the map to confetti."*

**Three gates in order:** a realised nation must exist; the Area must **touch** it — *a movement's
country grows by absorbing the ground next to it, not by teleporting to the far side of the map*; and
at most a few a turn. **Ordered strongest-share-first with a deterministic tiebreak.**

### 2.3 Civil-war fragmentation — the dice, and the floor that keeps it a crisis

**An annexation starts a civil war if it flips your leading ideology, or if what you took is larger
than 15% of what you held on population or GDP.**

```
magnitude = (lead gap between new and old leading ideologies) × (1 − affinity between them)
points    = (0.6 × popRatio + 0.4 × gdpRatio) ^ 0.5
dice      = 2 + 0.5 × magnitude, capped at 6
score     = 12 × points × (d1 + d2 + … + dN)
```

| Score | Outcome |
|---|---|
| **≤ 33** | **Victory** — you take everything |
| **≤ 66** | **Partial** — a contiguous front from your own border, 97% of the selection at the bottom of the band, 15% at the top |
| **> 66** | **Fall apart** — the contested Areas fragment into new nations, and **if none can stand alone the defender holds and you paid for nothing** |

**Measured on the real turn-0 map across 52 triggered wars: 30.8% victory / 30.8% partial / 38.5% fall
apart.** *Before the fix the same measurement was **1.5 / 3.0 / 95.5 — a step function, not a dice
game.*** **⚠ Dated by milestone only; no calendar date is attached in any of the three places it is
recorded.**

**The square root is the load-bearing part:** *points are the bite **relative to the biter**, and the
square root is what keeps doubling your size a bad gamble — mostly fall apart, sometimes partial —
rather than a mathematical certainty.*

**And the floor of two dice is why it is still a crisis:** *losing your governing plurality is a
constitutional event whatever replaces it, and Democrat→Republican is both the commonest flip on this
map and a pair adjacent on both axes — **so without a floor the distance scaling collapsed that case to
a guaranteed walkover. Measured: 400 victories out of 400.***

### 2.4 Unite's fracture — an affinity question, not a letter comparison

**On a failed union, an Area defects if its politics sit closer to the target's than to yours AND it
touches the target; it secedes if its affinity to you falls below the splinter threshold AND it is
geographically cut off.**

> **Both conditions are continuous, so how fissile the map is becomes ONE NUMBER the simulator can tune
> rather than branch logic to edit.**

### 2.5 Release — and the guardrail that stops it being a dumping ground

**A contiguous block large enough to stand alone becomes a new nation; anything smaller joins its
nearest neighbour — never you.**

**A recipient, not a target.** *A neighbour accepts a fragment if it is politically compatible, if it
thinks well of you, or if it is small enough that any territory beats ceasing to exist.* **One that
refuses does not receive, and the Areas stay where they were.**

> *"Without the guardrail, releasing counties is a way to **dump** them: hand a hostile neighbour three
> Areas full of a movement it cannot govern and you have exported your secession problem for free."*

**⚠ The design document is stale on the middle clause.** *It says "a live trade relationship"; the code
now tests standing instead, and says why: **a trade deal was a proxy for exactly this and could not
tell a long partnership from one transaction ten turns ago.*** **Gap 6.**

### 2.6 ⚠ Envelopment — ruled, and nothing is built

**RULED 9 September 2026, superseding both the threshold and the outcome of the rule before it:**

> *"There were times when parts of a country would lose ground to another and parts of its territory
> would be enveloped… **If that happens and it is more than 500,000 people it is a nation, if it is
> less it is a stateless society.**"*

**The threshold stopped being a gate and became a FORK.** *Under the old rule the number decided
whether anything happened at all, which left a silent third case — enveloped ground below the bar that
just persisted, ungovernable and unmodelled.* **Under the fork every enveloped region becomes
something; the size only decides which.**

> **⚠ A TRAP IN THE DETECTION, FLAGGED BEFORE IT IS BUILT.** *The test must be **"cut off by other
> nations' land"**, NOT **"not contiguous"**.* **An island is not enveloped by anybody — it is across
> water.** *A naive contiguity test detaches every overseas holding the moment it is acquired: Alaska
> is 740,133 people and Hawaii about 1.4 million, so **both clear 500,000 and declare themselves the
> turn any nation takes them.***

**Scale:** *500,000 is **0.15%** of the country and sits just under **Wyoming (587,618)**, the smallest
real state.* **148 counties clear it on their own.**

**⚠ "Both figures become named tunables." Neither is.** *Verified this session: there is no key for
500,000 anywhere.* **Gap 3.**

### 2.7 The rule that was struck, and why it is worth keeping the corpse

**The superseded version made ground stateless at 2,000,000 people.** *Struck because **it had big
ground going stateless and small ground staying attached, which is backwards from every other statement
of what stateless ground is.***

**The measurement that killed it:** *2,000,000 is 0.59% of the country; **17 counties are already over
it on their own** — Los Angeles 9.76M, Cook 5.18M, Harris 5.01M; and **507 of the smallest counties are
needed to reach it.***

> **❌ "As written the rule strands Chicago and never strands Montana."**

**And it left one thing standing that the fork keeps:** *stateless ground is a **stage, not a
terminus** — a movement can rise out of it.* **The full life cycle is stranded → stateless → a movement
organises → a nation.** *What makes it coherent is that **nobody chose** a stranded region: it has no
claim and no organising principle, only people who woke up on the wrong side of a line.*

---

## 3. ⚠ THE TABLE — five machines, side by side, and where they disagree

**Read the columns down. Every row that is not identical is a place the one machine is two.**

| | **Declaration** | **Civil-war fragment** | **Unite's fracture** | **Release** | **Scenario** |
|---|---|---|---|---|---|
| **Honeymoon Authority** | **✅ YES** | ❌ **no** | ❌ **no** | ❌ **no** | ✅ yes |
| **Transition GDP cut** | **✅ YES — 12%** | ❌ **no** | ❌ **no** | ❌ **no** | ❌ **no, deliberately** |
| **Government (ruling ideology)** | **✅ set** | ❌ **null** | ❌ **null** | ❌ **null** | ✅ set |
| **Recognition at birth** | pariah | pariah | pariah | **✅ recognised by the parent on day one** | pariah with a parent |
| **Relations memory written** | **✅ both directions** | ❌ **none** | about the *target*, not the newborn | ❌ **none** | scenario |
| **Viability test** | **Areas only** | Areas **OR** population | Areas **OR** population | Areas **OR** population | authored |
| **Accept guard** | none | none | none | **✅ yes** | — |
| **Sub-minimum orphans** | **become a nation anyway** | same | same | **✅ stay where they were** | — |
| **Name** | generated then **overwritten** with the movement's | generated | generated | generated | authored |
| **Labelled what it is** | ❌ **no** | ❌ **no** | ❌ **no** | ❌ **no** | **✅ successor / breakaway** |

### 3.1 The seven disagreements, in plain words

1. **❌ ONLY A DECLARATION GETS A BIRTH.** *The honeymoon and the transition cost fire from one call
   site.* **A country born out of a civil war is the weakest government on the board on the day it is
   founded — no age, no tenure, no reserves, every Authority term reading zero — and it immediately
   starts shedding the Areas that just fought to join it.** *This is round 1's sentence, broken.*
2. **❌ ONLY A DECLARATION GETS A GOVERNMENT.** *§4 — and it is load-bearing for victory.*
3. **Only a release is recognised at birth.** *That is deliberate between release and declaration and
   the reason is beautiful: **"letting go is recognition… a state that DECLARED spends its first years
   as a pariah while the parent calls it a rebellion; a state that was RELEASED is a country from the
   first day."*** **⚠ It is UNDESIGNED for civil-war and unite fragments, which silently take the pariah
   path with no document saying so.**
4. **Only a declaration writes a memory.** *The reason given for writing it — **"with no recorded
   feeling, a parent recognised its own breakaway as readily as a stranger would, and the pivot the
   system is built around never happened"** — applies identically to the other routes, and none of them
   gets the record.*
5. **The declaration uses a STRICTER minimum than everything else** — Areas only, no population escape.
   *This one is intentional and the reason is written down: the population escape exists for civil-war
   fragments, which is a different situation from founding a country on purpose.* **⚠ But it means a
   two-Area, four-million-person breakaway — the Los Angeles [BUILT] shape exactly — can be born from a
   civil war and cannot be born from a declaration.**
6. **⚠ Sub-minimum orphans become countries on three routes and stay put on one.** *With no accept
   predicate and no neighbour to take them, a chunk below **both** minimums is made a nation anyway.*
7. **Only the scenario labels what kind of thing a nation is.** *The interface can say "declared
   breakaway" — and **no in-play birth route ever sets it**, so a nation that literally declared is
   never labelled one.*

---

## 4. ⚠ A NATION BORN IN PLAY HAS NO GOVERNMENT, AND IT CANNOT WIN

**Four lines in the whole game write a ruling ideology.** *Two are elections and appeasement, one is
the scenario, and one is the tier-2 declaration.* **The generic birth path passes a plain string, so the
government comes out with `rulingIdeology` null.**

**The birth path COMPUTES the right answer and throws it away.** *The dominant ideology of the founding
ground is worked out — and used only to pick a **name template**.* **The function that computes it
carries the comment that says what it was for:** *"**a new nation governs as its people do**."*

**And the function that would fix it never runs during a turn.** *Its call sites are setup, movement
spawn, and **save-load only** — where the comment reads "a pre-M3 document carries no ruling ideology;
derive one rather than leaving every nation ungoverned."* **Its own header says what is left of it:**

> *"A government changes hands at an election now, and nowhere else. **What is left here is the founding
> case: a nation that has just come into being out of a collapse holds nothing yet, and takes the
> politics of the ground it stands on.**"*

> **❌ THE FOUNDING CASE IS EXACTLY THE CASE THE PER-TURN LOOP NEVER REACHES.**

### 4.1 What it actually costs, traced rather than guessed

| | |
|---|---|
| **❌ Ideological Dominance is unwinnable** | *A null ideology looks up to −1, the victory term guards on ≥ 0, and the score is **0 forever*** — **for every nation born in play by civil war, failed union or release**, until the game is saved and reloaded, at which point the load path quietly backfills it |
| **⚠ Its flag has no politics in it** | *The accent colour is drawn from the ruling ideology and falls back to a grey shade.* **So these nations are visually a different class of object and nobody decided that** |
| **⚠ The aligned-seat test compares null to null** | *Which is **true**.* **Flagged for verification, not measured** |

---

## 5. What a new nation is given

### 5.1 Its name — and "name and flag, both derived" is only true of the flag

**A breakaway used to take the name of its largest county** — *"Riverside", "Cook", "Miami-Dade" —
which is a place rather than a country, and **read on the leaderboard as though somebody had forgotten
to finish it.***

**Templates are drawn against the founding ideology**, so a Distributist breakaway is a Compact and a
Nationalist one is a Directorate. **The place is the largest Area with its administrative suffix
stripped** — *because "County" / "Parish" / "Planning Region" is a fact about American administrative
geography and not part of a country's name.*

**Two countries may not share a name**, and the reason is not flavour: *fragments break off the same
ground more than once in a long game, and the first cut produced **two separate nations both called the
Fairfax Federation** — which is a leaderboard with two identical rows and a newspaper that cannot say
which one did the thing.*

> **"A qualifier is a better answer than a number: 'Upper Fairfax Federation' reads as a country and
> 'Fairfax Federation (2)' reads as a bug."**

**⚠ But the name is DRAWN ONCE AND STORED.** *It consumes a random stream and depends on which names are
in use at that instant.* **So unlike the flag it is not a pure function of the nation, and the phrase
"name and flag, both derived" is half wrong.** *Gap 7.*

### 5.2 Its flag — genuinely derived, genuinely not stored

> *"A flag is a pure function of who you are — layout, palette and charge all fall out of hashing the
> nation id — **so it survives a save without being in one**, it is the same flag in the panel and the
> leaderboard and the timeline, and **there is no way for a nation's flag to drift from the nation**."*

**Eight layouts, five charges, and a field, accent, trim and flip all pulled from different bits of one
hash.** *Drawn as inline SVG rather than images because **an asset pipeline for something the CPU can
produce in a microsecond is a build step nobody needs.***

**And the design is kept separate from the drawing** *so a test can assert what a flag IS without
parsing SVG, and so a second renderer — a bigger one for an end screen — cannot draw a different flag
from the small one.*

**⚠ It is a pure function of the id AND of two stored fields**, one of which is the ruling ideology —
**which is why §4's null silently drains the politics out of these nations' flags.**

### 5.3 The honeymoon, and the cost that is its opposite

> **A nation founded this turn has no age, no tenure and no reserves, so EVERY other Authority term
> reads zero.** *Without a honeymoon it would be the weakest government on the board on the day of its
> founding, and would immediately start shedding the Areas that just fought to join it.*

**It is a DECAYING Authority term — so a player can watch the reason expire.** *Four turns, decaying
linearly to nothing, and it has its own row in the Why record: **"goodwill toward a government that
just won independence."***

**Against it, a proportional GDP cut.** *Institutions, contracts and trade routes all break at once.*
**Proportional and not an even split, because an even split would flatten the economic map that an
earlier fix spent effort un-flattening.**

**⚠ AND THE TWO ARE DESCRIBED AS OPPOSITE IN DURATION WHEN ONE HAS NO DURATION.** *The documents and the
tunable both say the cost is "shorter in duration than the honeymoon". **It is a one-shot cut applied
once, and nothing ever restores it.*** **Gap 5.**

**They were split apart on purpose, and the reason is the best single sentence about the opening
board:**

> *"The Shattering's Deseret **[BUILT]** is a breakaway that happened **before** turn 0. It earns the
> honeymoon — a population that just got what it wanted still gives its government the benefit of the
> doubt — and it must not pay the transition cost, **because an economy that opens twelve per cent
> under its own published figures reads as a data bug rather than as a story.**"*

### 5.4 Home ground — a set stamped at birth, and it is not a state code

**It used to be one state code, and occupation was "this Area is not in my state".** *Which breaks in
both directions the moment the board is not fifty-one intact states:*

- **Five successors out of Texas all read the same state** — *so one of them annexing another would pay
  **no occupation anywhere in Texas.*** *All five are **[BUILT]**.*
- **A Deseret [BUILT] spanning seven states would count most of its own founding homeland as
  occupied** — paying the superlinear surcharge, dragging four stocks, and **suppressing its own
  movement on its own soil.**

> **The founding grant IS the home ground, whatever states it spans.** *A breakaway across a state line
> is on its own soil in both halves of it.*

**Ground taken later is never home, and nothing becomes home by being held long enough** — *a cost that
expired on its own would be a timer.* **The old state code survives as a display fact and no rule reads
it.**

### 5.5 Its power stocks open AT their target, not climbing to it

**A null previous value means "open at the target" rather than climbing from the floor** — *so a fresh
board shows each nation's real opening Authority instead of **every one of them at 0.08 for the first
fifteen turns.*** **A nation born in play gets this by the same mechanism**, because its stocks are
initialised null.

**And the rate limit is on the CHANGE, not the value, which is the anti-death-spiral guarantee:**

> *"A nation that has a catastrophic turn still ends it with most of the standing it had — **the
> collapse takes a decade of bad turns, which is long enough to be a story and long enough to be
> recoverable.**"*

### 5.6 Its entry in everyone's memory

**Two objects, and only one fires on every route.** *Recognition records who you broke from — **the
whole early game for a new state** — and it is recorded at birth. The generic path infers the parent as
the **modal prior owner** of the newborn's ground.*

**Relations is written on the declaration route only, in both directions:**

> *"The breakaway resents the state it left, and the state it left resents having been walked out on —
> which used to go unrecorded on the grounds that Authority already reads the Areas lost. That was true
> until recognition made the parent's own opinion the thing the rest of the continent waits on: **with
> no recorded feeling, a parent recognised its own breakaway as readily as a stranger would, and the
> pivot the system is built around never happened.**"*

**And recognition's weight is measured:** *Deseret **[BUILT]** opens as a pariah with a parent, **so
Utah's signature is the key that unlocks the continent from turn 0** — the rest of the continent's
per-turn chance of recognising Deseret goes **0.070 → 0.181** the moment Utah gives in.* **⚠ Dated by
milestone only.**

**Recognising costs no money, takes no ground and does not end your turn** — *"charging a nation's one
action for a diplomatic signature would price it at the same rate as a war."* **And it is deliberately
NOT on the AI's candidate list:** *an AI's recognitions are the world making up its mind one pair at a
time, **not a move competing for the one action it gets each turn. A nation that spent its whole turn
signing a paper about a three-Area rump would be a worse opponent.***

---

## 6. How small a nation may be

**A chunk stands alone on AREAS or on POPULATION, whichever it clears first.**

> *"Area count is a poor proxy for whether a breakaway is viable once Areas range from one county to
> eight: **two Areas holding 4 million people between them is a country, and five holding 30,000 is
> not.**"*

| | Value | Why it is that |
|---|---:|---|
| **Minimum Areas** | **5** | *Raised from 3, where it turned out to be **the number quietly deciding whether the map is a world or confetti**: at 3, **75 of the 88 nations a fifty-turn game produced were released fragments rather than anything anyone had fought for.*** **Bounded above by the authored movements** — cores run from 2 to 5 Areas, so a floor of 7 leaves El Paso United, Alaskan Independence and the Rio Grande Union **unable ever to reach the goal they were written to want** |
| **Minimum population** | **250,000** | The population escape, for a chunk below the Area floor |
| **Enveloped ground** | **500,000** | ⚠ **Ruled. No tunable exists** |

> **Two population bars now exist and the harder one is on the case nobody chose — and that ordering is
> correct and should be recorded as deliberate rather than inherited.** *A breakaway arrives with
> leadership, a claim and a reason to cohere; enveloped ground arrives with none of those, so it needs
> more mass to hold together.* **Whether they should be one tunable or two is open.**

**⚠ Three ways a nation can be smaller than BOTH minimums and still exist:** an orphan chunk nobody will
take on any route without an accept guard; **attrition — a nation shrinks below the bar and nothing
ever re-tests it**, because viability is only consulted at birth; and release's refused list, which
leaves the ground with the giver.

---

## 7. How a nation dies — and the one thing the game must be able to say

**The only death condition is zero Areas.** *No population floor, no GDP floor, no dissolution, no
bankruptcy.*

**It is an EVENT, and the reason is the clearest statement of this project's standards in the
codebase:**

> *"A nation being conquered out of existence used to be a silent delete: the swatch vanished from the
> leaderboard, the turn order quietly shortened, and **the player could not tell 'Wyoming was
> annihilated' from 'I mis-clicked'**."*

**A quiet mode exists and is for setup only** — *a scenario dissolves a state by handing every one of
its Areas to a successor, and a death entry on turn 0 would make the verdict card **read every shattered
run as a continent that lost ten nations before the first turn.*** *The scenario announces the
dissolution in its own voice instead, once, on the opening edition.*

### 7.1 And losing has to be something the game can say out loud

> **The player's id keeps naming a nation that has died.** *The one that returns null is a different
> call.* **"Losing has to be something the game can say out loud."**

**It lives in the model and not in the interface, for the same reason the turn order does:** *it is
saved state, the headless suite has to be able to set it, and **a renderer that owns a model invariant
is a renderer the simulator silently disagrees with.***

---

## 8. What this hands the Technical Designer

| | |
|---|---|
| **❌ ONE BIRTH, FIVE ROUTES.** *The honeymoon and the transition cost must fire on all of them, or the difference must be designed and written down* | §3.1 |
| **❌ A nation born in play must get a government.** *It is computed and discarded* | §4 |
| **⚠ Recognition-at-birth is designed for two routes and accidental for two** | §3.1 |
| **⚠ A nation can shrink below both minimums and nothing re-tests it** | §6 |
| **Envelopment is ruled and unbuilt, and its detection has a named trap** | §2.6 |
| **⚠ Neither of envelopment's two figures is a tunable, against the ruling's own words** | §2.6 |
| **The transition cost has no duration and three places say it does** | §5.3 |

---

## 9. Open questions

| | | Owner |
|---|---|---|
| **1** | **❌ Should every birth route give the same birth?** *Round 1 says yes in one sentence. The build says no in five places.* **Is the difference a design or a defect?** | **Aaron.** *The document says the machine must not grow apart; it has* |
| **2** | **Is the remnant's victory the same conditions told two ways, or its own set?** **⚠ Now THREE candidates, not two** — *the Texas tree's pivot supplies one nobody anticipated: **the remnant's story can be seized**, and you unite the continent as the United States **of Texas*** | **Stage 2 — here** |
| **3** | **One tunable or two for 250,000 and 500,000?** | **Open** |
| **4** | **Is the second stranding condition still needed under the fork?** *The fork may have removed the reason for it* | **Open** |
| **5** | **Are the victory targets still right against a 200-turn horizon?** | **The architect.** *"The first thing a real play test should revisit"* |
| **6** | **Are the opening memories dated across the two years, or all stamped "two years ago"?** ⚠ *Two years is **eight turns of decay***. **Measure before building** | **A measurement, then Aaron** |

---

## 10. Gaps

| | |
|---|---|
| **1** | **❌ The honeymoon and the transition cost fire from exactly one of five birth routes** |
| **2** | **❌ Ruling ideology is null for every nation born in play except a declaration**, which makes one victory condition permanently unwinnable for them and drains their flag |
| **3** | **Envelopment's 500,000 is not a tunable**, against the ruling's own *"both figures become named tunables"* |
| **4** | **⚠ A dead outcome branch in the civil war.** *One file tests for an outcome string that another file never produces* — **so on a fall-apart the code falls through to the branch that charges the victims and pays the aggressor**, which is the exact bug its own comment says was fixed. **Present in the playtest build too.** *Detail belongs to `war-design.md`; recorded here because it is a birth route* |
| **5** | **The transition GDP cut is described as having a duration in three places and has none** |
| **6** | **The release recipient test is stale in the design document** — *"a live trade relationship" was replaced by standing, with the reason written in the code* |
| **7** | **"Name and flag, both derived" is half wrong.** *The flag is; the name is drawn once, stream-dependent, and stored* |
| **8** | **⚠ Going with the breakaway is offered on the declaration route only** — *not after a failed union or a civil war* |
| **9** | **⚠ `kind` is never set by any in-play birth**, so the label "declared breakaway" can never appear on a nation that declared |
| **10** | **⚠ A "half the people, half the economy" reunification claim against thresholds of 0.3** — *the tunable doc strings say "Half" and then quote figures consistent with 0.3* |
| **11** | **⚠ "All 51 are playable" survives in the design document** against the 61-nation board used everywhere else in the same file |

---

## 11. The scenarios this document must be able to narrate

**Four traced. Two jam, one narrates and exposes a silent class difference, and one is the best thing
in the system.**

### 11.1 ❌ An annexation goes badly and a country is born out of the wreckage

**Step 1.** A nation annexes a neighbour large enough to flip its leading ideology. **A civil war
triggers.**

**Step 2.** The dice roll. **Score above 66: fall apart.** *The contested ground fragments.*

**Step 3.** One fragment is large enough to stand alone. **A nation is born.**

**Step 4 — it gets no honeymoon.** *No age, no tenure, no reserves — **every Authority term reads
zero**, which is the exact condition the honeymoon exists to cover.*

**Step 5 — it gets no government.** *Its ruling ideology is null. **It can never win on ideology.***

**Step 6 — its flag comes out grey**, because the accent is drawn from a ruling ideology it does not
have.

**Step 7 — nobody remembers it.** *No relations entry in either direction. The parent has no recorded
feeling about the thing that just broke off it, so **it will recognise its own breakaway as readily as
a stranger would** — and the pivot the recognition system is built around never happens.*

**Step 8 — and the aggressor is paid.** *The branch that was written to make the aggressor bleed tests
for an outcome string the war code never produces, so the fall-through charges the victims and pays the
attacker.*

> **❌ JAMS FIVE WAYS IN ONE TURN, and every one of them is round 1's sentence being broken.** *This is
> the trace this document exists for.*

### 11.2 ✅ A movement holds its heartland and walks out

**Step 1.** A movement's core Areas are all over the threshold. **It declares.**

**Step 2.** The largest connected piece is taken — *not the scattered total, because that produced a
country with two Areas that was absorbed eight turns later.*

**Step 3.** The piece must clear the Area floor **on Areas alone**, with no population escape. *Founding
a country on purpose is held to a stricter bar than surviving a collapse, and the reason is written
down.*

**Step 4 — it is given the movement's own name**, not a generated one. **Its government is set to the
movement's ideology.**

**Step 5 — it gets the honeymoon**, four turns, decaying, with its own row in the Why record so the
player can watch the reason expire.

**Step 6 — and it pays twelve per cent of its economy.** *Institutions, contracts and trade routes all
break at once.*

**Step 7 — both memories are written.** *It resents the state it left; the state it left resents having
been walked out on.*

**Step 8 — it opens as a pariah.** *The parent calls it a rebellion, and the continent waits on the
parent.*

> **✅ NARRATES COMPLETELY, and it is the only route that does.** *Everything §11.1 is missing, this has.*

### 11.3 ⚠ A player releases three Areas to get out from under the occupation bill

**Step 1.** The player holds occupied ground whose upkeep is superlinear in the count. **The panel shows
what the handover saves.**

**Step 2 — a recipient must ACCEPT.** *Compatible politics, or it thinks well of you, or it is small
enough that any territory beats ceasing to exist.*

**Step 3 — a hostile neighbour refuses**, and the Areas stay where they were. **The dumping ground is
closed.** *Hand a hostile neighbour three Areas full of a movement it cannot govern and you would have
exported your secession problem for free.*

**Step 4 — a compatible one accepts, and the block is large enough to stand alone. A nation is born.**

**Step 5 — and it is RECOGNISED BY ITS PARENT ON DAY ONE.** *"Letting go is recognition."* **This is the
cleanest difference between the two ways a nation can be born, and it is deliberate.**

**Step 6 — but it gets no honeymoon and no government**, same as §11.1.

> **⚠ NARRATES, AND THE HALF THAT IS DESIGNED IS EXCELLENT.** *Step 5 is the system at its best.* **Steps
> 6 is the same silent class difference, on a route where somebody clearly WAS thinking about what a
> birth means — which makes it a gap rather than an oversight.**

### 11.4 ❌ A nation is cut in half by a war and the far piece is stranded

**Step 1.** Two nations take ground between a state and its own far territory. **The far piece is cut
off by other nations' land.**

**Step 2 — the ruling fires: over 500,000 people it becomes a nation; at or under, a stateless
society.**

**Step 3 — ❌ nothing happens, because none of it is built.** *No detection, no fork, no stateless
object.*

**Step 4 — and if it were built naively it would be worse than not building it.** *A contiguity test
rather than a cut-off-by-land test **detaches Alaska (740,133) and Hawaii (~1.4 million) the turn any
nation takes them** — both clear the bar, both declare, and neither is enveloped by anybody.*

**Step 5 — and the number it would need is not a tunable**, against the ruling's own instruction.

> **❌ JAMS COMPLETELY. Ruled on 9 September, nothing built, and the trap is written down before the
> first line of code — which is the correct order and worth saying.**

---

*Sources, verified 15 September 2026: `docs/design/secession-ideation.md` (round 1's one-machine
requirement, §8's story board); `docs/design/politics-ideation.md` rulings 4 and 5 and their
measurements; `docs/design/events-ideation.md` and `docs/design/the-things-above-ideation.md` for the
two-board rule; `docs/design/GDD.md` §§ on the standing disagreement; `DESIGN.md` §§ on the two tiers,
the war dice, release, home ground, the honeymoon and the transition cost; `DECISIONS.md` D11;
`docs/PROGRESS.md`; `js/world.js`, `js/moves.js`, `js/game.js`, `js/civilwar.js`, `js/identity.js`,
`js/recognition.js`, `js/relations.js`, `js/power.js`, `js/scenario.js`, `js/victory.js`,
`js/ideology.js`, `js/panels.js`, `js/shell.js`; `js/tunables.js`. **The 52-war outcome spread and the
Deseret recognition figures are carried forward with their original milestone attribution and NO
calendar date, because none is recorded. The turn-zero declaration counts (two over forty turns without
an AI, zero with one; 163 Areas at a 0.7 threshold; declarations at turns 39–44 across three seeds) are
quoted with the same caveat. The "400 victories out of 400" floor measurement likewise.***
