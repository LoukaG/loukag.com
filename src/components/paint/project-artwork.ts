export const projects = [
  { id: "coin", name: "Just Flip A Coin", file: "Just Flip A Coin.png", description: "An Android coin-flip app with 7,500+ downloads on Google Play.", details: "Built from idea to release: design, development and publishing, with Firebase Analytics, Crashlytics and Database.", tech: "Flutter · Firebase · Google Play", url: "https://play.google.com/store/apps/details?id=com.loukag.just_flip_a_coin", linkLabel: "Visit project", color: "#183ed7" },
  { id: "polyfirgroup", name: "PolyfirGroup", file: "PolyfirGroup.png", description: "A game-mod marketplace with 500+ registered users and 1,000+ downloads.", details: "Defined the product vision, roadmap and monetization strategy, with Stripe Connect for marketplace payments.", tech: "Next.js · Hono · Cloudflare Workers & R2 · Stripe Connect", url: "https://polyfirgroup.com", linkLabel: "Visit project", color: "#8335b1" },
  { id: "pdf-toolkit", name: "PDF Toolkit", file: "PDF Toolkit.png", description: "A desktop PDF editor published on the Microsoft Store.", details: "Built with Flutter to edit, merge and manipulate PDFs, integrating C++ libraries through FFI for advanced processing.", tech: "Flutter · C++ · FFI · Microsoft Store", url: "https://apps.microsoft.com/detail/9nqsnbhzw382", linkLabel: "Visit project", color: "#167340" },
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
  if (project.id === "polyfirgroup") {
    stroke([[0, 30], [287, 26], [290, 245], [3, 248], [0, 30]]);
    stroke([[2, 56], [286, 53]]);
    ctx.fillText("• • •", 13, 48);
    ctx.fillText("PolyfirGroup", 60, 105);
    [31, 112, 193].forEach(x => {
      stroke([[x, 132], [x + 62, 131], [x + 63, 210], [x, 212], [x, 132]]);
      stroke([[x + 10, 151], [x + 52, 150], [x + 51, 184], [x + 10, 185], [x + 10, 151]]);
      stroke([[x + 10, 198], [x + 43, 197]]);
    });
    stroke([[21, 270], [151, 274], [268, 269]]);
    ctx.fillText("discover. mod. play.", 42, 312);
  } else if (project.id === "pdf-toolkit") {
    stroke([[0, 30], [287, 26], [290, 245], [3, 248], [0, 30]]);
    stroke([[2, 56], [286, 53]]);
    ctx.fillText("PDF Toolkit", 76, 48);
    stroke([[27, 81], [84, 80], [85, 218], [28, 220], [27, 81]]);
    [104, 142, 180].forEach(y => stroke([[39, y], [71, y], [72, y + 24], [40, y + 24], [39, y]]));
    stroke([[112, 77], [218, 75], [249, 104], [250, 222], [113, 223], [112, 77]]);
    stroke([[218, 75], [218, 105], [249, 104]]);
    ctx.fillText("PDF", 151, 143);
    [164, 183, 202].forEach(y => stroke([[135, y], [228, y - 1]]));
    ctx.fillText("edit. merge. create.", 38, 312);
  } else {
    stroke([[62, 0], [224, 3], [226, 298], [60, 301], [62, 0]]);
    stroke([[66, 29], [219, 31]]);
    stroke([[115, 15], [168, 16]]);
    stroke([[66, 270], [220, 268]]);
    ctx.fillText("Heads or tails?", 78, 65);
    ctx.beginPath();
    ctx.ellipse(145, 154, 49, 47, -0.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(145, 154, 40, 39, 0.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillText("?", 136, 162);
    ctx.fillText("Flip a coin", 95, 239);
    stroke([[19, 130], [32, 122]]); stroke([[250, 136], [265, 128]]);
    stroke([[128, 286], [161, 285]]);
  }
  ctx.restore();
  textY = narrow ? 555 : textY + 30;
  write(project.description, narrow ? 24 : 25, "#161616");
  textY += 16;
  write(project.details, 20, "#343434");
  ctx.restore();
}
