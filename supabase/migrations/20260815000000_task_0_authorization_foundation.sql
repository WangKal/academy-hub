-- ============================================================================
-- Academy Hub — Task 0 Authorization Foundation
--
-- Extends the existing schema. Does NOT rebuild the LMS tables.
--
-- Model:
--   authentication
--      -> role
--      -> admin tier
--      -> permission
--      -> organization scope
--      -> resource ownership/scope
--      -> action
--
-- Frontend authorization is UX.
-- These functions/RLS policies are the security boundary.
-- ============================================================================


-- ============================================================================
-- 1. ADMIN TIERS
-- ============================================================================

ALTER TYPE public.admin_sub_role
  ADD VALUE IF NOT EXISTS 'platform_admin';

ALTER TYPE public.admin_sub_role
  ADD VALUE IF NOT EXISTS 'org_admin';


-- ============================================================================
-- 2. GRANULAR PERMISSION CATALOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_permission_catalog (
  permission_key TEXT PRIMARY KEY,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.admin_permission_catalog TO authenticated;
GRANT ALL ON public.admin_permission_catalog TO service_role;

ALTER TABLE public.admin_permission_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_permission_catalog_read"
  ON public.admin_permission_catalog;

CREATE POLICY "admin_permission_catalog_read"
  ON public.admin_permission_catalog
  FOR SELECT
  TO authenticated
  USING (true);


-- ============================================================================
-- 3. PERMISSIONS
-- ============================================================================

INSERT INTO public.admin_permission_catalog
  (permission_key, resource, action, description)
VALUES

-- Courses
('courses.view',      'courses', 'view',    'View courses'),
('courses.create',    'courses', 'create',  'Create courses'),
('courses.update',    'courses', 'update',  'Edit courses'),
('courses.delete',    'courses', 'delete',  'Delete or archive courses'),
('courses.publish',   'courses', 'publish', 'Publish or unpublish courses'),

-- Modules
('modules.view',      'modules', 'view',   'View modules'),
('modules.create',    'modules', 'create', 'Create modules'),
('modules.update',    'modules', 'update', 'Edit modules'),
('modules.delete',    'modules', 'delete', 'Delete modules'),

-- Lessons
('lessons.view',      'lessons', 'view',    'View lessons'),
('lessons.create',    'lessons', 'create',  'Create lessons'),
('lessons.update',    'lessons', 'update',  'Edit lessons'),
('lessons.delete',    'lessons', 'delete',  'Delete lessons'),
('lessons.publish',   'lessons', 'publish', 'Publish or unpublish lessons'),

-- Assignments
('assignments.view',     'assignments', 'view',     'View assignments'),
('assignments.create',   'assignments', 'create',   'Create assignments'),
('assignments.update',   'assignments', 'update',   'Edit assignments'),
('assignments.delete',   'assignments', 'delete',   'Delete assignments'),
('assignments.grade',    'assignments', 'grade',    'Grade assignment submissions'),
('assignments.feedback', 'assignments', 'feedback', 'Provide assignment feedback'),

-- Assessments / quizzes
('assessments.view',   'assessments', 'view',   'View assessments'),
('assessments.create', 'assessments', 'create', 'Create assessments'),
('assessments.update', 'assessments', 'update', 'Edit assessments'),
('assessments.delete', 'assessments', 'delete', 'Delete assessments'),
('assessments.grade',  'assessments', 'grade',  'Grade assessments'),

-- Students
('students.view',   'students', 'view',   'View students'),
('students.manage', 'students', 'manage', 'Manage students'),

-- Instructors
('instructors.view',   'instructors', 'view',   'View instructors'),
('instructors.manage', 'instructors', 'manage', 'Manage instructors'),

-- Enrollments
('enrollments.view',   'enrollments', 'view',   'View enrollments'),
('enrollments.manage', 'enrollments', 'manage', 'Manage enrollments'),

-- Certificates
('certificates.view',   'certificates', 'view',   'View certificates'),
('certificates.issue',  'certificates', 'issue',  'Issue certificates'),
('certificates.revoke', 'certificates', 'revoke', 'Revoke certificates'),

-- Organizations
('organizations.view',   'organizations', 'view',   'View organizations'),
('organizations.manage', 'organizations', 'manage', 'Manage organizations'),

-- Payments
('payments.view',   'payments', 'view',   'View payments'),
('payments.manage', 'payments', 'manage', 'Manage payments'),

-- Audit
('audit.view', 'audit', 'view', 'View audit logs'),

-- Administration
('admins.view',   'admins', 'view',   'View administrators'),
('admins.manage', 'admins', 'manage', 'Manage administrators'),

-- Settings
('settings.view',   'settings', 'view',   'View settings'),
('settings.manage', 'settings', 'manage', 'Manage settings')

ON CONFLICT (permission_key) DO UPDATE
SET
  resource = EXCLUDED.resource,
  action = EXCLUDED.action,
  description = EXCLUDED.description;


-- ============================================================================
-- 4. DEFAULT PERMISSIONS BY ADMIN TIER
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_tier_permissions (
  sub_role public.admin_sub_role NOT NULL,
  permission_key TEXT NOT NULL
    REFERENCES public.admin_permission_catalog(permission_key)
    ON DELETE CASCADE,
  PRIMARY KEY (sub_role, permission_key)
);

GRANT SELECT ON public.admin_tier_permissions TO authenticated;
GRANT ALL ON public.admin_tier_permissions TO service_role;

ALTER TABLE public.admin_tier_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_tier_permissions_read"
  ON public.admin_tier_permissions;

CREATE POLICY "admin_tier_permissions_read"
  ON public.admin_tier_permissions
  FOR SELECT
  TO authenticated
  USING (true);


-- Super admin = everything.
INSERT INTO public.admin_tier_permissions (sub_role, permission_key)
SELECT 'super_admin'::public.admin_sub_role, permission_key
FROM public.admin_permission_catalog
ON CONFLICT DO NOTHING;


-- Platform admin
INSERT INTO public.admin_tier_permissions (sub_role, permission_key)
VALUES
('platform_admin', 'courses.view'),
('platform_admin', 'courses.create'),
('platform_admin', 'courses.update'),
('platform_admin', 'courses.delete'),
('platform_admin', 'courses.publish'),
('platform_admin', 'modules.view'),
('platform_admin', 'modules.create'),
('platform_admin', 'modules.update'),
('platform_admin', 'modules.delete'),
('platform_admin', 'lessons.view'),
('platform_admin', 'lessons.create'),
('platform_admin', 'lessons.update'),
('platform_admin', 'lessons.delete'),
('platform_admin', 'lessons.publish'),
('platform_admin', 'students.view'),
('platform_admin', 'students.manage'),
('platform_admin', 'instructors.view'),
('platform_admin', 'instructors.manage'),
('platform_admin', 'enrollments.view'),
('platform_admin', 'enrollments.manage'),
('platform_admin', 'organizations.view'),
('platform_admin', 'organizations.manage'),
('platform_admin', 'payments.view'),
('platform_admin', 'audit.view'),
('platform_admin', 'admins.view'),
('platform_admin', 'settings.view')
ON CONFLICT DO NOTHING;


-- Academic admin
INSERT INTO public.admin_tier_permissions (sub_role, permission_key)
VALUES
('academic_admin', 'courses.view'),
('academic_admin', 'courses.create'),
('academic_admin', 'courses.update'),
('academic_admin', 'courses.delete'),
('academic_admin', 'courses.publish'),
('academic_admin', 'modules.view'),
('academic_admin', 'modules.create'),
('academic_admin', 'modules.update'),
('academic_admin', 'modules.delete'),
('academic_admin', 'lessons.view'),
('academic_admin', 'lessons.create'),
('academic_admin', 'lessons.update'),
('academic_admin', 'lessons.delete'),
('academic_admin', 'lessons.publish'),
('academic_admin', 'assignments.view'),
('academic_admin', 'assignments.create'),
('academic_admin', 'assignments.update'),
('academic_admin', 'assignments.delete'),
('academic_admin', 'assignments.grade'),
('academic_admin', 'assignments.feedback'),
('academic_admin', 'assessments.view'),
('academic_admin', 'assessments.create'),
('academic_admin', 'assessments.update'),
('academic_admin', 'assessments.delete'),
('academic_admin', 'assessments.grade'),
('academic_admin', 'students.view'),
('academic_admin', 'instructors.view'),
('academic_admin', 'enrollments.view'),
('academic_admin', 'enrollments.manage'),
('academic_admin', 'certificates.view'),
('academic_admin', 'certificates.issue'),
('academic_admin', 'certificates.revoke'),
('academic_admin', 'organizations.view')
ON CONFLICT DO NOTHING;


-- Finance admin
INSERT INTO public.admin_tier_permissions (sub_role, permission_key)
VALUES
('finance_admin', 'courses.view'),
('finance_admin', 'students.view'),
('finance_admin', 'enrollments.view'),
('finance_admin', 'payments.view'),
('finance_admin', 'payments.manage'),
('finance_admin', 'organizations.view'),
('finance_admin', 'audit.view')
ON CONFLICT DO NOTHING;


-- User admin
INSERT INTO public.admin_tier_permissions (sub_role, permission_key)
VALUES
('user_admin', 'students.view'),
('user_admin', 'students.manage'),
('user_admin', 'instructors.view'),
('user_admin', 'instructors.manage'),
('user_admin', 'enrollments.view'),
('user_admin', 'enrollments.manage'),
('user_admin', 'organizations.view')
ON CONFLICT DO NOTHING;


-- Compliance admin
INSERT INTO public.admin_tier_permissions (sub_role, permission_key)
VALUES
('compliance_admin', 'courses.view'),
('compliance_admin', 'students.view'),
('compliance_admin', 'instructors.view'),
('compliance_admin', 'enrollments.view'),
('compliance_admin', 'certificates.view'),
('compliance_admin', 'audit.view')
ON CONFLICT DO NOTHING;



-- The previous INSERT above intentionally needs correction because both
-- values must be explicitly typed as enum/text pairs.
DELETE FROM public.admin_tier_permissions
WHERE sub_role = 'compliance_admin'
  AND permission_key = 'courses.view';

INSERT INTO public.admin_tier_permissions (sub_role, permission_key)
VALUES
('compliance_admin', 'courses.view'),
('compliance_admin', 'students.view'),
('compliance_admin', 'instructors.view'),
('compliance_admin', 'enrollments.view'),
('compliance_admin', 'certificates.view'),
('compliance_admin', 'audit.view')
ON CONFLICT DO NOTHING;


-- Organization admin
INSERT INTO public.admin_tier_permissions (sub_role, permission_key)
VALUES
('org_admin', 'students.view'),
('org_admin', 'students.manage'),
('org_admin', 'instructors.view'),
('org_admin', 'instructors.manage'),
('org_admin', 'courses.view'),
('org_admin', 'courses.create'),
('org_admin', 'courses.update'),
('org_admin', 'modules.view'),
('org_admin', 'modules.create'),
('org_admin', 'modules.update'),
('org_admin', 'modules.delete'),
('org_admin', 'lessons.view'),
('org_admin', 'lessons.create'),
('org_admin', 'lessons.update'),
('org_admin', 'lessons.delete'),
('org_admin', 'assignments.view'),
('org_admin', 'assignments.grade'),
('org_admin', 'assessments.view'),
('org_admin', 'assessments.grade'),
('org_admin', 'enrollments.view'),
('org_admin', 'enrollments.manage'),
('org_admin', 'certificates.view'),
('org_admin', 'organizations.view')
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 5. ADMIN ORGANIZATION SCOPE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_organization_scopes (
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL
    REFERENCES public.organizations(id)
    ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, organization_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.admin_organization_scopes
TO authenticated;

GRANT ALL
ON public.admin_organization_scopes
TO service_role;

ALTER TABLE public.admin_organization_scopes ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 6. ORGANIZATION PARTICIPANTS / SPONSORSHIP
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.organization_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  organization_id UUID NOT NULL
    REFERENCES public.organizations(id)
    ON DELETE CASCADE,

  user_id UUID NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE CASCADE,

  relationship TEXT NOT NULL DEFAULT 'sponsored',

  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (organization_id, user_id, relationship)
);

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.organization_participants
TO authenticated;

GRANT ALL
ON public.organization_participants
TO service_role;

ALTER TABLE public.organization_participants ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 7. ORGANIZATION OWNERSHIP OF COURSES
--
-- NULL organization_id = independent course.
-- Non-NULL = organization-scoped course.
-- ============================================================================

ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS organization_id UUID
REFERENCES public.organizations(id)
ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS courses_organization_id_idx
ON public.courses(organization_id);


-- ============================================================================
-- 8. AUTHORIZATION FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.current_user_has_role(_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role::text = _role
  );
$$;


CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_has_role('admin');
$$;


CREATE OR REPLACE FUNCTION public.is_instructor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_has_role('instructor');
$$;


CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_has_role('student');
$$;


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
  SELECT
    public.is_admin()
    AND
    (
      EXISTS (
        SELECT 1
        FROM public.admin_permissions ap
        JOIN public.admin_tier_permissions atp
          ON atp.sub_role = ap.sub_role
         AND atp.permission_key = _permission
        WHERE ap.user_id = _user_id
      )
      OR
      EXISTS (
        SELECT 1
        FROM public.admin_permissions ap
        WHERE ap.user_id = _user_id
          AND jsonb_typeof(ap.permissions) = 'array'
          AND ap.permissions ? _permission
      )
    );
$$;


CREATE OR REPLACE FUNCTION public.current_admin_has_permission(
  _permission TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_admin_permission(auth.uid(), _permission);
$$;


CREATE OR REPLACE FUNCTION public.admin_has_organization_scope(
  _user_id UUID,
  _organization_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1
      FROM public.admin_organization_scopes aos
      WHERE aos.user_id = _user_id
        AND aos.organization_id = _organization_id
    )
    OR NOT EXISTS (
      SELECT 1
      FROM public.admin_organization_scopes aos
      WHERE aos.user_id = _user_id
    );
$$;


CREATE OR REPLACE FUNCTION public.current_admin_has_organization_scope(
  _organization_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_admin()
    AND public.admin_has_organization_scope(
      auth.uid(),
      _organization_id
    );
$$;


-- ============================================================================
-- 9. RESOURCE-LEVEL HELPERS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.can_manage_course(
  _course_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.courses c
    WHERE c.id = _course_id
      AND
      (
        -- Instructor owns course.
        (
          public.is_instructor()
          AND c.instructor_id = auth.uid()
        )

        OR

        -- Admin has course management permission and scope.
        (
          public.current_admin_has_permission('courses.update')
          AND (
            c.organization_id IS NULL
            OR public.current_admin_has_organization_scope(c.organization_id)
          )
        )
      )
  );
$$;


CREATE OR REPLACE FUNCTION public.can_manage_course_content(
  _course_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.can_manage_course(_course_id)
    AND
    (
      public.is_instructor()
      OR public.current_admin_has_permission('modules.update')
      OR public.current_admin_has_permission('lessons.update')
    );
$$;


CREATE OR REPLACE FUNCTION public.can_grade_course(
  _course_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (
      SELECT 1
      FROM public.courses c
      WHERE c.id = _course_id
        AND
        (
          (
            public.is_instructor()
            AND c.instructor_id = auth.uid()
          )
          OR
          public.current_admin_has_permission('assignments.grade')
          OR
          public.current_admin_has_permission('assessments.grade')
        )
    );
$$;


-- ============================================================================
-- 10. ADMIN ORGANIZATION SCOPE RLS
-- ============================================================================

DROP POLICY IF EXISTS "admin_org_scope_read"
  ON public.admin_organization_scopes;

CREATE POLICY "admin_org_scope_read"
  ON public.admin_organization_scopes
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin()
  );


DROP POLICY IF EXISTS "admin_org_scope_write"
  ON public.admin_organization_scopes;

CREATE POLICY "admin_org_scope_write"
  ON public.admin_organization_scopes
  FOR ALL
  TO authenticated
  USING (
    public.current_admin_has_permission('organizations.manage')
    OR public.current_admin_has_permission('admins.manage')
  )
  WITH CHECK (
    public.current_admin_has_permission('organizations.manage')
    OR public.current_admin_has_permission('admins.manage')
  );


-- ============================================================================
-- 11. SPONSOR/PARTICIPANT RLS
-- ============================================================================

DROP POLICY IF EXISTS "organization_participants_read"
  ON public.organization_participants;

CREATE POLICY "organization_participants_read"
  ON public.organization_participants
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.current_admin_has_permission('organizations.view')
    OR public.admin_has_organization_scope(
      auth.uid(),
      organization_id
    )
  );


DROP POLICY IF EXISTS "organization_participants_manage"
  ON public.organization_participants;

CREATE POLICY "organization_participants_manage"
  ON public.organization_participants
  FOR ALL
  TO authenticated
  USING (
    public.current_admin_has_permission('organizations.manage')
    AND public.admin_has_organization_scope(
      auth.uid(),
      organization_id
    )
  )
  WITH CHECK (
    public.current_admin_has_permission('organizations.manage')
    AND public.admin_has_organization_scope(
      auth.uid(),
      organization_id
    )
  );


-- ============================================================================
-- 12. COURSES
-- ============================================================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courses_task0_select"
  ON public.courses;

CREATE POLICY "courses_task0_select"
  ON public.courses
  FOR SELECT
  TO authenticated
  USING (
    status = 'published'
    OR instructor_id = auth.uid()
    OR (
      public.current_admin_has_permission('courses.view')
      AND (
        organization_id IS NULL
        OR public.current_admin_has_organization_scope(organization_id)
      )
    )
    OR EXISTS (
      SELECT 1
      FROM public.enrollments e
      WHERE e.course_id = courses.id
        AND e.user_id = auth.uid()
    )
  );


DROP POLICY IF EXISTS "courses_task0_insert"
  ON public.courses;

CREATE POLICY "courses_task0_insert"
  ON public.courses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      public.is_instructor()
      AND instructor_id = auth.uid()
    )
    OR
    (
      public.current_admin_has_permission('courses.create')
      AND (
        organization_id IS NULL
        OR public.current_admin_has_organization_scope(organization_id)
      )
    )
  );


DROP POLICY IF EXISTS "courses_task0_update"
  ON public.courses;

CREATE POLICY "courses_task0_update"
  ON public.courses
  FOR UPDATE
  TO authenticated
  USING (
    public.can_manage_course(id)
  )
  WITH CHECK (
    public.can_manage_course(id)
  );


DROP POLICY IF EXISTS "courses_task0_delete"
  ON public.courses;

CREATE POLICY "courses_task0_delete"
  ON public.courses
  FOR DELETE
  TO authenticated
  USING (
    (
      public.is_instructor()
      AND instructor_id = auth.uid()
    )
    OR
    public.current_admin_has_permission('courses.delete')
  );


-- ============================================================================
-- 13. MODULES
-- ============================================================================

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "modules_task0_select"
  ON public.modules;

CREATE POLICY "modules_task0_select"
  ON public.modules
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.courses c
      WHERE c.id = modules.course_id
        AND (
          c.status = 'published'
          OR c.instructor_id = auth.uid()
          OR public.current_admin_has_permission('modules.view')
          OR EXISTS (
            SELECT 1
            FROM public.enrollments e
            WHERE e.course_id = c.id
              AND e.user_id = auth.uid()
          )
        )
    )
  );


