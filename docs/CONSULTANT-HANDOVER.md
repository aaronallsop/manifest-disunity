# Handover for the consultant who wrote the economy brief

**Date:** 4 September 2026
**Subject:** *Manifest Disunity* — state of the codebase against `docs/spec/economy-system-spec.md`
**Purpose:** You wrote the economy and trade specification. This document reports what the game
actually contains today, so you can revise the brief against reality rather than against assumption.
Development is paused pending your response.

Nothing in the brief has been implemented. Phase 0 has not started. What follows is (1) work done
before the brief arrived, (2) an audit of the existing game against your specification, and (3) the
decisions and questions outstanding.

---

## 1. What was implemented (before the brief, and unrelated to it)

### 1.1 Complexity mode — a switch that strips the game back

The owner's playtests found the full game legible to its author and opaque to everyone else, so the
board can now be reduced to the economy alone. Two independent boolean flags, both default true, so
the full game is byte-for-byte unchanged:

- `movements` — separatist movements, sentiment, secession, migration
- `politics` — leaders, elections, the govern action, coalitions, recognition, pacts, authored
  events, victory checking, and the Authority / Influence / Civil Liberties displays

Economy mode sets both false, leaving unite, annex, trade, the six-sector market and the treasury.
Selected at new game or via `?complexity=economy`; persisted in the save document.

Implemented as `js/complexity.js` (a flag store) plus one-line guards at existing call sites in
`js/world.js`, `js/moves.js`, `js/ai.js`, `js/panels.js`, `js/journal.js`, `js/leaderboard.js`,
`js/menu.js`, `js/app.js`, `js/statedoc.js`. Most subsystems were already optional behind
`typeof X !== 'undefined'` guards, so most of the change is one added clause per guard.

**Not gated, deliberately:** `Relations`, `CivilWar` and `Military` are unguarded hard dependencies
of annex, unite and trade. Economy mode hides the political layer; it does not remove the risk
mathematics already inside an annexation.

**Known constraint:** the Shattered opening board is *constructed from* the separatist movement
spawn — `Scenario.apply` founds each successor nation on its movement's core Areas. Suppressing the
spawn breaks board generation. Movements are therefore still created at world creation in Economy
mode; they never grow, never secede, and are never displayed.

**Known defect, introduced by this work and not yet fixed:** Economy mode hides the recognition
panel and the recognise button while leaving the recognition-based trade block fully active. In the
exact mode intended for testing the economy, trades between mutually unrecognised states are refused
with no visible cause and no route to fix it. Logged in `docs/deferred.md`.

Verified: 846 of 846 tests green; a manual Economy playthrough exercising panels, journal,
leaderboard, and a full AI turn resolving trades and a partial annexation.

### 1.2 Project scaffolding (no gameplay effect)

- Version scheme adopted and documented (`docs/VERSIONING.md`); `v0.1` tagged at the prototype the
  playtesters hold, `v0.2` at Complexity mode.
- Control Board published — a status and decision page for the owner. **It is a published web page
  and cannot reach a running game.** See §4.
- Standard project layout adopted; the brief filed as the authoritative spec.
- **Regression fixed:** the Complexity work added `js/complexity.js` to `index.html` and
  `tests/run.html` but not to `dev.html`, so the tuning dashboard threw `Complexity is not defined`
  on every run for most of a day. One line, now corrected, **not yet verified in a browser.**

---

## 2. Audit of the existing game against your brief

Thirteen agents: six auditing independent areas of Phase 0, six adversarially attempting to refute
every claim that something already existed, one synthesising. What follows survived refutation.

### 2.1 What genuinely exists and is reusable

