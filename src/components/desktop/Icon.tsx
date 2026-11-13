type IconName =
  "paint" | "computer" | "recycle" | "folder" | "document" | "explorer";
export function Icon({
  name,
  size = 32,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <img
      className={`win-icon ${className}`}
      src={`/assets/${name}.ico`}
      width={size}
      height={size}
      alt=""
      draggable={false}
    />
  );
}
export function WindowsFlag() {
  return (
    <img
      className="start-orb"
      src="/assets/start.png"
      width="44"
      height="44"
      alt=""
      draggable={false}
    />
  );
}
