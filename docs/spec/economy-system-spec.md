# Economy & Trade System — Implementation Spec v2

**Supersedes:** v1 (4 September 2026). Discard v1 — it is preserved in git history only. Several of
its phases asked for work that already exists, and several of its assumptions were refuted by the
4 September audit.

**Status:** Authoritative. Development may resume.
**Basis:** Revised against the codebase audit of 4 September 2026 and against `DESIGN.md`.

---

## 0. What changed from v1, and why

v1 was written without reading `DESIGN.md` or the codebase. The audit found eight conflicts and a set
of instrument gaps. This version rules on all of them.

| v1 said | v2 says | Reason |
|---|---|---|
| A turn is one month | **A turn stays a quarter** | The re-derivation cost buys flavour only. See 1.1. |
| Control Board runs the tests | **All testing controls live in `dev.html`** | The Control Board is a published status page and cannot reach a running game. |
| Logistics becomes a different kind of object | **Logistics stays a sector; its ratio governs throughput** | Preserves the sum-to-one price invariant and its test. Cheaper and no less expressive. |
| Price formula replaces the price index | **The existing index becomes the base price; multipliers layer on top** | Additive, not a replacement. The index is built and tested. |
| Food/manufacturing glut angers factions | **Glut hits treasury income and Area grievance** | No faction system exists and none is being built. |
| `manufacturingDemand` includes `armySize × 1.5` | **Term dropped** | Army size is derived from population and carries no independent signal. |
| Build a gray market | **Fix the existing block to the haircut `DESIGN.md` already describes** | §6.5 of `DESIGN.md` specifies a smuggler's rate; the code hard-blocks. The document is right and the code is the bug. |
| Debug overlay is new work | **Extend the existing `Power.build()` Why record to the economy** | The pattern exists and is good. Reuse it. |

Three things v1 got right and this version keeps: derived demand, goods actually moving, and the band
model.

---

## 1. Owner rulings

### 1.1 Turn length — recommend reverting to the quarter

The earlier ruling was one month, and the audit then priced it: every tuned rate's written
justification says "per quarter," and re-deriving them is unbudgeted.

**Recommendation: keep the quarter.** Nothing mechanical is at stake. Every rate in the engine is per
*turn*; the label only changes what the calendar prints. The flavour that motivated the month
survives intact:

- Open on **1 March 2036**, the eve of two hundred years since Texas declared independence.
- Advance one quarter per turn. The anniversary still lands on turn 1.
- Deal durations become **2 / 4 / 8 / 20 turns** (six months, one year, two years, five years).

What the month would buy is a calendar that ticks in months. What it costs is a full re-derivation
pass. That budget should go to section 2, which is where the game is.

**This reverses a prior ruling and is the owner's to confirm.** If the month is wanted for reasons
beyond the calendar, say so and it gets built — but it should be a deliberate purchase, not a default.

### 1.2 Conflict (2) — demand is a fixed share of own output

**Ruling: replace.** This is the single most important finding in the audit and it is worth saying
plainly: as built, no state can ever be short of anything, because every state's demand is defined as
a share of what that state already produces. The "deficits" on the trade screen are statements about
industry mix, not about sufficiency. A game about states that cannot feed themselves currently
contains no mechanism by which a state can fail to feed itself.

There is no additive path. Derived demand (section 3.4) replaces it. The existing trade screens,
trade tests and surplus figures are invalidated and get rebuilt.

### 1.3 Conflict (3) — trade moves money, never goods

**Ruling: replace.** Trade becomes a transfer of quantities. Money still moves; goods move too, and
the buyer's supply figure rises.

This is the expensive commitment and it is the correct one. Without it, every downstream system in
this spec is decoration: transit tolls price nothing real, band effects can't propagate across a
border, and a trade network map would draw lines that carry nothing.

### 1.4 Conflict (4) — industry mix is frozen and mostly invented

This splits into two questions the audit ran together. They have different answers.

