# Paint-only introduction

Supersedes the desktop launch flow described in `scene-1-design.md`.

Open directly in one maximized Paint window. The first canvas contains the exact requested introduction, handwritten in black with a blue underline, beside the supplied portrait. Stack the same composition on narrow screens. Keep the existing functional drawing tools and PNG export.

Pin the application during scrolling. Normalize page scroll into an erasing progress value and draw a white square-tipped stroke along a serpentine path across the original bitmap. Position the square cursor using that same path, making the effect reversible by repainting from the cached introduction. Keep visitor drawing history on a separate layer so the finished blank canvas remains usable. Replay resets scroll while retaining that history.

For reduced motion, clear at the midpoint without a moving cursor. Preserve the introductory text as an accessible heading and canvas label. Touch pans the page; mouse and pen can draw.

Validation: type checking, production build, and browser tests for image loading, rendering, actual erased pixels, cursor alignment, exact reversal, replay, drawing/history/export, responsive bounds, and reduced motion.
