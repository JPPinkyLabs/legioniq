-- Migration: Remove category enum column and add color column
-- This migration removes the hardcoded app_category enum and adds a dynamic color column

-- 1. Add color column to categories table
ALTER TABLE public.categories ADD COLUMN color TEXT NOT NULL DEFAULT 'gray';

-- 2. Populate colors based on current enum values
UPDATE public.categories SET color = 'blue' WHERE category = 'gameplay';
UPDATE public.categories SET color = 'green' WHERE category = 'technical';
UPDATE public.categories SET color = 'purple' WHERE category = 'strategy';

-- 3. Remove the category column (enum)
ALTER TABLE public.categories DROP COLUMN category;

-- 4. Drop the app_category enum type if it's no longer used
-- Note: This will fail if any other table still uses this type
-- The requests table was already migrated to use category_id (UUID) in migration 20250208000000
DROP TYPE IF EXISTS public.app_category;