DROP POLICY IF EXISTS "modules_task0_insert"
  ON public.modules;

CREATE POLICY "modules_task0_insert"
  ON public.modules
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.can_manage_course_content(course_id)
  );


DROP POLICY IF EXISTS "modules_task0_update"
  ON public.modules;

CREATE POLICY "modules_task0_update"
  ON public.modules
  FOR UPDATE
  TO authenticated
  USING (public.can_manage_course_content(course_id))
  WITH CHECK (public.can_manage_course_content(course_id));


DROP POLICY IF EXISTS "modules_task0_delete"
  ON public.modules;

CREATE POLICY "modules_task0_delete"
  ON public.modules
  FOR DELETE
  TO authenticated
  USING (
    public.can_manage_course_content(course_id)
  );


-- ============================================================================
-- 14. LESSONS
-- ============================================================================

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lessons_task0_select"
  ON public.lessons;

CREATE POLICY "lessons_task0_select"
  ON public.lessons
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.modules m
      JOIN public.courses c ON c.id = m.course_id
      WHERE m.id = lessons.module_id
        AND (
          c.status = 'published'
          OR c.instructor_id = auth.uid()
          OR public.current_admin_has_permission('lessons.view')
          OR EXISTS (
            SELECT 1
            FROM public.enrollments e
            WHERE e.course_id = c.id
              AND e.user_id = auth.uid()
          )
        )
    )
  );


