# Questions for the designer

Questions, contradictions, implementation gaps and source issues found while writing the wiki. Nothing in this file is treated as a rule until the designer resolves it.

**Pages with flagged issues:** 54

## [[Acadiana]]

- **Implementation gap:** the design growth cap and running growth cap differ. The page reports both; the data should be updated when the ruling is implemented.

## [[Alaskan Independence]]

- **Political placement is authored, not ruled.** The register currently places Alaskan Independence at [[Republicans]]; confirm or replace this position before treating it as settled canon.

## [[Alliances]]

- **Inherited-hostility trigger:** the source analysis says alliance-inherited Hostility must fire once as an event rather than be re-evaluated every turn. That is logically required by ruling 38 but is not itself a numbered ruling; confirm it in the implementation specification.
- **Joining an ally's war:** ruling 27 says an ally may join only if it borders the enemy, but the exact player action, timing and diplomatic cost of joining have not yet been specified on this page.

## [[Anarcho-Capitalism]]

- **No closed ruling directly defines this individual position page.** Its coordinates come from the ten-position political-board design. Do not add position-specific mechanics until a ruling or implementation source supplies them.

## [[Authority]]

- **New-country after-effect:** ruling 38 says the honeymoon ends worse than neutral, but how far below baseline and for how long are deliberately unset.
- **Visibility:** ruling 17 uses Authority and Influence in another nation's decision, but whether the player may see those stocks before making the proposal was deferred.
- **Martial-law action cost:** deliberately deferred until the one-action turn structure is redesigned.
- **Subject/vassal details:** ruling 39 only establishes who is blamed; the actual subject relationship is owned by the later diplomacy round.

## [[Backing a movement]]

- **Petition threshold:** ruling 47 requires it to be below the movement's declaration/secession threshold, but no value has been set.
- **Refusal clock:** ruling 49 establishes delayed consequences for repeated refusal but does not set the number of refusals or turns.
- **Competition outcome:** the rules say several nations can compete for one movement but do not yet define exactly how the movement chooses among multiple willing backers.

## [[Cease-fire]]

- **Cease-fire term:** a fixed duration is ruled, but the number of turns is a tunable rather than a settled value in the wiki sources.
- **Information visible during blind offers:** ruling 35 intentionally makes the offers blind, but the source leaves open which standing facts the player can inspect while writing terms. Without that, the sealed choice risks becoming guesswork rather than judgment.
- **Generated source metadata:** rulings 3, 6, 33, 34, 35 and 36 are incorrectly marked superseded in the generated Sources table; the ruling index says they remain live.

## [[Central States Union]]

- **Political placement is authored, not ruled.** The register currently places Central States Union at [[Republicans]]; confirm or replace this position before treating it as settled canon.

## [[Christian Nationalism (position)]]

- **No closed ruling directly defines this individual position page.** Its coordinates come from the ten-position political-board design. Do not add position-specific mechanics until a ruling or implementation source supplies them.

## [[Civil war]]

- **Countdown duration:** ruling 8 says the countdown begins past the national threshold, but the number of turns before civil war is not stated in the page's closed sources.
- **Two 40% values:** ruling 10 explicitly treats the Area threshold and national civil-war threshold as separate tunables. They should not be coupled merely because both currently equal 0.40.
- **Implementation conflict:** the running game measures the strongest single movement rather than summed movement share and does not subtract movement members from government manpower.
- **Federation interaction:** collective defence is ruled, but the exact handling of a breakaway civil-war faction inside a federation needs an implementation rule.

## [[Communism]]

- **No closed ruling directly defines this individual position page.** Its coordinates come from the ten-position political-board design. Do not add position-specific mechanics until a ruling or implementation source supplies them.
- **Empty position:** no live movement currently holds this position. The design notes that several positions are empty; confirm whether that is intentional balance or unfinished movement authoring.

## [[Democratic Socialism]]

- **No closed ruling directly defines this individual position page.** Its coordinates come from the ten-position political-board design. Do not add position-specific mechanics until a ruling or implementation source supplies them.

