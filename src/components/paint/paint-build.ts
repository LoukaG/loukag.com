import { drawDoodle } from "./resume-doodles";
import type { Point } from "./types";

export type BuildTool = "text" | "pencil" | "fill";
export interface BuildActivity {
  tool: BuildTool;
  point: Point;
  box?: { x: number; y: number; width: number; height: number; amount: number };
  text?: string;
}
export interface BuildLine { text: string; x: number; y: number; size: number; color: string }
export type PaintBuildAction =
  | { kind: "text"; line: BuildLine; duration: number; start: Point }
  | { kind: "path"; points: Point[]; color: string; duration: number; start: Point }
  | { kind: "doodle"; doodle: Parameters<typeof drawDoodle>[1]; x: number; y: number; size: number; color: string; duration: number; start: Point };

/** Shared, reversible Paint tool choreography for timeline and contact pages. */
export function drawPaintBuild(ctx: CanvasRenderingContext2D, actions: PaintBuildAction[], reveal: number, reducedMotion: boolean, options: { background?: string; maxCamera?: number; start?: Point } = {}) {
  const { width, height } = ctx.canvas;
  const handwriting = '"Comic Sans MS", "Chalkboard SE", "Segoe Print", cursive';
  const total = actions.reduce((sum, action) => sum + action.duration, 0);
  let remaining = reducedMotion ? total : reveal * total;
  let activity: BuildActivity | undefined;
  let tip: Point = options.start ?? actions[0].start;
  let furthestY = tip.y;
  const maxCamera = options.maxCamera ?? 0;
  // Find the camera position before rendering; completed tool actions stay in place.
  let clock = remaining;
  for (const action of actions) {
    if (clock <= 0) break;
    const targetY = action.kind === "text" ? action.line.y + action.line.size : action.start.y;
    furthestY = Math.max(furthestY, Math.min(1, clock / action.duration) * (targetY - furthestY) + furthestY);
    clock -= action.duration;
  }
  const camera = reducedMotion
    ? Math.min(maxCamera, Math.floor(reveal * Math.ceil(maxCamera / (height * 0.7))) * height * 0.7)
    : Math.min(maxCamera, Math.max(0, furthestY - height * 0.72));
  ctx.fillStyle = options.background ?? "#fff";
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  ctx.translate(0, -camera);
  ctx.textBaseline = "alphabetic";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const action of actions) {
    if (remaining <= 0) break;
    const amount = Math.min(1, remaining / action.duration);
    const drawing = Math.max(0, (amount - 0.12) / 0.88);
    const tool = action.kind === "text" ? "text" : "pencil";
    let box: BuildActivity["box"];
    let typed: string | undefined;
    if (amount < 0.12) {
      const travel = amount / 0.12;
      tip = { x: tip.x + (action.start.x - tip.x) * travel, y: tip.y + (action.start.y - tip.y) * travel };
    } else if (action.kind === "text") {
      const line = action.line;
      ctx.font = `${line.size}px ${handwriting}`;
      const boxWidth = Math.min(width - line.x - 10, ctx.measureText(line.text).width + 16);
      const selection = Math.min(1, drawing / 0.2);
      const count = Math.floor(line.text.length * Math.max(0, (drawing - 0.2) / 0.8));
      typed = line.text.slice(0, count);
      ctx.fillStyle = line.color;
      ctx.fillText(typed, line.x, line.y);
      tip = selection < 1
        ? { x: line.x - 5 + boxWidth * selection, y: line.y - line.size + line.size * 1.45 * selection }
        : { x: line.x + ctx.measureText(typed).width + 1, y: line.y - line.size * 0.45 };
      if (amount < 1) box = { x: line.x - 5, y: line.y - line.size - camera, width: boxWidth, height: line.size * 1.45, amount: selection };
    } else if (action.kind === "doodle") {
      tip = drawDoodle(ctx, action.doodle, action.x, action.y, action.size, drawing, action.color);
    } else {
      const points = action.points;
      const lengths = points.slice(1).map((point, index) => Math.hypot(point.x - points[index].x, point.y - points[index].y));
      let distance = lengths.reduce((sum, length) => sum + length, 0) * drawing;
      ctx.strokeStyle = action.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      tip = points[0];
      ctx.moveTo(tip.x, tip.y);
      for (let i = 1; i < points.length && distance > 0; i++) {
        const from = points[i - 1], to = points[i];
        const fraction = Math.min(1, distance / lengths[i - 1]);
        tip = { x: from.x + (to.x - from.x) * fraction, y: from.y + (to.y - from.y) * fraction };
        ctx.lineTo(tip.x, tip.y);
        distance -= lengths[i - 1];
      }
      ctx.stroke();
    }
    if (amount < 1) activity = { tool, point: { x: tip.x, y: tip.y - camera }, box, text: typed };
    remaining -= action.duration;
  }
  ctx.restore();
  return reducedMotion ? undefined : activity;
}