DROP POLICY IF EXISTS "lessons_task0_insert"
  ON public.lessons;

CREATE POLICY "lessons_task0_insert"
  ON public.lessons
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.modules m
      WHERE m.id = module_id
        AND public.can_manage_course_content(m.course_id)
    )
  );


DROP POLICY IF EXISTS "lessons_task0_update"
  ON public.lessons;

CREATE POLICY "lessons_task0_update"
  ON public.lessons
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.modules m
      WHERE m.id = lessons.module_id
        AND public.can_manage_course_content(m.course_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.modules m
      WHERE m.id = lessons.module_id
        AND public.can_manage_course_content(m.course_id)
    )
  );


DROP POLICY IF EXISTS "lessons_task0_delete"
  ON public.lessons;

CREATE POLICY "lessons_task0_delete"
  ON public.lessons
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.modules m
      WHERE m.id = lessons.module_id
        AND public.can_manage_course_content(m.course_id)
    )
  );


-- ============================================================================
-- 15. ASSIGNMENT SUBMISSIONS
-- ============================================================================

ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assignment_submissions_task0_select"
  ON public.assignment_submissions;

CREATE POLICY "assignment_submissions_task0_select"
  ON public.assignment_submissions
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.current_admin_has_permission('assignments.view')
    OR EXISTS (
      SELECT 1
      FROM public.lessons l
      JOIN public.modules m ON m.id = l.module_id
      JOIN public.courses c ON c.id = m.course_id
      WHERE l.id = assignment_submissions.lesson_id
        AND (
          c.instructor_id = auth.uid()
          OR public.can_grade_course(c.id)
        )
    )
  );


