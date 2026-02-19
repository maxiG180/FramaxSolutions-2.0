-- Create service_inclusions junction table for many-to-many relationship
-- Allows a service to include other services (e.g., "Website" includes "Domain and Hosting" and "Maintenance")
create table if not exists public.service_inclusions (
  id uuid primary key default uuid_generate_v4(),
  parent_service_id uuid references public.services(id) on delete cascade not null,
  included_service_id uuid references public.services(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Ensure a service can't include itself and prevent duplicate inclusions
  check (parent_service_id != included_service_id),
  unique (parent_service_id, included_service_id)
);

-- Enable RLS
alter table public.service_inclusions enable row level security;

-- Drop existing policies if they exist (for idempotency)
drop policy if exists "Users can view all service inclusions" on public.service_inclusions;
drop policy if exists "Users can manage their own service inclusions" on public.service_inclusions;

-- Create policies for service_inclusions
create policy "Users can view all service inclusions"
  on public.service_inclusions for select
  using (true);

create policy "Users can manage their own service inclusions"
  on public.service_inclusions for all
  using (
    exists (
      select 1 from public.services
      where services.id = service_inclusions.parent_service_id
      and services.user_id = auth.uid()
    )
  );

-- Create indexes for faster queries
create index if not exists service_inclusions_parent_idx on public.service_inclusions(parent_service_id);
create index if not exists service_inclusions_included_idx on public.service_inclusions(included_service_id);
