# Handoff — 14 September 2026, 15:10

**Written at the final commit of the sign-off.** If commits have landed after it, this document is
history and not truth — the session-start hook counts them and names them; read those first.

---

## 1. The state, and nothing is broken

**Everything is committed and pushed. Nothing is unverified. Nothing failed.**

**956 tests green, 0 failing, 51 files, 215 seconds — run in the browser tonight, not quoted.** No
game code, `data/`, `content/` or `DESIGN.md` was touched; this was a design round and design rounds
write documents only. The tests were run anyway rather than assumed.

**ROUND 4, THE ECONOMY, IS CLOSED** — by Aaron on the Control Board at **21:06**, with the same click
confirming rulings 3–6, the four defaults taken without asking. **Round 5, diplomacy, is live.**

---

## 2. Read these first, in this order

| | Why |
|---|---|
| `DECISIONS.md` **D212 and D213** | The whole round, and what closing it cost |
| `docs/design/economy-ideation.md` **§2, §4a, §5, §6, §7** | The in-tray, the interaction map, the close, the findings, the handover |
| `docs/design/wiring-triage.md` | Aaron's own 35 arrows, sorted against what the game can do. **§B is still open** |
| `docs/deferred.md` **31** | The wiki now states something false. **First job.** |
| `docs/PROGRAMMER-RULES.md` **14, 15, 16** | All three earned today, and 15 will bite within the hour |

---

## 3. What happened, shortest useful version

**The round's in-tray had never been collected.** Rounds 2 and 3 closed on the 9th and 11th and each
formally handed work to the economy — **nine items, three blocking a rule already written** — and none
of it had been carried across in a week. Emptying it was the first act of the session.

**The hollow spot had a cure nobody had built.** *Nothing bad happens to a nation that does not trade*
has stalled every round for a fortnight. The economy spec answered it on **4 September** — derived
demand, bands, per-sector consequences — and the alpha track was explicitly told not to touch demand,
supply or price. So the round's first question was not *what should happen* but **whether the written
answer still stood.** Aaron kept it (**ruling 1**), and that one decision **closed two of the three
blocking items within the hour**.

**Nine rulings.** 1 keeps the written model. 2 keeps one national pot. 3–6 were defaults taken without
asking and he confirmed all four. 7 gates farmland on extraction, which closes the hollow spot's other
end. 8 lets money buy a referendum but not a region. 9 leaves water out of the alpha.

**Then he built the picture himself** — asked for an interactive page, rejected the first version as
too fiddly, and filled the second with **35 arrows** in an evening.

---

## 4. The rules you must not get wrong

**A design session does not touch code or data.** Not `js/`, `tests/`, `css/`, `index.html`,
`dev.html`, `server.py`; not `data/` or `content/`; not `DESIGN.md`; not `docs/spec/` without
permission. **The exception is the wiki's generator in `build/`** — `build_wiki.py`,
`build_systems_map.py`, `systems_map_template.html`, `wiki_*.json` — and nothing else in that folder.

**The Control Board is edited with the file editor, never a shell script with layers of quoting.** It
has been damaged that way twice. Both checks were run before publishing tonight: the HTML parses and
the `BOARD` object evaluates under `node`.

**Rule 15, earned twice today:** write a commit message to a **file** and use `git commit -F`. An
apostrophe inside a `<<'EOF'` heredoc ended the quoting early; double quotes inside `-m` split the
message into pathspecs and git reported a dozen `pathspec 'this' did not match` errors that read like
a file problem and were not.

**Rule 16:** `node --test` reports **`pass 1` in 64ms** for a suite file — it imports the module, sees
no throw, and counts the file as one passing test. **The harness never runs.** The browser at
`http://localhost:8000/tests/run.html` is the only real runner. A green that fast is not a fast green.

---

## 5. Your first job

**The wiki says something false.** `docs/wiki/Economy.md` still reads *"Nothing here yet. This system
has not had its design round."* That stopped being true at 21:06. **Deferred 31.**

The fix: add `economy` to the rounds in `build/wiki_rulings.json`, map its nine rulings to pages, and
re-run `python build/build_wiki.py`. **About an hour.** A wiki stating something false is the exact
class of defect that cost this project its worst day — do this before anything else.

**And while you are in there, a nearly-free win Aaron has now approved.** He said **keep** the
writer's 76 articles. Their draft was written against source lists that marked 39 live rules dead;
**running `python build/build_wiki.py --out docs/wiki_new` clears 94 stale labels and touches no
prose.** Read **deferred 17** first — the "At a glance" block moved inside a generated block on the
day their copy was made, so on their pages it will append at the foot rather than land in place.

The slow half of that job — verifying every claim on every page, then rewriting the four pages built
on a misreading — is **2–3 days** and wants its own sessions. It does not get harder by waiting.

---

## 6. What is on the board, and it is one card

**Should a shortage stop things being MADE, or only lose them on the road?** Four of Aaron's own
arrows say the first — *ore needs trucks, goods need trucks, food needs trucks, trucks need gas.* He
parked the other eight groups as future ideas and **never answered this one**; it was not in that pile.

It is the same machinery as ruling 7 pointed at two more pairs. **Cheapest change on any list put to
him today.** Carried in D213 and in `wiring-triage.md` §B so it cannot be lost.

---

## 7. What is his, and what is not

**His:** the one card above. Nothing else.

**Not his:** anything in `docs/deferred.md`; every number in round 4, which is the mechanics stage's;
the brake on the logistics spiral, which is the design stage's; and **whether extraction being a
single point of failure is right, which only the alpha can judge.** **Do not ask him to re-decide
anything already ruled** — 145 rulings across four closed rounds.

---

## 8. Round 5 opens shorter than any round yet

**A large part of diplomacy was already ruled on Friday without anyone calling it that.** Thirteen of
round 3's rulings are the federation: what it is, that an attack on one member is a war with all, that
members vote you in and anyone may walk out, that it makes peace as one, how its income splits. **That
is alliances, blocs, joining and leaving.** Its own document is still the 6 September stub.

**One item is blocking.** Conquest ruled that a diplomatic act exists which speeds a thaw and deferred
it here. Until it exists a grudge can **only** be waited out — and the board opens with **33 pairs
permanently hostile**, none of which has a single move available.

**Round 4 also sent it something worth using:** opening one extra supplier is worth about **12%** on
the price, which turns a trade partner into a diplomatic objective rather than a commercial one.

---

## 9. Known but unverified

- **Ruling 7 depends on where phosphate, potash and natural gas actually are, and that is NOT
  verified.** E45 lists candidates and calls them unverified; this round did not change that. **It is
  a data job and must be checked, never remembered.**
- **Ruling 7 also does not work as written** without one more term — `extractionDemand` counts
  factories and people and not one acre of farmland, so the farm-heavy nation it exists to catch is
  the one it never touches. Finding G, and a blocking condition in §7.
- **Nothing in round 4's model has ever run.** Aaron was told this before he kept it.
- **The game has not been opened since 5 September.** Only the test page was run tonight.
- **The industry split under the whole economy is still part-invented** — farming is 10× its real
  size, and the six sectors reach about half a real economy. Its own phase on the board, not new.
- The repository is **public and that is correct** — his decision of 7 September. **Do not raise it.**

---

## 10. Before you stop, every time

Run `/signoff`, and **write the handoff last**. If you commit anything after it, rewrite it — step 7
proves it with a commit count that must print `0`.
