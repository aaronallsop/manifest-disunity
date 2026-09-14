---
title: Peace treaty
topic: diplomacy
tags:
  - diplomacy/peace-treaty
  - #military
  - round/2
kind: entity
built: designed only — but the shape exists. Two other treaty kinds and an aid mechanism are already built, so a standing promise between nations is something the save format holds. There is no peace treaty and no war for one to end. Flag for Aaron: the design document still says there are no treaties and no aid, which is stale against the code.
status: written
---

# Peace treaty

> [!abstract] At a glance
> **System:** [[Diplomacy]]
> **In the game today:** designed only — but the shape exists. Two other treaty kinds and an aid mechanism are already built, so a standing promise between nations is something the save format holds. There is no peace treaty and no war for one to end. Flag for Aaron: the design document still says there are no treaties and no aid, which is stale against the code.
> **Decided in:** Military
> **This page:** written

*The first standing obligation in the game — four levers and no more, a term after which it lapses harmlessly back into Peace, a repayment capped against the proposer's own war costs, and a breach that turns every neighbour but your allies hostile in a single turn.*

## What it is

A peace treaty is the agreement that actually ends a war. It decides what occupied ground is kept, what repayment is owed, whether trade is forced on particular terms, and how long the settlement remains binding before the relationship returns to ordinary Peace.

## How it works in the game

A [[War]] does not end simply because the fighting stops. It ends when the two sides sign an agreement, and either side is allowed to refuse terms and let the conflict continue ([[Rulings - Military#Military ruling 6]]).

A treaty has **four levers and no more** ([[Rulings - Military#Military ruling 15]]):

1. **Territory** — which occupied Areas the new holder keeps. Signing converts their wartime tenure into ordinary occupied tenure ([[Rulings - Military#Military ruling 13]]).
2. **Repayment** — money demanded from the other side, capped against the proposer's own war costs ([[Rulings - Military#Military ruling 22]]).
3. **Forced trade deals** — a trade arrangement imposed as part of the settlement rather than freely negotiated.
4. **Duration** — how long the treaty remains in force before it expires normally back into Peace.

The repayment cap exists so war cannot become a money-farming strategy. Ruling 22 settles the ambiguous pronoun in the earlier ruling: the basis is the **war costs of the nation sending the treaty**, not automatically the winner's or loser's costs ([[Rulings - Military#Military ruling 22]]). What counts as the complete economic cost of war still belongs to the economy design, so the cap cannot yet be fully priced ([[Rulings - Military#Military ruling 23]]).

Treaties are tabled during a [[Cease-fire]]. Both sides submit terms before the pause expires; the defender's treaty is considered first ([[Rulings - Military#Military ruling 33]]). The defender's own submission is the only counter-offer, so there is exactly one round rather than repeated haggling ([[Rulings - Military#Military ruling 34]]). Both sides write their terms blind ([[Rulings - Military#Military ruling 35]]), and tabling the required treaty is free rather than consuming the turn action ([[Rulings - Military#Military ruling 36]]).

If no treaty is signed, the cease-fire falls to [[Hostility|Hostile]] rather than automatically restarting War ([[Rulings - Military#Military ruling 8]]).

A treaty that expires normally returns the pair to Peace. Hostility by itself cannot be settled with a peace treaty; it cools through time and diplomacy instead ([[Rulings - Military#Military ruling 21]]).

Breaking a treaty is costly. Any of the recognised ways to break it receive the same treatment: every neighbouring nation except the breaker’s allies becomes Hostile immediately ([[Rulings - Military#Military ruling 28]]; [[Rulings - Military#Military ruling 41]]).

Peace treaties are designed but not built.

## The story behind it

The military source's worked example has Utah invade Idaho and fail to get the settlement it wants. Idaho can answer with terms that reflect what the war cost it, while Utah writes its own offer without seeing Idaho's. The treaty matters because it does more than announce that shooting stopped: it converts held wartime ground into land the occupier may continue trying to integrate.

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Alliances]] - Allies are the one exception; friendship insulates you from your own bad faith  <!-- GATES, Round 2 ruling 28, docs/design/conquest-ideation.md:1947 -->
- [[Diplomatic states]] - When its term runs out the pair simply goes back to peace  <!-- FEEDS, Round 2 ruling 7, docs/design/conquest-ideation.md:802 -->
- [[Economy]] - Repayment is capped against what the war cost whoever sent the terms  <!-- COSTS, Round 2 rulings 15 and 22, docs/design/conquest-ideation.md:1081 and :1569 -->
- [[Federation]] - A federation makes peace as one; a member wanting out must leave first  <!-- GATES, Round 3 ruling 35, docs/design/politics-ideation.md:2128 -->
- [[Hostility]] - Break one and every neighbour but your allies turns hostile at once  <!-- TRIGGERS, Round 2 ruling 28, docs/design/conquest-ideation.md:1947 -->
- [[Occupation]] - Signing is what turns ground you are standing on into ground you own  <!-- GATES, Round 2 ruling 13, docs/design/conquest-ideation.md:1006-1031 -->
- [[Playing]] - The first place the game punishes you for misreading a person, not a number  <!-- COSTS, Round 2 ruling 35, docs/design/conquest-ideation.md:2341-2356 -->
- [[War]] - Refusing terms is allowed, and a war can run on because somebody said no  <!-- GATES, Round 2 ruling 6, docs/design/conquest-ideation.md:789 -->
<!-- SEEDED:edges END -->


## Questions for the designer

- **What counts as "war costs":** ruling 22 defines whose costs cap repayment, but ruling 23 explicitly hands the full accounting definition to the economy round.
- **Treaty duration values:** the existence of a term is ruled; the actual durations remain tunable.
- **Blind-offer information:** the design has not yet fixed exactly what information a player may inspect while writing the sealed treaty.
- **Neighbour punishment saturation:** permanent Hostile neighbours cannot become more Hostile when a treaty is broken. The source recommends using the existing `reneged` memory to carry extra cost, but that recommendation was not separately ruled.
- **Generated source metadata:** most of the late military rulings on this page are live despite being labelled superseded in the generated table.

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Military#Military ruling 6]] | a war ends only by agreement, and refusing is allowed. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 7]] | every state has an exit, and three of the four are clocks. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 8]] | a cease-fire ends in a negotiation, and its default is Hostile rather than War. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 13]] | ground you take is yours immediately, but it is held under a flag, and there are three flags. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 15]] | what goes in a peace treaty, and what refusing one costs. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 21]] | hostility is resolved by time and by diplomacy, never by a treaty. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 22]] | the repayment cap is measured against the war costs of whoever sends the treaty. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 23]] | the cost of a war belongs to the economy of war; and an Area under attack produces nothing that turn, whether or not it falls. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 28]] | breaking a peace treaty turns every neighbour but your allies hostile, at once. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 29]] | a nation may declare war straight from Peace, and the reason is the whole ladder. | ruled, not built |
| [[Rulings - Military#Military ruling 33]] | both sides table a treaty before the cease-fire ends, and the defender chooses first. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 34]] | the defender's own tabled treaty is the counter, and there is exactly one round of offers. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 35]] | the two treaties are written blind. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 36]] | tabling a treaty is free, and C116 is amended. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 41]] | the seven outstanding defaults are confirmed as written. | ruled, not built |

*15 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `65dd3ef` (2026-09-11).*
<!-- GENERATED:sources END -->
