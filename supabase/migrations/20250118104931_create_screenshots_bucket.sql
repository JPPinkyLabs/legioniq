-- Create private bucket for screenshots
-- Note: If this fails, create the bucket manually via Supabase Dashboard > Storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'screenshots',
  'screenshots',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS on storage.objects is enabled by default, no need to alter it

-- Policy: Users can upload their own images
-- File path format: {user_id}/{request_id}.{ext}
CREATE POLICY "Users can upload their own screenshots"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'screenshots' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy: Users can view their own screenshots
CREATE POLICY "Users can view their own screenshots"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'screenshots' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy: Users can delete their own screenshots
CREATE POLICY "Users can delete their own screenshots"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'screenshots' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy: Service role can manage all screenshots (for edge functions)
CREATE POLICY "Service role can manage all screenshots"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'screenshots')
WITH CHECK (bucket_id = 'screenshots');

