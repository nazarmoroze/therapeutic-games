-- ─── Session status ────────────────────────────────────────────────────────

create type public.session_status as enum ('in_progress', 'completed');

-- ─── Sessions (multi-game diagnostic sessions) ─────────────────────────────

create table if not exists public.sessions (
  id              uuid              primary key default gen_random_uuid(),
  user_id         uuid              not null references public.profiles(id) on delete cascade,
  status          session_status    not null default 'in_progress',

  -- Patient demographics collected at session start
  patient_age     smallint          check (patient_age between 1 and 120),
  patient_gender  text,
  has_glasses     boolean           not null default false,

  -- Ordered list of game slugs selected for this session
  selected_games  text[]            not null,

  -- Array of completed game result objects (jsonb)
  -- Each element: { gameType, score, durationMs, completedAt, rawData }
  game_results    jsonb             not null default '[]'::jsonb,

  overall_score   smallint          check (overall_score between 0 and 100),

  started_at      timestamptz       not null default now(),
  completed_at    timestamptz,
  pdf_url         text,
  created_at      timestamptz       not null default now()
);

alter table public.sessions enable row level security;

create policy "Users can view own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.sessions for update
  using (auth.uid() = user_id);

-- Fast lookup: all sessions for a user ordered by date
create index sessions_user_created on public.sessions (user_id, created_at desc);
