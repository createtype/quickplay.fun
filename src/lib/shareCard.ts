// Client-side score-card image generation + share/download.

type RankRow = { name?: string; score: number; total: number; you?: boolean };

const W = 1080;
const H = 1080; // square default (personal card)

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

function bg(ctx: CanvasRenderingContext2D, h: number) {
  const g = ctx.createLinearGradient(0, 0, W, h);
  g.addColorStop(0, C.bg);
  g.addColorStop(1, C.bg2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, h);
  // top spotlight
  const r = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, W * 0.8);
  r.addColorStop(0, "rgba(255,77,151,0.22)");
  r.addColorStop(1, "rgba(255,77,151,0)");
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, W, h);
}

function brandMark(ctx: CanvasRenderingContext2D, y: number) {
  ctx.textAlign = "center";
  ctx.font = "800 40px 'Hanken Grotesk', system-ui, sans-serif";
  ctx.fillStyle = C.brand;
  ctx.fillText("● quickplay.fun", W / 2, y);
}

function footer(ctx: CanvasRenderingContext2D, h: number) {
  ctx.textAlign = "center";
  // what the game is, for anyone seeing this card cold
  ctx.font = "600 34px 'Hanken Grotesk', system-ui, sans-serif";
  ctx.fillStyle = C.muted;
  ctx.fillText("Watch a 1-second movie clip. Guess the film.", W / 2, h - 120);
  // CTA
  ctx.font = "700 38px 'Hanken Grotesk', system-ui, sans-serif";
  ctx.fillStyle = C.cyan;
  ctx.fillText("Try it  ▶  quickplay.fun", W / 2, h - 64);
}

// drawPersonalCard
function drawPersonalCard(
  ctx: CanvasRenderingContext2D,
  opts: { emoji: string; title: string; correct: number; total: number; name?: string }
) {
  bg(ctx, H);
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

  footer(ctx, H);
}

// competitionRank — tie-aware rank per row (1,2,2,4…). Assumes rows sorted desc by score.
function competitionRank(rows: RankRow[]): number[] {
  return rows.map((r) => 1 + rows.filter((o) => o.score > r.score).length);
}

// Leaderboard layout (shared by sizer + drawer)
const LB_MAX = 10; // show at most top 10
const LB_TOP = 360; // y where rows start
const LB_ROW_H = 100;
const LB_FOOT = 220; // space reserved below rows for the footer

// leaderboardHeight — canvas height for N rows (capped at LB_MAX)
function leaderboardHeight(count: number): number {
  return LB_TOP + Math.min(count, LB_MAX) * LB_ROW_H + LB_FOOT;
}

// drawLeaderboardCard
function drawLeaderboardCard(ctx: CanvasRenderingContext2D, rows: RankRow[]) {
  const top = rows.slice(0, LB_MAX);
  const ranks = competitionRank(top);
  const h = leaderboardHeight(rows.length);
  const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

  bg(ctx, h);
  brandMark(ctx, 130);

  ctx.textAlign = "center";
  ctx.font = "800 76px 'Hanken Grotesk', system-ui, sans-serif";
  ctx.fillStyle = C.text;
  ctx.fillText("🏆 Leaderboard", W / 2, 250);

  let y = LB_TOP;
  const x = 120;
  for (let i = 0; i < top.length; i++) {
    const p = top[i];
    ctx.fillStyle = p.you ? "rgba(255,77,151,0.16)" : C.panel;
    roundRect(ctx, x, y, W - x * 2, LB_ROW_H - 16, 22);
    ctx.fill();

    ctx.textAlign = "left";
    ctx.font = "700 46px 'Hanken Grotesk', system-ui, sans-serif";
    ctx.fillStyle = C.text;
    const tag = medals[ranks[i]] || `${ranks[i]}.`;
    const label = `${tag}  ${p.name || "Player"}${p.you ? " (you)" : ""}`;
    ctx.fillText(label, x + 36, y + 56);

    ctx.textAlign = "right";
    ctx.fillStyle = C.ok;
    ctx.fillText(`${p.score}/${p.total}`, W - x - 36, y + 56);
    y += LB_ROW_H;
  }

  footer(ctx, h);
}

// render to a Blob
async function toBlob(
  draw: (ctx: CanvasRenderingContext2D) => void,
  height: number = H
): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = height;
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
  return toBlob((ctx) => drawLeaderboardCard(ctx, rows), leaderboardHeight(rows.length));
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
