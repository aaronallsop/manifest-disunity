# Manifest Disunity — handoff, 25 September 2026, midday (MacBook)

**Written at sign-off. Supersedes the 24 September 18:30 handoff.**

---

## 1. The state, bad news first

- **Aaron's words from the early design sessions are at risk.** They exist only in the session logs
  on **Terra (the PC)**. Claude Code keeps session logs for 30 days by default (confirmed in the Claude
  Code documentation; *when* it deletes is not documented — I told Aaron "at startup", which was more than
  I knew). The project's first sessions are from about 29 August, so **they reach 30 days around
  28 September.** The next session should be the PC one, within two days. Aaron has the steps (§6).
- **The game still freezes around turn 80–95** (deferred 46). Unchanged. The repairs are now free to
  start before M0 closes (D272).
- **Tests: 956 passed, 0 failed, 51 files, 262.11 s** — MacBook, browser route, alone in the folder,
  25 September ~12:45. The run changed no game files.
- **Everything is committed and pushed** (checked at the end of this sign-off). Only documents changed
  today — no code, data or tests.
- **The sign-off review found three faults** in the PC task's instructions, all fixed (§7). The worst
  would have saved the studio's prompts to its helpers as Aaron's words.

---

## 2. Read these first, in this order

1. **`CLAUDE.md`** — "Where we are" updated today: M0 under way, the deadline, Rhea and Pluto hired.
2. **`docs/design/DIRECTOR-BRIEF.md`** — unchanged, approved (D260). All of it, every session.
3. **`docs/technical/ROAD-TASKS.md`** — **new, Rhea's draft**: the road broken into tasks (35 of them),
   each "you start it" or "you do it", with what it waits for and a rough size. **Not yet approved.**
4. **`DECISIONS.md` D269–D273** — today, in order.
5. **`prompts/tasks/my-words.md`** — the PC task, if this session is on Terra.

---

## 3. What was decided today

| | Decision | Whose |
|---|---|---|
| D269 | The board redesign starts with a task list; three steps, one at a time: (1) task list, (2) cards at the very top + a `/go <task>` command, (3) the schedule. Current work in full detail, the rest in outline; every milestone ends with a close-out; every task records what it waits for. Designed for a computer screen. **Rhea hired.** | His asks; the planning approach is the studio's wording, his "Go ahead" |
| D270 | Which new plugins this project uses: Design yes; Engineering (debugging) and Product Management (research sorting) in part; **Productivity kept out** (it would compete with the board, handoffs and `CLAUDE.md`); Adobe waits for marketing | Studio default |
| D271 | **Alpha deadline 31 March 2027, stretch goal 31 December 2026.** Means the alpha candidate is ready for strangers (M10 done, M11 starting) — the studio's reading, told to him | His dates |
| D272 | A task starts once what it waits for is done, not when its milestone's turn comes. The road's "done in order" carries a dated note. One piece of work per session stands | His word; flagged once, he did not object |
| D273 | The tone interview's chat is saved too. M0 closes only after the PC session (studio default, told to him) | His yes |

**Pluto hired** as well (role file `.claude/agents/pluto.md`), for the PC task.

---

## 4. The operator and the board

**Aaron Allsop** — filmmaker and project manager, not a programmer. Write in his domain. He uses the
board **on a computer, not his phone.**

**Control Board:** published **version 52** today (the address in `docs/control-board/BOARD-URL.md`;
the tool now prints it as `claude.ai/artifact/N76TrfxKgbZsLT13Wdc3Ve` — same artifact). **No decision
cards.** Waiting on him: save his words on the PC (urgent), read the task list, export the tone chat,
choose the first-look testers (free now), Deseret (M5). Permissions unchanged since 16 September:
re-run ✅ · fix ✅ · quality ❌ · live ❌ · **Hog Wild ❌**. This session **unwatched** the board.

**His words today** are saved verbatim in `docs/design/aaron-words/2026-09-25-luna-session.json`
(11 messages, rebuilt at sign-off with the corrected method). Every quote in D269–D273 was checked
against it.

