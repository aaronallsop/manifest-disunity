# Handoff — 14 September 2026, 12:04

**Written to straighten the record, not to describe a session's own work.** The session that closed
round 4 this morning finished at 12:02 and did not write one, so eleven commits stood after the
newest handoff. This was written two minutes later by the next session, from the commits and the
documents themselves.

**If commits have landed after this one, this document is history and not truth** — the session-start
hook counts them and names them. Read those first.

---

## 1. The state

**ROUND 4, THE ECONOMY, IS FINISHED AND WAITING ON AARON.** Nine rulings, 96 banked ideas (E1–E96),
seven findings, scenario 4 traced, the Tuesday test answered. Closed as a document; **not closed as a
round**, because by the plan's own rule a round ends when he says it ends.

**Three cards are open on the Control Board and none has been answered:**

| Card | What it wants |
|---|---|
| `close-round-4` | Does he call the economy round closed? |
| `confirm-round-4-defaults` | **Four decisions taken in his place** — rulings 3 to 6 — confirm or overturn |
| `writer-wiki-merge` | Keep the hired writer's 76 wiki articles, or start again? Open since this morning |

**Working tree clean, nothing unpushed.** Board published as version 27.

**TESTS RE-RUN AND GREEN: 956 passed, 0 failing, 223.14 seconds across 51 files, measured at 12:10
on 14 September** in the browser at `/tests/run.html`. That session had not re-run them and said so
honestly on the board; this closes that gap. No game code, `data/`, `content/` or `DESIGN.md` has
been touched since 5 September.

---

## 2. What went wrong, and what is still wrong

**The record was left behind again.** That session did every other part of a sign-off — it committed,
pushed, reviewed its own work adversarially, and republished the board — and skipped the handoff.
This is the third time on this project and the reason the session-start hook exists.

**A wrong figure is on the dashboard right now, and it is small.** The board's own "updated" stamp
reads **2026-09-14 17:40**. The commit that published it landed at **12:02**, and the real time when
this was written was **12:04**. The board is forward-dated by five and a half hours. Nothing else on
it depends on that number, but it is the class of thing this project has a rule about.

**THE BOARD WAS DELIBERATELY NOT REPUBLISHED at this sign-off, and that is a departure from the
ritual.** Its substance was written by the session that actually did round 4 — the headline, the
three cards, the phase entries — and it is accurate. The only things this session would have changed
are that timestamp and the test figure, now measured above. Overwriting another session's account of
its own work to correct a clock was judged the worse trade. **Two things to do on the next
republish:** fix the stamp, and carry the measured test result onto it. **Re-read the live page
first** — it was republished outside this session's knowledge, and a `_oldHeadline` block is sitting
in the source as leftover clutter that should be deleted while you are in there.

**Two findings from round 4 are open and neither is Aaron's to settle on paper:**

- **Finding E — the logistics spiral, and it is the most serious thing the round found.** Importing to
  fix a shortage raises the volume hauled, which tips hauling into deficit, which loses a fifth of
  what is in transit — so less of what you bought arrives, so you buy more. **The cure feeds the
  disease and nothing stops it.** Three candidate brakes are named and **none is chosen.** It is a
  prediction from the formulas; none of that part of the model has ever run.
- **Finding D — extraction now does three jobs** (fuel, ore and fertiliser), so the model has one
  upstream chokepoint. Either the best thing in it or the most brittle, and only the alpha can say.

**Finding G is a blocking condition on whoever builds ruling 7**, found by that session's own
adversarial review on the day the ruling was written: `extractionDemand` counts factories and people
and **not one acre of farmland**, so ruling 7's gate fails on exactly the nation it was written for.
One structural term, `+ agricultureCapacity × k`. **Ruling 7 does not work without it.**

---

## 3. Read these first, in this order

| | Why |
|---|---|
| `docs/design/economy-ideation.md` — **§6, §7 and "The state of this document"** | The findings with owners, what the round hands onward, and what is honestly unfinished |
| The three board cards | All three are his and none is answered |
| `DECISIONS.md` **D210 and D211** | The wiki, and D211's three corrections to D210 |
| `docs/deferred.md` **17–29** | Twenty confirmed wiki defects, none of which makes the wiki state something false |
| `docs/PROGRAMMER-RULES.md` **12, 13, 14** | 13 will bite within the hour if ignored |

---

## 4. The rules you must not get wrong

**A design session does not touch code or data.** Not `js/`, `tests/`, `css/`, `index.html`,
`dev.html`, `server.py`; not `data/` or `content/`; not `DESIGN.md`; not `docs/spec/` without
permission. **The one exception is the wiki's own generator in `build/`** — `build_wiki.py`,
`build_systems_map.py`, `systems_map_template.html` and `wiki_*.json` — and that exception is written
into the designer brief with its date and its limit.

**The Control Board is edited with the file editor, never generated by a script with layers of
quoting.** It has been damaged that way twice. Before publishing: the HTML must parse and the `BOARD`
object must evaluate under `node`. **And it was republished outside this session's knowledge — re-read
the live page before editing it.**

**Rule 13:** do not build a Python string in a shell heredoc when it contains backslash escapes.
`\b` became a literal backspace in a regex that then silently matched nothing; `\n` became a real
newline that split a JavaScript string and broke the board. **Use the file editor for any patch
containing an escape.**

---

## 5. What the wiki now owes round 4

**The wiki does not know round 4 exists.** Its economy topic is still an empty hub, and
`docs/wiki/README.md` carries the procedure under **"What to do when round 4 closes"**:

1. `python build/build_wiki.py --check` — it reports every new economy ruling as one no page claims.
2. Add round 4 to `build/wiki_rulings.json` with each ruling's own wording (the generator finds a
   ruling by its words, never by a line number).
3. Add the economy's pages to `build/wiki_spine.json`.
4. Add candidate links to `build/wiki_edges.json`.
5. Re-run, then `python build/build_systems_map.py`, and republish the map to its existing address.

**Do this only after Aaron closes the round.** Generating over a round he has not closed is the churn
the wiki's own charter warns about.

---

## 6. The next session's first job

**Put the three board cards to him, one at a time**, starting with `confirm-round-4-defaults` —
because the four defaults are part of what closing the round would approve, so they come before
`close-round-4`. The wiki card has been waiting since this morning and is third.

**Do not start the wiki restructure.** Aaron parked it explicitly: folding the eleven subjects into
five nested sections. It is written up and it waits.

---

## 7. Known but unverified

- **The game has not been opened since 5 September.** Only the test page has been run.
- **The board's updated stamp is forward-dated by five and a half hours, and the board was not
  republished at this sign-off.** See §2.
- **The artifact watches were stopped at Aaron's request** at the end of this session — neither the
  Control Board nor the systems map is being watched for changes any more. A future session that
  wants to be told when he edits the board will have to start watching it again.
- **There is still no committed list of nations** — the only nation-shaped file is an autosave from
  turn 4 of one playthrough, and it is gitignored.
- **Where phosphate, potash and natural gas actually sit on the map is unverified.** Ruling 7 depends
  on them being concentrated; E45 lists candidates and calls them unverified, and round 4 did not
  change that. **It must be checked against real data, not from memory.**
- The repository is **public and that is correct** — his decision of 7 September. **Do not raise it.**

---

## 8. Before you stop, every time

Run `/signoff`, and **write the handoff last**. If you commit anything after it, rewrite it — step 7
of the sign-off proves it with a count that must print `0`. **That is the step the last session
skipped, and this document exists because of it.**
