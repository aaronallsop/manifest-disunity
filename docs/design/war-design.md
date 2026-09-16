# War — declaring it, fighting it, and the treaty that is the actual game

**Stage 2 of five: DESIGN.** A specification for the Technical Designer, not an idea bank.

**Depends on:** `GDD.md` · `force-design.md` (Field against Border) · `board-design.md` (reach, and
what can be attacked at all) · `diplomacy-design.md` (the eight-state spine this document is one state
of) · `power-design.md` (weariness, Authority, the coalition) · `nation-design.md` (what a fall-apart
creates) · `economy-design.md` (the occupation surcharge).

**Read by:** `nation-design.md` · `blocs-design.md` · `ai-design.md` · `missions-design.md` ·
`presentation-design.md`.

> **⚠ THE HEADLINE, AND IT IS THE ROUND'S OWN SENTENCE:**
>
> # "There is no war. Taking ground is a purchase."
>
> *Traced through the annexation move: the price is paid, the reach check passes, the cooldown clears —
> and **unless a civil war fires inside the attacker, the ground changes hands with no roll of any
> kind.** The defender's Border allocation, its readiness, its armed population and its willingness to
> fight are read **only** as a multiplier on the attacker's own civil-war score. **If that war does not
> trigger, the defender is never consulted.***
>
> **"So a nation of three Areas with its whole army on the border and a hostile, well-armed population
> is, mechanically, a shop."**

**Forty-one rulings rest on machinery that does not exist. This document describes both.**

---

## 1. The first ruling is the frame for everything after it

**Ruling 1, and it points the arrows the other way:**

> **This is not a war game.** *War is a thing that happens **to** the economy and to diplomacy.*

**Ruling 11 is the other constraint, and it is Aaron's own words:**

> *"I want it to be really simple from a user experience level. **There isn't going to be troops / troop
> types / etc.**"*

**Every ruling in the round is answerable to those two.**

---

## 2. War is a STANDING STATE, and it is one of eight

**Full treatment in `diplomacy-design.md` §2 — the spine describes what two nations **are** to each
other, and war is one of its states.** *That assignment was deliberate:* **"Somebody writing the fight
should not have to own hostility's cooling clock."**

**What war itself means, in Aaron's words:** *"**Trade is prohibited and you may attack.**"*

**What a cease-fire means:** *"**All the impacts of war, but you cannot attack.**"* *It is the only one
of the states that cannot be a resting place — it carries a set number of turns.*

### 2.1 Five causes put two nations into Hostile, and not one of them is a military act

**Aaron's list:**

1. **A movement of yours is growing inside them** — *"Oregon is hostile with Greater Idaho because the
   Greater Idaho movement is growing in their state."*
2. **Two nations competing to reunify the same thing.**
3. **One nation desperate for a resource the other will not sell, or gouges on.**
4. **One nation funding a movement inside another.**
5. **Hostility inherited through alliances** — *"If A is allied to B, and C is allied to D, and A
   attacks C and D, then D becomes hostile with B."*

> **Not one of them is a military act. That is the design.**

**And inherited hostility travels EXACTLY ONE HOP** — *your ally's enemies become hostile with you;
their ally's enemies do not.* **Without the limit, one betrayal could turn the whole board.** *Aaron's
own worked example of the rule gets one pair wrong, and the trace caught it; he then ruled for the
traced reading.*

### 2.2 What Hostile costs — four things

**Their tolls on your goods rise · what they demand before granting a crossing rises · MOVEMENTS
MATCHING THEM GROW FASTER INSIDE YOU · guarding the border costs more.**

**And it honours what is signed while permitting nothing new:** *"If you have an ongoing trade deal it
stays in place until the end of the trade deal but **no new ones can be signed with them**."*

**⚠ Hostility is resolved by TIME and by DIPLOMACY, never by a treaty.** *"Cease-fire can only result
from a war."* **A diplomatic action to speed a thaw is ruled to exist and is deferred — so the pairs
that open hostile have, today, no move available to them at all.**

