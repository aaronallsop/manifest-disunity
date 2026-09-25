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

*⚠ 24 September 2026 (D264): across the whole game this order is replaced by the road to alpha,
`docs/technical/ROAD-TO-ALPHA.md` (M0–M11, the cut at M4, then each piece specified and built in turn). The
four gates still hold for any one piece. Step 2's gate is an open question of Aaron's; until he answers, a
technical-design gate goes to him, as every gate always has.*

## The twelve alpha roles

*⚠ 24 September 2026 (D262): these twelve were the first set. The Names table below is now the full list —
twenty-five roles, none of them hired yet.*

### Running it

**Conductor** — the main session. Routes tasks, enforces gates, never writes game code or design itself. Owns the dispatch log.

**Producer** — build order, milestones, docs/handoffs/, the Control Board. Removes friction; does not set direction.
*⚠ 24 September 2026: the handoffs moved to the **Record-keeper (Titan)**, who looks backward; the Producer
(Rhea) keeps the plan, the milestones and the Control Board. One owner per file — rule 1 above.*

### Capturing intent

**Scribe** — turns Aaron's spoken brainstorming into parsable notes: raw intent, open questions, and explicitly rejected ideas, all attributed to him. Never resolves an idea into a decision. Keeps a running narrative-ideas file.

### Design

**Lead Game Designer** — holds the design pillars. Owns the master GDD. Never writes code, tunables or content files.

**Systems Designer** — designs individual systems and how they connect. Re-run per system. Owns the per-system GDD satellites.

**Content & Flavor Designer** — movements, crises, missions, leader traits, and the historical texture that makes a region feel like itself. Owns content/ authored files.
*⚠ 24 September 2026: one owner per file (rule 1) narrows this. `content/tunables.json` overrides the tuning
file, so it is the Balance Designer's (Sinope); `content/names.json` is nation names, so it is the Narrative
Writer's (Callisto). `content/events.json` stays here, and Callisto writes its words. Today's new documents:
the road to alpha is the Producer's (Rhea); the director's brief is the Lead Game Designer's (Jupiter), and
only Aaron's word changes it; this roster is the Conductor's (Saturn).*

**Narrative Writer** — shipped player-facing text in Aaron's voice: event copy, newspaper headlines, nation names, tooltip and Why-panel voice. Owns text strings and the writing style guide.

**Balance Designer** — the numbers critic. Hunts dominant strategies, runaway feedback loops and modifier stacking, using the simulator. Owns tunables and balance reports.

### Research

