# Manifest Disunity — handoff, 24 September 2026, evening (MacBook)

**Written at sign-off. Supersedes the 17:02 handoff (and the 13:58 one before it).** *The 17:02 handoff
says `CLAUDE-DRAFT.md` is not adopted and T1 is next — **both are no longer true**; see below.*

---

## 1. The state, bad news first

- **The game still freezes around turn 80–95** of a 200-turn game (`docs/deferred.md` 46). Unchanged.
  Fixing it is now **M1, the first programming session** on the adopted road.
- **The sign-off review found 90 defects in the day's own documents** — all fixed or filed (D268). The
  worst was mine: the interview record still altered Aaron's words after I had told him it was restored.
  It is now checked word for word against his saved messages. **Treat anything quoted as his as
  unverified until you have done the same** (programmer rule 24).
- **Tests: 956 passed, 0 failed, 51 files, 191.6 s** — MacBook, browser route, alone in the folder,
  24 September ~19:00. `content/` untouched afterwards.
- **Everything is committed and pushed.** Only documents changed today — no code, data or tests.

---

## 2. Read these first, in this order

1. **`CLAUDE.md`** — **rewritten and in force today (D263)**, 247 lines of permanent rules. The old one is
   archived word for word at `docs/archive/CLAUDE-until-2026-09-24.md`. The start-of-session checks now
   come **before** `/resume`: nobody else live (`git status`, port 8000), then pull.
2. **`docs/design/DIRECTOR-BRIEF.md`** — **approved (D260).** Aaron's taste in his own words: five
   pillars, the tie-break, who the player is, the alpha checklist (§4), the lookbook, the refusals. Every
   role reads it first; on taste it outranks older records.
3. **`docs/technical/ROAD-TO-ALPHA.md`** — **adopted (D264), with Aaron's addition.** Milestones M0–M11.
   The GDD stays and the technical design is still the road; the cut moves to M4; strangers first play at
   M2. `TDD-PLAN.md` still defines each technical document; the road sets their order.
4. **`docs/design/STUDIO-ROSTER.md`** — the studio. Every role named after the solar system (D262): the
   main session is **Saturn, the Conductor**. **Terra = the PC, Luna = the MacBook — never roles.**
5. **`DECISIONS.md` D260–D268** — today, in order.

---

## 3. The operator and the board