**(a) Does the demonstration require mutable industry mix? No.** The audit assumed it did. It doesn't,
and this saves a great deal of work.

Separate **capacity** from **output**:

- A region's industry mix is its productive **capacity**. Geography, and mostly fixed.
- Actual **output** is capacity × utilisation, where utilisation is gated by input availability.

Cut a state's Resource Extraction supply and its Manufacturing *output* falls the same turn, because
the factories are idle, not because the region stopped being industrial. That is both the correct
real-world model and the cheaper one. **Industry mix stays frozen for now.** Mutable mix is deferred
to a post-launch phase and is not in this roadmap.

**(b) Is the invented industry split acceptable? No — and it violates the project's own rule.**

`DESIGN.md` opens with a stated principle: nothing is invented where real data exists, and grounded
estimates are apportioned from real totals and flagged **est.** in the UI. Six hand-authored
templates with roughly half the map sharing one is not a grounded estimate; it is a guess wearing the
authority of the real GDP figure it is attached to. It is also the substrate every number in this
spec sits on.

**Ruling: re-bake the industry split from real data before Phase 1.**

BEA publishes county-level GDP by industry (the CAGDP2 series) at NAICS sector granularity. Mapping
those NAICS sectors onto the game's six is a build-script job in exactly the tradition of the existing
`build_*.py` scripts. **Engineering to verify coverage and suppression rates before committing** —
BEA suppresses some county-industry cells for disclosure reasons, and where a cell is suppressed the
existing apportion-from-a-real-total-and-flag-it convention applies.

If coverage turns out to be too poor to use, the fallback is to keep the templates and **label them
honestly in the UI as estimates**. What is not acceptable is leaving invented figures presented as
measured ones.

This is scheduled as **Phase 0.5** and it moves before Phase 1, because Phase 1's whole acceptance
test is a prediction about which states are short of what.

### 1.5 Conflict (5) — one global price

**Ruling: layer, don't replace.** The existing index (`100 × (demand share ÷ supply share)^1.3`)
becomes the **base price** for a resource. The deal-specific multipliers in section 4.1 apply on top
of it for a specific buyer, seller, route and duration. The index is built, tested and reports
something true; it just isn't a *deal* price.

### 1.6 Conflict (6) — unrecognised states hard-blocked from trade

**Ruling: fix to a haircut.** `DESIGN.md` §6.5 already specifies this: a smuggler's rate on the world
market, deliberately a haircut rather than a lock, "because refusing external trade outright would
make an unrecognised landlocked state unplayable."

The code hard-blocks. `DESIGN.md` states its own convention for this case: *if this document and the
code disagree, the document is a bug — say so and fix it.* Here the document is right and the code is
wrong, so the code changes and the document stands.

This also resolves the Economy-mode defect logged in `deferred.md`. It is scheduled in Phase 0 because
it currently makes the mode built for economy testing untestable.

### 1.7 Conflict (7) — Logistics as a commodity

**Ruling: Logistics stays a sector.** It is produced and consumed like the other five, the sum-to-one
invariant holds, and the existing test stands.

What changes is only what its *band* does. Logistics demand is the total volume moved (internal
distribution plus every import and export leg), and its ratio governs transit losses and route
reliability. It fits the uniform band model with no special-casing. v1's "different kind of object"
framing is withdrawn.

### 1.8 Conflict (8) — `armySize` in manufacturing demand

**Ruling: drop the term.** Reinstate only if force size ever becomes a player decision.

### 1.9 Factions

**Ruling: no faction system.** "Faction" already means a playable nation in this codebase and the term
is not being overloaded.

Glut consequences land on things that exist:

- **Treasury** — sector income collapses (this is the real agricultural glut mechanism)
- **Area grievance** — raise `attrs.sentBoost` in the affected Areas, which is the existing authored-
  grievance channel and already feeds sentiment

In Economy mode the second has nothing to feed, so glut is a treasury effect only there. That is
acceptable and should be stated in the UI.

