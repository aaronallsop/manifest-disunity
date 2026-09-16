# Presentation — what the player sees, and what a nation may know

**Depends on:** `GDD.md`, `TONE.md`, `board-design.md`, `power-design.md`, `turn-design.md`,
`movements-design.md`, `diplomacy-design.md`, `economy-design.md`, `events-design.md`, `ai-design.md`

---

## 0. What this document owns, and the line down the middle of every page

**This is the twentieth and last document of stage 2.** *It was parked by name until `TONE.md`
existed, because writing what the player reads without a settled position on the game's own voice
means inventing that position by accident, one caption at a time.*

**It owns five surfaces and one rule:**

| | |
|---|---|
| **The briefing** | The screen a turn opens on. `turn-design.md` §5 ruled its three sections; **this owns its form** |
| **The map** | Eight modes, the pale ground, and what a region-wide shock looks like |
| **The panel** | The Why record made visible — *"why is my Authority falling"* answered from the array the model already built |
| **The newspaper** | `TONE.md` owns its voice entirely. **This owns its shape, its placement and its frequency** |
| **The timeline** | A border that moved, watched again |
| **And the rule** | **What a nation may KNOW.** Round 7's ruling 3 gated it on the relationship and said plainly it did not rule the form. **The form is here** |

### 0.1 The line, and it runs down every page

**`opening-board-design.md` established the convention and this document keeps it: ✅ means BUILT and
running today, ◻ means DESIGNED and not built.** *Presentation is the document where that line matters
most, because more of this is already built than of any other system in stage 2 — and a reader who
cannot tell which half they are looking at will specify a rebuild of something that works.*

**Roughly two thirds of what follows is ✅.** *That is not an accident: the game has been playable
since before ideation started, so the screens exist and the design has been catching up to them.*

### 0.2 The one rule that binds every word on every surface

**`TONE.md` rules 1 to 4, and they are not advice.**

> **The neutral voice never judges.** *Panels, prompts, tooltips, the ledger and the Why records use
> the name of the mechanic and no adjective with a moral charge.* **If a mechanic's own name reads as
> a verdict, rename the mechanic rather than letting the panel editorialise.** *Every charged word
> belongs to an in-world speaker.* **A prompt that asks the player to decide states what each choice
> does, in the model's terms, and nothing else.**

**So this document has two voices in it and they are never mixed:** *the model's voice — panels,
prompts, the ledger, the Why records, bars, clocks, numbers — and **somebody's** voice — the
newspaper, a movement's motto, a rival's headline.* **Every screen below says which one it is
speaking in.** *Where a surface carries both, the two are visually separated, and the separation is a
requirement rather than a style.*

---

## 1. The briefing — the screen a turn opens on

**✅ Partly built as the turn-summary newspaper. ◻ The three-section briefing is designed and not
built.**

**`turn-design.md` §5 ruled three sections:**

| | | Who can see it |
|---|---|---|
| **1. The continent** | What happened that anybody could see. The front page, per turn | **Everyone. Public facts** |
| **2. Your own government, reporting to you** | What came back from the offers you sent; how your projects are going; what your ministries are worried about | **Gated by ruling 3** |
| **3. World affairs** | Outside the continent. Smaller | Everyone |

### 1.1 It is a scene, not a report

**The rule from `turn-design.md` §8, restated because this document has to build it:** *three to six
things that matter, ranked, everything else one click away.*

**The game already does this twice and both are the precedent:** ✅ *the turn-summary newspaper draws
three to six headlines from the ledger **ranked by kind and magnitude**, and* ✅ *the nation panel
folds so a newcomer meets six lines instead of sixteen blocks — **it hides nothing; everything is one
click away.***

> **The briefing is the payoff loop.** *`GDD.md` §11.1: with no action budget there is no "you have
> used your action" moment, so **End Turn is the only boundary a turn has**, and since nothing
> completes inside a turn, **the briefing is the only place completion is ever felt.*** **If a player
> never sees a bar fill, the projects are invisible.**

### 1.2 ⚠ Nothing ranks the three sections against one another

**`events-design.md` gap 4, and it lands here because ranking is an interface act.** *The newspaper
ranks headlines within itself. **There is no rule for a world dispatch against a movement's
demand**, and those are in different sections.*

**Three candidate rules, none chosen — this is open question 1:**

1. **By section, always.** Continent, then your government, then the world. Predictable; a player
   learns where to look. **Cost:** a demand that will cost you three Areas sits below a headline about
   somebody else.
2. **By what asks you something.** Everything carrying a question floats to the top, in one block,
   whatever section it came from. **Cost:** it dissolves the sections that ruling 3 uses to separate
   public fact from gated fact — *and that separation is doing real work.*
3. **By magnitude, across sections, with the section as a label rather than a container.**
   **Cost:** the most machinery, and magnitude is not comparable across kinds without somebody
   inventing a scale.

