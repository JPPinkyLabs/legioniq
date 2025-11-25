-- Create category_advices table to store advice types for each category
CREATE TABLE public.category_advices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.category_advices ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can view category advices
CREATE POLICY "Authenticated users can view category advices"
    ON public.category_advices FOR SELECT
    TO authenticated
    USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_category_advices_updated_at
    BEFORE UPDATE ON public.category_advices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert advices for Gameplay category
INSERT INTO public.category_advices (category_id, name, description, display_order)
SELECT 
    id,
    'Combat Efficiency',
    'Optimize timing, aim, and movement during combat encounters.',
    1
FROM public.categories
WHERE category = 'gameplay';

INSERT INTO public.category_advices (category_id, name, description, display_order)
SELECT 
    id,
    'Resource Management',
    'Improve how you handle ammo, stamina, energy, cooldowns or consumables.',
    2
FROM public.categories
WHERE category = 'gameplay';

INSERT INTO public.category_advices (category_id, name, description, display_order)
SELECT 
    id,
    'Movement & Positioning',
    'Refine positioning, dodging, traversal, and map awareness.',
    3
FROM public.categories
WHERE category = 'gameplay';

-- Insert advices for Technical category
INSERT INTO public.category_advices (category_id, name, description, display_order)
SELECT 
    id,
    'Performance Boost',
    'Recommendations to improve FPS, stability, or latency based on your screenshots.',
    1
FROM public.categories
WHERE category = 'technical';

INSERT INTO public.category_advices (category_id, name, description, display_order)
SELECT 
    id,
    'Bug Diagnosis',
    'Identify what''s causing crashes, graphic issues or glitches.',
    2
FROM public.categories
WHERE category = 'technical';

INSERT INTO public.category_advices (category_id, name, description, display_order)
SELECT 
    id,
    'Optimal Settings',
    'Suggest the best in-game settings for your hardware or game type.',
    3
FROM public.categories
WHERE category = 'technical';

-- Insert advices for Strategy category
INSERT INTO public.category_advices (category_id, name, description, display_order)
SELECT 
    id,
    'Attack',
    'Offensive tactics, timing, engagements, and maximizing damage.',
    1
FROM public.categories
WHERE category = 'strategy';

INSERT INTO public.category_advices (category_id, name, description, display_order)
SELECT 
    id,
    'Defense',
    'Defensive positioning, retreat strategy, guarding, and minimizing risk.',
    2
FROM public.categories
WHERE category = 'strategy';

INSERT INTO public.category_advices (category_id, name, description, display_order)
SELECT 
    id,
    'Reinforcement / Support',
    'Team synergy, assisting teammates, and strengthening overall coordination.',
    3
FROM public.categories
WHERE category = 'strategy';

