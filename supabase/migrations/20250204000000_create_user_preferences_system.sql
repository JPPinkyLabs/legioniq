-- Enum for question types
CREATE TYPE public.question_type AS ENUM (
    'single_choice',
    'multiple_choice', 
    'text',
    'number',
    'range'
);

-- Table for questionnaire questions
CREATE TABLE public.preference_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_key TEXT NOT NULL UNIQUE,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL,
    options JSONB, -- For choice questions: {"options": [{"value": "beginner", "label": "Beginner"}, ...]}
    is_required BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    help_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for user preferences
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_key TEXT NOT NULL,
    answer_value TEXT, -- For single_choice and text
    answer_values TEXT[], -- For multiple_choice
    answer_number NUMERIC, -- For number and range
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT unique_user_question UNIQUE (user_id, question_key)
);

-- Add has_completed_onboarding column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN NOT NULL DEFAULT false;

-- Indexes for performance
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_user_preferences_question_key ON public.user_preferences(question_key);
CREATE INDEX idx_preference_questions_display_order ON public.preference_questions(display_order);

-- RLS Policies
ALTER TABLE public.preference_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for preference_questions (all authenticated users can read)
CREATE POLICY "Authenticated users can view preference questions"
    ON public.preference_questions FOR SELECT
    TO authenticated
    USING (true);

-- Policies for user_preferences (users can only see their own preferences)
CREATE POLICY "Users can view their own preferences"
    ON public.user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON public.user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON public.user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
    ON public.user_preferences FOR DELETE
    USING (auth.uid() = user_id);

-- Ensure update_updated_at_column function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_preference_questions_updated_at
    BEFORE UPDATE ON public.preference_questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default questionnaire questions
INSERT INTO public.preference_questions (question_key, question_text, question_type, options, is_required, display_order) VALUES
    ('preferred_game_genres', 'What types of games do you play most? (Select all that apply)', 'multiple_choice',
     '{"options": [{"value": "fps", "label": "FPS"}, {"value": "rpg", "label": "RPG"}, {"value": "moba", "label": "MOBA"}, {"value": "strategy", "label": "Strategy"}, {"value": "battle_royale", "label": "Battle Royale"}, {"value": "mmorpg", "label": "MMORPG"}, {"value": "racing", "label": "Racing"}, {"value": "sports", "label": "Sports"}, {"value": "fighting", "label": "Fighting"}, {"value": "puzzle", "label": "Puzzle"}, {"value": "indie", "label": "Indie"}, {"value": "other", "label": "Other"}]}'::jsonb,
     true, 1),
    
    ('primary_platforms', 'Which platforms do you play on? (Select all that apply)', 'multiple_choice',
     '{"options": [{"value": "pc", "label": "PC"}, {"value": "playstation", "label": "PlayStation"}, {"value": "xbox", "label": "Xbox"}, {"value": "nintendo", "label": "Nintendo Switch"}, {"value": "mobile", "label": "Mobile"}, {"value": "other", "label": "Other"}]}'::jsonb,
     true, 2),
    
    ('primary_goal', 'What brings you to the platform?', 'single_choice',
     '{"options": [{"value": "improve_performance", "label": "Improve performance/rank"}, {"value": "fix_technical_issues", "label": "Fix technical issues"}, {"value": "learn_strategies", "label": "Learn strategies and tactics"}, {"value": "optimize_settings", "label": "Optimize settings"}, {"value": "general_help", "label": "General help"}]}'::jsonb,
     true, 3),
    
    ('gaming_style', 'How would you describe your gaming style?', 'single_choice',
     '{"options": [{"value": "casual", "label": "Casual (play for fun)"}, {"value": "competitive", "label": "Competitive (focused on rank)"}, {"value": "hardcore", "label": "Hardcore (maximum dedication)"}, {"value": "social", "label": "Social (play with friends)"}]}'::jsonb,
     false, 4);

