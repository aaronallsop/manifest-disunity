---
title: War
topic: military
tags:
  - military/war
  - #diplomacy
  - round/2
kind: mechanic
built: designed only — there is no war between nations anywhere in the code. Measured this run: searching js/ for cease-fire, peace treaty, hostile or wary as a STATE returns exactly one hit, and it is a sentiment label on the relations panel. The only war-flagged code path is the civil-war county transfer.
status: written
---

# War

> [!abstract] At a glance
> **System:** [[Military]]
> **In the game today:** designed only — there is no war between nations anywhere in the code. Measured this run: searching js/ for cease-fire, peace treaty, hostile or wary as a STATE returns exactly one hit, and it is a sentiment label on the relations panel. The only war-flagged code path is the civil-war county transfer.
> **Decided in:** Military
> **This page:** written

*What a war is in this game — a standing state two nations live in rather than an event, who may declare one and from what footing, what it forbids while it runs, why there are no troop types, and why it can only be ended by agreement.*

## What it is

War is a standing diplomatic state between two nations in which they are allowed to attack one another's ground. It is intentionally not a separate tactical wargame: the important decisions are whether to fight, what one Area is worth attacking, and what the war does to the economy, diplomacy and people at home.

## How it works in the game

The framing rule for the military system is explicit: **this is not a war game**. Military mechanics exist to put pressure on the political and economic game rather than to become the main simulation ([[Rulings - Military#Military ruling 1]]).

War is one of the formal [[Diplomatic states|diplomatic states]] shared by a pair of nations ([[Rulings - Military#Military ruling 2]]). A country may declare war directly from Peace; it does not have to pass through Wary or Hostile first ([[Rulings - Military#Military ruling 29]]).

While at war, normal trade and corridor relationships are broken or unavailable. By contrast, [[Hostility]] honours existing agreements while refusing new ones, which makes the distinction between a quarrel and a war economically meaningful ([[Rulings - Military#Military ruling 18]]).

The military layer presented to the player stays simple. There are no troop types or movable stacks; an attack compares the attacker's Field force with the defender's Border force and gives a percentage chance of taking one Area ([[Rulings - Military#Military ruling 11]]; [[Rulings - Military#Military ruling 12]]).

Attacks are paid for before the roll, so failure loses the money and the turn already committed ([[Rulings - Military#Military ruling 14]]). An Area produces nothing on a turn when it is attacked whether or not it falls, making war a direct economic weapon as well as a territorial one ([[Rulings - Military#Military ruling 23]]).

The designed conquest brakes are consequences rather than arbitrary refusals. The old three-Area budget and annex cooldown are removed, leaving one Area per attack but no special waiting period ([[Rulings - Military#Military ruling 24]]). The old four-times-your-size shield is also removed; a small country may try to attack a giant, but terrible odds and cost make that choice dangerous ([[Rulings - Military#Military ruling 25]]).

Ground taken during the war changes colour immediately but remains under wartime occupation. The eventual settlement changes the tenure of ground that the attacker is allowed to keep ([[Rulings - Military#Military ruling 10]]).

A war does not end automatically when one side is ahead. It ends by agreement, and refusing an agreement is allowed ([[Rulings - Military#Military ruling 6]]). Refusal is not free because continuing war raises weariness and exposes governments to crises and elections.

The endgame runs through a [[Cease-fire]] and [[Peace treaty]]. Before the cease-fire expires, both sides table blind treaties; the defender is considered first, and tabling the mandatory offer is free ([[Rulings - Military#Military ruling 33]]; [[Rulings - Military#Military ruling 36]]).

Internal movements can also push a government toward war. [[Movement demands]] can tell a nation to expand or reconquer specific ground, but the player still experiences that pressure as a political demand rather than as an automatic military order ([[Rulings - Military#Military ruling 16]]).

The full war state, occupation flags, cease-fire and treaty system are not yet implemented as ruled.

## The story behind it

Several wars have already happened before turn one in the current Shattering story: Houston takes western Louisiana, federal forces move into West Virginia, Chicago takes north-west Indiana, and the Gulf fights for the panhandle and Pensacola. They matter less as military set pieces than as causes of the map, shortages, grudges and occupied populations the player inherits. That is the intended role of war throughout the game.

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Cease-fire]] - A war ends only when both sides agree, and refusing is allowed  <!-- GATES, Round 2 ruling 6, docs/design/conquest-ideation.md:789 -->
- [[Diplomatic states]] - You may declare straight from peace; the ladder is a cost, not a gate  <!-- FEEDS, Round 2 ruling 29, docs/design/conquest-ideation.md:2019 -->
- [[Economy]] - War prohibits trade and tears up the deals you had already signed  <!-- BLOCKS, Round 2 ruling 2, docs/design/conquest-ideation.md:113; C57 at :138. NOT BUILT — see the war/trade note. -->
- [[Federation]] - Declare against the federation's wishes and you leave it the same day  <!-- COSTS, Round 3 ruling 29, docs/design/politics-ideation.md:1905 -->
- [[Occupation]] - Ground you win is yours at once, but only under an occupier's flag  <!-- TRIGGERS, Round 2 rulings 10 and 13, docs/design/conquest-ideation.md:942 and :1006 -->
- [[Peace treaty]] - What the war cost you is what sets the bill you may present  <!-- FEEDS, Round 2 ruling 15, docs/design/conquest-ideation.md:1081; ruling 22 at :1569 -->
- [[People]] - A decade of fighting is paid for at home, and only peace repays it  <!-- COSTS, DESIGN.md:374 (war weariness); Round 2 ruling 23, conquest-ideation.md:1652 -->
- [[Taking ground]] - War is the state in which you are allowed to attack at all  <!-- GATES, Round 2 rulings 2 and 12, docs/design/conquest-ideation.md:113 and :959 -->
<!-- SEEDED:edges END -->


## Questions for the designer

- **War-cost accounting:** the economic definition of what a war costs is intentionally handed to the economy design; treaty repayment cannot be final until that accounting exists.
- **Combat modifier list:** technology, local support and other modifiers are acknowledged but not finalized.
- **War declaration action cost and exact weariness increments:** carry these from the mechanics specification rather than inferring them from the military concept page.
- **Generated source metadata:** many live military rulings are incorrectly marked superseded in this page's generated Sources table.

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Military#Military ruling 1]] | This is not a war game, and the arrows point the other way. | ruled, not built |
| [[Rulings - Military#Military ruling 2]] | A war is a standing state, and it is one of seven. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 6]] | a war ends only by agreement, and refusing is allowed. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 9]] | what Hostile costs. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 10]] | ground changes hands at the settlement, not turn by turn. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 11]] | war must be simple at the level the player touches it. | ruled, not built |
| [[Rulings - Military#Military ruling 12]] | how a fight resolves. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 14]] | an attack has two outcomes, and failure costs what you already spent. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 16]] | a movement makes DEMANDS, they are shown on a screen of their own, and every demand gets one of three answers. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 18]] | Hostile honours what is signed and permits nothing new. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 23]] | the cost of a war belongs to the economy of war; and an Area under attack produces nothing that turn, whether or not it falls. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 24]] | one Area per attack, and the per-turn cap and the cooldown both go. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 25]] | the four-times-your-size shield is removed. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 29]] | a nation may declare war straight from Peace, and the reason is the whole ladder. | ruled, not built |
| [[Rulings - Military#Military ruling 33]] | both sides table a treaty before the cease-fire ends, and the defender chooses first. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 36]] | tabling a treaty is free, and C116 is amended. | **SUPERSEDED - do not state this as a rule** · ruled, not built |

*16 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `65dd3ef` (2026-09-11).*
<!-- GENERATED:sources END -->
