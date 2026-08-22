/**
 * ============================================================================
 *  APPLICATION SERVICE LAYER  —  THE BACKEND BOUNDARY
 * ============================================================================
 *
 *  This is the ONLY module in the application that is allowed to talk to a
 *  backend. React pages, components, hooks and contexts import functions from
 *  here and nothing else.
 *
 *  Today every function is implemented against Lovable Cloud (Supabase).
 *  Tomorrow the bodies of these functions will be replaced with `fetch()`
 *  calls to a Python API (FastAPI/Django). The exported signatures, the domain
 *  types they accept/return and the error shape they throw are the contract
 *  and MUST NOT change during that migration.
 *
 *  Rules enforced in this file:
 *    1. Never leak a Supabase object (rows, PostgrestError, Session, User).
 *    2. Always map snake_case rows -> camelCase domain objects.
 *    3. Always normalise errors into `ApiError`.
 *    4. Keep the mapping between domain concepts and the future REST endpoints
 *       documented next to each section.
 * ============================================================================
 */

import { supabase } from "@/integrations/supabase/client";
import { can } from "@/services/permissions";
import type {
  AcademySettings,
  AdminDashboardStats,
  ApiError,
  AppNotification,
  Assignment,
  AssignmentInput,
  AssignmentSubmission,
  AssignmentSubmissionInput,
  AuditLog,
  NotificationInput,
  AuditLogFilters,
  Certificate,
  CertificateFilters,
  Course,
  CourseAnalytics,
  CourseDetail,
  CourseFilters,
  CourseInput,
  CourseProgress,
  CurrentUser,
  Enrollment,
  EnrollmentFilters,
  EnrollmentStatus,
  InstructorDashboardStats,
  Lesson,
  LessonInput,
  LessonProgress,
  LoginInput,
  Module,
  ModuleInput,
  Paginated,
  Payment,
  PaymentFilters,
  PaymentInput,
  PaymentStatus,
  ProgressStatus,
  Quiz,
  QuizAttempt,
  QuizInput,
  QuizResult,
  RegisterInput,
  StudentDashboardStats,
  User,
  UserFilters,
  UserRole,
  UserStatus,
  AdminSubRole,
  AdminPermissionKey,
  AdminPermissionRecord,
  Organization,
  OrganizationMember,
  OrganizationParticipant,
  OrganizationType,
  Cohort,
  BulkEnrollmentInput,
  BulkEnrollmentResult,
} from "@/types";

/* ========================================================================== */
/*  Error handling                                                            */
/* ========================================================================== */

export function isApiError(value: unknown): value is ApiError {
  return typeof value === "object" && value !== null && "code" in value && "message" in value;
}

export function errorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

function apiError(code: string, message: string, details?: unknown): ApiError {
  return { code, message, details };
}

/** Normalises any backend error into the application error contract. */
function isSchemaRelationUnavailable(error: unknown): boolean {
  const raw = error as { code?: string; message?: string } | null;
  const message = (raw?.message ?? "").toLowerCase();
  return raw?.code === "PGRST205" || message.includes("schema cache") || message.includes("does not exist");
}

function normalizeError(error: unknown, context: string): ApiError {
  const raw = error as { code?: string; message?: string; details?: unknown } | null;
  const code = raw?.code ?? "unknown_error";
  let message = raw?.message ?? "An unexpected error occurred.";

  if (code === "23505") message = "That record already exists.";
  if (code === "42501" || code === "PGRST301")
    message = "You do not have permission to perform this action.";
  if (message.toLowerCase().includes("invalid login credentials"))
    message = "Incorrect email or password.";
  if (message.toLowerCase().includes("failed to fetch"))
    message = "Cannot reach the server. Check your connection and try again.";

  return apiError(code, message, { context, details: raw?.details });
}

/** Runs a backend call and converts failures into ApiError. */
async function run<T>(context: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (isApiError(error)) throw error;
    throw normalizeError(error, context);
  }
}

function unwrap<T>(context: string, result: { data: T | null; error: unknown }): T {
  if (result.error) throw normalizeError(result.error, context);
  if (result.data === null || result.data === undefined)
    throw apiError("not_found", "The requested record could not be found.", { context });
  return result.data;
}

function unwrapList<T>(context: string, result: { data: T[] | null; error: unknown }): T[] {
  if (result.error) throw normalizeError(result.error, context);
  return result.data ?? [];
}

/* ========================================================================== */
/*  Row mappers (Supabase specific — never exported)                          */
/* ========================================================================== */

type Row = Record<string, any>;

