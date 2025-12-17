-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table for admin access control
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles (only admins can view/manage roles)
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create members table
CREATE TABLE public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    bio TEXT,
    location TEXT,
    member_type TEXT NOT NULL CHECK (member_type IN ('VIP', 'Member')),
    cover_image_url TEXT,
    show_on_member_page BOOLEAN DEFAULT false,
    show_on_vip_page BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on members
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Members are publicly readable (for the public pages)
CREATE POLICY "Members are publicly readable"
ON public.members
FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can insert/update/delete members
CREATE POLICY "Admins can manage members"
ON public.members
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create member_images table for album images
CREATE TABLE public.member_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES public.members(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on member_images
ALTER TABLE public.member_images ENABLE ROW LEVEL SECURITY;

-- Member images are publicly readable
CREATE POLICY "Member images are publicly readable"
ON public.member_images
FOR SELECT
TO anon, authenticated
USING (true);

-- Only admins can manage member images
CREATE POLICY "Admins can manage member images"
ON public.member_images
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for members updated_at
CREATE TRIGGER update_members_updated_at
BEFORE UPDATE ON public.members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES ('member-covers', 'member-covers', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('member-albums', 'member-albums', true);

-- Storage policies for member-covers bucket
CREATE POLICY "Anyone can view cover images"
ON storage.objects FOR SELECT
USING (bucket_id = 'member-covers');

CREATE POLICY "Admins can upload cover images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'member-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update cover images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'member-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete cover images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'member-covers' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for member-albums bucket
CREATE POLICY "Anyone can view album images"
ON storage.objects FOR SELECT
USING (bucket_id = 'member-albums');

CREATE POLICY "Admins can upload album images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'member-albums' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update album images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'member-albums' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete album images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'member-albums' AND public.has_role(auth.uid(), 'admin'));