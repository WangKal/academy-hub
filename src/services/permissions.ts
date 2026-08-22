/**
 * ============================================================================
 * ACADEMY HUB AUTHORIZATION ENGINE
 * ============================================================================
 *
 * This is the SINGLE canonical frontend authorization policy.
 *
 * It determines what the UI should expose.
 *
 * It is NOT the ultimate security boundary.
 *
 * Current security boundary:
 *   Supabase RLS
 *
 * Future security boundary:
 *   Python backend authorization service
 *
 * The backend must independently reproduce these authorization decisions.
 * The browser must never be trusted to enforce security.
 *
 * Authorization model:
 *
 *   Identity
 *      ↓
 *   Role / Admin Tier
 *      ↓
 *   Permission
 *      ↓
 *   Organization Scope
 *      ↓
 *   Resource Relationship / Ownership
 *      ↓
 *   Action
 *      ↓
 *   ALLOW / DENY
 *
 * Admins:
 *   Permission + organization scope + resource relationship
 *
 * Instructors:
 *   Teaching relationship / ownership
 *
 * Students:
 *   Enrollment / participation relationship
 *
 * Auditors:
 *   Explicit audit/read/review/export surface
 * ============================================================================
 */

import type {
  AdminPermissionKey,
  AdminSubRole,
  AuthorizationContext,
  CurrentUser,
  Resource,
  Action,
  LegacyAdminPermissionKey,
  PermissionKey,
} from "@/types";

/* ============================================================================
 * PERMISSION CATALOG
 * ============================================================================
 *
 * This is the authoritative list of permissions that may exist.
 *
 * Do NOT generate permissions by combining every resource with every possible
 * action. Not every action makes sense for every resource.
 * ========================================================================== */

const definePermissions = <
  T extends Record<string, readonly string[]>
>(
  groups: T,
): T => groups;

export const PERMISSIONS = definePermissions({
  users: [
    "view",
    "create",
    "edit",
    "delete",
    "suspend",
    "assign",
    "manage",
  ],

  students: [
    "view",
    "create",
    "edit",
    "delete",
    "assign",
    "manage",
    "view_progress",
    "view_enrollments",
    "view_certificates",
  ],

  instructors: [
    "view",
    "create",
    "edit",
    "delete",
    "assign",
    "manage",
    "view_performance",
  ],

  organizations: [
    "view",
    "create",
    "edit",
    "delete",
    "manage",
    "manage_members",
    "manage_admins",
    "view_reports",
  ],

  courses: [
    "view",
    "create",
    "edit",
    "delete",
    "publish",
    "unpublish",
    "archive",
    "assign",
    "manage",
    "view_students",
    "view_progress",
    "view_statistics",
  ],

  modules: [
    "view",
    "create",
    "edit",
    "delete",
    "reorder",
    "manage",
  ],

  lessons: [
    "view",
    "create",
    "edit",
    "delete",
    "reorder",
    "publish",
    "unpublish",
    "manage",
  ],

  lesson_content: [
    "view",
    "create",
    "edit",
    "delete",
    "manage",
  ],

  assignments: [
    "view",
    "create",
    "edit",
    "delete",
    "publish",
    "unpublish",
    "manage",
  ],

  assessments: [
    "view",
    "create",
    "edit",
    "delete",
    "publish",
    "unpublish",
    "manage",
  ],

  submissions: [
    "view",
    "submit",
    "edit",
    "delete",
    "review",
    "return",
    "manage",
  ],

  grades: [
    "view",
    "create",
    "edit",
    "grade",
    "override",
    "manage",
  ],

  enrollments: [
    "view",
    "create",
    "edit",
    "cancel",
    "complete",
    "allocate",
    "manage",
  ],

  learning: [
    "view",
    "participate",
    "complete",
  ],

  progress: [
    "view",
    "update",
    "complete",
    "override",
    "manage",
  ],

  certificates: [
    "view",
    "award",
    "revoke",
    "reissue",
    "override",
    "manage",
  ],

  sponsorships: [
    "view",
    "create",
    "edit",
    "delete",
    "allocate",
    "withdraw",
    "view_students",
    "view_progress",
    "view_certificates",
    "view_reports",
    "manage",
  ],

  payments: [
    "view",
    "create",
    "edit",
    "refund",
    "export",
    "manage",
    "view_reports",
  ],

  audit: [
    "view",
    "export",
    "review",
  ],

  settings: [
    "view",
    "edit",
    "manage",
  ],

  admins: [
    "view",
    "create",
    "edit",
    "delete",
    "suspend",
    "manage",
  ],
} as const);