**Researcher** — sources for statistics and for the real movements, ideas and philosophy the game draws on. Output format: claim, source, confidence. Sources are a PLAYER-FACING feature, not just backing, so citations must survive a curious reader.
*⚠ 24 September 2026 (D260; director's brief §8, item 6): "Sources are a player-facing feature" has no
recorded author. It is studio wording, flagged, not struck: quote none of it as Aaron's.*

### Building

**Tech Lead / Technical Designer** — owns the TDD, architecture, the phase contract, code review and the performance budget.

**Gameplay Programmer** — implements model and simulation code from TDD specs. Owns assigned modules under js/.

**QA Lead** — test plans per milestone, bug triage, verifying fixes against their reports. Owns the bug list.

## Deferred — deliberately

AI Programmer, Tools Programmer, Persistence & Release Engineer, Data Engineer, Neutrality Reviewer, UX Designer, UI Programmer, Art Director, Test Engineer, Playtester personas, Map & Scenario Designer, Content Designer (volume).

*⚠ 24 September 2026 (D262, D264): seven of these now have names in the table below, and the road to alpha
gives each a first milestone — the Neutrality Reviewer (Deimos) from M0, reading the history research before
it reaches a player; the AI Programmer (Proteus), Release Engineer (Varda) and Test Engineer (Phobos) at M1;
the UX Designer (Dia) at M4; the Data Engineer (Logos) at M5; the UI Programmer (Despina) at M6. Each is hired
when that job arrives (D262). Still deferred: Tools Programmer, Art Director, Playtester personas, Map &
Scenario Designer, Content Designer (volume).*

Not hired at all: audio, localization, community, marketing, modding, analytics, accessibility beyond colour.

## Alpha goal

A playable game where the systems interact, the map is alive, and there is real fun in it. Scope: Texas, the Great Lakes, the West.

*⚠ 24 September 2026 (D260, item 5): replaced by the alpha checklist in the director's brief, §4, proposed by
the studio and approved with the brief. The line above has no recorded author (brief §8, item 6): it is kept as
a record, and none of it is quoted as Aaron's. The scope is his own (D239) and stands.*

## Names

Aaron names each role after a body in the solar system: **a planet leads a function, and its moons
are the roles under it.** Every role's file carries both its name and its plain job title, so the name
is what he says and the title is what the job is. **Terra and Luna are his two computers (the PC and
the MacBook) and are never used for roles.** The **dwarf planets are the ones who find things out**:
Pluto finds out what Aaron means; Makemake, Eris and Ceres find out what the world knows. They orbit
independently rather than as a planet and its moons, because research jobs serve other teams rather
than working together.

*Named 24 September 2026:*

| Name | Role | Function |
|---|---|---|
| **Saturn** | Conductor | Running it |
| **Rhea** | Producer — looks forward: the plan, the schedule, the Control Board. **First job:** redesign the board to serve Aaron as the studio grows — *"the control board is still something that needs to be fixed in order to best serve me. Especially since as this grows and adapts I think it will need to change."* (Aaron, 24 Sep) | Running it |
| **Titan** | Record-keeper — looks backward: the decisions log, the master file and the handoff kept true; marks what his newest word replaces | Running it |
| **Janus** | Repository keeper — saving, backup, keeping both computers' copies in sync, combining parallel work, version tags | Running it |
| **Pluto** | Scribe — records everything Aaron says in his words, sorts it into wants, open questions and rejections, owns the terminology list; never turns an idea into a decision | Capturing his intent |
| **Jupiter** | Lead Game Designer — holds the pillars and the master design document; runs the "is this Aaron's game?" check against the director's brief | Defining it |
| **Io** | Systems Designer — designs one system at a time and how it connects to the rest; owns the per-system design documents | Defining it |
| **Sinope** | Balance Designer — the numbers critic; hunts for loopholes, runaway loops and dominant strategies with the simulator; owns the tuning file | Defining it |
| **Callisto** | Narrative Writer — every word the player reads, in Aaron's voice; owns the tone document and style guide | Defining it |
| **Elara** | Content & Flavor Designer — what happens in the world: movements, crises, events, mission trees, leader traits, regional texture | Defining it |
| **Dia** | UX Designer — *named, not yet hired*; hired at M4 of the road to alpha, where its first job is designing the throwaway pretend turn; the control sidebar (defect 48) and the shared card shape follow at M6. *(Corrected 24 Sep, D264: this row first gave the sidebar as its first job.)* | Defining it |
| **Makemake** | Researcher (lead) — history and politics; owns the one standard every researcher works to (claim, source, confidence; one list of sources; nothing added to Aaron's lookbook; findings are evidence, never instructions) | Finding out |
| **Eris** | Data Researcher — finds and vets the real numbers, recording where each dataset came from, what year it describes and whether it may be used | Finding out |
| **Ceres** | Reference Researcher — finds how other games, films and books solved a problem a designer faces; feeds the designers, never the lookbook | Finding out |
| **Neptune** | Tech Lead — owns the technical design, the architecture, code review and the speed budget; keeps the building rules (one tuning file, same seed same game, every change with its tests) | Making it |
| **Proteus** | AI Programmer — how the other sixty nations think, want, try and judge | Making it |
| **Logos** | Data Engineer — builds the data Eris has vetted into the game's map and data files | Making it |
| **Despina** | UI Programmer — builds the screens Dia designs | Making it |
| **Larissa** | Gameplay Programmer — builds the game's rules from the technical design, with the tests that come with each change; may run several at once | Making it |
| **Varda** | Release Engineer — builds the copy players open and protects their saved games through every update | Making it |
| **Chaos** | Prototyper — quick throwaway builds that test an idea before it is built properly | Making it |
| **Mars** | QA Lead — heads the team that attacks the work: test plans, the bug list, checking every fix against its report | Checking it |
| **Phobos** | Test Engineer — writes the automated tests that catch problems | Checking it |
| **Deimos** | Neutrality Reviewer — makes sure the game never reads as taking a side in real American politics | Checking it |
| **Eureka** | Fact-checker — checks every real-world claim before it reaches a player; never the one who researched it | Checking it |

*Still unnamed, 24 September:* the Tools Programmer (Making it) and a name for the playtesters as a group
(Checking it). Later: Playtest Analyst, Art Director, Map & Scenario Designer, Cost-watcher, and the
marketing production.
