---
title: Alliances
topic: diplomacy
tags:
  - diplomacy/alliances
  - #military
  - round/2
kind: mechanic
built: designed only. Measured this run: the army allocation is fixed at exactly three roles — garrison, border, field — so the lending lever has nowhere to live. There is no alliance object anywhere in js/; the coalition code builds the opposite thing, nations lining up AGAINST a target.
status: written
---

# Alliances

> [!abstract] At a glance
> **System:** [[Diplomacy]]
> **In the game today:** designed only. Measured this run: the army allocation is fixed at exactly three roles — garrison, border, field — so the lending lever has nowhere to live. There is no alliance object anywhere in js/; the coalition code builds the opposite thing, nations lining up AGAINST a target.
> **Decided in:** Military
> **This page:** written

*What being Allied does and deliberately does not do — you inherit your friend's quarrels one hop and no further, you lend soldiers by a lever you set, you may join their war only if you border the enemy, and you are never compelled to fight.*

## What it is

An alliance is a formal friendship between two nations. It lets them support one another militarily and causes some of one ally's quarrels to spill over onto the other, but it does not automatically drag either country into every war the other fights.

## How it works in the game

[[Alliances|Allied]] is a diplomatic relationship kept deliberately thinner than a federation or a subject relationship. Each nation chooses how many soldiers it is willing to lend to its ally through a military-allocation lever; the alliance does not create a new pooled army ([[Rulings - Military#Military ruling 27]]).

An ally is never automatically required to fight. The design allows a nation to join an ally's war only when it can actually reach the enemy across a border, and the alliance itself does not remove the player's choice about whether to enter ([[Rulings - Military#Military ruling 27]]).

An alliance does, however, transmit diplomatic trouble. If your ally becomes [[Hostility|Hostile]] with another nation, that quarrel can make you Hostile with the same nation. The inheritance stops after exactly one hop: your ally's enemy can become your enemy, but the enemy of your ally's ally does not continue the chain ([[Rulings - Military#Military ruling 37]]).

Inherited Hostility is intentionally weak. It slows the cooling clock but never stops it, and it is the fastest-cooling kind of Hostility in the design ([[Rulings - Military#Military ruling 38]]). The source analysis also concludes that inherited hostility must fire once when the alliance creates it rather than re-trigger every turn; that consequence is necessary to prevent a cooled relationship snapping immediately back to Hostile, but it is recorded as a derived finding rather than a separate ruling.

Allies are also insulated from one specific diplomatic punishment: when a nation breaks a [[Peace treaty]], every neighbouring nation except its allies becomes Hostile immediately ([[Rulings - Military#Military ruling 28]]).

The running game has no alliance object, no allied military allocation and no inherited Hostility, so all of this remains designed rather than built.

## The story behind it

The design trace uses a western example: Utah is allied with Nevada, Idaho is allied with Wyoming, and Utah attacks Idaho. The one-hop rule is meant to make the immediate alliance network matter without turning the entire continent into two permanent blocs. The traced example itself contained a one-pair counting error; the ruling record corrects it and says Nevada and Idaho do become Hostile.

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Diplomacy]] - Subjects, protectorates and guarantees were all handed forward, not built  <!-- FEEDS, Round 2, C112, docs/design/conquest-ideation.md:1935 -->
- [[Federation]] - An alliance is two states; a federation is many, and that is the whole difference  <!-- FEEDS, Round 3 ruling 25, docs/design/politics-ideation.md:1718 -->
- [[Hostility]] - You inherit your ally's enemies — one hop only, and it cools fastest  <!-- FEEDS, Round 2 rulings 27, 37 and 38, docs/design/conquest-ideation.md:1892, :2398, :2491 -->
- [[Military]] - Soldiers lent to a friend are soldiers not holding your own border  <!-- COSTS, Round 2 ruling 27 and C110, docs/design/conquest-ideation.md:1892 and :1917 -->
- [[Peace treaty]] - Allies do not turn on you when you break somebody else's treaty  <!-- BLOCKS, Round 2 ruling 28, docs/design/conquest-ideation.md:1947-1986 -->
- [[Taking ground]] - You may open a second front only if you border their enemy  <!-- GATES, Round 2 ruling 27 and C111, docs/design/conquest-ideation.md:1892 and :1929 -->
- [[The board]] - A small neighbour of your enemy is worth more than a giant on the far coast  <!-- FEEDS, Round 2, C111, docs/design/conquest-ideation.md:1929 -->
- [[War]] - You cannot be at war with an ally, and never have to join theirs  <!-- BLOCKS, Round 2 ruling 27, docs/design/conquest-ideation.md:1892 -->
<!-- SEEDED:edges END -->


## Questions for the designer

- **Inherited-hostility trigger:** the source analysis says alliance-inherited Hostility must fire once as an event rather than be re-evaluated every turn. That is logically required by ruling 38 but is not itself a numbered ruling; confirm it in the implementation specification.
- **Joining an ally's war:** ruling 27 says an ally may join only if it borders the enemy, but the exact player action, timing and diplomatic cost of joining have not yet been specified on this page.

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Military#Military ruling 4]] | what puts two nations into Hostile. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 27]] | Allied is taken now and kept thin; Subject is deferred; and the soldiers you lend are a lever you set. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 28]] | breaking a peace treaty turns every neighbour but your allies hostile, at once. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 37]] | inherited hostility travels exactly one hop. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 38]] | an inherited quarrel slows the clock but never stops it, and it is the fastest-cooling hostility in the game. | **SUPERSEDED - do not state this as a rule** · ruled, not built |

*5 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `65dd3ef` (2026-09-11).*
<!-- GENERATED:sources END -->