> **This is not the designer's to settle alone** — it is a feel judgement about the game's main
> screen. *Recommendation offered and not taken: **3**, because it is the only one that cannot bury
> the thing that matters most this turn.*

### 1.3 ⚠ TWO LIVE DESIGNS EXIST FOR WHETHER A CARD BLOCKS, AND THIS DOCUMENT CANNOT PICK

**`events-design.md` open question 7, verbatim in substance:** *a crisis is **built** as a blocking
card — the code's own comment says it is **the only thing in this game that stops to ask.*** **The
turn design makes every card non-blocking with the worst option as its default.**

**Neither document decides, and they were written a day apart.** *It reaches this document because
blocking or not blocking is what the screen DOES.*

| | **Blocking (built)** | **Non-blocking with a worst-case default (designed)** |
|---|---|---|
| A player who ignores it | cannot | **loses slowly and legibly** |
| Cost | stops the game to make you look | *"A card you never open is a promise you never kept"* |
| Fits the turn rule | ❌ — a decision you did not choose to be asked is free, and a blocker is not free | ✅ |

**The turn design's version is almost certainly right and this document still does not rule it**,
because it changes what happens when a crisis fires and `events-design.md` owns the crisis. **Open
question 2, owner named: Aaron, or the two documents reconciled by whoever writes stage 3.**

---

## 2. The card — one shape for every question the world asks

**✅ Two exist and both already work this way. ◻ Nothing states they are instances of a general
form.**

**`GDD.md` gap 6 is closed here.** *The two built full-screen cards — **a trade deal expiring** and **a
request to cross your ground** — neither uses your turn, both present options with their consequences,
and neither was written as an instance of anything.* **`turn-design.md` requires that they are one.
This specifies the one.**

### 2.1 The parts, and every card has all of them

| Part | | Voice |
|---|---|---|
| **Who is asking** | A nation, a movement, a place, or the world market. **Never "the game"** | — |
| **What they want**, in one line | | **The model's** |
| **The options**, two to four | Each stating **what it does, in the model's terms, and nothing else** — `TONE.md` rule 4 | **The model's** |
| **The price of each**, beside it | The same figures the panel would show | **The model's** |
| **The default**, marked | **The worst option available** (`turn-design.md` §4.2) | — |
| **What silence means** | Named, because for a movement's demand silence is *wait* and not *decline*, and those diverge | **The model's** |
| **Optionally: a quoted voice** | A movement's motto, an envoy's sentence | **⚠ Theirs, and visually separated** |

> **`TONE.md` rule 4 is the acceptance test for this object:** *no prompt contains "betray",
> "restore", "justice", "tyranny", or any word describing the choice rather than its effects.* **The
> worked example is `TONE.md` §3.6** — *"Accept: government passes to the Democrats. Set aside: keep
> office; Civil Liberties −0.12."* **Not** *"Overturning the vote will betray your citizens."*

### 2.2 ⚠ "The worst option available" is not defined for every card, and this is a real hole

**It is defined where it came from.** *A movement's demand has three answers and the worst is
ruled — **wait, and never deliver**, which moves the verb one step toward Separate, always, and never
back.*

**It is NOT defined for a card that is symmetrical.** *Miami counter-offers on a trade deal. Accept
or decline?* **Neither is obviously worse.** *Declining loses a deal you wanted; accepting locks
worse terms for up to a hundred turns.*

**Three readings, and they are genuinely different games:**

- **The default is decline.** *Silence refuses. Safe, and it means an inattentive player never signs
  anything — which makes the whole trade layer opt-in.*
- **The default is whatever the OTHER side proposed.** *Silence is consent. Brutal, consistent with
  "a card you never open is a promise you never kept", and it makes inattention expensive rather than
  merely slow.*
- **The default is the status quo ante**, and the offer simply lapses. *Costs nothing, which
  contradicts the rule that silence always costs something.*

**Gap 1. Nobody has ruled it, and the rule as written does not reach.**

---

## 3. The map

**✅ Eight modes, built: Standard (ownership), Pressure, Political, GDP, Population, Geographic,
Culture, Economy — each with a legend.** *d3 and topojson, both vendored, one SVG in layers: county
fills, Area borders, nation borders, nation outline, cultural highlights, the action layer, hover and
selection.*

### 3.1 Pressure is the real map, and the reason is the game's premise

> ✅ **Built, and `DESIGN.md` says why:** *"In a game about fragmentation this is the real map;
> ownership is what you check to see what the pressure map did."* **Six bands from Quiet to Critical,
> and it is the one mode that shows something BEFORE it happens.**

**Its fog is load-bearing rather than decorative.** *Exact bands on your own ground; **calm / rising /
critical** on everybody else's — which is what stops the pressure map from being an omniscient
targeting overlay for the annex button.* ✅ **Built.**

> **That is the test this document inherits from round 7 and applies to every mode below:
> DOES THIS SCREEN BECOME A TARGETING COMPUTER?** *It is answerable about a screen by looking at it,
> which is why the information rules and the screens live in one document.*

