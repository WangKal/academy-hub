/**
 * Application-level domain types.
 *
 * These are the ONLY shapes the UI is allowed to know about. They are
 * deliberately backend-agnostic: today `src/services/api.ts` maps Supabase
 * rows into these objects; tomorrow it will map JSON from a Python API.
 */

export type UserRole = "student" | "instructor" | "admin" | "auditor";
export type UserStatus = "active" | "suspended" | "pending";
export type CourseStatus = "draft" | "published" | "archived";
export type CourseLevel = "beginner" | "intermediate" | "advanced";
export type LessonType = "video" | "text" | "quiz" | "assignment";
export type LessonStatus = "draft" | "published";
export type EnrollmentStatus = "pending" | "active" | "completed" | "cancelled" | "refunded";
export type ProgressStatus = "not_started" | "in_progress" | "completed";
export type CertificateStatus = "issued" | "revoked";
export type PaymentProvider = "mpesa" | "stripe" | "manual";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

/* -------------------------------------------------------------------------- */
/* Authorization foundation                                                   */
/* -------------------------------------------------------------------------- */

export type AdminSubRole =
  | "super_admin"
  | "platform_admin"
  | "academic_admin"
  | "finance_admin"
  | "user_admin"
  | "compliance_admin"
  | "org_admin";

export type OrganizationType = "administrative" | "sponsor" | "hybrid";

export type OrganizationRelationship =
  "administrator" | "member" | "sponsor" | "participant" | "provider" | "auditor";

export type ResourceRelationship =
  "owner" | "instructor" | "student" | "grader" | "sponsor" | "auditor";

export type OrganizationScope = "all" | "selected";

export type Resource =
  | "users"
  | "students"
  | "instructors"
  | "organizations"
  | "courses"
  | "modules"
  | "lessons"
  | "assignments"
  | "lesson_content"
  | "assessments"
  | "submissions"
  | "grades"
  | "enrollments"
  | "learning"
  | "progress"
  | "certificates"
  | "sponsorships"
  | "payments"
  | "audit"
  | "settings"
  | "admins";

export type Action =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "publish"
  | "unpublish"
  | "archive"
  | "reorder"
  | "submit"
  | "review"
  | "approve"
  | "grade"
  | "return"
  | "award"
  | "revoke"
  | "reissue"
  | "override"
  | "suspend"
  | "assign"
  | "participate"
  | "complete"
  | "update"
  | "cancel"
  | "allocate"
  | "withdraw"
  | "export"
  | "refund"
  | "manage";

/**
 * Permission keys are deliberately backend-agnostic.
 *
 * Python will use exactly the same string values.
 *
 * Example:
 *   courses.edit
 *   lessons.delete
 *   grades.override
 *   audit.view
 */
export type PermissionKey = `${Resource}.${Action}`;

/**
 * Legacy keys are retained temporarily so existing Supabase records do not
 * immediately become invalid when the new granular model is introduced.
 *
 * These should disappear after the database permission migration is complete.
 */
export type LegacyAdminPermissionKey =
  | "manage_users"
  | "manage_courses"
  | "manage_payments"
  | "manage_settings"
  | "view_audit_logs"
  | "manage_admins"
  | "manage_organizations";

export type AdminPermissionKey = PermissionKey | LegacyAdminPermissionKey;

export interface OrganizationRelationshipRecord {
  organizationId: string;
  organizationType?: OrganizationType;
  relationship: OrganizationRelationship;
}

export interface ResourceRelationshipRecord {
  resource: Resource;
  resourceId: string;
  relationship: ResourceRelationship;
  organizationId?: string;
}

export interface AuthorizationContext {
  resourceId?: string;

  organizationId?: string;

  /**
   * Resource owner / instructor context.
   */
  ownerId?: string;
  instructorId?: string;

  /**
   * Student context.
   */
  studentId?: string;
  enrolledStudentId?: string;

  /**
   * Sponsor context.
   */
  sponsorOrganizationId?: string;

  /**
   * Auditor context.
   */
  auditorId?: string;
  auditorOrganizationId?: string;