| Capability | State |
|---|---|
| **Seeded determinism** | Real and tested. Every draw comes from a named stream off one seed; seed is settable in the live game and headless runner, persisted in saves. The brief depends on this and it is the single most valuable existing asset. |
| **Named tuning constants** | ~335 constants, each with a label, group, one-line description and slider min/max/step, in one schema with an authored override file. A slider dashboard builds itself from the schema. |
| **A "show your work" record** | `Power.build()` returns `{value, raw, base, inputs[{label, raw, norm, weight, contribution, key}], summary}` — a number decomposed into named weighted contributions, each naming the tunable that moves it. **This is structurally what your §2.3 debug overlay asks for.** It exists only for the political stocks, not for the economy. |
| **A headless runner of the real game** | `Sim.run({seed, turns, ...})` boots the actual engine with no rendering. Not a reimplementation. |
| **Real per-county wealth data** | Genuine 2024 Bureau of Economic Analysis county GDP, recomputed live as territory changes. |
| **World turn counter** | One authoritative counter, survives save/load. |
| **Recognition as a power-weighted model** | Already weighted by size and wealth rather than a head count, with a sliding export penalty. |
| **Ownership history** | Per-turn record of who held what, with a scrub-back timeline. |

### 2.2 Conflicts — where the brief cannot be added to what exists

These are the expensive findings. In each case something must be replaced, not extended.

**1. A turn is currently a quarter, not a month.** "Quarter" is written into dozens of tunable
descriptions, into the recorded reasoning beside every number that has been tuned, and into two
player-facing strings. Declaring a turn a month makes every duration and growth rate wrong by a
factor of three and invalidates the written justification beside each. The owner has ruled for a
month; the re-derivation is unbudgeted.

**2. No state can ever be short of anything.** Demand is currently defined as a fixed share of each
state's *own* output, and the shares sum to one — so every state's surpluses and deficits cancel
exactly, always, by construction. What the game calls a "deficit" is a statement about industry mix,
not about sufficiency. Your §3.3 derived demand (population, army, upkeep, debt) is a **replacement**
of this model, and it invalidates the existing trade screens, the trade tests, and the meaning of the
surplus figures players see today. There is no additive path.

**3. Trade moves money, never goods.** On a completed trade both treasuries increase and nothing else
changes: no quantity moves between states, no supply figure changes. **Your headline demonstration —
cut a rival's raw materials and watch his manufacturing degrade — has no channel to travel down.**
Delivering it requires rebuilding trade as a transfer of quantities, not an extension of what exists.

**4. Industrial character is frozen at world creation.** The county wealth data is real, but its
split into six industries is not measured — it is one of six hand-authored templates assigned by a
rule of thumb, with roughly half the map sharing one template. That split never changes: no war,
investment or trade can move a region from farming to manufacturing; all six figures rise and fall
together with wealth. **The honest count of resources with real data underneath them is one of six,
not six of six.** Your §3.2 consequences and the demonstration in (3) both assume this can move.

**5. Price is one global number per resource.** Every state sees an identical price. Your §4.1 price
is specific to buyer, seller, route and duration with visible multipliers — a different system, not a
partial version of this one. Relatedly, trade today is a single click with a cooldown, not a standing
agreement, so your 6/12/24/60-turn durations, expiry warnings and renegotiation prompts have nothing
to attach to.

**6. Unrecognised states are hard-blocked from trade — which your §5.4 explicitly forbids.** Today no
deal is possible at all between mutually unrecognised states. Your grey market with no cut-off exists
precisely to prevent the death spiral this creates.

**7. Logistics is the wrong kind of object.** It is currently produced and consumed as a commodity.
Your §3.2 makes it a throughput capacity. Removing it from the consumption mix breaks the
sum-to-one invariant the current price index depends on, and an existing test with it.

**8. One demand input carries no information.** Your `manufacturingDemand` includes `armySize × 1.5`.
Army size here is a fixed small percentage of population and is not a player choice, so the term adds
nothing population is not already contributing. Either force size becomes a decision, or drop the term.

### 2.3 Phase 0 instrument gaps