### 3.2 Ground you took is pale until a treaty launders it

✅ **Built, and specified by conquest ruling 13.** *It answers ruling 10's cost of having no visible
front: a country that fights for a trade route can see, on the map, that it does not yet own what it
is standing on.*

**`TONE.md` rule 1 applies to the label and not to the colour.** *The paleness is the model speaking.
The word beside it is **Occupied** — which `TONE.md` §4 names as one of its own honest edges: every
occupying government in the world would reject that word, and the panel speaks the model's language
rather than anyone's in the world.* **Rule 2 says that if it starts reading as an accusation, rename
the mechanic rather than soften the panel.** *Not renamed. Named as contestable.*

### 3.3 ◻ What a shock looks like — the backlog item round 6 filed here

**Round 6's ruling 1 made the first event in the game that is about a REGION rather than a nation**,
and `events-design.md` carries it: *a shock happens somewhere on the map and reaches everything near
it; a nation feels it in proportion to the share of its ground inside the radius.* **The map is what
the player reads, and nothing says what it draws.**

**What the map already gives this for free:** *the blast radius is **walked county by county** rather
than measured in miles, because the map has no coordinates — which `board-design.md` argues is
arguably truer, since a drought spreads along the plains rather than into the mountains.* **So the
shape a shock makes is already a set of counties, which is already the atom the map draws.**

**Specified here:**

- **A shock is drawn as a region, not as a pin.** *The counties inside the radius, as one shape,
  across every border it crosses. **The thing the player must see is that it does not respect
  borders** — that is the entire point of the object.*
- **It is its own map layer, above ownership and below selection**, and it is **on by default for the
  turn it fires** whatever mode you are in. *A shock the player has to go and find is a number, and
  round 6's whole complaint was that a turn should arrive as news rather than as a number.*
- **Proportion is shown as proportion.** *Each nation the region touches reads **how much of its own
  ground is inside** — because that is the term the model actually uses, and a nation with three Areas
  in a drought is in a different situation from one with thirty.*
- **It lasts one turn on the map, as it does in the model**, and then it is in the timeline and the
  ledger. ⚠ *Which raises gap 2 below.*

### 3.4 ⚠ Alaska holds Duluth, and the map says nothing

**`TONE.md` rule 36, and it is a rule about a code path:** *when the board does something ridiculous,
the ledger, panels and papers report it straight — **no special headline, no trigger, no
achievement.*** *Check: there is no code path that detects oddity.*

**So this document specifies an absence, deliberately:** *no distance callout, no "foreign power 2,000
miles away", no exclamation anywhere in the interface.* **The map draws it the way it draws any other
holding.**

> **And the honest cost, from `TONE.md` §4:** *the third of the three things Aaron plays Europa
> Universalis for is "the ridiculousness and sometimes hilarious outcomes".* **Deadpan is the alpha's
> answer and it may be the wrong one.** *`docs/FUTURE-IDEAS.md` **F37** holds the version that
> notices, and the alpha is the measurement.*

---

## 4. The panel — the Why record made visible

**✅ Built, and it is the best thing in the interface.**

### 4.1 The panel IS the inputs array

**`power-design.md` §1 is the convention this section exists to render:** *every function returns
`{ value, target, raw, base, inputs[], summary }`, and each input carries its label, its raw figure,
its normalised figure, its weight, **its contribution**, **the tunable key that moves it**, a note, and
whether it is signed.*

> **"The player's *why is my Authority falling* panel IS the inputs array. Nothing has to be
> recomputed to explain a number."**

**Three things this document must not break:**

1. **The summary is built from the same array the panel renders.** *"A summary that can disagree with
   the numbers beside it is worse than no summary."*
2. **Contribution stays unclamped even where the value is clamped** — so *"your Authority is at the
   floor and here is the 0.4 of pressure holding it there"* remains answerable on screen.
3. ⚠ **A Why record must not have side effects, and that was learned the hard way** — *one note seated
   a leader when the chair was empty, so the term said "Governor Vance" while its own value said nobody
   was in charge.* **A panel that computes while it renders will do this again.**

### 4.2 A stock is shown as a trajectory, not a reading

✅ **Built:** *the panel reads **"51% — heading for 64%"**, because a nation visibly on its way
somewhere for a dozen turns is more useful than the instantaneous number.* **That is the rate limit
made visible**, and it is the one place the player can see the anti-death-spiral guarantee working
rather than being told about it.

### 4.3 ◻ The AI's explanation exists and nothing renders it

**`ai-design.md` §7 and its gap 3, and it calls this *the cheapest valuable thing in that document*.**

> *The full ranked list of every candidate with its score and its Why record is exposed — **"because it
> is the honest answer to 'why did Texas do that', and because a tuning pass on sixteen weights is
> guesswork without being able to ask a nation what it was thinking."*** **⚠ Only the test suite reads
> it.**

