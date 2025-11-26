-- Create prompts_logs table to track prompt edit history
CREATE TABLE public.prompts_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    edited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    prompt_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.prompts_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can view prompts_logs
CREATE POLICY "Authenticated users can view prompts_logs"
    ON public.prompts_logs FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policy: Admins can insert prompts_logs
-- Note: This will be enforced at application level for now
-- Future: Can add function-based policy to check user role
CREATE POLICY "Admins can insert prompts_logs"
    ON public.prompts_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_prompts_logs_prompt_id ON public.prompts_logs(prompt_id);
CREATE INDEX idx_prompts_logs_created_at ON public.prompts_logs(created_at DESC);
CREATE INDEX idx_prompts_logs_category_id ON public.prompts_logs(category_id);