DROP POLICY IF EXISTS "assignment_submissions_task0_insert"
  ON public.assignment_submissions;

CREATE POLICY "assignment_submissions_task0_insert"
  ON public.assignment_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );


DROP POLICY IF EXISTS "assignment_submissions_task0_update"
  ON public.assignment_submissions;

CREATE POLICY "assignment_submissions_task0_update"
  ON public.assignment_submissions
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.can_grade_course(
      (
        SELECT c.id
        FROM public.lessons l
        JOIN public.modules m ON m.id = l.module_id
        JOIN public.courses c ON c.id = m.course_id
        WHERE l.id = assignment_submissions.lesson_id
      )
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR public.current_admin_has_permission('assignments.grade')
  );


-- ============================================================================
-- 16. CERTIFICATES
-- ============================================================================

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "certificates_task0_select"
  ON public.certificates;

CREATE POLICY "certificates_task0_select"
  ON public.certificates
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.current_admin_has_permission('certificates.view')
    OR EXISTS (
      SELECT 1
      FROM public.courses c
      WHERE c.id = certificates.course_id
        AND (
          c.instructor_id = auth.uid()
          OR public.current_admin_has_permission('certificates.view')
        )
    )
  );


DROP POLICY IF EXISTS "certificates_task0_insert"
  ON public.certificates;

