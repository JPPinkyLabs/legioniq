-- Add RLS policy to allow admins to view all requests
-- This policy allows users with role 'admin' in profiles table to view all requests
-- Regular users can still only view their own requests via the existing policy

CREATE POLICY "Admins can view all requests"
    ON public.requests FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

