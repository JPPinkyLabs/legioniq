-- Create categories table to store category metadata
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category app_category NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can view categories
CREATE POLICY "Authenticated users can view categories"
    ON public.categories FOR SELECT
    TO authenticated
    USING (true);

-- Insert default categories
INSERT INTO public.categories (category, label, description, icon_name, display_order) VALUES
    ('gameplay', 'Gameplay', 'Mechanics & controls', 'Trophy', 1),
    ('technical', 'Technical', 'Bugs & performance', 'Wrench', 2),
    ('strategy', 'Strategy', 'Tactics & optimization', 'Brain', 3);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

