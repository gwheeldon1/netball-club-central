-- First, update the guardian linked to Ava to use the auth user ID
UPDATE public.guardians 
SET id = '82e0de72-534b-4a0d-9379-05b86a29f2c5'
WHERE id = '16547766-5dcb-4385-b319-ea438abce48e';

-- Update the guardian linked to Milla to also use the auth user ID
-- We need to create a new guardian record since we can't have duplicate IDs
-- First, let's delete the duplicate and update the player_id reference
UPDATE public.guardians
SET player_id = '2043f57e-a1e1-42d9-ad2c-d0e962ea9908'
WHERE id = '82e0de72-534b-4a0d-9379-05b86a29f2c5';

-- Delete the duplicate guardian record
DELETE FROM public.guardians 
WHERE id = '90889ce3-935b-47d7-ae16-256370845b36';