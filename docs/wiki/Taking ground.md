---
title: Taking ground
topic: military
tags:
  - military/taking-ground
  - #economy
  - round/2
kind: mechanic
built: partial, AND THE RUNNING GAME CURRENTLY CONTRADICTS TWO RULINGS. Measured this run: annex.costPerArea and annex.costPopScale exist as tunables, so the act is built and priced — but annex.budgetAreas, annex.cooldownTurns and annex.strongNeighbourFactor also still exist as tunables and are still read by the move, and the rulings remove all three. The Field-versus-Border comparison exists in the military model, but what the annex move actually rolls is the civil-war resolver rather than a fight, which is the gap the round itself identifies.
status: needs writing
---

# Taking ground

> [!abstract] At a glance
> **System:** [[Military]]
> **In the game today:** partial, AND THE RUNNING GAME CURRENTLY CONTRADICTS TWO RULINGS. Measured this run: annex.costPerArea and annex.costPopScale exist as tunables, so the act is built and priced — but annex.budgetAreas, annex.cooldownTurns and annex.strongNeighbourFactor also still exist as tunables and are still read by the move, and the rulings remove all three. The Field-versus-Border comparison exists in the military model, but what the annex move actually rolls is the civil-war resolver rather than a fight, which is the gap the round itself identifies.
> **Decided in:** Military
> **This page:** not yet written

*One Area per attack, priced and paid out of the treasury before the dice are rolled, resolved as your Field army against their Border — with no per-turn cap, no cooldown and no size shield left to refuse you, and an Area that produces nothing the turn it is hit whether or not it falls.*

## What it is

<!-- WRITER: one short paragraph, plain language. What is this, to somebody playing? -->

## How it works in the game

<!-- WRITER: the mechanism. Link other pages inline as you write - "you cannot trade with a
     nation you are at [[War|war]] with" - because those inline links are what draws the graph.
     Cite the ruling behind each claim from the Sources table at the foot of this page. -->

## The story behind it

<!-- WRITER: the in-world explanation. Raw material found: yes — the traced Vermont sentence, New Mexico's remainder as unclaimed prey, and the measured armed share by region that decides how hard each bite bites back. -->

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

*Generated by `build/build_wiki.py` from commit `7d167a6` (2026-09-11).*
<!-- GENERATED:sources END -->
