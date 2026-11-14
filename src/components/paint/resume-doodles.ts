type Doodle = "cap" | "laptop" | "browser" | "api" | "chip" | "code";

const screen = [
  [[6, 15], [57, 13], [58, 49], [7, 50], [6, 15]],
  [[7, 23], [57, 21]],
  [[12, 19], [14, 19]], [[19, 19], [21, 19]],
];
const brackets = [
  [[24, 29], [17, 35], [24, 41]],
  [[41, 28], [48, 34], [41, 40]],
  [[35, 27], [30, 43]],
];
const drawings: Record<Doodle, number[][][]> = {
  cap: [
    [[3, 23], [31, 9], [61, 21], [33, 36], [3, 23]],
    [[15, 29], [16, 43], [32, 50], [48, 42], [48, 29]],
    [[59, 23], [60, 45]], [[57, 49], [60, 43], [63, 49]],
    [[13, 58], [33, 56], [48, 58]],
  ],
  laptop: [
    [[11, 12], [54, 14], [52, 44], [12, 44], [11, 12]],
    [[12, 44], [4, 53], [59, 54], [52, 44]],
    [[26, 49], [38, 49]], ...brackets,
  ],
  browser: [
    ...screen,
    [[15, 30], [29, 29], [29, 42], [15, 43], [15, 30]],
    [[36, 29], [49, 29]], [[36, 35], [50, 34]], [[36, 41], [45, 41]],
    [[52, 4], [54, 8]], [[61, 8], [58, 11]],
  ],
  api: [
    [[4, 24], [21, 23], [22, 42], [5, 43], [4, 24]],
    [[42, 7], [59, 8], [58, 24], [42, 24], [42, 7]],
    [[43, 42], [60, 41], [60, 58], [43, 58], [43, 42]],
    [[22, 32], [32, 32], [32, 16], [41, 16]],
    [[32, 32], [33, 49], [42, 49]],
    [[37, 12], [42, 16], [37, 20]], [[38, 45], [43, 49], [38, 53]],
  ],
  chip: [
    [[19, 22], [45, 21], [46, 48], [18, 47], [19, 22]],
    [[26, 29], [38, 29], [38, 40], [26, 40], [26, 29]],
    ...[24, 32, 40].flatMap(x => [[[x, 16], [x, 22]], [[x, 48], [x, 55]]]),
    ...[27, 35, 43].flatMap(y => [[[11, y], [19, y]], [[46, y], [53, y]]]),
    [[23, 10], [32, 6], [42, 10]], [[28, 15], [32, 12], [37, 15]],
  ],
  code: [...screen, ...brackets, [[15, 57], [31, 59], [46, 56]]],
};

// Fixed wobble keeps the scribbles stable when scrolling backwards.
const noise = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};
const scribbles = Object.fromEntries(Object.entries(drawings).map(([kind, paths], drawingIndex) => [
  kind,
  paths.map((path, pathIndex) => {
    const seed = drawingIndex * 1000 + pathIndex * 37;
    const corners = path.map(([x, y], i) => [
      x + (noise(seed + i * 7) - 0.5) * 4.5,
      y + (noise(seed + i * 7 + 1) - 0.5) * 4.5,
    ]);
    const points = [corners[0]];
    for (let i = 1; i < corners.length; i++) {
      const [ax, ay] = corners[i - 1], [bx, by] = corners[i];
      const steps = Math.ceil(Math.hypot(bx - ax, by - ay) / 3);
      for (let step = 1; step <= steps; step++) {
        const t = step / steps;
        points.push([
          ax + (bx - ax) * t + (noise(seed + i * 101 + step) - 0.5) * 1.9,
          ay + (by - ay) * t + (noise(seed + i * 101 + step + 41) - 0.5) * 1.9,
        ]);
      }
    }
    return points;
  }),
])) as Record<Doodle, number[][][]>;

/** Keep the scruffy paths, with smooth brush edges and no pixel snapping. */
export function drawDoodle(ctx: CanvasRenderingContext2D, kind: Doodle, x: number, y: number, size: number, amount: number, color: string) {
  const paths = scribbles[kind];
  let length = 0;
  for (const path of paths) for (let i = 1; i < path.length; i++) {
    length += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
  }
  let remaining = length * Math.max(0, Math.min(1, amount));
  let tip = paths[0][0];
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.045);
  ctx.scale(size / 64, size / 64);
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const [pathIndex, path] of paths.entries()) {
    for (let i = 1; i < path.length && remaining > 0; i++) {
      const [ax, ay] = path[i - 1], [bx, by] = path[i];
      const distance = Math.hypot(bx - ax, by - ay);
      const fraction = Math.min(1, remaining / distance);
      ctx.lineWidth = 1.5 + noise(pathIndex * 83 + i) * 0.8;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      tip = [ax + (bx - ax) * fraction, ay + (by - ay) * fraction];
      ctx.lineTo(tip[0], tip[1]);
      ctx.stroke();
      remaining -= distance;
    }
  }
  ctx.restore();
  const scale = size / 64;
  return {
    x: x + (tip[0] * Math.cos(-0.045) - tip[1] * Math.sin(-0.045)) * scale,
    y: y + (tip[0] * Math.sin(-0.045) + tip[1] * Math.cos(-0.045)) * scale,
  };
}

