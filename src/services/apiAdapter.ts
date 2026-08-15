/**
 * LMS Service Interface Contract (Backend Agnostic)
 *
 * Defines the contract that ANY backend adapter (Supabase, Python FastAPI, Django REST)
 * MUST implement. UI components consume services through this interface.
 */

import type {
  AdminPermissionRecord,
  AdminSubRole,
  AuditLog,
  AuditLogFilters,
  AssignmentSubmission,
  BulkEnrollmentInput,
  BulkEnrollmentResult,
  Certificate,
  Cohort,
  Course,
  CourseDetail,
  Enrollment,
  NotificationInput,
  Organization,
  Paginated,
  Payment,
  User,
  UserFilters,
} from "@/types";

export interface LmsApiService {
  // User & Admin RBAC Management
  getUsers(filters: UserFilters): Promise<Paginated<User>>;
  getAdminTeam(): Promise<AdminPermissionRecord[]>;
  assignAdminSubRole(
    userId: string,
    subRole: AdminSubRole,
    permissions: string[],
  ): Promise<AdminPermissionRecord>;

  // Enterprise Organizations & Cohorts
  getOrganizations(): Promise<Organization[]>;
  createOrganization(input: Partial<Organization>): Promise<Organization>;
  getCohorts(organizationId?: string): Promise<Cohort[]>;
  createCohort(input: Partial<Cohort>): Promise<Cohort>;
  bulkEnrollStudents(input: BulkEnrollmentInput): Promise<BulkEnrollmentResult>;

  // Audit Logs & Compliance Center
  getAuditLogs(filters: AuditLogFilters): Promise<Paginated<AuditLog>>;
  exportAuditLogsCsv(filters: AuditLogFilters): Promise<string>;

  // Enterprise Exporters
  exportPaymentsCsv(): Promise<string>;
  exportEnrollmentsCsv(): Promise<string>;

  // Core Learning Services
  getCourses(): Promise<Course[]>;
  getCourseDetail(idOrSlug: string): Promise<CourseDetail>;
  getEnrollments(): Promise<Enrollment[]>;
  getCertificates(): Promise<Certificate[]>;
  getPayments(): Promise<Payment[]>;
}

/**
 * Provider Config
 * Supports toggling between 'supabase' (current) and 'python' (future API refactor).
 */
export const API_PROVIDER: "supabase" | "python" =
  (import.meta.env.VITE_API_PROVIDER as "supabase" | "python") || "supabase";
