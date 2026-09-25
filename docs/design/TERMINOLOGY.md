# The word list

> # ⚠ DRAFT — not agreed until Aaron has walked it with Pluto
>
> **Built 25 September 2026 by Pluto, the Scribe (road to alpha, M0).** Every word below with a settled
> meaning is *recorded*, not chosen: the meaning is the one a decision, a document or Aaron's own words
> already fixed, and the source is named. **Every word that has meant two or more things is NOT settled
> here.** Those are in **section 5, at the end, as questions for Aaron with the options named.** Nothing in
> this file decides one of them. Until he has walked the list, treat section 5's words as unsafe and the
> rest as the project's words.
>
> Why it exists, in his words: *"there's a lot of terminology that I end up using while chatting
> interchangeably, and that gets really confusing for the programmers, because they think I say one thing
> but mean something else."* (interview, 24 September 2026)

**Depends on:** `CLAUDE.md` (the permanent rules and the settled facts) · `docs/design/DIRECTOR-BRIEF.md`
(his taste, in his words) · **`docs/design/aaron-words/`** — every message he typed or dictated, 35
sessions, **661 messages counted on disk today**, 3 July to 25 September 2026, which is the primary
source for what *he* means. *(Its own index says 659; the difference is the two messages added to the
still-open 25 September session when it was re-copied at sign-off, which the index has not caught up
with. Reported to Saturn; not corrected here.)* ·
`DECISIONS.md` (D-numbers) · `DESIGN.md` (what the game does today, which rules on built behaviour) ·
`docs/design/GDD.md` and its satellites · `docs/design/TONE.md` · `docs/design/STUDIO-ROSTER.md` ·
`docs/technical/ROAD-TO-ALPHA.md` and `ROAD-TASKS.md` · `docs/deferred.md` entries 52 and 57.

**Read by:** everyone. Once this list is agreed, its word is the word — one word per idea. A word of his
that is not on it, or has two meanings, is a question for him, not a guess.

## How to read an entry

- **word** — what it means, in one sentence. *Fixed by:* where that meaning comes from.
- **word** — ❌ *do not use.* Say **his word** instead.
- **word** — ⚠ **two meanings, unsettled.** See question **Q<n>** in section 5.

Where his word and the studio's differ, **his wins and the studio's is marked "do not use"**. Where a
word is quoted as his, it is copied exactly as he typed or dictated it, misspellings kept and marked
`[sic]`. Studio wording is never quoted as his, even where he approved it.

> **⚠ A caution for whoever builds on this list.** Aaron's word record keeps a pasted document whole,
> as it should — so a handful of his messages are **documents the studio wrote that he pasted back in**
> (the largest are a 28,500-character economy specification, a project-manager update and two role
> briefs). They are correctly filed as his *messages*; they are **not his composition** and nothing in
> them may be quoted as his taste or his vocabulary. Every quotation in this file was taken from his
> conversational messages and checked against the record, and the pasted documents were excluded from
> the vocabulary evidence. **The word record's own index does not warn about this yet.**

---

# 1. The words

## 1.1 The ground: the map and its pieces

**county** — a real United States county, the unit the real population, output and voting data arrives
in. It is the raw material of the map, not the unit of play. *Fixed by:* the data build; his own words
from 3 July 2026, *"The map will allow users to interact with two things - nations and counties."*
⚠ **But which unit the game plays on is unsettled — see Q6.**

**Area** — the atomic unit of the board: one county, or several small neighbouring counties in the same
former state merged together until the group clears fifty thousand people. Every figure in the game is
carried per Area. *Fixed by:* `DESIGN.md` §3, *"The Area is the atomic unit"*; his own instruction of
8 July 2026 to *"Introduce an Area abstraction that currently maps 1:1 to a county"*.
⚠ **Also used as the name of a tier of the map's groupings, and loosely of a part of the country — see Q6.**

**adjacency** — which Areas touch which, including across water where a crossing exists. Geography is a
graph with costs. *Fixed by:* `docs/design/board-design.md`.

**cultural region** — one of the twenty named cultural textures the map carries, so an Area takes its
region's character rather than an average. *Fixed by:* `DESIGN.md` §3 (twenty regions, one per Area).
⚠ **"region" also names a tier of groupings and one of the alpha's three story areas — see Q6.**

**the world market** — the rest of the planet, reachable only through a port, a coast or a corridor. Not
a nation and not an actor. *Fixed by:* `DESIGN.md` §5; his own trade rules of 5 September 2026.

**Canada and Mexico** — geography, not nations and not actors. Bordering nations route through them at a
flat ten per cent toll, which is a cost and not a payment to anyone. Great Lakes ports reach the world
market only through Canada. *Fixed by:* `CLAUDE.md`, settled facts.

**port · coastal · corridor** — three different ways an Area can reach the outside: a place a ship can
load, a place that merely touches the sea, and an overland route. They are not interchangeable; 59 of the
game's 136 ports reach no foreign market at all. *Fixed by:* `docs/design/board-design.md` §14.5.

## 1.2 The players on the map

**nation** — one of the sixty-one independent players on the board: the thing you are, the thing the AI
runs, the thing that owns Areas, holds a treasury and signs agreements. This is the project's word.
*Fixed by:* `DESIGN.md` throughout; the game's one-paragraph description in `CLAUDE.md`.

**state** — ⚠ **five meanings, unsettled, and it is the worst word in the project. See Q1.** Nothing
should use this word until he has answered.

**country** — ⚠ **unsettled, part of Q1.** He uses "country" and "nation" interchangeably — *"other
countries who own the counties"*, 5 September 2026 — and the built game says **nation** everywhere.
Nothing here chooses between them.

**former state** — one of the fifty-one United States states the board starts from, before the break-up.
The plain way to say it without using the bare word "state". *Proposed wording, not his;* offered as an
option in **Q1**.

**the player** — the nation itself, throughout. Governments and leaders change underneath; the player
does not. *Fixed by:* his own words, 24 September 2026, *"I like the idea of it being: you are the nation
itself that you are playing"*; director's brief §3. This supersedes the older *"You are a government, not
a person"* (D260, item 4), which is ❌ *do not use.*

**government** — whichever party currently rules a nation, and the thing that changes underneath the
player at an election. *Fixed by:* `docs/design/governing-design.md`; D260 item 4.

**leader** — the person at the head of a government, with traits and a tenure. Changes; the nation does
not. *Fixed by:* `DESIGN.md`; his own words, 24 September 2026, on kings and queens constantly changing.

**faction** — ❌ *do not use.* It appears only in one 29 August code review he pasted in, where it stood
for a **nation**, a **movement** and a **starting position** in the same document. Say **nation** or
**movement**.

## 1.3 Politics

**the political board** — the shape politics is measured on: three axes, each running from −1 to +1, and
ten places on it. *Fixed by:* D231, 15 September 2026, and his own words that day: *"three axes and ten
positions"*. ⚠ **The bare word "board" has five jobs — see Q5.**

