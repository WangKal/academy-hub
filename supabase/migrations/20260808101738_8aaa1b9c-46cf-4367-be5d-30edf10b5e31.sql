CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_created_idx ON public.notifications (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Authenticated can create notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER notifications_updated BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TYPE public.submission_status AS ENUM ('submitted','graded','returned');

CREATE TABLE public.assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content_text text NOT NULL DEFAULT '',
  attachment_url text,
  status public.submission_status NOT NULL DEFAULT 'submitted',
  grade integer,
  feedback text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  graded_by uuid,
  graded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, user_id)
);
CREATE INDEX assignment_submissions_lesson_idx ON public.assignment_submissions (lesson_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignment_submissions TO authenticated;
GRANT ALL ON public.assignment_submissions TO service_role;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students read own submissions" ON public.assignment_submissions
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.owns_lesson(lesson_id));
CREATE POLICY "Students create own submissions" ON public.assignment_submissions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Students edit ungraded submissions" ON public.assignment_submissions
  FOR UPDATE TO authenticated
  USING ((user_id = auth.uid() AND status = 'submitted') OR public.owns_lesson(lesson_id))
  WITH CHECK ((user_id = auth.uid() AND status = 'submitted') OR public.owns_lesson(lesson_id));
CREATE POLICY "Owners delete submissions" ON public.assignment_submissions
  FOR DELETE TO authenticated USING (public.owns_lesson(lesson_id));

CREATE TRIGGER assignment_submissions_updated BEFORE UPDATE ON public.assignment_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();