  /**
   * Explicit relationships already resolved by the service layer.
   *
   * This is useful while the Supabase schema is still evolving and will map
   * naturally to backend relationship resolution later.
   */
  relationship?: ResourceRelationship;
}

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  status: UserStatus;

  /**
   * Only meaningful for admin users.
   */
  adminSubRole?: AdminSubRole;

  /**
   * Effective permissions returned by the backend/data layer.
   *
   * These are capabilities, not UI flags.
   */
  permissions?: AdminPermissionKey[];

  /**
   * Administrative organization scope.
   *
   * This does NOT mean the user belongs to these organizations socially.
   * It means the administrator is allowed to operate within them.
   */
  organizationIds?: string[];

  organizationScope?: OrganizationScope;

  /**
   * Explicit organization relationships.
   *
   * Examples:
   *   KCB -> sponsor
   *   University X -> administrator
   *   Organization Y -> member
   */
  organizationRelationships?: OrganizationRelationshipRecord[];

  /**
   * Resource-level relationships.
   *
   * Examples:
   *   instructor -> Course A
   *   student -> Course B
   *   sponsor -> Student C
   */
  resourceRelationships?: ResourceRelationshipRecord[];
}


export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  descriptionHtml: string;
  instructorId: string;
  instructorName?: string;
  status: CourseStatus;
  priceCents: number;
  currency: string;
  thumbnailUrl?: string;
  category: string;
  level: CourseLevel;
  createdAt: string;
  updatedAt: string;
  /** Derived aggregates (optional; present on list/detail reads). */
  enrollmentCount?: number;
  lessonCount?: number;
  totalDurationSeconds?: number;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  descriptionHtml: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  lessonType: LessonType;
  contentHtml: string;
  videoUrl?: string;
  durationSeconds: number;
  isPreview: boolean;
  orderIndex: number;
  status: LessonStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CourseOutlineModule extends Module {
  lessons: Lesson[];
}

export interface CourseDetail extends Course {
  modules: CourseOutlineModule[];
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  /** Denormalised for list views. */
  course?: Course;
  userName?: string;
  userEmail?: string;
  progressPercent?: number;
  lessonsCompleted?: number;
  lessonsTotal?: number;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  status: ProgressStatus;
  lastPositionSeconds: number;
  completedAt?: string;
  updatedAt: string;
}

export interface CourseProgress {
  courseId: string;
  lessonsTotal: number;
  lessonsCompleted: number;
  percent: number;
  lastLessonId?: string;
  isComplete: boolean;
}

export interface QuizOption {
  id: string;
  questionId: string;
  optionText: string;
  /** Never sent to students before submission. */
  isCorrect?: boolean;
  orderIndex: number;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  orderIndex: number;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  passingScorePercent: number;
  createdAt: string;
  updatedAt: string;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  scorePercent: number;
  passed: boolean;
  startedAt: string;
  submittedAt: string;
  userName?: string;
}

export interface QuizResult {
  attempt: QuizAttempt;
  passingScorePercent: number;
  correctByQuestionId: Record<string, string>;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  certificateCode: string;
  issuedAt: string;
  revokedAt?: string;
  certificateUrl?: string;
  status: CertificateStatus;
  courseTitle?: string;
  userName?: string;
}

export type PaymentPurpose = "enrollment" | "course" | "sponsorship" | "organization" | "other";

export interface Payment {
  id: string;
  userId: string;
  courseId: string;

  amountCents: number;
  currency: string;
  provider: PaymentProvider;
  providerReference?: string;
  status: PaymentStatus;

  purpose?: PaymentPurpose;
  organizationId?: string;
  sponsorshipId?: string;
  enrollmentId?: string;

  createdAt: string;
  updatedAt: string;

  courseTitle?: string;
  userName?: string;
  userEmail?: string;
}

export interface AuditLog {
  id: string;

  userId?: string;
  userName?: string;

  action: string;

  entityType: string;
  entityId?: string;

  /**
   * Optional organizational context.
   *
   * An audit event may have no organization at all.
   */
  organizationId?: string;
  organizationName?: string;