**the three axes** — **economy** (collective ↔ neo-liberal), **morals** (conservative ↔ progressive) and
**power** (authoritarian ↔ libertarian). *Fixed by:* `GDD.md` §15.1 (D231). His own first naming, 9
September 2026, was *"economic, moral, authority/liberty"*, and he asked that same day for *"capitalist"*
to become *"neo-liberal"* *"in the game terminology"* — his instruction, carried out.
⚠ **The third axis being called "power" collides with the five stocks — see Q9.**

**ideology · position · party** — ⚠ **three words competing for the ten places on the board, and the two
records that fix them disagree. Unsettled. See Q3.** He asked this question himself on 9 September 2026
and it has never come back to him in his own words: *"we should also nail down vocbulary [sic]. Should
this be a political party or ideology? I feel like ideology is a term already in use but it doesn't make
sense that one political part [sic] is now reperesented [sic] in indivual [sic] nations."*

**the eight corners** — the eight places at the corners of the cube the three axes make: Fascism,
Distributism, Democratic Socialism, Communism, Christian Nationalism, Anarcho-Capitalism, Liberal
Anarchy, Digital Technocracy. *Fixed by:* `GDD.md` §15.1, laid out as he arranged them.
⚠ **What to CALL one of them is Q3.**

**the two centrists** — Republicans and Democrats, holding the middle on economy and on power, which is
what makes the count ten rather than eight. *Fixed by:* `GDD.md` §15.1 (D231).

**Despotism · Stateless** — two conditions off the outer edges of the board that a nation falls into
rather than votes for. Not ordinary places on the board. *Fixed by:* `CLAUDE.md`, settled facts; `GDD.md`
§15.1. Both wait until after the alpha; Stateless ground is in the alpha but is not a playable nation
(D239). ⚠ **"the Despotism state" uses the word "state" for a condition — see Q1.**

**affinity** — how close any two places on the board are, as one fraction between 0 and 1, and the single
number that drives coalitions, drift, liberty, trade alignment and how the AI treats you. *Fixed by:*
`docs/design/identity-design.md`; `DESIGN.md` §3.1.

**drift** — the slow movement of an Area's politics toward a blended target, turn by turn. People change
party; the Area's total does not change. *Fixed by:* `DESIGN.md` §4.

**election** — the vote inside one nation that can change its government, and the only thing martial law
touches. *Fixed by:* `docs/design/governing-design.md`; politics ruling 14.

**change course** — a government deliberately moving its party across the board, priced by how far it
moves and gated on having the popular share for the mandate. *Fixed by:* politics ruling 40, 11 September
2026. ⚠ **Its price depends on Q3 being answered.**

## 1.4 Movements, pressure and breaking away

**movement** — ⚠ **two meanings in his own words, unsettled. See Q4.**

**pressure** — the anger that builds in an Area and makes a movement grow there: the thing the Pressure
map paints, and the game's word to the player. This is **his** word. *Fixed by:* his own words repeatedly
from 30 August 2026 — *"other areas will start with sepratist [sic] pressure"* — and the built game's
Pressure map mode (`DESIGN.md` §8).

**grievance · sentiment** — ❌ *do not use to the player.* Say **pressure**. They survive as the studio's
internal names for the same thing. ⚠ **Whether they may be used between ourselves is Q10.**

**homeland** — every Area a given movement *can* exist in. Geography decides where; politics decides how
strong it is there. *Fixed by:* `DESIGN.md` §7.1. **Not his word** — it does not appear in any message of
his. Flagged, not struck.

**core** — the smallest set of a movement's homeland Areas holding sixty per cent of its people, never
fewer than three, and the set it must hold to declare. Worked out from the data, not hand-written.
*Fixed by:* `DESIGN.md` §7.1.

**declare** — the moment a movement stops being pressure and becomes a nation. *Fixed by:*
`docs/design/movements-design.md`.

**secede · secession** — a part of a nation leaving it to become its own nation. *Fixed by:* round 1 of
ideation (`docs/design/secession-ideation.md`); his own framing, 6 September 2026: *"This is a game at a
story level about sesscionist [sic] movements"*.

**realised** — his word for a movement that has become a nation, first used 7 September 2026: *"When a
nation is realized [sic] (at turn 0 or later on in the game)"*. Kept because it is his, and not chosen
against **declare** here. ⚠ *Gap: nothing specifies whether these two words name one event or two. See
section 4, G4.*

**civil war** — the fight that breaks out inside a nation when what it has swallowed flips its own
politics. *Fixed by:* `DESIGN.md` §6; his own rule from 3 July 2026 about annexing across a political
line triggering one.

## 1.5 The turn

**turn · round · slot** — ⚠ **the most load-bearing collision in the project, and unsettled. See Q2.**
Do not write "turn" or "round" in a specification until he has answered.

**one turn is one quarter** — whatever the turn is *called*, its length is settled: one quarter, four to
a year, and every rate in the engine is tuned per quarter. *Fixed by:* D163; `CLAUDE.md`, settled facts.
His own *"Also one turn is one month"* (5 September 2026) was replaced by his acceptance of the quarter
the same day.

**the game's dates** — it opens **1 March 2036**, the eve of two hundred years since Texas declared
itself a nation, and ends in **2086** after **200 turns**. A playtest is **sixty** turns. *Fixed by:*
D163, D223; `CLAUDE.md`.

**phase** — ⚠ **three meanings, unsettled. See Q8.**

**action · move** — ⚠ **two words for the thing you do in a turn, unsettled. See Q11.** What is settled
is that there is **no budget**: no points, no cap, no one-action rule. *Fixed by:* D218; his own words,
15 September 2026: *"I don't want the one action per turn model."* The limits are money, time and
geography.

**nothing finishes in one turn** — the shape of the turn: a turn holds several things you can start, none
of them completes in it, and the things that do complete are a card you click. *Fixed by:*
`docs/design/turn-design.md` §2; `CLAUDE.md`, settled facts.

**the briefing** — what a nation is shown when its turn comes round, and the only place completion is
ever felt. *Fixed by:* `docs/design/turn-design.md`.

**card** — a full-screen thing you click that resolves at once: an expiring deal, a transit request, an
event. *Fixed by:* `docs/design/turn-design.md` §2. ❗ *Also the name for a question on the Control Board.
Two jobs, one word; see Q5's family.*

## 1.6 Money, goods and signed arrangements

**the six sectors** — the six kinds of production every Area's output is split across, including
Information Technology. *Fixed by:* `DESIGN.md` §5. ⚠ **He says "industries" and once "sectiosn" [sic];
whether the game's word is sector or industry is Q13.**

**resource** — a thing a nation needs or sells, measured as supply against demand and read as a band.
*Fixed by:* `DESIGN.md` §5; `docs/design/economy-design.md`.

**band** — which of five states a nation's supply-to-demand ratio sits in (Crisis, Deficit, Met, Surplus,
Glut), and the thing the player reads instead of the arithmetic. *Fixed by:* `docs/design/economy-design.md`.