**Specified here: it is the nation panel's last fold**, on a nation other than your own, and it is
**subject to ruling 3 like everything else on that panel.** *An ally tells you what it is thinking. A
hostile nation does not.*

> ⚠ **And that is a genuine tension worth stating rather than resolving quietly.** *The reason the
> explanation is valuable to Aaron — tuning sixteen weights by asking a nation what it was thinking —
> is a **developer** reason, and developers are not subject to ruling 3.* **So it has two
> renderings: the gated one on the panel, and the ungated one on the developer dashboard behind the
> dev flag** — where `DESIGN.md` §7.7 already puts the simulator, the ledger and the tuning pass, and
> where the project's own rule says every testing control belongs.

---

## 5. The newspaper

**✅ Built as a turn-summary: three to six headlines a round, drawn from the ledger, ranked by kind and
magnitude — replacing a growth line that said the same thing every turn.**

**`TONE.md` rules 5 to 11 own every word of it and are not restated here.** *What this document owns is
the form.*

### 5.1 Where it sits

**It is section 1 of the briefing — "the continent" — and it is the first thing on the screen when a
turn opens.** *That placement is doing the work `TONE.md` §3.1 describes: the first edition sets the
register for the whole game, which is why the tone document treats turn 0's headline as a worked
example in its own right.*

### 5.2 One template, one variant per ideology

**`TONE.md` rule 6 is a requirement on the data, not on a writer:** *a headline template has **one
variant per ideology**; the nation supplies only the masthead and the place names.* **So the slant
follows the governing ideology and an election changes the paper's vocabulary without anybody writing
a new headline.**

> ⚠ **This is currently sized against SIX ideologies and the design says TEN positions (D231).**
> *Every template is a table keyed by political position, so the conversion cost of the three-axis
> board includes the headline set, and `GDD.md` §15.1a — which prices that conversion — **does not
> list it**.* **Gap 3.**

### 5.3 ◻ The state-press signal, and it is a screen and a rule at once

**`TONE.md` rule 7:** *once liberties fall low enough that the government could set an election aside,
the paper becomes state press — euphemism, good news above the fold, bad news below it.*

**`TONE.md` open question 1 asks whether the player is TOLD, or left to notice.** *It is the only one
of the nine that is a screen decision rather than a writing decision, which is why it is the one
raised here.*

| | |
|---|---|
| **Told** | A line in the briefing the turn it crosses: *"Civil Liberties 0.29 — the press is now state press."* **Model's voice, no adjective.** Legible, and it cannot be missed |
| **Left to notice** | The vocabulary simply changes. **Far better if the player notices; worthless if they do not**, and a player who has only ever played at low liberties has no baseline to notice against |

> **Recommendation, offered and not taken: TELL THEM, once, in the model's voice, the turn it
> crosses — and never again.** *The reason is `TONE.md` rule 8: the paper may spin and may never state
> a false fact. **A player who cannot tell that the register changed will read spin as fact**, and the
> one thing this game's honesty rests on is that the numbers beside the paper never spin. A one-line
> notice preserves that without narrating it.* **Open question 3, and it is Aaron's.**

### 5.4 Two papers, one event

**`TONE.md` rule 32: a war produces two headlines, not one.** *Each side's paper names the same battle
its own way.* **Form: the rival's front page is reachable from the nation panel and never appears in
your own briefing uninvited.** *Your briefing is your country's paper — rule 5 — and a rival headline
arriving unbidden in it would break the one thing the newspaper is for.*

---

## 6. The timeline

✅ **Built.** *One baseline plus per-turn ownership deltas — 13 KB for thirty turns against roughly 250
KB naive — with a **cast** recording every nation's name and colour when it first appears, so the
scrubber can name countries that no longer exist.*

> **The reason, and it is the clearest statement in the project of what this game is about:** *the
> ledger says "the State of Jefferson declared independence, taking 14 Areas". **That is a sentence
> about a SHAPE**, and a player who has watched a border move should be able to watch it again.*

**What this document adds: ◻ the timeline is also where a one-turn thing goes to be re-read.** *A
shock lasts one turn on the map. The war that took three Areas lasted four. **The timeline is the only
surface in the game where duration is visible as duration**, and nothing currently puts events on it —
only ownership.*

---

## 7. What a nation may know — the only fog in the game

**Round 7's ruling 3: *"What you see depends on the relationship."* An ally's panel is open; a hostile
nation's is bands and guesswork.** *The ruling gated sight and **explicitly did not rule the form**.
This is the form.*

### 7.1 The ladder, and it reads off the spine that already exists

**`diplomacy-design.md` §2's eight states are the gate. Nothing new is invented.**

| Relationship | What their panel shows you |
|---|---|
| **Allied** | ◻ **Everything you see of your own.** Exact stocks, exact shares, the trajectory, their reasoning |
| **Peace-treaty** | ◻ Exact figures for anything the treaty covers; bands elsewhere |
| **Peace** | ◻ Figures for what is public — population, output, ownership, who recognises them. **Bands** for the five stocks |
| **Wary** | ◻ Bands, and **they go stale** |
| **Hostile / Cease-fire / War** | ◻ **Bands only, stale, and no reasoning at all** |
| **Vassal** | ⚠ **Unspecified.** `diplomacy-design.md` open question on vassalage does not reach sight |

