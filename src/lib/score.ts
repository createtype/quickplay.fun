// Scoring + stylish end-of-game titles.

// rankTitle — by fraction correct, so it works for 4/6/8-round games too
export function rankTitle(
  correct: number,
  total = 5
): { title: string; emoji: string } {
  const pct = total > 0 ? correct / total : 0;
  if (correct === total && total > 0) return { title: "Certified Legend", emoji: "🏆" };
  if (pct >= 0.8) return { title: "Total Cinema God", emoji: "🍿" };
  if (pct >= 0.6) return { title: "Big Screen Brain", emoji: "🎬" };
  if (pct >= 0.4) return { title: "Casual Binger", emoji: "🎞️" };
  if (pct > 0) return { title: "Warming Up", emoji: "📺" };
  return { title: "Blanked Out", emoji: "🫠" };
}
