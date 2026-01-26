-- Create employees table to list employees independently of vacation requests
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT NOT NULL,
  team_leader TEXT,
  hire_date DATE,
  vacation_balance INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Policies for viewing employees (authenticated users can view)
CREATE POLICY "Authenticated users can view employees"
ON public.employees
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Admins can manage employees
CREATE POLICY "Admins can insert employees"
ON public.employees
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'rh'::app_role));

CREATE POLICY "Admins can update employees"
ON public.employees
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'rh'::app_role));

CREATE POLICY "Admins can delete employees"
ON public.employees
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'rh'::app_role));

-- Gestores can view employees from their sectors
CREATE POLICY "Gestores can view sector employees"
ON public.employees
FOR SELECT
USING (
  has_role(auth.uid(), 'gestor'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND department = ANY(
      SELECT REPLACE(REPLACE(INITCAP(s::text), '_', ' '), 'Cs ', 'CS ')
      FROM unnest(profiles.sector) AS s
    )
  )
);

-- Create vacation_credits table for tracking credit adjustments
CREATE TABLE public.vacation_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  credit_days INTEGER NOT NULL,
  reason TEXT,
  reference_year INTEGER NOT NULL,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vacation_credits ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view vacation credits"
ON public.vacation_credits
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and RH can manage vacation credits"
ON public.vacation_credits
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'rh'::app_role));

-- Trigger for updated_at on employees
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.update_vacation_requests_updated_at();