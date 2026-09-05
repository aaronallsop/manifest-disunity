# How this project is versioned

Read this before stamping a version on anything. The scheme is deliberately small, and the reason it
exists is narrow: **so that a playtester's report can be tied to the exact build they played.**
Without that, "the trade screen confused me" is a sentence nobody can act on six weeks later.

## The three numbers

`v0.2.1` — three positions, and only one of them moves at a time.

| Position | Moves when | Example |
|---|---|---|
| **First** — `v1.0.0` | The game becomes a different proposition. `0` means it is not finished. | `0` → `1` when it is worth a stranger's money. |
| **Middle** — `v0.2.0` | **Something exists that did not exist before.** | The economy system arriving. |
| **Last** — `v0.2.1` | Same capability, fixed or adjusted. Nothing new to learn. | A crash on the trade screen. |

**The test, when you are unsure:** *if I sent this to a tester, would I have to tell them anything
new?* If yes, the middle number moves. If the honest answer is "same game, less broken", the last one
does. This resolves nearly every real case.

Versions only ever go up. A number, once published to anyone, is never reused or re-pointed.

## The stages these numbers describe

| Stage | Numbers | What it means here |
|---|---|---|
| Prototype | `v0.1` | It works, it can be won and lost, it is playable online. |
| Alpha | `v0.2` – `v0.10` | The economy is being built. One bump per phase of `docs/spec/` that clears its Control Board checkpoint. |
| Beta | around `v0.11` | Feature complete; balancing and defects only. |
| Release | `v1.0` | Worth a stranger's money. |

`v0.10` is a later version than `v0.9`. The middle number is a counter, not a decimal.

## The history so far

| Version | Commit | Date | What it was |
|---|---|---|---|
| `v0.1` | `d64da4f` | 2026-09-03 | The prototype. Sixty-one nations on the shattered board, three ways to win, a game that can be lost. This is the build on the `main` branch that playtesters were sent. |
| `v0.2` | `bb00567` | 2026-09-04 | Economy mode: the board strippable back to unite, annex, trade and the market, with politics and separatist movements switched off. The first build made for testing one system in isolation. |

## The rules for whoever stamps the next one

1. **A version is a tag on the real history**, on `master` — never on the `main` playtest branch.
   `main` holds a built copy of the game for the browser; it is an output, not a place work happens.
   Tag the commit the build came from.
2. **Tag only a state you have verified.** All tests green, and the thing the version claims to add
   actually demonstrated working. A version number is a promise that a specific build did a specific
   thing.
3. **One alpha bump per phase of the economy brief**, and only after Aaron has approved that phase's
   checkpoint on the Control Board in writing. The brief requires that approval; the version number
   is the record that it happened.
4. **Write the tag with a message** saying what a player can do in this build that they could not do
   in the one before. That message is what a future session reads to reconstruct the history.
5. **When a build is sent to testers, say which version it is** — in the link, the message, or the
   game itself. An untraceable build wastes the feedback it generates.
6. **Never move or delete a published tag.** If one was wrong, add the next number and say so.

## How to see them

```bash
git tag -l -n9
```

Lists every version with its message. To see exactly what a tester played:

```bash
git show v0.1
```