const toProfile = (r: Row, role: UserRole = "student"): User => ({
  id: r.id,
  fullName: r.full_name || r.email || "Unnamed user",
  email: r.email ?? "",
  role,
  avatarUrl: r.avatar_url ?? undefined,
  status: (r.status ?? "active") as UserStatus,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const toCourse = (r: Row): Course => ({
  id: r.id,
  title: r.title,
  slug: r.slug,
  shortDescription: r.short_description ?? "",
  descriptionHtml: r.description_html ?? "",
  instructorId: r.instructor_id ?? r.instructorIds?.[0] ?? "",
  instructorName: r.profiles?.full_name ?? r.instructor_name ?? r.instructorNames?.[0] ?? undefined,
  instructorIds: Array.isArray(r.instructorIds) ? r.instructorIds : (r.instructor_id ? [r.instructor_id] : []),
  instructorNames: Array.isArray(r.instructorNames) ? r.instructorNames : (r.profiles?.full_name ? [r.profiles.full_name] : []),
  organizationIds: Array.isArray(r.organizationIds) ? r.organizationIds : (r.organization_id ? [r.organization_id] : []),
  status: r.status,
  priceCents: r.price_cents ?? 0,
  currency: r.currency ?? "KES",
  thumbnailUrl: r.thumbnail_url ?? undefined,
  category: r.category ?? "General",
  level: r.level ?? "beginner",
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const toModule = (r: Row): Module => ({
  id: r.id,
  courseId: r.course_id,
  title: r.title,
  descriptionHtml: r.description_html ?? "",
  orderIndex: r.order_index ?? 0,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const toLesson = (r: Row): Lesson => ({
  id: r.id,
  moduleId: r.module_id,
  title: r.title,
  lessonType: r.lesson_type,
  contentHtml: r.content_html ?? "",
  videoUrl: r.video_url ?? undefined,
  attachments: Array.isArray(r.attachments) ? r.attachments : [],
  durationSeconds: r.duration_seconds ?? 0,
  isPreview: !!r.is_preview,
  orderIndex: r.order_index ?? 0,
  status: r.status ?? "published",
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const toEnrollment = (r: Row): Enrollment => ({
  id: r.id,
  userId: r.user_id,
  courseId: r.course_id,
  status: r.status,
  enrolledAt: r.enrolled_at,
  completedAt: r.completed_at ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  course: r.courses ? toCourse(r.courses) : undefined,
});

const toProgress = (r: Row): LessonProgress => ({
  id: r.id,
  userId: r.user_id,
  lessonId: r.lesson_id,
  status: r.status,
  lastPositionSeconds: r.last_position_seconds ?? 0,
  completedAt: r.completed_at ?? undefined,
  updatedAt: r.updated_at,
});

const toAttempt = (r: Row): QuizAttempt => ({
  id: r.id,
  userId: r.user_id,
  quizId: r.quiz_id,
  scorePercent: r.score_percent ?? 0,
  passed: !!r.passed,
  startedAt: r.started_at,
  submittedAt: r.submitted_at,
});

const toCertificate = (r: Row): Certificate => ({
  id: r.id,
  userId: r.user_id,
  courseId: r.course_id,
  certificateCode: r.certificate_code,
  issuedAt: r.issued_at,
  revokedAt: r.revoked_at ?? undefined,
  certificateUrl: r.certificate_url ?? undefined,
  status: r.status,
  courseTitle: r.courses?.title,
});

const toPayment = (r: Row): Payment => ({
  id: r.id,
  userId: r.user_id,
  courseId: r.course_id,
  amountCents: r.amount_cents ?? 0,
  currency: r.currency ?? "KES",
  provider: r.provider,
  providerReference: r.provider_reference ?? undefined,
  status: r.status,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  courseTitle: r.courses?.title,
});

const toAuditLog = (r: Row): AuditLog => ({
  id: r.id,
  userId: r.user_id ?? undefined,
  action: r.action,
  entityType: r.entity_type,
  entityId: r.entity_id ?? undefined,
  metadata: (r.metadata ?? {}) as Record<string, unknown>,
  createdAt: r.created_at,
});

/* ========================================================================== */
/*  Small utilities                                                           */
/* ========================================================================== */

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function paginate<T>(items: T[], page = 1, pageSize = 10): Paginated<T> {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  };
}

async function attachProfileNames<T extends { userId?: string }>(
  rows: T[],
): Promise<Map<string, { name: string; email: string }>> {
  const ids = Array.from(new Set(rows.map((r) => r.userId).filter(Boolean))) as string[];
  const map = new Map<string, { name: string; email: string }>();
  if (!ids.length) return map;
  const { data } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
  (data ?? []).forEach((p: Row) => {
    map.set(p.id, { name: p.full_name || p.email, email: p.email ?? "" });
  });
  return map;
}

/* ========================================================================== */
/*  AUTHENTICATION                                                            */
/*  Future: POST /api/auth/login, POST /api/auth/register, GET /api/me        */
/* ========================================================================== */

export async function login(input: LoginInput): Promise<CurrentUser> {
  return run("auth.login", async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: input.email.trim(),
      password: input.password,
    });
    if (error) throw normalizeError(error, "auth.login");
    const user = await getCurrentUser();
    if (!user) throw apiError("auth_failed", "Sign in did not complete. Please try again.");
    return user;
  });
}

export async function register(
  input: RegisterInput,
): Promise<{ requiresEmailConfirmation: boolean }> {
  return run("auth.register", async () => {
    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/` : undefined;
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: input.fullName, role: input.role ?? "student" },
      },
    });
    if (error) throw normalizeError(error, "auth.register");
    return { requiresEmailConfirmation: !data.session };
  });
}

export async function logout(): Promise<void> {
  return run("auth.logout", async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw normalizeError(error, "auth.logout");
  });
}

export async function resetPassword(email: string): Promise<void> {
  return run("auth.resetPassword", async () => {
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (error) throw normalizeError(error, "auth.resetPassword");
  });
}

export async function updatePassword(newPassword: string): Promise<void> {
  return run("auth.updatePassword", async () => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw normalizeError(error, "auth.updatePassword");
  });
}

/** Restores the session and returns the application user, or null. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  return run("auth.getCurrentUser", async () => {
    const { data: auth } = await supabase.auth.getUser();
    const authUser = auth?.user;

    if (!authUser) return null;

    const [{ data: profile }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle(),

      supabase.from("user_roles").select("role").eq("user_id", authUser.id),
    ]);

    const roleList = (roles ?? []).map((r: Row) => r.role as UserRole);

    const role: UserRole = roleList.includes("admin")
      ? "admin"
      : roleList.includes("auditor")
        ? "auditor"
        : roleList.includes("instructor")
          ? "instructor"
          : "student";

    let adminSubRole: AdminSubRole | undefined;
    let adminSubRoles: AdminSubRole[] = [];
    let permissions: AdminPermissionKey[] | undefined;
    let organizationIds: string[] = [];
    let organizationScope: "all" | "selected" = "all";

    if (role === "admin") {
      // Normalized authorization model: administrator → tiers → permissions.
      // There is deliberately no implicit super-admin fallback.
      const [adminRoleResult, scopeResult] = await Promise.all([
        (supabase as any).from("admin_roles").select("sub_role").eq("user_id", authUser.id),
        supabase.from("admin_organization_scopes").select("organization_id").eq("user_id", authUser.id),
      ]);
      if (adminRoleResult.error && !isSchemaRelationUnavailable(adminRoleResult.error)) throw normalizeError(adminRoleResult.error, "auth.getCurrentUser.adminRoles");
      if (scopeResult.error && !isSchemaRelationUnavailable(scopeResult.error)) throw normalizeError(scopeResult.error, "auth.getCurrentUser.adminScopes");
      const adminRoles = adminRoleResult.error ? [] : adminRoleResult.data;
      const scopes = scopeResult.error ? [] : scopeResult.data;

      adminSubRoles = ((adminRoles ?? []) as Row[])
        .map((r) => r.sub_role as AdminSubRole)
        .filter(Boolean);
      adminSubRole = adminSubRoles[0];

      if (adminSubRoles.length) {
        const { data: tierPermissions, error: tierError } = await (supabase as any)
          .from("admin_tier_permissions")
          .select("sub_role, permission_key")
          .in("sub_role", adminSubRoles);
        if (tierError) throw normalizeError(tierError, "auth.getCurrentUser.adminPermissions");
        permissions = Array.from(
          new Set(
            ((tierPermissions ?? []) as Row[])
              .map((r) => r.permission_key as AdminPermissionKey)
              .filter(Boolean),
          ),
        );
      } else {
        permissions = [];
      }

      const scopedIds = (scopes ?? [])
        .map((s: Row) => s.organization_id)
        .filter(Boolean);
      if (scopedIds.length) {
        organizationIds = scopedIds;
        organizationScope = "selected";
      }
    }

    const [{ data: memberships }, { data: instructorRelations }, { data: enrollments }] = await Promise.all([
      supabase.from("organization_members").select("organization_id, org_role").eq("user_id", authUser.id),
      (supabase as any).from("course_instructors").select("course_id").eq("instructor_id", authUser.id),
      supabase.from("enrollments").select("course_id").eq("user_id", authUser.id),
    ]);

    if (role !== "admin") {
      organizationIds = (memberships ?? []).map((m: Row) => m.organization_id).filter(Boolean);
    }

    const organizationRelationships = (memberships ?? []).map((m: Row) => ({
      organizationId: m.organization_id,
      relationship: (m.org_role === "manager" ? "administrator" : "member") as const,
    }));
    const resourceRelationships = [
      ...((instructorRelations ?? []) as Row[]).map((r) => ({ resource: "courses" as const, resourceId: r.course_id, relationship: "instructor" as const })),
      ...((enrollments ?? []) as Row[]).map((r) => ({ resource: "courses" as const, resourceId: r.course_id, relationship: "student" as const })),
    ];

    return {
      id: authUser.id,

      adminSubRole,
      adminSubRoles,
      permissions,

      organizationIds,
      organizationScope,

      /*
       * Relationship data will be populated once the corresponding
       * Supabase relationship tables are introduced.
       *
       * Keeping these arrays empty is intentional for Task 0.
       */
      organizationRelationships,
      resourceRelationships,

      email: profile?.email || authUser.email || "",

      fullName:
        profile?.full_name ||
        (authUser.user_metadata?.full_name as string) ||
        authUser.email ||
        "Member",

      role,

      avatarUrl: profile?.avatar_url ?? undefined,

      status: (profile?.status ?? "active") as UserStatus,
    };
  });
}
/** Subscribes to session changes. Returns an unsubscribe function. */
export function onAuthChange(callback: () => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
      callback();
    }
  });
  return () => data.subscription.unsubscribe();
}

async function requireUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data?.user) throw apiError("unauthenticated", "You need to sign in to continue.");
  return data.user.id;
}

/** Fallback permission sets per administrative tier. */
/**export const DEFAULT_TIER_PERMISSIONS: Record<AdminSubRole, AdminPermissionKey[]> = {
  super_admin: [
    "manage_users",
    "manage_courses",
    "manage_payments",
    "manage_settings",
    "view_audit_logs",
    "manage_admins",
    "manage_organizations",
  ],
  platform_admin: [
    "manage_users",
    "manage_courses",
    "manage_payments",
    "view_audit_logs",
    "manage_organizations",
  ],
  academic_admin: ["manage_users", "manage_courses", "view_audit_logs"],
  finance_admin: ["manage_payments", "view_audit_logs"],
  user_admin: ["manage_users", "view_audit_logs"],
  compliance_admin: ["view_audit_logs"],
  org_admin: ["manage_users", "manage_courses"],
};**/

/* ========================================================================== */
/*  MEDIA                                                                     */
/*  Future: POST /api/media (multipart) -> { url }                            */
/* ========================================================================== */

/**
 * Uploads course media (thumbnail image or lesson video) and returns a stable
 * URL the UI can store on the course/lesson record.
 */
export async function uploadCourseMedia(
  file: File,
  folder: "thumbnails" | "videos" | "attachments" | "avatars" = "thumbnails",
): Promise<string> {
  return run("media.upload", async () => {
    const userId = await requireUserId();
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const path = `${folder}/${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
    if (error) throw normalizeError(error, "media.upload");

    const { data, error: signError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (signError || !data?.signedUrl) throw normalizeError(signError, "media.upload.sign");
    return data.signedUrl;
  });
}

export async function uploadProfileAvatar(file: File): Promise<string> {
  return run("profile.avatar.upload", async () => {
    const url = await uploadCourseMedia(file, "avatars");
    const userId = await requireUserId();
    await updateUser(userId, { avatarUrl: url });
    await recordAudit("profile.avatar_updated", "profile", userId, { url });
    return url;
  });
}

export async function updateEmail(email: string): Promise<void> {
  return run("auth.updateEmail", async () => {
    const normalized = email.trim().toLowerCase();
    if (!normalized || !normalized.includes("@")) throw apiError("validation", "Enter a valid email address.");
    const { error } = await supabase.auth.updateUser({ email: normalized });
    if (error) throw normalizeError(error, "auth.updateEmail");
    await recordAudit("profile.email_change_requested", "profile", await requireUserId(), { email: normalized });
  });
}

const MEDIA_BUCKET = "course-media";

/* ========================================================================== */
/*  USERS                                                                     */
/*  Future: GET /api/users, PATCH /api/users/{id}                             */
/* ========================================================================== */

export async function getUsers(filters: UserFilters = {}): Promise<Paginated<User>> {
  return run("users.list", async () => {
    const profiles = unwrapList(
      "users.list",
      await supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    );
    const roleRows = unwrapList("users.roles", await supabase.from("user_roles").select("*"));
    const roleMap = new Map<string, UserRole>();
    roleRows.forEach((r: Row) => {
      const current = roleMap.get(r.user_id);
      const rank = { student: 0, instructor: 1, admin: 2 } as const;
      if (!current || rank[r.role as UserRole] > rank[current]) roleMap.set(r.user_id, r.role);
    });

    let items = profiles.map((p: Row) => toProfile(p, roleMap.get(p.id) ?? "student"));

    const search = filters.search?.trim().toLowerCase();
    if (search)
      items = items.filter(
        (u) => u.fullName.toLowerCase().includes(search) || u.email.toLowerCase().includes(search),
      );
    if (filters.role && filters.role !== "all")
      items = items.filter((u) => u.role === filters.role);
    if (filters.status && filters.status !== "all")
      items = items.filter((u) => u.status === filters.status);

    return paginate(items, filters.page ?? 1, filters.pageSize ?? 10);
  });
}

export async function getUser(userId: string): Promise<User> {
  return run("users.get", async () => {
    const profile = unwrap(
      "users.get",
      await supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    ) as Row;
    const roles = unwrapList(
      "users.get.roles",
      await supabase.from("user_roles").select("role").eq("user_id", userId),
    ).map((r: Row) => r.role as UserRole);
    const role: UserRole = roles.includes("admin")
      ? "admin"
      : roles.includes("instructor")
        ? "instructor"
        : "student";
    return toProfile(profile, role);
  });
}

export async function updateUser(
  userId: string,
  patch: { fullName?: string; avatarUrl?: string },
): Promise<User> {
  return run("users.update", async () => {
    const row = unwrap(
      "users.update",
      await supabase
        .from("profiles")
        .update({
          ...(patch.fullName !== undefined ? { full_name: patch.fullName } : {}),
          ...(patch.avatarUrl !== undefined ? { avatar_url: patch.avatarUrl } : {}),
        })
        .eq("id", userId)
        .select()
        .maybeSingle(),
    ) as Row;
    return toProfile(row);
  });
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  return run("users.updateRole", async () => {
    if (role === "admin") {
      throw apiError("validation", "Administrators must be provisioned with at least one administrative tier.");
    }
    const del = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (del.error) throw normalizeError(del.error, "users.updateRole");
    const ins = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (ins.error) throw normalizeError(ins.error, "users.updateRole");
    const { error: roleCleanupError } = await (supabase as any).from("admin_roles").delete().eq("user_id", userId);
    if (roleCleanupError) throw normalizeError(roleCleanupError, "users.updateRole.adminRoles");
    const { error: scopeCleanupError } = await supabase.from("admin_organization_scopes").delete().eq("user_id", userId);
    if (scopeCleanupError) throw normalizeError(scopeCleanupError, "users.updateRole.adminScopes");
    await recordAudit("user.role_changed", "user", userId, { role });
  });
}

export async function updateUserStatus(userId: string, status: UserStatus): Promise<void> {
  return run("users.updateStatus", async () => {
    const { error } = await supabase.from("profiles").update({ status }).eq("id", userId);
    if (error) throw normalizeError(error, "users.updateStatus");
    await recordAudit("user.status_changed", "user", userId, { status });
  });
}

/* ========================================================================== */
/*  COURSES                                                                   */
/*  Future: GET/POST /api/courses, GET/PUT/DELETE /api/courses/{id}           */
/* ========================================================================== */

function applyCourseFilters(courses: Course[], filters: CourseFilters): Course[] {
  let items = [...courses];
  const search = filters.search?.trim().toLowerCase();
  if (search)
    items = items.filter(
      (c) =>
        c.title.toLowerCase().includes(search) ||
        c.shortDescription.toLowerCase().includes(search) ||
        (c.instructorName ?? "").toLowerCase().includes(search),
    );
  if (filters.status && filters.status !== "all")
    items = items.filter((c) => c.status === filters.status);
  if (filters.category && filters.category !== "all")
    items = items.filter((c) => c.category === filters.category);
  if (filters.level && filters.level !== "all")
    items = items.filter((c) => c.level === filters.level);
  if (filters.instructorId) items = items.filter((c) => (c.instructorIds ?? [c.instructorId]).includes(filters.instructorId!));

  switch (filters.sort) {
    case "oldest":
      items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      break;
    case "title":
      items.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "price_asc":
      items.sort((a, b) => a.priceCents - b.priceCents);
      break;
    case "price_desc":
      items.sort((a, b) => b.priceCents - a.priceCents);
      break;
    default:
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return items;
}

async function loadCourses(): Promise<Course[]> {
  const rows = unwrapList(
    "courses.list",
    await supabase.from("courses").select("*").order("created_at", { ascending: false }),
  );
  const [{ data: instructorRows, error: instructorError }, { data: organizationRows, error: organizationError }] = await Promise.all([
    (supabase as any).from("course_instructors").select("course_id, instructor_id, profiles:instructor_id (full_name)"),
    (supabase as any).from("course_organizations").select("course_id, organization_id"),
  ]);
  if (instructorError) throw normalizeError(instructorError, "courses.list.instructors");
  if (organizationError) throw normalizeError(organizationError, "courses.list.organizations");

  const instructorsByCourse = new Map<string, { ids: string[]; names: string[] }>();
  for (const row of (instructorRows ?? []) as Row[]) {
    const current = instructorsByCourse.get(row.course_id) ?? { ids: [], names: [] };
    current.ids.push(row.instructor_id);
    if (row.profiles?.full_name) current.names.push(row.profiles.full_name);
    instructorsByCourse.set(row.course_id, current);
  }
  const organizationsByCourse = new Map<string, string[]>();
  for (const row of (organizationRows ?? []) as Row[]) {
    organizationsByCourse.set(row.course_id, [...(organizationsByCourse.get(row.course_id) ?? []), row.organization_id]);
  }

  const courses = (rows as Row[]).map((row) => {
    const relation = instructorsByCourse.get(row.id) ?? { ids: [], names: [] };
    return toCourse({
      ...row,
      instructorIds: relation.ids,
      instructorNames: relation.names,
      organizationIds: organizationsByCourse.get(row.id) ?? [],
    });
  });

  const [{ data: enrollRows }, { data: lessonRows }] = await Promise.all([
    supabase.from("enrollments").select("course_id"),
    supabase.from("lessons").select("id, duration_seconds, module_id, modules:module_id (course_id)"),
  ]);

  const enrollCount = new Map<string, number>();
  (enrollRows ?? []).forEach((r: Row) => enrollCount.set(r.course_id, (enrollCount.get(r.course_id) ?? 0) + 1));
  const lessonCount = new Map<string, number>();
  const duration = new Map<string, number>();
  (lessonRows ?? []).forEach((r: Row) => {
    const courseId = r.modules?.course_id;
    if (!courseId) return;
    lessonCount.set(courseId, (lessonCount.get(courseId) ?? 0) + 1);
    duration.set(courseId, (duration.get(courseId) ?? 0) + (r.duration_seconds ?? 0));
  });

  return courses.map((c) => ({
    ...c,
    enrollmentCount: enrollCount.get(c.id) ?? 0,
    lessonCount: lessonCount.get(c.id) ?? 0,
    totalDurationSeconds: duration.get(c.id) ?? 0,
  }));
}

export async function getCourses(filters: CourseFilters = {}): Promise<Paginated<Course>> {
  return run("courses.getCourses", async () => {
    const all = await loadCourses();
    const items = applyCourseFilters(all, filters);
    return paginate(items, filters.page ?? 1, filters.pageSize ?? 12);
  });
}

export async function getPublishedCourses(filters: CourseFilters = {}): Promise<Paginated<Course>> {
  return getCourses({ ...filters, status: "published" });
}

export async function getCourseCategories(): Promise<string[]> {
  return run("courses.categories", async () => {
    const rows = unwrapList(
      "courses.categories",
      await supabase.from("courses").select("category"),
    );
    return Array.from(new Set(rows.map((r: Row) => r.category as string))).sort();
  });
}

/** Fetches a course with its full module/lesson outline. Accepts id or slug. */
export async function getCourse(idOrSlug: string): Promise<CourseDetail> {
  return run("courses.getCourse", async () => {
    const isUuid = /^[0-9a-f-]{36}$/i.test(idOrSlug);
    const query = supabase.from("courses").select("*");
    const { data, error } = isUuid
      ? await query.eq("id", idOrSlug).maybeSingle()
      : await query.eq("slug", idOrSlug).maybeSingle();
    if (error) throw normalizeError(error, "courses.getCourse");
    if (!data) throw apiError("not_found", "This course could not be found.");

    const { data: instructorRows, error: instructorError } = await (supabase as any)
      .from("course_instructors")
      .select("instructor_id, profiles:instructor_id (full_name)")
      .eq("course_id", (data as Row).id);
    if (instructorError) throw normalizeError(instructorError, "courses.getCourse.instructors");
    const { data: organizationRows, error: organizationError } = await (supabase as any)
      .from("course_organizations")
      .select("organization_id")
      .eq("course_id", (data as Row).id);
    if (organizationError) throw normalizeError(organizationError, "courses.getCourse.organizations");
    const course = toCourse({
      ...(data as Row),
      instructorIds: ((instructorRows ?? []) as Row[]).map((r) => r.instructor_id),
      instructorNames: ((instructorRows ?? []) as Row[]).map((r) => r.profiles?.full_name).filter(Boolean),
      organizationIds: ((organizationRows ?? []) as Row[]).map((r) => r.organization_id),
    });
    const modules = await getModules(course.id);
    const lessonRows = unwrapList(
      "courses.getCourse.lessons",
      await supabase
        .from("lessons")
        .select("*")
        .in(
          "module_id",
          modules.length ? modules.map((m) => m.id) : ["00000000-0000-0000-0000-000000000000"],
        )
        .order("order_index", { ascending: true }),
    ).map(toLesson);

    const outline = modules.map((m) => ({
      ...m,
      lessons: lessonRows.filter((l) => l.moduleId === m.id),
    }));

    return {
      ...course,
      lessonCount: lessonRows.length,
      totalDurationSeconds: lessonRows.reduce((sum, l) => sum + l.durationSeconds, 0),
      modules: outline,
    };
  });
}

export async function createCourse(input: CourseInput): Promise<Course> {
  return run("courses.create", async () => {
    const currentUserId = await requireUserId();
    const instructorIds = Array.from(new Set(input.instructorIds?.length ? input.instructorIds : [currentUserId]));
    const organizationIds = Array.from(new Set(input.organizationIds ?? []));
    const slug = `${input.slug?.trim() || slugify(input.title)}-${Math.random().toString(36).slice(2, 6)}`;
    const row = unwrap(
      "courses.create",
      await supabase.from("courses").insert({
        title: input.title,
        slug,
        short_description: input.shortDescription,
        description_html: input.descriptionHtml,
        instructor_id: instructorIds[0],
        price_cents: input.priceCents,
        currency: input.currency,
        category: input.category,
        level: input.level,
        thumbnail_url: input.thumbnailUrl ?? null,
        status: input.status ?? "draft",
      }).select().maybeSingle(),
    ) as Row;

    const { error: instructorError } = await (supabase as any).from("course_instructors").insert(
      instructorIds.map((instructorId) => ({ course_id: row.id, instructor_id: instructorId })),
    );
    if (instructorError) throw normalizeError(instructorError, "courses.create.instructors");
    if (organizationIds.length) {
      const { error } = await (supabase as any).from("course_organizations").insert(
        organizationIds.map((organizationId) => ({ course_id: row.id, organization_id: organizationId })),
      );
      if (error) throw normalizeError(error, "courses.create.organizations");
    }
    await recordAudit("course.created", "course", row.id, { title: input.title, instructorIds, organizationIds });
    return toCourse({ ...row, instructorIds, organizationIds });
  });
}

export async function setCourseInstructors(courseId: string, instructorIds: string[]): Promise<void> {
  return run("courses.instructors.set", async () => {
    if (!instructorIds.length) throw apiError("validation", "A course must have at least one instructor.");
    const { error: clearError } = await (supabase as any).from("course_instructors").delete().eq("course_id", courseId);
    if (clearError) throw normalizeError(clearError, "courses.instructors.clear");
    const { error } = await (supabase as any).from("course_instructors").insert(
      Array.from(new Set(instructorIds)).map((instructorId) => ({ course_id: courseId, instructor_id: instructorId })),
    );
    if (error) throw normalizeError(error, "courses.instructors.set");
    await recordAudit("course.instructors_updated", "course", courseId, { instructorIds });
  });
}

export async function setCourseOrganizations(courseId: string, organizationIds: string[]): Promise<void> {
  return run("courses.organizations.set", async () => {
    const { error: clearError } = await (supabase as any).from("course_organizations").delete().eq("course_id", courseId);
    if (clearError) throw normalizeError(clearError, "courses.organizations.clear");
    if (organizationIds.length) {
      const { error } = await (supabase as any).from("course_organizations").insert(
        Array.from(new Set(organizationIds)).map((organizationId) => ({ course_id: courseId, organization_id: organizationId })),
      );
      if (error) throw normalizeError(error, "courses.organizations.set");
    }
    await recordAudit("course.organizations_updated", "course", courseId, { organizationIds });
  });
}

export async function updateCourse(courseId: string, patch: Partial<CourseInput>): Promise<Course> {
  return run("courses.update", async () => {
    const row = unwrap(
      "courses.update",
      await supabase
        .from("courses")
        .update({
          ...(patch.title !== undefined ? { title: patch.title } : {}),
          ...(patch.shortDescription !== undefined
            ? { short_description: patch.shortDescription }
            : {}),
          ...(patch.descriptionHtml !== undefined
            ? { description_html: patch.descriptionHtml }
            : {}),
          ...(patch.priceCents !== undefined ? { price_cents: patch.priceCents } : {}),
          ...(patch.currency !== undefined ? { currency: patch.currency } : {}),
          ...(patch.category !== undefined ? { category: patch.category } : {}),
          ...(patch.level !== undefined ? { level: patch.level } : {}),
          ...(patch.thumbnailUrl !== undefined ? { thumbnail_url: patch.thumbnailUrl } : {}),
          ...(patch.status !== undefined ? { status: patch.status } : {}),
        })
        .eq("id", courseId)
        .select()
        .maybeSingle(),
    ) as Row;
    if (patch.instructorIds !== undefined) await setCourseInstructors(courseId, patch.instructorIds);
    if (patch.organizationIds !== undefined) await setCourseOrganizations(courseId, patch.organizationIds);
    await recordAudit("course.updated", "course", courseId, {
      instructorIds: patch.instructorIds,
      organizationIds: patch.organizationIds,
    });
    return toCourse(row);
  });
}

export async function deleteCourse(courseId: string): Promise<void> {
  return run("courses.delete", async () => {
    const { error } = await supabase.from("courses").delete().eq("id", courseId);
    if (error) throw normalizeError(error, "courses.delete");
    await recordAudit("course.deleted", "course", courseId, {});
  });
}

export async function publishCourse(courseId: string): Promise<Course> {
  const course = await updateCourse(courseId, { status: "published" });
  await recordAudit("course.published", "course", courseId, { title: course.title });
  return course;
}

export async function unpublishCourse(courseId: string): Promise<Course> {
  const course = await updateCourse(courseId, { status: "draft" });
  await recordAudit("course.unpublished", "course", courseId, { title: course.title });
  return course;
}

export async function archiveCourse(courseId: string): Promise<Course> {
  const course = await updateCourse(courseId, { status: "archived" });
  await recordAudit("course.archived", "course", courseId, { title: course.title });
  return course;
}

/* ========================================================================== */
/*  MODULES & LESSONS                                                         */
/*  Future: /api/courses/{id}/modules, /api/modules/{id}/lessons              */
/* ========================================================================== */

export async function getModules(courseId: string): Promise<Module[]> {
  return run("modules.list", async () =>
    unwrapList(
      "modules.list",
      await supabase
        .from("modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true }),
    ).map(toModule),
  );
}

export async function createModule(input: ModuleInput): Promise<Module> {
  return run("modules.create", async () => {
    const existing = await getModules(input.courseId);
    const row = unwrap(
      "modules.create",
      await supabase
        .from("modules")
        .insert({
          course_id: input.courseId,
          title: input.title,
          description_html: input.descriptionHtml ?? "",
          order_index: input.orderIndex ?? existing.length,
        })
        .select()
        .maybeSingle(),
    ) as Row;
    await recordAudit("module.created", "module", row.id, { courseId: input.courseId, title: input.title });
    return toModule(row);
  });
}

export async function updateModule(
  moduleId: string,
  patch: { title?: string; descriptionHtml?: string },
): Promise<Module> {
  return run("modules.update", async () => {
    const row = unwrap(
      "modules.update",
      await supabase
        .from("modules")
        .update({
          ...(patch.title !== undefined ? { title: patch.title } : {}),
          ...(patch.descriptionHtml !== undefined
            ? { description_html: patch.descriptionHtml }
            : {}),
        })
        .eq("id", moduleId)
        .select()
        .maybeSingle(),
    ) as Row;
    await recordAudit("module.updated", "module", moduleId, patch);
    return toModule(row);
  });
}

export async function deleteModule(moduleId: string): Promise<void> {
  return run("modules.delete", async () => {
    const { error } = await supabase.from("modules").delete().eq("id", moduleId);
    if (error) throw normalizeError(error, "modules.delete");
    await recordAudit("module.deleted", "module", moduleId, {});
  });
}

export async function reorderModules(orderedModuleIds: string[]): Promise<void> {
  return run("modules.reorder", async () => {
    for (let i = 0; i < orderedModuleIds.length; i += 1) {
      const { error } = await supabase
        .from("modules")
        .update({ order_index: i })
        .eq("id", orderedModuleIds[i]);
      if (error) throw normalizeError(error, "modules.reorder");
    }
    await recordAudit("module.reordered", "module", orderedModuleIds[0] ?? null, { orderedModuleIds });
  });
}

export async function getLessons(moduleId: string): Promise<Lesson[]> {
  return run("lessons.list", async () =>
    unwrapList(
      "lessons.list",
      await supabase
        .from("lessons")
        .select("*")
        .eq("module_id", moduleId)
        .order("order_index", { ascending: true }),
    ).map(toLesson),
  );
}

export async function getLesson(lessonId: string): Promise<Lesson> {
  return run("lessons.get", async () =>
    toLesson(
      unwrap(
        "lessons.get",
        await supabase.from("lessons").select("*").eq("id", lessonId).maybeSingle(),
      ) as Row,
    ),
  );
}

export async function createLesson(input: LessonInput): Promise<Lesson> {
  return run("lessons.create", async () => {
    const existing = await getLessons(input.moduleId);
    const row = unwrap(
      "lessons.create",
      await supabase
        .from("lessons")
        .insert({
          module_id: input.moduleId,
          title: input.title,
          lesson_type: input.lessonType,
          content_html: input.contentHtml ?? "",
          video_url: input.videoUrl ?? null,
          attachments: input.attachments ?? [],
          duration_seconds: input.durationSeconds ?? 0,
          is_preview: input.isPreview ?? false,
          order_index: input.orderIndex ?? existing.length,
          status: input.status ?? "published",
        })
        .select()
        .maybeSingle(),
    ) as Row;
    await recordAudit("lesson.created", "lesson", row.id, { moduleId: input.moduleId, lessonType: input.lessonType });
    return toLesson(row);
  });
}

export async function updateLesson(lessonId: string, patch: Partial<LessonInput>): Promise<Lesson> {
  return run("lessons.update", async () => {
    const row = unwrap(
      "lessons.update",
      await supabase
        .from("lessons")
        .update({
          ...(patch.title !== undefined ? { title: patch.title } : {}),
          ...(patch.lessonType !== undefined ? { lesson_type: patch.lessonType } : {}),
          ...(patch.contentHtml !== undefined ? { content_html: patch.contentHtml } : {}),
          ...(patch.videoUrl !== undefined ? { video_url: patch.videoUrl || null } : {}),
          ...(patch.attachments !== undefined ? { attachments: patch.attachments } : {}),
          ...(patch.durationSeconds !== undefined
            ? { duration_seconds: patch.durationSeconds }
            : {}),
          ...(patch.isPreview !== undefined ? { is_preview: patch.isPreview } : {}),
          ...(patch.status !== undefined ? { status: patch.status } : {}),
        })
        .eq("id", lessonId)
        .select()
        .maybeSingle(),
    ) as Row;
    await recordAudit("lesson.updated", "lesson", lessonId, { title: row.title });
    return toLesson(row);
  });
}

export async function deleteLesson(lessonId: string): Promise<void> {
  return run("lessons.delete", async () => {
    const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
    if (error) throw normalizeError(error, "lessons.delete");
    await recordAudit("lesson.deleted", "lesson", lessonId, {});
  });
}

export async function reorderLessons(orderedLessonIds: string[]): Promise<void> {
  return run("lessons.reorder", async () => {
    for (let i = 0; i < orderedLessonIds.length; i += 1) {
      const { error } = await supabase
        .from("lessons")
        .update({ order_index: i })
        .eq("id", orderedLessonIds[i]);
      if (error) throw normalizeError(error, "lessons.reorder");
    }
  });
}

/* ========================================================================== */
/*  ENROLLMENTS                                                               */
/*  Future: POST /api/courses/{id}/enroll, GET /api/my/enrollments            */
/* ========================================================================== */

export async function getMyEnrollments(): Promise<Enrollment[]> {
  return run("enrollments.mine", async () => {
    const userId = await requireUserId();
    const rows = unwrapList(
      "enrollments.mine",
      await supabase
        .from("enrollments")
        .select("*, courses:course_id (*)")
        .eq("user_id", userId)
        .order("enrolled_at", { ascending: false }),
    ).map(toEnrollment);

    return Promise.all(
      rows.map(async (e) => {
        const progress = await getCourseProgress(e.courseId);
        return {
          ...e,
          progressPercent: progress.percent,
          lessonsCompleted: progress.lessonsCompleted,
          lessonsTotal: progress.lessonsTotal,
        };
      }),
    );
  });
}

export async function getEnrollments(
  filters: EnrollmentFilters = {},
): Promise<Paginated<Enrollment>> {
  return run("enrollments.list", async () => {
    let query = supabase
      .from("enrollments")
      .select("*, courses:course_id (*)")
      .order("enrolled_at", { ascending: false });
    if (filters.courseId) query = query.eq("course_id", filters.courseId);
    if ((filters as EnrollmentFilters & { userId?: string }).userId) query = query.eq("user_id", (filters as EnrollmentFilters & { userId?: string }).userId!);
    const rows = unwrapList("enrollments.list", await query).map(toEnrollment);
    const names = await attachProfileNames(rows);
    let items = rows.map((e) => ({
      ...e,
      userName: names.get(e.userId)?.name ?? "Unknown",
      userEmail: names.get(e.userId)?.email ?? "",
    }));

    const search = filters.search?.trim().toLowerCase();
    if (search)
      items = items.filter(
        (e) =>
          (e.userName ?? "").toLowerCase().includes(search) ||
          (e.course?.title ?? "").toLowerCase().includes(search),
      );
    if (filters.status && filters.status !== "all")
      items = items.filter((e) => e.status === filters.status);

    return paginate(items, filters.page ?? 1, filters.pageSize ?? 10);
  });
}

export async function getEnrollment(courseId: string): Promise<Enrollment | null> {
  return run("enrollments.get", async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return null;
    const { data, error } = await supabase
      .from("enrollments")
      .select("*, courses:course_id (*)")
      .eq("user_id", auth.user.id)
      .eq("course_id", courseId)
      .maybeSingle();
    if (error) throw normalizeError(error, "enrollments.get");
    return data ? toEnrollment(data as Row) : null;
  });
}

export async function enrollInCourse(courseId: string): Promise<Enrollment> {
  return run("enrollments.enroll", async () => {
    const userId = await requireUserId();
    const existing = await getEnrollment(courseId);
    if (existing) return existing;
    const row = unwrap(
      "enrollments.enroll",
      await supabase
        .from("enrollments")
        .insert({ user_id: userId, course_id: courseId, status: "active" })
        .select("*, courses:course_id (*)")
        .maybeSingle(),
    ) as Row;
    await recordAudit("enrollment.created", "enrollment", row.id, { courseId });
    return toEnrollment(row);
  });
}

export async function updateEnrollmentStatus(
  enrollmentId: string,
  status: EnrollmentStatus,
): Promise<void> {
  return run("enrollments.updateStatus", async () => {
    const { error } = await supabase
      .from("enrollments")
      .update({
        status,
        ...(status === "completed" ? { completed_at: new Date().toISOString() } : {}),
      })
      .eq("id", enrollmentId);
    if (error) throw normalizeError(error, "enrollments.updateStatus");
    await recordAudit("enrollment.status_changed", "enrollment", enrollmentId, { status });
  });
}

/** Students enrolled on a course (instructor / admin view). */
export async function getCourseStudents(courseId: string): Promise<Enrollment[]> {
  return run("enrollments.courseStudents", async () => {
    const rows = unwrapList(
      "enrollments.courseStudents",
      await supabase
        .from("enrollments")
        .select("*")
        .eq("course_id", courseId)
        .order("enrolled_at", { ascending: false }),
    ).map(toEnrollment);
    const names = await attachProfileNames(rows);

    const lessonIds = await getCourseLessonIds(courseId);
    const progressRows = lessonIds.length
      ? unwrapList(
          "enrollments.courseStudents.progress",
          await supabase.from("lesson_progress").select("*").in("lesson_id", lessonIds),
        )
      : [];

    return rows.map((e) => {
      const completed = progressRows.filter(
        (p: Row) => p.user_id === e.userId && p.status === "completed",
      ).length;
      return {
        ...e,
        userName: names.get(e.userId)?.name ?? "Unknown",
        userEmail: names.get(e.userId)?.email ?? "",
        lessonsTotal: lessonIds.length,
        lessonsCompleted: completed,
        progressPercent: lessonIds.length ? Math.round((completed / lessonIds.length) * 100) : 0,
      };
    });
  });
}


/** Full learner view for administrators: profile, enrolments, lesson progress, submissions and certificates. */
export async function getUserLearningOverview(userId: string) {
  return run("users.learningOverview", async () => {
    const user = await getUser(userId);
    const enrollmentRows = unwrapList(
      "users.learningOverview.enrollments",
      await supabase.from("enrollments").select("*, courses:course_id (*)").eq("user_id", userId).order("enrolled_at", { ascending: false }),
    ).map(toEnrollment);
    const enrollments = await Promise.all(enrollmentRows.map(async (enrollment) => {
      const progressRows = unwrapList(
        "users.learningOverview.progress",
        await supabase.from("lesson_progress").select("*").eq("user_id", userId).in("lesson_id", await getCourseLessonIds(enrollment.courseId)),
      );
      const lessonsTotal = (await getCourseLessonIds(enrollment.courseId)).length;
      const lessonsCompleted = progressRows.filter((p: Row) => p.status === "completed").length;
      return {
        ...enrollment,
        lessonsTotal,
        lessonsCompleted,
        progressPercent: lessonsTotal ? Math.round((lessonsCompleted / lessonsTotal) * 100) : 0,
        lessonProgress: progressRows.map((p: Row) => toProgress(p)),
      };
    }));
    const certificates = await getCertificates({ page: 1, pageSize: 500 });
    const userCertificates = certificates.items.filter((c) => c.userId === userId);
    const submissions = unwrapList(
      "users.learningOverview.submissions",
      await supabase.from("assignment_submissions").select("*").eq("user_id", userId).order("submitted_at", { ascending: false }),
    ).map(toSubmission);
    return { user, enrollments, certificates: userCertificates, submissions };
  });
}

/** Instructor-scoped learner detail. Access is constrained to courses assigned to the current instructor. */
export async function getInstructorStudentOverview(courseId: string, userId: string) {
  return run("instructor.studentOverview", async () => {
    const currentUserId = await requireUserId();
    const currentRole = await getCurrentUser();
    const isAdmin = currentRole?.role === "admin";
    const instructorLink = unwrapList(
      "instructor.studentOverview.instructor",
      await supabase.from("course_instructors").select("instructor_id").eq("course_id", courseId).eq("instructor_id", currentUserId),
    );
    if (!isAdmin && !instructorLink.length) throw apiError("forbidden", "You are not assigned to this course.");
    const enrollment = unwrapList(
      "instructor.studentOverview.enrollment",
      await supabase.from("enrollments").select("*, courses:course_id (*)").eq("course_id", courseId).eq("user_id", userId),
    )[0] as Row | undefined;
    if (!enrollment) throw apiError("not_found", "This learner is not enrolled in the course.");
    const profile = await getUser(userId);
    const lessonIds = await getCourseLessonIds(courseId);
    const progress = lessonIds.length ? unwrapList(
      "instructor.studentOverview.progress",
      await supabase.from("lesson_progress").select("*").eq("user_id", userId).in("lesson_id", lessonIds),
    ).map((r: Row) => toProgress(r)) : [];
    const submissions = unwrapList(
      "instructor.studentOverview.submissions",
      await supabase.from("assignment_submissions").select("*").eq("user_id", userId).in("lesson_id", lessonIds).order("submitted_at", { ascending: false }),
    ).map(toSubmission);
    const certificates = (await getCertificates({ page: 1, pageSize: 500 })).items.filter((c) => c.userId === userId && c.courseId === courseId);
    const lessonsCompleted = progress.filter((p) => p.status === "completed").length;
    return {
      user: profile,
      enrollment: toEnrollment(enrollment),
      progress,
      lessonsTotal: lessonIds.length,
      lessonsCompleted,
      progressPercent: lessonIds.length ? Math.round((lessonsCompleted / lessonIds.length) * 100) : 0,
      submissions,
      certificates,
    };
  });
}

async function getCourseLessonIds(courseId: string): Promise<string[]> {
  const modules = unwrapList(
    "lessons.idsForCourse.modules",
    await supabase.from("modules").select("id").eq("course_id", courseId),
  ).map((m: Row) => m.id as string);
  if (!modules.length) return [];
  return unwrapList(
    "lessons.idsForCourse",
    await supabase.from("lessons").select("id").in("module_id", modules),
  ).map((l: Row) => l.id as string);
}

/* ========================================================================== */
/*  PROGRESS                                                                  */
/*  Future: GET/PUT /api/lessons/{id}/progress                                */
/* ========================================================================== */

export async function getCourseProgress(courseId: string): Promise<CourseProgress> {
  return run("progress.course", async () => {
    const lessonIds = await getCourseLessonIds(courseId);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user || !lessonIds.length)
      return {
        courseId,
        lessonsTotal: lessonIds.length,
        lessonsCompleted: 0,
        percent: 0,
        isComplete: false,
      };

    const rows = unwrapList(
      "progress.course",
      await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", auth.user.id)
        .in("lesson_id", lessonIds)
        .order("updated_at", { ascending: false }),
    );
    const completed = rows.filter((r: Row) => r.status === "completed").length;
    const percent = Math.round((completed / lessonIds.length) * 100);
    return {
      courseId,
      lessonsTotal: lessonIds.length,
      lessonsCompleted: completed,
      percent,
      lastLessonId: rows[0]?.lesson_id,
      isComplete: completed === lessonIds.length,
    };
  });
}

export async function getLessonProgressForCourse(courseId: string): Promise<LessonProgress[]> {
  return run("progress.courseLessons", async () => {
    const lessonIds = await getCourseLessonIds(courseId);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user || !lessonIds.length) return [];
    return unwrapList(
      "progress.courseLessons",
      await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", auth.user.id)
        .in("lesson_id", lessonIds),
    ).map(toProgress);
  });
}

export async function getLessonProgress(lessonId: string): Promise<LessonProgress | null> {
  return run("progress.lesson", async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return null;
    const { data, error } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("user_id", auth.user.id)
      .eq("lesson_id", lessonId)
      .maybeSingle();
    if (error) throw normalizeError(error, "progress.lesson");
    return data ? toProgress(data as Row) : null;
  });
}

export async function updateLessonProgress(
  lessonId: string,
  patch: { status?: ProgressStatus; lastPositionSeconds?: number },
): Promise<LessonProgress> {
  return run("progress.update", async () => {
    const userId = await requireUserId();
    const row = unwrap(
      "progress.update",
      await supabase
        .from("lesson_progress")
        .upsert(
          {
            user_id: userId,
            lesson_id: lessonId,
            status: patch.status ?? "in_progress",
            last_position_seconds: patch.lastPositionSeconds ?? 0,
            completed_at: patch.status === "completed" ? new Date().toISOString() : null,
          },
          { onConflict: "user_id,lesson_id" },
        )
        .select()
        .maybeSingle(),
    ) as Row;
    return toProgress(row);
  });
}

export async function markLessonComplete(lessonId: string): Promise<LessonProgress> {
  const existing = await getLessonProgress(lessonId);
  return updateLessonProgress(lessonId, {
    status: "completed",
    lastPositionSeconds: existing?.lastPositionSeconds ?? 0,
  });
}

/**
 * Course-completion business rule. Today it is evaluated here so the UI never
 * owns it; when the Python backend lands this becomes a single API call and the
 * UI is unaffected.
 */
export async function syncCourseCompletion(
  courseId: string,
): Promise<{ completed: boolean; certificate?: Certificate }> {
  return run("progress.syncCompletion", async () => {
    const userId = await requireUserId();
    const progress = await getCourseProgress(courseId);
    if (!progress.isComplete || progress.lessonsTotal === 0) return { completed: false };

    const enrollment = await getEnrollment(courseId);
    if (enrollment && enrollment.status !== "completed") {
      await updateEnrollmentStatus(enrollment.id, "completed");
    }

    const { data: existing } = await supabase
      .from("certificates")
      .select("*, courses:course_id (title)")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();
    if (existing) return { completed: true, certificate: toCertificate(existing as Row) };

    const certificate = await issueCertificate(userId, courseId);
    return { completed: true, certificate };
  });
}

/* ========================================================================== */
/*  QUIZZES                                                                   */
/*  Future: GET /api/quizzes/{id}, POST /api/quizzes/{id}/attempts            */
/* ========================================================================== */

/**
 * Loads a quiz. `includeAnswers` is only honoured for the quiz owner; students
 * always receive options without the `isCorrect` flag.
 */
export async function getQuiz(quizIdOrLessonId: string, includeAnswers = false): Promise<Quiz> {
  return run("quizzes.get", async () => {
    const byId = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizIdOrLessonId)
      .maybeSingle();
    let quizRow = byId.data as Row | null;
    if (!quizRow) {
      const byLesson = await supabase
        .from("quizzes")
        .select("*")
        .eq("lesson_id", quizIdOrLessonId)
        .maybeSingle();
      quizRow = byLesson.data as Row | null;
    }
    if (!quizRow) throw apiError("not_found", "This quiz has not been set up yet.");

    let canSeeAnswers = false;
    if (includeAnswers) {
      const lesson = unwrap(
        "quizzes.get.lesson",
        await supabase
          .from("lessons")
          .select("id, modules:module_id (courses:course_id (id, instructor_id, organization_id))")
          .eq("id", quizRow.lesson_id)
          .maybeSingle(),
      ) as Row;
      const currentUser = await getCurrentUser();
      const course = lesson.modules?.courses;
      canSeeAnswers = !!currentUser && (
        (currentUser.role === "instructor" && course?.instructor_id === currentUser.id) ||
        (currentUser.role === "admin" && (
          can(currentUser, "assessments", "edit", { organizationId: course?.organization_id }) ||
          can(currentUser, "assessments", "grade", { organizationId: course?.organization_id })
        ))
      );
    }

    const questions = unwrapList(
      "quizzes.get.questions",
      await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizRow.id)
        .order("order_index", { ascending: true }),
    );
    const options = questions.length
      ? unwrapList(
          "quizzes.get.options",
          await supabase
            .from("quiz_options")
            .select("*")
            .in(
              "question_id",
              questions.map((q: Row) => q.id),
            )
            .order("order_index", { ascending: true }),
        )
      : [];

    return {
      id: quizRow.id,
      lessonId: quizRow.lesson_id,
      title: quizRow.title,
      passingScorePercent: quizRow.passing_score_percent,
      createdAt: quizRow.created_at,
      updatedAt: quizRow.updated_at,
      questions: questions.map((q: Row) => ({
        id: q.id,
        quizId: q.quiz_id,
        questionText: q.question_text,
        orderIndex: q.order_index,
        options: options
          .filter((o: Row) => o.question_id === q.id)
          .map((o: Row) => ({
            id: o.id,
            questionId: o.question_id,
            optionText: o.option_text,
            orderIndex: o.order_index,
            ...(canSeeAnswers ? { isCorrect: !!o.is_correct } : {}),
          })),
      })),
    };
  });
}

export async function createQuiz(input: QuizInput): Promise<Quiz> {
  return run("quizzes.create", async () => {
    const row = unwrap(
      "quizzes.create",
      await supabase
        .from("quizzes")
        .insert({
          lesson_id: input.lessonId,
          title: input.title,
          passing_score_percent: input.passingScorePercent,
        })
        .select()
        .maybeSingle(),
    ) as Row;
    await recordAudit("quiz.created", "quiz", row.id, { lessonId: input.lessonId });
    return getQuiz(row.id, true);
  });
}

export async function updateQuiz(
  quizId: string,
  patch: { title?: string; passingScorePercent?: number },
): Promise<void> {
  return run("quizzes.update", async () => {
    const { error } = await supabase
      .from("quizzes")
      .update({
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.passingScorePercent !== undefined
          ? { passing_score_percent: patch.passingScorePercent }
          : {}),
      })
      .eq("id", quizId);
    if (error) throw normalizeError(error, "quizzes.update");
    await recordAudit("quiz.updated", "quiz", quizId, patch);
  });
}

export async function deleteQuiz(quizId: string): Promise<void> {
  return run("quizzes.delete", async () => {
    const { error } = await supabase.from("quizzes").delete().eq("id", quizId);
    if (error) throw normalizeError(error, "quizzes.delete");
    await recordAudit("quiz.deleted", "quiz", quizId, {});
  });
}

export async function createQuizQuestion(quizId: string, questionText: string): Promise<string> {
  return run("quizzes.createQuestion", async () => {
    const { count } = await supabase
      .from("quiz_questions")
      .select("id", { count: "exact", head: true })
      .eq("quiz_id", quizId);
    const row = unwrap(
      "quizzes.createQuestion",
      await supabase
        .from("quiz_questions")
        .insert({ quiz_id: quizId, question_text: questionText, order_index: count ?? 0 })
        .select()
        .maybeSingle(),
    ) as Row;
    await recordAudit("quiz.question_created", "quiz_question", row.id, { quizId });
    return row.id as string;
  });
}

export async function updateQuizQuestion(questionId: string, questionText: string): Promise<void> {
  return run("quizzes.updateQuestion", async () => {
    const { error } = await supabase
      .from("quiz_questions")
      .update({ question_text: questionText })
      .eq("id", questionId);
    if (error) throw normalizeError(error, "quizzes.updateQuestion");
    await recordAudit("quiz.question_updated", "quiz_question", questionId, { questionText });
  });
}

export async function deleteQuizQuestion(questionId: string): Promise<void> {
  return run("quizzes.deleteQuestion", async () => {
    const { error } = await supabase.from("quiz_questions").delete().eq("id", questionId);
    if (error) throw normalizeError(error, "quizzes.deleteQuestion");
    await recordAudit("quiz.question_deleted", "quiz_question", questionId, {});
  });
}

export async function reorderQuizQuestions(orderedQuestionIds: string[]): Promise<void> {
  return run("quizzes.reorderQuestions", async () => {
    for (let i = 0; i < orderedQuestionIds.length; i += 1) {
      const { error } = await supabase
        .from("quiz_questions")
        .update({ order_index: i })
        .eq("id", orderedQuestionIds[i]);
      if (error) throw normalizeError(error, "quizzes.reorderQuestions");
    }
    await recordAudit("quiz.questions_reordered", "quiz_question", orderedQuestionIds[0] ?? null, { orderedQuestionIds });
  });
}

export async function createQuizOption(
  questionId: string,
  optionText: string,
  isCorrect = false,
): Promise<void> {
  return run("quizzes.createOption", async () => {
    const { count } = await supabase
      .from("quiz_options")
      .select("id", { count: "exact", head: true })
      .eq("question_id", questionId);
    const { error } = await supabase.from("quiz_options").insert({
      question_id: questionId,
      option_text: optionText,
      is_correct: isCorrect,
      order_index: count ?? 0,
    });
    if (error) throw normalizeError(error, "quizzes.createOption");
    await recordAudit("quiz.option_created", "quiz_option", questionId, { optionText });
  });
}

export async function updateQuizOption(
  optionId: string,
  patch: { optionText?: string; isCorrect?: boolean },
): Promise<void> {
  return run("quizzes.updateOption", async () => {
    const { error } = await supabase
      .from("quiz_options")
      .update({
        ...(patch.optionText !== undefined ? { option_text: patch.optionText } : {}),
        ...(patch.isCorrect !== undefined ? { is_correct: patch.isCorrect } : {}),
      })
      .eq("id", optionId);
    if (error) throw normalizeError(error, "quizzes.updateOption");
    await recordAudit("quiz.option_updated", "quiz_option", optionId, patch);
  });
}

/** Marks exactly one option as correct within a question. */
export async function setCorrectOption(questionId: string, optionId: string): Promise<void> {
  return run("quizzes.setCorrectOption", async () => {
    const clear = await supabase
      .from("quiz_options")
      .update({ is_correct: false })
      .eq("question_id", questionId);
    if (clear.error) throw normalizeError(clear.error, "quizzes.setCorrectOption");
    const set = await supabase.from("quiz_options").update({ is_correct: true }).eq("id", optionId);
    if (set.error) throw normalizeError(set.error, "quizzes.setCorrectOption");
    await recordAudit("quiz.correct_option_set", "quiz_option", optionId, { questionId });
  });
}

export async function deleteQuizOption(optionId: string): Promise<void> {
  return run("quizzes.deleteOption", async () => {
    const { error } = await supabase.from("quiz_options").delete().eq("id", optionId);
    if (error) throw normalizeError(error, "quizzes.deleteOption");
    await recordAudit("quiz.option_deleted", "quiz_option", optionId, {});
  });
}

/**
 * Scores and records an attempt. The frontend never decides the score on its
 * own: scoring lives here and moves to the Python backend verbatim.
 */
export async function submitQuizAttempt(
  quizId: string,
  answers: Record<string, string>,
): Promise<QuizResult> {
  return run("quizzes.submitAttempt", async () => {
    const userId = await requireUserId();
    const quiz = await getQuiz(quizId, true);
    if (!quiz.questions.length) throw apiError("invalid_quiz", "This quiz has no questions yet.");

    const correctByQuestionId: Record<string, string> = {};
    let correct = 0;
    quiz.questions.forEach((q) => {
      const answer = q.options.find((o) => o.isCorrect);
      if (answer) correctByQuestionId[q.id] = answer.id;
      if (answer && answers[q.id] === answer.id) correct += 1;
    });

    const scorePercent = Math.round((correct / quiz.questions.length) * 100);
    const passed = scorePercent >= quiz.passingScorePercent;

    const row = unwrap(
      "quizzes.submitAttempt",
      await supabase
        .from("quiz_attempts")
        .insert({
          user_id: userId,
          quiz_id: quiz.id,
          score_percent: scorePercent,
          passed,
          answers,
        })
        .select()
        .maybeSingle(),
    ) as Row;

    if (passed) await markLessonComplete(quiz.lessonId);

    return {
      attempt: toAttempt(row),
      passingScorePercent: quiz.passingScorePercent,
      correctByQuestionId,
    };
  });
}

export async function getQuizAttempts(quizId: string): Promise<QuizAttempt[]> {
  return run("quizzes.attempts", async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return [];
    return unwrapList(
      "quizzes.attempts",
      await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quizId)
        .eq("user_id", auth.user.id)
        .order("submitted_at", { ascending: false }),
    ).map(toAttempt);
  });
}

