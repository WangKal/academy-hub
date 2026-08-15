/**
 * Academy Hub authorization policy.
 *
 * Identity â†’ role/tier â†’ permission â†’ scope â†’ resource â†’ action.
 *
 * This module controls what the UI offers. The backend/database remains the
 * authoritative security boundary and must enforce the same permission keys.
 */

import type {
  Action,
  AdminPermissionKey,
  AdminSubRole,
  AuthorizationContext,
  CurrentUser,
  Resource,
} from "@/types";

export const TIER_LABEL: Record<AdminSubRole, string> = {
  super_admin: "Super admin",
  platform_admin: "Platform admin",
  academic_admin: "Academic admin",
  finance_admin: "Finance admin",
  user_admin: "User admin",
  compliance_admin: "Compliance admin",
  org_admin: "Organization admin",
};

const ALL_RESOURCES: Resource[] = [
  "users",
  "students",
  "instructors",
  "organizations",
  "courses",
  "modules",
  "lessons",
  "lesson_content",
  "assignments",
  "assessments",
  "submissions",
  "grades",
  "enrollments",
  "learning",
  "progress",
  "certificates",
  "sponsorships",
  "payments",
  "audit",
  "settings",
  "admins",
];

const ALL_ACTIONS: Action[] = [
  "view",
  "create",
  "edit",
  "delete",
  "publish",
  "unpublish",
  "archive",
  "reorder",
  "submit",
  "review",
  "approve",
  "grade",
  "return",
  "award",
  "revoke",
  "reissue",
  "override",
  "suspend",
  "assign",
  "participate",
  "complete",
  "update",
  "cancel",
  "allocate",
  "withdraw",
  "export",
  "refund",
  "manage"
];

const keys = (resource: Resource, actions: readonly Action[]): AdminPermissionKey[] =>
  actions.map((action) => `${resource}.${action}` as AdminPermissionKey);

const MANAGEMENT: readonly Action[] = [
  "view",
  "create",
  "edit",
  "delete",
  "publish",
  "unpublish",
  "archive",
  "reorder",
  "manage",
];

const ACADEMIC_MANAGEMENT: readonly Action[] = [
  ...MANAGEMENT,
  "review",
  "grade",
  "return",
];

const ALL_PERMISSIONS: AdminPermissionKey[] = ALL_RESOURCES.flatMap((resource) =>
  ALL_ACTIONS.map((action) => `${resource}.${action}` as AdminPermissionKey),
);

/**
 * Defaults are used only when an admin has no explicit permission row.
 * Explicit database permissions always win.
 */
