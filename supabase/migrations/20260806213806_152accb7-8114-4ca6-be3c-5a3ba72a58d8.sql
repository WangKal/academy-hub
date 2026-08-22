
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('student','instructor','admin');
CREATE TYPE public.user_status AS ENUM ('active','suspended','pending');
CREATE TYPE public.course_status AS ENUM ('draft','published','archived');
CREATE TYPE public.lesson_type AS ENUM ('video','text','quiz','assignment');
CREATE TYPE public.lesson_status AS ENUM ('draft','published');
CREATE TYPE public.enrollment_status AS ENUM ('pending','active','completed','cancelled','refunded');
CREATE TYPE public.progress_status AS ENUM ('not_started','in_progress','completed');
CREATE TYPE public.certificate_status AS ENUM ('issued','revoked');
CREATE TYPE public.payment_provider AS ENUM ('mpesa','stripe','manual');
CREATE TYPE public.payment_status AS ENUM ('pending','succeeded','failed','refunded');

-- SHARED TRIGGER FN
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  status public.user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT (id, full_name, avatar_url) ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

-- PROFILES POLICIES
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT TO anon USING (true);
CREATE POLICY "profiles_read_auth" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin() OR public.has_role(auth.uid(),'instructor'));
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "roles_read_self_or_admin" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "roles_admin_write" ON public.user_roles FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- SIGNUP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), COALESCE(NEW.email,''), NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'student'))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- COURSES
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT NOT NULL DEFAULT '',
  description_html TEXT NOT NULL DEFAULT '',
  instructor_id UUID NOT NULL,
  status public.course_status NOT NULL DEFAULT 'draft',
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KES',
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  level TEXT NOT NULL DEFAULT 'beginner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT SELECT ON public.courses TO anon;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courses_public_read" ON public.courses FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "courses_read_auth" ON public.courses FOR SELECT TO authenticated
  USING (status = 'published' OR instructor_id = auth.uid() OR public.is_admin());
CREATE POLICY "courses_insert" ON public.courses FOR INSERT TO authenticated
  WITH CHECK (instructor_id = auth.uid() AND (public.has_role(auth.uid(),'instructor') OR public.is_admin()));
CREATE POLICY "courses_update" ON public.courses FOR UPDATE TO authenticated
  USING (instructor_id = auth.uid() OR public.is_admin()) WITH CHECK (instructor_id = auth.uid() OR public.is_admin());
CREATE POLICY "courses_delete" ON public.courses FOR DELETE TO authenticated
  USING (instructor_id = auth.uid() OR public.is_admin());
CREATE TRIGGER courses_updated BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.owns_course(_course_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.courses c WHERE c.id = _course_id AND (c.instructor_id = auth.uid() OR public.has_role(auth.uid(),'admin')));
$$;
CREATE OR REPLACE FUNCTION public.course_is_published(_course_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.courses c WHERE c.id = _course_id AND c.status = 'published');
$$;

-- MODULES
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description_html TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modules TO authenticated;
GRANT SELECT ON public.modules TO anon;
GRANT ALL ON public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modules_public_read" ON public.modules FOR SELECT TO anon USING (public.course_is_published(course_id));
CREATE POLICY "modules_read_auth" ON public.modules FOR SELECT TO authenticated
  USING (public.course_is_published(course_id) OR public.owns_course(course_id));
CREATE POLICY "modules_write" ON public.modules FOR ALL TO authenticated
  USING (public.owns_course(course_id)) WITH CHECK (public.owns_course(course_id));
CREATE TRIGGER modules_updated BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.owns_module(_module_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.modules m JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = _module_id AND (c.instructor_id = auth.uid() OR public.has_role(auth.uid(),'admin')));
$$;
CREATE OR REPLACE FUNCTION public.module_is_published(_module_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.modules m JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = _module_id AND c.status = 'published');
$$;

-- LESSONS
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  lesson_type public.lesson_type NOT NULL DEFAULT 'text',
  content_html TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  is_preview BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  status public.lesson_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT SELECT ON public.lessons TO anon;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lessons_public_read" ON public.lessons FOR SELECT TO anon USING (public.module_is_published(module_id));