CREATE POLICY "certificates_task0_insert"
  ON public.certificates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.current_admin_has_permission('certificates.issue')
    OR EXISTS (
      SELECT 1
      FROM public.courses c
      WHERE c.id = course_id
        AND c.instructor_id = auth.uid()
    )
  );


DROP POLICY IF EXISTS "certificates_task0_update"
  ON public.certificates;

CREATE POLICY "certificates_task0_update"
  ON public.certificates
  FOR UPDATE
  TO authenticated
  USING (
    public.current_admin_has_permission('certificates.issue')
    OR public.current_admin_has_permission('certificates.revoke')
  )
  WITH CHECK (
    public.current_admin_has_permission('certificates.issue')
    OR public.current_admin_has_permission('certificates.revoke')
  );


-- ============================================================================
-- 17. PAYMENTS
-- ============================================================================

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_task0_select"
  ON public.payments;

CREATE POLICY "payments_task0_select"
  ON public.payments
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.current_admin_has_permission('payments.view')
  );


DROP POLICY IF EXISTS "payments_task0_manage"
  ON public.payments;

CREATE POLICY "payments_task0_manage"
  ON public.payments
  FOR ALL
  TO authenticated
  USING (
    public.current_admin_has_permission('payments.manage')
  )
  WITH CHECK (
    public.current_admin_has_permission('payments.manage')
  );