/* ============================================================================
 * HELPERS
 * ========================================================================== */

export function permission(
  resource: Resource,
  action: Action,
): PermissionKey {
  return `${resource}.${action}` as PermissionKey;
}

export function isAdmin(
  user: CurrentUser | null | undefined,
): boolean {
  return user?.role === "admin";
}

export function isInstructor(
  user: CurrentUser | null | undefined,
): boolean {
  return user?.role === "instructor";
}

export function isStudent(
  user: CurrentUser | null | undefined,
): boolean {
  return user?.role === "student";
}

export function isAuditor(
  user: CurrentUser | null | undefined,
): boolean {
  return user?.role === "auditor";
}

export function isSuperAdmin(
  user: CurrentUser | null | undefined,
): boolean {
  return (
    user?.role === "admin" &&
    (user.adminSubRoles?.includes("super_admin") ?? user.adminSubRole === "super_admin")
  );
}

export function tier(
  user: CurrentUser | null | undefined,
): AdminSubRole | undefined {
  // An administrator without a normalized tier is deliberately unprovisioned.
  // Never silently elevate an admin to super_admin.
  return isAdmin(user) ? user.adminSubRole : undefined;
}

/* ============================================================================
 * ORGANIZATION SCOPE
 * ========================================================================== */

export function isOrgScoped(
  user: CurrentUser | null | undefined,
): boolean {
  if (!isAdmin(user)) return false;

  /*
   * Explicit persisted scope takes precedence.
   */
  if (user.organizationScope) {
    return user.organizationScope === "selected";
  }

  /*
   * Backward compatibility for existing org_admin users.
   */
  return user.adminSubRole === "org_admin";
}

export function scopedOrganizationIds(
  user: CurrentUser | null | undefined,
): string[] {
  if (!isOrgScoped(user)) return [];

  return user.organizationIds ?? [];
}

export function canAccessOrganization(
  user: CurrentUser | null | undefined,
  organizationId: string,
): boolean {
  if (!isAdmin(user)) return false;

  /*
   * Super admin is globally scoped.
   */
  if (isSuperAdmin(user)) return true;

  /*
   * Platform-level admins are not restricted to a selected organization.
   */
  if (!isOrgScoped(user)) return true;

  return (user.organizationIds ?? []).includes(organizationId);
}

function organizationIsInScope(
  user: CurrentUser,
  organizationId?: string,
): boolean {
  if (!organizationId) return true;

  return canAccessOrganization(user, organizationId);
}

/* ============================================================================
 * LEGACY PERMISSION COMPATIBILITY
 * ============================================================================
 *
 * Existing Supabase rows may still contain broad permissions such as:
 *
 *   manage_users
 *   manage_courses
 *   manage_payments
 *
 * These remain understood during migration.
 *
 * They should eventually be removed after the database permission model has
 * been fully migrated to granular permission keys.
 * ========================================================================== */

const LEGACY_PERMISSION_EXPANSION: Record<
  LegacyAdminPermissionKey,
  PermissionKey[]
