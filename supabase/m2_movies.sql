-- quickplay.fun — M2 movies table + random picker
-- Run this once in the Supabase SQL editor (after schema.sql).

-- movies — the content library (fed later by submissions + media pipeline)
create table if not exists movies (
  id text primary key,
  title text not null,
  aliases text[] not null default '{}',
  language text not null,                     -- hindi | tamil | malayalam
  clip text not null default '#1f2937',       -- placeholder color now; clip path later
  status text not null default 'approved',    -- pending | approved | rejected
  created_at timestamptz not null default now()
);

create index if not exists movies_lang_status_idx on movies(language, status);

-- pick_rounds — N random APPROVED movies for the chosen languages (server-side)
create or replace function pick_rounds(langs text[], n int)
returns setof movies
language sql
stable
as $$
  select *
  from movies
  where status = 'approved'
    and language = any(langs)
  order by random()
  limit n;
$$;

-- RLS: read-only for the public client (writes happen via approval flow later)
alter table movies enable row level security;
create policy "movies_read" on movies for select using (true);

-- Seed the M1 placeholder movies so the app works immediately.
insert into movies (id, title, aliases, language, clip) values
  ('m1', 'Baahubali', array['Bahubali','Baahubali The Beginning'], 'hindi', '#1f2937'),
  ('m2', 'RRR',       array['R R R'],                              'hindi', '#7c2d12'),
  ('m3', 'Vikram',    array['Vikraman'],                          'tamil', '#1e3a8a'),
  ('m4', 'Master',    array[]::text[],                            'tamil', '#3f6212'),
  ('m5', 'Premam',    array['Prem'],                              'malayalam', '#6b21a8'),
  ('m6', 'Drishyam',  array['Drishyam Malayalam'],                'malayalam', '#9f1239')
on conflict (id) do nothing;