-- ============================================================================
-- 18. AUDIT LOGS
-- ============================================================================

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_task0_read"
  ON public.audit_logs;

CREATE POLICY "audit_logs_task0_read"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    public.current_admin_has_permission('audit.view')
  );


-- ============================================================================
-- 19. ADMIN PERMISSIONS
-- ============================================================================

ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_permissions_task0_read"
  ON public.admin_permissions;

CREATE POLICY "admin_permissions_task0_read"
  ON public.admin_permissions
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.current_admin_has_permission('admins.manage')
  );


DROP POLICY IF EXISTS "admin_permissions_task0_manage"
  ON public.admin_permissions;

CREATE POLICY "admin_permissions_task0_manage"
  ON public.admin_permissions
  FOR ALL
  TO authenticated
  USING (
    public.current_admin_has_permission('admins.manage')
  )
  WITH CHECK (
    public.current_admin_has_permission('admins.manage')
  );


-- ============================================================================
-- 20. ORGANIZATIONS
-- ============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organizations_task0_read"
  ON public.organizations;

CREATE POLICY "organizations_task0_read"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (
    public.current_admin_has_permission('organizations.view')
    OR public.admin_has_organization_scope(id)
    OR EXISTS (
      SELECT 1
      FROM public.organization_members om
      WHERE om.organization_id = organizations.id
        AND om.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.organization_participants op
      WHERE op.organization_id = organizations.id
        AND op.user_id = auth.uid()
    )
  );


