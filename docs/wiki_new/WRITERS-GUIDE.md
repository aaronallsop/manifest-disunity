# Writing the Manifest Disunity wiki

**This is for the person writing the articles.** You do not need to have played the game, and you
must not need to read code — there is none in here. What you need is patience with long documents
and a willingness to say "the sources disagree" out loud instead of picking a winner.

Read this page once, then start with any page marked **needs writing**.

---

## What the game is, in a paragraph

Manifest Disunity is a browser strategy game about the United States coming apart and being put
back together. It opens on **1 March 2036**, on a real county map, with sixty-one independent
nations where fifty states used to be. Those nations trade, annex, unite, secede, hold elections
and gang up on whoever frightens them. One turn is one quarter of a year. Separatist movements
grow inside nations and take ground when they get big enough. That is the whole premise, and
almost every page in this wiki is a piece of it.

## What this wiki is for

Two things, and they pull in the same direction:

1. **Looking something up.** The owner is designing this game and needs to check what a thing is
   and how it works without reading a two-hundred-page design conversation.
2. **Seeing how it all connects.** Obsidian draws a graph of every link between pages. That graph
   is a deliverable, not decoration — it is how he spots a mechanic that touches nothing else,
   which usually means it is either unfinished or not worth keeping.

So **the links you write are as important as the prose.** More on that below.

## What this wiki is NOT

- **It is not where design happens.** Every rule in this game was decided in a numbered *ruling*
  recorded in a round document. You are reporting those rulings, not making new ones. If you find
  yourself inventing a rule to make a page read better, stop and write a note instead.
- **It is not a copy of the source documents.** Never paste a ruling in whole. Say what it means in
  your own words and cite it.
- **It is not for players.** It is for the owner and for the programmers who will build this. You
  may freely explain how the computer-controlled nations decide things.

---

## The shape of a page

Every page is already created for you with its headings in place. Four sections, in this order,
and the order is fixed because it is the order he reads in.

### 1. What it is

One short paragraph. Plain language. What is this thing, to somebody playing? No numbers, no
mechanism — that is the next section. If a reader stops after this paragraph, they should still
know what the word means.

### 2. How it works in the game

The mechanism. This is the long section. **Every claim here rests on a ruling**, and the rulings
that decide this page are already listed in the **Sources** table at the foot of it. Cite them the
way the table does.

Write it in the game's terms, never in the computer's. "A nation you are at war with will not
trade with you" — not "the trade module filters hostile pairs".

### 3. The story behind it

The in-world explanation: why does this exist in the fiction? Most pages will have **nothing** here
and that is expected — the story layer has mostly not been written yet, and round 1's break-up
narrative is the only big seam of it. **Leave `*Not yet written.*` in place rather than inventing
something.** An invented backstory is worse than a blank.

Where a page's comment says raw material was found, that is your starting point.

### 4. Interacts with

**This is the section that draws the graph, and it is the one most worth your time.**

Each line names another page and says *why* they touch, in one clause. Not a bare list.

> - [[War]] — you cannot open a trade deal with a nation you are at war with, and an existing one
>   is suspended for as long as the war lasts.

Some candidate links have been pre-filled for you. They were derived mechanically and **several of
them are wrong.** Your job is to keep, rewrite or delete each one, and to add the ones that are
missing. A line marked *(unverified)* has not been checked against the source by anybody.

**Also link inside your prose.** When you write the word "war" in the How it works section, make it
`[[War|war]]`. Inline links are what make the graph dense enough to be useful. Do not be shy with
them — Obsidian handles duplicates fine.

---

## How to cite a ruling

Every ruling has its own entry in one of three index pages — **Rulings - Secession**,
**Rulings - Military**, **Rulings - Politics** — and each entry says where the real thing lives.

Write the citation as a link:

> A movement whose whole core is over the line declares itself a nation
> ([[Rulings - Secession#Secession ruling 31]]).

Put it at the end of the sentence it supports, not at the end of the paragraph. If a paragraph
rests on four rulings, it probably wants to be four sentences.

**Never write a rule that has no ruling behind it.** If you believe something is true and cannot
find where it was decided, that is a finding, not a gap to fill — add it to **Questions for the
designer** at the bottom of the page under a heading of your own. He would rather have ten
questions than one confident invention.

---

## Six traps in these sources, and they will catch you

1. **A ruling can be superseded by a later one.** Where the generator knows about it, the Sources
   table says so and the index entry says so. Where it does not, the round document usually says
   "supersedes" or strikes the old text through. **A superseded ruling is not a rule.**
2. **Some rulings were decided and never built.** The design says one thing, the running game does
   another. Where the Sources table says "ruled, not built", say so on the page in plain words —
   "the design calls for X; the game currently does Y". Do not pick one.
3. **The political positions exist in three incompatible versions.** The running game knows six
   ideologies. A later ruling replaced them with ten positions. A third document lists twenty-seven.
   Where a page needs to name a movement's politics, give the **ten-position** answer and note the
   game currently runs the older six. This is known and is being resolved later.
4. **"Area" means two different things** in the source files — a merged unit of about 1,688, and a
   coarser grouping of about 507. In this wiki an **Area** is the 1,688 kind unless a page says
   otherwise.
5. **Names collide.** Cascadia is a nation, a movement *and* a region. Christian Nationalism is a
   movement *and* a political position, and a ruling says both must stay separate. When you link,
   check you are linking to the page you mean.
6. **Round numbering restarts.** "Ruling 12" alone is ambiguous — there is one in each round. Always
   write which round, the way the index pages do.

---

## What you must not edit

Two kinds of block are machine-written and are marked in the file:

- `<!-- GENERATED:... -->` — **rewritten every time the generator runs.** Anything you type inside
  one of these is lost. The **Sources** table is one of these.
- `<!-- SEEDED:... -->` — written once and **never touched again**. The candidate links are one of
  these. Edit them freely; that is what they are for.

Everything else in the file is yours.

**Do not edit anything outside the `docs/wiki/` folder.** The round documents, the decisions log and
the design document are the sources this wiki reports on. If one of them is wrong, say so on the
page and in your questions list.

---

## Working order

1. Start with the eleven **master pages** — Secession, Military, Politics, Economy, Diplomacy,
   Events, Board, People, Ideology, Playing, Story. Each needs one introductory paragraph. Doing
   these first gives you the vocabulary for everything else.
2. Then the pages with the **most rulings** behind them. The Sources table tells you the count. A
   page with fifteen rulings has enough material to write itself; a page with one does not.
3. Leave the thin pages until last. Some of them should probably be merged into a bigger page, and
   you will be able to tell which once you have written the fat ones. **Say so when you spot one.**

## What to hand back

The whole `docs/wiki/` folder. Plus one file of your own, `docs/wiki/QUESTIONS.md`, holding every
question, contradiction and merge suggestion you accumulated. That file is worth as much as the
articles.
