# Decisions

Every judgment call made during the rebuild instead of asking, with the reason. Newest last.

---

### D1 — `build/raw/README.md` is committed, everything else under `build/raw/` is not
**M0.1.** `.gitignore` uses `build/raw/*` + `!build/raw/README.md` rather than `build/raw/`.
A bare directory exclusion stops git descending into the directory at all, so the negation would
never fire and the plan's requirement ("write `build/raw/README.md` listing each raw artifact")
would produce an untracked file. The `*`-plus-negation form keeps the 376 MB out and the
self-documentation in.

### D2 — `.gitattributes` normalises to LF
**M0.1.** The working tree is Windows; git warned on every one of the 48 baseline files that LF
would become CRLF. Left alone, the first `sed`/heredoc edit would produce whole-file diffs. Set
`* text=auto eol=lf` and `core.autocrlf=false` so diffs stay line-scoped for the rest of the
rebuild.
