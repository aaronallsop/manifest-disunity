# Tone interview — paste the block below into a new Claude chat

**What this is for.** `GDD.md` open question 5: *a game about the United States coming apart, built on
real county-level voting data, makes a claim whether or not it intends to — and nothing in fifteen
thousand lines of design material addresses tone, framing, or how the subject is handled.*

**Aaron asked for it this way**, 15 September 2026: *"take this thought/question and give me a prompt
that I can put into claude chat that will ask me questions about this. Then it will take my answers
and format it into a document based on what you need."*

**When it is done:** save the document it produces as `docs/design/TONE.md`. `presentation-design.md`
depends on it, and so does anyone writing a movement name, an event, or a newspaper headline.

**Everything below the line is the prompt. It is self-contained on purpose** — the chat will not have
this repository, so the context it needs is written into it.

---

You are interviewing me about the **tone** of a game I am designing. Your job is to ask, not to
propose. At the end you will write a document from my answers.

## The game, so you have the facts

**Manifest Disunity** is a turn-based grand strategy game about the United States after it has already
come apart. The board opens on **1 March 2036** with **sixty-one nations** where fifty-one states used
to be — Texas split five ways, California five plus a cession, and a half-formed Deseret out of the
Mormon Corridor. You play one of them for 200 turns, to 2086. You can win by putting the Union back
together, by winning the argument, or by becoming the economy the continent runs on.

**It is built on real data and this is the part that makes tone a live question.** 3,143 real
counties, with real 2024 population, real economic output, and **the real 2024 presidential vote to a
tenth of a per cent.** Borders are cut along cultural regions somebody actually painted. The fifteen
trade chokepoints are all real places — the Soo Locks, Cairo, the Chicago canal, the Mouth of the
Mississippi.

**The separatist and unification movements are named after real political currents**, and thirty-two
of them are on the board. They include A Free Texas, Cascadian Separatists, Deseret, the New
Confederacy, Christian Nationalism, the Farmers Union, Greater Idaho, the State of Jefferson, Native
American Confederation, Hawaiian Sovereignty, Alaskan Independence, Acadiana, Anarcho-Capitalists and
Techno-Autocrats.

**Politics is three axes** — collective/neo-liberal, conservative/progressive,
authoritarian/libertarian — with eight parties at the corners of that cube named after **real
political parties** (the Union Party, the People's Party, the Communist Party, the Industrial Workers
of the World, the America First Party, the Constitution Party, Technocracy Incorporated, the
Libertarian Party), plus Republicans and Democrats as the two centrists. Going too far off an
authoritarian edge drops you into **Despotism**; out through the libertarian middle and the government
dissolves into **Stateless** ground.

**The game contains:** civil wars, military occupation, martial law, suppression of movements,
referendums that can be stolen, annexation, starvation as an economic outcome, and a screen that shows
you where any nation is politically weakest.

**Two things I already know about the tone, because I decided them:**

1. **The mission and achievement names are puns and I want to keep them.** Real examples already
   written: *"The Northern Cheese Mongers"*, *"The tiger and the buffalo drink water from the same
   riverbank"*, *"Busy as a Bee"*, *"My Brother's Keeper"*, *"We Never Wanted to Be Part of Your
   Country Anyways"*.
2. **The game opens on a newspaper front page** dated 1 March 2036, and a newspaper is how the player
   is told what happened each turn.

**And what I want out of the game, in my own words, is what I want out of Europa Universalis:**

- *"Although fictitious it is a history game where I have been able to learn a lot about 15–19th
  century world history and things about it I would never have learned any other way."*
- *"It is an in depth complex game that looks complicated on the surface but you are still able to
  play the game and learn something new about how things work and interact with next time."*
- *"The ridiculousness and sometimes hilarious outcomes of the game and writing."* My favourite
  playthrough was Provence becoming Jerusalem.

## How to interview me

**Ask me ONE question at a time.** First list every question you intend to ask, numbered, so I can see
the shape of it. Then say *"let's start with the first one"* and ask only that one. Wait for my
answer. Then ask the next. **Do not end a message with four questions.**

**Give me a recommendation with each question, not a menu.** If there are three ways to go, tell me
which you would pick and what it costs. I will ask if I want the other two.

**Push back on me.** If an answer I give contradicts an earlier one, or would be hard to hold
consistently across a hundred movement names and a thousand newspaper headlines, say so.

**Ground every question in something concrete.** Not *"what tone do you want"* — that is unanswerable.
Ask me about a specific screen, a specific name, a specific headline, a specific outcome. Use the real
examples above. Invent more if you need them, and tell me you are inventing.

**Cover at least these, in whatever order serves the conversation.** You may add to them:

1. **The break-up itself.** Is it a tragedy, a farce, a thought experiment, or something the game
   declines to have a view about? What would the newspaper's first edition sound like?
2. **Whose voice the newspaper is.** A neutral wire service, a partisan paper in the nation you play,
   or something else — and does that voice change when the player is winning ugly?
3. **How close to the real thing the movements may be.** The New Confederacy and Christian
   Nationalism are on the board under those names. Where is the line, and is it a line about *naming*
   or about *how they are portrayed*?
4. **Whether the game ever judges.** Despotism is a trapdoor a player can fall through. Does the game
   treat that as a failure, a strategy, or simply a state? Same question for occupation, martial law,
   and stealing a referendum.
5. **Whether real voters are ever characterised.** The 2024 vote is on the board county by county. Does
   the game ever say anything about the people in a county beyond what they voted and what they want?
6. **Where the puns stop.** They are clearly right for *The Northern Cheese Mongers*. Are they still
   right for a mission about a civil war, an occupation, or a famine? Is there a category of thing
   that gets a plain name?
7. **Real named people.** No real politicians presumably — confirm it, and say what the game does
   instead, since it generates leaders with names and traits.
8. **Violence, and how much is shown.** A civil war is currently a dice roll and a number. Does it get
   described, and if so how far?
9. **Who this game is not for**, and what you would refuse to put in it even if it played well.
10. **The nearest existing thing in tone** — and the nearest thing you want to avoid being mistaken
    for.

## What to write when we are done

**A document I can drop into a design folder**, in Markdown, structured exactly like this:

```
# Tone

**Depends on:** GDD.md

## 1. The position in one paragraph
[What this game's attitude to its own subject is. Written so a stranger could apply it.]

## 2. The rules that follow from it
[Each one TESTABLE against a specific artefact. "A headline never X." "A movement name may Y."
 If a rule cannot be checked against a screen, a name or a sentence, it is not a rule yet — say so.]

## 3. Worked examples
[At least six. Each one a real artefact from this game — a movement name, a mission name,
 a newspaper headline, an event, a victory screen, a defeat screen — shown as it WOULD be
 written under these rules, and where useful, the version that would break them and why.]

## 4. The edges
[Where these rules are hardest to hold, and what to do when they conflict. Name the cases
 rather than resolving them.]

## 5. Open questions
[Anything I did not answer, or answered in a way that needs testing against real content.]
```

**Rules for writing it:**

- **Use my words where I gave you good ones**, and quote them as mine.
- **Do not smooth over a contradiction between two of my answers.** Write both down and say they
  conflict.
- **Do not invent a position I did not take.** If a section is thin because I did not say enough, say
  the section is thin.
- **Write for a stranger** who has to name a movement or write a headline six months from now and will
  not have been in this conversation.

Start by listing your questions. Then ask me the first one.
