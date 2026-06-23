-- quickplay.fun — M6 security hardening
-- Run once in the Supabase SQL editor. Closes the players score-tampering hole.

-- The old policy let ANY client set ANY player's score to anything (cheat/vandalism).
drop policy if exists "players_update" on players;

-- A finished row is locked; score must be within range; can only go finished false->true.
-- Validates the NEW row state via WITH CHECK and the row being changed via USING.
create policy "players_finish"
  on players for update
  using (finished = false)                         -- only un-finished rows can change
  with check (
    finished = true                                 -- the update must mark it finished
    and score >= 0
    and score <= (
      select round_count from rooms where rooms.id = players.room_id
    )
  );

-- Keep submissions clean: cap how a row enters (still public, still pending-only handled
-- by movies_submit). No change needed there.

-- NOTE (still open, acceptable for launch / lower priority):
--   * rooms/players inserts are unauthenticated (no rate limiting) — spam risk only.
--   * clip URLs are public (Storage bucket) — see signed-URL note in docs; deferred.