## [[Democrats]]

- **No closed ruling directly defines this individual position page.** Its coordinates come from the ten-position political-board design. Do not add position-specific mechanics until a ruling or implementation source supplies them.

## [[Deseret]]

- **Adjective-model conflict:** this movement is labelled **religious**, but Politics ruling 11a reduces the adjective system to five categories — autonomist, cultural, ideological, resource and economic. Decide whether **religious** remains a distinct adjective or must be mapped into the five-category system.

## [[Digital Technocracy]]

- **No closed ruling directly defines this individual position page.** Its coordinates come from the ten-position political-board design. Do not add position-specific mechanics until a ruling or implementation source supplies them.
- **Empty position:** no live movement currently holds this position. The design notes that several positions are empty; confirm whether that is intentional balance or unfinished movement authoring.

## [[Diplomatic states]]

- **Wary acceptance penalty:** the magnitude is deliberately unset.
- **Subject:** the relationship is named but deferred; do not invent its state-machine rules here.
- **Generated source metadata:** many live military rulings on this page are falsely marked `SUPERSEDED`; the ruling index must be used instead.
- **State count wording:** early sources say seven states; later ruling 17 adds Wary, making six live states and eight total relationship categories when Allied/Subject are counted. Keep later terminology authoritative.

## [[Distributism]]

- **No closed ruling directly defines this individual position page.** Its coordinates come from the ten-position political-board design. Do not add position-specific mechanics until a ruling or implementation source supplies them.

## [[El Paso United]]

- **Implementation gap:** the design growth cap and running growth cap differ. The page reports both; the data should be updated when the ruling is implemented.

## [[Fascism]]

- **No closed ruling directly defines this individual position page.** Its coordinates come from the ten-position political-board design. Do not add position-specific mechanics until a ruling or implementation source supplies them.

## [[Federation]]

- **Multi-hop internal tolls:** unresolved. Decide whether the nominal flat rate is charged once or compounds across multiple member territories.
- **Election interval:** the federation has an elected leader, but the interval and detailed election procedure were deferred.
- **Leader loss:** the source defaults to an immediate election if the leader is conquered or leaves; this was a default rather than a separately asked ruling and should be confirmed in mechanics.
- **Reunification-claimant breadth:** ruling 31 clearly blocks contest claimants from a union, but whether and how that modifier limits federation membership needs one explicit sentence.
- **Balance watch:** collective war may create very strong deterrence. The source intentionally leaves that as an alpha balance question, not a rule to weaken it in advance.

## [[Franklin]]

- **Political placement is authored, not ruled.** The register currently places Franklin at [[Republicans]]; confirm or replace this position before treating it as settled canon.

## [[Great Lakes Free Trade]]

- **Political placement is authored, not ruled.** The register currently places Great Lakes Free Trade at [[Democrats]]; confirm or replace this position before treating it as settled canon.

## [[Grievance]]

- **Exact grievance formula:** this page's sources identify Quality of Life, Influence, Authority and ideological fit, but the complete six-pressure weighting described in the page synopsis is not fully recoverable from the closed rulings alone. Preserve the existing implementation/specification numbers until the designer confirms the final table.
- **Implementation contradiction:** realised movements currently count against their own nation despite ruling 16. This should be corrected rather than documented as intended behaviour.

## [[Hawaiian Sovereignty]]

- **Adjective-model conflict:** this movement is labelled **indigenous**, but Politics ruling 11a reduces the adjective system to five categories — autonomist, cultural, ideological, resource and economic. Decide whether **indigenous** remains a distinct adjective or must be mapped into the five-category system.

## [[Homelands]]

- **Map-data architecture:** ruling 26 requires Areas to support overlapping movement claims with levels, while the current region hierarchy allows only one path. The exact storage format is an implementation decision still to be made.
- **Unpainted state-derived homelands:** several current movement boundaries follow state lines because of the build script rather than because the designer chose those edges. They should be reviewed in the map-authoring pass.

## [[Hostility]]

