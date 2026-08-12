/**
 * Authorization model for Academy Hub.
 *
 *   Role  →  Admin tier  →  Organization scope  →  Resource  →  Action
 *
 * These helpers are pure: they only read the `CurrentUser` returned by
 * `src/services/api.ts`. The backend/data layer stays authoritative — this
 * module only decides what the UI offers.
 */

import type { AdminPermissionKey, AdminSubRole, CurrentUser } from "@/types";

export type Resource =
  | "students"
  | "instructors"
  | "courses"
  | "organizations"
  | "enrollments"
  | "payments"
  | "certificates"
  | "audit"
  | "settings"
  | "admins";

export type Action = "view" | "manage";

const RESOURCE_PERMISSION: Record<Resource, AdminPermissionKey> = {
  students: "manage_users",
  instructors: "manage_users",
  courses: "manage_courses",
  organizations: "manage_organizations",
  enrollments: "manage_courses",
  payments: "manage_payments",
  certificates: "manage_courses",
  audit: "view_audit_logs",
  settings: "manage_settings",
  admins: "manage_admins",
};

export const TIER_LABEL: Record<AdminSubRole, string> = {
  super_admin: "Super admin",
  platform_admin: "Platform admin",
  academic_admin: "Academic admin",
  finance_admin: "Finance admin",
  user_admin: "User admin",
  compliance_admin: "Compliance admin",
  org_admin: "Organization admin",
};

export function isAdmin(user: CurrentUser | null | undefined): boolean {
  return user?.role === "admin";
}

export function isInstructor(user: CurrentUser | null | undefined): boolean {
  return user?.role === "instructor" || user?.role === "admin";
}

export function tier(user: CurrentUser | null | undefined): AdminSubRole | undefined {
  return isAdmin(user) ? (user?.adminSubRole ?? "super_admin") : undefined;
}

/** True when the administrator's scope is limited to specific organizations. */
export function isOrgScoped(user: CurrentUser | null | undefined): boolean {
  return tier(user) === "org_admin";
}

/** Organizations the user may operate on; empty array means "all". */
export function scopedOrganizationIds(user: CurrentUser | null | undefined): string[] {
  return isOrgScoped(user) ? (user?.organizationIds ?? []) : [];
}

export function canAccessOrganization(
  user: CurrentUser | null | undefined,
  organizationId: string,
): boolean {
  if (!isAdmin(user)) return false;
  if (!isOrgScoped(user)) return true;
  return (user?.organizationIds ?? []).includes(organizationId);
}

/** Core check: does this user have the given permission over a resource? */
export function can(
  user: CurrentUser | null | undefined,
  resource: Resource,
  action: Action = "view",
): boolean {
  if (!user) return false;

  if (user.role === "instructor") {
    // Instructors only ever act on their own teaching surface.
    return resource === "courses" && action !== "manage" ? true : resource === "courses";
  }

  if (user.role !== "admin") return false;

  const key = RESOURCE_PERMISSION[resource];
  const granted = user.permissions ?? [];
  const hasKey = granted.includes(key);

  if (action === "view") {
    // Viewing is broader than managing: any admin may read operational data
    // they hold at least one related permission for, plus their own scope.
    return hasKey || tier(user) === "super_admin";
  }

  if (resource === "settings" || resource === "admins") {
    return tier(user) === "super_admin" && hasKey;
  }
  return hasKey;
}

/** Where a user lands after signing in. */
export function landingPath(user: CurrentUser | null | undefined): string {
  if (!user) return "/auth";
  if (user.role === "admin") return "/admin";
  if (user.role === "instructor") return "/instructor";
  return "/dashboard";
}
