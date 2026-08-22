import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@/lib/router";
import { Award, BookOpen, CheckCircle2, Flame, GraduationCap, Play, Trophy } from "lucide-react";

import { MetricCard, Panel, Pill, ProgressBar } from "@/components/ds";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDuration } from "@/components/layout/States";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import * as api from "@/services/api";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Academy Hub" },
      { name: "description", content: "Your learning progress, courses and certificates." },
      { property: "og:title", content: "Dashboard — Academy Hub" },
      { property: "og:description", content: "Your learning progress at Academy Hub." },
    ],
  }),
  component: Dashboard,
});

function AdminDashboard() {
  const { user } = useAuth();
  if (!user?.adminSubRoles?.length && !user?.adminSubRole) {
    return <AppShell title="Administrator setup required" description="Your account has the admin role but no administrative tier has been assigned.">
      <Panel className="max-w-2xl p-6"><h2 className="font-display text-xl font-semibold">Administrator is not provisioned</h2><p className="mt-2 text-sm text-ink-4">An administrator must have at least one explicit tier before administrative permissions are granted. No tier is assumed automatically.</p><div className="mt-4 rounded-lg bg-surface-2 p-4 text-sm"><strong>Current state:</strong> admin identity present · administrative tier missing · effective permissions none</div></Panel>
    </AppShell>;
  }
  const { data: stats, isLoading, error } = useQuery({ queryKey: ["admin-dashboard"], queryFn: api.getAdminDashboardStats, enabled: !!user });
  return <AppShell title={`Good day, ${user?.fullName?.split(" ")[0] ?? "administrator"}.`} description="Your administrative workspace and academy operations.">
    {isLoading ? <LoadingBlock rows={2} /> : error ? <EmptyState title="Could not load administration dashboard" description={api.errorMessage(error)} /> : <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><MetricCard label="Students" value={stats?.students ?? 0} icon={<BookOpen className="size-4" />} /><MetricCard label="Instructors" value={stats?.instructors ?? 0} icon={<GraduationCap className="size-4" />} /><MetricCard label="Courses" value={stats?.courses ?? 0} icon={<BookOpen className="size-4" />} /><MetricCard label="Active enrollments" value={stats?.activeEnrollments ?? 0} icon={<Trophy className="size-4" />} /></div><div className="mt-8 grid gap-4 md:grid-cols-2"><Panel className="p-5"><h2 className="font-display text-lg font-semibold">Administration</h2><p className="mt-1 text-sm text-ink-4">Manage users, administrators, organizations, courses, enrollments, payments and audit.</p><div className="mt-4 flex flex-wrap gap-2"><Button asChild><Link to="/admin/users">Users</Link></Button><Button asChild variant="outline"><Link to="/admin/courses">Courses</Link></Button><Button asChild variant="outline"><Link to="/admin/organizations">Organizations</Link></Button><Button asChild variant="outline"><Link to="/admin/team">Administrators</Link></Button></div></Panel><Panel className="p-5"><h2 className="font-display text-lg font-semibold">Recent activity</h2><div className="mt-3 space-y-2">{(stats?.recentActivity ?? []).slice(0,6).map((a) => <div key={a.id} className="rounded border border-edge px-3 py-2 text-xs"><span className="font-medium">{a.action}</span><span className="ml-2 text-ink-4">{a.entityType}</span></div>)}</div></Panel></div></>}
  </AppShell>;
}

function InstructorDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading, error } = useQuery({ queryKey: ["instructor-dashboard"], queryFn: api.getInstructorDashboardStats, enabled: !!user });
  const { data: courses = [] } = useQuery({ queryKey: ["my-teaching"], queryFn: api.getInstructorCourses, enabled: !!user });
  return <AppShell title={`Good day, ${user?.fullName?.split(" ")[0] ?? "instructor"}.`} description="Your teaching workspace, curriculum and learner activity.">
    {isLoading ? <LoadingBlock rows={2} /> : error ? <EmptyState title="Could not load teaching dashboard" description={api.errorMessage(error)} /> : <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><MetricCard label="Courses" value={stats?.totalCourses ?? 0} icon={<BookOpen className="size-4" />} /><MetricCard label="Published" value={stats?.publishedCourses ?? 0} icon={<CheckCircle2 className="size-4" />} /><MetricCard label="Learners" value={stats?.totalEnrollments ?? 0} icon={<GraduationCap className="size-4" />} /><MetricCard label="Completion" value={`${stats?.completionRate ?? 0}%`} icon={<Trophy className="size-4" />} /></div><div className="mt-8 flex items-center justify-between"><h2 className="font-display text-xl font-semibold">My Teaching</h2><Button asChild><Link to="/instructor/courses">Open teaching workspace</Link></Button></div><div className="mt-4 grid gap-4 md:grid-cols-2">{courses.slice(0,6).map((c) => <Panel key={c.id} className="p-5"><div className="flex items-center justify-between"><Pill variant={c.status === "published" ? "success" : "neutral"}>{c.status}</Pill><span className="text-xs text-ink-4">{c.enrollmentCount ?? 0} learners</span></div><h3 className="mt-3 font-display text-lg font-semibold">{c.title}</h3><p className="text-xs text-ink-4">{c.lessonCount ?? 0} lessons · {c.instructorNames?.length ?? 1} instructors</p><div className="mt-4 flex gap-2"><Button asChild size="sm"><Link to="/instructor/courses/$courseId" params={{ courseId: c.id }}>Manage course</Link></Button><Button asChild size="sm" variant="outline"><Link to="/instructor/courses/$courseId/students" params={{ courseId: c.id }}>Learners</Link></Button></div></Panel>)}</div></>}
  </AppShell>;
}

