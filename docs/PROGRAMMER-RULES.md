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

    **⚠ THIRD TIME, 15 September 2026, and this one is the worst of the three.** The session that ran
    23:42–02:07 made **nine commits** — two design documents, twelve decisions, two board rewrites —
    and **never wrote a handoff at all.** It did not go stale; it was never written. So `CLAUDE.md`
    was left telling every session that stage 2 *did not exist* on the night stage 2 started, and the
    newest handoff on disk was a sealed document from the session before. **The next session spent its
    opening reading nine commits and four documents before it could say one true sentence.**
    **What is different about this failure, and it matters:** the two protections added after the
    second time both worked exactly as designed — the hook counted the nine commits and named them,
    and `/resume` refused to believe the stale handoff. **They caught it; they cannot write it.**
    A session that simply stops has defeated both. **The only thing that prevents this is `/signoff`,
    and the rule is: a session does not end without it, even one that produced nothing but documents.**

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

12. **A check that decides "is this still true?" must be tested against its own negations before it
    ships.** The wiki generator decided whether a design ruling had been retired by searching the note
    about it for the word *"superseded"*. Most of those notes **open with the words "Not superseded."**
    So the check read every denial as a confirmation and stamped **39 live rules** with *"do not state
    this as a rule"* — the precise failure the writer's guide names as the worst thing the wiki could
    publish. It shipped, and a **paid human reader** found it, politely, on six separate pages, while
    drafting against it. The corrected version marks 6.
    **What generalises:** a substring test on prose is a coin flip on any sentence that argues. Before
    shipping any classifier over written language, run it over **every** row of the real data, print
    each verdict beside its text, and read them. It took four minutes here and would have caught it.
    **The tell:** the words you are searching for also appear in sentences that mean the opposite.
    A second lesson from the same review, worth keeping beside it: **partial is not total.** Three
    rulings were "superseded in its roster" or "superseded in its first half", and the rest of each
    one is still the rule. A binary verdict on a spectrum retires live design.

13. **Do not build a Python string in a shell heredoc when the string contains backslash escapes.**
    Three times in one session, `\b`, `\n` and `\A` written inside a `<<'PY'` heredoc reached the file
    as a literal backspace, a real newline and a broken escape — once producing a regex that silently
    matched nothing, twice a `SyntaxError`. The quoting survives one level and the string literal eats
    the next. **Use the file editor for any patch containing an escape**, or build the pattern from a
    named constant defined once at module scope. The failure is silent in the one case that matters:
    a regex full of literal control characters still compiles and still runs.

14. **Read the whole of a governing document before writing the list of what it leaves open.**
    Round 4's spine — the eleven questions to put to Aaron — was written after reading the economy
    spec's owner rulings and its resource model, sections 1 and 3. Sections 4 to 9 were read an hour
    later and **closed two of the three items the spine had called blocking**: section 4.1 already
    gives a seller two multipliers for squeezing a desperate buyer, and section 5.7 already turns a
    food deficit into claim pressure against a neighbour with fields, unlocking a casus belli at 50.
    Both had been written down eight days earlier.
    **What generalises:** this project's stated fear is quietly contradicting something already
    ruled. The mirror image is **asking the owner to decide something already decided** — it spends
    his time, and a second answer that differs from the first leaves two rulings in the record with
    nothing to say which one governs. Two of eleven questions put to him were not questions.
    **The tell:** you are about to write "the spec is silent on X" and you have not read every
    section heading of the spec with your own eyes. A table of contents is not a reading, and grep is
    not a reading either — the terms the spec uses are not the terms the question uses. Section 4.1
    answers "can a seller set a price?" without containing the word *seller*.