- **Generated source-status errors:** rulings 5, 17, 18, 19, 20, 21, 28, 37, 38, 39 and 40 are marked `SUPERSEDED` in this page's generated Sources table even though the ruling index says they remain live.
- **Wary has two incompatible descriptions:** ruling 39 says the acceptance multiplier replaces the proposed four scaled Hostile costs, while another source summary says material costs remain at a fraction. Decide which is authoritative.
- **Existing corridor rate:** Hostility raises transit costs, but the rules do not clearly say whether a fixed-rate corridor already under contract changes price mid-term or only on renewal.
- **Inherited-hostility event:** the source derives that alliance-inherited Hostility must fire once rather than re-trigger each turn. Confirm that derived requirement in the implementation spec.
- **Hostile and Wary durations:** both are tunables with no final number.
- **Wary acceptance penalty:** magnitude deliberately unset.

## [[Indigenous nations]]

- **Navajo boundary verification:** ruling 25 explicitly says the reservation geography was recalled from memory and needs checking before implementation.
- **Lakota/Area mismatch:** the three-Area solution necessarily includes Rapid City and other communities outside the intended core. Confirm whether the Area map remains the final compromise or whether this needs a finer geographic exception.

## [[Liberal Anarchy]]

- **No closed ruling directly defines this individual position page.** Its coordinates come from the ten-position political-board design. Do not add position-specific mechanics until a ruling or implementation source supplies them.
- **Empty position:** no live movement currently holds this position. The design notes that several positions are empty; confirm whether that is intentional balance or unfinished movement authoring.

## [[Military bases]]

- **Branch mapping before the data bake:** the source proposes Marine Corps → Army, Coast Guard → Naval and Space Force → Air Force, but flags that mapping for confirmation before implementation.
- **Exact base effects:** ruling 31 establishes the three categories and the no-nuclear rule, but the precise numerical bonuses still belong to implementation/mechanics work.

## [[Movement demands]]

- **Demand trigger:** the percentage at which a movement begins issuing demands is deliberately unset. It must be below 0.30 if movements capped at 0.30 are ever to use the system.
- **Broken-promise count:** ruling 22 deliberately leaves the number unset.
- **One-action dependency:** proposing a union currently costs the ordinary action only because the game currently gives one action; revisit when that turn rule changes.
- **Verb-change implementation:** no existing system changes a movement's verb. This is explicitly new machinery.
- **Generated source metadata:** several live military rulings on this page are wrongly labelled superseded by the generator.

## [[Movements]]

- **Petition threshold:** must sit below the point where a movement can resolve itself, but no value has been set.
- **Broken-promise count:** no threshold has been set for a movement changing its verb.
- **Generated source conflict:** Politics ruling 11a is marked superseded in some generated tables even though the ruling index says it remains live.
- **Adjective conflict:** the five-category ruling omits `religious` and `indigenous`, which still appear in the live register.
- **Movement-register wording:** one source says "the five untouched" and then names six movements; likely a transcription/count error, but it should be corrected rather than inferred.
- **Politics placements marked `?`:** these are authored rather than ruled and remain for designer confirmation.

## [[Nations of the Shattering]]

- **Ruling 12 source mapping:** every nation appears in every game and only its extent rolls, but that ruling is missing from this page's generated source mapping.
- **47-nation roster status:** the roster is treated as the designed board, while parts of the connective thirteen-step narrative remain labelled brainstorm rather than canon. Keep those categories separate.
- **Undrawn lines:** several borders still need Area-level authoring; Navajo and Lakota have later clarifying rulings but may still require actual data work.
- **Lakota/Rapid City:** confirm the three-Area compromise remains acceptable as final map geography.
- **New England/Rochester agreements:** ruled opening facts, but currently impossible to encode mechanically.

## [[Native American Confederation]]

- **Adjective-model conflict:** this movement is labelled **indigenous**, but Politics ruling 11a reduces the adjective system to five categories — autonomist, cultural, ideological, resource and economic. Decide whether **indigenous** remains a distinct adjective or must be mapped into the five-category system.

