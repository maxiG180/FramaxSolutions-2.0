-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 0. Profiles (Membros da Agência)
-- Liga-se à tabela auth.users do Supabase
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text default 'Member', -- 'Admin', 'Member'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone,
  job_title text
);

-- 1. Clients Table
create table public.clients (
  id bigint primary key generated always as identity,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text,
  phone text,
  website text,
  status text check (status in ('Active', 'Inactive')) default 'Active',
  notes text
);

-- 2. Leads Table
create table public.leads (
  id bigint primary key generated always as identity,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  company_name text not null,
  contact_person text,
  email text,
  phone text,
  source text,
  status text default 'New',
  potential_value numeric(10, 2),
  currency text default 'EUR',
  notes text,
  next_follow_up date
);

-- 3. Projects Table
create table public.projects (
  id bigint primary key generated always as identity,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  client_id bigint references public.clients(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'In Progress',
  
  -- Financeiro
  payment_type text check (payment_type in ('One-Time', 'Recurring')) not null default 'One-Time',
  value numeric(10, 2) not null default 0,
  currency text default 'EUR',
  payment_status text default 'Pending',
  
  -- Prazos
  start_date date default CURRENT_DATE,
  deadline date,
  renewal_date date,
  
  -- Hierarquia
  parent_project_id bigint references public.projects(id) on delete set null
);

-- 4. Tasks Table
create table public.tasks (
  id bigint primary key generated always as identity,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id bigint references public.projects(id) on delete set null,
  title text not null,
  description text,
  status text default 'Todo',
  -- Agora assignee é um UUID ligado à tabela profiles
  assignee uuid references public.profiles(id) on delete set null, 
  priority text default 'Medium',
  due_date date
);

-- 5. Notes Table
create table public.notes (
  id bigint primary key generated always as identity,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  content text,
  client_id bigint references public.clients(id) on delete set null,
  project_id bigint references public.projects(id) on delete set null,
  lead_id bigint references public.leads(id) on delete set null,
  tags text[],
  created_by uuid references public.profiles(id) on delete set null -- Quem criou a nota
);

-- 6. Events Table
create table public.events (
  id bigint primary key generated always as identity,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  is_all_day boolean default false,
  location text,
  client_id bigint references public.clients(id) on delete set null,
  project_id bigint references public.projects(id) on delete set null,
  lead_id bigint references public.leads(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null
);

-- 7. Documents Table
create table public.documents (
  id bigint primary key generated always as identity,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id bigint references public.projects(id) on delete cascade not null,
  name text not null,
  type text,
  size bigint,
  url text not null,
  uploaded_by uuid references public.profiles(id) on delete set null
);

-- 8. Audit Logs
create table public.audit_logs (
  id bigint primary key generated always as identity,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  table_name text not null,
  record_id bigint not null,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  changed_by uuid references public.profiles(id) on delete set null
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.leads enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.events enable row level security;
alter table public.documents enable row level security;
alter table public.audit_logs enable row level security;

-- Permitir tudo (Dev)
create policy "Enable all access for all users" on public.profiles for all using (true) with check (true);
create policy "Enable all access for all users" on public.clients for all using (true) with check (true);
create policy "Enable all access for all users" on public.leads for all using (true) with check (true);
create policy "Enable all access for all users" on public.projects for all using (true) with check (true);
create policy "Enable all access for all users" on public.tasks for all using (true) with check (true);
create policy "Enable all access for all users" on public.notes for all using (true) with check (true);
create policy "Enable all access for all users" on public.events for all using (true) with check (true);
create policy "Enable all access for all users" on public.documents for all using (true) with check (true);
create policy "Enable all access for all users" on public.audit_logs for all using (true) with check (true);

-- Trigger para criar Profile automaticamente quando um User se regista
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'Member');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
