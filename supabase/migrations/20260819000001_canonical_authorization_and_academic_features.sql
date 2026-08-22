-- ============================================================================
-- Academy Hub — Canonical authorization catalog + academic feature alignment
-- Generated from src/services/permissions.ts.
--
-- The frontend permission catalog is canonical. This migration makes the
-- database vocabulary and tier mappings use those exact permission keys.
-- ============================================================================

-- 1. Replace the old reduced catalog with the canonical catalog.
DELETE FROM public.admin_tier_permissions;
DELETE FROM public.admin_permission_catalog;

INSERT INTO public.admin_permission_catalog
(permission_key, resource, action, description)
VALUES
('users.view', 'users', 'view', 'Users — View'),
('users.create', 'users', 'create', 'Users — Create'),
('users.edit', 'users', 'edit', 'Users — Edit'),
('users.delete', 'users', 'delete', 'Users — Delete'),
('users.suspend', 'users', 'suspend', 'Users — Suspend'),
('users.assign', 'users', 'assign', 'Users — Assign'),
('users.manage', 'users', 'manage', 'Users — Manage'),
('students.view', 'students', 'view', 'Students — View'),
('students.create', 'students', 'create', 'Students — Create'),
('students.edit', 'students', 'edit', 'Students — Edit'),
('students.delete', 'students', 'delete', 'Students — Delete'),
('students.assign', 'students', 'assign', 'Students — Assign'),
('students.manage', 'students', 'manage', 'Students — Manage'),
('students.view_progress', 'students', 'view_progress', 'Students — View Progress'),
('students.view_enrollments', 'students', 'view_enrollments', 'Students — View Enrollments'),
('students.view_certificates', 'students', 'view_certificates', 'Students — View Certificates'),
('instructors.view', 'instructors', 'view', 'Instructors — View'),
('instructors.create', 'instructors', 'create', 'Instructors — Create'),
('instructors.edit', 'instructors', 'edit', 'Instructors — Edit'),
('instructors.delete', 'instructors', 'delete', 'Instructors — Delete'),
('instructors.assign', 'instructors', 'assign', 'Instructors — Assign'),
('instructors.manage', 'instructors', 'manage', 'Instructors — Manage'),
('instructors.view_performance', 'instructors', 'view_performance', 'Instructors — View Performance'),
('organizations.view', 'organizations', 'view', 'Organizations — View'),
('organizations.create', 'organizations', 'create', 'Organizations — Create'),
('organizations.edit', 'organizations', 'edit', 'Organizations — Edit'),
('organizations.delete', 'organizations', 'delete', 'Organizations — Delete'),
('organizations.manage', 'organizations', 'manage', 'Organizations — Manage'),
('organizations.manage_members', 'organizations', 'manage_members', 'Organizations — Manage Members'),
('organizations.manage_admins', 'organizations', 'manage_admins', 'Organizations — Manage Admins'),
('organizations.view_reports', 'organizations', 'view_reports', 'Organizations — View Reports'),
('courses.view', 'courses', 'view', 'Courses — View'),
('courses.create', 'courses', 'create', 'Courses — Create'),
('courses.edit', 'courses', 'edit', 'Courses — Edit'),
('courses.delete', 'courses', 'delete', 'Courses — Delete'),
('courses.publish', 'courses', 'publish', 'Courses — Publish'),
('courses.unpublish', 'courses', 'unpublish', 'Courses — Unpublish'),
('courses.archive', 'courses', 'archive', 'Courses — Archive'),
('courses.assign', 'courses', 'assign', 'Courses — Assign'),
('courses.manage', 'courses', 'manage', 'Courses — Manage'),
('courses.view_students', 'courses', 'view_students', 'Courses — View Students'),
('courses.view_progress', 'courses', 'view_progress', 'Courses — View Progress'),
('courses.view_statistics', 'courses', 'view_statistics', 'Courses — View Statistics'),
('modules.view', 'modules', 'view', 'Modules — View'),
('modules.create', 'modules', 'create', 'Modules — Create'),
('modules.edit', 'modules', 'edit', 'Modules — Edit'),
('modules.delete', 'modules', 'delete', 'Modules — Delete'),
('modules.reorder', 'modules', 'reorder', 'Modules — Reorder'),
('modules.manage', 'modules', 'manage', 'Modules — Manage'),
('lessons.view', 'lessons', 'view', 'Lessons — View'),
('lessons.create', 'lessons', 'create', 'Lessons — Create'),
('lessons.edit', 'lessons', 'edit', 'Lessons — Edit'),
('lessons.delete', 'lessons', 'delete', 'Lessons — Delete'),
('lessons.reorder', 'lessons', 'reorder', 'Lessons — Reorder'),
('lessons.publish', 'lessons', 'publish', 'Lessons — Publish'),
('lessons.unpublish', 'lessons', 'unpublish', 'Lessons — Unpublish'),
('lessons.manage', 'lessons', 'manage', 'Lessons — Manage'),
('lesson_content.view', 'lesson_content', 'view', 'Lesson Content — View'),
('lesson_content.create', 'lesson_content', 'create', 'Lesson Content — Create'),
('lesson_content.edit', 'lesson_content', 'edit', 'Lesson Content — Edit'),
('lesson_content.delete', 'lesson_content', 'delete', 'Lesson Content — Delete'),
('lesson_content.manage', 'lesson_content', 'manage', 'Lesson Content — Manage'),
('assignments.view', 'assignments', 'view', 'Assignments — View'),
('assignments.create', 'assignments', 'create', 'Assignments — Create'),
('assignments.edit', 'assignments', 'edit', 'Assignments — Edit'),
('assignments.delete', 'assignments', 'delete', 'Assignments — Delete'),
('assignments.publish', 'assignments', 'publish', 'Assignments — Publish'),
('assignments.unpublish', 'assignments', 'unpublish', 'Assignments — Unpublish'),
('assignments.manage', 'assignments', 'manage', 'Assignments — Manage'),
('assessments.view', 'assessments', 'view', 'Assessments — View'),
('assessments.create', 'assessments', 'create', 'Assessments — Create'),
('assessments.edit', 'assessments', 'edit', 'Assessments — Edit'),
('assessments.delete', 'assessments', 'delete', 'Assessments — Delete'),
('assessments.publish', 'assessments', 'publish', 'Assessments — Publish'),
('assessments.unpublish', 'assessments', 'unpublish', 'Assessments — Unpublish'),
('assessments.manage', 'assessments', 'manage', 'Assessments — Manage'),
('submissions.view', 'submissions', 'view', 'Submissions — View'),
('submissions.submit', 'submissions', 'submit', 'Submissions — Submit'),
('submissions.edit', 'submissions', 'edit', 'Submissions — Edit'),
('submissions.delete', 'submissions', 'delete', 'Submissions — Delete'),
('submissions.review', 'submissions', 'review', 'Submissions — Review'),
('submissions.return', 'submissions', 'return', 'Submissions — Return'),
('submissions.manage', 'submissions', 'manage', 'Submissions — Manage'),
('grades.view', 'grades', 'view', 'Grades — View'),
('grades.create', 'grades', 'create', 'Grades — Create'),
('grades.edit', 'grades', 'edit', 'Grades — Edit'),
('grades.grade', 'grades', 'grade', 'Grades — Grade'),
('grades.override', 'grades', 'override', 'Grades — Override'),
('grades.manage', 'grades', 'manage', 'Grades — Manage'),
('enrollments.view', 'enrollments', 'view', 'Enrollments — View'),
('enrollments.create', 'enrollments', 'create', 'Enrollments — Create'),
('enrollments.edit', 'enrollments', 'edit', 'Enrollments — Edit'),
('enrollments.cancel', 'enrollments', 'cancel', 'Enrollments — Cancel'),
('enrollments.complete', 'enrollments', 'complete', 'Enrollments — Complete'),
('enrollments.allocate', 'enrollments', 'allocate', 'Enrollments — Allocate'),
('enrollments.manage', 'enrollments', 'manage', 'Enrollments — Manage'),
('learning.view', 'learning', 'view', 'Learning — View'),
('learning.participate', 'learning', 'participate', 'Learning — Participate'),
('learning.complete', 'learning', 'complete', 'Learning — Complete'),
('progress.view', 'progress', 'view', 'Progress — View'),
('progress.update', 'progress', 'update', 'Progress — Update'),
('progress.complete', 'progress', 'complete', 'Progress — Complete'),
('progress.override', 'progress', 'override', 'Progress — Override'),
('progress.manage', 'progress', 'manage', 'Progress — Manage'),
('certificates.view', 'certificates', 'view', 'Certificates — View'),
('certificates.award', 'certificates', 'award', 'Certificates — Award'),
('certificates.revoke', 'certificates', 'revoke', 'Certificates — Revoke'),
('certificates.reissue', 'certificates', 'reissue', 'Certificates — Reissue'),
('certificates.override', 'certificates', 'override', 'Certificates — Override'),
('certificates.manage', 'certificates', 'manage', 'Certificates — Manage'),
('sponsorships.view', 'sponsorships', 'view', 'Sponsorships — View'),
('sponsorships.create', 'sponsorships', 'create', 'Sponsorships — Create'),
('sponsorships.edit', 'sponsorships', 'edit', 'Sponsorships — Edit'),
('sponsorships.delete', 'sponsorships', 'delete', 'Sponsorships — Delete'),
('sponsorships.allocate', 'sponsorships', 'allocate', 'Sponsorships — Allocate'),
('sponsorships.withdraw', 'sponsorships', 'withdraw', 'Sponsorships — Withdraw'),
('sponsorships.view_students', 'sponsorships', 'view_students', 'Sponsorships — View Students'),
('sponsorships.view_progress', 'sponsorships', 'view_progress', 'Sponsorships — View Progress'),
('sponsorships.view_certificates', 'sponsorships', 'view_certificates', 'Sponsorships — View Certificates'),
('sponsorships.view_reports', 'sponsorships', 'view_reports', 'Sponsorships — View Reports'),
('sponsorships.manage', 'sponsorships', 'manage', 'Sponsorships — Manage'),
('payments.view', 'payments', 'view', 'Payments — View'),
('payments.create', 'payments', 'create', 'Payments — Create'),
('payments.edit', 'payments', 'edit', 'Payments — Edit'),
('payments.refund', 'payments', 'refund', 'Payments — Refund'),
('payments.export', 'payments', 'export', 'Payments — Export'),
('payments.manage', 'payments', 'manage', 'Payments — Manage'),
('payments.view_reports', 'payments', 'view_reports', 'Payments — View Reports'),
('audit.view', 'audit', 'view', 'Audit — View'),
('audit.export', 'audit', 'export', 'Audit — Export'),
('audit.review', 'audit', 'review', 'Audit — Review'),
('settings.view', 'settings', 'view', 'Settings — View'),
('settings.edit', 'settings', 'edit', 'Settings — Edit'),
('settings.manage', 'settings', 'manage', 'Settings — Manage'),
('admins.view', 'admins', 'view', 'Admins — View'),
('admins.create', 'admins', 'create', 'Admins — Create'),
('admins.edit', 'admins', 'edit', 'Admins — Edit'),
('admins.delete', 'admins', 'delete', 'Admins — Delete'),
('admins.suspend', 'admins', 'suspend', 'Admins — Suspend'),
('admins.manage', 'admins', 'manage', 'Admins — Manage');

