---
title: The federal remnant
topic: story
tags:
  - story/the-federal-remnant
  - #politics
  - round/3
kind: entity
built: designed only — there is no United States nation in the build. Measured this run: content/scenario-shattered.json partitions Texas, California and the Mormon Corridor and nothing else, and its own blurb says the country has already come apart. No posture toward the old country and no seeded history of losses exist.
status: written
---

# The federal remnant

> [!abstract] At a glance
> **System:** [[Story]]
> **In the game today:** designed only — there is no United States nation in the build. Measured this run: content/scenario-shattered.json partitions Texas, California and the Mormon Corridor and nothing else, and its own blurb says the country has already come apart. No posture toward the old country and no seeded history of losses exist.
> **Decided in:** Politics
> **This page:** written

*What is left of the United States after the Shattering — why it opens weaker than its age says it should, and the clock it cannot stop as province after province stops waiting for it.*

## What it is

The federal remnant is what remains of the old United States government after the Shattering. It is not treated as a normal untouched great power: its losses, failed promises and shrinking claim to legitimacy are meant to be visible in the world around it.

## How it works in the game

The remnant's weakness is represented through the same systems that weaken any other government rather than through a special arbitrary penalty. Recent territorial losses, age, tenure and the state of the country are meant to make it open weak because of what happened to it ([[Rulings - Politics#Politics ruling 24]]).

A nation's stance toward the old United States is **read from the movements and political facts around it**, not stored as a separate loyalty flag ([[Rulings - Politics#Politics ruling 23]]). In particular, Rejoin- and Reunify-type movements can reveal whether people still imagine a future inside the old country.

That gives the remnant a clock it cannot fully control. As movements change their minds and stop seeking restoration, the old country's plausible constituency shrinks. A movement that changes its objective because of broken promises counts those failures and, once it changes, never changes back ([[Rulings - Politics#Politics ruling 22]]). The number of broken promises required has not yet been set.

None of this is implemented today: the running scenario has no federal-remnant nation and the movement data does not yet contain the verb field the posture-reading rule requires.

## The story behind it

The story material describes public trust in Washington collapsing as local governments step into the vacuum. Greater Idaho is an example of a movement that did not necessarily begin by wanting the United States gone but can stop waiting for federal recovery as promises fail. Around Washington itself, martial law is declared in the counties surrounding the capital to prevent a coup, reinforcing the sense that the remnant begins the game politically exhausted rather than merely territorially smaller.

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Authority]] - It opens weak because everything it lost is written into its record  <!-- COSTS, Round 3 ruling 24, docs/design/politics-ideation.md:1685 -->
- [[Diplomacy]] - Does Washington open recognising nobody, and cut itself off from everyone? *(unverified)*  <!-- FEEDS, docs/design/diplomacy-ideation.md:28-31 (round 5 inbox, question 4) -->
- [[Movement demands]] - Every broken promise abroad is a province that stops waiting, for good  <!-- FEEDS, Round 3 rulings 22 and 23, docs/design/politics-ideation.md:1594 and :1649 -->
- [[Movements]] - Govern well and provinces grow movements that want to come back  <!-- FEEDS, Round 3 ruling 23, docs/design/politics-ideation.md:1649; Round 1 ruling 42, secession-ideation.md:1319 -->
- [[Playing]] - It plays against a clock it cannot stop, which nothing else in the game does  <!-- COSTS, Round 3 ruling 23, docs/design/politics-ideation.md:1649 -->
- [[Reunification contests]] - The old union is one of the four things the board is fighting to restore  <!-- FEEDS, Round 1 ruling 19, docs/design/secession-ideation.md:818 -->
- [[Story]] - Trust in Washington collapsed and local powers filled the gap  <!-- EXPLAINS, Round 3 ruling 24, docs/design/politics-ideation.md:1685; secession-ideation.md §8 inbox item 5 -->
<!-- SEEDED:edges END -->


## Questions for the designer

- **Broken-promise threshold:** ruling 22 deliberately leaves the number unset.
- **Federal-remnant geography and government:** the political rules assume a remnant exists, but the current scenario data has no such nation. Its exact opening territory and playable status need to be fixed in the Story/board implementation pass.

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Politics#Politics ruling 22]] | Ruling 22 — The movement that changes its mind counts broken promises, and never changes back | ruled, not built |
| [[Rulings - Politics#Politics ruling 23]] | Ruling 23 — A nation's stance toward the old country is read, not stored — and it gives the remnant a clock it cannot stop | ruled, not built |
| [[Rulings - Politics#Politics ruling 24]] | Ruling 24 — The remnant opens weak because its losses are written into the world, not because a number says so | ruled, not built |

*3 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `65dd3ef` (2026-09-11).*
<!-- GENERATED:sources END -->
