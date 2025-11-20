-- Add super_admin flag to user metadata for admin@nardonidigital.com
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{super_admin}',
  'true'::jsonb
)
WHERE email = 'admin@nardonidigital.com';
