export function WindowControls({
  onMinimize,
  onMaximize,
  onClose,
  maximized = false,
}: {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose: () => void;
  maximized?: boolean;
}) {
  return (
    <div className="window-controls" onPointerDown={(e) => e.stopPropagation()}>
      {onMinimize && (
        <button
          className="window-button minimize"
          aria-label="Minimize"
          title="Minimize"
          onClick={onMinimize}
        >
          <span />
        </button>
      )}
      {onMaximize && (
        <button
          className={`window-button maximize ${maximized ? "is-maximized" : ""}`}
          aria-label={maximized ? "Restore down" : "Maximize"}
          title={maximized ? "Restore down" : "Maximize"}
          onClick={onMaximize}
        >
          <span />
        </button>
      )}
      <button
        className="window-button close"
        aria-label="Close"
        title="Close"
        onClick={onClose}
      >
        <span>×</span>
      </button>
    </div>
  );
}
