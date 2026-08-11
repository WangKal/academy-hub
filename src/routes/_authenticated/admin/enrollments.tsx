import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
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
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-enrollments", search],
    queryFn: () => api.getEnrollments({ search, pageSize: 50 }),
  });

  return (
    <AppShell title="Enrollments" description="Every learner on every course">
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