## [[New Confederacy]]

- **Political placement is authored, not ruled.** The register currently places New Confederacy at [[Christian Nationalism (position)]]; confirm or replace this position before treating it as settled canon.

## [[New England Revivalist]]

- **Political placement is authored, not ruled.** The register currently places New England Revivalist at [[Democrats]]; confirm or replace this position before treating it as settled canon.

## [[New England United]]

- **Political placement is authored, not ruled.** The register currently places New England United at [[Democratic Socialism]]; confirm or replace this position before treating it as settled canon.

## [[Northern Christian Kingdom]]

- **Adjective-model conflict:** this movement is labelled **religious**, but Politics ruling 11a reduces the adjective system to five categories — autonomist, cultural, ideological, resource and economic. Decide whether **religious** remains a distinct adjective or must be mapped into the five-category system.

## [[Occupation]]

- **`occupied-movement` threshold:** 50% is explicitly a placeholder and should be tuned against the 40% secession threshold.
- **Integration timing:** ruling 26 says Quality of Life speeds or slows integration but does not provide the base time or modifier curve.
- **Occupation cost formula:** the political/economic penalties are conceptually ruled, but exact upkeep belongs to the economic/mechanics specification.
- **Implementation conflict:** current `isHomeGround` is permanent; ruling 26 requires occupied ground eventually to enter that set.
- **Generated source metadata:** rulings 26 and 31 are live despite being marked superseded.

## [[Peace treaty]]

- **What counts as "war costs":** ruling 22 defines whose costs cap repayment, but ruling 23 explicitly hands the full accounting definition to the economy round.
- **Treaty duration values:** the existence of a term is ruled; the actual durations remain tunable.
- **Blind-offer information:** the design has not yet fixed exactly what information a player may inspect while writing the sealed treaty.
- **Neighbour punishment saturation:** permanent Hostile neighbours cannot become more Hostile when a treaty is broken. The source recommends using the existing `reneged` memory to carry extra cost, but that recommendation was not separately ruled.
- **Generated source metadata:** most of the late military rulings on this page are live despite being labelled superseded in the generated table.

## [[Release valves]]

- **Adjective conflict:** ruling 11a says five adjectives, while the movement register still contains `religious` and `indigenous`. Decide whether those are exceptions, stale data, or mappings into the five categories.
- **Martial-law action cost:** deferred until the turn/action redesign.
- **Referendum procedure:** the ruling says to reuse election machinery, but trigger, franchise and exact consequences still need implementation detail.
- **Political-course costs:** the geometry is conceptually set by the political board, but final numbers belong to mechanics.
- **Generated source metadata:** rulings 11a and 14 are live despite the generated superseded label.

## [[Republicans]]

- **No closed ruling directly defines this individual position page.** Its coordinates come from the ten-position political-board design. Do not add position-specific mechanics until a ruling or implementation source supplies them.

## [[Resistance]]

- **RAND bake is missing from the repository:** the design session used a manually downloaded workbook, but the input file was not committed. The build needs a reproducible source file or documented acquisition step.
- **Apportionment weights:** ruling 35 records 0.60/0.40/0.30 weights derived from a citation that the design session itself says was not verified. Verify the source before treating those weights as final empirical values.
- **Generated source metadata:** ruling 36's dataset description was corrected later, but the core RAND/bake rule remains live.
- **Occupation linkage:** the final formula translating resistance into upkeep/civil unrest still needs to be carried into the military/economy implementation spec.

## [[Reunification contests]]

- **Full claimant table:** the page should eventually carry one canonical table for all four contests, because earlier source tables retain superseded claimant lists even when later rulings correct them.
- **Contest-ending condition:** the sources imply a contest can end when the relevant movement changes its objective, but the exact formal event that removes the permanent Hostile floor should be stated explicitly in implementation.
- **Union/federation breadth:** ruling 31 clearly blocks contest claimants from a union; how broadly that restriction applies to federation membership remains open.
- **Generated source metadata:** several live military rulings here are incorrectly marked superseded.

