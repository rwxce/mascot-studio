# Craft rules

What makes a mascot feel alive instead of a slideshow. Every rule comes from a mistake we made;
the ones a tool can check are enforced by `pnpm check` (marked ✓).

## Drawing

| Rule | Why |
|---|---|
| Each part turns on its **real pivot** (shoulder, base of the tail, the lid's hinge). | A part spinning around its own centre reads as a sticker sliding, not a joint. |
| Parts that touch live in the **same layer** of the rig: outlines first, fills on top. | Two separately outlined shapes leave a seam at the joint (the jagged arm of v1). |
| A raised arm **leaves the body from the edge** it would really come from. | An arm rotating around the middle of a side sweeps behind the face and pokes out as a spike. |
| Rotating parts have a **round cap** at the pivot. | A square end turns into a corner sticking out of the body. |
| Shapes that change pose are drawn with **the same commands** in every pose. | That is what lets them morph point by point (a tab becoming an arm) without popping. |
| The rest pose (frame 0) is a **complete drawing**. ✓ | Reduced motion shows only that frame. |
| Everything stays **inside the viewBox**, in every frame of every action. ✓ | A clipped hand or heart looks broken. |
| The eyes have **3:1 contrast** with what they sit on. ✓ | The face is what people read first. |
| **Unique ids** even with two copies on a page. ✓ | Repeated gradient or clip ids make the second copy borrow the first one's. |

## Motion

| Rule | Why |
|---|---|
| **One clock** per mascot. | Parts driven by separate timers drift apart. |
| **Idle life never stops**: breath, weight shift, blinks, glances. Actions blend over it. | A mascot that freezes between actions looks dead. |
| **Nothing moves in sync**: arms, breath and sway get different periods and phases. | Synchronised parts read as a machine. |
| A blink **closes fast and opens slower**; sometimes twice. | Symmetric blinks flicker. |
| Poses chain with **`flow`**, not ease-in-out into every key. | Easing into every key makes the body stop dead at each pose. |
| **Follow-through with springs** (arms, tails, props), not extra keyframes. | Springs trail the body naturally at any frame rate. |
| A jump has **anticipation, an arc and a landing squash**, with ~520 ms to settle. ✓ | Without anticipation it teleports; without settling the next action starts mid-air. |
| An `add` track without the envelope **starts and ends at 0**. ✓ | Otherwise the pose jumps when the action starts or ends. |
| **No jumps**: the drawing never moves more than 22 px between two frames at 30 fps. ✓ | That is a pop, not motion. |
| Actions **last under 15 s**. ✓ | Then idle life comes back. |

## Budget ✓

- JS under **2 ms per frame** on average across every action.
- SVG under **30 KB** gzipped.
- No runtime dependencies, no network calls, no framework re-renders per frame.
- Paused off screen and in hidden tabs.
