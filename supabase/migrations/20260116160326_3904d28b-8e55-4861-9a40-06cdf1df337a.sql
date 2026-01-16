-- Drop existing restrictive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view vacation requests" ON public.vacation_requests;

-- Create new public SELECT policy
CREATE POLICY "Anyone can view vacation requests" 
ON public.vacation_requests 
FOR SELECT 
USING (true);

-- Drop existing restrictive UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update vacation requests" ON public.vacation_requests;

-- Create new public UPDATE policy (allows managers to approve/reject without auth)
CREATE POLICY "Anyone can update vacation requests" 
ON public.vacation_requests 
FOR UPDATE 
USING (true)
WITH CHECK (true);