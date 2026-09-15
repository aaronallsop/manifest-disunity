# Trade — the deal, the corridor, and the toll on what arrives

**Stage 2 of five: DESIGN.** A specification for the Technical Designer, not an idea bank.

**Depends on:** `GDD.md` · `board-design.md` (the ports, the rivers, the two seas, the route search) ·
`economy-design.md` (what is scarce, and the logistics ratio a haul feeds) · `diplomacy-design.md`
(recognition, which gates every deal) · `blocs-design.md` (the club regimes that would override this).

**Read by:** `blocs-design.md` · `economy-design.md` · `ai-design.md` · `missions-design.md` ·
`presentation-design.md` · `opening-board-design.md`.

> **⚠ TRADE HAS NEVER HAD AN IDEATION ROUND OF ITS OWN.** *It is split across round 4 (economy) and
> round 5 (diplomacy), and neither owns it.* **This document is the first place the whole system is
> described in one piece — which is also why it finds so much.**

> **The one-sentence version: this is the most finished thing in the project, and it has five
> unreconciled toll regimes, two of which are both live in the build right now.**

---

## 1. What is built, and it is a great deal

| **BUILT AND WORKING** | **SPECIFIED, NOT BUILT** |
|---|---|
| **The deal** — terms, a five-entry duration menu, auto-renew, expiry, renegotiation | **The five-multiplier price.** *None of it* |
| **Transit grants** — per pair, per direction, per mode, with notice | **Goods actually moving.** *Settlement is a treasury credit* |
| **Tolls on what ARRIVES**, compounding down the chain | **Breaking a deal early** |
| **The route search** — hop-layered, deterministic, no logarithms | **A price anybody can set** |
| **The world market**, the two seas, the Canada and Mexico corridors | **Collective embargo** |
| **All sixty-one nations using it unprompted** | **Anything with a LENGTH** |

---

## 2. A deal

### 2.1 The gates, in order

**Both alive · not yourself · adjacent OR a route exists · no live deal already · the duration must be
on the menu · the price multiplier inside its band · MUTUAL RECOGNITION · volume clipped to the smaller
of the two capacities.**

**What it pays:** *each side gets **0.025 of traded value per turn**, and the price multiplier splits
that joint gain — seller × mult, buyer × (2 − mult), **and the sum is invariant.*** **Carriage
multiplies both**, because a toll is charged on the way.

**Settlement runs once a world turn**, pays for the turn it closes **before** expiry, and is
**deliberately not logged** — *sixty-one nations settling every turn would bury every other entry.*

**Expiry re-plans through the same planner at today's prices, surpluses and recognition.** *Auto-renew
re-signs or lapses **with a reason**; otherwise it ends, and only if the player is a party does the
counterparty offer the old terms back.*

### 2.2 The durations, and the error they caused

| The menu | 20 · 30 · 40 · 50 · 100 turns |
|---|---|
| In years | **five · seven and a half · ten · twelve and a half · twenty-five** |

> **Aaron raised these himself on 6 September, after playing, from `[2, 4, 8, 20]`**, and the tunable
> records why: *"**renewing a one-year contract every four turns is administration rather than a
> decision**, and a real supply agreement between two countries is signed for decades."*
>
> **And it says what the change makes real:** *"a deal holds the price it was signed at for its whole
> term, and prices move on the order of 15% over a hundred turns, **so a long contract is now a genuine
> bet rather than a formality.**"*

**A duration off the menu is REFUSED rather than rounded, because the buttons ARE the negotiation.**

> **⚠ FOUR DOCUMENTS AND TWO CLOSED IDEATION ROUNDS STILL QUOTE `2 / 4 / 8 / 20`.** *That is
> `transit.durations` — a different table, for a different object, deliberately shorter.* **D233 voided
> half of D228 over exactly this error and corrected three documents; it did not reach the ideation
> rounds, and it may not touch `docs/spec/`.**
>
> **So two closed rounds reason from a menu that has not existed since 6 September:**
> - *One takes a default on "the longest term the game has — five years."* **Twenty turns is the
>   SHORTEST term on the menu.**
> - *Another says a story deal has "a term four times longer than the built five-year maximum."* **The
>   built maximum is twenty-five years, so the story deal is SHORTER than what the game already has.**

### 2.3 ⚠ And signing a hundred-turn deal costs nothing

**The planner returns a cost of zero.** *The longest term on the menu is **half the whole game**, it
locks a price for fifty years, and it is free.*

**This is D228's surviving half and it is more urgent than when he gave it**, not less. **Open question
1 is whether a hundred-turn deal should be on the menu at all** — *and Aaron's own reasoning, **nothing
should be settled for a generation**, was made about a term the menu already contains.*