**⚠ And a Wary neighbour's movements do NOT grow faster inside you — off, not merely reduced.** *At any
value above zero, **Wary manufactures its own cause and no pair ever reaches Peace.***

---

## 3. The fight — and this is the part that is built

### 3.1 The dice, exactly

```
trigger:  the annexation flips your leading ideology
          OR what you took is more than 15% of what you held, on population or GDP

magnitude = (the new leader's share − what the old leader is left with) × (1 − affinity between them)

dice N    = a FLIP war:  clamp(2 + round(0.5 × magnitude), 1, 6)
            a SIZE war:  exactly ONE die
points    = (0.6 × popRatio + 0.4 × gdpRatio) ^ 0.5
scoreMult = (1 + coalition pressure) × the Field-vs-Border ratio × the edge-of-reach penalty
score     = round( 12 × points × Σ dice × scoreMult )
```

| Score | |
|---|---|
| **≤ 33** | **Victory** — you take everything |
| **≤ 66** | **Partial** — a contiguous front advancing from your own border, **97% of the selection at the bottom of the band and 15% at the top** |
| **> 66** | **Fall apart** — the contested Areas fragment into new nations |

**⚠ A SIZE WAR ROLLS ONE DIE.** *The famous floor of two applies only to flip wars, because the
magnitude is zero when nothing flipped.* **On this board a large share of all wars are size wars, and
no document says this.**

**The square root is the load-bearing part:** *points are the bite **relative to the biter**, and the
square root is what keeps **doubling your size a bad gamble** — mostly fall apart, sometimes partial —
rather than a mathematical certainty.*

**And the floor of two dice is why a flip is still a crisis:** *losing your governing plurality is a
constitutional event whatever replaces it, and the commonest flip on this map is a pair adjacent on
both axes — **so without a floor the distance scaling collapsed that case to a guaranteed walkover.
Measured: 400 victories out of 400.***

**Measured outcome spread: 30.8% victory / 30.8% partial / 38.5% fall apart across 52 triggered wars on
the real turn-0 map.** *Before the fix: **1.5 / 3.0 / 95.5 — a step function, not a dice game.***

> **⚠ NO CALENDAR DATE IS ATTACHED IN ANY OF THE FOUR PLACES IT IS RECORDED**, and **it is now
> provably stale in one direction**: the score multiplier has since gained the military ratio and the
> reach penalty, *and it has never been re-measured.* **The live test asserts that each outcome is some
> non-trivial share of a sweep; it does not pin the figures, and it calls the resolver with no score
> multiplier at all — so it measures the bare dice rather than the game.** *Gap 5.*

### 3.2 ❌ THE WORST DEFECT IN THE PROJECT: the fall-apart pays the aggressor

**One file tests for an outcome called `collapse`. The war code never produces that string.** *Verified
by grep this session across the source, the tests and the playtest build.*

**So on a fall-apart the guard is false and execution falls through to the branch that charges the
VICTIMS and pays the ATTACKER** — *the defender's ruling bloc loses up to 40% of its population and
transfers up to 20% of its GDP to the nation whose offensive just disintegrated.* **And it uses the
FULL score, not the halved share, because the halving is keyed to `partial`.**

**This is the exact bug the dead branch's own comment says was fixed:**

> *"**THE AGGRESSOR BLEEDS, not the defender.** A collapse is your own offensive falling apart; charging
> the victims for it — which is what this did until M6.3, because the branch was written once for the
> winning cases and reused — **paid the loser's bill to the winner and handed the defender a population
> loss for successfully defending.**"*

**The fix was written against the wrong string on the day it was authored, five milestones after the war
code had settled on the other one. So the fix has never once executed. The pre-fix behaviour ships.**

**And the message the player is shown is therefore false:** *"The offensive collapsed. The defenders
held, **and your own people paid for it.**"* **Your own people paid nothing.**

> **❌ IT REVERSES THE SIGN OF THE WORST OUTCOME IN THE GAME.** *A fall-apart is meant to be the
> anti-snowball's sharpest tooth. As shipped it is **a consolation prize for the aggressor** — the
> target fragments into new nations **and** the attacker collects a fifth of its GDP.* **Combined with
> the removal of the size shield, this is the single most load-bearing defect in the project.**
> *`docs/deferred.md` 34. No test covers it.*