**treasury** — the nation's money. One national pot, not one per region. *Fixed by:* his own words, 14
September 2026: *"Keep one national pot - for the first real alpha we want this to still be a simple
game"*.

**toll** — what it costs to move goods across somebody else's ground, and a cost rather than a payment
where Canada and Mexico are concerned. *Fixed by:* `docs/design/board-design.md`; `CLAUDE.md`.
**The toll system is parked by Aaron** until the economy technical document, in his words: *"Don't bring
this up again until we are working on the economy section."* Do not raise it.

**deal · agreement · treaty · pact · contract** — ⚠ **five words for signed arrangements between two
nations, unsettled. See Q12.** What is settled is the **durations**: 20, 30, 40, 50 and 100 turns, and
that signing a long one should cost something, which is not built yet, so today it costs nothing (D233).

**recognition** — whether the rest of the world admits a nation exists, carried as a figure per nation and
raisable as a move. Not being recognised costs you standing abroad. *Fixed by:* `DESIGN.md` §4.1, §6;
D166 (the recognition trade block stays — do not re-implement the version that removed it).
⚠ *He also used "recognized state" as one of three levels of nation on 6 September 2026 — see Q1.*

## 1.7 War and the military

**military is something a nation has, never pieces you move.** No units, no troop types, nothing to
direct around the map. *Fixed by:* his own words, 24 September 2026: *"I do want to stand firm on not
having military units, in the sense that they are a unit that you can move and direct and interact with
as a separate entity outside of the map."* Earlier: conquest ruling 11, *"There isn't going to be troops
/ troop types / etc."*

**annex** — taking ground from another nation. *Fixed by:* `DESIGN.md` §6; his own words from 3 July 2026.

**unite** — two nations agreeing to become one. *Fixed by:* `DESIGN.md` §6; his own words from 3 July 2026.

**union · federation · alliance** — three different things, and he separated them himself on 11 September
2026: *"A federation should be a relation between multiple states. Alliance is two states. A federation
is like the EU"*. A **union** is becoming one nation; a **federation** is many nations under a shared
leadership with its own budget; an **alliance** is two nations bound to each other. *Fixed by:* his own
words; politics rulings 25–37. ⚠ *His sentence uses "states" for nations — see Q1.*

**garrison** — soldiers standing on your own ground to buy quiet, which costs civil liberties. *Fixed by:*
`DESIGN.md`; conquest and politics rulings.

**occupation** — holding ground you have taken but not absorbed, which drags on what a nation can hold.
*Fixed by:* `DESIGN.md` §5, the anti-snowball brake.

**three acts are never a move** — forcing a population out, mass killing, and nuclear weapons against
cities. He confirmed all three provisionally on 24 September 2026: *"I think right now, … those do stay."*
Conquest ruling 31 goes further: no nuclear weapons at all. They may be named as history; never as a
button. *Fixed by:* tone rule 34; director's brief §6.

**persecuting a group is never a move.** It shows only as civil liberties falling, in his words: *"that's
where just the term 'civil liberties would go down' would be a blanket catch-all."* *Fixed by:* his own
words, 24 September 2026; director's brief §6.

**hostile** — ⚠ **two meanings, unsettled. See Q14.**

## 1.8 What a nation carries: the five stocks

**the five stocks** — the five numbers every nation carries, each recomputed once per turn, each able to
explain itself. *Fixed by:* `DESIGN.md` §4.1; `docs/design/power-design.md`.
⚠ **The collective name "Power" collides with the third political axis — see Q9.**

**Authority** — how firmly a nation holds its own ground. *Fixed by:* `DESIGN.md` §4.1.
⚠ **Collides with his own first name for the third axis, "authority/liberty" — see Q9.**

**Influence** — how much the rest of the world listens: the ability to make others *want* to follow.
*Fixed by:* `DESIGN.md` §4.1; his own pairing of the two, 11 September 2026: *"it costs a little
authority but increases influence."*

**Quality of life** — how well a nation feeds, treats and pays its people. Deliberately not the same as
how rich it is. *Fixed by:* `DESIGN.md` §4.1.

**Civil liberties** — how freely a nation lets people disagree, and the one blanket measure that carries
every kind of repression. *Fixed by:* `DESIGN.md` §4.1; his own words above.

**War weariness** — what a decade of fighting costs at home. The one stock that runs the other way and
the only one whose floor is zero. *Fixed by:* `DESIGN.md` §4.1.

**civil unrest · poverty · unemployment** — named by him on 14 September 2026 as things that *"won't be
things measured"* in the alpha, with the abstract ideas carried elsewhere. Not stocks. *Fixed by:* his own
words, 14 September 2026.

**the Why record** — the shape every one of these numbers comes back in: the value, what it is heading
for, and every named term that fed it with its own contribution and the tuning key that moves it. It is
what lets the game answer "why did that change". *Fixed by:* `docs/design/power-design.md` §1; `GDD.md`
§15.2.

**cohesion · alignment** — how together a nation's own people are, and how close a place's politics are
to somebody else's. Both are fractions, both feed the stocks. *Fixed by:*
`docs/design/identity-design.md`.

## 1.9 What the player reads

**the newspaper** — the player-facing paper that reports what happened, slanted by the governing politics
and limited by civil liberties. His own idea, 15 September 2026: *"I did have an idea of using the cliche
of a newspaper pop up window with some news of things happening and what the effects are"*. *Fixed by:*
his own words; `docs/design/events-design.md`; tone rules 5–7.

**journal** — ❌ *do not use.* It is used in the behaviour record for the newspaper itself
(*"the journal, which is the newspaper of what happened"*). Say **the newspaper**.

**register · ledger** — ⚠ *both used for "the list of what is still true" and for other lists entirely.
See section 4, gaps.*

**panel** — the part of a screen that shows one thing's figures: a nation panel, an Area panel. *Fixed
by:* `docs/design/presentation-design.md`; tone rules on Area panels.

**map mode** — one of the eight ways of colouring the map: ownership, Pressure, Political, GDP,
Population, Geographic, Culture, Economy. **His word**, from 3 July 2026. *Fixed by:* `DESIGN.md` §8.
⚠ **"mode" also names Economy mode and the developer mode — see Q15.**

**mission · mission tree** — the long chain of things a nation is working toward, giving direction,
challenge and a story. One tree per nation or group of nations. *Fixed by:* his own words, 15 September
2026, on what he likes about the EU4 mission tree: *"1. It gives you direction to play 2. It gives you
challenges to the play 3. It gives the play a story"*; `docs/design/missions-design.md`.
⚠ *The levels inside a tree have three names — see section 4, gaps.*

**event** — something that happens to a nation that it did not start, arriving as a card. *Fixed by:*
`docs/design/events-design.md`.

**the interface comes first.** In his words, the priority for the alpha is *"not so much the art of the
design, but it's the user interface and experience. Because right now this is a huge problem"* (24
September 2026). *Fixed by:* director's brief §4.

## 1.10 How the project is run

