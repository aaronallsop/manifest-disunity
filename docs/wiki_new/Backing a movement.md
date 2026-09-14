---
title: Backing a movement
topic: secession
tags:
  - secession/backing-a-movement
  - #diplomacy
  - round/1
kind: mechanic
built: designed only — every movement record carries an unused `sponsor` field commented as 'a nation backing it', and nothing reads or writes it. Measured this run: the word 'petition' appears nowhere in js/.
status: written
---

# Backing a movement

> [!abstract] At a glance
> **System:** [[Secession]]
> **In the game today:** designed only — every movement record carries an unused `sponsor` field commented as 'a nation backing it', and nothing reads or writes it. Measured this run: the word 'petition' appears nowhere in js/.
> **Decided in:** Secession
> **This page:** written

*The two ways a nation and somebody else's movement come together — the movement petitions and several nations compete to answer it, or a nation funds it quietly from outside — and what saying yes, saying no and paying all cost.*

## What it is

Backing a movement is the relationship between a nation and a political movement operating somewhere else. The nation can provide continuing support, but the normal relationship begins because the movement approaches possible sponsors rather than because a foreign government simply chooses a movement off the map.

## How it works in the game

A nation may fund a [[Movements|movement]] outside its own borders. That support is a standing commitment rather than a one-turn move: once accepted, it persists until it is changed or ended ([[Rulings - Secession#Secession ruling 21]]).

The normal approach starts with the movement. Once it reaches the still-undecided petition threshold, it approaches a nation for support; a government cannot simply browse the movement list and declare itself a sponsor ([[Rulings - Secession#Secession ruling 47]]).

A movement may petition several nations at the same time. Those nations can therefore compete to become the movement's preferred outside backer rather than there being one predetermined sponsor ([[Rulings - Secession#Secession ruling 48]]).

Refusing a petition has no immediate penalty. The design instead gives repeated refusal a later cost: eventually the movement stops asking and the opportunity is lost, with the relationship damage represented through the wider diplomatic memory system ([[Rulings - Secession#Secession ruling 49]]). The length of that clock has not been decided.

Petitions, sponsorship competition and related negotiations are explicitly owned by [[Diplomacy]], not by the secession system itself ([[Rulings - Secession#Secession ruling 50]]).

None of the petition machinery is implemented. Movement records already contain a sponsor field, but the running game does not read or write it as an active mechanic.

## The story behind it

El Paso and the Rio Grande Union provide one of the intended dilemmas: backing a neighbouring movement can create influence over what comes next, but it can also sacrifice a different future relationship. The Cascadia material uses Oregon and Washington as competing possible sponsors, making sponsorship a contest over which outside nation the movement trusts. The source also invokes the 1836 Texas parallel as the kind of political relationship the system is meant to evoke rather than a simple purchase of rebellion.

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Diplomacy]] - Petitions, offers and everything like them are diplomacy's, not secession's  <!-- GATES, Round 1 ruling 50, docs/design/secession-ideation.md:1486 -->
- [[Diplomatic states]] - Being seen to fund somebody's rebels is remembered, and worse than recognising them *(unverified)*  <!-- FEEDS, Round 1, S71, docs/design/secession-ideation.md:892 (inside ruling 21's section) -->
- [[Economy]] - Every quarter you pay is a quarter not spent on your own country  <!-- COSTS, Round 1 ruling 21, docs/design/secession-ideation.md:876 -->
- [[Hostility]] - Funding rebels inside a neighbour is one of the five roads to hostility  <!-- TRIGGERS, Round 2 ruling 4, cause 4, docs/design/conquest-ideation.md:735 -->
- [[Movements]] - Your money makes the movement grow faster on ground you do not hold  <!-- FEEDS, Round 1 ruling 21, docs/design/secession-ideation.md:876 -->
- [[Reunification contests]] - Dallas can buy the argument over Texas instead of fighting it  <!-- FEEDS, Round 1 ruling 21, docs/design/secession-ideation.md:876 -->
<!-- SEEDED:edges END -->


## Questions for the designer

- **Petition threshold:** ruling 47 requires it to be below the movement's declaration/secession threshold, but no value has been set.
- **Refusal clock:** ruling 49 establishes delayed consequences for repeated refusal but does not set the number of refusals or turns.
- **Competition outcome:** the rules say several nations can compete for one movement but do not yet define exactly how the movement chooses among multiple willing backers.

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Secession#Secession ruling 21]] | a nation can fund a movement, and it is a standing commitment rather than a move. | ruled, not built |
| [[Rulings - Secession#Secession ruling 47]] | a movement approaches a nation; the nation does not simply choose. | ruled, not built |
| [[Rulings - Secession#Secession ruling 48]] | several nations can be petitioned, and they compete for it. | ruled, not built |
| [[Rulings - Secession#Secession ruling 49]] | refusing costs nothing immediately and everything eventually. | ruled, not built |
| [[Rulings - Secession#Secession ruling 50]] | petitions and everything like them belong to diplomacy. | ruled, not built |

*5 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `65dd3ef` (2026-09-11).*
<!-- GENERATED:sources END -->