### 3.3 An attack has two outcomes, and failure costs what you already spent

> Aaron: *"there are two options: conquer, or fails to conquer. Which means **if they don't conquer it
> they have paid the cost and that was their turn** and didn't conquer anything."*

---

## 4. Occupation — three flags, and a ladder you climb

**Ground you take is yours immediately, but held under one of three flags.** *Aaron: "**It shows as my
territory but with a different brightness of my map colour.**"*

| Flag | |
|---|---|
| **occupied-war** | increases unrest, hits the economy, **usable in your own trade but grantable to nobody as a passage** — *"Even if I captured territory my allies wouldn't use it as a trade route while still at war"* |
| **occupied** | the treaty is signed; all trade permitted |
| **occupied-movement** | the matching movement is over 50% and the occupier is that movement's nation |

> **"A peace treaty is a title deed."**

**And occupied ground eventually becomes your country — how fast depends on whether life got better:**

> Aaron: *"a county that was conquered by a nation that has a **higher quality of life** than the one it
> originally was in would be **more willing to accept** that they are a part of a new state."*

> **⚠ That is the strongest anti-snowball device in the round.** *Quality of life at turn 0 spans
> 0.55–0.98, so **conquest becomes a luxury of the successful** — a rich nation digests what it takes
> and a poor one chokes on it.*

### 4.1 The surcharge, and it is the built brake

```
surcharge(a) = areaUpkeep × (1 + 1.6 × hostility(a)) × (occupied / 25) ^ 1.15
```

**Charged on every Area held that is not in the founding grant.** *25 occupied Areas roughly doubles
their upkeep; 100 costs about 5×; 400 about 24×.*

**Two multipliers doing two jobs:** *the **count** term stops conquest paying for itself at scale
whatever the locals think; the **hostility** term makes **which ground you took** matter as much as how
much.*

**⚠ And `DESIGN.md` printed this formula wrongly for months** — *as `(1 + n^alpha)`, which would make 25
Areas cost 41× rather than 2×.* **Corrected today; the published magnitudes were what caught it.**

**⚠ Occupation also drags four stocks** — Authority −0.18, Influence −0.14, **Civil Liberties −0.24**,
and weariness +0.30. *Occupied ground is governed under different rules, and those rules leak home.*

### 4.2 ⚠ And home ground is stamped at birth, which the digestion ruling contradicts

**The definition calls itself *"THE one definition of home ground, and the only thing anything should
ask"*, and `DESIGN.md` says: *"nothing becomes home by being held long enough — **a cost that expired on
its own would be a timer.**"***

> **The digestion ruling requires exactly that.** *It is a one-line change to a function that declares
> itself the single source of truth, **so it must be made deliberately rather than discovered.***
> *Finding A, open, and its stated owner is "whoever builds the ruling."*

---

## 5. The peace treaty — the actual game

> **"The war is the leverage; the treaty is the game."**

**Ground changes hands at the settlement, not turn by turn.** *The known cost was accepted: **a war with
no visible front is harder to read.***

### 5.1 Four levers, and no more

**Territory · Repayment, capped at 1.25× the cost of the war · Forced trade deals · How long it runs.**

> Aaron: *"If they say no then the war continues, which will **increase war weariness and increase
> chances of bad things happening**."*

**And the cap is measured against the war costs of whoever SENDS the treaty**, which is the elegant
part:

> Aaron: *"Utah invades Idaho. Idaho ends up winning. They send a deal to Utah — some of their counties
> — but because the war cost them money, Utah has to pay them 1.25 the cost of the war so far. Or maybe
> Utah comes back and says they will pay 0.5 the cost of their war and give the counties, and Idaho
> accepts."*

> **"It means the game never has to decide who won."**

### 5.2 The ending — blind, simultaneous, and brisk on purpose

1. **The turn before the cease-fire ends, BOTH nations table a treaty.** *Compulsory.*
2. **They are written BLIND** — *"too much and you get nothing; too little and you have left money on a
   table you cannot return to."*
