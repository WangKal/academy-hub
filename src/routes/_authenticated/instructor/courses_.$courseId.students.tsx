import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useParams } from "@/lib/router";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/lib/router";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate } from "@/components/layout/States";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { can } from "@/services/permissions";
import * as api from "@/services/api";

export const Route = createFileRoute("/_authenticated/instructor/courses_/$courseId/students")({
  beforeLoad: ({ context }) => {
    const user = (context as any).user;
    if (!user || !(can(user, "students", "view", { instructorId: user.id }) || (user.role === "admin" && can(user, "students", "view")))) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: CourseStudents,
});

function CourseStudents() {
  const { courseId } = useParams({ from: "/_authenticated/instructor/courses_/$courseId/students" });
  const { data: course } = useQuery({ queryKey: ["course", courseId], queryFn: () => api.getCourse(courseId) });
  const { data, isLoading, error } = useQuery({
    queryKey: ["course-students", courseId],
    queryFn: () => api.getCourseStudents(courseId),
  });

  if (isLoading) return <AppShell title="Course students"><LoadingBlock /></AppShell>;
  if (error || !data) return <AppShell title="Course students"><EmptyState title="Could not load students" description={api.errorMessage(error)} /></AppShell>;

  return <AppShell title={course?.title ?? "Course students"} description="Learners enrolled in this course" breadcrumb={<Link to="/instructor/students" className="text-xs text-ink-3"><ArrowLeft className="mr-1 inline size-3" />All students</Link>}>
    {!data.length ? <EmptyState title="No students enrolled yet" /> : (
      <div className="rounded-xl border border-edge bg-card">
        <Table><TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Status</TableHead><TableHead className="w-56">Progress</TableHead><TableHead>Enrolled</TableHead></TableRow></TableHeader>
          <TableBody>{data.map((e) => <TableRow key={e.id}><TableCell><Link to="/instructor/students/$userId" params={{ userId: e.userId }} search={{ courseId }} className="font-medium hover:text-brand-600">{e.userName}</Link><p className="text-xs text-ink-3">{e.userEmail}</p></TableCell><TableCell><Badge variant="secondary">{e.status}</Badge></TableCell><TableCell><Progress value={e.progressPercent ?? 0} /><span className="text-xs text-ink-3">{e.progressPercent ?? 0}%</span></TableCell><TableCell>{formatDate(e.enrolledAt)}</TableCell></TableRow>)}</TableBody>
        </Table>
      </div>
    )}
  </AppShell>;
}
