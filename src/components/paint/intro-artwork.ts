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
  ctx.save();
  ctx.strokeStyle = "#183ed7";
  ctx.fillStyle = "#183ed7";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.font = `22px ${handwriting}`;
  ctx.beginPath();
  if (narrow) {
    ctx.fillText("Swipe up", 215, height - 33);
    ctx.moveTo(189, height - 22);
    ctx.lineTo(191, height - 43);
    ctx.lineTo(190, height - 56);
    ctx.moveTo(181, height - 46);
    ctx.lineTo(190, height - 56);
    ctx.lineTo(199, height - 45);
  } else {
    // A quick mouse sketch and a crooked downward arrow.
    ctx.moveTo(72, 453);
    ctx.bezierCurveTo(57, 452, 59, 414, 73, 415);
    ctx.bezierCurveTo(89, 413, 89, 455, 72, 453);
    ctx.moveTo(73, 422);
    ctx.lineTo(73, 432);
    ctx.fillText("Scroll down", 108, 441);
    ctx.moveTo(255, 421);
    ctx.lineTo(257, 438);
    ctx.lineTo(255, 452);
    ctx.moveTo(247, 443);
    ctx.lineTo(255, 452);
    ctx.lineTo(265, 442);
  }
  ctx.stroke();
  ctx.restore();
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
  const size = Math.min(width, height) / 7;
  const columns = Math.ceil(width / (size * 0.8));
  const rows = Math.ceil(height / (size * 0.8));
  // Fixed noise keeps the messy route identical when scrolling backwards.
  const noise = (seed: number) => {
    const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  const patches: Point[] = [];
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const seed = row * columns + column;
      patches.push({
        x: (column + 0.5 + (noise(seed) - 0.5) * 0.85) * width / columns,
        y: (row + 0.5 + (noise(seed + 1000) - 0.5) * 0.85) * height / rows,
      });
    }
  }
  const points: Point[] = [{ x: width / 2, y: height / 2 }];
  let distance = 0;
  while (patches.length) {
    const from = points[points.length - 1];
    let next = 0;
    let nearest = Infinity;
    for (let i = 0; i < patches.length; i++) {
      const patch = patches[i];
      const score = Math.hypot(patch.x - from.x, patch.y - from.y)
        * (0.45 + noise(i + points.length * 13) * 1.3);
      if (score < nearest) {
        nearest = score;
        next = i;
      }
    }
    const [to] = patches.splice(next, 1);
    distance += Math.hypot(to.x - from.x, to.y - from.y);
    points.push(to);
  }
  let remaining = amount * distance;
  let point = points[0];
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = size;
  ctx.lineCap = "square";
  ctx.lineJoin = "round";
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
  return amount < 1 ? { point, size } : null;
}