- **No calendar.** A bare integer; no month, no date, anywhere.
- **Tuning edits are silently discarded** when a game is in progress — loading a save replaces the
  whole tuning set first. The dashboard also displays schema defaults rather than live values, and
  its export copies text to the clipboard for manual pasting. Your §2.2 acceptance test ("change a
  number, reload, see the effect") currently fails on the common path, silently.
- **No spreadsheet export anywhere.** The headless runner deliberately records one summary row per
  turn across all states; your §2.4 wants one row per state per turn. Most of the requested columns
  (unrest, debt, per-neighbour opinion, active deal count) do not exist as values.
- **Determinism is proven at 10 turns with a rounded comparison**, not 100 turns byte-identical.
  **No one has ever measured a 100-turn run.** The speed figures in the project's own documents are
  stale, mutually contradictory, and predate a change that made each turn substantially more
  expensive. Both of your §2.4 criteria are currently unmeasured.
- **Stepping is unsafe.** A single-step control exists behind a dev flag but drives the engine out of
  sequence and permanently desynchronises the two on-screen counters. There is no fast-forward.
  Running the headless simulator destroys the live game state.
- **No forcing controls exist** — no way to set a state's supply, set recognition, force a conquest,
  or force a treaty revocation. Forcing supply is not a simple override: output is recomputed from
  wealth every turn, so it needs a persistence layer to survive.

---

## 3. Decisions the owner has already made

| Decision | Ruling |
|---|---|
| Turn length | **One month.** Game opens **1 March 2036**, the eve of 200 years since Texas declared independence. See conflict (1) — cost was priced after the ruling and is now back with him. |
| Tuning files | **One file.** Economy constants join the existing 335, not a second file. |
| Control Board scope | **It does not drive the game.** See §4. |
| Farm / industrial factions | Open. See §5. |

---

## 4. A correction to the brief's Phase 0

Your §8 lists Control Board capabilities: step turns, fast-forward, edit tuning, force a state's
supply, force diplomatic states, run the simulation, seed control.

**The Control Board is a published status page hosted remotely.** The game runs locally in the
owner's browser. They are separate documents with no channel between them; the board cannot read or
alter a running game, by construction.

The owner has ruled that this was a misunderstanding in the brief: the Control Board is where he
reads progress and answers decisions. **Every testing control belongs in the game's own developer
dashboard**, which already exists, already holds the tuning sliders, and already has a step control.
Please revise §8 accordingly.

---

## 5. Open questions

Your §9 listed eight. Current status:

| # | Question | Status |
|---|---|---|
| 1 | What is population; fixed or does it grow/migrate? | **Answered from existing documentation.** Real 2024 Census county estimates. It grows (new residents arrive 35% in the owner nation's political mix, 65% in the Area's own) and it migrates along the adjacency graph, pulled by quality of life, civil liberties and political alignment, braked by output-per-head and crowding. Stored as six political buckets per Area; "population" is their sum. |
| 2 | What is "economy size" for the debt ceiling? | **Answered.** Real 2024 BEA county GDP, already computed per nation, growing at a base rate scaled by sector mix. |
| 7 | How do farm and industrial factions work? | **They do not exist.** No farm faction, no industrial faction, no faction approval of any kind. "Faction" is already taken in this codebase — it means a playable nation rated by difficulty. Your food-glut and manufacturing-glut consequences have nothing to land on. |
| 3, 4, 6 | PowerWeight, starting recognition, conquerable Canada/Mexico | Open, needed by Phase 5. |
| 5 | Ports and the Great Lakes / Seaway route | Open, needed by Phase 4. |
| 8 | Infrastructure upgrades — queue, spend, or other | Open, needed by Phase 7. |

### New questions the audit raises

1. Should a region's industrial character be changeable by play, or is geography destiny? Conflict
   (4). Your central demonstration requires it to move; today it cannot.
2. Is "cut a rival's raw materials and his factories degrade" the demonstration to build around? It
   is the single most expensive commitment in the brief — see conflict (3).
3. How honest must the underlying figures be? Wealth is real per county; the industry split is
   invented from six templates. Fix, relabel, or accept?
4. Given conflict (1), is a month worth a full re-tuning pass, or should the brief say quarter?

---

## 6. What has not been done

No phase of the brief has been started. No economy code has been written. The band model, derived
demand, ratios, price formation, trade deals, transit, routing, recognition ramp, embargo, lending,
claim pressure and treaty succession do not exist in any form.

---

## 7. What would be most useful back

1. A ruling on conflicts (2), (3) and (4) — they determine whether this is an extension of the
   existing economy or a replacement of it, and that changes the shape of every phase after.
2. A revised §8 Phase 0 that does not assume the Control Board can drive the game.
3. A view on whether the month is worth its re-tuning cost.
4. Whether the brief's §2.4 CSV columns should be reduced to values that exist, or whether the
   values themselves are being requested as part of Phase 1.