---

## 3. Transit, and the one idea worth holding on to

> **"Each toll is charged on WHAT ARRIVES, not on what set out. So the nation nearest the seller
> collects the most, every crossing after it is worth less, and a long chain of middlemen pays
> everybody badly."**

```
for each hop:
    a nation:    take = carried × rate;   carried = (carried − take) × (1 − friction(mode))
    a corridor:  take = carried × 0.10;   carried −= take;   CREDITED TO NOBODY
```

**Friction by mode: road 25% · rail 15% · water 11.25%.** *Collected by nobody, and it is the bigger of
the two leaks* — **at the floor toll rate a road hop's toll takes 5% while its friction takes 25% of
what is left. Five times as much.**

**Money is not conserved, on purpose, and the file says so.** *What the two parties are debited is what
did not arrive; what the hops are credited is only the tolls.*

**A grant is keyed (grantor → grantee → mode)**, so it is **per pair, per direction, per mode.** *Rates
negotiated between 5% and 60%, halved if the pair also holds a live trade deal, four turns' notice to
revoke, and a memory written against you when you do.*

**A grant under notice still carries** — and **a stalled route pays nothing while its term runs
down.** *That is the five-year contract burned by a neighbour, and it is built.*

### 3.1 The route search, and why every choice in it is a determinism choice

| | |
|---|---|
| **Hop-layered, not Dijkstra** | *the hop cap would hide routes* |
| **No logarithms anywhere** | *browser-to-browser replay divergence* |
| **A total tie-break order** | most surviving → fewest hops → alphabetical |
| **Permission asked at relax time** | *not baked into the graph, because a grant can lapse mid-search* |
| **Re-priced from scratch before return** | *so the quoted number is the number that will be charged* |

**The world market is a node with no outgoing edges.** *Reachable only by an ocean port, or through
somebody else's.* **A Great Lakes port reaches it only via Canada. A river port reaches nothing.**

**The Panama rule is enforced narrowly** — *water in, water out, across two basins is refused* — **and
narrowly on purpose, because four tests guarded that ruling while it was being defeated through
Mexico for a fortnight.**

---

## 4. ⚠ FIVE TOLL REGIMES, AND TWO OF THEM ARE BOTH LIVE IN THE BUILD

**The project has been calling this "three unreconciled internal-trade regimes." It is five, and the
two nobody knew about are both running today.**

| | Regime | Status |
|---|---|---|
| **1** | **The standing corridor grant** — negotiated, per-mode, compounding, with notice | ✅ **BUILT** |
| **2** | **The legacy one-off transit sale** — one click, uses the turn, no term | ✅ **BUILT** |
| **3** | The spec's compounding per-mode multipliers — **highway ×1.0, rail ×1.6, port ×2.5** | specified |
| **4** | The federation's flat toll | designed |
| **5** | The bloc's free movement | designed |

### 4.1 ⚠ The two built ones price the modes in OPPOSITE directions

| | **The legacy one-off sale** | **The standing grant** |
|---|---|---|
| Mode adjustment | rail **−50%**, highway **−20%** → **RAIL IS CHEAPEST** | port ×1.0, river ×0.95, rail ×0.85, road ×0.75 → **ROAD IS CHEAPEST, PORT IS DEAREST** |
| Term | **none.** One click, and it uses your turn | a menu, a notice period, a renege memory |
| Slider bounds | **hardcoded in the markup** | reads the tunables |

**Both read the same baseline toll tunable. Two of the tunables are read by the legacy path ONLY**, so
**turning either dial moves one system and leaves the other untouched.**

**They sit on the same panel deliberately** — *"the difference between renting a lift this quarter and
holding the road open for five years is exactly the thing the player is being asked to weigh."*
**What is not deliberate is that they disagree about which mode is dear.**

> **⚠ AND NEITHER `DESIGN.md` NOR `board-design.md` DESCRIBES THE LEGACY PATH AT ALL.** *Both document
> only the grant.* **A designer reconciling "the three regimes" would reconcile the wrong three.**
> *`docs/deferred.md` 41.*

### 4.2 The federation's own toll is three different numbers

**Ten per cent flat in one ruling, five per cent between direct neighbours in another, fifteen per cent
outside in a third.** *Nothing reconciles them, and the reconciliation is `blocs-design.md`'s.*

### 4.3 ⚠ "Free movement of goods" is not expressible in the built model

**Friction is handling, transhipment and delay. It is collected by nobody and waivable by no
agreement.** *A zero-toll road crossing still loses a quarter of what crosses it.*

