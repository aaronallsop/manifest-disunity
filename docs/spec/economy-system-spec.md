# Economy & Trade System — Implementation Spec

**Status:** Draft for programmer handoff
**Audience:** Engineering
**Rule of the document:** Work stops at every Control Board Checkpoint. Nothing in a later phase gets started until the designer has verified the prior phase on the Control Board and said so in writing.

---

## 0. How to use this document

Sections 1–7 are the specification: what the system is and why. Section 8 is the build order. Section 9 lists open questions the designer still owes you.

Every number in this document is a **placeholder**. They are first-pass values chosen to be plausible and to make testing possible, not balanced values. All of them live in the tuning data file (see 2.2), not in code. Do not hard-code any of them.

### Working agreements

1. **No phase is skipped and no phase is merged with another.** If a phase looks trivially small, it still ends at its checkpoint.
2. **Every phase ends in a playable, inspectable build.** No "backend done, UI next sprint." If the designer can't see it and poke it, the phase isn't finished.
3. **All tuning constants live in a data file.** The designer must be able to change a number, reload, and see the effect without a rebuild and without you.
4. **Determinism.** Given a seed, a run must reproduce exactly. This is non-negotiable for testing.
5. **When something is ambiguous, stop and ask.** Do not resolve design ambiguity by picking something reasonable and continuing. Section 9 lists the known gaps; if you hit an unknown one, add it there and raise it.

---

## 1. Core concepts and vocabulary

| Term | Meaning |
|---|---|
| **Turn** | One month of in-world time. Fixed. Displayed in the UI. |
| **State** | A playable or AI-controlled polity on the map. |
| **Resource** | One of six national aggregates. See section 3. |
| **Supply / Demand / Ratio** | Every resource has a supply, a derived demand, and `ratio = supply / demand`. |
| **Band** | The bucket a ratio falls into. Drives all consequences. See 3.1. |
| **Trade Deal** | A bilateral agreement to move a quantity of a resource at a price for a duration. |
| **Transit Agreement** | A separate instrument granting the right to move goods *through* a state by a specific mode. |
| **Route** | The ordered path a trade deal's goods take, including all transit hops. |
| **Recognition** | A 0–1 score representing how much of the world accepts a state as legitimate. |
| **World Market** | An abstract external buyer/seller reachable only via port access. |

---

## 2. Foundations (build these first, they are Phase 0)

### 2.1 Time

- One turn = one month. Surface this in the UI.
- All durations are expressed in turns. Standard deal lengths: 6, 12, 24, 60.

### 2.2 Tuning data file

