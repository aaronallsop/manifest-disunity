---
title: Diplomatic states
topic: diplomacy
tags:
  - diplomacy/diplomatic-states
  - #military
  - round/2
kind: concept
built: designed only — nothing in js/ stores any state between two nations. What exists is a dated, decaying, directed list of memory kinds, which answers 'what have they done to us' and not 'what are we to each other'. Verified this run: the only match for 'Hostile' in js/ is a display label on that list.
status: needs writing
---

# Diplomatic states

> [!abstract] At a glance
> **System:** [[Diplomacy]]
> **In the game today:** designed only — nothing in js/ stores any state between two nations. What exists is a dated, decaying, directed list of memory kinds, which answers 'what have they done to us' and not 'what are we to each other'. Verified this run: the only match for 'Hostile' in js/ is a display label on that list.
> **Decided in:** Military
> **This page:** not yet written

*The six live states a pair of nations is always in — Peace, Wary, Peace-treaty, Hostile, Cease-fire, War — plus Subject and Allied, how a pair moves between them, and why the state is one shared fact rather than two separate feelings.*

## What it is

<!-- WRITER: one short paragraph, plain language. What is this, to somebody playing? -->

## How it works in the game

<!-- WRITER: the mechanism. Link other pages inline as you write - "you cannot trade with a
     nation you are at [[War|war]] with" - because those inline links are what draws the graph.
     Cite the ruling behind each claim from the Sources table at the foot of this page. -->

## The story behind it

<!-- WRITER: the in-world explanation. Raw material found: yes — Aaron's ruling that all five Texan states start hostile, the thirty-three opening quarrels, and Oregon and Greater Idaho as the worked pair. This is the page every other diplomacy page reads before it does anything, and the transition table is the one diagram a player needs. -->

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Alliances]] - You cannot ally with somebody you are hostile toward, nor fight an ally  <!-- GATES, Round 2 ruling 27, docs/design/conquest-ideation.md:1892 -->
- [[Cease-fire]] - A cease-fire has a fixed term and three ways out of it  <!-- GATES, Round 2 rulings 7 and 8, docs/design/conquest-ideation.md:802 and :832 -->
- [[Economy]] - Each state is a short list of what you may not do, and trade is on it  <!-- GATES, Round 2 ruling 2, docs/design/conquest-ideation.md:100-117 -->
- [[Federation]] - Inside a federation everybody is at peace, so the permanent quarrels must stay outside  <!-- CONTRADICTS, Round 3 rulings 30 and 31, docs/design/politics-ideation.md:1940 and :1976 -->
- [[Hostility]] - Hostility cools on a clock into wary, and wary into peace  <!-- GATES, Round 2 rulings 7 and 17, docs/design/conquest-ideation.md:802 and :1132 -->
- [[Peace treaty]] - A treaty runs its term and then quietly becomes peace again  <!-- GATES, Round 2 ruling 7, docs/design/conquest-ideation.md:802 -->
- [[Unions]] - A hostile neighbour cannot say yes; a wary one says yes less often  <!-- GATES, Round 3 ruling 17, docs/design/politics-ideation.md:1371 -->
- [[War]] - Any state can become war by one nation deciding it has  <!-- GATES, Round 2 rulings 7 and 29, docs/design/conquest-ideation.md:802 and :2019 -->
<!-- SEEDED:edges END -->

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Military#Military ruling 2]] | A war is a standing state, and it is one of seven. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 3]] | a cease-fire is temporary and carries a set number of turns. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 5]] | a state is shared, not one-sided. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 7]] | every state has an exit, and three of the four are clocks. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 8]] | a cease-fire ends in a negotiation, and its default is Hostile rather than War. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 17]] | a grudge fades on time, there is a sixth state between Hostile and Peace, and the reunification rivalries never fade at all. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 18]] | Hostile honours what is signed and permits nothing new. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 19]] | Austin is the legitimate Texas, and the other four are rebels. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 27]] | Allied is taken now and kept thin; Subject is deferred; and the soldiers you lend are a lever you set. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 29]] | a nation may declare war straight from Peace, and the reason is the whole ladder. | ruled, not built |
| [[Rulings - Military#Military ruling 32]] | five nations claim California, and Cascadia is not one of them. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 37]] | inherited hostility travels exactly one hop. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 39]] | what Wary costs is a percentage multiplier on acceptance, and the figure belongs to the design stage. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 40]] | a Wary neighbour's movements do NOT grow faster inside you. Off, not reduced. | **SUPERSEDED - do not state this as a rule** · ruled, not built |

*14 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `7d167a6` (2026-09-11).*
<!-- GENERATED:sources END -->
