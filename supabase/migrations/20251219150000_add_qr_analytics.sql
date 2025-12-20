-- Create QR Scans table for detailed analytics
create table if not exists public.qr_scans (
  id uuid primary key default uuid_generate_v4(),
  qr_code_id uuid references public.qr_codes(id) on delete cascade not null,
  scanned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ip_address text,
  user_agent text,
  referer text,
  country text,
  city text
);

-- Enable RLS
alter table public.qr_scans enable row level security;

-- Policies
create policy "Users can view scans for their own QR codes"
  on public.qr_scans for select
  using (
    exists (
      select 1 from public.qr_codes
      where qr_codes.id = qr_scans.qr_code_id
      and qr_codes.user_id = auth.uid()
    )
  );

create policy "Allow public scan logging"
  on public.qr_scans for insert
  with check (true);
