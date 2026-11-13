export type PaintTool =
  | "pencil"
  | "brush"
  | "eraser"
  | "fill"
  | "picker"
  | "line"
  | "rectangle"
  | "ellipse"
  | "triangle"
  | "diamond"
  | "star"
  | "arrow";
export interface Point {
  x: number;
  y: number;
}
export interface Stroke {
  tool: PaintTool;
  color: string;
  size: number;
  points: Point[];
}
export interface CanvasHandle {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  save: () => void;
}