15. **Write a commit message to a file. Never pass prose to `-m`, and never build one in a heredoc.**
    Twice in one session a commit failed on quoting: once because an apostrophe inside a `<<'EOF'`
    heredoc ended the quoting early, and once because double quotes inside `git commit -m "…"`
    split the message into pathspecs — git then reported `pathspec 'this' did not match any file(s)`
    for a dozen fragments, which reads like a file problem and is not one. Rule 13 covers heredocs
    containing backslash escapes; this is the same disease one layer out.
    **What generalises:** a commit message is prose, and prose contains apostrophes and quotation
    marks. Write it with the file editor and use `git commit -F <file>`. It costs one extra step and
    it cannot fail.
    **The tell:** git complaining about pathspecs when you did not name any paths.

16. **A test runner that reports one test for a file of fifty assertions has not run them.**
    This project's tests run in a browser and the README says they were written so `node --test`
    would run them unchanged. Node is now on the machine, so it was tried: it reported
    **`pass 1`, 64ms, green** for a suite file — because `node --test` imported the module, saw no
    throw, and counted the *file* as one passing test. The harness registers its own cases and
    never ran. **A green that fast is not a fast green.**
    **What generalises:** before trusting a runner you have not used on this project before, check
    that its **count** matches what the suite actually contains. An exit code of zero proves nothing
    ran wrong; it does not prove anything ran.
    **The tell:** the count is suspiciously round, suspiciously small, or exactly one — and the
    duration is far below the known figure. The real run here was **956 tests in 215 seconds**.

    **⚠ RECURRED AT THE 16 SEPTEMBER SIGN-OFF, and the recurrence is the more useful half of this
    rule.** This entry already existed, already named `node --test`, already gave the false figure and
    the true one — **and the next session ran the command anyway and wrote down "51 of 51 green" before
    catching it.** The rule was not wrong and it was not vague. **It was in a file nobody reads at the
    moment of the mistake.** The session looked up how to run the tests in `README.md`, and `README.md`
    was still recommending the broken route.
    **So the rule gets a second clause: a lesson belongs at the point of use, not only in this file.**
    A warning about a command goes next to the command. `README.md` now carries it in the Tests
    section, and the defect is `docs/deferred.md` 45.
    **And the cheap proof, which costs ten seconds and settles it for any runner:** add a suite whose
    only check is `ok(false)`, run it, and confirm the runner goes **red**. A runner that cannot fail
    cannot pass. *Done this time; it reported `pass 1, fail 0`, exit code 0.*

17. **Verify the roster, not only the code. A design round can check every function and still design
    against a board that does not exist.**
    Round 5 spent an hour reading the engine before writing a single ruling, and the §3 section it
    produced — what recognition gates, that patronage already exists, that there is no stance
    machine — was right in every line. **It then wrote eleven rulings about the Deep South,
    Appalachia, Philadelphia, New York City and six regions of stateless ground, none of which is on
    the board.** The game opens as the fifty states with Texas and California shattered and Deseret
    carved out: **twelve new nations, not twenty-nine.** The story's twenty-nine are a design in
    `secession-ideation.md` §8 with *"five lines still to be drawn"*, and four closed rounds had been
    quoting them as though they were the game.
    It reached the handover before it was caught: the cut list named a trade deal between two nations
    that do not exist as **the cheapest thing in the round and the recommended fallback.**
    **What generalises:** *what the code does* and *what the board contains* are two different
    questions and reading the first does not answer the second. Before writing anything that names a
    nation, a region or a piece of ground, **read `DESIGN.md` §2.1 and the scenario content and list
    who is actually there.** The design may legitimately be for a board that does not exist yet —
    that is what a design stage is for — but it must say which board it means.
    **The tell:** a ruling that names a nation no test fixture and no measurement in the project has
    ever mentioned. Round 4 measured everything it touched; round 5 named Appalachia eleven times
    without once asking whether the file that builds the board had ever heard of it.

