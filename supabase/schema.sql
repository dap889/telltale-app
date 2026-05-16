-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'pro')),
  created_at timestamptz not null default now()
);

-- Sessions table
create table public.sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  mode text not null check (mode in ('interview', 'presentation', 'casual', 'custom')),
  duration_seconds int not null default 0,
  audio_url text,
  transcript text,
  overall_score int check (overall_score between 0 and 100),
  created_at timestamptz not null default now()
);

-- Session feedback table
create table public.session_feedback (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.sessions(id) on delete cascade not null,
  category text not null check (category in ('filler_words', 'pacing', 'tone', 'confidence', 'clarity')),
  score int not null check (score between 0 and 100),
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.sessions enable row level security;
alter table public.session_feedback enable row level security;

-- RLS Policies: profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- RLS Policies: sessions
create policy "Users can view own sessions" on public.sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on public.sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions" on public.sessions for update using (auth.uid() = user_id);
create policy "Users can delete own sessions" on public.sessions for delete using (auth.uid() = user_id);

-- RLS Policies: session_feedback
create policy "Users can view own session feedback" on public.session_feedback for select
  using (exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid()));
create policy "Service role can insert feedback" on public.session_feedback for insert
  with check (true);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes for performance
create index sessions_user_id_idx on public.sessions(user_id);
create index sessions_created_at_idx on public.sessions(created_at desc);
create index session_feedback_session_id_idx on public.session_feedback(session_id);