  /**
   * Optional auditor context.
   */
  auditorId?: string;
  auditorOrganizationId?: string;

  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AcademySettings {
  academyName: string;
  supportEmail: string;
  defaultCurrency: string;
  certificatePrefix: string;
  allowSelfEnrollment: boolean;
}

/* ----------------------------- Filters ----------------------------- */

export interface CourseFilters {
  search?: string;
  status?: CourseStatus | "all";
  category?: string | "all";
  level?: CourseLevel | "all";
  instructorId?: string;
  sort?: "newest" | "oldest" | "title" | "price_asc" | "price_desc";
  page?: number;
  pageSize?: number;
}

export interface UserFilters {
  search?: string;
  role?: UserRole | "all";
  status?: UserStatus | "all";
  page?: number;
  pageSize?: number;
}

export interface PaymentFilters {
  search?: string;
  status?: PaymentStatus | "all";
  provider?: PaymentProvider | "all";
  page?: number;
  pageSize?: number;
}

export interface EnrollmentFilters {
  search?: string;
  status?: EnrollmentStatus | "all";
  courseId?: string;
  page?: number;
  pageSize?: number;
}

export interface CertificateFilters {
  search?: string;
  status?: CertificateStatus | "all";
  page?: number;
  pageSize?: number;
}

export interface AuditLogFilters {
  search?: string;
  entityType?: string | "all";
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/* --------------------------- Dashboards ---------------------------- */

export interface StudentDashboardStats {
  enrolledCourses: number;
  completedCourses: number;
  certificates: number;
  averageProgress: number;
  lessonsCompleted: number;
  pendingQuizzes: number;
}

export interface InstructorDashboardStats {
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  completionRate: number;
  averageQuizScore: number;
  studentsPerCourse: { courseId: string; title: string; students: number }[];
}

export interface CourseAnalytics {
  courseId: string;
  title: string;
  enrolled: number;
  active: number;
  completed: number;
  completionRate: number;
  averageProgress: number;
  averageQuizScore: number;
  progressDistribution: { bucket: string; students: number }[];
  quizPerformance: {
    quizId: string;
    title: string;
    attempts: number;
    averageScore: number;
    passRate: number;
  }[];
}

export interface AdminDashboardStats {
  students: number;
  instructors: number;
  courses: number;
  publishedCourses: number;
  activeEnrollments: number;
  completedCourses: number;
  certificatesIssued: number;
  revenueCents: number;
  pendingPayments: number;
  enrollmentsByMonth: { month: string; enrollments: number }[];
  coursesByStatus: { status: string; count: number }[];
  recentActivity: AuditLog[];
}

/* ----------------------------- Errors ------------------------------ */

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

/* ----------------------------- Inputs ------------------------------ */

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  role?: Extract<UserRole, "student" | "instructor">;
}

export interface CourseInput {
  title: string;
  slug?: string;
  shortDescription: string;
  descriptionHtml: string;
  priceCents: number;
  currency: string;
  category: string;
  level: CourseLevel;
  thumbnailUrl?: string;
  status?: CourseStatus;
}

export interface ModuleInput {
  courseId: string;
  title: string;
  descriptionHtml?: string;
  orderIndex?: number;
}

export interface LessonInput {
  moduleId: string;
  title: string;
  lessonType: LessonType;
  contentHtml?: string;
  videoUrl?: string;
  durationSeconds?: number;
  isPreview?: boolean;
  orderIndex?: number;
  status?: LessonStatus;
}

export interface QuizInput {
  lessonId: string;
  title: string;
  passingScorePercent: number;
}

export interface PaymentInput {
  courseId: string;
  provider: PaymentProvider;
  amountCents: number;
  currency: string;
  providerReference?: string;
}

/* -------------------------- Notifications -------------------------- */

export type NotificationType =
  "general" | "enrollment" | "certificate" | "payment" | "assignment" | "course";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  readAt?: string;
  createdAt: string;
}

export interface NotificationInput {
  userId: string;
  type?: NotificationType;
  title: string;
  body?: string;
  link?: string;
}

/* --------------------------- Assignments --------------------------- */

export type SubmissionStatus = "submitted" | "graded" | "returned";

export interface AssignmentSubmission {
  id: string;
  lessonId: string;
  userId: string;
  contentText: string;
  attachmentUrl?: string;
  status: SubmissionStatus;
  grade?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
  createdAt: string;
  updatedAt: string;
  /** Denormalised for review lists. */
  lessonTitle?: string;
  courseId?: string;
  courseTitle?: string;
  userName?: string;
  userEmail?: string;
}

export interface AssignmentSubmissionInput {
  lessonId: string;
  contentText: string;
  attachmentUrl?: string;
}

/* ------------------ Enterprise & Multi-Admin Management -------------- */
export interface AdminPermissionRecord {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  subRole: AdminSubRole;
  permissions: AdminPermissionKey[];
  grantedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  type?: OrganizationType;

  contactEmail: string;
  domain?: string;
  logoUrl?: string;

  maxSeats: number;
  activeSeats?: number;

  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  userName?: string;
  userEmail?: string;

  /**
   * Existing database roles remain supported.
   */
  orgRole: "manager" | "member";

  /**
   * New semantic relationship.
   *
   * Optional until the Supabase schema is migrated.
   */
  relationship?: OrganizationRelationship;

  createdAt: string;
}

export interface Cohort {
  id: string;
  organizationId: string;
  organizationName?: string;
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  studentCount?: number;
}

export interface BulkEnrollmentInput {
  emails: string[];
  courseId: string;
  organizationId?: string;
  cohortId?: string;
}

export interface BulkEnrollmentResult {
  successfulEmails: string[];
  failedEmails: { email: string; reason: string }[];
  totalProcessed: number;
}