CREATE POLICY "lessons_read_auth" ON public.lessons FOR SELECT TO authenticated
  USING (public.module_is_published(module_id) OR public.owns_module(module_id));
CREATE POLICY "lessons_write" ON public.lessons FOR ALL TO authenticated
  USING (public.owns_module(module_id)) WITH CHECK (public.owns_module(module_id));
CREATE TRIGGER lessons_updated BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.owns_lesson(_lesson_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.lessons l JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = _lesson_id AND (c.instructor_id = auth.uid() OR public.has_role(auth.uid(),'admin')));
$$;

-- ENROLLMENTS
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status public.enrollment_status NOT NULL DEFAULT 'active',
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enrollments_read" ON public.enrollments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.owns_course(course_id));
CREATE POLICY "enrollments_insert_own" ON public.enrollments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "enrollments_update" ON public.enrollments FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.owns_course(course_id)) WITH CHECK (user_id = auth.uid() OR public.owns_course(course_id));
CREATE POLICY "enrollments_delete_admin" ON public.enrollments FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER enrollments_updated BEFORE UPDATE ON public.enrollments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- LESSON PROGRESS
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  status public.progress_status NOT NULL DEFAULT 'not_started',
  last_position_seconds INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress_read" ON public.lesson_progress FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.owns_lesson(lesson_id));
CREATE POLICY "progress_write_own" ON public.lesson_progress FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER progress_updated BEFORE UPDATE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- QUIZZES
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL UNIQUE REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Quiz',
  passing_score_percent INTEGER NOT NULL DEFAULT 70,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quizzes TO authenticated;
GRANT SELECT ON public.quizzes TO anon;
GRANT ALL ON public.quizzes TO service_role;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quizzes_read" ON public.quizzes FOR SELECT TO authenticated USING (true);
CREATE POLICY "quizzes_write" ON public.quizzes FOR ALL TO authenticated
  USING (public.owns_lesson(lesson_id)) WITH CHECK (public.owns_lesson(lesson_id));
CREATE TRIGGER quizzes_updated BEFORE UPDATE ON public.quizzes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.owns_quiz(_quiz_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.quizzes q WHERE q.id = _quiz_id AND public.owns_lesson(q.lesson_id));
$$;

CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_questions TO authenticated;
GRANT ALL ON public.quiz_questions TO service_role;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions_read" ON public.quiz_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "questions_write" ON public.quiz_questions FOR ALL TO authenticated
  USING (public.owns_quiz(quiz_id)) WITH CHECK (public.owns_quiz(quiz_id));
CREATE TRIGGER questions_updated BEFORE UPDATE ON public.quiz_questions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_options TO authenticated;
GRANT ALL ON public.quiz_options TO service_role;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "options_read" ON public.quiz_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "options_write" ON public.quiz_options FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.quiz_questions q WHERE q.id = question_id AND public.owns_quiz(q.quiz_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.quiz_questions q WHERE q.id = question_id AND public.owns_quiz(q.quiz_id)));
CREATE TRIGGER options_updated BEFORE UPDATE ON public.quiz_options FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score_percent INTEGER NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT false,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.quiz_attempts TO authenticated;
GRANT ALL ON public.quiz_attempts TO service_role;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attempts_read" ON public.quiz_attempts FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.owns_quiz(quiz_id));
CREATE POLICY "attempts_insert_own" ON public.quiz_attempts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- CERTIFICATES
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_code TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  certificate_url TEXT,
  status public.certificate_status NOT NULL DEFAULT 'issued',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "certificates_read" ON public.certificates FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.owns_course(course_id));
