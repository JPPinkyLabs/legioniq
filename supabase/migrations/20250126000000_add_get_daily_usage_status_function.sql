-- Create function to get daily usage status for a user
-- This function counts IMAGES from the requests table for the current day (UTC)
-- Each request can have multiple images (up to 5), and the limit is 15 images per day
CREATE OR REPLACE FUNCTION public.get_daily_usage_status(
    p_user_id UUID,
    p_max_images INTEGER DEFAULT 15
)
RETURNS JSON AS $$
DECLARE
    total_images INTEGER;
    reset_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Count total images from all requests of the current day (UTC)
    -- Sum the array_length of image_url for each request
    SELECT COALESCE(SUM(array_length(image_url, 1)), 0) INTO total_images
    FROM public.requests
    WHERE user_id = p_user_id
      AND created_at >= date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'
      AND image_url IS NOT NULL;
    
    -- Calculate next midnight UTC
    reset_time := (date_trunc('day', now() AT TIME ZONE 'UTC') + INTERVAL '1 day') AT TIME ZONE 'UTC';
    
    RETURN json_build_object(
        'can_make_request', total_images < p_max_images,
        'current_count', total_images,
        'max_images', p_max_images,
        'reset_at', reset_time
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

