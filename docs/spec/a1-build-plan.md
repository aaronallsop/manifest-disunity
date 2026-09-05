# A1 — trade deals with terms: what was built, and in what order

Written from the four design passes in `a1-design-passes/`, after the four adversarial passes and
the synthesiser died with a session limit (**D170**). Where the passes disagreed, the tie-break and
the reason are recorded here.

## The rulings this stage was built under

| Ruling | Where |
|---|---|
| A deal pays over a year what a click paid over a year | **D171** — Aaron, 5 Sep. `deal.rate` = 0.25 |
| Deals run their term; no early exit in A1 | **D171**. Breaking one is F2, on A2's machinery |
| A1 builds ON the economy and does not touch it | Addendum A. Two tests pin it |

## The disagreements, and how they were settled

**A new `deal` intent, or the existing `trade` intent grown up?** The UI pass wanted
`{type:'deal', …}`; the model and audit passes wanted `trade` extended in place. **Extended in
place** — a new type breaks the pinned move-type list in `tests/moves.test.js` and every existing
caller (`Actions.confirmTrade`, `AI.takeTurn`, `Moves.legal`), and the UI pass flagged that breakage
against its own proposal.

**What `plan.gain` means.** The model pass wanted it per-turn. It stays the **whole-term take**,
because `AI.score` reads it against a turn of national income; reporting per-turn would quarter
every AI's appetite for trade — a Full-game behaviour change smuggled in under an economy stage. At
the default four-turn term it is byte-for-byte the number the click reported, and there is a test
that says so.

**Whether the AI keeps its instant trade.** The UI pass flagged that the world would be asymmetric
until A4 — the player signing five-year contracts while the AI shops. It is not: with `deal.rate` at
0.25 and `deal.defaultDuration` at 4, an AI signing a default deal earns *exactly* what its click
earned, over exactly the four turns it used to spend on cooldown. So the AI was moved onto deals in
A1 at no cost to its cash flow. That fell straight out of Aaron's income ruling.

**Whether an AI may sign a deal with the player.** No. The audit pass raised it; the first playthrough
proved it — an AI signed a four-year agreement with the player without asking. An AI that wants a deal
with the player now makes an **offer**, which the shell raises as a card. AI-to-AI deals still sign
directly: fifty nations asking each other's permission is a turn nobody watches.

## Build order

1. **`js/deals.js`** — the `Deals` module, modelled on `js/pacts.js`. Deal records keyed on the
   ordered pair, ids from a serialized counter (never the RNG), offers, `committed`, `settlement`,
   `tick`, `expire`, `serialize`/`loadState`.
2. **Tunables** — a `deal.*` block in the Trade group. `deal.rate` is the ruling; the rest are
   placeholders, not tuned.
3. **`js/moves.js`** — `tradeFlows` subtracts existing commitments; `planTrade` takes terms and
   refuses a second live deal per pair; `resolveTrade` signs instead of paying, or offers when the
   target is the player; `legal()` gates on a live deal rather than on the cooldown.
4. **`js/world.js`** — `Deals.tick` immediately before `Game.tickTreasuries`, inside the same batch,
   ungated by Complexity.
5. **`js/statedoc.js`** + the three pages + the three reset sites.
6. **`tests/deals.test.js`** — 19 tests, and `tests/saves.test.js`'s module list.
7. **UI** — the negotiating table (`js/actions.js`), the offer/renegotiation card and the Deals
   block (`js/panels.js`), the halt (`js/shell.js`), CSS.
8. **`DESIGN.md`** in the same commit.

## Deliberately not built in A1

- **Counter-offers.** The model carries `priceMult` and `Deals.counter` is designed for, but the
  player's table offers duration and auto-renew only. A price haggle on a money-only economy can
  only move the joint gain between the parties, not set a real price — worth having once goods
  actually move, and misleading before then.
- **The Deals screen (`DealBook`).** The panel block shows the five soonest to expire and the income;
  a full ledger with an "on the table" tab is the natural next thing if the alpha wants it.
- **Settlement in the journal.** Signing, renewal, expiry, voiding and the player's own countdowns
  are logged. Payments are not: sixty deals over sixty turns is 3,600 entries against a cap of 4,000,
  and the real news would be the thing that got trimmed.

## What retired

- The **bilateral partner cooldown gate** (`trade.cooldownTurns` still governs external sales and
  transit, untouched). Its stamp is still written at signing, because Influence counts recent
  partners as reach — at signing only, never per settlement.
- The **immediate two-sided payout** in `resolveTrade`.
- The vestigial `Market.update` after a trade. It has not been able to move a price since trade
  income went to the treasury; all it did was flatten the market's own trend arrows and pay for a
  1,688-Area recompute per AI trade.

## The tests that matter most

- `signing a deal leaves the price index byte-identical`, and the same for a whole term of
  settlement. **If either goes red, the stage has stopped being what it was scoped as**, whatever
  else is passing.
- `a year of a deal pays what a year of clicking paid` — this fails the moment `deal.rate` and
  `trade.cooldownTurns` drift apart, which is the arithmetic Aaron's ruling rests on.
- `a four-turn deal pays four times and then stops`.