3. **The defender chooses first** — right of first refusal.
4. **On refusal the defender's own tabled treaty is promoted automatically. Exactly one round of
   offers.**
5. **Tabling is FREE**, because otherwise *"every cease-fire in the game silently taxed both nations a
   turn neither of them spent."*
6. **If neither accepts: Hostile, not War.**

**Two costs accepted in writing:** *"A war ends the way a **sealed auction** ends rather than the way a
negotiation does"*, and **a war can continue on a misjudgement.**

**⚠ And step 2 owes the player something that does not exist:** *blind submission needs the game to say
**what you are guessing about** — "that list is the difference between a judgement and a gamble."*

### 5.3 ⚠ The repayment cap produces zero for a pure defender

**In Aaron's own example Idaho never attacked, so its attack spending is nothing** — *and **the nation
the rule was written to compensate cannot ask for a penny.*** **The recommendation on file is that a
war's cost must include lost trade as well as treasury.** *Marked blocking, owner: round 4.*

---

## 6. Breaking a treaty, and the justification ladder

**Breaking a peace treaty turns every neighbour but your allies hostile, at once.**

> Aaron: *"**Because if they are willing to break a peace treaty, might we be next?**"*

**Sized: mean 4.9 borders, max 8 — so breaking one treaty typically makes five nations hostile in a
single turn.**

**And a nation may declare war straight from Peace** — *Aaron: "Yes — because there is no treaty. They
are just at peace."* **That is the principle the ladder was missing:**

| Attacking from | Because | Costs |
|---|---|---|
| **Hostile** | there was a quarrel, dated and on the record | **least** |
| **Peace** | there was no promise — only no quarrel | **your standing**, scaled by how much you had |
| **Peace-treaty** | **you made a promise and broke it** | **every neighbour but your allies turns Hostile** |
| **Cease-fire** | you made that promise while the guns were quiet | **the same, and worse for when you did it** |

> **"So the ladder is priced by whether you gave your word and how recently — not by a table of
> severities somebody invented."** *And the consequence: **spending two years being visibly provoked
> makes the eventual war cheaper.***

**⚠ THERE IS NO CASUS BELLI IN THE BUILD.** *No justification, no pretext, nothing. The ladder is
entirely designed.*

### 6.1 ⚠ And the punishment saturates exactly where betrayal is most tempting

**The five Texan nations [BUILT] open permanently hostile with each other.** *So breaking a treaty with
one of them turns neighbours hostile who **are already hostile and cannot get more so.***

> **The nations with the most enemies have the least to lose from betrayal, which is the exact reverse
> of what the ruling intends** — *and it undoes the ruling that makes Austin's signature valuable, by
> breaking the lock on its only door.*

**The proposed answer is that the state saturates but the ledger does not:** *write a memory against
every neighbour, because **the neighbours cannot get angrier, but the continent can.*** **Recommended,
not ruled.**

---

## 7. War weariness — the fifth stock, and the only one that measures what a nation does to itself

**A stock like the other four, rate-limited — but with the asymmetry INVERTED.**

> *"The other four stocks are things a nation HAS. **Weariness is a thing a nation SUFFERS**, and
> inheriting those limits silently inverted it — a country could exhaust itself only slowly and then
> shrug the exhaustion off half again as fast."*

**It rises at 0.08 and falls at 0.05.** *A war tires a country faster than peace rests it, and **the
cost of a war outlives the war.*** **Base zero:** *"A nation at peace is not tired. Every point of
weariness is something it did."*

| Term | | |
|---|---:|---|
| **Wars fought** | **0.40** | **SEPARATE wars, not Areas** — *"starting a fourth war is a different thing from widening the first"* |
| **Occupation** | **0.30** | *"The war that does not end"* |
| **In the field** | **0.30** | **an army in the field, not an army** |
| **Ground taken by force** | **0.20** | *"Widening a war costs less than starting another one, but it is not free"* |

**Window: twenty turns. Bands: Exhausted · Weary · Strained · Rested.**

