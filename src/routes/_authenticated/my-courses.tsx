import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Library } from "lucide-react";

import { Panel, Pill, ProgressBar } from "@/components/ds";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate } from "@/components/layout/States";
import { Button } from "@/components/ui/button";
import * as api from "@/services/api";

export const Route = createFileRoute("/_authenticated/my-courses")({
  head: () => ({
    meta: [
      { title: "My courses — EA Academy" },
      { name: "description", content: "Every course you are enrolled in and your progress." },
      { property: "og:title", content: "My courses — EA Academy" },
      { property: "og:description", content: "Your enrolled EA Academy courses." },
    ],
  }),
  component: MyCourses,
});

function MyCourses() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: () => api.getMyEnrollments(),
  });

  return (
    <AppShell title="My courses" description="Everything you're enrolled in">
      {isLoading ? (
        <LoadingBlock />
      ) : error ? (
        <EmptyState title="Could not load your courses" description={api.errorMessage(error)} />
      ) : !data?.length ? (
        <EmptyState
          title="No enrolments yet"
          description="Pick a programme from the catalogue to get started."
          icon={<Library className="size-6" />}
          action={
            <Button asChild>
              <Link to="/courses">Browse catalogue</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((e) => (
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
                  <div className="flex items-start justify-between gap-3">
                    <Pill variant="neutral">{e.course?.category ?? "Course"}</Pill>
                    <Pill variant={e.status === "completed" ? "success" : "info"}>{e.status}</Pill>
                  </div>
                  <h2 className="mt-2 truncate font-display text-base font-semibold text-ink-1">
                    {e.course?.title}
                  </h2>
                  <ProgressBar value={e.progressPercent ?? 0} className="mt-3" showLabel />
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-ink-4">
                      Enrolled {formatDate(e.enrolledAt)}
                    </span>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/learn/$courseId" params={{ courseId: e.courseId }}>
                        {e.progressPercent ? "Continue" : "Start"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </AppShell>
  );
}
