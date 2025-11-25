-- Drop rate limit functions first (they depend on the table)
DROP FUNCTION IF EXISTS public.check_rate_limit(UUID, TEXT, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS public.cleanup_old_rate_limits();

-- Drop RLS policy
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limit;

-- Drop indexes
DROP INDEX IF EXISTS public.idx_rate_limit_user_type_time;
DROP INDEX IF EXISTS public.idx_rate_limit_cleanup;

-- Drop table
DROP TABLE IF EXISTS public.rate_limit;

