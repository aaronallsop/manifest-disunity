# A2 — what was measured before the design was chosen

Taken 5 September 2026 on a live Full-mode board, seed 42, turn ~10, 60 nations. Every figure here
was measured in the running game, not estimated. They exist because three of A2's design questions
turn on numbers, and guessing at them is how a stage gets built around a fiction.

## How much of the map actually needs transit

| | Nations | What it means |
|---|---|---|
| Ocean port | 36 | Reaches the world market directly |
| Great Lakes only | 2 (Michigan, Wisconsin) | Reaches the world **only through Canada** |
| Land gateway only | 4 (Idaho, Montana, North Dakota, Vermont) | Reaches the world only through a Canada/Mexico crossing |
| Fully landlocked | **14** | No port, no lake, no gateway — **must** route through a neighbour or not trade externally at all |

Fourteen of sixty is nearly a quarter of the board with no way out except somebody else's ground.
That is the number that says this stage is worth building: without it, a quarter of the nations in
the game have a permanently worse economy for a reason the player can do nothing about.

## Two apparent data faults, checked and dismissed

Delaware touches the sea and has no port; so does Cascadia. Both looked like holes in the port data.
Neither is:

- Delaware's only port county (New Castle, 10003) **is** flagged as a port — it had simply changed
  hands to a neighbour during the ten turns played. Losing your only port to an annexation is the
  game working.
- Cascadia's scenario borders genuinely exclude the Puget Sound ports: Seattle (King, 53033) and
  Tacoma (Pierce, 53053) are both flagged ports and both sit in Washington, not Cascadia.

Checked before reporting, because "the port data is broken" would have sent somebody looking for a
week.

## What routing is allowed to cost

The worry: routing has to run inside `Moves.plan`, which the AI calls for every legal move for every
nation every turn. If it is expensive, A2 blows the "100 turns in under 60 seconds" target.

Measured on the same board:

| | |
|---|---|
| `Moves.plan` calls in one full AI round | **735** |
| Total cost of those | **153 ms** (0.208 ms each) |
| Nation pairs sharing a real border | **256** |
| Cost of computing `transitLink` for **every** pair | **2 ms** (0.008 ms each) |

**The whole nation-level corridor graph can be rebuilt from scratch, every turn, for about two
milliseconds** — a little over 1% of what AI planning already costs. So the design does not have to
be clever about caching: build the graph once per turn when borders may have moved, and route
against it.

What this does *not* license is recomputing the graph inside `Moves.plan` itself. At 735 plans a
round that same 2 ms becomes 1.5 seconds a turn, and 100 turns becomes two and a half minutes of
graph-building alone. The graph is built once per turn; the route lookup is what runs per plan, and
the route lookup is what has to stay cheap.

## What the routing engine actually produces

Measured once the corridor graph and the route search were built, with every
border open at a flat 20% toll, so the numbers show the geography rather than the
negotiation. Every landlocked nation on the seeded board, and how much of a
deal's income survives the journey:

| From | Through | Keeps |
|---|---|---|
| District of Columbia | Maryland (rail) | 70% |
| Nevada | California (rail) | 70% |
| West Virginia | Maryland (rail) | 70% |
| Iowa | Illinois (rail), then **Canada by ship** | 63% |
| South Dakota | Minnesota (rail), then Canada | 63% |
| Wyoming | Idaho (rail), then Canada | 63% |
| Utah | Arizona (**road**), then Mexico | 63% |
| Colorado | New Mexico (rail), then Mexico | 63% |
| Kansas | Oklahoma (rail), then Texas (rail) | 50% |
| Nebraska | Colorado, New Mexico, then Mexico | 45% |

Three things worth noticing, none of which were special-cased:

- **Iowa reaches the world by ship across the Great Lakes.** It goes overland to
  Illinois, which holds a Great Lakes port, and then into Canada by water. That
  is the owner's Great Lakes ruling emerging from the graph rather than from a
  rule about Iowa.
- **Utah's route is by ROAD where everyone else's is by rail**, because that is
  the only corridor its border with Arizona carries. Mode tiers mean Arizona
  could open its motorways to Utah and still refuse it everything else.
- **Nebraska keeps 45%** against DC's 70%, on the same toll rate. Nothing charges
  Nebraska more; it is simply three crossings from a market and each one is paid
  out of what survived the last. Distance costs money without any rule that says
  distance costs money.

## What the search costs

| | |
|---|---|
| Route searches timed | 51 (every nation to the world market) |
| Total | **3.3 ms** |
| Each | **0.065 ms** |

Against the 0.208 ms one `Moves.plan` call already costs, a route lookup is about
a third of a plan — affordable inside planning, which is where it has to run.
