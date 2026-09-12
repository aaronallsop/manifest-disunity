---
title: War
topic: military
tags:
  - military/war
  - #diplomacy
  - round/2
kind: mechanic
built: designed only — there is no war between nations anywhere in the code. Measured this run: searching js/ for cease-fire, peace treaty, hostile or wary as a STATE returns exactly one hit, and it is a sentiment label on the relations panel. The only war-flagged code path is the civil-war county transfer.
status: needs writing
---

# War

> [!abstract] At a glance
> **System:** [[Military]]
> **In the game today:** designed only — there is no war between nations anywhere in the code. Measured this run: searching js/ for cease-fire, peace treaty, hostile or wary as a STATE returns exactly one hit, and it is a sentiment label on the relations panel. The only war-flagged code path is the civil-war county transfer.
> **Decided in:** Military
> **This page:** not yet written

*What a war is in this game — a standing state two nations live in rather than an event, who may declare one and from what footing, what it forbids while it runs, why there are no troop types, and why it can only be ended by agreement.*

## What it is

<!-- WRITER: one short paragraph, plain language. What is this, to somebody playing? -->

## How it works in the game

<!-- WRITER: the mechanism. Link other pages inline as you write - "you cannot trade with a
     nation you are at [[War|war]] with" - because those inline links are what draws the graph.
     Cite the ruling behind each claim from the Sources table at the foot of this page. -->

## The story behind it

<!-- WRITER: the in-world explanation. Raw material found: yes — the wars already fought before turn 0: Houston into western Louisiana, the federal army into West Virginia, Chicago into north-west Indiana, the Gulf taking the panhandle for Pensacola. This page also carries the frame ruling that governs every other military page — this is not a war game; war is a thing that happens TO the economy, the neighbours and your own people. -->

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Cease-fire]] - A war ends only when both sides agree, and refusing is allowed  <!-- GATES, Round 2 ruling 6, docs/design/conquest-ideation.md:789 -->
- [[Diplomatic states]] - You may declare straight from peace; the ladder is a cost, not a gate  <!-- FEEDS, Round 2 ruling 29, docs/design/conquest-ideation.md:2019 -->
- [[Economy]] - War prohibits trade and tears up the deals you had already signed  <!-- BLOCKS, Round 2 ruling 2, docs/design/conquest-ideation.md:113; C57 at :138. NOT BUILT — see the war/trade note. -->
- [[Federation]] - Declare against the federation's wishes and you leave it the same day  <!-- COSTS, Round 3 ruling 29, docs/design/politics-ideation.md:1905 -->
- [[Occupation]] - Ground you win is yours at once, but only under an occupier's flag  <!-- TRIGGERS, Round 2 rulings 10 and 13, docs/design/conquest-ideation.md:942 and :1006 -->
- [[Peace treaty]] - What the war cost you is what sets the bill you may present  <!-- FEEDS, Round 2 ruling 15, docs/design/conquest-ideation.md:1081; ruling 22 at :1569 -->
- [[People]] - A decade of fighting is paid for at home, and only peace repays it  <!-- COSTS, DESIGN.md:374 (war weariness); Round 2 ruling 23, conquest-ideation.md:1652 -->
- [[Taking ground]] - War is the state in which you are allowed to attack at all  <!-- GATES, Round 2 rulings 2 and 12, docs/design/conquest-ideation.md:113 and :959 -->
<!-- SEEDED:edges END -->

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Military#Military ruling 1]] | This is not a war game, and the arrows point the other way. | ruled, not built |
| [[Rulings - Military#Military ruling 2]] | A war is a standing state, and it is one of seven. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 6]] | a war ends only by agreement, and refusing is allowed. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 9]] | what Hostile costs. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 10]] | ground changes hands at the settlement, not turn by turn. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 11]] | war must be simple at the level the player touches it. | ruled, not built |
| [[Rulings - Military#Military ruling 12]] | how a fight resolves. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 14]] | an attack has two outcomes, and failure costs what you already spent. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 16]] | a movement makes DEMANDS, they are shown on a screen of their own, and every demand gets one of three answers. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 18]] | Hostile honours what is signed and permits nothing new. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 23]] | the cost of a war belongs to the economy of war; and an Area under attack produces nothing that turn, whether or not it falls. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 24]] | one Area per attack, and the per-turn cap and the cooldown both go. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 25]] | the four-times-your-size shield is removed. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 29]] | a nation may declare war straight from Peace, and the reason is the whole ladder. | ruled, not built |
| [[Rulings - Military#Military ruling 33]] | both sides table a treaty before the cease-fire ends, and the defender chooses first. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 36]] | tabling a treaty is free, and C116 is amended. | **SUPERSEDED - do not state this as a rule** · ruled, not built |

*16 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `7d167a6` (2026-09-11).*
<!-- GENERATED:sources END -->
