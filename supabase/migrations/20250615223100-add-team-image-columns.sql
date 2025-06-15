
-- Add image columns to teams table
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS profile_image text;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS banner_image text;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS icon text;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS description text;
