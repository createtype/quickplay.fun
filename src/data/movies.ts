// Movie data — now loaded from Supabase (M2).
// The library scales to many movies; selection is random, server-side.
import { getSupabase } from "@/lib/supabase";

export type Language = "hindi" | "tamil" | "malayalam";

export type Movie = {
  id: string;
  title: string;
  aliases: string[];
  language: Language;
  clip: string; // placeholder color for now (real GIF/video later)
};

// pickRounds — N random approved movies for the chosen languages
export async function pickRounds(
  languages: Language[],
  count: number
): Promise<Movie[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb.rpc("pick_rounds", { langs: languages, n: count });
  return (data as Movie[]) || [];
}

// getMoviesByIds — resolve a fixed room set, preserving the given order
export async function getMoviesByIds(ids: string[]): Promise<Movie[]> {
  const sb = getSupabase();
  if (!sb || ids.length === 0) return [];
  const { data } = await sb.from("movies").select("*").in("id", ids);
  const rows = (data as Movie[]) || [];
  return ids
    .map((id) => rows.find((m) => m.id === id))
    .filter((m): m is Movie => Boolean(m));
}
