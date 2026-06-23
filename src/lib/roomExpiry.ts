// Room link lifetime: expires at the EARLIER of
//   - 48h after creation (hard cap), or
//   - 24h after the last player finished.
import type { Player } from "@/lib/rooms";

const HARD_CAP_MS = 48 * 60 * 60 * 1000;
const AFTER_DONE_MS = 24 * 60 * 60 * 1000;

// roomExpiry — returns the expiry Date, given creation + players
export function roomExpiry(
  createdAt: string,
  players: Player[]
): Date {
  const created = new Date(createdAt).getTime();
  const hardCap = created + HARD_CAP_MS;

  const finished = players.filter((p) => p.finished && p.finished_at);
  const everyoneDone = players.length > 0 && finished.length === players.length;

  if (everyoneDone) {
    const lastFinish = Math.max(
      ...finished.map((p) => new Date(p.finished_at as string).getTime())
    );
    return new Date(Math.min(hardCap, lastFinish + AFTER_DONE_MS));
  }
  return new Date(hardCap);
}

// isExpired
export function isExpired(createdAt: string, players: Player[]): boolean {
  return Date.now() > roomExpiry(createdAt, players).getTime();
}