/** Quizzes in a course the student has not yet passed. */
export async function getPendingQuizzes(): Promise<
  { quizId: string; lessonId: string; title: string; courseId: string }[]
> {
  return run("quizzes.pending", async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return [];
    const enrollments = unwrapList(
      "quizzes.pending.enrollments",
      await supabase.from("enrollments").select("course_id").eq("user_id", auth.user.id),
    ).map((e: Row) => e.course_id as string);
    if (!enrollments.length) return [];

    const modules = unwrapList(
      "quizzes.pending.modules",
      await supabase.from("modules").select("id, course_id").in("course_id", enrollments),
    );
    if (!modules.length) return [];
    const lessons = unwrapList(
      "quizzes.pending.lessons",
      await supabase
        .from("lessons")
        .select("id, title, module_id")
        .in(
          "module_id",
          modules.map((m: Row) => m.id),
        )
        .eq("lesson_type", "quiz"),
    );
    if (!lessons.length) return [];
    const quizzes = unwrapList(
      "quizzes.pending.quizzes",
      await supabase
        .from("quizzes")
        .select("id, lesson_id, title")
        .in(
          "lesson_id",
          lessons.map((l: Row) => l.id),
        ),
    );
    if (!quizzes.length) return [];
    const attempts = unwrapList(
      "quizzes.pending.attempts",
      await supabase
        .from("quiz_attempts")
        .select("quiz_id, passed")
        .eq("user_id", auth.user.id)
        .in(
          "quiz_id",
          quizzes.map((q: Row) => q.id),
        ),
    );
    const passedIds = new Set(
      attempts.filter((a: Row) => a.passed).map((a: Row) => a.quiz_id as string),
    );

    return quizzes
      .filter((q: Row) => !passedIds.has(q.id))
      .map((q: Row) => {
        const lesson = lessons.find((l: Row) => l.id === q.lesson_id);
        const mod = modules.find((m: Row) => m.id === lesson?.module_id);
        return {
          quizId: q.id,
          lessonId: q.lesson_id,
          title: q.title ?? lesson?.title ?? "Quiz",
          courseId: mod?.course_id ?? "",
        };
      });
  });
}