A single human-editable file (JSON or CSV, engineering's choice) containing at minimum:

- Band thresholds per resource
- Base prices per resource
- All price formula coefficients
- Toll rate multipliers by mode
- Demand coefficients
- Recognition thresholds and penalties
- Storage capacities

Hot reload is required. The designer will spend more time in this file than in the game.

### 2.3 Debug overlay

Selecting any state shows, per resource:

- Supply, demand, ratio, current band
- The **top three contributors** to supply and the top three to demand, with their numeric contribution
- Active effects currently applied by that band

This is the single most important thing you will build. Without it, no later phase can be verified.

### 2.4 Headless simulation

A mode that runs N turns with no rendering and writes a CSV: one row per state per turn, one column per tracked value (all six resources' supply/demand/ratio/band, treasury, debt, unrest, opinion toward each neighbour, active deal count).

Target: 100 turns in under 60 seconds. This is how balance gets done in Phase 8.

---

## 3. The resource model

### 3.1 Uniform band structure

All six resources use the same band math. Only the *consequences* differ.

| Band | Ratio |
|---|---|
| Crisis | < 0.50 |
| Deficit | 0.50 – 0.89 |
| Met | 0.90 – 1.10 |
| Surplus | 1.11 – 1.50 |
| Glut | > 1.50 |

Bands are evaluated at end of turn. Band *transitions* should fire an event the UI can display ("Nevada has entered Manufacturing Deficit").

### 3.2 The six resources

#### Food

| Band | Effect |
|---|---|
| Crisis | Quality of Life −30, Unrest +5/turn, Army morale −20 |
| Deficit | QoL −10, Unrest +2/turn |
| Met | — |
| Surplus | QoL +3, exportable volume available |
| Glut | See below |

**Glut is special.** Food has a **storage capacity** (silos), expressed in turns of national consumption. Base capacity 4 turns, upgradeable. Surplus fills storage first with no penalty. Only volume above storage capacity triggers the glut penalty:

- Farm-gate price collapse: agricultural income −50%
- Farm faction approval −4/turn while the condition persists

> **Design note for engineering:** this replaces an earlier idea where food surplus caused a health penalty. Do not implement a health effect from food surplus.

#### Resource Extraction

| Band | Effect |
|---|---|
| Crisis | Manufacturing output hard-capped at 40%, admin costs +25%, QoL −10 |
| Deficit | Manufacturing output capped at the extraction ratio, productivity −10% |
| Met | — |
| Surplus | +Canada/Mexico trade willingness; World Market demand available |
| Glut | Extraction sector income −40% (price effect) |

#### Manufacturing

| Band | Effect |
|---|---|
| Crisis | Military equipment score −50%, infrastructure repair halted, QoL −15 |
| Deficit | Military equipment score −20%, QoL −5 |
| Met | — |
| Surplus | Consumer goods income, valued at **60% of what the same volume would fetch as an export** (exporting should always beat domestic consumption) |
| Glut | Idle capacity; industrial faction approval −2/turn |

#### Logistics *(formerly "Trade")*

**This resource changed type.** It is no longer a consumable. It is a **throughput capacity**.

- `utilisation = total volume moved this turn / logistics capacity`
- Volume moved includes both internal distribution and all import/export legs.

| Utilisation | Effect |
|---|---|
| > 1.50 | Routes fail at random (10%/turn per route), transit losses 20% |
| 1.11 – 1.50 | Transit losses 10%, toll costs +15% |
| 0.90 – 1.10 | Transit losses 3% |
| 0.50 – 0.89 | Transit losses 1%; state is eligible to host broker routes |
| < 0.50 | As above, plus +opinion from states that route through you |

The old "surplus Trade raises other nations' opinion of you" outcome now emerges from this rather than being applied directly: states with spare capacity host other people's routes, and hosting generates the opinion.

#### Finance

Two distinct levers, not one:

- **Debt ceiling** = `f(finance surplus, economy size)`. Placeholder: `ceiling = economySize × (0.4 + 0.6 × financeRatio)`.
- **Interest rate** = `baseRate − (financeRatio − 1.0) × 0.03`, floored at 1%.

| Band | Effect |
|---|---|
| Crisis | Cannot service existing debt; default risk 15%/turn; all credit frozen |
| Deficit | Interest rate penalty; ceiling reduced |
| Met | — |
| Surplus | May **lend to other states** (new mechanic — see 5.5) |
| Glut | Lending capacity increased; small opinion bonus with debtor states |

#### Information Technology

Three concrete jobs. IT is not a generic buff.

| Band | Intel error on other states' figures | Tax leakage | Military tech tier |
|---|---|---|---|
| Crisis | ±40% | 25% | 1 |
| Deficit | ±25% | 18% | 2 |
| Met | ±15% | 10% | 3 |
| Surplus | ±7% | 5% | 4 |
| Glut | ±3% | 2% | 5, +opinion from all states |

**Intel error** means: when the player or an AI inspects another state's resources, army strength, or treaty terms, the displayed number is perturbed within that band. Low-IT states negotiate partly blind. This is intended and is a core reason to invest in IT.

### 3.3 Derived demand

Demand is **computed from state composition**, never authored per state. First-pass coefficients:

```
foodDemand        = population × 1.0 × (1 + qolModifier × 0.1)
extractionDemand  = manufacturingCapacity × 0.6 + population × 0.1
manufacturingDemand = population × 0.3 + armySize × 1.5 + infrastructureUpkeep
logisticsDemand   = totalVolumeMoved          (see Logistics above)
financeDemand     = debtService + governmentExpenditure
itDemand          = (population + manufacturingCapacity) × 0.05
```

Consequence to preserve: Manufacturing consumes Resource Extraction. Cutting a state's extraction supply must visibly degrade its manufacturing within a few turns.

### 3.4 Internal distribution

**Decision: resources pool nationally.** There is no intra-national supply chain simulation. The cost of internal distribution is modelled as a Logistics utilisation load only. Do not build regional stockpiles.

---

## 4. Price formation

Prices must be **visible**. Every quoted price shows its component multipliers in a tooltip. An opaque price is a price the player will ignore.

### 4.1 Unit price

```
UnitPrice = BasePrice
          × ScarcityMult
          × AlternativesMult
          × RelationsMult
          × RiskMult
          × DurationMult
```

| Term | Formula | Notes |
|---|---|---|
| BasePrice | per-resource constant | From tuning file; also the World Market reference |
| ScarcityMult | `clamp(1 + 1.2 × (1 − buyerRatio), 0.6, 2.5)` | Buyer in Crisis at 0.4 → ×1.72 |
| AlternativesMult | `1 + 0.5 × (1 − min(buyerSupplierCount, 3) / 3)` | Sole supplier → ×1.50; three or more → ×1.00 |
| RelationsMult | `1 − (opinion / 100) × 0.2` | Range ×0.80 to ×1.20 |
| RiskMult | `1 + 0.08 × transitHops + 0.15 if any hop is hostile` | |
| DurationMult | 6t = ×1.00, 12t = ×0.97, 24t = ×0.93, 60t = ×0.88 | Long deals discount by default |

**AlternativesMult is the most important term in this formula.** It is what makes cutting a rival's other supplier a strategic act. Do not omit or simplify it.

**DurationMult inversion:** when the seller's own scarcity is *rising* (their ratio has fallen for 3+ consecutive turns), the AI inverts the duration discount into a premium of the same magnitude. A seller who expects to gain leverage should not lock in a cheap long deal.

### 4.2 Delivered cost and compounding tolls

Tolls **compound multiplicatively** along the route:

```
DeliveredCost = UnitPrice × Π(1 + tollRate_i)   for each transit hop i
```

Toll rate by mode, as multipliers on the base toll rate:

| Mode | Multiplier |
|---|---|
| Highway | ×1.0 |
| Rail | ×1.6 |
| Port | ×2.5 |

Compounding is deliberate: it makes long broker chains bleed value and prevents infinite arbitrage. A five-hop chain should be visibly unprofitable.

### 4.3 World Market

- Reachable **only** through port access (own port, or port transit rights, or a Canada/Mexico corridor).
- It is a **price-taker with slow-moving prices**, not an infinite sink. Dumping volume moves the price down over subsequent turns and it recovers slowly.
- It has a **shipping capacity cap** per state per turn.

Both of these exist to stop "sell everything overseas" from becoming the dominant strategy.

---

## 5. Trade and diplomacy layer

### 5.1 Trade Deal object

| Field | Notes |
|---|---|
| Parties | Buyer, seller |
| Resource | One of the six |
| Volume | Per turn |
| Price | Per unit, delivered |
| Duration | In turns |
| Route | Ordered list of transit hops |
| Auto-renew | Boolean, negotiable |

Expiry must produce a **renegotiation prompt**, not a silent lapse. Surface expiry countdowns at 6, 3, and 1 turns out.

### 5.2 Transit Agreement object

A separate instrument from a trade deal. A state can permit highway transit while refusing port access.

| Field | Notes |
|---|---|
| Grantor / grantee | |
| Mode | Highway, Rail, or Port |
| Volume cap | Per turn. Prevents any one corridor carrying a continent. |
| Rate | The toll |
| Duration | |
| Notice period | Turns between a revocation order and it taking effect |

**Revocation is a player action** with a reputation cost. The threat of closure is the point of being a corridor state, so make the action prominent and the consequence real.

### 5.3 Deal acceptance — five factors

AI willingness is a function of, in rough order of weight:

1. **Alternatives** — do they have another supplier or buyer?
2. **Demand** — their band for that resource
3. **Relations and recognition**
4. **Relative power**
5. **Route risk** — hop count and hostility along the path

Counter-offers must be able to modify **duration** as well as price and volume.

### 5.4 Recognition

```
RecognitionScore = Σ(PowerWeight of recognising states) / Σ(PowerWeight of all states)
```

Power-weighted, not a headcount. Trade access is a **ramp, not a cliff**:

| Score | Access |
|---|---|
| < 0.15 | **Gray market only.** ×2.0 price markup, 30% volume cap, 10%/turn seizure chance |
| 0.15 – 0.50 | Limited de jure. ×1.4 markup, 60% volume cap |
| > 0.50 | Full access |

Unrecognised states must always be able to move *some* goods. A hard trade cut-off produces a death spiral where a state can't develop, so it never gets recognised, so it can't develop.

**Border-state suspicion:** Canada and Mexico apply an additional −0.15 recognition penalty to states directly bordering them, decaying over 24 turns from the breakaway.

**Canada and Mexico as corridors:** any state bordering them may negotiate transit through them, subject to the same mode tiers. A New York–Washington route through Canada is legal and should work.

### 5.5 Additional diplomatic instruments

- **Embargo.** Unilateral suspension of all deals with a target. Reputation cost, and cost to your own economy.
- **Lending.** Finance-surplus states may extend loans. Debtors take opinion and leverage penalties. This is the primary use for excess Finance.
- **Corridor closure.** See 5.2.

### 5.6 Hunger generates claims

A state in Food Deficit or Crisis accrues `ClaimPressure` toward each **adjacent** state in Food Surplus or Glut:

- Deficit: +2/turn
- Crisis: +5/turn

Accrual is **suppressed to zero** while an active food deal covers ≥50% of their shortfall at ≤1.3× base price.

At ClaimPressure 50, a casus belli unlocks.

Intent: selling food to a hungry neighbour is a security policy, and starving them is a deliberate risk rather than a passive default.

### 5.7 Treaty succession on conquest

When a state is absorbed:

1. All of its treaties enter **Limbo** for 6 turns.
2. During Limbo, trade flows at 50% volume.
3. The successor may **ratify** or **void** each treaty individually. Voiding costs −10 opinion with the counterparty; ratifying costs nothing.
4. Anything unratified at the end of Limbo voids automatically.

Do not implement blanket void-on-conquest. A single conquest cascading into continent-wide economic collapse is too swingy and removes the interesting decision.

---

## 6. Feedback and UI (not optional, not "polish")

### 6.1 Trade Network map mode

Select a state and see:

- Outbound and inbound trade lines to every partner
- Transit hops rendered distinctly by mode (highway / rail / port)
- **Broken links** rendered distinctly, with the reason (expired, revoked, conquered, over-capacity)
- A click-through from a broken link to open negotiation with whoever now controls that hop

This ships in the same phase as the routing engine, not after it.

### 6.2 Deal ledger

A single screen listing:

- Active trade deals, with expiry countdowns
- Active transit agreements, with volume utilisation and notice periods
- **Open offers** received, with their own expiry timers

Cap incoming AI offers per turn (placeholder: 3) so the player isn't spammed.

### 6.3 Tooltips

Any price shown anywhere must expand into its component multipliers with values. Any band effect must expand into the number that produced it.

---

## 7. Balance risks to watch

| Risk | Mitigation already specified |
|---|---|
| Broker states arbitraging to dominance | Compounding tolls (4.2), volume caps (5.2) |
| World Market as dominant strategy | Price-taker with slow price movement + shipping cap (4.3) |
| Unrecognised-state death spiral | Gray market floor (5.4) |
| Conquest cascading into economic collapse | Treaty Limbo (5.7) |
| Domestic consumption beating export | Surplus manufacturing valued at 60% of export (3.2) |

---

## 8. Build plan

Nine phases. Each ends at a **Control Board Checkpoint**: work stops, the designer verifies on the Control Board, and written approval is required before the next phase starts.

### What the Control Board needs to support

If the Control Board already does any of this, skip it. If it does not, adding it is part of Phase 0.

- Select any state and read its full resource breakdown (the 3.3 debug overlay)
- Step turns one at a time, and fast-forward N turns
- Edit any tuning value and reload
- Force a state's resource supply to an arbitrary value (for testing consequences directly)
- Force diplomatic states: set recognition, force a conquest, force a treaty revocation
- Run the headless sim and export CSV
- Seed control for reproducible runs

---

### Phase 0 — Instrumentation and time

**Build:** Sections 2.1, 2.2, 2.3, 2.4. Control Board capabilities listed above. **No economic logic.**

**Checkpoint — designer verifies:**
- Turn counter shows a date, one turn advances one month
- Debug overlay shows supply/demand/ratio/band and top-three contributors for any state
- Changing a value in the tuning file and reloading changes behaviour, with no rebuild
- Headless run of 100 turns completes in under 60s and exports a readable CSV
- Same seed, twice, produces identical CSVs

---

### Phase 1 — Autarky economy

**Build:** Band model (3.1, 3.2), derived demand (3.3), national pooling (3.4). **No trade of any kind.**

**Designer writes predictions before build starts:** which five states should be self-sufficient, which five structurally broken.

**Checkpoint — designer verifies:**
- 60-turn run with zero trade: every state reaches stable or slowly-declining equilibrium. Nothing oscillates or explodes.
- The five predicted-broken states are in Deficit or Crisis
- Manually zeroing a state's Resource Extraction on the Control Board degrades its Manufacturing within 3–5 turns
- Every band is reachable and every band's effect is observable in the overlay

**Stop condition:** the numbers stop surprising the designer. This phase produces a boring but coherent economy. That is the goal.

---

### Phase 2 — Price formation and World Market

**Build:** Price formula (4.1), World Market (4.3). Single abstract partner. **No diplomacy, no routing, no third-party transit.**

**Checkpoint — designer verifies:**
- Selling volume into the World Market moves the price down, and it recovers slowly
- Shipping capacity cap binds
- A Glut state can partially but not fully relieve itself via the World Market
- Price tooltip shows every multiplier with its value, and the numbers multiply out to the shown price

---

### Phase 3 — Bilateral deals, adjacent states only

**Build:** Trade Deal object (5.1), five-factor acceptance (5.3), counter-offers including duration, deal ledger (6.2), AI-initiated offers with expiry. **Adjacency only — no routing through third parties.**

**Designer writes predictions before build starts:** the price of a given deal from a strong state to a desperate one, and the reverse.

**Checkpoint — designer verifies:**
- A 12-turn deal expires and produces a renegotiation prompt, with countdowns at 6/3/1
- A buyer with no alternative supplier pays visibly more than one with three
- The seller-scarcity duration inversion (4.1) fires and is visible in the tooltip
- Incoming offers are capped and expire
- Both designer predictions land within a reasonable margin

---

### Phase 4 — Transit, tolls, and the network map

**The largest phase.** Build the map mode *with* the routing engine, not after.

**Build:** Transit Agreement object (5.2), mode tiers, routing, compounding tolls (4.2), volume caps, Logistics utilisation (3.2), Trade Network map mode (6.1).

**Checkpoint — designer verifies these named scenarios:**
- **Nevada scenario:** Nevada trades to Oregon through California by highway and rail, and *cannot* reach the World Market because it lacks port rights. Confirm the port refusal is the binding constraint and is legible on the map.
- **Wisconsin scenario:** the long toll rail corridor west to the Pacific is *marginal*, not free money. Read the compounding tolls in the tooltip.
- **Broker chain:** deliberately construct a five-hop resale chain. Confirm it is unprofitable.
- Logistics over-capacity causes route failures and is visible in the overlay

**Stop condition:** the designer can look at the map and explain any state's economy out loud without opening the debug overlay.

---

### Phase 5 — Recognition, Canada, Mexico, gray market

**Build:** Recognition score and ramp (5.4), border-state suspicion, Canada/Mexico as partners and as corridors, gray-market trade.

**Checkpoint — designer verifies:**
- Force a mid-game breakaway on the Control Board. The new state survives on gray-market trade at a punishing rate and is not dead on arrival.
- Recognition rising produces a smooth improvement in terms, with no step change
- A state bordering Mexico faces visibly stiffer terms than an interior state at the same recognition score
- A New York → Washington route through Canada works and is priced by the same toll tiers

---

### Phase 6 — Diplomatic teeth

**Build:** Embargo, corridor closure with notice period and reputation cost (5.2), lending (5.5), hunger-generates-claims (5.6).

**Checkpoint — designer verifies:**
- Closing a corridor: the notice period elapses, the reputation hit lands, and the network map shows the break with the correct reason
- Starving a neighbour accrues ClaimPressure at the specified rate; selling them food at a fair rate stops accrual immediately
- ClaimPressure reaching 50 unlocks a casus belli
- A loan is extended, serviced, and defaulted on, with correct opinion effects at each step

---

### Phase 7 — Succession and shocks

**Build:** Treaty succession Limbo (5.7), infrastructure damage and upgrade.

**Checkpoint — designer verifies:**
- **Deseret scenario:** Deseret absorbs Utah. Utah's treaties enter Limbo, trade drops to 50% volume, the network map shows the break, and the designer can ratify or void each treaty individually with the correct opinion consequences.
- Unratified treaties void automatically at turn 6 of Limbo
- Damaging infrastructure on a corridor degrades throughput and shows on the map

---

### Phase 8 — Tuning

**Build:** nothing new. Run the headless sim 20 times with varied starts and seeds.

**Designer looks for:**
- States that always win or always die
- Resources whose constraint never binds
- Bands nobody ever enters
- Prices that never move

All fixes in this phase happen in the tuning file. If a fix requires a code change, that is a design bug and goes back to the designer, not a tuning task.

---

## 9. Open questions for the designer

These are not blockers for Phase 0 or Phase 1, but they need answers before the phase noted.

| # | Question | Needed by |
|---|---|---|
| 1 | What is "population" and where does it come from? Is it fixed, or does it grow/migrate? | Phase 1 |
| 2 | What is "economy size" for the debt ceiling formula? | Phase 1 |
| 3 | What determines a state's PowerWeight for recognition? | Phase 5 |
| 4 | Does the player start recognised, or is establishing recognition part of the opening? | Phase 5 |
| 5 | Which map regions have ports, and does the Great Lakes / Seaway route require Canadian transit? (Duluth's resource is being changed to Logistics — confirm it needs Canadian port transit to reach the World Market.) | Phase 4 |
| 6 | Can Canada or Mexico be conquered, or are they fixed external actors? | Phase 5 |
| 7 | How do factions (farm, industrial) currently work, and what does their approval feed into? | Phase 1 |
| 8 | Are infrastructure upgrades a build queue, a money spend, or something else? | Phase 7 |

---

## 10. Changes from the earlier design notes

For anyone who read the original notes, these are deliberate reversals. Do not implement the original version.

| Original | Now |
|---|---|
| "Trade" as a consumable resource | **Logistics**, a throughput capacity |
| Food surplus causes obesity / health penalty | Food glut above storage causes **farm price collapse and farm faction anger**. No health effect. |
| Food-deficit neighbours raise tension because you won't trade | **Hunger generates claims**, suppressed by actually selling to them |
| Three factors for deal acceptance | **Five**, with alternatives weighted highest |
| Recognition at 50% as an on/off gate | **Power-weighted ramp** with a gray-market floor |
| Finance: low limits debt / high enables debt | **Debt ceiling + interest rate**, plus **lending to other states** |
| IT as a general positive buff | **Intel accuracy, tax leakage, military tech tier** |
| Per-resource bespoke penalty structures | **One band model** for all six |
