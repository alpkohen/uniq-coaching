-- ============================================================
-- UNIQ Coaching — Initial Schema
-- ============================================================

-- ── Enum Types ───────────────────────────────────────────────

create type public.user_role as enum ('manager', 'learner');
create type public.task_status as enum ('pending', 'in_progress', 'completed');
create type public.message_role as enum ('user', 'assistant');

-- ── Tables ───────────────────────────────────────────────────

-- profiles: auth.users tablosunu genişletir
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        public.user_role not null,
  full_name   text not null,
  created_at  timestamptz not null default now()
);

-- tasks
create table public.tasks (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text not null default '',
  created_by   uuid not null references public.profiles(id) on delete cascade,
  assigned_to  uuid not null references public.profiles(id) on delete cascade,
  status       public.task_status not null default 'pending',
  due_date     date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- notes
create table public.notes (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references public.tasks(id) on delete cascade,
  author_id   uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- chat_sessions
create table public.chat_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  task_id     uuid references public.tasks(id) on delete set null,
  title       text not null default 'Yeni sohbet',
  created_at  timestamptz not null default now()
);

-- chat_messages
create table public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.chat_sessions(id) on delete cascade,
  role        public.message_role not null,
  content     text not null,
  created_at  timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────

create index tasks_assigned_to_idx  on public.tasks(assigned_to);
create index tasks_created_by_idx   on public.tasks(created_by);
create index notes_task_id_idx      on public.notes(task_id);
create index notes_author_id_idx    on public.notes(author_id);
create index chat_sessions_user_idx on public.chat_sessions(user_id);
create index chat_messages_sess_idx on public.chat_messages(session_id);

-- ── updated_at Trigger ───────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create trigger notes_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

-- ── Auto-create profile on signup ────────────────────────────
-- Yeni kullanıcı kaydolduğunda raw_user_meta_data'dan role ve
-- full_name alınarak profiles satırı otomatik oluşturulur.
-- Kullanıcıyı şöyle oluştur:
--   supabase.auth.signUp({ email, password,
--     options: { data: { role: 'learner', full_name: 'Sibel ...' } } })

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'learner'),
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Row Level Security ───────────────────────────────────────

alter table public.profiles      enable row level security;
alter table public.tasks         enable row level security;
alter table public.notes         enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

-- Helper: mevcut kullanıcının rolünü döndürür (performans için cache)
create or replace function public.current_user_role()
returns public.user_role language sql security definer stable as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ── profiles policies ────────────────────────────────────────

-- Herkes kendi profilini okur
create policy "profiles: own read"
  on public.profiles for select
  using (id = auth.uid());

-- Manager tüm profilleri okur (learner listesi için)
create policy "profiles: manager read all"
  on public.profiles for select
  using (public.current_user_role() = 'manager');

-- Sadece trigger insert eder; kullanıcı kendi adını güncelleyebilir
create policy "profiles: own update"
  on public.profiles for update
  using (id = auth.uid());

-- ── tasks policies ───────────────────────────────────────────

-- Manager: kendi oluşturduğu task'ları tam kontrol
create policy "tasks: manager full"
  on public.tasks for all
  using (
    public.current_user_role() = 'manager'
    and created_by = auth.uid()
  )
  with check (
    public.current_user_role() = 'manager'
    and created_by = auth.uid()
  );

-- Learner: kendisine atanan task'ları okur
create policy "tasks: learner read own"
  on public.tasks for select
  using (
    public.current_user_role() = 'learner'
    and assigned_to = auth.uid()
  );

-- Learner: yalnızca status sütununu güncelleyebilir
create policy "tasks: learner update status"
  on public.tasks for update
  using (
    public.current_user_role() = 'learner'
    and assigned_to = auth.uid()
  )
  with check (
    public.current_user_role() = 'learner'
    and assigned_to = auth.uid()
  );

-- ── notes policies ───────────────────────────────────────────

-- Learner: kendi notlarını yazar ve okur
create policy "notes: learner own"
  on public.notes for all
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

-- Manager: tüm notları okur
create policy "notes: manager read all"
  on public.notes for select
  using (public.current_user_role() = 'manager');

-- ── chat_sessions policies ───────────────────────────────────

-- Learner: kendi session'larını tam kontrol
create policy "chat_sessions: learner own"
  on public.chat_sessions for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Manager: tüm session'ları okur
create policy "chat_sessions: manager read all"
  on public.chat_sessions for select
  using (public.current_user_role() = 'manager');

-- ── chat_messages policies ───────────────────────────────────

-- Learner: kendi session'larına ait mesajları tam kontrol
create policy "chat_messages: learner own"
  on public.chat_messages for all
  using (
    session_id in (
      select id from public.chat_sessions where user_id = auth.uid()
    )
  )
  with check (
    session_id in (
      select id from public.chat_sessions where user_id = auth.uid()
    )
  );

-- Manager: tüm mesajları okur
create policy "chat_messages: manager read all"
  on public.chat_messages for select
  using (public.current_user_role() = 'manager');