> = {
  manage_users: [
    "users.view",
    "users.create",
    "users.edit",
    "users.delete",
    "users.suspend",
    "users.manage",

    "students.view",
    "students.create",
    "students.edit",
    "students.delete",
    "students.manage",

    "instructors.view",
    "instructors.create",
    "instructors.edit",
    "instructors.delete",
    "instructors.manage",
  ],

  manage_courses: [
    "courses.view",
    "courses.create",
    "courses.edit",
    "courses.delete",
    "courses.publish",
    "courses.unpublish",
    "courses.archive",
    "courses.assign",
    "courses.manage",

    "modules.view",
    "modules.create",
    "modules.edit",
    "modules.delete",
    "modules.reorder",
    "modules.manage",

    "lessons.view",
    "lessons.create",
    "lessons.edit",
    "lessons.delete",
    "lessons.reorder",
    "lessons.publish",
    "lessons.unpublish",
    "lessons.manage",

    "lesson_content.view",
    "lesson_content.create",
    "lesson_content.edit",
    "lesson_content.delete",
    "lesson_content.manage",

    "assignments.view",
    "assignments.create",
    "assignments.edit",
    "assignments.delete",
    "assignments.publish",
    "assignments.unpublish",
    "assignments.manage",

    "assessments.view",
    "assessments.create",
    "assessments.edit",
    "assessments.delete",
    "assessments.publish",
    "assessments.unpublish",
    "assessments.manage",

    "submissions.view",
    "submissions.review",
    "submissions.return",
    "submissions.manage",

    "grades.view",
    "grades.create",
    "grades.edit",
    "grades.grade",
    "grades.override",
    "grades.manage",

    "enrollments.view",
    "enrollments.create",
    "enrollments.edit",
    "enrollments.cancel",
    "enrollments.complete",
    "enrollments.allocate",
    "enrollments.manage",

    "certificates.view",
    "certificates.award",
    "certificates.revoke",
    "certificates.reissue",
    "certificates.override",
    "certificates.manage",
  ],

  manage_payments: [
    "payments.view",
    "payments.create",
    "payments.edit",
    "payments.refund",
    "payments.export",
    "payments.manage",
    "payments.view_reports",
  ],

  manage_settings: [
    "settings.view",
    "settings.edit",
    "settings.manage",
  ],

  view_audit_logs: [
    "audit.view",
    "audit.export",
    "audit.review",
  ],

  manage_admins: [
    "admins.view",
    "admins.create",
    "admins.edit",
    "admins.delete",
    "admins.suspend",
    "admins.manage",
  ],

  manage_organizations: [
    "organizations.view",
    "organizations.create",
    "organizations.edit",
    "organizations.delete",
    "organizations.manage",
    "organizations.manage_members",
    "organizations.manage_admins",
    "organizations.view_reports",
  ],
};

function expandPermissions(
  permissions: AdminPermissionKey[] = [],
): Set<PermissionKey> {
  const result = new Set<PermissionKey>();

  for (const value of permissions) {
    const legacy =
      LEGACY_PERMISSION_EXPANSION[
        value as LegacyAdminPermissionKey
      ];

    if (legacy) {
      legacy.forEach((expanded) => result.add(expanded));
    } else {
      result.add(value as PermissionKey);
    }
  }

  return result;
}

/* ============================================================================
 * ADMIN TIER DEFAULTS
 * ============================================================================
 *
 * These are defaults only.
 *
 * Explicit database permissions are authoritative.
 *
 * The logic below intentionally describes the default capability of each
 * administrative tier.
 * ========================================================================== */

const ALL_PERMISSIONS: PermissionKey[] = Object.entries(
  PERMISSIONS,
).flatMap(([resource, actions]) =>
  actions.map(
    (action) =>
      `${resource}.${action}` as PermissionKey,
  ),
);

export const DEFAULT_TIER_PERMISSIONS: Record<
  AdminSubRole,
  PermissionKey[]
