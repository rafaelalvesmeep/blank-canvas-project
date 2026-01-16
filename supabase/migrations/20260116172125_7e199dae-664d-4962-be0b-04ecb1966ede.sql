
-- Change sector column from single value to array
ALTER TABLE public.profiles 
ALTER COLUMN sector TYPE public.app_sector[] 
USING CASE WHEN sector IS NULL THEN NULL ELSE ARRAY[sector] END;