**the alpha** — always the **game** alpha that stage 3 works towards: Texas, the Great Lakes and the
West. *Fixed by:* `CLAUDE.md`; D239. His own distinction, 5 September 2026: *"this is the economy alpha
not the game alpha."*

**Economy mode** — the built sandbox that isolates the economy, with politics and movements switched off
and no win condition; testers are told so. It is a set of flags, not a fork. **Never call it "the economy
alpha".** *Fixed by:* `CLAUDE.md`; D162, D173.

**the beta** — where the sharp, biting, sardonic voice and the jokes arrive. In his words: *"the beta
version is when I would definitely want that kind of sharp, biting, sardonic voice to show up."* *Fixed
by:* his own words, 24 September 2026; D242, D261.

**stage · phase · milestone · step · round** — ⚠ **five words for the project's own units of time and
they overlap. Unsettled. See Q8.**

**the road to alpha** — the adopted order of work from here to the alpha, twelve milestones, M0 to M11.
*Fixed by:* D264.

**task** — one named piece of work on the road with its own "done when", which starts as soon as
everything it waits for is done rather than when its milestone's turn comes. *Fixed by:* D272.

**the Control Board** — the page in his browser where he reads progress and answers decisions. In his
words: *"The ai was mistaken. The control board is just for me to document your progress. The game will
be played in a browser as it has been."* **It never drives the game**; every testing control belongs to
the developer dashboard. *Fixed by:* his own words, 5 September 2026; D162.

**Hog Wild Mode** — his standing permission to keep building without stopping to ask, answering the
questions that would otherwise become cards and logging each one. **His own name**, coined 5 September
2026. *Fixed by:* his own words; `docs/HOGWILD.md`.

**a decision (D-number)** — a dated entry in the decisions log recording what was observed, what was
decided and what was rejected. A wrong call is superseded by a new entry, never edited away. *Fixed by:*
`CLAUDE.md`.

**a ruling** — one numbered answer of his from an ideation round, cited as "conquest ruling 31", "politics
ruling 40". *Fixed by:* the ideation documents.

**an open question** — a decision Aaron has not made. **A gap** — something referenced but never
specified. They are kept apart, at the end of the document that owns them and nowhere else. *Fixed by:*
`CLAUDE.md`; D253.

**a defect** — a known fault that does not block the work, filed with a number. *Fixed by:* `CLAUDE.md`.

**tunable** — a named number the game reads from the one tuning file, which he can change, reload and see
the effect of without a rebuild and without anyone's help. Never a second tuning file. *Fixed by:* D162.

**seed** — the number that makes a run repeat exactly. The same seed reproduces a run exactly, and it is
tested. *Fixed by:* `CLAUDE.md`. ⚠ *Also used for a movement's starting ground in the behaviour record —
see section 4, gaps.*

**playtest · screening · first look · dress rehearsal** — ⚠ **his word and the road's words differ, and
his own spelling varies. See Q16.**

**Terra and Luna** — his two computers, the PC and the MacBook. **Never roles.** *Fixed by:* `CLAUDE.md`.

## 1.11 The studio

**role** — a job description, not a person. One role file can be run several times at once. *Fixed by:*
`docs/design/STUDIO-ROSTER.md`, rule 3.

**hired** — a role is hired when its definition file exists, which happens when its first job arrives.
Naming a role does not hire it. *Fixed by:* D262.

**function** — one of the six groups the roles fall into. ⚠ **The six have three different sets of names
in three places. Unsettled. See Q7.**

**the naming scheme** — every role is named after a body in the solar system: Aaron is the Sun, a planet
leads a function, its moons are the roles under it, and the dwarf planets are the ones who find things
out. **His scheme.** *Fixed by:* D262. ⚠ *Four role names break the rule — part of Q7.*

**Creative Director** — Aaron. Owns the vision and makes every final call. Roles bring him decisions, not
conclusions. *Fixed by:* `docs/design/STUDIO-ROSTER.md`.

**the maker never approves its own work.** Every gate names a different reviewer. *Fixed by:*
`docs/design/STUDIO-ROSTER.md`, rule 2.

---

# 2. Alphabetical index

Words with a settled meaning are plain; **⚠** marks a word held open in section 5.