export const DEFAULT_TIER_PERMISSIONS: Record<AdminSubRole, AdminPermissionKey[]> = {
  super_admin: ALL_PERMISSIONS,

  platform_admin: [
    ...keys("users", MANAGEMENT),
    ...keys("students", MANAGEMENT),
    ...keys("instructors", MANAGEMENT),
    ...keys("organizations", MANAGEMENT),
    ...keys("courses", MANAGEMENT),
    ...keys("modules", MANAGEMENT),
    ...keys("lessons", MANAGEMENT),
    ...keys("lesson_content", ["view", "edit", "manage"]),
    ...keys("assignments", MANAGEMENT),
    ...keys("assessments", MANAGEMENT),
    ...keys("submissions", ACADEMIC_MANAGEMENT),
    ...keys("grades", ["view", "grade", "edit", "override", "manage"]),
    ...keys("enrollments", ["view", "create", "cancel", "complete", "allocate", "manage"]),
    ...keys("learning", ["view", "manage"]),
    ...keys("progress", ["view", "update", "override", "manage"]),
    ...keys("certificates", ["view", "award", "revoke", "reissue", "override", "manage"]),
    ...keys("sponsorships", MANAGEMENT),
    ...keys("payments", ["view", "create", "edit", "refund", "export", "manage"]),
    ...keys("audit", ["view", "export"]),
    ...keys("settings", ["view", "edit", "manage"]),
    ...keys("admins", ["view", "edit", "suspend", "manage"]),
  ],

  academic_admin: [
    ...keys("users", ["view"]),
    ...keys("students", ["view", "edit", "assign"]),
    ...keys("instructors", ["view", "edit", "assign"]),
    ...keys("courses", MANAGEMENT),
    ...keys("modules", MANAGEMENT),
    ...keys("lessons", MANAGEMENT),
    ...keys("lesson_content", ["view", "edit", "manage"]),
    ...keys("assignments", ACADEMIC_MANAGEMENT),
    ...keys("assessments", ACADEMIC_MANAGEMENT),
    ...keys("submissions", ["view", "review", "grade", "return", "manage"]),
    ...keys("grades", ["view", "grade", "edit", "override", "manage"]),
    ...keys("enrollments", ["view", "create", "cancel", "complete", "allocate", "manage"]),
    ...keys("learning", ["view", "manage"]),
    ...keys("progress", ["view", "update", "override", "manage"]),
    ...keys("certificates", ["view", "award", "revoke", "reissue", "override", "manage"]),
    ...keys("organizations", ["view"]),
    ...keys("sponsorships", ["view"]),
    ...keys("audit", ["view"]),
  ],

  finance_admin: [
    ...keys("users", ["view"]),
    ...keys("students", ["view"]),
    ...keys("instructors", ["view"]),
    ...keys("organizations", ["view"]),
    ...keys("courses", ["view"]),
    ...keys("enrollments", ["view", "allocate"]),
    ...keys("sponsorships", ["view", "create", "edit", "allocate", "withdraw", "manage"]),
    ...keys("payments", ["view", "create", "edit", "refund", "export", "manage"]),
    ...keys("audit", ["view", "export"]),
  ],

  user_admin: [
    ...keys("users", MANAGEMENT),
    ...keys("students", MANAGEMENT),
    ...keys("instructors", MANAGEMENT),
    ...keys("organizations", ["view"]),
    ...keys("enrollments", ["view", "create", "cancel", "allocate", "manage"]),
    ...keys("audit", ["view"]),
  ],

  compliance_admin: [
    ...keys("users", ["view"]),
    ...keys("students", ["view"]),
    ...keys("instructors", ["view"]),
    ...keys("organizations", ["view"]),
    ...keys("courses", ["view"]),
    ...keys("modules", ["view"]),
    ...keys("lessons", ["view"]),
    ...keys("assignments", ["view", "review"]),
    ...keys("assessments", ["view", "review"]),
    ...keys("submissions", ["view", "review"]),
    ...keys("grades", ["view"]),
    ...keys("enrollments", ["view"]),
    ...keys("certificates", ["view"]),
    ...keys("payments", ["view"]),
    ...keys("audit", ["view", "export"]),
  ],

  org_admin: [
    ...keys("users", [...MANAGEMENT, "suspend", "assign"]),
    ...keys("students", [...MANAGEMENT, "assign"]),
    ...keys("instructors", [...MANAGEMENT, "assign"]),
    ...keys("organizations", MANAGEMENT),
    ...keys("courses", MANAGEMENT),
    ...keys("modules", MANAGEMENT),
    ...keys("lessons", MANAGEMENT),
    ...keys("lesson_content", ["view", "edit", "manage"]),
    ...keys("assignments", ACADEMIC_MANAGEMENT),
    ...keys("assessments", ACADEMIC_MANAGEMENT),
    ...keys("submissions", ["view", "review", "grade", "return", "manage"]),
    ...keys("grades", ["view", "grade", "edit", "override", "manage"]),
    ...keys("enrollments", ["view", "create", "cancel", "complete", "allocate", "manage"]),
    ...keys("learning", ["view", "manage"]),
    ...keys("progress", ["view", "update", "override", "manage"]),
    ...keys("certificates", ["view", "award", "revoke", "reissue", "override", "manage"]),
    ...keys("sponsorships", ["view", "create", "edit", "allocate", "withdraw", "manage"]),
    ...keys("payments", ["view"]),
    ...keys("audit", ["view"]),
  ],
};