DROP POLICY IF EXISTS "organizations_task0_manage"
  ON public.organizations;

CREATE POLICY "organizations_task0_manage"
  ON public.organizations
  FOR ALL
  TO authenticated
  USING (
    public.current_admin_has_permission('organizations.manage')
    AND public.admin_has_organization_scope(id)
  )
  WITH CHECK (
    public.current_admin_has_permission('organizations.manage')
    AND public.admin_has_organization_scope(id)
  );


-- ============================================================================
-- 21. ORGANIZATION MEMBERS
-- ============================================================================

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organization_members_task0_read"
  ON public.organization_members;

CREATE POLICY "organization_members_task0_read"
  ON public.organization_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.current_admin_has_permission('organizations.view')
    OR public.admin_has_organization_scope(organization_id)
  );


DROP POLICY IF EXISTS "organization_members_task0_manage"
  ON public.organization_members;

CREATE POLICY "organization_members_task0_manage"
  ON public.organization_members
  FOR ALL
  TO authenticated
  USING (
    public.current_admin_has_permission('organizations.manage')
    AND public.admin_has_organization_scope(organization_id)
  )
  WITH CHECK (
    public.current_admin_has_permission('organizations.manage')
    AND public.admin_has_organization_scope(organization_id)
  );


-- ============================================================================
-- 22. COHORTS
-- ============================================================================

ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cohorts_task0_read"
  ON public.cohorts;

CREATE POLICY "cohorts_task0_read"
  ON public.cohorts
  FOR SELECT
  TO authenticated
  USING (
    public.admin_has_organization_scope(
      auth.uid(),
      organization_id
    )
    OR EXISTS (
      SELECT 1
      FROM public.organization_members om
      WHERE om.organization_id = cohorts.organization_id
        AND om.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1
      FROM public.organization_participants op
      WHERE op.organization_id = cohorts.organization_id
        AND op.user_id = auth.uid()
    )
  );


DROP POLICY IF EXISTS "cohorts_task0_manage"
  ON public.cohorts;

CREATE POLICY "cohorts_task0_manage"
  ON public.cohorts
  FOR ALL
  TO authenticated
  USING (
    public.current_admin_has_permission('organizations.manage')
    AND public.admin_has_organization_scope(organization_id)
  )
  WITH CHECK (
    public.current_admin_has_permission('organizations.manage')
    AND public.admin_has_organization_scope(organization_id)
  );


-- ============================================================================
-- 23. UPDATED-AT TRIGGER FOR NEW PARTICIPANT TABLE
-- ============================================================================

DROP TRIGGER IF EXISTS organization_participants_updated
  ON public.organization_participants;

CREATE TRIGGER organization_participants_updated
BEFORE UPDATE ON public.organization_participants
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();


-- ============================================================================
-- 24. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS admin_permissions_sub_role_idx
ON public.admin_permissions(sub_role);

CREATE INDEX IF NOT EXISTS admin_organization_scopes_org_idx
ON public.admin_organization_scopes(organization_id);

CREATE INDEX IF NOT EXISTS organization_participants_user_idx
ON public.organization_participants(user_id);

CREATE INDEX IF NOT EXISTS organization_members_user_idx
ON public.organization_members(user_id);

CREATE INDEX IF NOT EXISTS enrollments_user_course_idx
ON public.enrollments(user_id, course_id);

CREATE INDEX IF NOT EXISTS assignment_submissions_user_idx
ON public.assignment_submissions(user_id);

CREATE INDEX IF NOT EXISTS certificates_user_course_idx
ON public.certificates(user_id, course_id);


-- ============================================================================
-- END TASK 0
-- ============================================================================