18. **The Control Board is edited with the file editor. A script that writes its text will damage it,
    and this is the THIRD time.**
    The rule already existed in two places — the project's own `CLAUDE.md` and the board skill — and
    the log records it being broken on 4 and 5 September. **It was broken again tonight**, adding two
    phase entries through a Python script: `\n\n` inside the generated JavaScript strings arrived as
    **real line breaks**, which is a syntax error in a string literal, and the page's data object
    stopped evaluating.
    **Nothing reached Aaron**, because the check that reads the object back under `node` ran before
    publishing and refused it. The file was reverted and the same content re-entered with the editor
    in four calls.
    **What generalises, and it is wider than the board:** the failure is not Python or bash or a
    heredoc — it is **any pipeline where prose with escapes in it passes through a second language on
    its way to a file.** Every layer gets an opinion about a backslash. Rule 15 said this about commit
    messages, rule 13 about heredocs; this is the same disease a third time, so the rule is now the
    general one: **text with quotes, apostrophes or escape sequences in it is written by the file
    editor, never generated.** Scripts may still *read* and *check* — that is what caught this.
    **The tell:** a file that was valid before your edit and will not parse after it, where the diff
    looks correct to the eye. Look for a string literal spanning two lines.

19. **The Control Board's front page is a dashboard, not a briefing. One sentence and a fold — never
    a wall of prose.** Cost: Aaron told me twice, a day apart, and a republish in between.

    **What happened.** On 14 September he said of a decision card: *"the amount of text in that box
    is too much to read… make it a box with the high level things and if I click it it opens up…
    and even then I need some formatting to read it better."* I shortened the card and left the
    **headline** as six hundred words of unbroken prose. On the 15th he said it again: *"it is still
    way too long of text on the front page. I need easy to read and concise language only."*

    **Why shortening the prose was not the fix.** The headline rendered through `textContent` into a
    single block — there was no structure available to be concise *with*. Every session had written
    more prose into the only slot the page had. **The format was the defect and the length was the
    symptom**, so each session dutifully wrote a slightly shorter essay and the page never improved.

    **What the front page is for.** He reads it in under a minute, standing up, to learn where the
    project is and what needs him. Anything he cannot act on in that minute belongs behind a fold.

    **The shape, now built into the template's renderer:**
    - **Headline** = a `lead` of one or two sentences, then `points` — an array of **one-line**
      statements. A point may carry `warn: true` for bad news.
    - **A decision card** shows its title and the recommendation; the evidence and the cost fold
      behind `Why, and what it costs either way`. Write them as **arrays** and they render as
      bullets.
    - **A phase** shows its name; the brief and what happened fold behind it.
    - **Blocked items** show what is blocked; the explanation folds.

    **And the corollary, because this is what let it rot:** an archive nobody renders is not free.
    The board was carrying five superseded headlines and six answered cards — **526 lines, 31KB, and
    not one pixel on screen.** Delete them; the record lives in `DECISIONS.md` and the handoffs. The
    `log` is the exception and is never pruned, because a log that can be quietly revised is worth
    nothing.

    **The tell:** you are about to write a fourth paragraph into a field the renderer prints as one
    blob. Stop and ask what the reader does with it in a minute.

20. **A stale `CLAUDE.md` is worse than a stale handoff, because nothing counts commits against it.**
    On 16 September a session scoped stage 3, got Aaron's approval, completed step 1 of seven, and
    committed all of it across seven commits. **It never touched `CLAUDE.md`.** The project then sat
    for **eight days** with its own definition of done saying stage 3 *"has never been scoped"* and
    *"nobody has said it starts."*
    **The handoff was stale too, and that one was caught** — the session-start hook counts commits
    landed after the newest handoff and prints a warning naming them. **There is no equivalent check
    for `CLAUDE.md`**, and it is the file a new session treats as binding: a session could have read
    it, believed stage 3 unstarted, and re-scoped a stage that was already approved and a step in.
    **What generalises:** the rituals protect the *record of what happened* and nothing protects the
    *statement of where we are*. **So when a session changes what phase the project is in, the
    definition of done changes in the SAME commit** — not at the next sign-off, and not in the handoff
    alone. A phase change is not finished until both files say so.
    **The tell:** the newest handoff and `CLAUDE.md` disagree about what stage is live; or a sign-off
    updated the handoff and touched nothing else.
