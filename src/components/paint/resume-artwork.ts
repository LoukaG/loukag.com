import { drawDoodle } from "./resume-doodles";
import type { Point } from "./types";

export interface BuildActivity {
  tool: "text" | "pencil";
  point: Point;
  box?: { x: number; y: number; width: number; height: number; amount: number };
  text?: string;
}

const categoryColors = {
  Education: "#183ed7",
  Internship: "#8335b1",
  "Professional work": "#167340",
};

const timeline = [
  { date: "2019–2022", kind: "Education", doodle: "laptop", title: "Diploma of College Studies in Computer Science", place: "Cégep de Trois-Rivières", details: ["Computer Science Technology program"] },
  { date: "2021", kind: "Internship", doodle: "code", title: "Full Stack Developer Intern", place: "Proaxion, Trois-Rivières", details: ["Built a management website with Laravel.", "Worked with managers to understand and implement their needs."] },
  { date: "2021–2023", kind: "Professional work", doodle: "chip", title: "Computer Programmer", place: "C2T3, Trois-Rivières", details: ["Developed an ASP.NET Core web application.", "Developed connected devices (IoT)."] },
  { date: "2022–2023", kind: "Professional work", doodle: "api", title: "Programmer Analyst · Contract", place: "Casa Das Tias, Nicolet", details: ["Designed a .NET web application using agile development.", "Built APIs."] },
  { date: "2023–2026", kind: "Education", doodle: "cap", title: "Bachelor’s in Computer Science", place: "Université de Sherbrooke", details: ["Co-operative education program"] },
  { date: "2024", kind: "Internship", doodle: "browser", title: "Web Developer Intern", place: "MesAieux", details: ["Added features to an existing VB.NET website.", "Managed authentication and created stored procedures."] },
] as const;

export const resume = [{ title: "Education & Experience", entries: timeline }];

/** One continuous timeline: write forward, pan down, and retrace on reverse scroll. */
export function drawResume(ctx: CanvasRenderingContext2D, progress: number, reducedMotion: boolean) {
  const { width, height } = ctx.canvas;
  const reveal = Math.max(0, Math.min(1, (progress - 1) / 2.1));
  if (!reveal) return;
  const narrow = height > width;
  const rail = narrow ? 34 : 80;
  const margin = narrow ? 70 : 125;
  const handwriting = '"Comic Sans MS", "Chalkboard SE", "Segoe Print", cursive';
  const lines: { text: string; x: number; y: number; size: number; color: string }[] = [];
  const nodes: { y: number; line: number; internship: boolean; color: string; doodle: typeof timeline[number]["doodle"] }[] = [];
  let y = 68;
  let x = margin;
  const wrap = (text: string, size: number, color: string, space = 0) => {
    ctx.font = `${size}px ${handwriting}`;
    let line = "";
    for (const word of text.split(" ")) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > width - x - (narrow ? 30 : 58) - space) {
        lines.push({ text: line, x, y, size, color });
        y += size * 1.4;
        line = word;
      } else line = next;
    }
    lines.push({ text: line, x, y, size, color });
    y += size * 1.4;
  };
  wrap("Education & Experience", narrow ? 28 : 34, "#183ed7");
  y += 28;
  for (const entry of timeline) {
    const internship = entry.kind === "Internship";
    const color = categoryColors[entry.kind];
    x = margin + (internship ? 22 : 0);
    nodes.push({ y: y - 5, line: lines.length, internship, color, doodle: entry.doodle });
    wrap(`${entry.date} · ${entry.kind}`, narrow ? 17 : 16, color, narrow ? 45 : 100);
    wrap(entry.title, narrow ? 22 : 24, "#161616", narrow ? 45 : 100);
    wrap(entry.place, narrow ? 19 : 18, color);
    for (const detail of entry.details) wrap(detail, narrow ? 18 : 17, "#343434");
    y += internship ? 42 : 30;
  }
  type Line = typeof lines[number];
  type Node = typeof nodes[number];
  type Action =
    | { kind: "text"; line: Line; duration: number; start: Point }
    | { kind: "path"; points: Point[]; color: string; duration: number; start: Point }
    | { kind: "doodle"; node: Node; duration: number; start: Point };
  const actions: Action[] = [];
  const text = (line: Line) => actions.push({ kind: "text", line, duration: 10 + line.text.length, start: { x: line.x - 5, y: line.y - line.size } });
  const path = (points: Point[], color: string) => {
    const distance = points.slice(1).reduce((total, point, index) => total + Math.hypot(point.x - points[index].x, point.y - points[index].y), 0);
    actions.push({ kind: "path", points, color, duration: 8 + distance / 5, start: points[0] });
  };
  lines.slice(0, nodes[0].line).forEach(text);
  nodes.forEach((node, index) => {
    const previousY = index ? nodes[index - 1].y : node.y - 30;
    const points: Point[] = [{ x: rail, y: previousY }];
    for (let py = previousY + 3; py < node.y; py += 3) points.push({ x: rail + Math.sin(py * 0.07) * 1.1, y: py });
    points.push({ x: rail, y: node.y });
    path(points, "#777777");
    const nx = node.internship ? rail + 22 : rail;
    if (node.internship) path([{ x: rail, y: node.y - 18 }, { x: rail + 2, y: node.y - 2 }, { x: nx, y: node.y }], node.color);
    const circle = Array.from({ length: 33 }, (_, step) => {
      const angle = step / 32 * Math.PI * 2;
      return { x: nx + Math.cos(angle) * (node.internship ? 4 : 7), y: node.y + Math.sin(angle) * (node.internship ? 5 : 6) };
    });
    path(circle, node.color);
    const doodleX = width - (narrow ? 70 : 145);
    actions.push({ kind: "doodle", node, duration: 35, start: { x: doodleX, y: node.y } });
    lines.slice(node.line, nodes[index + 1]?.line ?? lines.length).forEach(text);
  });
  const total = actions.reduce((sum, action) => sum + action.duration, 0);
  let remaining = reducedMotion ? total : reveal * total;
  let activity: BuildActivity | undefined;
  let tip: Point = { x: margin, y: 68 };
  let furthestY = 68;
  const maxCamera = Math.max(0, y - height + 35);
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
  ctx.fillStyle = "#fff";
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
      tip = drawDoodle(ctx, action.node.doodle, width - (narrow ? 70 : 145), action.node.y - 8, narrow ? 40 : 75, drawing, action.node.color);
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
