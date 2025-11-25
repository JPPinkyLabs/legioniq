-- Create request_cache table for caching OpenAI responses
-- This table stores cached results based on image hash + category
-- to avoid expensive OpenAI API calls for duplicate requests

CREATE TABLE public.request_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_hash TEXT NOT NULL,
    category app_category NOT NULL,
    ocr_text TEXT NOT NULL,
    model_response TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    use_count INTEGER DEFAULT 1,
    -- Composite unique constraint: same image + category = same cache entry
    UNIQUE(image_hash, category)
);

-- Create index for fast lookups
CREATE INDEX idx_request_cache_hash_category ON public.request_cache(image_hash, category);
CREATE INDEX idx_request_cache_last_used ON public.request_cache(last_used_at);

-- Enable Row Level Security
ALTER TABLE public.request_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only service role can access cache (Edge Functions)
CREATE POLICY "Service role can manage cache"
    ON public.request_cache
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Function to update last_used_at and increment use_count
CREATE OR REPLACE FUNCTION public.update_cache_usage()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_used_at = now();
    NEW.use_count = OLD.use_count + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-update usage stats
CREATE TRIGGER update_cache_usage_trigger
    BEFORE UPDATE ON public.request_cache
    FOR EACH ROW
    EXECUTE FUNCTION public.update_cache_usage();

-- Optional: Function to clean old cache entries (older than 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.request_cache
    WHERE last_used_at < now() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