-- 2. Rebuild tier defaults from the canonical frontend semantics.
INSERT INTO public.admin_tier_permissions (sub_role, permission_key)
SELECT 'super_admin'::public.admin_sub_role, permission_key
FROM public.admin_permission_catalog;

INSERT INTO public.admin_tier_permissions (sub_role, permission_key)
SELECT 'platform_admin'::public.admin_sub_role, permission_key
FROM public.admin_permission_catalog
WHERE resource NOT IN ('admins', 'settings');

INSERT INTO public.admin_tier_permissions (sub_role, permission_key)
VALUES
-- academic_admin
('academic_admin', 'users.view'),
('academic_admin', 'students.view'),
('academic_admin', 'students.edit'),
('academic_admin', 'students.assign'),
('academic_admin', 'students.view_progress'),
('academic_admin', 'students.view_enrollments'),
('academic_admin', 'students.view_certificates'),
('academic_admin', 'instructors.view'),
('academic_admin', 'instructors.edit'),
('academic_admin', 'instructors.assign'),
('academic_admin', 'instructors.view_performance'),
('academic_admin', 'courses.view'),
('academic_admin', 'courses.create'),
('academic_admin', 'courses.edit'),
('academic_admin', 'courses.delete'),
('academic_admin', 'courses.publish'),
('academic_admin', 'courses.unpublish'),
('academic_admin', 'courses.archive'),
('academic_admin', 'courses.assign'),
('academic_admin', 'courses.manage'),
('academic_admin', 'courses.view_students'),
('academic_admin', 'courses.view_progress'),
('academic_admin', 'courses.view_statistics'),
('academic_admin', 'modules.view'),
('academic_admin', 'modules.create'),
('academic_admin', 'modules.edit'),
('academic_admin', 'modules.delete'),
('academic_admin', 'modules.reorder'),
('academic_admin', 'modules.manage'),
('academic_admin', 'lessons.view'),
('academic_admin', 'lessons.create'),
('academic_admin', 'lessons.edit'),
('academic_admin', 'lessons.delete'),
('academic_admin', 'lessons.reorder'),
('academic_admin', 'lessons.publish'),
('academic_admin', 'lessons.unpublish'),
('academic_admin', 'lessons.manage'),
('academic_admin', 'lesson_content.view'),
('academic_admin', 'lesson_content.create'),
('academic_admin', 'lesson_content.edit'),
('academic_admin', 'lesson_content.delete'),
('academic_admin', 'lesson_content.manage'),
('academic_admin', 'assignments.view'),
('academic_admin', 'assignments.create'),
('academic_admin', 'assignments.edit'),
('academic_admin', 'assignments.delete'),
('academic_admin', 'assignments.publish'),
('academic_admin', 'assignments.unpublish'),
('academic_admin', 'assignments.manage'),
('academic_admin', 'assessments.view'),
('academic_admin', 'assessments.create'),
('academic_admin', 'assessments.edit'),
('academic_admin', 'assessments.delete'),
('academic_admin', 'assessments.publish'),
('academic_admin', 'assessments.unpublish'),
('academic_admin', 'assessments.manage'),
('academic_admin', 'submissions.view'),
('academic_admin', 'submissions.review'),
('academic_admin', 'submissions.return'),
('academic_admin', 'submissions.manage'),
('academic_admin', 'grades.view'),
('academic_admin', 'grades.create'),
('academic_admin', 'grades.edit'),
('academic_admin', 'grades.grade'),
('academic_admin', 'grades.override'),
('academic_admin', 'grades.manage'),
('academic_admin', 'enrollments.view'),
('academic_admin', 'enrollments.create'),
('academic_admin', 'enrollments.edit'),
('academic_admin', 'enrollments.cancel'),
('academic_admin', 'enrollments.complete'),
('academic_admin', 'enrollments.allocate'),
('academic_admin', 'enrollments.manage'),
('academic_admin', 'learning.view'),
('academic_admin', 'learning.participate'),
('academic_admin', 'learning.complete'),
('academic_admin', 'progress.view'),
('academic_admin', 'progress.update'),
('academic_admin', 'progress.complete'),
('academic_admin', 'progress.override'),
('academic_admin', 'progress.manage'),
('academic_admin', 'certificates.view'),
('academic_admin', 'certificates.award'),
('academic_admin', 'certificates.revoke'),
('academic_admin', 'certificates.reissue'),
('academic_admin', 'certificates.override'),
('academic_admin', 'certificates.manage'),
('academic_admin', 'organizations.view'),
('academic_admin', 'sponsorships.view'),
('academic_admin', 'audit.view'),

