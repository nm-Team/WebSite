# Lemon production line

The homepage reserves the existing `.lemonLine` dimensions while its Canvas 2D
scene loads. The artwork appears only after the first successful canvas frame.
The SVG is shown on initialization or context failure, or when JavaScript is
unavailable. Reduced motion renders a still canvas with no animation loop.

`initialize.ts` owns lazy loading and page lifecycle. `runtime.ts` owns pointer
and keyboard input, semantic hit regions and the fixed-step render loop.
`simulation.ts` runs Matter.js at 60 steps per second. `scene.ts` projects the
original 4192 by 1272 artwork into the existing 1296 by 393 coordinate system.

The artwork source is the author's `nm-lemon-line-2.svg`. Its original paths,
embedded images, clipping and transforms are retained without resampling.
Regenerate the assets from the original file with Python's standard XML parser:

```sh
python scripts/prepare-lemon-artwork.py /path/to/nm-lemon-line-2.svg
```

Eleven lemons start on the line, with completed marks on fruit already beyond
the processing area. Any lemon entering the laser area is marked, including
fruit placed there by the user. Fruit carried above the machine stays unmarked.
All fruit is drawn behind the conveyor and laser housings, including held fruit, independently of
transient physics contacts. New fruit starts completely outside the left edge.

Lemon artwork and equipment keep their original dimensions. The collision ellipse
is 52 by 52 design units, allowing four fruit across the existing basket with
partial visual overlap. Basket collision faces sit 12 units inside the side edges
and 12 units above the bottom so the artwork meets the frame with slight overhang.
The hidden floor slopes three degrees toward the right to fill the lower row.
The initial collected fruit rests at the right end of that floor.
Automatic collection starts at five settled fruit.

The grey conveyor artwork is a side view of its housing. Small moving dots are
drawn only along the upper edge. The dots and contact motor share a speed of
64 design units per second. The rounded conveyor end and gravity determine the
outgoing trajectory; there is no ejection impulse. Restore surface friction
after creating static Matter bodies, since `Body.setStatic` overwrites it.

Held bodies remain solid. Dragging sweeps through short collision-checked moves
and slides along contacts. Release velocity comes from the body's actual recent
movement, including any obstruction. Collection happens automatically at five
lemons that have settled for 450 milliseconds. A click collects a partially filled
basket as well. A lemon's body must fit between the inner walls. Its centre must
pass below the rim in the left quarter of the basket. The rightmost three quarters,
selected by the centre's horizontal position, permits a raised, settled pile.
Fruit perched at the entrance or still moving does not count.
If fruit leaves the basket or moves again, automatic collection waits for it to
return and settle. The existing basket geometry can still obstruct incoming fruit.
Pointer input uses direct dragging and release. Tapping or clicking a lemon
never leaves it selected, and clicks do not place it at another location.
Keyboard activation, arrow movement and release in place remain available.
The machine is an inert hit shield that prevents grabbing occluded fruit.
Escaped bodies are recycled and the total is capped at 18. Offscreen and
background scenes stop simulation and drawing.

Pointer interactions never show a focus ring. Keyboard focus remains visible.
Only lemon hit regions disable touch panning; the rest of the scene scrolls.
All controls and announcements use the site's five existing locales.

Run `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm build`, and
`pnpm exec playwright test home-lemon-line.spec.ts`. Browser tests cover Chromium
desktop, tablet and mobile projects and the configured WebKit mobile project.