**Both rejected candidates from round 7 are used, and they are used for different things:**

- **Bands instead of figures (W31)** answers *how precise*. ✅ *The precedent is built: the pressure
  map already shows calm / rising / critical on other people's ground.*
- **Staleness (W30)** answers *how current* — **the figure is the one you last had a reason to know**,
  with its age beside it. ◻ *The precedent is also built: the relations line already prints an age —
  "Hostile: took our ground, 3 turns ago."*

> **Using both is what makes an alliance worth something.** *Ruling 3 gave alliances their first
> non-military benefit — **you can see** — and a benefit that is only precision is thin. **A benefit
> that is precision AND currency is a real reason to make friends with a nation you will never fight
> beside.***

### 7.2 ⚠ The frozen corners are permanently blind, and nobody asked for that

**Round 7's own finding E, filed to this stage and open.** *Round 5's rulings lock **23 pairs at
Hostile for the whole game** — the five Texans, the five Californians, the three eastern capitals.
**Ruling 3 gates sight on the relationship. So those pairs can never see each other's books. Ever.***

**Two readings and this document does not choose:**

- **It is right.** *Rivals who will not talk also do not share figures. The permanence is the point.*
- **The two rulings should not compound.** *A permanent quarrel was designed as a diplomatic fact, not
  as an information blackout, and stacking them produces a game where the five Texas claimants — the
  most contested ground on the board — play each other completely blind for two hundred turns.*

> **⚠ It matters more than it looks, because of what else is true of those pairs.** *The Texas
> claimants are one of the three mission trees, so this is the information environment of a situation
> **a tester will actually play**.* **Open question 4, owner: Aaron.**

### 7.3 ⚠ Does the newspaper report other nations' crises?

**Round 7's finding F, and it is a direct collision:** *round 6 asked whether the paper reports other
nations' crises; **under ruling 3 that would be gated by the relationship.*** *The two rounds were
written an hour apart and neither checked the other.*

**This document can resolve half of it and says which half.**

- **The half that resolves:** *the briefing's **section 1 is public facts by construction** — it is
  what anybody could see. **So a crisis that is publicly visible belongs there and is not gated**, and
  a crisis that is internal does not appear at all.*
- **The half that does not:** ⚠ **nobody has said which crises are publicly visible.** *`events-design.md`
  has twelve built crisis rows and none carries a visibility flag.* **Gap 4**, and it is that
  document's to fill, not this one's.

### 7.4 The AI plays under the same restriction, and that is the expensive part

**Ruling 3's fourth default, restated in `turn-design.md` §9 and `ai-design.md` open question 3:**

> ***"If it is given sight the player does not have, the player is playing against a cheat."***

**`ai-design.md` flags the cost as the real one:** *an AI that must act on a restricted view is a
harder AI to write and a worse one to watch.* **Not this document's to price. Named here because the
screens and the restriction are the same decision, and a stage-3 reader given only this document must
see it.**

---

## 8. ◻ The diplomacy screen — the backlog item round 5 filed here

**`diplomacy-design.md` §6: the move registry holds eleven moves and SIX are diplomatic** — *recognise,
trade, treaty, aid, transit, revoke.* **Every one of them is reached by clicking the map.**

> ✅ *Recognise, non-aggression pact and send-aid are buttons **inside the nation card**, and the card
> opens on a map click.* **There is no diplomacy screen. Filed to this stage.**

**What is actually wrong with the map-click, stated precisely rather than as a complaint:** *clicking
a nation answers **"what can I do with THIS nation"**. It cannot answer **"who have I got
agreements with, which are about to lapse, and who is angry with me"** — which is the question a
player has every single turn and currently has to reconstruct by clicking sixty countries.*

**And the answer is already half-built twice over.** ✅ *The **deals screen** does exactly this for
trade — everything you have signed, what each pays, when each ends, and anything waiting on your
answer.* ✅ *The **leaderboard** does it for power, with seven sorts, a red-amber-green heat and a trend
arrow, on the argument that **"a stock you can only read one nation at a time is half a feature."***

> **So the diplomacy screen is specified as the same argument applied to relationships: a standing
> list of every nation you have a relationship with, what that relationship is, what is signed, what
> is expiring, and what they last did to you** — *subject to ruling 3, which means the list itself is
> honest and the figures in it are banded.* **The map click stays. It answers a different question.**

**◻ Not built. And this document does not say when it is built** — that is the build order's, and
under the standing rule the design supplies the evidence rather than the ranking. *The evidence: six of
eleven moves, and two working precedents already in the game.*

---

## 9. ⚠ The clocks that do not surface

