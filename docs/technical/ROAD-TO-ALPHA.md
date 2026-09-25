# The road to alpha (adopted, D264)

*From Saturn, 24 September 2026.* **✅ ADOPTED — Aaron, 24 September 2026 (D264)**, with the recommended answer to all seven questions in section 8 and one addition of his: **history research on the three stories starts at M0** (below). *Written as a proposal and adopted the same day; the proposal's reasoning is kept as written, and where it asked something since answered, a dated note says so.*

## 1. The recommendation

Keep the approved plan's foundations: the design documents, the technical design, and the contracts pass first. After that, each piece of the game is specified and then built before the next one is started. Change three things. **(1) Fix the engine before building on it**, because today it cannot reach the end of a game. **(2) Make the cut early**, right after the contracts pass, so it shapes the building instead of arriving after the building is done. **(3) Get strangers playing early, and keep them playing:** a small first look at today's game, the same people again on the new turn, then a full dress rehearsal on a finished Texas slice before the other two regions are built. Build in the order a player would notice things. First the two foundations, politics on your three-axis board and then the new turn. Then one region at a time, Texas first, each ending in something a stranger can play. In film terms: stop writing every shooting script before a frame is shot. Lock the budget and the cut early, shoot the Texas sequence, screen it, and let the screenings shape the rest.

## 2. Why the current road needs changing

