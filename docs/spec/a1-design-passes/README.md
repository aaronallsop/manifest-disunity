# A1 design passes — the raw material the build plan came from

Four independent design passes over stage A1 (trade deals with terms), run 2026-09-05 as
workflow `wf_27be10f9-9d9`. Each was given the same hard scope rule verbatim:

> A1 builds ON the existing economy and does NOT touch it. No changes to demand, supply, or the
> price index.

Four more passes were commissioned to attack these designs, plus a synthesiser to turn them into
an ordered build plan. Those five died on a session limit. The decision to build from these four
rather than re-run the others is **D170** in `DECISIONS.md` — read it before trusting anything
here.

| File | The pass |
|---|---|
| `model-settlement.json` | The `Deal` object and per-turn money settlement inside `World.advanceTurn` |
| `ui-negotiation.json` | Offer and counter-offer, the renegotiation halt, the Deals screen, journal countdowns |
| `persistence-determinism.json` | Save format, ids, restore order, telemetry, turn-pipeline wiring |
| `existing-trade-audit.json` | What of today's trade code is reused as-is, what is retired, and where the scope rule could be broken by accident |

Each pass returns the same fields: `area`, `reuse`, `retire`, `steps`, `newTunables`,
`scopeCheck`, `determinism`, `risks`, `tests`, `unverified`.

**`unverified` is the one to read first.** It is each pass's own list of claims it did not check,
and it is where the four disagree with each other most.
