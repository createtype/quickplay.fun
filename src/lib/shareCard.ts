// Client-side score-card image generation + share/download.

type RankRow = { name?: string; score: number; total: number; you?: boolean };

const W = 1080;
const H = 1080;

// Palette (hex mirrors the arcade theme in globals.css).
const C = {
  bg: "#16101f",
  bg2: "#0f0c17",
  brand: "#ff4d97",
  cyan: "#5fd0e8",
  text: "#f7f2f8",
  muted: "#cbb8c8",
  panel: "#241a2e",
  line: "#3a2c44",
  ok: "#5fe0a0",
};

function bg(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, C.bg);
  g.addColorStop(1, C.bg2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // top spotlight
  const r = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, W * 0.8);
  r.addColorStop(0, "rgba(255,77,151,0.22)");
  r.addColorStop(1, "rgba(255,77,151,0)");
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, W, H);
}

function brandMark(ctx: CanvasRenderingContext2D, y: number) {
  ctx.textAlign = "center";
  ctx.font = "800 40px 'Hanken Grotesk', system-ui, sans-serif";
  ctx.fillStyle = C.brand;
  ctx.fillText("● quickplay.fun", W / 2, y);
}

function footer(ctx: CanvasRenderingContext2D) {
  ctx.textAlign = "center";
  // what the game is, for anyone seeing this card cold
  ctx.font = "600 34px 'Hanken Grotesk', system-ui, sans-serif";
  ctx.fillStyle = C.muted;
  ctx.fillText("Watch a 1-second movie clip. Guess the film.", W / 2, H - 120);
  // CTA
  ctx.font = "700 38px 'Hanken Grotesk', system-ui, sans-serif";
  ctx.fillStyle = C.cyan;
  ctx.fillText("Try it  ▶  quickplay.fun", W / 2, H - 64);
}

// drawPersonalCard
function drawPersonalCard(
  ctx: CanvasRenderingContext2D,
  opts: { emoji: string; title: string; correct: number; total: number; name?: string }
) {
  bg(ctx);
  brandMark(ctx, 130);

  ctx.textAlign = "center";
  ctx.font = "180px system-ui, sans-serif";
  ctx.fillText(opts.emoji, W / 2, 410);

  ctx.font = "800 96px 'Hanken Grotesk', system-ui, sans-serif";
  ctx.fillStyle = C.brand;
  wrapText(ctx, opts.title, W / 2, 560, W - 160, 100);

  ctx.font = "600 48px 'Hanken Grotesk', system-ui, sans-serif";
  ctx.fillStyle = C.muted;
  const who = opts.name ? `${opts.name} nailed` : "Nailed";
  ctx.fillText(`${who} ${opts.correct}/${opts.total} clips`, W / 2, 760);

  footer(ctx);
}

// drawLeaderboardCard
function drawLeaderboardCard(
  ctx: CanvasRenderingContext2D,
  rows: RankRow[]
) {
  bg(ctx);
  brandMark(ctx, 130);

  ctx.textAlign = "center";
  ctx.font = "800 76px 'Hanken Grotesk', system-ui, sans-serif";
  ctx.fillStyle = C.text;
  ctx.fillText("🏆 Leaderboard", W / 2, 250);

  const medals = ["🥇", "🥈", "🥉"];
  const top = rows.slice(0, 6);
  let y = 360;
  const x = 120;
  const rowH = 100;
  for (let i = 0; i < top.length; i++) {
    const p = top[i];
    ctx.fillStyle = p.you ? "rgba(255,77,151,0.16)" : C.panel;
    roundRect(ctx, x, y, W - x * 2, rowH - 16, 22);
    ctx.fill();

    ctx.textAlign = "left";
    ctx.font = "700 46px 'Hanken Grotesk', system-ui, sans-serif";
    ctx.fillStyle = C.text;
    const tag = medals[i] || `${i + 1}.`;
    const label = `${tag}  ${p.name || "Player"}${p.you ? " (you)" : ""}`;
    ctx.fillText(label, x + 36, y + 56);

    ctx.textAlign = "right";
    ctx.fillStyle = C.ok;
    ctx.fillText(`${p.score}/${p.total}`, W - x - 36, y + 56);
    y += rowH;
  }

  footer(ctx);
}

// render to a Blob
async function toBlob(draw: (ctx: CanvasRenderingContext2D) => void): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  // ensure web font is ready so the card uses Hanken Grotesk
  try {
    await (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
  } catch {
    /* font API unavailable; fall back to system font */
  }
  draw(ctx);
  return new Promise((res) => canvas.toBlob((b) => res(b), "image/png"));
}

export function personalBlob(opts: {
  emoji: string;
  title: string;
  correct: number;
  total: number;
  name?: string;
}): Promise<Blob | null> {
  return toBlob((ctx) => drawPersonalCard(ctx, opts));
}

export function leaderboardBlob(rows: RankRow[]): Promise<Blob | null> {
  return toBlob((ctx) => drawLeaderboardCard(ctx, rows));
}

// isMobile — touch phone/tablet where a native share sheet makes sense.
// Desktop/Mac (even when canShare reports true) should download/copy instead.
export function isMobile(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return true;
  // iPadOS reports as Mac; detect via touch points.
  return /Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1;
}

// shareOrDownload — mobile: native share with image + caption; desktop: download + copy caption.
export async function shareOrDownload(
  blob: Blob | null,
  filename: string,
  caption: string,
  url: string
): Promise<void> {
  if (!blob) {
    navigator.clipboard?.writeText(`${caption} ${url}`);
    return;
  }
  const file = new File([blob], filename, { type: "image/png" });
  const canShareFile =
    typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });

  if (isMobile() && canShareFile) {
    try {
      await navigator.share({ files: [file], text: `${caption} ${url}` });
      return;
    } catch {
      return; // user cancelled
    }
  }
  // Desktop / Mac: download the image, copy the caption.
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
  navigator.clipboard?.writeText(`${caption} ${url}`);
}

// ---- canvas helpers ----
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  const lines: string[] = [];
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
}