-- finance_admin
('finance_admin', 'users.view'),
('finance_admin', 'students.view'),
('finance_admin', 'instructors.view'),
('finance_admin', 'organizations.view'),
('finance_admin', 'courses.view'),
('finance_admin', 'enrollments.view'),
('finance_admin', 'enrollments.allocate'),
('finance_admin', 'sponsorships.view'),
('finance_admin', 'sponsorships.create'),
('finance_admin', 'sponsorships.edit'),
('finance_admin', 'sponsorships.allocate'),
('finance_admin', 'sponsorships.withdraw'),
('finance_admin', 'sponsorships.manage'),
('finance_admin', 'payments.view'),
('finance_admin', 'payments.create'),
('finance_admin', 'payments.edit'),
('finance_admin', 'payments.refund'),
('finance_admin', 'payments.export'),
('finance_admin', 'payments.manage'),
('finance_admin', 'payments.view_reports'),
('finance_admin', 'audit.view'),
('finance_admin', 'audit.export'),

-- user_admin
('user_admin', 'users.view'),
('user_admin', 'users.create'),
('user_admin', 'users.edit'),
('user_admin', 'users.delete'),
('user_admin', 'users.suspend'),
('user_admin', 'users.assign'),
('user_admin', 'users.manage'),
('user_admin', 'students.view'),
('user_admin', 'students.create'),
('user_admin', 'students.edit'),
('user_admin', 'students.delete'),
('user_admin', 'students.manage'),
('user_admin', 'students.assign'),
('user_admin', 'students.view_progress'),
('user_admin', 'students.view_enrollments'),
('user_admin', 'students.view_certificates'),
('user_admin', 'instructors.view'),
('user_admin', 'instructors.create'),
('user_admin', 'instructors.edit'),
('user_admin', 'instructors.delete'),
('user_admin', 'instructors.assign'),
('user_admin', 'instructors.manage'),
('user_admin', 'organizations.view'),
('user_admin', 'enrollments.view'),
('user_admin', 'enrollments.create'),
('user_admin', 'enrollments.cancel'),
('user_admin', 'enrollments.manage'),
('user_admin', 'audit.view'),