> = {
  /*
   * Super admin is unrestricted at the frontend policy level.
   */
  super_admin: ALL_PERMISSIONS,

  /*
   * Platform admin manages the platform broadly, except the most sensitive
   * platform configuration/admin controls.
   */
  platform_admin: ALL_PERMISSIONS.filter(
    (p) =>
      !p.startsWith("admins.") &&
      !p.startsWith("settings."),
  ),

  /*
   * Academic administration owns the academic lifecycle.
   */
  academic_admin: [
    "users.view",

    "students.view",
    "students.edit",
    "students.assign",
    "students.view_progress",
    "students.view_enrollments",
    "students.view_certificates",

    "instructors.view",
    "instructors.edit",
    "instructors.assign",
    "instructors.view_performance",

    "courses.view",
    "courses.create",
    "courses.edit",
    "courses.delete",
    "courses.publish",
    "courses.unpublish",
    "courses.archive",
    "courses.assign",
    "courses.manage",
    "courses.view_students",
    "courses.view_progress",
    "courses.view_statistics",

    "modules.view",
    "modules.create",
    "modules.edit",
    "modules.delete",
    "modules.reorder",
    "modules.manage",

    "lessons.view",
    "lessons.create",
    "lessons.edit",
    "lessons.delete",
    "lessons.reorder",
    "lessons.publish",
    "lessons.unpublish",
    "lessons.manage",

    "lesson_content.view",
    "lesson_content.create",
    "lesson_content.edit",
    "lesson_content.delete",
    "lesson_content.manage",

    "assignments.view",
    "assignments.create",
    "assignments.edit",
    "assignments.delete",
    "assignments.publish",
    "assignments.unpublish",
    "assignments.manage",

    "assessments.view",
    "assessments.create",
    "assessments.edit",
    "assessments.delete",
    "assessments.publish",
    "assessments.unpublish",
    "assessments.manage",

    "submissions.view",
    "submissions.review",
    "submissions.return",
    "submissions.manage",

    "grades.view",
    "grades.create",
    "grades.edit",
    "grades.grade",
    "grades.override",
    "grades.manage",

    "enrollments.view",
    "enrollments.create",
    "enrollments.edit",
    "enrollments.cancel",
    "enrollments.complete",
    "enrollments.allocate",
    "enrollments.manage",

    "learning.view",
    "learning.participate",
    "learning.complete",

    "progress.view",
    "progress.update",
    "progress.complete",
    "progress.override",
    "progress.manage",

    "certificates.view",
    "certificates.award",
    "certificates.revoke",
    "certificates.reissue",
    "certificates.override",
    "certificates.manage",

    "organizations.view",
    "sponsorships.view",

    "audit.view",
  ],

  /*
   * Finance owns financial activity and sponsorship allocation.
   */
  finance_admin: [
    "users.view",
    "students.view",
    "instructors.view",
    "organizations.view",

    "courses.view",

    "enrollments.view",
    "enrollments.allocate",

    "sponsorships.view",
    "sponsorships.create",
    "sponsorships.edit",
    "sponsorships.allocate",
    "sponsorships.withdraw",
    "sponsorships.manage",

    "payments.view",
    "payments.create",
    "payments.edit",
    "payments.refund",
    "payments.export",
    "payments.manage",
    "payments.view_reports",

    "audit.view",
    "audit.export",
  ],

  /*
   * User administration owns identity and user lifecycle.
   */
  user_admin: [
    "users.view",
    "users.create",
    "users.edit",
    "users.delete",
    "users.suspend",
    "users.assign",
    "users.manage",

    "students.view",
    "students.create",
    "students.edit",
    "students.delete",
    "students.manage",
    "students.assign",
    "students.view_progress",
    "students.view_enrollments",
    "students.view_certificates",

    "instructors.view",
    "instructors.create",
    "instructors.edit",
    "instructors.delete",
    "instructors.assign",
    "instructors.manage",

    "organizations.view",

    "enrollments.view",
    "enrollments.create",
    "enrollments.cancel",
    "enrollments.manage",

    "audit.view",
  ],

  /*
   * Compliance is predominantly observational.
   */
  compliance_admin: [
    "users.view",
    "students.view",
    "instructors.view",
    "organizations.view",

    "courses.view",
    "modules.view",
    "lessons.view",
    "lesson_content.view",

    "assignments.view",
    "assessments.view",
    "submissions.view",
    "submissions.review",

    "grades.view",
    "enrollments.view",

    "certificates.view",

    "payments.view",

    "audit.view",
    "audit.export",
    "audit.review",
  ],

  /*
   * Organization admin manages the academic/user surface belonging to their
   * organization.
   *
   * Organization scope is enforced separately.
   */
  org_admin: [
    "users.view",
    "users.create",
    "users.edit",
    "users.suspend",
    "users.assign",

    "students.view",
    "students.create",
    "students.edit",
    "students.manage",
    "students.assign",
    "students.view_progress",
    "students.view_enrollments",
    "students.view_certificates",

    "instructors.view",
    "instructors.create",
    "instructors.edit",
    "instructors.manage",
    "instructors.assign",
    "instructors.view_performance",

    "organizations.view",
    "organizations.manage_members",
    "organizations.view_reports",

    "courses.view",
    "courses.create",
    "courses.edit",
    "courses.delete",
    "courses.publish",
    "courses.unpublish",
    "courses.archive",
    "courses.assign",
    "courses.manage",
    "courses.view_students",
    "courses.view_progress",
    "courses.view_statistics",

    "modules.view",
    "modules.create",
    "modules.edit",
    "modules.delete",
    "modules.reorder",
    "modules.manage",

    "lessons.view",
    "lessons.create",
    "lessons.edit",
    "lessons.delete",
    "lessons.reorder",
    "lessons.publish",
    "lessons.unpublish",
    "lessons.manage",

    "lesson_content.view",
    "lesson_content.create",
    "lesson_content.edit",
    "lesson_content.delete",
    "lesson_content.manage",

    "assignments.view",
    "assignments.create",
    "assignments.edit",
    "assignments.delete",
    "assignments.publish",
    "assignments.unpublish",
    "assignments.manage",

    "assessments.view",
    "assessments.create",
    "assessments.edit",
    "assessments.delete",
    "assessments.publish",
    "assessments.unpublish",
    "assessments.manage",

    "submissions.view",
    "submissions.review",
    "submissions.return",
    "submissions.manage",

    "grades.view",
    "grades.create",
    "grades.edit",
    "grades.grade",
    "grades.override",
    "grades.manage",

    "enrollments.view",
    "enrollments.create",
    "enrollments.edit",
    "enrollments.cancel",
    "enrollments.complete",
    "enrollments.allocate",
    "enrollments.manage",

    "learning.view",
    

    "progress.view",
    "progress.update",
    "progress.complete",
    "progress.override",
    "progress.manage",

    "certificates.view",
    "certificates.award",
    "certificates.revoke",
    "certificates.reissue",
    "certificates.override",
    "certificates.manage",

    "sponsorships.view",
    "sponsorships.create",
    "sponsorships.edit",
    "sponsorships.allocate",
    "sponsorships.withdraw",
    "sponsorships.manage",

    "payments.view",

    "audit.view",
  ],
};

