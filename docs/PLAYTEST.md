# Shipping it to playtesters

How to get this in front of five to ten people who are not in the room, and get their sessions back.
This is the operational half of M13; `docs/AUDIT-PLAN.md` M13 is the programme it serves.

---

## The short answer

**Host the folder on any static web host and send people a link.** Everything works: the game boots,
saves, loads, resumes after a reload, and exports a full session record. No install, no Python, no
download, no Steam wrap. That is the whole recommendation, and the rest of this document is why it
is safe to believe and what to do about the two edges.

**Do not send a zip and tell them to open `index.html`.** It will not work, and it will not fail in a
way they can report usefully — see "Why a folder does not work" below.

---

## What actually depends on the server

`server.py` does four things. Only one of them is load-bearing for a playtest, and it now has a
fallback.

| | Needs `server.py`? | Without it |
|---|---|---|
| Serving the game | No | Any static host |
| **Save / Load, by name** | No | localStorage, ~5 MB budget |
| **Autosave + resume after a reload** | **No, since M13.2** | localStorage (`ns_live`) |
| Telemetry export | No | Downloads a file instead of writing `content/` |
| Publishing map modes from the editor | **Yes** | Editor still draws; Publish fails |

The editor's Publish is the only genuine loss, and no playtester needs it.

**Verified, not assumed.** All of the above was tested against `python -m http.server` — a server
with no `/api` at all — on a clean origin: the game booted with 1,688 Areas and 60 nations, a named
save round-tripped through localStorage, and a reload resumed at turn 3 with 219 journal entries
intact.

One bug came out of that test and is worth knowing about, because it is the kind that survives a
casual check: a static host answers `PUT /api/state` with **501**, and `fetch` resolves happily on a
501. The autosave's fallback only triggered when the request *threw*, so on exactly the host a
playtester would be using, it wrote nothing, silently, every turn, and reported success. It checks
`r.ok` now.

---

## Why a folder does not work

Double-clicking `index.html` opens it on a `file://` URL, and two things break immediately:

- `js/boot-globals.js` is `<script type="module">`, and browsers refuse to load ES modules over
  `file://` under the same-origin policy.
- Every data file is fetched (`data/game-data.json`, `data/counties-10m.json`, `content/*.json`), and
  `fetch` is blocked on `file://` too.

The result is a blank page with console errors, which is the worst possible thing to hand somebody
three time zones away. If you must ship a folder, ship it with instructions to run
`python server.py` — but that means Python, a terminal, and a support conversation per tester.

**A real desktop build is a Tauri or Electron wrap, and that is M14.** It is the right answer for
Steam and the wrong answer for a playtest you want to start this week.

---

## Recommended: static hosting

Any of these work; they differ only in how much friction there is for you.

- **GitHub Pages** — push the repo, enable Pages on the branch, done. Free, and the URL is stable.
  Note the repo is public unless you pay, which matters if you would rather the source not be read
  yet.
- **Netlify / Cloudflare Pages** — drag the folder onto the dashboard. Free, private, instant, and
  you get a fresh URL per deploy, which is useful for "everybody please use build 3".
- **itch.io, as an HTML5 project** — worth considering later because it gives you a password-gated
  page and a comments thread in one place. It wants a zip with `index.html` at the root.

### What to exclude from the upload

The game only needs what it fetches. These are safe to leave out and cut the upload substantially:

```
build/        the offline bakes — the JSON they produce is what ships
tests/        the suite
docs/         these documents
dev.html      the tuning dashboard
server.py     not used by a static host
data/state.json   your own game in progress
```

Keep `index.html`, `css/`, `js/`, `lib/`, `data/` (minus `state.json`) and `content/`.

### The link to send

```
https://your-host/index.html?playtest=1
```

`?playtest=1` shows a one-time notice on the tester's first turn explaining that the session is being
recorded and where the export button is. It does not change the game.

Add `&difficulty=hard` to hand somebody a specific setting, or `&seed=20260829` to put two testers on
the same board — which is the single most useful thing you can do if you want to compare two people's
decisions rather than two people's luck.

---

## Getting the sessions back

