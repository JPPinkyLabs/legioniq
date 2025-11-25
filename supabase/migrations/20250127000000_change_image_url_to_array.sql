-- Alter image_url from TEXT to TEXT[] to support multiple images per request
ALTER TABLE public.requests
ALTER COLUMN image_url TYPE TEXT[] USING 
  CASE 
    WHEN image_url IS NULL THEN NULL
    ELSE ARRAY[image_url]
  END;

-- Update comment
COMMENT ON COLUMN public.requests.image_url IS 'Array of screenshot image URLs stored in Supabase Storage (max 5 per request)';