**Neither the bloc nor the vassal's free passage notices this.** **And neither mentions the three-hop
cap, which silently makes a club of more than four members unrepresentable for internal routing.**

---

## 5. The world market — who can reach it, measured

**Measured this session by reconstructing the 61-nation board and testing every county.**

| | Nations | |
|---|---:|---|
| **Ocean port — reaches the world DIRECTLY** | **23** | |
| **Lake port and a land gateway** | **2** | Michigan, Minnesota |
| **Great Lakes port only** | **4** | ⚠ **reaches the world ONLY through Canada** |
| **Land gateway only** | **8** | |
| **❌ NOTHING of their own** | **24** | **must route through somebody, or not trade abroad at all** |

> **⚠ TWENTY-FOUR, AND NOBODY HAD COUNTED IT. The published figure is fourteen, and fourteen is a
> different predicate** — *no port **and** no border crossing, which is correct as far as it goes.*
>
> **The gap is TEN NATIONS THAT HOLD A PORT AND CANNOT EXPORT THROUGH IT:** *Arkansas, Kentucky,
> Missouri, Northern California, Oklahoma, Pennsylvania, Rhode Island, South Carolina, Tennessee and
> Virginia — **all [BUILT]**.* **The port is on their panel. Its capacity is multiplied into every deal
> they sign. It reaches no foreign market.**
>
> **That is this project's own named failure, word for word:** *a layer the player has not learned yet
> must be **INVISIBLE or SELF-EXPLAINING**, never **VISIBLE AND WRONG**.*

**And four of those ten are there because of a DATA FAULT** — *Philadelphia, Charleston, Hampton Roads
and Providence are real ocean ports flagged as inland.* **`board-design.md` §7.1a and
`docs/deferred.md` 39.**

**There is no separate world-market cap.** *One capacity figure — a base plus a term per port, per rail
hub and per gateway — caps a bilateral deal as the smaller of the pair, and caps an external sale on
its own.* **Which means the ten nations above are carrying capacity they cannot spend.**

---

## 6. ⚠ The structural fact nobody has written down: surpluses net to zero, always

**A nation's surplus in a sector is its production minus its demand share of its OWN output.** *Demand
shares sum to exactly 1.0.*

> **So every nation's surpluses and deficits net to exactly zero, for every nation, on every turn.**
> **No nation is ever net-short or net-long. Only the MIX differs.**

**It is pinned by a test, so it is intended arithmetic rather than an accident.** **And it is the
arithmetic reason for the project's known hollow spot:** *nothing bad happens to a nation that does not
trade.* **`economy-design.md` §3.1 is the fix, and it is unbuilt.**

---

## 7. What the spec asks for, and none of it is built

```
DealPrice = BasePrice × Scarcity × Alternatives × Relations × Risk × Duration
```

**The spec names the load-bearing one itself:**

> *"**AlternativesMult is the most important term.** It is what makes cutting a rival's other supplier a
> strategic act rather than a flavour event. **Do not simplify it away.**"*

**Built today, a deal has exactly two levers: how long, and whether it renews itself.** *The price
multiplier exists, is validated, is tested — **and no screen sets it.*** **The missing piece is not the
slider. It is ALTERNATIVES** — *and it has a named performance trap: a naive count is roughly sixty
surplus lookups across seven hundred plans a round.*

**The round measured what a second supplier is worth: about 12% on the price.** *That figure is the
whole case for the term.*

**⚠ And the spec's duration table is keyed to the dead four-entry menu**, so its per-deal pricing
section is written against a menu that no longer exists. *`docs/spec/` may not be corrected without
permission. Gap 2.*

---

## 8. The rulings that reach trade

| | |
|---|---|
| **The outside world is one market reached through geography** | **Canada and Mexico are the road to the customer, not the customer.** *"What does the outside world want?" has a deliberately boring answer: **anything, slowly, up to a cap**"* |
| **A toll between two actors is a TRANSFER; a toll through geography is a COST** | *When the ground crossed belongs to nobody who can hold a treasury, **the money is burned***. The sizing is explicitly not that round's |
| **A blockade is corridor closure plus embargo** | **Nothing needs adding.** *What was missing was somebody saying that the two together ARE the blockade* |
| **The recognition block STAYS** | *and the spec still specifies replacing it, in its own text.* **Gap 4** |
| **⚠ The board opens with four signed agreements on it** | Aaron: *"Author them all, before the alpha"*, then, shown the cost: *"Stands — build them first."* **This puts an alliance, a bloc and vassalage IN FRONT of the alpha whose whole purpose is trade** — *and the review's verdict was that it is three agreements, not four, and none of them is cheap* |

