-- Create enum for target page
CREATE TYPE public.target_page_type AS ENUM ('member', 'vip');

-- Create access_links table
CREATE TABLE public.access_links (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    target_page target_page_type NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_used BOOLEAN NOT NULL DEFAULT false,
    allow_share BOOLEAN NOT NULL DEFAULT false,
    is_permanent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.access_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Admins can manage all access links
CREATE POLICY "Admins can manage access links"
ON public.access_links
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can read access links for validation (needed for the access route)
CREATE POLICY "Access links are publicly readable for validation"
ON public.access_links
FOR SELECT
USING (true);

-- Create index for faster token lookups
CREATE INDEX idx_access_links_token ON public.access_links(token);