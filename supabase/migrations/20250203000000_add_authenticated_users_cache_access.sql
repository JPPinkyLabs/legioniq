-- Add RLS policies to allow authenticated users to read and write to requests_cache
-- Cache is shared across all users (same input = same response)

-- Policy: Authenticated users can read cache entries
CREATE POLICY "Authenticated users can read cache"
    ON public.requests_cache
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy: Authenticated users can insert cache entries
CREATE POLICY "Authenticated users can insert cache"
    ON public.requests_cache
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

