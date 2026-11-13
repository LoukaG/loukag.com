import { useEffect, useRef, useState } from "react";
import { PaintWindow } from "../components/paint/PaintWindow";

export default function PaintScene() {
  const root = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => setReducedMotion(media.matches);
    preference();
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!root.current) return;
      const rect = root.current.getBoundingClientRect();
      const distance = root.current.offsetHeight - window.innerHeight;
      setProgress(Math.max(0, Math.min(1, -rect.top / Math.max(1, distance))));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", preference);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", preference);
    };
  }, []);

  return (
    <div className="paint-story" ref={root}>
      <h1 className="sr-only">Hello :-) I'm Louka Gauthier, full stack developper</h1>
      <div className="paint-viewport">
        <PaintWindow
          progress={progress}
          reducedMotion={reducedMotion}
          onReplay={() => window.scrollTo({ top: 0, behavior: "instant" })}
        />
      </div>
    </div>
  );
}