function Dashboard() {
  const { user } = useAuth();
  const [dismissedTip, setDismissedTip] = useState(false);

  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "instructor") return <InstructorDashboard />;

  const { data: stats, isLoading } = useQuery({
    queryKey: ["student-stats"],
    queryFn: () => api.getStudentDashboardStats(),
    enabled: user?.role === "student",
  });

  const { data: enrollments } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: () => api.getMyEnrollments(),
    enabled: user?.role === "student",
  });

  const { data: certificates } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: () => api.getMyCertificates(),
    enabled: user?.role === "student",
  });
  const { data: teachingStats } = useQuery({
    queryKey: ["instructor-dashboard-stats"],
    queryFn: () => api.getInstructorDashboardStats(),
    enabled: user?.role === "instructor",
  });
  const { data: teachingCourses = [] } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: () => api.getInstructorCourses(),
    enabled: user?.role === "instructor",
  });

  const activeEnrollments = (enrollments ?? []).filter((e) => e.status === "active");
  const completedEnrollments = (enrollments ?? []).filter((e) => e.status === "completed");
  const primaryEnrollment = activeEnrollments[0];

  return (
    <AppShell
      title={`Good day, ${user?.fullName?.split(" ")[0] ?? "learner"}.`}
      description={user?.role === "instructor" ? "Your teaching workspace, courses and learner activity." : "Here's where you are in your learning journey."}
    >
      {user?.role === "instructor" && (
        <Panel className="mb-8 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2"><Badge variant="secondary">Instructor workspace</Badge><span className="text-xs text-ink-4">{teachingStats?.totalCourses ?? 0} courses · {teachingStats?.totalEnrollments ?? 0} enrollments</span></div>
              <h2 className="mt-2 font-display text-xl font-semibold">My Teaching</h2>
              <p className="text-sm text-ink-4">Manage curriculum, instructors, learners, submissions and course delivery from the same reusable course workspace.</p>
            </div>
            <Button asChild><Link to="/instructor/courses">Open teaching workspace →</Link></Button>
          </div>
          {teachingCourses.length > 0 && <div className="mt-4 grid gap-3 md:grid-cols-3">
            {teachingCourses.slice(0, 3).map((course) => <Link key={course.id} to="/instructor/courses/$courseId" params={{ courseId: course.id }} className="rounded-lg border border-edge p-3 hover:bg-surface-2">
              <p className="truncate text-sm font-semibold">{course.title}</p><p className="mt-1 text-xs text-ink-4">{course.lessonCount ?? 0} lessons · {course.enrollmentCount ?? 0} learners</p>
            </Link>)}
          </div>}
        </Panel>
      )}
      {/* Streak Banner */}
      {!dismissedTip && (
        <div className="mb-6 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div className="flex-1 text-xs sm:text-sm">
            <span className="font-semibold text-indigo-900 dark:text-indigo-200">
              5-day learning streak — keep it going!
            </span>
            <span className="text-indigo-700 dark:text-indigo-400 ml-2 hidden sm:inline">
              You are 2 lessons away from hitting your weekly target.
            </span>
          </div>
          <button
            onClick={() => setDismissedTip(true)}
            className="text-indigo-400 hover:text-indigo-600 text-lg leading-none p-1"
          >
            ×
          </button>
        </div>
      )}

      {isLoading ? (
        <LoadingBlock rows={2} />
      ) : (
        <>
          {/* Primary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <MetricCard
              label="Enrolled"
              value={stats?.enrolledCourses ?? enrollments?.length ?? 0}
              icon={<BookOpen className="w-4 h-4" />}
            />
            <MetricCard
              label="Completed"
              value={stats?.completedCourses ?? completedEnrollments.length}
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            />
            <MetricCard
              label="Certificates"
              value={certificates?.length ?? stats?.certificates ?? 0}
              icon={<Award className="w-4 h-4 text-indigo-600" />}
            />
            <MetricCard
              label="Lessons done"
              value={stats?.lessonsCompleted ?? 0}
              icon={<Trophy className="w-4 h-4 text-amber-600" />}
            />
          </div>

          {/* Continue Learning Callout */}
          {primaryEnrollment && primaryEnrollment.course && (
            <Panel className="p-6 mb-8 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl border-none shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 mb-3 border border-indigo-400/20">
                    <Play className="w-3 h-3 fill-current" /> Continue where you left off
                  </div>
                  <h2 className="font-display text-2xl font-semibold mb-2">
                    {primaryEnrollment.course.title}
                  </h2>
                  <p className="text-sm text-indigo-200 line-clamp-2 mb-4">
                    {primaryEnrollment.course.shortDescription}
                  </p>
                  <div className="w-full max-w-sm">
                    <ProgressBar value={primaryEnrollment.progressPercent || 0} showLabel />
                  </div>
                </div>

                <Button
                  asChild
                  size="lg"
                  className="bg-white text-indigo-900 hover:bg-indigo-50 rounded-xl font-semibold shrink-0"
                >
                  <Link to="/learn/$courseId" params={{ courseId: primaryEnrollment.courseId }}>
                    Resume course →
                  </Link>
                </Button>
              </div>
            </Panel>
          )}

          {/* In progress grid & Certificates side by side */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-ink-1">My Active Courses</h2>
                <Link
                  to="/my-courses"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View all →
                </Link>
              </div>

              {!activeEnrollments.length ? (
                <EmptyState
                  title="No active courses"
                  description="Browse the course catalogue to start learning today."
                  action={
                    <Button asChild size="sm" className="rounded-xl">
                      <Link to="/courses">Browse catalogue</Link>
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {activeEnrollments.map((e) => (
                    <Panel
                      key={e.id}
                      className="p-4 rounded-2xl flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-mono text-ink-4 mb-1">
                          {e.course?.category} · {e.course?.level}
                        </div>
                        <h3 className="font-semibold text-ink-1 text-sm truncate mb-2">
                          {e.course?.title}
                        </h3>
                        <ProgressBar value={e.progressPercent || 0} showLabel />
                      </div>
                      <Button asChild size="sm" variant="outline" className="rounded-xl shrink-0">
                        <Link to="/learn/$courseId" params={{ courseId: e.courseId }}>
                          Continue
                        </Link>
                      </Button>
                    </Panel>
                  ))}
                </div>
              )}
            </div>

            {/* Certificates side widget */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-ink-1">My Certificates</h2>
                <Link
                  to="/my-certificates"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  View all →
                </Link>
              </div>

              {!certificates?.length ? (
                <Panel className="p-5 text-center rounded-2xl">
                  <Award className="w-8 h-8 mx-auto text-ink-4 mb-2" />
                  <p className="text-sm font-semibold text-ink-2 mb-1">No certificates yet</p>
                  <p className="text-xs text-ink-4">
                    Complete 100% of any course to earn your verified credential.
                  </p>
                </Panel>
              ) : (
                <div className="space-y-3">
                  {certificates.slice(0, 3).map((cert) => (
                    <Panel key={cert.id} className="p-4 rounded-2xl border-l-4 border-l-indigo-600">
                      <div className="flex items-center gap-3">
                        <Award className="w-6 h-6 text-indigo-600 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-ink-1 text-sm truncate">
                            {cert.courseTitle}
                          </h4>
                          <p className="text-xs font-mono text-ink-4">{cert.certificateCode}</p>
                        </div>
                      </div>
                    </Panel>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
