-- Create app_category enum for the three help categories
CREATE TYPE public.app_category AS ENUM ('gameplay', 'technical', 'strategy');

-- Create requests table to store AI assistance requests
CREATE TABLE public.requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category app_category NOT NULL,
    ocr_text TEXT,
    model_response TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create prompts table to store editable AI prompts per category
CREATE TABLE public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category app_category NOT NULL UNIQUE,
    prompt_text TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sessions_log table to track user activity
CREATE TABLE public.sessions_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for requests table
CREATE POLICY "Users can view their own requests"
    ON public.requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests"
    ON public.requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests"
    ON public.requests FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for prompts table (readable by all authenticated users)
CREATE POLICY "Authenticated users can view prompts"
    ON public.prompts FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policies for sessions_log
CREATE POLICY "Users can view their own sessions"
    ON public.sessions_log FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
    ON public.sessions_log FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Insert default prompts for each category
INSERT INTO public.prompts (category, prompt_text) VALUES
    ('gameplay', 'You are a helpful gaming assistant. Analyze the screenshot and provide gameplay advice, tips, and strategies to help the player improve. Focus on actionable recommendations.'),
    ('technical', 'You are a technical support specialist for games. Analyze the screenshot to identify technical issues, bugs, or performance problems. Provide clear troubleshooting steps and solutions.'),
    ('strategy', 'You are a strategic gaming advisor. Analyze the screenshot and provide high-level strategic advice, optimal decision-making guidance, and long-term planning recommendations.');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on prompts
CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON public.prompts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();