-- compliance_admin
('compliance_admin', 'users.view'),
('compliance_admin', 'students.view'),
('compliance_admin', 'instructors.view'),
('compliance_admin', 'organizations.view'),
('compliance_admin', 'courses.view'),
('compliance_admin', 'modules.view'),
('compliance_admin', 'lessons.view'),
('compliance_admin', 'lesson_content.view'),
('compliance_admin', 'assignments.view'),
('compliance_admin', 'assessments.view'),
('compliance_admin', 'submissions.view'),
('compliance_admin', 'submissions.review'),
('compliance_admin', 'grades.view'),
('compliance_admin', 'enrollments.view'),
('compliance_admin', 'certificates.view'),
('compliance_admin', 'payments.view'),
('compliance_admin', 'audit.view'),
('compliance_admin', 'audit.export'),
('compliance_admin', 'audit.review'),

-- org_admin
('org_admin', 'users.view'),
('org_admin', 'users.create'),
('org_admin', 'users.edit'),
('org_admin', 'users.suspend'),
('org_admin', 'users.assign'),
('org_admin', 'students.view'),
('org_admin', 'students.create'),
('org_admin', 'students.edit'),
('org_admin', 'students.manage'),
('org_admin', 'students.assign'),
('org_admin', 'students.view_progress'),
('org_admin', 'students.view_enrollments'),
('org_admin', 'students.view_certificates'),
('org_admin', 'instructors.view'),
('org_admin', 'instructors.create'),
('org_admin', 'instructors.edit'),
('org_admin', 'instructors.manage'),
('org_admin', 'instructors.assign'),
('org_admin', 'instructors.view_performance'),
('org_admin', 'organizations.view'),
('org_admin', 'organizations.manage_members'),
('org_admin', 'organizations.view_reports'),
('org_admin', 'courses.view'),
('org_admin', 'courses.create'),
('org_admin', 'courses.edit'),
('org_admin', 'courses.delete'),
('org_admin', 'courses.publish'),
('org_admin', 'courses.unpublish'),
('org_admin', 'courses.archive'),
('org_admin', 'courses.assign'),
('org_admin', 'courses.manage'),
('org_admin', 'courses.view_students'),
('org_admin', 'courses.view_progress'),
('org_admin', 'courses.view_statistics'),
('org_admin', 'modules.view'),
('org_admin', 'modules.create'),
('org_admin', 'modules.edit'),
('org_admin', 'modules.delete'),
('org_admin', 'modules.reorder'),
('org_admin', 'modules.manage'),
('org_admin', 'lessons.view'),
('org_admin', 'lessons.create'),
('org_admin', 'lessons.edit'),
('org_admin', 'lessons.delete'),
('org_admin', 'lessons.reorder'),
('org_admin', 'lessons.publish'),
('org_admin', 'lessons.unpublish'),
('org_admin', 'lessons.manage'),
('org_admin', 'lesson_content.view'),
('org_admin', 'lesson_content.create'),
('org_admin', 'lesson_content.edit'),
('org_admin', 'lesson_content.delete'),
('org_admin', 'lesson_content.manage'),
('org_admin', 'assignments.view'),
('org_admin', 'assignments.create'),
('org_admin', 'assignments.edit'),
('org_admin', 'assignments.delete'),
('org_admin', 'assignments.publish'),
('org_admin', 'assignments.unpublish'),
('org_admin', 'assignments.manage'),
('org_admin', 'assessments.view'),
('org_admin', 'assessments.create'),
('org_admin', 'assessments.edit'),
('org_admin', 'assessments.delete'),
('org_admin', 'assessments.publish'),
('org_admin', 'assessments.unpublish'),
('org_admin', 'assessments.manage'),
('org_admin', 'submissions.view'),
('org_admin', 'submissions.review'),
('org_admin', 'submissions.return'),
('org_admin', 'submissions.manage'),
('org_admin', 'grades.view'),
('org_admin', 'grades.create'),
('org_admin', 'grades.edit'),
('org_admin', 'grades.grade'),
('org_admin', 'grades.override'),
('org_admin', 'grades.manage'),
('org_admin', 'enrollments.view'),
('org_admin', 'enrollments.create'),
('org_admin', 'enrollments.edit'),
('org_admin', 'enrollments.cancel'),
('org_admin', 'enrollments.complete'),
('org_admin', 'enrollments.allocate'),
('org_admin', 'enrollments.manage'),
('org_admin', 'learning.view'),
('org_admin', 'progress.view'),
('org_admin', 'progress.update'),
('org_admin', 'progress.complete'),
('org_admin', 'progress.override'),
('org_admin', 'progress.manage'),
('org_admin', 'certificates.view'),
('org_admin', 'certificates.award'),
('org_admin', 'certificates.revoke'),
('org_admin', 'certificates.reissue'),
('org_admin', 'certificates.override'),
('org_admin', 'certificates.manage'),
('org_admin', 'sponsorships.view'),
('org_admin', 'sponsorships.create'),
('org_admin', 'sponsorships.edit'),
('org_admin', 'sponsorships.allocate'),
('org_admin', 'sponsorships.withdraw'),
('org_admin', 'sponsorships.manage'),
('org_admin', 'payments.view'),
('org_admin', 'audit.view')
ON CONFLICT DO NOTHING;


