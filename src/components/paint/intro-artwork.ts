import type { Point } from "./types";

export const INTRO_TEXT = "Hello :-) I'm Louka Gauthier, full stack developper";

export function drawIntroduction(
  ctx: CanvasRenderingContext2D,
  portrait: HTMLImageElement | null,
  width: number,
  height: number,
) {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);
  const narrow = height > width;
  const x = narrow ? 48 : 62;
  const y = narrow ? 95 : 150;
  const handwriting = '"Comic Sans MS", "Chalkboard SE", "Segoe Print", cursive';
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#161616";
  ctx.font = `32px ${handwriting}`;
  ctx.fillText("Hello :-)", x, y);
  ctx.font = `48px ${handwriting}`;
  ctx.fillText("I'm Louka", x - 2, y + 72);
  ctx.fillText("Gauthier,", x, y + 133);
  ctx.font = `25px ${handwriting}`;
  ctx.fillText("full stack developper", x + 2, y + 185);
  // A deliberately uneven pencil underline, like the supplied drawing.
  ctx.strokeStyle = "#183ed7";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 3, y + 199);
  ctx.lineTo(x + 91, y + 203);
  ctx.lineTo(x + 209, y + 200);
  ctx.lineTo(x + 272, y + 202);
  ctx.stroke();
  if (portrait) {
    if (narrow) ctx.drawImage(portrait, 40, 335, width - 80, width - 80);
    else ctx.drawImage(portrait, 480, 30, 470, 470);
  }
}

/** The cursor and the erased pixels follow the very same distance-based path. */
export function eraseIntroduction(
  ctx: CanvasRenderingContext2D,
  progress: number,
  reducedMotion: boolean,
): { point: Point; size: number } | null {
  const { width, height } = ctx.canvas;
  if (reducedMotion) {
    if (progress >= 0.5) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);
    }
    return null;
  }
  const amount = Math.max(0, Math.min(1, (progress - 0.025) / 0.95));
  if (amount === 0) return null;
  const rows = height > width ? 12 : 9;
  const band = height / rows;
  const points: Point[] = [];
  for (let row = 0; row < rows; row++) {
    const y = (row + 0.5) * band;
    points.push({ x: row % 2 ? width : 0, y });
    points.push({ x: row % 2 ? 0 : width, y });
  }
  let remaining = amount * (rows * width + (rows - 1) * band);
  let point = points[0];
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = band + 4;
  ctx.lineCap = "square";
  ctx.lineJoin = "miter";
  ctx.beginPath();
  ctx.moveTo(point.x, point.y);
  for (let i = 1; i < points.length && remaining > 0; i++) {
    const from = points[i - 1];
    const to = points[i];
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    const fraction = Math.min(1, remaining / length);
    point = { x: from.x + (to.x - from.x) * fraction, y: from.y + (to.y - from.y) * fraction };
    ctx.lineTo(point.x, point.y);
    remaining -= length;
  }
  ctx.stroke();
  return amount < 1 ? { point, size: band + 4 } : null;
}
