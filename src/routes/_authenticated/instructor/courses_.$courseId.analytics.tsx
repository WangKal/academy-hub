import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useParams } from "@/lib/router";
import { BarChart3, Users, Award, ClipboardCheck } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock } from "@/components/layout/States";
import { Panel } from "@/components/ds";
import { Progress } from "@/components/ui/progress";
import { can } from "@/services/permissions";
import * as api from "@/services/api";

export const Route = createFileRoute("/_authenticated/instructor/courses_/$courseId/analytics")({
  beforeLoad: ({ context }) => {
    const user = (context as any).user;
    if (!user || !(can(user, "courses", "view_statistics", { instructorId: user.id }) || (user.role === "admin" && can(user, "courses", "view_statistics")))) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: CourseAnalyticsPage,
});

function CourseAnalyticsPage() {
  const { courseId } = useParams({ from: "/_authenticated/instructor/courses_/$courseId/analytics" });
  const { data, isLoading, error } = useQuery({
    queryKey: ["course-analytics", courseId],
    queryFn: () => api.getCourseAnalytics(courseId),
  });

  if (isLoading) return <AppShell title="Course analytics"><LoadingBlock rows={5} /></AppShell>;
  if (error || !data) return <AppShell title="Course analytics"><EmptyState title="Could not load analytics" description={api.errorMessage(error)} /></AppShell>;

  return (
    <AppShell title={data.title} description="Course performance, learner progress and assessment outcomes">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={Users} label="Enrolled" value={data.enrolled} />
        <Metric icon={Users} label="Active" value={data.active} />
        <Metric icon={Award} label="Completion rate" value={`${data.completionRate}%`} />
        <Metric icon={ClipboardCheck} label="Average quiz" value={`${data.averageQuizScore}%`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel className="p-5">
          <h2 className="font-display font-semibold">Learner progress</h2>
          <div className="mt-5 space-y-4">
            {data.progressDistribution.map((b) => (
              <div key={b.bucket}>
                <div className="mb-1 flex justify-between text-xs"><span>{b.bucket}</span><span>{b.students}</span></div>
                <Progress value={data.enrolled ? (b.students / data.enrolled) * 100 : 0} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="p-5">
          <h2 className="font-display font-semibold">Quiz performance</h2>
          {!data.quizPerformance.length ? (
            <p className="mt-4 text-sm text-ink-3">No quiz attempts yet.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {data.quizPerformance.map((q) => (
                <div key={q.quizId} className="rounded-lg border border-edge p-3">
                  <div className="flex justify-between gap-3 text-sm font-medium"><span>{q.title}</span><span>{q.averageScore}%</span></div>
                  <div className="mt-2 flex justify-between text-xs text-ink-3"><span>{q.attempts} attempts</span><span>{q.passRate}% pass rate</span></div>
                  <Progress className="mt-2" value={q.averageScore} />
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string | number }) {
  return <Panel className="p-5"><Icon className="size-5 text-brand-600" /><p className="mt-3 text-xs text-ink-3">{label}</p><p className="mt-1 text-2xl font-display font-semibold">{value}</p></Panel>;
}
