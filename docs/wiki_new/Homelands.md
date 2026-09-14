---
title: Homelands
topic: board
tags:
  - board/homelands
  - #secession
  - round/1
kind: mechanic
built: partial — homelands are stored per Area, but roughly fifteen of the thirty-two are generated from state lists in the bake rather than painted. The map editor authors three-tier region hierarchies in which each Area belongs to at most one path, so it cannot hold two movements claiming the same ground, and nothing widens a realised movement's homeland. The twenty-one map jobs behind this are a production work list, not article content.
status: written
---

# Homelands

> [!abstract] At a glance
> **System:** [[The board]]
> **In the game today:** partial — homelands are stored per Area, but roughly fifteen of the thirty-two are generated from state lists in the bake rather than painted. The map editor authors three-tier region hierarchies in which each Area belongs to at most one path, so it cannot hold two movements claiming the same ground, and nothing widens a realised movement's homeland. The twenty-one map jobs behind this are a production work list, not article content.
> **Decided in:** Secession
> **This page:** written

*The ground a movement is allowed to exist on — painted by hand in nested levels, bound to counties rather than state lines, and widened to a nation's founding grant the moment the movement realises.*

## What it is

A homeland is the geographic ground on which a movement is allowed to organise. It belongs to the movement rather than to a state border, so a movement's political geography can cut across several nations and old state lines.

## How it works in the game

Homelands are **authored geography**, not something the game derives automatically from current borders or demographic rules. They are meant to be painted directly onto the map ([[Rulings - Secession#Secession ruling 26]]).

When a movement succeeds and creates a nation, its homeland automatically expands to include all of that nation's founding ground. That prevents a new state from beginning with parts of its own grant outside the movement's political home ([[Rulings - Secession#Secession ruling 17]]).

A movement is bound to counties rather than to state lines. If its real claim crosses an old state boundary, the homeland crosses it as well; cross-border movements are ordinary movements with cross-border geography, not a special movement type ([[Rulings - Secession#Secession ruling 51]]). This is the eventual answer to the Deep South balance problem first raised in ruling 28 ([[Rulings - Secession#Secession ruling 28]]).

The current data only partly follows that design. Some movement homelands are already stored geographically, but a substantial set are generated from state lists and therefore inherit borders nobody deliberately painted. The planned movement-map editor also needs a richer claim structure than the current three-tier region hierarchy can store.

## The story behind it

*Not yet written.*

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Movements]] - A movement lives where its counties are, and nowhere else  <!-- GATES, Round 1 ruling 51, docs/design/secession-ideation.md:1502 -->
- [[Nations of the Shattering]] - When a movement becomes a country, its country becomes its homeland  <!-- FEEDS, Round 1 ruling 17, docs/design/secession-ideation.md:794 -->
- [[Occupation]] - Take somebody's heartland and you have taken the ground that fights back  <!-- COSTS, Round 1 ruling 16, docs/design/secession-ideation.md:780; deferred.md #14 recorded there -->
- [[Resistance]] - A nation's founding ground resists an occupier hardest of all  <!-- FEEDS, Round 1 ruling 16, docs/design/secession-ideation.md:780 -->
- [[Reunification contests]] - The ground outside a country that still wants in is what carries the story  <!-- FEEDS, Round 1 ruling 17, docs/design/secession-ideation.md:794 ("the reach stays hand-authored") -->
- [[The board]] - Homelands are painted on the county map, by hand, like everything else here  <!-- FEEDS, Round 1 rulings 26 and 51, docs/design/secession-ideation.md:1001 and :1502 -->
<!-- SEEDED:edges END -->


## Questions for the designer

- **Map-data architecture:** ruling 26 requires Areas to support overlapping movement claims with levels, while the current region hierarchy allows only one path. The exact storage format is an implementation decision still to be made.
- **Unpainted state-derived homelands:** several current movement boundaries follow state lines because of the build script rather than because the designer chose those edges. They should be reviewed in the map-authoring pass.

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Secession#Secession ruling 17]] | a realised movement's homeland widens to its nation's founding ground, automatically. | ruled, not built |
| [[Rulings - Secession#Secession ruling 26]] | homelands are painted, not derived. | ruled, not built |
| [[Rulings - Secession#Secession ruling 28]] | the Deep South is balanced by rising movements that cross state lines. | amended later · ruled, not built |
| [[Rulings - Secession#Secession ruling 51]] | a movement is bound to counties, never to state lines. | ruled, not built |

*4 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `65dd3ef` (2026-09-11).*
<!-- GENERATED:sources END -->