-- 2A. Convert legacy administrator JSON permission keys to canonical keys
-- so existing administrator rows retain their effective capabilities.
UPDATE public.admin_permissions ap
SET permissions = COALESCE((
  SELECT jsonb_agg(DISTINCT to_jsonb(mapped))
  FROM jsonb_array_elements_text(ap.permissions) AS raw(value)
  CROSS JOIN LATERAL (
    SELECT unnest(
      CASE
        WHEN raw.value = 'manage_users' THEN ARRAY['users.view','users.create','users.edit','users.delete','users.suspend','users.manage','students.view','students.create','students.edit','students.delete','students.manage','instructors.view','instructors.create','instructors.edit','instructors.delete','instructors.manage']::text[]
        WHEN raw.value = 'manage_courses' THEN ARRAY['courses.view','courses.create','courses.edit','courses.delete','courses.publish','courses.unpublish','courses.archive','courses.assign','courses.manage','modules.view','modules.create','modules.edit','modules.delete','modules.reorder','modules.manage','lessons.view','lessons.create','lessons.edit','lessons.delete','lessons.reorder','lessons.publish','lessons.unpublish','lessons.manage','lesson_content.view','lesson_content.create','lesson_content.edit','lesson_content.delete','lesson_content.manage','assignments.view','assignments.create','assignments.edit','assignments.delete','assignments.publish','assignments.unpublish','assignments.manage','assessments.view','assessments.create','assessments.edit','assessments.delete','assessments.publish','assessments.unpublish','assessments.manage','submissions.view','submissions.review','submissions.return','submissions.manage','grades.view','grades.create','grades.edit','grades.grade','grades.override','grades.manage','enrollments.view','enrollments.create','enrollments.edit','enrollments.cancel','enrollments.complete','enrollments.allocate','enrollments.manage','certificates.view','certificates.award','certificates.revoke','certificates.reissue','certificates.override','certificates.manage']::text[]
        WHEN raw.value = 'manage_payments' THEN ARRAY['payments.view','payments.create','payments.edit','payments.refund','payments.export','payments.manage','payments.view_reports']::text[]
        WHEN raw.value = 'manage_settings' THEN ARRAY['settings.view','settings.edit','settings.manage']::text[]
        WHEN raw.value = 'view_audit_logs' THEN ARRAY['audit.view','audit.export','audit.review']::text[]
        WHEN raw.value = 'manage_admins' THEN ARRAY['admins.view','admins.create','admins.edit','admins.delete','admins.suspend','admins.manage']::text[]
        WHEN raw.value = 'manage_organizations' THEN ARRAY['organizations.view','organizations.create','organizations.edit','organizations.delete','organizations.manage','organizations.manage_members','organizations.manage_admins','organizations.view_reports']::text[]
        ELSE ARRAY[raw.value]::text[]
      END
    ) AS mapped
  ) expanded
), '[]'::jsonb)
WHERE jsonb_typeof(ap.permissions) = 'array'
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements_text(ap.permissions) raw
    WHERE raw.value IN ('manage_users','manage_courses','manage_payments','manage_settings','view_audit_logs','manage_admins','manage_organizations')
  );

-- 3. Only catalog-defined JSON permissions can grant a canonical capability.
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
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.admin_permissions ap
        ON ap.user_id = ur.user_id
      JOIN public.admin_tier_permissions atp
        ON atp.sub_role = ap.sub_role
       AND atp.permission_key = _permission
      JOIN public.admin_permission_catalog pc
        ON pc.permission_key = atp.permission_key
      WHERE ur.user_id = _user_id
        AND ur.role::text = 'admin'
    )
    OR
    EXISTS (
      SELECT 1
      FROM public.user_roles ur
      JOIN public.admin_permissions ap
        ON ap.user_id = ur.user_id
      JOIN public.admin_permission_catalog pc
        ON pc.permission_key = _permission
      WHERE ur.user_id = _user_id
        AND ur.role::text = 'admin'
        AND jsonb_typeof(ap.permissions) = 'array'
        AND ap.permissions ? _permission
    );
$$;

