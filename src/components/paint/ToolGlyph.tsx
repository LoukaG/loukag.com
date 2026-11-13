/** Small hand-drawn ribbon glyphs, with Windows 7's colored, shaded treatment. */
export function ToolGlyph({
  name,
  size = 18,
}: {
  name: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="tool-glyph"
    >
      {name === "pencil" ? (
        <>
          <path d="m4 17-1 5 5-1L21 8l-4-4Z" fill="#f4cd4c" stroke="#9a7624" />
          <path d="m17 4 2-2q1-1 2 0l2 2q1 1 0 2l-2 2Z" fill="#e9a09c" />
          <path d="m4 17 4 4-5 1Z" fill="#d4b68a" />
          <path d="m3 22 1-3 2 2Z" fill="#333" />
        </>
      ) : name === "eraser" ? (
        <>
          <path d="m3 14 9-10 9 8-9 10H9Z" fill="#efa4ad" stroke="#a16475" />
          <path d="m3 14 6-6 9 8-6 6H9Z" fill="#fad1db" stroke="#a16475" />
        </>
      ) : name === "brush" ? (
        <>
          <path
            d="M11 14 19 2q2-2 3 0 1 1-1 3L13 17Z"
            fill="#a87c3a"
            stroke="#6b4a2c"
          />
          <path d="m9 14 5 4-3 3-6-5Z" fill="#c8d0d5" stroke="#75838b" />
          <path d="M5 16q-4 3-3 6 5 2 9-1Z" fill="#354b75" />
        </>
      ) : name === "fill" ? (
        <>
          <path d="m4 10 8-8 10 10-8 8Z" fill="#d8e8f5" stroke="#637c8c" />
          <path d="M4 10q8 5 12-2l6 4-8 8Z" fill="#73b5e8" />
          <path d="M4 13s-5 6-2 8 5-1 2-8" fill="#edbd34" />
          <path d="m8 4 5 5" stroke="#6b7981" strokeWidth="2" />
        </>
      ) : name === "picker" ? (
        <>
          <path
            d="m4 17 12-12 3 3L7 20l-4 1Z"
            fill="#a6d6e9"
            stroke="#486779"
          />
          <path d="m14 4 3-3 6 6-3 3Z" fill="#253b72" />
        </>
      ) : name === "magnifier" ? (
        <>
          <circle
            cx="10"
            cy="9"
            r="7"
            fill="#d3ebf6"
            stroke="#487d99"
            strokeWidth="2"
          />
          <path d="m15 15 7 7" stroke="#386f9b" strokeWidth="4" />
        </>
      ) : name === "text" ? (
        <text
          x="3"
          y="20"
          fontFamily="Georgia"
          fontWeight="bold"
          fontSize="23"
          fill="#293e79"
        >
          A
        </text>
      ) : name === "paste" ? (
        <>
          <rect
            x="4"
            y="4"
            width="14"
            height="18"
            rx="1"
            fill="#dbad59"
            stroke="#a27b33"
          />
          <rect
            x="8"
            y="2"
            width="7"
            height="4"
            rx="1"
            fill="#f3e6c9"
            stroke="#aa9a76"
          />
          <path d="M10 10h11v13H10Z" fill="#fff" stroke="#8fa1b3" />
          <path d="M12 14h7m-7 3h7m-7 3h5" stroke="#a9b6c3" />
        </>
      ) : name === "select" ? (
        <rect
          x="2"
          y="3"
          width="20"
          height="17"
          fill="#f7fbff"
          stroke="#4382b1"
          strokeDasharray="3 2"
        />
      ) : name === "save" ? (
        <>
          <path d="M3 2h16l2 3v17H3Z" fill="#6994be" stroke="#38648d" />
          <path d="M7 2h10v7H7Z" fill="#e2e5e8" />
          <path d="M7 13h11v9H7Z" fill="#f8f8f8" />
          <path d="M14 3v5" stroke="#606b7c" strokeWidth="2" />
        </>
      ) : name === "undo" || name === "redo" ? (
        <path
          d={
            name === "undo"
              ? "M9 3 2 9l7 4V9c9-2 13 4 10 11 8-9-1-18-10-14Z"
              : "m15 3 7 6-7 4V9C6 7 2 13 5 20-3 11 6 2 15 6Z"
          }
          fill="#67a3d5"
          stroke="#3a77aa"
        />
      ) : name === "crop" ? (
        <path
          d="M6 1v17h17M1 6h17v17"
          fill="none"
          stroke="#506477"
          strokeWidth="2"
        />
      ) : name === "resize" ? (
        <>
          <rect
            x="2"
            y="3"
            width="13"
            height="10"
            fill="#b4dbef"
            stroke="#627e8e"
          />
          <rect
            x="9"
            y="11"
            width="13"
            height="10"
            fill="#fff"
            stroke="#627e8e"
          />
        </>
      ) : name === "rotate" ? (
        <>
          <path
            d="M4 10A8 8 0 1 1 4 17"
            fill="none"
            stroke="#4d9b59"
            strokeWidth="2"
          />
          <path d="M1 5v7h7" fill="#4d9b59" />
        </>
      ) : name === "line" ? (
        <path d="m3 20 18-17" stroke="#344d6a" strokeWidth="1.5" />
      ) : name === "ellipse" ? (
        <ellipse
          cx="12"
          cy="12"
          rx="10"
          ry="7"
          fill="none"
          stroke="#344d6a"
          strokeWidth="1.5"
        />
      ) : name === "rectangle" ? (
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          fill="none"
          stroke="#344d6a"
          strokeWidth="1.5"
        />
      ) : name === "triangle" ? (
        <path
          d="M12 3 22 21H2Z"
          fill="none"
          stroke="#344d6a"
          strokeWidth="1.5"
        />
      ) : name === "star" ? (
        <path
          d="m12 2 3 6 7 1-5 5 1 8-6-4-6 4 1-8-5-5 7-1Z"
          fill="none"
          stroke="#344d6a"
          strokeWidth="1.5"
        />
      ) : name === "diamond" ? (
        <path
          d="m12 2 10 10-10 10L2 12Z"
          fill="none"
          stroke="#344d6a"
          strokeWidth="1.5"
        />
      ) : name === "arrow" ? (
        <path
          d="M2 8h12V3l8 9-8 9v-5H2Z"
          fill="none"
          stroke="#344d6a"
          strokeWidth="1.5"
        />
      ) : (
        <path
          d="M2 18q4-19 10-6t10-7"
          fill="none"
          stroke="#344d6a"
          strokeWidth="1.5"
        />
      )}
    </svg>
  );
}
