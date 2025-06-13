-- Add approval status and consent fields to guardians table
ALTER TABLE public.guardians 
ADD COLUMN approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN profile_image text,
ADD COLUMN terms_accepted boolean DEFAULT false,
ADD COLUMN code_of_conduct_accepted boolean DEFAULT false,
ADD COLUMN photo_consent boolean DEFAULT false,
ADD COLUMN registration_date timestamp with time zone DEFAULT now(),
ADD COLUMN approved_at timestamp with time zone,
ADD COLUMN approved_by uuid REFERENCES public.guardians(id),
ADD COLUMN rejection_reason text;

-- Add approval status to players table
ALTER TABLE public.players 
ADD COLUMN approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN profile_image text,
ADD COLUMN team_preference uuid REFERENCES public.teams(id),
ADD COLUMN approved_at timestamp with time zone,
ADD COLUMN approved_by uuid REFERENCES public.guardians(id),
ADD COLUMN rejection_reason text;

-- Update RLS policies for guardians to include approval status checks
CREATE POLICY "Admins can view all guardians regardless of status" 
ON public.guardians 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Coaches and managers can view approved guardians" 
ON public.guardians 
FOR SELECT 
USING (
  approval_status = 'approved' AND 
  (public.has_role(auth.uid(), 'coach') OR public.has_role(auth.uid(), 'manager'))
);

-- Update RLS policies for players to include approval status checks
CREATE POLICY "Admins can view all players regardless of status" 
ON public.players 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Coaches and managers can view approved players in their teams" 
ON public.players 
FOR SELECT 
USING (
  approval_status = 'approved' AND
  EXISTS (
    SELECT 1 FROM public.player_teams pt
    WHERE pt.player_id = id 
      AND (
        public.has_team_role(auth.uid(), 'coach', pt.team_id) OR
        public.has_team_role(auth.uid(), 'manager', pt.team_id)
      )
  )
);

-- Function to calculate UK school year age group based on date of birth
CREATE OR REPLACE FUNCTION public.calculate_uk_age_group(date_of_birth date)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  school_year_start date;
  age_on_sept_1 integer;
BEGIN
  -- UK school year starts September 1st
  school_year_start := date_trunc('year', CURRENT_DATE) + interval '8 months';
  
  -- If we're before September 1st this year, use last year's September 1st
  IF CURRENT_DATE < school_year_start THEN
    school_year_start := school_year_start - interval '1 year';
  END IF;
  
  -- Calculate age as of September 1st of current school year
  age_on_sept_1 := date_part('year', school_year_start) - date_part('year', date_of_birth);
  
  -- Adjust if birthday hasn't occurred by Sept 1st
  IF date_of_birth + (age_on_sept_1 * interval '1 year') > school_year_start THEN
    age_on_sept_1 := age_on_sept_1 - 1;
  END IF;
  
  -- Return appropriate age group
  CASE 
    WHEN age_on_sept_1 <= 6 THEN RETURN 'U7';
    WHEN age_on_sept_1 <= 7 THEN RETURN 'U8'; 
    WHEN age_on_sept_1 <= 8 THEN RETURN 'U9';
    WHEN age_on_sept_1 <= 9 THEN RETURN 'U10';
    WHEN age_on_sept_1 <= 10 THEN RETURN 'U11';
    WHEN age_on_sept_1 <= 11 THEN RETURN 'U12';
    WHEN age_on_sept_1 <= 12 THEN RETURN 'U13';
    WHEN age_on_sept_1 <= 13 THEN RETURN 'U14';
    WHEN age_on_sept_1 <= 14 THEN RETURN 'U15';
    WHEN age_on_sept_1 <= 15 THEN RETURN 'U16';
    WHEN age_on_sept_1 <= 16 THEN RETURN 'U17';
    ELSE RETURN 'U18';
  END CASE;
END;
$$;