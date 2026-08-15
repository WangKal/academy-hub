import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Award,
  BookOpen,
  CreditCard,
  GraduationCap,
  ScrollText,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { MetricCard, Panel } from "@/components/ds";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate, formatPrice } from "@/components/layout/States";
import * as api from "@/services/api";

export const Route = createFileRoute("/_authenticated/admin/")({
  beforeLoad: ({ context }) => {
    const user = (context as any).user;
    if (!user || user.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Admin overview — EA Academy" },
      {
        name: "description",
        content: "Academy-wide enrolment, revenue and certification metrics.",
      },
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

  const cards: Array<[string, string | number, ReactNode]> = data
    ? [
        ["Students", data.students, <Users className="size-4" key="s" />],
        ["Instructors", data.instructors, <GraduationCap className="size-4" key="i" />],
        [
          "Courses",
          `${data.publishedCourses}/${data.courses}`,
          <BookOpen className="size-4" key="c" />,
        ],
        ["Active enrollments", data.activeEnrollments, <ScrollText className="size-4" key="e" />],
        ["Completions", data.completedCourses, <TrendingUp className="size-4" key="x" />],
        ["Certificates", data.certificatesIssued, <Award className="size-4" key="a" />],
        ["Revenue", formatPrice(data.revenueCents), <Wallet className="size-4" key="r" />],
        ["Pending payments", data.pendingPayments, <CreditCard className="size-4" key="p" />],
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
            {cards.map(([label, value, icon]) => (
              <MetricCard key={label} label={label} value={value} icon={icon} />
            ))}
          </div>

          <h2 className="mb-4 mt-10 font-display text-lg font-semibold text-ink-1">
            Recent activity
          </h2>
          <Panel className="divide-y divide-edge">
            {(data?.recentActivity ?? []).map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <span className="min-w-0 truncate">
                  <span className="font-medium text-ink-1">{a.userName ?? "System"}</span>{" "}
                  <span className="text-ink-3">{a.action.replace(/[._]/g, " ")}</span>
                </span>
                <span className="shrink-0 font-mono text-xs text-ink-4">
                  {formatDate(a.createdAt)}
                </span>
              </div>
            ))}
            {!data?.recentActivity?.length && (
              <p className="px-5 py-6 text-sm text-ink-3">No activity recorded yet.</p>
            )}
          </Panel>
        </>
      )}
    </AppShell>
  );
}
