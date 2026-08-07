import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate } from "@/components/layout/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
          action={
            <Button asChild>
              <Link to="/courses">Browse catalogue</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((e) => (
            <Card key={e.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {e.course?.category}
                    </p>
                    <h2 className="mt-1.5 text-lg leading-snug">{e.course?.title}</h2>
                  </div>
                  <Badge variant={e.status === "completed" ? "default" : "secondary"}>
                    {e.status}
                  </Badge>
                </div>
                <Progress value={e.progressPercent ?? 0} className="mt-4" />
                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                  <span>Enrolled {formatDate(e.enrolledAt)}</span>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/learn/$courseId" params={{ courseId: e.courseId }}>
                      {e.progressPercent ? "Continue" : "Start"}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
