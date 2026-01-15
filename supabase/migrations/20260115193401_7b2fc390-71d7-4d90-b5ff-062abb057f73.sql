-- Create vacation_requests table for webhook integration
CREATE TABLE public.vacation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT NOT NULL UNIQUE,
    employee_id TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    employee_email TEXT NOT NULL,
    department TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'reprovada')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vacation_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public INSERT (for webhook)
CREATE POLICY "Allow public insert for webhook"
ON public.vacation_requests
FOR INSERT
WITH CHECK (true);

-- Policy: Allow authenticated users to SELECT
CREATE POLICY "Authenticated users can view vacation requests"
ON public.vacation_requests
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to UPDATE status
CREATE POLICY "Authenticated users can update vacation requests"
ON public.vacation_requests
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_vacation_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vacation_requests_updated_at
BEFORE UPDATE ON public.vacation_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_vacation_requests_updated_at();

-- Add index for faster lookups
CREATE INDEX idx_vacation_requests_status ON public.vacation_requests(status);
CREATE INDEX idx_vacation_requests_external_id ON public.vacation_requests(external_id);