# Paint portfolio

Open directly in one maximized Paint window. The first canvas contains the handwritten introduction beside the portrait. Stack the composition on narrow screens. Keep drawing tools, undo/redo and PNG export functional.

Pin the application through a reversible scroll sequence. One stage spans `320svh / 3`, keeping the introduction erase at one-third of its original scroll distance. Stages:

- 0–1: erase the introduction and visitor drawings using a deterministic wandering path starting in the center. Leave small remnants.
- 1–3.1: write a continuous chronological timeline and pan down to follow it; hold through 3.3.
- 3.5–3.8: open a modal Windows 7 file picker over Paint. Select Just Flip A Coin, PolyfirGroup or PDF Toolkit to open an illustrated PNG project sheet on the canvas, with English CV descriptions and a project link when a verified URL is available. Support search, single selection + Open, double-click, Cancel/Escape, and reopening through Projects or File → Open. Returning above 3.35 restores the timeline. Project drawing histories stay separate. Education marks the main milestones, with internships on smaller branches: Proaxion (2021) under the college diploma, and MesAieux (Jan–Apr 2024), Humanware (Sep–Dec 2024) and Djob (May–Aug 2025) under the bachelor’s degree. C2T3 and Casa Das Tias remain dated professional work milestones, not internships. Keep the hand-drawn doodles. Build every item through sequential Paint tool actions: move to the target, drag open a text selection and type characters, or trace lines, markers and doodles with a visible pencil. The ribbon follows the active tool. Text selections, resize handles and the animated tool cursor are temporary DOM overlays, excluded from PNG export.

- 4–4.45: move the Fill tool onto the last project (or completed timeline), then flood the bitmap black. Fill follows scroll and reverses exactly.
- 4.45–6.25: use the same text-box, typing and pencil choreography to write contact details on black. Email, phone, LinkedIn and GitHub become clickable when their entries finish drawing. Hold through 6.5. Keep white drawing ink on the contact page and separate its drawing history. Reduced motion skips the moving bucket and shows complete contact text.


The English education and work entries come from the supplied `CV Louka Gauthier (fr).pdf`. Do not add other CV sections. Resume text is drawn into the bitmap for export and mirrored in semantic HTML for accessibility. Wrap lines on narrow canvases. Keep visitor strokes associated with the page where they were drawn, so they restore on reverse scroll without carrying onto later pages.

Reduced motion shows complete text in discrete timeline views and clears the introduction at the midpoint without a moving cursor. Touch pans the page; mouse and pen can draw. Replay returns to the introduction.

Validation: Astro checks/build and browser tests for drawing/history/export, actual erased pixels, cursor alignment, exact reversal, replay, CV scenes, responsive bounds and reduced motion.
