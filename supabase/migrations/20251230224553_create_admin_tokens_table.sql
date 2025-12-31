-- Create admin_tokens table for secure access link management
CREATE TABLE public.admin_tokens (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    access_token TEXT NOT NULL UNIQUE,
    user_id UUID, -- Optional: link to admin user who created it
    expires_at TIMESTAMP WITH TIME ZONE,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Admins can manage all admin tokens
CREATE POLICY "Admins can manage admin tokens"
ON public.admin_tokens
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can read admin tokens for validation (needed for the access route)
CREATE POLICY "Admin tokens are publicly readable for validation"
ON public.admin_tokens
FOR SELECT
USING (true);

-- Create index for faster token lookups
CREATE INDEX idx_admin_tokens_access_token ON public.admin_tokens(access_token);

-- Drop the old access_links table if it exists
DROP TABLE IF EXISTS public.access_links CASCADE;
DROP TYPE IF EXISTS public.target_page_type CASCADE;