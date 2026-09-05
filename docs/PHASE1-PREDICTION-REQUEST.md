# Prompt: Phase 1 predictions

Paste everything below the line to the project manager / co-creative. It is self-contained — they do
not need the codebase or the spec to answer.

Return their answer to engineering **before** Phase 1 is built. That ordering is the whole point.

---

## The request

I am building the economy for **Manifest Disunity**, a strategy game about the United States coming
apart. Before the first economic phase is built, the brief requires that someone who is *not building
it* writes down predictions about what the finished model should produce. Those predictions are then
checked against the real thing.

The ordering is the point. A prediction written afterwards is a rationalisation, and a prediction
written by the engineer is marking his own homework. So I need yours, in writing, before any of it
exists.

**What I need from you: five nations that should be comfortably self-sufficient, and five that should
be structurally short — and for each of the five short ones, short of what.**

### The board

The game opens on **1 March 2036** with the United States already fractured into 61 nations on a real
county map. One turn is one quarter.

Most states are intact and play as themselves. Three places came apart:

- **Texas** split five ways: **Dallas, Houston, El Paso, Austin, San Antonio**
- **California** split six ways: **Los Angeles, Bay Area, Riverside, SoCal, Northern California**, and
  **Cascadia** (which took the northern counties and joined the Pacific Northwest)
- **Deseret** broke out of the Mormon Corridor, leaving a reduced **Utah**

Every other state — New York, Florida, Ohio, Wyoming, Alaska, and so on — is a nation as itself.

### The six resources

Every nation produces and consumes six things:

1. **Food** (agriculture)
2. **Resource Extraction** (mining, oil and gas)
3. **Manufacturing**
4. **Logistics** (trade and transportation — this one is throughput capacity, consumed by moving goods)
5. **Finance**
6. **Information Technology**

### How shortage will be decided

For each resource, each nation gets `ratio = supply ÷ demand`, and the ratio falls into a band:

| Band | Ratio |
|---|---|
| Crisis | below 0.50 |
| Deficit | 0.50 – 0.89 |
| Met | 0.90 – 1.10 |
| Surplus | 1.11 – 1.50 |
| Glut | above 1.50 |

**Demand is computed from what a nation is**, never authored per nation:

```
Food          = population
Extraction    = manufacturing capacity × 0.6  +  population × 0.1
Manufacturing = population × 0.3  +  infrastructure upkeep
Logistics     = total volume being moved
Finance       = debt service  +  government spending
IT            = (population + manufacturing capacity) × 0.05
```

**Supply is capacity × utilisation.** A region's industry mix is its capacity and barely changes.
Utilisation is gated by inputs — most importantly, **Resource Extraction gates Manufacturing**. Cut a
nation's extraction and its factories go idle within a few turns, without the region ceasing to be
industrial.

**Phase 1 has no trade at all.** Every nation is sealed. That is deliberate: it establishes what each
place is on its own, before anything can be imported. So predict for a nation that cannot buy its way
out of anything.

### One thing you must know before answering

**The underlying industry data is invented, and I have decided to leave it that way for now.**

What is real: each county's **population** (2024 Census) and its **total economic output** (2024
Bureau of Economic Analysis).

What is not real: **how that output splits across the six sectors.** That split comes from six
hand-written percentage patterns assigned by a crude rule — mostly the state's code and the county's
population. Slightly over half the map carries the same "agricultural" pattern. No county's sector mix
was measured.

This matters for your answer in a specific way. A prediction like *"Wyoming is short of
manufacturing"* will be tested against a manufacturing figure that was never measured, so the test
tells me about my model, not about Wyoming. So:

- **Predict from what you know about these places in reality**, and say so plainly.
- **Where you expect the invented data to disagree with reality, say that too** — those are the most
  useful predictions I can get, because a mismatch there tells me the data is wrong rather than the
  model.

### What to send back

For each of the ten nations:

- **The nation.**
- **Self-sufficient, or short — and if short, of which resource(s), and roughly which band** (Deficit
  or Crisis).
- **Your reasoning in one or two sentences.** The reasoning matters more than the verdict. If the
  number comes out differently, I need to know whether the model is wrong or your reasoning was.
- **Your confidence**, and whether you expect the invented sector data to distort this particular case.

Be specific and falsifiable. *"Deseret will be in Food Deficit because the Mormon Corridor is
high-desert with a large young population"* is useful. *"Some western states may struggle"* is not.

Finally, a sanity check I would value: **is there any nation on this board that you would expect to be
in real trouble in a way none of these six resources can express?** If the model cannot represent it,
I would rather find that out now than after it is built.
