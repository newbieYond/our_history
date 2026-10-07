import type { Category } from "../lib/types";
export function PlaceIcon({ kind }: { kind: Category }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...common}>
      {kind === "spot" && (
        <>
          <path d="M2.5 19.5 9 9l3.5 5 2.5-3.5 6.5 9H2.5Z" />
          <circle cx="17.5" cy="5.5" r="2" />
        </>
      )}
      {kind === "food" && (
        <>
          <path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M16 3c2.4 1.6 4 4.5 4 8v2h-4V3ZM18 13v8" />
        </>
      )}
      {kind === "cafe" && (
        <>
          <path d="M3 8h13v7a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8ZM16 9h2a3 3 0 1 1 0 6h-2M5 4h9" />
        </>
      )}
      {kind === "shop" && (
        <>
          <path d="M5 8h14l2 13H3L5 8ZM8 8V6a4 4 0 0 1 8 0v2" />
        </>
      )}
      {kind === "stay" && (
        <>
          <path d="M3 20V5M3 17h18v3M3 12h18v5M7 12V8h5v4M12 12h7a2 2 0 0 1 2 2v3" />
        </>
      )}
    </svg>
  );
}