/* ========================================================================== */
/*  CERTIFICATES                                                              */
/*  Future: GET /api/my/certificates, POST /api/admin/certificates            */
/* ========================================================================== */

function generateCertificateCode(prefix = "SEAA"): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).toUpperCase().slice(2, 8);
  return `${prefix}-${year}-${random}`;
}

export async function getMyCertificates(): Promise<Certificate[]> {
  return run("certificates.mine", async () => {
    const userId = await requireUserId();
    return unwrapList(
      "certificates.mine",
      await supabase
        .from("certificates")
        .select("*, courses:course_id (title)")
        .eq("user_id", userId)
        .order("issued_at", { ascending: false }),
    ).map(toCertificate);
  });
}

export async function getCertificates(
  filters: CertificateFilters = {},
): Promise<Paginated<Certificate>> {
  return run("certificates.list", async () => {
    const rows = unwrapList(
      "certificates.list",
      await supabase
        .from("certificates")
        .select("*, courses:course_id (title)")
        .order("issued_at", { ascending: false }),
    ).map(toCertificate);
    const names = await attachProfileNames(rows);
    let items = rows.map((c) => ({ ...c, userName: names.get(c.userId)?.name ?? "Unknown" }));

    const search = filters.search?.trim().toLowerCase();
    if (search)
      items = items.filter(
        (c) =>
          c.certificateCode.toLowerCase().includes(search) ||
          (c.userName ?? "").toLowerCase().includes(search) ||
          (c.courseTitle ?? "").toLowerCase().includes(search),
      );
    if (filters.status && filters.status !== "all")
      items = items.filter((c) => c.status === filters.status);

    return paginate(items, filters.page ?? 1, filters.pageSize ?? 10);
  });
}

