-- Refactor prompts table: change category from enum to category_id FK
-- Step 1: Add category_id column (nullable initially for migration)
ALTER TABLE public.prompts ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT;

-- Step 2: Migrate existing data - map category enum to category_id
UPDATE public.prompts p
SET category_id = c.id
FROM public.categories c
WHERE p.category = c.category;

-- Step 3: Make category_id NOT NULL now that data is migrated
ALTER TABLE public.prompts ALTER COLUMN category_id SET NOT NULL;

-- Step 4: Remove UNIQUE constraint from category enum (will be removed with column)
-- Step 5: Drop the category enum column
ALTER TABLE public.prompts DROP COLUMN category;

-- Step 6: Add UNIQUE constraint on category_id
ALTER TABLE public.prompts ADD CONSTRAINT prompts_category_id_unique UNIQUE (category_id);

-- Step 7: Remove updated_at column
ALTER TABLE public.prompts DROP COLUMN updated_at;

-- Step 8: Add created_at column
ALTER TABLE public.prompts ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Step 9: Add created_by column (nullable for existing data)
ALTER TABLE public.prompts ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Step 10: Set created_at for existing prompts (use current timestamp as fallback)
-- Note: Since we removed updated_at, we'll use current timestamp for existing records
UPDATE public.prompts 
SET created_at = now()
WHERE created_at IS NULL;

-- Step 11: Remove trigger for updated_at (no longer needed)
DROP TRIGGER IF EXISTS update_prompts_updated_at ON public.prompts;