/* ============================================================================
 * AUDITOR DEFAULTS
 * ========================================================================== */

const AUDITOR_DEFAULT_PERMISSIONS: PermissionKey[] = [
  "audit.view",
  "audit.export",
  "audit.review",
];

/* ============================================================================
 * RELATIONSHIP / OWNERSHIP
 * ========================================================================== */

function instructorOwnsResource(
  user: CurrentUser,
  context?: AuthorizationContext,
): boolean {
  if (!isInstructor(user)) return false;
  if (!context) return false;

  if (context.instructorId) {
    return context.instructorId === user.id;
  }

  if (context.ownerId) {
    return context.ownerId === user.id;
  }

  /*
   * Backend/service layer may resolve a relationship and pass it explicitly.
   */
  if (context.relationship === "instructor") {
    return true;
  }

  return false;
}

function studentOwnsResource(
  user: CurrentUser,
  context?: AuthorizationContext,
): boolean {
  if (!isStudent(user)) return false;
  if (!context) return false;

  const studentId =
    context.studentId ??
    context.enrolledStudentId;

  if (studentId) {
    return studentId === user.id;
  }

  if (context.relationship === "student") {
    return true;
  }

  return false;
}

function studentCanAccessLearningResource(
  user: CurrentUser,
  context?: AuthorizationContext,
): boolean {
  return studentOwnsResource(user, context);
}

/* ============================================================================
 * ADMIN AUTHORIZATION
 * ========================================================================== */