**`GDD.md` open question 3 is owned here.** *The design runs eight clocks at different periods. Five
surface. **Three do not, and the most consequential is invisible in a specific way.***

| Clock | Surfaces? |
|---|---|
| Project bars | ✅ **Yes**, as a bar with progress |
| Trade deal terms | ✅ Yes — countdowns, then a full-screen card |
| Transit notice | ✅ Yes — *"a corridor holder who gives notice does not stop a deal, he starts a clock on it"* |
| Power stocks | ✅ Yes — *"51% — heading for 64%"* |
| **Elections** | ⚠ **Partly.** Derived from a hash of the nation id and the turn, **not stored** |
| **Movement growth** | ⚠ **Only via the pressure map**, and only in three bands for other people's ground |
| **Annex and release cooldowns** | ⚠ **Partly** |
| **⚠ Relational memory decay** | ✅ **The memory shows. The DECAY does not.** *You can read that a neighbour is Hostile and what for. **You cannot read how long that has left to run*** |

### 9.1 The decay one is the decision, and here is why it is not obvious

**It is the number that decides whether to wait or to act now**, which makes it the most
strategically loaded invisible number in the game.

- **Showing it** *turns a grudge into a countdown. Legible, plannable — and it makes waiting out a
  quarrel a calculation rather than a gamble, which drains the tension out of the one exit from a feud
  the design has.*
- **Hiding it** *keeps the tension and costs the player the ability to plan around the single most
  common relationship state on the board.*
- **A third way, and it is the one this document recommends:** ◻ **show the DIRECTION and not the
  date** — *"Hostile, cooling"* against *"Hostile, and getting worse"* — **which is exactly the shape
  the pressure map already uses on other people's ground, and exactly the shape the power panel already
  uses for stocks.** *It answers *should I wait* without answering *how long*, and it invents no new
  vocabulary.*

> **Not ruled. Open question 5** — *and it is the one on this list most likely to change how the
> middle of a game feels.*

---

## 10. ◻ The first turn, which teaches

**D237: *"It needs to talk them through how to play the game."* D237's shape was then given by Aaron in
full, and it is the richest single answer in the project's record.** *His worked example, in his own
terms: Austin brags about being recognised → the Gulf Compact asks for a peace treaty → Miami comes
back with a counter-offer on a deal you sent before the game started → a national event announcing
Oklahoma's vassalage is now official.*

**Three things his sequence does that a tutorial normally does not, and they are why it works:**

1. **It teaches the ORDER, not the buttons.** *Each beat makes the next one make sense: you learn what
   recognition is worth by watching a rival brag about getting it, and then you are offered it.*
2. **Every choice pays off later, never now.** *A counter-offer has a one-turn turnaround, so turn 1
   ends without resolution — **which is the actual turn loop**, taught by doing it rather than by being
   told.*
3. **It is made of cards.** *Every beat is the object in §2 above. **Nothing new is built to teach the
   game** — the teaching is authored content in the machinery that already exists.*

### 10.1 ⚠ TWO THINGS HIS SEQUENCE NEEDS THAT DO NOT EXIST, and both are findings rather than work

**These are traced in §12.2 and stated here because they belong to other documents.**

1. **⚠ THE OPENING BOARD HOLDS NO OFFERS IN FLIGHT.** *Beat three is Miami answering a trade deal **you
   sent on turn −1**. `opening-board-design.md` specifies who exists, what they remember, and what is
   already signed — **and nothing pending.*** *Searched this session: the document has no pending
   offer, no in-flight state, no turn −1.* **So the opening position needs a new kind of opening
   state**, and it is a small one. **`opening-board-design.md`'s, not this document's.**
2. **⚠ AND HIS SEQUENCE INVENTS A MECHANIC.** *In his own words: **"nations only sign peace treaties
   with nations"** — the United States fought the war on terror and would never sign a peace treaty,
   because there was nobody to sign it with. **So signing a peace treaty IS recognition**, and that is
   why Austin bragging comes first.* **Today those are two independent things**: `diplomacy-design.md`
   §2 makes Peace-treaty a state on the pair spine, and §4 makes recognition a separate scalar and
   matrix. **Coupling them is a diplomacy ruling with consequences for the recognition pivot, and it
   is not this document's to make.** *Filed to `diplomacy-design.md`.*

> **What this document CAN say:** *the taught first turn is **content**, not machinery, in every part
> except those two — **and both of those are worth having anyway**, independent of the tutorial.*

---

## 11. What this hands the Technical Designer

**None of it is a number. Every number on these screens comes from the system that owns it.**