action ⚠ Q11 · adjacency · affinity · agreement ⚠ Q12 · alignment · alliance · alpha · annex ·
Area ⚠ Q6 · Authority ⚠ Q9 · band · beta · board ⚠ Q5 · briefing · card · change course · civil liberties ·
civil unrest · civil war · coastal · cohesion · Control Board · contract ⚠ Q12 · core · corridor ·
country ⚠ Q1 · county ⚠ Q6 · Creative Director · cultural region ⚠ Q6 · dates (the game's) ·
deal ⚠ Q12 · declare · decision · defect · Despotism · dress rehearsal ⚠ Q16 · drift · eight corners
(the) ⚠ Q3 · Economy mode · election · event · faction ❌ · federation · first look ⚠ Q16 · former state ·
function ⚠ Q7 · garrison · gap · government · grievance ❌ Q10 · hired · Hog Wild Mode · homeland ·
hostile ⚠ Q14 · ideology ⚠ Q3 · Influence · industry ⚠ Q13 · interface · journal ❌ · leader · ledger ⚠ ·
map mode ⚠ Q15 · milestone ⚠ Q8 · military · mission · mission tree · mode ⚠ Q15 · move ⚠ Q11 ·
movement ⚠ Q4 · naming scheme (the) · nation · newspaper · nothing finishes in one turn · occupation ·
one turn is one quarter · open question · pact ⚠ Q12 · panel · party ⚠ Q3 · phase ⚠ Q8 · the player ·
playtest ⚠ Q16 · political board (the) ⚠ Q5 · port · position ⚠ Q3 · poverty · pressure ·
Quality of life · realised · recognition · region ⚠ Q6 · register ⚠ · resource · road to alpha · role ·
round ⚠ Q2 · ruling · screening ⚠ Q16 · secede · secession · sector ⚠ Q13 · seed · sentiment ❌ Q10 ·
slot ⚠ Q2 · stage ⚠ Q8 · state ⚠ Q1 · Stateless · step ⚠ Q8 · stocks ⚠ Q9 · task · Terra and Luna ·
three acts are never a move · three axes (the) ⚠ Q9 · toll · treasury · treaty ⚠ Q12 · tunable ·
turn ⚠ Q2 · two centrists (the) · unemployment · unite · union · War weariness · Why record ·
world market

---

# 3. What stands in place of traced scenarios, and the test it replaces

Every design document in this project ends by walking scenarios step by step. **A word list has no
scenarios to walk** — it describes no behaviour, so there is nothing to push until it breaks.

**What stands in its place is a harder test: three mix-ups that have already cost this project real time,
walked backwards, asking whether this list would have caught each one.** A list that cannot catch the
mistakes already made is decoration.

### Walk 1 — The one-action-per-turn rule nobody asked for

**What happened.** On 3 July 2026 he wrote: *"I am thinking that a turn is lets you take one action for a
country. Once that action is done it moves onto the next nation."* In the same session he also wrote *"At
the end of each round of turns new people will be added to each county"*. So in his own first words, a
**turn** was one nation's single move and a **round** was the whole cycle. A programmer built exactly
that. On 15 September 2026, ten weeks later, he wrote: *"I don't want the one action per turn model."*

**What it cost.** The turn had to be redesigned from scratch — his own instruction on 15 September 2026
was *"we need to ignore everything about how turn design is built in the current game and we need to come
up with a brand new idea as if that had never been a thing"* — and the rule that replaced it now needs
the whole of M6.

**Would this list have caught it?** **Yes, and this is the clearest case in the project.** With one word
per idea — a **turn** being the quarter the world advances by, and a separate word for one nation's place
inside it — the July sentence would have read as a statement about a nation's *slot*, not about the length
of a *turn*. The programmer would have had a budget of one action attached to a slot, visibly, where Aaron
could see it and object in July instead of September. **The two words were carrying one idea each in his
head and both idea-loads landed on the word "turn".** This is Q2, and it is why Q2 is urgent.

### Walk 2 — "earns" meant *improves*, and money got into it

**What happened.** While the economy wiring was being triaged, the studio found it had built a word:
Aaron had used **"earns"** five times to mean *improves*, and money never came into it. The design had
read it as money. Thirteen changes were needed to unpick it — one arrow deleted, one reversed, eight
relabelled, four typos including one that said the opposite of what the arrow meant.

**Would this list have caught it?** **Partly, and honestly no by itself.** A list cannot know in advance
which of his ordinary English words is about to become a technical one. What catches this is the rule the
list exists to serve: **a word of his that is not on the list is a question, not a guess.** "Earns" was
not on any list, so it should have produced one question to him in a sentence — *when you say a good
harvest "earns" you standing, do you mean money or do you mean it improves?* — instead of thirteen
repairs. **The list's real product is not the entries. It is the habit of asking.**

### Walk 3 — "Hostile" is two things and the game would have taught a player something false

**What happened.** On 8 September 2026 he wrote his own list of the conditions between two nations: *"War
· Cease-fire · Hostile · Peace-treaty · Peace · Subject · Allied"*. Separately, the relations score has
bands, and one of the bands is also called *Hostile*. The diplomacy design document found the collision
itself and wrote the verdict plainly: a panel reading "Hostile" is **not** in the Hostile condition,
because that condition is not built — flagged in that document as something that *narrates and teaches
the player something false*.

**Would this list have caught it?** **Yes, and earlier than the design document did.** The collision is
visible the moment both uses are written on one page next to each other, which is what a word list is.
The cost of missing it is not developer time — it is a player being told something untrue on screen. This
is Q14, and it is cheap to answer.

### What the three walks say about this list

Two of the three were caught by a word colliding with another word (Q2, Q14) and one by a word of his
being taken as technical when it was ordinary (Walk 2). **So the list needs both halves to work:** the
entries in sections 1 and 2, and the standing rule that a word not on it is a question. One without the
other would have caught two of these three at best.

---

# 4. Gaps — referenced somewhere, never given a meaning

These are not questions for Aaron. They are things the studio has left unspecified and must specify.

| # | The gap | Who owns it |
|---|---|---|
| **G1** | **"register" and "ledger" each do three jobs and neither is defined.** "The register of what is still true" is the deals screen; a *register* is also the list of parties and the list of movements; a *registry* is also the internal list of the moves a nation can make. "Ledger" is the deals list, and also the internal record a turn appends to. Nothing says which is which. | The presentation design document |
| **G2** | **The levels inside a mission tree have three names.** He has used "mission goals", "the smaller goals you are working [toward]" and "mission objectives" in the same week; the missions document uses "objective". Nothing specifies whether a goal and an objective are the same size of thing. | The missions design document |
| **G3** | **"seed" does two jobs.** The number that makes a run repeat, and a movement's starting ground. Both are in current documents. | The technical design |
| **G4** | **"declare" and "realised" may be one event or two.** A movement *declares*; he calls a movement that has become a nation *realized [sic]*. Nothing says whether these name the same moment. | The movements design document |
| **G5** | **A seventh studio function, Marketing, is named but has no name in any of the three sets** and no roles under it. | The roster |
| **G6** | **"pass" as a unit of work** — "the contracts pass" — is used on the road but never defined against milestone, task or step. | The road |
| **G7** | **"Stateless ground"** is in the alpha and is not a playable nation, but nothing gives one word for ground that no nation holds. | The design documents |
| **G8** | **"the system" versus "the component"** — nineteen systems are counted on the road and six components in the ideation plan, with no statement of whether they are the same list at different grain. | The road |
| **G9** | **"legitimacy" and "trust" are his words and no system carries either.** Telling the break-up story on 7 September 2026 he wrote that *"the legitimacy of the United States was threatened"*, that Washington *"didn't want to hurt their already fractured legitimacy in the world stage"*, and that *"the people's trust in the US government dropped"*. The five stocks carry Authority, Influence, Quality of life, Civil liberties and War weariness — none of them is called legitimacy or trust. Either one of the five is what he means, or the story is describing something the game does not measure. **Not a question for him until the studio can say which**; it is not on the list above because no record gives it a meaning. | The stocks specification |

---

# 5. ⚠ The doubled words: questions for Aaron

**These are his to answer and nobody else's.** Each one names the word, every meaning it has carried,
where each came from, what breaks if the wrong one is used, and then the question with the options named
so it can be answered by picking one.

**The three that matter most, in order: Q1, Q2, Q3.** The pass that writes down what every system hands
every other system cannot be written until those three have one meaning each, and the politics and the
new turn are both built at M6.

---

## Q1 — "state" means five different things

**Every meaning it has carried:**

| Meaning | Where it came from |
|---|---|
| **1. One of the fifty-one United States states the board starts from** | His own first sentence about the game, 3 July 2026: *"every state in the nation becomes it's own nation."* |
| **2. A nation on the board** — the thing you play | His own words throughout, e.g. 3 July 2026: *"if a republican state annexes democrat territories"*; 6 September 2026: *"I want three levels of states with the highest being a recognized state, the middle being a secessionist state, and the third being a stateless society"* |
| **3. A condition between two nations** | His own list, 8 September 2026: *"I think that there needs to be other states as well which would be: War · Cease-fire · Hostile · Peace-treaty · Peace · Subject · Allied"* |
| **4. The game's saved position** — everything the game is holding at that moment | His own early build instructions, 6 July 2026: *"The ENTIRE game state must live in ONE object"*; the behaviour record's "state is columnar" |
| **5. A condition a nation falls into** | "the Despotism state", "Stateless", in the current rules and design |

In one sentence of his, on 8 September 2026, meanings 2 and 3 are both present: *"I agree that it is a
standing state that will impact the state's relations with other countries."*

**What breaks if the wrong one is used.** This is the word the contracts pass has to write down most
often, and every wrong reading is a silent one. A specification saying "the state's figures" can mean a
nation's, a saved game's or a former state's. Worse, the record of a movement already carries **both** a
"nation" field and a "state" field, so the collision is in the game's own data today. A tester reading
"Texas is in a hostile state" cannot tell whether that is who Texas is or how Texas feels about you.

**The question.** Which word does each job? Suggested options, and you can mix:

- **(a) The thing you play:** **nation** (the built game's word everywhere) · or **state** (your own most
  frequent word) · or **country** (which you also use)
- **(b) The fifty-one you started from:** **former state** · **old state** · **US state** · or keep
  **state** for this and nothing else
- **(c) The condition between two nations:** **standing** · **relationship** · **footing** · or keep
  **state**
- **(d) The saved position:** **the save** · **the position** · or keep **state** (it is never shown to a
  player, so this one is cheap)
- **(e) Despotism and Stateless:** **condition** · **state** · or a different word for each

**What is blocked until you answer:** the contracts pass (M3) cannot name the data every system passes;
the diplomacy specification cannot name its conditions.

---

## Q2 — "turn" and "round" have swapped places, and a third word has appeared

**Every meaning each has carried:**

| Word | Meaning | Where it came from |
|---|---|---|
| **turn** | **One nation's single move.** *"a turn is lets you take one action for a country. Once that action is done it moves onto the next nation."* | His own words, 3 July 2026 |
| **turn** | **One quarter of game time** — the world advancing once, with all sixty-one nations having moved | D163, D223; the current rules |
| **round** | **The whole cycle of all nations' moves** — *"At the end of each round of turns new people will be added to each county"* | His own words, 3 July 2026 |
| **round** | **One of the seven ideation rounds** — *"Round 1 is closed. Open round 2, military conquest"* | His own words, 8 September 2026, and throughout September |
| **round** | **The same thing as a turn** — *"at round turn 60"*, *"the next 60 round game they play"* | His own words, 24 September 2026 |
| **slot** | **One nation's place in the cycle** — the new word for what you called a turn in July | The turn design document, this month |

**What breaks if the wrong one is used.** Walk 1 in section 3 is what this already cost: the whole
one-action-per-turn rule, which you did not ask for and which now needs M6 to undo. Every rate in the
engine is tuned *per quarter*, so a document that says "per turn" meaning "per nation's move" is wrong by
a factor of sixty-one. And "round 2" meaning an ideation round sits in the same sentences as "turn 60"
meaning game time.

**The question.** Three jobs need three words:

- **(a) One quarter of game time, the world advancing once:** **turn** (what everything is tuned in
  today) · or **round** (which is what you have called it twice recently)
- **(b) One nation's place inside that:** **slot** · **turn** · **your move** · **your go**
- **(c) The design rounds 1–7 that are finished:** **round** · **pass** · **session** · or retire the word
  now that they are closed and call them by name (the secession round, the conquest round…)

**What is blocked until you answer:** the new turn (M6) and its specification; the contracts pass; and
every number in the tuning file that is labelled "per turn".

---

## Q3 — "ideology", "position" and "party" are three words for the ten places on the political board, and the two records disagree

**You asked this question yourself and it has never come back to you in your own words.** On 9 September
2026: *"we should also nail down vocbulary [sic]. Should this be a political party or ideology? I feel
like ideology is a term already in use but it doesn't make sense that one political part [sic] is now
reperesented [sic] in indivual [sic] nations."*

**What each word has meant:**

| Word | Meaning | Where it came from |
|---|---|---|
| **position** | One of the ten places on the board | **Your own words**, 15 September 2026: *"three axes and ten positions"* (D231) |
| **ideology** | One of the ten places on the board — *"a position on the board"*, fixed, universal, and unable to move because it *is* a location | Politics ruling 40, 11 September 2026 |
| **ideology** | One of the six colours the built game runs on today, on two axes | The built game |
| **party** | An organisation inside **one** nation that occupies a position and contests that nation's elections — so Dallas and Vermont can both hold a Libertarian party and they are two different parties | Politics ruling 40 |
| **party** | **The eight corners of the cube themselves** — *"The eight corners of that cube are parties, each named for a real one"* | The game design document §15.1, written up from D231 on 15 September 2026, **four days after ruling 40** |
| **party** | The two Republican/Democrat head counts every Area carried in the original build | The built game |

**So the later record calls the corners "parties" and the earlier ruling says a party is a per-nation
organisation.** Both cannot be right. **Your own most recent word on it is "positions".**

**One thing you should know before you answer.** Politics ruling 40 is recorded as *"agreed without
change"*, but the three definitions are the **studio's** wording, not yours; your messages that day are
short assents — *"Agreed."*, *"Correct"*, *"Everything else is great"*. Under this project's own rule,
studio wording is never quoted as yours even where you approved it. **So the single most important
vocabulary ruling in the project has no sentence of yours behind it.** That is why it is a question here
rather than an entry above.

**What breaks if the wrong one is used.** "The nation's ideology" and "the movement's ideology" mean two
different kinds of thing today and nobody noticed for weeks. The price of *changing course* is meant to be
the distance a party moves across the board — if a party *is* a fixed corner, it cannot move and the price
has nothing to measure. Nine other systems read the distance between two places on the board.

**The question.** Which word for which job?

- **(a) One of the ten places on the board:** **position** (your own word) · **ideology** (ruling 40's
  word) · **party** (the design document's word)
- **(b) A political organisation inside one nation that fights that nation's elections:** **party** ·
  **the governing party** · a new word if (a) takes "party"
- **(c) The six colours the game runs on today, until they are converted:** the same word as (a), or a
  separate word so nobody mixes the old board with the new one — e.g. **the old colours**

**What is blocked until you answer:** the politics build (M6) and its specification; the contracts pass;
the re-map of all twenty-six live movements; every formula that reads political distance.

---

## Q4 — "movement" means two things in your own words

| Meaning | Where it came from |
|---|---|
| **A want tied to one nation** that grows in Areas and can break away — a separatist movement | Your own words, 7 September 2026: *"sepertist [sic] movements should be locked to the existence of a nation."* |
| **A political current** that a separatist want may travel along | The same sentence: *"That sepertist [sic] movement might be lined up along a certain political movement but first and foremost it is tied to a nation."* |

Politics ruling 40 settled *ideology* and *party* and left *movement* explicitly **"unchanged"**, so this
half was never answered. The built game makes it worse: what the design calls movements are stored under
the name "parties", thirty-two of them.

**What breaks if the wrong one is used.** A movement's strength in an Area is a slice of the people who
hold a particular politics there — so "the movement's politics" and "the movement" are two things that
must never be confused, and today one word covers both.

**The question.** What do you call each?

- **(a) The want tied to a nation that can break away:** **movement** · **separatist movement** ·
  **claim** · **cause**
- **(b) The political current it travels along:** **politics** · **position** (see Q3) · **current** ·
  **movement**

**What is blocked:** the movements specification and the contracts pass.

---

## Q5 — "board" means five things

| Meaning | Where it came from |
|---|---|
| **The map and its geography** — *"the board opens on sixty-one nations"* | The project's own one-paragraph description |
| **The political board** — the cube of positions | The game design document §15.1 |
| **The Control Board** — your page in the browser | **Your own words**, 5 September 2026 |
| **The opening board** — how the world stands on turn one | The opening-board design document |
| **The leader board** — the ranking list down the side | **Your own words**, 3 July 2026 |

The current rules already contain the sentence *"check a formula's board"*, meaning *which political board
does this formula read* — which only makes sense if you already know which of the five is meant.

**What breaks if the wrong one is used.** "Everything on the board" has been read as the map, as the
Control Board and as the political cube in three different documents this month. A card on the board is a
question for you; a card in the game is a full-screen thing you click.

**The question.** Which of the five keep the word?

- **(a)** Keep **board** for the map, and always say **the political board** and **the Control Board** in
  full · **(b)** Keep **board** for the Control Board only, since that is the one you use daily, and call
  the map **the map** · **(c)** Retire the bare word: always **the map**, **the political board**, **the
  Control Board**, **the opening map**, **the rankings**

**What is blocked:** the Control Board redesign's own words, and the check of it for jargon.

---

## Q6 — "area", "county" and "region" do not divide the map cleanly

| Word | Meaning | Where it came from |
|---|---|---|
| **county** | A real US county — the raw data | Your own words, 3 July 2026 |
| **Area** | The unit the game plays on: a county, or several small ones merged | Your own instruction, 8 July 2026, and the built game |
| **Area** | **Tier 3 of the map's groupings** — *"Super region (tier 1), Region (tier 2), Area (tier 3)"* | **Your own words, 8 July 2026, the same week** |
| **area** | A loose part of the country — "the Texas area", one of the alpha's three | The current rules |
| **region** | Tier 2 of the groupings | Your own words, 8 July 2026 |
| **region** | One of the twenty cultural textures an Area carries | The built game |
| **region** | One of the alpha's three story areas — Texas, the Great Lakes, the West | D239; version numbering |
| **region** | Loosely, one Area — *"whether a region turns against the country holding it"* | The ideation plan |

You have also written **"counties/areas"** as one thing (7 September 2026), and asked outright on 6
September 2026 whether the unit is right at all: *"Counties - are they to granular [sic] for the game to
actually be fun? Maybe a better way to break things out would be to use approximate congressional district
maps."* **That question has never been answered and is not this one** — it is filed for you separately.
There is also a nation on the opening board called **Bay Area**.

**What breaks if the wrong one is used.** Every figure in the game is carried per Area, so a specification
that says "per region" can mean per Area, per cultural texture or per third-of-the-country — three
quantities that differ by a factor of hundreds. "All three regions" is the name of a version milestone.

**The question.** Three or four jobs, and they need different words:

- **(a) The unit the game plays on:** **Area** (the built word) · **county** (your most-used word, 149
  times) · **district**
- **(b) The tiers above it:** keep **super region / region / group** · or **big region / region /
  cluster** · or drop the tiers entirely for the alpha, since only the twenty cultural ones are built
- **(c) The twenty cultural textures:** **culture** · **cultural region** · **character**
- **(d) Texas, the Great Lakes and the West:** **region** · **theatre** · **story** · **front**

**What is blocked:** the contracts pass, the map specification, and the M4 scope sheet, which has to name
what is in and out by one of these words.

---

## Q7 — the studio's six teams have three different sets of names

| Set | The names | Where |
|---|---|---|
| **1** | Running it · Capturing his intent · Defining it · Finding out · Making it · Checking it | The roster's table |
| **2** | Running it · Capturing intent · Design · Research · Building *(no Checking heading — QA sits under Building)* | The roster's own section headings, on the same page |
| **3** | Running · Intent · Design · Research · Build · Checking | The session-naming rule you approved (D265) |

**Two smaller things ride along with it.** The naming scheme says a planet leads a function and **its
moons** are the roles under it — but four names are not moons of the planet they sit under (three sit
under Neptune and are bodies beyond it; one sits under Mars and shares its orbit rather than orbiting it).
And the roster says Pluto *"finds out what Aaron means"* among the dwarf planets while its table files
Pluto under *Capturing his intent* rather than *Finding out*.

**What breaks if the wrong one is used.** Nothing in the game. It costs you clarity: every session is
renamed at sign-off with these words so you can see at a glance which teams touched the work, and three
sets means the names sort into three groups in your own list of sessions.

**The question.** Three small picks:

- **(a) Which set of six names?** Set 1 (the roster's, plainest) · Set 3 (the short ones you already
  approved for session names) · a mix, e.g. **Running · Intent · Design · Research · Build · Checking**
  with the longer ones as descriptions
- **(b) The naming rule:** widen it to *"a planet leads a function, and the bodies that travel with it are
  the roles under it"* · or rename the four that break it
- **(c) Pluto's team:** *Capturing intent* (where the table puts it) · or *Finding out* (where the dwarf
  planets sit)

**What is blocked:** nothing urgent. Worth answering while the rest are in front of you.

---

## Q8 — "stage", "phase", "milestone", "step" and "round" all mark the project's own units of time

| Word | Meaning | Where |
|---|---|---|
| **stage** | One of your four big stages — *"There are essentially four stages of this that we are doing: 1. Ideation and design 2. Architecture and planning 3. Programming and verifying 4. Play testing"* | **Your own words**, 6 September 2026 |
| **phase** | The same thing — *"right now we are only in the ideation and design phase of this"* | **Your own words**, 6 September 2026, the same day |
| **phase** | One of the economy brief's numbered phases — *"How much longer until you are done with phase 0"* | Your own words, 5 September 2026 |
| **phase** | One step of the engine's work inside a single turn | Your own early build instructions, 6 July 2026; the built game |
| **phase** | The next part of the project — *"lets not worry about now and wait until the next phase"* | Your own words, 11 September 2026 |
| **milestone** | One of the twelve on the road, M0 to M11 | D264 |
| **milestone** | One of the old rebuild plan's, M0.1 to M7 | The rebuild plan |
| **step** | A paper step on the old board; also a sub-part of a milestone | The road, which records that *three step-numbering systems disagree and one of them is off by one* |
| **round** | One of the seven ideation rounds | Your own words (also Q2) |

**What breaks if the wrong one is used.** "Phase" is the sharpest: one of its meanings lives inside a
single turn of the game and another spans months of work, and the engine's ordering rule — what a phase
may read and write — is a rule about the first kind. A sentence about "the phase contract" and a sentence
about "the next phase" are about different worlds.

**The question.** Pick one word per size:

- **(a) The four big ones (ideation and design, architecture and planning, building, …):** **stage** ·
  **phase** · **act** *(your domain: an act of the production)*
- **(b) The twelve on the road:** **milestone** · **step** · **sequence** *(your domain: a sequence you
  shoot)*
- **(c) A named piece of work inside one of those:** **task** (already in use) · **step** · **shot**
- **(d) One step of the engine's work inside a single turn:** **phase** (the built word, never shown to a
  player) · **step** · **stage**

