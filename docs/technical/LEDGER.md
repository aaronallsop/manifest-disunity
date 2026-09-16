# The reconciliation ledger

**Stage 3, step 1 (T0.2). Written 16 September 2026.**

> **What this is: the difference between the game that RUNS and the game that is DESIGNED, system by
> system.** *It exists because nine of the twenty design documents state what is already built and ten
> do not — so for half the game nobody had written down what exists, and a technical document written
> against that is guessing whether it is describing a change or describing what is already there.*

**How to read a row.** *BUILT* is what the code does today, verified in the code rather than carried
from a document. *DESIGNED* is what the satellite specifies. *DELTA* is the work, and its **size** is
the honest one of four: **none · tune · extend · build** — where *build* means no implementation
exists at all.

> **⚠ WHAT THIS LEDGER IS NOT.** *It is not a build order and it does not rank anything. That line is
> Aaron's and stage 4's, and it binds this document exactly as it bound stage 2.*

---

## 0. The headline, before the table

| | |
|---|---|
| **Systems where the delta is BUILD — no implementation at all** | **5** |
| **Systems already carrying a built-vs-designed section in their own document** | 9 of 19 |
| **Systems where nobody had written down what exists** | **10 of 19** |
| **Code measured** | **27,064 lines of JavaScript over 58 files**, plus 16,912 lines of tests over 53 |

**The five with nothing behind them, each verified by searching the code rather than assumed:**

| | What the search found |
|---|---|
| **Blocs and federations** | **Zero.** *19 matches for the word "bloc" and every one is an **ideology bloc** — a share of a population. There is no multilateral object, no federation, no club treasury, no collective defence* |
| **Missions** | **Zero.** *The word does not appear anywhere in the code. `objectives.js` is the victory screen, not a mission tree* |
| **Projects** | **Zero.** *11 matches and every one is "project force" or "this project". Nothing multi-turn, nothing that persists, and no slot in the turn for one to resolve in* |
| **Alliances and vassals** | **Zero alliances** — the word appears nowhere. **Two matches for "vassal"** and both are comments saying a vassal contract was *deliberately not invented* **"without inventing a vassal contract the save format has nowhere to put"** |
| **Ceasefire and the peace treaty** | **Zero.** *Neither "ceasefire" nor "truce" appears in the code. Round 2's blind double-tabling — both sides write terms, the defender opens both — has no implementation* |

> **⚠ And three more mechanics the design leans on return nothing at all:** *`referendum` (0),
> `martial` (0), and **`wary` (0)** — the sixth relationship state, which round 2 made **the only exit
> from a permanent feud in the whole design.***

---

## 1. Substrate

| System | BUILT | DESIGNED | DELTA | Size |
|---|---|---|---|---|
| **board** | `graph.js` (adjacency in compressed sparse row, built once at load), `projection.js` (how far a nation can reach), `state.js` (columnar per-Area fields), `transit.js` (1,208 lines — corridors, tolls, rivers, seas), `mapmodes.js`, `editor.js`, `geo-ct.js` | `board-design.md`, 731 lines. Geography as a graph with costs; the rivers and their fifteen gates; two seas; Canada, Mexico and the world market as **places** | **Mostly built and carried across exactly.** The document's own honest gap stands: **nothing has a length or a coordinate**, so a 16-mile sea crossing prices identically to a 2,578-mile one. Plus §7.1a — **four real ocean ports flagged inland** | **tune** + one data fix |
| **identity** | `ideology.js` — **"Six symmetric ideologies on two axes"**, 232 lines | `identity-design.md`, 573 lines. **Three axes, ten positions**, two trapdoors, affinity, the drift partition, 26 movements placed | **⚠ THE LARGEST SINGLE DELTA IN THE PROJECT.** The built model is superseded by D231 and **every formula in the game reads it**. See `MEASUREMENTS.md` §1 — the denominator has no authored value and the one I derived changes what every tuned threshold means | **build** |
| **population** | `counts.js` (shares → head counts summing exactly), `migration.js` (471 lines, the five terms) | `population-design.md`, 453 lines. Six counts, drift, growth, migration, the sum invariants | **Close.** The invariant discipline is real and tested. Widens to ten positions with identity | **extend** |

---

## 2. Shared currency

