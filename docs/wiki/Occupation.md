---
title: Occupation
topic: military
tags:
  - military/occupation
  - #people
  - round/2
kind: mechanic
built: partial. Occupation upkeep is built and scales superlinearly with how much you hold and with per-Area hostility, and there is a single authoritative function defining whose soil is whose. But home ground is a set stamped at birth with no route from occupied to home, so the ruling that opens that route is a deliberate one-line change to the one function everything else is told to ask. No occupied-war / occupied / occupied-movement flag exists anywhere in js/.
status: needs writing
---

# Occupation

> [!abstract] At a glance
> **System:** [[Military]]
> **In the game today:** partial. Occupation upkeep is built and scales superlinearly with how much you hold and with per-Area hostility, and there is a single authoritative function defining whose soil is whose. But home ground is a set stamped at birth with no route from occupied to home, so the ruling that opens that route is a deliberate one-line change to the one function everything else is told to ask. No occupied-war / occupied / occupied-movement flag exists anywhere in js/.
> **Decided in:** Military
> **This page:** not yet written

*Ground you hold that is not your own soil — the three flags it can be held under, what each of them forbids, what it costs per turn to keep quiet, and the one long route by which it stops being occupied and becomes your country.*

## What it is

<!-- WRITER: one short paragraph, plain language. What is this, to somebody playing? -->

## How it works in the game

<!-- WRITER: the mechanism. Link other pages inline as you write - "you cannot trade with a
     nation you are at [[War|war]] with" - because those inline links are what draws the graph.
     Cite the ruling behind each claim from the Sources table at the foot of this page. -->

## The story behind it

<!-- WRITER: the in-world explanation. Raw material found: yes — Appalachia holding all fifteen of West Virginia's Areas, Franklin's homeland reaching into six states, and Houston already owing the occupation bill on western Louisiana at turn 0. The page also carries the round's largest change to what conquest MEANS: conquest becomes a luxury of the prosperous. -->

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Alliances]] - Your allies will not route cargo across ground you are still fighting over  <!-- BLOCKS, Round 2 ruling 13, docs/design/conquest-ideation.md:1016 -->
- [[Authority]] - A country that governs by garrison has announced it cannot govern otherwise  <!-- COSTS, DESIGN.md:370 -->
- [[Economy]] - Held ground costs more the more of it you hold, and the curve bends upward  <!-- COSTS, DESIGN.md:491-493 — superlinear surcharge, treasury into deficit near 110 occupied Areas -->
- [[Grievance]] - Ground held while the war runs raises unrest and hurts the economy badly  <!-- FEEDS, Round 2 ruling 13, docs/design/conquest-ideation.md:1016 (the occupied-war row) -->
- [[Peace treaty]] - The treaty is the title deed; without it the ground stays under a soldier's flag  <!-- GATES, Round 2 ruling 13, docs/design/conquest-ideation.md:1006-1031 -->
- [[People]] - Conquered people become yours only if life here is better than life there  <!-- GATES, Round 2 ruling 26, docs/design/conquest-ideation.md:1818 (and C109 confirmed by ruling 41) -->
- [[Resistance]] - Ground that resists being governed is no harder to take and far dearer to keep  <!-- COSTS, Round 1 ruling 32, docs/design/secession-ideation.md:1109 -->
- [[The board]] - The front line is the pale part of your own country on the map  <!-- FEEDS, Round 2, C79, docs/design/conquest-ideation.md:1043 -->
<!-- SEEDED:edges END -->

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Military#Military ruling 10]] | ground changes hands at the settlement, not turn by turn. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 13]] | ground you take is yours immediately, but it is held under a flag, and there are three flags. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 15]] | what goes in a peace treaty, and what refusing one costs. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 26]] | occupied ground eventually becomes your country, and how fast depends on whether life got better. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 31]] | three kinds of base, on the map as geography; and no nuclear weapons. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 41]] | the seven outstanding defaults are confirmed as written. | ruled, not built |

*6 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `7d167a6` (2026-09-11).*
<!-- GENERATED:sources END -->
