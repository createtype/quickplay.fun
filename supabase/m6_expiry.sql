-- quickplay.fun — M6 room link expiry
-- Run once in the Supabase SQL editor.
-- (Signed clip URLs intentionally deferred — see docs; not needed for a non-commercial,
--  screenshots-only project.)

-- Room expiry needs when each player finished.
alter table players add column if not exists finished_at timestamptz;

-- Set finished_at automatically whenever a player is marked finished.
create or replace function set_finished_at()
returns trigger language plpgsql as $$
begin
  if new.finished and (old.finished is distinct from new.finished) then
    new.finished_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists players_finished_at on players;
create trigger players_finished_at
  before update on players
  for each row execute function set_finished_at();
