import type { Metadata } from "next";
import { rankTitle } from "@/lib/score";
import { parseSlug } from "@/lib/shareSlug";

// Dynamic OG/Twitter tags so the card image unfurls in WhatsApp/IG/X.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { correct, total, name } = parseSlug(slug);
  const rank = rankTitle(correct, total);
  const who = name ? `${name} is` : "I'm";
  const title = `${who} a ${rank.title}! ${correct}/${total} on quickplay.fun`;
  const description = "Guess the movie from a 1-second clip. Can you beat this score?";
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

// Share landing — recipient sees the card + a play CTA
export default async function SharePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { correct, total, name } = parseSlug(slug);
  const rank = rankTitle(correct, total);

  return (
    <div className="enter">
      <div className="result-hero">
        <div className="result-emoji">{rank.emoji}</div>
        <div className="result-title">{rank.title}</div>
        <div className="result-score">
          {name ? `${name} nailed` : "Nailed"} <b>{correct}/{total}</b> clips
        </div>
      </div>
      <p className="sub" style={{ textAlign: "center" }}>
        Think you can do better? 👀
      </p>
      <a className="btn btn-primary" href="/" style={{ textDecoration: "none" }}>
        Play Guess the Movie ▶️
      </a>
    </div>
  );
}
