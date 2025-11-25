-- Remove unwanted preference questions
DELETE FROM public.preference_questions 
WHERE question_key IN ('favorite_games', 'gaming_experience_level', 'weekly_gaming_hours');

-- Update primary_goal question text to be less invasive
UPDATE public.preference_questions
SET question_text = 'What brings you to the platform?'
WHERE question_key = 'primary_goal';

-- Reorder remaining questions to ensure sequential display_order
UPDATE public.preference_questions
SET display_order = 1
WHERE question_key = 'preferred_game_genres';

UPDATE public.preference_questions
SET display_order = 2
WHERE question_key = 'primary_platforms';

UPDATE public.preference_questions
SET display_order = 3
WHERE question_key = 'primary_goal';

UPDATE public.preference_questions
SET display_order = 4
WHERE question_key = 'gaming_style';

