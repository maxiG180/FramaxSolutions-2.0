-- Add google_calendar_refresh_token column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS google_calendar_refresh_token TEXT;
