import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@/lib/router";
import { can } from "@/services/permissions";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { EmptyState, LoadingBlock, formatDate } from "@/components/layout/States";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as api from "@/services/api";

export const Route = createFileRoute("/_authenticated/admin/enrollments")({
  beforeLoad: ({ context }) => {
    const user = (context as any).user;
    if (!user || !can(user, "enrollments", "view")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Enrollments — EA Academy admin" },
      { name: "description", content: "All course enrollments across the academy." },
      { property: "og:title", content: "Enrollments — EA Academy admin" },
      { property: "og:description", content: "All course enrollments across the academy." },
    ],
  }),
  component: AdminEnrollments,
});

function AdminEnrollments() {
  const { user } = useAuth();
  const canManage = !!user && can(user, "enrollments", "manage");
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-enrollments", search],
    queryFn: () => api.getEnrollments({ search, pageSize: 50 }),
  });

  return (
    <AppShell title="Enrollments" description="Every learner on every course" actions={<Button variant="outline" size="sm" onClick={async () => { try { const csv = await api.exportEnrollmentsCsv(); const blob = new Blob([csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `academy-enrollments-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url); } catch (e) { /* surface through browser toast not required for export */ } }}>Export CSV</Button>}>
      <Input
        placeholder="Search learner or course…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-5 max-w-xs"
      />
      {isLoading ? (
        <LoadingBlock />
      ) : error ? (
        <EmptyState title="Could not load enrollments" description={api.errorMessage(error)} />
      ) : !data?.items.length ? (
        <EmptyState title="No enrollments found" />
      ) : (
        <div className="rounded-xl border border-edge bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Learner</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Enrolled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <p className="font-medium">{e.userName}</p>
                    <p className="text-xs text-ink-3">{e.userEmail}</p>
                  </TableCell>
                  <TableCell>{e.course?.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{e.status}</Badge>
                  </TableCell>
                  <TableCell>{e.progressPercent ?? 0}%</TableCell>
                  <TableCell>{formatDate(e.enrolledAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AppShell>
  );
}