| | |
|---|---|
| **The card is one object** | Two instances exist and work. **A third system must not invent a fourth shape** |
| **The panel must not compute while it renders** | A Why record with a side effect has already shipped once and lied about who was in charge |
| **Ruling 3 is a filter on a panel, not sixty panels** | **One gate, read off the pair state.** The alternative — a bespoke view per relationship — is sixty times the surface for the same rule |
| **⚠ The AI plays under the same filter** | *"A harder AI to write and a worse one to watch."* `ai-design.md` open question 3 prices it; nobody has |
| **Staleness needs a LAST-KNOWN store** | **Bands cost nothing; staleness costs state.** *"The figure you last had a reason to know" means something has to remember when that was* |
| **The headline set is keyed by political position** | **So it is part of the three-axis conversion, and `GDD.md` §15.1a does not list it** |
| **Ranking is one function over a mixed list** | §1.2. Not three lists rendered in order |

---

## 12. Open questions

*A decision Aaron has not made. Ordered by what blocks the most.*

| | | |
|---|---|---|
| **1** | **What ranks the three briefing sections against one another?** *The main screen of the game, and nothing ranks a world dispatch against a movement's demand. Three candidates in §1.2; recommendation offered* | **Aaron** |
| **2** | **⚠ Does a card block?** *Two live designs — built blocking, designed non-blocking with a worst-case default. Neither document rules it* | **Aaron, or stage 3 reconciling two documents** |
| **3** | **Is the player TOLD when their paper becomes state press?** *`TONE.md` open question 1. Recommendation: tell them once, in the model's voice, and never again* | **Aaron** |
| **4** | **⚠ Do the 23 permanently-hostile pairs play each other blind for the whole game?** *Round 7 finding E. It is the information environment of the Texas mission tree* | **Aaron** |
| **5** | **Does a grudge show how long it has left?** *§9.1. Three options; the recommended one shows direction and not date* | **Aaron** |
| **6** | **Does a vassal see its overlord's books, or the reverse?** *The ladder in §7.1 has no row for it, because `diplomacy-design.md` has no answer for vassalage and the turn either* | **Aaron, then the architect** |

---

## 13. Gaps

*Referenced and never specified. Distinct from an open question.*

| | |
|---|---|
| **1** | **⚠ "The worst option available" is undefined for a symmetrical card.** *It is ruled for a movement's demand and reaches nothing else. Three readings in §2.2, and they are different games* |
| **2** | **A one-turn event is not on the timeline.** *The timeline carries ownership deltas only, so a shock that reshaped three economies for a quarter cannot be re-read — and re-reading a shape is what the timeline is for* |
| **3** | **⚠ The headline set is part of the three-axis conversion and is not priced.** *One variant per ideology, six today, ten designed. `GDD.md` §15.1a lists what converting costs and does not list this* |
| **4** | **No crisis carries a visibility flag.** *§7.3 resolves half of round 7's finding F and this is the other half. Twelve built rows, none says whether the continent can see it. `events-design.md`'s to fill* |
| **5** | **Nothing specifies the developer dashboard's relationship to these screens.** *It exists, it is behind the dev flag, and §4.3 has just given it a second job. What belongs there rather than on a panel is a convention nobody has written* |
| **6** | **⚠ The opening board holds no offers in flight.** *§10.1. Aaron's taught first turn needs one; the opening position has no such state. `opening-board-design.md`'s* |
| **7** | **⚠ A peace treaty as recognition is a mechanic with no home.** *§10.1. Aaron's, invented in passing, and it couples two things `diplomacy-design.md` currently keeps independent* |

---

## 14. The scenarios this document must be able to narrate

**Traced step by step, 16 September 2026.** *`TONE.md`'s eleven worked examples are the test suite for
the game's voice; these five are the test suite for its surfaces.* **Two of the five jam, and the jams
are the point.**

### 14.1 ⚠ A player answers nothing for ten turns — AND IT JAMS

*Somebody opens the briefing on turn 1, is overwhelmed, and clicks End Turn ten times.*

1. **Turn 1.** The briefing shows the front page, two cards from their own government, one dispatch.
   They end the turn. ✅ *Allowed by design: answering is free and not answering is free.*
2. **Turns 2–4.** A movement's demand card defaults to **wait**. ✅ *Ruled. Politics ruling 22 counts
   broken promises rather than turns, so three unanswered turns is three broken promises.*
3. **Turn 5.** The movement's verb moves **one step, to Separate, and never back**, and **fires once as
   an event the player is told about.** ✅ *Working as designed — the player is finally made to look, by
   a consequence rather than by a blocker.*
4. **⚠ Turn 6. A trade deal expires and the card asks whether to renew. THE TRACE STOPS HERE.** *What
   is "the worst option available"? Renewing at terms that are now bad, or losing the income? **The
   rule does not reach**, and the two answers produce different games — one where an inattentive player
   signs everything and one where they sign nothing.* **Gap 1, found by tracing.**
5. **Turn 10.** They open the briefing properly. **What do they see?** ⚠ *The briefing is per-turn.
   Nine turns of consequences are in the ledger and the timeline, and **nothing assembles "here is what
   happened while you were not looking."*** *That is not a defect — it may be correct that the game does
   not apologise — but it was never decided.* **Related to gap 2.**

