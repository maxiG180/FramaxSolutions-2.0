-- Create Services table for managing agency service offerings
create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  billing_type text not null check (billing_type in ('One-Time', 'Recurring')),
  price_type text not null check (price_type in ('Fixed', 'Starting From', 'Custom Quote')),
  base_price numeric check (base_price >= 0),
  recurring_interval text check (recurring_interval in ('Monthly', 'Quarterly', 'Yearly')),
  currency text not null default 'EUR',
  user_id uuid references public.profiles(id) on delete cascade not null,
  category text
);

-- Enable RLS
alter table public.services enable row level security;

-- Drop existing policies if they exist (for idempotency)
drop policy if exists "Users can view all services" on public.services;
drop policy if exists "Users can create their own services" on public.services;
drop policy if exists "Users can update their own services" on public.services;
drop policy if exists "Users can delete their own services" on public.services;

-- Create policies for services
create policy "Users can view all services"
  on public.services for select
  using (true);

create policy "Users can create their own services"
  on public.services for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own services"
  on public.services for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own services"
  on public.services for delete
  using (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to auto-update updated_at
create trigger set_updated_at
  before update on public.services
  for each row
  execute function public.handle_updated_at();

-- Create index for faster queries
create index if not exists services_user_id_idx on public.services(user_id);
create index if not exists services_status_idx on public.services(status);