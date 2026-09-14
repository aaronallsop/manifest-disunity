---
title: Cease-fire
topic: diplomacy
tags:
  - diplomacy/cease-fire
  - #military
  - round/2
kind: mechanic
built: designed only. No cease-fire exists in js/. The full-screen negotiation card it reuses is built for trade and transit and has no peace mode — and it already has the property the whole design leans on: answering a card does not use your turn.
status: written
---

# Cease-fire

> [!abstract] At a glance
> **System:** [[Diplomacy]]
> **In the game today:** designed only. No cease-fire exists in js/. The full-screen negotiation card it reuses is built for trade and transit and has no peace mode — and it already has the property the whole design leans on: answering a card does not use your turn.
> **Decided in:** Military
> **This page:** written

*The timed pause that carries every cost of a war except the right to attack, and the compulsory sealed-envelope negotiation that has to happen on the turn before it runs out.*

## What it is

A cease-fire is a temporary pause inside an existing war. The countries stop attacking for a fixed number of turns, but the war has not yet been settled; the pause exists to force both sides toward a final peace offer.

## How it works in the game

A [[Cease-fire]] lasts for a set term rather than continuing until somebody cancels it ([[Rulings - Military#Military ruling 3]]). It carries the costs and political condition of [[War]] but removes the right to make attacks during the pause.

The war itself can end only through agreement. Either side is allowed to refuse peace and continue the conflict once the pause is over ([[Rulings - Military#Military ruling 6]]).

The current design replaces the earlier open-ended negotiation with a **single sealed round of offers**. Before the cease-fire expires, both sides must table a [[Peace treaty]]; the defender's offer is considered first ([[Rulings - Military#Military ruling 33]]). The defender's own treaty is the only counter-offer — there is no second round of haggling and no extension created by a counter ([[Rulings - Military#Military ruling 34]]).

The two treaties are written **blind**. Neither side gets to see the other's terms before committing its own, so the end of the war depends partly on reading the other government rather than merely optimising against a visible number ([[Rulings - Military#Military ruling 35]]).

Submitting the required treaty is free and does not consume the nation's normal action. The cease-fire is a clock the player did not choose, so the design does not take away the turn just because the deadline arrived ([[Rulings - Military#Military ruling 36]]).

If the parties fail to sign either tabled treaty, the cease-fire ends in **[[Hostility|Hostile]]**, not automatically back in War. That default survives the earlier cease-fire ruling even though the negotiation procedure itself was replaced ([[Rulings - Military#Military ruling 8]]).

The attacker remains the attacker for the life of the war, through any number of cease-fires, even if the military situation reverses. That default was confirmed with the other closing military defaults ([[Rulings - Military#Military ruling 41]]).

Cease-fires and peace treaties are not implemented in the running game.

## The story behind it

*Not yet written.*

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Economy]] - It is a waiting room that charges you war prices while you wait  <!-- COSTS, Round 2 ruling 2, docs/design/conquest-ideation.md:111 -->
- [[Hostility]] - Nothing signed by the deadline and you fall back to hostile, not to war  <!-- TRIGGERS, Round 2 ruling 8, docs/design/conquest-ideation.md:832 and the restatement at :2321 -->
- [[Peace treaty]] - Both sides table terms blind before it ends; the defender chooses first  <!-- GATES, Round 2 rulings 33, 34 and 35, docs/design/conquest-ideation.md:2243, :2309, :2341 -->
- [[Playing]] - Terms are written blind, so what you can see of them decides everything  <!-- FEEDS, Round 2, C130, docs/design/conquest-ideation.md:2357 -->
- [[Taking ground]] - All the costs of war, and you may not attack  <!-- BLOCKS, Round 2 ruling 2, docs/design/conquest-ideation.md:111 -->
- [[The turn]] - Putting terms on the table is free; ending a war is cheaper than starting one  <!-- FEEDS, Round 2 ruling 36, docs/design/conquest-ideation.md:2370 -->
- [[War]] - It is the only door out of a war, and both sides must open it  <!-- GATES, Round 2 ruling 6, docs/design/conquest-ideation.md:789 -->
<!-- SEEDED:edges END -->


## Questions for the designer

- **Cease-fire term:** a fixed duration is ruled, but the number of turns is a tunable rather than a settled value in the wiki sources.
- **Information visible during blind offers:** ruling 35 intentionally makes the offers blind, but the source leaves open which standing facts the player can inspect while writing terms. Without that, the sealed choice risks becoming guesswork rather than judgment.
- **Generated source metadata:** rulings 3, 6, 33, 34, 35 and 36 are incorrectly marked superseded in the generated Sources table; the ruling index says they remain live.

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Military#Military ruling 3]] | a cease-fire is temporary and carries a set number of turns. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 6]] | a war ends only by agreement, and refusing is allowed. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 8]] | a cease-fire ends in a negotiation, and its default is Hostile rather than War. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 15]] | what goes in a peace treaty, and what refusing one costs. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 22]] | the repayment cap is measured against the war costs of whoever sends the treaty. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 33]] | both sides table a treaty before the cease-fire ends, and the defender chooses first. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 34]] | the defender's own tabled treaty is the counter, and there is exactly one round of offers. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 35]] | the two treaties are written blind. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 36]] | tabling a treaty is free, and C116 is amended. | **SUPERSEDED - do not state this as a rule** · ruled, not built |

*9 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `65dd3ef` (2026-09-11).*
<!-- GENERATED:sources END -->
