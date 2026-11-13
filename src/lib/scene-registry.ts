import type { ComponentType } from "react";

/** A future scene can opt into a lazy renderer without loading Three.js in Scene 1. */
export interface PortfolioScene {
  id: string;
  title: string;
  renderer: "dom" | "webgl";
  load?: () => Promise<{ default: ComponentType }>;
}

export const scenes: readonly PortfolioScene[] = [
  { id: "paint", title: "Hello, I'm Louka", renderer: "dom" },
];
