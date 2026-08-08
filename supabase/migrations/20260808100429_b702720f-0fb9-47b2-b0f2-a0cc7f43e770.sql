-- 1. Remap seeded placeholder people to real auth accounts
DO $$
DECLARE m record;
BEGIN
  FOR m IN SELECT * FROM (VALUES
    ('11111111-1111-4111-8111-111111111111'::uuid,'570e435f-d8ad-4a90-81a8-ced35ca4f87e'::uuid),
    ('22222222-2222-4222-8222-222222222222'::uuid,'ce661efa-7b06-4b57-af44-712dd50937e3'::uuid),
    ('33333333-3333-4333-8333-333333333333'::uuid,'21aac413-637c-4133-acbd-35d52ce5ab35'::uuid),
    ('44444444-4444-4444-8444-444444444444'::uuid,'80363f0c-6ce4-4bd3-8604-53bb67d66e44'::uuid)
  ) AS t(old_id, new_id) LOOP
    UPDATE public.profiles p SET full_name = o.full_name, avatar_url = COALESCE(o.avatar_url, p.avatar_url)
      FROM public.profiles o WHERE o.id = m.old_id AND p.id = m.new_id;
    UPDATE public.courses SET instructor_id = m.new_id WHERE instructor_id = m.old_id;
    UPDATE public.enrollments SET user_id = m.new_id WHERE user_id = m.old_id;
    UPDATE public.lesson_progress SET user_id = m.new_id WHERE user_id = m.old_id;
    UPDATE public.certificates SET user_id = m.new_id WHERE user_id = m.old_id;
    UPDATE public.payments SET user_id = m.new_id WHERE user_id = m.old_id;
    UPDATE public.quiz_attempts SET user_id = m.new_id WHERE user_id = m.old_id;
    UPDATE public.audit_logs SET user_id = m.new_id WHERE user_id = m.old_id;
    DELETE FROM public.user_roles WHERE user_id = m.old_id;
    DELETE FROM public.profiles WHERE id = m.old_id;
  END LOOP;
END $$;

-- 2. Roles for the demo accounts
INSERT INTO public.user_roles (user_id, role) VALUES
  ('570e435f-d8ad-4a90-81a8-ced35ca4f87e','instructor'),
  ('ce661efa-7b06-4b57-af44-712dd50937e3','instructor'),
  ('21aac413-637c-4133-acbd-35d52ce5ab35','student'),
  ('80363f0c-6ce4-4bd3-8604-53bb67d66e44','student'),
  ('c8fac6cb-978a-4804-92d7-f23e7f09983f','admin')
ON CONFLICT DO NOTHING;

UPDATE public.profiles SET full_name = 'Academy Administrator'
WHERE id = 'c8fac6cb-978a-4804-92d7-f23e7f09983f';

-- 3. Foreign key so the catalogue can join instructor profiles
ALTER TABLE public.courses
  ADD CONSTRAINT courses_instructor_id_fkey
  FOREIGN KEY (instructor_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;

-- 4. Course cover images
UPDATE public.courses SET thumbnail_url = '/__l5e/assets-v1/deb1fd1b-88f1-465d-af38-9b8dbf1591c0/course-executive-mastery.jpg' WHERE slug = 'executive-assistant-mastery';
UPDATE public.courses SET thumbnail_url = '/__l5e/assets-v1/396fbc2a-bbff-463f-8cd2-b485fd91e0cb/course-pa-foundations.jpg' WHERE slug = 'personal-assistant-foundations';
UPDATE public.courses SET thumbnail_url = '/__l5e/assets-v1/afc94b53-ecd0-4c7d-bbc0-15be26df477f/course-minute-taking.jpg' WHERE slug = 'advanced-minute-taking';