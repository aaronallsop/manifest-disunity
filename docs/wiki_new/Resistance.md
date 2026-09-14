---
title: Resistance
topic: military
tags:
  - military/resistance
  - #people
  - round/1
kind: mechanic
built: designed only. Occupation upkeep today reads a hostility function that is purely the largest organised movement's share, so ground with no movement on it is currently the cheapest on the continent to hold, which is the opposite of the intent. Measured this run: data/areas.json is an Area-membership file with no armed-share field, and build/raw/ holds no firearm file — the workbook Aaron downloaded by hand never reached the repository.
status: written
---

# Resistance

> [!abstract] At a glance
> **System:** [[Military]]
> **In the game today:** designed only. Occupation upkeep today reads a hostility function that is purely the largest organised movement's share, so ground with no movement on it is currently the cheapest on the continent to hold, which is the opposite of the intent. Measured this run: data/areas.json is an Area-membership file with no armed-share field, and build/raw/ holds no firearm file — the workbook Aaron downloaded by hand never reached the repository.
> **Decided in:** Secession
> **This page:** written

*How hard a piece of ground is to govern whoever governs it — armed capacity multiplied by ideological willingness — and the firearm data the capacity half is supposed to be built from.*

## What it is

Resistance is how difficult a piece of ground is to govern against the wishes of the people living there. It combines the population's practical capacity to resist with its political willingness to resist the government that currently holds it.

## How it works in the game

Resistance is a general property of geography, not something that exists only in stateless regions. It is painted across the whole map, with some of the intended stateless regions among the places where it is especially important ([[Rulings - Secession#Secession ruling 33]]).

The core formula is **capacity × willingness** ([[Rulings - Secession#Secession ruling 34]]). Capacity is based on the estimated armed share of the population. Willingness is ideological: people are more willing to resist a government politically distant from them and less willing to resist one they broadly agree with ([[Rulings - Secession#Secession ruling 34]]).

The armed-share estimate is built from state-level firearm-ownership data and then apportioned geographically using the settlement/population method described in the secession design ([[Rulings - Secession#Secession ruling 35]]). The source is the **RAND State-Level Firearm Ownership Database**, version 1.0, 1 April 2020, pulled once during the build process and baked into game data rather than fetched at runtime ([[Rulings - Secession#Secession ruling 36]]).

The District of Columbia has no directly comparable value in that source and is therefore assigned **6% by hand**. The ruling insists that this be visibly labelled as an estimate rather than presented as a RAND measurement ([[Rulings - Secession#Secession ruling 37]]).

The design originally assumed stateless regions would uniformly be harder to hold. The measured data did not support that premise, so the blanket claim is dropped. Local resistance is determined by the data instead; Wyoming can be difficult while another stateless region may not be ([[Rulings - Secession#Secession ruling 38]]). The earlier ruling 32 therefore survives only in the idea that holding hostile ground should cost something, not in the claim that every stateless region has the same inherent resistance.

The armed-share layer and per-Area resistance value are not implemented. Current occupation cost is driven by organised movement hostility, which can actually make unorganised stateless ground cheaper to occupy — the opposite of the intended mechanic.

## The story behind it

The source treats resistance more as a portrait of the continent than as a single story event. The regional medians produce a recognisable political geography: heavily armed rural regions sit high, dense coastal cities low. Occupation then turns that map into consequences — the same conqueror can find one piece of ground relatively quiet and another enormously expensive to govern.

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Civil war]] - An armed population is who a militia is made of *(unverified)*  <!-- FEEDS, Round 3 ruling 7, docs/design/politics-ideation.md:576 -->
- [[Ideology]] - An armed county governed by people it agrees with is quiet  <!-- FEEDS, Round 1 ruling 34, docs/design/secession-ideation.md:1126 -->
- [[Military]] - The armed share is the ceiling on what anybody here can put in the field *(unverified)*  <!-- FEEDS, Round 1 ruling 34, docs/design/secession-ideation.md:1126 -->
- [[Occupation]] - How hard a place is to govern is a fact about the place, not about you  <!-- COSTS, Round 1 rulings 32 and 33, docs/design/secession-ideation.md:1109 and :1120 -->
- [[People]] - Capacity is how many people here are armed, spread by how rural they are  <!-- FEEDS, Round 1 ruling 35, docs/design/secession-ideation.md:1138 -->
- [[Stateless society]] - Lawless ground turned out slightly less armed than everywhere else, not more  <!-- CONTRADICTS, Round 1 ruling 38, docs/design/secession-ideation.md:1247 (measured: 44.6% against 46.9%) -->
- [[The board]] - It is painted everywhere, heaviest on the six lawless regions  <!-- FEEDS, Round 1 ruling 33, docs/design/secession-ideation.md:1120 -->
<!-- SEEDED:edges END -->


## Questions for the designer

- **RAND bake is missing from the repository:** the design session used a manually downloaded workbook, but the input file was not committed. The build needs a reproducible source file or documented acquisition step.
- **Apportionment weights:** ruling 35 records 0.60/0.40/0.30 weights derived from a citation that the design session itself says was not verified. Verify the source before treating those weights as final empirical values.
- **Generated source metadata:** ruling 36's dataset description was corrected later, but the core RAND/bake rule remains live.
- **Occupation linkage:** the final formula translating resistance into upkeep/civil unrest still needs to be carried into the military/economy implementation spec.

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Secession#Secession ruling 32]] | stateless ground is no harder to take and dearer to hold. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Secession#Secession ruling 33]] | "resists being governed" is general, painted everywhere, heaviest on the six. | ruled, not built |
| [[Rulings - Secession#Secession ruling 34]] | resistance is capacity times willingness, and willingness is ideological. | ruled, not built |
| [[Rulings - Secession#Secession ruling 35]] | how the armed share is estimated. | ruled, not built |
| [[Rulings - Secession#Secession ruling 36]] | the source is RAND, pulled once and baked, never fetched at runtime. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Secession#Secession ruling 37]] | the District of Columbia is assigned 6%, by hand, badged as an estimate. | ruled, not built |
| [[Rulings - Secession#Secession ruling 38]] | the stateless regions are not uniformly hard to hold; the data decides. | ruled, not built |

*7 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `65dd3ef` (2026-09-11).*
<!-- GENERATED:sources END -->