### 1.10 CSV columns

**Ruling: request only values that exist or that a phase creates.** v1 asked for unrest, per-neighbour
opinion and debt as Phase 0 columns; none exist. Revised list in section 2.4, with the phase each
column arrives in.

---

## 2. Phase 0 — Instruments (revised)

All testing controls belong in **`dev.html`**, the existing developer dashboard. The Control Board is
the owner's status and decision page and is not part of the test loop.

### 2.1 Unblock Economy mode

Fix the recognition trade block per ruling 1.6. Until this is done, the mode built for testing the
economy cannot test the economy.

### 2.2 Calendar

Turn integer maps to a quarter and a year. Opens Q1 2036, displayed as a date. Surfaced in the game UI
and in every export.

### 2.3 Tuning that survives a load

Three defects, all on the common path:

- Loading a save replaces the whole tuning set, silently discarding live edits
- The dashboard displays schema defaults rather than live values
- Export copies to clipboard for manual pasting

Target behaviour: change a value, reload, observe the effect, with no rebuild and nothing silently
lost. Write to `content/tunables.json` directly.

Economy constants join the existing ~335 in the one schema. No second file.

### 2.4 Per-state CSV export

One row per nation per turn.

| Column | Arrives |
|---|---|
| turn, date, nation, population, GDP, treasury | Phase 0 |
| per-sector output (6) | Phase 0 |
| per-sector demand, ratio, band (18) | Phase 1 |
| per-sector delivered imports and exports (12) | Phase 2 |
| active deal count, active transit agreement count | Phase 3 |
| logistics utilisation, route failure count | Phase 4 |
| recognition score | Phase 5 |

### 2.5 Measure what has never been measured

- Determinism: **100 turns, byte-identical**, twice, same seed. Currently proven at 10 turns with a
  rounded comparison.
- Performance: one honest current figure for a 100-turn headless run. The figures in the project's
  documents are stale and mutually contradictory. Replace them and delete the old ones.

If 100 turns is too slow to be usable, say so now rather than in Phase 8.

### 2.6 Safe stepping

- Single-step must not desynchronise the counters
- Fast-forward N turns
- Running the headless simulator must not destroy live game state

### 2.7 Forcing controls (in `dev.html`)

- Set a state's sector output, **persisting across recomputation** (the audit is right that this needs
  a persistence layer, since output is recomputed from wealth every turn)
- Set recognition
- Force a conquest
- Force a treaty revocation (from Phase 3, when treaties exist)

### 2.8 Extend the Why record to the economy

`Power.build()` already returns a number decomposed into named weighted contributions, each naming the
tunable that moves it. Reuse that structure for every economic figure: supply, demand, ratio, price,
delivered cost.

This is the debug overlay. It does not need inventing.

**Checkpoint 0 — owner verifies in `dev.html`:** Economy mode trades without an invisible recognition
block; the date displays and advances by quarter; a tuning edit survives a save/load and a reload; the
per-state CSV exports; 100-turn determinism and one honest speed figure are recorded; step and
fast-forward are safe; forcing a state's output persists; any economic number expands into its
contributions.

### 2.9 Phase 0.5 — Industry data

Per ruling 1.4(b). Re-bake the six-sector split from BEA county-industry data if coverage permits;
otherwise label the templates as estimates in the UI.

**Checkpoint 0.5 — owner verifies:** either every county's split traces to a real figure or an
apportioned one flagged **est.**, or the templates are visibly labelled as estimates everywhere they
appear. `build/validate.py` passes. The owner spot-checks five counties he knows.

---

## 3. The resource model

### 3.1 Bands

`ratio = supply / demand`, evaluated end of turn. Band transitions fire an event the journal can print.

| Band | Ratio |
|---|---|
| Crisis | < 0.50 |
| Deficit | 0.50 – 0.89 |
| Met | 0.90 – 1.10 |
| Surplus | 1.11 – 1.50 |
| Glut | > 1.50 |