-- 3A. Lessons support downloadable author attachments alongside text/video.
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 4. Assignment authoring is a first-class academic resource.
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

GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Existing assignment lessons get an authoring record.
INSERT INTO public.assignments (lesson_id, title)
SELECT l.id, l.title
FROM public.lessons l
WHERE l.lesson_type = 'assignment'
  AND NOT EXISTS (
    SELECT 1 FROM public.assignments a WHERE a.lesson_id = l.id
  );

DROP POLICY IF EXISTS "assignments_canonical_read" ON public.assignments;
CREATE POLICY "assignments_canonical_read"
ON public.assignments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = assignments.lesson_id
      AND (
        c.status = 'published'
        OR c.instructor_id = auth.uid()
        OR (
          public.current_admin_has_permission('assignments.view')
          AND (
            c.organization_id IS NULL
            OR public.current_admin_has_organization_scope(c.organization_id)
          )
        )
        OR EXISTS (
          SELECT 1 FROM public.enrollments e
          WHERE e.course_id = c.id AND e.user_id = auth.uid()
        )
      )
  )
);

DROP POLICY IF EXISTS "assignments_canonical_write" ON public.assignments;
CREATE POLICY "assignments_canonical_write"
ON public.assignments FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = assignments.lesson_id
      AND (
        (c.instructor_id = auth.uid())
        OR (
          public.current_admin_has_permission('assignments.create')
          AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id))
        )
      )
  )
);

DROP POLICY IF EXISTS "assignments_canonical_update" ON public.assignments;
CREATE POLICY "assignments_canonical_update"
ON public.assignments FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = assignments.lesson_id
      AND (
        c.instructor_id = auth.uid()
        OR (
          public.current_admin_has_permission('assignments.update')
          AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id))
        )
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
        c.instructor_id = auth.uid()
        OR (
          public.current_admin_has_permission('assignments.update')
          AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id))
        )
      )
  )
);

DROP POLICY IF EXISTS "assignments_canonical_delete" ON public.assignments;
CREATE POLICY "assignments_canonical_delete"
ON public.assignments FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = assignments.lesson_id
      AND (
        c.instructor_id = auth.uid()
        OR (
          public.current_admin_has_permission('assignments.delete')
          AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id))
        )
      )
  )
);

DROP TRIGGER IF EXISTS assignments_updated ON public.assignments;
CREATE TRIGGER assignments_updated
BEFORE UPDATE ON public.assignments
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Submission access follows assignment/course scope and learner enrollment.
DROP POLICY IF EXISTS "assignment_submissions_task0_select" ON public.assignment_submissions;
DROP POLICY IF EXISTS "assignment_submissions_task0_insert" ON public.assignment_submissions;
DROP POLICY IF EXISTS "assignment_submissions_task0_update" ON public.assignment_submissions;

CREATE POLICY "assignment_submissions_canonical_select"
ON public.assignment_submissions FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = assignment_submissions.lesson_id
      AND (
        c.instructor_id = auth.uid()
        OR (
          public.current_admin_has_permission('assignments.view')
          AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id))
        )
        OR (
          public.current_admin_has_permission('assignments.grade')
          AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id))
        )
      )
  )
);

CREATE POLICY "assignment_submissions_canonical_insert"
ON public.assignment_submissions FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    JOIN public.enrollments e ON e.course_id = c.id AND e.user_id = auth.uid()
    WHERE l.id = assignment_submissions.lesson_id
  )
);

CREATE POLICY "assignment_submissions_canonical_update"
ON public.assignment_submissions FOR UPDATE TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = assignment_submissions.lesson_id
      AND (
        c.instructor_id = auth.uid()
        OR (
          public.current_admin_has_permission('assignments.grade')
          AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id))
        )
      )
  )
)
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = assignment_submissions.lesson_id
      AND (
        c.instructor_id = auth.uid()
        OR (
          public.current_admin_has_permission('assignments.grade')
          AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id))
        )
      )
  )
);

-- 5. Link submissions to their authored assignment record.
ALTER TABLE public.assignment_submissions
ADD COLUMN IF NOT EXISTS assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE;

UPDATE public.assignment_submissions s
SET assignment_id = a.id
FROM public.assignments a
WHERE a.lesson_id = s.lesson_id
  AND s.assignment_id IS NULL;

CREATE INDEX IF NOT EXISTS assignments_lesson_id_idx
ON public.assignments(lesson_id);

CREATE INDEX IF NOT EXISTS assignment_submissions_assignment_id_idx
ON public.assignment_submissions(assignment_id);

-- 6. Replace quiz RLS so admin academic permissions work while instructor
-- ownership and student participation remain relationship-driven.
DROP POLICY IF EXISTS "quizzes_read" ON public.quizzes;
DROP POLICY IF EXISTS "quizzes_write" ON public.quizzes;

CREATE POLICY "quizzes_canonical_read"
ON public.quizzes FOR SELECT TO authenticated
USING (
  public.current_admin_has_permission('assessments.view')
  OR public.owns_lesson(lesson_id)
  OR EXISTS (
    SELECT 1 FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    JOIN public.enrollments e ON e.course_id = c.id
    WHERE l.id = quizzes.lesson_id AND e.user_id = auth.uid()
  )
);

