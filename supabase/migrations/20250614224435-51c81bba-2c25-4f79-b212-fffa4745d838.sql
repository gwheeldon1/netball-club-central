-- Create event recurrence tracking table
CREATE TABLE public.event_recurrence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('weekly', 'biweekly', 'monthly')),
  recurrence_interval INTEGER NOT NULL DEFAULT 1,
  days_of_week INTEGER[] CHECK (array_length(days_of_week, 1) <= 7),
  end_date DATE,
  max_occurrences INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better performance
CREATE INDEX idx_event_recurrence_parent ON public.event_recurrence(parent_event_id);

-- Enable RLS
ALTER TABLE public.event_recurrence ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view recurrence for events they can see" 
ON public.event_recurrence 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = parent_event_id
  )
);

CREATE POLICY "Coaches/Managers/Admins can manage recurrence" 
ON public.event_recurrence 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE guardian_id = auth.uid() 
    AND role IN ('coach', 'manager', 'admin')
    AND is_active = true
  )
);

-- Add missing recurrence fields to events table (only add if they don't exist)
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS occurrence_date DATE;

-- Create index for recurring events
CREATE INDEX IF NOT EXISTS idx_events_parent ON public.events(parent_event_id);
CREATE INDEX IF NOT EXISTS idx_events_occurrence_date ON public.events(occurrence_date);