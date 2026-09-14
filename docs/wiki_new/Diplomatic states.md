---
title: Diplomatic states
topic: diplomacy
tags:
  - diplomacy/diplomatic-states
  - #military
  - round/2
kind: concept
built: designed only — nothing in js/ stores any state between two nations. What exists is a dated, decaying, directed list of memory kinds, which answers 'what have they done to us' and not 'what are we to each other'. Verified this run: the only match for 'Hostile' in js/ is a display label on that list.
status: written
---

# Diplomatic states

> [!abstract] At a glance
> **System:** [[Diplomacy]]
> **In the game today:** designed only — nothing in js/ stores any state between two nations. What exists is a dated, decaying, directed list of memory kinds, which answers 'what have they done to us' and not 'what are we to each other'. Verified this run: the only match for 'Hostile' in js/ is a display label on that list.
> **Decided in:** Military
> **This page:** written

*The six live states a pair of nations is always in — Peace, Wary, Peace-treaty, Hostile, Cease-fire, War — plus Subject and Allied, how a pair moves between them, and why the state is one shared fact rather than two separate feelings.*

## What it is

A diplomatic state is the single shared condition describing what two nations currently are to one another. It determines which dealings are open, which are harder, and whether the pair may attack; directed memories and opinions can still differ even though the state itself is shared.

## How it works in the game

The redesigned state machine contains six live relationship states: **Peace, Wary, Peace-treaty, Hostile, Cease-fire and War**. [[Alliances|Allied]] and the future Subject relationship sit alongside them as additional formal relationships ([[Rulings - Military#Military ruling 2]]; [[Rulings - Military#Military ruling 27]]).

The state belongs to the pair. One nation cannot be Hostile while the other is Peace with it; their directed memories can differ, but the formal state is one shared fact ([[Rulings - Military#Military ruling 5]]).

**Peace** is the ordinary open relationship. A nation may even declare [[War]] directly from Peace; the ladder is not a mandatory sequence of worsening states before fighting becomes legal ([[Rulings - Military#Military ruling 29]]).

**Hostile** closes new agreements while honouring agreements already signed. Ordinary Hostility cools with time rather than requiring a peace treaty, and it steps down through **Wary** before returning to Peace ([[Rulings - Military#Military ruling 17]]; [[Rulings - Military#Military ruling 18]]).

**Wary** reopens interaction but applies a still-undecided percentage penalty to acceptance. The hostile-neighbour movement-growth effect switches off completely as soon as the pair reaches Wary ([[Rulings - Military#Military ruling 39]]; [[Rulings - Military#Military ruling 40]]).

A **Peace-treaty** state is a timed standing obligation created when a war is settled. When its term expires normally, the pair returns to Peace. Breaking it creates wider diplomatic punishment rather than simply ending the timer.

A **Cease-fire** is a timed pause inside a war. Its expiry procedure is the sealed [[Peace treaty]] exchange; if no treaty is signed, the pair becomes Hostile rather than immediately resuming War ([[Rulings - Military#Military ruling 3]]; [[Rulings - Military#Military ruling 8]]).

**War** is the state in which attacks are allowed. It ends only by agreement rather than by a hidden victory score.

Some [[Reunification contests|reunification rivals]] have Hostile as a permanent floor. Their relationship can rise to War, but ordinary cooling cannot carry them below Hostile while the contest remains live ([[Rulings - Military#Military ruling 17]]). Austin is the legitimate continuation of Texas for this purpose; the other four Texan claimants are breakaway governments ([[Rulings - Military#Military ruling 19]]).

Alliance-inherited Hostility travels exactly one hop and is the fastest-cooling Hostility in the game ([[Rulings - Military#Military ruling 37]]).

None of the redesigned diplomatic-state machine is currently implemented as a shared state object.

## The story behind it

The opening map does not begin diplomatically blank. The Texan successor states already inherit permanent Hostile floors from their contest, and the final claimant lists create thirty-three such opening rivalries. Oregon and Greater Idaho provide the smaller everyday example: a movement on one side of the border can sour a relationship long before either country chooses war.

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


## Questions for the designer

- **Wary acceptance penalty:** the magnitude is deliberately unset.
- **Subject:** the relationship is named but deferred; do not invent its state-machine rules here.
- **Generated source metadata:** many live military rulings on this page are falsely marked `SUPERSEDED`; the ruling index must be used instead.
- **State count wording:** early sources say seven states; later ruling 17 adds Wary, making six live states and eight total relationship categories when Allied/Subject are counted. Keep later terminology authoritative.

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

*Generated by `build/build_wiki.py` from commit `65dd3ef` (2026-09-11).*
<!-- GENERATED:sources END -->
