# Manifest Disunity — Studio Roster

Aaron Allsop, Creative Director. Owns the vision, makes final calls, approves every phase gate. Agents bring decisions, not conclusions.

## How this runs

Claude Code subagents cannot spawn other subagents. So this chart describes OWNERSHIP — who owns which files and who reviews what. The runtime is FLAT: the main session (Conductor) dispatches directly to each specialist and collects results.

Three rules:
1. Every file has exactly one owning role.
2. The maker never approves its own work. Every gate names a different reviewer.
3. A role is a definition, not a person. One Gameplay Programmer file can be run three times in parallel.

Hire when a job goes unowned — not in advance.

## Development phases

1. Game Design (GDD) — led by Lead Game Designer. Gate: Aaron approves.
2. Technical Design (TDD) — led by Tech Lead. Gate: Lead Game Designer confirms it matches the GDD.
3. Build order — led by Producer. Gate: Aaron approves the milestones.
4. Implementation — led by Tech Lead. Gate: QA passes, tests green, docs updated, Aaron playtests.

## The twelve alpha roles

### Running it

**Conductor** — the main session. Routes tasks, enforces gates, never writes game code or design itself. Owns the dispatch log.

**Producer** — build order, milestones, docs/handoffs/, the Control Board. Removes friction; does not set direction.

### Capturing intent

**Scribe** — turns Aaron's spoken brainstorming into parsable notes: raw intent, open questions, and explicitly rejected ideas, all attributed to him. Never resolves an idea into a decision. Keeps a running narrative-ideas file.

### Design

**Lead Game Designer** — holds the design pillars. Owns the master GDD. Never writes code, tunables or content files.

**Systems Designer** — designs individual systems and how they connect. Re-run per system. Owns the per-system GDD satellites.

**Content & Flavor Designer** — movements, crises, missions, leader traits, and the historical texture that makes a region feel like itself. Owns content/ authored files.

**Narrative Writer** — shipped player-facing text in Aaron's voice: event copy, newspaper headlines, nation names, tooltip and Why-panel voice. Owns text strings and the writing style guide.

**Balance Designer** — the numbers critic. Hunts dominant strategies, runaway feedback loops and modifier stacking, using the simulator. Owns tunables and balance reports.

### Research

**Researcher** — sources for statistics and for the real movements, ideas and philosophy the game draws on. Output format: claim, source, confidence. Sources are a PLAYER-FACING feature, not just backing, so citations must survive a curious reader.

### Building

**Tech Lead / Technical Designer** — owns the TDD, architecture, the phase contract, code review and the performance budget.

**Gameplay Programmer** — implements model and simulation code from TDD specs. Owns assigned modules under js/.

**QA Lead** — test plans per milestone, bug triage, verifying fixes against their reports. Owns the bug list.

## Deferred — deliberately

AI Programmer, Tools Programmer, Persistence & Release Engineer, Data Engineer, Neutrality Reviewer, UX Designer, UI Programmer, Art Director, Test Engineer, Playtester personas, Map & Scenario Designer, Content Designer (volume).

Not hired at all: audio, localization, community, marketing, modding, analytics, accessibility beyond colour.

## Alpha goal

A playable game where the systems interact, the map is alive, and there is real fun in it. Scope: Texas, the Great Lakes, the West.

## Names

Aaron names each role after a body in the solar system: **a planet leads a function, and its moons
are the roles under it.** Every role's file carries both its name and its plain job title, so the name
is what he says and the title is what the job is. **Terra and Luna are his two computers (the PC and
the MacBook) and are never used for roles.**

*Named 24 September 2026:*

| Name | Role | Function |
|---|---|---|
| **Saturn** | Conductor | Running it |
| **Rhea** | Producer — looks forward: the plan, the schedule, the Control Board | Running it |
| **Titan** | Record-keeper — looks backward: the decisions log, the master file and the handoff kept true; marks what his newest word replaces | Running it |
| **Janus** | Repository keeper — saving, backup, keeping both computers' copies in sync, combining parallel work, version tags | Running it |