CREATE POLICY "certificates_insert" ON public.certificates FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "certificates_update_admin" ON public.certificates FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER certificates_updated BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PAYMENTS
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KES',
  provider public.payment_provider NOT NULL DEFAULT 'manual',
  provider_reference TEXT,
  status public.payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_read" ON public.payments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "payments_insert_own" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "payments_update_admin" ON public.payments FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER payments_updated BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- AUDIT LOGS
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_read_admin" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "audit_insert_auth" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- SETTINGS
CREATE TABLE public.academy_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  academy_name TEXT NOT NULL DEFAULT 'Sterling Executive Assistant Academy',
  support_email TEXT NOT NULL DEFAULT 'support@sterlingacademy.co',
  default_currency TEXT NOT NULL DEFAULT 'KES',
  certificate_prefix TEXT NOT NULL DEFAULT 'SEAA',
  allow_self_enrollment BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.academy_settings TO authenticated;
GRANT SELECT ON public.academy_settings TO anon;
GRANT ALL ON public.academy_settings TO service_role;
ALTER TABLE public.academy_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_read" ON public.academy_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings_update_admin" ON public.academy_settings FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
INSERT INTO public.academy_settings (id) VALUES ('default');

-- ===================== SEED DATA =====================
INSERT INTO public.profiles (id, full_name, email, status, avatar_url) VALUES
  ('11111111-1111-4111-8111-111111111111','Margaret Achieng','margaret.achieng@sterlingacademy.co','active',NULL),
  ('22222222-2222-4222-8222-222222222222','David Kimani','david.kimani@sterlingacademy.co','active',NULL),
  ('33333333-3333-4333-8333-333333333333','Grace Wanjiru','grace.wanjiru@example.com','active',NULL),
  ('44444444-4444-4444-8444-444444444444','Peter Otieno','peter.otieno@example.com','active',NULL);

INSERT INTO public.user_roles (user_id, role) VALUES
  ('11111111-1111-4111-8111-111111111111','instructor'),
  ('22222222-2222-4222-8222-222222222222','instructor'),
  ('33333333-3333-4333-8333-333333333333','student'),
  ('44444444-4444-4444-8444-444444444444','student');

INSERT INTO public.courses (id, title, slug, short_description, description_html, instructor_id, status, price_cents, currency, category, level, thumbnail_url) VALUES
  ('aaaaaaaa-0000-4000-8000-000000000001',
   'Executive Assistant Mastery: Calendar, Travel & Board Support',
   'executive-assistant-mastery',
   'Run a flawless executive office: complex diary management, international travel, board papers and confidential communications.',
   '<p>This flagship programme prepares experienced administrators to operate as trusted strategic partners to C-suite executives.</p><p>You will build practical systems for <strong>complex multi-timezone diary management</strong>, international travel logistics, board and committee support, and confidential stakeholder communication. Every module includes downloadable templates used in real executive offices.</p><ul><li>Gatekeeping and priority triage frameworks</li><li>Board pack preparation and minute-taking standards</li><li>Expense, visa and itinerary management</li></ul>',
   '11111111-1111-4111-8111-111111111111','published',4500000,'KES','Executive Support','advanced',NULL),
  ('aaaaaaaa-0000-4000-8000-000000000002',
   'Personal Assistant Foundations: Professional Office Practice',
   'personal-assistant-foundations',
   'The essential toolkit for new and aspiring personal assistants: communication, records, meetings and business etiquette.',
   '<p>A structured entry point into professional assistant work. Learn the daily disciplines that make an office run: inbox and document control, meeting coordination, minute writing, telephone and email etiquette, and discreet handling of sensitive information.</p><p>Ideal for administrators moving into a dedicated PA role.</p>',
   '22222222-2222-4222-8222-222222222222','published',1800000,'KES','Office Administration','beginner',NULL),
  ('aaaaaaaa-0000-4000-8000-000000000003',
   'Advanced Minute Taking & Governance Documentation',
   'advanced-minute-taking',
   'Draft board-grade minutes, resolutions and action registers with confidence.',
   '<p>Currently in development. Covers governance documentation standards, resolution drafting and action tracking.</p>',
   '11111111-1111-4111-8111-111111111111','draft',2200000,'KES','Governance','intermediate',NULL);

