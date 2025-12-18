INSERT INTO public.user_roles (user_id, role)
VALUES ('b84d22ea-ab39-4ded-bb0b-f5d022c95531', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;