## [[Sagebrush Rebellion]]

- **Implementation gap:** the design growth cap and running growth cap differ. The page reports both; the data should be updated when the ruling is implemented.

## [[State of Jefferson]]

- **Political placement is authored, not ruled.** The register currently places State of Jefferson at [[Republicans]]; confirm or replace this position before treating it as settled canon.

## [[Stateless society]]

- **Exact stateless toll figures:** Politics ruling 3 points to existing transit values, but these should be carried from the implementation/specification rather than re-invented in prose if the economy round changes them.
- **Fragment stocks:** the opening-fragment design needs Quality of Life/Authority/etc. or an alternative so movement growth has inputs; the current architecture has no stateless entity holding those stocks.
- **Old ruling 4:** fully superseded by ruling 5 on threshold and outcome. The generator's wording can mislead readers because other fragments of its idea survive elsewhere.
- **Resistance data:** the regional armed-share layer is designed but not yet baked into the game.

## [[Taking ground]]

- **Raid economics:** measure attack cost against one turn of the target Area's sector output before alpha. With the cooldown removed, an economically profitable denial attack could otherwise be repeated every turn.
- **Combat modifiers:** technology, local movement support and other bonuses are acknowledged but not fully ruled; do not invent the final list or coefficients here.
- **Reach:** it remains the one geographic hard refusal after the size shield is removed, but its final relationship to new borders should be checked in the mechanics pass.
- **Implementation conflict:** current annexation still carries the three-Area budget, four-turn cooldown and four-times-size shield and does not use the ruled fight on every attack.
- **Generated source metadata:** rulings 12, 14, 23, 24, 25 and 26 are live despite being labelled superseded.

## [[The Shattering]]

- **Story status:** the thirteen-step narrative is currently a brainstorm record, while several dates, names and borders inside it are independently ruled. Future edits should not accidentally promote every connective story beat to a closed game rule.
- **Pre-signed New England agreements:** these are ruled opening facts but cannot yet be represented by the running diplomacy system, which has no matching alliance/treaty object.

## [[The federal remnant]]

- **Broken-promise threshold:** ruling 22 deliberately leaves the number unset.
- **Federal-remnant geography and government:** the political rules assume a remnant exists, but the current scenario data has no such nation. Its exact opening territory and playable status need to be fixed in the Story/board implementation pass.

## [[The opening roll]]

- **Setup probability model after ruling 24:** the four-ring ladder is dead, but the precise probability scheme attached to painted homeland levels still needs to be expressed in implementation-ready form.
- **Four Corners weights:** the sources define fixed and rolled categories but implementation should carry the exact weighting table rather than infer it.
- **Expand/Reconquer at setup:** ruling 44 refines ruling 42; ensure the generator maps ruling 44 to this page so readers do not interpret ruling 42 too literally.

## [[The political board]]

- **Three empty positions:** the design notes that three of the ten positions currently have no movement assigned, and that the empty side is disproportionately authoritarian. Confirm whether this is intended or incomplete movement authoring.
- **Beyond-the-edge conditions:** ruling 2 names Despotism/Statelessness-type conditions beyond the board, but what entering them buys or costs was deliberately deferred. Do not invent effects.
- **Population re-map:** the largest remaining authoring job is splitting the current Republican/Democratic county seed across the new corners by cultural region. No final mapping exists yet.

## [[The turn]]

- **The one-action rule is already marked for redesign.** Ruling 19 depends on that rule rather than standing independently, and ruling 14 explicitly defers martial-law timing to the same future mechanics pass. Any action-cost wording here should be revisited when round 7 changes the turn structure.
- **Federation turn order:** ruling 25 establishes a federation turn but the exact placement relative to member turns and the election interval remain to be specified.

## [[Unions]]

