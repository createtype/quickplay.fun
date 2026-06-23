-- quickplay.fun — M3 Friends mode schema
-- Run this in the Supabase SQL editor once.

-- rooms — one shared game session
create table if not exists rooms (
  id text primary key,                       -- short share code, e.g. "AB3K9"
  mode text not null default 'friends',
  host_name text not null,
  languages text[] not null,
  timer_seconds int not null default 20,
  round_count int not null default 5,
  movie_ids text[] not null,                 -- fixed set everyone plays
  created_at timestamptz not null default now()
);

-- players — people who joined a room
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references rooms(id) on delete cascade,
  name text not null,
  score int not null default 0,
  finished boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists players_room_idx on players(room_id);

-- Realtime: broadcast player changes to the room leaderboard
alter publication supabase_realtime add table players;

-- M3 prototype: open access. Tighten before public launch.
alter table rooms enable row level security;
alter table players enable row level security;

create policy "rooms_read"   on rooms   for select using (true);
create policy "rooms_insert" on rooms   for insert with check (true);
create policy "players_read"   on players for select using (true);
create policy "players_insert" on players for insert with check (true);
create policy "players_update" on players for update using (true);