const LEGACY_ALIASES: Record<string, AdminPermissionKey[]> = {
  manage_users: ["users.manage", "students.manage", "instructors.manage"],
  manage_courses: [
    "courses.manage",
    "modules.manage",
    "lessons.manage",
    "assignments.manage",
    "assessments.manage",
    "enrollments.manage",
    "certificates.manage",
  ],
  manage_payments: ["payments.manage"],
  manage_settings: ["settings.manage"],
  view_audit_logs: ["audit.view", "audit.export"],
  manage_admins: ["admins.manage"],
  manage_organizations: ["organizations.manage", "sponsorships.manage"],
};

const INSTRUCTOR_RESOURCES = new Set<Resource>([
  "courses",
  "modules",
  "lessons",
  "lesson_content",
  "assignments",
  "assessments",
  "submissions",
  "grades",
  "enrollments",
  "learning",
  "progress",
  "certificates",
]);

const STUDENT_RESOURCES = new Set<Resource>([
  "courses",
  "modules",
  "lessons",
  "lesson_content",
  "assignments",
  "assessments",
  "submissions",
  "learning",
  "progress",
  "enrollments",
  "certificates",
  "payments",
]);

export function isAdmin(user: CurrentUser | null | undefined): boolean {
  return user?.role === "admin";
}

export function isInstructor(user: CurrentUser | null | undefined): boolean {
  return user?.role === "instructor";
}

export function isStudent(user: CurrentUser | null | undefined): boolean {
  return user?.role === "student";
}

export function isAuditor(user: CurrentUser | null | undefined): boolean {
  return user?.role === "auditor";
}

export function tier(user: CurrentUser | null | undefined): AdminSubRole | undefined {
  return isAdmin(user) ? (user?.adminSubRole ?? "super_admin") : undefined;
}

export function isOrgScoped(user: CurrentUser | null | undefined): boolean {
  return isAdmin(user) && (user?.organizationScope === "selected" || tier(user) === "org_admin");
}

export function scopedOrganizationIds(user: CurrentUser | null | undefined): string[] {
  return isOrgScoped(user) ? (user?.organizationIds ?? []) : [];
}

export function canAccessOrganization(
  user: CurrentUser | null | undefined,
  organizationId: string,
): boolean {
  if (!isAdmin(user)) return false;
  if (!isOrgScoped(user)) return true;
  return (user.organizationIds ?? []).includes(organizationId);
}

function hasOrganizationScope(
  user: CurrentUser,
  context?: AuthorizationContext,
): boolean {
  if (!context?.organizationId) return true;
  return canAccessOrganization(user, context.organizationId);
}

function hasResourceRelationship(
  user: CurrentUser,
  resource: Resource,
  context?: AuthorizationContext,
): boolean {
  if (!context?.resourceId) return true;

  const relationships = user.resourceRelationships ?? [];
  if (!relationships.length) return true;

  return relationships.some(
    (relationship) =>
      relationship.resource === resource &&
      relationship.resourceId === context.resourceId &&
      (!context.relationship || relationship.relationship === context.relationship),
  );
}

function hasAdminPermission(
  user: CurrentUser,
  resource: Resource,
  action: Action,
): boolean {
  if (tier(user) === "super_admin") return true;

  const granted = user.permissions ?? [];

  const exact = `${resource}.${action}` as AdminPermissionKey;
  if (granted.includes(exact)) return true;

  // `manage` is the explicit full-control permission for a resource.
  if (action !== "manage") {
    const manage = `${resource}.manage` as AdminPermissionKey;
    if (granted.includes(manage)) return true;
  }

  for (const [legacy, replacements] of Object.entries(LEGACY_ALIASES)) {
    if (granted.includes(legacy as AdminPermissionKey) && replacements.includes(exact)) {
      return true;
    }
  }

  // If the database has not provisioned granular permissions yet, use the
  // canonical tier defaults.
  if (!granted.length && user.adminSubRole) {
    return DEFAULT_TIER_PERMISSIONS[user.adminSubRole].includes(exact);
  }

  return false;
}

