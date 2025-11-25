-- Add user_message column to requests table
ALTER TABLE public.requests
ADD COLUMN user_message TEXT;