CREATE POLICY "quizzes_canonical_write"
ON public.quizzes FOR ALL TO authenticated
USING (
  public.owns_lesson(lesson_id)
  OR (
    public.current_admin_has_permission('assessments.update')
    AND EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.modules m ON m.id = l.module_id
      JOIN public.courses c ON c.id = m.course_id
      WHERE l.id = quizzes.lesson_id
        AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id))
    )
  )
)
WITH CHECK (
  public.owns_lesson(lesson_id)
  OR (
    public.current_admin_has_permission('assessments.create')
    AND EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.modules m ON m.id = l.module_id
      JOIN public.courses c ON c.id = m.course_id
      WHERE l.id = quizzes.lesson_id
        AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id))
    )
  )
);

-- Question/option authoring inherits the quiz relationship.
DROP POLICY IF EXISTS "questions_read" ON public.quiz_questions;
DROP POLICY IF EXISTS "questions_write" ON public.quiz_questions;
CREATE POLICY "questions_canonical_read"
ON public.quiz_questions FOR SELECT TO authenticated
USING (
  public.current_admin_has_permission('assessments.view')
  OR public.owns_quiz(quiz_id)
  OR EXISTS (
    SELECT 1
    FROM public.quizzes q
    JOIN public.lessons l ON l.id = q.lesson_id
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.enrollments e ON e.course_id = m.course_id
    WHERE q.id = quiz_questions.quiz_id AND e.user_id = auth.uid()
  )
);
CREATE POLICY "questions_canonical_write"
ON public.quiz_questions FOR ALL TO authenticated
USING (
  public.owns_quiz(quiz_id)
  OR public.current_admin_has_permission('assessments.update')
)
WITH CHECK (
  public.owns_quiz(quiz_id)
  OR public.current_admin_has_permission('assessments.create')
);

DROP POLICY IF EXISTS "options_read" ON public.quiz_options;
DROP POLICY IF EXISTS "options_write" ON public.quiz_options;
CREATE POLICY "options_canonical_read"
ON public.quiz_options FOR SELECT TO authenticated
USING (
  public.current_admin_has_permission('assessments.view')
  OR EXISTS (
    SELECT 1 FROM public.quiz_questions q WHERE q.id = quiz_options.question_id AND public.owns_quiz(q.quiz_id)
  )
  OR EXISTS (
    SELECT 1
    FROM public.quiz_questions qq
    JOIN public.quizzes q ON q.id = qq.quiz_id
    JOIN public.modules m ON m.id = (SELECT module_id FROM public.lessons WHERE id = q.lesson_id)
    JOIN public.enrollments e ON e.course_id = m.course_id
    WHERE qq.id = quiz_options.question_id AND e.user_id = auth.uid()
  )
);
CREATE POLICY "options_canonical_write"
ON public.quiz_options FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.quiz_questions q
    WHERE q.id = quiz_options.question_id AND public.owns_quiz(q.quiz_id)
  )
  OR public.current_admin_has_permission('assessments.update')
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.quiz_questions q
    WHERE q.id = quiz_options.question_id AND public.owns_quiz(q.quiz_id)
  )
  OR public.current_admin_has_permission('assessments.create')
);

-- Quiz attempts: students participate; instructors/admins can review/grade.
DROP POLICY IF EXISTS "attempts_read" ON public.quiz_attempts;
DROP POLICY IF EXISTS "attempts_insert_own" ON public.quiz_attempts;
CREATE POLICY "attempts_canonical_read"
ON public.quiz_attempts FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.current_admin_has_permission('assessments.grade')
  OR public.owns_quiz(quiz_id)
);
CREATE POLICY "attempts_canonical_insert"
ON public.quiz_attempts FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.quizzes q
    JOIN public.lessons l ON l.id = q.lesson_id
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    JOIN public.enrollments e ON e.course_id = c.id
    WHERE q.id = quiz_attempts.quiz_id
      AND e.user_id = auth.uid()
  )
);





-- Certificates: system completion may issue the earned credential; instructors
-- and administrators may award, while revoke/reissue remain administrative.
DROP POLICY IF EXISTS "certificates_task0_insert" ON public.certificates;
DROP POLICY IF EXISTS "certificates_task0_update" ON public.certificates;

CREATE POLICY "certificates_canonical_insert"
ON public.certificates FOR INSERT TO authenticated
WITH CHECK (
  (
    public.current_admin_has_permission('certificates.issue')
    AND (
      course_id IN (
        SELECT c.id FROM public.courses c
        WHERE c.organization_id IS NULL
           OR public.current_admin_has_organization_scope(c.organization_id)
      )
    )
  )
  OR EXISTS (
    SELECT 1
    FROM public.courses c
    WHERE c.id = certificates.course_id
      AND c.instructor_id = auth.uid()
  )
  OR (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.user_id = auth.uid()
        AND e.course_id = certificates.course_id
        AND e.status = 'completed'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.lessons l
      JOIN public.modules m ON m.id = l.module_id
      LEFT JOIN public.lesson_progress lp
        ON lp.lesson_id = l.id AND lp.user_id = auth.uid()
      WHERE m.course_id = certificates.course_id
        AND COALESCE(lp.status::text, 'not_started') <> 'completed'
    )
  )
);

CREATE POLICY "certificates_canonical_update"
ON public.certificates FOR UPDATE TO authenticated
USING (
  (
    public.current_admin_has_permission('certificates.revoke')
    OR public.current_admin_has_permission('certificates.reissue')
    OR public.current_admin_has_permission('certificates.override')
  )
  AND (
    course_id IN (
      SELECT c.id FROM public.courses c
      WHERE c.organization_id IS NULL
         OR public.current_admin_has_organization_scope(c.organization_id)
    )
  )
)
WITH CHECK (
  (
    public.current_admin_has_permission('certificates.revoke')
    OR public.current_admin_has_permission('certificates.reissue')
    OR public.current_admin_has_permission('certificates.override')
  )
  AND (
    course_id IN (
      SELECT c.id FROM public.courses c
      WHERE c.organization_id IS NULL
         OR public.current_admin_has_organization_scope(c.organization_id)
    )
  )
);