-- Course 1 modules
INSERT INTO public.modules (id, course_id, title, description_html, order_index) VALUES
  ('bbbbbbbb-0000-4000-8000-000000000001','aaaaaaaa-0000-4000-8000-000000000001','Module 1 — The Strategic Executive Assistant','<p>Positioning yourself as a partner rather than a processor.</p>',0),
  ('bbbbbbbb-0000-4000-8000-000000000002','aaaaaaaa-0000-4000-8000-000000000001','Module 2 — Complex Diary & Gatekeeping','<p>Multi-timezone scheduling, triage and protecting executive focus time.</p>',1),
  ('bbbbbbbb-0000-4000-8000-000000000003','aaaaaaaa-0000-4000-8000-000000000001','Module 3 — International Travel & Board Support','<p>Itineraries, visas, expenses and board pack preparation.</p>',2),
  ('bbbbbbbb-0000-4000-8000-000000000004','aaaaaaaa-0000-4000-8000-000000000002','Module 1 — Foundations of Professional Office Practice','<p>Your role, your standards and your first 30 days.</p>',0),
  ('bbbbbbbb-0000-4000-8000-000000000005','aaaaaaaa-0000-4000-8000-000000000002','Module 2 — Communication & Meeting Coordination','<p>Email etiquette, telephone handling and running meetings smoothly.</p>',1);

INSERT INTO public.lessons (id, module_id, title, lesson_type, content_html, video_url, duration_seconds, is_preview, order_index) VALUES
  ('cccccccc-0000-4000-8000-000000000001','bbbbbbbb-0000-4000-8000-000000000001','Welcome & How This Programme Works','video','<p>An orientation to the programme structure, assessments and certification requirements.</p>','https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',420,true,0),
  ('cccccccc-0000-4000-8000-000000000002','bbbbbbbb-0000-4000-8000-000000000001','From Administrator to Strategic Partner','text','<h2>Shifting the frame</h2><p>The difference between an administrator and an executive assistant is <strong>anticipation</strong>. An administrator responds to requests; an executive assistant removes the need for the request to be made.</p><h3>Three habits that create trust</h3><ol><li><strong>Brief before being asked.</strong> Deliver a one-page pre-read before every external meeting.</li><li><strong>Own the follow-through.</strong> Track every commitment your executive makes in a single action register.</li><li><strong>Protect the calendar as a strategic asset.</strong> Time is the only resource your executive cannot buy more of.</li></ol><p>Complete the reflection template before moving on.</p>',NULL,900,true,1),
  ('cccccccc-0000-4000-8000-000000000003','bbbbbbbb-0000-4000-8000-000000000001','Knowledge Check: The EA Mindset','quiz','<p>Confirm your understanding of the strategic assistant model.</p>',NULL,300,false,2),
  ('cccccccc-0000-4000-8000-000000000004','bbbbbbbb-0000-4000-8000-000000000002','Multi-Timezone Diary Architecture','video','<p>Building a diary that survives three continents and a travelling executive.</p>','https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',1080,false,0),
  ('cccccccc-0000-4000-8000-000000000005','bbbbbbbb-0000-4000-8000-000000000002','Gatekeeping Without Damaging Relationships','text','<h2>The triage ladder</h2><p>Every inbound request falls into one of four tiers: <em>decide now</em>, <em>delegate</em>, <em>defer to a standing slot</em>, or <em>decline with a route</em>. Never decline without offering a route.</p><p>Sample language:</p><blockquote>"The Director''s diary is committed through Thursday. I can offer 15 minutes on Friday at 09:15, or I can connect you with Susan who owns this workstream directly."</blockquote>',NULL,780,false,1),
  ('cccccccc-0000-4000-8000-000000000006','bbbbbbbb-0000-4000-8000-000000000003','Building a Board Pack','text','<h2>Board pack standards</h2><p>A board pack is issued no later than five working days before the meeting. It contains the agenda, previous minutes, action register, and one paper per agenda item with a standard cover sheet.</p><ul><li>Cover sheet: purpose, recommendation, risk, decision required</li><li>Version control in the footer of every page</li><li>Confidential items separated into a restricted annex</li></ul>',NULL,960,false,0),
  ('cccccccc-0000-4000-8000-000000000007','bbbbbbbb-0000-4000-8000-000000000003','International Travel Logistics Walkthrough','video','<p>Visas, itineraries, contingency planning and expense reconciliation.</p>','https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',1320,false,1),
  ('cccccccc-0000-4000-8000-000000000008','bbbbbbbb-0000-4000-8000-000000000004','The PA Role in a Modern Office','video','<p>What the role covers, who you support, and how success is measured.</p>','https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',600,true,0),
  ('cccccccc-0000-4000-8000-000000000009','bbbbbbbb-0000-4000-8000-000000000004','Document & Records Control','text','<h2>A filing system people actually use</h2><p>Name files so they sort correctly and read clearly: <code>YYYY-MM-DD_Client_DocumentType_v01</code>. Keep one authoritative location per document and link to it rather than attaching copies.</p><p>Retention: contracts seven years, correspondence two years, drafts deleted at sign-off.</p>',NULL,720,false,1),
  ('cccccccc-0000-4000-8000-000000000010','bbbbbbbb-0000-4000-8000-000000000005','Professional Email & Telephone Etiquette','text','<h2>Writing on behalf of someone else</h2><p>When writing for your principal, use their voice, not yours. Keep to three short paragraphs: context, request, next step. Always state the deadline explicitly.</p><h3>Telephone</h3><p>Answer within three rings, identify the office, identify yourself, offer help. Take a message with name, organisation, number, subject, urgency and callback window.</p>',NULL,660,false,0),
  ('cccccccc-0000-4000-8000-000000000011','bbbbbbbb-0000-4000-8000-000000000005','Coordinating Meetings End to End','video','<p>From the invitation to the circulated minutes and action register.</p>','https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',840,false,1);

