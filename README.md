# Louka Gauthier — Paint

A portfolio introduction inside a full-screen Paint window. The canvas starts with “Hello :-) I'm Louka Gauthier, full stack developper” and Louka's supplied Paint-style portrait. Scrolling guides a square eraser across the introduction; scrolling back restores it exactly.

## Run

Requires Node >= 22.23.4 (`.nvmrc` selects Node 26).

```sh
nvm use
npm ci
npm run dev
```

Local preview: `http://127.0.0.1:4321`. `npm run build` emits the static site to `dist/`.

```sh
npm run check
npm test
npm run build
```

Tests use installed Google Chrome and cover the initial composition, drawing, undo/redo, clear, PNG export, actual pixel erasure, cursor alignment, exact scroll reversal, replay, responsive layout, and reduced motion.

## Behavior

- Paint opens immediately and fills the viewport. The application stays pinned while the page scrolls.
- The introduction is drawn into the actual bitmap. A square eraser follows a continuous serpentine path, shared with the white strokes that remove the artwork.
- Scroll up or choose **File → Recent images → Introduction** to restore the introduction. Replay preserves the visitor's own drawing layer.
- Draw with mouse or pen, select a color and brush size, use shapes, undo/redo, clear, or export a PNG with Ctrl/Cmd + S. The top Save icon downloads the English CV as a PDF. User drawings remain editable after the introduction has been erased.
- Ctrl/Cmd+Z undoes, Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z redoes, and Ctrl/Cmd+S saves.
- View includes zoom and gridlines. At 100%, the canvas fits the available space. Larger zoom levels allow panning inside the canvas workspace.
- Narrow screens stack the introduction and portrait. Touch gestures scroll the story; drawing uses a mouse or pen. The ribbon scrolls horizontally.
- Reduced motion replaces the moving eraser with a single clear/restore transition at the midpoint.
- Help opens an accessible modal. The canvas's accessible name and page heading preserve the introduction for screen readers.

Clipboard, text editing, selection, crop, resize, and rotation remain disabled. Fill colors the entire canvas. Drawing history is in memory and resets on reload.

## Implementation

- `src/scenes/PaintScene.tsx`: pinned scene, scroll progress, replay, and motion preferences.
- `src/components/paint/PaintWindow.tsx`: ribbon, keyboard commands, help, and status.
- `src/components/paint/PaintCanvas.tsx`: responsive canvas, cached artwork, drawing history, and PNG export.
- `src/components/paint/intro-artwork.ts`: introduction layout and shared eraser path.
- `src/pages/index.astro`: document metadata and hydrated React island.

The former desktop launch sequence has been removed. Unused desktop components and archived assets remain available for reuse but are not rendered. No wallpaper, taskbar, desktop shortcuts, Three.js, or animation libraries are loaded by this scene.

All artwork is local. Handwritten text uses Comic Sans MS, Chalkboard SE, Segoe Print, or the system cursive fallback. See [ASSET-CREDITS.md](ASSET-CREDITS.md).
