---
title: The opening roll
topic: board
tags:
  - board/the-opening-roll
  - #playing
  - round/1
kind: mechanic
built: partial — Deseret's setup roll runs on a dedicated scenario random stream and the faction picker's difficulty rating is built. Every other nation's extent is authored in content/scenario-shattered.json rather than rolled, and nothing spreads a nation outward in rings. One of the five rulings here is superseded and must not be presented as live.
status: written
---

# The opening roll

> [!abstract] At a glance
> **System:** [[The board]]
> **In the game today:** partial — Deseret's setup roll runs on a dedicated scenario random stream and the faction picker's difficulty rating is built. Every other nation's extent is authored in content/scenario-shattered.json rather than rolled, and nothing spreads a nation outward in rings. One of the five rulings here is superseded and must not be presented as live.
> **Decided in:** Secession
> **This page:** written

*How the board is decided before the first turn — what is certain, what the dice actually settle, how a realised movement spreads outward from its core, and why the player sees the result before choosing a nation.*

## What it is

The opening roll is the setup procedure that turns the fixed Shattering design into one particular starting map. The major nations and movements are known in advance; the dice decide how far some of them have spread and how contested or fragmented ground was resolved before the player chooses whom to play.

## How it works in the game

Every designed opening nation appears in every game. The roll changes **how much ground it starts with**, not whether the nation exists at all ([[Rulings - Secession#Secession ruling 12]]).

The setup dice are resolved **before the player chooses a nation**, so the player chooses from the world that actually exists rather than picking a country and then rolling its fortunes afterward ([[Rulings - Secession#Secession ruling 15]]).

Growing movements are also resolved during setup, using authored geography rather than an automatic state-border formula, and new movements can still arise after play begins ([[Rulings - Secession#Secession ruling 14]]; [[Rulings - Secession#Secession ruling 26]]).

The old four-ring spreading ladder from Secession ruling 24 is **superseded**. Ruling 26 replaces geography-blind concentric odds with painted claims/homelands, so the setup follows authored political geography rather than distance rings ([[Rulings - Secession#Secession ruling 24]]; [[Rulings - Secession#Secession ruling 26]]).

The Four Corners is one explicit mixed case: some ground belongs to fixed claimants, some is assigned by the designed settlement, and leftovers are rolled among the possible outcomes ([[Rulings - Secession#Secession ruling 23]]). The Navajo state and Front Range arrangement are part of the fixed political structure surrounding that roll ([[Rulings - Secession#Secession ruling 3]]).

Stateless regions use another setup procedure. Four or five fragments are painted in each region and the dice decide how many have already coalesced into larger local entities by turn zero ([[Rulings - Secession#Secession ruling 31]]).

Movement verbs are not all purely pre-authored. Rejoin, Expand and Reconquer were originally defined as born from conditions in play, although later refinement allows Expand and Reconquer to be present at setup when their triggering condition already exists ([[Rulings - Secession#Secession ruling 42]]).

The redesigned opening-roll machinery is not implemented in the current scenario builder.

## The story behind it

Deseret is the model case. The Wasatch Front is always part of the realised state, while other Mormon Corridor ground may or may not have joined it before the game opens. Ground left disconnected from Salt Lake is remembered politically as left behind. The point of rolling first is that the player begins by reading that history rather than by choosing Deseret and then asking the dice how convenient its borders will be.

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Homelands]] - Setup extent comes from painted ground, not from rings around a centre  <!-- FEEDS, Round 1 ruling 26, docs/design/secession-ideation.md:1001 (superseding ruling 24's ring ladder at :928) -->
- [[Movements]] - Growing movements roll a core that always holds and a periphery that may not  <!-- FEEDS, Round 1 ruling 14, docs/design/secession-ideation.md:725 -->
- [[Nations of the Shattering]] - The dice set how big each country starts, never whether it exists  <!-- FEEDS, Round 1 ruling 12, docs/design/secession-ideation.md:692 -->
- [[Playing]] - The board is rolled before you choose, so you pick knowing the sizes  <!-- GATES, Round 1 ruling 15, docs/design/secession-ideation.md:731 -->
- [[Resistance]] - How armed each county is, is baked once at setup and never changes  <!-- FEEDS, Round 1 rulings 35 and 36, docs/design/secession-ideation.md:1138 and :1153 -->
- [[Stateless society]] - Four or five fragments are painted per region; the dice say how many held together  <!-- FEEDS, Round 1 ruling 31, docs/design/secession-ideation.md:1094 -->
- [[The board]] - The Four Corners is settled three ways and the leftovers are rolled  <!-- FEEDS, Round 1 ruling 23, docs/design/secession-ideation.md:902 -->
<!-- SEEDED:edges END -->


## Questions for the designer

- **Setup probability model after ruling 24:** the four-ring ladder is dead, but the precise probability scheme attached to painted homeland levels still needs to be expressed in implementation-ready form.
- **Four Corners weights:** the sources define fixed and rolled categories but implementation should carry the exact weighting table rather than infer it.
- **Expand/Reconquer at setup:** ruling 44 refines ruling 42; ensure the generator maps ruling 44 to this page so readers do not interpret ruling 42 too literally.

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Secession#Secession ruling 3]] | Colorado becomes the Front Range Republic; the Navajo Nation is trimmed to the Four Corners and the ground around it opens wanting in — Deseret's mechanism generalised | amended later · ruled, not built |
| [[Rulings - Secession#Secession ruling 12]] | every nation spawns in every game; what rolls is its size. | ruled, not built |
| [[Rulings - Secession#Secession ruling 14]] | growing movements roll at the start on Deseret's shape, and new ones arise in play. | ruled, not built |
| [[Rulings - Secession#Secession ruling 15]] | the dice roll before the player chooses. |  |
| [[Rulings - Secession#Secession ruling 23]] | the Four Corners is settled three ways, and the leftovers are rolled. | ruled, not built |
| [[Rulings - Secession#Secession ruling 24]] | a realised nation spreads outward at setup, in four rings of decaying odds. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Secession#Secession ruling 26]] | homelands are painted, not derived. | ruled, not built |
| [[Rulings - Secession#Secession ruling 31]] | four or five fragments painted per region, and the dice decide how many have coalesced. | ruled, not built |
| [[Rulings - Secession#Secession ruling 42]] | three of the six verbs are born in play, not painted. | amended later · ruled, not built |

*9 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `65dd3ef` (2026-09-11).*
<!-- GENERATED:sources END -->