> **What this trace is worth:** *it confirms the default rule works exactly where it was ruled and
> **collapses one card later**. The rule was written for a three-answer card and every symmetrical card
> in the game inherits it without being checked.*

### 14.2 ⚠ Houston's first turn, Aaron's own sequence — AND IT JAMS TWICE

*The player picks Houston. Turn 1 opens.*

1. **Beat one: Austin brags.** *A dispatch — no question, simply true — that Austin has been formally
   recognised.* ✅ **Works with no new machinery.** *§2's card with zero options; `events-design.md`'s
   dispatch shape exactly.* **And it teaches by envy, which no tooltip can.**
2. **Beat two: the Gulf Compact offers a peace treaty.** *A card, three options: accept, decline,
   counter.* ✅ **Works.** ⚠ **But it only carries Aaron's meaning if signing it IS recognition** — *and
   today Peace-treaty is a pair state while recognition is a separate matrix.* **Gap 7. The beat still
   plays; it just teaches something smaller than he intended.**
3. **⚠ Beat three: Miami counter-offers on a deal you sent on turn −1. THE TRACE STOPS.** *There is no
   turn −1. **The opening board has no offers in flight** — it holds who exists, what they remember and
   what is already signed, and nothing pending.* **Gap 6, and it is the load-bearing beat**: it is the
   one that teaches *you send things and things come back*, which is the whole turn loop.
4. **Beat four: Oklahoma's vassalage becomes official.** ⚠ *A dispatch, and it works — except that
   `diplomacy-design.md` records vassalage as **ruled and not built**.* **So this beat is authored
   content sitting on an unbuilt system, which is fine for a design document and is a dependency the
   build order must see.**
5. **The turn ends with nothing resolved.** ✅ **Which is the actual game**, and it is taught rather
   than explained. *`turn-design.md`: nothing you gain finishes in one turn.*

> **What this trace is worth:** *Aaron's sequence is sound and **two of its four beats need something
> that does not exist**. Both are small, both are other documents', and **neither would have been found
> by reading his note** — only by walking it beat by beat against what is specified.*

### 14.3 A drought crosses four borders

*A shock fires on the southern plains. Its radius covers counties in Oklahoma, Dallas, Austin and
El Paso.*

1. **It draws as one region across four borders**, above ownership, on by default. ✅ *§3.3. The player
   sees a shape that does not respect the map's own lines, which is the object's entire point.*
2. **Each nation reads its own proportion.** *Austin: 31% of its ground. El Paso: 4%.* ✅ *The model's
   term rendered as the model's term — `TONE.md` rule 1, no adjective.*
3. **The front page carries it**, in the player's own paper, in the ruling ideology's vocabulary. ✅
   *And under `TONE.md` rule 22, a rival paper may mock the POLICY that left a nation exposed and may
   not mock people going hungry.*
4. **Next turn it is gone from the map.** ⚠ **And gone from everywhere the player could go back to
   it** — *the timeline holds ownership deltas and this moved no border.* **Gap 2, found by tracing.**

### 14.4 You want to know whether to wait out El Paso

*Turn 60. You are Hostile with El Paso. You want its ground. Waiting is cheaper than fighting.*

1. **The panel says *"Hostile: took our ground, 3 turns ago."*** ✅ *Built — band, heaviest memory, age.*
2. **You want the one number that decides this: how long has it left to run.** ⚠ **It is not there, and
   nothing in the interface will tell you.** *Open question 5.*
3. **You check their stocks to judge whether they can resist.** ✅ *Ruling 3: hostile, so bands, stale,
   no reasoning.* **Correct and deliberate — this is the screen refusing to be a targeting computer.**
4. **You check whether they are one of the 23 permanently-hostile pairs.** ⚠ *If they are, step 1's
   memory is not a countdown at all — **it will never cool** — and nothing on the screen distinguishes
   a grudge that fades from one that cannot.* **That is the sharpest form of open question 4**, and the
   trace found it: *the permanence is a diplomatic fact with no representation.*

### 14.5 Your own newspaper stops telling you the truth

*Turn 88. El Paso's liberties have fallen far enough to set an election aside.*

1. **The paper becomes state press.** *Euphemism, good news above the fold.* ✅ *`TONE.md` rule 7.*
2. **⚠ Is the player told?** *Open question 3. Under "left to notice", a player who has governed this
   way since turn 40 has no baseline and will read spin as fact.*
3. **The panel beside it is unchanged** — *`Election result set aside · turn 88`, Civil Liberties
   −0.12.* ✅ **And this is the whole design working:** *the paper spins, the numbers do not, and the
   two sit on the same screen.* **`TONE.md`'s "the model is the game's honesty" is a LAYOUT
   requirement, and it is met here.**
4. **On the victory screen, the same paper writes the final edition.** ✅ *Rule 37 — slanted by
   ideology, limited by liberties, with blunt totals beneath.* **A player who won at low liberties gets
   a euphemistic ending, and `TONE.md` §4 already names that as the model telling the truth about the
   win.**
