-- Add discord_webhook_url to profiles
ALTER TABLE public.profiles
ADD COLUMN discord_webhook_url text;

-- Add alert columns to tasks
ALTER TABLE public.tasks
ADD COLUMN alert_interval text, -- 'None', '1h', '24h', '1w'
ADD COLUMN last_alert_sent_at timestamp with time zone;
