import { describe, expect, it } from "vitest";

import {
  can,
  DEFAULT_TIER_PERMISSIONS,
  isAdmin,
  isInstructor,
  isOrgScoped,
} from "@/services/permissions";

import type { CurrentUser } from "@/types";

const baseUser: CurrentUser = {
  id: "u1",
  email: "user@example.com",
  fullName: "Test User",
  role: "student",
  status: "active",
};

const instructor: CurrentUser = {
  ...baseUser,
  role: "instructor",
};

const student: CurrentUser = {
  ...baseUser,
  role: "student",
};

const superAdmin: CurrentUser = {
  ...baseUser,
  role: "admin",
  adminSubRole: "super_admin",
  permissions: DEFAULT_TIER_PERMISSIONS.super_admin,
};

const academicAdmin: CurrentUser = {
  ...baseUser,
  role: "admin",
  adminSubRole: "academic_admin",
  permissions: DEFAULT_TIER_PERMISSIONS.academic_admin,
};

const financeAdmin: CurrentUser = {
  ...baseUser,
  role: "admin",
  adminSubRole: "finance_admin",
  permissions: DEFAULT_TIER_PERMISSIONS.finance_admin,
};

const orgAdmin: CurrentUser = {
  ...baseUser,
  role: "admin",
  adminSubRole: "org_admin",
  organizationScope: "selected",
  organizationIds: ["org-1"],
  permissions: DEFAULT_TIER_PERMISSIONS.org_admin,
};

const auditor: CurrentUser = {
  ...baseUser,
  role: "auditor",
};

describe("Academy Hub authorization", () => {
  it("identifies roles correctly", () => {
    expect(isInstructor(instructor)).toBe(true);
    expect(isInstructor(superAdmin)).toBe(false);
    expect(isAdmin(superAdmin)).toBe(true);
    expect(isAdmin(instructor)).toBe(false);
  });

  it("allows super admin platform-wide access", () => {
    expect(
      can(superAdmin, "courses", "delete"),
    ).toBe(true);

    expect(
      can(superAdmin, "lessons", "edit"),
    ).toBe(true);

    expect(
      can(superAdmin, "grades", "override"),
    ).toBe(true);

    expect(
      can(superAdmin, "certificates", "revoke"),
    ).toBe(true);
  });

  it("gives academic admin learning-management access", () => {
    expect(
      can(academicAdmin, "courses", "edit"),
    ).toBe(true);

    expect(
      can(academicAdmin, "lessons", "edit"),
    ).toBe(true);

    expect(
      can(academicAdmin, "assessments", "edit"),
    ).toBe(true);

    expect(
      can(academicAdmin, "grades", "override"),
    ).toBe(true);

    expect(
      can(academicAdmin, "certificates", "award"),
    ).toBe(true);
  });

  it("does not give academic admin finance management", () => {
    expect(
      can(academicAdmin, "payments", "refund"),
    ).toBe(false);
  });

  it("gives finance admin payment management", () => {
    expect(
      can(financeAdmin, "payments", "view"),
    ).toBe(true);

    expect(
      can(financeAdmin, "payments", "refund"),
    ).toBe(true);
  });

  it("does not turn an admin into an instructor", () => {
    expect(isInstructor(academicAdmin)).toBe(false);
    expect(isInstructor(superAdmin)).toBe(false);
  });

  it("limits org admin to selected organizations", () => {
    expect(isOrgScoped(orgAdmin)).toBe(true);

    expect(
      can(
        orgAdmin,
        "courses",
        "edit",
        { organizationId: "org-1" },
      ),
    ).toBe(true);

    expect(
      can(
        orgAdmin,
        "courses",
        "edit",
        { organizationId: "org-999" },
      ),
    ).toBe(false);
  });

  it("allows instructors to manage their own courses", () => {
    expect(
      can(
        instructor,
        "courses",
        "edit",
        { instructorId: "u1" },
      ),
    ).toBe(true);

    expect(
      can(
        instructor,
        "courses",
        "edit",
        { instructorId: "u2" },
      ),
    ).toBe(false);
  });

  it("allows instructors to manage their course hierarchy", () => {
    const context = {
      instructorId: "u1",
      resourceId: "lesson-1",
    };

    expect(
      can(instructor, "modules", "edit", context),
    ).toBe(true);

    expect(
      can(instructor, "lessons", "delete", context),
    ).toBe(true);

    expect(
      can(instructor, "assessments", "edit", context),
    ).toBe(true);
  });

  it("allows students to participate but not manage learning content", () => {
    expect(
      can(student, "learning", "participate"),
    ).toBe(true);

    expect(
      can(student, "lessons", "edit"),
    ).toBe(false);

    expect(
      can(student, "assessments", "edit"),
    ).toBe(false);

    expect(
      can(student, "grades", "override"),
    ).toBe(false);
  });

  it("allows students to access their own grades", () => {
    expect(
      can(
        student,
        "grades",
        "view",
        { studentId: "u1" },
      ),
    ).toBe(true);

    expect(
      can(
        student,
        "grades",
        "view",
        { studentId: "u2" },
      ),
    ).toBe(false);
  });

  it("treats auditors as audit actors rather than admins", () => {
    expect(
      can(auditor, "audit", "view"),
    ).toBe(true);

    expect(
      can(auditor, "audit", "export"),
    ).toBe(true);

    expect(
      can(auditor, "courses", "edit"),
    ).toBe(false);

    expect(
      can(auditor, "payments", "refund"),
    ).toBe(false);
  });
});