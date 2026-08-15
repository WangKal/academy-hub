import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate } from "@/components/layout/States";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as api from "@/services/api";

export const Route = createFileRoute("/_authenticated/instructor/students")({
  beforeLoad: ({ context }) => {
    const user = (context as any).user;
    if (!user || (user.role !== "instructor" && user.role !== "admin")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Students — EA Academy" },
      { name: "description", content: "Track student progress across the courses you teach." },
      { property: "og:title", content: "Students — EA Academy" },
      { property: "og:description", content: "Student progress across your courses." },
    ],
  }),
  component: InstructorStudents,
});

function InstructorStudents() {
  const { data: courses } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: () => api.getInstructorCourses(),
  });
  const [courseId, setCourseId] = useState<string>("");
  const selected = courseId || courses?.[0]?.id || "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["course-students", selected],
    queryFn: () => api.getCourseStudents(selected),
    enabled: !!selected,
  });

  return (
    <AppShell title="Students" description="Progress by course">
      <div className="mb-5 max-w-sm">
        <Select value={selected} onValueChange={setCourseId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a course" />
          </SelectTrigger>
          <SelectContent>
            {(courses ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingBlock />
      ) : error ? (
        <EmptyState title="Could not load students" description={api.errorMessage(error)} />
      ) : !data?.length ? (
        <EmptyState title="No students enrolled yet" />
      ) : (
        <div className="rounded-xl border border-edge bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-56">Progress</TableHead>
                <TableHead>Enrolled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <p className="font-medium">{e.userName}</p>
                    <p className="text-xs text-ink-3">{e.userEmail}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{e.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Progress value={e.progressPercent ?? 0} />
                    <span className="text-xs text-ink-3">{e.progressPercent ?? 0}%</span>
                  </TableCell>
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
