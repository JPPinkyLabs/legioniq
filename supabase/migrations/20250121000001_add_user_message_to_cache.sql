-- Add user_message column to request_cache table
ALTER TABLE public.request_cache
ADD COLUMN user_message TEXT DEFAULT '';

-- Drop the old unique constraint
ALTER TABLE public.request_cache
DROP CONSTRAINT IF EXISTS request_cache_image_hash_category_key;

-- Create a unique constraint using a unique index (PostgreSQL doesn't support unique constraints with COALESCE directly)
-- This will treat NULL as empty string for uniqueness purposes
CREATE UNIQUE INDEX idx_request_cache_unique 
ON public.request_cache(image_hash, category, COALESCE(user_message, ''));

-- Update the index for fast lookups
DROP INDEX IF EXISTS idx_request_cache_hash_category;
CREATE INDEX idx_request_cache_hash_category_user_message 
ON public.request_cache(image_hash, category, COALESCE(user_message, ''));