function adminCan(
  user: CurrentUser,
  resource: Resource,
  action: Action,
  context?: AuthorizationContext,
): boolean {
  /*
   * Super admin is unrestricted.
   */
  if (isSuperAdmin(user)) {
    return true;
  }

  /*
   * Organization scope is evaluated before permission.
   */
  if (
    !organizationIsInScope(
      user,
      context?.organizationId,
    )
  ) {
    return false;
  }

  /*
   * Explicit database permissions take precedence.
   *
   * If there are no database permissions yet, use tier defaults.
   */
  if (!user.adminSubRoles?.length && !user.adminSubRole) {
    return false;
  }

  const rawPermissions =
    user.permissions && user.permissions.length
      ? user.permissions
      : DEFAULT_TIER_PERMISSIONS[user.adminSubRole!];

  const permissions = expandPermissions(
    rawPermissions,
  );

  const requested = permission(resource, action);

  /*
   * Exact permission.
   */
  if (permissions.has(requested)) {
    return true;
  }

  /*
   * Resource-level manage grants all actions represented by the catalog.
   */
  if (
    action !== "manage" &&
    permissions.has(
      permission(resource, "manage"),
    )
  ) {
    return true;
  }

  return false;
}

/* ============================================================================
 * INSTRUCTOR AUTHORIZATION
 * ============================================================================
 *
 * Instructor access is relationship-driven.
 *
 * The instructor must be connected to the course/resource they are operating
 * on. The backend must ultimately resolve and enforce this relationship.
 *
 * Academic workflow:
 *
 *   Course
 *      ↓
 *   Module
 *      ↓
 *   Lesson
 *      ↓
 *   Lesson Content
 *      ↓
 *   Assignment / Assessment
 *      ↓
 *   Submission
 *      ↓
 *   Grade
 *      ↓
 *   Certificate
 * ========================================================================== */

function instructorCan(
  user: CurrentUser,
  resource: Resource,
  action: Action,
  context?: AuthorizationContext,
): boolean {
  /*
   * Course itself.
   */
  if (resource === "courses") {
    return (
      [
        "view",
        "create",
        "edit",
        "delete",
        "publish",
        "unpublish",
        "archive",
        "assign",
        "manage",
        "view_students",
        "view_progress",
        "view_statistics",
      ] as Action[]
    ).includes(action) &&
      instructorOwnsResource(user, context);
  }

  /*
   * Course construction.
   */
  if (
    [
      "modules",
      "lessons",
      "lesson_content",
    ].includes(resource)
  ) {
    return (
      [
        "view",
        "create",
        "edit",
        "delete",
        "publish",
        "unpublish",
        "reorder",
        "manage",
      ] as Action[]
    ).includes(action) &&
      instructorOwnsResource(user, context);
  }

  /*
   * Assignment and assessment authoring.
   */
  if (
    resource === "assignments" ||
    resource === "assessments"
  ) {
    return (
      [
        "view",
        "create",
        "edit",
        "delete",
        "publish",
        "unpublish",
        "manage",
      ] as Action[]
    ).includes(action) &&
      instructorOwnsResource(user, context);
  }

  /*
   * Instructor can see students participating in courses they teach.
   */
  if (resource === "students") {
    return (
      [
        "view",
        "view_progress",
        "view_enrollments",
        "view_certificates",
      ] as Action[]
    ).includes(action) &&
      instructorOwnsResource(user, context);
  }

  /*
   * Instructor can inspect/manage enrollment within their teaching surface.
   */
  if (resource === "enrollments") {
    return (
      [
        "view",
        "create",
        "edit",
        "cancel",
      ] as Action[]
    ).includes(action) &&
      instructorOwnsResource(user, context);
  }

  /*
   * Student submissions.
   *
   * Review and return are instructor operations.
   */
  if (resource === "submissions") {
    return (
      [
        "view",
        "review",
        "return",
      ] as Action[]
    ).includes(action) &&
      instructorOwnsResource(user, context);
  }

  /*
   * Grades / marking.
   */
  if (resource === "grades") {
    return (
      [
        "view",
        "create",
        "edit",
        "grade",
      ] as Action[]
    ).includes(action) &&
      instructorOwnsResource(user, context);
  }

  /*
   * Certificate operations available to the teaching instructor.
   *
   * Override/revoke/reissue remain administrative capabilities.
   */
  if (resource === "certificates") {
    return (
      [
        "view",
        "award",
      ] as Action[]
    ).includes(action) &&
      instructorOwnsResource(user, context);
  }

  /*
   * Learning/progress are observational for instructors.
   */
  if (resource === "learning") {
    return (
      action === "view" &&
      instructorOwnsResource(user, context)
    );
  }

  if (resource === "progress") {
    return (
      [
        "view",
        "update",
      ] as Action[]
    ).includes(action) &&
      instructorOwnsResource(user, context);
  }

  return false;
}

