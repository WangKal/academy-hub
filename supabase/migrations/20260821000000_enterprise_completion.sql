-- Academy Hub enterprise completion pass.
-- Safe to run after the normalized admin_roles / relationship migration.
-- This migration intentionally does not create the deferred integration standards.

/* -------------------------------------------------------------------------- */
/* Canonical admin authorization functions                                   */
/* -------------------------------------------------------------------------- */

CREATE OR REPLACE FUNCTION public.has_admin_permission(
  _user_id UUID,
  _permission TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.admin_roles ar ON ar.user_id = ur.user_id
    JOIN public.admin_tier_permissions atp ON atp.sub_role = ar.sub_role
    JOIN public.admin_permission_catalog pc ON pc.permission_key = atp.permission_key
    WHERE ur.user_id = _user_id
      AND ur.role::text = 'admin'
      AND (
        atp.permission_key = _permission
        OR (_permission = 'courses.edit' AND atp.permission_key = 'courses.update')
        OR (_permission = 'modules.edit' AND atp.permission_key = 'modules.update')
        OR (_permission = 'lessons.edit' AND atp.permission_key = 'lessons.update')
        OR (_permission = 'assignments.edit' AND atp.permission_key = 'assignments.update')
        OR (_permission = 'assessments.edit' AND atp.permission_key = 'assessments.update')
        OR (_permission = 'certificates.award' AND atp.permission_key = 'certificates.issue')
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.current_admin_has_permission(_permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_admin_permission(auth.uid(), _permission);
$$;

CREATE OR REPLACE FUNCTION public.current_admin_has_organization_scope(_organization_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.admin_roles ar ON ar.user_id = ur.user_id
      WHERE ur.user_id = auth.uid()
        AND ur.role::text = 'admin'
        AND ar.sub_role = 'super_admin'
    )
    OR NOT EXISTS (
      SELECT 1 FROM public.admin_organization_scopes aos
      WHERE aos.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.admin_organization_scopes aos
      WHERE aos.user_id = auth.uid()
        AND aos.organization_id = _organization_id
    );
$$;

/* -------------------------------------------------------------------------- */
/* First-class assignments                                                   */
/* -------------------------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL UNIQUE REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions_html TEXT NOT NULL DEFAULT '',
  max_score INTEGER,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assignment_submissions
  ADD COLUMN IF NOT EXISTS assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE;

INSERT INTO public.assignments (lesson_id, title)
SELECT l.id, l.title
FROM public.lessons l
WHERE l.lesson_type::text = 'assignment'
  AND NOT EXISTS (SELECT 1 FROM public.assignments a WHERE a.lesson_id = l.id);

UPDATE public.assignment_submissions s
SET assignment_id = a.id
FROM public.assignments a
WHERE a.lesson_id = s.lesson_id
  AND s.assignment_id IS NULL;

CREATE INDEX IF NOT EXISTS assignments_lesson_id_idx ON public.assignments(lesson_id);
CREATE INDEX IF NOT EXISTS assignment_submissions_assignment_id_idx ON public.assignment_submissions(assignment_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assignments_enterprise_select" ON public.assignments;
CREATE POLICY "assignments_enterprise_select"
ON public.assignments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = assignments.lesson_id
      AND (
        c.status::text = 'published'
        OR EXISTS (SELECT 1 FROM public.course_instructors ci WHERE ci.course_id = c.id AND ci.instructor_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id = c.id AND e.user_id = auth.uid())
        OR (public.current_admin_has_permission('assignments.view') AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id)))
      )
  )
);

DROP POLICY IF EXISTS "assignments_enterprise_insert" ON public.assignments;
CREATE POLICY "assignments_enterprise_insert"
ON public.assignments FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = assignments.lesson_id
      AND (
        EXISTS (SELECT 1 FROM public.course_instructors ci WHERE ci.course_id = c.id AND ci.instructor_id = auth.uid())
        OR (public.current_admin_has_permission('assignments.create') AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id)))
      )
  )
);

DROP POLICY IF EXISTS "assignments_enterprise_update" ON public.assignments;
CREATE POLICY "assignments_enterprise_update"
ON public.assignments FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = assignments.lesson_id
      AND (
        EXISTS (SELECT 1 FROM public.course_instructors ci WHERE ci.course_id = c.id AND ci.instructor_id = auth.uid())
        OR (public.current_admin_has_permission('assignments.edit') AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id)))
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = assignments.lesson_id
      AND (
        EXISTS (SELECT 1 FROM public.course_instructors ci WHERE ci.course_id = c.id AND ci.instructor_id = auth.uid())
        OR (public.current_admin_has_permission('assignments.edit') AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id)))
      )
  )
);

DROP POLICY IF EXISTS "assignments_enterprise_delete" ON public.assignments;
CREATE POLICY "assignments_enterprise_delete"
ON public.assignments FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = assignments.lesson_id
      AND (
        EXISTS (SELECT 1 FROM public.course_instructors ci WHERE ci.course_id = c.id AND ci.instructor_id = auth.uid())
        OR (public.current_admin_has_permission('assignments.delete') AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id)))
      )
  )
);

/* -------------------------------------------------------------------------- */
/* Notification preferences + communication queue                             */
/* -------------------------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  enrollment_enabled BOOLEAN NOT NULL DEFAULT true,
  assignment_enabled BOOLEAN NOT NULL DEFAULT true,
  certificate_enabled BOOLEAN NOT NULL DEFAULT true,
  payment_enabled BOOLEAN NOT NULL DEFAULT true,
  course_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.communication_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'in_app')),
  event_type TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed', 'skipped')),
  provider_reference TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS communication_events_user_id_idx ON public.communication_events(user_id);
CREATE INDEX IF NOT EXISTS communication_events_status_idx ON public.communication_events(status, created_at);

GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;
GRANT SELECT, INSERT ON public.communication_events TO authenticated;
GRANT ALL ON public.notification_preferences, public.communication_events TO service_role;

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notification_preferences_owner" ON public.notification_preferences;
CREATE POLICY "notification_preferences_owner"
ON public.notification_preferences FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "communication_events_owner_read" ON public.communication_events;
CREATE POLICY "communication_events_owner_read"
ON public.communication_events FOR SELECT TO authenticated
USING (user_id = auth.uid());

/* -------------------------------------------------------------------------- */
/* Timestamp triggers                                                         */
/* -------------------------------------------------------------------------- */

DROP TRIGGER IF EXISTS assignments_updated ON public.assignments;
CREATE TRIGGER assignments_updated
BEFORE UPDATE ON public.assignments
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS notification_preferences_updated ON public.notification_preferences;
CREATE TRIGGER notification_preferences_updated
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
