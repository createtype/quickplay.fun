import { ImageResponse } from "next/og";
import { rankTitle } from "@/lib/score";
import { parseSlug } from "@/lib/shareSlug";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// OG image — the shareable score card
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { correct, total, name } = parseSlug(slug);
  const rank = rankTitle(correct, total);
  const scoreLine = name
    ? `${name} nailed ${correct}/${total} clips`
    : `Nailed ${correct}/${total} clips · Guess the Movie`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(900px 500px at 50% -10%, #5a1240 0%, transparent 60%), linear-gradient(150deg, #16101f 0%, #0f0c17 100%)",
          color: "#f7f2f8",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 800, color: "#ff4d97" }}>
          quickplay.fun
        </div>
        <div style={{ display: "flex", fontSize: 120, marginTop: 14 }}>{rank.emoji}</div>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 900, marginTop: 2, color: "#ff4d97" }}>
          {rank.title}
        </div>
        <div style={{ display: "flex", fontSize: 36, color: "#cbb8c8", marginTop: 18 }}>
          {scoreLine}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#5fd0e8", marginTop: 30, fontWeight: 700 }}>
          Can you beat this? ▶ Play free
        </div>
      </div>
    ),
    { ...size }
  );
}