**What is blocked:** the technical design's own language, and the schedule on the new board.

---

## Q9 — "power" is both a political axis and the name of the five stocks

| Meaning | Where |
|---|---|
| **Power** = the third political axis, authoritarian ↔ libertarian | The game design document §15.1 (D231) |
| **Power** = the collective name for the five numbers every nation carries (Authority, Influence, Quality of life, Civil liberties, War weariness) | The behaviour record §4.1 and the power design document |
| **Authority** = one of those five stocks | The same |
| **authority/liberty** = **your own first name for the third axis** | Your own words, 9 September 2026 |

So the axis is called by the name of the five stocks, and your own name for the axis is the name of one of
them.

**What breaks if the wrong one is used.** A nation's Authority (how firmly it holds its ground) and a
nation's place on the authoritarian–libertarian axis are different numbers that move for different
reasons, and both are called authority in places. "The power model" has already been read both ways.

**The question.**

- **(a) The third axis:** **power** · **government power** *(your own longer phrasing, 9 September)* ·
  **liberty** · **control**
- **(b) The five numbers together:** **the stocks** · **the five** · **standing** · keep **power**

**What is blocked:** the politics specification and the stocks specification, which are written by
different people and both use the word today.

---

## Q10 — "pressure", "grievance" and "sentiment" are one idea with three names