- **It is drawn as a waterfall.** The board shows seven paper steps and then "the build order". It shows no building, no playtest and no finish. That contradicts what you approved on 16 September: specify one piece, build it, then the next.
- **The cut comes after the building it should steer.** Under the approved plan, building starts after the contracts pass. But your milestones and cuts are scheduled after the last technical step.
- **"Alpha first" has nothing to work from.** The evidence for what the alpha needs is the last step's job. So nobody has yet decided which of the nineteen systems get the full treatment.
- **Nobody plays until the very end.** Your most feared failure, *"there just isn't much to do"*, can only be found by playing. The current road puts about twenty-one technical documents and nine large builds ahead of any stranger. No outsider has ever played any version of the game.
- **The engine freezes around turn 80–95, in a game of 200 turns.** Three measurements are waiting on that fix. Every future build also has to prove it did not break a full game, and today nothing can prove that.
- **The playtest link is stale.** It serves the 3 September prototype, not the current build.
- **The interface and the history come last or nowhere.** You call the interface *"a huge problem"*, yet it is the last document written. No step produces the alpha's history.
- **Three step-numbering systems disagree** (the board's, the plan's and the triage's). One of them is off by one.

## 3. The road

Twelve milestones, M0 to M11. They are done in order, one piece of work at a time. Two things run alongside: the screenings, because testers play on their own time, and the history research, which starts at M0 and runs through every milestone after it.

**M0 — One road, one set of words** *(paper; already planned)*
- **Makes:** Pluto's terminology list. Rhea's redesigned Control Board, which draws this road in place of the seven-step rail and marks every milestone, every screening and every place you decide. One numbering, M0–M11, with the old labels mapped across once. *Already done when you adopted it:* the road is recorded as a decision and the older lines it replaces carry dated superseded notes, in the technical plan and the GDD's §9; nothing was deleted (D264).
- **Done when:** you open the board and see one road from here to strangers playing the alpha: where you are on it, and what is waiting on you. The words you use each mean one thing.
- **Also here — Aaron's yes, 24 September:** Pluto saves Aaron's own words from every design session into the project, word for word — only his messages, dated and in order, taken from the session logs on **Terra**, where they live and are not backed up. *A session on the PC.* So the originals are safe before the GDD is updated, and the tone interview's chat can be exported the same way.
- **Also starts here, and runs alongside every milestone after it — Aaron's addition:** Makemake (Researcher) researches the real history behind the three stories the alpha starts with — **Texas, Deseret, and the Great Lakes (Superior)** — as claim, source and confidence, with Eris on any figures. Nothing reaches a player until Eureka (Fact-checker) has checked it and Deimos (Neutrality Reviewer) has read it. It feeds your choice of where the history goes (M4) and the Texas, Great Lakes and West slices (M7, M9).
- **Who:** Pluto (Scribe), Rhea (Producer), Makemake (Researcher). Jupiter (Lead Game Designer) checks the adopted road against your brief; anything that does not fit comes to you as a proposed correction, recorded as a new decision. Mars (QA Lead) checks the board for stale figures and jargon.
- **You decide:** corrections to the word list. *The seven questions in section 8 were answered when you adopted the road (D264).*

**M1 — Make the engine trustworthy** *(the first programming session)*
- **Makes six repairs**, each with a test that fails before the repair and passes after it: (1) the freeze at turn 80–95 — before reading any code, run the older tagged versions to find when it arrived (an early version ran 300 turns), then prove whether a player pressing End Turn freezes too; (2) a test that writes into the real game files while it runs; (3) the test route that reports green without running anything; (4) a failed invasion that charges the defender and pays the attacker; (5) a nation reading its own founding movement as its worst unrest, which Deseret meets first; (6) the AI's army weights, fixed in the code instead of sitting in the tuning file.
- **Also makes:** a standing long-game check (all 200 turns on fixed seeds) that every later build must pass; a recorded "before" game; and three measurements labelled as a baseline, because the new turn will move them: the time a turn takes, where the victory targets land at 200 turns, and whether the logistics spiral really spirals. The playtest link is republished from today's build, and the build is tagged v0.6.1.
- **Done when:** the game plays all fifty years on every test seed, and the same seed gives the same game. A failed invasion hurts the attacker. Deseret treats its homeland as home. A green result means the tests really ran. The link shows today's game. Nothing else about the game has changed.
- **Who:** Neptune (Tech Lead) diagnoses and reviews. Proteus (AI Programmer) and Larissa (Gameplay Programmer) fix. Phobos (Test Engineer) writes the checks. Mars verifies each fix against its report. Sinope (Balance Designer) measures and tunes nothing. Varda (Release Engineer) republishes. Janus (Repository keeper) tags.
- **You decide:** nothing up front; you gave the permission when you adopted the road (D264, question 2). If the freeze turns out to need a change to how the game works, it comes to you as one card. If it resists, you decide whether the first look goes ahead once sixty turns are proven to finish from every tester's start. That is a risk you would carry.

**M2 — The first look** *(first outside play; runs while M3 is written)*
- **Makes:** two or three people who have never seen the game each play sixty turns of today's game, as a Texas, Deseret or Great Lakes nation. Before they play, a plain one-page how-to-play sheet with no voice. Afterwards, your five alpha questions plus "what did you decide each turn?" and "what did you want to do and couldn't?", and the six Economy-mode questions that were never asked. The game's own session record, which already logs every action, comes back with them. The report gives their own words; counts of how much they chose each turn, how long sixty turns took and where they got lost; and findings sorted into four groups: can't find it, nothing to do, didn't understand, broken.
- **Why now, when the turn is about to be replaced:** it is the technical rehearsal for every later screening (the link, the sheet, the questions, the record). Everything that carries over, such as the map, trade, the start and the interface, gets real evidence. And it is the baseline every later screening is measured against. It is small on purpose.
- **Done when:** at least two strangers have played sixty turns and answered in their own words, and you have marked which findings matter.
- **Who:** Rhea runs it. Callisto (Narrative Writer) writes the sheet and Jupiter checks it. Pluto records what testers say word for word. Mars makes the bug list. Sinope reads the numbers. Jupiter checks every finding against your pillars and your "not for" list before it reaches you.
- **You decide:** who the testers are, what they are told (including that there is no win at turn sixty yet), and which findings matter.

**M3 — The contracts pass** *(paper, as approved)*
- **Makes:** the one document the plan already defines: a written agreement for each of the fourteen pairs of systems that lean on each other, plus the preview every action shows, where a long-running project sits in the turn and in the save, the line format of the "why" record, and how tuning dials are named. **Four additions**, each of which prevents a rebuild later: the one card shape every screen uses; the full list of new kinds of saved thing, so the save never forgets one; where history attaches; and whether the behaviour document stays the single description of what the game does, since every build will edit it.
- **Done when:** every pair of systems that depend on each other has an agreement you can point at. Any one system can then be built without the others being finished. You get a one-page plain summary.
- **Who:** Neptune writes it. Io (Systems Designer) checks it against the design documents. Jupiter checks the card shape and the preview against pillar 1. Mars looks for an action it cannot express. Titan records it.
- **You decide:** whether to approve it. Technical gates come to you until you answer the held question about Jupiter.

**M4 — The cut** *(the build order, moved to the front)*
- **Makes a scope sheet** of evidence only, with no recommendation. It has one row for every system or piece the alpha might need, and each row says which of your five alpha tests needs it, what it depends on, what it costs, and which region slice it would land in.
- **Alongside the sheet:** Neptune's list of exactly what each mission tree pulls in from other systems, so a cut cannot strand a tree. The first-look findings, attached to the rows they touch. A throwaway, clickable pretend turn set at turn 40 (a briefing, cards, several projects running), built outside the game and thrown away afterwards. And the history research begun at M0, laid against the rows it touches.
- **Done when:** you have marked every row "in the alpha, in full", "edges only" or "after the alpha". You have clicked through the pretend turn and said whether it gives you something to do. From here on, nobody writes a full specification for anything you cut.
- **Who:** Rhea assembles the sheet. Neptune supplies the costs and dependencies. Jupiter maps the rows to your checklist and Io checks that mapping. Titan checks that every figure traces to a measurement. Dia (UX Designer, hired here) designs the pretend turn and Chaos (Prototyper) builds it. Makemake (Researcher) continues the history research begun at M0.
- **You decide:** the cut, row by row (cut from the alpha is not cut from the game). What a sixty-turn session ends with; the studio proposes an end screen showing your mission-tree progress and standings, with the reasons behind them. Where the history goes: the board, movement lines, mission names or area panels. And your reaction to the pretend turn. *⚠ 24 September 2026 (D267): this list also asked the shape of the taught first turn. You answered that on 15 September: it teaches the order of things, and each choice pays off later (the presentation document's §10).*

**M5 — Foundation 1: politics on your three-axis board** *(build)*
- **Makes:** the technical document, then the build. Every nation, movement and population count moves from six ideologies on two axes to your ten positions on three. The nine behaviours that read politics are re-pointed, not re-tuned, and every threshold is labelled with what it measures. Deseret is placed on the new board. The four real ocean ports currently marked inland (Philadelphia, Charleston, Hampton Roads and Providence) are corrected, as you approved on the board on 15 September, before any trade number is tuned.
- **Done when:** every nation sits on the board you designed (money, morals, power). Alliances, drift, splinters and elections still happen, measured on it. The long-game check passes. Nothing has been balanced yet; every number that will need it is labelled. You have played Deseret and a Texas nation.
- **Who:** Neptune specifies and Io checks. Larissa builds and Proteus re-points the AI. Eris (Data Researcher) vets the port facts and Logos (Data Engineer) rebuilds the map data. Deimos (Neutrality Reviewer) reads the ten parties and Deseret. Phobos and Mars test. Sinope confirms that numbers were labelled, not tuned.
- **You decide:** where Deseret sits, in one sentence: what it believes about money, about morals, and about who gives orders. The studio parked that question to this point as a default when your approval of the card did not say where Deseret sits; it is not an answer of yours, and you can settle it sooner (D249). Also your politics and map questions, three or four at a time; and whether to approve the specification. *⚠ 24 September 2026: corrected. This line first said you had parked Deseret, and asked again whether to correct the ports, calling that your "decision rather than a repair". The phrase was the studio's, and you had already approved the fix.*
- **Why politics comes before the turn:** under the new turn the other nations choose several things at once, and how they choose reads political closeness. Building the turn first would mean building its AI twice. The pretend turn in M4 is the cheap early test of the turn.

**M6 — Foundation 2: the new turn** *(build; then the first-look testers come back)*
- **Makes:** the technical document, then the build: no action budget, and a clear way for a nation's turn to end; projects shown as bars that fill over the quarters, starting with capacity to move goods; a briefing between turns that ranks what finished, and a card for each thing that does; the other sixty nations choosing several things each; every new kind of saved thing registered in the save now, even where its system comes later; the sidebar in two depths, simple on top with the detail a click away, and the shared card shape. The time a turn takes is measured, and the victory targets are measured again on the new turn before any mission tree is written. Then the build is tagged v0.7 and the first-look testers come back to play it.
- **Done when:** in one quarter you can start several things, watch each bar fill, and read in the briefing what finished. The other nations play the same way. Saves load back exactly. A full game still runs through. You played it first. The returning testers say whether there is more to do than before, and their records show whether they chose more each turn.
- **Who:** Neptune specifies and Io checks it against the design documents. Larissa builds the turn and the projects; Proteus the AI; Dia designs the sidebar and card and Despina (UI Programmer) builds them. Varda protects saves. Phobos and Mars test. Sinope measures. Jupiter runs your brief's test: in an hour of play, what did the player decide each turn, and was the best move ever simply to end it?
- **You decide:** your turn questions. Whether to approve the specification. You play the build. Whether it goes to the returning testers.

**M7 — Slice: Texas, playable from start to finish**
- **Makes:** the mission system and the Texas tree, one tree shared by five cities. Whatever the cut kept that Texas needs from other systems, most likely wars that can end, conquered ground that settles, and recognition; each is specified in full the first time a slice needs it, never in instalments. Texas history placed where you chose, researched, checked by someone who did not research it, and read for neutrality. The taught first turn, in your shape. The end screen at turn sixty. Plain placeholder words, since the voice waits for the beta. The build is tagged v0.8.
- **Done when:** anyone can pick any of the five Texas cities, be walked through the first turn, and play sixty turns with something to decide each turn while working up the tree. At the end, the game tells them what they achieved and why. Every real-world fact has been checked. You played it first.
- **Who:** Neptune specifies and Io checks it against the design documents. Elara (Content & Flavor Designer) writes the tree. Makemake and Eris supply the history and the boundary data. Eureka (Fact-checker) checks the facts and Deimos reads for neutrality. Callisto keeps the words plain. Larissa, Proteus and Despina build. Phobos tests, and Mars plays sixty turns from each of the five starts. Jupiter runs your five-point checklist against the recorded play.
- **You decide:** your mission questions, and how hard a Texas start may be. Whether to approve the specification. You play it. Whether it goes to strangers.

**M8 — The Texas screening** *(the full dress rehearsal)*
- **Makes:** three to five new people each play one Texas city for sixty turns. They answer your five alpha questions plus "what did you want to do and couldn't?". The report is built the same way as the first look's and is compared against it. The worst problems get fixed, and the cut is revisited with play evidence.
- **Done when:** strangers have answered all five of your alpha tests on a real slice. You know what fails before two more regions are built on top of it.
- **Who:** Rhea runs it. Varda provides the tester copy. Mars makes the bug list and Larissa fixes. Pluto records the testers' words. Sinope reads the numbers. Jupiter reads everything against your brief.
- **You decide:** which findings matter, and whether the cut changes. Also any number that stops a tester playing at all; only those may change before M10, each one with your OK.

**M9 — Slices: the Great Lakes, then the West**
- **Makes, for the Great Lakes:** blocs and the federation, which have no code today: membership, an elected leader, a budget, a flat internal toll and collective defence. Also the AI using them, the Great Lakes tree, and the economy and trade documents, with the toll choice put to you at that moment. One toll system replaces the two that exist today.
- **Makes, for the West:** the Deseret tree, a movement's demands arriving as a card you answer, and whatever else the cut kept.
- **Order:** one build at a time, unless Neptune confirms two builds share nothing and their tests cannot collide. Then the Texas testers return to play all three regions. The build is tagged v0.9.
- **Done when:** you can start as a Great Lakes nation and build a union, as Deseret and follow its tree, or as any Texas city. Each start plays sixty turns. When the three trees meet on the Mississippi, the result is a story rather than a crash.
- **Who:** Neptune specifies and Io checks it against the design documents. Larissa and Proteus build. Elara, Makemake, Eureka and Deimos handle the trees and their history. Sinope checks whether the logistics spiral spirals. Phobos and Mars test. Jupiter checks against your brief. Janus merges and tags. Rhea runs the returning testers.
- **You decide:** the toll system, exactly when you asked to be asked. Your questions on blocs, movements, trade and the economy, three or four at a time. Whether to approve each specification. You play each region.

**M10 — The alpha candidate** *(locking picture)*
- **Makes:** whatever the cut kept from the rest: the regional shock, something already in motion on turn one, the AI seeing only what a player could see, the newspaper with placeholder text, and the timeline. The victory targets measured a third time, over many full-length games, once everything that moves them has landed. The first real tuning pass, taken from what testers actually did. A full fact-check and a full neutrality read of the whole alpha. A release copy that protects saves. A dry run of your checklist.
- **Done when:** every part is switched on together across all three regions. It plays sixty turns from any alpha start without freezing or cheating. Every claim has been checked, and nothing reads as the game taking a side in real American politics. You have played a full session, can say why you won or lost, and have said it is ready for strangers.
- **Who:** Neptune specifies what is left and Io checks it against the design documents. Larissa, Proteus and Despina build it, and Neptune reviews the code. Sinope tunes, and you see every change. Deimos and Eureka do the neutrality read and the fact-check. Varda makes the release copy. Mars writes the test plan. Jupiter does the full brief review. Janus tags v0.10.
- **You decide:** whether to approve the tuning, your remaining questions for events, the opening, the AI and the screens, and go or no-go for strangers.

**M11 — The alpha test**
- **Makes:** a fresh group of testers, held back from every earlier round, each plays sixty turns. Their answers are recorded in their own words, along with their session records, the filed findings, and a list for the beta.
- **Done when:** your checklist has been answered, tester by tester: (1) could they play it at all; (2) did it look complicated but play easy, with something worth doing every turn; (3) could they say what went wrong, and one thing to do differently; (4) did they meet some real history; (5) do they want to try another nation or another way of playing?
- **Who:** Rhea runs it. Mars takes the bugs. Pluto records the testers' words. Sinope reads the numbers. Jupiter scores it against your brief. Titan records the verdict.
- **You decide:** whether it passed, what comes back from the cut, and when the voice work begins.

## 4. Where you first see strangers play it, and how often after that

- **First:** M2, straight after the repairs and before any new system is specified. Two or three people play today's game.
- **Then:** the same people on the new turn (M6); three to five new people on the finished Texas slice, the full dress rehearsal (M8); the Texas group again, on all three regions (M9); and a fresh group, kept back for this, at the alpha test (M11).
- **You play every build before any stranger does.**
- **Fresh eyes are the scarce resource.** A person is a first-timer only once. The road wants roughly ten to thirteen different people in all (an estimate, not a count), and the freshest are held back for the alpha test.
- **Every screening uses the game's own session record**, so "not much to do" is counted rather than guessed. Every finding passes Jupiter's check against your brief before it reaches you, so testers asking for a war game do not quietly steer the game.

## 5. What this changes from decisions you have already approved

⚠ **Each of these was your call, and you made it: adopting the road on 24 September accepted every change below (D264).** Where a line says "Kept", that part of the decision stands.

- **D248, the stage 3 plan.** *Kept:* alpha first; the contracts pass whole and first; specify one piece, build it, then the next. *Changed:* the final evidence step becomes the cut at M4, refreshed at every screening. The remaining documents are written in the slice that needs them, instead of all the foundations, then all ten tangled systems, then the rest. The contracts pass gains four items. *Why:* a cut has to come before the building it steers, and a slice has to end in something a stranger can play.
- **D244, the tangled systems written in the order a turn runs.** *Kept:* contracts before internals. *Changed:* the order is set by region, and each system is specified whole the first time a slice needs it. *Why:* once the contracts fix what passes between systems, the order of writing matters less than reaching play.
- **D248 and D258, the board's rail showing the seven technical steps.** You asked for that rail. *Changed:* the rail shows these milestones, with the technical steps inside them. *Why:* the rail as drawn shows no building, no screening and no finish line.
- **D217 and the stage table** (design, then technical design, then build order, then implementation). *Changed:* the build order and the cut come at M4, and technical design and building take turns from then on. *Why:* under slices, building starts straight after the contracts pass.
- **D171, ruling 3: "Playtesters wait for the alpha."** *Changed:* strangers play from M2. *Why:* the feared failure can only be found by playing, and nobody outside has ever played any version.
- **D173 and D258, the Economy-mode test.** The brief says that test is "untouched". *Changed:* it is never run on its own; its six questions go into the first look. *Why:* a separate test would ask about a turn and a politics that M5 and M6 replace, while the questions cost nothing to add.
- **D245 and D252:** you chose scoping over repairs, and the freeze was filed, not fixed. *Changed:* a narrow repair of six faults comes before anything else is built. *Why this is not a reversal:* the scoping you chose is done, and D252 itself named the freeze the first repair. The other thirty-odd faults stay filed.
- **The plan's rule of no tuning until the game plays.** *Changed:* one narrow exception. Between screenings, a number that stops a tester playing at all may change, with your OK each time. The first real tuning pass waits for M10.

## 6. What stays exactly as it is

- **The work itself:** the design documents and the technical design; the work still runs through them, which was your condition. The contracts pass stays whole, and every build arrives with its tests.
- **The game's shape:** a game is 200 turns and a playtest is sixty (D223); no action budget, and nothing finishes in one turn (D218); three axes and ten positions (D231, D250); mission trees belong to the player alone (D236); the first turn teaches (D237); the alpha's ground is Texas, the Great Lakes and the West (D239); some history in the alpha and the voice in the beta (D242, D261).
- **Your parked question** comes up exactly where you parked it: tolls at the economy document. **Deseret's placement**, which the studio parked as a default rather than an answer from you, comes up at the politics document (M5). Both are D249. Your other questions arrive three or four at a time, at the head of their documents (D246).
- **The standing rules:** the board never drives the game (D162); documents split and never merge (D230); one live session (D263, after D257); the brief rules on taste (D260); the master rules file (D263); determinism, one tuning file, and Economy mode as switches rather than a separate game.
- **Held, as you asked:** the question of Jupiter's check against yours. Until you answer it, every technical gate comes to you.
- **Off this road:** the wiki merge (D259). When it happens is yours; the studio suggests after the alpha, because the documents change at every slice.

## 7. Risks, honestly

- **The freeze's cause is unknown.** M1 could take one session or several. The fallback, proving sixty turns finish, rests on simulations. Whether a person pressing End Turn freezes the same way is inferred until it is tested.
- **The first look plays a turn we have already replaced.** Testers will probably say there is not much to do, which we already know. Its value is the rehearsal, the interface evidence and the baseline, and it spends only two or three fresh pairs of eyes.
- **The sidebar may swamp the first look.** That is evidence Dia needs, but it can hide everything else.
- **Politics before the turn delays strangers meeting the new turn.** The road chose avoiding a rebuild over speed. The hedge is the pretend turn at M4, but that is you alone, and a studio agent cannot feel bored.
- **Texas may pull in more than expected.** Ending a war has no code at all. If the scope sheet shows Texas needs half the tangled systems, M7 grows and the dress rehearsal slips. You will see that on the sheet before you mark the cut.
- **The order by region depends on the contracts being right.** If an agreement proves wrong at M9, the fix can reach back into Texas while testers are playing it.
- **A Texas-only screening can mislead in either direction.** The rest of the map has no goals yet, and Austin opens with one branch already done. Testers will be told exactly what they are playing.
- **You may cut twice.** The first cut rests on paper and a small first look, so it is reopened at M8 and M9.
- **Fresh testers are scarce.** If there are fewer, the later rounds use returning testers, who can no longer judge "easy to learn".
- **Strangers will meet untuned numbers.** The narrow tuning exception is the only relief before M10.
- **Tests are slow.** A run takes about five minutes and only works in the browser, and every build now also plays full games on several seeds. That is real time in every milestone, and in practice builds run one at a time.
- **Your answer rate sets the pace.** Fifty-two open questions arrive with their documents, on top of the cut, Deseret, the tolls and the screenings. The single yes per milestone exists to keep that down.
- **There are no dates.** The biggest pieces start from no code: the politics conversion, projects, ending a war, and blocs. Four of the five systems with no code at all sit inside the alpha's ground.
- **The studio can produce paperwork faster than game.** About twenty roles will be working by M7. Rhea watches how much record gets made for each playable change.

## 8. The decisions you needed to make to adopt it

*⚠ Answered 24 September 2026 (D264): the recommended answer, A, to all seven. Kept below as the record of what was asked.*

Seven questions, each a real choice. Approving with no note means the recommended answer.

1. **The road.** (A) Adopt it as written, including replacing the rail you asked for and the changes in section 5. (B) Adopt it with changes you name. (C) Keep the current road. **Recommended: A.**
2. **Permissions.** (A) Yes to the repair session now; after that, one yes per milestone covers its build and its screening, and you still approve every specification and play every build first. (B) Yes to the repairs, but ask separately before every build and every screening. **Recommended: A.**
3. **Strangers before the alpha.** (A) The small first look after the repairs, then the screenings in section 4. (B) Skip the first look, so strangers first play at the Texas screening. (C) No strangers until the alpha test, so D171 stands. **Recommended: A.**
4. **The Economy-mode questions.** (A) They go into the first look and are never run separately. (B) Run that test on its own first. (C) Retire them. **Recommended: A.**
5. **The word list before the contracts pass.** (A) The contracts pass waits for Pluto's list, because it names every handover and every dial, and renaming something after it is built means rebuilding. (B) Start without the list and rename later. **Recommended: A.**
6. **Tuning before M10.** (A) A number that stops a tester playing may change, with your OK each time. (B) Nothing changes before M10. **Recommended: A.**
7. **Version numbers.** (A) v0.6.1 for the repairs, v0.7 for the new turn and politics, v0.8 for Texas, v0.9 for all three regions, and v0.10 for the alpha candidate, which is the last number the scheme keeps for alpha. (B) Ask at each tag. **Recommended: A.**

*These come later, at their milestones, not now:* who the testers are; the cut; what a sixty-turn session ends with; where the history goes; Deseret; the tolls; your fifty-two questions; and the alpha verdict. *⚠ 24 September 2026: this list also named the shape of the taught turn and the ports. Both were removed because you had answered both on 15 September: the taught turn in a board note (D267), the ports by approving the fix on the board.*

*Sources (checked 24 September 2026):* docs/technical/TDD-PLAN.md, FIRST-ORDER.md, LEDGER.md, TRIAGE.md · docs/design/DIRECTOR-BRIEF.md, STUDIO-ROSTER.md, GDD.md, missions-design.md · docs/deferred.md · docs/control-board/board.html · docs/VERSIONING.md · docs/spec/economy-system-spec-addendum-a.md · DECISIONS.md (D22, D171, D173, D217, D218, D223, D244–D263) · CLAUDE.md · git history of the main branch and tags.