-- 7. Canonical enrollment/progress access. Admin tiers must not depend on the
-- legacy owns_course/is_admin shortcuts.
DROP POLICY IF EXISTS "enrollments_read" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_insert_own" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_update" ON public.enrollments;
DROP POLICY IF EXISTS "enrollments_delete_admin" ON public.enrollments;

CREATE POLICY "enrollments_canonical_read"
ON public.enrollments FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = enrollments.course_id
      AND c.instructor_id = auth.uid()
  )
  OR (
    public.current_admin_has_permission('enrollments.view')
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = enrollments.course_id
        AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id))
    )
  )
);

CREATE POLICY "enrollments_canonical_insert"
ON public.enrollments FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR (
    public.current_admin_has_permission('enrollments.create')
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = enrollments.course_id
        AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id))
    )
  )
);

CREATE POLICY "enrollments_canonical_update"
ON public.enrollments FOR UPDATE TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.courses c WHERE c.id = enrollments.course_id AND c.instructor_id = auth.uid()
  )
  OR (
    public.current_admin_has_permission('enrollments.edit')
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = enrollments.course_id
        AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id))
    )
  )
)
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.courses c WHERE c.id = enrollments.course_id AND c.instructor_id = auth.uid()
  )
  OR (
    public.current_admin_has_permission('enrollments.edit')
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = enrollments.course_id
        AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id))
    )
  )
);

CREATE POLICY "enrollments_canonical_delete"
ON public.enrollments FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses c WHERE c.id = enrollments.course_id AND c.instructor_id = auth.uid()
  )
  OR (
    public.current_admin_has_permission('enrollments.manage')
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = enrollments.course_id
        AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id))
    )
  )
);

DROP POLICY IF EXISTS "progress_read" ON public.lesson_progress;
DROP POLICY IF EXISTS "progress_write_own" ON public.lesson_progress;

CREATE POLICY "progress_canonical_read"
ON public.lesson_progress FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    JOIN public.courses c ON c.id = m.course_id
    WHERE l.id = lesson_progress.lesson_id
      AND c.instructor_id = auth.uid()
  )
  OR public.current_admin_has_permission('progress.view')
);

CREATE POLICY "progress_canonical_write"
ON public.lesson_progress FOR ALL TO authenticated
USING (
  user_id = auth.uid()
  OR (
    public.current_admin_has_permission('progress.manage')
    AND EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.modules m ON m.id = l.module_id
      JOIN public.courses c ON c.id = m.course_id
      WHERE l.id = lesson_progress.lesson_id
        AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id))
    )
  )
)
WITH CHECK (
  user_id = auth.uid()
  OR (
    public.current_admin_has_permission('progress.manage')
    AND EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.modules m ON m.id = l.module_id
      JOIN public.courses c ON c.id = m.course_id
      WHERE l.id = lesson_progress.lesson_id
        AND (c.organization_id IS NULL OR public.current_admin_has_organization_scope(c.organization_id))
    )
  )
);

-- 8. Canonical payment/audit/settings vocabulary remains enforced by their
-- existing Task 0 policies; no tables are rebuilt here.

-- 8. Sponsorships are represented by organization participants. Organization
-- and finance administrators may manage them according to their sponsorship
-- permission; organization scope still applies.
DROP POLICY IF EXISTS "organization_participants_manage" ON public.organization_participants;
CREATE POLICY "organization_participants_canonical_manage"
ON public.organization_participants FOR ALL TO authenticated
USING (
  (
    public.current_admin_has_permission('organizations.manage')
    OR public.current_admin_has_permission('sponsorships.manage')
    OR public.current_admin_has_permission('sponsorships.create')
  )
  AND public.current_admin_has_organization_scope(organization_id)
)
WITH CHECK (
  (
    public.current_admin_has_permission('organizations.manage')
    OR public.current_admin_has_permission('sponsorships.manage')
    OR public.current_admin_has_permission('sponsorships.create')
  )
  AND public.current_admin_has_organization_scope(organization_id)
);

-- 9. Course media storage follows the canonical authorization surface.
DROP POLICY IF EXISTS "Staff can upload course media" ON storage.objects;
DROP POLICY IF EXISTS "Staff can update course media" ON storage.objects;
DROP POLICY IF EXISTS "Staff can delete course media" ON storage.objects;

CREATE POLICY "Canonical staff can upload course media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'course-media'
  AND (
    public.is_instructor()
    OR public.current_admin_has_permission('courses.create')
    OR public.current_admin_has_permission('lesson_content.create')
  )
);

CREATE POLICY "Canonical staff can update course media"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'course-media'
  AND (
    public.is_instructor()
    OR public.current_admin_has_permission('courses.edit')
    OR public.current_admin_has_permission('lesson_content.edit')
  )
);

CREATE POLICY "Canonical staff can delete course media"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'course-media'
  AND (
    public.is_instructor()
    OR public.current_admin_has_permission('courses.edit')
    OR public.current_admin_has_permission('lesson_content.delete')
  )
);

-- 10. Helpful indexes.
CREATE INDEX IF NOT EXISTS admin_permission_catalog_resource_action_idx
ON public.admin_permission_catalog(resource, action);

