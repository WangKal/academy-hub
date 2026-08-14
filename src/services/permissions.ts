/**
 * ============================================================================
 * ACADEMY HUB AUTHORIZATION ENGINE
 * ============================================================================
 *
 * This module is frontend authorization only.
 *
 * It determines what the UI should expose.
 *
 * It is NOT the security boundary.
 *
 * Current security boundary:
 *   Supabase RLS
 *
 * Future security boundary:
 *   Python backend authorization service
 *
 * The Python backend must reproduce these decisions independently and must
 * never trust a permission supplied by the browser.
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

/* -------------------------------------------------------------------------- */
/* Permission catalog                                                         */
/* -------------------------------------------------------------------------- */

const definePermissions = <
  T extends Record<string, readonly string[]>,
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
    "manage",
  ],

  students: [
    "view",
    "create",
    "edit",
    "delete",
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
    "manage",
    "assign",
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
    "manage",
    "assign",
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
    "manage",
  ],

  grades: [
    "view",
    "create",
    "edit",
    "override",
    "manage",
  ],

  enrollments: [
    "view",
    "create",
    "edit",
    "cancel",
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
    "manage",
  ],
} as const);

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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
  return user?.role === "admin" &&
    user.adminSubRole === "super_admin";
}

export function tier(
  user: CurrentUser | null | undefined,
): AdminSubRole | undefined {
  return isAdmin(user)
    ? (user.adminSubRole ?? "super_admin")
    : undefined;
}

export function isOrgScoped(
  user: CurrentUser | null | undefined,
): boolean {
  if (!isAdmin(user)) return false;

  if (user.organizationScope) {
    return user.organizationScope === "selected";
  }

  // Backward-compatible behavior until the explicit scope is persisted.
  return user.adminSubRole === "org_admin";
}

export function scopedOrganizationIds(
  user: CurrentUser | null | undefined,
): string[] {
  if (!isOrgScoped(user)) return [];
  return user?.organizationIds ?? [];
}

export function canAccessOrganization(
  user: CurrentUser | null | undefined,
  organizationId: string,
): boolean {
  if (!isAdmin(user)) return false;

  if (isSuperAdmin(user)) return true;

  if (!isOrgScoped(user)) return true;

  return (user.organizationIds ?? []).includes(organizationId);
}

/* -------------------------------------------------------------------------- */
/* Legacy permission compatibility                                            */
/* -------------------------------------------------------------------------- */

/**
 * Existing Supabase rows currently contain broad permission names such as
 * manage_courses.
 *
 * We continue understanding them while the database is migrated.
 *
 * These aliases should eventually be removed after the new permission schema
 * is live.
 */
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
    "courses.manage",
    "courses.assign",

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

    "assessments.view",
    "assessments.create",
    "assessments.edit",
    "assessments.delete",
    "assessments.publish",
    "assessments.unpublish",
    "assessments.manage",

    "submissions.view",
    "submissions.review",
    "submissions.manage",

    "grades.view",
    "grades.create",
    "grades.edit",
    "grades.override",
    "grades.manage",

    "enrollments.view",
    "enrollments.create",
    "enrollments.edit",
    "enrollments.cancel",
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
    if (value in LEGACY_PERMISSION_EXPANSION) {
      for (const expanded of LEGACY_PERMISSION_EXPANSION[
        value as LegacyAdminPermissionKey
      ]) {
        result.add(expanded);
      }
    } else {
      result.add(value as PermissionKey);
    }
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Admin tier defaults                                                         */
/* -------------------------------------------------------------------------- */

const ALL_PERMISSIONS: PermissionKey[] = Object.entries(PERMISSIONS)
  .flatMap(([resource, actions]) =>
    actions.map(
      (action) =>
        `${resource}.${action}` as PermissionKey,
    ),
  );

export const DEFAULT_TIER_PERMISSIONS: Record<
  AdminSubRole,
  PermissionKey[]
