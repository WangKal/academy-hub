import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, LoadingBlock, formatDate, formatPrice } from "@/components/layout/States";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as api from "@/services/api";

export const Route = createFileRoute("/_authenticated/instructor/courses")({
  head: () => ({
    meta: [
      { title: "Course builder — EA Academy" },
      { name: "description", content: "Create, publish and manage the courses you teach." },
      { property: "og:title", content: "Course builder — EA Academy" },
      { property: "og:description", content: "Manage the courses you teach at EA Academy." },
    ],
  }),
  component: InstructorCourses,
});

function InstructorCourses() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: () => api.getInstructorCourses(),
  });

  const toggle = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      publish ? api.publishCourse(id) : api.unpublishCourse(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor-courses"] });
      toast.success("Course updated.");
    },
    onError: (e) => toast.error(api.errorMessage(e)),
  });

  return (
    <AppShell title="Course builder" description="Courses you own">
      {isLoading ? (
        <LoadingBlock />
      ) : error ? (
        <EmptyState title="Could not load courses" description={api.errorMessage(error)} />
      ) : !data?.length ? (
        <EmptyState title="No courses yet" description="Courses assigned to you appear here." />
      ) : (
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lessons</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "published" ? "default" : "secondary"}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{c.lessonCount ?? 0}</TableCell>
                  <TableCell>{c.enrollmentCount ?? 0}</TableCell>
                  <TableCell>{formatPrice(c.priceCents, c.currency)}</TableCell>
                  <TableCell>{formatDate(c.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        toggle.mutate({ id: c.id, publish: c.status !== "published" })
                      }
                    >
                      {c.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AppShell>
  );
}
