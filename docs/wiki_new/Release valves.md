---
title: Release valves
topic: politics
tags:
  - politics/release-valves
  - #secession
  - round/3
kind: mechanic
built: partial — the four original valves are built and already named to the player: release, autonomy, changing the ruling ideology, and garrison. NOT built: 'become them'; martial law, whose name measured this run appears nowhere in js/ or the design document; the referendum, likewise nowhere; and the six-verb table, since the data carries no verb field at all — only eight type values where the ruling wants five adjectives.
status: written
---

# Release valves

> [!abstract] At a glance
> **System:** [[Politics]]
> **In the game today:** partial — the four original valves are built and already named to the player: release, autonomy, changing the ruling ideology, and garrison. NOT built: 'become them'; martial law, whose name measured this run appears nowhere in js/ or the design document; the referendum, likewise nowhere; and the six-verb table, since the data carries no verb field at all — only eight type values where the ruling wants five adjectives.
> **Decided in:** Politics
> **This page:** written

*The five things a government can do about a movement — concede, concede less, become them, remove the want, suppress — set against the six things a movement can want, plus martial law and the referendum.*

## What it is

Release valves are the things a government can do when a movement is becoming dangerous. They let the government answer the underlying political want through concessions, policy change, political transformation or repression instead of treating secession as the only possible outcome.

## How it works in the game

The politics design reduces the response space to **five broad government moves** and matches them against the movement's six verbs rather than inventing a unique answer for every movement ([[Rulings - Politics#Politics ruling 11]]). The responses are: concede the demand, concede less than the full demand, become the movement politically, remove the want that is driving it, or suppress it.

A government can go as far as **giving up and joining the movement** rather than fighting it ([[Rulings - Politics#Politics ruling 9]]). No universal threshold forces that choice; it is a political option.

The "remove the want" response belongs to the movement's **adjective**, not its verb. In the later design there are five adjective categories — autonomist, cultural, ideological, resource and economic — each pointing toward a different kind of concession that can actually dissolve the pressure ([[Rulings - Politics#Politics ruling 11a]]).

This creates a known source conflict: several movement records still carry **religious** or **indigenous** adjectives, while ruling 11a says there are five. Those movement pages flag the discrepancy rather than silently mapping them.

Changing the government's political course uses [[The political board]]. A party can move; an ideology is a fixed position. The cost of changing course therefore comes from how far the governing party must travel rather than from moving the ideology itself ([[Rulings - Politics#Politics ruling 40]]).

**Martial law** is another valve. It means fewer political constraints rather than simply more soldiers, creating a temporary route between ordinary government and outright suppression ([[Rulings - Politics#Politics ruling 14]]). Whether declaring martial law consumes the ordinary turn action is intentionally deferred.

The round also identifies a **referendum** as the one genuinely new valve that was not already represented by another existing political action. It reuses the election machinery rather than creating a wholly separate simulation ([[Rulings - Politics#Politics ruling 21]]).

A [[Federation]] can itself be the answer to a union demand that cannot be granted as a full merger. A federation is not the same as a union: one state versus a union of states ([[Rulings - Politics#Politics ruling 32]]). The design therefore does not suppress union-seeking movements inside federations; it lets the federation become the compromise answer ([[Rulings - Politics#Politics ruling 33]]).

The ten-position political board, referendum, martial law and several verb/adjective links remain designed rather than built.

## The story behind it

The story material places martial law around Washington during the federal collapse, where the government tightens control in the counties surrounding the capital to prevent a coup. That is the intended texture of a release valve: the government is buying time and control at a political cost rather than simply adding military strength. Elsewhere, concessions can be less dramatic — recognition, self-rule, a share of resources or a policy change that makes the movement's original want disappear.

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Authority]] - A government that suspends an election has announced it cannot win one  <!-- COSTS, Round 3 ruling 14, docs/design/politics-ideation.md:1137 -->
- [[Civil war]] - Become one movement and every county that prefers another walks out  <!-- TRIGGERS, Round 3 ruling 9, docs/design/politics-ideation.md:648 -->
- [[Movements]] - Each valve removes a want — and only the want that matches it  <!-- BLOCKS, Round 3 ruling 11a, docs/design/politics-ideation.md:986; Round 1 ruling 40, secession-ideation.md:1289 -->
- [[Nations of the Shattering]] - Lose the referendum and the region leaves cleanly, a country from day one  <!-- TRIGGERS, Round 3 ruling 21, docs/design/politics-ideation.md:1547 -->
- [[People]] - Martial law buys quiet with liberties, at several times a garrison's rate  <!-- COSTS, Round 3 ruling 14, docs/design/politics-ideation.md:1137 -->
- [[The political board]] - Changing course is priced by how far your party has to move  <!-- FEEDS, Round 3 ruling 40, docs/design/politics-ideation.md:2265 -->
- [[The turn]] - Answering a movement is free; doing what it asked costs your action  <!-- COSTS, Round 3 rulings 12 and 19, docs/design/politics-ideation.md:1040 and :1458 -->
- [[Unions]] - The one concession that is an attempt rather than an act, and can fail  <!-- FEEDS, Round 3 ruling 15, docs/design/politics-ideation.md:1230 -->
<!-- SEEDED:edges END -->


## Questions for the designer

- **Adjective conflict:** ruling 11a says five adjectives, while the movement register still contains `religious` and `indigenous`. Decide whether those are exceptions, stale data, or mappings into the five categories.
- **Martial-law action cost:** deferred until the turn/action redesign.
- **Referendum procedure:** the ruling says to reuse election machinery, but trigger, franchise and exact consequences still need implementation detail.
- **Political-course costs:** the geometry is conceptually set by the political board, but final numbers belong to mechanics.
- **Generated source metadata:** rulings 11a and 14 are live despite the generated superseded label.

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Politics#Politics ruling 2]] | Ruling 2 — ten positions, authoritarians at both outer ends, the drift partition, and the two conditions. Recorded at P5 and P6, and in D186. | ruled, not built |
| [[Rulings - Politics#Politics ruling 9]] | Ruling 9 — A government can give up and join the movement | ruled, not built |
| [[Rulings - Politics#Politics ruling 11]] | Ruling 11 — The one table: five moves, six verbs, and the built valves were the answer all along | ruled, not built |
| [[Rulings - Politics#Politics ruling 11a]] | Ruling 11a — The "remove the want" column belongs to the ADJECTIVE, and there are five of them | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Politics#Politics ruling 14]] | Ruling 14 — Martial law: fewer rules, not more soldiers | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Politics#Politics ruling 21]] | Ruling 21 — Of round 1's four new valves, only one is new: the referendum | ruled, not built |
| [[Rulings - Politics#Politics ruling 32]] | Ruling 32 — A union is ONE state; a federation is a union OF states. They are different wants | ruled, not built |
| [[Rulings - Politics#Politics ruling 33]] | Ruling 33 — Nothing is suppressed: the federation IS the answer to a union nobody can give | ruled, not built |
| [[Rulings - Politics#Politics ruling 40]] | Ruling 40 — Three words for three things: ideology, party, movement | ruled, not built |

*9 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `65dd3ef` (2026-09-11).*
<!-- GENERATED:sources END -->