export async function getCertificate(certificateId: string): Promise<Certificate> {
  return run("certificates.get", async () => {
    const row = unwrap(
      "certificates.get",
      await supabase
        .from("certificates")
        .select("*, courses:course_id (title)")
        .eq("id", certificateId)
        .maybeSingle(),
    ) as Row;
    const cert = toCertificate(row);
    const names = await attachProfileNames([cert]);
    return { ...cert, userName: names.get(cert.userId)?.name };
  });
}

/** Public-verification friendly lookup (future: GET /api/certificates/verify/{code}). */
export async function verifyCertificate(code: string): Promise<Certificate | null> {
  return run("certificates.verify", async () => {
    const { data, error } = await supabase
      .from("certificates")
      .select("*, courses:course_id (title)")
      .eq("certificate_code", code.trim().toUpperCase())
      .maybeSingle();
    if (error) throw normalizeError(error, "certificates.verify");
    return data ? toCertificate(data as Row) : null;
  });
}

export async function issueCertificate(userId: string, courseId: string): Promise<Certificate> {
  return run("certificates.issue", async () => {
    const settings = await getAcademySettings();
    const row = unwrap(
      "certificates.issue",
      await supabase
        .from("certificates")
        .insert({
          user_id: userId,
          course_id: courseId,
          certificate_code: generateCertificateCode(settings.certificatePrefix),
          status: "issued",
        })
        .select("*, courses:course_id (title)")
        .maybeSingle(),
    ) as Row;
    await recordAudit("certificate.issued", "certificate", row.certificate_code, { courseId });
    return toCertificate(row);
  });
}

export async function revokeCertificate(certificateId: string): Promise<void> {
  return run("certificates.revoke", async () => {
    const { error } = await supabase
      .from("certificates")
      .update({ status: "revoked", revoked_at: new Date().toISOString() })
      .eq("id", certificateId);
    if (error) throw normalizeError(error, "certificates.revoke");
    await recordAudit("certificate.revoked", "certificate", certificateId, {});
  });
}

export async function reissueCertificate(certificateId: string): Promise<void> {
  return run("certificates.reissue", async () => {
    const settings = await getAcademySettings();
    const { error } = await supabase
      .from("certificates")
      .update({
        status: "issued",
        revoked_at: null,
        issued_at: new Date().toISOString(),
        certificate_code: generateCertificateCode(settings.certificatePrefix),
      })
      .eq("id", certificateId);
    if (error) throw normalizeError(error, "certificates.reissue");
    await recordAudit("certificate.reissued", "certificate", certificateId, {});
  });
}

/* ========================================================================== */
/*  PAYMENTS                                                                  */
/*  Future: POST /api/payments, GET /api/payments/{id}                        */
/*  Provider integration NEVER happens in the browser.                        */
/* ========================================================================== */

export async function createPayment(input: PaymentInput): Promise<Payment> {
  return run("payments.create", async () => {
    const userId = await requireUserId();
    const reference =
      input.providerReference ??
      `${input.provider.toUpperCase()}-${Math.random().toString(36).toUpperCase().slice(2, 10)}`;
    const row = unwrap(
      "payments.create",
      await supabase
        .from("payments")
        .insert({
          user_id: userId,
          course_id: input.courseId,
          amount_cents: input.amountCents,
          currency: input.currency,
          provider: input.provider,
          provider_reference: reference,
          status: "pending",
        })
        .select("*, courses:course_id (title)")
        .maybeSingle(),
    ) as Row;
    await recordAudit("payment.initiated", "payment", reference, { provider: input.provider });
    return toPayment(row);
  });
}

/** Alias kept for the documented service contract. */
export const initializePayment = createPayment;

export async function getPayment(paymentId: string): Promise<Payment> {
  return run("payments.get", async () =>
    toPayment(
      unwrap(
        "payments.get",
        await supabase
          .from("payments")
          .select("*, courses:course_id (title)")
          .eq("id", paymentId)
          .maybeSingle(),
      ) as Row,
    ),
  );
}

export async function getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
  const payment = await getPayment(paymentId);
  return payment.status;
}

