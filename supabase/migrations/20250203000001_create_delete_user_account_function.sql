-- Create function to delete user account
-- This function uses SECURITY DEFINER to have elevated privileges
-- It validates that the user is authenticated and approved before deletion
-- Deletion cascades to related tables (profiles, requests, sessions_log) via foreign keys

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID;
  v_is_approved BOOLEAN;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Check if user is approved
  SELECT is_approved INTO v_is_approved
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_is_approved IS NULL OR v_is_approved = false THEN
    RAISE EXCEPTION 'Account pending approval';
  END IF;

  -- Delete user from auth.users
  -- This will cascade to profiles, requests, sessions_log via foreign keys
  DELETE FROM auth.users
  WHERE id = v_user_id;

  -- If no rows were deleted, user doesn't exist
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

