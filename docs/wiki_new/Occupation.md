---
title: Occupation
topic: military
tags:
  - military/occupation
  - #people
  - round/2
kind: mechanic
built: partial. Occupation upkeep is built and scales superlinearly with how much you hold and with per-Area hostility, and there is a single authoritative function defining whose soil is whose. But home ground is a set stamped at birth with no route from occupied to home, so the ruling that opens that route is a deliberate one-line change to the one function everything else is told to ask. No occupied-war / occupied / occupied-movement flag exists anywhere in js/.
status: written
---

# Occupation

> [!abstract] At a glance
> **System:** [[Military]]
> **In the game today:** partial. Occupation upkeep is built and scales superlinearly with how much you hold and with per-Area hostility, and there is a single authoritative function defining whose soil is whose. But home ground is a set stamped at birth with no route from occupied to home, so the ruling that opens that route is a deliberate one-line change to the one function everything else is told to ask. No occupied-war / occupied / occupied-movement flag exists anywhere in js/.
> **Decided in:** Military
> **This page:** written

*Ground you hold that is not your own soil — the three flags it can be held under, what each of them forbids, what it costs per turn to keep quiet, and the one long route by which it stops being occupied and becomes your country.*

## What it is

Occupation is the condition of ground a nation controls but has not yet fully absorbed as ordinary home territory. The map changes as soon as the ground is taken, but the way it is held determines what can be done with it and how much political and economic trouble it causes.

## How it works in the game

Winning an attack changes the visible border immediately, but the new ground carries a tenure flag rather than becoming ordinary home ground at once ([[Rulings - Military#Military ruling 10]]; [[Rulings - Military#Military ruling 13]]).

The design defines three occupation flags at the moment of conquest ([[Rulings - Military#Military ruling 13]]):

- **`occupied-war`** — ground taken while the war is still unsettled. It creates heavy unrest and economic damage. The occupier may use it for its own trade, but cannot grant that occupied ground to other nations as a transit route.
- **`occupied`** — ground the occupier keeps after a [[Peace treaty]] is signed. Ordinary trade can use it again, but occupation penalties remain.
- **`occupied-movement`** — ground where the matching movement is sufficiently strong and the occupier is that movement's nation, representing liberation rather than ordinary conquest.

The treaty changes **tenure**, not the visible border. Territory kept in the settlement moves from `occupied-war` to `occupied`; in that sense the treaty acts as the title deed for the conquest ([[Rulings - Military#Military ruling 13]]; [[Rulings - Military#Military ruling 15]]).

The source's 50% threshold for `occupied-movement` is explicitly an estimated placeholder rather than a tuned value. It also sits above the 0.40 Area-secession line, meaning much of that ground would already be politically capable of leaving on its own. That relationship needs deliberate tuning rather than being treated as two unrelated numbers.

Occupation is not permanent. Held ground can eventually become ordinary home ground, and the speed depends on whether life under the new state is better than under the old one — specifically the relative Quality of Life the population experiences ([[Rulings - Military#Military ruling 26]]). The comparison uses the former country **as it exists now**; if that country disappears, that comparison drops out, a default later confirmed by ruling 41 ([[Rulings - Military#Military ruling 41]]).

This makes conquest expensive beyond the battlefield. The nation must survive the unrest, economic penalties and cost of holding the ground long enough for integration to occur. [[Military bases]] inside the territory change hands with the geography and can therefore add strategic value to occupation ([[Rulings - Military#Military ruling 31]]).

The occupation flags and conversion to home ground are not implemented. The current code stamps home ground at birth and never changes it, which directly conflicts with ruling 26.

## The story behind it

The Shattering already leaves examples of countries holding ground that is politically awkward. Houston controls western Louisiana; Appalachia's relationship to West Virginia and Franklin's cross-state homeland show why a border can move before the people living behind it have become ordinary citizens of the new state. The design deliberately makes conquest a luxury of governments able to keep life working afterward rather than merely governments able to win a roll.

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


## Questions for the designer

- **`occupied-movement` threshold:** 50% is explicitly a placeholder and should be tuned against the 40% secession threshold.
- **Integration timing:** ruling 26 says Quality of Life speeds or slows integration but does not provide the base time or modifier curve.
- **Occupation cost formula:** the political/economic penalties are conceptually ruled, but exact upkeep belongs to the economic/mechanics specification.
- **Implementation conflict:** current `isHomeGround` is permanent; ruling 26 requires occupied ground eventually to enter that set.
- **Generated source metadata:** rulings 26 and 31 are live despite being marked superseded.

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

*Generated by `build/build_wiki.py` from commit `65dd3ef` (2026-09-11).*
<!-- GENERATED:sources END -->