**It is read by quality of life, by sentiment — so it feeds secession — by elections, and by crises.**
*The election weight is the sharpest: **"the bill for a decade of fighting, arriving at the one moment a
population can present it."***

> **⚠ AND "WARS FOUGHT" DOES NOT COUNT WARS.** *There is no war state to count, so it counts
> annexations that triggered the attacker's own civil war.* **Which is not what any ruling means by a
> war.** *Gap 6.*

---

## 8. The coalition — the one multilateral thing that IS built

```
threat = size share × (1 − Influence) + a victory-proximity term
```

> **"BEING BIG IS NOT THE CRIME.** A nation can hold half the map and go untouched **if the other half
> is glad it is there.**"

**Nobody signs anything.** *It forms on threat and dissolves when the fright passes.* **Members are
nations that either resent you or border you** — *the second is what stops a conqueror being safe simply
because it has not got round to its neighbours yet.*

**Three live consequences: an administration surcharge every turn, every member's border army counting
against you in every fight, and an Influence penalty that is deliberately a feedback loop** — *"low
Influence is what forms the coalition, and the coalition lowers Influence further. It is escapable… but
**it does not let go on its own, which is what makes an overreach a decision you can lose.**"*

**Measured: the largest opening nation sat at 0.063 against a trigger of 0.085, so the board is quiet on
turn one — and at turn 40 of a played game it reached 0.093 and three nations formed against it.**

---

## 9. ⚠ Three rulings the build has not caught up with

| Ruled | Built |
|---|---|
| **One Area per attack** | **three** |
| **No per-turn cap and no cooldown** — *"If a nation has the money and manpower they can attack and organize as big of an attack as they want"* | **a four-turn cooldown** |
| **The four-times-your-size shield is removed** | **still 4×** |

> **⚠ ALL THREE HARD BRAKES ON CONQUEST ARE RULED AWAY.** *Only reach still refuses, and only on
> geography.* **Measured consequence of the first alone: conquest gets 67% FASTER — 0.6 to 1.0 Areas a
> turn.**

**And the accepted cost is on the record:** *"AI nations will now sometimes throw themselves at giants
and lose… **If that reads as foolish in the alpha, the fix is to make the AI weigh the percentage harder
— not to put the wall back.**"*

---

## 10. What this hands the Technical Designer

| | |
|---|---|
| **❌ The fall-apart branch tests for a string nothing produces**, so the victims pay the aggressor | §3.2 |
| **❌ There is no war.** *The whole eight-state spine is unbuilt, and 41 rulings rest on it* | §2 |
| **⚠ The fight must roll on EVERY attack**, not only when the attacker's own civil war triggers | `force-design.md` |
| **⚠ A size war rolls one die** | §3.1 |
| **Home ground is stamped at birth and the digestion ruling requires it to grow** | §4.2 |
| **The repayment cap gives a pure defender nothing** | §5.3 |
| **Three conquest brakes are ruled away and still built** | §9 |
| **"Wars fought" counts civil wars** | §7 |

---

## 11. Open questions