/* ============================================================================
 * STUDENT AUTHORIZATION
 * ============================================================================
 *
 * Students have participation access, not management access.
 * ========================================================================== */

function studentCan(
  user: CurrentUser,
  resource: Resource,
  action: Action,
  context?: AuthorizationContext,
): boolean {
  /*
   * Public course discovery.
   *
   * Actual published-course visibility remains a data/RLS concern.
   */
  if (
    resource === "courses" &&
    action === "view"
  ) {
    return true;
  }

  /*
   * Course hierarchy.
   *
   * Once the student is accessing the actual learning surface, the backend
   * relationship/enrollment should be represented by context.
   */
  if (
    [
      "modules",
      "lessons",
      "lesson_content",
    ].includes(resource)
  ) {
    return (
      action === "view" &&
      studentCanAccessLearningResource(
        user,
        context,
      )
    );
  }

  /*
   * Assignments and assessments.
   */
  if (
    resource === "assignments" ||
    resource === "assessments"
  ) {
    return (
      action === "view" &&
      studentCanAccessLearningResource(
        user,
        context,
      )
    );
  }

  /*
   * Learning participation.
   */
  if (resource === "learning") {
    return (
      [
        "view",
        "participate",
        "complete",
      ] as Action[]
    ).includes(action) &&
      studentCanAccessLearningResource(
        user,
        context,
      );
  }

  /*
   * Progress.
   */
  if (resource === "progress") {
    return (
      [
        "view",
        "update",
        "complete",
      ] as Action[]
    ).includes(action) &&
      studentOwnsResource(user, context);
  }

  /*
   * Enrollment.
   */
  if (resource === "enrollments") {
    return (
      [
        "view",
        "create",
        "cancel",
      ] as Action[]
    ).includes(action) &&
      studentOwnsResource(user, context);
  }

  /*
   * Submissions.
   */
  if (resource === "submissions") {
    return (
      [
        "view",
        "submit",
        "edit",
      ] as Action[]
    ).includes(action) &&
      studentOwnsResource(user, context);
  }

  /*
   * Grades are view-only to the student.
   */
  if (resource === "grades") {
    return (
      action === "view" &&
      studentOwnsResource(user, context)
    );
  }

  /*
   * Certificates are view-only to the student.
   */
  if (resource === "certificates") {
    return (
      action === "view" &&
      studentOwnsResource(user, context)
    );
  }

  /*
   * Student payment surface.
   */
  if (resource === "payments") {
    return (
      [
        "view",
        "create",
      ] as Action[]
    ).includes(action) &&
      studentOwnsResource(user, context);
  }

  return false;
}

/* ============================================================================
 * AUDITOR AUTHORIZATION
 * ========================================================================== */

function auditorCan(
  user: CurrentUser,
  resource: Resource,
  action: Action,
): boolean {
  const permissions = expandPermissions([
    ...(user.permissions ?? []),
    ...AUDITOR_DEFAULT_PERMISSIONS,
  ]);

  const requested = permission(resource, action);

  if (!permissions.has(requested)) {
    return false;
  }

  /*
   * Auditors never inherit CRUD merely because they can see a resource.
   */
  return (
    resource === "audit" ||
    action === "view" ||
    action === "review" ||
    action === "export"
  );
}