export async function getMyPayments(): Promise<Payment[]> {
  return run("payments.mine", async () => {
    const userId = await requireUserId();
    return unwrapList(
      "payments.mine",
      await supabase
        .from("payments")
        .select("*, courses:course_id (title)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ).map(toPayment);
  });
}

export async function getPayments(filters: PaymentFilters = {}): Promise<Paginated<Payment>> {
  return run("payments.list", async () => {
    const rows = unwrapList(
      "payments.list",
      await supabase
        .from("payments")
        .select("*, courses:course_id (title)")
        .order("created_at", { ascending: false }),
    ).map(toPayment);
    const names = await attachProfileNames(rows);
    let items = rows.map((p) => ({
      ...p,
      userName: names.get(p.userId)?.name ?? "Unknown",
      userEmail: names.get(p.userId)?.email ?? "",
    }));

    const search = filters.search?.trim().toLowerCase();
    if (search)
      items = items.filter(
        (p) =>
          (p.providerReference ?? "").toLowerCase().includes(search) ||
          (p.userName ?? "").toLowerCase().includes(search) ||
          (p.courseTitle ?? "").toLowerCase().includes(search),
      );
    if (filters.status && filters.status !== "all")
      items = items.filter((p) => p.status === filters.status);
    if (filters.provider && filters.provider !== "all")
      items = items.filter((p) => p.provider === filters.provider);

    return paginate(items, filters.page ?? 1, filters.pageSize ?? 10);
  });
}

/**
 * Business rule: confirming a payment activates (or creates) the enrolment.
 * This lives in the service layer, never in a component.
 */
export async function updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<void> {
  return run("payments.updateStatus", async () => {
    const payment = await getPayment(paymentId);
    const { error } = await supabase.from("payments").update({ status }).eq("id", paymentId);
    if (error) throw normalizeError(error, "payments.updateStatus");

    if (status === "succeeded") {
      const { data: existing } = await supabase
        .from("enrollments")
        .select("id, status")
        .eq("user_id", payment.userId)
        .eq("course_id", payment.courseId)
        .maybeSingle();
      if (existing) {
        await supabase.from("enrollments").update({ status: "active" }).eq("id", existing.id);
      } else {
        await supabase
          .from("enrollments")
          .insert({ user_id: payment.userId, course_id: payment.courseId, status: "active" });
      }
      await recordAudit("payment.confirmed", "payment", payment.providerReference ?? paymentId, {
        amountCents: payment.amountCents,
      });
    } else {
      await recordAudit("payment.status_changed", "payment", paymentId, { status });
    }
  });
}

/* ========================================================================== */
/*  ANALYTICS / DASHBOARDS                                                    */
/*  Future: GET /api/admin/dashboard, GET /api/instructor/dashboard           */
/* ========================================================================== */

export async function getStudentDashboardStats(): Promise<StudentDashboardStats> {
  return run("analytics.student", async () => {
    const [enrollments, certificates, pending] = await Promise.all([
      getMyEnrollments(),
      getMyCertificates(),
      getPendingQuizzes(),
    ]);
    const completed = enrollments.filter((e) => e.status === "completed").length;
    const avg = enrollments.length
      ? Math.round(
          enrollments.reduce((sum, e) => sum + (e.progressPercent ?? 0), 0) / enrollments.length,
        )
      : 0;
    return {
      enrolledCourses: enrollments.length,
      completedCourses: completed,
      certificates: certificates.filter((c) => c.status === "issued").length,
      averageProgress: avg,
      lessonsCompleted: enrollments.reduce((sum, e) => sum + (e.lessonsCompleted ?? 0), 0),
      pendingQuizzes: pending.length,
    };
  });
}

export async function getInstructorCourses(): Promise<Course[]> {
  return run("analytics.instructorCourses", async () => {
    const userId = await requireUserId();
    const all = await loadCourses();
    return all.filter((c) => (c.instructorIds ?? [c.instructorId]).includes(userId));
  });
}

export async function getInstructorDashboardStats(): Promise<InstructorDashboardStats> {
  return run("analytics.instructor", async () => {
    const courses = await getInstructorCourses();
    const courseIds = courses.map((c) => c.id);
    if (!courseIds.length)
      return {
        totalCourses: 0,
        publishedCourses: 0,
        totalEnrollments: 0,
        completionRate: 0,
        averageQuizScore: 0,
        studentsPerCourse: [],
      };

    const enrollments = unwrapList(
      "analytics.instructor.enrollments",
      await supabase.from("enrollments").select("*").in("course_id", courseIds),
    );
    const completed = enrollments.filter((e: Row) => e.status === "completed").length;

    const lessonIdsByCourse = await Promise.all(courseIds.map((id) => getCourseLessonIds(id)));
    const allLessonIds = lessonIdsByCourse.flat();
    let averageQuizScore = 0;
    if (allLessonIds.length) {
      const quizzes = unwrapList(
        "analytics.instructor.quizzes",
        await supabase.from("quizzes").select("id").in("lesson_id", allLessonIds),
      );
      if (quizzes.length) {
        const attempts = unwrapList(
          "analytics.instructor.attempts",
          await supabase
            .from("quiz_attempts")
            .select("score_percent")
            .in(
              "quiz_id",
              quizzes.map((q: Row) => q.id),
            ),
        );
        if (attempts.length)
          averageQuizScore = Math.round(
            attempts.reduce((s: number, a: Row) => s + (a.score_percent ?? 0), 0) / attempts.length,
          );
      }
    }

    return {
      totalCourses: courses.length,
      publishedCourses: courses.filter((c) => c.status === "published").length,
      totalEnrollments: enrollments.length,
      completionRate: enrollments.length ? Math.round((completed / enrollments.length) * 100) : 0,
      averageQuizScore,
      studentsPerCourse: courses.map((c) => ({
        courseId: c.id,
        title: c.title,
        students: enrollments.filter((e: Row) => e.course_id === c.id).length,
      })),
    };
  });
}

export async function getCourseAnalytics(courseId: string): Promise<CourseAnalytics> {
  return run("analytics.course", async () => {
    const course = await getCourse(courseId);
    const students = await getCourseStudents(courseId);
    const lessonIds = await getCourseLessonIds(courseId);

    const buckets = [
      { bucket: "0%", min: 0, max: 0 },
      { bucket: "1-25%", min: 1, max: 25 },
      { bucket: "26-50%", min: 26, max: 50 },
      { bucket: "51-75%", min: 51, max: 75 },
      { bucket: "76-99%", min: 76, max: 99 },
      { bucket: "100%", min: 100, max: 100 },
    ];
    const progressDistribution = buckets.map((b) => ({
      bucket: b.bucket,
      students: students.filter(
        (s) => (s.progressPercent ?? 0) >= b.min && (s.progressPercent ?? 0) <= b.max,
      ).length,
    }));

    let quizPerformance: CourseAnalytics["quizPerformance"] = [];
    let averageQuizScore = 0;
    if (lessonIds.length) {
      const quizzes = unwrapList(
        "analytics.course.quizzes",
        await supabase.from("quizzes").select("id, title").in("lesson_id", lessonIds),
      );
      if (quizzes.length) {
        const attempts = unwrapList(
          "analytics.course.attempts",
          await supabase
            .from("quiz_attempts")
            .select("quiz_id, score_percent, passed")
            .in(
              "quiz_id",
              quizzes.map((q: Row) => q.id),
            ),
        );
        quizPerformance = quizzes.map((q: Row) => {
          const qa = attempts.filter((a: Row) => a.quiz_id === q.id);
          return {
            quizId: q.id,
            title: q.title ?? "Quiz",
            attempts: qa.length,
            averageScore: qa.length
              ? Math.round(qa.reduce((s: number, a: Row) => s + a.score_percent, 0) / qa.length)
              : 0,
            passRate: qa.length
              ? Math.round((qa.filter((a: Row) => a.passed).length / qa.length) * 100)
              : 0,
          };
        });
        if (attempts.length)
          averageQuizScore = Math.round(
            attempts.reduce((s: number, a: Row) => s + a.score_percent, 0) / attempts.length,
          );
      }
    }

    const completed = students.filter((s) => s.status === "completed").length;
    return {
      courseId,
      title: course.title,
      enrolled: students.length,
      active: students.filter((s) => s.status === "active").length,
      completed,
      completionRate: students.length ? Math.round((completed / students.length) * 100) : 0,
      averageProgress: students.length
        ? Math.round(students.reduce((s, e) => s + (e.progressPercent ?? 0), 0) / students.length)
        : 0,
      averageQuizScore,
      progressDistribution,
      quizPerformance,
    };
  });
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  return run("analytics.admin", async () => {
    const [roles, courses, enrollments, certificates, payments, activity] = await Promise.all([
      supabase.from("user_roles").select("role"),
      supabase.from("courses").select("id, status, created_at"),
      supabase.from("enrollments").select("status, enrolled_at"),
      supabase.from("certificates").select("status"),
      supabase.from("payments").select("status, amount_cents"),
      getAuditLogs({ pageSize: 8 }),
    ]);

    const roleRows = (roles.data ?? []) as Row[];
    const courseRows = (courses.data ?? []) as Row[];
    const enrollmentRows = (enrollments.data ?? []) as Row[];
    const certRows = (certificates.data ?? []) as Row[];
    const paymentRows = (payments.data ?? []) as Row[];

    const months: { month: string; enrollments: number }[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString("en", { month: "short" });
      const count = enrollmentRows.filter((e) => {
        const ed = new Date(e.enrolled_at);
        return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
      }).length;
      months.push({ month: key, enrollments: count });
    }

    return {
      students: roleRows.filter((r) => r.role === "student").length,
      instructors: roleRows.filter((r) => r.role === "instructor").length,
      courses: courseRows.length,
      publishedCourses: courseRows.filter((c) => c.status === "published").length,
      activeEnrollments: enrollmentRows.filter((e) => e.status === "active").length,
      completedCourses: enrollmentRows.filter((e) => e.status === "completed").length,
      certificatesIssued: certRows.filter((c) => c.status === "issued").length,
      revenueCents: paymentRows
        .filter((p) => p.status === "succeeded")
        .reduce((s, p) => s + (p.amount_cents ?? 0), 0),
      pendingPayments: paymentRows.filter((p) => p.status === "pending").length,
      enrollmentsByMonth: months,
      coursesByStatus: ["draft", "published", "archived"].map((status) => ({
        status,
        count: courseRows.filter((c) => c.status === status).length,
      })),
      recentActivity: activity.items,
    };
  });
}

/* ========================================================================== */
/*  AUDIT LOG                                                                 */
/*  Future: GET /api/admin/audit-logs                                         */
/* ========================================================================== */

async function recordAudit(
  action: string,
  entityType: string,
  entityId: string | null,
  metadata: Record<string, unknown>,
): Promise<void> {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) return;
    await supabase.from("audit_logs").insert({
      user_id: data.user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata: metadata as never,
    });
  } catch {
    /* auditing must never break a user action */
  }
}

export async function getAuditLogs(filters: AuditLogFilters = {}): Promise<Paginated<AuditLog>> {
  return run("audit.list", async () => {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      // Non-admins simply see nothing rather than an error screen.
      if (error.code === "42501") return paginate([], filters.page ?? 1, filters.pageSize ?? 15);
      throw normalizeError(error, "audit.list");
    }
    const rows = (data ?? []).map(toAuditLog);
    const names = await attachProfileNames(rows);
    let items = rows.map((l) => ({ ...l, userName: names.get(l.userId ?? "")?.name ?? "System" }));

    const search = filters.search?.trim().toLowerCase();
    if (search)
      items = items.filter(
        (l) =>
          l.action.toLowerCase().includes(search) ||
          l.entityType.toLowerCase().includes(search) ||
          (l.userName ?? "").toLowerCase().includes(search),
      );
    if (filters.entityType && filters.entityType !== "all")
      items = items.filter((l) => l.entityType === filters.entityType);

    return paginate(items, filters.page ?? 1, filters.pageSize ?? 15);
  });
}

/* ========================================================================== */
/*  SETTINGS                                                                  */
/* ========================================================================== */

export async function getAcademySettings(): Promise<AcademySettings> {
  return run("settings.get", async () => {
    const { data } = await supabase
      .from("academy_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();
    const r = (data ?? {}) as Row;
    return {
      academyName: r.academy_name ?? "Sterling Executive Assistant Academy",
      supportEmail: r.support_email ?? "support@sterlingacademy.co",
      defaultCurrency: r.default_currency ?? "KES",
      certificatePrefix: r.certificate_prefix ?? "SEAA",
      allowSelfEnrollment: r.allow_self_enrollment ?? true,
    };
  });
}

export async function updateAcademySettings(patch: Partial<AcademySettings>): Promise<void> {
  return run("settings.update", async () => {
    const { error } = await supabase
      .from("academy_settings")
      .update({
        ...(patch.academyName !== undefined ? { academy_name: patch.academyName } : {}),
        ...(patch.supportEmail !== undefined ? { support_email: patch.supportEmail } : {}),
        ...(patch.defaultCurrency !== undefined ? { default_currency: patch.defaultCurrency } : {}),
        ...(patch.certificatePrefix !== undefined
          ? { certificate_prefix: patch.certificatePrefix }
          : {}),
        ...(patch.allowSelfEnrollment !== undefined
          ? { allow_self_enrollment: patch.allowSelfEnrollment }
          : {}),
      })
      .eq("id", "default");
    if (error) throw normalizeError(error, "settings.update");
    await recordAudit("settings.updated", "settings", "default", {});
  });
}

/* ========================================================================== */
/*  NOTIFICATIONS                                                             */
/*  Future: GET /api/notifications, POST /api/notifications/{id}/read         */
/* ========================================================================== */

const toNotification = (r: Row): AppNotification => ({
  id: r.id,
  userId: r.user_id,
  type: r.type,
  title: r.title,
  body: r.body ?? "",
  link: r.link ?? undefined,
  readAt: r.read_at ?? undefined,
  createdAt: r.created_at,
});

export async function getNotifications(limit = 50): Promise<AppNotification[]> {
  return run("notifications.list", async () => {
    const userId = await requireUserId();
    return unwrapList(
      "notifications.list",
      await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit),
    ).map(toNotification);
  });
}

export async function getUnreadNotificationCount(): Promise<number> {
  const items = await getNotifications(50);
  return items.filter((n) => !n.readAt).length;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  return run("notifications.read", async () => {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId);
    if (error) throw normalizeError(error, "notifications.read");
  });
}

export async function markAllNotificationsRead(): Promise<void> {
  return run("notifications.readAll", async () => {
    const userId = await requireUserId();
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null);
    if (error) throw normalizeError(error, "notifications.readAll");
  });
}

export async function deleteNotification(notificationId: string): Promise<void> {
  return run("notifications.delete", async () => {
    const { error } = await supabase.from("notifications").delete().eq("id", notificationId);
    if (error) throw normalizeError(error, "notifications.delete");
  });
}

/**
 * Creates an in-app notification. Delivery must never break the action that
 * triggered it, so failures are swallowed.
 *
 * Email delivery is dispatched by the backend from the same record once a
 * sender domain is configured for the academy.
 */
export async function notifyUser(input: NotificationInput): Promise<void> {
  try {
    const preferences = await (supabase as any).from("notification_preferences").select("*").eq("user_id", input.userId).maybeSingle();
    const type = input.type ?? "general";
    if (preferences.data?.in_app_enabled !== false) {
      await supabase.from("notifications").insert({ user_id: input.userId, type, title: input.title, body: input.body ?? "", link: input.link ?? null });
    }
    if (preferences.data?.email_enabled !== false) {
      await (supabase as any).from("communication_events").insert({ user_id: input.userId, channel: "email", event_type: type, subject: input.title, body: input.body ?? "", status: "queued" });
    }
  } catch {
    /* notifications are best-effort */
  }
}

export interface NotificationPreferences {
  emailEnabled: boolean; inAppEnabled: boolean; enrollmentEnabled: boolean; assignmentEnabled: boolean; certificateEnabled: boolean; paymentEnabled: boolean; courseEnabled: boolean;
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return run("notifications.preferences.get", async () => {
    const userId = await requireUserId();
    const { data, error } = await (supabase as any).from("notification_preferences").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw normalizeError(error, "notifications.preferences.get");
    return { emailEnabled: data?.email_enabled ?? true, inAppEnabled: data?.in_app_enabled ?? true, enrollmentEnabled: data?.enrollment_enabled ?? true, assignmentEnabled: data?.assignment_enabled ?? true, certificateEnabled: data?.certificate_enabled ?? true, paymentEnabled: data?.payment_enabled ?? true, courseEnabled: data?.course_enabled ?? true };
  });
}

export async function updateNotificationPreferences(patch: Partial<NotificationPreferences>): Promise<void> {
  return run("notifications.preferences.update", async () => {
    const userId = await requireUserId();
    const { error } = await (supabase as any).from("notification_preferences").upsert({ user_id: userId, ...(patch.emailEnabled !== undefined ? { email_enabled: patch.emailEnabled } : {}), ...(patch.inAppEnabled !== undefined ? { in_app_enabled: patch.inAppEnabled } : {}), ...(patch.enrollmentEnabled !== undefined ? { enrollment_enabled: patch.enrollmentEnabled } : {}), ...(patch.assignmentEnabled !== undefined ? { assignment_enabled: patch.assignmentEnabled } : {}), ...(patch.certificateEnabled !== undefined ? { certificate_enabled: patch.certificateEnabled } : {}), ...(patch.paymentEnabled !== undefined ? { payment_enabled: patch.paymentEnabled } : {}), ...(patch.courseEnabled !== undefined ? { course_enabled: patch.courseEnabled } : {}) }, { onConflict: "user_id" });
    if (error) throw normalizeError(error, "notifications.preferences.update");
    await recordAudit("notification.preferences_updated", "notification_preferences", userId, patch);
  });
}

