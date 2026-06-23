-- quickplay.fun — feature/feedback suggestions box
-- Run once in the Supabase SQL editor.

create table if not exists suggestions (
  id          uuid primary key default gen_random_uuid(),
  body        text not null check (char_length(body) between 1 and 1000),
  name        text check (char_length(name) <= 60),
  created_at  timestamptz not null default now()
);

alter table suggestions enable row level security;

-- Public can ADD a suggestion only. No read/update/delete with the browser key,
-- so submissions can't be listed, edited, or wiped from the client. You read
-- them in the Supabase dashboard.
drop policy if exists suggestions_insert on suggestions;
create policy suggestions_insert
  on suggestions for insert
  with check (char_length(body) between 1 and 1000);
