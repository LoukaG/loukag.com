import { useEffect, useRef, useState } from "react";
import { Icon, WindowsFlag } from "./Icon";
import type { DialogKind } from "./DesktopDialog";
type Props = {
  paintOpen: boolean;
  minimized: boolean;
  onPaint: () => void;
  onTogglePaint: () => void;
  onDialog: (kind: DialogKind) => void;
  onNotes: () => void;
  onDesktop: () => void;
  onReplay: () => void;
};
export function Taskbar({
  paintOpen,
  minimized,
  onPaint,
  onTogglePaint,
  onDialog,
  onNotes,
  onDesktop,
  onReplay,
}: Props) {
  const [panel, setPanel] = useState<"start" | "clock" | "volume" | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [volume, setVolume] = useState(65);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!panel) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setPanel(null);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel(null);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [panel]);
  const toggle = (next: typeof panel) => setPanel(panel === next ? null : next);
  const act = (fn: () => void) => {
    setPanel(null);
    fn();
  };
  const programs = [
    { name: "Paint", icon: "paint" as const, run: onPaint },
    { name: "Sticky Notes", icon: "document" as const, run: onNotes },
    {
      name: "My portfolio",
      icon: "folder" as const,
      run: () => onDialog("folder"),
    },
    {
      name: "readme.txt",
      icon: "document" as const,
      run: () => onDialog("readme"),
    },
  ];
  return (
    <div ref={ref} className="taskbar-root">
      {panel === "start" && (
        <div className="start-menu aero-window" aria-label="Start menu">
          <div className="start-programs">
            <div className="program-list">
              {programs
                .filter((p) =>
                  p.name.toLowerCase().includes(search.toLowerCase()),
                )
                .map((p) => (
                  <button key={p.name} onClick={() => act(p.run)}>
                    <Icon name={p.icon} />
                    <span>{p.name}</span>
                  </button>
                ))}
              {programs.every(
                (p) => !p.name.toLowerCase().includes(search.toLowerCase()),
              ) && <p className="no-results">No items match your search.</p>}
            </div>
            <button className="all-programs" onClick={() => setSearch("")}>
              ▸ All Programs
            </button>
            <input
              autoFocus
              aria-label="Search programs and files"
              placeholder="Search programs and files"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="start-links">
            <div className="user-tile">
              <Icon name="paint" size={42} />
            </div>
            <strong>Louka</strong>
            <button onClick={() => act(() => onDialog("folder"))}>
              My portfolio
            </button>
            <button onClick={() => act(() => onDialog("readme"))}>
              Documents
            </button>
            <hr />
            <button onClick={() => act(() => onDialog("computer"))}>
              Computer
            </button>
            <button onClick={() => act(() => onDialog("help"))}>
              Help and Support
            </button>
            <button className="restart-button" onClick={() => act(onReplay)}>
              Restart scene <span>▸</span>
            </button>
          </div>
        </div>
      )}
      {panel === "clock" && (
        <div className="tray-popup calendar-popup aero-window">
          <p>
            {now?.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <div className="analog-clock">
            <div className="clock-face">
              <i
                style={{
                  transform: `rotate(${((now?.getHours() || 0) % 12) * 30 + (now?.getMinutes() || 0) / 2}deg)`,
                }}
                className="hour-hand"
              />
              <i
                style={{
                  transform: `rotate(${(now?.getMinutes() || 0) * 6}deg)`,
                }}
                className="minute-hand"
              />
              <b />
            </div>
          </div>
          <span>
            {now?.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
          <small>Your local time</small>
        </div>
      )}
      {panel === "volume" && (
        <div className="tray-popup volume-popup aero-window">
          <span>Speakers</span>
          <svg width="25" height="25" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M2 7h4l5-4v14l-5-4H2Z" fill="#49779a" />
            <path
              d="M14 5q7 5 0 10"
              fill="none"
              stroke="#49779a"
              strokeWidth="1.5"
            />
          </svg>
          <input
            aria-label="Desktop volume (scene is silent)"
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(+e.target.value)}
          />
          <small>{volume}% · Scene is silent</small>
        </div>
      )}
      <footer className="taskbar" aria-label="Windows taskbar">
        <button
          className={`start-button ${panel === "start" ? "active" : ""}`}
          aria-label="Start"
          title="Start"
          aria-expanded={panel === "start"}
          onClick={() => toggle("start")}
        >
          <WindowsFlag />
        </button>
        <div className="pinned-apps">
          <button
            className="taskbar-app"
            aria-label="Open My portfolio"
            title="Windows Explorer"
            onClick={() => onDialog("folder")}
          >
            <Icon name="explorer" size={34} />
          </button>
          <button
            className={`taskbar-app ${paintOpen ? "running" : ""} ${paintOpen && !minimized ? "foreground" : ""}`}
            aria-label={paintOpen ? "Minimize or restore Paint" : "Open Paint"}
            title="Paint"
            onClick={paintOpen ? onTogglePaint : onPaint}
          >
            <Icon name="paint" size={34} />
          </button>
          <button
            className="taskbar-app note-task"
            aria-label="Open Sticky Notes"
            title="Sticky Notes"
            onClick={onNotes}
          >
            <span className="notes-icon">
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>
        <div className="taskbar-spacer" />
        <span className="taskbar-language">EN</span>
        <button
          className="tray-icon"
          aria-label="About this desktop"
          title="About this desktop"
          onClick={() => onDialog("help")}
        >
          <span className="tray-chevron">▴</span>
        </button>
        <span className="network-icon" title="Connected" aria-label="Connected">
          <i />
          <i />
          <i />
          <i />
        </span>
        <button
          className="tray-icon sound-button"
          aria-label="Volume"
          title="Speakers"
          aria-expanded={panel === "volume"}
          onClick={() => toggle("volume")}
        >
          <svg viewBox="0 0 20 20" width="19" height="19" aria-hidden="true">
            <path d="M2 7h4l5-4v14l-5-4H2Z" fill="white" stroke="#45647a" />
            <path
              d="M14 6q5 4 0 8M16 3q8 7 0 14"
              fill="none"
              stroke="white"
              strokeWidth="1.2"
            />
          </svg>
        </button>
        <button
          className="taskbar-clock"
          aria-label="Date and time"
          aria-expanded={panel === "clock"}
          onClick={() => toggle("clock")}
        >
          <span>
            {now?.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            }) || "12:00 PM"}
          </span>
          <span>{now?.toLocaleDateString("en-US") || "11/13/2026"}</span>
        </button>
        <button
          className="show-desktop"
          title="Show desktop"
          aria-label="Show desktop"
          onClick={onDesktop}
        />
      </footer>
    </div>
  );
}
