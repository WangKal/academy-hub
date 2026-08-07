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

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock } from "@/components/layout/States";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Award;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          <Icon className="size-4 text-accent" />
        </div>
        <p className="mt-3 font-display text-3xl">{value}</p>
      </CardContent>
    </Card>
  );
}

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
          <Stat icon={BookOpen} label="Enrolled" value={stats?.enrolledCourses ?? 0} />
          <Stat icon={CheckCircle2} label="Completed" value={stats?.completedCourses ?? 0} />
          <Stat icon={Award} label="Certificates" value={stats?.certificates ?? 0} />
          <Stat icon={TrendingUp} label="Avg. progress" value={`${stats?.averageProgress ?? 0}%`} />
        </div>
      )}

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl">Continue learning</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/my-courses">All courses</Link>
          </Button>
        </div>
        {!inProgress.length ? (
          <EmptyState
            title="You're not enrolled in anything yet"
            description="Browse the catalogue and pick a programme to begin."
            action={
              <Button asChild>
                <Link to="/courses">Browse catalogue</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {inProgress.map((e) => (
              <Card key={e.id}>
                <CardContent className="p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {e.course?.category}
                  </p>
                  <h3 className="mt-2 text-lg leading-snug">{e.course?.title}</h3>
                  <Progress value={e.progressPercent ?? 0} className="mt-4" />
                  <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {e.lessonsCompleted ?? 0}/{e.lessonsTotal ?? 0} lessons ·{" "}
                      {e.progressPercent ?? 0}%
                    </span>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/learn/$courseId" params={{ courseId: e.courseId }}>
                        Resume
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {instructorStats && (
        <div className="mt-12">
          <h2 className="mb-4 text-xl">Teaching</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={GraduationCap} label="Courses" value={instructorStats.totalCourses} />
            <Stat icon={CheckCircle2} label="Published" value={instructorStats.publishedCourses} />
            <Stat icon={Users} label="Enrollments" value={instructorStats.totalEnrollments} />
            <Stat
              icon={TrendingUp}
              label="Completion"
              value={`${instructorStats.completionRate}%`}
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}
