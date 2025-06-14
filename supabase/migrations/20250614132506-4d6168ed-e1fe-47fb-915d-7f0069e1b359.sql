-- Add recurrence fields to events table
ALTER TABLE public.events 
ADD COLUMN recurrence_type TEXT,
ADD COLUMN recurrence_interval INTEGER DEFAULT 1,
ADD COLUMN recurrence_days TEXT[], -- For weekly recurrence (e.g., ['monday', 'wednesday'])
ADD COLUMN recurrence_end_date DATE,
ADD COLUMN parent_event_id UUID REFERENCES public.events(id);

-- Create index for better performance on recurrence queries
CREATE INDEX idx_events_recurrence ON public.events(parent_event_id, recurrence_type);
CREATE INDEX idx_events_date ON public.events(event_date);

-- Expand RSVP options in event_responses
ALTER TABLE public.event_responses 
ADD COLUMN attendance_status TEXT DEFAULT 'not_marked', -- 'present', 'absent', 'injured', 'late', 'not_marked'
ADD COLUMN marked_by UUID REFERENCES public.guardians(id);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  read BOOLEAN NOT NULL DEFAULT false,
  related_event_id UUID REFERENCES public.events(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (user_id = auth.uid());

-- Create function to update notification timestamps
CREATE OR REPLACE FUNCTION public.update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notification timestamps
CREATE TRIGGER update_notifications_updated_at
BEFORE UPDATE ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_notifications_updated_at();

-- Add indexes for better performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);