**And the handover's own honest headline, which belongs at the top of any build-order conversation:**

> *"The definition of done says an alpha tester must negotiate a trade deal with real terms and see it
> expire, grant or revoke transit and feel the consequence, read the trade network map and understand
> why a route broke, and watch AI nations trade with each other unprompted. **None of that is
> diplomacy.**"*

---

## 9. What this hands the Technical Designer

| | |
|---|---|
| **❌ Decide which of the two LIVE toll systems the game means** | §4.1 |
| **❌ Ten nations hold a port that reaches nothing**, and four of them by a data fault | §5 |
| **Surpluses net to zero by construction** | §6. *No nation can be net-short of anything* |
| **The price multiplier is built and unreachable.** *The missing piece is ALTERNATIVES, and it has a performance trap* | §7 |
| **A hundred-turn deal is free** | §2.3 |
| **Friction makes "free movement" unexpressible** | §4.3 |
| **Nothing on this board has a LENGTH** | *16 miles and 2,578 miles cost the same* |

---

## 10. Open questions

| | | Owner |
|---|---|---|
| **1** | **⚠ Should a hundred-turn deal be on the menu at all? It is half the game** | **Aaron.** *Pre-filed here by D233* |
| **2** | **What does signing a long agreement cost?** *D228's surviving half. Today: nothing* | **The architect** |
| **3** | **Which of the FIVE toll regimes governs**, and does a club override the corridor system or does the corridor system learn a second mode? | **The design stage** — *`blocs-design.md`* |
| **4** | **⚠ Which of the two LIVE built systems is the one the game means?** *New* | **Unassigned** |
| **5** | **⚠ Are the 59 river/inland ports geography or a data fault?** *The answer changes how many nations can trade at all* | **Unassigned** |
| **6** | **Does anything on this board have a LENGTH?** *The data build computes centroids and throws the coordinates away* | **Aaron, then the architect** |
| **7** | **Can a smuggler's rate reach the world market for a nation with no port?** *The market is "a haircut rather than a lock" and is reached "only through an ocean port." **Nobody has asked whether the two rules agree*** | **The Technical Designer** |
| **8** | **Should a Lake Michigan port reach the Canada corridor without passing Mackinac?** | **The Technical Designer** |
| **9** | **Does lasting infrastructure damage exist?** *A wrecked rail hub lasts one turn — a raid, not a demolition* | **Aaron** |

---

## 11. Gaps

| | |
|---|---|
| **1** | **The spec's five price multipliers reach no screen and no code.** *A partner with no other supplier behaves exactly like one with three* |
| **2** | **The spec's duration table is keyed to a menu that no longer exists**, and the spec may not be corrected without permission |
| **3** | **⚠ The external market is still the pre-A1 model** — *a one-off click that banks the money and uses the turn. No term, no expiry, no row on the deals screen.* **And a ruling was made on top of it without noting that the object it rules about does not exist** |
| **4** | **Two sections of the authoritative spec are dead letters and say so in their own text.** *Somebody will build them unless this is said out loud* |
| **5** | **⚠ The spec contradicts itself on whether goods move.** *Two sections say they do; the build says settlement is a treasury credit and nothing else, pinned by two tests* |
| **6** | **Nothing says what a border crossing IS, mechanically.** *Thirty-two are named; holding one puts Canada or Mexico in reach and does nothing else — **and a mission tree already asks a player to take one*** |
| **7** | **Nothing says whether a corridor survives its grantor being annexed**, though grants are keyed by grantor |
| **8** | **Nothing says what an ungoverned chokepoint is** — open, shut, or free |
| **9** | **Breaking a trade deal early does not exist** |
| **10** | **Collective embargo is gestured at and never defined** |
| **11** | **⚠ Four stale code comments from the duration change**, one of which describes a contract that was replaced — *a figure it calls byte-for-byte identical is now **five times** what it claims* |
| **12** | **The rate limit on the logistics ratio's fall is deliberately unset** — *the architect's* |

---

## 12. The scenarios this document must be able to narrate

**Four traced. Two work beautifully, one is the failure this document was written to find, and one
cannot be told at all.**

### 12.1 ✅ A five-country resale chain, and everybody does badly

**Step 1.** A seller two countries away from a buyer. *Three nations in between, each wanting a cut.*

**Step 2 — each toll is charged on WHAT ARRIVES.** *The first middleman takes his share of everything;
the second takes his share of what is left; the third of what is left after that.*

**Step 3 — and friction eats more than the tolls do.** *At the floor rate a road hop's toll takes 5%
and its friction takes 25% of the remainder.*

