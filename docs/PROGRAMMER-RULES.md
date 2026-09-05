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