| System | BUILT | DESIGNED | DELTA | Size |
|---|---|---|---|---|
| **power** | `power.js`, 997 lines — its own header names **four**: Authority, Influence, Quality of Life, Civil Liberties. *It also carries `cohesion` and `legitimacy` internally* | `power-design.md`, 365 lines. **FIVE stocks** — the four plus **war weariness**, *"the only one that measures what a nation is doing to ITSELF"* — the rate limit, the Why record | **⚠ The fifth stock EXISTS but does not live here.** *`weariness` returns 93 matches across 10 files and none of them is the aggregator.* **So the delta is not "build the fifth stock", it is "the system that aggregates the stocks does not own one of them"** — which is a structural question for power's technical document, not a missing feature. The rate-limit discipline is built and is the model D234's economy brake was copied from | **extend** |
| **turn** | `turns.js` (158 lines), `world.js` (1,295 — the phase pipeline), `calendar.js`, `moves.js` (1,978 — plan/resolve), `actions.js` (1,587) | `turn-design.md`, 761 lines. **A round of 61 slots, no action budget, projects, the reactive channel, the briefing** | **⚠ Two different games.** Built: one action per nation per turn, and the action IS the turn — *there is no has-acted flag because there does not need to be one*. Designed: no budget, many things started, **projects**, and something new has to end a slot. **The phase order itself carries across unchanged and is the one acyclic spine in the project** | **build** (the budget and projects) · **none** (the phase order) |

---

## 3. The systems

| System | BUILT | DESIGNED | DELTA | Size |
|---|---|---|---|---|
| **movements** | `movements.js` (423), `sentiment.js` (428 — the pressure formula), `civilwar.js` (211, pure math) | `movements-design.md`, 496 lines. Sentiment, six verbs, two tiers of secession, demands as a free-and-mandatory card | **Substantial machinery exists.** Missing: **demands** (the card and the three answers), movements **born in play**, and the verb that changes when you string one along — which round 2 found is *the only exit from a permanent feud* | **extend** |
| **governing** | `elections.js` (384), `leaders.js` (181) | `governing-design.md`, 552 lines. Release, autonomy, change course, become them, **referendum**, **martial law**, stealing a result | **⚠ `referendum` and `martial` return ZERO matches in the code.** Elections and leaders are real; **the government's answer table is largely unbuilt** | **build** |
| **economy** | `market.js` (130 — global resource prices), treasury inside `game.js`, six sectors in the data | `economy-design.md`, 476 lines. Capacity × utilisation, bands, derived demand, price formation, **the logistics spiral and its brake (D234)** | **⚠ The model is known to be structurally wrong and is being kept on purpose** (Addendum A). The brake is chosen in the design and **unbuilt**. Two of its own gaps: not one formula in §§3–4 has a tunable key, and the band ladder leaves two numeric gaps | **build** |
| **trade** | `deals.js` (486), `dealbook.js` (345), `transit.js` (1,208), `trademap.js` (279) | `trade-design.md`, 417 lines. Deals with terms, transit grants, tolls, friction by mode, the route-finder, blockade | **The most complete system in the game** — A1 to A4 built it and all sixty nations use it. **Its delta is reconciliation, not construction**: three internal-trade regimes disagree, and **two toll systems are live at once** pricing modes in opposite directions (deferred 41). *Aaron has scheduled that choice for this stage's economy work and it is not to be raised before then* | **tune** + reconcile |
| **force** | `military.js` (311) — "Force, as an allocation" | `force-design.md`, 322 lines. One derived number, **three slices** (garrison, border, field), readiness as a commitment, upkeep, the militia split, bases | **Close in shape.** `readiness` is real (16 matches). Its own open question 1 — three slices or four — is unresolved, and **military base data has never been pulled** (deferred 16) | **extend** |
| **war** | Attack resolution inside `moves.js` / `actions.js`, `civilwar.js`, occupation (121 matches over 13 files), weariness (93) | `war-design.md`, 535 lines. Declaring, the fight, three occupation flags and the digestion ladder, **the peace treaty's four levers and the blind double-tabling**, the war-cost ledger | **⚠ The fight is built; ENDING a war is not.** Zero matches for ceasefire or truce. And **deferred 34 is here**: the branch that charges a failed aggressor tests for an outcome the war code has never produced, so the defenders pay and the attacker is paid | **build** (the ending) · **fix** (34) |
| **diplomacy** | `relations.js` (223), `recognition.js` (446), `pacts.js` (204 — treaties and aid), `coalitions.js` (230) | `diplomacy-design.md`, 458 lines. The relations list, **the eight-state spine**, recognition, coalitions, the contests, alliances, guarantees, vassalage, sponsorship, the overture | **⚠ The spine is the gap.** Built relations are thin — 21 matches for hostile/hostility across 6 files — and **`wary` returns zero**, so the state round 2 designed as the way out of a feud does not exist. **No alliances, no vassals.** Recognition is genuinely built and is the system's strongest half | **build** |
| **blocs** | **Nothing** | `blocs-design.md`, 436 lines. The light bloc and the heavy federation, with leader, treasury, turn, toll and collective defence | **⚠ Entire document, zero implementation.** And it arrives with a reconciliation job attached: **five internal-trade regimes, not three** | **build** |
| **events** | `events.js` (336) — "Crises, as a table" | `events-design.md`, 497 lines. **The crisis AND the shock**; blast radius in adjacency hops; proportional share; two budgets; the opening front page | **Crises exist; shocks do not.** Round 6's shock is the first event about a **region** rather than a nation, and the delivery has to learn to address a group — today an event reaches exactly one nation, three a turn | **extend** |