| | | Owner |
|---|---|---|
| **1** | **⚠ Does the movement accelerant STACK across hostile pairs?** *If it does, every Texan nation carries a permanently quadrupled separatist movement and **Texas reunifies itself by defection on a timer, the same way, in every game.*** *A default was proposed — largest bonus, not the sum — **flagged rather than asked**, and it is not in the list Aaron confirmed* | **Unassigned.** *"The first thing the closing trace must run"* |
| **2** | **The repayment basis gives a pure defender zero** | **Round 4, and it is BLOCKING** |
| **3** | **What magnitude does Wary's acceptance multiplier take?** *The ruling refuses a number **and refuses a placeholder*** | **The design stage, by Aaron's own words** |
| **4** | **Does conquering Austin [BUILT] end its recognition veto, or make the four rebels pariahs for good?** *"The first makes conquest the answer; the second makes Austin's survival something its enemies need"* | **Round 5, "but this round created it"** |
| **5** | **Does Hostile's floor lift when the contest ends?** *The only exit other than the accidental one* | **Unassigned** |
| **6** | **Is `occupied-movement`'s 50% related to the 0.40 secession threshold, or set independently?** *"One will quietly make the other pointless." **An invented placeholder measured against nothing*** | **Unassigned** |
| **7** | **⚠ Does the betrayal punishment need the ledger backstop?** *Today the nations with the most enemies have the least to lose from betrayal* | **Unassigned; recommended** |
| **8** | **Do corridors renew?** *A ruling was made believing corridors were standing tolls; they are term contracts, so **"Austin's routes die by themselves when their terms run out. Nobody decides. Nobody pays. Nobody even acts."*** *The ruling stands; the consequence Aaron accepted is not the one it produces* | **Unassigned** |
| **9** | **Can a Unite create a new claimant for an existing reunification contest?** *"If a contest can gain a claimant in play, the permanent floor can be laid down mid-game"* | **Filed to round 5 and round 3's unite work** |
| **10** | **Is the price of an attack greater than one turn of the target's output?** *Raiding-to-deny is now available every turn, for ever.* **"If it does not, raiding dominates."** *Moved from "should be checked" to **"must be checked before alpha"*** | **Stage 3's measurement** |

---

## 12. Gaps

| | |
|---|---|
| **1** | **❌ The dead outcome branch.** *No test, no deferred entry until today, no decision record. Present in the playtest build* |
| **2** | **Home ground is stamped at birth and a ruling requires it to grow** |
| **3** | **⚠ Desperation does not bite** — *nothing bad happens to a nation that does not trade.* **This blocks the third cause of hostility entirely** |
| **4** | **A price must be settable by the seller.** *A cause of hostility names "an absurd price" and no screen anywhere sets one* |
| **5** | **⚠ The measured outcome spread carries no date and is stale** — *the score multiplier has gained two factors since, and the live test measures the bare dice* |
| **6** | **"Wars fought" counts triggered civil wars, because there is no war to count** |
| **7** | **A mutable movement verb** — *a ruling changes what a movement **is**, and it is the one place the round asks for something that does not exist rather than re-pointing something that does* |
| **8** | **A logged term points at a tunable key that does not exist** — *so a union's odds are the one number a player cannot trace to a lever* |
| **9** | **⚠ The scenario's own text contradicts its own data:** *it says California dissolved into five successors and ceded the north, while the data holds **six** including Cascadia* |
| **10** | **Four victory figures say "half" and "three quarters" where the code says 0.30 and 0.55** |
| **11** | **⚠ THE WAR BLEED DOES NOT SAY WHAT HAPPENS TO THE PEOPLE.** *It removes them, and nothing anywhere says whether they **died**, **fled**, or **changed sides** — three different facts with three different consequences for population, migration and sentiment, currently collapsed into one subtraction.* **Raised by the tone interview, 15 September 2026** (`TONE.md` §5.16), because it decides something outside this document: **rule 10 forbids the newspaper to print a casualty figure until the model produces one, and today the model cannot produce one even in principle.** *Until this is settled, rule 10 stands and no paper in the game may say how many died* |

---

## 13. The scenarios this document must be able to narrate

### 13.1 ❌ An offensive falls apart and the attacker is paid for it

**Step 1.** A nation annexes a neighbour large enough to trigger. **The roll comes back above 66.**

**Step 2 — the contested ground fragments into new nations.** *That is the anti-snowball's sharpest
tooth working exactly as designed.*

**Step 3 — the branch written to make the aggressor bleed tests for an outcome string the war code never
produces.**

**Step 4 — so execution falls through to the branch that charges the VICTIMS.** *Each one loses up to
40% of its ruling bloc and transfers up to 20% of its GDP **to the attacker.***

**Step 5 — and at the FULL score**, because the halving is keyed to a different outcome.

**Step 6 — the player is told *"The offensive collapsed. The defenders held, and your own people paid
for it."*** **Your own people paid nothing.**

> **❌ JAMS, AND IT INVERTS THE GAME'S SHARPEST BRAKE INTO A REWARD.** *The single most load-bearing
> defect the design stage has found.*

