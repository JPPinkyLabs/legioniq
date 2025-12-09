-- Add system_prompt and user_prompt columns to requests table
-- These columns store the exact prompts sent to OpenAI for each request
ALTER TABLE public.requests
ADD COLUMN system_prompt TEXT,
ADD COLUMN user_prompt TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN public.requests.system_prompt IS 'The system prompt sent to OpenAI for this request';
COMMENT ON COLUMN public.requests.user_prompt IS 'The user prompt sent to OpenAI for this request';