---

## 4. The frame

| System | BUILT | DESIGNED | DELTA | Size |
|---|---|---|---|---|
| **nation** | `scenario.js` (599 — the opening board), `factions.js` (220), `identity.js` (218 — names and flags), `victory.js` (429) | `nation-design.md`, 618 lines. **One machine for nation-making** across five birth routes; minimums; honeymoon; home ground; extinction; three victory paths | **⚠ Round 1 asked for one machine and there are FIVE.** Deferred 35 and 36 are here: a nation born in play has no government and cannot win on ideology, and **only one of the five birth routes gives a nation a birth**. Victory exists and is measured — **see `MEASUREMENTS.md` §2, its targets do not survive contact with a 200-turn game** | **build** |
| **opening-board** | `scenario.js` — the fractured map, built out of the movements | `opening-board-design.md`, 390 lines. Who exists, what they remember, what is already signed | **⚠ Deferred 33: three opening-board facts are specified by rulings and not built**, and two rulings now depend on them. Plus the traced finding: **the board opens with nothing in flight** — no turn −1 — which Aaron's taught first turn needs | **extend** |
| **missions** | **Nothing** | `missions-design.md`, **1,003 lines** — three trees, three branches, four elements, one pivot each | **⚠ The largest design document in the project has zero code.** *And it is the document already flagged to split at the system/trees seam* | **build** |
| **ai** | `ai.js` (879) — "The other fifty seats" | `ai-design.md`, 366 lines. One scoring model over the same Previews the player sees, posture from strain, softmax, the Closing term, **and the cost of playing under a restricted view** | **Built and working** — it signs corridors unprompted. **Two deltas:** it is built on a turn rule D218 superseded, and **deferred 43 — the five army-allocation weights are literals in code**, against this project's oldest standing rule | **extend** · **fix** (43) |
| **presentation** | `panels.js` (1,369), `shell.js` (674), `map.js` (492), `disclosure.js` (213), `journal.js` (268), `leaderboard.js`, `objectives.js`, `menu.js`, `format.js` | `presentation-design.md`, 706 lines. The map and its modes, the Why-record panel, **the one card shape**, the newspaper, the timeline, **and what a nation may know** | **A great deal of surface exists.** The deltas are the new objects: **the card** (nothing specifies its vocabulary in code), **the newspaper**, **the timeline**, and **restricted sight** — which also has to be applied to the AI or the player is playing against a cheat | **extend** |

---

## 5. What this ledger changes about the plan

**Three things, and the third is the one to carry forward.**

1. **The five *build* systems are not evenly spread.** *Blocs, missions, projects, alliances/vassals and
   the peace treaty are all things the design added AFTER the code stopped moving.* **Four of the five
   are in the alpha's stated content scope.**
2. **`identity` is the delta that touches everything.** *Every formula in the game reads the six-ideology
   two-axis model, and it is superseded. It is in the substrate, so it comes early — and
   `MEASUREMENTS.md` §1 shows the conversion is not a relabelling.*
3. **⚠ Two systems are in better shape than their documents suggest, and one is in worse.** *Trade is
   the most complete system in the game and its work is reconciliation rather than construction. The AI
   genuinely plays. **War is the worst** — the fight is built, ending a war is not, and the one branch
   that punishes a failed aggressor has never executed.*

---

## 6. Gaps in this ledger itself

| | |
|---|---|
| **1** | **BUILT was established by searching the code, not by reading every module end to end.** *A zero match is strong evidence of absence; a non-zero match is weaker evidence of presence. **The five "build" rows are the confident ones**; the "extend" rows are the ones a system's own technical document should re-check* |
| **2** | **No row carries an estimate.** *Size is one of four words. Putting hours on them is stage 4's, and stage 4 is Aaron's* |
| **3** | **The 38 standing faults are named where they land but not individually placed.** *Six appear above; the rest are in the triage* |
| **4** | **`DESIGN.md` was not reconciled against this.** *It is still the source of truth for what the game does, and by the end of stage 3 nineteen technical documents will also describe that. **Two sources of truth is the problem this project has solved twice** — it is open question 4 of the plan* |