INSERT INTO public.quizzes (id, lesson_id, title, passing_score_percent) VALUES
  ('dddddddd-0000-4000-8000-000000000001','cccccccc-0000-4000-8000-000000000003','Knowledge Check: The EA Mindset',70);

INSERT INTO public.quiz_questions (id, quiz_id, question_text, order_index) VALUES
  ('eeeeeeee-0000-4000-8000-000000000001','dddddddd-0000-4000-8000-000000000001','What most distinguishes a strategic executive assistant from a general administrator?',0),
  ('eeeeeeee-0000-4000-8000-000000000002','dddddddd-0000-4000-8000-000000000001','A senior stakeholder demands a meeting this week, but the diary is fully committed. What is the strongest response?',1),
  ('eeeeeeee-0000-4000-8000-000000000003','dddddddd-0000-4000-8000-000000000001','How far in advance should a board pack normally be circulated?',2);

INSERT INTO public.quiz_options (question_id, option_text, is_correct, order_index) VALUES
  ('eeeeeeee-0000-4000-8000-000000000001','They anticipate needs and remove work before it is requested',true,0),
  ('eeeeeeee-0000-4000-8000-000000000001','They type faster and handle more correspondence',false,1),
  ('eeeeeeee-0000-4000-8000-000000000001','They report to a more senior manager',false,2),
  ('eeeeeeee-0000-4000-8000-000000000001','They have access to the executive''s personal email',false,3),
  ('eeeeeeee-0000-4000-8000-000000000002','Decline politely and offer a concrete alternative slot or a routed contact',true,0),
  ('eeeeeeee-0000-4000-8000-000000000002','Cancel an existing internal meeting without telling anyone',false,1),
  ('eeeeeeee-0000-4000-8000-000000000002','Forward the request to the executive and take no further action',false,2),
  ('eeeeeeee-0000-4000-8000-000000000002','Ignore the request until the stakeholder follows up',false,3),
  ('eeeeeeee-0000-4000-8000-000000000003','At least five working days before the meeting',true,0),
  ('eeeeeeee-0000-4000-8000-000000000003','The morning of the meeting',false,1),
  ('eeeeeeee-0000-4000-8000-000000000003','Immediately after the meeting',false,2),
  ('eeeeeeee-0000-4000-8000-000000000003','Only when a director requests it',false,3);

