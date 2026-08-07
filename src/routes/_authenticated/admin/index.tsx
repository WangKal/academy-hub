import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate, formatPrice } from "@/components/layout/States";
import { Card, CardContent } from "@/components/ui/card";
import * as api from "@/services/api";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin overview — EA Academy" },
      { name: "description", content: "Academy-wide enrolment, revenue and certification metrics." },
      { property: "og:title", content: "Admin overview — EA Academy" },
      { property: "og:description", content: "Academy-wide metrics and recent activity." },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.getAdminDashboardStats(),
  });

  const cards = data
    ? [
        ["Students", data.students],
        ["Instructors", data.instructors],
        ["Courses", `${data.publishedCourses}/${data.courses}`],
        ["Active enrollments", data.activeEnrollments],
        ["Completions", data.completedCourses],
        ["Certificates", data.certificatesIssued],
        ["Revenue", formatPrice(data.revenueCents)],
        ["Pending payments", data.pendingPayments],
      ]
    : [];

  return (
    <AppShell title="Academy overview" description="Everything at a glance">
      {isLoading ? (
        <LoadingBlock rows={2} />
      ) : error ? (
        <EmptyState title="Could not load metrics" description={api.errorMessage(error)} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(([label, value]) => (
              <Card key={String(label)}>
                <CardContent className="p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-3 font-display text-3xl">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="mb-4 mt-10 text-xl">Recent activity</h2>
          <div className="rounded-md border border-border bg-card divide-y divide-border">
            {(data?.recentActivity ?? []).map((a) => (
              <div key={a.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span>
                  <span className="font-medium">{a.userName ?? "System"}</span>{" "}
                  <span className="text-muted-foreground">{a.action.replace(/[._]/g, " ")}</span>
                </span>
                <span className="text-xs text-muted-foreground">{formatDate(a.createdAt)}</span>
              </div>
            ))}
            {!data?.recentActivity?.length && (
              <p className="px-5 py-6 text-sm text-muted-foreground">No activity recorded yet.</p>
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
