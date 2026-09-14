---
title: Civil war
topic: military
tags:
  - military/civil-war
  - #secession
  - round/3
kind: mechanic
built: partial — the civil war resolver is complete, with three outcomes scored as a ratio rather than an absolute. But measured this run, its own header names three triggers and all three are annexation-based: the annexation flips the nation's plurality party, the annexed counties' output exceeds the nation's, or the annexed counties' population exceeds the nation's. There is no internal path to civil war. The county threshold exists as a tunable; the national bar the ruling asks for as a second tunable does not.
status: written
---

# Civil war

> [!abstract] At a glance
> **System:** [[Military]]
> **In the game today:** partial — the civil war resolver is complete, with three outcomes scored as a ratio rather than an absolute. But measured this run, its own header names three triggers and all three are annexation-based: the annexation flips the nation's plurality party, the annexed counties' output exceeds the nation's, or the annexed counties' population exceeds the nation's. There is no internal path to civil war. The county threshold exists as a tunable; the national bar the ruling asks for as a second tunable does not.
> **Decided in:** Politics
> **This page:** written

*What happens when a country is angry with itself everywhere at once — how every movement's share sums against the government holding them, the clock that starts past forty per cent, and the two different forties that measure two different things.*

## What it is

Civil war is the point at which internal movements stop being separate political problems and become a struggle over who governs the country. It is triggered by the combined share of movements that see the same government as their enemy, not simply by whichever single movement happens to be largest.

## How it works in the game

For civil-war pressure, movements with the same government as their common enemy are treated as a coalition. Their shares are **added together** rather than measuring only the strongest individual movement ([[Rulings - Politics#Politics ruling 6]]). The running game currently does the opposite and reads only the largest single movement share, so the implementation does not match the design.

Movement members are also removed from the government's military pool for this purpose. They are intended to join the movement militia rather than being counted as manpower available to the government they may soon fight ([[Rulings - Politics#Politics ruling 7]]).

Once total hostile movement share passes **40% of the nation**, the countdown to civil war begins ([[Rulings - Politics#Politics ruling 8]]). This national forty is a different dial from the **40% Area-level secession threshold**. One asks whether a particular Area leaves; the other asks whether the country as a whole is approaching internal war ([[Rulings - Politics#Politics ruling 10]]). The values may ultimately be tuned independently even though both are currently written as forty.

The running game's existing civil-war system is annexation-driven rather than movement-driven, so this internal path to civil war is not yet built.

When a civil war breaks geography apart, not every piece must belong to one of the two principal winners. A split region can leave interior ground ungoverned, while edge counties may choose a neighbouring nation over either civil-war side ([[Rulings - Politics#Politics ruling 20]]). That creates [[Stateless society|stateless societies]] as one possible consequence of internal collapse.

Federation membership widens the external military consequences of a civil conflict. An attack on one federation member is treated as war with all members ([[Rulings - Politics#Politics ruling 28]]), so a domestic split inside one member can potentially become an international problem depending on how the breakaway is recognised and who attacks whom. The exact interaction is not fully specified in these rulings.

## The story behind it

*Not yet written.*

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Military]] - A country half organised against itself fields half an army  <!-- COSTS, Round 3 ruling 7, docs/design/politics-ideation.md:576 (Oregon worked at 26/26: 8,202 against 8,886) -->
- [[Movements]] - The bigger a movement grows, the more of its people arm for it instead of you  <!-- FEEDS, Round 3 ruling 7, docs/design/politics-ideation.md:576 -->
- [[Nations of the Shattering]] - A civil war that goes badly enough puts new countries on the board  <!-- TRIGGERS, docs/design/IDEATION-PLAN.md:89 — "a civil war that goes badly makes new nations" -->
- [[Release valves]] - Past forty per cent the clock runs, and a government may simply give in  <!-- TRIGGERS, Round 3 rulings 8 and 9, docs/design/politics-ideation.md:608 and :648 -->
- [[Stateless society]] - Ground cut off by a civil war and too small to stand goes lawless  <!-- TRIGGERS, Round 3 rulings 4 and 5, docs/design/politics-ideation.md:410 and :470 -->
- [[Taking ground]] - Today the only thing that starts one is taking too much at once  <!-- GATES, js/civilwar.js:4-7 -->
- [[The board]] - A region nobody won goes ungoverned, and its edges pick a neighbour instead  <!-- FEEDS, Round 3 ruling 20, docs/design/politics-ideation.md:1472 -->
<!-- SEEDED:edges END -->


## Questions for the designer

- **Countdown duration:** ruling 8 says the countdown begins past the national threshold, but the number of turns before civil war is not stated in the page's closed sources.
- **Two 40% values:** ruling 10 explicitly treats the Area threshold and national civil-war threshold as separate tunables. They should not be coupled merely because both currently equal 0.40.
- **Implementation conflict:** the running game measures the strongest single movement rather than summed movement share and does not subtract movement members from government manpower.
- **Federation interaction:** collective defence is ruled, but the exact handling of a breakaway civil-war faction inside a federation needs an implementation rule.

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Politics#Politics ruling 6]] | Ruling 6 — A coalition is a shared enemy, and it is measured as total movement share | ruled, not built |
| [[Rulings - Politics#Politics ruling 7]] | Ruling 7 — Movement members join the militia, not the army | ruled, not built |
| [[Rulings - Politics#Politics ruling 8]] | Ruling 8 — Past 40% the countdown to civil war begins | ruled, not built |
| [[Rulings - Politics#Politics ruling 10]] | Ruling 10 — The two forties are two dials with two jobs, and the values go to the architect | ruled, not built |
| [[Rulings - Politics#Politics ruling 20]] | Ruling 20 — A split region goes ungoverned, and its edge counties choose a neighbour over the winner | ruled, not built |
| [[Rulings - Politics#Politics ruling 28]] | Ruling 28 — An attack on one member is a war with all of them | ruled, not built |

*6 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `65dd3ef` (2026-09-11).*
<!-- GENERATED:sources END -->