/* ============================================================================
 * MAIN AUTHORIZATION FUNCTION
 * ========================================================================== */

export function can(
  user: CurrentUser | null | undefined,
  resource: Resource,
  action: Action = "view",
  context?: AuthorizationContext,
): boolean {
  /*
   * No identity.
   */
  if (!user) return false;

  /*
   * Inactive identities cannot operate.
   */
  if (user.status !== "active") return false;

  /*
   * Administrative surface.
   */
  if (isAdmin(user)) {
    return adminCan(
      user,
      resource,
      action,
      context,
    );
  }

  /*
   * Auditor surface.
   */
  if (isAuditor(user)) {
    return auditorCan(
      user,
      resource,
      action,
    );
  }

  /*
   * Instructor teaching surface.
   */
  if (isInstructor(user)) {
    return instructorCan(
      user,
      resource,
      action,
      context,
    );
  }

  /*
   * Student learning surface.
   */
  if (isStudent(user)) {
    return studentCan(
      user,
      resource,
      action,
      context,
    );
  }

  return false;
}

/* ============================================================================
 * ASSERTION HELPER
 * ========================================================================== */

export function assertCan(
  user: CurrentUser | null | undefined,
  resource: Resource,
  action: Action = "view",
  context?: AuthorizationContext,
): void {
  if (
    !can(
      user,
      resource,
      action,
      context,
    )
  ) {
    throw new Error(
      `Permission denied: ${resource}.${action}`,
    );
  }
}

/* ============================================================================
 * CONVENIENCE HELPERS
 * ========================================================================== */

export function canAny(
  user: CurrentUser | null | undefined,
  checks: Array<{
    resource: Resource;
    action?: Action;
    context?: AuthorizationContext;
  }>,
): boolean {
  return checks.some((check) =>
    can(
      user,
      check.resource,
      check.action ?? "view",
      check.context,
    ),
  );
}

export function canAll(
  user: CurrentUser | null | undefined,
  checks: Array<{
    resource: Resource;
    action?: Action;
    context?: AuthorizationContext;
  }>,
): boolean {
  return checks.every((check) =>
    can(
      user,
      check.resource,
      check.action ?? "view",
      check.context,
    ),
  );
}

export function canPermission(
  user: CurrentUser | null | undefined,
  permissionKey: AdminPermissionKey,
  context?: AuthorizationContext,
): boolean {
  const [resource, action] =
    permissionKey.split(".") as [
      Resource,
      Action,
    ];

  return can(
    user,
    resource,
    action,
    context,
  );
}

/* ============================================================================
 * ADMIN ROUTE PERMISSIONS
 * ============================================================================
 *
 * Navigation visibility only.
 *
 * This does NOT replace page/component authorization.
 * ========================================================================== */

export function adminRoutePermission(
  pathname: string,
): {
  resource: Resource;
  action: Action;
} | null {
  const rules: Array<
    [string, Resource, Action]
  > = [
    ["/admin/users", "users", "view"],
    ["/admin/team", "admins", "view"],
    ["/admin/organizations", "organizations", "view"],
    ["/admin/courses", "courses", "view"],
    ["/admin/enrollments", "enrollments", "view"],
    ["/admin/payments", "payments", "view"],
    ["/admin/certificates", "certificates", "view"],
    ["/admin/audit-logs", "audit", "view"],
    ["/admin/audit", "audit", "view"],
    ["/admin/settings", "settings", "view"],
    ["/admin", "users", "view"],
  ];

  const match = rules.find(
    ([prefix]) =>
      pathname === prefix ||
      pathname.startsWith(`${prefix}/`),
  );

  return match
    ? {
        resource: match[1],
        action: match[2],
      }
    : null;
}

/* ============================================================================
 * LANDING ROUTES
 * ========================================================================== */

export function landingPath(
  user: CurrentUser | null | undefined,
): string {
  if (!user) return "/auth";

  switch (user.role) {
    case "admin":
      return "/admin";

    case "instructor":
      return "/instructor";

    case "auditor":
      return "/dashboard";

    case "student":
    default:
      return "/dashboard";
  }
}