> = {
  super_admin: ALL_PERMISSIONS,

  platform_admin: [
    ...ALL_PERMISSIONS.filter(
      (p) =>
        !p.startsWith("admins.") &&
        !p.startsWith("settings."),
    ),
  ],

  academic_admin: [
    "users.view",
    "students.view",
    "students.create",
    "students.edit",
    "students.view_progress",
    "students.view_enrollments",
    "students.view_certificates",

    "instructors.view",
    "instructors.create",
    "instructors.edit",
    "instructors.delete",
    "instructors.manage",
    "instructors.assign",

    "courses.view",
    "courses.create",
    "courses.edit",
    "courses.delete",
    "courses.publish",
    "courses.unpublish",
    "courses.archive",
    "courses.manage",
    "courses.assign",
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

    "assessments.view",
    "assessments.create",
    "assessments.edit",
    "assessments.delete",
    "assessments.publish",
    "assessments.unpublish",
    "assessments.manage",

    "submissions.view",
    "submissions.review",
    "submissions.manage",

    "grades.view",
    "grades.create",
    "grades.edit",
    "grades.override",
    "grades.manage",

    "enrollments.view",
    "enrollments.create",
    "enrollments.edit",
    "enrollments.cancel",
    "enrollments.manage",

    "certificates.view",
    "certificates.award",
    "certificates.revoke",
    "certificates.reissue",
    "certificates.override",
    "certificates.manage",

    "audit.view",
  ],

  finance_admin: [
    "payments.view",
    "payments.create",
    "payments.edit",
    "payments.refund",
    "payments.manage",
    "payments.view_reports",

    "enrollments.view",

    "audit.view",
  ],

  user_admin: [
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
    "students.view_progress",
    "students.view_enrollments",
    "students.view_certificates",

    "instructors.view",
    "instructors.create",
    "instructors.edit",
    "instructors.delete",
    "instructors.manage",

    "organizations.view",
    "organizations.manage_members",

    "audit.view",
  ],

  compliance_admin: [
    "users.view",
    "students.view",
    "instructors.view",
    "organizations.view",
    "courses.view",
    "modules.view",
    "lessons.view",
    "assessments.view",
    "submissions.view",
    "grades.view",
    "enrollments.view",
    "certificates.view",
    "payments.view",

    "audit.view",
    "audit.export",
    "audit.review",
  ],

  org_admin: [
    "users.view",
    "users.create",
    "users.edit",
    "users.suspend",

    "students.view",
    "students.create",
    "students.edit",
    "students.manage",
    "students.view_progress",
    "students.view_enrollments",
    "students.view_certificates",

    "instructors.view",
    "instructors.create",
    "instructors.edit",
    "instructors.manage",
    "instructors.assign",

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
    "courses.manage",
    "courses.assign",
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

    "assessments.view",
    "assessments.create",
    "assessments.edit",
    "assessments.delete",
    "assessments.publish",
    "assessments.unpublish",
    "assessments.manage",

    "submissions.view",
    "submissions.review",
    "submissions.manage",

    "grades.view",
    "grades.create",
    "grades.edit",
    "grades.override",
    "grades.manage",

    "enrollments.view",
    "enrollments.create",
    "enrollments.edit",
    "enrollments.cancel",
    "enrollments.manage",

    "certificates.view",
    "certificates.award",
    "certificates.revoke",
    "certificates.reissue",
    "certificates.override",
    "certificates.manage",

    "audit.view",
  ],
};

const AUDITOR_DEFAULT_PERMISSIONS: PermissionKey[] = [
  "audit.view",
  "audit.export",
  "audit.review",
];

/* -------------------------------------------------------------------------- */
/* Relationship / resource scope                                             */
/* -------------------------------------------------------------------------- */

function organizationIsInScope(
  user: CurrentUser,
  organizationId?: string,
): boolean {
  if (!organizationId) return true;

  if (!isAdmin(user)) return false;

  return canAccessOrganization(user, organizationId);
}

function instructorOwnsResource(
  user: CurrentUser,
  context?: AuthorizationContext,
): boolean {
  if (!isInstructor(user)) return false;

  if (!context) return true;

  if (context.instructorId) {
    return context.instructorId === user.id;
  }

  if (context.ownerId) {
    return context.ownerId === user.id;
  }

  return true;
}

function studentOwnsResource(
  user: CurrentUser,
  context?: AuthorizationContext,
): boolean {
  if (!isStudent(user)) return false;

  if (!context) return true;

  const studentId =
    context.studentId ??
    context.enrolledStudentId;

  if (!studentId) return true;

  return studentId === user.id;
}

function studentCanAccessLearningResource(
  user: CurrentUser,
  context?: AuthorizationContext,
): boolean {
  if (!studentOwnsResource(user, context)) return false;

  /**
   * The enrollment relationship will eventually be resolved by the backend.
   * The context can explicitly tell the frontend that this resource belongs
   * to the student's enrollment.
   */
  return true;
}

/* -------------------------------------------------------------------------- */
/* Main authorization function                                                */
/* -------------------------------------------------------------------------- */

