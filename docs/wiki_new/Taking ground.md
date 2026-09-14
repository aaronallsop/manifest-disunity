---
title: Taking ground
topic: military
tags:
  - military/taking-ground
  - #economy
  - round/2
kind: mechanic
built: partial, AND THE RUNNING GAME CURRENTLY CONTRADICTS TWO RULINGS. Measured this run: annex.costPerArea and annex.costPopScale exist as tunables, so the act is built and priced — but annex.budgetAreas, annex.cooldownTurns and annex.strongNeighbourFactor also still exist as tunables and are still read by the move, and the rulings remove all three. The Field-versus-Border comparison exists in the military model, but what the annex move actually rolls is the civil-war resolver rather than a fight, which is the gap the round itself identifies.
status: written
---

# Taking ground

> [!abstract] At a glance
> **System:** [[Military]]
> **In the game today:** partial, AND THE RUNNING GAME CURRENTLY CONTRADICTS TWO RULINGS. Measured this run: annex.costPerArea and annex.costPopScale exist as tunables, so the act is built and priced — but annex.budgetAreas, annex.cooldownTurns and annex.strongNeighbourFactor also still exist as tunables and are still read by the move, and the rulings remove all three. The Field-versus-Border comparison exists in the military model, but what the annex move actually rolls is the civil-war resolver rather than a fight, which is the gap the round itself identifies.
> **Decided in:** Military
> **This page:** written

*One Area per attack, priced and paid out of the treasury before the dice are rolled, resolved as your Field army against their Border — with no per-turn cap, no cooldown and no size shield left to refuse you, and an Area that produces nothing the turn it is hit whether or not it falls.*

## What it is

Taking ground is the act of attacking one Area during a war. The player pays before the fight, sees an estimated chance based on the attacking Field force against the defending Border force, and either takes that one Area or loses the attempt and the money already committed.

## How it works in the game

Combat is deliberately simple at the player level: there are no unit counters, troop types, stacks or tactical map pieces. The complexity belongs in the political and economic consequences of the decision to attack ([[Rulings - Military#Military ruling 11]]).

An attack targets **one Area**. The game compares the attacker's available **Field** strength with the defender's **Border** strength and presents the player with a percentage chance of success before committing ([[Rulings - Military#Military ruling 12]]). Distance, command and later bonuses or penalties can modify that chance, but the basic decision remains a single readable probability.

The price is paid before the roll. Failure therefore does not need a separate artificial readiness penalty: the attacker has already spent the treasury cost and the action, and gets no ground ([[Rulings - Military#Military ruling 14]]).

An Area under attack produces **nothing for that turn whether or not the attack succeeds** ([[Rulings - Military#Military ruling 23]]). Because Area output is sector-specific, that is not merely lost tax revenue; attacking a farming Area can remove food production, while attacking a transport-heavy Area can disrupt the thing that moves other goods.

That creates a deliberate-but-dangerous raid possibility. A player may attack to deny production even when the chance of conquest is poor. Whether the attack price is greater than the value of one turn of denied output is explicitly a measurement that must be checked before alpha rather than guessed.

There is no longer a three-Area attack budget or four-turn annexation cooldown. Each attack still names one Area, but a nation with enough money, manpower and actions may attack again on following turns ([[Rulings - Military#Military ruling 24]]).

The old hard rule forbidding attacks on neighbours more than four times your population and GDP is also removed. Size now affects the odds and therefore the cost/risk rather than producing a rulebook refusal ([[Rulings - Military#Military ruling 25]]). Reach remains a geographic hard limit.

When the attack succeeds, the border moves immediately and the Area becomes occupied under the appropriate [[Occupation]] flag. A later peace settlement changes its tenure, and over time successful integration can turn occupied ground into ordinary home ground ([[Rulings - Military#Military ruling 10]]; [[Rulings - Military#Military ruling 26]]).

The existing annex implementation only partially matches this design. Field-vs-Border strength exists, but the annex move currently resolves through older civil-war machinery; the three-Area budget, cooldown and four-times-size shield are also still present in code.

## The story behind it

The military round uses the conquest of particular Areas to keep war legible. A front is not a stack of counters; it is the pale occupied part of the map. New Mexico's unclaimed ground and the Vermont trace show the intended scale: a country decides which concrete place is worth paying for, and the people and production in that place determine what the attempt means.

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Authority]] - Wars won firm your grip; overreach loosens it  <!-- COSTS, DESIGN.md:370 — authority is cut by territory lost, occupation and overreach -->
- [[Civil war]] - Bite off more than you are and your own country comes apart  <!-- TRIGGERS, js/civilwar.js:4-7 — triggered by an annexation flipping the plurality, GDP or population -->
- [[Economy]] - A region under attack produces nothing that quarter, win or lose  <!-- COSTS, Round 2 ruling 23, docs/design/conquest-ideation.md:1652 -->
- [[Occupation]] - Every acre you win arrives flagged as occupied until you make peace  <!-- TRIGGERS, Round 2 ruling 13, docs/design/conquest-ideation.md:1006 -->
- [[Peace treaty]] - What you spent taking ground is the basis for what you may demand back  <!-- FEEDS, Round 2 ruling 22, docs/design/conquest-ideation.md:1569 -->
- [[Resistance]] - Some ground is dear to hold whoever holds it, and that never changes hands  <!-- FEEDS, Round 1 rulings 32 and 33, docs/design/secession-ideation.md:1109 and :1120 -->
- [[The turn]] - One action a turn already means one attack a turn, cooldown or not  <!-- COSTS, Round 2 ruling 24 and its finding, docs/design/conquest-ideation.md:1723 and :1736 -->
- [[Unions]] - A neighbour fresh from taking ground is frightening, and frightening cools a yes *(unverified)*  <!-- BLOCKS, Round 3 ruling 17, docs/design/politics-ideation.md:1371 (the default on recent conquest) -->
<!-- SEEDED:edges END -->


## Questions for the designer

- **Raid economics:** measure attack cost against one turn of the target Area's sector output before alpha. With the cooldown removed, an economically profitable denial attack could otherwise be repeated every turn.
- **Combat modifiers:** technology, local movement support and other bonuses are acknowledged but not fully ruled; do not invent the final list or coefficients here.
- **Reach:** it remains the one geographic hard refusal after the size shield is removed, but its final relationship to new borders should be checked in the mechanics pass.
- **Implementation conflict:** current annexation still carries the three-Area budget, four-turn cooldown and four-times-size shield and does not use the ruled fight on every attack.
- **Generated source metadata:** rulings 12, 14, 23, 24, 25 and 26 are live despite being labelled superseded.

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Military#Military ruling 1]] | This is not a war game, and the arrows point the other way. | ruled, not built |
| [[Rulings - Military#Military ruling 10]] | ground changes hands at the settlement, not turn by turn. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 11]] | war must be simple at the level the player touches it. | ruled, not built |
| [[Rulings - Military#Military ruling 12]] | how a fight resolves. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 14]] | an attack has two outcomes, and failure costs what you already spent. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 22]] | the repayment cap is measured against the war costs of whoever sends the treaty. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 23]] | the cost of a war belongs to the economy of war; and an Area under attack produces nothing that turn, whether or not it falls. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 24]] | one Area per attack, and the per-turn cap and the cooldown both go. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 25]] | the four-times-your-size shield is removed. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 26]] | occupied ground eventually becomes your country, and how fast depends on whether life got better. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 41]] | the seven outstanding defaults are confirmed as written. | ruled, not built |

*11 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `65dd3ef` (2026-09-11).*
<!-- GENERATED:sources END -->
