import { useEffect, useRef, useState } from "react";

const messages = {
  introduction: "He drew that himself. Unfortunately. Scroll to see more of his drawing",
  timeline: "That's a lot of experience for someone who still uses Paint.",
  projects: "Some of these actually work!",
  contact: "You made it! Most people don't scroll this far.",
};

export function Clippy({ progress, blocked }: { progress: number; blocked: boolean }) {
  const section = progress >= 4.45 ? "contact" : progress >= 3.35 ? "projects" : progress > 1 ? "timeline" : "introduction";
  const [visible, setVisible] = useState(false);
  const shown = useRef(new Set<string>());

  useEffect(() => {
    setVisible(false);
    if (blocked || shown.current.has(section)) return;
    let timer: number;
    const reset = () => {
      window.clearTimeout(timer);
      if (document.hidden || shown.current.has(section)) return;
      timer = window.setTimeout(() => {
        shown.current.add(section);
        setVisible(true);
      }, 15_000);
    };
    window.addEventListener("scroll", reset, { passive: true });
    document.addEventListener("visibilitychange", reset);
    reset();
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, [section, blocked]);

  if (!visible) return null;
  return (
    <aside className="clippy" aria-label="Clippy">
      <div className="clippy-bubble">
        <button className="clippy-close" aria-label="Dismiss Clippy" onClick={() => setVisible(false)}>×</button>
        <p role="status">{messages[section]}</p>
      </div>
      <svg className="clippy-character" viewBox="0 0 120 145" aria-hidden="true">
        <defs>
          <linearGradient id="clippy-metal" x1="0" x2="1" y1="0" y2="0">
            <stop stopColor="#666" /><stop offset=".35" stopColor="#f7f7f7" /><stop offset=".65" stopColor="#b5b5b5" /><stop offset="1" stopColor="#737373" />
          </linearGradient>
        </defs>
        <ellipse cx="62" cy="136" rx="36" ry="5" fill="#000" opacity=".15" />
        <path d="M 84 56 L 79 106 C 76 139 25 137 28 103 L 34 36 C 38 -1 99 0 95 39 L 88 101 C 86 124 49 121 51 99 L 56 48"
          fill="none" stroke="#444" strokeWidth="10" strokeLinecap="round" />
        <path d="M 84 56 L 79 106 C 76 139 25 137 28 103 L 34 36 C 38 -1 99 0 95 39 L 88 101 C 86 124 49 121 51 99 L 56 48"
          fill="none" stroke="url(#clippy-metal)" strokeWidth="7" strokeLinecap="round" />
        <ellipse cx="51" cy="42" rx="13" ry="17" fill="white" stroke="#333" strokeWidth="2" transform="rotate(-12 51 42)" />
        <ellipse cx="78" cy="40" rx="13" ry="17" fill="white" stroke="#333" strokeWidth="2" transform="rotate(10 78 40)" />
        <ellipse cx="48" cy="45" rx="4" ry="7" fill="#222" />
        <ellipse cx="75" cy="43" rx="4" ry="7" fill="#222" />
        <path d="M 36 21 Q 46 14 57 20 M 69 17 Q 79 10 89 18" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </aside>
  );
}
