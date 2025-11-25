-- Drop requests_cache table first (it has foreign key to requests)
-- This will delete all cache entries
DROP TABLE IF EXISTS public.requests_cache CASCADE;

-- Drop the requests table (this will delete all request data)
DROP TABLE IF EXISTS public.requests CASCADE;

-- Recreate requests table with updated schema
CREATE TABLE public.requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    advice_id UUID NOT NULL REFERENCES category_advices(id) ON DELETE RESTRICT,
    ocr_text TEXT,
    model_response TEXT,
    image_url TEXT[],
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add comment to document the columns
COMMENT ON COLUMN public.requests.category_id IS 'Reference to the selected category';
COMMENT ON COLUMN public.requests.advice_id IS 'Reference to the selected advice (optional)';
COMMENT ON COLUMN public.requests.image_url IS 'Array of screenshot image URLs stored in Supabase Storage (max 5 per request)';

-- Create indexes for better query performance
CREATE INDEX idx_requests_user_id ON public.requests(user_id);
CREATE INDEX idx_requests_category_id ON public.requests(category_id);
CREATE INDEX idx_requests_advice_id ON public.requests(advice_id);
CREATE INDEX idx_requests_created_at ON public.requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for requests table
CREATE POLICY "Users can view their own requests"
    ON public.requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests"
    ON public.requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests"
    ON public.requests FOR UPDATE
    USING (auth.uid() = user_id);

-- Recreate requests_cache table with updated schema
CREATE TABLE public.requests_cache (
    cache_key TEXT PRIMARY KEY,
    request_id UUID REFERENCES public.requests(id) ON DELETE SET NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    advice_id UUID NOT NULL REFERENCES category_advices(id) ON DELETE CASCADE,
    text_hash TEXT NOT NULL,
    images_key TEXT NOT NULL,
    result JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Add comments to document the columns
COMMENT ON COLUMN public.requests_cache.category_id IS 'Reference to the category used for caching';
COMMENT ON COLUMN public.requests_cache.advice_id IS 'Reference to the advice used for caching (optional)';

-- Create indexes for efficient lookups and cleanup
CREATE INDEX idx_requests_cache_expires_at ON public.requests_cache(expires_at);
CREATE INDEX idx_requests_cache_category_id ON public.requests_cache(category_id);
CREATE INDEX idx_requests_cache_advice_id ON public.requests_cache(advice_id);
CREATE INDEX idx_requests_cache_category_text_images ON public.requests_cache(category_id, text_hash, images_key);

-- Enable Row Level Security
ALTER TABLE public.requests_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only service role can access cache (Edge Functions)
CREATE POLICY "Service role can manage cache"
    ON public.requests_cache
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Recreate function to clean up expired cache entries
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

