import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  TrendingUp,
  Users,
} from "lucide-react";

import { MetricCard, Panel, Pill, ProgressBar } from "@/components/ds";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock } from "@/components/layout/States";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import * as api from "@/services/api";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — EA Academy" },
      { name: "description", content: "Your learning progress, courses and certificates." },
      { property: "og:title", content: "Dashboard — EA Academy" },
      { property: "og:description", content: "Your learning progress at EA Academy." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["student-stats"],
    queryFn: () => api.getStudentDashboardStats(),
  });

  const { data: enrollments } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: () => api.getMyEnrollments(),
  });

  const { data: instructorStats } = useQuery({
    queryKey: ["instructor-stats"],
    queryFn: () => api.getInstructorDashboardStats(),
    enabled: user?.role === "instructor" || user?.role === "admin",
  });

  const inProgress = (enrollments ?? []).filter((e) => e.status === "active").slice(0, 4);

  return (
    <AppShell
      title={`Good day, ${user?.fullName?.split(" ")[0] ?? "there"}`}
      description="Your learning at a glance"
    >
      {isLoading ? (
        <LoadingBlock rows={2} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Enrolled"
            value={stats?.enrolledCourses ?? 0}
            icon={<BookOpen className="size-4" />}
          />
          <MetricCard
            label="Completed"
            value={stats?.completedCourses ?? 0}
            icon={<CheckCircle2 className="size-4" />}
          />
          <MetricCard
            label="Certificates"
            value={stats?.certificates ?? 0}
            icon={<Award className="size-4" />}
          />
          <MetricCard
            label="Avg. progress"
            value={`${stats?.averageProgress ?? 0}%`}
            icon={<TrendingUp className="size-4" />}
          />
        </div>
      )}

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-1">Continue learning</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/my-courses">All courses</Link>
          </Button>
        </div>
        {!inProgress.length ? (
          <EmptyState
            title="You're not enrolled in anything yet"
            description="Browse the catalogue and pick a programme to begin."
            icon={<BookOpen className="size-6" />}
            action={
              <Button asChild>
                <Link to="/courses">Browse catalogue</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {inProgress.map((e) => (
              <Panel key={e.id} className="overflow-hidden">
                <div className="flex gap-4 p-4">
                  {e.course?.thumbnailUrl && (
                    <img
                      src={e.course.thumbnailUrl}
                      alt={e.course?.title ?? "Course"}
                      loading="lazy"
                      className="hidden size-20 shrink-0 rounded-lg object-cover sm:block"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <Pill variant="neutral">{e.course?.category ?? "Course"}</Pill>
                    <h3 className="mt-2 truncate font-display text-base font-semibold text-ink-1">
                      {e.course?.title}
                    </h3>
                    <ProgressBar value={e.progressPercent ?? 0} className="mt-3" showLabel />
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-ink-4">
                        {e.lessonsCompleted ?? 0}/{e.lessonsTotal ?? 0} lessons
                      </span>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/learn/$courseId" params={{ courseId: e.courseId }}>
                          Resume
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </div>

      {instructorStats && (
        <div className="mt-12">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink-1">Teaching</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Courses"
              value={instructorStats.totalCourses}
              icon={<GraduationCap className="size-4" />}
            />
            <MetricCard
              label="Published"
              value={instructorStats.publishedCourses}
              icon={<CheckCircle2 className="size-4" />}
            />
            <MetricCard
              label="Enrollments"
              value={instructorStats.totalEnrollments}
              icon={<Users className="size-4" />}
            />
            <MetricCard
              label="Completion"
              value={`${instructorStats.completionRate}%`}
              icon={<TrendingUp className="size-4" />}
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}