---

## 5. Where the work is

| | State |
|---|---|
| **M0 — one road, one set of words** | ◀ **Under way.** Board redesign step 1 (task list) drafted; steps 2–3 not started. Terminology list, PC words, history research not started |
| M1 — six repairs, freeze first | Free to start now (D272). Not started |
| Deadline | 31 March 2027 (187 days) · stretch 31 December 2026 (97 days) |
| Rough sizes (Rhea, **estimates**) | M0 + M1 ≈ 21 sessions; whole road ≈ 90–185; measured pace 3–9 sessions a working week |
| Build | `v0.6`. Next tag v0.6.1 at M1 |

---

## 6. Your first job

**If you are on Terra (the PC): the task `my-words`.** Aaron was told to (1) sign this Mac session
off first, (2) copy `%USERPROFILE%\.claude\projects` to `Documents\claude-logs-backup-2026-09-25`
**before opening Claude Code**, (3) open a session in the project and paste
`Do the task in prompts/tasks/my-words.md`. Follow that file exactly: the start checks first, then Pluto
(the `pluto` agent type should now be offered), then check, save, report, `/signoff`. **Report the
earliest date saved** — if it is later than late August, early sessions were already gone. Read
programmer rule 25 first.

**If you are on Luna (the MacBook):** the PC session is the priority; say so to Aaron. After it, in
the order he asked for, one at a time:
1. **The tone interview.** Aaron exports it from his Claude account settings (either computer) and puts
   the file in the project; Pluto extracts only his messages, the same way.
2. **`review-tasks`** — walk Aaron through Rhea's list (a short version first). Fold in: the tone-chat
   export as a "you do it" task; `my-words` done if it is; open question 3 answered by D273.
3. **`cards`** — board redesign step 2. It starts by asking what on today's board he uses and skips
   (only partly asked today). The command is **`/go`**, not `/start` (the Productivity plugin has
   `start`). It lives in this project (`.claude/`), so both computers get it.

Before anything: `git fetch && git status`, port 8000, `git pull`, `/resume` (CLAUDE.md order).

---

## 7. What was learned today

- **A session log's "user" records are not all the user.** Helper agents' logs sit beside each session's
  own log, and their "user" records are the studio's prompts. Every message is also first a queued
  record; one sent mid-turn exists only there. Found by the review, before the PC ran it. **Rule 25.**
- **Say what the documentation says, not what it probably does.** "Deletes at startup" was a guess
  stated as fact; the 30 days is documented, the timing is not. Corrected on the board's log.
- **Rhea's measured pace corrected mine**: 3–9 sessions a working week, not 4–9.

---

## 8. Known but unverified, and gaps

- **The six Economy-mode questions** the road says go to the first testers (M2) were not found by Rhea;
  `PLAYTEST.md` has four. Finding them is the studio's job, not Aaron's.
- **The desktop app has its own retention setting** (`desktopSessionCleanupPeriodDays`, per the docs);
  its default was not checked. The folder copy covers it.
- **Rhea's other gaps** (ROAD-TASKS §9): the reused M-labels from the first prototype's build steps;
  the invasion repair's design question has no named owner; the army-dial names come before M3 sets how
  dials are named; who picks each tester's story; how `/go` behaves for a task that must run on the other
  computer; testers' sixty-turn time (M2 measures it); the history research has no end point.
- Unchanged from yesterday: whether a **player** pressing End Turn freezes too; the four ocean ports
  (M5); the MacBook's shared-rules copy is older than the PC's (deferred 54).

---

## 9. Before you stop, every time

`/signoff` — only if you are the only live session. Rename the session `Manifest | <teams> | <the work>`
(D265), unwatch the board.

---

## 10. What Aaron owes, and what he does not

**Owed, in his order:** the PC session (urgent, before ~28 September); the tone-chat export; reading
the task list. **Free whenever:** choosing two or three first-look testers.
**Not to be raised:** who approves the technical design, Jupiter or him — *he said hold off.* The toll
system — *not until the economy document.*
