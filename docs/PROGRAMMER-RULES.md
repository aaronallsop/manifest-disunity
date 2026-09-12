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

8. **Time nothing on this project with other tabs open, and never attribute a slowdown from a single
   pass.** Cost: a wrong headline number published to Aaron's board on 5 September — "about 65
   seconds, misses the target" — and an hour spent suspecting code that turned out to be innocent.
   The same build measured 337 ms and 642 ms per round twenty minutes apart on the same machine;
   single-pass figures here swing 30–40% with load. Measured properly, with nothing else running, a
   hundred turns takes 48.8 seconds and passes. **To compare two builds, interleave them** — run
   A, B, A, B in the same window with the same warm-up, and read the medians of several repetitions,
   never one pass of each. And before blaming a change, count how often the changed code actually
   runs: the prime suspect that night executed zero times a round.

9. **A recorded number describes the machine that recorded it.** The project carried "83 ms a turn"
   and a 137.5 ms baseline, and current code looked 4–8× worse against them. Checking out the exact
   commit where 137.5 was written and re-running its own measurement gave 364–441 ms on this machine.
   Nothing had got slower; the old figure was from somewhere else. The comment beside it was also
   comparing a different board — the intact 51 states, not the shattered 61. **Before treating an old
   figure as a baseline, reproduce it at the commit that wrote it.**


10. **Write the handoff last, and if you carry on working, write another one.** Cost: a morning on
    9 September, when Aaron opened a session instructing work that had already been finished
    overnight, because the session that finished it never wrote a replacement handoff. **Then it
    happened again, worse:** a handoff written at 14:49 on 9 September was followed by fourteen
    rulings and twenty-four commits across two sessions, and still said round 3 had not started.
    The document was honest when it was written; nothing noticed it had stopped being true.
    **A handoff is only true up to the commit that wrote it.** The session-start hook now measures
    that and warns, and `/signoff` step 7 ends with a check that must print `0` — but the rule is
    yours to keep either way: **if you commit after writing the handoff, the handoff is now wrong.**
    Note what the *first* fix was, because it did not work: a sentence of advice inside the handoff
    itself, in bold, telling the next session to write its handoff. The next session that failed had
    that sentence in front of it. **Advice inside the artefact cannot protect the artefact.**

11. **A count written at the top of a long document is wrong by the end of the day. Measure it, or
    do not print it.** Rule 10 is about one artefact going stale. This is the same disease everywhere
    else, and the hook that now catches a stale handoff does not catch this. Three cases in four days,
    all of them a summary line sitting above a body that had moved on:
    the conquest round's header said **31 rulings** on a document holding **41**; the politics round's
    header said **14** two lines above its own table saying **37**; and a Control Board card gave Aaron
    a *reason* that was false (Cascadia reaching into Oregon) while the ruling it supported was right.
    **Every one was written accurately and then overtaken**, in one case within the same session.
    The fix is mechanical, not diligent: **derive the number at the moment you write it**
    (`grep -c` the headings, or count the rulings), and where a document states its own size in two
    places, say in the document which one wins. Both headers now carry that line.
    **The tell:** if you are about to type a number that describes the file you are typing into, you
    are about to create this bug.

11. **When you sum a quantity across sets that overlap, check the total against a bound you know.**
    Cost: a wrong figure went in front of Aaron and survived until the sign-off review an hour later.
    Finding I reported "155 million people, 32% of everyone inside a movement" by summing nine
    movements' homeland populations — but homelands overlap, so every shared county was counted once
    per movement covering it. The true figure is **117.8 million across 1,526 distinct counties, and
    38%**: the population was overstated and the share understated by the same mistake. **The tell was
    there to be read — the denominator came to 485 million, and the United States has about 330
    million.** Any sum over movements, homelands, Areas or deals is a sum over overlapping sets in this
    project. Deduplicate to the county, then total; and before publishing any population figure, hold
    it against the population of the country.
