# Task `my-words`: save Aaron's own words from every session on Terra

*Written by Saturn on Luna, 25 September 2026, for a session on **Terra (the PC)**. Road to alpha, M0.
Decided: D266 (his yes, 24 Sep) and D273 (25 Sep). The tone-interview chat is a separate task, not this one.*

**This task runs only on Terra.** If this session is on Luna (the MacBook), say so to Aaron and stop.

## For Saturn, the session that reads this

1. **Do the start-of-session checks in `CLAUDE.md` first**, before anything else, in their order:
   nobody else live, pull, `/resume`. If the pull brings in Luna's commits from the last few hours, tell
   Aaron a session there may still be open and wait for his word before writing anything.
2. **Pluto is hired**: his role file is `.claude/agents/pluto.md`. Hand the job below to the `pluto`
   agent. If that agent type is not offered, paste the role file into a general-purpose agent's prompt.
   Put the hard rules from `CLAUDE.md` and the role file at the top of the job.
3. When Pluto hands back, check the work yourself (below), then commit and push, then report to Aaron,
   then `/signoff` (this is the session's one piece of work).

## The job, for Pluto

**Find every session log on this computer that belongs to this project.** Claude Code keeps one log file
per session, `*.jsonl`, under the user's `.claude\projects\` folder, one subfolder per working folder.
Include any session whose recorded working folder (`cwd`) is this project, **under any name or path the
project has had** (the dev-server entry is still called "nation-states", which may have been an earlier
folder name; and the first commit, 29 August, calls itself a "baseline before rebuild", so sessions may
predate it). List every subfolder you find that might
belong and why; when a folder's match is unclear, report it rather than guessing. Do not read other
projects' logs beyond checking their `cwd`.

**From each session, copy only Aaron's own messages, word for word, dated, in order.**
- **His messages are:** `"type": "user"` records whose `message.content` is text he typed or dictated,
  and `"type": "queue-operation"` / `"operation": "enqueue"` records, which hold messages he sent while
  Claude was still working. **A message can appear both as a queued record and later as a user record:
  keep it once**, at the queued time, marked `"note": "sent mid-turn"`.
- **Not his, never saved:** tool results; `isMeta` records; text wrapped in system tags (`<system-reminder>`,
  `<command-…>`, `<task-notification>`, `<local-command-…>` and similar); skill instructions loaded into
  the conversation ("Base directory for this skill…"); "Tool loaded."; sub-agent hand-backs ("Another
  Claude session sent a message…"); compaction summaries; anything the studio wrote.
- **Slash commands he typed** (e.g. `/resume`, `/signoff`) are kept, marked `"note": "command"`.
- **Text he pasted into a message is part of his message**: keep it verbatim, whole.
- **Change nothing** inside a message: not spelling, not punctuation, not dictation errors. The only
  exception is a secret (role file, rule 6).

**Write one file per session** in `docs/design/aaron-words/`, named
`<YYYY-MM-DD>-terra-<first 8 characters of the session id>.json`, dated by the session's first message,
in the same shape as the existing files there:
`{"about": "...", "session": "<full id>", "title": "<the session's title, if the log has one>",
"messages": [{"at": "<ISO time>", "text": "<verbatim>", "note": "<only when needed>"}]}`.
The `about` line says: every message Aaron typed or dictated in that session on Terra, copied verbatim
from its log on <today's date>, only his words, and how mid-turn messages were handled.
Skip a session that holds no message of his, and list it in the report. **Do not overwrite the existing
Luna files.**

**Then write `docs/design/aaron-words/INDEX.md`:** one row per saved file on both computers (Terra's new
ones and Luna's existing ones), in date order: date, computer, session title, first and last message time,
message count, and the file name. At the top: when it was made, what it covers, and that the files hold
only his words, verbatim.

**Check your own work before handing back:**
- Pick five messages at random across the files and compare each, character for character, with its
  record in the log. Report the five and the result.
- Search the saved files for text that is plainly not his (tags, "Base directory", "Tool loaded",
  "Another Claude session", tool output) and report zero, or fix and report what you fixed.
- Report the total sessions found, saved and skipped; messages saved; the earliest and latest dates; any
  gap of more than two days with no session; and anything redacted.

## For Saturn, after the hand-back

- Re-run Pluto's five-message check yourself on five different messages.
- `git status`: only new files in `docs/design/aaron-words/` should appear. Re-read each before `git add`
  (programmer rule 21). Commit ("Aaron's own words from Terra's sessions, saved verbatim (D266, D273)") and push.
- Tell Aaron, in plain words: how many sessions and messages were saved, the date range, whether any early
  sessions were already missing (a gap at the start is the warning sign), and that it is backed up.
- Add the result to the handoff at `/signoff`. The task list (`docs/technical/ROAD-TASKS.md`) marks
  `my-words` done at the next review; that file is Rhea's.