**Step 4 — the chain keeps 18–43% against 90% for selling abroad directly.** *Measured, and it is one
of the five success criteria.*

> **✅ NARRATES, and it is the best-built thing in the game.** *The nation nearest the seller collects
> the most, and a long chain of middlemen pays everybody badly — which is both true to life and
> legible on the trade map.*

### 12.2 ❌ Pennsylvania tries to sell abroad through the Port of Philadelphia

**Step 1.** Pennsylvania **[BUILT]** holds two port counties. *Its panel shows the ports. Their
capacity is multiplied into every deal it signs.*

**Step 2.** The player opens the world market.

**Step 3 — ❌ there is no route.** *The world market is a node reachable only from an ocean port, and
neither of Pennsylvania's is flagged coastal.*

**Step 4 — and one of them is the Port of Philadelphia**, which in the real world moves millions of
tonnes a year.

**Step 5.** *The player is given no reason. The port is on the panel; the route simply does not exist.*

> **❌ JAMS, AND IT IS THE PROJECT'S OWN NAMED FAILURE MODE.** *VISIBLE AND WRONG.* **Ten nations are in
> this position and four of them, including this one, are there because of a data fault rather than
> because of geography.** *And the capacity those ports grant is still counted, so the nation is
> carrying trade volume it cannot spend.*

### 12.3 ⚠ A player rents a lift this quarter and holds a road open for five years

**Step 1.** Two ways to let a neighbour's goods cross exist on **the same panel**, deliberately.

**Step 2 — the player compares them.** *"Renting a lift this quarter" against "holding the road open
for five years" is exactly the weighing the design intends.*

**Step 3 — ⚠ and the two disagree about which mode is dear.** *On the one-off sale, **rail is the
cheapest thing you can grant.** On the standing grant, **road is cheapest and a port is the dearest
thing on the board.***

**Step 4.** *The player learns one pricing intuition from one screen and it is wrong on the other.*

**Step 5 — and two tunables move only one of them.** *Turning the rail dial changes the one-off sale
and leaves every standing corridor untouched.*

> **⚠ NARRATES AND TEACHES SOMETHING FALSE.** *Neither design document describes the older system, so
> a designer reconciling "the three regimes" would reconcile the wrong three.* **This is why the count
> is five.**

### 12.4 ❌ A landlocked nation is starving and wants to buy food

**Step 1.** It is short of food. **It finds a neighbour in surplus.**

**Step 2 — ❌ it is not short of food.** *Its demand is a share of its own output, and the shares sum to
1.0, so its surpluses and deficits net to zero by construction.* **It has a bad MIX, not a shortage.**

**Step 3.** Suppose the designed economy is built and the shortage is real. *It signs a deal.*

**Step 4 — the haul is added to its logistics demand.** *§6 of `economy-design.md`, and the spiral
starts.*

**Step 5 — and the brake chosen in D234 limits how fast the ratio may fall**, so it gets a few turns in
which the food still mostly arrives.

> **❌ STEP 2 JAMS TODAY, and it is the hollow spot the whole alpha exists to watch.** *A game about
> states that cannot feed themselves currently contains no mechanism by which a state can fail to feed
> itself.* **The arithmetic reason is in §6 and it had never been written down.**

---

*Sources, verified 15 September 2026: `docs/design/economy-ideation.md` rulings 1–9 and findings A–G;
`docs/design/diplomacy-ideation.md` rulings 4, 5, 9, 10, 11, 14, 16, 20 and findings E, I, J, K;
`DESIGN.md` §6, §6.4, §6.7; `docs/spec/economy-system-spec.md` §§1.3, 1.6, 4.1–4.3, 5.1, 5.5;
`docs/spec/a2-measurements.md`; `js/deals.js`, `js/transit.js`, `js/market.js`, `js/moves.js`,
`js/actions.js`, `js/game.js`, `js/recognition.js`; `js/tunables.js` (`market.*`, `trade.*`, `deal.*`,
`transit.*`, `recognition.trade*`); `data/county_trade.json`, `data/transport.json`,
`content/cultural.json`, `content/scenario-shattered.json`; `DECISIONS.md` D163, D166, D170, D171,
D214, D228, D233, D234; `docs/deferred.md` 8, 11, 12, 39, 40, 41. **The port counts (986 counties, 136
ports, 57 ocean / 20 Great Lakes / 59 river-inland, 32 border crossings, 15 chokepoints), the four
misclassified ocean ports, and the 14 / 22 / 24 nation counts with their ten-nation gap were all
measured from the data files in this session, not carried forward. The 18–43% resale figure and the
12% second-supplier figure are carried forward with their original attribution.***