Ask them to finish with **Menu → Export this session**. On a static host that downloads one JSON
file; they email or Slack it to you.

That is one manual step, and it is deliberate. The alternative is posting the file somewhere
automatically, which means running a service, holding other people's data on it, and telling them so
— a lot of apparatus for five to ten testers. If the programme grows past that, the export already
produces exactly the payload a `POST` would send.

### What is in the file

The export dialog lists this to the tester before they send it, and the list is the interface — a
claim that nothing personal is collected is worth less than an itemisation somebody can read:

- **The world's record** — the complete ledger, every event with the `Why` terms that justify it.
  This is the part that answers "why did that happen".
- **Where they stood, turn by turn** — the five stocks, per-condition victory progress, their rank
  among all nations, and the highest pressure anywhere in their own ground.
- **What they did** — every action that resolved, *plus* the things that never reach the ledger:
  actions they opened and cancelled, refusals they hit, map modes they used, whether they opened
  Objectives, which `Why` rows they expanded, and how long each turn took.
- **The run's identity** — seed, board, difficulty, tuning diff, save-format version. Enough to
  replay it.

Nothing else: no names, no typed text, nothing about the machine, and nothing from outside the tab.

Roughly 33 KB at turn 2 and a few hundred KB by turn 60; the ledger is what grows.

---

## The four questions, and where each is answered

From `docs/AUDIT-PLAN.md` M13. Ask them in a call afterwards — the file tells you where to look.

| Question | In the file |
|---|---|
| When did you first feel behind? | `series[].rank` and `series[].mine` — the turn their rank starts falling is usually a few turns *before* the turn they say |
| What did you do on turn 25? | `actions[]` filtered to turn 25, and `log[]` for what they opened and abandoned around it |
| Did you see the secession coming? | `series[].peakPressure` and `peakArea` in the turns before it — and whether `log[]` shows them ever selecting the Pressure map mode |
| Did you understand why you lost? | `ledger` entries near the end, and whether they ever expanded the `Why` rows (`log[]` `kind: 'why'`) |

The two things to read first, before any of the above:

- **`series[].ms`** — turn duration. A run of eight-second turns is somebody clicking End turn to see
  what happens; a four-minute turn is one that mattered to them. This is the fastest way to find the
  sparse mid-game the audit predicts.
- **`log[]` `kind: 'refused'`** — every time the game said no. The same refusal three times is
  something the game explains badly, and it is the cheapest fix on the list.

---

## Practical notes

- **Browser storage is per-origin and per-browser.** A tester who plays on a laptop and then a phone
  starts again. Say so up front.
- **Private/incognito windows** may throw on `localStorage` outright. Everything is wrapped, so the
  game still plays — it just cannot save. Ask them not to use one.
- **The ~5 MB budget** is shared between the live autosave (~670 KB and growing with the ledger) and
  their named saves. If it fills, the autosave keeps working with the journal trimmed to the last ten
  turns and says so; the export still carries the full ledger from memory.
- **Ask them to export before they close the tab**, not after. Clearing site data takes the session
  with it.
- **Give everyone the same build.** Redeploying mid-programme means two testers' numbers are not
  comparable, which is the one mistake that wastes the whole exercise. The export records the tuning
  diff, so you can at least detect it afterwards.

---

## What to fix before you send it

Nothing blocks a playtest, but three things are worth knowing when you read the results, because they
will show up in the data and you should not mistake them for tester behaviour. All three are measured
in `docs/PROGRESS.md`.

1. **The world consolidates faster than it used to.** 60 turns, seed 20260829: 51→47 nations before
   M11, 51→41 with trade, 51→27 with all of M11. Trade income funds `unite`. If testers report the
   map feeling settled by turn 40, that is this and not them.
2. **A turn takes about 340 ms of AI thinking.** Noticeable on a slow laptop as a pause on End turn.
   `Moves.legal` went from 15 to 30 candidates per nation in M11.
3. **The difficulty picker only applies to a new game.** Loading a save correctly restores the tuning
   it was played with, which discards the preset. The telemetry reports `custom` rather than lying
   about it, but tell testers to pick difficulty when they start.
