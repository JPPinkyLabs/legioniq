-- Drop triggers first
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
DROP TRIGGER IF EXISTS update_preference_questions_updated_at ON public.preference_questions;

-- Drop RLS policies
DROP POLICY IF EXISTS "Authenticated users can view preference questions" ON public.preference_questions;
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.user_preferences;

-- Drop indexes
DROP INDEX IF EXISTS idx_user_preferences_user_id;
DROP INDEX IF EXISTS idx_user_preferences_question_key;
DROP INDEX IF EXISTS idx_preference_questions_display_order;

-- Drop tables (order matters due to foreign keys)
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.preference_questions CASCADE;

-- Drop enum type
DROP TYPE IF EXISTS public.question_type CASCADE;

-- Remove column from profiles table
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS has_completed_onboarding;

-- Note: We're NOT dropping the update_updated_at_column function
-- as it might be used by other tables. If you want to drop it, uncomment below:
-- DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
