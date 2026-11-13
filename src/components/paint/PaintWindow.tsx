import { useEffect, useRef, useState } from "react";
import { Icon } from "../desktop/Icon";
import { PaintRibbon } from "./PaintRibbon";
import { PaintCanvas } from "./PaintCanvas";
import { ToolGlyph } from "./ToolGlyph";
import type { CanvasHandle, PaintTool, Point } from "./types";
interface Props {
  progress: number;
  reducedMotion: boolean;
  onReplay: () => void;
}
export function PaintWindow({ progress, reducedMotion, onReplay }: Props) {
  const [tool, setTool] = useState<PaintTool>("brush"),
    [color, setColor] = useState("#000000"),
    [size, setSize] = useState(3),
    [zoom, setZoom] = useState(100),
    [grid, setGrid] = useState(false);
  const [tab, setTab] = useState<"home" | "view">("home"),
    [fileOpen, setFileOpen] = useState(false),
    [helpOpen, setHelpOpen] = useState(false),
    [dimensions, setDimensions] = useState({ width: 960, height: 540 }),
    [position, setPosition] = useState<Point>({ x: 0, y: 0 }),
    [history, setHistory] = useState({ undo: false, redo: false });
  const canvas = useRef<CanvasHandle>(null),
    windowRef = useRef<HTMLElement>(null),
    menuRef = useRef<HTMLDivElement>(null),
    helpButton = useRef<HTMLButtonElement>(null),
    helpDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (helpOpen) helpDialog.current?.showModal();
    else helpDialog.current?.close();
  }, [helpOpen]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).matches("input,select,textarea")
      )
        return;
      if (e.ctrlKey || e.metaKey) {
        if (["z", "y", "s"].includes(e.key.toLowerCase())) {
          e.preventDefault();
          if (e.key.toLowerCase() === "s") canvas.current?.save();
          else if (e.key.toLowerCase() === "y" || e.shiftKey)
            canvas.current?.redo();
          else canvas.current?.undo();
        }
      }
      if (e.key === "Escape") { setFileOpen(false); setHelpOpen(false); }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (!fileOpen) return;
    const close = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setFileOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [fileOpen]);
  const erasing = progress > 0.025 && progress < 0.975;
  return (
    <section ref={windowRef} tabIndex={-1} role="region" aria-label="Microsoft Paint"
      className="paint-window aero-window paint-only-window">
      <header className="title-bar paint-titlebar">
        <Icon name="paint" size={17} />
        <div className="quick-access">
          <button
            title="Save (Ctrl+S)"
            aria-label="Save image"
            onClick={() => canvas.current?.save()}
          >
            <ToolGlyph name="save" size={15} />
          </button>
          <button
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            disabled={!history.undo}
            onClick={() => canvas.current?.undo()}
          >
            <ToolGlyph name="undo" size={16} />
          </button>
          <button
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
            disabled={!history.redo}
            onClick={() => canvas.current?.redo()}
          >
            <ToolGlyph name="redo" size={16} />
          </button>
          <span>▾</span>
        </div>
        <span className="paint-title">Louka Gauthier - Paint</span>
        <button className="replay-intro" onClick={onReplay} title="Restore the introduction">↶ Replay introduction</button>
      </header>
      <div className="paint-inner">
        <nav className="paint-tabs" aria-label="Paint ribbon">
          <div className="file-tab-container" ref={menuRef}>
            <button
              className={`file-tab ${fileOpen ? "is-open" : ""}`}
              aria-label="File"
              aria-expanded={fileOpen}
              onClick={() => setFileOpen(!fileOpen)}
            >
              <span className="file-mini">▤</span>
              <span>▾</span>
            </button>
            {fileOpen && (
              <div className="file-menu">
                <button
                  onClick={() => {
                    canvas.current?.clear();
                    setFileOpen(false);
                  }}
                >
                  <span className="blank-page" />
                  <span>
                    New<small>Start a blank canvas</small>
                  </span>
                </button>
                <button
                  onClick={() => {
                    canvas.current?.save();
                    setFileOpen(false);
                  }}
                >
                  <ToolGlyph name="save" size={25} />
                  <span>
                    Save as<small>PNG picture</small>
                  </span>
                </button>
                <hr />
                <button onClick={() => { onReplay(); setFileOpen(false); }}>
                  <Icon name="paint" size={25} />
                  <span>Replay introduction</span>
                </button>
              </div>
            )}
          </div>
          <button
            className={tab === "home" ? "active-tab" : ""}
            onClick={() => setTab("home")}
            aria-pressed={tab === "home"}
          >
            Home
          </button>
          <button
            className={tab === "view" ? "active-tab" : ""}
            onClick={() => setTab("view")}
            aria-pressed={tab === "view"}
          >
            View
          </button>
          <button
            className="paint-help"
            aria-label="Paint help"
            ref={helpButton}
            onClick={() => setHelpOpen(true)}
          >
            ?
          </button>
        </nav>
        <PaintRibbon
          tab={tab}
          tool={erasing ? "eraser" : tool}
          color={color}
          size={size}
          zoom={zoom}
          grid={grid}
          onTool={setTool}
          onColor={setColor}
          onSize={setSize}
          onZoom={setZoom}
          onGrid={setGrid}
          onClear={() => canvas.current?.clear()}
        />
        <PaintCanvas
          ref={canvas}
          progress={progress}
          reducedMotion={reducedMotion}
          onDimensions={setDimensions}
          tool={tool}
          color={color}
          size={size}
          zoom={zoom}
          grid={grid}
          onPosition={setPosition}
          onHistory={(undo, redo) => setHistory({ undo, redo })}
          onPick={(c) => {
            setColor(c);
            setTool("brush");
          }}
        />
        <div className="paint-status">
          <span className="cursor-position">
            <span className="crosshair-mini">✛</span>
            {Math.round(position.x)}, {Math.round(position.y)} px
          </span>
          <span className="canvas-dimensions">
            <ToolGlyph name="resize" size={15} />
            {dimensions.width} × {dimensions.height} px
          </span>
          <span className="status-fill" />
          <span className="paint-scroll-hint" role="status">{progress >= 0.975 ? "A fresh canvas. Scroll up to start again ↑" : erasing ? "Erasing… scroll back to restore ↑" : "Scroll to erase ↓"}</span>
          <span>{zoom}%</span>
          <button
            aria-label="Zoom out"
            onClick={() => setZoom((v) => Math.max(25, v - 25))}
          >
            −
          </button>
          <input
            aria-label="Canvas zoom"
            type="range"
            min="25"
            max="200"
            step="25"
            value={zoom}
            onChange={(e) => setZoom(+e.target.value)}
          />
          <button
            aria-label="Zoom in"
            onClick={() => setZoom((v) => Math.min(200, v + 25))}
          >
            +
          </button>
          <span className="resize-grip">◢</span>
        </div>
      </div>
      <dialog ref={helpDialog} className="paint-help-dialog" onClose={() => { setHelpOpen(false); helpButton.current?.focus({ preventScroll: true }); }}>
        <h2>A little introduction in Paint.</h2>
        <p>Scroll down to erase the introduction. Scroll back up or choose Replay introduction to restore it.</p>
        <p>Draw with a mouse or pen, choose a color, and save your canvas as a PNG. On a phone, swipe to scroll.</p>
        <p>Ctrl/Cmd + Z to undo · Ctrl/Cmd + S to save.</p>
        <button autoFocus onClick={() => setHelpOpen(false)}>Back to Paint</button>
      </dialog>
    </section>
  );
}
