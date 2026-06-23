-- quickplay.fun — M4 submission flow
-- Run once in the Supabase SQL editor (after m2_movies.sql).

-- Submission source columns on movies (pipeline consumes these in M5).
alter table movies add column if not exists submitted_by  text;
alter table movies add column if not exists youtube_url   text;
alter table movies add column if not exists screenshots   text[] not null default '{}';

-- Public submissions land as 'pending'; you approve them directly in the
-- Supabase dashboard by setting status = 'approved'.
-- Allow public inserts only when status is 'pending' (can't self-approve).
create policy "movies_submit"
  on movies for insert
  with check (status = 'pending');
