export const projects = [
  { id: "coin", name: "Just Flip A Coin", file: "Just Flip A Coin.png", description: "A mobile app for making a decision with a coin flip.", details: "Built with Flutter, published through Google Play, and connected to Firebase for data collection.", tech: "Flutter · Firebase · Google Play", url: "https://justflipacoin.loukag.com", linkLabel: "Visit project", color: "#183ed7" },
  { id: "unaciem", name: "UNACIEM", file: "UNACIEM.png", description: "A one-page website for an audiovisual company.", details: "Angular components, custom TypeScript and GSAP animations, and content managed with Cockpit CMS.", tech: "Angular · TypeScript · GSAP · Cockpit", url: "https://github.com/LoukaG/UNACIEM", linkLabel: "View on GitHub", color: "#8335b1" },
  { id: "habitflow", name: "Habitflow", file: "Habitflow.png", description: "A mobile app for tracking habits and building a routine.", details: "Built with Flutter and Dart to keep daily habits in one place.", tech: "Flutter · Dart", url: "https://github.com/LoukaG/habitflow", linkLabel: "View on GitHub", color: "#167340" },
] as const;
export type Project = typeof projects[number];

/** An illustrated project image, shared by Paint and the file-picker thumbnails. */
export function drawProject(ctx: CanvasRenderingContext2D, project: Project) {
  const { width, height } = ctx.canvas;
  const narrow = height > width;
  ctx.save();
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = project.color;
  ctx.fillStyle = project.color;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.textBaseline = "alphabetic";
  const font = '"Comic Sans MS", "Chalkboard SE", "Segoe Print", cursive';
  let textY = narrow ? 68 : 115;
  const textX = narrow ? 36 : 420;
  const textWidth = width - textX - 36;
  const write = (text: string, size: number, color: string) => {
    ctx.font = `${size}px ${font}`;
    ctx.fillStyle = color;
    let line = "";
    for (const word of text.split(" ")) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > textWidth) {
        ctx.fillText(line, textX, textY);
        textY += size * 1.5;
        line = word;
      } else line = next;
    }
    ctx.fillText(line, textX, textY);
    textY += size * 1.5;
  };
  write(project.name, narrow ? 32 : 36, project.color);
  write(project.tech, narrow ? 17 : 18, project.color);
  const sketchX = narrow ? (width - 290) / 2 : 55;
  const sketchY = narrow ? 175 : 105;
  ctx.save();
  ctx.translate(sketchX, sketchY);
  ctx.rotate(-0.025);
  const stroke = (points: number[][]) => {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const [ax, ay] = points[i - 1], [bx, by] = points[i];
      const steps = Math.ceil(Math.hypot(bx - ax, by - ay) / 4);
      for (let step = 1; step <= steps; step++) {
        const t = step / steps;
        const wobble = Math.sin(step * 1.9 + i * 5) * 0.8;
        ctx.lineTo(ax + (bx - ax) * t + wobble, ay + (by - ay) * t + wobble * 0.7);
      }
    }
    ctx.stroke();
  };
  ctx.font = `21px ${font}`;
  ctx.fillStyle = project.color;
  if (project.id === "unaciem") {
    stroke([[0, 30], [287, 26], [290, 245], [3, 248], [0, 30]]);
    stroke([[2, 56], [286, 53]]);
    ctx.fillText("• • •", 13, 48);
    ctx.fillText("UNACIEM", 74, 111);
    stroke([[31, 138], [259, 135], [260, 210], [30, 212], [31, 138]]);
    stroke([[130, 156], [153, 172], [130, 191], [130, 156]]);
    stroke([[21, 270], [151, 274], [268, 269]]);
    ctx.fillText("sound. light. motion.", 42, 312);
  } else {
    stroke([[62, 0], [224, 3], [226, 298], [60, 301], [62, 0]]);
    stroke([[66, 29], [219, 31]]);
    stroke([[115, 15], [168, 16]]);
    stroke([[66, 270], [220, 268]]);
    ctx.fillText(project.id === "coin" ? "Heads or tails?" : "My habits", 78, 65);
    if (project.id === "coin") {
      ctx.beginPath();
      ctx.ellipse(145, 154, 49, 47, -0.15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(145, 154, 40, 39, 0.1, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillText("?", 136, 162);
      ctx.fillText("Flip a coin", 95, 239);
      stroke([[19, 130], [32, 122]]); stroke([[250, 136], [265, 128]]);
    } else {
      ["Read", "Move", "Create"].forEach((label, index) => {
        const y = 108 + index * 48;
        stroke([[79, y - 14], [97, y - 15], [97, y + 4], [79, y + 3], [79, y - 14]]);
        if (index < 2) stroke([[82, y - 5], [88, y], [101, y - 17]]);
        ctx.fillText(label, 110, y + 1);
      });
    }
    stroke([[128, 286], [161, 285]]);
  }
  ctx.restore();
  textY = narrow ? 555 : textY + 30;
  write(project.description, narrow ? 24 : 25, "#161616");
  textY += 16;
  write(project.details, 20, "#343434");
  ctx.restore();
}