export function can(
  user: CurrentUser | null | undefined,
  resource: Resource,
  action: Action = "view",
  context?: AuthorizationContext,
): boolean {
  if (!user) return false;

  if (user.status !== "active") return false;

  const requested = permission(resource, action);

  /* ------------------------------ SUPER ADMIN ---------------------------- */

  if (isSuperAdmin(user)) {
    return true;
  }

  /* -------------------------------- ADMIN -------------------------------- */

  if (isAdmin(user)) {
    const permissions = expandPermissions(
      user.permissions ??
        DEFAULT_TIER_PERMISSIONS[user.adminSubRole ?? "super_admin"],
    );

    if (!permissions.has(requested)) {
      return false;
    }

    return organizationIsInScope(user, context?.organizationId);
  }

  /* ------------------------------ AUDITOR -------------------------------- */

  if (isAuditor(user)) {
    const permissions = expandPermissions([
      ...(user.permissions ?? []),
      ...AUDITOR_DEFAULT_PERMISSIONS,
    ]);

    if (!permissions.has(requested)) {
      return false;
    }

    /*
     * Auditors are read/review actors.
     *
     * They never inherit administrative CRUD simply from being auditors.
     */
    return (
      resource === "audit" ||
      action === "view" ||
      action === "review" ||
      action === "export"
    );
  }

  /* ----------------------------- INSTRUCTOR ------------------------------ */

  if (isInstructor(user)) {
    /*
     * Instructor permissions are relationship-driven.
     *
     * An instructor can create their own course.
     */
    if (
      resource === "courses" &&
      (action === "view" ||
        action === "create" ||
        action === "edit" ||
        action === "delete" ||
        action === "publish" ||
        action === "unpublish" ||
        action === "archive" ||
        action === "manage" ||
        action === "assign" ||
        action === "view_students" ||
        action === "view_progress" ||
        action === "view_statistics")
    ) {
      return instructorOwnsResource(user, context);
    }

    /*
     * All course-building children are accessible only through the
     * instructor's course relationship.
     */
    if (
      [
        "modules",
        "lessons",
        "lesson_content",
        "assessments",
        "submissions",
        "grades",
        "certificates",
      ].includes(resource)
    ) {
      return instructorOwnsResource(user, context);
    }

    /*
     * Instructor can inspect enrolled students and their learning results
     * for courses they teach, but cannot manipulate unrelated users.
     */
    if (resource === "students") {
      return (
        action === "view" ||
        action === "view_progress" ||
        action === "view_enrollments" ||
        action === "view_certificates"
      ) && instructorOwnsResource(user, context);
    }

    if (resource === "enrollments") {
      return (
        action === "view" ||
        action === "create" ||
        action === "edit" ||
        action === "cancel"
      ) && instructorOwnsResource(user, context);
    }

    return false;
  }

  /* ------------------------------- STUDENT ------------------------------- */

  if (isStudent(user)) {
    if (resource === "courses" && action === "view") {
      return true;
    }

    if (resource === "learning") {
      return (
        action === "view" ||
        action === "participate" ||
        action === "complete"
      ) && studentCanAccessLearningResource(user, context);
    }

    if (resource === "progress") {
      return (
        action === "view" ||
        action === "update"
      ) && studentOwnsResource(user, context);
    }

    if (resource === "enrollments") {
      return (
        action === "view" ||
        action === "create" ||
        action === "cancel"
      ) && studentOwnsResource(user, context);
    }

    if (resource === "assessments" && action === "view") {
      return studentCanAccessLearningResource(user, context);
    }

    if (resource === "submissions") {
      return (
        action === "view" ||
        action === "submit" ||
        action === "edit"
      ) && studentOwnsResource(user, context);
    }

    if (resource === "grades" && action === "view") {
      return studentOwnsResource(user, context);
    }

    if (resource === "certificates" && action === "view") {
      return studentOwnsResource(user, context);
    }

    if (resource === "payments") {
      return (
        action === "view" ||
        action === "create"
      ) && studentOwnsResource(user, context);
    }

    return false;
  }

  return false;
}

/* -------------------------------------------------------------------------- */
/* Convenience helpers                                                        */
/* -------------------------------------------------------------------------- */

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
  const [resource, action] = permissionKey.split(".") as [
    Resource,
    Action,
  ];

  return can(user, resource, action, context);
}

/* -------------------------------------------------------------------------- */
/* Navigation                                                                  */
/* -------------------------------------------------------------------------- */

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
      /*
       * Until a dedicated auditor route exists, keep the existing generic
       * authenticated landing surface.
       */
      return "/dashboard";

    case "student":
    default:
      return "/dashboard";
  }
}