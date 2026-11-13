export function StickyNote({
  onOpen,
  onClose,
}: {
  onOpen: () => void;
  onClose: () => void;
}) {
  return (
    <aside className="sticky-note" aria-label="Welcome note">
      <div className="note-toolbar">
        <span>✧</span>
        <button aria-label="Close welcome note" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="note-content">
        <p className="note-greeting">Hey, you made it.</p>
        <p>
          Every great idea starts
          <br />
          with a blank canvas.
        </p>
        <p>Mine started here.</p>
        <div className="note-rule" />
        <button className="note-open" onClick={onOpen}>
          Let’s make something. <span>↗</span>
        </button>
        <p className="note-hint">
          <span className="desktop-hint">Double-click Paint or scroll</span>
          <span className="touch-hint">Tap Paint or swipe up</span>
          <br />
          to begin the story.
        </p>
        <span className="note-signature">— Louka</span>
      </div>
    </aside>
  );
}
