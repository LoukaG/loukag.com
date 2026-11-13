import { useEffect, useRef } from "react";
import { Icon } from "./Icon";
import { WindowControls } from "./WindowControls";
export type DialogKind = "computer" | "folder" | "recycle" | "readme" | "help";
const titles = {
  computer: "Computer",
  folder: "My portfolio",
  recycle: "Recycle Bin",
  readme: "readme.txt — Notepad",
  help: "About this desktop",
};
export function DesktopDialog({
  kind,
  onClose,
  onPaint,
}: {
  kind: DialogKind;
  onClose: () => void;
  onPaint: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.focus();
    return () => previous?.focus();
  }, []);
  return (
    <div className="dialog-backdrop" onPointerDown={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={titles[kind]}
        className="aero-window desktop-dialog"
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          if (e.key === "Tab") {
            const elements =
              ref.current?.querySelectorAll<HTMLElement>("button, a");
            if (!elements?.length) return;
            const first = elements[0],
              last = elements[elements.length - 1];
            if (
              e.shiftKey &&
              (document.activeElement === first ||
                document.activeElement === ref.current)
            ) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        }}
      >
        <div className="title-bar">
          <Icon
            name={kind === "computer" || kind === "recycle" ? kind : "document"}
            size={16}
          />
          <span>{titles[kind]}</span>
          <WindowControls onClose={onClose} />
        </div>
        <div className="dialog-content">
          {kind === "recycle" ? (
            <div className="empty-folder">
              <Icon name="recycle" size={48} />
              <p>This folder is empty.</p>
              <small>A fresh start. Nothing to throw away yet.</small>
            </div>
          ) : kind === "computer" ? (
            <>
              <div className="explorer-address">Computer</div>
              <h3>Hard Disk Drives (1)</h3>
              <div className="drive">
                <Icon name="computer" size={48} />
                <div>
                  Local Disk (C:)
                  <div className="drive-meter">
                    <span />
                  </div>
                  <small>93.4 GB free of 149 GB</small>
                </div>
              </div>
              <p className="system-detail">
                Windows 7 · A familiar place for a new beginning.
              </p>
            </>
          ) : kind === "folder" ? (
            <>
              <div className="explorer-address">Louka › My portfolio</div>
              <button className="folder-file" onClick={onPaint}>
                <Icon name="paint" size={48} />
                <span>
                  A blank canvas<small>Open in Paint</small>
                </span>
              </button>
              <p className="folder-footnote">
                One canvas. A story still being written.
              </p>
            </>
          ) : (
            <div className="readme">
              <p>HELLO, WORLD.</p>
              <p>Welcome to my little corner of the desktop.</p>
              <p>
                This is the beginning of a developer portfolio told through an
                old friend: Microsoft Paint.
              </p>
              <p>
                Double-click Paint, press Enter on its shortcut, or scroll to
                open the first canvas. On a touch screen, just tap.
              </p>
              <p>
                You can draw, change colors, undo, and save your canvas. Explore
                a little. There’s no wrong way to start.
              </p>
              <p>
                Scene 01 / A blank canvas
                <br />— Louka
              </p>
            </div>
          )}
        </div>
        <div className="dialog-footer">
          <button className="classic-button" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