### 3.2 Capacity and output

Per ruling 1.4(a):

```
output = capacity × utilisation
```

Capacity comes from the baked industry split and scales with GDP. Utilisation is gated by input
availability — principally Resource Extraction gating Manufacturing. This is the channel the
supply-cut demonstration travels down.

### 3.3 The six sectors

#### Agriculture (Food)

| Band | Effect |
|---|---|
| Crisis | Quality of Life −30, Area grievance +5/turn, army readiness −20 |
| Deficit | QoL −10, Area grievance +2/turn |
| Met | — |
| Surplus | QoL +3, exportable volume |
| Glut | See below |

**Storage.** Food has a silo capacity expressed in turns of national consumption. Base 4 turns (one
year). Surplus fills storage with no penalty; only volume above capacity triggers glut.

**Glut:** agricultural income −50%; `attrs.sentBoost` raised in agricultural Areas.

No health effect. v1's obesity idea is withdrawn.

#### Resource Extraction

| Band | Effect |
|---|---|
| Crisis | Manufacturing utilisation capped at 40%; admin costs +25%; QoL −10 |
| Deficit | Manufacturing utilisation capped at the extraction ratio; productivity −10% |
| Met | — |
| Surplus | Canada/Mexico trade willingness up; world market demand available |
| Glut | Extraction income −40% |

#### Manufacturing

| Band | Effect |
|---|---|
| Crisis | Military equipment −50%; infrastructure repair halted; QoL −15 |
| Deficit | Military equipment −20%; QoL −5 |
| Met | — |
| Surplus | Consumer goods income at **60% of export value** (exporting must always beat domestic consumption) |
| Glut | Idle capacity; `attrs.sentBoost` raised in industrial Areas |

#### Logistics (Trade & Transportation)

Demand = total volume moved, internal plus every trade leg.

| Band | Effect |
|---|---|
| Crisis | Route failures 10%/turn per route; transit losses 20% |
| Deficit | Transit losses 10%; toll costs +15% |
| Met | Transit losses 3% |
| Surplus | Transit losses 1%; eligible to host broker routes |
| Glut | As Surplus, plus opinion bonus from states routing through you |

#### Finance

- **Debt ceiling** = `GDP × (0.4 + 0.6 × financeRatio)`
- **Interest rate** = `baseRate − (financeRatio − 1.0) × 0.03`, floored at 1%

| Band | Effect |
|---|---|
| Crisis | Cannot service debt; default risk 15%/turn; credit frozen |
| Deficit | Rate penalty; ceiling reduced |
| Met | — |
| Surplus | May lend to other states (section 5.6) |
| Glut | Lending capacity up; small opinion bonus with debtors |

#### Information Technology

| Band | Intel error on others' figures | Tax leakage | Military tech tier |
|---|---|---|---|
| Crisis | ±40% | 25% | 1 |
| Deficit | ±25% | 18% | 2 |
| Met | ±15% | 10% | 3 |
| Surplus | ±7% | 5% | 4 |
| Glut | ±3% | 2% | 5, +opinion |

**Intel error** perturbs the displayed value when inspecting another state's figures. Low-IT states
negotiate partly blind, and that is the reason to invest in IT.

### 3.4 Derived demand

Replaces share-of-own-output entirely.

```
foodDemand          = population × 1.0 × (1 + qolModifier × 0.1)
extractionDemand    = manufacturingCapacity × 0.6 + population × 0.1
manufacturingDemand = population × 0.3 + infrastructureUpkeep
logisticsDemand     = totalVolumeMoved
financeDemand       = debtService + governmentExpenditure
itDemand            = (population + manufacturingCapacity) × 0.05
```

All coefficients live in the tuning schema.

### 3.5 Internal distribution

Resources pool nationally. No intra-national supply chain. Internal distribution appears only as a
Logistics load.

---

## 4. Price formation

### 4.1 Base price and multipliers

The existing global index is the **base price**. Deal price layers on top:

```
DealPrice = BasePrice × ScarcityMult × AlternativesMult × RelationsMult × RiskMult × DurationMult
```

| Term | Formula |
|---|---|
| ScarcityMult | `clamp(1 + 1.2 × (1 − buyerRatio), 0.6, 2.5)` |
| AlternativesMult | `1 + 0.5 × (1 − min(buyerSupplierCount, 3) / 3)` |
| RelationsMult | `1 − (opinion / 100) × 0.2` |
| RiskMult | `1 + 0.08 × transitHops + 0.15 if any hop is hostile` |
| DurationMult | 2t ×1.00, 4t ×0.97, 8t ×0.93, 20t ×0.88 |

**AlternativesMult is the most important term.** It is what makes cutting a rival's other supplier a
strategic act rather than a flavour event. Do not simplify it away.

**Duration inversion:** when the seller's own ratio has fallen for three consecutive turns, the AI
inverts the duration discount into a premium of equal magnitude. A seller gaining leverage should not
lock in a cheap long deal.

Every price expands into its multipliers in a tooltip, using the Why record from 2.8.

### 4.2 Compounding tolls

```
DeliveredCost = DealPrice × Π(1 + tollRate_i)
```

Toll multipliers by mode: **Highway ×1.0, Rail ×1.6, Port ×2.5.**

Compounding is deliberate. It makes long broker chains bleed value and prevents infinite arbitrage.

### 4.3 World Market

- Reachable only through port access: own port, port transit rights, or a Canada/Mexico corridor
- A price-taker with **slow-moving prices**, not an infinite sink
- Shipping capacity cap per state per turn
- Existing external-trade rate (45% of bilateral) folds into this as the baseline haircut

---

## 5. Trade and diplomacy

### 5.1 Trade Deal

| Field | Notes |
|---|---|
| Parties, resource, volume/turn | |
| Price | Per unit, delivered |
| Duration | 2 / 4 / 8 / 20 turns |
| Route | Ordered transit hops |
| Auto-renew | Negotiable |

**Goods move.** On execution the seller's available supply falls and the buyer's rises, both
treasuries settle, and Logistics load rises on every state on the route.

Expiry produces a renegotiation prompt, with countdowns at 4, 2 and 1 turns.

### 5.2 Trade becomes a Move

`DESIGN.md` §12 already names this: trade lives in `js/actions.js` rather than going through
`Moves.plan`/`resolve`, so the AI never trades. Fifty nations that never trade cannot test a trade
economy.

Trade joins the standard `plan`/`resolve` path with an AI scorer. Scheduled in Phase 3.

### 5.3 Transit Agreement

Separate instrument from a trade deal. A state can permit highway transit while refusing port access.

| Field | Notes |
|---|---|
| Grantor, grantee, mode | Highway / Rail / Port |
| Volume cap | Per turn |
| Rate | The toll |
| Duration, notice period | Turns between a revocation order and effect |

**Revocation is a player action** with a reputation cost. The threat of closure is the point of being
a corridor state.

The existing transit system already routes over baked rail and interstate corridors and already has a
neighbour that weighs an offer and can counter or decline. What is new is the **mode distinction** and
the standing agreement.

### 5.4 Acceptance factors

In rough order of weight: **alternatives**, demand band, relations and recognition, relative power,
route risk. Counter-offers may modify duration as well as price and volume.

### 5.5 Recognition ramp

Recognition is already power-weighted. What changes is the trade consequence.

| Score | Access |
|---|---|
| < 0.15 | Smuggler's rate: ×2.0 markup, 30% volume cap, 10%/turn seizure risk |
| 0.15 – 0.50 | ×1.4 markup, 60% volume cap |
| > 0.50 | Full |

Never a hard cut-off, per ruling 1.6.

**Border-state suspicion:** Canada and Mexico apply an additional −0.15 to states directly bordering
them, decaying over 24 turns from the breakaway. Any bordering state may negotiate transit *through*
them under the same mode tiers.

