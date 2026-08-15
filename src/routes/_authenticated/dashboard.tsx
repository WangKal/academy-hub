import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Award, BookOpen, CheckCircle2, Flame, GraduationCap, Play, Trophy } from "lucide-react";

import { MetricCard, Panel, Pill, ProgressBar } from "@/components/ds";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDuration } from "@/components/layout/States";
import { Button } from "@/components/ui/button";
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

function Dashboard() {
  const { user } = useAuth();
  const [dismissedTip, setDismissedTip] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["student-stats"],
    queryFn: () => api.getStudentDashboardStats(),
  });

  const { data: enrollments } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: () => api.getMyEnrollments(),
  });

  const { data: certificates } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: () => api.getMyCertificates(),
  });

  const activeEnrollments = (enrollments ?? []).filter((e) => e.status === "active");
  const completedEnrollments = (enrollments ?? []).filter((e) => e.status === "completed");
  const primaryEnrollment = activeEnrollments[0];

  return (
    <AppShell
      title={`Good day, ${user?.fullName?.split(" ")[0] ?? "learner"}.`}
      description="Here's where you are in your learning journey."
    >
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
