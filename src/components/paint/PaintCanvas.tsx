import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { PaintTool, Point, Stroke, CanvasHandle } from "./types";
import { drawIntroduction, eraseIntroduction, INTRO_TEXT } from "./intro-artwork";
import { drawResume, resume } from "./resume-artwork";
import { drawProject, projects, type Project } from "./project-artwork";
import { ToolGlyph } from "./ToolGlyph";
function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  const { points, tool, size, color } = stroke;
  if (!points.length) return;
  ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineWidth = tool === "eraser" ? size * 5 : size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const a = points[0],
    b = points[points.length - 1];
  ctx.beginPath();
  if (tool === "fill") {
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return;
  }
  if (tool === "rectangle") {
    ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
    return;
  }
  if (tool === "ellipse") {
    ctx.ellipse(
      (a.x + b.x) / 2,
      (a.y + b.y) / 2,
      Math.abs(b.x - a.x) / 2,
      Math.abs(b.y - a.y) / 2,
      0,
      0,
      Math.PI * 2,
    );
  } else if (tool === "triangle") {
    ctx.moveTo((a.x + b.x) / 2, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(a.x, b.y);
    ctx.closePath();
  } else if (tool === "diamond") {
    ctx.moveTo((a.x + b.x) / 2, a.y);
    ctx.lineTo(b.x, (a.y + b.y) / 2);
    ctx.lineTo((a.x + b.x) / 2, b.y);
    ctx.lineTo(a.x, (a.y + b.y) / 2);
    ctx.closePath();
  } else if (tool === "star") {
    const cx = (a.x + b.x) / 2,
      cy = (a.y + b.y) / 2,
      rx = Math.abs(a.x - b.x) / 2,
      ry = Math.abs(a.y - b.y) / 2;
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2,
        radius = i % 2 ? 0.45 : 1;
      const x = cx + Math.cos(angle) * rx * radius,
        y = cy + Math.sin(angle) * ry * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else if (tool === "arrow") {
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.moveTo(
      b.x - 15 * Math.cos(angle - 0.5),
      b.y - 15 * Math.sin(angle - 0.5),
    );
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(
      b.x - 15 * Math.cos(angle + 0.5),
      b.y - 15 * Math.sin(angle + 0.5),
    );
  } else {
    ctx.moveTo(a.x, a.y);
    if (tool === "line") ctx.lineTo(b.x, b.y);
    else if (points.length === 1) {
      ctx.arc(a.x, a.y, ctx.lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    } else for (const point of points.slice(1)) ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();
}
export const PaintCanvas = forwardRef<
  CanvasHandle,
  {
    tool: PaintTool;
    color: string;
    size: number;
    zoom: number;
    grid: boolean;
    project: Project | null;
    progress: number;
    reducedMotion: boolean;
    onAnimationTool: (tool: "text" | "pencil" | null) => void;
    onDimensions: (dimensions: { width: number; height: number }) => void;
    onPosition: (p: Point) => void;
    onHistory: (undo: boolean, redo: boolean) => void;
    onPick: (color: string) => void;
  }
>(function PaintCanvas(
  { tool, color, size, zoom, grid, project, progress, reducedMotion, onAnimationTool, onDimensions, onPosition, onHistory, onPick },
  ref,
) {
  const workspace = useRef<HTMLDivElement>(null),
    cursor = useRef<HTMLDivElement>(null),
    buildCursor = useRef<HTMLDivElement>(null),
    textBox = useRef<HTMLDivElement>(null),
    portrait = useRef<HTMLImageElement | null>(null),
    backdrop = useRef<HTMLCanvasElement | null>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    history = useRef<Stroke[]>([]),
    future = useRef<Stroke[]>([]),
    active = useRef<Stroke | null>(null),
    pointer = useRef<number | null>(null);
  const [available, setAvailable] = useState(true);
  const [portraitFailed, setPortraitFailed] = useState(false);
  const [layout, setLayout] = useState({ width: 960, height: 540, scale: 1 });
  const WIDTH = layout.width, HEIGHT = layout.height;
  const scene = useRef({ progress, reducedMotion, project });
  scene.current = { progress, reducedMotion, project };
  const repaint = useCallback(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    if (!backdrop.current || backdrop.current.width !== WIDTH || backdrop.current.height !== HEIGHT) {
      backdrop.current = document.createElement("canvas");
      backdrop.current.width = WIDTH;
      backdrop.current.height = HEIGHT;
      const base = backdrop.current.getContext("2d");
      if (base) drawIntroduction(base, portrait.current, WIDTH, HEIGHT);
    }
    ctx.drawImage(backdrop.current, 0, 0);
    const progress = scene.current.progress;
    const project = scene.current.project;
    const currentPage = project ? 2 + projects.findIndex(item => item.id === project.id) : progress > 1 ? 1 : 0;
    if (project) drawProject(ctx, project);
    const activity = currentPage === 1 ? drawResume(ctx, progress, scene.current.reducedMotion) : undefined;
    const building = activity && !active.current;
    onAnimationTool(building ? activity.tool : null);
    if (buildCursor.current) {
      buildCursor.current.hidden = !building;
      if (building) {
        buildCursor.current.dataset.tool = activity.tool;
        buildCursor.current.style.left = `${activity.point.x / WIDTH * 100}%`;
        buildCursor.current.style.top = `${activity.point.y / HEIGHT * 100}%`;
      }
    }
    if (textBox.current) {
      const box = building && activity.box;
      textBox.current.hidden = !box;
      if (box) {
        textBox.current.dataset.text = activity.text ?? "";
        textBox.current.style.left = `${box.x / WIDTH * 100}%`;
        textBox.current.style.top = `${box.y / HEIGHT * 100}%`;
        textBox.current.style.width = `${box.width * box.amount / WIDTH * 100}%`;
        textBox.current.style.height = `${box.height * box.amount / HEIGHT * 100}%`;
      }
    }
    history.current.filter(s => (s.page ?? 0) === currentPage).forEach(s => drawStroke(ctx, s));
    if (active.current && (active.current.page ?? 0) === currentPage) drawStroke(ctx, active.current);
    const eraseProgress = currentPage === 0 ? progress : 0;
    const eraser = eraseIntroduction(ctx, eraseProgress, scene.current.reducedMotion);
    if (cursor.current) {
      cursor.current.hidden = !eraser;
      if (eraser) {
        cursor.current.style.left = `${eraser.point.x / WIDTH * 100}%`;
        cursor.current.style.top = `${eraser.point.y / HEIGHT * 100}%`;
        cursor.current.style.width = `${eraser.size / WIDTH * 100}%`;
        cursor.current.style.height = `${eraser.size / HEIGHT * 100}%`;
      }
    }
  }, [WIDTH, HEIGHT, onAnimationTool]);
  useEffect(() => {
    const image = new Image();
    let disposed = false;
    image.onload = () => {
      if (disposed) return;
      portrait.current = image;
      backdrop.current = null;
      repaint();
    };
    image.onerror = () => { if (!disposed) setPortraitFailed(true); };
    image.src = "/assets/louka-paint-portrait.jpg";
    return () => { disposed = true; };
  }, [repaint]);
  useEffect(() => {
    if (!workspace.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const narrow = width < 620;
      const dimensions = narrow ? { width: 520, height: 850 } : { width: 960, height: 540 };
      const scale = Math.max(0.1, Math.min(width / dimensions.width, height / dimensions.height));
      setLayout({ ...dimensions, scale });
      onDimensions(dimensions);
    });
    observer.observe(workspace.current);
    return () => observer.disconnect();
  }, [onDimensions]);
  useEffect(() => { repaint(); }, [progress, reducedMotion, project, repaint]);
  const notify = () =>
    onHistory(history.current.length > 0, future.current.length > 0);
  useEffect(() => {
    if (!canvas.current?.getContext("2d")) setAvailable(false);
    repaint();
  }, [repaint]);
  useImperativeHandle(ref, () => ({
    undo: () => {
      const last = history.current.pop();
      if (last) future.current.push(last);
      repaint();
      notify();
    },
    redo: () => {
      const next = future.current.pop();
      if (next) history.current.push(next);
      repaint();
      notify();
    },
    clear: () => {
      history.current.push({
        page: scene.current.project ? 2 + projects.findIndex(item => item.id === scene.current.project!.id) : scene.current.progress > 1 ? 1 : 0,
        tool: "fill",
        color: "#fff",
        size: 1,
        points: [{ x: 0, y: 0 }],
      });
      future.current = [];
      repaint();
      notify();
    },
    save: () => {
      canvas.current?.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob),
          a = document.createElement("a");
        a.href = url;
        a.download = scene.current.project?.file ?? "Louka-Gauthier-Paint.png";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }, "image/png");
    },
  }));
  const position = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: Math.max(
        0,
        Math.min(WIDTH, ((e.clientX - rect.left) * WIDTH) / rect.width),
      ),
      y: Math.max(
        0,
        Math.min(HEIGHT, ((e.clientY - rect.top) * HEIGHT) / rect.height),
      ),
    };
  };
  const finish = (cancel = false) => {
    if (!active.current) return;
    if (!cancel) {
      history.current.push(active.current);
      future.current = [];
    }
    active.current = null;
    pointer.current = null;
    repaint();
    notify();
  };
  return (
    <div className="canvas-workspace" ref={workspace}>
      <div className="sr-only">
        {resume.map(section => (
          <section key={section.title} aria-label={section.title}>
            <h2>{section.title}</h2>
            {section.entries.map(entry => (
              <article key={entry.title}>
                <p>{entry.date} · {entry.kind}</p>
                <h3>{entry.title}</h3><p>{entry.place}</p>
                <ul>{entry.details.map(detail => <li key={detail}>{detail}</li>)}</ul>
              </article>
            ))}
          </section>
        ))}
      </div>
      <div
        className={`canvas-sheet ${grid ? "grid-visible" : ""}`}
        style={{ width: (WIDTH * layout.scale * zoom) / 100, height: (HEIGHT * layout.scale * zoom) / 100 }}
      >
        <canvas
          ref={canvas}
          width={WIDTH}
          height={HEIGHT}
          aria-label={project ? `${project.name}. ${project.description} ${project.details}` : `${INTRO_TEXT}. Paint-style portrait. Scroll down, or swipe up on mobile, to explore. Draw with your mouse or pen.`}
          style={{ cursor: tool === "picker" ? "copy" : "crosshair" }}
          onPointerDown={(e) => {
            if (e.pointerType === "touch" || e.button !== 0 || pointer.current !== null) return;
            const p = position(e);
            if (tool === "picker") {
              const pixel = canvas.current
                ?.getContext("2d")
                ?.getImageData(
                  Math.min(WIDTH - 1, Math.floor(p.x)),
                  Math.min(HEIGHT - 1, Math.floor(p.y)),
                  1,
                  1,
                ).data;
              if (pixel)
                onPick(
                  "#" +
                    [...pixel]
                      .slice(0, 3)
                      .map((v) => v.toString(16).padStart(2, "0"))
                      .join(""),
                );
              return;
            }
            e.currentTarget.setPointerCapture(e.pointerId);
            pointer.current = e.pointerId;
            active.current = { tool, color, size, points: [p], page: scene.current.project ? 2 + projects.findIndex(item => item.id === scene.current.project!.id) : scene.current.progress > 1 ? 1 : 0 };
            repaint();
          }}
          onPointerMove={(e) => {
            const p = position(e);
            onPosition(p);
            if (!active.current || pointer.current !== e.pointerId) return;
            active.current.points.push(p);
            repaint();
          }}
          onPointerUp={(e) => {
            if (pointer.current === e.pointerId) finish();
          }}
          onPointerCancel={() => finish(true)}
          onLostPointerCapture={() => finish()}
        />
        {project && <a className="project-link" href={project.url} target="_blank" rel="noopener noreferrer">{project.linkLabel} ↗<span className="sr-only">: {project.name} (opens in a new tab)</span></a>}
        <div ref={textBox} className="paint-text-box" aria-hidden="true" hidden>
          <i /><i /><i /><i /><i /><i /><i /><i />
        </div>
        <div ref={buildCursor} className="paint-build-cursor" aria-hidden="true" hidden>
          <span className="build-pencil"><ToolGlyph name="pencil" size={28} /></span>
          <span className="build-text-caret" />
        </div>
        <div ref={cursor} className="eraser-cursor" aria-hidden="true" hidden />
        <span className="canvas-handle handle-right" />
        <span className="canvas-handle handle-bottom" />
        <span className="canvas-handle handle-corner" />
        {!available && (
          <p className="canvas-error">
            Your browser doesn’t support the drawing canvas.
          </p>
        )}
        {portraitFailed && <p className="canvas-error">The portrait could not load. Refresh to try again.</p>}
      </div>
    </div>
  );
});