### 5.6 Additional instruments

- **Embargo** — unilateral suspension, reputation cost, cost to your own economy
- **Lending** — the primary use for surplus Finance; debtors take opinion and leverage penalties
- **Corridor closure** — see 5.3

### 5.7 Hunger generates claims

A state in Food Deficit or Crisis accrues ClaimPressure toward each adjacent state in Surplus or Glut:
**+2/turn** (Deficit), **+5/turn** (Crisis). Suppressed to zero while an active food deal covers ≥50%
of the shortfall at ≤1.3× base price. At 50, a casus belli unlocks.

Selling food to a hungry neighbour becomes a security policy; starving one becomes a deliberate risk.

### 5.8 Treaty succession

On absorption, treaties enter **Limbo for 6 turns** at 50% volume. The successor ratifies (free) or
voids (−10 opinion) each individually. Unratified at turn 6 voids automatically.

Not blanket void-on-conquest: one conquest cascading into continental collapse is too swingy and
deletes the decision.

---

## 6. Feedback

### 6.1 Trade Network map mode

Ships with the routing engine, not after it. Shows partners, hops rendered distinctly by mode, and
**broken links with their reason** (expired, revoked, conquered, over-capacity), each click-through
opening negotiation with whoever now controls the hop.

### 6.2 Deal ledger

Active deals with expiry countdowns; active transit agreements with utilisation and notice periods;
open offers with their own expiry. Cap incoming AI offers at 3/turn.

### 6.3 Tooltips

Every price and every band effect expands into the Why record that produced it.

---

## 7. Roadmap

Each phase ends at an **owner checkpoint**, verified in `dev.html` or in a normal play session.
Written approval before the next phase starts.

| Phase | Contents |
|---|---|
| **0** | Instruments (section 2) |
| **0.5** | Industry data honesty (section 2.9) |
| **1** | Derived demand, bands, capacity/utilisation. Autarky. |
| **2** | Goods move. Trade transfers quantities. |
| **3** | Deals with duration; trade becomes a Move; deal ledger |
| **4** | Transit modes, routing, compounding tolls, network map |
| **5** | Recognition ramp, Canada/Mexico corridors |
| **6** | Embargo, lending, hunger claims |
| **7** | Treaty succession, infrastructure damage |
| **8** | Tuning |

### Phase 1 — Autarky

Replace share-of-own-output demand with 3.4. Bands, capacity/utilisation. **No trade changes.**

*Owner writes predictions before build starts:* which five nations are self-sufficient, which five are
structurally short, and of what. This is a comprehension check on the owner, not a lookup task for
engineering.

**Checkpoint 1:** 60-turn run, trade disabled — every nation reaches stable or slowly-declining
equilibrium, nothing oscillates or explodes. Predicted-short nations are in Deficit or Crisis. Forcing
a nation's Extraction to zero degrades its Manufacturing *output* within 3 turns without touching its
industry mix. Every band is reachable and observable.

*Stop condition:* the numbers stop surprising the owner. This phase produces a boring but coherent
economy. **A map where everyone is comfortable is a failed Phase 1**, even if nothing crashes.

### Phase 2 — Goods move

Trade transfers quantities. Supply figures change on both sides. Logistics load accrues.

**Checkpoint 2 — the supply-cut demonstration.** With forcing controls, sever a nation's Extraction
imports. Its Manufacturing output falls, its military equipment score falls, its QoL falls, and the
CSV shows the chain turn by turn. This is the demonstration the whole system exists to deliver; if it
isn't legible here, stop.

### Phase 3 — Deals and the AI

Duration, counter-offers including duration, ledger, expiry prompts. Trade becomes a Move with an AI
scorer.

*Owner writes predictions:* the price of a given deal from a strong seller to a desperate buyer, and
the reverse.

