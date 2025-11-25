-- Create requests_cache table for caching OpenAI responses
-- Cache entries expire after 7 days
-- Cache is shared across all users (same input = same response)

CREATE TABLE public.requests_cache (
    cache_key TEXT PRIMARY KEY,
    request_id UUID REFERENCES public.requests(id) ON DELETE SET NULL,
    category app_category NOT NULL,
    text_hash TEXT NOT NULL,
    images_key TEXT NOT NULL,
    result JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Create indexes for efficient lookups and cleanup
CREATE INDEX idx_requests_cache_expires_at ON public.requests_cache(expires_at);
CREATE INDEX idx_requests_cache_category_text_images ON public.requests_cache(category, text_hash, images_key);

-- Enable Row Level Security
ALTER TABLE public.requests_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only service role can access cache (Edge Functions)
CREATE POLICY "Service role can manage cache"
    ON public.requests_cache
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.requests_cache
    WHERE expires_at < now();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

