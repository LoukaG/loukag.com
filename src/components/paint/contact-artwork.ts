import { drawPaintBuild, type BuildActivity, type BuildLine, type PaintBuildAction } from "./paint-build";
import type { Point } from "./types";

export const contacts = [
  { label: "Email", value: "loukagauthier55@gmail.com", href: "mailto:loukagauthier55@gmail.com" },
  { label: "LinkedIn", value: "in/loukagauthier", href: "https://www.linkedin.com/in/loukagauthier" },
  { label: "GitHub", value: "github.com/LoukaG", href: "https://github.com/LoukaG" },
];

export function contactLayout(width: number, height: number) {
  const narrow = height > width;
  const x = narrow ? 48 : 85;
  const actions: PaintBuildAction[] = [];
  const text = (line: BuildLine) => actions.push({ kind: "text", line, duration: 10 + line.text.length, start: { x: line.x - 5, y: line.y - line.size } });
  const path = (points: Point[]) => actions.push({ kind: "path", points, color: "#9bb2ff", duration: 18, start: points[0] });
  text({ text: "Let’s talk.", x, y: 95, size: 44, color: "#fff" });
  path([{ x, y: 113 }, { x: x + 95, y: 116 }, { x: x + 210, y: 112 }]);
  text({ text: "Louka Gauthier", x, y: 165, size: 27, color: "#fff" });
  text({ text: "Sherbrooke, Québec", x, y: 199, size: 20, color: "#b8c5dc" });
  const ends: number[] = [];
  const links = contacts.map((contact, index) => {
    const column = narrow ? 0 : index % 2;
    const row = narrow ? index : Math.floor(index / 2);
    const left = x + column * 440;
    const top = (narrow ? 278 : 275) + row * (narrow ? 108 : 125);
    text({ text: contact.label, x: left, y: top, size: 18, color: "#9bb2ff" });
    text({ text: contact.value, x: left, y: top + 35, size: narrow ? 23 : 22, color: "#fff" });
    path([{ x: left, y: top + 43 }, { x: left + 85, y: top + 44 }, { x: left + 145, y: top + 42 }]);
    ends.push(actions.reduce((sum, action) => sum + action.duration, 0));
    return { ...contact, x: left, y: top + 10, width: narrow ? width - left - 30 : 400, height: 36, readyAt: 0 };
  });
  const total = actions.reduce((sum, action) => sum + action.duration, 0);
  links.forEach((link, index) => { link.readyAt = 4.45 + ends[index] / total * 1.8; });
  return { actions, links };
}

/** A bucket click sends black paint out from the pour point across the canvas. */
export function drawBucketFill(ctx: CanvasRenderingContext2D, progress: number, reducedMotion: boolean): BuildActivity | undefined {
  const { width, height } = ctx.canvas;
  const amount = Math.max(0, Math.min(1, (progress - 4) / 0.45));
  const target = { x: width * 0.78, y: height * 0.74 };
  const travel = Math.min(1, amount / 0.25);
  const point = { x: width * 0.95 + (target.x - width * 0.95) * travel, y: height * 0.15 + (target.y - height * 0.15) * travel };
  const spread = Math.max(0, (amount - 0.25) / 0.75);
  ctx.save();
  ctx.fillStyle = "#000";
  if (amount >= 1 || (reducedMotion && amount >= 0.5)) ctx.fillRect(0, 0, width, height);
  else if (spread > 0 && !reducedMotion) {
    const radius = Math.hypot(width, height) * 1.2 * spread;
    ctx.beginPath();
    for (let step = 0; step <= 100; step++) {
      const angle = step / 100 * Math.PI * 2;
      const uneven = radius * (1 + Math.sin(angle * 9) * 0.025);
      const x = target.x + Math.cos(angle) * uneven;
      const y = target.y + Math.sin(angle) * uneven;
      if (step === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  return !reducedMotion && amount < 1 ? { tool: "fill", point } : undefined;
}

export function drawContact(ctx: CanvasRenderingContext2D, progress: number, reducedMotion: boolean) {
  const { actions } = contactLayout(ctx.canvas.width, ctx.canvas.height);
  const reveal = Math.max(0, Math.min(1, (progress - 4.45) / 1.8));
  return drawPaintBuild(ctx, actions, reveal, reducedMotion, { background: "#000" });
}