**Checkpoint 3:** a 4-turn deal expires and prompts renegotiation with countdowns at 4/2/1. A buyer
with no alternative pays visibly more than one with three. Duration inversion fires and is visible.
**AI nations trade with each other unprompted** — verify in a 60-turn headless run that inter-AI deal
count is non-zero and stable. Offers are capped and expire.

### Phase 4 — Transit and the network map

**Checkpoint 4 — three named scenarios.** *Nevada:* trades to Oregon by highway and rail through
California, and cannot reach the World Market for want of port rights, with the port refusal legible
on the map. *Wisconsin:* the long toll rail corridor west is marginal, not free money, with the
compounding tolls readable in the tooltip. *Broker chain:* a deliberately constructed five-hop resale
chain is unprofitable.

*Stop condition:* the owner can explain any nation's economy from the map alone, without the overlay.

### Phase 5 — Recognition and foreign corridors

**Checkpoint 5:** force a mid-game breakaway — the new nation survives on the smuggler's rate and is
not dead on arrival. Recognition rising improves terms smoothly with no step change. A
Mexico-bordering nation faces stiffer terms than an interior one at equal recognition. A New York →
Washington route through Canada works and prices by the same mode tiers.

### Phase 6 — Diplomatic teeth

**Checkpoint 6:** corridor closure elapses its notice period, lands its reputation cost, and shows on
the map with the correct reason. Starving a neighbour accrues ClaimPressure at spec; selling them food
stops it immediately; 50 unlocks a casus belli. A loan is extended, serviced and defaulted, with
correct opinion at each step.

### Phase 7 — Succession and shocks

**Checkpoint 7 — the Deseret scenario.** Deseret absorbs Utah. Treaties enter Limbo, volume drops to
50%, the network map shows the break, each treaty can be ratified or voided individually with correct
opinion consequences, and anything unratified voids at turn 6.

### Phase 8 — Tuning

No new code. Twenty headless runs, varied seeds. Look for nations that always win or always die,
resources whose constraint never binds, bands nobody enters, prices that never move. All fixes in the
tuning file. A fix requiring code is a design bug and returns to the owner.

---

## 8. Balance risks

| Risk | Mitigation |
|---|---|
| Brokers arbitraging to dominance | Compounding tolls (4.2), volume caps (5.3) |
| World Market as dominant strategy | Slow prices + shipping cap (4.3) |
| Unrecognised death spiral | Smuggler's rate floor (5.5) |
| Conquest cascading into collapse | Treaty Limbo (5.8) |
| Domestic consumption beating export | Surplus manufacturing at 60% (3.3) |
| Everyone comfortable, no trade game | Phase 1 stop condition |

---

## 9. Open questions

Answered by the audit and closed: population, economy size, factions.

| # | Question | Needed by |
|---|---|---|
| 1 | Confirm or overturn the quarter (ruling 1.1) | Phase 0 |
| 2 | BEA county-industry coverage — usable, or fall back to labelled estimates? | Phase 0.5 |
| 3 | What determines PowerWeight for recognition? | Phase 5 |
| 4 | Does the player start recognised, or is earning it part of the opening? | Phase 5 |
| 5 | Ports, and does the Great Lakes / Seaway route require Canadian transit? | Phase 4 |
| 6 | Can Canada or Mexico be conquered, or are they fixed actors? | Phase 5 |
| 7 | Infrastructure upgrades — queue, spend, or other? | Phase 7 |
| 8 | Does Economy mode need its own reduced victory condition, or is it a sandbox? | Phase 3 |

Question 8 is new. Economy mode currently strips victory checking with the politics flag, which leaves
the mode with no ending.

---

## 10. Note on the audit

The thirteen-agent audit with adversarial refutation was the right instrument and it found the thing
that mattered. Conflict (2) — that demand is a share of own output and therefore nothing can ever be
short — would have been discovered in Phase 4 or later, on top of three phases of work built over it.
Finding it before Phase 0 started is worth more than everything else in this document.

The same method should run again before Phase 4, which is the next phase large enough to hide a
structural assumption.
