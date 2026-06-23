-- quickplay.fun — only serve movies that have a real clip
-- Run once in the Supabase SQL editor.
-- Placeholder clips start with '#' (a color block, not a real video). Those
-- should never appear in a game, so the picker now excludes them.

create or replace function pick_rounds(langs text[], n int)
returns setof movies
language sql
stable
as $$
  select *
  from movies
  where status = 'approved'
    and language = any(langs)
    and clip not like '#%'
  order by random()
  limit n;
$$;
