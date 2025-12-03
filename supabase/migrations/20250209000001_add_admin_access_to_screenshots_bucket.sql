-- Add RLS policy to allow admins to view all screenshots
-- This policy allows users with role 'admin' in profiles table to view all screenshots
-- Regular users can still only view their own screenshots via the existing policy

CREATE POLICY "Admins can view all screenshots"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'screenshots' AND
        EXISTS (
            SELECT 1 
            FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

