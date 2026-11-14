import { useEffect, useRef, useState } from "react";
import { Icon } from "../desktop/Icon";
import { PaintRibbon } from "./PaintRibbon";
import { PaintCanvas } from "./PaintCanvas";
import { Clippy } from "./Clippy";
import { ProjectPicker } from "./ProjectPicker";
import type { BuildTool } from "./paint-build";
import { type Project } from "./project-artwork";
import { ToolGlyph } from "./ToolGlyph";
import type { CanvasHandle, PaintTool, Point } from "./types";
interface Props {
  progress: number;
  reducedMotion: boolean;
  onReplay: () => void;
  onTimeline: () => void;
  onProjects: () => void;
  onContact: () => void;
}
export function PaintWindow({ progress, reducedMotion, onReplay, onTimeline, onProjects, onContact }: Props) {
  const [tool, setTool] = useState<PaintTool>("brush"),
    [color, setColor] = useState("#000000"),
    [size, setSize] = useState(3),
    [zoom, setZoom] = useState(100),
    [grid, setGrid] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerDismissed, setPickerDismissed] = useState(false);
  const currentProject = progress >= 3.35 && progress < 4.45 ? project : null;
  const contactSection = progress >= 4.45;
  useEffect(() => { setColor(contactSection ? "#fff" : "#000"); }, [contactSection]);
  useEffect(() => {
    if (progress < 3.35) { setPickerDismissed(false); return; }
    if (progress >= 3.5 && progress < 4 && !project && !pickerDismissed) setPickerOpen(true);
  }, [progress, project, pickerDismissed]);
  const [recentOpen, setRecentOpen] = useState(false);
  const [animationTool, setAnimationTool] = useState<BuildTool | null>(null);
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
        (e.target as HTMLElement).matches("input,select,textarea") || (e.target as HTMLElement).closest("dialog[open]")
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
          <a
            href="/cv.pdf"
            download="Louka-Gauthier-CV.pdf"
            title="Download CV (PDF)"
            aria-label="Download CV (PDF)"
          >
            <ToolGlyph name="save" size={15} />
          </a>
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
        <span className="paint-title">{contactSection ? "Contact - Paint" : currentProject ? `${currentProject.file} - Paint` : "Louka Gauthier - Paint"}</span>
        {progress >= 3.3 && <button className="replay-intro" onClick={() => setPickerOpen(true)}>Projects…</button>}
      </header>
      <div className="paint-inner">
        <nav className="paint-tabs" aria-label="Paint ribbon">
          <div className="file-tab-container" ref={menuRef}>
            <button
              className={`file-tab ${fileOpen ? "is-open" : ""}`}
              aria-label="File"
              aria-expanded={fileOpen}
              onClick={() => { setFileOpen(!fileOpen); setRecentOpen(false); }}
            >
              <span className="file-mini">▤</span>
              <span>▾</span>
            </button>
            {fileOpen && (
              <div className="file-menu">
                <button onClick={() => window.location.reload()}>
                  <span className="blank-page" />
                  <span>
                    New<small>Reload the page</small>
                  </span>
                </button>
                <button onClick={() => { setPickerOpen(true); setFileOpen(false); }}>
                  <Icon name="folder" size={25} /><span>Open<small>Choose a project image</small></span>
                </button>
                <div className="recent-files"
                  onMouseEnter={() => setRecentOpen(true)}
                  onMouseLeave={() => setRecentOpen(false)}
                  onFocusCapture={() => setRecentOpen(true)}
                  onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setRecentOpen(false); }}>
                  <button aria-expanded={recentOpen} aria-controls="recent-images-list" onClick={() => setRecentOpen(true)}>
                    <Icon name="folder" size={25} />
                    <span>Recent images</span><span className="submenu-arrow" aria-hidden="true">▸</span>
                  </button>
                  {recentOpen && (
                    <div id="recent-images-list" className="recent-submenu" role="group" aria-label="Recent images shortcuts">
                      <button onClick={() => { onReplay(); setFileOpen(false); setRecentOpen(false); }}>
                        <Icon name="paint" size={25} /><span>Introduction</span>
                      </button>
                      <button onClick={() => { onTimeline(); setFileOpen(false); setRecentOpen(false); }}>
                        <Icon name="document" size={25} /><span>Education &amp; Experience</span>
                      </button>
                      <button onClick={() => { setPickerOpen(true); setFileOpen(false); setRecentOpen(false); }}>
                        <Icon name="folder" size={25} /><span>Projects</span>
                      </button>
                      <button onClick={() => { onContact(); setFileOpen(false); setRecentOpen(false); }}>
                        <Icon name="document" size={25} /><span>Contact</span>
                      </button>
                    </div>
                  )}
                </div>
                <hr />
                <a href="/cv.pdf" download="Louka-Gauthier-CV.pdf" onClick={() => setFileOpen(false)}>
                  <ToolGlyph name="save" size={25} />
                  <span>Save as<small>CV · PDF document</small></span>
                </a>
                <hr />
                <a href="https://github.com/LoukaG/loukag.com" target="_blank" rel="noopener noreferrer" onClick={() => setFileOpen(false)}>
                  <Icon name="paint" size={25} />
                  <span>About Paint<small>View website source on GitHub</small></span>
                </a>
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
          tool={erasing ? "eraser" : animationTool ?? tool}
          color={animationTool === "fill" ? "#000" : contactSection && animationTool ? "#fff" : color}
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
          project={currentProject}
          onChooseProject={() => setPickerOpen(true)}
          onAnimationTool={setAnimationTool}
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
          <span className="paint-scroll-hint" role="status">{progress >= 6.25 ? "Thanks for visiting · scroll up to explore ↑" : contactSection ? "Contact · typing…" : progress >= 4 ? "Filling the canvas…" : currentProject ? "Scroll down to get in touch ↓" : progress >= 3.5 ? "Choose Projects to explore my work" : progress >= 3.1 ? "Scroll up to revisit ↑ · projects below ↓" : progress > 1 ? "Education & experience · follow the timeline ↓" : erasing ? "Erasing… scroll back to restore ↑" : "Scroll to explore ↓"}</span>
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
      <Clippy progress={progress} blocked={pickerOpen || helpOpen || fileOpen} />
      {pickerOpen && <ProjectPicker onClose={() => { setPickerOpen(false); setPickerDismissed(true); }} onOpen={selected => {
        setProject(selected); setPickerOpen(false); setPickerDismissed(true); onProjects();
      }} />}
      <dialog ref={helpDialog} className="paint-help-dialog" onClose={() => { setHelpOpen(false); helpButton.current?.focus({ preventScroll: true }); }}>
        <h2>A little introduction in Paint.</h2>
        <p>Scroll down to erase the introduction and follow my education, internships and professional work on a timeline. Scroll back up or choose File → Recent images → Introduction to start again.</p>
        <p>Draw with a mouse or pen, choose a color, and press Ctrl/Cmd + S to save your canvas as a PNG. On a phone, swipe to scroll.</p>
        <p>Ctrl/Cmd + Z to undo · Ctrl/Cmd + S to save.</p>
        <button autoFocus onClick={() => setHelpOpen(false)}>Back to Paint</button>
      </dialog>
    </section>
  );
}
