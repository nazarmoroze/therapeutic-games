-- ─── Profiles ──────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  email       text        not null unique,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ─── Trigger: auto-create profile on signup ────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Trigger: keep updated_at fresh ────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ─── Game Sessions ──────────────────────────────────────────────────────────

create type public.game_type as enum (
  'emotional-recognition',
  'breathing',
  'attention',
  'memory'
);

create table if not exists public.game_sessions (
  id            uuid          primary key default gen_random_uuid(),
  user_id       uuid          not null references public.profiles(id) on delete cascade,
  game_type     game_type     not null,
  started_at    timestamptz   not null default now(),
  completed_at  timestamptz,
  score         integer,
  duration_sec  integer,
  metrics       jsonb,
  pdf_url       text,
  created_at    timestamptz   not null default now()
);

alter table public.game_sessions enable row level security;

create policy "Users can view own sessions"
  on public.game_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.game_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.game_sessions for update
  using (auth.uid() = user_id);
