import { drawPaintBuild, type PaintBuildAction } from "./paint-build";
import type { Point } from "./types";

const categoryColors = {
  Education: "#183ed7",
  Internship: "#8335b1",
  "Professional work": "#167340",
};

const timeline = [
  { date: "2019–2022", kind: "Education", doodle: "laptop", title: "Diploma of College Studies in Computer Science", place: "Cégep de Trois-Rivières", details: ["Computer Science Technology program"] },
  { date: "May–Aug 2021", kind: "Internship", doodle: "code", title: "Full Stack Developer Intern", place: "Proaxion, Trois-Rivières", details: [] },
  { date: "2021–2023", kind: "Professional work", doodle: "chip", title: "Computer Programmer", place: "C2T3, Trois-Rivières", details: [] },
  { date: "2022–2023", kind: "Professional work", doodle: "api", title: "Programmer Analyst · Contract", place: "Casa Das Tias, Nicolet", details: ["Built employee time-tracking and inventory management applications.", "Developed backend and frontend features to automate business processes.", "Gathered client requirements and proposed end-to-end technical solutions."] },
  { date: "2023–Apr 2026", kind: "Education", doodle: "cap", title: "Bachelor’s in Computer Science", place: "Université de Sherbrooke", details: ["Co-operative education program"] },
  { date: "Jan–Apr 2024", kind: "Internship", doodle: "browser", title: "Web Developer Intern", place: "MesAieux", details: ["Developed backend and frontend web pages with .NET.", "Created and optimized SQL queries and stored procedures for large PostgreSQL databases.", "Maintained legacy code and modernized it to C#."] },
  { date: "Sep–Dec 2024", kind: "Internship", doodle: "chip", title: "Android Developer Intern", place: "Humanware, Longueuil", details: ["Built Android apps for a braille tablet running a custom Android OS.", "Worked in a Scrum team with designers, stakeholders and visually impaired users.", "Implemented features focused on accessibility and inclusive user experiences."] },
  { date: "May–Aug 2025", kind: "Internship", doodle: "code", title: "Mobile Developer Intern", place: "Djob", details: ["Developed the mobile app with Flutter.", "Selected the technology stack and defined the architecture.", "Worked with substantial autonomy and ownership in a startup."] },
  { date: "Apr 2026–Present", kind: "Professional work", doodle: "api", title: "Full-Stack Developer / Architecture & AI", place: "Attraction", details: ["Developing modern web applications with TypeScript.", "Designing cloud architectures on AWS.", "Integrating AI-powered development tools such as Claude Code and OpenAI Codex into daily workflows to improve development efficiency and software quality."] },
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
  const actions: PaintBuildAction[] = [];
  const text = (line: typeof lines[number]) => actions.push({ kind: "text", line, duration: 10 + line.text.length, start: { x: line.x - 5, y: line.y - line.size } });
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
    actions.push({ kind: "doodle", doodle: node.doodle, x: doodleX, y: node.y - 8, size: narrow ? 40 : 75, color: node.color, duration: 35, start: { x: doodleX, y: node.y } });
    lines.slice(node.line, nodes[index + 1]?.line ?? lines.length).forEach(text);
  });
  return drawPaintBuild(ctx, actions, reveal, reducedMotion, { maxCamera: Math.max(0, y - height + 35), start: { x: margin, y: 68 } });
}
