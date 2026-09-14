---
title: Stateless society
topic: board
tags:
  - board/stateless-society
  - #secession
  - round/1
  - round/3
kind: entity
built: designed only — no ungoverned ground exists. Measured this run: 'stateless' appears in js/ only as a programming term and 'ungoverned' only in a comment about save documents; every Area belongs to a nation. The toll machinery it re-points IS built: transit.foreignCorridorToll and transit.rateMin both exist as tunables, and the corridor toll is already a cost that nobody receives rather than a transfer, which is exactly the shape this needs.
status: written
---

# Stateless society

> [!abstract] At a glance
> **System:** [[The board]]
> **In the game today:** designed only — no ungoverned ground exists. Measured this run: 'stateless' appears in js/ only as a programming term and 'ungoverned' only in a comment about save documents; every Area belongs to a nation. The toll machinery it re-points IS built: transit.foreignCorridorToll and transit.rateMin both exist as tunables, and the corridor toll is already a cost that nobody receives rather than a transfer, which is exactly the shape this needs.
> **Decided in:** Politics, Secession
> **This page:** written

*Ground with people on it and no government — the third tier of the board, the two ways it comes into being, the flat fees it charges to trade with or route through, why a movement grows there by attraction rather than by anger, and why it is prey rather than a country.*

## What it is

A stateless society is inhabited ground with no recognised national government. People still live, trade and organise there, but there is no state to negotiate with, defend the territory as a country, or absorb ordinary political blame.

## How it works in the game

Stateless ground is a third tier of the board rather than an empty tile. Trade and transit may pass through it, but the traveller pays flat charges instead of negotiating an agreement with a government ([[Rulings - Politics#Politics ruling 3]]).

The rules create stateless ground in more than one way. Some regions begin the game fragmented, with four or five local pieces painted and the opening dice deciding how many have coalesced ([[Rulings - Secession#Secession ruling 31]]). Ground can also become stateless after internal political collapse or a split in which no successor governs the whole region ([[Rulings - Politics#Politics ruling 20]]).

For enveloped or stranded territory, population decides whether a new state forms. **Over 500,000 people becomes a nation; under that becomes a stateless society** ([[Rulings - Politics#Politics ruling 5]]). This supersedes the earlier two-million-person rule and outcome in Politics ruling 4; that older threshold must not be used.

Movements can grow on stateless ground, but the psychology changes. There is no government to resent, so growth is based on attraction to the movement rather than grievance against a state ([[Rulings - Politics#Politics ruling 13]]).

Stateless societies can also emerge from a [[Civil war]]. When a region splits, some interior ground can go ungoverned while edge counties may prefer a neighbouring nation to either civil-war winner ([[Rulings - Politics#Politics ruling 20]]).

They are easier to attack politically because there is no recognised state, but holding the ground is not uniformly easy. Resistance is a general geographic property painted across the map, with the six stateless regions among the places where it matters most ([[Rulings - Secession#Secession ruling 33]]). The earlier blanket assumption that all stateless regions are equally hard to govern is dropped; armed-share data decides the local burden ([[Rulings - Secession#Secession ruling 38]]).

The federation transit design reuses the same logic of paying the ground crossed: fees attach to territory even when no national government is negotiating the passage ([[Rulings - Politics#Politics ruling 27]]).

The running game has no stateless tier; every Area currently belongs to a nation.

## The story behind it

Six regions are intended to open partly or wholly stateless: Arkansas, Wyoming, New Mexico, Kentucky, Ohio and Michigan. Wyoming can therefore charge the practical cost of crossing its communities even without a national government, while New Mexico can become unclaimed prey for neighbours. The source's intended tone is that the player is dealing with people and communities, not with a blank wilderness tile.

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Authority]] - No government means no treasury, no army, no elections, no foreign policy  <!-- BLOCKS, Round 3 ruling 3, docs/design/politics-ideation.md:351 -->
- [[Civil war]] - Two movements can bring a government down together and neither inherits it  <!-- FEEDS, Round 3 ruling 20, docs/design/politics-ideation.md:1472 -->
- [[Economy]] - Ten per cent to trade with them, five to pass through — and nobody collects it  <!-- COSTS, Round 3 ruling 3, docs/design/politics-ideation.md:351 -->
- [[Movements]] - With no government to push against or hold them down, movements grow unopposed  <!-- FEEDS, Round 3 ruling 13, docs/design/politics-ideation.md:1105 -->
- [[Nations of the Shattering]] - Stranded, then lawless, then organised, then a country — the whole life cycle  <!-- TRIGGERS, Round 3 rulings 5 and 13, docs/design/politics-ideation.md:470 and :1105 -->
- [[Resistance]] - Lawless ground is not uniformly hard to hold; the real data decides  <!-- FEEDS, Round 1 ruling 38, docs/design/secession-ideation.md:1247 (dropping ruling 32's blanket premise) -->
- [[The board]] - Lawless ground is the cheapest passage on the continent, and everyone routes through it  <!-- FEEDS, Round 3 ruling 3, docs/design/politics-ideation.md:351 -->
<!-- SEEDED:edges END -->


## Questions for the designer

- **Exact stateless toll figures:** Politics ruling 3 points to existing transit values, but these should be carried from the implementation/specification rather than re-invented in prose if the economy round changes them.
- **Fragment stocks:** the opening-fragment design needs Quality of Life/Authority/etc. or an alternative so movement growth has inputs; the current architecture has no stateless entity holding those stocks.
- **Old ruling 4:** fully superseded by ruling 5 on threshold and outcome. The generator's wording can mislead readers because other fragments of its idea survive elsewhere.
- **Resistance data:** the regional armed-share layer is designed but not yet baked into the game.

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Politics#Politics ruling 3]] | Ruling 3 — What a stateless society is, and what it costs to trade with one | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Politics#Politics ruling 4]] | Ruling 4 — Stranded ground goes stateless, and a movement can rise from it | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Politics#Politics ruling 5]] | Ruling 5 — Enveloped territory: over 500,000 it is a nation, under it a stateless society | ruled, not built |
| [[Rulings - Politics#Politics ruling 6]] | Ruling 6 — A coalition is a shared enemy, and it is measured as total movement share | ruled, not built |
| [[Rulings - Politics#Politics ruling 13]] | Ruling 13 — On ungoverned ground a movement grows by attraction, not grievance | ruled, not built |
| [[Rulings - Politics#Politics ruling 20]] | Ruling 20 — A split region goes ungoverned, and its edge counties choose a neighbour over the winner | ruled, not built |
| [[Rulings - Politics#Politics ruling 27]] | Ruling 27 — The 5% goes to the ground that is crossed, and direct neighbours pay half | ruled, not built |
| [[Rulings - Politics#Politics ruling 41]] | Ruling 41 — The three capped-out separatists get a ceiling above the line | ruled, not built |
| [[Rulings - Secession#Secession ruling 31]] | four or five fragments painted per region, and the dice decide how many have coalesced. | ruled, not built |
| [[Rulings - Secession#Secession ruling 32]] | stateless ground is no harder to take and dearer to hold. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Secession#Secession ruling 33]] | "resists being governed" is general, painted everywhere, heaviest on the six. | ruled, not built |
| [[Rulings - Secession#Secession ruling 38]] | the stateless regions are not uniformly hard to hold; the data decides. | ruled, not built |

*12 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `65dd3ef` (2026-09-11).*
<!-- GENERATED:sources END -->