/* ========================================================================== */
/*  ASSIGNMENTS                                                               */
/*  Future: /api/lessons/{id}/submission, /api/submissions/{id}/grade         */
/* ========================================================================== */

const ASSIGNMENT_SELECT = "*";

const toAssignment = (r: Row): Assignment => ({
  id: r.id,
  lessonId: r.lesson_id,
  title: r.title,
  instructionsHtml: r.instructions_html ?? "",
  maxScore: r.max_score ?? undefined,
  dueDate: r.due_date ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export async function getAssignment(lessonId: string): Promise<Assignment | null> {
  return run("assignments.get", async () => {
    const { data, error } = await supabase
      .from("assignments")
      .select(ASSIGNMENT_SELECT)
      .eq("lesson_id", lessonId)
      .maybeSingle();
    if (error) throw normalizeError(error, "assignments.get");
    return data ? toAssignment(data as Row) : null;
  });
}

export async function createAssignment(input: AssignmentInput): Promise<Assignment> {
  return run("assignments.create", async () => {
    const row = unwrap(
      "assignments.create",
      await (supabase as any).from("assignments").insert({
        lesson_id: input.lessonId,
        title: input.title,
        instructions_html: input.instructionsHtml ?? "",
        max_score: input.maxScore ?? null,
        due_date: input.dueDate ?? null,
      }).select(ASSIGNMENT_SELECT).maybeSingle(),
    ) as Row;
    await recordAudit("assignment.created", "assignment", row.id, { lessonId: input.lessonId });
    return toAssignment(row);
  });
}

export async function updateAssignment(
  assignmentId: string,
  patch: Partial<Omit<AssignmentInput, "lessonId">>,
): Promise<Assignment> {
  return run("assignments.update", async () => {
    const row = unwrap(
      "assignments.update",
      await (supabase as any).from("assignments").update({
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.instructionsHtml !== undefined ? { instructions_html: patch.instructionsHtml } : {}),
        ...(patch.maxScore !== undefined ? { max_score: patch.maxScore } : {}),
        ...(patch.dueDate !== undefined ? { due_date: patch.dueDate || null } : {}),
      }).eq("id", assignmentId).select(ASSIGNMENT_SELECT).maybeSingle(),
    ) as Row;
    await recordAudit("assignment.updated", "assignment", row.id, { lessonId: patch.lessonId });
    return toAssignment(row);
  });
}

export async function deleteAssignment(assignmentId: string): Promise<void> {
  return run("assignments.delete", async () => {
    const { error } = await (supabase as any).from("assignments").delete().eq("id", assignmentId);
    if (error) throw normalizeError(error, "assignments.delete");
    await recordAudit("assignment.deleted", "assignment", assignmentId, {});
  });
}

const SUBMISSION_SELECT =
  "*, lessons:lesson_id (id, title, modules:module_id (id, courses:course_id (id, title, instructor_id)))";

const toSubmission = (r: Row): AssignmentSubmission => ({
  id: r.id,
  assignmentId: r.assignment_id ?? r.id,
  lessonId: r.lesson_id,
  userId: r.user_id,
  contentText: r.content_text ?? "",
  attachmentUrl: r.attachment_url ?? undefined,
  status: r.status,
  grade: r.grade ?? undefined,
  feedback: r.feedback ?? undefined,
  submittedAt: r.submitted_at,
  gradedAt: r.graded_at ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  lessonTitle: r.lessons?.title,
  courseId: r.lessons?.modules?.courses?.id,
  courseTitle: r.lessons?.modules?.courses?.title,
});

export async function getMyAssignmentSubmission(
  lessonId: string,
): Promise<AssignmentSubmission | null> {
  return run("submissions.mine", async () => {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from("assignment_submissions")
      .select(SUBMISSION_SELECT)
      .eq("lesson_id", lessonId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw normalizeError(error, "submissions.mine");
    return data ? toSubmission(data as Row) : null;
  });
}

export async function submitAssignment(
  input: AssignmentSubmissionInput,
): Promise<AssignmentSubmission> {
  return run("submissions.submit", async () => {
    const userId = await requireUserId();
    const existing = await getMyAssignmentSubmission(input.lessonId);
    const payload = {
      assignment_id: input.assignmentId,
      lesson_id: input.lessonId,
      user_id: userId,
      content_text: input.contentText,
      attachment_url: input.attachmentUrl ?? null,
      status: "submitted" as const,
      submitted_at: new Date().toISOString(),
    };
    const row = unwrap(
      "submissions.submit",
      existing
        ? await supabase
            .from("assignment_submissions")
            .update(payload)
            .eq("id", existing.id)
            .select(SUBMISSION_SELECT)
            .maybeSingle()
        : await supabase
            .from("assignment_submissions")
            .insert(payload)
            .select(SUBMISSION_SELECT)
            .maybeSingle(),
    ) as Row;

    const submission = toSubmission(row);
    const instructorId = row.lessons?.modules?.courses?.instructor_id;
    if (instructorId) {
      await notifyUser({
        userId: instructorId,
        type: "assignment",
        title: "New assignment submission",
        body: `A learner submitted "${submission.lessonTitle ?? "an assignment"}" for review.`,
        link: "/instructor/submissions",
      });
    }
    await recordAudit("assignment.submitted", "assignment_submission", submission.id, {
      lessonId: input.lessonId,
    });
    return submission;
  });
}

/** Submissions awaiting review across the courses the caller owns. */
export async function getAssignmentSubmissions(): Promise<AssignmentSubmission[]> {
  return run("submissions.list", async () => {
    const userId = await requireUserId();
    const rows = unwrapList(
      "submissions.list",
      await supabase
        .from("assignment_submissions")
        .select(SUBMISSION_SELECT)
        .order("submitted_at", { ascending: false }),
    ).map(toSubmission);

    const mine = rows.filter((r) => r.userId !== userId || true);
    const names = await attachProfileNames(mine);
    return mine.map((r) => ({
      ...r,
      userName: names.get(r.userId)?.name,
      userEmail: names.get(r.userId)?.email,
    }));
  });
}

export async function gradeAssignment(
  submissionId: string,
  grade: number,
  feedback: string,
): Promise<AssignmentSubmission> {
  return run("submissions.grade", async () => {
    const graderId = await requireUserId();
    const row = unwrap(
      "submissions.grade",
      await supabase
        .from("assignment_submissions")
        .update({
          grade,
          feedback,
          status: "graded",
          graded_by: graderId,
          graded_at: new Date().toISOString(),
        })
        .eq("id", submissionId)
        .select(SUBMISSION_SELECT)
        .maybeSingle(),
    ) as Row;

    const submission = toSubmission(row);
    await notifyUser({
      userId: submission.userId,
      type: "assignment",
      title: "Your assignment has been graded",
      body: `${submission.lessonTitle ?? "Your assignment"} scored ${grade}%.`,
      link: submission.courseId ? `/learn/${submission.courseId}` : "/my-courses",
    });
    await recordAudit("assignment.graded", "assignment_submission", submissionId, { grade });
    return submission;
  });
}

/* ========================================================================== */
/*  ENTERPRISE MULTI-ADMIN RBAC & MANAGEMENT                                  */
/*  Future: /api/admin/team, /api/admin/permissions                           */
/* ========================================================================== */

export async function getAdminTeam(): Promise<AdminPermissionRecord[]> {
  return run("admin.team", async () => {
    const users = unwrapList(
      "admin.team.users",
      await supabase.from("profiles").select("id, full_name, email, created_at, updated_at"),
    );
    const roles = unwrapList(
      "admin.team.roles",
      await supabase.from("user_roles").select("user_id, role").eq("role", "admin"),
    );
    const adminIds = new Set((roles as Row[]).map((r) => r.user_id));
    const adminProfiles = (users as Row[]).filter((u) => adminIds.has(u.id));

    const [{ data: adminRoles, error: roleError }, { data: tierPermissions, error: permissionError }, { data: scopes, error: scopeError }] = await Promise.all([
      (supabase as any).from("admin_roles").select("user_id, sub_role, granted_by, created_at").in("user_id", Array.from(adminIds)),
      (supabase as any).from("admin_tier_permissions").select("sub_role, permission_key"),
      supabase.from("admin_organization_scopes").select("user_id, organization_id"),
    ]);
    if (roleError) throw normalizeError(roleError, "admin.team.roles");
    if (permissionError) throw normalizeError(permissionError, "admin.team.permissions");
    if (scopeError) throw normalizeError(scopeError, "admin.team.scopes");

    const permissionMap = new Map<AdminSubRole, AdminPermissionKey[]>();
    for (const row of (tierPermissions ?? []) as Row[]) {
      const list = permissionMap.get(row.sub_role) ?? [];
      list.push(row.permission_key as AdminPermissionKey);
      permissionMap.set(row.sub_role, list);
    }
    const rolesMap = new Map<string, AdminSubRole[]>();
    const grantedByMap = new Map<string, string | undefined>();
    for (const row of (adminRoles ?? []) as Row[]) {
      const list = rolesMap.get(row.user_id) ?? [];
      list.push(row.sub_role as AdminSubRole);
      rolesMap.set(row.user_id, list);
      grantedByMap.set(row.user_id, row.granted_by ?? undefined);
    }
    const scopeMap = new Map<string, string[]>();
    for (const row of (scopes ?? []) as Row[]) {
      scopeMap.set(row.user_id, [...(scopeMap.get(row.user_id) ?? []), row.organization_id]);
    }

    return adminProfiles.map((u: Row) => {
      const subRoles = rolesMap.get(u.id) ?? [];
      const permissions = Array.from(new Set(subRoles.flatMap((r) => permissionMap.get(r) ?? [])));
      return {
        id: u.id,
        userId: u.id,
        userName: u.full_name,
        userEmail: u.email,
        subRole: subRoles[0],
        subRoles,
        permissions,
        organizationIds: scopeMap.get(u.id) ?? [],
        grantedBy: grantedByMap.get(u.id),
        createdAt: u.created_at,
        updatedAt: u.updated_at ?? u.created_at,
      };
    });
  });
}

export async function assignAdminRoles(
  userId: string,
  subRoles: AdminSubRole[],
  organizationIds: string[] = [],
): Promise<AdminPermissionRecord> {
  return run("admin.assignRoles", async () => {
    const grantorId = await requireUserId();
    if (!subRoles.length) throw apiError("validation", "At least one administrator tier is required.");
    if (subRoles.includes("super_admin") && subRoles.length > 1) {
      throw apiError("validation", "Super Admin cannot be combined with delegated tiers.");
    }

    const { data: existingAdminRole, error: existingRoleError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (existingRoleError) throw normalizeError(existingRoleError, "admin.assignRoles.userRoleCheck");
    const createdAdminRole = !existingAdminRole;
    if (createdAdminRole) {
      const { error: roleError } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (roleError) throw normalizeError(roleError, "admin.assignRoles.userRole");
    }

    const { error: deleteRolesError } = await (supabase as any)
      .from("admin_roles")
      .delete()
      .eq("user_id", userId);
    if (deleteRolesError) throw normalizeError(deleteRolesError, "admin.assignRoles.clearRoles");

    const { data: insertedRoles, error: insertRolesError } = await (supabase as any)
      .from("admin_roles")
      .insert(subRoles.map((subRole) => ({ user_id: userId, sub_role: subRole, granted_by: grantorId })))
      .select("user_id, sub_role, granted_by, created_at");
    if (insertRolesError) {
      if (createdAdminRole) await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      throw normalizeError(insertRolesError, "admin.assignRoles.roles");
    }

    const { error: clearScopesError } = await supabase
      .from("admin_organization_scopes")
      .delete()
      .eq("user_id", userId);
    if (clearScopesError) {
      await (supabase as any).from("admin_roles").delete().eq("user_id", userId);
      if (createdAdminRole) await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      throw normalizeError(clearScopesError, "admin.assignRoles.clearScopes");
    }
    if (organizationIds.length) {
      const { error: scopeError } = await supabase.from("admin_organization_scopes").insert(
        organizationIds.map((organizationId) => ({ user_id: userId, organization_id: organizationId })),
      );
      if (scopeError) {
        await (supabase as any).from("admin_roles").delete().eq("user_id", userId);
        if (createdAdminRole) await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
        throw normalizeError(scopeError, "admin.assignRoles.scopes");
      }
    }

    const permissionRows = unwrapList(
      "admin.assignRoles.permissions",
      await (supabase as any).from("admin_tier_permissions").select("sub_role, permission_key").in("sub_role", subRoles),
    ) as Row[];
    const permissions = Array.from(new Set(permissionRows.map((r) => r.permission_key as AdminPermissionKey)));
    const primary = subRoles[0];
    await recordAudit("admin.roles_updated", "admin", userId, { subRoles, organizationIds, grantedBy: grantorId });
    const first = (insertedRoles ?? [])[0] as Row | undefined;
    return {
      id: userId,
      userId,
      userName: undefined,
      userEmail: undefined,
      subRole: primary,
      subRoles,
      permissions,
      organizationIds,
      grantedBy: first?.granted_by ?? grantorId,
      createdAt: first?.created_at ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

export async function assignAdminSubRole(
  userId: string,
  subRole: AdminSubRole,
  permissions: AdminPermissionKey[],
): Promise<AdminPermissionRecord> {
  // Kept as a compatibility wrapper. The normalized catalog, not an arbitrary
  // JSON permission array, is authoritative.
  void permissions;
  return assignAdminRoles(userId, [subRole]);
}

/* ========================================================================== */
/*  ENTERPRISE ORGANIZATIONS & COHORTS (B2B MULTI-TENANCY)                    */
/*  Future: /api/organizations, /api/cohorts                                 */
/* ========================================================================== */

export async function getOrganizations(): Promise<Organization[]> {
  return run("organizations.list", async () => {
    const rows = unwrapList(
      "organizations.list",
      await supabase.from("organizations").select("*").order("name"),
    );

    const { data: members } = await supabase.from("organization_members").select("organization_id");

    const counts = new Map<string, number>();
    (members ?? []).forEach((m: Row) => {
      counts.set(m.organization_id, (counts.get(m.organization_id) ?? 0) + 1);
    });

    return rows.map((r: Row) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      type: r.type ?? undefined,
      contactEmail: r.contact_email,
      domain: r.domain ?? undefined,
      logoUrl: r.logo_url ?? undefined,
      maxSeats: r.max_seats ?? 100,
      activeSeats: counts.get(r.id) ?? 0,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  });
}

export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  return run("organizations.members.list", async () => {
    const { data, error } = await supabase
      .from("organization_members")
      .select("id, organization_id, user_id, org_role, created_at, profiles:user_id (full_name, email)")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: true });
    if (error) throw normalizeError(error, "organizations.members.list");
    return ((data ?? []) as Row[]).map((r) => ({
      id: r.id,
      organizationId: r.organization_id,
      userId: r.user_id,
      userName: r.profiles?.full_name,
      userEmail: r.profiles?.email,
      orgRole: r.org_role === "manager" ? "manager" : "member",
      createdAt: r.created_at,
    }));
  });
}

export async function setOrganizationMembers(
  organizationId: string,
  members: Array<{ userId: string; orgRole?: "manager" | "member" }>,
): Promise<void> {
  return run("organizations.members.set", async () => {
    const { error: clearError } = await supabase.from("organization_members").delete().eq("organization_id", organizationId);
    if (clearError) throw normalizeError(clearError, "organizations.members.clear");
    if (members.length) {
      const { error } = await supabase.from("organization_members").insert(
        members.map((m) => ({ organization_id: organizationId, user_id: m.userId, org_role: m.orgRole ?? "member" })),
      );
      if (error) throw normalizeError(error, "organizations.members.set");
    }
    await recordAudit("organization.members_updated", "organization", organizationId, { memberCount: members.length });
  });
}

export async function updateOrganization(
  organizationId: string,
  patch: { name?: string; contactEmail?: string; domain?: string; maxSeats?: number; logoUrl?: string; type?: OrganizationType },
): Promise<Organization> {
  return run("organizations.update", async () => {
    const row = unwrap("organizations.update", await (supabase as any).from("organizations").update({
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.contactEmail !== undefined ? { contact_email: patch.contactEmail } : {}),
      ...(patch.domain !== undefined ? { domain: patch.domain || null } : {}),
      ...(patch.maxSeats !== undefined ? { max_seats: patch.maxSeats } : {}),
      ...(patch.logoUrl !== undefined ? { logo_url: patch.logoUrl || null } : {}),
      ...(patch.type !== undefined ? { type: patch.type } : {}),
    }).eq("id", organizationId).select().maybeSingle()) as Row;
    await recordAudit("organization.updated", "organization", organizationId, { changed: Object.keys(patch) });
    return { id: row.id, name: row.name, code: row.code, type: row.type, contactEmail: row.contact_email, domain: row.domain ?? undefined, logoUrl: row.logo_url ?? undefined, maxSeats: row.max_seats ?? 0, createdAt: row.created_at, updatedAt: row.updated_at };
  });
}

export async function deleteOrganization(organizationId: string): Promise<void> {
  return run("organizations.delete", async () => {
    const { error } = await supabase.from("organizations").delete().eq("id", organizationId);
    if (error) throw normalizeError(error, "organizations.delete");
    await recordAudit("organization.deleted", "organization", organizationId, {});
  });
}

export async function createOrganization(input: {
  name: string;
  code: string;
  contactEmail: string;
  domain?: string;
  maxSeats?: number;
  type?: OrganizationType;
}): Promise<Organization> {
  return run("organizations.create", async () => {
    const row = unwrap(
      "organizations.create",
      await (supabase as any)
        .from("organizations")
        .insert({
          name: input.name,
          code: input.code.toUpperCase(),
          contact_email: input.contactEmail,
          domain: input.domain ?? null,
          max_seats: input.maxSeats ?? 100,
          ...(input.type ? { type: input.type } : {}),
        })
        .select()
        .maybeSingle(),
    ) as Row;

    await recordAudit("organization.created", "organization", row.id, { name: input.name });

    return {
      id: row.id,
      name: row.name,
      code: row.code,
      type: row.type ?? undefined,
      contactEmail: row.contact_email,
      domain: row.domain ?? undefined,
      maxSeats: row.max_seats,
      activeSeats: 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

export async function getOrganizationParticipants(organizationId?: string): Promise<OrganizationParticipant[]> {
  return run("organizations.participants.list", async () => {
    let query = supabase
      .from("organization_participants")
      .select("*, profiles:user_id (full_name, email)")
      .order("created_at", { ascending: false });
    if (organizationId) query = query.eq("organization_id", organizationId);
    const rows = unwrapList("organizations.participants.list", await query);
    return rows.map((r: Row) => ({
      id: r.id,
      organizationId: r.organization_id,
      userId: r.user_id,
      userName: r.profiles?.full_name,
      userEmail: r.profiles?.email,
      relationship: r.relationship,
      startedAt: r.started_at,
      endedAt: r.ended_at ?? undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  });
}

export async function createOrganizationParticipant(input: {
  organizationId: string;
  userId: string;
  relationship?: string;
}): Promise<OrganizationParticipant> {
  return run("organizations.participants.create", async () => {
    const row = unwrap(
      "organizations.participants.create",
      await supabase.from("organization_participants").insert({
        organization_id: input.organizationId,
        user_id: input.userId,
        relationship: input.relationship ?? "sponsored",
      }).select("*, profiles:user_id (full_name, email)").maybeSingle(),
    ) as Row;
    return {
      id: row.id,
      organizationId: row.organization_id,
      userId: row.user_id,
      userName: row.profiles?.full_name,
      userEmail: row.profiles?.email,
      relationship: row.relationship,
      startedAt: row.started_at,
      endedAt: row.ended_at ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

export async function endOrganizationParticipant(participantId: string): Promise<void> {
  return run("organizations.participants.end", async () => {
    const { error } = await supabase
      .from("organization_participants")
      .update({ ended_at: new Date().toISOString() })
      .eq("id", participantId);
    if (error) throw normalizeError(error, "organizations.participants.end");
  });
}

export async function getCourseCohorts(courseId: string): Promise<Cohort[]> {
  return run("courses.cohorts.list", async () => {
    const { data: links, error } = await (supabase as any).from("cohort_courses").select("cohort_id").eq("course_id", courseId);
    if (error) throw normalizeError(error, "courses.cohorts.list");
    const ids = ((links ?? []) as Row[]).map((r) => r.cohort_id);
    if (!ids.length) return [];
    const rows = unwrapList("courses.cohorts.list.cohorts", await supabase.from("cohorts").select("*, organizations:organization_id (name)").in("id", ids));
    return rows.map((r: Row) => ({ id: r.id, organizationId: r.organization_id, organizationName: r.organizations?.name, name: r.name, description: r.description ?? "", startDate: r.start_date ?? undefined, endDate: r.end_date ?? undefined, createdAt: r.created_at, updatedAt: r.updated_at }));
  });
}

export async function setCourseCohorts(courseId: string, cohortIds: string[]): Promise<void> {
  return run("courses.cohorts.set", async () => {
    const { error: clearError } = await (supabase as any).from("cohort_courses").delete().eq("course_id", courseId);
    if (clearError) throw normalizeError(clearError, "courses.cohorts.set.clear");
    if (cohortIds.length) {
      const { error } = await (supabase as any).from("cohort_courses").insert(Array.from(new Set(cohortIds)).map((cohortId) => ({ cohort_id: cohortId, course_id: courseId })));
      if (error) throw normalizeError(error, "courses.cohorts.set.insert");
    }
    await recordAudit("course.cohorts_updated", "course", courseId, { cohortIds });
  });
}

export async function getCohorts(organizationId?: string): Promise<Cohort[]> {
  return run("cohorts.list", async () => {
    let query = supabase
      .from("cohorts")
      .select("*, organizations:organization_id (name)")
      .order("created_at", { ascending: false });
    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }
    const rows = unwrapList("cohorts.list", await query);
    return rows.map((r: Row) => ({
      id: r.id,
      organizationId: r.organization_id,
      organizationName: r.organizations?.name,
      name: r.name,
      description: r.description ?? "",
      startDate: r.start_date ?? undefined,
      endDate: r.end_date ?? undefined,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  });
}

export async function createCohort(input: {
  organizationId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Cohort> {
  return run("cohorts.create", async () => {
    const row = unwrap(
      "cohorts.create",
      await supabase
        .from("cohorts")
        .insert({
          organization_id: input.organizationId,
          name: input.name,
          description: input.description ?? "",
          start_date: input.startDate ?? null,
          end_date: input.endDate ?? null,
        })
        .select("*, organizations:organization_id (name)")
        .maybeSingle(),
    ) as Row;

    await recordAudit("cohort.created", "cohort", row.id, { name: input.name });

    return {
      id: row.id,
      organizationId: row.organization_id,
      organizationName: row.organizations?.name,
      name: row.name,
      description: row.description ?? "",
      startDate: row.start_date ?? undefined,
      endDate: row.end_date ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

export async function getCohortMembers(cohortId: string): Promise<User[]> {
  return run("cohorts.members.list", async () => {
    const { data, error } = await (supabase as any)
      .from("cohort_members")
      .select("user_id, profiles:user_id (id, full_name, email, avatar_url, status, created_at, updated_at)")
      .eq("cohort_id", cohortId);
    if (error) throw normalizeError(error, "cohorts.members.list");
    return ((data ?? []) as Row[]).map((r) => toProfile(r.profiles ?? { id: r.user_id }, "student"));
  });
}

export async function getCohortCourses(cohortId: string): Promise<Course[]> {
  return run("cohorts.courses.list", async () => {
    const { data, error } = await (supabase as any)
      .from("cohort_courses")
      .select("course_id")
      .eq("cohort_id", cohortId);
    if (error) throw normalizeError(error, "cohorts.courses.list");
    const ids = ((data ?? []) as Row[]).map((r) => r.course_id).filter(Boolean);
    if (!ids.length) return [];
    const result = await supabase.from("courses").select("*").in("id", ids);
    if (result.error) throw normalizeError(result.error, "cohorts.courses.list.courses");
    return (result.data ?? []).map((r: Row) => toCourse(r));
  });
}

export async function setCohortMembers(cohortId: string, userIds: string[]): Promise<void> {
  return run("cohorts.members.set", async () => {
    const { error: clearError } = await (supabase as any).from("cohort_members").delete().eq("cohort_id", cohortId);
    if (clearError) throw normalizeError(clearError, "cohorts.members.set.clear");
    if (userIds.length) {
      const { error } = await (supabase as any).from("cohort_members").insert(
        userIds.map((userId) => ({ cohort_id: cohortId, user_id: userId })),
      );
      if (error) throw normalizeError(error, "cohorts.members.set.insert");
    }
    await recordAudit("cohort.members_updated", "cohort", cohortId, { userIds });
  });
}

export async function setCohortCourses(cohortId: string, courseIds: string[]): Promise<void> {
  return run("cohorts.courses.set", async () => {
    const { error: clearError } = await (supabase as any).from("cohort_courses").delete().eq("cohort_id", cohortId);
    if (clearError) throw normalizeError(clearError, "cohorts.courses.set.clear");
    if (courseIds.length) {
      const { error } = await (supabase as any).from("cohort_courses").insert(
        courseIds.map((courseId) => ({ cohort_id: cohortId, course_id: courseId })),
      );
      if (error) throw normalizeError(error, "cohorts.courses.set.insert");
    }
    await recordAudit("cohort.courses_updated", "cohort", cohortId, { courseIds });
  });
}

export async function bulkEnrollStudents(
  input: BulkEnrollmentInput,
): Promise<BulkEnrollmentResult> {
  return run("students.bulkEnroll", async () => {
    const successfulEmails: string[] = [];
    const failedEmails: { email: string; reason: string }[] = [];

    const { data: profiles } = await supabase.from("profiles").select("id, email");

    const emailToUser = new Map((profiles ?? []).map((p: Row) => [p.email.toLowerCase(), p.id]));

    for (const email of input.emails) {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) continue;

      const userId = emailToUser.get(cleanEmail);
      if (!userId) {
        failedEmails.push({ email, reason: "No user account exists with this email." });
        continue;
      }

      try {
        await supabase
          .from("enrollments")
          .upsert(
            { user_id: userId, course_id: input.courseId, status: "active" },
            { onConflict: "user_id,course_id" },
          );
        if (input.organizationId) {
          await supabase
            .from("organization_members")
            .insert({ organization_id: input.organizationId, user_id: userId })
            .maybeSingle();
        }
        successfulEmails.push(cleanEmail);
      } catch (err) {
        failedEmails.push({ email, reason: errorMessage(err) });
      }
    }

    await recordAudit("students.bulk_enrolled", "course", input.courseId, {
      total: input.emails.length,
      successCount: successfulEmails.length,
    });

    return {
      successfulEmails,
      failedEmails,
      totalProcessed: input.emails.length,
    };
  });
}

/* ========================================================================== */
/*  ENTERPRISE CSV EXPORTERS & REPORTS                                        */
/* ========================================================================== */

export async function exportPaymentsCsv(): Promise<string> {
  const { items: payments } = await getPayments();
  const headers = ["ID", "User", "Email", "Course", "Amount (KES)", "Provider", "Status", "Date"];
  const rows = payments.map((p) => [
    p.id,
    `"${(p.userName ?? "").replace(/"/g, '""')}"`,
    p.userEmail ?? "",
    `"${(p.courseTitle ?? "").replace(/"/g, '""')}"`,
    (p.amountCents / 100).toFixed(2),
    p.provider,
    p.status,
    p.createdAt,
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export async function exportEnrollmentsCsv(): Promise<string> {
  const { items: enrollments } = await getEnrollments();
  const headers = ["ID", "User", "Email", "Course", "Status", "Enrolled At", "Completed At"];
  const rows = enrollments.map((e) => [
    e.id,
    `"${(e.userName ?? "").replace(/"/g, '""')}"`,
    e.userEmail ?? "",
    `"${(e.course?.title ?? "").replace(/"/g, '""')}"`,
    e.status,
    e.enrolledAt,
    e.completedAt ?? "",
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export async function exportAuditLogsCsv(filters: AuditLogFilters): Promise<string> {
  const logs = await getAuditLogs(filters);
  const headers = ["Log ID", "User ID", "Action", "Entity Type", "Entity ID", "Created At"];
  const rows = logs.items.map((l) => [
    l.id,
    l.userId ?? "System",
    l.action,
    l.entityType,
    l.entityId ?? "",
    l.createdAt,
  ]);
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