/**
 * Core authorization check.
 *
 * Admin: explicit permission + organization scope + resolved relationship.
 * Instructor: teaching surface; specific mutations should provide ownership
 * context once resource relationships are resolved by the service layer.
 * Student: participation surface.
 * Auditor: read-only operational/audit surface.
 */
export function can(
  user: CurrentUser | null | undefined,
  resource: Resource,
  action: Action = "view",
  context?: AuthorizationContext,
): boolean {
  if (!user || user.status !== "active") return false;

  if (isAdmin(user)) {
    if (!hasOrganizationScope(user, context)) return false;
    if (!hasResourceRelationship(user, resource, context)) return false;
    return hasAdminPermission(user, resource, action);
  }

  if (isInstructor(user)) {
    if (!INSTRUCTOR_RESOURCES.has(resource)) return false;

    if (context?.instructorId && context.instructorId !== user.id) return false;
    if (context?.ownerId && context.ownerId !== user.id) return false;

    // Sensitive academic outcomes require explicit teaching ownership context.
    if (
      ["submissions", "grades"].includes(resource) &&
      ["review", "grade", "return", "override"].includes(action) &&
      !context?.instructorId &&
      !context?.ownerId
    ) {
      return false;
    }

    if (
      resource === "certificates" &&
      ["award", "revoke", "reissue"].includes(action) &&
      !context?.instructorId &&
      !context?.ownerId
    ) {
      return false;
    }

    return [
      "view",
      "create",
      "edit",
      "delete",
      "publish",
      "unpublish",
      "archive",
      "reorder",
      "review",
      "grade",
      "return",
      "award",
      "revoke",
      "reissue",
      "update",
      "manage",
    ].includes(action);
  }

  if (isStudent(user)) {
    if (!STUDENT_RESOURCES.has(resource)) return false;

    if (resource === "submissions") {
      return action === "view" || action === "submit";
    }
    if (resource === "progress") {
      return action === "view" || action === "update" || action === "complete";
    }
    if (resource === "learning") {
      return action === "view" || action === "participate" || action === "complete";
    }
    if (resource === "enrollments") {
      return action === "view" || action === "create" || action === "cancel";
    }
    if (resource === "payments") {
      return action === "view" || action === "create";
    }
    if (resource === "certificates") {
      return action === "view";
    }

    return action === "view" || action === "participate" || action === "complete" || action === "submit";
  }

  if (isAuditor(user)) {
    return action === "view" &&
      [
        "audit",
        "organizations",
        "courses",
        "students",
        "instructors",
        "enrollments",
        "certificates",
        "payments",
      ].includes(resource);
  }

  return false;
}

export function assertCan(
  user: CurrentUser | null | undefined,
  resource: Resource,
  action: Action = "view",
  context?: AuthorizationContext,
): void {
  if (!can(user, resource, action, context)) {
    throw new Error(`Permission denied: ${resource}.${action}`);
  }
}

export function adminRoutePermission(pathname: string): {
  resource: Resource;
  action: Action;
} | null {
  const rules: Array<[string, Resource, Action]> = [
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
  ];

  const match = rules.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return match ? { resource: match[1], action: match[2] } : null;
}

export function landingPath(user: CurrentUser | null | undefined): string {
  if (!user) return "/auth";
  if (user.role === "admin") return "/admin";
  if (user.role === "instructor") return "/instructor";
  return "/dashboard";
}

