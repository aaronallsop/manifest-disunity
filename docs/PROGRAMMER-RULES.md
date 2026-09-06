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

5. **A test that reads the map will not catch a hole in the journey.** Cost: A2d shipped on
   5 September with the Panama ruling defeated, and stayed that way for a fortnight with four green
   tests guarding it. All four asked *is there an edge between the two oceans* — there was not. The
   route search went Washington → Mexico → Florida, because Mexico held ports on both coasts and a
   corridor node needs nobody's permission to enter or leave. **Every rule about what cannot be
   reached must be tested by trying to reach it**, with the search, from every candidate pair, and
   with the pair count asserted so it cannot pass by finding nothing to try. Reading the graph tests
   the graph; only running the search tests the rule.

6. **Measure a long run in chunks that fit inside one tool call, and never chain runs in a script
   you cannot see into.** Cost: roughly forty minutes on 5 September, and a wrong diagnosis
   published mid-flight. Three facts combine badly here. `dev.html` **auto-runs fifty turns when it
   loads**, so the simulator is busy for the first ~40 seconds of every page load; `Sim.run` is not
   re-entrant and *throws* rather than queueing, so anything that starts during that window fails
   with "already in progress"; and a browser tool call that times out abandons its script while the
   page carries on working. Together those look exactly like a stuck lock — I said so out loud — and
   the truth was that nothing was stuck and everything was simply busy. **Use `Sim.step(n)` in
   chunks small enough to return inside the timeout, record each chunk's timing as you go, and read
   the world's own turn counter to see where you are.** A measurement you cannot observe halfway
   through is a measurement you will misread.

7. **A figure on the Control Board is a claim, and claims get re-derived before they are repeated.**
   Cost: the board told Aaron for a day that 84% of the industry data could come from real
   government figures. It is 75%. The error was not arithmetic — it was counting a *combined*
   published figure covering two of the six sectors as though it measured both, and counting trade
   without requiring transport. Both are the kind of mistake that survives any amount of re-reading
   by the person who made it. **Before repeating a number somebody will act on, have something that
   did not produce it produce it again** — a separate script, a separate agent, a separate method —
   and reconcile the difference to the unit. Here the two errors accounted for 6.45 points exactly,
   which is what turned "roughly right" into "wrong, and here is why".
