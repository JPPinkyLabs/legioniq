-- Create categories_screenshots table to store required screenshots for each category
CREATE TABLE public.categories_screenshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories_screenshots ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can view category screenshots
CREATE POLICY "Authenticated users can view category screenshots"
    ON public.categories_screenshots FOR SELECT
    TO authenticated
    USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_categories_screenshots_updated_at
    BEFORE UPDATE ON public.categories_screenshots
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert screenshots for Gameplay category
INSERT INTO public.categories_screenshots (category_id, name, description, display_order)
SELECT 
    id,
    'Action Moment',
    'A screenshot showing your character performing an action during gameplay (jumping, fighting, or interacting).',
    1
FROM public.categories
WHERE category = 'gameplay';

INSERT INTO public.categories_screenshots (category_id, name, description, display_order)
SELECT 
    id,
    'Controls Layout',
    'A screenshot of your control settings or keybindings so we can understand your current setup.',
    2
FROM public.categories
WHERE category = 'gameplay';

INSERT INTO public.categories_screenshots (category_id, name, description, display_order)
SELECT 
    id,
    'HUD Overview',
    'A screenshot where the entire HUD is visible. Health bars, minimap, ammo, ability icons, etc.',
    3
FROM public.categories
WHERE category = 'gameplay';

-- Insert screenshots for Technical category
INSERT INTO public.categories_screenshots (category_id, name, description, display_order)
SELECT 
    id,
    'Settings / Config Page',
    'A screenshot of your game''s settings page (graphics, resolution, performance options).',
    1
FROM public.categories
WHERE category = 'technical';

INSERT INTO public.categories_screenshots (category_id, name, description, display_order)
SELECT 
    id,
    'Issue Screenshot',
    'A screenshot clearly showing the bug, glitch, error message, or visual artifact you''re experiencing.',
    2
FROM public.categories
WHERE category = 'technical';

INSERT INTO public.categories_screenshots (category_id, name, description, display_order)
SELECT 
    id,
    'System Overlay/Stats',
    'A screenshot showing performance stats such as FPS, temperatures, or debug overlays if available.',
    3
FROM public.categories
WHERE category = 'technical';

-- Insert screenshots for Strategy category
INSERT INTO public.categories_screenshots (category_id, name, description, display_order)
SELECT 
    id,
    'Map / Positioning',
    'A screenshot showing your position on the map or battlefield context.',
    1
FROM public.categories
WHERE category = 'strategy';

INSERT INTO public.categories_screenshots (category_id, name, description, display_order)
SELECT 
    id,
    'Loadout / Build',
    'A screenshot showing your character build, items, weapons, perks, skills or anything relevant to your setup.',
    2
FROM public.categories
WHERE category = 'strategy';

INSERT INTO public.categories_screenshots (category_id, name, description, display_order)
SELECT 
    id,
    'Match Situation',
    'A screenshot of a key moment of the match where you want strategic advice, such as an engagement, objective push, or defensive moment.',
    3
FROM public.categories
WHERE category = 'strategy';

