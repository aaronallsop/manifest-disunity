# Spec v2 — Addendum A (revised): The Alpha Track

**Date:** 5 September 2026
**Amends:** `economy-system-spec.md` §7 (roadmap). Sections 1–6 stand as the design; what changes is
the order they are built in and what is deferred past alpha.
**Status:** Authoritative, with Aaron's rulings of 5 September folded in below and marked **[Aaron]**.

---

## 1. What changed and why

The v2 roadmap built the economic model first and reached trade at Phase 4. That is the correct order
for building a simulation and the wrong order for finding out whether the game is fun.

The goal is an alpha test. The question an alpha answers is whether negotiating a deal, holding a
corridor and watching a trade network break are interesting to a person who did not write the game.
None of that requires derived demand, band effects, per-deal price formation, or real BEA industry
data. All of those make the answer better; none of them make the answer possible.

So trade moves to the front and the economic model follows it.

**The five-nation prediction exercise is struck entirely.** It does not appear anywhere in this
roadmap and no one should be waiting on it.

---

## 2. The alpha track

Five stages. The alpha test happens at the end of A4. Everything in section 4 is deferred until after it.

### A0 — Unblock

The minimum required to test trade at all. Not the full Phase 0 from v2.

- **Recognition.** *The addendum restated v2 ruling 1.6 (replace the direct-deal block with a
  haircut). That ruling misread `DESIGN.md`, which deliberately specifies both a block on direct deals
  and a haircut on the world market, and the code implemented both correctly. The actual defect —
  Economy mode charging for a political system it had switched off — is fixed (D166).*
  **[Aaron: keep the design document's block. Nothing further to build.]**
- **Calendar.** Turn maps to a quarter and a year, opening March 2036. *Done.*
- **Tuning edits survive a save/load and a reload.** *Done.*
- **Safe single-step and fast-forward in `dev.html`,** without desynchronising the counters.
  *Remaining.*

Not in A0: per-state CSV export, 100-turn determinism, performance re-measurement, forcing controls.
Those are balance instruments and balance is not what alpha is testing. They move to section 4.

### A1 — Trade deals with terms

A trade becomes a standing agreement rather than a single click with a cooldown.

- Deal object: parties, resource, volume per turn, price, duration, auto-renew
- Durations of 2 / 4 / 8 / 20 turns (six months, one year, two years, five years)
- Counter-offers may modify duration as well as price and volume
- Expiry produces a renegotiation prompt, with countdowns at 4, 2 and 1 turns
- Deal ledger: active deals with countdowns, and open offers with their own expiry

Built on the existing economy. Existing global price index, existing industry-mix surpluses,
money-only settlement. No demand model changes.

### A2 — Transit and tolls

The part that makes geography matter.

- Transit Agreement as a separate instrument from a trade deal: grantor, grantee, mode, volume cap,
  rate, duration, notice period
- Mode tiers — Highway, Rail, Port — with separate permissions. A state can grant highway transit and
  refuse port access.
- Routing through third parties, with tolls compounding multiplicatively along the route
- Canada and Mexico as corridors for any bordering state. **[Aaron: they are not actors and cannot be
  conquered. No negotiation, no revocation, no opinion. A flat placeholder toll of 10% on all trade
  routed through them — Idaho trading with Minnesota via Canada keeps 10% less of that deal's income.
  Canada does not receive it; it is a cost, not a transfer. Later, conditions such as hesitancy toward
  a recently seceded nation may be added; not now.]**
- Revocation as a player action, with a notice period and a reputation cost

The existing system already routes over the baked rail and interstate data and already has a
neighbour who weighs an offer and can counter or decline. What is new here is the mode distinction,
the standing agreement, and revocation.

**Open — ports.** The Port tier and the Great Lakes route both assume port data. The county data has
none: the code reads a `has_port` field that no county carries, so every nation currently has zero
ports. **[Aaron: checking the documentation. No code proceeds until this is cleared.]**

### A3 — The trade network map

Illegible without this, so it ships immediately after A2 and before anything else.

- Select a state, see its inbound and outbound routes
- Hops rendered distinctly by mode
- Broken links shown with their reason — expired, revoked, conquered, over-capacity
- Click a broken link to open negotiation with whoever now controls that hop

### A4 — The AI trades

*The addendum's premise here is stale. `DESIGN.md` §12 said trade lived in the UI so AI nations never
traded; M11.1 moved trade onto the standard plan/resolve path and the AI has been trading since —
verified in play on 4 September. `DESIGN.md` has been corrected.* What is genuinely new in A4:

- AI nations initiate the **new** deal and transit agreements from A1 and A2
- Incoming offers capped at 3 per turn, each with an expiry

Then the alpha test.

---

## 3. What the alpha is asking

Write these down before the test and answer them after. They are the reason the order changed.

1. Is negotiating a deal interesting, or is it a menu?
2. Does holding a corridor feel powerful? Does the threat of revocation land?
3. When a route breaks, is it clear why, and does the player know what to do about it?
4. Do deal expiries create useful pressure, or just admin?
5. Do compounding tolls make long routes feel like a real trade-off?
6. Does the world feel alive with AI nations trading, or is it noise?

**The known hollow spot:** on the existing economy there is no consequence for not trading. Nobody
starves and no factory idles. Trade will be profitable rather than necessary. That is a deliberate
trade-off for reaching alpha sooner, and it is the one thing to watch for in testing. If testers trade
anyway because the negotiation and the map are interesting, the interaction loop works and the
economy layer will only sharpen it. If they shrug and ignore trade entirely, that tells you the stakes
matter more than the mechanics — which is worth knowing before building the stakes.

---

## 4. Deferred until after alpha

Not cancelled. Not forgotten. Ordered after the alpha because none of it changes whether the game is fun.

| Item | Was | Why deferred |
|---|---|---|
| Goods actually move (quantity transfer) | Phase 2 | Adds stakes, not mechanics. First thing after alpha. |
| Derived demand and the band model | Phase 1 | The stakes layer. Expensive replacement of a working system. |
| BEA industry re-bake | Phase 0.5 | Keep the six templates for alpha. **Label them as estimates in the UI** — an afternoon, and it satisfies the project's honesty rule. *Done in A0.* |
| Agriculture tonnage conversion | new | Only matters once food sufficiency exists. |
| Per-deal price multipliers | Phase 3 | The existing global index is the base price and is enough for alpha. |
| Recognition ramp beyond the A0 fix | Phase 5 | The A0 state is all alpha needs. |
| Embargo, lending, hunger claims | Phase 6 | Depth. |
| Treaty succession, infrastructure damage | Phase 7 | Depth. |
| CSV export, 100-turn determinism, forcing controls, performance re-measurement | Phase 0 | Balance instruments. Needed before the tuning pass, not before alpha. *Note: 100-turn determinism and speed were in fact measured on 5 September (D167 and its correction) — the engine gets faster as a run lengthens, and there is no performance problem.* |
| Full tuning pass | Phase 8 | Unchanged, still last. |

Post-alpha order, subject to what the alpha finds: goods move → derived demand and bands → balance
instruments → per-deal pricing → BEA re-bake → diplomacy depth → tuning. That order can change. The
alpha exists to change it.

---

## 5. Scope discipline for the alpha track

**A1 and A2 build on the existing economy and do not touch it.** If a stage starts requiring changes
to demand, supply or price, stop and raise it. The existing model is known to be structurally wrong
(spec §1.2) and it is being kept anyway, on purpose, because fixing it is not what alpha is testing.

**Do not tune anything.** Toll rates, deal durations and offer caps get placeholder values from the
tuning schema and stay there. Whether a rail toll should be ×1.6 or ×1.4 is a question for
playtesters, not for a pre-alpha pass.

---

## 6. Open questions for the alpha track — resolved

| # | Question | Ruling |
|---|---|---|
| 1 | Quarter over month | **Already ruled (D163).** Quarter. |
| 2 | Ports, and the Great Lakes / Seaway route | **[Aaron: Great Lakes states reach Canada and, through Canada, the world market — but not the world market directly.]** *Blocked on the port data question above.* |
| 3 | Can Canada and Mexico be conquered? | **[Aaron: No. They are not actors at all. Possibly a DLC; not now.]** |
| 4 | Economy mode win condition for alpha? | **[Aaron: Sandbox. It exists to play with the economy until it is something worth interacting with. Testers are told that up front.]** |

---

## 7. Process ruling for the A-stages

**[Aaron, 5 September: run straight through A0 → A4 without stopping for approval between stages.
Commit and tag each stage as it lands. Stop only on something genuinely his to decide. The alpha test
itself is the checkpoint that matters.]** This supersedes, for the alpha track only, the master rule
that each phase waits for written approval.
