// Public feature/feedback suggestions. Insert-only; read in the Supabase dashboard.
import { getSupabase } from "@/lib/supabase";

const MAX_BODY = 1000;
const MAX_NAME = 60;

// Strip ASCII control chars (0x00-0x1F and 0x7F) as defense-in-depth.
const CONTROL = new RegExp("[\\u0000-\\u001F\\u007F]", "g");

// clean — drop control chars, trim, cap length. Stored as plain text and never
// rendered with raw HTML, so any script tag stays inert text.
function clean(s: string, max: number): string {
  return s.replace(CONTROL, " ").trim().slice(0, max);
}

// submitSuggestion — insert one suggestion
export async function submitSuggestion(input: {
  body: string;
  name?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Not configured." };

  const body = clean(input.body, MAX_BODY);
  if (!body) return { ok: false, error: "Write your idea first." };
  const name = clean(input.name || "", MAX_NAME) || null;

  const { error } = await sb.from("suggestions").insert({ body, name });
  if (error) return { ok: false, error: "Couldn't send. Try again." };
  return { ok: true };
}