**Pressure** is your word, used from 30 August 2026 onward, and it won: the game has a **Pressure** map
mode, and in a game about fragmentation that is the map that matters. But the design documents say
**grievance** for the anger that builds and **sentiment** for the number underneath it, and both appear in
current specifications.

**What breaks if the wrong one is used.** A document that says grievance and a document that says
sentiment are describing the same figure, and a reader cannot tell whether they are two inputs or one.

**The question.** Is it one word or two?

- **(a)** One word everywhere: **pressure**
- **(b)** **Pressure** to the player, **sentiment** between ourselves for the figure — and **grievance**
  retired
- **(c)** Keep all three with a stated difference (and then it needs stating)

**What is blocked:** the movements specification. Low cost, easy win.

---

## Q11 — "action" and "move" both name the thing you do in a turn

The behaviour record's chapter is called **Actions**; the built game's internal list is called **moves**,
eleven of them; the economy work says *"Trade becomes a Move"*. **What is settled is that there is no
budget** — no points, no cap, no one-action rule (D218, and your own words of 15 September 2026).

**What breaks if the wrong one is used.** Less than the others — but the one-action rule is being removed
at M6 and the word "action" carries its memory. A document saying "this costs an action" will read as a
budget that no longer exists.

**The question.** **(a)** **move** *(the built word, and it retires the budget's memory)* · **(b)**
**action** · **(c)** **move** for the thing and **act** for doing it

---

## Q12 — five words for a signed arrangement between two nations

**deal** (your word for trade), **agreement** (your word for tolls), **treaty** (your word for peace),
**pact** (the built word for non-aggression), **contract** (the studio's word for a standing trade).
Durations are settled at 20, 30, 40, 50 and 100 turns (D233).

**What breaks if the wrong one is used.** A "deal ledger" and a "treaty" and a "standing contract" are one
screen or three, and nobody can tell from the documents which. Whether a peace treaty also means
recognition is already an open question of yours from 15 September.

**The question.** **(a)** One word for all of them — **agreement** — with kinds beneath it (trade, transit,
peace, non-aggression) · **(b)** **deal** for anything about money or goods, **treaty** for anything about
war and peace · **(c)** Keep your three (deal, agreement, treaty) and retire pact and contract

---

## Q13 — "sector" or "industry" for the six kinds of production

The design says **sector** (and the Sector Wiring board carries that word to you). You have said
**industries** — *"what are all the industries that the BEA recognizes and tracks?"*, 6 September 2026 —
and once wrote **"sectiosn"** [sic] on 7 September 2026.

**The question.** **(a)** **sector** · **(b)** **industry** · **(c)** **industry** to the player, sector
between ourselves

---

## Q14 — "Hostile" is a band on a score and a condition in a machine

Your own list of conditions between two nations (8 September 2026) includes **Hostile**. The relations
score also has bands, and one band is called **Hostile**. A panel reading "Hostile" is therefore not
necessarily in the Hostile condition — the diplomacy design document found this itself and recorded that
it *narrates and teaches the player something false*. The condition machine is not built; the bands are.

**The question.** **(a)** Rename the band (**cold**, **frosty**, **poor**) and keep **Hostile** for the
condition · **(b)** Rename the condition and keep the band · **(c)** Drop the condition, since it is not
built, and keep only the bands

**What is blocked:** the diplomacy specification. Cheap, and it stops a lie reaching a player.

---

## Q15 — "mode" names three unrelated things

**Map mode** (your word, 3 July 2026, eight of them), **Economy mode** (the built sandbox, D173), and the
**developer mode** behind a flag where all the testing controls live. Three different kinds of thing.

**The question.** **(a)** Keep all three, always said in full · **(b)** **map view** for the map's eight,
leaving **mode** for the two whole-game ones · **(c)** something else

---

## Q16 — what we call it when a tester plays, and how it is spelled

The road calls the events **a first look**, **a screening** and **a dress rehearsal** — film words, chosen
for your domain but chosen by the studio, not by you. You say **playtest**, and you have spelled it five
ways in your own messages: *playtest, playtests, play test, play tested, play testing* (and *playtesting*,
*playtesters*, *playthrough*). Your own name for the fourth stage of the whole project, on 6 September
2026, was *"Play testing"*.

**The question.** **(a)** The film words — first look, screening, dress rehearsal — with **playtest** as
the plain word for any of them · **(b)** **playtest** everywhere, with the film words dropped · **(c)** the
film words for the three scheduled events and **playtest** for anything unscheduled. **And one spelling:**
**playtest** · **play test** · **play-test**

---

## One thing you should know about how your answers are being kept

A fault was filed today (deferred 57): **when you settle something by clicking one of the options a
session puts in front of you, nothing of yours is written into the record of your words** — the choice
comes back as the studio's text. Two decisions made yesterday rest entirely on choices your word record
cannot show.

**Three of the questions above are already in that position**, which is why they are questions here rather
than settled entries:

- **Q3 (ideology, party, movement)** — the ruling that fixed all three is recorded as *"agreed without
  change"*, and your words that day are *"Agreed."*, *"Correct"* and *"Everything else is great"*. The
  definitions are the studio's.
- **Q2 (turn and round)** — *"A turn is a round"* is the studio's sentence. Your own two mentions,
  *"round turn 60"* and *"the next 60 round game"*, put the two words together rather than choosing.
- **Q13 (sector)** — the word arrived through the studio's documents; your own word is *industries*.

**If you would rather answer these in sentences than by picking, say so and they will come to you as
questions in prose.** That is the only one of the three fixes for defect 57 that produces more of your own
words rather than better bookkeeping about their absence — and it costs you time, which is yours to spend.
