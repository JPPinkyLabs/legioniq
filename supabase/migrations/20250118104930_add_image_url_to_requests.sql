-- Add image_url column to requests table
ALTER TABLE public.requests
ADD COLUMN image_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.requests.image_url IS 'URL of the screenshot image stored in Supabase Storage';