- **Demand trigger:** Unify movements need to demand action below the 0.30 cap carried by Farmers Union/Great Lakes Free Trade, but no exact percentage is set.
- **Three-answer middle option:** ruling 16 establishes that a meaningful middle answer exists, but its complete terms should be copied from the mechanics specification once final rather than inferred here.
- **Quiet period after a proposal:** deliberately unset.
- **Player information:** whether the target nation's Authority and Influence are visible before proposing was deferred.
- **Reunification breadth:** ruling 31 was phrased broadly after a Texas discussion; confirm it applies identically to all four contest families.
- **One-action cost:** conditional on the future turn redesign.

## [[War]]

- **War-cost accounting:** the economic definition of what a war costs is intentionally handed to the economy design; treaty repayment cannot be final until that accounting exists.
- **Combat modifier list:** technology, local support and other modifiers are acknowledged but not finalized.
- **War declaration action cost and exact weariness increments:** carry these from the mechanics specification rather than inferring them from the military concept page.
- **Generated source metadata:** many live military rulings are incorrectly marked superseded in this page's generated Sources table.

## Generator/source-status audit

- `_build-report.md` identifies **39 rulings** that the generated Sources tables label `SUPERSEDED` even though the report itself says many are live, refined, amended, or are the superseding ruling. The affected pages should not use the generated status label as authority until `build/build_wiki.py` is corrected.
- The completed prose follows the ruling indexes and later amendments rather than those erroneous generated labels. The GENERATED blocks themselves were left unchanged so the generator can still own them.
- Re-run the wiki generator only after fixing the supersedence-status logic, otherwise future generated tables will continue warning writers away from live rules.

## Unverified interaction links

These seeded graph edges remain explicitly unverified. They are retained rather than silently deleted because the source comments identify plausible support, but each should be checked before treating the graph edge as settled.

- **[[Backing a movement]]:** - [[Diplomatic states]] - Being seen to fund somebody's rebels is remembered, and worse than recognising them *(unverified)*
- **[[Christian Nationalism (position)]]:** - [[New Confederacy]] - a movement that holds this position *(unverified)*
- **[[Democratic Socialism]]:** - [[New England United]] - a movement that holds this position *(unverified)*
- **[[Democrats]]:** - [[Great Lakes Free Trade]] - a movement that holds this position *(unverified)*
- **[[Democrats]]:** - [[New England Revivalist]] - a movement that holds this position *(unverified)*
- **[[Grievance]]:** - [[Civil war]] - Anger raises movement share; past forty per cent the civil-war clock starts *(unverified)*
- **[[Grievance]]:** - [[Occupation]] - Angry ground is dearer to hold, and the bill rises faster than the map *(unverified)*
- **[[Movement demands]]:** - [[Civil war]] - Refusing feeds the anger that runs the clock you cannot see *(unverified)*
- **[[Movement demands]]:** - [[Military bases]] - A movement can demand a named base, and now that demand means something *(unverified)*
- **[[Nations of the Shattering]]:** - [[Story]] - The names on the map are the story's, and were chosen deliberately *(unverified)*
- **[[Republicans]]:** - [[Alaskan Independence]] - a movement that holds this position *(unverified)*
- **[[Republicans]]:** - [[Central States Union]] - a movement that holds this position *(unverified)*
- **[[Republicans]]:** - [[Franklin]] - a movement that holds this position *(unverified)*
- **[[Republicans]]:** - [[State of Jefferson]] - a movement that holds this position *(unverified)*
- **[[Resistance]]:** - [[Civil war]] - An armed population is who a militia is made of *(unverified)*
- **[[Resistance]]:** - [[Military]] - The armed share is the ceiling on what anybody here can put in the field *(unverified)*
- **[[Taking ground]]:** - [[Unions]] - A neighbour fresh from taking ground is frightening, and frightening cools a yes *(unverified)*
- **[[The Shattering]]:** - [[Events]] - The break-up is a chain of events, and the chain could run again *(unverified)*
- **[[The federal remnant]]:** - [[Diplomacy]] - Does Washington open recognising nobody, and cut itself off from everyone? *(unverified)*
- **[[Unions]]:** - [[Diplomacy]] - Whether a government may propose with nobody demanding it is still open *(unverified)*
