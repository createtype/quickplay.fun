// Room + player operations for Friends mode.
import { getSupabase } from "@/lib/supabase";
import { pickRounds, type Language } from "@/data/movies";
import { ROUND_SECONDS } from "@/app/GameRounds";

export type Player = {
  id: string;
  room_id: string;
  name: string;
  score: number;
  finished: boolean;
  finished_at?: string | null;
};

export type Room = {
  id: string;
  host_name: string;
  languages: Language[];
  timer_seconds: number;
  round_count: number;
  movie_ids: string[];
  created_at?: string;
};

export const FRIENDS_COUNTS = [4, 6, 8] as const; // host picks
const DEFAULT_COUNT = 4;

// makeCode
function makeCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// createRoom — host creates the shared set
export async function createRoom(
  hostName: string,
  languages: Language[],
  roundCount: number = DEFAULT_COUNT
): Promise<Room | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const movies = await pickRounds(languages, roundCount);
  if (movies.length === 0) return null;
  const room = {
    id: makeCode(),
    mode: "friends",
    host_name: hostName,
    languages,
    timer_seconds: ROUND_SECONDS,
    round_count: movies.length, // actual count (may be < requested if pool is small)
    movie_ids: movies.map((m) => m.id),
  };
  const { error } = await sb.from("rooms").insert(room);
  if (error) return null;
  return room as Room;
}

// getRoom
export async function getRoom(id: string): Promise<Room | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("rooms").select("*").eq("id", id).single();
  return (data as Room) || null;
}

// joinRoom — add a player
export async function joinRoom(
  roomId: string,
  name: string
): Promise<Player | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("players")
    .insert({ room_id: roomId, name })
    .select()
    .single();
  if (error) return null;
  return data as Player;
}

// finishPlayer — store final score
export async function finishPlayer(
  playerId: string,
  score: number
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb
    .from("players")
    .update({ score, finished: true })
    .eq("id", playerId);
}

// listPlayers
export async function listPlayers(roomId: string): Promise<Player[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("players")
    .select("*")
    .eq("room_id", roomId)
    .order("score", { ascending: false });
  return (data as Player[]) || [];
}

// subscribePlayers — realtime leaderboard updates
export function subscribePlayers(
  roomId: string,
  onChange: () => void
): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};
  // Unique channel name per subscription avoids reusing an already-subscribed
  // channel (which throws if .on() runs after subscribe, e.g. Strict Mode).
  const channel = sb
    .channel(`room:${roomId}:${Math.random().toString(36).slice(2)}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "players", filter: `room_id=eq.${roomId}` },
      () => onChange()
    )
    .subscribe();
  return () => {
    sb.removeChannel(channel);
  };
}
