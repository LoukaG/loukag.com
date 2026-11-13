import { Canvas } from "@react-three/fiber";
import type { ReactNode } from "react";

/** Import this boundary lazily from a future WebGL scene. Scene 1 never imports it. */
export default function ThreeSceneCanvas({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop="demand"
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      fallback={
        <div role="status">The 3D view is unavailable on this device.</div>
      }
    >
      {children}
    </Canvas>
  );
}