### 13.2 ❌ Two nations fight a war

**Step 1.** A nation decides to attack another.

**Step 2 — ❌ there is no declare.** *No war state, no cease-fire, no treaty, no front.*

**Step 3.** *What exists is an annexation: pay the price, pass the reach check, clear the cooldown.*

**Step 4 — the ground changes hands.** *Unless the attacker's own politics flip or the bite is over 15%,
**no roll happens at all.***

**Step 5 — the defender is never consulted.** *Its Border allocation, its readiness and its armed
population are read only as a multiplier on a civil war that may not occur.*

> **❌ JAMS COMPLETELY. Forty-one rulings describe a war the game cannot fight.** *"Taking ground is a
> purchase," and a well-defended nation is a shop.*

### 13.3 ⚠ A cease-fire runs out and both sides table blind

**Step 1.** Both nations must submit a treaty on the turn before expiry. **Tabling is free.**

**Step 2 — neither can see the other's.** *"Too much and you get nothing; too little and you have left
money on a table you cannot return to."*

**Step 3 — the defender chooses first.** *If it accepts, done.*

**Step 4 — if it refuses, its OWN treaty is promoted automatically.** *One round, no haggling.*

**Step 5.** The attacker accepts or refuses. **If neither accepts: Hostile, and the war is over
anyway.**

**Step 6 — ⚠ and the player was guessing without being told what about.** *Blind submission needs a list
of what the other side is weighing, and **that list is the difference between a judgement and a
gamble.***

> **⚠ NARRATES, AND THE MECHANISM IS EXCELLENT — a sealed auction that never makes the game decide who
> won.** *Its two accepted costs are on the record: a war ends briskly, and a war can continue on a
> misjudgement.* **The one thing it is missing is the information the player needs to make the
> judgement at all.**

### 13.4 ⚠ Texas breaks its own treaties for free

**Step 1.** The five Texan nations **[BUILT]** open permanently hostile with one another. *Ruled; the
contest never thaws.*

**Step 2.** Dallas **[BUILT]** signs a peace treaty with Houston **[BUILT]**, then breaks it.

**Step 3 — the punishment is that every neighbour but your allies turns Hostile, at once.**

**Step 4 — ⚠ they are already Hostile and cannot become more so.** *The state saturates.*

**Step 5 — so the punishment costs Dallas almost nothing**, and **the nations with the most enemies have
the least to lose from betrayal — the exact reverse of what the ruling intends.**

**Step 6 — and it breaks the lock on Austin's [BUILT] door**, undoing the ruling that makes Austin's
signature the thing the other four need.

> **⚠ NARRATES AND DEFEATS TWO RULINGS AT ONCE.** *The proposed answer is that the state saturates but
> the ledger does not — **write a memory against every neighbour, because they cannot get angrier but
> the continent can.*** **Recommended and never ruled.**

---

*Sources, verified 15 September 2026: `docs/design/conquest-ideation.md` — all 41 rulings with Aaron's
verbatim words where quoted, the seven §7b findings and the six embedded ones, ideas C23, C72, C77,
C82, C88, C92, C93, C100, C104, C108–C133; `docs/design/diplomacy-ideation.md` (the spine's assignment);
`DESIGN.md` §§ on the war dice, occupation, home ground and victory; `DECISIONS.md` D11, D181;
`docs/PROGRESS.md`; `js/civilwar.js`, `js/moves.js`, `js/military.js`, `js/power.js`, `js/coalitions.js`,
`js/game.js`, `js/victory.js`, `js/actions.js`; `js/tunables.js` (`war.*`, `annex.*`, `unite.*`,
`econ.occupation*`, `power.weariness.*`, `coalition.*`); `tests/civilwar.test.js`, `tests/annex.test.js`.
**The dead `collapse` branch, the one-die size war, the score multiplier's fourth factor and the
occupation formula were each verified by reading the source in this session rather than taken from a
research brief. The 30.8/30.8/38.5 spread, the 400-of-400 floor measurement and the 67%-faster figure
are carried forward with their original milestone attribution and NO calendar date, because none is
recorded anywhere.***