**Aaron Allsop** — filmmaker and project manager, **not a programmer**; he steers by voice and reads
Markdown. Write in his domain. He is the Creative Director (the roster calls him the Sun — *that name is
the studio's suggestion, not his; D262 note*).

**Control Board:** `docs/control-board/BOARD-URL.md` → published **version 51** tonight. **No decision
cards.** Waiting on him (parked, not due): Deseret's placement at **M5**, who the first-look testers are
at **M2**. Permissions unchanged since 16 September: re-run ✅ · fix ✅ · quality ❌ · live ❌ · **Hog
Wild ❌**. Every board answer is logged in `DECISIONS.md` (39 snapshotted in
`docs/control-board/board-answers-2026-09-24.json`; **36 not yet matched to entries one by one** — D267).

---

## 4. The rules you must not get wrong

1. **Aaron's most recent word wins.** Never argue from an older document. Flag a conflict once, then
   mark the old line superseded with a **dated note beside it** and a `DECISIONS.md` entry — never
   rewrite or delete it.
2. **His words are recorded verbatim** — only filler and false starts out — and diffed against his own
   messages before anything relies on them. His messages from today are in
   `docs/design/aaron-words/2026-09-24-luna-session.json`.
3. **Saturn never writes game code or design itself.** For a job whose role has no file, write the file
   in `.claude/agents/` first; a role file written mid-session is used from the next session (until then
   paste it into the job). Running-the-studio work (board, handoff, record, saving) Saturn does itself
   until Rhea, Titan and Janus are hired.
4. **One live session per project, one piece of work per session.**

---

## 5. Where the work is

| | State |
|---|---|
| Stages 1–2, ideation and design | ✅ Closed (D241) |
| Stage 3, step 1 (T0) | ✅ Done 16 September |
| **The studio** | ✅ Brief approved (D260), roster named (D262), master file rewritten (D263), road adopted (D264) — all 24 September |
| **M0 — one road, one set of words** | ◀ **Next.** Not started |
| M1 — six repairs, freeze first | Permitted with the road (D264 item 2); not started |
| M2–M11 | Not started |
| Build | `v0.6` (Economy mode). Next tags per D264 item 7: v0.6.1 at M1 … v0.10 at M10 |

---

## 6. Your first job: M0

Four pieces, each **its own session** (one piece of work per session):

1. **Pluto — the terminology list.** Build it from the records; bring Aaron every word that has meant two
   things (e.g. "state", "turn/round", "ideology/position/party/movement", and the two sets of function
   names, deferred 52). **The contracts pass (M3) waits for it** (D264 item 5).
2. **Pluto — save Aaron's own words from the design sessions. Must run on Terra, the PC**, where those
   session logs live and are not backed up. Only his messages, verbatim, dated (D266).
3. **Rhea — the Control Board redesign.** Interview Aaron first about what he uses and skips, then rebuild.
   Its first job hires Rhea (writes her role file).
4. **Makemake — history research on Texas, Deseret and the Great Lakes (Superior).** Starts now, runs
   alongside every milestone. Claim, source, confidence; Eureka checks and Deimos reads before anything
   reaches a player.

**Before starting any of them:** `git fetch && git status` (changes you did not make or port 8000 taken =
another session is live: say so and stop), `git pull`, then `/resume`. **On the MacBook the server is
`python3 server.py`** (preview entry `nation-states-mac`); on the PC it is `python server.py`.

---

## 7. What was learned today

- **Tidying a transcript is authoring.** Small grammar fixes changed what Aaron meant; two checks were
  needed to get it right. Rule 24.
- **Much of what the project called his taste was Claude's wording** — of 639 places sampled, 275 his,
  142 studio wording he approved. The GDD's five selling points and every "not for" line are studio
  wording (brief §8.6). Never quote them as his.
- **Two copies on two machines collided today** (PC sessions pushed while this Mac worked; two defect 47s,
  two D255s). Pull first, one live session, one computer at a time.
- **The first rewrite of the master file dropped three standing rules**; a rule-by-rule completeness check
  caught them. Always check a rewrite against the file it replaces.
- **A "yes" given before the final draft existed** (the master file, D263 note) is recorded as such; ask
  Aaron to glance at the comparison rather than treating it as fully seen.

---

## 8. Known but unverified

- Whether a **player** pressing End Turn freezes like the simulation does (inferred, not tested).
- Whether he has **watched the hbomberguy video** or **played Civilization 2** (brief §5: named, unconfirmed).
- **The four ocean ports** he approved fixing on 15 September (D267) are still marked inland — lands at M5.
- **The MacBook's copy of the shared rules repo is older than the PC's and has no remote** — no warning
  when a handoff is stale on this machine (deferred 54; his to decide).
- **The `/decision` skill counts `## D` headings; this project uses `### D`** — it reports 0. Read the last
  `### D` heading instead (CLAUDE.md says so). A fix belongs in the shared skills, not here.

---

## 9. Before you stop, every time

`/signoff` — only if you are the only live session. It now also **renames the session**
`Manifest | <teams> | <the work>` (D265), and **unwatches the board** before stopping.

---

## 10. What Aaron owes, and what he does not

**Nothing blocks the next session.** Worth asking him, lightly, when it fits:
- a glance at the master-file comparison, since his yes came before the final version (D263);
- whether to export the tone interview from his Claude chat too (offered, not decided — D266 note);
- the shared-rules repo on the MacBook (deferred 54);
- when to spend the week on the wiki merge he approved (D259, deferred 50).

**Not owed, and not to be raised:** who approves the technical design, Jupiter or him — *he said hold off.*
The toll system — *not until the economy document.*
