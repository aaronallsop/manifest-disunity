# Programmer rules for this project

Each rule was written after something cost this project real time. Read them before working.
Add one with `/rule` whenever a mistake earns it. Number them; never delete one.

1. **Never edit a UTF-8 file with PowerShell's `Set-Content`/`Get-Content` round-trip.** It re-encodes
   through the console codepage and silently double-encodes every non-ASCII character: one timestamp
   substitution turned all 26 em-dashes in the Control Board into `â€”`, destroyed a curly quote
   outright, and added a byte-order mark. It was published to Aaron in that state. Nothing warned —
   the HTML still parsed and the JavaScript still validated, and reading the file back through a
   Windows pipe shows the SAME mojibake whether the file is corrupt or fine, so the first three
   diagnostic attempts each drew the wrong conclusion. Use Python with an explicit
   `io.open(..., encoding='utf-8')`, or the Edit tool. To check a suspect file, count `â` and
   `€` in it — and if in doubt compare RAW BYTES against `git show <commit>:<path>`, which is
   the only test that cannot lie to you.

2. **A workflow that dies mid-run can be resumed — but only if its script is under the session's
   ORIGINAL project slug.** Moving the project directory mid-session (as on 4 September) gave this
   session two slugs under `~/.claude/projects/`; the Workflow tool saves scripts under whichever was
   current at launch but will only read back from the original, so `resumeFromRunId` on a script under
   the new slug is refused as unreadable, and `request_directory` on that folder does not resolve
   either. It cost two round trips and the cached work of two agents. If a resume is refused, check
   which slug the script path carries; if it is the wrong one, relaunch inline rather than hunting.
   Better: do not move the project directory in the middle of a working session.

3. **`node --check` does not reliably catch syntax errors in this project's ES modules.** An
   unescaped apostrophe inside a single-quoted string in `js/tunables.js` (`'a turn's income'`)
   passed `node --check js/tunables.js` and then took the whole game down at boot with
   `Uncaught SyntaxError: Unexpected identifier 's'` — which surfaces three modules later as
   `Ideology is not defined`, because the page keeps loading after a script fails to parse. The
   symptom points nowhere near the cause. Use `node -e "import('./js/<file>.js')"` for a module,
   and prefer the Edit tool over generating JS strings from Python: every layer of quoting between
   the intent and the file is a chance to produce exactly this.

4. **Prefer a file over `python -c` for any script containing backticks, apostrophes or backslashes.**
   Bash expands backticks inside double quotes, so a Python one-liner carrying JS or Markdown will
   be silently mangled before Python ever sees it — and the resulting error names a line that is not
   what you wrote. Write the script to the scratchpad and run it by path.
