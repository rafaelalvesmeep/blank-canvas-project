-- Add approved_by column to track who approved the vacation request
ALTER TABLE public.vacation_requests 
ADD COLUMN approved_by TEXT;