INSERT INTO public.enrollments (user_id, course_id, status, enrolled_at) VALUES
  ('33333333-3333-4333-8333-333333333333','aaaaaaaa-0000-4000-8000-000000000001','active', now() - interval '18 days'),
  ('33333333-3333-4333-8333-333333333333','aaaaaaaa-0000-4000-8000-000000000002','completed', now() - interval '90 days'),
  ('44444444-4444-4444-8444-444444444444','aaaaaaaa-0000-4000-8000-000000000001','active', now() - interval '6 days');

UPDATE public.enrollments SET completed_at = now() - interval '40 days'
  WHERE user_id = '33333333-3333-4333-8333-333333333333' AND course_id = 'aaaaaaaa-0000-4000-8000-000000000002';

INSERT INTO public.lesson_progress (user_id, lesson_id, status, last_position_seconds, completed_at) VALUES
  ('33333333-3333-4333-8333-333333333333','cccccccc-0000-4000-8000-000000000001','completed',420, now() - interval '17 days'),
  ('33333333-3333-4333-8333-333333333333','cccccccc-0000-4000-8000-000000000002','completed',0, now() - interval '16 days'),
  ('33333333-3333-4333-8333-333333333333','cccccccc-0000-4000-8000-000000000003','completed',0, now() - interval '15 days'),
  ('33333333-3333-4333-8333-333333333333','cccccccc-0000-4000-8000-000000000004','in_progress',512, NULL),
  ('44444444-4444-4444-8444-444444444444','cccccccc-0000-4000-8000-000000000001','completed',420, now() - interval '5 days');

INSERT INTO public.quiz_attempts (user_id, quiz_id, score_percent, passed, started_at, submitted_at) VALUES
  ('33333333-3333-4333-8333-333333333333','dddddddd-0000-4000-8000-000000000001',67,false, now() - interval '15 days', now() - interval '15 days'),
  ('33333333-3333-4333-8333-333333333333','dddddddd-0000-4000-8000-000000000001',100,true, now() - interval '15 days', now() - interval '15 days');

INSERT INTO public.certificates (user_id, course_id, certificate_code, issued_at, status) VALUES
  ('33333333-3333-4333-8333-333333333333','aaaaaaaa-0000-4000-8000-000000000002','SEAA-2025-0001','2025-11-02T10:00:00Z','issued');

INSERT INTO public.payments (user_id, course_id, amount_cents, currency, provider, provider_reference, status) VALUES
  ('33333333-3333-4333-8333-333333333333','aaaaaaaa-0000-4000-8000-000000000001',4500000,'KES','mpesa','SGH7YT2LQ1','succeeded'),
  ('33333333-3333-4333-8333-333333333333','aaaaaaaa-0000-4000-8000-000000000002',1800000,'KES','manual','BANK-TRF-4471','succeeded'),
  ('44444444-4444-4444-8444-444444444444','aaaaaaaa-0000-4000-8000-000000000001',4500000,'KES','mpesa','TQ4RM90XZP','pending');

INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata, created_at) VALUES
  ('11111111-1111-4111-8111-111111111111','course.published','course','aaaaaaaa-0000-4000-8000-000000000001','{"title":"Executive Assistant Mastery"}', now() - interval '30 days'),
  ('22222222-2222-4222-8222-222222222222','course.published','course','aaaaaaaa-0000-4000-8000-000000000002','{"title":"Personal Assistant Foundations"}', now() - interval '75 days'),
  ('33333333-3333-4333-8333-333333333333','enrollment.created','enrollment','aaaaaaaa-0000-4000-8000-000000000001','{"course":"Executive Assistant Mastery"}', now() - interval '18 days'),
  (NULL,'payment.confirmed','payment','SGH7YT2LQ1','{"provider":"mpesa","amount_cents":4500000}', now() - interval '18 days'),
  (NULL,'certificate.issued','certificate','SEAA-2025-0001','{"course":"Personal Assistant Foundations"}', now() - interval '40 days');
