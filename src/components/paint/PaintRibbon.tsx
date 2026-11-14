import { ToolGlyph } from "./ToolGlyph";
import type { PaintTool } from "./types";
const COLORS = [
  "#000000",
  "#7f7f7f",
  "#880015",
  "#ed1c24",
  "#ff7f27",
  "#fff200",
  "#22b14c",
  "#00a2e8",
  "#3f48cc",
  "#a349a4",
  "#ffffff",
  "#c3c3c3",
  "#b97a57",
  "#ffaec9",
  "#ffc90e",
  "#efe4b0",
  "#b5e61d",
  "#99d9ea",
  "#7092be",
  "#c8bfe7",
];
const SHAPES: PaintTool[] = [
  "line",
  "ellipse",
  "rectangle",
  "triangle",
  "diamond",
  "star",
  "arrow",
];
interface Props {
  tab: "home" | "view";
  tool: PaintTool | "text";
  color: string;
  size: number;
  zoom: number;
  grid: boolean;
  onTool: (tool: PaintTool) => void;
  onColor: (color: string) => void;
  onSize: (size: number) => void;
  onZoom: (zoom: number) => void;
  onGrid: (grid: boolean) => void;
  onClear: () => void;
}
export function PaintRibbon({
  tab,
  tool,
  color,
  size,
  zoom,
  grid,
  onTool,
  onColor,
  onSize,
  onZoom,
  onGrid,
  onClear,
}: Props) {
  if (tab === "view")
    return (
      <div className="ribbon view-ribbon" role="tabpanel" aria-label="View">
        <div className="ribbon-group">
          <div className="group-body">
            <button
              className="ribbon-large"
              onClick={() => onZoom(Math.min(200, zoom + 25))}
            >
              <ToolGlyph name="magnifier" size={29} />
              <span>Zoom in</span>
            </button>
            <button
              className="ribbon-large"
              onClick={() => onZoom(Math.max(25, zoom - 25))}
            >
              <ToolGlyph name="magnifier" size={29} />
              <span>Zoom out</span>
            </button>
            <button className="ribbon-large" onClick={() => onZoom(100)}>
              <span className="hundred-icon">100%</span>
              <span>100%</span>
            </button>
          </div>
          <span className="group-label">Zoom</span>
        </div>
        <div className="ribbon-group">
          <div className="group-body view-options">
            <label>
              <input
                type="checkbox"
                checked={grid}
                onChange={(e) => onGrid(e.target.checked)}
              />{" "}
              Gridlines
            </label>
            <span>Fit canvas to the window</span>
          </div>
          <span className="group-label">Show or hide</span>
        </div>
      </div>
    );
  return (
    <div className="ribbon" role="tabpanel" aria-label="Home">
      <div className="ribbon-group clipboard-group">
        <div className="group-body">
          <button
            className="ribbon-large"
            disabled
            title="Clipboard import unavailable"
          >
            <ToolGlyph name="paste" size={31} />
            <span>Paste</span>
            <small>▾</small>
          </button>
          <div className="ribbon-stack">
            <button disabled>
              <span>✂</span> Cut
            </button>
            <button disabled>
              <ToolGlyph name="resize" size={15} /> Copy
            </button>
          </div>
        </div>
        <span className="group-label">Clipboard</span>
      </div>
      <div className="ribbon-group image-group">
        <div className="group-body">
          <button
            className="ribbon-large"
            disabled
            title="Selection unavailable"
          >
            <ToolGlyph name="select" size={28} />
            <span>Select</span>
            <small>▾</small>
          </button>
          <div className="ribbon-stack">
            <button disabled>
              <ToolGlyph name="crop" size={15} />
              Crop
            </button>
            <button disabled>
              <ToolGlyph name="resize" size={15} />
              Resize
            </button>
            <button disabled>
              <ToolGlyph name="rotate" size={15} />
              Rotate ▾
            </button>
          </div>
        </div>
        <span className="group-label">Image</span>
      </div>
      <div className="ribbon-group tools-group">
        <div className="group-body tool-grid">
          {(
            ["pencil", "fill", "text", "eraser", "picker", "magnifier"] as const
          ).map((name) => (
            <button
              key={name}
              className={tool === name ? "selected-tool" : ""}
              aria-label={
                name === "fill"
                  ? "Fill canvas"
                  : name[0].toUpperCase() + name.slice(1)
              }
              title={
                name === "fill"
                  ? "Fill the canvas with Color 1"
                  : name === "text"
                    ? "Text tool unavailable"
                    : name[0].toUpperCase() + name.slice(1)
              }
              disabled={name === "text"}
              onClick={() =>
                name === "magnifier"
                  ? onZoom(zoom >= 200 ? 100 : zoom + 25)
                  : name !== "text" && onTool(name)
              }
            >
              <ToolGlyph name={name} />
            </button>
          ))}
        </div>
        <span className="group-label">Tools</span>
      </div>
      <div className="ribbon-group brushes-group">
        <div className="group-body">
          <button
            className={`ribbon-large ${tool === "brush" ? "selected-tool" : ""}`}
            onClick={() => onTool("brush")}
            aria-label="Brushes"
            title="Brush"
          >
            <ToolGlyph name="brush" size={32} />
            <span>Brushes</span>
            <small>▾</small>
          </button>
        </div>
        <span className="group-label">&nbsp;</span>
      </div>
      <div className="ribbon-group shapes-group">
        <div className="group-body">
          <div className="shape-grid">
            {SHAPES.map((shape) => (
              <button
                key={shape}
                className={tool === shape ? "selected-tool" : ""}
                aria-label={shape[0].toUpperCase() + shape.slice(1)}
                title={shape}
                onClick={() => onTool(shape)}
              >
                <ToolGlyph name={shape} size={17} />
              </button>
            ))}
          </div>
          <div className="ribbon-stack shape-options">
            <span>
              <ToolGlyph name="pencil" size={14} /> Outline ▾
            </span>
            <span>
              <ToolGlyph name="fill" size={14} /> No fill
            </span>
          </div>
        </div>
        <span className="group-label">Shapes</span>
      </div>
      <div className="ribbon-group size-group">
        <div className="group-body">
          <label className="size-control" title="Brush size">
            <span className="size-lines">
              <i />
              <i />
              <i />
              <i />
            </span>
            <select
              aria-label="Brush size"
              value={size}
              onChange={(e) => onSize(+e.target.value)}
            >
              <option value="1">1 px</option>
              <option value="3">3 px</option>
              <option value="5">5 px</option>
              <option value="8">8 px</option>
            </select>
          </label>
        </div>
        <span className="group-label">Size</span>
      </div>
      <div className="ribbon-group colors-group">
        <div className="group-body">
          <div className="current-color selected-tool">
            <span style={{ background: color }} />
            <small>
              Color
              <br />1
            </small>
          </div>
          <div className="current-color secondary-color">
            <span />
            <small>
              Color
              <br />2
            </small>
          </div>
          <div className="color-palette">
            {COLORS.map((c) => (
              <button
                key={c}
                className={color === c ? "active-swatch" : ""}
                aria-label={`Set color ${c}`}
                aria-pressed={color === c}
                title={c}
                style={{ backgroundColor: c }}
                onClick={() => onColor(c)}
              />
            ))}
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          <label className="custom-color" title="Edit colors">
            <span className="color-spectrum" />
            <span>
              Edit
              <br />
              colors
            </span>
            <input
              type="color"
              aria-label="Custom color"
              value={color}
              onChange={(e) => onColor(e.target.value)}
            />
          </label>
        </div>
        <span className="group-label">Colors</span>
      </div>
      <div className="ribbon-group clear-group">
        <div className="group-body">
          <button
            className="ribbon-large"
            onClick={onClear}
            title="Clear the canvas (can be undone)"
          >
            <span className="blank-page" />
            <span>Clear</span>
          </button>
        </div>
        <span className="group-label">Canvas</span>
      </div>
    </div>
  );
}
