-- Drop request_cache related objects

-- Drop trigger first (depends on function)
DROP TRIGGER IF EXISTS update_cache_usage_trigger ON public.request_cache;

-- Drop functions
DROP FUNCTION IF EXISTS public.update_cache_usage();
DROP FUNCTION IF EXISTS public.cleanup_old_cache();

-- Drop RLS policy
DROP POLICY IF EXISTS "Service role can manage cache" ON public.request_cache;

-- Drop indexes
DROP INDEX IF EXISTS public.idx_request_cache_unique;
DROP INDEX IF EXISTS public.idx_request_cache_hash_category_user_message;
DROP INDEX IF EXISTS public.idx_request_cache_hash_category;
DROP INDEX IF EXISTS public.idx_request_cache_last_used;

-- Drop table
DROP TABLE IF EXISTS public.request_cache;

