-- Create QR Codes table for dynamic redirects
create table if not exists public.qr_codes (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  slug text unique not null,
  target_url text not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  scans_count bigint default 0
);

-- Enable RLS
alter table public.qr_codes enable row level security;

-- Policies
create policy "Enable all access for all users" on public.qr_codes for all using (true) with check (true);

-- Function to increment scans
create or replace function public.increment_qr_scans(qr_slug text)
returns void as $$
begin
  update public.qr_codes
  set scans_count = scans_count + 1
  where slug = qr_slug;
end;
$$ language plpgsql security definer;
