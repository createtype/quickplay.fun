// Public movie submissions (M4). Submissions land as 'pending'.
import { getSupabase } from "@/lib/supabase";
import type { Language } from "@/data/movies";

export type SubmissionInput = {
  title: string;
  language: Language;
  aliases: string[];
  youtubeUrl?: string;
  screenshots?: string[];
  submittedBy?: string;
};

// slugId — short id from title + random suffix
function slugId(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  const rand = Math.random().toString(36).slice(2, 7);
  return `${base || "movie"}-${rand}`;
}

// submitMovie — insert a pending movie for review
export async function submitMovie(
  input: SubmissionInput
): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Not configured." };

  const row = {
    id: slugId(input.title),
    title: input.title.trim(),
    language: input.language,
    aliases: input.aliases,
    status: "pending",
    submitted_by: input.submittedBy?.trim() || null,
    youtube_url: input.youtubeUrl?.trim() || null,
    screenshots: input.screenshots || [],
  };

  const { error } = await sb.from("movies").insert(row);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
