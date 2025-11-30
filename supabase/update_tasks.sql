-- Add tags column to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS tags text[];
