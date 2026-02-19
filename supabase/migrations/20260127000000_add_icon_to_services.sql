-- Add icon field to services table
alter table public.services add column if not exists icon text default 'Layers';

-- Add comment to explain the icon field
comment on column public.services.icon is 'Lucide icon name for the service (e.g., Code, Palette, TrendingUp)';
