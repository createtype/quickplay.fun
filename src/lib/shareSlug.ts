// Encode/decode a share slug: "<correct>-<total>-<name?>".

export type ShareData = { correct: number; total: number; name: string };

// makeSlug
export function makeSlug(correct: number, total: number, name?: string): string {
  const base = `${correct}-${total}`;
  const clean = (name || "").trim().replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 20);
  return clean ? `${base}-${encodeURIComponent(clean)}` : base;
}

// parseSlug
export function parseSlug(slug: string): ShareData {
  const parts = decodeURIComponent(slug).split("-");
  const correct = clampInt(parts[0], 0);
  const total = clampInt(parts[1], 5);
  const name = parts.slice(2).join("-").slice(0, 20);
  return { correct, total, name };
}

// clampInt
function clampInt(v: string, fallback: number): number {
  const n = parseInt(v, 10);
  if (Number.isNaN(n) || n < 0 || n > 99) return fallback;
  return n;
}
