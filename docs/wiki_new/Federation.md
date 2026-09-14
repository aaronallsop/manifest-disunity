---
title: Federation
topic: diplomacy
tags:
  - diplomacy/federation
  - #economy
  - round/3
kind: entity
built: designed only — measured this run, 'federation' appears in js/ only inside a comment about a nation that happens to be NAMED a federation on the leaderboard. The design document records that no treaty object exists at all, which is the smaller thing this would need first. This is the largest single new object any closed round has asked for.
status: written
---

# Federation

> [!abstract] At a glance
> **System:** [[Diplomacy]]
> **In the game today:** designed only — measured this run, 'federation' appears in js/ only inside a comment about a nation that happens to be NAMED a federation on the leaderboard. The design document records that no treaty object exists at all, which is the smaller thing this would need first. This is the largest single new object any closed round has asked for.
> **Decided in:** Politics
> **This page:** written

*A club of three or more states that stay states — a flat internal toll split with the club, an elected leader running a second budget on a short turn of its own, collective defence, and the politics that falls out of who pays in and who draws out.*

## What it is

A federation is a group of at least three nations that remain separate states while sharing some trade, defence and political institutions. Unlike a union, it does not erase its members into one country.

## How it works in the game

A federation is a formal political object with its own leader, budget and short turn. Member nations remain nations rather than becoming provinces of a single state ([[Rulings - Politics#Politics ruling 25]]; [[Rulings - Politics#Politics ruling 32]]).

Joining replaces the ordinary patchwork of negotiated internal corridors with a **flat internal toll**. The design figure is 10%; half stays with the ground being crossed and half goes to the federation ([[Rulings - Politics#Politics ruling 25]]; [[Rulings - Politics#Politics ruling 26]]; [[Rulings - Politics#Politics ruling 27]]). Direct neighbours pay half because no intermediate member territory is being crossed ([[Rulings - Politics#Politics ruling 27]]).

The arithmetic for routes that cross several federation members is still unresolved: the design calls the toll flat, while the running transit system normally compounds charges on what arrives. That distinction is explicitly flagged rather than silently chosen.

The federation also earns from commerce crossing its outside boundary. The design's **15% outside share** is split evenly among the members, giving small nations a material reason to remain in a larger federation rather than merely subsidising the biggest member ([[Rulings - Politics#Politics ruling 36]]).

Defence is collective. An attack on one member is a [[War]] with all of them ([[Rulings - Politics#Politics ruling 28]]). The federation negotiates peace as one body as well; a member that wants to make its own peace must leave the federation first ([[Rulings - Politics#Politics ruling 35]]).

Inside the federation, members are at Peace with every other member ([[Rulings - Politics#Politics ruling 30]]). This creates a collision with permanent [[Reunification contests|reunification rivalries]], which is handled by preventing those contest claimants from joining a union; the exact breadth of that modifier across federation membership still needs clarification ([[Rulings - Politics#Politics ruling 31]]).

Membership is voluntary. Existing members vote on admission, any member may ultimately leave, and three members is the minimum that still counts as a federation ([[Rulings - Politics#Politics ruling 34]]). A member whose petition to leave is refused can declare departure anyway and is then out; the consequences for its standing agreements remain a mechanics-stage question ([[Rulings - Politics#Politics ruling 29]]).

Joining trades domestic control for external weight: the member loses Authority and gains Influence ([[Rulings - Politics#Politics ruling 37]]). That cost is part of what distinguishes federation membership from an ordinary alliance.

Union-seeking movements are not suppressed simply because their country is in a federation. The federation itself is the political answer when a full merger cannot be granted ([[Rulings - Politics#Politics ruling 33]]).

No federation object or federation turn currently exists in the running game.

## The story behind it

The United States of New England supplies the clearest story-shaped example of several former states operating under one larger political identity without the wiki needing to pretend every internal distinction vanished. The Gulf material raises the same question from another direction: small states and regions need a reason to accept shared institutions, which is why the design gives them a direct share of outside revenue rather than only collective defence.

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Authority]] - Letting another country lead you costs authority and buys influence  <!-- COSTS, Round 3 ruling 37, docs/design/politics-ideation.md:2183 -->
- [[Economy]] - A flat ten per cent replaces every deal members had with each other  <!-- COSTS, Round 3 rulings 25, 26 and 27, docs/design/politics-ideation.md:1718, :1796, :1831 -->
- [[Hostility]] - Inside a federation you are at peace with every member. Full stop  <!-- BLOCKS, Round 3 ruling 30, docs/design/politics-ideation.md:1940 -->
- [[Release valves]] - It is the answer to a union you are forbidden to give  <!-- FEEDS, Round 3 ruling 33, docs/design/politics-ideation.md:2075 -->
- [[Reunification contests]] - At most one claimant may be in any federation, so the first to build locks the rest out  <!-- BLOCKS, Round 3 ruling 31, docs/design/politics-ideation.md:1976 and ruling 33 at :2075 -->
- [[The board]] - The gate-holders earn most and lose most, and the map decides which  <!-- FEEDS, Round 3 rulings 26 and 27, docs/design/politics-ideation.md:1796 and :1831 -->
- [[The turn]] - The elected leader gets a second, deliberately short turn of its own  <!-- GATES, Round 3 ruling 25, docs/design/politics-ideation.md:1718 -->
- [[War]] - An attack on the smallest member is a war with all of them  <!-- TRIGGERS, Round 3 ruling 28, docs/design/politics-ideation.md:1870 -->
<!-- SEEDED:edges END -->


## Questions for the designer

- **Multi-hop internal tolls:** unresolved. Decide whether the nominal flat rate is charged once or compounds across multiple member territories.
- **Election interval:** the federation has an elected leader, but the interval and detailed election procedure were deferred.
- **Leader loss:** the source defaults to an immediate election if the leader is conquered or leaves; this was a default rather than a separately asked ruling and should be confirmed in mechanics.
- **Reunification-claimant breadth:** ruling 31 clearly blocks contest claimants from a union, but whether and how that modifier limits federation membership needs one explicit sentence.
- **Balance watch:** collective war may create very strong deterrence. The source intentionally leaves that as an alpha balance question, not a rule to weaken it in advance.

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Politics#Politics ruling 25]] | Ruling 25 — A federation is a real form, not a name: many states, a flat internal toll, an elected leader and a turn of its own | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Politics#Politics ruling 26]] | Ruling 26 — The federation's flat toll replaces what members had with each other, and that is the price of joining | ruled, not built |
| [[Rulings - Politics#Politics ruling 27]] | Ruling 27 — The 5% goes to the ground that is crossed, and direct neighbours pay half | ruled, not built |
| [[Rulings - Politics#Politics ruling 28]] | Ruling 28 — An attack on one member is a war with all of them | ruled, not built |
| [[Rulings - Politics#Politics ruling 29]] | Ruling 29 — A refused petition is not a wall: declare anyway, and you are out | ruled, not built |
| [[Rulings - Politics#Politics ruling 30]] | Ruling 30 — Inside a federation you are at peace with every member. Full stop | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Politics#Politics ruling 31]] | Ruling 31 — The contest claimants carry a modifier: they can never join a union. Its BREADTH is open | amended later · ruled, not built |
| [[Rulings - Politics#Politics ruling 32]] | Ruling 32 — A union is ONE state; a federation is a union OF states. They are different wants | ruled, not built |
| [[Rulings - Politics#Politics ruling 33]] | Ruling 33 — Nothing is suppressed: the federation IS the answer to a union nobody can give | ruled, not built |
| [[Rulings - Politics#Politics ruling 34]] | Ruling 34 — The members vote you in, anyone may walk out, and three is the floor | ruled, not built |
| [[Rulings - Politics#Politics ruling 35]] | Ruling 35 — The federation makes peace as one; a member that wants out leaves first | ruled, not built |
| [[Rulings - Politics#Politics ruling 36]] | Ruling 36 — The outside 15% splits evenly, and that is what buys the small nations | ruled, not built |
| [[Rulings - Politics#Politics ruling 37]] | Ruling 37 — A federation trades authority for influence, and the model already computes both | ruled, not built |

*13 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `65dd3ef` (2026-09-11).*
<!-- GENERATED:sources END -->
